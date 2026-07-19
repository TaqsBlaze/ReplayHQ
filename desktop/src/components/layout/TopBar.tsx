import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TopBar: React.FC = () => {
  return (
    <header className="z-40 bg-white dark:bg-gray-800 shadow-md">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-4 py-3 sm:px-6"
      >
        {/* Left side - App name and window controls (for electron) */}
        <div className="flex items-center space-x-4">
          <motion.a
            href="/"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0"
          >
            <svg className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z" />
            </svg>
          </motion.a>
          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">ReplayHQ Desktop Client</span>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2zm0 12c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2- .9 2-2 2z" />
            </svg>
          </motion.button>
          <motion.div className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="hidden md:block">Jane Doe</span>
              <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>
            {/* Dropdown menu - simplified */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
            >
              <motion.a
                href="#"
                whileHover={{ backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Profile
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Settings
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Logout
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
};

export default TopBar;