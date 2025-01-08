package handlers

import (
	"fmt"
	"net/http"
	"net/url"

	"HealthHubConnect/env"
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

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Email       string `json:"email" validate:"required,email"`
	OTP         string `json:"otp" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

type VerifyOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required"`
}

func (h *UserHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignUpRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	user, err := h.userService.CreateUser(ctx, req.Name, req.Email, req.Password, req.Phone)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, map[string]interface{}{
		"user": user,
	})
}

func (h *UserHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var req VerifyOTPRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	err := h.userService.VerifyOTP(ctx, req.Email, req.OTP)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"message": "email verified",
	})
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

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	})
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

	ctx := r.Context()
	if err := h.userService.ResetPassword(ctx, req.Email, req.OTP, req.NewPassword); err != nil {
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

func (h *UserHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := env.GoogleOAuthConfig.AuthCodeURL(env.OAuthStateString)
	GenerateResponse(&w, http.StatusOK, map[string]string{
		"url": url,
	})
}

func (h *UserHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	if state != env.OAuthStateString {
		redirectURL := fmt.Sprintf("%s?error=%s",
			env.OAuthRedirects.ErrorRedirect,
			"invalid_state")
		http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		redirectURL := fmt.Sprintf("%s?error=%s",
			env.OAuthRedirects.ErrorRedirect,
			"missing_code")
		http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
		return
	}

	ctx := r.Context()
	user, tokens, err := h.userService.HandleGoogleCallback(ctx, code)
	if err != nil {
		redirectURL := fmt.Sprintf("%s?error=%s",
			env.OAuthRedirects.ErrorRedirect,
			url.QueryEscape(err.Error()))
		http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
		return
	}

	baseRedirect := env.OAuthRedirects.ExistingUserRedirect
	if user.IsNewUser {
		baseRedirect = env.OAuthRedirects.NewUserRedirect
	}

	redirectURL := fmt.Sprintf("%s?access_token=%s&refresh_token=%s&is_new_user=%t",
		baseRedirect,
		url.QueryEscape(tokens.AccessToken),
		url.QueryEscape(tokens.RefreshToken),
		user.IsNewUser)

	w.Header().Set("Access-Control-Allow-Origin", env.FrontendConfig.BaseURL)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

func (h *UserHandler) ResendOTP(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	if err := h.userService.ResendOTP(ctx, req.Email); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "otp resent",
	})
}
