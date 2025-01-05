package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"HealthHubConnect/env"
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/utils"
)

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

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

	resetOTP := utils.GenerateResetOTP()
	user.ResetToken = resetOTP
	user.ResetTokenExpiry = time.Now().Add(24 * time.Hour)

	if err := s.userRepo.CreateUser(user, ctx); err != nil {
		log.Printf("Error creating user: %v", err)
		return nil, err
	}

	// Send verification email with OTP
	subject := "Email Verification OTP - HealthHub"
	body := fmt.Sprintf(`Dear %s,

Welcome to HealthHub! Please verify your email using the following OTP:

%s

This OTP will expire in 24 Hours.

For security reasons, DO NOT share this OTP with anyone.

Best regards,
HealthHub Team`, user.Name, resetOTP)

	if err := utils.SendEmail(email, subject, body); err != nil {
		log.Printf("Failed to send verification email: %v", err)
	}

	user.PasswordHash = ""
	return user, nil
}

func (s *UserService) RefreshUserToken(ctx context.Context, refreshToken string) (*models.User, utils.TokenPair, error) {
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

	user.PasswordHash = ""
	return user, tokenPair, nil
}

func (s *UserService) Login(ctx context.Context, email, password string) (*models.User, utils.TokenPair, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid email or password")
	}

	err = utils.ComparePassword(password, user.PasswordHash)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid email or password")
	}

	tokenPair, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	user.LastLogin = time.Now()
	if err := s.userRepo.UpdateUser(user, ctx); err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	user.PasswordHash = ""
	return user, tokenPair, nil
}

func (s *UserService) VerifyOTP(ctx context.Context, email, otp string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return e.NewValidationError("invalid email")
	}
	if len(otp) != 6 || !utils.IsNumeric(otp) {
		return e.NewValidationError("invalid OTP format - must be 6 digits")
	}

	if user.ResetToken != otp {
		return e.NewValidationError("invalid OTP")
	}

	if time.Now().After(user.ResetTokenExpiry) {
		return e.NewValidationError("OTP has expired")
	}

	user.EmailVerified = true
	user.ResetToken = ""
	user.ResetTokenExpiry = time.Time{}

	return s.userRepo.UpdateUser(user, ctx)
}

func (s *UserService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return e.NewValidationError("email not found")
	}

	resetOTP := utils.GenerateResetOTP()
	user.ResetToken = resetOTP
	user.ResetTokenExpiry = time.Now().Add(15 * time.Minute)

	if err := s.userRepo.UpdateUser(user, ctx); err != nil {
		return e.NewInternalError()
	}

	// Send reset email with OTP
	subject := "Password Reset OTP - HealthHub"
	body := fmt.Sprintf(`Dear %s,

You have requested to reset your password. Your 6-digit OTP is:

%s

This OTP will expire in 15 minutes.

For security reasons, DO NOT share this OTP with anyone.
If you did not request this password reset, please ignore this email.

Best regards,
HealthHub Team`, user.Name, resetOTP)

	if err := utils.SendEmail(email, subject, body); err != nil {
		return fmt.Errorf("failed to send reset email: %v", err)
	}

	return nil
}

func (s *UserService) ResetPassword(ctx context.Context, email, otp, newPassword string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return e.NewValidationError("invalid email")
	}

	// Add OTP format validation
	if len(otp) != 6 || !utils.IsNumeric(otp) {
		return e.NewValidationError("invalid OTP format - must be 6 digits")
	}

	// Verify OTP
	if user.ResetToken != otp {
		return e.NewValidationError("invalid OTP")
	}

	if time.Now().After(user.ResetTokenExpiry) {
		return e.NewValidationError("OTP has expired")
	}

	// Validate new password
	if err := utils.ValidatePassword(newPassword); err != nil {
		return fmt.Errorf("invalid password: %w", err)
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

func (s *UserService) HandleGoogleCallback(ctx context.Context, code string) (*models.User, utils.TokenPair, error) {

	token, err := env.GoogleOAuthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	// user info from Google
	userInfo, err := s.getGoogleUserInfo(token.AccessToken)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	user, err := s.userRepo.FindByEmail(ctx, userInfo.Email)
	if err != nil {
		user = &models.User{
			Email:          userInfo.Email,
			Name:           userInfo.Name,
			ProfilePicture: userInfo.Picture,
			EmailVerified:  userInfo.VerifiedEmail,
			IsActive:       true,
			AuthProvider:   "google",
		}

		if err := s.userRepo.CreateUser(user, ctx); err != nil {
			return nil, utils.TokenPair{}, e.NewInternalError()
		}
	}

	tokenPair, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewInternalError()
	}

	return user, tokenPair, nil
}

func (s *UserService) getGoogleUserInfo(accessToken string) (*GoogleUserInfo, error) {
	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var userInfo GoogleUserInfo
	if err := json.Unmarshal(data, &userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}
