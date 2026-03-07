# Beep Desktop Tauri Wrapper

This directory now contains the real Tauri v2 native wrapper for the repo-memory desktop prototype.

## Lifecycle ownership

- Rust commands own sidecar launch, bootstrap parsing, health checks, and shutdown
- the React shell consumes only the typed native bridge
- repo-memory semantics still live in the Bun + Effect sidecar

## Launch modes

- `bun run --cwd apps/desktop dev:native`
  launches the Tauri shell and manages the sidecar with raw `bun run packages/runtime/server/src/main.ts`
- `bun run --cwd apps/desktop build:native`
  builds the frontend, compiles the standalone Bun sidecar into `src-tauri/binaries/`, and then bundles the native app

## Sidecar expectations

The managed sidecar must continue to:

- emit a machine-readable bootstrap line on stdout
- serve the public control plane at `"/api/v0"`
- serve the public run RPC surface at `"/api/v0/rpc"`
- persist its SQLite runtime data under the Tauri app data directory
