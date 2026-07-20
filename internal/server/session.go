package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"sync"
	"sync/atomic"
	"time"

	"github.com/creack/pty"
	"golang.org/x/term"

	"replayhq/internal/events"
	"replayhq/internal/logger"
	"replayhq/internal/storage"
)

// Session is a single live PTY-backed run.
//
// One Session is created per POST /sessions call. It owns:
//   - the PTY master file descriptor (the only way to read/write the child)
//   - the child *os.Process
//   - a storage.FileStore that records the same events the CLI recorder emits
//
// The struct is safe for concurrent use; the only mutable state that needs
// locking is the lifecycle bits and the list of attached WebSocket clients.
type Session struct {
	ID        string
	Cmd       string
	Args      []string
	StartedAt time.Time
	EndedAt   atomic.Pointer[time.Time]
	ExitCode  atomic.Int32

	baseDir string
	store   storage.Store
	master  *os.File
	proc    *os.Process

	mu      sync.Mutex
	closed  bool
	status  string // "running" | "exited"
	clients map[*sessionClient]struct{}
}

// sessionClient is the small per-WebSocket-connection state.
// Writes to the channel are non-blocking; the connection is dropped if the
// client cannot keep up.
type sessionClient struct {
	out chan []byte // buffer of encoded wsFrame bytes
}

const sessionClientBuffer = 64

// newSession creates a Session record but does not start the child process.
// Use Session.Start to actually launch the command and begin I/O.
func newSession(id, cmd string, args []string, baseDir string) *Session {
	return &Session{
		ID:        id,
		Cmd:       cmd,
		Args:      args,
		StartedAt: time.Now(),
		baseDir:   baseDir,
		status:    "running",
		clients:   make(map[*sessionClient]struct{}),
	}
}

// Start launches the command under a PTY, wires the file store, and
// kicks off the read pump. The read pump records Output events to the store
// and pushes encoded frames to all currently attached clients.
//
// cols/rows are the initial PTY window size; clients may resize later.
func (s *Session) Start(cols, rows int) error {
	store := storage.NewFileStore(s.baseDir)
	if err := store.Init(s.ID); err != nil {
		return fmt.Errorf("init store: %w", err)
	}
	s.store = store

	// Record ProcessStarted before launching so /runs picks up the agent name
	// even if the child fails to start.
	startEvent := &events.Event{
		Type:      "ProcessStarted",
		Time:      s.StartedAt,
		Duration:  0,
		Data:      map[string]any{"cmd": s.Cmd, "args": s.Args, "cols": cols, "rows": rows},
	}
	if err := store.AppendEvent(startEvent); err != nil {
		_ = store.Close()
		return fmt.Errorf("append ProcessStarted: %w", err)
	}

	// Build the child command. Disable the process group so signals from the
	// controlling terminal are not propagated to the rhq server itself.
	ec := exec.Command(s.Cmd, s.Args...)
	ec.Env = append(os.Environ(), "TERM=xterm-256color")

	master, err := pty.Start(ec)
	if err != nil {
		s.recordExit(-1, fmt.Errorf("pty.Start: %w", err))
		return err
	}
	s.master = master
	s.proc = ec.Process

	// Slave is already in raw mode via pty.Start; set an initial window size.
	if cols > 0 && rows > 0 {
		_ = pty.Setsize(master, &pty.Winsize{Rows: uint16(rows), Cols: uint16(cols)})
	}

	// Read pump: PTY master -> Output events + WS broadcast.
	go s.pump()

	// Wait pump: child exit -> record + close + notify clients.
	go s.waitAndClose()

	return nil
}

// pump reads from the PTY master, appends each chunk as an Output event, and
// broadcasts it to all attached WebSocket clients. It exits when the master
// returns EOF (which happens after waitAndClose closes it).
func (s *Session) pump() {
	defer func() {
		if r := recover(); r != nil {
			logger.Error("session pump panic", "id", s.ID, "recover", r)
		}
	}()
	buf := make([]byte, 4096)
	for {
		n, err := s.master.Read(buf)
		if n > 0 {
			chunk := make([]byte, n)
			copy(chunk, buf[:n])

			ev := &events.Event{
				Type:     "Output",
				Time:     time.Now(),
				Duration: 0,
				Data:     map[string]any{"data": string(chunk)},
			}
			if s.store != nil {
				if err := s.store.AppendEvent(ev); err != nil {
					logger.Error("append Output event", "id", s.ID, "error", err)
				}
			}
			s.broadcast(wsFrame{Type: "stdout", Data: string(chunk)})
		}
		if err != nil {
			if !errors.Is(err, io.EOF) {
				logger.Debug("pty read end", "id", s.ID, "error", err)
			}
			return
		}
	}
}

// waitAndClose blocks on the child process, then records ProcessExited and
// closes the master so attached clients see an exit frame.
func (s *Session) waitAndClose() {
	state, err := s.proc.Wait()
	exitCode := -1
	if err == nil && state != nil {
		exitCode = state.ExitCode()
	}
	s.recordExit(exitCode, nil)
}

// recordExit finalises the session. It is safe to call more than once; only
// the first call has an effect.
func (s *Session) recordExit(code int, _ error) {
	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		return
	}
	s.closed = true
	s.status = "exited"
	now := time.Now()
	s.EndedAt.Store(&now)
	s.ExitCode.Store(int32(code))
	closeClients := s.clients
	s.clients = make(map[*sessionClient]struct{})
	s.mu.Unlock()

	// Best-effort store close.
	if s.store != nil {
		ev := &events.Event{
			Type:     "ProcessExited",
			Time:     now,
			Duration: now.Sub(s.StartedAt),
			Data:     map[string]any{"exit": code},
		}
		if err := s.store.AppendEvent(ev); err != nil {
			logger.Error("append ProcessExited", "id", s.ID, "error", err)
		}
		if err := s.store.Close(); err != nil {
			logger.Error("close store", "id", s.ID, "error", err)
		}
	}

	// Close the PTY master; this unblocks the read pump.
	if s.master != nil {
		_ = s.master.Close()
	}

	// Tell every attached client the run is over.
	frame, _ := json.Marshal(wsFrame{Type: "exit", Code: code})
	for c := range closeClients {
		select {
		case c.out <- frame:
		default:
		}
		close(c.out)
	}
}

// Write forwards bytes from the client to the PTY stdin. Returns the number
// of bytes accepted and any I/O error. A closed session returns 0, io.ErrClosedPipe.
func (s *Session) Write(p []byte) (int, error) {
	s.mu.Lock()
	closed := s.closed
	master := s.master
	s.mu.Unlock()
	if closed || master == nil {
		return 0, io.ErrClosedPipe
	}
	return master.Write(p)
}

// Resize updates the PTY window size. A zero value in either dimension is
// ignored.
func (s *Session) Resize(cols, rows int) error {
	if cols <= 0 || rows <= 0 {
		return nil
	}
	s.mu.Lock()
	master := s.master
	closed := s.closed
	s.mu.Unlock()
	if closed || master == nil {
		return errors.New("session closed")
	}
	return pty.Setsize(master, &pty.Winsize{Rows: uint16(rows), Cols: uint16(cols)})
}

// Kill sends SIGTERM, then SIGKILL after a short grace period.
func (s *Session) Kill() {
	s.mu.Lock()
	closed := s.closed
	proc := s.proc
	s.mu.Unlock()
	if closed || proc == nil {
		return
	}
	_ = proc.Signal(unix_sigterm())
	go func() {
		// Give the child 2 seconds to exit cleanly, then SIGKILL.
		time.Sleep(2 * time.Second)
		s.mu.Lock()
		stillClosed := s.closed
		s.mu.Unlock()
		if !stillClosed {
			_ = proc.Signal(unix_sigkill())
		}
	}()
}

// Attach registers a new WebSocket client and returns the client object and
// a channel that receives JSON-encoded wsFrame bytes. The caller must detach
// the client when done.
func (s *Session) Attach() (*sessionClient, chan []byte) {
	c := &sessionClient{out: make(chan []byte, sessionClientBuffer)}
	s.mu.Lock()
	closed := s.closed
	if !closed {
		s.clients[c] = struct{}{}
	}
	s.mu.Unlock()
	if closed {
		close(c.out)
	}
	return c, c.out
}

// Detach removes a client from the broadcast list. Safe to call after Attach
// even if the session is already closed.
func (s *Session) Detach(c *sessionClient) {
	s.mu.Lock()
	if s.clients != nil {
		delete(s.clients, c)
	}
	s.mu.Unlock()
}

// Status returns a snapshot of the session's lifecycle.
func (s *Session) Status() (status string, startedAt, endedAt time.Time, exitCode int) {
	s.mu.Lock()
	status = s.status
	s.mu.Unlock()
	endedPtr := s.EndedAt.Load()
	if endedPtr != nil {
		endedAt = *endedPtr
	}
	exitCode = int(s.ExitCode.Load())
	return status, s.StartedAt, endedAt, exitCode
}

// broadcast sends an encoded frame to every attached client, dropping the
// frame for clients whose buffer is full.
func (s *Session) broadcast(f wsFrame) {
	frame, err := json.Marshal(f)
	if err != nil {
		return
	}
	s.mu.Lock()
	clients := make([]*sessionClient, 0, len(s.clients))
	for c := range s.clients {
		clients = append(clients, c)
	}
	s.mu.Unlock()
	for _, c := range clients {
		select {
		case c.out <- frame:
		default:
			// client is too slow; drop frame
		}
	}
}

// ForceTerminal puts the PTY master into raw mode. Useful for clients that
// don't go through MakeRaw themselves.
func (s *Session) ForceTerminal() {
	s.mu.Lock()
	master := s.master
	s.mu.Unlock()
	if master == nil {
		return
	}
	// Best effort: ignore errors since the slave side is already raw.
	_, _ = term.MakeRaw(int(master.Fd()))
}

// sessionManager keeps the in-memory map of running sessions.
type sessionManager struct {
	mu       sync.RWMutex
	sessions map[string]*Session
	baseDir  string
}

func newSessionManager(baseDir string) *sessionManager {
	return &sessionManager{
		sessions: make(map[string]*Session),
		baseDir:  baseDir,
	}
}

func (m *sessionManager) add(s *Session) {
	m.mu.Lock()
	m.sessions[s.ID] = s
	m.mu.Unlock()
}

func (m *sessionManager) get(id string) (*Session, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	s, ok := m.sessions[id]
	return s, ok
}

func (m *sessionManager) remove(id string) {
	m.mu.Lock()
	delete(m.sessions, id)
	m.mu.Unlock()
}
