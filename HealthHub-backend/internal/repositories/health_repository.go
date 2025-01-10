package repositories

import (
	"HealthHubConnect/internal/models"
	"context"

	e "HealthHubConnect/internal/errors"

	"time"

	"gorm.io/gorm"
)

type HealthRepository struct {
	db *gorm.DB
}

func NewHealthRepository(db *gorm.DB) *HealthRepository {
	return &HealthRepository{db: db}
}

func (r *HealthRepository) CreateHealthProfile(ctx context.Context, profile *models.HealthProfile) error {
	result := r.db.WithContext(ctx).Create(profile)
	if result.Error != nil {
		return e.NewWrapperError(result.Error)
	}
	return nil
}

func (r *HealthRepository) GetHealthProfile(ctx context.Context, userID uint) (*models.HealthProfile, error) {
	var profile models.HealthProfile
	err := r.db.WithContext(ctx).
		Preload("EmergencyContacts").
		Preload("Allergy").
		Preload("Medication").
		Preload("VitalSign").
		Where("user_id = ?", userID).
		First(&profile).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, e.NewObjectNotFoundError("health profile")
		}
		return nil, e.NewWrapperError(err)
	}
	return &profile, nil
}

func (r *HealthRepository) UpdateHealthProfile(ctx context.Context, profile *models.HealthProfile) error {
	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return e.NewWrapperError(tx.Error)
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Model(profile).Updates(map[string]interface{}{
		"blood_type":    profile.BloodType,
		"height":        profile.Height,
		"weight":        profile.Weight,
		"gender":        profile.Gender,
		"date_of_birth": profile.DateOfBirth,
		"street":        profile.Street,
		"city":          profile.City,
		"state":         profile.State,
		"postal_code":   profile.PostalCode,
		"country":       profile.Country,
		"last_updated":  time.Now(),
	}).Error; err != nil {
		tx.Rollback()
		return e.NewWrapperError(err)
	}

	if len(profile.EmergencyContacts) > 0 {
		for i := range profile.EmergencyContacts {
			profile.EmergencyContacts[i].UserID = profile.UserID
		}
		if err := tx.Create(&profile.EmergencyContacts).Error; err != nil {
			tx.Rollback()
			return e.NewWrapperError(err)
		}
	}

	if len(profile.Allergy) > 0 {
		for i := range profile.Allergy {
			profile.Allergy[i].UserID = profile.UserID
		}
		if err := tx.Create(&profile.Allergy).Error; err != nil {
			tx.Rollback()
			return e.NewWrapperError(err)
		}
	}

	if len(profile.Medication) > 0 {
		for i := range profile.Medication {
			profile.Medication[i].UserID = profile.UserID
		}
		if err := tx.Create(&profile.Medication).Error; err != nil {
			tx.Rollback()
			return e.NewWrapperError(err)
		}
	}

	if len(profile.VitalSign) > 0 {
		for i := range profile.VitalSign {
			profile.VitalSign[i].UserID = profile.UserID
		}
		if err := tx.Create(&profile.VitalSign).Error; err != nil {
			tx.Rollback()
			return e.NewWrapperError(err)
		}
	}

	return tx.Commit().Error
}

func (r *HealthRepository) DeleteHealthProfile(ctx context.Context, userID uint) error {
	result := r.db.WithContext(ctx).
		Model(&models.HealthProfile{}).
		Where("user_id = ?", userID).
		Update("deleted_at", gorm.DeletedAt{})
	if result.Error != nil {
		return e.NewWrapperError(result.Error)
	}
	return nil
}

func (r *HealthRepository) CreateVitalSign(ctx context.Context, vitalSign *models.VitalSign) error {
	result := r.db.WithContext(ctx).Create(vitalSign)
	if result.Error != nil {
		return e.NewWrapperError(result.Error)
	}
	return nil
}

func (r *HealthRepository) GetVitalSigns(ctx context.Context, userID uint) ([]models.VitalSign, error) {
	var vitalSigns []models.VitalSign
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&vitalSigns).Error
	if err != nil {
		return nil, e.NewWrapperError(err)
	}
	return vitalSigns, nil
}

func (r *HealthRepository) CreateMedication(ctx context.Context, medication *models.Medication) error {
	result := r.db.WithContext(ctx).Create(medication)
	if result.Error != nil {
		return e.NewWrapperError(result.Error)
	}
	return nil
}

func (r *HealthRepository) GetMedications(ctx context.Context, userID uint) ([]models.Medication, error) {
	var medications []models.Medication
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&medications).Error
	if err != nil {
		return nil, e.NewWrapperError(err)
	}
	return medications, nil
}
