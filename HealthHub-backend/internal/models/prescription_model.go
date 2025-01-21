package models

import "time"

type PrescriptionStatus string

const (
	PrescriptionStatusActive    PrescriptionStatus = "ACTIVE"
	PrescriptionStatusExpired   PrescriptionStatus = "EXPIRED"
	PrescriptionStatusCancelled PrescriptionStatus = "CANCELLED"
)

type Prescription struct {
	Base
	AppointmentID     uint               `json:"appointment_id" gorm:"not null;index"`
	PatientID         uint               `json:"patient_id" gorm:"not null;index"`
	DoctorID          uint               `json:"doctor_id" gorm:"not null;index"`
	Diagnosis         []string           `json:"diagnosis" gorm:"type:jsonb"`
	ChiefComplaints   []string           `json:"chief_complaints" gorm:"type:jsonb"`
	Vitals            PrescriptionVitals `json:"vitals" gorm:"type:jsonb"`
	Medications       []PrescribedMed    `json:"medications" gorm:"type:jsonb"`
	Investigations    []Investigation    `json:"investigations" gorm:"type:jsonb"`
	Advice            string             `json:"advice" gorm:"type:text"`
	FollowUp          *FollowUp          `json:"follow_up" gorm:"type:jsonb"`
	Status            PrescriptionStatus `json:"status" gorm:"type:varchar(20);default:'ACTIVE'"`
	ExpiryDate        *time.Time         `json:"expiry_date"`
	DoctorNotes       string             `json:"doctor_notes" gorm:"type:text"`
	IsDigitallySigned bool               `json:"is_digitally_signed" gorm:"default:false"`
	SignedAt          *time.Time         `json:"signed_at"`
	PatientHistory    PatientHistory     `json:"patient_history" gorm:"type:jsonb"`
}

type PrescriptionVitals struct {
	BloodPressure   string  `json:"blood_pressure"`
	Temperature     float64 `json:"temperature"`
	TemperatureUnit string  `json:"temperature_unit"`
	HeartRate       int     `json:"heart_rate"`
	SpO2            int     `json:"spo2"`
	Weight          float64 `json:"weight"`
	WeightUnit      string  `json:"weight_unit"`
	Height          float64 `json:"height"`
	HeightUnit      string  `json:"height_unit"`
	BMI             float64 `json:"bmi"`
}

type PrescribedMed struct {
	Name         string `json:"name"`
	GenericName  string `json:"generic_name"`
	Dosage       string `json:"dosage"`
	Frequency    string `json:"frequency"`
	Duration     string `json:"duration"`
	Route        string `json:"route"`
	Instructions string `json:"instructions"`
	Timing       string `json:"timing"` // Before/After meals
	Quantity     int    `json:"quantity"`
	Refills      int    `json:"refills"`
	Notes        string `json:"notes"`
	IsActive     bool   `json:"is_active"`
}

type Investigation struct {
	Type        string `json:"type"` // Lab/Imaging/Other
	Name        string `json:"name"`
	Description string `json:"description"`
	Urgency     string `json:"urgency"` // Routine/Urgent/Emergency
	Notes       string `json:"notes"`
}

type FollowUp struct {
	Description string    `json:"description"` // To store simple string follow-up
	Date        time.Time `json:"date,omitempty"`
	Type        string    `json:"type,omitempty"`
	Duration    int       `json:"duration,omitempty"`
}

type PatientHistory struct {
	PastIllnesses  []string        `json:"past_illnesses"`
	FamilyHistory  []string        `json:"family_history"`
	Allergies      []string        `json:"allergies"`
	CurrentMeds    []string        `json:"current_medications"`
	LastVisit      *time.Time      `json:"last_visit"`
	PreviousVisits []PreviousVisit `json:"previous_visits"`
}

type PreviousVisit struct {
	Date      time.Time `json:"date"`
	Diagnosis []string  `json:"diagnosis"`
	Treatment string    `json:"treatment"`
	Outcome   string    `json:"outcome"`
}

type PrescriptionRequest struct {
	Diagnosis       []string            `json:"diagnosis"`
	ChiefComplaints []string            `json:"chief_complaints"`
	DoctorNotes     string              `json:"notes"`
	Medications     []PrescribedMed     `json:"medications"`
	Investigations  []Investigation     `json:"investigations"`
	Advice          string              `json:"advice"`
	FollowUp        *FollowUp           `json:"followUp"`
	Status          PrescriptionStatus  `json:"status"`
	Vitals          *PrescriptionVitals `json:"vitals"`
	PatientHistory  *PatientHistory     `json:"patient_history"`
}
