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
}

func NewAppointmentHandler(appointmentService services.AppointmentService, userRepo *repositories.UserRepository) *AppointmentHandler {
	return &AppointmentHandler{
		appointmentService: appointmentService,
		userRepository:     userRepo,
	}
}

func (h *AppointmentHandler) CreateAppointment(w http.ResponseWriter, r *http.Request) {
	var req models.AppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Parse date and time strings
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		http.Error(w, "Invalid date format. Use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	startTime, err := time.Parse("15:04:05", req.StartTime)
	if err != nil {
		http.Error(w, "Invalid start time format. Use HH:mm:ss", http.StatusBadRequest)
		return
	}

	endTime, err := time.Parse("15:04:05", req.EndTime)
	if err != nil {
		http.Error(w, "Invalid end time format. Use HH:mm:ss", http.StatusBadRequest)
		return
	}

	appointment := &models.Appointment{
		DoctorID:    req.DoctorID,
		Type:        req.Type,
		Date:        date,
		StartTime:   startTime,
		EndTime:     endTime,
		Description: req.Description,
		Address:     req.Address,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
	}

	claims := r.Context().Value("claims").(*utils.Claims)
	appointment.PatientID = claims.UserID

	if err := h.appointmentService.CreateAppointment(appointment); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(appointment)
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

	var appointments []models.Appointment
	if user.Role == models.RoleDoctor {
		appointments, err = h.appointmentService.GetDoctorAppointments(userID)
	} else {
		appointments, err = h.appointmentService.GetPatientAppointments(userID)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(appointments)
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
