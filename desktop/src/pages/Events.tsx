import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatTime } from "../services/api";
import type { RHQEvent, Run } from "../types";
import { useActivity } from "../services/websocket";

const Events: React.FC = () => {
  const { events: liveEvents, status, pushEvents } = useActivity();
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [runEvents, setRunEvents] = useState<RHQEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await api.getRuns();
        if (cancelled) return;
        setRuns(list);
        if (list.length > 0 && !selectedRun) {
          setSelectedRun(list[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load runs");
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "open") return; // live events are already streaming
    if (!selectedRun) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getRunEvents(selectedRun);
        if (!cancelled) {
          setRunEvents(data);
          pushEvents(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load events");
          setRunEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedRun, status, pushEvents]);

  const showingLive = status === "open";
  const events = showingLive ? liveEvents : runEvents;

  return (
    <div className="p-6 fade-in h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-text">Events</h1>
          <p className="text-[12px] text-muted mt-0.5">
            {showingLive
              ? "Streaming live events from the backend."
              : "Backend WebSocket is not connected; showing the most recent run."}
          </p>
        </div>
        {!showingLive && runs.length > 0 && (
          <select
            value={selectedRun}
            onChange={(e) => setSelectedRun(e.target.value)}
            className="h-7 px-2 text-[11.5px] mono border border-border rounded bg-surface text-text"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 text-[12px] text-error border border-error/40 rounded bg-error/10">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto rounded-md bg-surface border border-border">
        {loading ? (
          <div className="p-4 text-[12px] text-muted">Loading…</div>
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border">
            {events.slice(0, 200).map((e, i) => (
              <li key={e.id || `${e.time}-${i}`} className="px-3 py-2 hover:bg-surface-2">
                <div className="flex items-center gap-2">
                  <span className="mono text-[10.5px] text-muted-2 w-[72px] flex-shrink-0">
                    {formatTime(e.time)}
                  </span>
                  <span className="text-[12px] text-text flex-shrink-0">{e.type}</span>
                  {selectedRun && !showingLive && (
                    <Link
                      to={`/replay/${selectedRun}`}
                      className="text-[10.5px] text-muted-2 mono truncate"
                    >
                      {selectedRun}
                    </Link>
                  )}
                </div>
                {e.data && Object.keys(e.data).length > 0 && (
                  <pre className="mono text-[10.5px] text-muted mt-0.5 whitespace-pre-wrap break-all pl-[80px]">
                    {summarize(e.data)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="p-6 text-center">
    <div className="text-[13px] text-text">No events</div>
    <p className="text-[12px] text-muted mt-1 max-w-md mx-auto">
      Start the backend with{" "}
      <span className="mono text-accent">rhq server</span>, then record a
      session with{" "}
      <span className="mono text-accent">rhq claude</span>.
    </p>
  </div>
);

function summarize(data: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    let val = v;
    if (typeof val === "string" && val.length > 100) val = val.slice(0, 100) + "…";
    parts.push(`${k}=${typeof val === "object" ? JSON.stringify(val) : val}`);
  }
  return parts.join(" ");
}

export default Events;
