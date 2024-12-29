package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	e "HealthHubConnect/internal/errors"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Code    int         `json:"code"`
	Data    interface{} `json:"data"`
}

type APIErrorDescription struct {
	Message   string `json:"message"`
	ErrorCode string `json:"error_code"`
}

func GenerateResponse(w *http.ResponseWriter, status int, data interface{}) {
	success := false
	if status >= 200 && status < 300 {
		success = true
	}
	response := APIResponse{
		Success: success,
		Code:    status,
		Data:    data,
	}
	(*w).Header().Set("Content-Type", "application/json")
	(*w).WriteHeader(status)
	json.NewEncoder(*w).Encode(response)
}

func GenerateErrorResponse(w *http.ResponseWriter, errorObject error) {
	var errorObjectCustom *e.CustomError
	if !errors.As(errorObject, &errorObjectCustom) {
		errorObjectCustom = e.NewWrapperError(errorObject)
	}
	response := APIResponse{
		Success: false,
		Code:    errorObjectCustom.StatusCode,
		Data:    APIErrorDescription{Message: errorObjectCustom.Message, ErrorCode: errorObjectCustom.ErrorCode},
	}
	(*w).Header().Set("Content-Type", "application/json")
	(*w).WriteHeader(errorObjectCustom.StatusCode)
	json.NewEncoder(*w).Encode(response)
}
