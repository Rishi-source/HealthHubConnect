package handlers

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type AdminHandler struct {
	adminService *services.AdminService
}

func NewAdminHandler(adminService *services.AdminService) *AdminHandler {
	return &AdminHandler{
		adminService: adminService,
	}
}

func (h *AdminHandler) GetAllUserLoginHistory(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)

	targetUserID, err := parseUserID(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	page, pageSize := getPaginationParams(r)

	history, err := h.adminService.GetUserLoginHistory(r.Context(), adminID, targetUserID, page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    history,
	})
}

func (h *AdminHandler) GetPatientLoginHistory(w http.ResponseWriter, r *http.Request) {
	doctorID := r.Context().Value("userID").(uint)

	patientID, err := parseUserID(r)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	page, pageSize := getPaginationParams(r)

	history, err := h.adminService.GetPatientLoginHistory(r.Context(), doctorID, patientID, page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    history,
	})
}

func (h *AdminHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
}

func (h *AdminHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	page, pageSize := getPaginationParams(r)

	users, total, err := h.adminService.ListUsers(r.Context(), page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    users,
		"total":   total,
	})
}

func (h *AdminHandler) UpdateSystemSettings(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)

	var settings models.AdminSettings
	if err := ParseRequestBody(w, r, &settings); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.adminService.UpdateSystemSettings(r.Context(), adminID, &settings); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "System settings updated successfully",
	})
}

func (h *AdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	user, tokens, err := h.adminService.LoginAdmin(r.Context(), req.Email, req.Password)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"user":    user,
		"tokens":  tokens,
	})
}

func (h *AdminHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	tokens, err := h.adminService.RefreshAdminToken(r.Context(), req.RefreshToken)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"tokens":  tokens,
	})
}

func (h *AdminHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.adminService.ChangeAdminPassword(r.Context(), adminID, req.OldPassword, req.NewPassword); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Password changed successfully",
	})
}

func (h *AdminHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid user ID"))
		return
	}

	user, err := h.adminService.GetUser(r.Context(), uint(userID))
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    user,
	})
}

func (h *AdminHandler) SuspendUser(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	userID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid user ID"))
		return
	}

	if err := h.adminService.ManageUser(r.Context(), adminID, uint(userID), "suspend"); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "User suspended successfully",
	})
}

func (h *AdminHandler) ActivateUser(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	userID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid user ID"))
		return
	}

	if err := h.adminService.ManageUser(r.Context(), adminID, uint(userID), "activate"); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "User activated successfully",
	})
}

func (h *AdminHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	userID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid user ID"))
		return
	}

	if err := h.adminService.DeleteUser(r.Context(), adminID, uint(userID)); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "User deleted successfully",
	})
}

func (h *AdminHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string          `json:"name"`
		Email    string          `json:"email"`
		Password string          `json:"password"`
		Phone    int64           `json:"phone"`
		Role     models.UserRole `json:"role"`
	}

	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	user, err := h.adminService.CreateUserWithRole(r.Context(), req.Name, req.Email, req.Password, req.Phone, req.Role)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    user,
	})
}

func (h *AdminHandler) ListDoctors(w http.ResponseWriter, r *http.Request) {
	page, pageSize := getPaginationParams(r)

	doctors, total, err := h.adminService.ListDoctors(r.Context(), page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    doctors,
		"total":   total,
	})
}

func (h *AdminHandler) VerifyDoctor(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	doctorID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid doctor ID"))
		return
	}

	if err := h.adminService.ManageUser(r.Context(), adminID, uint(doctorID), "verify"); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Doctor verified successfully",
	})
}

func (h *AdminHandler) GetUserStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.adminService.GetUserStats(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    stats,
	})
}

func (h *AdminHandler) GetAppointmentStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.adminService.GetAppointmentStats(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    stats,
	})
}

func (h *AdminHandler) GetSystemSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.adminService.GetSystemSettings(r.Context())
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    settings,
	})
}

func (h *AdminHandler) CreateBackup(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	backup, err := h.adminService.CreateBackup(r.Context(), adminID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    backup,
	})
}

func (h *AdminHandler) RestoreBackup(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	var req struct {
		BackupID uint `json:"backup_id"`
	}
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	err := h.adminService.RestoreBackup(r.Context(), adminID, req.BackupID)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Backup restored successfully",
	})
}

func (h *AdminHandler) ToggleMaintenanceMode(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	var req struct {
		Enabled bool `json:"enabled"`
	}
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	err := h.adminService.ToggleMaintenanceMode(r.Context(), adminID, req.Enabled)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Maintenance mode updated successfully",
	})
}

func (h *AdminHandler) GetAuditLogs(w http.ResponseWriter, r *http.Request) {
	page, pageSize := getPaginationParams(r)
	logs, total, err := h.adminService.GetAuditLogs(r.Context(), page, pageSize, nil)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    logs,
		"total":   total,
	})
}

func (h *AdminHandler) GetSystemLogs(w http.ResponseWriter, r *http.Request) {
	page, pageSize := getPaginationParams(r)

	startTimeStr := r.URL.Query().Get("startTime")
	endTimeStr := r.URL.Query().Get("endTime")

	startTime, err := time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		startTime = time.Now().AddDate(0, 0, -7)
	}

	endTime, err := time.Parse(time.RFC3339, endTimeStr)
	if err != nil {
		endTime = time.Now()
	}

	logs, total, err := h.adminService.GetSystemLogs(r.Context(), startTime, endTime, nil, page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    logs,
		"total":   total,
	})
}

func (h *AdminHandler) RejectDoctor(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	doctorID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid doctor ID"))
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.adminService.RejectDoctor(r.Context(), adminID, uint(doctorID), req.Reason); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Doctor application rejected successfully",
	})
}

func (h *AdminHandler) GetErrorLogs(w http.ResponseWriter, r *http.Request) {
	page, pageSize := getPaginationParams(r)
	startTime := time.Now().AddDate(0, 0, -7)
	endTime := time.Now()

	if startStr := r.URL.Query().Get("startTime"); startStr != "" {
		if t, err := time.Parse(time.RFC3339, startStr); err == nil {
			startTime = t
		}
	}
	if endStr := r.URL.Query().Get("endTime"); endStr != "" {
		if t, err := time.Parse(time.RFC3339, endStr); err == nil {
			endTime = t
		}
	}

	logs, total, err := h.adminService.GetErrorLogs(r.Context(), startTime, endTime, page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    logs,
		"total":   total,
	})
}

func (h *AdminHandler) GetLoginHistory(w http.ResponseWriter, r *http.Request) {
	page, pageSize := getPaginationParams(r)
	history, total, err := h.adminService.GetAllLoginHistory(r.Context(), page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}
	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    history,
		"total":   total,
	})
}

func (h *AdminHandler) GenerateUserReport(w http.ResponseWriter, r *http.Request) {
	format := r.URL.Query().Get("format")
	if format == "" {
		format = "csv"
	}

	report, err := h.adminService.GenerateUserReport(r.Context(), format)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	w.Header().Set("Content-Type", "application/"+format)
	w.Header().Set("Content-Disposition", "attachment; filename=user_report."+format)
	w.Write(report)
}

func (h *AdminHandler) GenerateAppointmentReport(w http.ResponseWriter, r *http.Request) {
	format := r.URL.Query().Get("format")
	if format == "" {
		format = "csv"
	}

	report, err := h.adminService.GenerateAppointmentReport(r.Context(), format)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	w.Header().Set("Content-Type", "application/"+format)
	w.Header().Set("Content-Disposition", "attachment; filename=appointment_report."+format)
	w.Write(report)
}

func (h *AdminHandler) ListSupportTickets(w http.ResponseWriter, r *http.Request) {
	page, pageSize := getPaginationParams(r)
	status := r.URL.Query().Get("status")

	tickets, total, err := h.adminService.ListSupportTickets(r.Context(), status, page, pageSize)
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    tickets,
		"total":   total,
	})
}

func (h *AdminHandler) GetSupportTicket(w http.ResponseWriter, r *http.Request) {
	ticketID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid ticket ID"))
		return
	}

	ticket, err := h.adminService.GetSupportTicket(r.Context(), uint(ticketID))
	if err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    ticket,
	})
}

func (h *AdminHandler) RespondToTicket(w http.ResponseWriter, r *http.Request) {
	adminID := r.Context().Value("userID").(uint)
	ticketID, err := strconv.ParseUint(mux.Vars(r)["id"], 10, 32)
	if err != nil {
		GenerateErrorResponse(&w, e.NewValidationError("invalid ticket ID"))
		return
	}

	var req struct {
		Response string `json:"response"`
		Status   string `json:"status"`
	}
	if err := ParseRequestBody(w, r, &req); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	if err := h.adminService.RespondToTicket(r.Context(), adminID, uint(ticketID), req.Response, req.Status); err != nil {
		GenerateErrorResponse(&w, err)
		return
	}

	GenerateResponse(&w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Response sent successfully",
	})
}

func parseUserID(r *http.Request) (uint, error) {
	userIDStr := r.URL.Query().Get("userId")
	if userIDStr == "" {
		return 0, e.NewValidationError("user ID is required")
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		return 0, e.NewValidationError("invalid user ID")
	}

	return uint(userID), nil
}

func getPaginationParams(r *http.Request) (int, int) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	return page, pageSize
}

func (h *AdminHandler) logAdminAction(ctx context.Context, action, entityType string, entityID uint, changes interface{}) {
}
