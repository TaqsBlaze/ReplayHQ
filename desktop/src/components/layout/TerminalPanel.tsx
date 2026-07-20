import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { attachTerminal } from "../../services/terminal";
import { FitAddon } from "@xterm/addon-fit";

const TerminalPanel: React.FC = () => {
  const termRef = useRef<Terminal | null>(null);
  const [cleanup, setCleanup] = useState<(() => void) | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

  useEffect(() => {
    const init = async () => {
      setStatus("connecting");
      try {
        const term = new Terminal({
          cursorBlink: true,
          scrollback: 1000,
          fontFamily: "'Fira Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', monospace",
          fontSize: 13,
          lineHeight: 1.2,
          theme: {
            background: "#0d1117",
            foreground: "#c9d1d9",
          },
        });
        termRef.current = term;
        term.open(termRef.current!.parentElement as HTMLElement);

        const cleanupFn = await attachTerminal(term, "dummy-id"); // we ignore ID for now; startSession creates a new one each time
        setCleanup(cleanupFn);
        setStatus("connected");
      } catch (err) {
        console.error("Failed to start terminal:", err);
        setStatus("idle");
      }
    };

    init();

    return () => {
      if (cleanup) {
        cleanup();
      }
      if (termRef.current) {
        termRef.current.dispose();
      }
    };
  }, [cleanup]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div ref={termRef} className="h-full w-full flex flex-col" />
      </div>
      {status !== "connected" && (
        <div className="px-2 py-1 text-xs text-muted flex items-center justify-center">
          {status === "connecting" ? "Starting terminal…" : "Terminal not connected"}
        </div>
      )}
    </div>
  );
};

export default TerminalPanel;