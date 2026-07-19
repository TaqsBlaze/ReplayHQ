import React from 'react';
import { Event } from '../types';
import { motion } from 'framer-motion';

interface EventViewerProps {
  event: Event | null;
}

const EventViewer: React.FC<EventViewerProps> = ({ event }) => {
  if (!event) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        Select an event to view details
      </motion.div>
    );
  }

  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get appropriate icon color based on event type
  const getEventTypeClass = (type: string) => {
    switch (type) {
      case 'AgentStarted':
      case 'AgentStopped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'PromptSent':
      case 'PromptReceived':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'ToolCalled':
      case 'ToolCompleted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'FileCreated':
      case 'FileModified':
      case 'FileDeleted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'Error':
      case 'Exception':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'AgentStarted': 'Agent Started',
      'AgentStopped': 'Agent Stopped',
      'PromptSent': 'Prompt Sent',
      'PromptReceived': 'Prompt Received',
      'ToolCalled': 'Tool Called',
      'ToolCompleted': 'Tool Completed',
      'FileCreated': 'File Created',
      'FileModified': 'File Modified',
      'FileDeleted': 'File Deleted',
      'Error': 'Error Occurred',
      'Exception': 'Exception Thrown',
    };
    return map[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Event header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center space-x-4 p-4 rounded-lg"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-10 h-10 flex-shrink-0 rounded-full ${getEventTypeClass(event.type)} flex items-center justify-center`}>
          <span className="text-xs font-mono">{event.type.charAt(0)}</span>
        </motion.div>
        <motion.div>
          <motion.h2
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-semibold text-gray-900 dark:text-gray-100"
          >
            {getEventTypeLabel(event.type)}
          </motion.h2>
          <motion.p
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {formatTimestamp(event.timestamp)}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Event details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800/50 rounded-lg p-4"
        >
          <motion.h3
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-medium text-gray-900 dark:text-gray-100 mb-3"
          >
            Event Data
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            {Object.entries(event.data).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-1"
              >
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                  {String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </motion.label>
                <motion.div
                  className="ml-2"
                >
                  {typeof value === 'object' ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded"
                    >
                      <motion.pre
                        className="text-xs whitespace-pre-wrap break-all"
                      >
                        {JSON.stringify(value, null, 2)}
                      </motion.pre>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="break-all"
                    >
                      {String(value)}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Raw JSON view */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800/50 rounded-lg p-4"
        >
          <motion.h3
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-medium text-gray-900 dark:text-gray-100 mb-3"
          >
            Raw JSON
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded"
          >
            <motion.pre
              className="text-xs whitespace-pre-wrap break-all"
            >
              {JSON.stringify({
                id: event.id,
                type: event.type,
                timestamp: event.timestamp,
                data: event.data
              }, null, 2)}
            </motion.pre>
          </motion.div>
        </motion.div>

        {/* Related actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <motion.h3
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-medium text-gray-900 dark:text-gray-100 mb-4"
          >
            Related Actions
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // In a real app, this would jump to this point in the replay
                alert('Jump to this point in replay not implemented');
              }}
              className="w-full flex items-center justify-between px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              <span>Jump to this point in replay</span>
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // In a real app, this would show related events
                alert('Show related events not implemented');
              }}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm rounded"
            >
              <span>Show related events</span>
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14"/>
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // In a real app, this would allow adding notes/bookmarks
                alert('Add note/bookmark not implemented');
              }}
              className="w-full flex items-center justify-between px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              <span>Add note/bookmark</span>
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2-2v12a2 2 0 002 2z"/>
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EventViewer;