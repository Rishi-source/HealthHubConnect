package handlers

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/types"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type HospitalHandler struct {
	hospitalService *services.HospitalService
}

func NewHospitalHandler(hospitalService *services.HospitalService) *HospitalHandler {
	return &HospitalHandler{
		hospitalService: hospitalService,
	}
}

type FindNearbyHospitalsRequest struct {
	Location models.Location       `json:"location"`
	Filters  types.HospitalFilters `json:"filters"`
}

func (h *HospitalHandler) FindNearbyHospitals(w http.ResponseWriter, r *http.Request) {
	var req FindNearbyHospitalsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hospitals, err := h.hospitalService.FindNearbyHospitals(r.Context(), req.Location, req.Filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(hospitals)
}

type SearchHospitalsRequest struct {
	Query    string                 `json:"query"`
	Location *models.Location       `json:"location,omitempty"`
	Filters  *types.HospitalFilters `json:"filters,omitempty"`
}

func (h *HospitalHandler) SearchHospitals(w http.ResponseWriter, r *http.Request) {
	var req SearchHospitalsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hospitals, err := h.hospitalService.SearchHospitals(r.Context(), req.Query, req.Location, req.Filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(hospitals)
}

func (h *HospitalHandler) GetHospitalByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	hospital, err := h.hospitalService.GetHospitalByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(hospital)
}

func (h *HospitalHandler) CreateHospital(w http.ResponseWriter, r *http.Request) {
	var hospital models.Hospital
	if err := json.NewDecoder(r.Body).Decode(&hospital); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	created, err := h.hospitalService.CreateHospital(r.Context(), hospital)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}

func (h *HospitalHandler) UpdateHospital(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var hospital models.Hospital
	if err := json.NewDecoder(r.Body).Decode(&hospital); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updated, err := h.hospitalService.UpdateHospital(r.Context(), id, hospital)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updated)
}

func (h *HospitalHandler) DebugNearbyPlaces(w http.ResponseWriter, r *http.Request) {
	var req FindNearbyHospitalsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	places, err := h.hospitalService.GetRawPlacesData(r.Context(), req.Location, req.Filters)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Pretty print the response
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "    ")
	encoder.Encode(places)
}
