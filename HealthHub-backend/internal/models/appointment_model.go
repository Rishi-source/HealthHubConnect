package models

import (
	"HealthHubConnect/internal/utils"
	"fmt"
	"time"
)

func (r *AppointmentRequest) ToAppointment(patientID uint) (*Appointment, error) {
	date, err := time.Parse("2006-01-02", r.Date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: use YYYY-MM-DD")
	}

	startTime, err := utils.CombineDateAndTime(date, r.StartTime)
	if err != nil {
		return nil, fmt.Errorf("invalid start time format: use HH:mm:ss")
	}

	endTime, err := utils.CombineDateAndTime(date, r.EndTime)
	if err != nil {
		return nil, fmt.Errorf("invalid end time format: use HH:mm:ss")
	}

	return &Appointment{
		PatientID:   patientID,
		DoctorID:    r.DoctorID,
		Type:        r.Type,
		Date:        date,
		StartTime:   startTime,
		EndTime:     endTime,
		Description: r.Description,
		Address:     r.Address,
		Latitude:    r.Latitude,
		Longitude:   r.Longitude,
		Status:      StatusPending,
	}, nil
}

type AppointmentStatus string
type AppointmentType string

const (
	StatusPending   AppointmentStatus = "PENDING"
	StatusConfirmed AppointmentStatus = "CONFIRMED"
	StatusCancelled AppointmentStatus = "CANCELLED"
	StatusCompleted AppointmentStatus = "COMPLETED"
	StatusNoShow    AppointmentStatus = "NO_SHOW"

	TypeOnline  AppointmentType = "ONLINE"
	TypeOffline AppointmentType = "OFFLINE"

	MinAppointmentDuration = 15 * time.Minute
	MaxAppointmentDuration = 120 * time.Minute
	MinAdvanceBooking      = 15 * time.Minute
	MaxAdvanceBooking      = 30 * 24 * time.Hour
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
	Address     string            `json:"address,omitempty"`
	Latitude    float64           `json:"latitude,omitempty"`
	Longitude   float64           `json:"longitude,omitempty"`
	Duration    time.Duration     `json:"duration"`
	Reason      string            `json:"reason" gorm:"type:text"`
	Notes       string            `json:"notes" gorm:"type:text"`
	IsCancelled bool              `json:"is_cancelled" gorm:"default:false"`
	CancelledAt *time.Time        `json:"cancelled_at"`
	CancelledBy *uint             `json:"cancelled_by"`
	Reminder    bool              `json:"reminder" gorm:"default:true"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

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

type TimeSlot struct {
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	Available bool      `json:"available"`
}

type AppointmentSlotRequest struct {
	DoctorID uint      `json:"doctor_id"`
	Date     time.Time `json:"date"`
}
