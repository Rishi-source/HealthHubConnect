package models

import (
	"time"
)

type AppointmentStatus string

const (
	StatusPending   AppointmentStatus = "PENDING"
	StatusConfirmed AppointmentStatus = "CONFIRMED"
	StatusCancelled AppointmentStatus = "CANCELLED"
)

type Appointment struct {
	ID          uint              `json:"id" gorm:"primaryKey"`
	PatientID   uint              `json:"patient_id" gorm:"not null"`
	Patient     User              `json:"patient" gorm:"foreignKey:PatientID"`
	DoctorID    uint              `json:"doctor_id" gorm:"not null"`
	Doctor      User              `json:"doctor" gorm:"foreignKey:DoctorID"`
	Date        time.Time         `json:"date" gorm:"not null"`
	StartTime   time.Time         `json:"start_time" gorm:"not null"`
	EndTime     time.Time         `json:"end_time" gorm:"not null"`
	Status      AppointmentStatus `json:"status" gorm:"type:varchar(20);default:'PENDING'"`
	Description string            `json:"description"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
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
