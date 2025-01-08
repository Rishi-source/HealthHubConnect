package middleware

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"net/http"

	"github.com/golang-jwt/jwt"
)

func CheckDoctorRole(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value("claims").(jwt.MapClaims)
		if !ok {
			err := e.NewNotAuthorizedError("invalid token claims")
			http.Error(w, err.Error(), err.StatusCode)
			return
		}

		role, ok := claims["role"].(string)
		if !ok || models.UserRole(role) != models.RoleDoctor {
			err := e.NewForbiddenError("access denied: doctor role required")
			http.Error(w, err.Error(), err.StatusCode)
			return
		}

		next.ServeHTTP(w, r)
	})
}
