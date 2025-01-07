package models

import "time"

type HealthProfile struct {
	Base
	UserID            uint               `json:"user_id" gorm:"uniqueIndex"`
	DateOfBirth       time.Time          `json:"date_of_birth"`
	Gender            string             `json:"gender"`
	BloodType         string             `json:"blood_type"`
	Height            float64            `json:"height"`
	Weight            float64            `json:"weight"`
	Street            string             `json:"street"`
	City              string             `json:"city"`
	State             string             `json:"state"`
	PostalCode        string             `json:"postal_code"`
	Country           string             `json:"country"`
	LastUpdated       time.Time          `json:"last_updated"`
	Version           string             `json:"version"`
	EmergencyContacts []EmergencyContact `json:"emergency_contacts" gorm:"foreignKey:UserID"`
	Allergy           []Allergy          `json:"allergies" gorm:"foreignKey:UserID"`
	Medication        []Medication       `json:"medications" gorm:"foreignKey:UserID"`
	VitalSign         []VitalSign        `json:"vital_signs" gorm:"foreignKey:UserID"`
	DeletedAt         time.Time          `json:"deleted_at"`
}

type EmergencyContact struct {
	Base
	UserID         uint      `json:"user_id" gorm:"not null;index"`
	Name           string    `json:"name" gorm:"size:100;not null"`
	Relationship   string    `json:"relationship" gorm:"size:50;not null"`
	PrimaryPhone   string    `json:"primary_phone" gorm:"size:20;not null"`
	SecondaryPhone string    `json:"secondary_phone" gorm:"size:20"`
	Email          string    `json:"email" gorm:"size:255"`
	Address        string    `json:"address" gorm:"size:255"`
	IsMainContact  bool      `json:"is_main_contact" gorm:"default:false"`
	LastVerifiedAt time.Time `json:"last_verified_at"`
	Notes          string    `json:"notes" gorm:"size:500"`
}

type Allergy struct {
	Base
	UserID           uint       `json:"user_id" gorm:"not null;index"`
	Allergen         string     `json:"allergen" gorm:"size:100;not null;index"`
	AllergenType     string     `json:"allergen_type" gorm:"size:50;not null"`
	Severity         string     `json:"severity" gorm:"size:50;not null"`
	Reactions        string     `json:"reactions" gorm:"size:500"`
	DiagnosedDate    time.Time  `json:"diagnosed_date"`
	DiagnosedBy      string     `json:"diagnosed_by" gorm:"size:100"`
	LastReactionDate *time.Time `json:"last_reaction_date"`
	TreatmentPlan    string     `json:"treatment_plan" gorm:"size:500"`
	EmergencyMeds    string     `json:"emergency_meds" gorm:"size:200"`
	PreventiveMeds   string     `json:"preventive_meds" gorm:"size:200"`
	LastUpdatedBy    string     `json:"last_updated_by" gorm:"size:100"`
	LastVerifiedAt   time.Time  `json:"last_verified_at"`
	IsActive         bool       `json:"is_active" gorm:"default:true"`
	Notes            string     `json:"notes" gorm:"size:1000"`
}

type Medication struct {
	Base
	UserID              uint       `json:"user_id" gorm:"not null;index"`
	Name                string     `json:"name" gorm:"size:200;not null;index"`
	GenericName         string     `json:"generic_name" gorm:"size:200"`
	BrandName           string     `json:"brand_name" gorm:"size:200"`
	Dosage              string     `json:"dosage" gorm:"size:50;not null"`
	DosageUnit          string     `json:"dosage_unit" gorm:"size:20;not null"`
	Frequency           string     `json:"frequency" gorm:"size:100;not null"`
	RouteOfAdmin        string     `json:"route_of_admin" gorm:"size:50"`
	StartDate           time.Time  `json:"start_date" gorm:"not null"`
	EndDate             *time.Time `json:"end_date"`
	Duration            int        `json:"duration"`
	Condition           string     `json:"condition" gorm:"size:200"`
	PrescribedBy        string     `json:"prescribed_by" gorm:"size:100"`
	Pharmacy            string     `json:"pharmacy" gorm:"size:200"`
	PrescriptionNum     string     `json:"prescription_num" gorm:"size:50"`
	LastFilled          time.Time  `json:"last_filled"`
	NextRefillDate      time.Time  `json:"next_refill_date"`
	RemainingRefills    int        `json:"remaining_refills"`
	IsActive            bool       `json:"is_active" gorm:"default:true"`
	SideEffects         string     `json:"side_effects" gorm:"size:500"`
	Interactions        string     `json:"interactions" gorm:"size:500"`
	TakeWithFood        bool       `json:"take_with_food"`
	SpecialInstructions string     `json:"special_instructions" gorm:"size:500"`
	Notes               string     `json:"notes" gorm:"size:1000"`
}

type VitalSign struct {
	Base
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	Type      string    `json:"type" gorm:"not null"` // bloodPressure, heartRate, temperature, oxygenSaturation
	Value     string    `json:"value"`
	Systolic  string    `json:"systolic,omitempty"`  // for blood pressure
	Diastolic string    `json:"diastolic,omitempty"` // for blood pressure
	Timestamp time.Time `json:"timestamp" gorm:"not null"`
}
