package server

import (
	"net/http"

	"replayhq/internal/logger"
)

// Server represents the HTTP and WebSocket server.
type Server struct {
	addr string
}

// NewServer creates a new server that listens on the given address.
func NewServer(addr string) *Server {
	return &Server{addr: addr}
}

// Start starts the server and blocks until it is stopped.
func (s *Server) Start() error {
	mux := http.NewServeMux()
	// Register routes
	mux.HandleFunc("/", s.handleRoot)
	mux.HandleFunc("/runs", s.handleRuns)
	mux.HandleFunc("/events/", s.handleEvent)
	mux.HandleFunc("/ws", s.handleWS)

	server := &http.Server{
		Addr:    s.addr,
		Handler: mux,
	}

	logger.Default().Info("Starting HTTP server", "address", s.addr)
	return server.ListenAndServe()
}

func (s *Server) handleRoot(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ReplayHQ Server"))
}

func (s *Server) handleRuns(w http.ResponseWriter, r *http.Request) {
	// TODO: implement
	w.WriteHeader(http.StatusNotImplemented)
}

func (s *Server) handleEvent(w http.ResponseWriter, r *http.Request) {
	// TODO: implement
	w.WriteHeader(http.StatusNotImplemented)
}

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	// TODO: implement WebSocket upgrade
	w.WriteHeader(http.StatusNotImplemented)
}