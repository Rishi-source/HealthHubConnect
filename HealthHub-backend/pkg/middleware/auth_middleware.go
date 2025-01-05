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

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			err := e.NewNotAuthorizedError("invalid token format")
			http.Error(w, err.Error(), err.StatusCode)
			return
		}

		token := tokenParts[1]
		claims, err := utils.ValidateToken(token, env.Jwt.AccessTokenSecret, utils.AccessToken)
		if err != nil {
			authErr := e.NewNotAuthorizedError("invalid token")
			http.Error(w, authErr.Error(), authErr.StatusCode)
			return
		}

		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
