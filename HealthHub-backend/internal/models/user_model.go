package models

import (
	"time"
)

type User struct {
	Base
	Email          string `json:"email" gorm:"uniqueIndex;not null" validate:"required,email"`
	PasswordHash   string `json:"-"` //never return in JSON
	Name           string `json:"name"`
	ProfilePicture string `json:"profile_picture"` //would be storing url here not base64
	IsActive       bool   `json:"is_active" gorm:"default:true"`
	EmailVerified  bool   `json:"email_verified" gorm:"default:false"`
	Phone          int64  `json:"phone"`
	// Password       string `json:"password,omitempty" gorm:"-" validate:"required,min=8"`
	// Role           string    `json:"role" gorm:"default:'user'" validate:"required,oneof=admin user"` //maybe required in the future
	LastLogin time.Time `json:"last_login"`
}

type LoginAttempt struct {
	Base
	UserID     uint      `json:"user_id"`
	User       User      `json:"user" gorm:"foreignKey:UserID"`
	IPAddress  string    `json:"ip_address"`
	Successful bool      `json:"successful"`
	Timestamp  time.Time `json:"timestamp"`
}
