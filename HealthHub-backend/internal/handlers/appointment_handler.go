package handlers

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/utils"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"HealthHubConnect/internal/repositories"

	"github.com/gorilla/mux"
)

type AppointmentHandler struct {
	appointmentService services.AppointmentService
	userRepository     *repositories.UserRepository
	doctorRepository   *repositories.DoctorRepository
}

func NewAppointmentHandler(
	appointmentService services.AppointmentService,
	userRepo *repositories.UserRepository,
	doctorRepo *repositories.DoctorRepository,
) *AppointmentHandler {
	return &AppointmentHandler{
		appointmentService: appointmentService,
		userRepository:     userRepo,
		doctorRepository:   doctorRepo,
	}
}

func (h *AppointmentHandler) CreateAppointment(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError("unauthorized access"))
		return
	}

	var req models.AppointmentRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	// Create appointment
	appointment, err := req.ToAppointment(userID)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError(err.Error()))
		return
	}

	// Verify the doctor exists before creating appointment
	if _, err := h.userRepository.FindByID(r.Context(), req.DoctorID); err != nil {
		GenerateErrorResponse(&w, e.NewNotFoundError("doctor not found"))
		return
	}

	if err := h.appointmentService.CreateAppointment(appointment); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, appointment)
}

func (h *AppointmentHandler) UpdateAppointmentStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid appointment ID", http.StatusBadRequest)
		return
	}

	var status struct {
		Status models.AppointmentStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&status); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.appointmentService.UpdateAppointmentStatus(uint(id), status.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *AppointmentHandler) GetAppointment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid appointment ID", http.StatusBadRequest)
		return
	}

	appointment, err := h.appointmentService.GetAppointmentByID(uint(id))
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(appointment)
}

func (h *AppointmentHandler) GetMyAppointments(w http.ResponseWriter, r *http.Request) {
	// Use the same method as other handlers to get userID
	userID := r.Context().Value("userID")
	if userID == nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError("unauthorized access"))
		return
	}

	// Convert userID to uint based on type
	var uid uint
	switch v := userID.(type) {
	case float64:
		uid = uint(v)
	case int:
		uid = uint(v)
	case uint:
		uid = v
	default:
		GenerateErrorResponse(&w, e.NewInternalError())
		return
	}

	appointments, err := h.appointmentService.GetPatientAppointments(uid)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"appointments": appointments,
		"count":        len(appointments),
	})
}

func (h *AppointmentHandler) SetDoctorAvailability(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	user, err := h.userRepository.FindByID(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if user.Role != models.RoleDoctor {
		err := e.NewForbiddenError("only doctors can set availability")
		http.Error(w, err.Error(), err.StatusCode)
		return
	}

	var availability models.DoctorAvailability
	if err := json.NewDecoder(r.Body).Decode(&availability); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	availability.DoctorID = userID
	if err := h.appointmentService.SetDoctorAvailability(&availability); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(availability)
}

func (h *AppointmentHandler) GetDoctorAvailability(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	doctorID, err := strconv.ParseUint(vars["doctorId"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid doctor ID", http.StatusBadRequest)
		return
	}

	availability, err := h.appointmentService.GetDoctorAvailability(uint(doctorID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(availability)
}

func (h *AppointmentHandler) GetAvailableSlots(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	doctorID, err := strconv.ParseUint(vars["doctorId"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid doctor ID"))
		return
	}

	dateStr := r.URL.Query().Get("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid date format"))
		return
	}

	slots, err := h.appointmentService.GetAvailableSlots(uint(doctorID), date)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, slots)
}

func (h *AppointmentHandler) GetUpcomingAppointments(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	// Validate doctor access
	if err := h.doctorRepository.ValidateDoctorAccess(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	appointments, err := h.appointmentService.GetDoctorUpcomingAppointments(userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, appointments)
}

func (h *AppointmentHandler) GetPastAppointments(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	// Validate doctor access
	if err := h.doctorRepository.ValidateDoctorAccess(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	appointments, err := h.appointmentService.GetDoctorPastAppointments(userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, appointments)
}

func (h *AppointmentHandler) GetMyUpcomingAppointments(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	appointments, err := h.appointmentService.GetPatientUpcomingAppointments(userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, appointments)
}

func (h *AppointmentHandler) GetMyPastAppointments(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	appointments, err := h.appointmentService.GetPatientPastAppointments(userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, appointments)
}

func (h *AppointmentHandler) CancelAppointment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.appointmentService.CancelAppointment(uint(id), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{"message": "Appointment cancelled successfully"})
}

func (h *AppointmentHandler) GetTodayAppointments(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorRepository.ValidateDoctorAccess(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	appointments, err := h.appointmentService.GetDoctorTodayAppointments(userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, appointments)
}

func (h *AppointmentHandler) GetWeekAppointments(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorRepository.ValidateDoctorAccess(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	appointments, err := h.appointmentService.GetDoctorWeekAppointments(userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, appointments)
}

func (h *AppointmentHandler) ConfirmAppointment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorRepository.ValidateDoctorAccess(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.appointmentService.UpdateAppointmentStatus(uint(id), models.StatusConfirmed); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{"message": "Appointment confirmed"})
}

func (h *AppointmentHandler) CompleteAppointment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorRepository.ValidateDoctorAccess(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.appointmentService.UpdateAppointmentStatus(uint(id), models.StatusCompleted); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{"message": "Appointment completed"})
}

func (h *AppointmentHandler) RescheduleAppointment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	var req models.AppointmentRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.appointmentService.RescheduleAppointment(uint(id), userID, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{"message": "Appointment rescheduled successfully"})
}

func (h *AppointmentHandler) MarkNoShow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorRepository.ValidateDoctorAccess(r.Context(), userID); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.appointmentService.UpdateAppointmentStatus(uint(id), models.StatusNoShow); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{"message": "Appointment marked as no-show"})
}

// // Helper function to get userID from context
// func getUserIDFromContext(r *http.Request) (uint, error) {
// 	userID := r.Context().Value("userID")
// 	if userID == nil {
// 		return 0, e.NewNotAuthorizedError("user ID not found in context")
// 	}

// 	// Handle different types of userID (float64 from JWT claims)
// 	switch v := userID.(type) {
// 	case float64:
// 		return uint(v), nil
// 	case uint:
// 		return v, nil
// 	case int:
// 		return uint(v), nil
// 	default:
// 		return 0, e.NewNotAuthorizedError("invalid user ID format")
// 	}
// }
