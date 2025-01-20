package models

import "time"

type AdminSettings struct {
	Base
	AdminID            uint      `json:"admin_id"`
	MaintenanceMode    bool      `json:"maintenance_mode"`
	LastBackupDate     time.Time `json:"last_backup_date"`
	SystemVersion      string    `json:"system_version"`
	EmailNotifications bool      `json:"email_notifications"`
	MaxLoginAttempts   int       `json:"max_login_attempts"`
	SessionTimeout     int       `json:"session_timeout"`
}

type SystemStats struct {
	TotalUsers        int64     `json:"total_users"`
	ActiveUsers       int64     `json:"active_users"`
	TotalDoctors      int64     `json:"total_doctors"`
	TotalPatients     int64     `json:"total_patients"`
	TotalAppointments int64     `json:"total_appointments"`
	NewUsersToday     int64     `json:"new_users_today"`
	TotalRevenue      float64   `json:"total_revenue"`
	LastUpdated       time.Time `json:"last_updated"`
}

type AuditLog struct {
	Base
	AdminID    uint        `json:"admin_id"`
	Action     string      `json:"action"`
	EntityType string      `json:"entity_type"`
	EntityID   uint        `json:"entity_id"`
	Changes    string      `json:"changes"`
	IPAddress  string      `json:"ip_address"`
	Timestamp  time.Time   `json:"timestamp"`
	Status     AuditStatus `json:"status"`
}

type AuditStatus string

const (
	AuditSuccess AuditStatus = "SUCCESS"
	AuditFailed  AuditStatus = "FAILED"
)

type NotificationTemplate struct {
	Base
	Name     string `json:"name"`
	Subject  string `json:"subject"`
	Template string `json:"template"`
	Type     string `json:"type"` // email, sms, push
}

type SystemBackup struct {
	Base
	FileName    string    `json:"file_name"`
	Size        int64     `json:"size"`
	BackupType  string    `json:"backup_type"` // full, incremental
	Status      string    `json:"status"`
	CompletedAt time.Time `json:"completed_at"`
	AdminID     uint      `json:"admin_id"`
}

type SupportTicket struct {
	Base
	UserID        uint      `json:"user_id"`
	User          User      `json:"user" gorm:"foreignKey:UserID"`
	Subject       string    `json:"subject"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	AdminID       uint      `json:"admin_id"`
	AdminResponse string    `json:"admin_response"`
	RespondedAt   time.Time `json:"responded_at"`
}
