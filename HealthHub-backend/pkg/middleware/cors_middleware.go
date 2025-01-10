package middleware

import (
	"HealthHubConnect/env"
	"net/http"
	"strconv"
	"strings"
)

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		env.Cors.AllowedHeaders = append(
			env.Cors.AllowedHeaders,
			"Accept-Encoding",
			"Authorization",
			"Refresh-Token",
			"Content-Length",
		)

		w.Header().Set("Access-Control-Allow-Origin", strings.Join(env.Cors.AllowedOrigins, ","))
		w.Header().Set("Access-Control-Allow-Methods", strings.Join(env.Cors.AllowedMethods, ","))
		w.Header().Set("Access-Control-Allow-Headers", strings.Join(env.Cors.AllowedHeaders, ","))
		w.Header().Set("Access-Control-Max-Age", strconv.Itoa(env.Cors.MaxAge))
		w.Header().Set("Access-Control-Expose-Headers", "Authorization, Refresh-Token")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
