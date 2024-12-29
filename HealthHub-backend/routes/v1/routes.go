package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"fmt"

	"github.com/gorilla/mux"

	"gorm.io/gorm"
)

func RegisterRoutes(router *mux.Router, db *gorm.DB) {
	// logging middleware
	UserRepo := repositories.NewUserRepository(db)
	UserService := services.NewUserService(UserRepo)
	UserHandler := handlers.NewUserHandler(UserService)

	fmt.Println(UserHandler)

	router.HandleFunc("/Signup", UserHandler.Signup).Methods("POST")
	router.HandleFunc("/health", handlers.HealthCheck).Methods("GET")
}
