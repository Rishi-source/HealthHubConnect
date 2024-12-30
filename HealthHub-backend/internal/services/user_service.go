package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"HealthHubConnect/env"
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

// Add this new method
func (s *UserService) RefreshUserToken(ctx context.Context, refreshToken string) (*models.User, utils.TokenPair, error) {
	// Get new token pair
	tokenPair, err := utils.RefreshAccessTokens(refreshToken)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid refresh token")
	}

	// Get user details
	userID, err := utils.ExtractUserIDFromToken(refreshToken, env.Jwt.RefreshTokenSecret)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid token")
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("user not found")
	}

	user.PasswordHash = "" // Clear sensitive data
	return user, tokenPair, nil
}

// Update Login method to use token pair
func (s *UserService) Login(ctx context.Context, email, password string) (*models.User, utils.TokenPair, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid email or password")
	}

	err = utils.ComparePassword(password, user.PasswordHash)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid email or password")
	}

	// Generate token pair
	tokenPair, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	// Update last login
	user.LastLogin = time.Now()
	if err := s.userRepo.UpdateUser(user, ctx); err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	user.PasswordHash = "" // Clear password before returning
	return user, tokenPair, nil
}

func (s *UserService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return e.NewValidationError("email not found")
	}

	resetToken := utils.GenerateResetToken()
	user.ResetToken = resetToken
	user.ResetTokenExpiry = time.Now().Add(15 * time.Minute)
	// fmt.Println(resetToken)

	if err := s.userRepo.UpdateUser(user, ctx); err != nil {
		return e.NewInternalError()
	}

	// TODO: Send reset email with token
	return nil
}

func (s *UserService) ResetPassword(ctx context.Context, token, newPassword string) error {
	user, err := s.userRepo.FindByResetToken(ctx, token)
	if err != nil {
		return e.NewValidationError("invalid or expired reset token")
	}

	if time.Now().After(user.ResetTokenExpiry) {
		return e.NewValidationError("reset token expired")
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return e.NewInternalError()
	}

	user.PasswordHash = hashedPassword
	user.ResetToken = ""
	user.ResetTokenExpiry = time.Time{}

	return s.userRepo.UpdateUser(user, ctx)
}
