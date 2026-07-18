package pty

import (
	"os"
	"os/exec"

	"github.com/creack/pty"
)

// Manager manages pseudoterminals.
type Manager struct{}

// NewManager creates a new PTY manager.
func NewManager() *Manager {
	return &Manager{}
}

// StartCommand starts the given command with a pseudoterminal.
// It returns the master file descriptor (to communicate with the process),
// the underlying process, and an error if any.
// The caller is responsible for closing the master file descriptor when done.
func (m *Manager) StartCommand(cmd *exec.Cmd) (*os.File, *os.Process, error) {
	// Start the command with a pseudoterminal.
	// pty.Start returns the master side of the pty and starts the command.
	ptmx, err := pty.Start(cmd)
	if err != nil {
		return nil, nil, err
	}
	// ptmx is the master side of the pty.
	// The process has been started, and we can get its process state via cmd.Process.
	return ptmx, cmd.Process, nil
}