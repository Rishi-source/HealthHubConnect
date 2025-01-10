package models

import (
	"time"
)

type AppointmentStatus string
type AppointmentType string

const (
	StatusPending   AppointmentStatus = "PENDING"
	StatusConfirmed AppointmentStatus = "CONFIRMED"
	StatusCancelled AppointmentStatus = "CANCELLED"

	TypeOnline  AppointmentType = "ONLINE"
	TypeOffline AppointmentType = "OFFLINE"
)

type Appointment struct {
	ID          uint              `json:"id" gorm:"primaryKey"`
	PatientID   uint              `json:"patient_id" gorm:"not null"`
	Patient     User              `json:"patient" gorm:"foreignKey:PatientID"`
	DoctorID    uint              `json:"doctor_id" gorm:"not null"`
	Doctor      User              `json:"doctor" gorm:"foreignKey:DoctorID"`
	Type        AppointmentType   `json:"type" gorm:"type:varchar(20);not null"`
	Date        time.Time         `json:"date" gorm:"not null"`
	StartTime   time.Time         `json:"start_time" gorm:"not null"`
	EndTime     time.Time         `json:"end_time" gorm:"not null"`
	Status      AppointmentStatus `json:"status" gorm:"type:varchar(20);default:'PENDING'"`
	Description string            `json:"description"`
	// Location details for offline appointments
	Address   string    `json:"address,omitempty"`
	Latitude  float64   `json:"latitude,omitempty"`
	Longitude float64   `json:"longitude,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// AppointmentRequest represents the incoming request structure for creating appointments
type AppointmentRequest struct {
	DoctorID    uint            `json:"doctor_id" validate:"required"`
	Type        AppointmentType `json:"type" validate:"required,oneof=ONLINE OFFLINE"`
	Date        string          `json:"date" validate:"required"`       // Format: "2006-01-02"
	StartTime   string          `json:"start_time" validate:"required"` // Format: "15:04:05"
	EndTime     string          `json:"end_time" validate:"required"`   // Format: "15:04:05"
	Description string          `json:"description"`
	Address     string          `json:"address,omitempty"`
	Latitude    float64         `json:"latitude,omitempty"`
	Longitude   float64         `json:"longitude,omitempty"`
}

type DoctorAvailability struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	DoctorID  uint      `json:"doctor_id" gorm:"not null"`
	Doctor    User      `json:"doctor" gorm:"foreignKey:DoctorID"`
	Date      time.Time `json:"date" gorm:"not null"`
	StartTime time.Time `json:"start_time" gorm:"not null"`
	EndTime   time.Time `json:"end_time" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
