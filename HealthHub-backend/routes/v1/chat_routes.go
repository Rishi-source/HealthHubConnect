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

	// Initialize repositories and handlers
	chatRepo := repositories.NewChatRepository(db)
	userRepo := repositories.NewUserRepository(db)
	wsHandler := handlers.NewWebSocketHandler(wsManager, chatRepo, userRepo)

	// Initialize ChatGPT service and handler
	chatGPTService := services.NewChatGPTService()
	chatGPTHandler := handlers.NewChatGPTHandler(chatGPTService, userRepo)

	chatRouter := router.PathPrefix("/chat").Subrouter()

	// Add middlewares in correct order
	chatRouter.Use(middleware.LoggingMiddleware)
	chatRouter.Use(middleware.AuthMiddleware)

	// WebSocket endpoint with recipient ID
	chatRouter.HandleFunc("/ws/{recipientId}", wsHandler.HandleWebSocket).Methods("GET")
	chatRouter.HandleFunc("/history/{senderId}", wsHandler.GetChatHistory).Methods("GET")
	chatRouter.HandleFunc("/messages/read", wsHandler.MarkMessagesAsRead).Methods("POST")

	// Add ChatGPT endpoints
	chatRouter.HandleFunc("/gpt/query", chatGPTHandler.HandleChatQuery).Methods("POST")
	chatRouter.HandleFunc("/gpt/health-summary", chatGPTHandler.HandleHealthSummary).Methods("GET")
}
