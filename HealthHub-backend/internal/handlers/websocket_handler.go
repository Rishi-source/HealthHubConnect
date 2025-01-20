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

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
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

	client := &wsManager.Client{
		Conn:        conn,
		Send:        make(chan []byte),
		UserID:      senderID,
		RecipientID: uint(recipientID),
	}

	h.manager.Register(client)

	go h.readPump(client, r.Context())
	go h.writePump(client)
}

func (h *WebSocketHandler) readPump(client *wsManager.Client, ctx context.Context) {
	loggerManager := logger.GetLogger()

	defer func() {
		h.manager.Unregister(client)
		client.Conn.Close()
	}()

	// Create a background context for chat operations
	chatCtx := context.Background()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				loggerManager.ServerLogger.Error().
					Err(err).
					Uint("userID", client.UserID).
					Msg("WebSocket read error")
			}
			break
		}

		var wsMessage struct {
			Content string `json:"content"`
		}

		if err := json.Unmarshal(message, &wsMessage); err != nil {
			loggerManager.ServerLogger.Error().
				Err(err).
				Str("message", string(message)).
				Msg("Failed to unmarshal chat message")
			continue
		}

		chatMessage := &models.ChatMessage{
			SenderID:   client.UserID,
			ReceiverID: client.RecipientID,
			Content:    wsMessage.Content,
			// CreatedAt:  time.Now(),
		}

		if err := h.chatRepository.SaveMessage(chatCtx, chatMessage); err != nil {
			loggerManager.ServerLogger.Error().
				Err(err).
				Interface("message", chatMessage).
				Msg("Failed to save chat message")

			// Send error message back to client
			errorMsg := map[string]string{"error": "Failed to save message"}
			errorBytes, _ := json.Marshal(errorMsg)
			client.Conn.WriteMessage(websocket.TextMessage, errorBytes)
			continue
		}

		// Send success response
		responseMsg, err := json.Marshal(chatMessage)
		if err != nil {
			loggerManager.ServerLogger.Error().
				Err(err).
				Interface("message", chatMessage).
				Msg("Failed to marshal response message")
			continue
		}

		// Send to sender for confirmation
		client.Conn.WriteMessage(websocket.TextMessage, responseMsg)

		// Send to recipients
		recipients := h.manager.GetClientsByUserID(client.RecipientID)
		for _, recipient := range recipients {
			select {
			case recipient.Send <- responseMsg:
			default:
				close(recipient.Send)
				recipient.Conn.Close()
			}
		}
	}
}

func (h *WebSocketHandler) writePump(client *wsManager.Client) {
	defer func() {
		client.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-client.Send:
			if !ok {
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := client.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
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
			Uint64("senderID", senderID).
			Int("limit", limit).
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
		loggerManager.ServerLogger.Error().Err(err).Msg("Invalid request body for mark messages as read")
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	currentUserID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err = h.chatRepository.MarkMessagesAsRead(r.Context(), currentUserID, req.SenderID)
	if err != nil {
		http.Error(w, "Failed to mark messages as read", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
