import React from 'react';
import { Event } from '../types';

interface EventViewerProps {
  event: Event | null;
}

const EventViewer: React.FC<EventViewerProps> = ({ event }) => {
  if (!event) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Select an event to view details
      </div>
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
    <div className="space-y-6">
      {/* Event header */}
      <div className="flex items-center space-x-4 p-4 rounded-lg">
        <div className={`w-10 h-10 flex-shrink-0 rounded-full ${getEventTypeClass(event.type)} flex items-center justify-center`}>
          <span className="text-xs font-mono">{event.type.charAt(0)}</span>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            {getEventTypeLabel(event.type)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimestamp(event.timestamp)}
          </p>
        </div>
      </div>

      {/* Event details */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Event Data</h3>
          <div className="space-y-2">
            {Object.entries(event.data).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  {String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </label>
                <div className="ml-2">
                  {typeof value === 'object' ? (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                      <pre className="text-xs whitespace-pre-wrap break-all">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="break-all">
                      {String(value)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raw JSON view */}
        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Raw JSON</h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
            <pre className="text-xs whitespace-pre-wrap break-all">
              {JSON.stringify({
                id: event.id,
                type: event.type,
                timestamp: event.timestamp,
                data: event.data
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Related actions */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Related Actions</h3>
        <div className="space-y-3">
          <button
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
          </button>
          <button
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
          </button>
          <button
            onClick={() => {
              // In a real app, this would allow adding notes/bookmarks
              alert('Add note/bookmark not implemented');
            }}
            className="w-full flex items-center justify-between px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            <span>Add note/bookmark</span>
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventViewer;
