import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Run } from '../types';
import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-96"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></motion.div>
        <motion.p
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 text-gray-500"
        >
          Loading replay...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow-md px-6 py-4"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm"
            >
              ▶️
            </motion.div>
            <motion.div>
              <motion.h1
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-xl font-semibold text-gray-900 dark:text-gray-100"
              >
                Replay: {run.name}
              </motion.h1>
              <motion.p
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {run.agent} • {new Date(run.startTime).toLocaleDateString()} {new Date(run.startTime).toLocaleTimeString()}
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-4 text-sm"
          >
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-200"
            >
              {run.status}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Duration: {(run.duration || 0).toFixed(1)}s
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex overflow-hidden"
      >
        {/* Visualization panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <ReplayVisualizer
            events={events}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
          />
        </motion.div>

        {/* Detail panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="w-64 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden bg-white dark:bg-gray-800"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <motion.h2
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Event Details
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedEvent(null)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close details"
            >
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </motion.button>
          </motion.div>

          {selectedEvent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto p-4"
            >
              <EventViewer event={selectedEvent} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center py-12"
            >
              <motion.p
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-gray-500 dark:text-gray-400 text-center"
              >
                Select an event from the timeline to view details
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Replay;
