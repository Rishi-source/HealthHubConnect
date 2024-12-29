package logger

import (
	"HealthHubConnect/config"
	"os"
	"path/filepath"

	"github.com/rs/zerolog"

	"gopkg.in/natefinch/lumberjack.v2"
)

// this var defines a global logger instance
var GlobalLogger *LoggerManager

type LoggerManager struct {
	ServerLogger  zerolog.Logger
	DBLogger      zerolog.Logger
	GeneralLogger zerolog.Logger
}

func createLogger(config config.LoggerConfig, filename string) zerolog.Logger {
	fullPath := filepath.Join(config.FilePath, filename)

	// to ensure logs directory exists
	logDir := filepath.Dir(fullPath)
	if err := os.MkdirAll(logDir, 0755); err != nil { //0755 creates dir with read/write permissions for owner and read permissions for others
		panic(err)
	}

	writer := &lumberjack.Logger{
		Filename:   fullPath,
		MaxSize:    config.MaxSize,
		MaxBackups: config.MaxBackups,
		MaxAge:     config.MaxAge,
		Compress:   config.Compress,
	}

	//console writer for development use during debuging
	consoleWriter := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: "2006-01-02 15:04:05",
	}

	multiWriter := zerolog.MultiLevelWriter(consoleWriter, writer)

	return zerolog.New(multiWriter).
		Level(config.Level).
		With().
		Timestamp().
		// Caller(). //for caller info i.e. which func falled it
		Logger()
}

func NewLoggerManager(config config.LoggerConfig) *LoggerManager {
	return &LoggerManager{
		ServerLogger:  createLogger(config, "server.log"),
		DBLogger:      createLogger(config, "database.log"),
		GeneralLogger: createLogger(config, "general.log"),
	}
}

// global logger
func InitializeLogger(config config.LoggerConfig) *LoggerManager {
	GlobalLogger = NewLoggerManager(config)
	return GlobalLogger
}

// GetLogger returns the global logger instance
func GetLogger() *LoggerManager {
	if GlobalLogger == nil {
		panic("Logger not initialized")
	}
	return GlobalLogger
}

//usage

// For server-related logs
// Loggers.ServerLogger.Info().Msg("Server event occurred")
// Loggers.ServerLogger.Error().Err(err).Msg("Server error")

// // For database-related logs
// Loggers.DBLogger.Info().Msg("Database operation successful")
// Loggers.DBLogger.Error().Err(err).Msg("Database error")

// // For general application logs
// Loggers.GeneralLogger.Info().Msg("Application event")
// Loggers.GeneralLogger.Warn().Msg("General warning")
