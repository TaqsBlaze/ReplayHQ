import React from 'react';
import { Outlet } from 'react-router-dom';

const MainWorkspace: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <main className={`flex flex-col overflow-hidden bg-white dark:bg-gray-800 p-4 ${className || ''}`}>
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
      </header>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </main>
  );
};

export default MainWorkspace;
