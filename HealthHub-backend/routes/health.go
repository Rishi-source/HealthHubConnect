package routes

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

func setupHealthRoutes(router *mux.Router) {
	router.HandleFunc("/health", healthCheck).Methods("GET")
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "OK",
		"timestamp": time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
