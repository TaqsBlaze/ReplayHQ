package recorder

import (
	"context"
	"io"
	"time"

	"replayhq/internal/events"
	"replayhq/internal/launcher"
	"replayhq/internal/storage"
)

// Recorder is responsible for capturing execution events.
type Recorder struct {
	launcher *launcher.Launcher
	store    storage.Store
	// We'll add a channel to receive events from the goroutine that monitors the process.
	eventCh chan *events.Event
	// We'll also keep track of the current process so we can wait for it.
	proc *launcher.Process
}

// RecordEvent sends an event to the event channel.
func (r *Recorder) RecordEvent(ev *events.Event) {
	r.eventCh <- ev
}

// NewRecorder creates a new Recorder that uses the given launcher and store.
func NewLauncher(launcher *launcher.Launcher, store storage.Store) *Recorder {
	return &Recorder{
		launcher: launcher,
		store:    store,
		eventCh:  make(chan *events.Event, 100),
	}
}

// Start begins recording events. It blocks until the context is cancelled.
// It expects that Launch has been called to start a process.
func (r *Recorder) Start(ctx context.Context) error {
	// We'll run a goroutine to forward events from eventCh to the store.
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case ev := <-r.eventCh:
				if err := r.store.AppendEvent(ev); err != nil {
					// Log the error but continue.
					// We could also send an error event?
					// For now, we just log.
					// We don't have a logger here, but we can use the global logger.
					// We'll import the logger package.
					// We'll do it later.
					_ = err
				}
			}
		}
	}()

	// Wait for the process to finish.
	if r.proc != nil {
		// Wait for the process to exit.
		_, err := r.proc.Wait()
		if err != nil {
			// Handle error
		}
		// Send a process exited event.
		r.eventCh <- &events.Event{
			Type:   "ProcessExited",
			Time:   time.Now(),
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

	// Send a process started event.
	r.eventCh <- &events.Event{
		Type:   "ProcessStarted",
		Time:   time.Now(),
		Data:   map[string]any{"cmd": cmd, "args": args},
	}

	// Start a goroutine to copy data from the process's pty to an event channel.
	// We'll read from the process's master and send output events.
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := proc.Read(buf)
			if n > 0 {
				r.eventCh <- &events.Event{
					Type:   "Output",
					Time:   time.Now(),
					Data:   map[string]any{"data": string(buf[:n])},
				}
			}
			if err != nil {
				if err != io.EOF {
					// Log error
				}
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
	close(r.eventCh)
	return nil
}