package storage

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"

	"replayhq/internal/events"
	"replayhq/internal/logger"
)

// Store is the interface for storing trace data.
type Store interface {
	// Init initializes the storage for a given trust ID.
	Init(traceID string) error
	// AppendEvent writes an event to the event log.
	AppendEvent(event *events.Event) error
	// LoadEvents returns all events stored for the trace in chronological order.
	LoadEvents() ([]*events.Event, error)
	// Close closes the storage and releases any resources.
	Close() error
}

// Error represents a storage error.
type Error struct {
	msg string
}

// NewError returns a new error with the given message.
func NewError(msg string) Error {
	return Error{msg: msg}
}

func (e Error) Error() string {
	return e.msg
}

// ErrStoreNotInitialized is returned when trying to use a store that hasn't been initialized.
var ErrStoreNotInitialized = NewError("store not initialized")

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
// It creates the subdirectories: files, patches, tools.
// It also creates metadata.json and metrics.json files (empty).
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

	// Open events.jsonl for reading and writing, appending writes.
	eventsPath := filepath.Join(traceDir, "events.jsonl")
	f, err := os.OpenFile(eventsPath, os.O_CREATE|os.O_RDWR|os.O_APPEND, 0o644)
	if err != nil {
		return err
	}
	fs.eventFile = f
	fs.encoder = json.NewEncoder(f)
	// We don't want to escape HTML characters in the JSON output.
	fs.encoder.SetEscapeHTML(false)

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
func (fs *FileStore) AppendEvent(event *events.Event) error {
	if fs.eventFile == nil {
		return ErrStoreNotInitialized
	}
	logger.Info("Appending event to store", "type", event.Type)
	if err := fs.encoder.Encode(event); err != nil {
		logger.Error("Failed to encode event", "error", err)
		return err
	}
	// Ensure the data is written to disk.
	if err := fs.eventFile.Sync(); err != nil {
		logger.Error("Failed to sync event file", "error", err)
		return err
	}
	return nil
}

// LoadEvents returns all events stored for the trace in chronological order.
func (fs *FileStore) LoadEvents() ([]*events.Event, error) {
	if fs.eventFile == nil {
		return nil, ErrStoreNotInitialized
	}
	// We need to read from the beginning of the file.
	// First, seek to the start.
	if _, err := fs.eventFile.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}
	// Create a decoder for the file.
	dec := json.NewDecoder(fs.eventFile)
	var eventList []*events.Event
	for {
		var ev events.Event
		if err := dec.Decode(&ev); err != nil {
			if err == io.EOF {
				break
			}
			return nil, err
		}
		eventList = append(eventList, &ev)
	}
	// Reset the file offset to the end for future appends.
	if _, err := fs.eventFile.Seek(0, io.SeekEnd); err != nil {
		return nil, err
	}
	return eventList, nil
}

// Close closes the event file.
func (fs *FileStore) Close() error {
	if fs.eventFile != nil {
		return fs.eventFile.Close()
	}
	return nil
}