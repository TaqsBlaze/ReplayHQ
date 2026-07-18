package events

import (
	"strconv"
	"time"
)

// Event represents a single observability event in the system.
type Event struct {
	ID        string            `json:"id"`
	Type      string            `json:"type"`
	Time      time.Time         `json:"time"`
	Duration  time.Duration     `json:"duration,omitempty"`
	Source    string            `json:"source,omitempty"`
	Data      map[string]any    `json:"data,omitempty"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

// New creates a new Event with the given type and source.
func New(eventType, source string) *Event {
	return &Event{
		ID:      generateID(),
		Type:    eventType,
		Time:    time.Now(),
		Source:  source,
		Data:    make(map[string]any),
		Metadata: make(map[string]string),
	}
}

// WithData adds data to the event.
func (e *Event) WithData(key string, value any) *Event {
	e.Data[key] = value
	return e
}

// WithMetadata adds metadata to the event.
func (e *Event) WithMetadata(key, value string) *Event {
	e.Metadata[key] = value
	return e
}

// WithDuration sets the duration of the event.
func (e *Event) WithDuration(d time.Duration) *Event {
	e.Duration = d
	return e
}

// generateID creates a simple unique ID. In a real implementation, you might use UUID or snowflake.
func generateID() string {
	// For simplicity, we use nano time. Not guaranteed unique but sufficient for demo.
	// TODO: replace with a proper UUID or snowflake implementation.
	return string(nowNano())
}

// nowNano returns current time as nanoseconds epoch as a string.
func nowNano() []byte {
	return []byte(strconv.FormatInt(time.Now().UnixNano(), 10))
}