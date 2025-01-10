package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/pkg/middleware"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterDoctorRoutes(router *mux.Router, db *gorm.DB) {
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	doctorHandler := handlers.NewDoctorHandler(userService)

	router.HandleFunc("/doctor/signup", doctorHandler.Signup).Methods("POST")
	router.HandleFunc("/doctor/login", doctorHandler.Login).Methods("POST")

	protected := router.PathPrefix("/doctor").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.Use(middleware.CheckDoctorRole)

}
