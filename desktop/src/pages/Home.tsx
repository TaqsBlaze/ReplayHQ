import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDuration } from "../services/api";
import type { Run } from "../types";

interface Metrics {
  runs: Run[];
  total: number;
  active: number;
  eventCount: number;
  totalDuration: number;
  avgDuration: number;
}

const emptyMetrics: Metrics = {
  runs: [],
  total: 0,
  active: 0,
  eventCount: 0,
  totalDuration: 0,
  avgDuration: 0,
};

const Home: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const runs = await api.getRuns();
        if (cancelled) return;
        const active = runs.filter((r) => r.status === "running").length;
        const eventCount = runs.reduce((acc, r) => acc + (r.eventCount || 0), 0);
        const totalDuration = runs
          .filter((r) => r.status !== "running")
          .reduce((acc, r) => acc + (r.duration || 0), 0);
        const completed = runs.filter((r) => r.status !== "running");
        const avgDuration = completed.length
          ? totalDuration / completed.length
          : 0;
        setMetrics({ runs, total: runs.length, active, eventCount, totalDuration, avgDuration });
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load runs");
          setMetrics(emptyMetrics);
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
      <div className="mb-5">
        <h1 className="text-[18px] font-semibold text-text">Dashboard</h1>
        <p className="text-[12px] text-muted mt-0.5">
          Overview of your ReplayHQ runs and recorded sessions.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 text-[12px] text-error border border-error/40 rounded bg-error/10">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-3">
        <KpiCard
          label="Active Sessions"
          value={String(metrics.active)}
          subtitle={`Across ${metrics.total} run${metrics.total === 1 ? "" : "s"}`}
          loading={loading}
        />
        <KpiCard
          label="Total Events"
          value={metrics.eventCount.toLocaleString()}
          subtitle={`From ${metrics.total} run${metrics.total === 1 ? "" : "s"}`}
          loading={loading}
        />
        <KpiCard
          label="Total Duration"
          value={formatDuration(metrics.totalDuration)}
          subtitle={metrics.total === 0 ? "No runs yet" : "All completed runs"}
          loading={loading}
        />
        <KpiCard
          label="Avg. Duration"
          value={formatDuration(metrics.avgDuration)}
          subtitle={
            metrics.total === 0
              ? "No runs yet"
              : `Across ${metrics.total - metrics.active} completed`
          }
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <PlaceholderCard
          title="Performance Timeline"
          description="Visualize the timeline of every recorded session."
        />
        <PlaceholderCard
          title="Anomaly Detection"
          description="Surface unusually slow operations and out-of-band behavior."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[13px] font-semibold text-text">Recent Runs</h2>
          <Link
            to="/runs"
            className="text-[11.5px] text-accent hover:underline"
          >
            View all →
          </Link>
        </div>
        <RecentRunsList runs={metrics.runs} loading={loading} />
      </div>
    </div>
  );
};

interface KpiProps {
  label: string;
  value: string;
  subtitle: string;
  loading: boolean;
}

const KpiCard: React.FC<KpiProps> = ({ label, value, subtitle, loading }) => (
  <div className="rounded-md bg-surface border border-border p-3.5">
    <div className="text-[11.5px] text-muted">{label}</div>
    <div className="mt-1 mono text-[22px] font-semibold text-accent leading-tight">
      {loading ? "—" : value}
    </div>
    <div className="text-[11px] text-muted-2 mt-0.5">{subtitle}</div>
  </div>
);

const PlaceholderCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="rounded-md bg-surface border border-border p-3.5 flex items-center justify-between min-h-[96px]">
    <div>
      <div className="text-[13px] font-medium text-text">{title}</div>
      <div className="text-[11.5px] text-muted mt-0.5">{description}</div>
    </div>
    <span className="text-[10.5px] mono text-muted-2 border border-border rounded px-1.5 py-0.5">
      Coming soon
    </span>
  </div>
);

const RecentRunsList: React.FC<{ runs: Run[]; loading: boolean }> = ({ runs, loading }) => {
  if (loading) {
    return (
      <div className="rounded-md bg-surface border border-border p-4 text-[12px] text-muted">
        Loading…
      </div>
    );
  }
  if (runs.length === 0) {
    return (
      <div className="rounded-md bg-surface border border-border p-4 text-[12px] text-muted">
        <div>No runs yet.</div>
        <div className="mt-1">
          Run <span className="mono text-accent">rhq claude</span> to record your first session.
        </div>
      </div>
    );
  }
  const recent = [...runs]
    .sort((a, b) => (a.startTime < b.startTime ? 1 : -1))
    .slice(0, 5);
  return (
    <div className="rounded-md bg-surface border border-border divide-y divide-border">
      {recent.map((r) => (
        <Link
          key={r.id}
          to={`/replay/${r.id}`}
          className="flex items-center gap-3 px-3 py-2 hover:bg-surface-2"
        >
          <span className="mono text-[10.5px] text-muted-2 w-[140px] flex-shrink-0 truncate">
            {r.id}
          </span>
          <span className="text-[12px] text-text w-[80px] flex-shrink-0">{r.agent}</span>
          <StatusPill status={r.status} />
          <span className="flex-1" />
          <span className="mono text-[11px] text-muted">
            {r.eventCount} events · {formatDuration(r.duration)}
          </span>
        </Link>
      ))}
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

export default Home;
