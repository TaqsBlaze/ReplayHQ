import React, { useState } from "react";
import { useActivity } from "../../services/websocket";
import { formatTime } from "../../services/api";

type Tab = "backend" | "logs" | "websocket" | "terminal";

const tabs: { id: Tab; label: string }[] = [
  { id: "backend", label: "Backend" },
  { id: "logs", label: "Logs" },
  { id: "websocket", label: "WebSocket" },
  { id: "terminal", label: "Terminal" },
];

const BottomPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>("backend");
  return (
    <section className="h-[180px] flex-shrink-0 bg-surface border-t border-border flex flex-col">
      <div className="h-8 flex items-center px-2 gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "h-7 px-3 text-[12px] rounded transition-colors",
              tab === t.id
                ? "text-text bg-bg border border-border"
                : "text-muted hover:text-text hover:bg-surface-2",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <ActivityStatus />
      </div>
      <div className="flex-1 min-h-0">
        {tab === "backend" && <BackendTab />}
        {tab === "logs" && <LogsTab />}
        {tab === "websocket" && <WebSocketTab />}
        {tab === "terminal" && <TerminalTab />}
      </div>
    </section>
  );
};

const ActivityStatus: React.FC = () => {
  const { status } = useActivity();
  const label = status === "open" ? "connected" : status === "connecting" ? "connecting" : "disconnected";
  const color =
    status === "open" ? "bg-success" : status === "connecting" ? "bg-warn" : "bg-error";
  return (
    <div className="flex items-center gap-1.5 pr-1 text-[11px] text-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${color} ${status === "open" ? "pulse-dot" : ""}`} />
      <span className="mono">ws: {label}</span>
    </div>
  );
};

const BackendTab: React.FC = () => {
  const { events, status } = useActivity();
  return (
    <div className="h-full overflow-auto mono text-[11.5px] text-muted p-2 space-y-0.5">
      <Line prefix="[ok]" tone="ok" text={`backend reachable (ws ${status})`} />
      {events.length === 0 ? (
        <Line text="no events yet — start a recording with `rhq claude`" />
      ) : (
        events.slice(0, 100).map((e) => (
          <Line key={e.id || `${e.time}-${Math.random()}`} text={`${formatTime(e.time)}  ${e.type}`} />
        ))
      )}
    </div>
  );
};

const LogsTab: React.FC = () => {
  const { events } = useActivity();
  return (
    <div className="h-full overflow-auto mono text-[11.5px] p-2 space-y-0.5">
      {events.length === 0 ? (
        <Line text="no log entries yet" tone="muted" />
      ) : (
        events.slice(0, 100).map((e) => (
          <Line
            key={e.id || `${e.time}-${Math.random()}`}
            text={`${formatTime(e.time)}  ${e.type}  ${summarize(e.data)}`}
          />
        ))
      )}
    </div>
  );
};

const WebSocketTab: React.FC = () => {
  const { status, lastError } = useActivity();
  return (
    <div className="h-full overflow-auto mono text-[11.5px] text-muted p-2 space-y-1">
      <Line text={`status: ${status}`} />
      <Line text={`endpoint: ${(import.meta.env.VITE_WS_BASE_URL as string) || "ws://localhost:8080"}/stream`} />
      {lastError && <Line text={`error: ${lastError}`} tone="err" />}
      <Line text="auto-reconnect enabled with exponential backoff" tone="muted" />
    </div>
  );
};

const TerminalTab: React.FC = () => {
  return (
    <div className="h-full mono text-[12px] text-text p-2">
      <div className="text-muted">$ rhq — ReplayHQ CLI</div>
      <div className="text-muted-2 mt-1">
        The terminal is a placeholder. Run <span className="text-accent">rhq claude</span> in your host shell to record a session.
      </div>
      <div className="mt-2 flex items-center gap-1">
        <span className="text-accent">rhq@replayhq</span>
        <span className="text-muted">:</span>
        <span className="text-accent-dim">~</span>
        <span className="text-muted">$</span>
        <span className="ml-1 inline-block w-1.5 h-3.5 bg-text align-middle" />
      </div>
    </div>
  );
};

interface LineProps {
  text: string;
  prefix?: string;
  tone?: "ok" | "err" | "muted";
}

const Line: React.FC<LineProps> = ({ text, prefix, tone }) => {
  const color = tone === "ok" ? "text-success" : tone === "err" ? "text-error" : "text-muted";
  return (
    <div className={color}>
      {prefix && <span className="text-accent mr-1.5">{prefix}</span>}
      {text}
    </div>
  );
};

function summarize(data?: Record<string, unknown>): string {
  if (!data) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    let val = v;
    if (typeof val === "string" && val.length > 60) val = val.slice(0, 60) + "…";
    parts.push(`${k}=${formatValue(val)}`);
  }
  return parts.join(" ");
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default BottomPanel;
