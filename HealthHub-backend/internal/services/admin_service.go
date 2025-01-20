package services

import (
	"HealthHubConnect/env"
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/utils"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type AdminService struct {
	userRepo   *repositories.UserRepository
	doctorRepo *repositories.DoctorRepository
	adminRepo  *repositories.AdminRepository
}

func NewAdminService(userRepo *repositories.UserRepository, doctorRepo *repositories.DoctorRepository, adminRepo *repositories.AdminRepository) *AdminService {
	return &AdminService{
		userRepo:   userRepo,
		doctorRepo: doctorRepo,
		adminRepo:  adminRepo,
	}
}

func (s *AdminService) GetUserLoginHistory(ctx context.Context, adminID, targetUserID uint, page, pageSize int) ([]models.LoginAttempt, error) {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil {
		return nil, e.NewInternalError()
	}
	if !isAdmin {
		return nil, e.NewForbiddenError("access denied: admin role required")
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize
	return s.userRepo.GetLoginHistory(ctx, targetUserID, pageSize, offset)
}

func (s *AdminService) GetPatientLoginHistory(ctx context.Context, doctorID, patientID uint, page, pageSize int) ([]models.LoginAttempt, error) {

	if err := s.doctorRepo.ValidateDoctorAccess(ctx, doctorID); err != nil {
		return nil, err
	}

	if !s.doctorRepo.IsPatientOfDoctor(ctx, doctorID, patientID) {
		return nil, e.NewForbiddenError("access denied: patient not found")
	}

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize
	return s.userRepo.GetLoginHistory(ctx, patientID, pageSize, offset)
}

func (s *AdminService) GetSystemStats(ctx context.Context) (*models.SystemStats, error) {
	stats := &models.SystemStats{
		LastUpdated: time.Now(),
	}

	var err error
	stats.TotalUsers, err = s.adminRepo.GetUserCount(ctx)
	if err != nil {
		return nil, err
	}

	stats.ActiveUsers, err = s.adminRepo.GetActiveUserCount(ctx, time.Now().Add(-24*time.Hour))
	if err != nil {
		return nil, err
	}

	stats.TotalDoctors, err = s.adminRepo.GetUserCountByRole(ctx, models.RoleDoctor)
	if err != nil {
		return nil, err
	}

	stats.TotalPatients, err = s.adminRepo.GetUserCountByRole(ctx, models.RolePatient)
	if err != nil {
		return nil, err
	}

	stats.NewUsersToday, err = s.adminRepo.GetNewUserCount(ctx, time.Now().Truncate(24*time.Hour))
	if err != nil {
		return nil, err
	}

	return stats, nil
}

func (s *AdminService) GetAuditLogs(ctx context.Context, page, pageSize int, filters map[string]interface{}) ([]models.AuditLog, int64, error) {
	startTime := time.Now().AddDate(0, 0, -30)
	endTime := time.Now()
	return s.adminRepo.GetAuditLogs(ctx, startTime, endTime, filters, page, pageSize)
}

func (s *AdminService) ManageUser(ctx context.Context, adminID, userID uint, action string) error {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return e.NewForbiddenError("unauthorized access")
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return e.NewNotFoundError("user not found")
	}

	switch action {
	case "suspend":
		user.IsActive = false
	case "activate":
		user.IsActive = true
	case "verify":
		user.EmailVerified = true
	default:
		return e.NewValidationError("invalid action")
	}

	if err := s.userRepo.UpdateUser(user, ctx); err != nil {
		return err
	}

	s.createAuditLog(ctx, adminID, action, "USER", userID, nil)
	return nil
}

func (s *AdminService) UpdateSystemSettings(ctx context.Context, adminID uint, settings *models.AdminSettings) error {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return e.NewForbiddenError("unauthorized access")
	}

	settings.AdminID = adminID
	return s.adminRepo.UpdateSystemSettings(ctx, settings)
}

func (s *AdminService) createAuditLog(ctx context.Context, adminID uint, action, entityType string, entityID uint, changes interface{}) {
	changesJSON, _ := json.Marshal(changes)
	ipAddress := ctx.Value("ipAddress").(string)

	auditLog := &models.AuditLog{
		AdminID:    adminID,
		Action:     action,
		EntityType: entityType,
		EntityID:   entityID,
		Changes:    string(changesJSON),
		IPAddress:  ipAddress,
		Timestamp:  time.Now(),
		Status:     models.AuditSuccess,
	}

	if err := s.adminRepo.CreateAuditLog(ctx, auditLog); err != nil {
		log.Printf("Failed to create audit log: %v", err)
	}
}

func (s *AdminService) GetSystemLogs(ctx context.Context, startTime, endTime time.Time, filters map[string]interface{}, page, pageSize int) ([]models.AuditLog, int64, error) {
	return s.adminRepo.GetAuditLogs(ctx, startTime, endTime, filters, page, pageSize)
}

func (s *AdminService) ListUsers(ctx context.Context, page, pageSize int) ([]models.User, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize
	return s.adminRepo.ListUsers(ctx, pageSize, offset)
}

func (s *AdminService) LoginAdmin(ctx context.Context, email, password string) (*models.User, utils.TokenPair, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid credentials")
	}

	if user.Role != models.RoleAdmin {
		return nil, utils.TokenPair{}, e.NewForbiddenError("unauthorized access")
	}

	if err := utils.ComparePassword(password, user.PasswordHash); err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid credentials")
	}

	tokenPair, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	user.PasswordHash = ""
	return user, tokenPair, nil
}

func (s *AdminService) RefreshAdminToken(ctx context.Context, refreshToken string) (utils.TokenPair, error) {
	userID, err := utils.ExtractUserIDFromToken(refreshToken, env.Jwt.RefreshTokenSecret)
	if err != nil {
		return utils.TokenPair{}, e.NewValidationError("invalid token")
	}

	isAdmin, err := s.userRepo.CheckUserRole(ctx, userID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return utils.TokenPair{}, e.NewForbiddenError("unauthorized access")
	}

	return utils.RefreshAccessTokens(refreshToken)
}

func (s *AdminService) ChangeAdminPassword(ctx context.Context, adminID uint, oldPassword, newPassword string) error {
	user, err := s.userRepo.FindByID(ctx, adminID)
	if err != nil {
		return e.NewNotFoundError("user not found")
	}

	if user.Role != models.RoleAdmin {
		return e.NewForbiddenError("unauthorized access")
	}

	if err := utils.ComparePassword(oldPassword, user.PasswordHash); err != nil {
		return e.NewValidationError("invalid current password")
	}

	if err := utils.ValidatePassword(newPassword); err != nil {
		return e.NewValidationError("invalid new password format")
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return e.NewInternalError()
	}

	user.PasswordHash = hashedPassword
	return s.userRepo.UpdateUser(user, ctx)
}

func (s *AdminService) GetUser(ctx context.Context, userID uint) (*models.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, e.NewNotFoundError("user not found")
	}
	user.PasswordHash = ""
	return user, nil
}

func (s *AdminService) DeleteUser(ctx context.Context, adminID, userID uint) error {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return e.NewForbiddenError("unauthorized access")
	}
	return s.adminRepo.DeleteUser(ctx, userID)
}

func (s *AdminService) CreateUserWithRole(ctx context.Context, name, email, password string, phone int64, role models.UserRole) (*models.User, error) {
	if err := utils.ValidateEmail(email); err != nil {
		return nil, e.NewValidationError("invalid email format")
	}
	if err := utils.ValidatePassword(password); err != nil {
		return nil, e.NewValidationError("invalid password format")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, e.NewInternalError()
	}

	user := &models.User{
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Phone:        phone,
		Role:         role,
		IsActive:     true,
	}

	if err := s.adminRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	user.PasswordHash = ""
	return user, nil
}

func (s *AdminService) ListDoctors(ctx context.Context, page, pageSize int) ([]models.User, int64, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize
	return s.adminRepo.ListUsersByRole(ctx, models.RoleDoctor, pageSize, offset)
}

func (s *AdminService) GetUserStats(ctx context.Context) (*models.SystemStats, error) {
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	stats := &models.SystemStats{
		LastUpdated: time.Now(),
	}

	var err error
	stats.TotalUsers, err = s.adminRepo.GetUserCount(ctx)
	if err != nil {
		return nil, err
	}

	stats.ActiveUsers, err = s.adminRepo.GetActiveUserCount(ctx, thirtyDaysAgo)
	if err != nil {
		return nil, err
	}

	stats.NewUsersToday, err = s.adminRepo.GetNewUserCount(ctx, time.Now().Truncate(24*time.Hour))
	if err != nil {
		return nil, err
	}

	return stats, nil
}

func (s *AdminService) GetAppointmentStats(ctx context.Context) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	totalAppointments, err := s.adminRepo.GetAppointmentCount(ctx, thirtyDaysAgo)
	if err != nil {
		return nil, err
	}
	stats["total_appointments"] = totalAppointments

	return stats, nil
}

func (s *AdminService) GetSystemSettings(ctx context.Context) (*models.AdminSettings, error) {
	return s.adminRepo.GetSystemSettings(ctx)
}

func (s *AdminService) CreateBackup(ctx context.Context, adminID uint) (*models.SystemBackup, error) {
	backup := &models.SystemBackup{
		FileName:   fmt.Sprintf("backup_%s.sql", time.Now().Format("20060102_150405")),
		BackupType: "full",
		Status:     "in_progress",
		AdminID:    adminID,
	}

	if err := s.adminRepo.CreateBackup(ctx, backup); err != nil {
		return nil, err
	}

	backup.Status = "completed"
	backup.CompletedAt = time.Now()
	if err := s.adminRepo.UpdateBackup(ctx, backup); err != nil {
		return nil, err
	}

	return backup, nil
}

func (s *AdminService) RestoreBackup(ctx context.Context, adminID, backupID uint) error {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return e.NewForbiddenError("unauthorized access")
	}

	backup, err := s.adminRepo.GetBackup(ctx, backupID)
	if err != nil {
		return e.NewNotFoundError("backup not found")
	}

	if backup.Status != "completed" {
		return e.NewValidationError("backup is not in completed state")
	}

	s.createAuditLog(ctx, adminID, "RESTORE_BACKUP", "BACKUP", backupID, nil)

	return nil
}

func (s *AdminService) ToggleMaintenanceMode(ctx context.Context, adminID uint, enabled bool) error {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return e.NewForbiddenError("unauthorized access")
	}

	settings, err := s.adminRepo.GetSystemSettings(ctx)
	if err != nil {
		return err
	}

	settings.MaintenanceMode = enabled
	return s.adminRepo.UpdateSystemSettings(ctx, settings)
}

func (s *AdminService) RejectDoctor(ctx context.Context, adminID, doctorID uint, reason string) error {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return e.NewForbiddenError("unauthorized access")
	}

	user, err := s.userRepo.FindByID(ctx, doctorID)
	if err != nil {
		return e.NewNotFoundError("doctor not found")
	}

	if user.Role != models.RoleDoctor {
		return e.NewValidationError("user is not a doctor")
	}

	user.IsActive = false
	if err := s.userRepo.UpdateUser(user, ctx); err != nil {
		return err
	}

	subject := "Doctor Application Status - HealthHub"
	body := fmt.Sprintf("Dear Dr. %s,\n\nYour application has been reviewed and unfortunately not approved.\nReason: %s\n\nBest regards,\nHealthHub Team", user.Name, reason)
	if err := utils.SendEmail(user.Email, subject, body); err != nil {
		log.Printf("Failed to send rejection email: %v", err)
	}

	return nil
}

func (s *AdminService) GetErrorLogs(ctx context.Context, startTime, endTime time.Time, page, pageSize int) ([]models.AuditLog, int64, error) {
	return s.adminRepo.GetAuditLogs(ctx, startTime, endTime, map[string]interface{}{
		"status": models.AuditFailed,
	}, page, pageSize)
}

func (s *AdminService) GetAllLoginHistory(ctx context.Context, page, pageSize int) ([]models.LoginAttempt, int64, error) {
	var total int64
	attempts, err := s.adminRepo.GetAllLoginHistory(ctx, page, pageSize)
	if err != nil {
		return nil, 0, err
	}
	total, err = s.adminRepo.GetLoginHistoryCount(ctx)
	return attempts, total, err
}

func (s *AdminService) GenerateUserReport(ctx context.Context, format string) ([]byte, error) {
	_, _, err := s.adminRepo.ListUsers(ctx, -1, 0)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (s *AdminService) GenerateAppointmentReport(ctx context.Context, format string) ([]byte, error) {
	_, err := s.adminRepo.GetAllAppointments(ctx)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (s *AdminService) ListSupportTickets(ctx context.Context, status string, page, pageSize int) ([]models.SupportTicket, int64, error) {
	filters := make(map[string]interface{})
	if status != "" {
		filters["status"] = status
	}
	return s.adminRepo.GetSupportTickets(ctx, filters, page, pageSize)
}

func (s *AdminService) GetSupportTicket(ctx context.Context, ticketID uint) (*models.SupportTicket, error) {
	return s.adminRepo.GetSupportTicketByID(ctx, ticketID)
}

func (s *AdminService) RespondToTicket(ctx context.Context, adminID, ticketID uint, response, status string) error {
	isAdmin, err := s.userRepo.CheckUserRole(ctx, adminID, models.RoleAdmin)
	if err != nil || !isAdmin {
		return e.NewForbiddenError("unauthorized access")
	}

	ticket, err := s.adminRepo.GetSupportTicketByID(ctx, ticketID)
	if err != nil {
		return err
	}

	ticket.AdminResponse = response
	ticket.Status = status
	ticket.RespondedAt = time.Now()
	ticket.AdminID = adminID

	if err := s.adminRepo.UpdateSupportTicket(ctx, ticket); err != nil {
		return err
	}

	user, err := s.userRepo.FindByID(ctx, ticket.UserID)
	if err != nil {
		return err
	}

	subject := "Support Ticket Update - HealthHub"
	body := fmt.Sprintf(`Dear %s,

Your support ticket (#%d) has been updated.

Response: %s
Status: %s

Best regards,
HealthHub Team`, user.Name, ticketID, response, status)

	return utils.SendEmail(user.Email, subject, body)
}
