package launcher

import (
	"os"
	"os/exec"

	"replayhq/internal/process"
	"replayhq/internal/pty"
)

// Launcher is responsible for launching processes and setting up the execution environment.
type Launcher struct {
	procMgr *process.Manager
	ptyMgr  *pty.Manager
}

// NewLauncher creates a new Launcher.
func NewLauncher() *Launcher {
	return &Launcher{
		procMgr: process.NewManager(),
		ptyMgr:  pty.NewManager(),
	}
}

// Launch starts a new process with the given command and arguments.
// It returns a Process that represents the running process and an error.
// The Process includes the pty master so that the caller can read from and write to the process's stdio.
func (l *Launcher) Launch(cmd string, args []string) (*Process, error) {
	// Create the exec command.
	ec := exec.Command(cmd, args...)
	// Use the PTY to start the command.
	master, proc, err := l.ptyMgr.StartCommand(ec)
	if err != nil {
		return nil, err
	}
	// Return a Process that wraps the master file descriptor and the process.
	return &Process{
		master: master,
		proc:   proc,
	}, nil
}

// Process represents a launched process with its pty master.
type Process struct {
	master *os.File // master side of the pty, used to communicate with the process
	proc   *os.Process
}

// Read reads data from the process's stdout/stderr via the pty master.
func (p *Process) Read(b []byte) (int, error) {
	return p.master.Read(b)
}

// Write writes data to the process's stdin via the pty master.
func (p *Process) Write(b []byte) (int, error) {
	return p.master.Write(b)
}

// Close closes the pty master.
func (p *Process) Close() error {
	return p.master.Close()
}

// Wait waits for the process to exit and returns its exit status.
func (p *Process) Wait() (*os.ProcessState, error) {
	return p.proc.Wait()
}

// Signal sends a signal to the process.
func (p *Process) Signal(sig os.Signal) error {
	return p.proc.Signal(sig)
}

// CloseMaster closes the master side of the pty.
func (p *Process) CloseMaster() error {
	return p.master.Close()
}

// Master returns the master side of the pty.
func (p *Process) Master() *os.File {
	return p.master
}
