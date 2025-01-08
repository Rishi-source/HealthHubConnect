package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/pkg/middleware"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"googlemaps.github.io/maps"
	"gorm.io/gorm"
)

func RegisterRoutes(router *mux.Router, db *gorm.DB, mapsClient *maps.Client) {
	// Register different route groups
	RegisterAuthRoutes(router, db)
	RegisterHealthRoutes(router, db)
	RegisterHospitalRoutes(router, db, mapsClient)
	RegisterDoctorRoutes(router, db)
	RegisterAppointmentRoutes(router, db)

	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	p := router.PathPrefix("/protected").Subrouter()
	p.Use(middleware.AuthMiddleware)

	p.HandleFunc("/", ProtectedHandler)

}

func ProtectedHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"message": "Authorised",
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
