import React from "react";

const About: React.FC = () => {
  return (
    <div className="p-6 fade-in max-w-2xl">
      <h1 className="text-[18px] font-semibold text-text">About ReplayHQ</h1>
      <p className="text-[12px] text-muted mt-1 mb-5">
        ReplayHQ is a flight recorder, debugger, and replay system for AI coding
        agents. The desktop client is a thin window onto the Go backend.
      </p>
      <div className="rounded-md bg-surface border border-border p-4 text-[12.5px] text-text space-y-2">
        <p>
          Git tracks code changes. ReplayHQ tracks AI decisions.
        </p>
        <p className="text-muted">
          Supported agents: Claude Code, Codex CLI, Gemini CLI, Aider, Goose, and
          other terminal-based AI agents.
        </p>
      </div>
    </div>
  );
};

export default About;
