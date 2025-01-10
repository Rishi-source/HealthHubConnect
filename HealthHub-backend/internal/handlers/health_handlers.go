package handlers

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/utils"
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
	existingProfile, err := h.healthService.GetHealthProfile(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	updates.ID = existingProfile.ID
	updates.CreatedAt = existingProfile.CreatedAt

	if err := h.healthService.UpdateHealthProfile(r.Context(), &updates); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

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

func (h *HealthHandler) CreateVitalSign(w http.ResponseWriter, r *http.Request) {
	var vitalSign models.VitalSign
	if err := ParseRequestBody(w, r, &vitalSign); err != nil {
		GenerateErrorResponse(&w, e.NewInvalidJsonError())
		return
	}

	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError(""))
		return
	}
	vitalSign.UserID = userID

	if err := h.healthService.CreateVitalSign(r.Context(), &vitalSign); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, vitalSign)
}

func (h *HealthHandler) GetVitalSigns(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	vitalSigns, err := h.healthService.GetVitalSign(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, vitalSigns)
}

func (h *HealthHandler) CreateMedication(w http.ResponseWriter, r *http.Request) {
	var medication models.Medication
	if err := ParseRequestBody(w, r, &medication); err != nil {
		GenerateErrorResponse(&w, e.NewInvalidJsonError())
		return
	}

	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError(""))
		return
	}
	medication.UserID = userID

	if err := h.healthService.CreateMedication(r.Context(), &medication); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, medication)
}

func (h *HealthHandler) GetMedications(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	medications, err := h.healthService.GetMedications(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, medications)
}
