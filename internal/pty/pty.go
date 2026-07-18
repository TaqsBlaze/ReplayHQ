package pty

import (
	"os"
	"os/exec"

	"github.com/creack/pty"
	"golang.org/x/term"
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

	// Put the slave side of the PTY into raw mode.
	if err := term.MakeRaw(int(ptmx.Fd())); err != nil {
		ptmx.Close()
		return nil, nil, err
	}

	// Optionally set the window size based on the parent terminal.
	// We try to get the window size from stdin, stdout, or stderr.
	fd := uintptr(0)
	if isTerminal(int(os.Stdin.Fd())) {
		fd = os.Stdin.Fd()
	} else if isTerminal(int(os.Stdout.Fd())) {
		fd = os.Stdout.Fd()
	} else if isTerminal(int(os.Stderr.Fd())) {
		fd = os.Stderr.Fd()
	}
	if fd != 0 {
		if w, h, err := term.GetSize(int(fd)); err == nil {
			_ = pty.Setsize(ptmx.Fd(), &pty.Winsize{
				Rows: uint16(h),
				Cols: uint16(w),
			})
		}
	}

	// ptmx is the master side of the pty.
	// The process has been started, and we can get its process state via cmd.Process.
	return ptmx, cmd.Process, nil
}

// isTerminal returns true if the given file descriptor is a terminal.
func isTerminal(fd int) bool {
	_, err := term.GetSize(fd)
	return err == nil
}
