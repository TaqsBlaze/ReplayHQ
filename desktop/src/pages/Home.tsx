import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Welcome to ReplayHQ Desktop Client
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        This is the foundation phase of the desktop application.
      </p>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Phase 1: Foundation - Electron, React, Vite, Tailwind CSS, and Routing
      </p>
    </div>
  )
}

export default Home