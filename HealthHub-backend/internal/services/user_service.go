package services

import (
	"context"
	"fmt"
	"log"

	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/utils"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService(userRepo *repositories.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (s *UserService) CreateUser(ctx context.Context, name, email, password string, phone int64) (*models.User, error) {

	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err == nil && existingUser != nil {
		return nil, e.NewDuplicateResourceError(email)
	}

	// Validate inputs
	if err := utils.ValidateEmail(email); err != nil {
		return nil, fmt.Errorf("invalid email: %w", err)
	}

	if err := utils.ValidatePassword(password); err != nil {
		return nil, fmt.Errorf("invalid password: %w", err)
	}
	if err := utils.ValidatePhone(phone); err != nil {
		return nil, fmt.Errorf("invalid phone: %w", err)
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return nil, fmt.Errorf("internal server error")
	}

	user := &models.User{
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		Phone:        phone,
	}

	if err := s.userRepo.CreateUser(user, ctx); err != nil {
		log.Printf("Error creating user: %v", err)
		return nil, err
	}

	user.PasswordHash = ""
	return user, nil
}
