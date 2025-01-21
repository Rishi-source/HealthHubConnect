package repositories

import (
	"HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"context"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type PrescriptionRepository struct {
	db *gorm.DB
}

func NewPrescriptionRepository(db *gorm.DB) *PrescriptionRepository {
	return &PrescriptionRepository{db: db}
}

func (r *PrescriptionRepository) Create(ctx context.Context, prescription *models.Prescription) error {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Check for existing prescription
		var exists bool
		if err := tx.Model(&models.Prescription{}).
			Where("appointment_id = ?", prescription.AppointmentID).
			Select("count(*) > 0").
			Scan(&exists).Error; err != nil {
			return err
		}

		if exists {
			return errors.NewBadRequestError("prescription already exists for this appointment")
		}

		// Marshal JSON fields
		diagnosisJSON, err := json.Marshal(prescription.Diagnosis)
		if err != nil {
			return err
		}
		complaintsJSON, err := json.Marshal(prescription.ChiefComplaints)
		if err != nil {
			return err
		}
		vitalsJSON, err := json.Marshal(prescription.Vitals)
		if err != nil {
			return err
		}
		medsJSON, err := json.Marshal(prescription.Medications)
		if err != nil {
			return err
		}
		investigationsJSON, err := json.Marshal(prescription.Investigations)
		if err != nil {
			return err
		}
		followUpJSON, err := json.Marshal(prescription.FollowUp)
		if err != nil {
			return err
		}
		historyJSON, err := json.Marshal(prescription.PatientHistory)
		if err != nil {
			return err
		}

		// Create prescription with JSON strings
		result := tx.Exec(`
            INSERT INTO prescriptions (
                appointment_id, patient_id, doctor_id,
                diagnosis, chief_complaints, vitals,
                medications, investigations, advice,
                follow_up, status, expiry_date,
                doctor_notes, is_digitally_signed,
                signed_at, patient_history,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
			prescription.AppointmentID,
			prescription.PatientID,
			prescription.DoctorID,
			string(diagnosisJSON),
			string(complaintsJSON),
			string(vitalsJSON),
			string(medsJSON),
			string(investigationsJSON),
			prescription.Advice,
			string(followUpJSON),
			prescription.Status,
			prescription.ExpiryDate,
			prescription.DoctorNotes,
			prescription.IsDigitallySigned,
			prescription.SignedAt,
			string(historyJSON),
			time.Now(),
			time.Now(),
		)

		return result.Error
	})

	return err
}

func (r *PrescriptionRepository) GetByAppointmentID(ctx context.Context, appointmentID uint) (*models.Prescription, error) {
	var prescription models.Prescription
	var rawData struct {
		models.Base
		AppointmentID      uint       `gorm:"column:appointment_id"`
		PatientID          uint       `gorm:"column:patient_id"`
		DoctorID           uint       `gorm:"column:doctor_id"`
		DiagnosisJSON      string     `gorm:"column:diagnosis"`
		ComplaintsJSON     string     `gorm:"column:chief_complaints"`
		VitalsJSON         string     `gorm:"column:vitals"`
		MedicationsJSON    string     `gorm:"column:medications"`
		InvestigationsJSON string     `gorm:"column:investigations"`
		Advice             string     `gorm:"column:advice"`
		FollowUpJSON       string     `gorm:"column:follow_up"`
		Status             string     `gorm:"column:status"`
		ExpiryDate         *time.Time `gorm:"column:expiry_date"`
		DoctorNotes        string     `gorm:"column:doctor_notes"`
		IsDigitallySigned  bool       `gorm:"column:is_digitally_signed"`
		SignedAt           *time.Time `gorm:"column:signed_at"`
		PatientHistoryJSON string     `gorm:"column:patient_history"`
	}

	err := r.db.WithContext(ctx).
		Table("prescriptions").
		Where("appointment_id = ?", appointmentID).
		First(&rawData).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("prescription not found")
		}
		return nil, err
	}

	// Copy non-JSON fields
	prescription.Base = rawData.Base
	prescription.AppointmentID = rawData.AppointmentID
	prescription.PatientID = rawData.PatientID
	prescription.DoctorID = rawData.DoctorID
	prescription.Advice = rawData.Advice
	prescription.Status = models.PrescriptionStatus(rawData.Status)
	prescription.ExpiryDate = rawData.ExpiryDate
	prescription.DoctorNotes = rawData.DoctorNotes
	prescription.IsDigitallySigned = rawData.IsDigitallySigned
	prescription.SignedAt = rawData.SignedAt

	// Unmarshal JSON fields
	json.Unmarshal([]byte(rawData.DiagnosisJSON), &prescription.Diagnosis)
	json.Unmarshal([]byte(rawData.ComplaintsJSON), &prescription.ChiefComplaints)
	json.Unmarshal([]byte(rawData.VitalsJSON), &prescription.Vitals)
	json.Unmarshal([]byte(rawData.MedicationsJSON), &prescription.Medications)
	json.Unmarshal([]byte(rawData.InvestigationsJSON), &prescription.Investigations)
	json.Unmarshal([]byte(rawData.FollowUpJSON), &prescription.FollowUp)
	json.Unmarshal([]byte(rawData.PatientHistoryJSON), &prescription.PatientHistory)

	return &prescription, nil
}

func (r *PrescriptionRepository) Update(ctx context.Context, appointmentID uint, prescription *models.Prescription) error {
	result := r.db.WithContext(ctx).
		Where("appointment_id = ?", appointmentID).
		Updates(prescription)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.NewNotFoundError("prescription not found")
	}

	return nil
}
