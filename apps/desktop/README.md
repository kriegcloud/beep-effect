# Desktop App

This app is the local-first native shell for the repo expert-memory prototype.

## Current scope

- `React + Vite + TanStack Router`
- a real `Tauri v2` native wrapper in `src-tauri`
- Rust-owned sidecar lifecycle with a thin desktop UI over the public protocol boundary

## Design boundaries

- no shell-owned business logic
- no fake Next.js local server
- no in-process imports from sidecar runtime internals

The runtime still belongs in the Bun + Effect sidecar described in:

- `initiatives/expert-memory-big-picture/local-first-v0-architecture.md`
- `initiatives/repo-expert-memory-local-first-v0/sidecar-protocol.md`

## Commands

- `bun run --cwd apps/desktop dev`
- `bun run --cwd apps/desktop dev:raw`
- `bun run --cwd apps/desktop dev:native`
- `bun run --cwd apps/desktop build`
- `bun run --cwd apps/desktop build:native`

## Dev URLs

- Install `portless` globally for desktop dev: `npm install -g portless`
- Run `portless trust` once so the local `portless` CA is trusted by browsers and the Tauri dev webview
- On Linux, if `portless trust` complains that `/usr/local/share/ca-certificates` is missing, create it as root and rerun the trust step
- `bun run --cwd apps/desktop dev` serves the UI at `https://desktop.localhost:1355` and auto-starts the repo-memory sidecar at `https://repo-memory-sidecar.localhost:1355`
- `bun run --cwd apps/desktop dev:native` uses the same `desktop.localhost` URL inside the Tauri dev webview
- `dev:raw` is only the direct Vite escape hatch; it does not manage the portless sidecar route
