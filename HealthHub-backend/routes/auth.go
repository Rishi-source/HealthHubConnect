package routes

import (
	"HealthHub-connect/internals/handlers"
	"HealthHub-connect/middleware"
	"net/http"

	"github.com/gorilla/mux"
)

func SetupAuthRoutes(router *mux.Router, authHandler *handlers.AuthHandler) {
	// Public routes
	router.HandleFunc("/register", authHandler.Register).Methods(http.MethodPost)
	router.HandleFunc("/login", authHandler.Login).Methods(http.MethodPost)

	// Protected routes
	protected := router.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/logout", authHandler.Logout).Methods(http.MethodPost)
	protected.HandleFunc("/refresh", authHandler.RefreshToken).Methods(http.MethodPost)

	// Admin routes
	admin := router.PathPrefix("/admin").Subrouter()
	admin.Use(middleware.AuthMiddleware, middleware.RequireRole("admin"))

	// Add admin routes here
}
