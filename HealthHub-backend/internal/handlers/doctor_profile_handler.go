package handlers

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"net/http"
)

type DoctorProfileHandler struct {
	doctorService *services.DoctorService
}

func NewDoctorProfileHandler(doctorService *services.DoctorService) *DoctorProfileHandler {
	return &DoctorProfileHandler{doctorService: doctorService}
}

func (h *DoctorProfileHandler) SaveProfile(w http.ResponseWriter, r *http.Request) {
	// Safely get userID from context with type assertion
	userIDInterface := r.Context().Value("userID")
	if userIDInterface == nil {
		err := e.NewNotAuthorizedError("user ID not found in context")
		GenerateErrorResponse(&w, err)
		return
	}

	userID, ok := userIDInterface.(uint)
	if !ok {
		err := e.NewNotAuthorizedError("invalid user ID format")
		GenerateErrorResponse(&w, err)
		return
	}

	var profile models.DoctorProfile
	if err := ParseRequestBody(w, r, &profile); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	profile.UserID = userID

	if err := h.doctorService.SaveProfile(r.Context(), &profile); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"message": "Profile saved successfully",
		"profile": profile,
	})
}

func (h *DoctorProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	profile, err := h.doctorService.GetProfile(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, profile)
}

func (h *DoctorProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	var profile models.DoctorProfile
	if err := ParseRequestBody(w, r, &profile); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	profile.UserID = userID
	if err := h.doctorService.UpdateProfile(r.Context(), &profile); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"message": "Profile updated successfully",
		"profile": profile,
	})
}

func (h *DoctorProfileHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorService.DeleteProfile(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "Profile deleted successfully",
	})
}

func (h *DoctorProfileHandler) SaveSchedule(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	var req models.ScheduleRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorService.SaveSchedule(r.Context(), userID, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "Schedule saved successfully",
	})
}

func (h *DoctorProfileHandler) GetSchedule(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	scheduleResponse, err := h.doctorService.GetSchedule(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, scheduleResponse)
}

// Helper function to get userID from context
func getUserIDFromContext(r *http.Request) (uint, error) {
	userIDInterface := r.Context().Value("userID")
	if userIDInterface == nil {
		return 0, e.NewNotAuthorizedError("user ID not found in context")
	}

	userID, ok := userIDInterface.(uint)
	if !ok {
		return 0, e.NewNotAuthorizedError("invalid user ID format")
	}
	return userID, nil
}
