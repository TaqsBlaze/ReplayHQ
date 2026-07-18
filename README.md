# ReplayHQ: AI Coding Agent Flight Recorder

[![Go Version](https://img.shields.io/badge/go-%3E%3D1.23-00ADD8.svg?style=for-the-badge&logo=go&logoColor=white)](https://golang.org/dl/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/TaqsBlaze/ReplayQH/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

> **Git tracks code changes. ReplayHQ tracks AI decisions.**

ReplayHQ is a developer productivity platform that acts as a flight recorder, debugger, and replay system for AI coding agents. It records, observes, analyzes, and replays AI-assisted development sessions to help developers understand, improve, and optimize their AI-powered workflows.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [Development Phases](#development-phases)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## Overview

ReplayHQ captures the complete context of AI-assisted development sessions, including:
- Process execution and PTY interactions
- File system changes
- Tool invocations and responses
- Timing and performance metrics
- Event sequences and durations

This enables developers to:
- **Debug AI workflows**: See exactly what the AI did and when
- **Optimize prompts and tools**: Identify bottlenecks and inefficient patterns
- **Reproduce sessions**: Share exact recordings for collaboration
- **Analyze performance**: Understand where time is spent in AI workflows
- **Improve reliability**: Detect flaky behavior and edge cases

## Features

### Core Capabilities
- **Flight Recording**: Complete capture of AI agent sessions
- **Process Monitoring**: PTY-based execution tracking with stdin/stdout/stderr capture
- **Event System**: Immutable, timestamped events for every significant action
- **Trace Storage**: Append-only local storage with human-readable format
- **Performance Metrics**: Detailed timing information for all operations
- **Timeline Visualization**: Chronological view of recorded sessions
- **Replay Engine**: Exact reproduction of recorded sessions
- **Plugin Architecture**: Extensible system for capturing domain-specific events

### Supported AI Agents (Planned)
- Claude Code
- OpenAI Codex CLI
- Gemini CLI
- Aider
- Goose
- Other terminal-based AI agents

### Key Benefits
- **Debugging**: Step-through replay of AI decision-making processes
- **Optimization**: Identify slow operations and inefficient patterns
- **Collaboration**: Share session recordings with team members
- **Learning**: Study effective AI workflows from expert users
- **Quality Assurance**: Detect regressions in AI-assisted development

## Architecture

ReplayHQ follows clean architecture principles with strict separation of concerns:

```
Business Logic
        ↓
Application Services
        ↓
Infrastructure
        ↓
External Systems
```

### Core Principles
- **Backend First**: Always develop backend before frontend/UI
- **Simplicity**: Prefer boring, explicit, readable code over clever solutions
- **Maintainability**: Code should be understandable by a junior developer in 6 months
- **Event-Driven**: Everything important becomes an event (AgentStarted, ToolCalled, etc.)
- **Execution Metrics**: Every session captures detailed timing information
- **Storage**: Append-only local storage (no complex databases initially)
- **CLI**: Primary interface using Cobra for command structure

### Key Components
- **Launcher**: Process execution with PTY support
- **Recorder**: Event collection and storage coordination
- **Storage**: Append-only trace storage (events.jsonl, metadata, file patches)
- **Timeline**: Event formatting and chronological display
- **Replay**: Session reconstruction and playback
- **Plugins**: Internal plugins for git, shell, filesystem monitoring
- **Server**: HTTP API and WebSocket for future clients
- **CLI**: Main entrypoint with subcommands (version, run, runs, replay, inspect)

## Getting Started

### Prerequisites
- Go 1.23 or later
- Git (for development)
- Unix-like system (Linux, macOS) - Windows support planned

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ReplayQH.git
cd ReplayQH

# Install dependencies
go mod tidy

# Build the CLI
go build ./cmd/rhq

# Optional: Install globally
go install ./cmd/rhq
```

### Usage
```bash
# Check version
rhq version

# Run and record a command
rhq run -- echo "Hello, ReplayHQ!"

# List recorded sessions (stubbed)
rhq runs

# Replay a session (stubbed)
rhq replay <session-id>

# Inspect a session (stubbed)
rhq inspect <session-id>
```

## Development Phases

Following the backend-first approach:

1. **Phase 1: Foundation** ✓
   - Go project setup
   - CLI with Cobra
   - Configuration and logging
   - Basic command execution
   - *Goal: `rhq version` works*

2. **Phase 2: Process Recording** ✓
   - Process launcher
   - PTY handling
   - Stdout/stderr recording
   - Timestamps
   - *Goal: `rhq bash` records session*

3. **Phase 3: Event System** ⏳
   - Event models
   - Event bus
   - Event storage
   - *Goal: Every action produces events*

4. **Phase 4: Trace Storage** ⏳
   - Create trace
   - Save events
   - Load trace
   - *Goal: Generate `session.rhq`*

5. **Phase 5: Filesystem Tracking** ⏳
   - File watcher
   - File changes
   - Patches
   - *Goal: Know exactly what changed during an agent run*

6. **Phase 6: Replay Engine** ⏳
   - Trace loading
   - Timeline reconstruction
   - Replay commands
   - *Goal: Replay a previous session*

7. **Phase 7: HTTP API** ⏳
   - REST API (`/runs`, `/runs/:id`, `/events/:id`)
   - WebSocket (`/stream`)
   - *Goal: Power desktop application*

## Project Structure
```
replayhq/
├── cmd/
│   └── rhq/                 # CLI entrypoint
│       └── main.go
├── internal/
│   ├── config/              # Configuration loading
│   ├── events/              # Event definitions
│   ├── launcher/            # Process launching
│   ├── logger/              # Structured logging
│   ├── pty/                 # Pseudoterminal handling
│   ├── process/             # Process lifecycle
│   ├── recorder/            # Event recording
│   ├── storage/             # Append-only trace storage
│   ├── timeline/            # Timeline formatting
│   ├── plugins/             # Internal plugins (git, shell, filesystem)
│   ├── server/              # HTTP/WebSocket API
│   └── replay/              # Replay engine
├── pkg/                     # Public helper libraries
├── docs/                    # Documentation
├── examples/                # Usage examples
├── tests/                   # Test files
├── go.mod
├── go.sum
├── README.md
└── LICENSE
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure your code follows the [style guidelines](#development-philosophy)
5. Add tests for new functionality
6. Run existing tests to ensure nothing is broken
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Development Philosophy
- **Simplicity First**: Choose the simplest solution that works
- **Readability**: Code should be self-explanatory
- **Backward Compatibility**: Avoid breaking changes when possible
- **Testing**: Every package must have tests
- **Documentation**: Document public functions and complex logic
- **Error Handling**: Handle errors explicitly; don't ignore them
- **Logging**: Use structured logging for observability

## License

ReplayHQ is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contact

Project Maintainer: [Tanaka Chinengundu](https://github.com/TaqsBlaze)
Project Link: [https://github.com/TaqsBlaze/ReplayQH](https://github.com/TaqsBlaze/ReplayQH)

## Acknowledgments

- Inspired by the need for better observability in AI-assisted development
- Built with [Go](https://golang.org/) and [Cobra](https://github.com/spf13/cobra)
- Influenced by systems like [rr](https://github.com/mozilla/rr) and [DTrace](https://dtrace.org/blogs/about/)
- Thanks to the open-source community for foundational tools and libraries

---

*Built with ❤️ for developers who want to understand and improve their AI-powered workflows.*

**Remember**: The backend is ReplayHQ. Everything else is a client. Stay focused on building a reliable, observable backend first.
