import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  return (
    <motion.aside
      initial={{ x: collapsed ? '-100%' : 0 }}
      animate={{ x: collapsed ? '-100%' : 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-md z-50"
    >
      <div className="flex h-screen flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ReplayHQ
          </div>
          <button
            onClick={() => onToggleCollapse(!collapsed)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Toggle sidebar"
          >
            {/* Hamburger icon when expanded, arrow when collapsed */}
            {!collapsed ? (
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto pt-2">
          <ul className="space-y-1 px-2">
            {/* Nav items */}
            <li>
              <motion.a
                href="/"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md block w-full"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                <span>Dashboard</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href="/runs"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md block w-full"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14" />
                </svg>
                <span>Runs</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href="/events"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md block w-full"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14" />
                </svg>
                <span>Events</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href="/files"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md block w-full"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14" />
                </svg>
                <span>Files</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href="/metrics"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md block w-full"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14" />
                </svg>
                <span>Metrics</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href="/plugins"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md block w-full"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14" />
                </svg>
                <span>Plugins</span>
              </motion.a>
            </li>
            <li>
              <motion.a
                href="/settings"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md block w-full"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H3m8 4H3m-9 8h18M5 8h14M5 12h14M5 16h14" />
                </svg>
                <span>Settings</span>
              </motion.a>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4 pb-6 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
            v0.1.0
          </p>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
