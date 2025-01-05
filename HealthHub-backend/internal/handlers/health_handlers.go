package handlers

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/utils"
	"fmt"
	"net/http"
)

type HealthHandler struct {
	healthService *services.HealthService
}

func NewHealthHandler(healthService *services.HealthService) *HealthHandler {
	return &HealthHandler{
		healthService: healthService,
	}
}

func (h *HealthHandler) CreateHealthProfile(w http.ResponseWriter, r *http.Request) {
	var profile models.HealthProfile
	if err := ParseRequestBody(w, r, &profile); err != nil {
		GenerateErrorResponse(&w, e.NewInvalidJsonError())
		return
	}

	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError(""))
		return
	}
	profile.UserID = userID

	if err := h.healthService.CreateHealthProfile(r.Context(), &profile); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, profile)
}

func (h *HealthHandler) GetHealthProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	profile, err := h.healthService.GetHealthProfile(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, profile)
}

func (h *HealthHandler) UpdateHealthProfile(w http.ResponseWriter, r *http.Request) {
	var updates models.HealthProfile
	if err := ParseRequestBody(w, r, &updates); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	updates.UserID = userID

	// Get existing profile first
	existingProfile, err := h.healthService.GetHealthProfile(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	fmt.Print(existingProfile)
	// Update only the changed fields
	if err := h.healthService.UpdateHealthProfile(r.Context(), &updates); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	// Fetch the updated profile
	updatedProfile, err := h.healthService.GetHealthProfile(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, updatedProfile)
}

func (h *HealthHandler) DeleteHealthProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.healthService.DeleteHealthProfile(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "health profile deleted successfully",
	})
}
