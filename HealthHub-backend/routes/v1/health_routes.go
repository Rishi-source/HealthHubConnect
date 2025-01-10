package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/pkg/middleware"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterHealthRoutes(router *mux.Router, db *gorm.DB) {
	healthRepo := repositories.NewHealthRepository(db)
	healthService := services.NewHealthService(healthRepo)
	healthHandler := handlers.NewHealthHandler(healthService)

	p := router.PathPrefix("/health").Subrouter()
	p.Use(middleware.AuthMiddleware)

	p.HandleFunc("/profile", healthHandler.CreateHealthProfile).Methods("POST")
	p.HandleFunc("/profile", healthHandler.GetHealthProfile).Methods("GET")
	p.HandleFunc("/profile", healthHandler.UpdateHealthProfile).Methods("PUT")
	p.HandleFunc("/profile", healthHandler.DeleteHealthProfile).Methods("DELETE")

	p.HandleFunc("/vitals", healthHandler.CreateVitalSign).Methods("POST")
	p.HandleFunc("/vitals", healthHandler.GetVitalSigns).Methods("GET")

	p.HandleFunc("/medication", healthHandler.CreateMedication).Methods("POST")
	p.HandleFunc("/medication", healthHandler.GetMedications).Methods("GET")
}
