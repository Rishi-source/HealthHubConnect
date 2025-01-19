package models

import "time"

// Rename TimeSlot to ScheduleTimeSlot
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
	Slots  []ScheduleTimeSlot `json:"slots"` // Updated reference
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
