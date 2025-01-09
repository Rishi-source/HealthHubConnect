package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/websocket"
	"HealthHubConnect/pkg/middleware"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterChatRoutes(router *mux.Router, db *gorm.DB, wsManager *websocket.Manager) {

	// Initialize repositories and handlers
	chatRepo := repositories.NewChatRepository(db)
	userRepo := repositories.NewUserRepository(db)
	wsHandler := handlers.NewWebSocketHandler(wsManager, chatRepo, userRepo)

	chatRouter := router.PathPrefix("/chat").Subrouter()

	// Add middlewares in correct order
	chatRouter.Use(middleware.LoggingMiddleware)
	chatRouter.Use(middleware.AuthMiddleware)

	// WebSocket endpoint with recipient ID
	chatRouter.HandleFunc("/ws/{recipientId}", wsHandler.HandleWebSocket).Methods("GET")
	chatRouter.HandleFunc("/history/{senderId}", wsHandler.GetChatHistory).Methods("GET")
	chatRouter.HandleFunc("/messages/read", wsHandler.MarkMessagesAsRead).Methods("POST")
}
