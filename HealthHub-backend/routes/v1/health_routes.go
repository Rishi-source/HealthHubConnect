package v1

import (
	"HealthHubConnect/pkg/middleware"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func ResgisterHealthRoutes(router *mux.Router, db *gorm.DB) {
	p := router.PathPrefix("/protected").Subrouter()
	p.Use(middleware.AuthMiddleware)
	p.Use()
	p.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "you are authorized")
	}).Methods("GET")

}
