import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainWorkspace from "./MainWorkspace";
import BottomPanel from "./BottomPanel";

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex bg-bg text-text">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <MainWorkspace />
        <BottomPanel />
      </div>
      {children}
    </div>
  );
};

export default AppLayout;
