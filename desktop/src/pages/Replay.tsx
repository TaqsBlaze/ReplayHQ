import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Run } from '../types';
import ReplayVisualizer from '../components/replay/ReplayVisualizer';
import EventViewer from '../components/replay/EventViewer';

const Replay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [events, setEvents] = useState<Array<any>>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadReplayData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // In a real app, we'd fetch the specific run and its events
        const [runData, eventsData] = await Promise.all([
          api.getRun(id),
          // This would be a real API endpoint
          fetch(`/api/runs/${id}/events`).then(res => res.json())
        ]);
        
        setRun(runData);
        setEvents(eventsData || []);
      } catch (err) {
        console.error('Failed to load replay data:', err);
        // Use mock data for demonstration
        setRun({
          id: '1',
          name: 'Sample Run',
          agent: 'Claude',
          startTime: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          endTime: new Date().toISOString(),
          duration: 300,
          status: 'completed'
        });
        
        // Generate mock events
        const mockEvents = Array.from({ length: 20 }, (_, i) => ({
          id: `${i}`,
          timestamp: new Date(Date.now() - (20 - i) * 15000).toISOString(), // Spread over 5 minutes
          type: i % 3 === 0 ? 'ToolCalled' : i % 3 === 1 ? 'PromptReceived' : 'FileChanged',
          data: {
            description: `Event ${i + 1}`,
            details: `Details for event ${i + 1}`,
            file: i % 3 === 2 ? `src/file${Math.floor(i/3)}.js` : undefined,
            toolName: i % 3 === 0 ? ['readFile', 'writeFile', 'exec'][Math.floor(i/3) % 3] : undefined
          }
        }));
        setEvents(mockEvents);
      } finally {
        setLoading(false);
      }
    };

    loadReplayData();
  }, [id]);

  if (loading || !run) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading replay...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              ▶️
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Replay: {run.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {run.agent} • {new Date(run.startTime).toLocaleDateString()} {new Date(run.startTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-200">
              {run.status}
            </span>
            <span>Duration: {(run.duration || 0).toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ReplayVisualizer 
            events={events} 
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
          />
        </div>
        
        {/* Detail panel */}
        <div className="w-64 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Event Details
            </h2>
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close details"
            >
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          {selectedEvent ? (
            <div className="flex-1 overflow-y-auto p-4">
              <EventViewer event={selectedEvent} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Select an event from the timeline to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Replay;
