package middleware

import (
	"HealthHubConnect/pkg/logger"
	"net/http"
	"strings"
	"time"
)

// its a custom response writer to capture status code
type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

// isWebSocketRequest checks if the request is a WebSocket upgrade request
func isWebSocketRequest(r *http.Request) bool {
	return strings.ToLower(r.Header.Get("Upgrade")) == "websocket"
}

// loggingMiddleware logs the incoming request and the outgoing response
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()
		loggerManager := logger.GetLogger()

		// Log the incoming request
		logEvent := loggerManager.ServerLogger.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Str("remote_ip", r.RemoteAddr).
			Str("protocol", r.Proto).
			Str("host", r.Host).
			Str("user_agent", r.UserAgent())

		for name, values := range r.Header {
			logEvent.Strs(name, values)
		}

		if r.URL.RawQuery != "" {
			for key, values := range r.URL.Query() {
				logEvent.Strs("query_"+key, values)
			}
		}

		logEvent.Msg("Incoming request")

		// If it's a WebSocket request, don't wrap the ResponseWriter
		if isWebSocketRequest(r) {
			next.ServeHTTP(w, r)
			return
		}

		// For regular HTTP requests, use the custom response writer
		rw := &responseWriter{w, http.StatusOK}
		next.ServeHTTP(rw, r)

		// imp request duration
		duration := time.Since(startTime)

		// logging the completion of request with additional details
		loggerManager.ServerLogger.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Int("status", rw.status).
			Dur("duration", duration).
			Msg("Request completed")
	})
}
