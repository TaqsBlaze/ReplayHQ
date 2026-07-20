package server

import (
	"context"
	"encoding/json"
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
	}
	s.setupRoutes()
	return s
}

// setupRoutes sets up the HTTP routes.
func (s *Server) setupRoutes() {
	r := mux.NewRouter()
	r.HandleFunc("/runs", s.handleRuns).Methods("GET")
	r.HandleFunc("/runs/{id}", s.handleRunByID).Methods("GET")
	r.HandleFunc("/runs/{id}/events", s.handleEventsByID).Methods("GET")
	r.HandleFunc("/runs/{id}/files", s.handleRunFiles).Methods("GET")
	r.HandleFunc("/stream", s.handleStream).Methods("GET")
	r.HandleFunc("/health", s.handleHealth).Methods("GET")
	s.httpSrv = &http.Server{
		Addr:    s.addr,
		Handler: r,
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

// readJSONFile reads a JSON file from disk and returns the parsed value.
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
