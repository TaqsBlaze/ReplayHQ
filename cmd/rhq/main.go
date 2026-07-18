package main

import (
	"context"
	"io"
	"os"
	"os/signal"

	"github.com/spf13/cobra"

	"log/slog"

	"replayhq/internal/config"
	"replayhq/internal/launcher"
	"replayhq/internal/logger"
	"replayhq/internal/recorder"
	"replayhq/internal/storage"
)

func main() {
	// Root command
	var rootCmd = &cobra.Command{
		Use:   "rhq",
		Short: "ReplayHQ - AI coding agent flight recorder",
		Long:  `ReplayHQ records, observes, analyzes, and replays AI-assisted development sessions.`,
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			// Load configuration
			cfg := config.Load()
			// Configure logger based on config
			setupLogger(cfg)
			// Initialize storage
			initStorage(cfg)
		},
		Run: func(cmd *cobra.Command, args []string) {
			logger.Info("ReplayHQ started")
		},
	}

	// Subcommands
	rootCmd.AddCommand(versionCmd())
	rootCmd.AddCommand(runCmd())
	rootCmd.AddCommand(runsCmd())
	rootCmd.AddCommand(replayCmd())
	rootCmd.AddCommand(inspectCmd())

	// Handle Ctrl+C gracefully
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	if err := rootCmd.ExecuteContext(ctx); err != nil {
		logger.Error("Command execution failed", "error", err)
		os.Exit(1)
	}
}

// setupLogger configures the global logger based on the configuration.
func setupLogger(cfg config.Config) {
	var level slog.Level
	switch cfg.LogLevel {
	case "debug":
		level = slog.LevelDebug
	case "info":
		level = slog.LevelInfo
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}
	handler := slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: level,
	})
	logger.SetDefault(slog.New(handler))
}

// initStorage initializes the storage for the application.
func initStorage(cfg config.Config) {
	// Create a file store
	store := storage.NewFileStore(cfg.DataDir)
	// Initialize the store with a default trace ID (for now)
	// In a real application, we would generate a trace ID for each run.
	if err := store.Init("default"); err != nil {
		logger.Error("Failed to initialize storage", "error", err)
		os.Exit(1)
	}
	// Store the store in a global variable for use by subcommands
	storage.Default = store
}

// versionCmd returns the version command.
func versionCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Print the version number of ReplayHQ",
		Long:  `All software has versions. This is ReplayHQ's.`,
		Run: func(cmd *cobra.Command, args []string) {
			logger.Info("ReplayHQ version v0.1.0")
		},
	}
}

// runCmd returns the run command.
func runCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "run [command]",
		Short: "Run a command and record its execution",
		Long: `Run executes the specified command and records all events
during its execution for later replay and analysis.`,
		Args: cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			// Create a launcher.
			launcher := launcher.NewLauncher()
			// Start the process via the launcher.
			proc, err := launcher.Launch(args[0], args[1:])
			if err != nil {
				logger.Error("Failed to launch command", "error", err)
				return
			}
			// Copy the process's output to stdout in a goroutine.
			done := make(chan struct{})
			go func() {
				buf := make([]byte, 1024)
				for {
					n, err := proc.Read(buf)
					if n > 0 {
						if _, err := os.Stdout.Write(buf[:n]); err != nil {
							logger.Error("Failed to write to stdout", "error", err)
						}
					}
					if err != nil {
						if err != io.EOF {
							logger.Error("Error reading from process", "error", err)
						}
						break
					}
				}
				close(done)
			}()
			// Wait for the process to finish.
			state, err := proc.Wait()
			if err != nil {
				logger.Error("Error waiting for process", "error", err)
			}
			// Wait for the copy goroutine to finish.
			<-done
			// Log the exit status.
			logger.Info("Command finished", "exit_code", state.ExitCode())
		},
	}
}

// runsCmd returns the runs command.
func runsCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "runs",
		Short: "List recorded runs",
		Long:  `Lists all recorded runs (traces) that can be replayed.`,
		Run: func(cmd *cobra.Command, args []string) {
			// TODO: list runs from storage
			logger.Info("Listing runs (not implemented yet)")
		},
	}
}

// replayCmd returns the replay command.
func replayCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "replay [id]",
		Short: "Replay a recorded run",
		Long:  `Replay executes a previously recorded run, allowing you to observe the exact sequence of events.`,
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			// TODO: replay the run with the given ID
			logger.Info("Replaying run", "id", args[0])
		},
	}
}

// inspectCmd returns the inspect command.
func inspectCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "inspect [id]",
		Short: "Inspect a recorded run",
		Long:  `Inspect shows detailed information about a recorded run, including events, metrics, and file changes.`,
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			// TODO: inspect the run with the given ID
			logger.Info("Inspecting run", "id", args[0])
		},
	}
}