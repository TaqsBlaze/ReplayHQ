import React, { useEffect, useState } from 'react';
import { webSocketService } from '../services/websocket';
import { Event } from '../types';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState<string>('disconnected');

  useEffect(() => {
    const handleMessage = (data: any) => {
      // Assuming the data is an event object
      setEvents((prev) => [data, ...prev.slice(0, 99)]); // Keep last 100 events
    };

    const unsubscribe = webSocketService.addListener(handleMessage);
    webSocketService.connect();

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, []);

  // Also, we can fetch initial events from the API if needed
  // For now, we'll just show the websocket status and the live events

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Events
        </h2>
        <div className="px-3 py-1 rounded-md text-sm font-medium">
          {status === 'connected' ? (
            <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
              Connected
            </span>
          ) : status === 'connecting' ? (
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              Connecting...
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
              Disconnected
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No events yet. Waiting for events from the WebSocket...
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={event.id || index} className="p-3 border-l-4 border-blue-500 bg-white dark:bg-gray-800">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {event.type}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 break-all">
                  {JSON.stringify(event.data)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
