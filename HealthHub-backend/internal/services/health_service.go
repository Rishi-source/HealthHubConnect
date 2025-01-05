package services

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"context"
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

	_, err := s.healthRepo.GetHealthProfile(ctx, profile.UserID)
	if err != nil {
		return e.NewObjectNotFoundError("health profile")
	}

	return s.healthRepo.UpdateHealthProfile(ctx, profile)
}

func (s *HealthService) DeleteHealthProfile(ctx context.Context, userID uint) error {
	return s.healthRepo.DeleteHealthProfile(ctx, userID)
}
