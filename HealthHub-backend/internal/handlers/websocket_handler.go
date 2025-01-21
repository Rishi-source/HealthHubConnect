package handlers

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/utils"
	wsManager "HealthHubConnect/internal/websocket"
	"HealthHubConnect/pkg/logger"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	EnableCompression: true,
}

type WebSocketHandler struct {
	manager        *wsManager.Manager
	chatRepository *repositories.ChatRepository
	userRepository *repositories.UserRepository
}

func NewWebSocketHandler(manager *wsManager.Manager, chatRepo *repositories.ChatRepository, userRepo *repositories.UserRepository) *WebSocketHandler {
	return &WebSocketHandler{
		manager:        manager,
		chatRepository: chatRepo,
		userRepository: userRepo,
	}
}

func (h *WebSocketHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	loggerManager := logger.GetLogger()

	senderID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Invalid or missing authentication")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	recipientID, err := strconv.ParseUint(vars["recipientId"], 10, 32)
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Invalid recipient ID")
		http.Error(w, "Invalid recipient ID", http.StatusBadRequest)
		return
	}
	if err := h.userRepository.VerifyUsers(r.Context(), senderID, uint(recipientID)); err != nil {
		loggerManager.ServerLogger.Error().Err(err).
			Uint("senderID", senderID).
			Uint64("recipientID", recipientID).
			Msg("User verification failed")
		http.Error(w, "Invalid user IDs", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("WebSocket upgrade failed")
		http.Error(w, "Could not upgrade connection", http.StatusInternalServerError)
		return
	}

	conn.SetReadLimit(512 * 1024) // used max message size
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	client := &wsManager.Client{
		Conn:        conn,
		Send:        make(chan []byte, 256),
		UserID:      senderID,
		RecipientID: uint(recipientID),
	}

	h.manager.Register(client)

	// Log successful connection
	loggerManager.ServerLogger.Info().
		Uint("senderID", senderID).
		Uint("recipientID", uint(recipientID)).
		Msg("WebSocket connection established")

	go h.readPump(client, r.Context())
	go h.writePump(client)
}

type WSResponse struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type MessagePayload struct {
	ID        uint      `json:"id"`
	Content   string    `json:"content"`
	SenderID  uint      `json:"sender_id"`
	CreatedAt time.Time `json:"created_at"`
	Read      bool      `json:"read"`
}

type TypingPayload struct {
	UserID uint `json:"user_id"`
	Status bool `json:"status"`
}

type MessageResponse struct {
	Type      string    `json:"type"`
	MessageID uint      `json:"message_id"`
	Content   string    `json:"content"`
	SenderID  uint      `json:"sender_id"`
	Time      time.Time `json:"time"`
	Status    string    `json:"status"`
}

func sendWebSocketResponse(loggerManager *logger.LoggerManager, conn *websocket.Conn, response interface{}) error {
	conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
	if err := conn.WriteJSON(response); err != nil {
		loggerManager.ServerLogger.Error().
			Err(err).
			Interface("response", response).
			Msg("Failed to send WebSocket response")
		return err
	}
	return nil
}

func (h *WebSocketHandler) readPump(client *wsManager.Client, ctx context.Context) {
	loggerManager := logger.GetLogger()

	defer func() {
		h.manager.Unregister(client)
		client.Conn.Close()
		loggerManager.ServerLogger.Info().
			Uint("userID", client.UserID).
			Msg("WebSocket connection closed")
	}()

	client.Conn.SetReadLimit(512 * 1024)

	// ping ticker for testing only
	ticker := time.NewTicker(54 * time.Second)
	defer ticker.Stop()

	for {
		messageType, message, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				loggerManager.ServerLogger.Error().
					Err(err).
					Uint("userID", client.UserID).
					Msg("WebSocket read error")
			}
			break
		}

		loggerManager.ServerLogger.Debug().
			Int("messageType", messageType).
			Str("message", string(message)).
			Msg("Received WebSocket message")

		var wsMessage struct {
			Type    string `json:"type"`
			Content string `json:"content"`
			Typing  bool   `json:"typing,omitempty"`
		}

		if err := json.Unmarshal(message, &wsMessage); err != nil {
			loggerManager.ServerLogger.Error().
				Err(err).
				Str("message", string(message)).
				Msg("Failed to unmarshal message")

			errorResponse := MessageResponse{
				Type:    "error",
				Content: "Invalid message format",
				Status:  "error",
				Time:    time.Now(),
			}
			client.Conn.WriteJSON(errorResponse)
			continue
		}

		switch wsMessage.Type {
		case "message":
			timeoutCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			chatMessage := &models.ChatMessage{
				Base: models.Base{
					CreatedAt: time.Now(),
				},
				SenderID:   client.UserID,
				ReceiverID: client.RecipientID,
				Content:    wsMessage.Content,
			}

			loggerManager.ServerLogger.Info().
				Uint("senderID", chatMessage.SenderID).
				Uint("receiverID", chatMessage.ReceiverID).
				Str("content", chatMessage.Content).
				Msg("Attempting to save chat message")

			if err := h.chatRepository.SaveMessage(timeoutCtx, chatMessage); err != nil {
				loggerManager.ServerLogger.Error().
					Err(err).
					Interface("message", chatMessage).
					Msg("Failed to save chat message")

				errorResponse := MessageResponse{
					Type:     "error",
					Content:  "Failed to save message",
					Status:   "error",
					Time:     time.Now(),
					SenderID: client.UserID,
				}
				if err := client.Conn.WriteJSON(errorResponse); err != nil {
					loggerManager.ServerLogger.Error().Err(err).Msg("Failed to send error response")
				}
				continue
			}

			loggerManager.ServerLogger.Info().
				Uint("messageID", chatMessage.ID).
				Msg("Successfully saved chat message")

			response := MessageResponse{
				Type:      "message",
				MessageID: chatMessage.ID,
				Content:   chatMessage.Content,
				SenderID:  chatMessage.SenderID,
				Time:      chatMessage.CreatedAt,
				Status:    "sent",
			}

			for retries := 0; retries < 3; retries++ {
				if err := sendWebSocketResponse(loggerManager, client.Conn, response); err != nil {
					if retries == 2 {
						loggerManager.ServerLogger.Error().
							Err(err).
							Msg("Failed to send response to sender after retries")
						break
					}
					time.Sleep(100 * time.Millisecond)
					continue
				}
				break
			}

			recipients := h.manager.GetClientsByUserID(client.RecipientID)
			for _, recipient := range recipients {
				if recipient.Conn != nil {
					for retries := 0; retries < 3; retries++ {
						if err := sendWebSocketResponse(loggerManager, recipient.Conn, response); err != nil {
							if retries == 2 {
								loggerManager.ServerLogger.Error().
									Err(err).
									Msg("Failed to send response to recipient after retries")
								// Close failed connection
								recipient.Conn.Close()
								break
							}
							time.Sleep(100 * time.Millisecond)
							continue
						}
						break
					}
				}
			}

		case "ping":
			if err := sendWebSocketResponse(loggerManager, client.Conn, MessageResponse{
				Type:      "pong",
				MessageID: 1,
				Content:   "pong",
				SenderID:  client.UserID,
				Time:      time.Now(),
				Status:    "success",
			}); err != nil {
				loggerManager.ServerLogger.Error().Err(err).Msg("Failed to send pong")
			}

		case "typing":
			response := WSResponse{
				Type: "typing",
				Payload: TypingPayload{
					UserID: client.UserID,
					Status: wsMessage.Typing,
				},
			}
			responseBytes, _ := json.Marshal(response)

			recipients := h.manager.GetClientsByUserID(client.RecipientID)
			for _, recipient := range recipients {
				select {
				case recipient.Send <- responseBytes:
				default:
					close(recipient.Send)
					recipient.Conn.Close()
				}
			}
		}
	}
}

func (h *WebSocketHandler) writePump(client *wsManager.Client) {
	loggerManager := logger.GetLogger()
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		client.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			client.Conn.SetWriteDeadline(time.Now().Add(2 * time.Second)) // Reduced from 10 to 2 seconds
			w, err := client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				loggerManager.ServerLogger.Error().Err(err).Msg("Failed to get next writer")
				return
			}

			w.Write(message)

			if err := w.Close(); err != nil {
				loggerManager.ServerLogger.Error().Err(err).Msg("Failed to close writer")
				return
			}

		case <-ticker.C:
			client.Conn.SetWriteDeadline(time.Now().Add(2 * time.Second)) // Reduced from 10 to 2 seconds
			if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				loggerManager.ServerLogger.Error().Err(err).Msg("Failed to send ping")
				return
			}
		}
	}
}

func (h *WebSocketHandler) GetChatHistory(w http.ResponseWriter, r *http.Request) {
	loggerManager := logger.GetLogger()

	currentUserID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Failed to get user ID from context")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	senderID, err := strconv.ParseUint(vars["senderId"], 10, 32)
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Invalid sender ID")
		http.Error(w, "Invalid sender ID", http.StatusBadRequest)
		return
	}

	if err := h.userRepository.VerifyUsers(r.Context(), currentUserID, uint(senderID)); err != nil {
		loggerManager.ServerLogger.Error().Err(err).
			Uint("currentUserID", currentUserID).
			Uint64("senderID", senderID).
			Msg("User verification failed")
		http.Error(w, "Invalid user IDs", http.StatusBadRequest)
		return
	}

	limit := 50
	offset := 0

	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err != nil {
			loggerManager.ServerLogger.Error().Err(err).Str("offset", offsetStr).Msg("Invalid offset parameter")
			http.Error(w, "Invalid offset parameter", http.StatusBadRequest)
			return
		}
		offset = parsedOffset
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err != nil {
			loggerManager.ServerLogger.Error().Err(err).Str("limit", limitStr).Msg("Invalid limit parameter")
			http.Error(w, "Invalid limit parameter", http.StatusBadRequest)
			return
		}
		if parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	messages, err := h.chatRepository.GetChatHistory(r.Context(), currentUserID, uint(senderID), limit, offset)
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).
			Uint("currentUserID", currentUserID).
			Uint64("senderID", senderID).Int("limit", limit).
			Int("offset", offset).
			Msg("Failed to fetch chat history")
		http.Error(w, "Failed to fetch chat history", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(messages); err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Failed to encode chat messages")
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func (h *WebSocketHandler) MarkMessagesAsRead(w http.ResponseWriter, r *http.Request) {
	loggerManager := logger.GetLogger()
	var req struct {
		SenderID uint `json:"sender_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Invalid request body")
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	currentUserID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if req.SenderID == 0 {
		http.Error(w, "Invalid sender ID", http.StatusBadRequest)
		return
	}

	loggerManager.ServerLogger.Info().
		Uint("currentUserID", currentUserID).
		Uint("senderID", req.SenderID).
		Msg("Attempting to mark messages as read")

	err = h.chatRepository.MarkMessagesAsRead(r.Context(), currentUserID, req.SenderID)
	if err != nil {
		loggerManager.ServerLogger.Error().
			Err(err).
			Uint("currentUserID", currentUserID).
			Uint("senderID", req.SenderID).
			Msg("Failed to mark messages as read")
		http.Error(w, "Failed to mark messages as read", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Messages marked as read",
	})
}

func (h *WebSocketHandler) GetRecentChats(w http.ResponseWriter, r *http.Request) {
	loggerManager := logger.GetLogger()
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	messages, err := h.chatRepository.GetRecentChats(r.Context(), userID, 20)
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Failed to fetch recent chats")
		http.Error(w, "Failed to fetch recent chats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func (h *WebSocketHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	loggerManager := logger.GetLogger()
	currentUserID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	senderID, err := strconv.ParseUint(vars["senderId"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid sender ID", http.StatusBadRequest)
		return
	}

	count, err := h.chatRepository.GetUnreadCount(r.Context(), currentUserID, uint(senderID))
	if err != nil {
		loggerManager.ServerLogger.Error().Err(err).Msg("Failed to get unread count")
		http.Error(w, "Failed to get unread count", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"unread_count": count,
		"sender_id":    senderID,
		"receiver_id":  currentUserID,
	})
}
