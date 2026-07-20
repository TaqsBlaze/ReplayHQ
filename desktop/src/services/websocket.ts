import { useEffect, useRef, useState } from "react";
import type { RHQEvent } from "../types";

const WS_BASE_URL =
  (import.meta.env.VITE_WS_BASE_URL as string | undefined) || "ws://localhost:8080";

export type WsStatus = "idle" | "connecting" | "open" | "closed" | "error";

interface ActivityState {
  events: RHQEvent[];
  status: WsStatus;
  lastError: string | null;
}

type Listener = (state: ActivityState) => void;

class ActivityFeed {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private events: RHQEvent[] = [];
  private status: WsStatus = "idle";
  private lastError: string | null = null;
  private shouldRun = false;
  private attempt = 0;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private snapshot(): ActivityState {
    return {
      events: this.events,
      status: this.status,
      lastError: this.lastError,
    };
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((l) => l(snap));
  }

  start() {
    this.shouldRun = true;
    this.open();
  }

  stop() {
    this.shouldRun = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status = "idle";
    this.emit();
  }

  pushEvents(events: RHQEvent[]) {
    // Seed the feed from an HTTP fetch (e.g. when the WebSocket isn't live).
    this.events = [...events, ...this.events].slice(0, 200);
    this.emit();
  }

  clear() {
    this.events = [];
    this.emit();
  }

  private open() {
    if (!this.shouldRun) return;
    this.status = "connecting";
    this.emit();
    try {
      this.ws = new WebSocket(`${WS_BASE_URL}/stream`);
    } catch (err) {
      this.lastError = (err as Error).message;
      this.status = "error";
      this.emit();
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.attempt = 0;
      this.status = "open";
      this.lastError = null;
      this.emit();
    };
    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as RHQEvent;
        if (data && data.type) {
          this.events = [data, ...this.events].slice(0, 200);
          this.emit();
        }
      } catch (err) {
        this.lastError = (err as Error).message;
        this.emit();
      }
    };
    this.ws.onerror = () => {
      this.status = "error";
      this.lastError = "WebSocket error";
      this.emit();
    };
    this.ws.onclose = () => {
      this.status = "closed";
      this.emit();
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (!this.shouldRun) return;
    if (this.reconnectTimer) return;
    this.attempt += 1;
    const delay = Math.min(15000, 1000 * 2 ** Math.min(this.attempt, 4));
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, delay);
  }
}

export const activityFeed = new ActivityFeed();

// React hook for components that want to subscribe to the feed.
export function useActivity() {
  const [state, setState] = useState<ActivityState>({
    events: [],
    status: "idle",
    lastError: null,
  });
  const startedRef = useRef(false);
  useEffect(() => {
    if (!startedRef.current) {
      activityFeed.start();
      startedRef.current = true;
    }
    return activityFeed.subscribe(setState);
  }, []);
  return state;
}
