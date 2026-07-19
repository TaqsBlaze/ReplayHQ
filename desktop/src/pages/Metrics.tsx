import React from 'react';

const Metrics: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Metrics
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        This page will display performance metrics and timings for the selected run.
      </p>
      {/* Placeholder for metrics cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Duration</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12.98s</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total execution time</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Thinking</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.2s</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Time spent thinking</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Tool Use</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">5.1s</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Time spent using tools</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Idle</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0.9s</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Time idle</p>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
