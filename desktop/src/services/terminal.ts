import type { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { api } from "./api";

/**
 * Attach a xterm.js Terminal instance to a live session.
 *
 * @param term - The terminal instance to attach.
 * @param sessionId - The ID of the session to connect to.
 * @returns A promise that resolves when the connection is established.
 *          The caller should call the returned cleanup function when done.
 */
export async function attachTerminal(
  term: Terminal,
  sessionId: string
): Promise<() => void> {
  // Start the session if not already started (or get existing).
  // For simplicity, we always call startSession; the server will
  // create a new session each time. In a more advanced UI we might
  // have a reuse mechanism, but for now each "New Session" button
  // creates a fresh session.
  const { wsPath } = await api.startSession("bash", [], 80, 24);

  // Set up the fit addon so the terminal resizes with its container.
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);

  // Open WebSocket to the server endpoint.
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${protocol}//${location.host}${wsPath}`);

  // BinaryType must be "blob" or "arraybuffer"; we'll use text JSON.
  ws.binaryType = "text";

  // Forward terminal input to the socket as stdin.
  term.onData((data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "stdin", data }));
    }
  });

  // Handle messages from the server.
  ws.onmessage = (event) => {
    let msg: { type: string; data?: string; cols?: number; rows?: number; code?: number };
    try {
      msg = JSON.parse(event.data);
    } catch {
      return; // ignore malformed
    }
    switch (msg.type) {
      case "stdout":
        if (typeof msg.data === "string") {
          term.write(msg.data);
        }
        break;
      case "exit":
        // Optionally show a notification.
        term.write(`\r\n[\x1b[33mprocess exited with code ${msg.code}\x1b[0m]\r\n`);
        break;
      default:
        break;
    }
  };

  // Handle ws open/close/errors.
  ws.onopen = () => {
    // Notify the server of the initial size (fit will update later).
    fitAdapt();
  };

  ws.onclose = () => {
    term.writeln("\r\n[\x1b[31mconnection closed\x1b[0m]\r\n");
  };

  ws.onerror = (err) => {
    term.writeln(`\r\n[\x1b[31mwebsocket error: ${(err as Error).message}\x1b[0m]\r\n`);
  };

  // Fit adjustment: call whenever the container size changes.
  const fitAdapt = () => {
    fitAddon.fit();
    const { cols, rows } = fitAddon.proposeDimensions();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "resize", cols, rows }));
    }
  };

  // Listen for window resize.
  window.addEventListener("resize", fitAdapt);

  // Return a cleanup function.
  return () => {
    ws.close();
    window.removeEventListener("resize", fitAdapt);
  };
}