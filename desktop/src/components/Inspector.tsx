import React from 'react';
import { motion } from 'framer-motion';

interface InspectorProps {
  selectedItem: any; // Could be an event, file, metric, etc.
  onClose?: () => void;
}

const Inspector: React.FC<InspectorProps> = ({ selectedItem, onClose }) => {
  if (!selectedItem) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <motion.h2
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Inspector
        </motion.h2>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close inspector"
          >
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </motion.button>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 overflow-y-auto p-4"
      >
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
      </motion.div>
    </motion.div>
  );
};

// Specific inspectors
const EventInspector: React.FC<{ event: any }> = ({ event }) => {
  return (
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
        transition={{ delay: 0.2 }}
        className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded mb-4"
      >
        <motion.h3
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="font-medium text-gray-900 dark:text-gray-100"
        >
          Event Information
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 text-sm"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Type:</span>
            <span className="text-gray-700 dark:text-gray-300">{event.type}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Time:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {new Event(event.timestamp).toLocaleTimeString()}
            </span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Duration:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {(event.duration || 0).toFixed(3)}s
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded"
      >
        <motion.h3
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="font-medium text-gray-900 dark:text-gray-100"
        >
          Event Data
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-2"
        >
          <motion.pre
            className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded"
          >
            {JSON.stringify(event.data, null, 2)}
          </motion.pre>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const FileInspector: React.FC<{ file: any }> = ({ file }) => {
  return (
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
        transition={{ delay: 0.2 }}
        className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded mb-4"
      >
        <motion.h3
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="font-medium text-gray-900 dark:text-gray-100"
        >
          File Information
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 text-sm"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Path:</span>
            <span className="text-gray-700 dark:text-gray-300 break-all">{file.path}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Change:</span>
            <span className={`text-gray-700 dark:text-gray-300 ${file.changeType === 'created' ? 'text-green-600' : file.changeType === 'deleted' ? 'text-red-600' : 'text-yellow-600'}`}>
              {file.changeType}
            </span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Size:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown'}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {file.content && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded"
        >
          <motion.h3
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-medium text-gray-900 dark:text-gray-100"
          >
            Content Preview
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-2"
          >
            <motion.pre
              className="text-xs whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded h-64 overflow-auto"
            >
              {file.content.substring(0, 500)}{file.content.length > 500 ? '...' : ''}
            </motion.pre>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

const MetricInspector: React.FC<{ metric: any }> = ({ metric }) => {
  return (
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
        transition={{ delay: 0.2 }}
        className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded"
      >
        <motion.h3
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="font-medium text-gray-900 dark:text-gray-100"
        >
          Metric Details
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 text-sm"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Name:</span>
            <span className="text-gray-700 dark:text-gray-300">{metric.name}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Value:</span>
            <span className="text-gray-700 dark:text-gray-300 font-mono">
              {metric.value} {metric.unit || ''}
            </span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Category:</span>
            <span className="text-gray-700 dark:text-gray-300">{metric.category}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <span className="w-24 font-medium text-gray-600 dark:text-gray-400">Timestamp:</span>
            <span className="text-gray-700 dark:text-gray-300">
              {new Date(metric.timestamp).toLocaleString()}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const DefaultInspector: React.FC<{ item: any }> = ({ item }) => {
  return (
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
        transition={{ delay: 0.2 }}
        className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded"
      >
        <motion.h3
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="font-medium text-gray-900 dark:text-gray-100"
        >
          Item Details
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-2 space-y-2"
        >
          {Object.entries(item).map(([key, value], index) => (
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
                className="text-sm text-gray-700 dark:text-gray-300 break-all"
              >
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Inspector;