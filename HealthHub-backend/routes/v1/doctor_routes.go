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
	appointmentRepo := repositories.NewAppointmentRepository(db)
	doctorService := services.NewDoctorService(doctorRepo, appointmentRepo)
	doctorProfileHandler := handlers.NewDoctorProfileHandler(doctorService)

	router.HandleFunc("/doctors", doctorProfileHandler.ListDoctors).Methods("GET")
	router.HandleFunc("/doctors/{id}", doctorProfileHandler.GetDoctorPublicProfile).Methods("GET")

	protected := router.PathPrefix("/doctor").Subrouter()
	protected.Use(middleware.AuthMiddleware)

	protected.HandleFunc("/profile", doctorProfileHandler.SaveProfile).Methods("POST")
	protected.HandleFunc("/profile", doctorProfileHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/profile", doctorProfileHandler.UpdateProfile).Methods("PUT")
	protected.HandleFunc("/profile", doctorProfileHandler.DeleteProfile).Methods("DELETE")

	protected.HandleFunc("/schedule", doctorProfileHandler.SaveSchedule).Methods("POST")
	protected.HandleFunc("/schedule", doctorProfileHandler.GetSchedule).Methods("GET")
	protected.HandleFunc("/schedule/extend", doctorProfileHandler.ExtendAvailability).Methods("POST")
	protected.HandleFunc("/schedule/block", doctorProfileHandler.BlockSlot).Methods("POST")

	protected.HandleFunc("/patients", doctorProfileHandler.ListPatients).Methods("GET")

	protected.HandleFunc("/billing-settings", doctorProfileHandler.SaveBillingSettings).Methods("POST")
	protected.HandleFunc("/billing-settings", doctorProfileHandler.GetBillingSettings).Methods("GET")
	protected.HandleFunc("/billing-settings", doctorProfileHandler.UpdateBillingSettings).Methods("PUT")

	protected.HandleFunc("/appointments/{id}/bill", doctorProfileHandler.CreateBill).Methods("POST")
	protected.HandleFunc("/appointments/{id}/bill", doctorProfileHandler.GetBill).Methods("GET")
	protected.HandleFunc("/appointments/{id}/bill", doctorProfileHandler.UpdateBill).Methods("PUT")

	protected.HandleFunc("/appointments/{id}/prescription", doctorProfileHandler.CreatePrescription).Methods("POST")
	protected.HandleFunc("/appointments/{id}/prescription", doctorProfileHandler.GetPrescription).Methods("GET")
	protected.HandleFunc("/appointments/{id}/prescription", doctorProfileHandler.UpdatePrescription).Methods("PUT")
}
