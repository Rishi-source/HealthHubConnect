package v1

import (
	"HealthHubConnect/internal/handlers"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterRoutes(router *mux.Router, db *gorm.DB) {
	// Register different route groups
	RegisterAuthRoutes(router, db)
	ResgisterHealthRoutes(router, db)

	// Register other route groups here
	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")
}
