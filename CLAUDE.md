# ReplayHQ Backend Development Guidelines

## Project Overview

You are building **ReplayHQ**, a developer productivity platform that acts as a flight recorder, debugger, and replay system for AI coding agents.

ReplayHQ records, observes, analyzes, and replays AI-assisted development sessions.

The long-term vision:

> Git tracks code changes. ReplayHQ tracks AI decisions.

The system should support AI coding tools such as:

* Claude Code
* OpenAI Codex CLI
* Gemini CLI
* Aider
* Goose
* Other terminal-based AI agents

ReplayHQ should be built as a professional developer tool with a strong emphasis on:

* simplicity
* reliability
* maintainability
* clean architecture
* predictable behavior
* excellent developer experience

---

# Core Development Rule

## Backend First. Always.

The project must be developed in this order:

1. Go backend
2. CLI tooling
3. Core recording engine
4. Trace storage
5. Replay engine
6. Plugin architecture
7. API layer
8. Desktop application

DO NOT start building:

* Electron
* React
* UI components
* dashboards
* visualizations

until the Go backend is stable and functional.

The backend is the product.

The desktop application is only a client.

---

# Engineering Philosophy

Act as if a junior developer will maintain this codebase in the future.

Every implementation decision should answer:

> "Will a developer understand this six months from now?"

Avoid clever solutions.

Prefer:

* boring code
* explicit code
* readable code
* small functions
* clear naming
* simple control flow

---

# Technology Requirements

Backend:

* Language: Go
* Minimum version: Go 1.23+
* Build system: Go modules
* CLI: Cobra
* Logging: structured logging
* Serialization: JSON initially
* Storage: append-only local storage
* Communication: HTTP + WebSocket

---

# Architecture Principles

ReplayHQ should follow clean architecture principles.

The codebase should separate:

```
Business Logic

↓

Application Services

↓

Infrastructure

↓

External Systems
```

Never mix:

* storage logic with business logic
* CLI logic with recording logic
* API handlers with core logic

---

# Recommended Project Structure

Use this structure:

```
replayhq/

├── cmd/
│   └── rhq/
│       └── main.go
│
├── internal/
│
│   ├── config/
│   │
│   ├── events/
│   │
│   ├── recorder/
│   │
│   ├── launcher/
│   │
│   ├── process/
│   │
│   ├── pty/
│   │
│   ├── filesystem/
│   │
│   ├── storage/
│   │
│   ├── replay/
│   │
│   ├── timeline/
│   │
│   ├── plugins/
│   │
│   ├── server/
│   │
│   └── logger/
│
├── pkg/
│
├── docs/
│
├── examples/
│
├── tests/
│
├── go.mod
│
└── README.md
```

---

# Naming Rules

Naming must always be simple and obvious.

## Packages

Use short lowercase names.

Correct:

```
storage
events
replay
launcher
```

Incorrect:

```
storageengine
eventmanagementsystem
replayorchestrationservice
```

---

## Files

Use lowercase snake_case only when needed.

Examples:

```
event.go

storage.go

filesystem_watcher.go
```

Avoid:

```
EventManager.go

StorageEngineImplementation.go
```

---

## Interfaces

Interfaces should describe behavior.

Good:

```go
type Recorder interface {
    Start()
    Stop()
}
```

Bad:

```go
type IReplayHQRecorderManager interface {
}
```

---

# Avoid Over Engineering

Do NOT create abstractions before they are required.

Bad:

Creating:

```
StorageFactory
StorageProvider
StorageManager
StorageRepository
StorageAdapter
```

when only one storage implementation exists.

Good:

```
storage.Store
```

Add complexity only when there is a real requirement.

---

# Event System

ReplayHQ is event-driven.

Everything important becomes an event.

Examples:

```
AgentStarted

AgentStopped

PromptSent

PromptReceived

ToolCalled

ToolCompleted

FileChanged

CommandExecuted

MCPRequest

MCPResponse

ReplayStarted

ReplayCompleted
```

Use a common event structure.

Example:

```go
type Event struct {

    ID string

    Type string

    Time time.Time

    Source string

    Data map[string]interface{}

}
```

Events should be:

* immutable
* timestamped
* append-only

---

# Recorder System

The recorder is responsible for capturing execution.

Responsibilities:

* launch processes
* attach monitoring
* collect events
* send events to storage

The recorder should NOT:

* render UI
* analyze data
* make decisions

Example:

```
Recorder

↓

Events

↓

Storage
```

---

# CLI Requirements

The CLI command is:

```
rhq
```

Examples:

Start Claude:

```
rhq claude
```

Start Codex:

```
rhq codex
```

List recordings:

```
rhq runs
```

Replay:

```
rhq replay <id>
```

Inspect:

```
rhq inspect <id>
```

The CLI should remain simple.

---

# Trace Storage

ReplayHQ stores executions as traces.

File extension:

```
.rhq
```

Example:

```
project-debug.rhq
```

Initial storage format:

```
trace/

    metadata.json

    events.jsonl

    files/

    patches/

    tools/

    metrics.json
```

Do not build a complicated database.

Start simple.

Optimize later.

---

# Replay Engine

The replay engine should be independent.

Responsibilities:

* load traces
* reconstruct execution state
* replay events
* compare executions

Replay modes:

1. Exact replay

2. Cached replay

3. Branch replay

Do not implement all modes immediately.

Start with:

* loading trace
* displaying timeline
* replaying recorded events

---

# Plugin System

Do not build a complicated plugin framework initially.

Start with internal plugins.

Example:

```
plugins/

    git

    shell

    filesystem
```

Only create external plugin APIs after the core system works.

---

## Execution Metrics

Execution metrics are a first-class feature of ReplayHQ.

Every recorded session MUST capture detailed timing information to allow developers to understand where time was spent during an AI workflow.

The recorder must capture, at minimum:

* Session start time
* Session end time
* Total execution duration
* Agent startup time
* Time to first response
* Time spent thinking (when observable)
* Time spent waiting for model responses
* Time spent executing tools
* Time spent waiting on tool responses
* Time spent reading files
* Time spent writing files
* Time spent executing shell commands
* Time spent in Git operations
* Time spent communicating with MCP servers
* Time spent performing network requests
* Idle time
* Replay duration

All timestamps must use high-resolution monotonic clocks where available to ensure accurate duration calculations.

---

## Performance Timeline

Every execution should produce a performance timeline.

Example:

```text
10:21:04.128  Session Started

10:21:05.441  Claude Code Started

10:21:08.091  Read README.md (412 ms)

10:21:08.813  Search auth middleware (684 ms)

10:21:11.551  Edited auth.go (1.2 s)

10:21:14.018  Executed go test (2.4 s)

10:21:17.101  Tests Passed

10:21:17.106  Session Completed

Total Duration: 12.98 seconds
```

The timeline should be generated entirely from recorded events and must remain deterministic during replay.

---

## Performance Analytics

ReplayHQ must calculate summary metrics for every run.

Example:

```text
Run Duration

12.98 seconds

Agent Thinking

4.2 seconds

Tool Execution

5.1 seconds

Filesystem Operations

1.3 seconds

Git Operations

420 ms

Network Wait

980 ms

Idle Time

0.9 seconds
```

These metrics should be computed automatically after each session completes.

---

## Duration Comparison

ReplayHQ should allow two executions to be compared.

Example:

```text
Run #102

Duration

2m 18s

Run #108

Duration

54s

Improvement

60.9%
```

Developers should immediately see whether changes to prompts, tools, models, or workflows improved execution speed.

---

## Slow Operation Detection

ReplayHQ should automatically identify unusually slow operations.

Examples:

* Shell command exceeded expected execution time.
* MCP server response slower than historical average.
* File search consumed excessive time.
* Agent repeatedly searched the same files.
* Model response latency significantly increased.
* Long idle periods detected.

These insights should be emitted as analytics events without modifying the recorded execution.

---

## Event Timing

Every event must include precise timing metadata.

Example:

```go
type Event struct {
    ID        string
    Type      string
    Time      time.Time
    Duration  time.Duration
    Source    string
    Data       map[string]any
}
```

Duration should represent the elapsed time for the completed operation.

---

## Performance Principle

Performance data is part of the ReplayHQ trace.

A ReplayHQ trace should answer three fundamental questions:

1. What happened?
2. Why did it happen?
3. How long did every step take?

Every subsystem must emit accurate timing information whenever possible.

Performance measurement must never interfere with the execution being recorded.


---

# Development Phases

## Phase 1: Foundation

Build:

* Go project setup
* CLI
* configuration
* logging
* basic command execution

Goal:

```
rhq version
```

works.

---

# Phase 2: Process Recording

Build:

* process launcher
* PTY handling
* stdout recording
* stderr recording
* timestamps

Goal:

Run:

```
rhq bash
```

and record the session.

---

# Phase 3: Event System

Build:

* event models
* event bus
* event storage

Goal:

Every action produces events.

---

# Phase 4: Trace Storage

Build:

* create trace
* save events
* load trace

Goal:

Generate:

```
session.rhq
```

---

# Phase 5: Filesystem Tracking

Build:

* file watcher
* file changes
* patches

Goal:

Know exactly what changed during an agent run.

---

# Phase 6: Replay Engine

Build:

* trace loading
* timeline reconstruction
* replay commands

Goal:

Replay a previous session.

---

# Phase 7: HTTP API

Build:

REST API:

```
GET /runs

GET /runs/:id

GET /events/:id
```

WebSocket:

```
/stream
```

This will later power Electron.

---

# Testing Requirements

Every package must have tests.

Minimum:

```
*_test.go
```

Focus on:

* storage correctness
* event ordering
* replay accuracy
* process handling

---

# Documentation Requirements

Every major component requires documentation.

Each package must have:

README explaining:

* purpose
* responsibilities
* examples

Avoid undocumented magic.

---

# Code Review Checklist

Before considering code complete:

## Architecture

* Does this belong in this package?
* Is responsibility clear?

## Naming

* Are names obvious?
* Can another developer understand this?

## Complexity

* Is this the simplest solution?
* Did we create unnecessary abstractions?

## Testing

* Does it have tests?
* Are edge cases handled?

## Maintainability

* Would a junior developer understand this?

---

# Desktop Application Rule

DO NOT start Electron development until:

* CLI works
* recording works
* traces can be saved
* traces can be loaded
* replay engine works
* API exists

The desktop application should consume the backend.

It should never contain business logic.

---

# Final Principle

Build ReplayHQ like a foundational developer tool.

Prioritize:

1. Correctness
2. Simplicity
3. Maintainability
4. Performance
5. Features

A small reliable system is better than a large complicated unfinished system.

Remember:

> The backend is ReplayHQ. Everything else is a client.
