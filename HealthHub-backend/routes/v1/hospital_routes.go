package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/pkg/middleware"

	"github.com/gorilla/mux"
	"googlemaps.github.io/maps"
	"gorm.io/gorm"
)

func RegisterHospitalRoutes(router *mux.Router, db *gorm.DB, mapsClient *maps.Client) {
	// Initialize dependencies
	repo := repositories.NewHospitalRepository(db)
	service := services.NewHospitalService(repo, mapsClient)
	handler := handlers.NewHospitalHandler(service)

	protected := router.PathPrefix("/hospitals").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.HandleFunc("/nearby", handler.FindNearbyHospitals).Methods("POST")
	protected.HandleFunc("/search", handler.SearchHospitals).Methods("POST")
	protected.HandleFunc("/{id}", handler.GetHospitalByID).Methods("GET")
	protected.HandleFunc("", handler.CreateHospital).Methods("POST")
	protected.HandleFunc("/{id}", handler.UpdateHospital).Methods("PUT")
}
