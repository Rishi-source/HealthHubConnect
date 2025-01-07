package v1

import (
	"HealthHubConnect/internal/handlers"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterRoutes(router *mux.Router, db *gorm.DB) {
	// Register different route groups
	RegisterAuthRoutes(router, db)
	RegisterHealthRoutes(router, db)
	RegisterHealthRoutes(router, db)

	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

}
