import React from "react";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/runs": "Runs",
  "/replay": "Replay",
  "/events": "Events",
  "/files": "Files",
  "/metrics": "Metrics",
  "/plugins": "Plugins",
  "/settings": "Settings",
  "/about": "About",
};

function titleFor(pathname: string): string {
  if (pathname.startsWith("/replay/")) return "Replay";
  return titles[pathname] ?? "ReplayHQ";
}

const TopBar: React.FC = () => {
  const location = useLocation();
  const title = titleFor(location.pathname);

  return (
    <header className="h-10 flex-shrink-0 bg-surface border-b border-border flex items-center px-3 gap-3">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-muted">ReplayHQ</span>
        <span className="text-muted-2">/</span>
        <span className="text-text">{title}</span>
      </div>
      <div className="flex-1" />
      <SearchBox />
    </header>
  );
};

const SearchBox: React.FC = () => {
  const [value, setValue] = React.useState("");
  return (
    <div className="w-[320px] max-w-[40vw] h-7 flex items-center gap-2 px-2 rounded bg-bg border border-border text-muted focus-within:border-accent">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search runs, events, files..."
        className="flex-1 h-full text-[12px] placeholder:text-muted-2 text-text"
      />
      <span className="mono text-[10px] text-muted-2 px-1 border border-border rounded">⌘K</span>
    </div>
  );
};

export default TopBar;
