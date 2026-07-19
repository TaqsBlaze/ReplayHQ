import React from 'react';

const Plugins: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Plugins
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        This page will manage installed plugins and their configurations.
      </p>
      {/* Placeholder for plugin list */}
      <div className="mt-4 space-y-3">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Filesystem</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Provides file system operations for agents.
          </p>
          <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
            Configure
          </button>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Git</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Git integration for version control.
          </p>
          <button className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
            Configure
          </button>
        </div>
      </div>
    </div>
  );
};

export default Plugins;
