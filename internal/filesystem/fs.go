package filesystem

// Watcher watches files and directories for changes.
type Watcher struct{}

// NewWatcher creates a new file watcher.
func NewWatcher() *Watcher {
	return &Watcher{}
}

// Add adds a path to watch.
func (w *Watcher) Add(path string) error {
	return nil
}

// Events returns a channel that receives file events.
// This is a stub implementation.
func (w *Watcher) Events() <-chan Event {
	return make(chan Event)
}

// Close closes the watcher and releases any resources.
func (w *Watcher) Close() error {
	return nil
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