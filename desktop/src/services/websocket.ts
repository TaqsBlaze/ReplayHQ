import { useEffect, useRef, useState } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export const useWebSocket = (onMessage: (data: any) => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<string>('disconnected');

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE_URL}/events`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [onMessage]);

  return { status };
};

// Alternatively, we can create a singleton service
class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: ((data: any) => void)[] = [];

  connect() {
    this.ws = new WebSocket(`${WS_BASE_URL}/events`);
    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(listener => listener(data));
    };
    this.ws.onclose = () => {
      this.ws = null;
    };
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  addListener(listener: (data: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const webSocketService = new WebSocketService();
