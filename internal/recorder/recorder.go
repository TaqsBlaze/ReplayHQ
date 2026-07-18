package recorder

import (
	"context"
	"io"
	"os"
	"os/signal"
	"syscall"
	"time"

	"replayhq/internal/events"
	"replayhq/internal/filesystem"
	"replayhq/internal/logger"
	"replayhq/internal/launcher"
	"replayhq/internal/storage"
)

// Recorder is responsible for capturing execution events.
type Recorder struct {
	launcher    *launcher.Launcher
	store       storage.Store
	eventCh     chan *events.Event
	proc        *launcher.Process
	outputWriter io.Writer
	startTime   time.Time
	watcher     *filesystem.Watcher
}

// NewRecorder creates a new Recorder that uses the given launcher and store.
// outputWriter is where the process's stdout/stderr will be written for display.
// If nil, output is discarded.
func NewRecorder(launcher *launcher.Launcher, store storage.Store, outputWriter io.Writer) *Recorder {
	if outputWriter == nil {
		outputWriter = io.Discard
	}
	return &Recorder{
		launcher:    launcher,
		store:       store,
		eventCh:     make(chan *events.Event, 100),
		outputWriter: outputWriter,
	}
}

// RecordEvent sends an event to the event channel.
func (r *Recorder) RecordEvent(ev *events.Event) {
	r.eventCh <- ev
}

// Start begins recording events. It blocks until the context is cancelled.
// It expects that Launch has been called to start a process.
func (r *Recorder) Start(ctx context.Context) error {
	// Start file system watcher.
	watcher := filesystem.NewWatcher(".", 0, r.eventCh)
	if err := watcher.Start(); err != nil {
		return err
	}
	r.watcher = watcher

	// Set up signal forwarding to the child process.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTSTP)
	go func() {
		for sig := range sigCh {
			if r.proc != nil {
				// Forward the signal to the child process.
				_ = r.proc.Signal(sig)
			}
		}
	}()

	// Wait for the process to finish.
	if r.proc != nil {
		// Wait for the process to exit.
		state, err := r.proc.Wait()
		var exitCode int
		if err != nil {
			// If we can't get the exit code, use -1 to indicate error.
			exitCode = -1
			logger.Error("Error waiting for process", "error", err)
		} else {
			exitCode = state.ExitCode()
		}
		// Stop signal forwarding to avoid sending signals to a reused PID.
		signal.Stop(sigCh)
		close(sigCh)

		// Stop the file system watcher.
		r.watcher.Close()

		// Calculate the duration since the process started.
		duration := time.Since(r.startTime)
		// Send a process exited event.
		r.eventCh <- &events.Event{
			Type:   "ProcessExited",
			Time:   time.Now(),
			Duration: duration,
			Data:   map[string]any{"exit": exitCode},
		}
		close(r.eventCh)
	}
	return nil
}

// Launch starts a command and begins recording its execution.
// It returns the started process and an error.
func (r *Recorder) Launch(cmd string, args []string) (*launcher.Process, error) {
	proc, err := r.launcher.Launch(cmd, args)
	if err != nil {
		return nil, err
	}
	r.proc = proc
	// Record the start time.
	r.startTime = time.Now()

	// Send a process started event.
	r.eventCh <- &events.Event{
		Type:   "ProcessStarted",
		Time:   r.startTime,
		Duration: 0, // Duration is zero at start.
		Data:   map[string]any{"cmd": cmd, "args": args},
	}

	// Start a goroutine to copy data from stdin to the process's pty master (stdin).
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := os.Stdin.Read(buf)
			if n > 0 {
				if _, err := proc.Write(buf[:n]); err != nil {
					// Ignore write errors? We could log but it might break the pipe.
					logger.Error("Error writing to process stdin", "error", err)
				}
			}
			if err != nil {
				if err != io.EOF {
					logger.Error("Error reading from stdin", "error", err)
				}
				// Close the master to signal EOF to the process.
				if err := proc.CloseMaster(); err != nil {
					logger.Error("Error closing process master", "error", err)
				}
				logger.Info("Stdin copy goroutine exiting")
				break
			}
		}
	}()

	// Start a goroutine to copy data from the process's pty to an event channel.
	// We'll read from the process's master and send output events.
	// We also write the data to the outputWriter for display.
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := proc.Read(buf)
			if n > 0 {
				// Write to the output writer (for display)
				if _, err := r.outputWriter.Write(buf[:n]); err != nil {
					// Ignore write errors? We could log but it might break the pipe.
					// We'll just ignore for now.
				}
				// Send event
				event := &events.Event{
					Type:   "Output",
					Time:   time.Now(),
					Duration: 0, // We don't have a meaningful duration for each chunk.
					Data:   map[string]any{"data": string(buf[:n])},
				}
				r.eventCh <- event
				logger.Info("Sent output event", "length", n)
			}
			if err != nil {
				if err != io.EOF {
					logger.Error("Error reading from process", "error", err)
				}
				logger.Info("Output goroutine exiting")
				break
			}
		}
	}()

	return proc, nil
}

// Stop stops the recorder and waits for the process to finish.
func (r *Recorder) Stop() error {
	if r.proc != nil {
		// Wait for the process to finish.
		_, err := r.proc.Wait()
		if err != nil {
			return err
		}
	}
	if r.watcher != nil {
		_ = r.watcher.Close()
	}
	close(r.eventCh)
	return nil
}