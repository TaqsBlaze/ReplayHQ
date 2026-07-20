// Types shared with the Go backend (see internal/server/server.go and
// internal/events/event.go).

export type RunStatus = "running" | "completed" | "failed" | "unknown";

export interface Run {
  id: string;
  name: string;
  agent: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  eventCount: number;
  status: RunStatus;
}

export interface RunDetail extends Run {
  path: string;
  metadata: unknown;
  metrics: unknown;
}

export interface RHQEvent {
  id: string;
  type: string;
  time: string;
  duration?: number; // nanoseconds
  source?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, string>;
}

export interface FileChange {
  path: string;
  changeType: "created" | "modified" | "deleted";
  size?: number;
}
