package init

import (
	"HealthHubConnect/env"
	"HealthHubConnect/internal/database"
	"HealthHubConnect/internal/handlers"
	"HealthHubConnect/pkg/logger"
	"HealthHubConnect/routes"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

var (
	server  *http.Server
	Loggers *logger.LoggerManager
)

func Init() error {

	var err error
	Loggers = logger.InitializeLogger(env.Logger)

	db, err := database.InitDB()
	if err != nil {
		Loggers.DBLogger.Error().Err(err).Msg("Failed to initialize database")
		return err
	}

	Loggers.GeneralLogger.Info().Msg("Successfully initialized application")
	// utils.SendEmail("ujjwaliiii40@gmail.com", "how are you", "sent from zoho")

	if err := InitServer(db); err != nil {
		Loggers.ServerLogger.Error().Err(err).Msg("Failed to initialize server")
		return fmt.Errorf("failed to initialize server: %w", err)
	}
	return nil
}

func InitServer(db *gorm.DB) error {
	router := mux.NewRouter()

	routes.SetupRoutes(router, db)
	port := env.ServerPort
	router.NotFoundHandler = http.HandlerFunc(handlers.StatusNotFoundHandler)
	server = &http.Server{
		Addr:         port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	// run server in a goroutine so it doesn't block
	go func() {
		Loggers.ServerLogger.Info().Msgf("Server starting on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			Loggers.ServerLogger.Fatal().Err(err).Msg("Failed to start server")
		}
	}()

	return nil
}

// logic when the server closes to close it gracefully and cleanup all the resources necessary
func Cleanup() error {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if server != nil {
		if err := server.Shutdown(ctx); err != nil {
			return fmt.Errorf("server shutdown failed: %w", err)
		}
	}

	if err := database.Close(); err != nil {
		return fmt.Errorf("database cleanup failed: %w", err)
	}

	Loggers.GeneralLogger.Info().Msg("Successfully cleaned up application resources")
	return nil
}
