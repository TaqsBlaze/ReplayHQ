import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDateTime, formatDuration } from "../services/api";
import type { Run } from "../types";

const DiffViewer: React.FC = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [left, setLeft] = useState<string>("");
  const [right, setRight] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await api.getRuns();
        if (cancelled) return;
        setRuns(list);
        if (list.length >= 2) {
          setLeft(list[1].id);
          setRight(list[0].id);
        } else if (list.length === 1) {
          setLeft(list[0].id);
          setRight(list[0].id);
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
  }, []);

  const leftRun = runs.find((r) => r.id === left);
  const rightRun = runs.find((r) => r.id === right);

  return (
    <div className="p-6 fade-in">
      <h1 className="text-[18px] font-semibold text-text">Diff Viewer</h1>
      <p className="text-[12px] text-muted mt-0.5 mb-4">
        Compare two runs side by side.
      </p>

      {error && (
        <div className="mb-3 px-3 py-2 text-[12px] text-error border border-error/40 rounded bg-error/10">
          {error}
        </div>
      )}

      {runs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <RunPicker
              label="Base"
              value={left}
              onChange={setLeft}
              runs={runs}
              run={leftRun}
            />
            <RunPicker
              label="Compare"
              value={right}
              onChange={setRight}
              runs={runs}
              run={rightRun}
            />
          </div>

          {leftRun && rightRun && (
            <div className="rounded-md bg-surface border border-border p-3.5 text-[12px] text-muted space-y-1">
              <div>
                Duration delta:{" "}
                <span className="mono text-text">
                  {formatDuration(rightRun.duration - leftRun.duration)}
                </span>
              </div>
              <div>
                Events delta:{" "}
                <span className="mono text-text">
                  {rightRun.eventCount - leftRun.eventCount >= 0 ? "+" : ""}
                  {rightRun.eventCount - leftRun.eventCount}
                </span>
              </div>
              <div>
                Status: <span className="mono text-text">{leftRun.status} → {rightRun.status}</span>
              </div>
              <div>
                Agents: <span className="mono text-text">{leftRun.agent} → {rightRun.agent}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface PickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  runs: Run[];
  run?: Run;
}

const RunPicker: React.FC<PickerProps> = ({ label, value, onChange, runs, run }) => (
  <div className="rounded-md bg-surface border border-border p-3">
    <div className="text-[10.5px] uppercase tracking-wide text-muted-2 mb-1.5">{label}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-7 px-2 text-[12px] mono border border-border rounded bg-bg text-text"
    >
      {runs.map((r) => (
        <option key={r.id} value={r.id}>
          {r.id}
        </option>
      ))}
    </select>
    {run && (
      <div className="mt-2 text-[11.5px] text-muted">
        <div>{run.agent} · {run.status}</div>
        <div className="mono text-muted-2 mt-0.5">
          {formatDateTime(run.startTime)} · {formatDuration(run.duration)} · {run.eventCount} events
        </div>
        <Link to={`/replay/${run.id}`} className="text-accent text-[11px] hover:underline mt-1 inline-block">
          Open run →
        </Link>
      </div>
    )}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="rounded-md bg-surface border border-border p-6 text-center">
    <div className="text-[13px] text-text">Nothing to compare</div>
    <p className="text-[12px] text-muted mt-1 max-w-md mx-auto">
      You need at least one recorded run before you can diff anything. Run{" "}
      <span className="mono text-accent">rhq claude</span> to record a session.
    </p>
  </div>
);

export default DiffViewer;
