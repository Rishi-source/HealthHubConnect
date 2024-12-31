package v1

import (
	"HealthHubConnect/pkg/middleware"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func ResgisterHealthRoutes(router *mux.Router, db *gorm.DB) {
	// healthRepo := repositories.NewHealthRepository(db)
	// healthService := services.NewHealthService(healthRepo)
	// healthHandler := handlers.NewHealthHandler(healthService)

	p := router.PathPrefix("/protected").Subrouter()
	p.Use(middleware.AuthMiddleware)

	p.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "authorized")
	})
	// p.HandleFunc("/health-profile", healthHandler.GetHealthProfile).Methods("GET")
}
