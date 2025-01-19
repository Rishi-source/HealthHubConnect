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
	router.Use(middleware.CorsMiddleware)

	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	doctorHandler := handlers.NewDoctorHandler(userService)

	router.HandleFunc("/doctor/signup", doctorHandler.Signup).Methods("POST")
	router.HandleFunc("/doctor/login", doctorHandler.Login).Methods("POST")
	router.HandleFunc("/doctor/resend-otp", doctorHandler.ResendOTP).Methods("POST")

	doctorRepo := repositories.NewDoctorRepository(db)
	doctorService := services.NewDoctorService(doctorRepo)
	doctorProfileHandler := handlers.NewDoctorProfileHandler(doctorService)

	protected := router.PathPrefix("/doctor").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/profile", doctorProfileHandler.SaveProfile).Methods("POST")
	protected.HandleFunc("/profile", doctorProfileHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/profile", doctorProfileHandler.UpdateProfile).Methods("PUT")
	protected.HandleFunc("/profile", doctorProfileHandler.DeleteProfile).Methods("DELETE")

	protected.HandleFunc("/schedule", doctorProfileHandler.SaveSchedule).Methods("POST")
	protected.HandleFunc("/schedule", doctorProfileHandler.GetSchedule).Methods("GET")
}
