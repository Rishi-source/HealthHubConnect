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

func (s *UserService) createUserCommon(ctx context.Context, name, email, password string, phone int64, role models.UserRole) (*models.User, error) {
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
		Role:         role,
	}

	resetOTP := utils.GenerateResetOTP()
	user.ResetToken = resetOTP
	user.ResetTokenExpiry = time.Now().Add(24 * time.Hour)

	if err := s.userRepo.CreateUser(user, ctx); err != nil {
		log.Printf("Error creating user: %v", err)
		return nil, err
	}

	user.PasswordHash = ""
	return user, nil
}

func (s *UserService) CreateUser(ctx context.Context, name, email, password string, phone int64) (*models.User, error) {
	return s.createUserCommon(ctx, name, email, password, phone, models.RolePatient)
}

func (s *UserService) CreateUserWithRole(ctx context.Context, name, email, password string, phone int64, role models.UserRole) (*models.User, error) {
	return s.createUserCommon(ctx, name, email, password, phone, role)
}

func (s *UserService) validateLogin(ctx context.Context, email, password string) (*models.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		log.Printf("Login attempt failed: email not found: %s", email)
		return nil, e.NewValidationError("invalid email or password")
	}

	// Add debug logging
	log.Printf("Comparing passwords for user: %s", email)
	if err := utils.ComparePassword(password, user.PasswordHash); err != nil {
		log.Printf("Password comparison failed for user %s: %v", email, err)
		return nil, e.NewValidationError("invalid email or password")
	}

	return user, nil
}

func (s *UserService) Login(ctx context.Context, email, password string) (*models.User, utils.TokenPair, error) {
	user, err := s.validateLogin(ctx, email, password)
	if err != nil {
		return nil, utils.TokenPair{}, err
	}

	return s.finalizeLogin(ctx, user)
}

func (s *UserService) LoginWithRole(ctx context.Context, email, password string, role models.UserRole) (*models.User, utils.TokenPair, error) {
	user, err := s.validateLogin(ctx, email, password)
	if err != nil {
		return nil, utils.TokenPair{}, err
	}

	if user.Role != role {
		return nil, utils.TokenPair{}, e.NewValidationError("unauthorized access: invalid role")
	}

	return s.finalizeLogin(ctx, user)
}

func (s *UserService) finalizeLogin(ctx context.Context, user *models.User) (*models.User, utils.TokenPair, error) {
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

func (s *UserService) sendVerificationEmail(email, name, otp string) {
	subject := "Email Verification OTP - HealthHub"
	body := fmt.Sprintf(`Dear %s,

Welcome to HealthHub! Please verify your email using the following OTP:

%s

This OTP will expire in 24 Hours.

For security reasons, DO NOT share this OTP with anyone.

Best regards,
HealthHub Team`, name, otp)

	if err := utils.SendEmail(email, subject, body); err != nil {
		log.Printf("Failed to send verification email: %v", err)
	}
}

func (s *UserService) RefreshUserToken(ctx context.Context, refreshToken string) (*models.User, utils.TokenPair, error) {
	tokenPair, err := utils.RefreshAccessTokens(refreshToken)
	if err != nil {
		return nil, utils.TokenPair{}, e.NewValidationError("invalid refresh token")
	}

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

	if len(otp) != 6 || !utils.IsNumeric(otp) {
		return e.NewValidationError("invalid OTP format - must be 6 digits")
	}

	if user.ResetToken != otp {
		return e.NewValidationError("invalid OTP")
	}

	if time.Now().After(user.ResetTokenExpiry) {
		return e.NewValidationError("OTP has expired")
	}

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

func (s *UserService) ResendOTP(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return e.NewValidationError("email not found")
	}

	if user.EmailVerified {
		return e.NewValidationError("email already verified")
	}

	resetOTP := utils.GenerateResetOTP()
	user.ResetToken = resetOTP
	user.ResetTokenExpiry = time.Now().Add(24 * time.Hour)

	if err := s.userRepo.UpdateUser(user, ctx); err != nil {
		return e.NewInternalError()
	}

	subject := "Email Verification OTP - HealthHub"
	body := fmt.Sprintf(`Dear %s,

Welcome to HealthHub! Please verify your email using the following OTP:

%s

This OTP will expire in 24 Hours.

For security reasons, DO NOT share this OTP with anyone.

Best regards,
HealthHub Team`, user.Name, resetOTP)

	if err := utils.SendEmail(email, subject, body); err != nil {
		return fmt.Errorf("failed to send verification email: %v", err)
	}

	return nil
}

// Add this new method
func (s *UserService) SendVerificationEmail(user *models.User) error {
	if user.EmailVerified {
		return e.NewValidationError("email already verified")
	}

	resetOTP := utils.GenerateResetOTP()
	user.ResetToken = resetOTP
	user.ResetTokenExpiry = time.Now().Add(24 * time.Hour)

	if err := s.userRepo.UpdateUser(user, context.Background()); err != nil {
		return e.NewInternalError()
	}

	subject := "Doctor Account Verification - HealthHub"
	body := fmt.Sprintf(`Dear Dr. %s,

Thank you for registering with HealthHub! Please verify your email using the following OTP:

%s

This OTP will expire in 24 Hours.

For security reasons, DO NOT share this OTP with anyone.

Best regards,
HealthHub Team`, user.Name, resetOTP)

	return utils.SendEmail(user.Email, subject, body)
}
