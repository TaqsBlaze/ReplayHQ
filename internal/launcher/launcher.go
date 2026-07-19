package launcher

import (
	"os"
	"os/exec"
	"sync"

	"golang.org/x/term"

	"replayhq/internal/process"
	internalpty "replayhq/internal/pty"
	pty "github.com/creack/pty"
)

// Launcher is responsible for launching processes and setting up the execution environment.
type Launcher struct {
	procMgr   *process.Manager
	ptyMgr    *internalpty.Manager
	mu        sync.Mutex
	currentMaster *os.File
	signalChan chan os.Signal
	doneChan   chan struct{}
}

// NewLauncher creates a new Launcher.
func NewLauncher() *Launcher {
	l := &Launcher{
		procMgr:   process.NewManager(),
		ptyMgr:    internalpty.NewManager(),
		signalChan: make(chan os.Signal, 1),
		doneChan:   make(chan struct{}),
	}
	// Notify on window size changes.
	go func() {
		for {
			select {
			case <-l.signalChan:
				l.mu.Lock()
				m := l.currentMaster
				l.mu.Unlock()
				if m != nil {
					// Get the window size from the terminal (stdin, stdout, stderr)
					var w, h int
					var err error
					if w, h, err = term.GetSize(int(os.Stdin.Fd())); err == nil {
					} else if w, h, err = term.GetSize(int(os.Stdout.Fd())); err == nil {
					} else if w, h, err = term.GetSize(int(os.Stderr.Fd())); err == nil {
					}
					if err == nil {
						_ = pty.Setsize(m, &pty.Winsize{
							Rows: uint16(h),
							Cols: uint16(w),
						})
					}
				}
			case <-l.doneChan:
				return
			}
		}
	}()
	return l
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
	// Set the current master for WINCH handling.
	l.mu.Lock()
	l.currentMaster = master
	l.mu.Unlock()
	// Return a Process that wraps the master file descriptor and the process.
	return &Process{
		master:   master,
		proc:     proc,
		launcher: l,
	}, nil
}

// Close signals the listener to stop and waits for it to finish.
// Call when the launcher is no longer needed.
func (l *Launcher) Close() {
	close(l.doneChan)
}

// Process represents a launched process with its pty master.
type Process struct {
	master   *os.File
	proc     *os.Process
	launcher *Launcher // back reference to allow cleanup
}

// Read reads data from the process's stdout/stderr via the pty master.
func (p *Process) Read(b []byte) (int, error) {
	return p.master.Read(b)
}

// Write writes data to the process's stdin via the pty master.
func (p *Process) Write(b []byte) (int, error) {
	return p.master.Write(b)
}

// Close closes the pty master and notifies the launcher to clear the current master if it matches.
func (p *Process) Close() error {
	err := p.master.Close()
	if p.launcher != nil {
		p.launcher.mu.Lock()
		if p.launcher.currentMaster == p.master {
			p.launcher.currentMaster = nil
		}
		p.launcher.mu.Unlock()
	}
	return err
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
