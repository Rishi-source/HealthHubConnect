package errors

import (
	"net/http"
)

type CustomError struct {
	Message    string
	ErrorCode  string
	StatusCode int
}

func (err *CustomError) Error() string {
	return err.Message
}

func NewInvalidJsonError() *CustomError {
	return &CustomError{
		Message:    "invalid Json",
		ErrorCode:  "JSON_PARSE_ERROR",
		StatusCode: http.StatusBadRequest,
	}
}

func NewParamNotFoundError(param string) *CustomError {
	return &CustomError{
		Message:    "param not found: " + param,
		ErrorCode:  "PARAM_MISSING",
		StatusCode: http.StatusBadRequest,
	}
}

func NewInvalidParamError(param string) *CustomError {
	return &CustomError{
		Message:    "invalid param: '" + param + "'",
		ErrorCode:  "INVALID_PARAM",
		StatusCode: http.StatusBadRequest,
	}
}

func NewInvalidValueError(param string, helpText string) *CustomError {
	return &CustomError{
		Message:    "invalid value for: '" + param + "' | " + helpText,
		ErrorCode:  "INVALID_VALUE",
		StatusCode: http.StatusBadRequest,
	}
}

func NewObjectNotFoundError(object string) *CustomError {
	return &CustomError{
		Message:    "'" + object + "' object not found",
		ErrorCode:  "NOT_FOUND",
		StatusCode: http.StatusNotFound,
	}
}

func NewInternalError() *CustomError {
	return &CustomError{
		Message:    "internal server error",
		ErrorCode:  "INTERNAL_SERVER_ERROR",
		StatusCode: http.StatusInternalServerError,
	}
}

func NewWrapperError(err error) *CustomError {
	return &CustomError{
		Message:    err.Error(),
		ErrorCode:  "INTERNAL_SERVER_ERROR",
		StatusCode: http.StatusInternalServerError,
	}
}

func NewValidationError(message string) *CustomError {
	return &CustomError{
		Message:    message,
		ErrorCode:  "VALIDATION_ERROR",
		StatusCode: http.StatusBadRequest,
	}
}

func NewDuplicateResourceError(resource string) *CustomError {
	return &CustomError{
		Message:    "user with email " + resource + " already exists",
		ErrorCode:  "DUPLICATE_RESOURCE",
		StatusCode: http.StatusConflict,
	}
}

func NewNotAuthorizedError(resource string) *CustomError {
	return &CustomError{
		Message:    "Not Authorized to make this request" + resource,
		ErrorCode:  "UNAUTHORIRIZED",
		StatusCode: http.StatusUnauthorized,
	}
}

func NewForbiddenError(message string) *CustomError {
	return &CustomError{
		Message:    message,
		ErrorCode:  "FORBIDDEN",
		StatusCode: http.StatusForbidden,
	}
}

func NewNotFoundError(message string) *CustomError {
	return &CustomError{
		Message:    message,
		StatusCode: http.StatusNotFound,
		ErrorCode:  "NOT_FOUND",
	}
}

func NewBadRequestError(message string) *CustomError {
	return &CustomError{
		Message:    message,
		ErrorCode:  "BAD_REQUEST",
		StatusCode: http.StatusBadRequest,
	}
}

func NewConflictError(message string) *CustomError {
	return &CustomError{
		Message:    message,
		ErrorCode:  "CONFLICT",
		StatusCode: http.StatusConflict,
	}
}

// for testing some pointer based errors
type AppError struct {
	Message    string `json:"message"`
	StatusCode int    `json:"status_code"`
}

func (e *AppError) Error() string {
	return e.Message
}

func NewAppError(message string, statusCode int) *AppError {
	return &AppError{
		Message:    message,
		StatusCode: statusCode,
	}
}
