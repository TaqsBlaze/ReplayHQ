import React from 'react';

const Events: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Events
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        This page will display a timeline of events from the selected run.
      </p>
      {/* Placeholder for event list */}
      <div className="mt-4 space-y-3">
        <div className="p-4 border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            AgentStarted
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            10:21:04.128
          </p>
        </div>
        <div className="p-4 border-l-4 border-green-500 bg-gray-50 dark:bg-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            PromptSent
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            10:21:05.441 - "Hello, world!"
          </p>
        </div>
        <div className="p-4 border-l-4 border-yellow-500 bg-gray-50 dark:bg-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            ToolCalled
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            10:21:08.091 - readFile (README.md)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Events;
