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

	// Auth routes - remove /api/v1 prefix since it's already added in router.go
	router.HandleFunc("/auth/signup", authHandler.Signup).Methods("POST")
	router.HandleFunc("/auth/verify-otp", authHandler.VerifyOTP).Methods("POST")
	router.HandleFunc("/auth/login", authHandler.Login).Methods("POST")
	router.HandleFunc("/auth/refresh", authHandler.RefreshToken).Methods("GET")
	router.HandleFunc("/auth/forgot-password", authHandler.ForgotPassword).Methods("POST")
	router.HandleFunc("/auth/reset-password", authHandler.ResetPassword).Methods("POST")
	router.HandleFunc("/auth/resend-otp", authHandler.ResendOTP).Methods("POST")

	// Google OAuth routes without /api/v1 prefix
	router.HandleFunc("/auth/google/login", authHandler.GoogleLogin).Methods("GET")
	router.HandleFunc("/auth/google/callback", authHandler.GoogleCallback).Methods("GET")

}
