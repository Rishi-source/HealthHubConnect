package handlers

import (
	"encoding/json"
	"net/http"
	"reflect"
	"strings"
	"time"

	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/pkg/logger"
)

// ParseRequestBody parses and validates JSON request body
func ParseRequestBody(w http.ResponseWriter, r *http.Request, dst interface{}) error {
	// Check if body is empty
	if r.Body == nil {
		return e.NewValidationError("request body is empty")
	}

	// First decode into a map to check for required fields
	var rawData map[string]interface{}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&rawData); err != nil {
		return e.NewInvalidJsonError()
	}

	// Reset the request body for second decode
	r.Body = http.MaxBytesReader(w, r.Body, 1048576) // 1MB limit

	// Get required fields from struct tags
	requiredFields := getRequiredFields(dst)
	if missingFields := validateRequiredFields(rawData, requiredFields); len(missingFields) > 0 {
		return e.NewValidationError("missing required fields: " + strings.Join(missingFields, ", "))
	}

	// Now decode into the actual struct
	decoder = json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields() // Ensure no unknown fields
	if err := decoder.Decode(dst); err != nil {
		switch {
		case err.Error() == "EOF":
			return e.NewValidationError("request body is empty")
		case strings.HasPrefix(err.Error(), "json: unknown field"):
			return e.NewValidationError("invalid field in request body")
		default:
			return e.NewInvalidJsonError()
		}
	}

	return nil
}

// getRequiredFields extracts required fields from struct tags
func getRequiredFields(dst interface{}) []string {
	var required []string
	t := reflect.TypeOf(dst).Elem()

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		jsonTag := field.Tag.Get("json")
		validate := field.Tag.Get("validate")

		if jsonTag == "" || jsonTag == "-" {
			continue
		}

		// Remove omitempty from json tag if present
		jsonName := strings.Split(jsonTag, ",")[0]

		// Check if field is required in validate tag
		if strings.Contains(validate, "required") {
			required = append(required, jsonName)
		}
	}
	return required
}

// validateRequiredFields checks if all required fields are present
func validateRequiredFields(data map[string]interface{}, required []string) []string {
	var missing []string
	for _, field := range required {
		if value, ok := data[field]; !ok || isEmptyValue(value) {
			missing = append(missing, field)
		}
	}
	return missing
}

// isEmptyValue checks if a value should be considered empty
func isEmptyValue(value interface{}) bool {
	switch v := value.(type) {
	case nil:
		return true
	case string:
		return len(strings.TrimSpace(v)) == 0
	case int, int64, float64:
		return v == 0
	case bool:
		return !v
	case []interface{}:
		return len(v) == 0
	case map[string]interface{}:
		return len(v) == 0
	default:
		return false
	}
}

func contains(slice []string, item string) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func StatusNotFoundHandler(w http.ResponseWriter, r *http.Request) {

	loggerManager := logger.GetLogger()

	loggerManager.ServerLogger.Warn().
		Str("method", r.Method).
		Str("uri", r.RequestURI).
		Str("remote_addr", r.RemoteAddr).
		Str("user_agent", r.UserAgent()).
		Time("timestamp", time.Now()).
		Msg("404 Not Found")

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{
		"error": "Resource not found",
	})
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "healthy",
		"time":   time.Now().UTC().Format(time.RFC3339),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
