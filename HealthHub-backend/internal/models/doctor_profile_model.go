package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type DoctorProfile struct {
	gorm.Model
	UserID          uint            `json:"userId" gorm:"uniqueIndex:idx_user_id;not null"`
	User            *DoctorUserInfo `json:"user" gorm:"foreignKey:UserID"`
	BasicInfoJSON   string          `json:"-" gorm:"column:basic_info_json;type:jsonb"`
	BasicInfo       BasicInfo       `json:"basicInfo" gorm:"-"`
	QualJSON        string          `json:"-" gorm:"column:qual_json;type:jsonb"`
	Qualifications  Qualifications  `json:"qualifications" gorm:"-"`
	PracticeJSON    string          `json:"-" gorm:"column:practice_json;type:jsonb"`
	PracticeDetails PracticeDetails `json:"practiceDetails" gorm:"-"`
	SpecJSON        string          `json:"-" gorm:"column:spec_json;type:jsonb"`
	Specializations SpecInfo        `json:"specializations" gorm:"-"`
	BillingSettings json.RawMessage `json:"billing_settings" gorm:"type:json;default:'{}'"`
}

type DoctorUserInfo struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	ProfilePicture string `json:"profile_picture"`
}

func (DoctorUserInfo) TableName() string {
	return "users"
}

func (dp *DoctorProfile) BeforeSave(tx *gorm.DB) error {
	if basicInfoJSON, err := json.Marshal(dp.BasicInfo); err == nil {
		dp.BasicInfoJSON = string(basicInfoJSON)
	}
	if qualJSON, err := json.Marshal(dp.Qualifications); err == nil {
		dp.QualJSON = string(qualJSON)
	}
	if practiceJSON, err := json.Marshal(dp.PracticeDetails); err == nil {
		dp.PracticeJSON = string(practiceJSON)
	}
	if specJSON, err := json.Marshal(dp.Specializations); err == nil {
		dp.SpecJSON = string(specJSON)
	}
	return nil
}

func (dp *DoctorProfile) AfterFind(tx *gorm.DB) error {
	if dp.BasicInfoJSON != "" {
		json.Unmarshal([]byte(dp.BasicInfoJSON), &dp.BasicInfo)
	}
	if dp.QualJSON != "" {
		json.Unmarshal([]byte(dp.QualJSON), &dp.Qualifications)
	}
	if dp.PracticeJSON != "" {
		json.Unmarshal([]byte(dp.PracticeJSON), &dp.PracticeDetails)
	}
	if dp.SpecJSON != "" {
		json.Unmarshal([]byte(dp.SpecJSON), &dp.Specializations)
	}
	return nil
}

func (DoctorProfile) TableName() string {
	return "doctor_profiles"
}

type BasicInfo struct {
	FullName             string   `json:"fullName"`
	Email                string   `json:"email"`
	Phone                string   `json:"phone"`
	MedicalLicenseNumber string   `json:"medicalLicenseNumber"`
	YearOfRegistration   int      `json:"yearOfRegistration"`
	Experience           int      `json:"experience"`
	Specializations      []string `json:"specializations" gorm:"type:text[]"`
	Languages            []string `json:"languages" gorm:"type:text[]"`
	About                string   `json:"about"`
}

type Degree struct {
	Name       string `json:"name"`
	University string `json:"university"`
	Year       int    `json:"year"`
	Country    string `json:"country"`
}

type Certification struct {
	Name                string `json:"name"`
	IssuingBody         string `json:"issuingBody"`
	Year                int    `json:"year"`
	ExpiryYear          int    `json:"expiryYear"`
	CertificationNumber string `json:"certificationNumber"`
}

type Qualifications struct {
	Degrees        []Degree        `json:"degrees" gorm:"type:jsonb"`
	Certifications []Certification `json:"certifications" gorm:"type:jsonb"`
}

type Affiliation struct {
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	City         string `json:"city"`
	State        string `json:"state"`
	Country      string `json:"country"`
	Designation  string `json:"designation"`
	WorkingHours string `json:"workingHours"`
}

type ConsultationType struct {
	Enabled        bool    `json:"enabled"`
	Fee            float64 `json:"fee"`
	Duration       int     `json:"duration"`
	FollowupFee    float64 `json:"followupFee"`
	FollowupWindow int     `json:"followupWindow"`
	Instructions   string  `json:"instructions,omitempty"`
}

type Emergency struct {
	Available   bool    `json:"available"`
	Fee         float64 `json:"fee"`
	Hours       string  `json:"hours"`
	CustomHours string  `json:"customHours"`
}

type PracticeDetails struct {
	Affiliations      []Affiliation `json:"affiliations" gorm:"type:jsonb"`
	ConsultationTypes struct {
		Online   ConsultationType `json:"online"`
		InPerson ConsultationType `json:"inPerson"`
	} `json:"consultationTypes" gorm:"type:jsonb"`
	Emergency Emergency `json:"emergency" gorm:"type:jsonb"`
}

type Procedure struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Duration    string `json:"duration"`
	Cost        string `json:"cost"`
}

type Specialization struct {
	Name           string      `json:"name"`
	Subspecialty   string      `json:"subspecialty"`
	Experience     int         `json:"experience"`
	ExpertiseLevel string      `json:"expertiseLevel"`
	Description    string      `json:"description"`
	Certification  string      `json:"certification"`
	ProfileLink    string      `json:"profileLink"`
	Procedures     []Procedure `json:"procedures" gorm:"type:jsonb"`
}

type SpecInfo struct {
	Specializations []Specialization `json:"specializations" gorm:"type:jsonb"`
}

type BlockSlotRequest struct {
	Date      string `json:"date" validate:"required"`
	StartTime string `json:"start_time" validate:"required"`
	EndTime   string `json:"end_time" validate:"required"`
	Reason    string `json:"reason,omitempty"`
}

type PatientListResponse struct {
	Patients    []PatientInfo `json:"patients"`
	Total       int64         `json:"total"`
	CurrentPage int           `json:"current_page"`
	PerPage     int           `json:"per_page"`
	TotalPages  int           `json:"total_pages"`
}

type PatientInfo struct {
	UserID          uint       `json:"user_id"`
	Name            string     `json:"name"`
	Email           string     `json:"email"`
	Phone           int64      `json:"phone"`
	LastVisit       *time.Time `json:"last_visit"`
	TotalVisits     int        `json:"total_visits"`
	NextAppointment *time.Time `json:"next_appointment,omitempty"`
}

type BillingSettings struct {
	ConsultationFees struct {
		Online struct {
			Amount       float64 `json:"amount"`
			Currency     string  `json:"currency"`
			DurationMins int     `json:"duration_minutes"`
		} `json:"online"`
		InPerson struct {
			Amount       float64 `json:"amount"`
			Currency     string  `json:"currency"`
			DurationMins int     `json:"duration_minutes"`
		} `json:"in_person"`
		FollowUp struct {
			Amount       float64 `json:"amount"`
			Currency     string  `json:"currency"`
			DurationMins int     `json:"duration_minutes"`
			ValidityDays int     `json:"validity_days"`
		} `json:"follow_up"`
	} `json:"consultation_fees"`
	PaymentMethods []string `json:"payment_methods"`
	BankDetails    []struct {
		BankName      string `json:"bank_name"`
		AccountNumber string `json:"account_number"`
		IFSC          string `json:"ifsc"`
		AccountName   string `json:"account_name"`
	} `json:"bank_details"`
	UPIDetails []struct {
		UPIId     string `json:"upi_id"`
		IsDefault bool   `json:"is_default"`
	} `json:"upi_details"`
	TaxInfo struct {
		GSTIN   string  `json:"gstin"`
		PAN     string  `json:"pan"`
		TaxRate float64 `json:"tax_rate"`
	} `json:"tax_info"`
}
