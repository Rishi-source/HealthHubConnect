package routes

import (
	"HealthHubConnect/pkg/middleware"
	v1 "HealthHubConnect/routes/v1"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func SetupRoutes(router *mux.Router, db *gorm.DB) {
	// Apply middlewares
	router.Use(middleware.CorsMiddleware)
	router.Use(middleware.LoggingMiddleware)

	// sub router for v1 routes
	v1Router := router.PathPrefix("/v1").Subrouter()

	v1.RegisterRoutes(v1Router, db)
}
