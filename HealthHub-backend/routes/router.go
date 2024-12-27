package routes

import (
	"HealthHub-connect/internals/handlers"
	"HealthHub-connect/internals/middleware"

	"github.com/gorilla/mux"
)

func SetupRouter(authHandler *handlers.AuthHandler) *mux.Router {
	router := mux.NewRouter()

	// Middleware
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.JSONContentTypeMiddleware)

	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()
	SetupAuthRoutes(api, authHandler)

	return router
}
