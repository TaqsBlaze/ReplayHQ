import type { RHQEvent, Run, RunDetail } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8080";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    ...init,
  });
  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      // ignore
    }
    throw new ApiError(
      `Request failed (${response.status}): ${detail || path}`,
      response.status,
    );
  }
  return (await response.json()) as T;
}

export const api = {
  baseUrl: API_BASE_URL,

  health: () => request<{ status: string; time: string }>("/health"),

  getRuns: () => request<Run[]>("/runs"),

  getRun: (id: string) => request<RunDetail>(`/runs/${encodeURIComponent(id)}`),

  getRunEvents: (id: string) =>
    request<RHQEvent[]>(`/runs/${encodeURIComponent(id)}/events`),

  getRunFiles: (id: string) =>
    request<string[]>(`/runs/${encodeURIComponent(id)}/files`),

  startSession: (cmd: string, args: string[], cols: number, rows: number) =>
    request<{ id: string; wsPath: string }>("/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd, args, cols, rows }),
    }),

  killSession: (id: string) =>
    request<void>(`/sessions/${encodeURIComponent(id)}`, {
      method: "POST",
    }),

  getSession: (id: string) =>
    request<{
      id: string;
      cmd: string;
      args: string[];
      status: string;
      startedAt: string;
      endedAt?: string;
      exitCode: number;
    }>(`/sessions/${encodeURIComponent(id)}`),
};

export { ApiError };

/** Format a duration in seconds into a compact "1.2s" / "1m 24s" / "1h 12m" string. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0s";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

/** Format a timestamp as HH:MM:SS.mmm. */
export function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

/** Format a timestamp as a short date+time. */
export function formatDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}
