import React from 'react';

const Home: React.FC = () => {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Welcome to ReplayHQ Desktop Client
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        This is the foundation phase of the desktop application.
      </p>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Phase 1: Foundation - Completed
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Setup React, Vite, Tailwind CSS, and routing for desktop client.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Next: Phase 2 - Application Shell
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Implement VS Code-style layout with sidebar, top bar, bottom panel, and resizable panels.
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
