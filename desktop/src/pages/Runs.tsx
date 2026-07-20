import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDateTime, formatDuration } from "../services/api";
import type { Run } from "../types";

const Runs: React.FC = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.getRuns();
        if (!cancelled) {
          setRuns(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load runs");
          setRuns([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-text">Runs</h1>
          <p className="text-[12px] text-muted mt-0.5">
            All recorded sessions on this machine.
          </p>
        </div>
        <span className="mono text-[11px] text-muted">
          {runs.length} run{runs.length === 1 ? "" : "s"}
        </span>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 text-[12px] text-error border border-error/40 rounded bg-error/10">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : runs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-md bg-surface border border-border overflow-hidden">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.7fr_0.5fr] gap-2 px-3 py-2 text-[10.5px] uppercase tracking-wide text-muted-2 border-b border-border">
            <span>Run</span>
            <span>Agent</span>
            <span>Status</span>
            <span>Events</span>
            <span>Duration</span>
            <span />
          </div>
          <ul className="divide-y divide-border">
            {runs
              .slice()
              .sort((a, b) => (a.startTime < b.startTime ? 1 : -1))
              .map((r) => (
                <li key={r.id} className="hover:bg-surface-2">
                  <Link
                    to={`/replay/${r.id}`}
                    className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.7fr_0.5fr] gap-2 items-center px-3 py-2 text-[12px]"
                  >
                    <div className="min-w-0">
                      <div className="text-text truncate">{r.id}</div>
                      <div className="text-[10.5px] text-muted-2 mono truncate">
                        {formatDateTime(r.startTime)}
                      </div>
                    </div>
                    <div className="text-text truncate">{r.agent}</div>
                    <div>
                      <StatusPill status={r.status} />
                    </div>
                    <div className="mono text-muted">{r.eventCount}</div>
                    <div className="mono text-muted">{formatDuration(r.duration)}</div>
                    <div className="text-right text-accent text-[12px]">→</div>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const color =
    status === "completed"
      ? "text-success border-success/40"
      : status === "failed"
        ? "text-error border-error/40"
        : status === "running"
          ? "text-warn border-warn/40"
          : "text-muted border-border";
  return (
    <span
      className={`mono text-[10.5px] border rounded px-1.5 py-[1px] ${color}`}
    >
      {status}
    </span>
  );
};

const Skeleton: React.FC = () => (
  <div className="rounded-md bg-surface border border-border p-3 text-[12px] text-muted">
    Loading…
  </div>
);

const EmptyState: React.FC = () => (
  <div className="rounded-md bg-surface border border-border p-6 text-center">
    <div className="text-[13px] text-text">No runs yet</div>
    <p className="text-[12px] text-muted mt-1 max-w-md mx-auto">
      Record your first session by running{" "}
      <span className="mono text-accent">rhq claude</span> in your shell.
      Traces land under{" "}
      <span className="mono text-muted-2">~/.replayhq/</span>.
    </p>
  </div>
);

export default Runs;
