package timeline

import (
	"fmt"
	"strings"
	"time"

	"replayhq/internal/events"
)

// FormatEvent formats an event as a string suitable for display in a timeline.
func FormatEvent(e *events.Event) string {
	return fmt.Sprintf("%s %s %s", e.Time.Format("15:04:05.000"), e.Type, formatData(e.Data))
}

// formatData formats the event data as a string.
func formatData(data map[string]any) string {
	if len(data) == 0 {
		return ""
	}
	// For simplicity, we just show the first key-value pair.
	// In a real implementation, we might format it more nicely.
	for k, v := range data {
		return fmt.Sprintf("%s=%v", k, v)
	}
	return ""
}

// Timeline represents a collection of events in chronological order.
type Timeline []*events.Event

// NewTimeline creates a new timeline from the given events.
func NewTimeline(events []*events.Event) Timeline {
	return append(Timeline{}, events...)
}

// String returns a string representation of the timeline.
func (t Timeline) String() string {
	if len(t) == 0 {
		return "<empty timeline>"
	}
	var lines []string
	for _, e := range t {
		lines = append(lines, FormatEvent(e))
	}
	return "\n" + joinLines(lines) + "\n"
}

// joinLines joins the lines with newline.
func joinLines(lines []string) string {
	if len(lines) == 0 {
		return ""
	}
	return strings.Join(lines, "\n")
}