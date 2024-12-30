package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"

	"github.com/gorilla/mux"

	"gorm.io/gorm"
)

func RegisterAuthRoutes(router *mux.Router, db *gorm.DB) {
	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)

	// Initialize handlers
	authHandler := handlers.NewUserHandler(userService)

	// Auth routes
	router.HandleFunc("/auth/signup", authHandler.Signup).Methods("POST")
	router.HandleFunc("/auth/login", authHandler.Login).Methods("POST")
	// router.HandleFunc("/auth/logout", authHandler.Logout).Methods("POST")
	router.HandleFunc("/auth/refresh", authHandler.RefreshToken).Methods("GET")
	router.HandleFunc("/auth/forgot-password", authHandler.ForgotPassword).Methods("POST")
	router.HandleFunc("/auth/reset-password", authHandler.ResetPassword).Methods("POST")

}
