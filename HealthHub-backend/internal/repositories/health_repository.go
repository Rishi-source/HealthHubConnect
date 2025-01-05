package repositories

import (
	"HealthHubConnect/internal/models"
	"context"

	e "HealthHubConnect/internal/errors"

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
	result := r.db.WithContext(ctx).Model(&models.HealthProfile{}).
		Where("user_id = ?", profile.UserID).
		Updates(profile)
	if result.Error != nil {
		return e.NewWrapperError(result.Error)
	}
	if result.RowsAffected == 0 {
		return e.NewObjectNotFoundError("health profile")
	}
	return nil
}

func (r *HealthRepository) DeleteHealthProfile(ctx context.Context, userID uint) error {
	result := r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.HealthProfile{})
	if result.Error != nil {
		return e.NewWrapperError(result.Error)
	}
	return nil
}
