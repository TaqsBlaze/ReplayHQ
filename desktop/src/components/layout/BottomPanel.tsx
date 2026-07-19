import React from 'react';

const BottomPanel: React.FC = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          CLI
        </button>
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          Logs
        </button>
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          Output
        </button>
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
          Terminal
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                &gt; rhq run claude --prompt "Hello, world!"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              [INFO] Starting Claude Code session...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              [INFO] Connected to MCP server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
