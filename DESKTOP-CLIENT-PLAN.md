# ReplayHQ Desktop Client Development Instructions

The ReplayHQ backend and CLI have reached a stable, functional state. It is now time to begin development of the desktop client.

The desktop application is **not the product**—it is a rich client for the ReplayHQ backend. Its responsibility is to visualize, inspect, replay, and manage recorded agent sessions. All business logic, recording, storage, replay, and analysis must remain in the Go backend.

## Primary Objective

Build a professional desktop application that feels comparable to modern developer tools such as:

* Visual Studio Code
* GitHub Desktop
* Postman
* Docker Desktop
* Linear

The application should prioritize:

* Clean information hierarchy
* Fast interactions
* Smooth animations
* Excellent developer experience
* Native desktop feel
* Maintainable architecture

Avoid unnecessary visual clutter. Every UI element should exist for a reason.

---

# Project Structure

Create a new application in the repository root.

```text
replayhq/

│
├── desktop/
│   ├── electron/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── electron-builder.yml
│
├── sdk/
├── docs/
└── ...
```

The desktop application should be completely self-contained inside the `desktop/` directory.

---

# Technology Stack

Use the following technologies:

Frontend

* React
* TypeScript
* Vite

Desktop

* Electron
* Electron Builder

UI

* Tailwind CSS4
* Framer Motion
* Lucide React

State Management

* Zustand

Data Fetching

* TanStack Query

Routing

* React Router

Communication

* HTTP API
* WebSocket

Do not introduce additional frameworks unless there is a compelling technical reason.

---

# Design Philosophy

ReplayHQ is a professional engineering tool.

The interface should communicate:

* confidence
* clarity
* speed
* precision

Avoid flashy consumer-style interfaces.

Use a dark theme by default with subtle accents and restrained motion.

The visual language should resemble modern IDEs rather than marketing websites.

---

# Application Layout

The overall layout should resemble Visual Studio Code.

```text
+------------------------------------------------------+
| Title Bar                                            |
+------------------------------------------------------+

| Sidebar | Main Workspace               | Inspector   |

|         |                              |             |
|         |                              |             |
|         |                              |             |

+------------------------------------------------------+

| Bottom Panel (CLI / Logs / Output / Terminal)        |

+------------------------------------------------------+
```

---

# Layout Breakdown

## Left Sidebar

Purpose:

Navigation and session management.

Examples:

* Runs
* Timeline
* Replay
* Events
* Files
* Metrics
* Plugins
* Settings

Should be collapsible.

---

## Main Workspace

The primary working area.

Different views should include:

* Session Overview
* Event Timeline
* Replay Visualization
* File Changes
* Tool Calls
* Agent Decisions
* Terminal Output
* Diff Viewer

This panel should occupy most of the available space.

---

## Right Inspector Panel

Context-sensitive information.

Depending on selection, display:

* Event metadata
* JSON payload
* Tool arguments
* File contents
* Timing information
* Performance metrics
* Stack traces

This panel should update dynamically.

---

## Bottom Panel

Acts similarly to VS Code's terminal panel.

Tabs may include:

* CLI
* Logs
* Backend Output
* Agent Console
* WebSocket Status

The panel should be resizable and collapsible.

---

# Initial Screens

Begin with the following screens only:

1. Dashboard
2. Runs
3. Replay Viewer
4. Settings

Do not implement every planned feature immediately.

Build the foundation first.

---

# Backend Communication

The desktop client should never implement backend logic.

It should communicate exclusively through:

* REST API
* WebSocket

All recording, replay, event processing, and storage remain in the backend.

Treat the backend as the single source of truth.

---

# Component Guidelines

Build reusable UI components.

Examples:

* Sidebar
* Toolbar
* Timeline
* Event List
* Inspector
* Split Pane
* Command Bar
* Status Bar
* Terminal Panel
* Search Box

Keep components focused and composable.

---

# Animations

Use Framer Motion sparingly.

Appropriate uses include:

* Sidebar collapse
* Panel resizing
* View transitions
* Timeline interactions
* Loading states

Animations should enhance usability, never distract.

---

# Styling

Use a design system rather than ad hoc styles.

Maintain consistent:

* spacing
* typography
* border radius
* icon sizing
* colors
* shadows

Prefer a minimal palette with a single accent color inspired by the ReplayHQ brand.

---

# Electron Architecture

Separate Electron concerns clearly.

```text
desktop/

    electron/

        main.ts

        preload.ts

    src/

        components/

        layouts/

        pages/

        hooks/

        services/

        stores/

        types/

        assets/
```

Use IPC only when native desktop capabilities are required. Backend communication should remain HTTP/WebSocket based.

---

# Development Order

Phase 1

* Electron setup
* React
* Vite
* Tailwindcss 4
* Routing
* Window management

Phase 2

* VS Code-style shell
* Sidebar
* Top bar
* Bottom terminal
* Layout system

Phase 3

* Backend connectivity
* Run list
* Live status
* API integration

Phase 4

* Replay timeline
* Event viewer
* Inspector
* Diff viewer

Phase 5

* Polishing
* Animations
* Keyboard shortcuts
* Settings
* Packaging

---

# Code Quality Expectations

The desktop application should be written with the same engineering discipline as the backend.

Before implementing a feature, ask:

* Does this belong in the client or the backend?
* Is this component reusable?
* Is this implementation simple?
* Would another developer understand this six months from now?

Favor clarity over cleverness.

---

# Final Principle

Build ReplayHQ Desktop as a first-class developer tool.

The desktop client should feel like a natural extension of the backend—fast, predictable, and focused on helping developers understand how AI coding agents think, act, and evolve over time.

The backend remains the product.

The desktop application is the window into it.
