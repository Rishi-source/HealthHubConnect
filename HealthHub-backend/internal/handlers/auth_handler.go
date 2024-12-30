package handlers

import (
	"fmt"
	"net/http"
	"strings"

	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/utils"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

type SignUpRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Phone    int64  `json:"phone" validate:"required"`
}

func (h *UserHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignUpRequest

	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid request body"))
		return
	}

	// Log the received request for debugging
	fmt.Printf("Received signup request: %+v", req)

	if err := ValidateSignUpRequest(req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	user, err := h.userService.CreateUser(ctx, req.Name, req.Email, req.Password, req.Phone)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	response := map[string]interface{}{
		"user": user,
	}
	GenerateResponse(&w, http.StatusCreated, response)
}

func ValidateSignUpRequest(req SignUpRequest) error {
	if req.Name == "" {
		return e.NewValidationError("name is required")
	}
	if req.Email == "" {
		return e.NewValidationError("email is required")
	}
	if req.Password == "" {
		return e.NewValidationError("password is required")
	}
	if req.Phone == 0 {
		return e.NewValidationError("phone is required")
	}

	return nil
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	// Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	user, tokens, err := h.userService.Login(ctx, req.Email, req.Password)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	response := map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	}
	GenerateResponse(&w, http.StatusOK, response)
}

func (h *UserHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	if err := h.userService.ForgotPassword(ctx, req.Email); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "password reset instructions sent to email",
	})
}

func (h *UserHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		response := e.CustomError{
			Message:    "Authorization Header required",
			ErrorCode:  "MISSING_AUTH_HEADER",
			StatusCode: http.StatusUnauthorized,
		}
		http.Error(w, response.Message, response.StatusCode)
		return
	}
	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		http.Error(w, "Unauthorized: Invalid Token Format", http.StatusUnauthorized)
		return
	}

	token := tokenParts[1]
	ctx := r.Context()
	if err := h.userService.ResetPassword(ctx, token, req.NewPassword); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "password reset successful",
	})
}

func (h *UserHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	refreshToken := r.Header.Get("Refresh-Token")
	if refreshToken == "" {
		GenerateErrorResponse(&w, e.NewValidationError("refresh token required"))
		return
	}

	// ctx := r.Context()
	TokenPair, err := utils.RefreshAccessTokens(refreshToken)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	response := map[string]interface{}{
		"tokens": TokenPair,
	}
	GenerateResponse(&w, http.StatusOK, response)
}
