package server

// wsFrame is the JSON envelope sent on the /terminal WebSocket connection.
//
// Server -> client frames:
//   {"type":"stdout","data":"<bytes>"}      PTY output to render
//   {"type":"exit","code":0}                Process exited; connection will close
//
// Client -> server frames:
//   {"type":"stdin","data":"<bytes>"}       Keystrokes to forward to the PTY
//   {"type":"resize","cols":120,"rows":30}  PTY window size update
type wsFrame struct {
	Type string         `json:"type"`
	Data string         `json:"data,omitempty"`
	Cols int            `json:"cols,omitempty"`
	Rows int            `json:"rows,omitempty"`
	Code int            `json:"code,omitempty"`
	Err  string         `json:"error,omitempty"`
	Info map[string]any `json:"info,omitempty"`
}

// SessionStartRequest is the JSON body of POST /sessions.
type SessionStartRequest struct {
	Cmd  string   `json:"cmd"`
	Args []string `json:"args"`
	Cols int      `json:"cols"`
	Rows int      `json:"rows"`
}

// SessionStartResponse is the JSON body returned by POST /sessions.
type SessionStartResponse struct {
	ID     string `json:"id"`
	WSPath string `json:"wsPath"`
}

