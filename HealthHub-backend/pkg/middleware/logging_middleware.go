package middleware

import (
	"HealthHubConnect/pkg/logger"
	"net/http"
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

// loggingMiddleware logs the incoming request and the outgoing response
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startTime := time.Now()
		rw := &responseWriter{w, http.StatusOK}

		loggerManager := logger.GetLogger()

		logEvent := loggerManager.ServerLogger.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Str("remote_ip", r.RemoteAddr).
			Str("protocol", r.Proto).
			Str("host", r.Host).
			Str("user_agent", r.UserAgent())

		// err := errors.New("url not found")
		// if rw.status == http.StatusNotFound {
		// 	loggerManager.ServerLogger.Error().Err(err).Msg("404 not found")
		// } created a handler for this
		for name, values := range r.Header {
			logEvent.Strs(name, values)
		}

		if r.URL.RawQuery != "" {
			for key, values := range r.URL.Query() {
				logEvent.Strs("query_"+key, values)
			}
		}

		logEvent.Msg("Incoming request")

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
