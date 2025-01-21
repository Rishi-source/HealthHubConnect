package repositories

import (
	"HealthHubConnect/internal/models"
	"context"

	"gorm.io/gorm"
)

type PrescriptionRepository struct {
	db *gorm.DB
}

func NewPrescriptionRepository(db *gorm.DB) *PrescriptionRepository {
	return &PrescriptionRepository{db: db}
}

func (r *PrescriptionRepository) Create(ctx context.Context, prescription *models.Prescription) error {
	return r.db.WithContext(ctx).Create(prescription).Error
}

func (r *PrescriptionRepository) GetByAppointmentID(ctx context.Context, appointmentID uint) (*models.Prescription, error) {
	var prescription models.Prescription
	err := r.db.WithContext(ctx).Where("appointment_id = ?", appointmentID).First(&prescription).Error
	return &prescription, err
}

// Add more repository methods as needed
// ...existing code...
