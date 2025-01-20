package repositories

import (
	"HealthHubConnect/internal/models"
	"context"
	"time"

	"gorm.io/gorm"
)

type AdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) GetUserCount(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.User{}).Count(&count).Error
	return count, err
}

func (r *AdminRepository) GetActiveUserCount(ctx context.Context, since time.Time) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("last_login >= ?", since).
		Count(&count).Error
	return count, err
}

func (r *AdminRepository) GetUserCountByRole(ctx context.Context, role models.UserRole) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("role = ?", role).
		Count(&count).Error
	return count, err
}

func (r *AdminRepository) GetNewUserCount(ctx context.Context, since time.Time) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("created_at >= ?", since).
		Count(&count).Error
	return count, err
}

func (r *AdminRepository) CreateAuditLog(ctx context.Context, log *models.AuditLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *AdminRepository) GetAuditLogs(ctx context.Context, startTime, endTime time.Time, filters map[string]interface{}, page, pageSize int) ([]models.AuditLog, int64, error) {
	var logs []models.AuditLog
	var total int64

	query := r.db.WithContext(ctx).Model(&models.AuditLog{}).
		Where("timestamp BETWEEN ? AND ?", startTime, endTime)

	for key, value := range filters {
		query = query.Where(key+" = ?", value)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Order("timestamp desc").
		Find(&logs).Error

	return logs, total, err
}

func (r *AdminRepository) GetSystemSettings(ctx context.Context) (*models.AdminSettings, error) {
	var settings models.AdminSettings
	err := r.db.WithContext(ctx).First(&settings).Error
	if err == gorm.ErrRecordNotFound {
		settings = models.AdminSettings{
			MaintenanceMode:    false,
			SystemVersion:      "1.0.0",
			EmailNotifications: true,
			MaxLoginAttempts:   5,
			SessionTimeout:     60,
		}
		err = r.db.WithContext(ctx).Create(&settings).Error
	}
	return &settings, err
}

func (r *AdminRepository) UpdateSystemSettings(ctx context.Context, settings *models.AdminSettings) error {
	return r.db.WithContext(ctx).Save(settings).Error
}

func (r *AdminRepository) CreateBackup(ctx context.Context, backup *models.SystemBackup) error {
	return r.db.WithContext(ctx).Create(backup).Error
}

func (r *AdminRepository) UpdateBackup(ctx context.Context, backup *models.SystemBackup) error {
	return r.db.WithContext(ctx).Save(backup).Error
}

func (r *AdminRepository) GetBackup(ctx context.Context, backupID uint) (*models.SystemBackup, error) {
	var backup models.SystemBackup
	err := r.db.WithContext(ctx).First(&backup, backupID).Error
	if err != nil {
		return nil, err
	}
	return &backup, nil
}

func (r *AdminRepository) ListUsers(ctx context.Context, limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	if err := r.db.WithContext(ctx).Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.WithContext(ctx).
		Limit(limit).
		Offset(offset).
		Find(&users).Error

	return users, total, err
}

func (r *AdminRepository) ListUsersByRole(ctx context.Context, role models.UserRole, limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := r.db.WithContext(ctx).Model(&models.User{}).Where("role = ?", role)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Limit(limit).
		Offset(offset).
		Find(&users).Error

	return users, total, err
}

func (r *AdminRepository) DeleteUser(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).Delete(&models.User{}, userID).Error
}

func (r *AdminRepository) CreateUser(ctx context.Context, user *models.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *AdminRepository) GetAppointmentCount(ctx context.Context, since time.Time) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Appointment{}).
		Where("created_at >= ?", since).
		Count(&count).Error
	return count, err
}

func (r *AdminRepository) GetAllLoginHistory(ctx context.Context, page, pageSize int) ([]models.LoginAttempt, error) {
	var attempts []models.LoginAttempt
	err := r.db.WithContext(ctx).
		Order("timestamp desc").
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Find(&attempts).Error
	return attempts, err
}

func (r *AdminRepository) GetLoginHistoryCount(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.LoginAttempt{}).Count(&count).Error
	return count, err
}

func (r *AdminRepository) GetAllAppointments(ctx context.Context) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.WithContext(ctx).Find(&appointments).Error
	return appointments, err
}

func (r *AdminRepository) GetRevenueData(ctx context.Context) ([]map[string]interface{}, error) {
	var revenue []map[string]interface{}
	err := r.db.WithContext(ctx).
		Table("appointments").
		Select("DATE(created_at) as date, SUM(fee) as amount, 'appointments' as source").
		Group("DATE(created_at)").
		Scan(&revenue).Error
	return revenue, err
}

func (r *AdminRepository) GetSupportTickets(ctx context.Context, filters map[string]interface{}, page, pageSize int) ([]models.SupportTicket, int64, error) {
	var tickets []models.SupportTicket
	var total int64

	query := r.db.WithContext(ctx).Model(&models.SupportTicket{})
	for key, value := range filters {
		query = query.Where(key+" = ?", value)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Order("created_at desc").
		Find(&tickets).Error

	return tickets, total, err
}

func (r *AdminRepository) GetSupportTicketByID(ctx context.Context, ticketID uint) (*models.SupportTicket, error) {
	var ticket models.SupportTicket
	err := r.db.WithContext(ctx).First(&ticket, ticketID).Error
	if err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *AdminRepository) UpdateSupportTicket(ctx context.Context, ticket *models.SupportTicket) error {
	return r.db.WithContext(ctx).Save(ticket).Error
}
