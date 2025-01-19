package repositories

import (
	"HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"context"

	"gorm.io/gorm"
)

type DoctorRepository struct {
	db *gorm.DB
}

func NewDoctorRepository(db *gorm.DB) *DoctorRepository {
	return &DoctorRepository{db: db}
}

func (r *DoctorRepository) ValidateDoctorAccess(ctx context.Context, userID uint) error {
	var user models.User
	err := r.db.WithContext(ctx).Select("role").First(&user, userID).Error
	if err != nil {
		return errors.NewNotAuthorizedError("user not found")
	}

	if user.Role != models.RoleDoctor {
		return errors.NewForbiddenError("access denied: doctor role required")
	}

	return nil
}

func (r *DoctorRepository) SaveProfile(ctx context.Context, profile *models.DoctorProfile) error {
	if err := r.ValidateDoctorAccess(ctx, profile.UserID); err != nil {
		return err
	}
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *DoctorRepository) GetProfile(ctx context.Context, userID uint) (*models.DoctorProfile, error) {
	if err := r.ValidateDoctorAccess(ctx, userID); err != nil {
		return nil, err
	}

	var profile models.DoctorProfile
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("doctor profile not found")
		}
		return nil, err
	}
	return &profile, nil
}

func (r *DoctorRepository) UpdateProfile(ctx context.Context, profile *models.DoctorProfile) error {
	if err := r.ValidateDoctorAccess(ctx, profile.UserID); err != nil {
		return err
	}

	var existingProfile models.DoctorProfile
	if err := r.db.WithContext(ctx).Where("user_id = ?", profile.UserID).First(&existingProfile).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return r.SaveProfile(ctx, profile)
		}
		return err
	}

	profile.ID = existingProfile.ID
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *DoctorRepository) DeleteProfile(ctx context.Context, userID uint) error {
	if err := r.ValidateDoctorAccess(ctx, userID); err != nil {
		return err
	}

	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.DoctorProfile{}).Error
}

func (r *DoctorRepository) SaveSchedule(ctx context.Context, schedule *models.DoctorSchedule) error {
	if err := r.ValidateDoctorAccess(ctx, schedule.DoctorID); err != nil {
		return err
	}

	var existing models.DoctorSchedule
	err := r.db.WithContext(ctx).Where("doctor_id = ?", schedule.DoctorID).First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		return r.db.WithContext(ctx).Create(schedule).Error
	}

	schedule.ID = existing.ID
	return r.db.WithContext(ctx).Save(schedule).Error
}

func (r *DoctorRepository) GetSchedule(ctx context.Context, doctorID uint) (*models.DoctorSchedule, error) {
	if err := r.ValidateDoctorAccess(ctx, doctorID); err != nil {
		return nil, err
	}

	var schedule models.DoctorSchedule
	err := r.db.WithContext(ctx).Where("doctor_id = ?", doctorID).First(&schedule).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("schedule not found")
		}
		return nil, err
	}

	return &schedule, nil
}
