package config

import (
	"log/slog"
	"os"
)

// Config holds the application configuration.
type Config struct {
	// LogLevel is the minimum level to log at.
	LogLevel string
	// DataDir is the directory where traces are stored.
	DataDir string
	// ServerAddress is the address the HTTP server listens on.
	ServerAddress string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() Config {
	cfg := Config{
		LogLevel:      getEnv("RHQ_LOG_LEVEL", "info"),
		DataDir:       getEnv("RHQ_DATA_DIR", ".replayhq"),
		ServerAddress: getEnv("RHQ_SERVER_ADDRESS", ":8080"),
	}
	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// ParseLogLevel converts a string log level to slog.Level.
func (c Config) ParseLogLevel() slog.Level {
	switch c.LogLevel {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}