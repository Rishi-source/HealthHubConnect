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
	// Initialize dependencies
	appointmentRepo := repositories.NewAppointmentRepository(db)
	appointmentService := services.NewAppointmentService(appointmentRepo)
	appointmentHandler := handlers.NewAppointmentHandler(appointmentService)

	// subrouter for protected routes
	p := router.PathPrefix("/appointments").Subrouter()
	p.Use(middleware.AuthMiddleware)

	// Base appointment routes
	p.HandleFunc("", appointmentHandler.CreateAppointment).Methods("POST")
	p.HandleFunc("/my", appointmentHandler.GetMyAppointments).Methods("GET")
	p.HandleFunc("/{id}", appointmentHandler.GetAppointment).Methods("GET")

	// Doctor specific routes with role middleware
	doctorRoutes := p.NewRoute().Subrouter()
	doctorRoutes.Use(middleware.CheckDoctorRole)

	doctorRoutes.HandleFunc("/{id}/status", appointmentHandler.UpdateAppointmentStatus).Methods("PUT")
	doctorRoutes.HandleFunc("/availability", appointmentHandler.SetDoctorAvailability).Methods("POST")

	// Public doctor availability route (no doctor role required, but still needs auth)
	p.HandleFunc("/doctors/{doctorId}/availability", appointmentHandler.GetDoctorAvailability).Methods("GET")
}
