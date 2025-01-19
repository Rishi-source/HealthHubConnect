package middleware

import (
	"HealthHubConnect/env"
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/utils"
	"context"
	"net/http"
	"strings"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			err := e.NewNotAuthorizedError("missing authorization header")
			http.Error(w, err.Error(), err.StatusCode)
			return
		}

		// Split Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			err := e.NewNotAuthorizedError("invalid authorization header format")
			http.Error(w, err.Error(), err.StatusCode)
			return
		}

		userID, err := utils.ExtractUserIDFromToken(parts[1], env.Jwt.AccessTokenSecret)
		if err != nil {
			err := e.NewNotAuthorizedError("invalid token")
			http.Error(w, err.Error(), err.StatusCode)
			return
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
