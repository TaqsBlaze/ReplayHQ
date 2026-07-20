import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainWorkspace from "./MainWorkspace";
import BottomPanel from "./BottomPanel";

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem("sidebarWidth");
    return saved ? parseFloat(saved) : 60; // default 60px
  });
  const [bottomHeight, setBottomHeight] = useState<number>(() => {
    const saved = localStorage.getItem("bottomHeight");
    return saved ? parseFloat(saved) : 180; // default 180px
  });

  useEffect(() => {
    localStorage.setItem("sidebarWidth", String(sidebarWidth));
    localStorage.setItem("bottomHeight", String(bottomHeight));
  }, [sidebarWidth, bottomHeight]);

  const handleVerticalDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      let newWidth = startWidth + delta;
      newWidth = Math.max(40, Math.min(250, newWidth));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleHorizontalDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = bottomHeight;

    const handleMouseMove = (e: MouseEvent) => {
      // When dragging down, increase bottom height
      let newHeight = startHeight + (e.clientY - startY);
      newHeight = Math.max(60, Math.min(400, newHeight));
      setBottomHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="h-screen w-screen flex bg-bg text-text">
      {/* Sidebar */}
      <div
        className={`
          w-[${sidebarWidth}px]
          flex-shrink-0
          bg-surface
          border-r
          border-border
          flex
          flex-col
          items-center
          overflow-hidden
        `}
      >
        <Sidebar />
      </div>

      {/* Vertical splitter */}
      <div className="w-2 cursor-col-resize select-none bg-border" onMouseDown={handleVerticalDragStart} />

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <div className="flex-1 min-h-0">
          <MainWorkspace />
        </div>

        {/* Horizontal splitter */}
        <div className="h-2 cursor-row-resize select-none bg-border" onMouseDown={handleHorizontalDragStart} />

        {/* Bottom panel */}
        <div className={`h-[${bottomHeight}px] flex-shrink-0 border-t border-border`}>
          <BottomPanel />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
