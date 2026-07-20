import React from "react";

interface Plugin {
  name: string;
  description: string;
  status: "available" | "coming soon";
}

const plugins: Plugin[] = [
  {
    name: "Filesystem",
    description: "Tracks file changes during agent runs (built-in).",
    status: "available",
  },
  {
    name: "Shell",
    description: "Captures shell command output and exit codes (built-in).",
    status: "available",
  },
  {
    name: "Git",
    description: "Records git operations and repository state.",
    status: "coming soon",
  },
  {
    name: "MCP",
    description: "Observes Model Context Protocol traffic.",
    status: "coming soon",
  },
];

const Plugins: React.FC = () => {
  return (
    <div className="p-6 fade-in">
      <h1 className="text-[18px] font-semibold text-text">Plugins</h1>
      <p className="text-[12px] text-muted mt-0.5 mb-4">
        Internal plugins bundled with the recorder.
      </p>
      <div className="rounded-md bg-surface border border-border divide-y divide-border">
        {plugins.map((p) => (
          <div key={p.name} className="px-3 py-2.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] text-text">{p.name}</div>
              <div className="text-[11.5px] text-muted">{p.description}</div>
            </div>
            <span
              className={[
                "mono text-[10.5px] border rounded px-1.5 py-[1px]",
                p.status === "available"
                  ? "text-success border-success/40"
                  : "text-muted border-border",
              ].join(" ")}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plugins;
