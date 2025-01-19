package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/pkg/middleware"
	"log"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterAppointmentRoutes(router *mux.Router, db *gorm.DB) {
	appointmentRepo := repositories.NewAppointmentRepository(db)
	userRepo := repositories.NewUserRepository(db)
	doctorRepo := repositories.NewDoctorRepository(db)

	appointmentService, err := services.NewAppointmentService(appointmentRepo, *userRepo, doctorRepo)
	if err != nil {
		log.Fatalf("Failed to initialize appointment service: %v", err)
	}

	appointmentHandler := handlers.NewAppointmentHandler(appointmentService, userRepo, doctorRepo)

	p := router.PathPrefix("/appointments").Subrouter()
	p.Use(middleware.AuthMiddleware)

	// General appointment routes
	p.HandleFunc("", appointmentHandler.CreateAppointment).Methods("POST")
	p.HandleFunc("/{id}", appointmentHandler.GetAppointment).Methods("GET")
	p.HandleFunc("/{id}/status", appointmentHandler.UpdateAppointmentStatus).Methods("PUT")

	// Patient-specific routes
	p.HandleFunc("/my", appointmentHandler.GetMyAppointments).Methods("GET")
	p.HandleFunc("/my/upcoming", appointmentHandler.GetMyUpcomingAppointments).Methods("GET")
	p.HandleFunc("/my/past", appointmentHandler.GetMyPastAppointments).Methods("GET")
	p.HandleFunc("/{id}/cancel", appointmentHandler.CancelAppointment).Methods("PUT")

	// Doctor availability and slots
	p.HandleFunc("/doctor/{doctorId}/slots", appointmentHandler.GetAvailableSlots).Methods("GET")
	p.HandleFunc("/doctor/availability", appointmentHandler.SetDoctorAvailability).Methods("POST")
	p.HandleFunc("/doctor/{doctorId}/availability", appointmentHandler.GetDoctorAvailability).Methods("GET")

	// Doctor appointment management
	p.HandleFunc("/doctor/upcoming", appointmentHandler.GetUpcomingAppointments).Methods("GET")
	p.HandleFunc("/doctor/past", appointmentHandler.GetPastAppointments).Methods("GET")
	p.HandleFunc("/doctor/today", appointmentHandler.GetTodayAppointments).Methods("GET")
	p.HandleFunc("/doctor/week", appointmentHandler.GetWeekAppointments).Methods("GET")

	// Appointment actions
	p.HandleFunc("/{id}/confirm", appointmentHandler.ConfirmAppointment).Methods("PUT")
	p.HandleFunc("/{id}/complete", appointmentHandler.CompleteAppointment).Methods("PUT")
	p.HandleFunc("/{id}/reschedule", appointmentHandler.RescheduleAppointment).Methods("PUT")
	p.HandleFunc("/{id}/no-show", appointmentHandler.MarkNoShow).Methods("PUT")
}
