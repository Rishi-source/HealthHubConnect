package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"strings"
	"time"

	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/pkg/logger"
)

// ParseRequestBody parses and validates JSON request body
func ParseRequestBody(w http.ResponseWriter, r *http.Request, dst interface{}) error {
	contentType := r.Header.Get("Content-Type")
	if contentType != "application/json" {
		return e.NewValidationError("Content-Type must be application/json")
	}

	if r.Body == nil {
		return e.NewValidationError("request body is empty")
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		switch {
		case err.Error() == "EOF":
			return e.NewValidationError("request body is empty")
		case strings.HasPrefix(err.Error(), "json: unknown field"):
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			return e.NewValidationError(fmt.Sprintf("unknown field: %s", fieldName))
		case strings.HasPrefix(err.Error(), "json: cannot unmarshal"):
			return e.NewValidationError("invalid data type in request")
		default:
			return e.NewInvalidJsonError()
		}
	}
	if dec.More() {
		return e.NewValidationError("request body must only contain one JSON object")
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
		jsonName := strings.Split(jsonTag, ",")[0]

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
