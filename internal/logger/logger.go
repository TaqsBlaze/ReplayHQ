package logger

import (
	"log/slog"
	"os"
)

// New returns a new slog.Logger configured for the application.
func New(level slog.Level) *slog.Logger {
	// Use JSON output for structured logging.
	handler := slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: level,
	})
	return slog.New(handler)
}

var (
	// defaultLogger is the logger used by the default logger functions.
	defaultLogger *slog.Logger
)

// Init initializes the default logger with the given level. This should be called once at startup.
func Init(level slog.Level) {
	defaultLogger = New(level)
}

// SetDefault sets the default logger.
func SetDefault(l *slog.Logger) {
	defaultLogger = l
}

// Default returns the default logger, initializing it with Info level if necessary.
func Default() *slog.Logger {
	if defaultLogger == nil {
		Init(slog.LevelInfo)
	}
	return defaultLogger
}

// Info logs a message at Info level.
func Info(msg string, args ...any) {
	Default().Info(msg, args...)
}

// Error logs a message at Error level.
func Error(msg string, args ...any) {
	Default().Error(msg, args...)
}

// Warn logs a message at Warn level.
func Warn(msg string, args ...any) {
	Default().Warn(msg, args...)
}

// Debug logs a message at Debug level.
func Debug(msg string, args ...any) {
	Default().Debug(msg, args...)
}