package main

import (
	"os"
	"os/signal"
	"syscall"

	appInit "HealthHubConnect/internal/init"
)

func main() {

	if err := appInit.Init(); err != nil {
		os.Exit(1)
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Wait for shutdown signal
	<-quit
	appInit.Loggers.GeneralLogger.Info().Msg("Shutting down application")

	// cleanup resources
	if err := appInit.Cleanup(); err != nil {
		appInit.Loggers.GeneralLogger.Error().Err(err).Msg("Failed to cleanup resources")
	}
}
