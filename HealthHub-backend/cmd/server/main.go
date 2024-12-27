package main

import (
	"HealthHub-connect/config"
	"HealthHub-connect/pkg/database"
	"HealthHub-connect/routes"
	"fmt"
	"log"
	"net/http"
)

func main() {

	cfg := config.LoadConfig()
	_, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	router := routes.SetupRouter()

	serverAddr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("Server starting on %s", serverAddr)
	if err := http.ListenAndServe(serverAddr, router); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}
