package models

import (
	"time"
)

type UserRole string

const (
	RoleAdmin        UserRole = "admin"
	RoleDoctor       UserRole = "doctor"
	RoleNurse        UserRole = "nurse"
	RolePatient      UserRole = "patient"
	RoleReceptionist UserRole = "receptionist"
	RolePharmacist   UserRole = "pharmacist"
)

type User struct {
	Base
	Email            string         `json:"email" gorm:"uniqueIndex;not null" validate:"required,email"`
	PasswordHash     string         `json:"-"`
	Name             string         `json:"name"`
	ProfilePicture   string         `json:"profile_picture"`
	IsActive         bool           `json:"is_active" gorm:"default:true"`
	EmailVerified    bool           `json:"email_verified" gorm:"default:false"`
	Phone            int64          `json:"phone"`
	Role             UserRole       `json:"role" gorm:"default:'patient'" validate:"required,oneof=admin doctor nurse patient receptionist pharmacist"`
	LastLogin        time.Time      `json:"last_login"`
	ResetToken       string         `json:"-"`
	ResetTokenExpiry time.Time      `json:"-"`
	AuthProvider     string         `json:"auth_provider" gorm:"default:'local'"`
	HealthProfile    *HealthProfile `json:"health_profile" gorm:"foreignKey:UserID"`
	Location         *UserLocation  `json:"location" gorm:"foreignKey:UserID"`
	IsNewUser        bool           `json:"is_new_user" gorm:"-"`
}

type LoginAttempt struct {
	Base
	UserID     uint      `json:"user_id"`
	User       User      `json:"user" gorm:"foreignKey:UserID"`
	Email      string    `json:"email"` // for failed attempts maybe useful in future will implement if get time
	IPAddress  string    `json:"ip_address"`
	Successful bool      `json:"successful"`
	Timestamp  time.Time `json:"timestamp"`
}
