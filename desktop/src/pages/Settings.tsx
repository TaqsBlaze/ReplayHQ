import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const Settings: React.FC = () => {
  const [apiBase, setApiBase] = useState(api.baseUrl);
  const [health, setHealth] = useState<{ status: string; time: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then((h) => {
        if (!cancelled) setHealth(h);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Backend unreachable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 fade-in max-w-2xl">
      <h1 className="text-[18px] font-semibold text-text">Settings</h1>
      <p className="text-[12px] text-muted mt-0.5 mb-5">
        Connection details for the ReplayHQ backend.
      </p>

      <Section title="Backend">
        <Row label="HTTP API">
          <code className="mono text-[11.5px] text-text">{apiBase}</code>
        </Row>
        <Row label="WebSocket">
          <code className="mono text-[11.5px] text-text">
            {(import.meta.env.VITE_WS_BASE_URL as string) || "ws://localhost:8080"}/stream
          </code>
        </Row>
        <Row label="Status">
          {error ? (
            <span className="text-error text-[12px]">disconnected — {error}</span>
          ) : health ? (
            <span className="text-success text-[12px]">connected at {health.time}</span>
          ) : (
            <span className="text-muted text-[12px]">checking…</span>
          )}
        </Row>
      </Section>

      <Section title="Environment">
        <Row label="VITE_API_BASE_URL">
          <input
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            className="w-full bg-bg border border-border rounded px-2 py-1 text-[12px] mono text-text"
          />
          <p className="text-[11px] text-muted-2 mt-1">
            Restart the desktop app to apply changes.
          </p>
        </Row>
      </Section>

      <Section title="About">
        <Row label="Version">
          <span className="text-[12px] text-text">0.1.0</span>
        </Row>
        <Row label="Repo">
          <a
            href="https://github.com/TaqsBlaze/ReplayQH"
            className="text-accent text-[12px] hover:underline"
          >
            github.com/TaqsBlaze/ReplayQH
          </a>
        </Row>
      </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <div className="text-[10.5px] uppercase tracking-wide text-muted-2 mb-2">{title}</div>
    <div className="rounded-md bg-surface border border-border divide-y divide-border">
      {children}
    </div>
  </div>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="px-3 py-2.5">
    <div className="text-[10.5px] uppercase tracking-wide text-muted-2 mb-1">{label}</div>
    {children}
  </div>
);

export default Settings;
