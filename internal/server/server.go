package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"

	"replayhq/internal/events"
	"replayhq/internal/storage"
)

// Server represents the HTTP/WebSocket server.
type Server struct {
	addr     string
	baseDir  string
	httpSrv  *http.Server
	upgrader websocket.Upgrader
	sessions *sessionManager
}

// RunSummary is the lightweight run record returned by /runs.
type RunSummary struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Agent      string    `json:"agent"`
	StartTime  time.Time `json:"startTime"`
	EndTime    time.Time `json:"endTime"`
	Duration   float64   `json:"duration"`
	EventCount int       `json:"eventCount"`
	Status     string    `json:"status"`
}

// RunDetail is the full record returned by /runs/{id}.
type RunDetail struct {
	RunSummary
	Path     string `json:"path"`
	Metadata any    `json:"metadata"`
	Metrics  any    `json:"metrics"`
}

// SessionStatus is the JSON representation of a live session.
type SessionStatus struct {
	ID        string `json:"id"`
	Cmd       string `json:"cmd"`
	Args      []string `json:"args"`
	Status    string `json:"status"` // "running" | "exited" | "unknown"
	StartedAt string `json:"startedAt"`
	EndedAt   string `json:"endedAt,omitempty"`
	ExitCode  int32  `json:"exitCode"`
}

// NewServer creates a new Server instance.
func NewServer(addr, baseDir string) *Server {
	s := &Server{
		addr:    addr,
		baseDir: baseDir,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		sessions: newSessionManager(baseDir),
	}
	s.setupRoutes()
	return s
}

// corsMiddleware sets CORS headers for all responses.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization,X-CSRF-Token")
		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		// Next handler
		next.ServeHTTP(w, r)
	})
}


// setupRoutes sets up the HTTP routes.
func (s *Server) setupRoutes() {
	r := mux.NewRouter()
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ReplayHQ Server is running"))
	}).Methods("GET")
	r.HandleFunc("/runs", s.handleRuns).Methods("GET")
	r.HandleFunc("/runs/{id}", s.handleRunByID).Methods("GET")
	r.HandleFunc("/runs/{id}/events", s.handleEventsByID).Methods("GET")
	r.HandleFunc("/runs/{id}/files", s.handleRunFiles).Methods("GET")
	r.HandleFunc("/runs/{id}/metrics", s.handleRunMetrics).Methods("GET")
	r.HandleFunc("/stream", s.handleStream).Methods("GET")
	r.HandleFunc("/sessions", s.handleCreateSession).Methods("POST")
	r.HandleFunc("/sessions/{id}", s.handleGetSession).Methods("GET")
	r.HandleFunc("/sessions/{id}/kill", s.handleKillSession).Methods("POST")
	r.HandleFunc("/terminal", s.handleTerminal).Methods("GET")
	r.HandleFunc("/health", s.handleHealth).Methods("GET")
	s.httpSrv = &http.Server{
		Addr:    s.addr,
		Handler: corsMiddleware(r),
	}
}

// Start starts the server and blocks until a shutdown signal is received.
func (s *Server) Start() {
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	go func() {
		log.Printf("Starting server on %s (data: %s)", s.addr, s.baseDir)
		if err := s.httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	<-stop
	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := s.httpSrv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited")
}

// handleHealth reports server liveness.
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, map[string]any{
		"status": "ok",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}

// handleRuns returns a list of runs (traces) discovered on disk.
func (s *Server) handleRuns(w http.ResponseWriter, r *http.Request) {
	runs, err := s.loadAllRuns()
	if err != nil {
		http.Error(w, "Unable to read data directory: "+err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, runs)
}

// handleRunByID returns the metadata for a single trace.
func (s *Server) handleRunByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	traceID := vars["id"]
	traceDir := filepath.Join(s.baseDir, traceID)
	if _, err := os.Stat(traceDir); os.IsNotExist(err) {
		http.Error(w, "Run not found", http.StatusNotFound)
		return
	}

	summary, events := s.loadRun(traceID)
	detail := RunDetail{
		RunSummary: summary,
		Path:       traceDir,
		Metadata:   readJSONFile(filepath.Join(traceDir, "metadata.json")),
		Metrics:    readJSONFile(filepath.Join(traceDir, "metrics.json")),
	}
	_ = events
	writeJSON(w, detail)
}

// handleEventsByID returns all events for a given run as JSON.
func (s *Server) handleEventsByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	traceID := vars["id"]
	store := storage.NewFileStore(s.baseDir)
	if err := store.Init(traceID); err != nil {
		http.Error(w, "Failed to initialize store", http.StatusInternalServerError)
		return
	}
	defer store.Close()
	evs, err := store.LoadEvents()
	if err != nil {
		http.Error(w, "Failed to load events", http.StatusInternalServerError)
		return
	}
	writeJSON(w, evs)
}

// handleRunFiles lists the files captured under a run.
func (s *Server) handleRunFiles(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	traceID := vars["id"]
	traceDir := filepath.Join(s.baseDir, traceID, "files")
	if _, err := os.Stat(traceDir); os.IsNotExist(err) {
		writeJSON(w, []string{})
		return
	}
	entries, err := os.ReadDir(traceDir)
	if err != nil {
		http.Error(w, "Failed to read files directory", http.StatusInternalServerError)
		return
	}
	files := make([]string, 0, len(entries))
	for _, e := range entries {
		if !e.IsDir() {
			files = append(files, e.Name())
		}
	}
	writeJSON(w, files)
}

// handleRunMetrics returns the metrics for a single trace.
func (s *Server) handleRunMetrics(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	traceID := vars["id"]
	traceDir := filepath.Join(s.baseDir, traceID)
	if _, err := os.Stat(traceDir); os.IsNotExist(err) {
		http.Error(w, "Run not found", http.StatusNotFound)
		return
	}
	metrics := readJSONFile(filepath.Join(traceDir, "metrics.json"))
	writeJSON(w, metrics)
}

// handleStream streams events for a run over a WebSocket connection.
func (s *Server) handleStream(w http.ResponseWriter, r *http.Request) {
	traceID := r.URL.Query().Get("id")
	if traceID == "" {
		http.Error(w, "Missing 'id' query parameter", http.StatusBadRequest)
		return
	}
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	store := storage.NewFileStore(s.baseDir)
	if err := store.Init(traceID); err != nil {
		writeWebSocketError(conn, "Failed to initialize store")
		return
	}
	evs, err := store.LoadEvents()
	store.Close()
	if err != nil {
		writeWebSocketError(conn, "Failed to load events")
		return
	}
	for _, ev := range evs {
		if err := conn.WriteJSON(ev); err != nil {
			return
		}
	}
}

// loadAllRuns scans the base directory and returns a summary for each trace.
func (s *Server) loadAllRuns() ([]RunSummary, error) {
	files, err := os.ReadDir(s.baseDir)
	if err != nil {
		return nil, err
	}
	runs := make([]RunSummary, 0, len(files))
	for _, f := range files {
		if !f.IsDir() {
			continue
		}
		summary, _ := s.loadRun(f.Name())
		runs = append(runs, summary)
	}
	return runs, nil
}

// loadRun computes the run summary by reading the events file.
func (s *Server) loadRun(traceID string) (RunSummary, []*events.Event) {
	summary := RunSummary{
		ID:     traceID,
		Name:   traceID,
		Agent:  "unknown",
		Status: "unknown",
	}
	traceDir := filepath.Join(s.baseDir, traceID)
	eventsPath := filepath.Join(traceDir, "events.jsonl")
	f, err := os.Open(eventsPath)
	if err != nil {
		return summary, nil
	}
	defer f.Close()

	dec := json.NewDecoder(f)
	var evs []*events.Event
	for {
		var ev events.Event
		if err := dec.Decode(&ev); err != nil {
			break
		}
		evs = append(evs, &ev)
		switch ev.Type {
		case "ProcessStarted":
			summary.StartTime = ev.Time
			if cmd, ok := ev.Data["cmd"].(string); ok {
				summary.Agent = cmd
			}
		case "ProcessExited":
			summary.EndTime = ev.Time
			if exit, ok := ev.Data["exit"].(float64); ok {
				if exit == 0 {
					summary.Status = "completed"
				} else {
					summary.Status = "failed"
				}
			} else {
				summary.Status = "completed"
			}
		}
	}
	summary.EventCount = len(evs)
	if summary.EndTime.IsZero() {
		summary.EndTime = time.Now()
		summary.Status = "running"
	}
	if !summary.StartTime.IsZero() {
		summary.Duration = summary.EndTime.Sub(summary.StartTime).Seconds()
	}
	if summary.Agent != "unknown" {
		summary.Name = summary.Agent + " " + traceID
	}
	return summary, evs
}

// handleCreateSession creates a new live PTY session.
// Expected JSON body: { "cmd": "...", "args": [...], "cols": 80, "rows": 24 }
// Returns: { "id": "...", "wsPath": "/terminal?id=..." }
func (s *Server) handleCreateSession(w http.ResponseWriter, r *http.Request) {
	var req SessionStartRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}
	if req.Cmd == "" {
		http.Error(w, "missing cmd", http.StatusBadRequest)
		return
	}
	if req.Cols <= 0 {
		req.Cols = 80
	}
	if req.Rows <= 0 {
		req.Rows = 24
	}
	id := fmt.Sprintf("session-%d", time.Now().UnixNano())
	sess := &Session{
		ID:        id,
		Cmd:       req.Cmd,
		Args:      req.Args,
		StartedAt: time.Now(),
		baseDir:   s.baseDir,
		status:    "running",
		clients:   make(map[*sessionClient]struct{}),
	}
	if err := sess.Start(req.Cols, req.Rows); err != nil {
		http.Error(w, "failed to start session: "+err.Error(), http.StatusInternalServerError)
		return
	}
	s.sessions.add(sess)
	resp := SessionStartResponse{
		ID:     id,
		WSPath: fmt.Sprintf("/terminal?id=%s", id),
	}
	writeJSON(w, resp)
}

// handleGetSession returns the status of a live session.
func (s *Server) handleGetSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	sess, ok := s.sessions.get(id)
	if !ok {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}
	status, started, ended, exitCode := sess.Status()
	resp := SessionStatus{
		ID:        id,
		Cmd:       sess.Cmd,
		Args:      sess.Args,
		Status:    status,
		StartedAt: started.Format(time.RFC3339),
		EndedAt:   ended.Format(time.RFC3339),
		ExitCode:  int32(exitCode),
	}
	writeJSON(w, resp)
}

// handleKillSession attempts to terminate a live session.
func (s *Server) handleKillSession(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	sess, ok := s.sessions.get(id)
	if !ok {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}
	sess.Kill()
	w.WriteHeader(http.StatusNoContent)
}

// handleTerminal upgrades to a WebSocket and proxies PTY I/O.
func (s *Server) handleTerminal(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "missing id query parameter", http.StatusBadRequest)
		return
	}
	sess, ok := s.sessions.get(id)
	if !ok {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "failed to upgrade to websocket: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	client, outChan := sess.Attach()
	defer sess.Detach(client)

	// Pump from PTY to websocket
	go func() {
		for msg := range outChan {
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		}
	}()

	// Pump from websocket to PTY (stdin/resize)
	for {
		mt, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		if mt != websocket.TextMessage {
			continue
		}
		var frame wsFrame
		if err := json.Unmarshal(msg, &frame); err != nil {
			continue
		}
		switch frame.Type {
		case "stdin":
			if _, err := sess.Write([]byte(frame.Data)); err != nil {
				// Send error back? For now just break.
				break
			}
		case "resize":
			if err := sess.Resize(frame.Cols, frame.Rows); err != nil {
				// ignore
			}
		}
	}
}

// ... rest of file ...
// Returns nil if the file is missing or cannot be parsed.
func readJSONFile(path string) any {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var v any
	if err := json.Unmarshal(data, &v); err != nil {
		return nil
	}
	return v
}

// writeJSON writes the given value as JSON to the response writer.
func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(v); err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
	}
}

// writeWebSocketError writes an error message to the WebSocket connection.
func writeWebSocketError(conn *websocket.Conn, msg string) {
	conn.WriteMessage(websocket.TextMessage, []byte("error: "+msg))
}
