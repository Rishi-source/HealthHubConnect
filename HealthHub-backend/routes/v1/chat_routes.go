package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/websocket"
	"HealthHubConnect/pkg/middleware"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterChatRoutes(router *mux.Router, db *gorm.DB, wsManager *websocket.Manager) {

	chatRepo := repositories.NewChatRepository(db)
	userRepo := repositories.NewUserRepository(db)
	wsHandler := handlers.NewWebSocketHandler(wsManager, chatRepo, userRepo)

	chatGPTService := services.NewChatGPTService()
	chatGPTHandler := handlers.NewChatGPTHandler(chatGPTService, userRepo)

	chatRouter := router.PathPrefix("/chat").Subrouter()

	chatRouter.Use(middleware.LoggingMiddleware)
	chatRouter.Use(middleware.AuthMiddleware)
	chatRouter.Use(middleware.CorsMiddleware)
	// chatRouter.Use(middleware.RateLimitMiddleware) TODO: will add later when get time

	chatRouter.HandleFunc("/ws/{recipientId}", wsHandler.HandleWebSocket).Methods("GET")
	chatRouter.HandleFunc("/history/{senderId}", wsHandler.GetChatHistory).Methods("GET")
	chatRouter.HandleFunc("/messages/read", wsHandler.MarkMessagesAsRead).Methods("POST")

	chatRouter.HandleFunc("/gpt/query", chatGPTHandler.HandleChatQuery).Methods("POST")
	chatRouter.HandleFunc("/gpt/health-summary", chatGPTHandler.HandleHealthSummary).Methods("GET")

	chatRouter.HandleFunc("/recent", wsHandler.GetRecentChats).Methods("GET")
	chatRouter.HandleFunc("/unread/{senderId}", wsHandler.GetUnreadCount).Methods("GET")
}
