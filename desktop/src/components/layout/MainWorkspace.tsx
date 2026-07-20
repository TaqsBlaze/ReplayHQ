import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useActivity } from "../../services/websocket";
import { formatTime } from "../../services/api";

const MainWorkspace: React.FC = () => {
  const location = useLocation();
  const showActivity = location.pathname === "/";
  return (
    <main className="flex-1 min-h-0 flex">
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
      {showActivity && <ActivityPanel />}
    </main>
  );
};

const ActivityPanel: React.FC = () => {
  const { events, status } = useActivity();
  return (
    <aside className="w-[320px] flex-shrink-0 border-l border-border bg-surface flex flex-col">
      <header className="h-8 px-3 flex items-center justify-between border-b border-border">
        <span className="text-[12px] font-medium text-text">Realtime Activity</span>
        <span className="mono text-[10.5px] text-muted">
          {status === "open" ? "live" : status}
        </span>
      </header>
      <div className="flex-1 min-h-0 overflow-auto">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="py-1">
            {events.slice(0, 80).map((e, i) => (
              <li
                key={e.id || `${e.time}-${i}`}
                className="px-3 py-1.5 hover:bg-surface-2"
              >
                <div className="flex items-center gap-2">
                  <span className="mono text-[10.5px] text-muted-2 w-[72px] flex-shrink-0">
                    {formatTime(e.time)}
                  </span>
                  <span className="text-[11.5px] text-text truncate">{e.type}</span>
                </div>
                {e.data && Object.keys(e.data).length > 0 && (
                  <div className="mono text-[10.5px] text-muted mt-0.5 truncate pl-[80px]">
                    {summarize(e.data)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

const EmptyState: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6">
    <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mb-3">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
      </svg>
    </div>
    <div className="text-[12px] text-text">No activity yet</div>
    <div className="text-[11.5px] text-muted mt-1 max-w-[220px]">
      Start a recording with <span className="mono text-accent">rhq claude</span> to see live events here.
    </div>
  </div>
);

function summarize(data: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    let val = v;
    if (typeof val === "string" && val.length > 50) val = val.slice(0, 50) + "…";
    parts.push(`${k}=${typeof val === "object" ? JSON.stringify(val) : val}`);
  }
  return parts.join(" ");
}

export default MainWorkspace;
