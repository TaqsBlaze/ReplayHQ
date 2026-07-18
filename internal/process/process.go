package process

import (
	"os"
	"os/exec"
)

// Manager manages processes.
type Manager struct{}

// NewManager creates a new process manager.
func NewManager() *Manager {
	return &Manager{}
}

// Start starts the given command and returns the process.
// It does not wait for the command to complete.
func (m *Manager) Start(cmd *exec.Cmd) (*os.Process, error) {
	if err := cmd.Start(); err != nil {
		return nil, err
	}
	return cmd.Process, nil
}