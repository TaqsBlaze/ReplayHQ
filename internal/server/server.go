package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"encoding/json"
	"path/filepath"

	"replayhq/internal/storage"
)

// Server represents the HTTP/WebSocket server.
type Server struct {
	addr    string
	baseDir string
	httpSrv *http.Server
	upgrader websocket.Upgrader
}

// NewServer creates a new Server instance.
func NewServer(addr, baseDir string) *Server {
	s := &Server{
		addr:    addr,
		baseDir: baseDir,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				// Allow all connections for simplicity; adjust for production.
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
	// API endpoints
	r.HandleFunc("/runs", s.handleRuns).Methods("GET")
	r.HandleFunc("/runs/{id}", s.handleRunByID).Methods("GET")
	r.HandleFunc("/events/{id}", s.handleEventsByID).Methods("GET")
	// WebSocket endpoint
	r.HandleFunc("/stream", s.handleStream).Methods("GET")
	s.httpSrv = &http.Server{
		Addr:    s.addr,
		Handler: r,
	}
}

// Start starts the server and blocks until a shutdown signal is received.
func (s *Server) Start() {
	// Create a channel to listen for SIGINT or SIGTERM.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	// Start the server in a goroutine.
	go func() {
		log.Printf("Starting server on %s", s.addr)
		if err := s.httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for a signal to shutdown.
	<-stop
	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := s.httpSrv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited")
}

// handleRuns returns a list of trace IDs (runs).
func (s *Server) handleRuns(w http.ResponseWriter, r *http.Request) {
	files, err := os.ReadDir(s.baseDir)
	if err != nil {
		http.Error(w, "Unable to read data directory", http.StatusInternalServerError)
		return
	}
	var runs []string
	for _, f := range files {
		if f.IsDir() {
			runs = append(runs, f.Name())
		}
	}
	writeJSON(w, runs)
}

// handleRunByID returns metadata for a given trace ID.
func (s *Server) handleRunByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	traceID := vars["id"]
	traceDir := filepath.Join(s.baseDir, traceID)
	if _, err := os.Stat(traceDir); os.IsNotExist(err) {
		http.Error(w, "Trace not found", http.StatusNotFound)
		return
	}
	// For now, we return basic info. In the future, we can read metadata.json.
	resp := map[string]string{
		"id":   traceID,
		"path": traceDir,
	}
	writeJSON(w, resp)
}

// handleEventsByID returns all events for a given trace ID as JSON.
func (s *Server) handleEventsByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	traceID := vars["id"]
	store := storage.NewFileStore(s.baseDir)
	if err := store.Init(traceID); err != nil {
		http.Error(w, "Failed to initialize store", http.StatusInternalServerError)
		return
	}
	defer store.Close()
	events, err := store.LoadEvents()
	if err != nil {
		http.Error(w, "Failed to load events", http.StatusInternalServerError)
		return
	}
	writeJSON(w, events)
}

// handleStream handles WebSocket connections for streaming events.
// It expects a query parameter "id" for the trace ID.
func (s *Server) handleStream(w http.ResponseWriter, r *http.Request) {
	traceID := r.URL.Query().Get("id")
	if traceID == "" {
		http.Error(w, "Missing 'id' query parameter", http.StatusBadRequest)
		return
	}
	// Upgrade to WebSocket connection.
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	// Load events from the store.
	store := storage.NewFileStore(s.baseDir)
	if err := store.Init(traceID); err != nil {
		writeWebSocketError(conn, "Failed to initialize store")
		return
	}
	events, err := store.LoadEvents()
	store.Close()
	if err != nil {
		writeWebSocketError(conn, "Failed to load events")
		return
	}

	// Send each event as a JSON message.
	for _, ev := range events {
		if err := conn.WriteJSON(ev); err != nil {
			// If we fail to write, the client may have disconnected.
			return
		}
	}
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
