import React from "react";
import type { RHQEvent } from "../../types";
import { formatTime, formatDateTime } from "../../services/api";

interface Props {
  event: RHQEvent;
}

const EventViewer: React.FC<Props> = ({ event }) => {
  const data = event.data ?? {};
  return (
    <div className="fade-in">
      <div className="px-3 py-2.5 border-b border-border">
        <div className="text-[10.5px] uppercase tracking-wide text-muted-2">
          {event.source || "rhq"}
        </div>
        <div className="text-[14px] font-medium text-text mt-0.5">{event.type}</div>
        <div className="text-[11px] text-muted mono mt-0.5">
          {formatTime(event.time)} · {formatDateTime(event.time)}
        </div>
        {typeof event.duration === "number" && event.duration > 0 && (
          <div className="mono text-[10.5px] text-muted-2 mt-0.5">
            duration: {(event.duration / 1_000_000).toFixed(2)}ms
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 border-b border-border">
        <div className="text-[10.5px] uppercase tracking-wide text-muted-2 mb-1.5">Data</div>
        {Object.keys(data).length === 0 ? (
          <div className="text-[12px] text-muted-2">No data attached.</div>
        ) : (
          <ul className="space-y-1.5">
            {Object.entries(data).map(([k, v]) => (
              <li key={k} className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-[11.5px] text-muted mono">{k}</span>
                <span className="text-[11.5px] text-text mono break-all">
                  {renderValue(v)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-3 py-2.5">
        <div className="text-[10.5px] uppercase tracking-wide text-muted-2 mb-1.5">Raw JSON</div>
        <pre className="mono text-[11px] text-muted bg-bg border border-border rounded p-2 overflow-auto">
          {JSON.stringify(
            {
              id: event.id,
              type: event.type,
              time: event.time,
              duration: event.duration,
              source: event.source,
              data: event.data,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
};

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v, null, 2);
}

export default EventViewer;
