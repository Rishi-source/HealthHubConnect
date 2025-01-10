package handlers

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type ChatGPTHandler struct {
	chatGPTService *services.ChatGPTService
	userRepo       *repositories.UserRepository
}

type ChatRequest struct {
	Query string `json:"query"`
}

type ChatResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}

type HealthSummaryResponse struct {
	Summary string `json:"summary"`
	Error   string `json:"error,omitempty"`
}

func NewChatGPTHandler(chatGPTService *services.ChatGPTService, userRepo *repositories.UserRepository) *ChatGPTHandler {
	return &ChatGPTHandler{
		chatGPTService: chatGPTService,
		userRepo:       userRepo,
	}
}

func (h *ChatGPTHandler) HandleChatQuery(w http.ResponseWriter, r *http.Request) {
	// Get context from request with timeout
	ctx := r.Context()

	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Query == "" {
		http.Error(w, "Query cannot be empty", http.StatusBadRequest)
		return
	}

	response, err := h.chatGPTService.GetResponse(ctx, req.Query)
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		status := http.StatusInternalServerError
		// Check if context was canceled by client
		if ctx.Err() != nil {
			status = http.StatusRequestTimeout
		}

		w.WriteHeader(status)
		json.NewEncoder(w).Encode(ChatResponse{
			Error: err.Error(),
		})
		return
	}

	if err := json.NewEncoder(w).Encode(ChatResponse{
		Response: response,
	}); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

func (h *ChatGPTHandler) HandleHealthSummary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get user ID using the utility function
	userID, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get health profile from user repository
	user, err := h.userRepo.FindByID(ctx, userID)
	if err != nil {
		http.Error(w, "Failed to fetch user data", http.StatusInternalServerError)
		return
	}

	if user.HealthProfile == nil {
		http.Error(w, "Health profile not found", http.StatusNotFound)
		return
	}

	// Create a prompt for ChatGPT
	prompt := createHealthSummaryPrompt(user.HealthProfile)

	// Get response from ChatGPT
	summary, err := h.chatGPTService.GetResponse(ctx, prompt)
	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(HealthSummaryResponse{
			Error: err.Error(),
		})
		return
	}

	if err := json.NewEncoder(w).Encode(HealthSummaryResponse{
		Summary: summary,
	}); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

func createHealthSummaryPrompt(profile *models.HealthProfile) string {
	// Create a detailed prompt for ChatGPT
	prompt := fmt.Sprintf(`Please provide a concise summary of the following health information:

Patient Details:
- Age: %d years old
- Gender: %s
- Blood Type: %s
- Height: %.2f cm
- Weight: %.2f kg

Medical Information:
- Number of Allergies: %d
- Number of Current Medications: %d
- Latest Vital Signs Available: %d

Please analyze this information and provide:
1. A brief overview of the patient's basic health status
2. Key health points to be aware of
4. General health recommendations based on the profile
5. Any notable patterns or concerns based on the provided data

Keep the response professional and medical-focused.`,
		calculateAge(profile.DateOfBirth),
		profile.Gender,
		profile.BloodType,
		profile.Height,
		profile.Weight,
		len(profile.Allergy),
		len(profile.Medication),
		len(profile.VitalSign))

	return prompt
}

func calculateAge(dateOfBirth time.Time) int {
	return int(time.Since(dateOfBirth).Hours() / 24 / 365)
}
