import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const MainWorkspace: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col overflow-hidden bg-white dark:bg-gray-800 p-4 ${className || ''}`}
    >
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
      </motion.header>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 overflow-auto"
      >
        <Outlet />
      </motion.div>
    </motion.main>
  );
};

export default MainWorkspace;
