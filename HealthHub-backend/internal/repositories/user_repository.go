package repositories

import (
	"HealthHubConnect/internal/models"
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (ur *UserRepository) CreateUser(user *models.User, ctx context.Context) error {
	result := ur.db.WithContext(ctx).Create(user)
	if result.Error != nil {
		return fmt.Errorf("failed to create user: %w", result.Error)
	}
	return nil
}

func (ur *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := ur.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (ur *UserRepository) UpdateUser(user *models.User, ctx context.Context) error {
	result := ur.db.WithContext(ctx).Save(user)
	if result.Error != nil {
		return fmt.Errorf("failed to update user: %w", result.Error)
	}
	return nil
}

func (ur *UserRepository) FindByResetToken(ctx context.Context, token string) (*models.User, error) {
	var user models.User
	err := ur.db.WithContext(ctx).Where("reset_token = ?", token).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (ur *UserRepository) FindByID(ctx context.Context, id uint) (*models.User, error) {
	var user models.User
	err := ur.db.WithContext(ctx).
		Preload("HealthProfile").
		Preload("HealthProfile.Allergy").
		Preload("HealthProfile.Medication").
		Preload("HealthProfile.VitalSign").
		First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// VerifyUsers checks if both users exist in the database
func (r *UserRepository) VerifyUsers(ctx context.Context, userID1, userID2 uint) error {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.User{}).
		Where("id IN ?", []uint{userID1, userID2}).
		Count(&count).Error

	if err != nil {
		return err
	}

	if count != 2 {
		return errors.New("one or both users not found")
	}

	return nil
}
