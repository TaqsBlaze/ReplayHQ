import React from 'react';

const About: React.FC = () => {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        About ReplayHQ Desktop Client
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        This desktop application is being built as a client for the ReplayHQ backend.
        It follows the architecture outlined in the DESKTOP-CLIENT-PLAN.md document.
      </p>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Technology Stack:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
            <li>React 18 with TypeScript</li>
            <li>Vite as build tool</li>
            <li>Tailwind CSS 4 for styling</li>
            <li>React Router for navigation</li>
            <li>Electron for desktop wrapper (coming in later phases)</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Layout Inspiration:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
            <li>Visual Studio Code</li>
            <li>GitHub Desktop</li>
            <li>Postman</li>
            <li>Docker Desktop</li>
            <li>Linear</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default About;
