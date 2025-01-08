package handlers

import (
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

	GenerateResponse(&w, http.StatusCreated, map[string]interface{}{
		"user": user,
	})
}

func (h *DoctorHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	ctx := r.Context()
	user, tokens, err := h.userService.LoginWithRole(ctx, req.Email, req.Password, models.RoleDoctor)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	})
}
