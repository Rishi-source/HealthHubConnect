package handlers

import (
	"encoding/json"
	"net/http"
	"reflect"
	"time"

	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/pkg/logger"
)

func ParseRequestBody(w http.ResponseWriter, r *http.Request, dst interface{}) (missingFields []string, err error) {
	// Parse the JSON into a map for validation
	var rawData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&rawData); err != nil {
		return nil, e.NewInvalidJsonError()
	}

	expectedFields := getStructFields(dst)

	for _, field := range expectedFields {
		if _, exists := rawData[field]; !exists {
			missingFields = append(missingFields, field)
		}
	}

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err = decoder.Decode(dst)

	return missingFields, err
}

func getStructFields(dst interface{}) []string {
	t := reflect.TypeOf(dst).Elem()
	var fields []string
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		jsonTag := field.Tag.Get("json")
		if jsonTag == "" || jsonTag == "-" {
			continue
		}
		fields = append(fields, jsonTag)
	}
	return fields
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
