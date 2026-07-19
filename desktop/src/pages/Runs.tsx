import React from 'react';

const Runs: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Runs
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        This page will list all recorded runs.
      </p>
      {/* Placeholder for runs list */}
      <div className="mt-4 space-y-3">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Run #102 - claude
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            2026-07-19 10:21:04 - 10:21:17 (12.98s)
          </p>
          <div className="mt-2 flex space-x-2">
            <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
              Replay
            </button>
            <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
              Delete
            </button>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Run #101 - codex
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            2026-07-18 14:30:22 - 14:30:45 (23.45s)
          </p>
          <div className="mt-2 flex space-x-2">
            <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
              Replay
            </button>
            <button className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Runs;
