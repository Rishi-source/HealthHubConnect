package services

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"context"
	"time"
)

type HealthService struct {
	healthRepo *repositories.HealthRepository
}

func NewHealthService(healthRepo *repositories.HealthRepository) *HealthService {
	return &HealthService{
		healthRepo: healthRepo,
	}
}

func (s *HealthService) CreateHealthProfile(ctx context.Context, profile *models.HealthProfile) error {
	if profile.UserID == 0 {
		return e.NewValidationError("user ID is required")
	}

	return s.healthRepo.CreateHealthProfile(ctx, profile)
}

func (s *HealthService) GetHealthProfile(ctx context.Context, userID uint) (*models.HealthProfile, error) {
	profile, err := s.healthRepo.GetHealthProfile(ctx, userID)
	if err != nil {
		return nil, e.NewObjectNotFoundError("health profile")
	}
	return profile, nil
}

func (s *HealthService) UpdateHealthProfile(ctx context.Context, profile *models.HealthProfile) error {
	if profile.UserID == 0 {
		return e.NewInvalidParamError("user_id")
	}

	// Check if profile exists
	existingProfile, err := s.healthRepo.GetHealthProfile(ctx, profile.UserID)
	if err != nil {
		// If profile doesn't exist, create a new one
		if _, ok := err.(*e.CustomError); ok && err.(*e.CustomError).ErrorCode == "NOT_FOUND" {
			return s.healthRepo.CreateHealthProfile(ctx, profile)
		}
		return err
	}

	// Preserve created_at timestamp
	profile.CreatedAt = existingProfile.CreatedAt
	profile.LastUpdated = time.Now()

	return s.healthRepo.UpdateHealthProfile(ctx, profile)
}

func (s *HealthService) DeleteHealthProfile(ctx context.Context, userID uint) error {
	return s.healthRepo.DeleteHealthProfile(ctx, userID)
}

func (s *HealthService) CreateVitalSign(ctx context.Context, vitalSign *models.VitalSign) error {
	if vitalSign.UserID == 0 {
		return e.NewValidationError("user ID is required")
	}

	return s.healthRepo.CreateVitalSign(ctx, vitalSign)
}

func (s *HealthService) GetVitalSign(ctx context.Context, userID uint) ([]models.VitalSign, error) {
	vitalSigns, err := s.healthRepo.GetVitalSigns(ctx, userID)
	if err != nil {
		return nil, e.NewObjectNotFoundError("vital signs")
	}
	return vitalSigns, nil
}

func (s *HealthService) CreateMedication(ctx context.Context, medication *models.Medication) error {
	if medication.UserID == 0 {
		return e.NewValidationError("user ID is required")
	}

	return s.healthRepo.CreateMedication(ctx, medication)
}

func (s *HealthService) GetMedications(ctx context.Context, userID uint) ([]models.Medication, error) {
	medications, err := s.healthRepo.GetMedications(ctx, userID)
	if err != nil {
		return nil, e.NewObjectNotFoundError("medications")
	}
	return medications, nil
}
