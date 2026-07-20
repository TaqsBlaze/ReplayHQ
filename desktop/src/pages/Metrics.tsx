import React, { useEffect, useMemo, useState } from "react";
import { api, formatDuration } from "../services/api";
import type { RHQEvent, Run } from "../types";

interface MetricsSummary {
  totalRuns: number;
  totalEvents: number;
  totalDuration: number;
  byType: { type: string; count: number; totalDurationMs: number }[];
  agentUsage: { agent: string; count: number }[];
}

const Metrics: React.FC = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [events, setEvents] = useState<RHQEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await api.getRuns();
        if (cancelled) return;
        setRuns(list);
        if (list.length > 0) setSelectedRun(list[0].id);
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

  useEffect(() => {
    if (!selectedRun) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getRunEvents(selectedRun);
        if (!cancelled) {
          setEvents(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load events");
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
  }, [selectedRun]);

  const summary = useMemo<MetricsSummary>(() => {
    const typeMap = new Map<string, { count: number; totalDurationMs: number }>();
    for (const e of events) {
      const prev = typeMap.get(e.type) ?? { count: 0, totalDurationMs: 0 };
      prev.count += 1;
      if (typeof e.duration === "number") prev.totalDurationMs += e.duration / 1_000_000;
      typeMap.set(e.type, prev);
    }
    const byType = Array.from(typeMap.entries())
      .map(([type, v]) => ({ type, ...v }))
      .sort((a, b) => b.count - a.count);

    const agentMap = new Map<string, number>();
    for (const r of runs) {
      agentMap.set(r.agent, (agentMap.get(r.agent) ?? 0) + 1);
    }
    const agentUsage = Array.from(agentMap.entries())
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);

    const totalDuration = runs
      .filter((r) => r.status !== "running")
      .reduce((acc, r) => acc + (r.duration || 0), 0);

    return {
      totalRuns: runs.length,
      totalEvents: events.length,
      totalDuration,
      byType,
      agentUsage,
    };
  }, [events, runs]);

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-text">Metrics</h1>
          <p className="text-[12px] text-muted mt-0.5">
            Aggregated stats across recorded sessions.
          </p>
        </div>
        {runs.length > 0 && (
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

      {runs.length === 0 ? (
        <EmptyState />
      ) : loading ? (
        <div className="rounded-md bg-surface border border-border p-4 text-[12px] text-muted">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat label="Total Runs" value={summary.totalRuns.toString()} />
          <Stat label="Total Events" value={summary.totalEvents.toString()} />
          <Stat label="Total Duration" value={formatDuration(summary.totalDuration)} />
        </div>
      )}

      {runs.length > 0 && !loading && (
        <div className="grid grid-cols-2 gap-3">
          <Card title="Events by Type">
            {summary.byType.length === 0 ? (
              <div className="text-[12px] text-muted">No events.</div>
            ) : (
              <ul className="space-y-1">
                {summary.byType.map((row) => (
                  <li
                    key={row.type}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <span className="text-text">{row.type}</span>
                    <span className="mono text-muted">
                      {row.count} · {formatDuration(row.totalDurationMs / 1000)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Runs by Agent">
            {summary.agentUsage.length === 0 ? (
              <div className="text-[12px] text-muted">No agents.</div>
            ) : (
              <ul className="space-y-1">
                {summary.agentUsage.map((row) => (
                  <li
                    key={row.agent}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <span className="text-text">{row.agent}</span>
                    <span className="mono text-muted">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md bg-surface border border-border p-3.5">
    <div className="text-[11.5px] text-muted">{label}</div>
    <div className="mt-1 mono text-[20px] font-semibold text-accent leading-tight">
      {value}
    </div>
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-md bg-surface border border-border p-3.5">
    <div className="text-[12px] font-medium text-text mb-2">{title}</div>
    {children}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="rounded-md bg-surface border border-border p-6 text-center">
    <div className="text-[13px] text-text">No metrics yet</div>
    <p className="text-[12px] text-muted mt-1 max-w-md mx-auto">
      Metrics populate as soon as a recording is available. Run{" "}
      <span className="mono text-accent">rhq claude</span> to start.
    </p>
  </div>
);

export default Metrics;
