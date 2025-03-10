package handlers

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type DoctorProfileHandler struct {
	doctorService *services.DoctorService
}

func NewDoctorProfileHandler(doctorService *services.DoctorService) *DoctorProfileHandler {
	return &DoctorProfileHandler{doctorService: doctorService}
}

func (h *DoctorProfileHandler) SaveProfile(w http.ResponseWriter, r *http.Request) {

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

type ExtendAvailabilityRequest struct {
	WeeksToAdd int `json:"weeks_to_add" validate:"required,min=1,max=52"`
}

func (h *DoctorProfileHandler) ExtendAvailability(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	var req ExtendAvailabilityRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorService.ExtendAvailability(r.Context(), userID, req.WeeksToAdd); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": fmt.Sprintf("Availability extended by %d weeks", req.WeeksToAdd),
	})
}

func (h *DoctorProfileHandler) ListDoctors(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	filters := make(map[string]interface{})
	if specialization := r.URL.Query().Get("specialization"); specialization != "" {
		filters["specialization"] = specialization
	}
	if name := r.URL.Query().Get("name"); name != "" {
		filters["name"] = name
	}

	response, err := h.doctorService.ListDoctors(r.Context(), filters, page, limit)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, response)
}

func (h *DoctorProfileHandler) GetDoctorPublicProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	doctorID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid doctor ID"))
		return
	}

	profile, err := h.doctorService.GetProfile(r.Context(), uint(doctorID))
	if err != nil {
		if err.Error() == "doctor profile not found" {
			GenerateErrorResponse(&w, e.NewNotFoundError("doctor profile not found"))
			return
		}
		GenerateErrorResponse(&w, err)
		return
	}

	sanitizedProfile := map[string]interface{}{
		"id":              profile.ID,
		"userId":          profile.UserID,
		"user":            profile.User,
		"basicInfo":       profile.BasicInfo,
		"qualifications":  profile.Qualifications,
		"practiceDetails": profile.PracticeDetails,
		"specializations": profile.Specializations,
	}

	GenerateResponse(&w, http.StatusOK, sanitizedProfile)
}

func (h *DoctorProfileHandler) BlockSlot(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	var req models.BlockSlotRequest
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.doctorService.BlockSlot(r.Context(), userID, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "Slot blocked successfully",
	})
}

func (h *DoctorProfileHandler) GetAvailableSlots(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	doctorID, err := strconv.ParseUint(vars["doctorId"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid doctor ID"))
		return
	}

	dateStr := r.URL.Query().Get("date")
	if dateStr == "" {
		GenerateErrorResponse(&w, e.NewBadRequestError("date parameter is required"))
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid date format. Use YYYY-MM-DD"))
		return
	}

	if date.Before(time.Now().Truncate(24 * time.Hour)) {
		GenerateErrorResponse(&w, e.NewBadRequestError("cannot fetch slots for past dates"))
		return
	}

	slots, err := h.doctorService.GetAvailableSlots(uint(doctorID), date)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"slots": slots,
		"date":  dateStr,
		"count": len(slots),
	})
}

func (h *DoctorProfileHandler) ListPatients(w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromContext(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	response, err := h.doctorService.ListPatients(r.Context(), userID, page, limit)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, response)
}

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

func (h *DoctorProfileHandler) SaveBillingSettings(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError("unauthorized access"))
		return
	}

	var billingSettings models.BillingSettings
	if err := json.NewDecoder(r.Body).Decode(&billingSettings); err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid request body"))
		return
	}

	if err := validateBillingSettings(&billingSettings); err != nil {
		GenerateErrorResponse(&w, e.NewValidationError(err.Error()))
		return
	}

	settingsJSON, err := json.Marshal(billingSettings)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("error marshaling settings"))
		return
	}

	if err := h.doctorService.SaveBillingSettings(r.Context(), userID, json.RawMessage(settingsJSON)); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"message":  "Billing settings updated successfully",
		"settings": billingSettings,
	})
}

func validateBillingSettings(settings *models.BillingSettings) error {
	if settings.ConsultationFees.Online.Amount < 0 {
		return fmt.Errorf("online consultation amount cannot be negative")
	}
	if settings.ConsultationFees.InPerson.Amount < 0 {
		return fmt.Errorf("in-person consultation amount cannot be negative")
	}
	if settings.ConsultationFees.FollowUp.Amount < 0 {
		return fmt.Errorf("follow-up consultation amount cannot be negative")
	}

	if len(settings.PaymentMethods) == 0 {
		return fmt.Errorf("at least one payment method is required")
	}

	for _, upi := range settings.UPIDetails {
		if upi.UPIId == "" {
			return fmt.Errorf("UPI ID cannot be empty")
		}
	}

	for _, bank := range settings.BankDetails {
		if bank.AccountNumber == "" || bank.IFSC == "" {
			return fmt.Errorf("bank account number and IFSC are required")
		}
	}

	return nil
}

func (h *DoctorProfileHandler) GetBillingSettings(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError("unauthorized access"))
		return
	}

	profile, err := h.doctorService.GetProfile(r.Context(), userID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, profile.BillingSettings)
}

func (h *DoctorProfileHandler) UpdateBillingSettings(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError("unauthorized access"))
		return
	}

	var billingSettings models.BillingSettings
	if err := json.NewDecoder(r.Body).Decode(&billingSettings); err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid request body"))
		return
	}

	if err := validateBillingSettings(&billingSettings); err != nil {
		GenerateErrorResponse(&w, e.NewValidationError(err.Error()))
		return
	}

	settingsJSON, err := json.Marshal(billingSettings)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("error marshaling settings"))
		return
	}

	if err := h.doctorService.SaveBillingSettings(r.Context(), userID, json.RawMessage(settingsJSON)); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"message":  "Billing settings updated successfully",
		"settings": billingSettings,
	})
}

func (h *DoctorProfileHandler) CreateBill(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appointmentID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError("unauthorized access"))
		return
	}

	var billReq models.BillRequest
	if err := json.NewDecoder(r.Body).Decode(&billReq); err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid request body"))
		return
	}

	// Parse due date from the string directly
	bill, err := h.doctorService.CreateBill(r.Context(), uint(appointmentID), userID, &billReq)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, bill)
}

func (h *DoctorProfileHandler) GetBill(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appointmentID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	bill, err := h.doctorService.GetBill(r.Context(), uint(appointmentID))
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, bill)
}

func (h *DoctorProfileHandler) UpdateBill(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appointmentID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	var billUpdate models.Bill
	if err := json.NewDecoder(r.Body).Decode(&billUpdate); err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid request body"))
		return
	}

	if err := h.doctorService.UpdateBill(r.Context(), uint(appointmentID), &billUpdate); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "Bill updated successfully",
	})
}

func (h *DoctorProfileHandler) GetPrescription(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appointmentID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	prescription, err := h.doctorService.GetPrescription(r.Context(), uint(appointmentID))
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, prescription)
}

func (h *DoctorProfileHandler) UpdatePrescription(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appointmentID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	var prescription models.Prescription
	if err := json.NewDecoder(r.Body).Decode(&prescription); err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid request body"))
		return
	}

	if err := h.doctorService.UpdatePrescription(r.Context(), uint(appointmentID), &prescription); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]string{
		"message": "Prescription updated successfully",
	})
}

func (h *DoctorProfileHandler) CreatePrescription(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appointmentID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid appointment ID"))
		return
	}

	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, e.NewNotAuthorizedError("unauthorized access"))
		return
	}

	var prescriptionReq models.PrescriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&prescriptionReq); err != nil {
		GenerateErrorResponse(&w, e.NewBadRequestError("invalid request body"))
		return
	}

	prescription := &models.Prescription{
		DoctorID:        userID,
		AppointmentID:   uint(appointmentID),
		Diagnosis:       prescriptionReq.Diagnosis,
		ChiefComplaints: prescriptionReq.ChiefComplaints,
		DoctorNotes:     prescriptionReq.DoctorNotes,
		Medications:     prescriptionReq.Medications,
		Investigations:  prescriptionReq.Investigations,
		Advice:          prescriptionReq.Advice,
		FollowUp:        prescriptionReq.FollowUp,
		Status:          prescriptionReq.Status,
		Vitals:          *prescriptionReq.Vitals,
		PatientHistory:  *prescriptionReq.PatientHistory,
	}

	createdPrescription, err := h.doctorService.CreatePrescription(r.Context(), prescription)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, createdPrescription)
}
