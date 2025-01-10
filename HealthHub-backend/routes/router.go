package routes

import (
	"HealthHubConnect/internal/websocket"
	"HealthHubConnect/pkg/middleware"
	v1 "HealthHubConnect/routes/v1"

	"github.com/gorilla/mux"
	"googlemaps.github.io/maps"
	"gorm.io/gorm"
)

func SetupRoutes(router *mux.Router, db *gorm.DB, mapsClient *maps.Client, wsManager *websocket.Manager) {
	//middlewares
	router.Use(middleware.CorsMiddleware)
	router.Use(middleware.LoggingMiddleware)

	// sub router for v1 routes
	v1Router := router.PathPrefix("/v1").Subrouter()

	v1.RegisterRoutes(v1Router, db, mapsClient, wsManager)
}
