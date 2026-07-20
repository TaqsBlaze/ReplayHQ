import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RHQEvent } from "../../types";
import { formatTime } from "../../services/api";

interface Props {
  events: RHQEvent[];
  selectedEvent: RHQEvent | null;
  onEventSelect: (e: RHQEvent) => void;
}

const ReplayVisualizer: React.FC<Props> = ({ events, selectedEvent, onEventSelect }) => {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [position, setPosition] = useState(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const { startMs, endMs } = useMemo(() => {
    if (events.length === 0) return { startMs: 0, endMs: 1 };
    const sorted = [...events].sort((a, b) => (a.time < b.time ? -1 : 1));
    return { startMs: new Date(sorted[0].time).getTime(), endMs: new Date(sorted[sorted.length - 1].time).getTime() };
  }, [events]);

  const totalMs = Math.max(1, endMs - startMs);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      if (!lastTickRef.current) lastTickRef.current = now;
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      setPosition((p) => {
        const next = p + (dt * speed) / totalMs;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = 0;
    };
  }, [playing, speed, totalMs]);

  const visibleEvents = useMemo(() => {
    if (events.length === 0) return [];
    const cutoff = startMs + position * totalMs;
    return events.filter((e) => new Date(e.time).getTime() <= cutoff);
  }, [events, position, startMs, totalMs]);

  if (events.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center px-4">
        <div>
          <div className="text-[13px] text-text">No events in this run</div>
          <div className="text-[12px] text-muted mt-1">
            The trace contains zero recorded events.
          </div>
        </div>
      </div>
    );
  }

  const currentTime = new Date(startMs + position * totalMs);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="h-7 px-3 text-[12px] rounded border border-border bg-bg text-text hover:border-accent"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setPosition(0);
            }}
            className="h-7 px-3 text-[12px] rounded border border-border text-muted hover:text-text"
          >
            Restart
          </button>
          <div className="flex-1" />
          <label className="text-[11px] text-muted">Speed</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="h-7 px-2 text-[11.5px] mono border border-border rounded bg-bg text-text"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
        <div className="relative h-2 bg-bg rounded">
          <div
            className="absolute inset-y-0 left-0 bg-accent-dim rounded"
            style={{ width: `${position * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent"
            style={{ left: `calc(${position * 100}% - 4px)` }}
          />
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(position * 1000)}
            onChange={(e) => {
              setPlaying(false);
              setPosition(parseInt(e.target.value, 10) / 1000);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 mono text-[10.5px] text-muted-2">
          <span>{formatTime(new Date(startMs).toISOString())}</span>
          <span>{formatTime(currentTime.toISOString())}</span>
          <span>{formatTime(new Date(endMs).toISOString())}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-2">
        {visibleEvents.length === 0 ? (
          <div className="text-center py-8 text-[12px] text-muted">Press play to start.</div>
        ) : (
          <ul className="space-y-1">
            {visibleEvents.map((e) => (
              <li key={e.id || `${e.time}-${Math.random()}`}>
                <button
                  onClick={() => onEventSelect(e)}
                  className={[
                    "w-full text-left px-2.5 py-1.5 rounded border-l-2",
                    selectedEvent?.id === e.id
                      ? "border-accent bg-surface"
                      : "border-transparent bg-surface hover:bg-surface-2",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10.5px] text-muted-2 w-[68px] flex-shrink-0">
                      {formatTime(e.time)}
                    </span>
                    <span className="text-[12px] text-text">{e.type}</span>
                    {e.duration ? (
                      <span className="mono text-[10.5px] text-muted-2">
                        {formatDuration(e.duration / 1_000_000)}
                      </span>
                    ) : null}
                  </div>
                  {e.data && Object.keys(e.data).length > 0 && (
                    <div className="mono text-[10.5px] text-muted mt-0.5 truncate pl-[76px]">
                      {summarize(e.data)}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
}

function summarize(data: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    let val = v;
    if (typeof val === "string" && val.length > 80) val = val.slice(0, 80) + "…";
    parts.push(`${k}=${typeof val === "object" ? JSON.stringify(val) : val}`);
  }
  return parts.join(" ");
}

export default ReplayVisualizer;
