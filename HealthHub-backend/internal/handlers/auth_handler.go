package handlers

import (
	"net/http"

	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/services"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

type SignUpRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Phone    int64  `json:"phone"`
}

func (h *UserHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignUpRequest

	ParseRequestBody(w, r, &req)
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
