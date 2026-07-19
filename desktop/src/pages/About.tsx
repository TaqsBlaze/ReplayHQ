import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <>
      <motion.h2
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4"
      >
        About ReplayHQ Desktop Client
      </motion.h2>
      <motion.p
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="text-gray-600 dark:text-gray-300 mb-4"
      >
        This desktop application is being built as a client for the ReplayHQ backend.
        It follows the architecture outlined in the DESKTOP-CLIENT-PLAN.md document.
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
            Technology Stack:
          </motion.h3>
          <motion.ul
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300"
          >
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              React 18 with TypeScript
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              Vite as build tool
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              Tailwind CSS 4 for styling
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              React Router for navigation
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              Electron for desktop wrapper (coming in later phases)
            </motion.li>
          </motion.ul>
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
            Layout Inspiration:
          </motion.h3>
          <motion.ul
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300"
          >
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              Visual Studio Code
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              GitHub Desktop
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              Postman
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              Docker Desktop
            </motion.li>
            <motion.li
              whileHover={{ backgroundColor: "gray-50 dark:gray-700/50" }}
              className="p-2 rounded"
            >
              Linear
            </motion.li>
          </motion.ul>
        </motion.div>
      </motion.div>
    </>
  );
};

export default About;
