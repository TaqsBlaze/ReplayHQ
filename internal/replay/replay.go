package replay

import (
	"context"
	"fmt"
	"os"
	"time"

	"replayhq/internal/events"
	"replayhq/internal/storage"
)

// Replayer can replay a trace.
type Replayer struct {
	store storage.Store
}

// NewReplayer creates a new Replayer that uses the given store.
func NewReplayer(store storage.Store) *Replayer {
	return &Replayer{store: store}
}

// Load loads a trace with the given ID from the store.
// The store must be initialized with Init before calling Load.
func (r *Replayer) Load(traceID string) ([]*events.Event, error) {
	if err := r.store.Init(traceID); err != nil {
		return nil, fmt.Errorf("failed to initialize store: %w", err)
	}
	fmt.Fprintf(os.Stderr, "[replay] store initialized for traceID %s\n", traceID)
	events, err := r.store.LoadEvents()
	if err != nil {
		// If loading fails, we still want to close the store to avoid leaking resources.
		fmt.Fprintf(os.Stderr, "[replay] LoadEvents failed: %v\n", err)
		_ = r.store.Close()
		return nil, fmt.Errorf("failed to load events: %w", err)
	}
	fmt.Fprintf(os.Stderr, "[replay] loaded %d events\n", len(events))
	// Close the store after successfully loading events.
	_ = r.store.Close()
	return events, nil
}

// Replay replays the given events by printing them with timestamps and waiting for the duration between events.
// This simulates real-time replay.
func (r *Replayer) Replay(ctx context.Context, events []*events.Event) error {
	if len(events) == 0 {
		fmt.Println("No events to replay.")
		return nil
	}
	var prevTime time.Time
	for i, ev := range events {
		if i == 0 {
			prevTime = ev.Time
		} else {
			// Wait for the duration since the previous event.
			duration := ev.Time.Sub(prevTime)
			if duration > 0 {
				// Wait for the duration, but check for cancellation.
				timer := time.NewTimer(duration)
				select {
				case <-ctx.Done():
					timer.Stop()
					return ctx.Err()
				case <-timer.C:
				}
			}
		}
		// Print the event with timestamp and type.
		fmt.Printf("%s %s\n", ev.Time.Format("15:04:05.000"), ev.Type)
		// Print event data if any.
		if len(ev.Data) > 0 {
			for k, v := range ev.Data {
				fmt.Printf("  %s: %v\n", k, v)
			}
		}
		prevTime = ev.Time
	}
	return nil
}