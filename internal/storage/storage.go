package storage

import (
	"encoding/json"
	"os"
	"path/filepath"

	event "replayhq/internal/events"
)

// Store is the interface for storing trace data.
type Store interface {
	// Init initializes the storage for a given trace ID.
	Init(traceID string) error
	// AppendEvent writes an event to the event log.
	AppendEvent(event *event.Event) error
	// Close closes the storage and releases any resources.
	Close() error
}

// FileStore implements Store using the local filesystem.
type FileStore struct {
	baseDir string
	eventFile *os.File
	encoder *json.Encoder
}

// NewFileStore creates a new FileStore that stores data in the given base directory.
func NewFileStore(baseDir string) Store {
	return &FileStore{
		baseDir: baseDir,
	}
}

// Init creates the directory structure for the trace and opens the event log file.
func (fs *FileStore) Init(traceID string) error {
	// Create the trace directory: baseDir/traceID/
	traceDir := filepath.Join(fs.baseDir, traceID)
	if err := os.MkdirAll(traceDir, 0o755); err != nil {
		return err
	}

	// Create subdirectories: files, patches, tools
	for _, dir := range []string{"files", "patches", "tools"} {
		if err := os.MkdirAll(filepath.Join(traceDir, dir), 0o755); err != nil {
			return err
		}
	}

	// Create metadata.json (empty for now)
	metaPath := filepath.Join(traceDir, "metadata.json")
	if _, err := os.Stat(metaPath); os.IsNotExist(err) {
		if err := os.WriteFile(metaPath, []byte("{}"), 0o644); err != nil {
			return err
		}
	}

	// Open events.jsonl for appending
	eventsPath := filepath.Join(traceDir, "events.jsonl")
	f, err := os.OpenFile(eventsPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return err
	}
	fs.eventFile = f
	fs.encoder = json.NewEncoder(f)

	// Create metrics.json (empty for now)
	metricsPath := filepath.Join(traceDir, "metrics.json")
	if _, err := os.Stat(metricsPath); os.IsNotExist(err) {
		if err := os.WriteFile(metricsPath, []byte("{}"), 0o644); err != nil {
			return err
		}
	}

	return nil
}

// AppendEvent writes the event as a JSON line to the events file.
func (fs *FileStore) AppendEvent(event *event.Event) error {
	if fs.eventFile == nil {
		return ErrStoreNotInitialized
	}
	return fs.encoder.Encode(event)
}

// Close closes the event file.
func (fs *FileStore) Close() error {
	if fs.eventFile != nil {
		return fs.eventFile.Close()
	}
	return nil
}

// ErrStoreNotInitialized is returned when trying to use a store that hasn't been initialized.
var ErrStoreNotInitialized = NewError("store not initialized")

// Error represents a storage error.
type Error struct {
	msg string
}

func NewError(msg string) Error {
	return Error{msg: msg}
}

func (e Error) Error() string {
	return e.msg
}

// Default is the default store used by the application.
var Default Store

// SetDefault sets the default store.
func SetDefault(s Store) {
	Default = s
}