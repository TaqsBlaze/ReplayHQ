import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Run } from "../types";

const Files: React.FC = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [files, setFiles] = useState<string[]>([]);
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
        const data = await api.getRunFiles(selectedRun);
        if (!cancelled) {
          setFiles(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load files");
          setFiles([]);
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

  return (
    <div className="p-6 fade-in h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-text">Files</h1>
          <p className="text-[12px] text-muted mt-0.5">
            Files captured during each recording.
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
      ) : files.length === 0 ? (
        <div className="rounded-md bg-surface border border-border p-6 text-center text-[12px] text-muted">
          This run has no captured files yet.
        </div>
      ) : (
        <div className="rounded-md bg-surface border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {files.map((f) => (
              <li
                key={f}
                className="px-3 py-2 hover:bg-surface-2 flex items-center gap-2 text-[12px]"
              >
                <FileIcon />
                <span className="text-text mono truncate">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedRun && (
        <div className="mt-3 text-[11px] text-muted-2 mono">
          Files directory:{" "}
          <Link to={`/replay/${selectedRun}`} className="text-accent hover:underline">
            {selectedRun}
          </Link>
        </div>
      )}
    </div>
  );
};

const FileIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className="text-muted flex-shrink-0"
  >
    <path d="M4 4h6l2 2h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
  </svg>
);

const EmptyState: React.FC = () => (
  <div className="rounded-md bg-surface border border-border p-6 text-center">
    <div className="text-[13px] text-text">No files yet</div>
    <p className="text-[12px] text-muted mt-1 max-w-md mx-auto">
      Files appear here once the recorder captures a session. Run{" "}
      <span className="mono text-accent">rhq claude</span> to get started.
    </p>
  </div>
);

export default Files;
