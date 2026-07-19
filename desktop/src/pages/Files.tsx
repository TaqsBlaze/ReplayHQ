import React from 'react';

const Files: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Files
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        This page will display the file changes during the selected run.
      </p>
      {/* Placeholder for file tree or list */}
      <div className="mt-6">
        <div className="space-y-2">
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-9 4h10.5a2 2 0 001.911-1.23l1.24-6.22A2 2 0 0015.09 3H10a2 2 0 00-2 2v7.59a2 2 0 001.412.587l2.054 1.027a2 2 0 002.122 0l2.054-1.027A2 2 0 0018.09 5h-4.09a2 2 0 00-1.911 1.23l-1.24 6.22A2 2 0 0014.5 19h10.5a2 2 0 002 0v-6.5a2 2 0 01-2-2h-5" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">src/main.tsx</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modified</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <svg className="h-5 w-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-9 4h10.5a2 2 0 001.911-1.23l1.24-6.22A2 2 0 0015.09 3H10a2 2 0 00-2 2v7.59a2 2 0 001.412.587l2.054 1.027a2 2 0 002.122 0l2.054-1.027A2 2 0 0018.09 5h-4.09a2 2 0 00-1.911 1.23l-1.24 6.22A2 2 0 0014.5 19h10.5a2 2 0 002 0v-6.5a2 2 0 01-2-2h-5" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">src/App.tsx</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Files;
