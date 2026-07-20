import React from "react";
import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/runs", label: "Runs", icon: <RunsIcon /> },
  { to: "/replay", label: "Replay", icon: <ReplayIcon /> },
  { to: "/events", label: "Events", icon: <EventsIcon /> },
  { to: "/files", label: "Files", icon: <FilesIcon /> },
  { to: "/metrics", label: "Metrics", icon: <MetricsIcon /> },
  { to: "/plugins", label: "Plugins", icon: <PluginsIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-14 flex-shrink-0 bg-surface border-r border-border flex flex-col items-center">
      <div className="h-10 w-full flex items-center justify-center border-b border-border">
        <span className="mono text-accent text-[15px] font-semibold tracking-tight">rhq</span>
      </div>
      <nav className="flex-1 w-full flex flex-col items-center py-2 gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              [
                "group relative w-10 h-10 flex items-center justify-center rounded-md",
                "text-muted hover:text-text hover:bg-surface-2 transition-colors",
                isActive ? "!text-accent" : "",
              ].join(" ")
            }
            title={item.label}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-accent rounded-r" />
                )}
                {item.icon}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="h-10 w-full flex items-center justify-center border-t border-border">
        <BackendDot />
      </div>
    </aside>
  );
};

const BackendDot: React.FC = () => {
  const [status, setStatus] = React.useState<"ok" | "down">("down");
  React.useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      try {
        const res = await fetch(
          (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8080",
          { method: "GET" },
        );
        if (!cancelled) setStatus(res.ok ? "ok" : "down");
      } catch {
        if (!cancelled) setStatus("down");
      }
    };
    ping();
    const id = setInterval(ping, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  return (
    <div
      title={status === "ok" ? "Backend connected" : "Backend not connected"}
      className={[
        "w-2 h-2 rounded-full",
        status === "ok" ? "bg-success pulse-dot" : "bg-error",
      ].join(" ")}
    />
  );
};

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function DashboardIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function RunsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

function FilesIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4h6l2 2h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function MetricsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 20V10" />
      <path d="M9 20V4" />
      <path d="M15 20v-7" />
      <path d="M21 20V8" />
    </svg>
  );
}

function PluginsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 3v4H5v4h4v4H5v4h4M15 3v4h4v4h-4v4h4v4h-4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export default Sidebar;
