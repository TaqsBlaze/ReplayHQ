import React from 'react';
import { motion } from 'framer-motion';

const BottomPanel: React.FC = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    >
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b-2 border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          CLI
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          Logs
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          Output
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          Terminal
        </motion.button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4"
        >
          <div className="space-y-2">
            <motion.p
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="text-sm text-gray-500 dark:text-gray-400 p-2 rounded"
            >
                &gt; rhq run claude --prompt "Hello, world!"
            </motion.p>
            <motion.p
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="text-sm text-gray-500 dark:text-gray-400 p-2 rounded"
            >
              [INFO] Starting Claude Code session...
            </motion.p>
            <motion.p
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="text-sm text-gray-500 dark:text-gray-400 p-2 rounded"
            >
              [INFO] Connected to MCP server.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BottomPanel;
