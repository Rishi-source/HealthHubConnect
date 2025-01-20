package v1

import (
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/pkg/middleware"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func RegisterAdminRoutes(router *mux.Router, db *gorm.DB) {
	userRepo := repositories.NewUserRepository(db)
	doctorRepo := repositories.NewDoctorRepository(db)
	adminRepo := repositories.NewAdminRepository(db)
	adminService := services.NewAdminService(userRepo, doctorRepo, adminRepo)
	adminHandler := handlers.NewAdminHandler(adminService)

	adminRouter := router.PathPrefix("/admin").Subrouter()
	adminRouter.Use(middleware.AuthMiddleware)

	// Admin routes
	adminRouter.HandleFunc("/login-history", adminHandler.GetAllUserLoginHistory).Methods("GET")

	// Authentication Routes
	adminRouter.HandleFunc("/login", adminHandler.Login).Methods("POST")
	adminRouter.HandleFunc("/refresh-token", adminHandler.RefreshToken).Methods("POST")
	adminRouter.HandleFunc("/change-password", adminHandler.ChangePassword).Methods("POST")

	// User Management Routes
	adminRouter.HandleFunc("/users", adminHandler.ListUsers).Methods("GET")
	adminRouter.HandleFunc("/users/{id}", adminHandler.GetUser).Methods("GET")
	adminRouter.HandleFunc("/users/{id}/suspend", adminHandler.SuspendUser).Methods("POST")
	adminRouter.HandleFunc("/users/{id}/activate", adminHandler.ActivateUser).Methods("POST")
	adminRouter.HandleFunc("/users/{id}/delete", adminHandler.DeleteUser).Methods("DELETE")
	adminRouter.HandleFunc("/users/create", adminHandler.CreateUser).Methods("POST")

	// Doctor Management Routes
	adminRouter.HandleFunc("/doctors", adminHandler.ListDoctors).Methods("GET")
	adminRouter.HandleFunc("/doctors/verify/{id}", adminHandler.VerifyDoctor).Methods("POST")
	adminRouter.HandleFunc("/doctors/reject/{id}", adminHandler.RejectDoctor).Methods("POST")

	// Analytics Routes
	adminRouter.HandleFunc("/analytics/dashboard", adminHandler.GetDashboardStats).Methods("GET")
	adminRouter.HandleFunc("/analytics/users", adminHandler.GetUserStats).Methods("GET")
	adminRouter.HandleFunc("/analytics/appointments", adminHandler.GetAppointmentStats).Methods("GET")
	// adminRouter.HandleFunc("/analytics/revenue", adminHandler.GetRevenueStats).Methods("GET")

	// System Management Routes
	adminRouter.HandleFunc("/settings", adminHandler.GetSystemSettings).Methods("GET")
	adminRouter.HandleFunc("/settings", adminHandler.UpdateSystemSettings).Methods("PUT")
	adminRouter.HandleFunc("/backup", adminHandler.CreateBackup).Methods("POST")
	adminRouter.HandleFunc("/restore", adminHandler.RestoreBackup).Methods("POST")
	adminRouter.HandleFunc("/maintenance", adminHandler.ToggleMaintenanceMode).Methods("POST")

	// Logging and Monitoring Routes
	adminRouter.HandleFunc("/audit-logs", adminHandler.GetAuditLogs).Methods("GET")
	adminRouter.HandleFunc("/system-logs", adminHandler.GetSystemLogs).Methods("GET")
	adminRouter.HandleFunc("/error-logs", adminHandler.GetErrorLogs).Methods("GET")
	adminRouter.HandleFunc("/login-history", adminHandler.GetLoginHistory).Methods("GET")

	// Report Generation Routes
	adminRouter.HandleFunc("/reports/users", adminHandler.GenerateUserReport).Methods("GET")
	adminRouter.HandleFunc("/reports/appointments", adminHandler.GenerateAppointmentReport).Methods("GET")
	// adminRouter.HandleFunc("/reports/revenue", adminHandler.GenerateRevenueReport).Methods("GET")

	// Support and Help Routes
	adminRouter.HandleFunc("/support-tickets", adminHandler.ListSupportTickets).Methods("GET")
	adminRouter.HandleFunc("/support-tickets/{id}", adminHandler.GetSupportTicket).Methods("GET")
	adminRouter.HandleFunc("/support-tickets/{id}/respond", adminHandler.RespondToTicket).Methods("POST")

	// Notification Management Routes
	// adminRouter.HandleFunc("/notifications", adminHandler.SendNotification).Methods("POST")
	// adminRouter.HandleFunc("/notifications/templates", adminHandler.ListNotificationTemplates).Methods("GET")
	// adminRouter.HandleFunc("/notifications/templates", adminHandler.CreateNotificationTemplate).Methods("POST")

	// Doctor routes
	doctorRouter := router.PathPrefix("/doctor").Subrouter()
	doctorRouter.Use(middleware.AuthMiddleware)
	doctorRouter.HandleFunc("/patient-login-history", adminHandler.GetPatientLoginHistory).Methods("GET")
}
