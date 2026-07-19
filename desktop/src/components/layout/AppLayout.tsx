import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MainWorkspace from './MainWorkspace';
import BottomPanel from './BottomPanel';

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* TopBar - full width */}
      <TopBar />

      {/* Main content area - uses flex to take remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} onToggleCollapse={setCollapsed} />

        {/* Main workspace and bottom panel */}
        <div className="flex flex-col flex-1 relative">
          <MainWorkspace className="flex-1 overflow-hidden" />
          {/* Bottom panel - we'll make it resizable later, for now fixed height */}
          <div className="flex-shrink-0">
            <BottomPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
