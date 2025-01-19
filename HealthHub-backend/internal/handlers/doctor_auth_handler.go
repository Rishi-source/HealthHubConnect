package handlers

import (
	"log"
	"net/http"

	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
)

type DoctorHandler struct {
	userService *services.UserService
}

func NewDoctorHandler(userService *services.UserService) *DoctorHandler {
	return &DoctorHandler{userService: userService}
}

type DoctorSignUpRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Phone    int64  `json:"phone" validate:"required"`
}

func (h *DoctorHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req DoctorSignUpRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	user, err := h.userService.CreateUserWithRole(ctx, req.Name, req.Email, req.Password, req.Phone, models.RoleDoctor)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	// Send verification email explicitly
	if err := h.userService.SendVerificationEmail(user); err != nil {
		log.Printf("Failed to send verification email: %v", err)
	}

	GenerateResponse(&w, http.StatusCreated, map[string]interface{}{
		"user":    user,
		"message": "Please check your email for verification code",
	})
}

func (h *DoctorHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		log.Printf("Error parsing login request: %v", err)
		GenerateErrorResponse(&w, err)
		return
	}

	log.Printf("Login attempt for email: %s", req.Email)

	ctx := r.Context()
	user, tokens, err := h.userService.LoginWithRole(ctx, req.Email, req.Password, models.RoleDoctor)
	if err != nil {
		log.Printf("Login failed for email %s: %v", req.Email, err)
		GenerateErrorResponse(&w, err)
		return
	}

	log.Printf("Login successful for email: %s", req.Email)
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	})
}

type ResendOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

func (h *DoctorHandler) ResendOTP(w http.ResponseWriter, r *http.Request) {
	var req ResendOTPRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	if err := h.userService.ResendOTP(ctx, req.Email); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"message": "Verification code has been resent to your email",
	})
}
