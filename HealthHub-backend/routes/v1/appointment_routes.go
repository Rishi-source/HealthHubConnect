package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/pkg/middleware"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterAppointmentRoutes(router *mux.Router, db *gorm.DB) {
	appointmentRepo := repositories.NewAppointmentRepository(db)
	userRepo := repositories.NewUserRepository(db)
	appointmentService := services.NewAppointmentService(appointmentRepo)
	appointmentHandler := handlers.NewAppointmentHandler(appointmentService, userRepo)

	p := router.PathPrefix("/appointments").Subrouter()
	p.Use(middleware.AuthMiddleware)

	p.HandleFunc("", appointmentHandler.CreateAppointment).Methods("POST")
	p.HandleFunc("/my", appointmentHandler.GetMyAppointments).Methods("GET")
	p.HandleFunc("/{id}", appointmentHandler.GetAppointment).Methods("GET")

	doctorRoutes := p.NewRoute().Subrouter()
	doctorRoutes.Use(middleware.CheckDoctorRole)

	doctorRoutes.HandleFunc("/{id}/status", appointmentHandler.UpdateAppointmentStatus).Methods("PUT")
	doctorRoutes.HandleFunc("/availability", appointmentHandler.SetDoctorAvailability).Methods("POST")

	p.HandleFunc("/doctors/{doctorId}/availability", appointmentHandler.GetDoctorAvailability).Methods("GET")
}
