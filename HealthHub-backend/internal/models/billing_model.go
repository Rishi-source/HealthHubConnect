package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type BillStatus string
type PaymentMethod string
type RefundStatus string

const (
	BillStatusPending   BillStatus = "PENDING"
	BillStatusPaid      BillStatus = "PAID"
	BillStatusRefunded  BillStatus = "REFUNDED"
	BillStatusCancelled BillStatus = "CANCELLED"
	BillStatusOverdue   BillStatus = "OVERDUE"

	PaymentMethodUPI  PaymentMethod = "UPI"
	PaymentMethodCard PaymentMethod = "CARD"
	PaymentMethodCash PaymentMethod = "CASH"
	PaymentMethodBank PaymentMethod = "BANK_TRANSFER"

	RefundStatusPending   RefundStatus = "PENDING"
	RefundStatusApproved  RefundStatus = "APPROVED"
	RefundStatusRejected  RefundStatus = "REJECTED"
	RefundStatusCompleted RefundStatus = "COMPLETED"
)

type DoctorBillingSettings struct {
	Base
	DoctorID         uint            `json:"doctor_id" gorm:"uniqueIndex"`
	Doctor           User            `json:"doctor" gorm:"foreignKey:DoctorID"`
	BankAccounts     []BankAccount   `json:"bank_accounts" gorm:"type:jsonb"`
	UPIIDs           []UPIID         `json:"upi_ids" gorm:"type:jsonb"`
	ConsultationFees ConsultationFee `json:"consultation_fees" gorm:"type:jsonb"`
	TaxInfo          TaxInfo         `json:"tax_info" gorm:"type:jsonb"`
	PaymentSettings  PaymentSettings `json:"payment_settings" gorm:"type:jsonb"`
	IsActive         bool            `json:"is_active" gorm:"default:true"`
	LastUpdatedBy    uint            `json:"last_updated_by"`
}

type ConsultationFee struct {
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
	CancellationPolicy struct {
		RefundPercent  int `json:"refund_percentage"`
		MinCancelHours int `json:"minimum_notice_hours"`
	} `json:"cancellation_policy"`
}

type Bill struct { // insipired by razor pay's fields
	Base
	BillNumber     string `json:"bill_number" gorm:"uniqueIndex"`
	AppointmentID  uint   `json:"appointment_id" gorm:"index"`
	PrescriptionID *uint  `json:"prescription_id" gorm:"index"`
	PatientID      uint   `json:"patient_id" gorm:"index"`
	DoctorID       uint   `json:"doctor_id" gorm:"index"`

	SubTotal       float64 `json:"sub_total"`
	TaxAmount      float64 `json:"tax_amount"`
	DiscountAmount float64 `json:"discount_amount"`
	TotalAmount    float64 `json:"total_amount"`
	PaidAmount     float64 `json:"paid_amount"`
	DueAmount      float64 `json:"due_amount"`
	Currency       string  `json:"currency" gorm:"default:'INR'"`

	Items          []BillItem `json:"items" gorm:"serializer:json"` // Use serializer tag for SQLite
	Status         BillStatus `json:"status" gorm:"type:varchar(20)"`
	DueDate        time.Time  `json:"due_date"`
	BillingAddress Address    `json:"billing_address" gorm:"type:jsonb"`
	Notes          string     `json:"notes" gorm:"type:text"`

	PaymentMethod  string          `json:"payment_method"`           // Change from PaymentMethod to string
	PaymentDetails json.RawMessage `json:"payment_details" gorm:"-"` // Use gorm:"-" to handle manually
	PaymentDate    *time.Time      `json:"payment_date"`
	TransactionID  string          `json:"transaction_id"`

	RefundStatus RefundStatus `json:"refund_status"`
	RefundAmount float64      `json:"refund_amount"`
	RefundDate   *time.Time   `json:"refund_date"`
	RefundReason string       `json:"refund_reason"`
	RefundTxnID  string       `json:"refund_transaction_id"`

	TaxInfo TaxInfo `json:"tax_info" gorm:"type:jsonb"`

	// Metadata
	IssuedAt      time.Time  `json:"issued_at"`
	PaidAt        *time.Time `json:"paid_at"`
	CancelledAt   *time.Time `json:"cancelled_at"`
	CancelledBy   *uint      `json:"cancelled_by"`
	LastReminder  *time.Time `json:"last_reminder"`
	ReminderCount int        `json:"reminder_count" gorm:"default:0"`
}

func (Bill) TableName() string {
	return "bills"
}

func (b *Bill) AfterFind(tx *gorm.DB) error {
	var rawData struct {
		PaymentDetails string `gorm:"column:payment_details"`
	}
	if err := tx.Model(b).Select("payment_details").Scan(&rawData).Error; err != nil {
		return err
	}
	if rawData.PaymentDetails != "" {
		b.PaymentDetails = json.RawMessage(rawData.PaymentDetails)
	}
	return nil
}

type BillItem struct {
	Description string  `json:"description"`
	Category    string  `json:"category"` // Consultation/Medicine/Test/Other
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	TotalPrice  float64 `json:"total_price"`
	TaxRate     float64 `json:"tax_rate"`
	TaxAmount   float64 `json:"tax_amount"`
	Discount    float64 `json:"discount"`
}

type BankAccount struct {
	ID            string    `json:"id"`
	AccountName   string    `json:"account_name"`
	BankName      string    `json:"bank_name"`
	AccountNumber string    `json:"account_number"`
	IFSCCode      string    `json:"ifsc_code"`
	BranchName    string    `json:"branch_name"`
	AccountType   string    `json:"account_type"`
	IsDefault     bool      `json:"is_default"`
	IsVerified    bool      `json:"is_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type UPIID struct {
	ID         string    `json:"id"`
	UPIID      string    `json:"upi_id"`
	IsDefault  bool      `json:"is_default"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type PaymentSettings struct {
	AcceptedMethods map[string]struct {
		Enabled              bool `json:"enabled"`
		RequiresVerification bool `json:"requires_verification"`
	} `json:"accepted_methods"`
	DefaultMethod    string `json:"default_method"`
	AutomaticInvoice bool   `json:"automatic_invoice"`
	PaymentReminders bool   `json:"payment_reminders"`
	RefundPolicy     struct {
		Allowed     bool `json:"allowed"`
		WindowHours int  `json:"window_hours"`
	} `json:"refund_policy"`
}

type TaxInfo struct {
	GSTIN        string  `json:"gstin"`
	PAN          string  `json:"pan"`
	TaxRate      float64 `json:"tax_rate"`
	IsRegistered bool    `json:"is_registered"`
}

type PaymentDetails struct {
	Method        PaymentMethod `json:"method"`
	Status        string        `json:"status"`
	TransactionID string        `json:"transaction_id"`
	PayerName     string        `json:"payer_name"`
	PayerContact  string        `json:"payer_contact"`
	BankName      string        `json:"bank_name,omitempty"`
	BankRefNo     string        `json:"bank_ref_no,omitempty"`
	UPIID         string        `json:"upi_id,omitempty"`
	CardLast4     string        `json:"card_last4,omitempty"`
	CardNetwork   string        `json:"card_network,omitempty"`
	Notes         string        `json:"notes,omitempty"`
}

type Address struct {
	Street     string `json:"street"`
	City       string `json:"city"`
	State      string `json:"state"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
}

type BillRequest struct {
	Items []struct {
		Description string  `json:"description"`
		Category    string  `json:"category"`
		Quantity    int     `json:"quantity"`
		UnitPrice   float64 `json:"unit_price"`
		TaxRate     float64 `json:"tax_rate"`
	} `json:"items" validate:"required,min=1"`
	PaymentMethod  string  `json:"payment_method" validate:"required,oneof=UPI CARD CASH BANK_TRANSFER"`
	DueDate        string  `json:"due_date" validate:"required"`
	Notes          string  `json:"notes"`
	DiscountAmount float64 `json:"discount_amount"`
	TaxRate        float64 `json:"tax_rate"`
}
