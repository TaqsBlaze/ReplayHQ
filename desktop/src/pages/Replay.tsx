import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, formatDateTime, formatDuration, formatTime } from "../services/api";
import type { RHQEvent, RunDetail } from "../types";
import ReplayVisualizer from "../components/replay/ReplayVisualizer";
import EventViewer from "../components/replay/EventViewer";

const Replay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<RunDetail | null>(null);
  const [events, setEvents] = useState<RHQEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<RHQEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const [runData, eventsData] = await Promise.all([
          api.getRun(id),
          api.getRunEvents(id),
        ]);
        if (cancelled) return;
        setRun(runData);
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load run");
          setRun(null);
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <CenteredMessage>Loading replay…</CenteredMessage>;
  }
  if (error || !run) {
    return (
      <CenteredMessage>
        <div className="text-text">Could not load this run.</div>
        <div className="text-[12px] text-muted mt-1">{error}</div>
        <Link to="/runs" className="text-accent text-[12px] mt-2 inline-block">
          ← Back to Runs
        </Link>
      </CenteredMessage>
    );
  }

  return (
    <div className="h-full flex flex-col fade-in">
      <header className="h-10 flex items-center gap-3 px-4 border-b border-border bg-surface flex-shrink-0">
        <Link to="/runs" className="text-[12px] text-muted hover:text-text">
          ← Runs
        </Link>
        <span className="text-muted-2">/</span>
        <span className="text-[13px] text-text mono">{run.id}</span>
        <span className="text-[11px] text-muted">{run.agent}</span>
        <div className="flex-1" />
        <span className="mono text-[11px] text-muted">
          {run.eventCount} events · {formatDuration(run.duration)}
        </span>
        <span className="text-[10.5px] mono text-muted-2">
          {formatDateTime(run.startTime)}
        </span>
      </header>

      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0 overflow-auto">
          <ReplayVisualizer
            events={events}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
          />
        </div>
        <aside className="w-[320px] flex-shrink-0 border-l border-border bg-surface flex flex-col">
          <header className="h-8 px-3 flex items-center justify-between border-b border-border">
            <span className="text-[12px] font-medium text-text">Event Details</span>
            {selectedEvent && (
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[11px] text-muted hover:text-text"
              >
                Clear
              </button>
            )}
          </header>
          <div className="flex-1 min-h-0 overflow-auto">
            {selectedEvent ? (
              <EventViewer event={selectedEvent} />
            ) : (
              <div className="h-full flex items-center justify-center px-6 text-center">
                <div>
                  <div className="text-[12px] text-muted">No event selected</div>
                  <div className="text-[11px] text-muted-2 mt-1">
                    Click an event below to inspect it here.
                  </div>
                </div>
              </div>
            )}
          </div>
          <EventList
            events={events}
            selectedId={selectedEvent?.id}
            onSelect={setSelectedEvent}
          />
        </aside>
      </div>
    </div>
  );
};

const CenteredMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-4">
    {children}
  </div>
);

interface ListProps {
  events: RHQEvent[];
  selectedId?: string;
  onSelect: (e: RHQEvent) => void;
}

const EventList: React.FC<ListProps> = ({ events, selectedId, onSelect }) => {
  if (events.length === 0) return null;
  return (
    <div className="border-t border-border max-h-[40%] overflow-auto">
      <div className="h-7 px-3 flex items-center text-[10.5px] uppercase tracking-wide text-muted-2 border-b border-border">
        Events
      </div>
      <ul>
        {events.map((e) => (
          <li key={e.id || `${e.time}-${Math.random()}`}>
            <button
              onClick={() => onSelect(e)}
              className={[
                "w-full text-left px-3 py-1.5 border-l-2 hover:bg-surface-2",
                selectedId === e.id
                  ? "border-accent bg-surface-2"
                  : "border-transparent",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span className="mono text-[10.5px] text-muted-2 w-[68px] flex-shrink-0">
                  {formatTime(e.time)}
                </span>
                <span className="text-[11.5px] text-text truncate">{e.type}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Replay;
