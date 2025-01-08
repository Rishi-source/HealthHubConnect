package handlers

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/golang-jwt/jwt"
	"github.com/gorilla/mux"
)

type AppointmentHandler struct {
	appointmentService services.AppointmentService
}

func NewAppointmentHandler(appointmentService services.AppointmentService) *AppointmentHandler {
	return &AppointmentHandler{appointmentService: appointmentService}
}

func (h *AppointmentHandler) CreateAppointment(w http.ResponseWriter, r *http.Request) {
	var appointment models.Appointment
	if err := json.NewDecoder(r.Body).Decode(&appointment); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	claims := r.Context().Value("claims").(jwt.MapClaims)
	userID := uint(claims["user_id"].(float64))
	appointment.PatientID = userID

	if err := h.appointmentService.CreateAppointment(&appointment); err != nil {
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
	claims := r.Context().Value("claims").(jwt.MapClaims)
	userID := uint(claims["user_id"].(float64))
	role := models.UserRole(claims["role"].(string))

	var appointments []models.Appointment
	var err error

	if role == models.RoleDoctor {
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
	claims := r.Context().Value("claims").(jwt.MapClaims)
	userID := uint(claims["user_id"].(float64))
	role := models.UserRole(claims["role"].(string))

	if role != models.RoleDoctor {
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
