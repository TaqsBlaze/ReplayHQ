package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	"github.com/spf13/cobra"

	"log/slog"

	"replayhq/internal/config"
	"replayhq/internal/events"
	"replayhq/internal/launcher"
	"replayhq/internal/logger"
	"replayhq/internal/recorder"
	"replayhq/internal/replay"
	"replayhq/internal/server"
	"replayhq/internal/storage"
)

var configVar config.Config

func main() {
	// Root command
	var rootCmd = &cobra.Command{
		Use:   "rhq",
		Short: "ReplayHQ - AI coding agent flight recorder",
		Long:  `ReplayHQ records, observes, analyzes, and replays AI-assisted development sessions.`,
		PersistentPreRun: func(cmd *cobra.Command, args []string) {
			// Load configuration
			configVar = config.Load()
			// Configure logger based on config
			setupLogger(configVar)
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
	rootCmd.AddCommand(serverCmd())

	// Handle Ctrl+C gracefully
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	if err := rootCmd.ExecuteContext(ctx); err != nil {
		logger.Error("Command execution failed", "error", err)
		os.Exit(1)
	}
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
		Long:  `Run executes the specified command and records all events
during its execution for later replay and analysis.`,
		Args: cobra.MinimumNArgs(1),
		DisableFlagParsing: true,
		Run: func(cmd *cobra.Command, args []string) {
			// Use the global configuration
			cfg := configVar
			// Create a new store for this trace
			store := storage.NewFileStore(cfg.DataDir)
			// Generate a unique trace ID
			traceID := fmt.Sprintf("trace-%d", time.Now().UnixNano())
			if err := store.Init(traceID); err != nil {
				logger.Error("Failed to initialize storage for trace", "error", err)
				return
			}
			// Ensure the store is closed when we're done.
			defer store.Close()
			// Set up logging to a file inside the track directory to avoid interfering with command output.
			traceDir := filepath.Join(cfg.DataDir, traceID)
			logFile, err := os.OpenFile(filepath.Join(traceDir, "replayhq.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
			var logWriter io.Writer
			if err != nil {
				// If we cannot create log file, discard logs to avoid breaking the command.
				logWriter = io.Discard
			} else {
				logWriter = logFile
				// Ensure the log file is closed at the end.
				defer logFile.Close()
			}
			// Override the default logger to write to our log writer (discard or file).
			logger.SetDefault(slog.New(slog.NewJSONHandler(logWriter, &slog.HandlerOptions{Level: slog.LevelInfo})))
			// Create a recorder that writes output to stdout
			recorder := recorder.NewRecorder(launcher.NewLauncher(), store, os.Stdout)
			// Launch the process and start recording
			if _, err := recorder.Launch(args[0], args[1:]); err != nil {
				logger.Error("Failed to launch command", "error", err)
				return
			}
			// Start recording events and wait for the process to finish
			if err := recorder.Start(context.Background()); err != nil {
				logger.Error("Error during recording", "error", err)
			}
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
			// List all subdirectories in the data directory.
			files, err := os.ReadDir(configVar.DataDir)
			if err != nil {
				logger.Error("Failed to read data directory", "error", err)
				return
			}
			var traces []string
			for _, f := range files {
				if f.IsDir() {
					// Optionally, we can check if it looks like a trace (has events.jsonl)
					traces = append(traces, f.Name())
				}
			}
			if len(traces) == 0 {
				logger.Info("No runs found")
				return
			}
			for _, t := range traces {
				logger.Info("Found run", "id", t)
			}
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
			traceID := args[0]
			// Create a store for the trace.
			store := storage.NewFileStore(configVar.DataDir)
			// Create a replayer.
			rp := replay.NewReplayer(store)
			// Load events from the trace.
			events, err := rp.Load(traceID)
			if err != nil {
				logger.Error("Failed to load trace", "error", err)
				return
			}
			// Set up context to handle cancellation (Ctrl+C).
			ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
			defer stop()
			// Replay the events.
			if err := rp.Replay(ctx, events); err != nil {
				if err != context.Canceled {
					logger.Error("Error during replay", "error", err)
				} else {
					logger.Info("Replay stopped by user")
				}
			}
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
			traceID := args[0]
			traceDir := filepath.Join(configVar.DataDir, traceID)
			eventsPath := filepath.Join(traceDir, "events.jsonl")
			f, err := os.Open(eventsPath)
			if err != nil {
				logger.Error("Failed to open events file", "error", err)
				return
			}
			defer f.Close()
			dec := json.NewDecoder(f)
			var eventList []*events.Event
			for {
				var e events.Event
				if err := dec.Decode(&e); err != nil {
					if errors.Is(err, io.EOF) {
						break
					}
					logger.Error("Failed to decode event", "error", err)
					return
				}
				eventList = append(eventList, &e)
			}
			if len(eventList) == 0 {
				logger.Info("No events found in trace", "id", traceID)
				return
			}
			for _, e := range eventList {
				fmt.Printf("%s %s\n", e.Time.Format("15:04:05.000"), e.Type)
				for k, v := range e.Data {
					fmt.Printf("  %s: %v\n", k, v)
				}
			}
		},
	}
}

// serverCmd returns the server command.
func serverCmd() *cobra.Command {
	var addr string
	cmd := &cobra.Command{
		Use:   "server",
		Short: "Start the HTTP/WebSocket server",
		Long:  `Starts the HTTP and WebSocket server for accessing traces and streaming events.`,
		Run: func(cmd *cobra.Command, args []string) {
			if addr == "" {
				addr = ":8080"
			}
			// Ensure the address is valid; if not, use a default.
			if _, _, err := net.SplitHostPort(addr); err != nil {
				logger.Error("Invalid address format", "error", err)
				os.Exit(1)
			}
			s := server.NewServer(addr, configVar.DataDir)
			s.Start()
		},
	}
	cmd.Flags().StringVarP(&addr, "address", "a", "", "Server address (e.g., :8080)")
	return cmd
}

// setupLogger configures the global logger based on the configuration.
func setupLogger(cfg config.Config) {
	var level slog.Level
	switch cfg.LogLevel {
	case "debug":
		level = slog.LevelDebug
		logger.Info("Setting log level to debug")
	case "info":
		level = slog.LevelInfo
		logger.Info("Setting log level to info")
	case "warn":
		level = slog.LevelWarn
		logger.Info("Setting log level to warn")
	case "error":
		level = slog.LevelError
		logger.Info("Setting log level to error")
	default:
		level = slog.LevelInfo
		logger.Info("Setting log level to info (default)")
	}
	handler := slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: level,
	})
	logger.SetDefault(slog.New(handler))
}