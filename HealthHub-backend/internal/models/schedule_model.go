package models

import (
	"time"

	"gorm.io/gorm"
)

type ScheduleTimeSlot struct {
	Start    string `json:"start"`
	End      string `json:"end"`
	Duration int    `json:"duration"`
	Capacity int    `json:"capacity"`
}

type Break struct {
	Name    string `json:"name"`
	Start   string `json:"start"`
	End     string `json:"end"`
	Enabled bool   `json:"enabled,omitempty"`
}

type DaySchedule struct {
	Enabled      bool `json:"enabled"`
	WorkingHours struct {
		Start string `json:"start"`
		End   string `json:"end"`
	} `json:"workingHours"`
	Slots  []ScheduleTimeSlot `json:"slots"`
	Breaks []Break            `json:"breaks"`
}

type Schedule struct {
	DefaultSettings struct {
		TimePerPatient string `json:"timePerPatient"`
	} `json:"defaultSettings"`
	Days map[string]DaySchedule `json:"days"`
}

type DoctorSchedule struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	DoctorID  uint      `json:"doctor_id" gorm:"not null"`
	Schedule  string    `json:"schedule" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ScheduleRequest struct {
	Schedule Schedule       `json:"schedule"`
	Policies DoctorPolicies `json:"policies"`
}

type DoctorPolicies struct {
	CancellationPolicy    string              `json:"cancellationPolicy"`
	NoShowPolicy          string              `json:"noShowPolicy"`
	CancellationTimeframe string              `json:"cancellationTimeframe"`
	NoShowFee             float64             `json:"noShowFee"`
	CancellationFee       float64             `json:"cancellationFee"`
	PaymentMethods        []string            `json:"paymentMethods"`
	ConsultationPrep      string              `json:"consultationPrep"`
	DocumentationRequired string              `json:"documentationRequired"`
	FollowUpPolicy        string              `json:"followUpPolicy"`
	EmergencyPolicy       string              `json:"emergencyPolicy"`
	InsuranceProviders    []InsuranceProvider `json:"insuranceProviders"`
}

type InsuranceProvider struct {
	Name                string `json:"name"`
	PlanTypes           string `json:"planTypes"`
	VerificationProcess string `json:"verificationProcess"`
	ProcessingTime      string `json:"processingTime"`
}

type ScheduleResponse struct {
	ID        uint      `json:"id"`
	DoctorID  uint      `json:"doctor_id"`
	Schedule  Schedule  `json:"schedule"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// type BlockSlotRequest struct {
// 	Date         string `json:"date" validate:"required"`       // Format: "2006-01-02"
// 	StartTime    string `json:"start_time" validate:"required"` // Format: "15:04"
// 	EndTime      string `json:"end_time" validate:"required"`   // Format: "15:04"
// 	Reason       string `json:"reason"`
// 	IsRecurring  bool   `json:"is_recurring"`
// 	RecurringDay string `json:"recurring_day,omitempty"` // e.g., "monday", "tuesday"
// }

type BlockedSlot struct {
	gorm.Model
	DoctorID     uint      `json:"doctor_id" gorm:"not null"`
	Date         time.Time `json:"date" gorm:"not null"`
	StartTime    time.Time `json:"start_time" gorm:"not null"`
	EndTime      time.Time `json:"end_time" gorm:"not null"`
	Reason       string    `json:"reason"`
	IsRecurring  bool      `json:"is_recurring"`
	RecurringDay string    `json:"recurring_day,omitempty"`
}
