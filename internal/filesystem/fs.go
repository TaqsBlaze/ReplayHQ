package filesystem

import (
	"os"
	"path/filepath"
	"sync"
	"time"

	"replayhq/internal/events"
)

// Watcher watches a directory tree for changes and emits events.
type Watcher struct {
	root      string
	interval  time.Duration
	done      chan struct{}
	mu        sync.RWMutex
	tracker   map[string]os.FileInfo // path -> FileInfo
	eventChan chan *events.Event
}

// NewWatcher creates a new file watcher that polls the root directory every interval.
// If interval is 0, defaults to 1 second.
// eventChan is the channel where the watcher will send events.
func NewWatcher(root string, interval time.Duration, eventChan chan *events.Event) *Watcher {
	if interval <= 0 {
		interval = time.Second
	}
	return &Watcher{
		root:      root,
		interval:  interval,
		done:      make(chan struct{}),
		tracker:   make(map[string]os.FileInfo),
		eventChan: eventChan,
	}
}

// Add adds a path to watch. For simplicity, we only watch the root directory.
// Additional paths are ignored (could be extended to watch multiple roots).
func (w *Watcher) Add(path string) error {
	// We only support watching a single root directory for simplicity.
	// If the path is different from the current root, we ignore it.
	if path != w.root {
		// In a real implementation, we might add to a set of roots.
		// For now, we just return an error if the path differs.
		return nil
	}
	return nil
}

// Events returns a channel that receives file events.
func (w *Watcher) Events() <-chan *events.Event {
	return w.eventChan
}

// Close stops the watcher.
func (w *Watcher) Close() error {
	close(w.done)
	return nil
}

// Start begins watching for changes. It must be called after Add.
// It runs a polling loop in a goroutine.
func (w *Watcher) Start() error {
	// Initialize the tracker with current state.
	if err := w.scan(); err != nil {
		return err
	}
	// Start the polling loop.
	go w.poll()
	return nil
}

// scan walks the root directory and populates the tracker with current file info.
func (w *Watcher) scan() error {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.tracker = make(map[string]os.FileInfo)
	err := filepath.Walk(w.root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Skip the root directory itself? We'll include it.
		w.tracker[path] = info
		return nil
	})
	return err
}

// poll periodically scans for changes and sends events.
func (w *Watcher) poll() {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()
	for {
		select {
		case <-w.done:
			return
		case <-ticker.C:
			if err := w.checkChanges(); err != nil {
				// Log error but continue polling.
				// In a real implementation, we might want to log this.
				// For now, we just continue.
			}
		}
	}
}

// checkChanges compares the current state of the filesystem with the tracker
// and sends events for any changes.
func (w *Watcher) checkChanges() error {
	w.mu.Lock()
	defer w.mu.Unlock()

	// Build a map of current files.
	current := make(map[string]os.FileInfo)
	err := filepath.Walk(w.root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		current[path] = info
		return nil
	})
	if err != nil {
		return err
	}

	// Detect deleted or modified files: items in tracker but not in current, or with changed modtime.
	for path, oldInfo := range w.tracker {
		if newInfo, ok := current[path]; !ok {
			// File deleted.
			w.sendEvent(events.Event{
				Type:   "FileDeleted",
				Time:   time.Now(),
				Data:   map[string]any{"path": path},
			})
			delete(w.tracker, path)
		} else if !newInfo.ModTime().Equal(oldInfo.ModTime()) {
			// File modified (size, modtime, etc changed).
			w.sendEvent(events.Event{
				Type:   "FileModified",
				Time:   time.Now(),
				Data:   map[string]any{"path": path},
			})
			w.tracker[path] = newInfo
		}
	}

	// Detect new files: items in current but not in tracker.
	for path, newInfo := range current {
		if _, ok := w.tracker[path]; !ok {
			// File created.
			w.sendEvent(events.Event{
				Type:   "FileCreated",
				Time:   time.Now(),
				Data:   map[string]any{"path": path},
			})
			w.tracker[path] = newInfo
		}
	}

	return nil
}

// sendEvent sends an event to the event channel, non-blocking.
// If the channel is full, we drop the event to avoid blocking the poller.
func (w *Watcher) sendEvent(ev events.Event) {
	select {
	case w.eventChan <- &ev:
	default:
		// Drop event if channel is full.
		// In a real implementation, we might want to log or handle this.
	}
}

// Event represents a file system event.
type Event struct {
	Path string
	Op   Op
}

// Op represents the operation that triggered the event.
type Op string

const (
	Create Op = "CREATE"
	Write  Op = "WRITE"
	Remove Op = "REMOVE"
	Rename Op = "RENAME"
	Chmod  Op = "CHMOD"
)