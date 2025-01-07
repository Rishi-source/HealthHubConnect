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
	"googlemaps.github.io/maps"
	"gorm.io/gorm"
)

var (
	server     *http.Server
	Loggers    *logger.LoggerManager
	MapsClient *maps.Client
)

func Init() error {
	var err error
	Loggers = logger.InitializeLogger(env.Logger)

	// Initialize Google Maps client
	MapsClient, err = initGoogleMapsClient()
	if err != nil {
		Loggers.GeneralLogger.Error().Err(err).Msg("Failed to initialize Google Maps client")
		return err
	}
	Loggers.GeneralLogger.Info().Msg("Successfully initialized Google Maps client")

	database.InitDB()
	db, err := database.GetDB()
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

	// Setup routes (including admin routes)
	routes.SetupRoutes(router, db)

	port := env.ServerPort
	router.NotFoundHandler = http.HandlerFunc(handlers.StatusNotFoundHandler)
	server = &http.Server{
		Addr:         port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	// run server in a goroutine
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

	// The maps client doesn't need explicit cleanup

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

func initGoogleMapsClient() (*maps.Client, error) {
	// Create with just the API key since other options aren't available
	client, err := maps.NewClient(maps.WithAPIKey(env.GoogleMaps.APIKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Google Maps client: %w", err)
	}

	// Configure client through context timeouts when making requests
	// The actual timeout will be set per-request using context

	return client, nil
}

// Add a helper function to create context with timeout for Maps API calls
func CreateMapsContext() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), env.GoogleMaps.RequestTimeout)
}

// Add this getter function to access MapsClient from other packages
func GetMapsClient() *maps.Client {
	return MapsClient
}
