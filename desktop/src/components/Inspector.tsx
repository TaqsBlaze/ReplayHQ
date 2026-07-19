import React from 'react';

interface InspectorProps {
  selectedItem: any; // Could be an event, file, metric, etc.
  onClose?: () => void;
}

const Inspector: React.FC<InspectorProps> = ({ selectedItem, onClose }) => {
  if (!selectedItem) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Inspector
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close inspector"
          >
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Different views based on selected item type */}
        {selectedItem.type === 'event' && (
          <EventInspector event={selectedItem.data} />
        )}
        {selectedItem.type === 'file' && (
          <FileInspector file={selectedItem.data} />
        )}
        {selectedItem.type === 'metric' && (
          <MetricInspector metric={selectedItem.data} />
        )}
        {/* Default view */}
        {!['event', 'file', 'metric'].includes(selectedItem.type || '') && (
          <DefaultInspector item={selectedItem} />
        )}
      </div>
    </div>
  );
};

// Specific inspectors
const EventInspector: React.FC<{ event: any }> = ({ event }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded mb-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Event Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Type:</span>
            <span className="text-gray-700 dark:text-gray-300">{event.type}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Time:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {new Event(event.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Duration:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {(event.duration || 0).toFixed(3)}s
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Event Data</h3>
        <div className="mt-2">
          <pre className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

const FileInspector: React.FC<{ file: any }> = ({ file }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded mb-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">File Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Path:</span>
            <span className="text-gray-700 dark:text-gray-300 break-all">{file.path}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Change:</span>
            <span className={`text-gray-700 dark:text-gray-300 ${file.changeType === 'created' ? 'text-green-600' : file.changeType === 'deleted' ? 'text-red-600' : 'text-yellow-600'}`}>
              {file.changeType}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Size:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      
      {file.content && (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Content Preview</h3>
          <div className="mt-2">
            <pre className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded h-64 overflow-auto">
              {file.content.substring(0, 500)}{file.content.length > 500 ? '...' : ''}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricInspector: React.FC<{ metric: any }> = ({ metric }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Metric Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Name:</span>
            <span className="text-gray-700 dark:text-gray-300">{metric.name}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Value:</span>
            <span className="text-gray-700 dark:text-gray-300 font-mono">
              {metric.value} {metric.unit || ''}
            </span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Category:</span>
            <span className="text-gray-700 dark:text-gray-300">{metric.category}</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Timestamp:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {new Date(metric.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DefaultInspector: React.FC<{ item: any }> = ({ item }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Item Details</h3>
        <div className="mt-2 space-y-2">
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                {String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </label>
              <div className="text-sm text-gray-700 dark:text-gray-300 break-all">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inspector;
