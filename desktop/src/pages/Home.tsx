import React from 'react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <>
      <motion.h2
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4"
      >
        Welcome to ReplayHQ Desktop Client
      </motion.h2>
      <motion.p
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="text-gray-600 dark:text-gray-300 mb-4"
      >
        This is the foundation phase of the desktop application.
      </motion.p>
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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
        >
          <motion.h3
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-semibold text-gray-900 dark:text-gray-100 mb-2"
          >
            Phase 1: Foundation - Completed
          </motion.h3>
          <motion.p
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-gray-600 dark:text-gray-300"
          >
            Setup React, Vite, Tailwind CSS, and routing for desktop client.
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
        >
          <motion.h3
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-semibold text-gray-900 dark:text-gray-100 mb-2"
          >
            Next: Phase 2 - Application Shell
          </motion.h3>
          <motion.p
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-gray-600 dark:text-gray-300"
          >
            Implement VS Code-style layout with sidebar, top bar, bottom panel, and resizable panels.
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Home;
