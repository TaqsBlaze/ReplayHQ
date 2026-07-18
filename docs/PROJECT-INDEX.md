# ReplayQH — Project Index

This file documents the project's directory layout and the intended purpose for each file/directory. No source code is present in this scaffold — only directories and placeholders.

## Top-level

- `CLAUDE.md`: Project guidance and architecture notes (source of this scaffold).
- `README.md`: High-level project description and quick start (placeholder).
- `go.mod`: (expected) Go module file; add when initializing Go modules.

## cmd/

- `cmd/rhq/`:
  - Intended: `cmd/rhq/main.go` — CLI entrypoint. Implement with Cobra for `rhq` subcommands.
  - Current: directory present with placeholder `.gitkeep`.

## internal/

Use `internal/` for application code that is not exposed as a public package.

- `internal/config/` — configuration loading and validation (e.g., env, files).
- `internal/events/` — event models and event factory types.
- `internal/recorder/` — process/PTY recorder orchestration code.
- `internal/launcher/` — process launching and session startup logic.
- `internal/process/` — process lifecycle helpers and wrappers.
- `internal/pty/` — pseudoterminal handling and I/O capture.
- `internal/filesystem/` — file-watching and patch generation utilities.
- `internal/storage/` — append-only trace storage implementation.
- `internal/replay/` — replay engine and timeline reconstruction.
- `internal/timeline/` — timeline helpers and timeline rendering logic.
- `internal/plugins/` — internal plugin implementations (git, shell, filesystem).
- `internal/server/` — HTTP and WebSocket API server components.
- `internal/logger/` — structured logging setup and helpers.

Each `internal/*` directory currently contains a `.gitkeep` placeholder.

## pkg/

- Public helper libraries intended for reuse outside of `internal/`.
- Contains a `.gitkeep` placeholder.

## docs/

- `docs/PROJECT-INDEX.md` (this file): Documents locations and intended use for files and directories.
- Add design docs, API contracts, and package READMEs here.

## examples/

- Example usage and small runnable examples demonstrating CLI and replay features.
- Currently contains `.gitkeep`.

## tests/

- Top-level integration and end-to-end tests. Unit tests should live next to packages in `_test.go` files.
- Contains `.gitkeep`.

## Notes & Next Steps

- The project is intentionally scaffolded without source files. When ready, initialize a Go module with `go mod init` and add `cmd/rhq/main.go` plus packages under `internal/`.
- Follow the architecture guidance in `CLAUDE.md` when implementing packages.

