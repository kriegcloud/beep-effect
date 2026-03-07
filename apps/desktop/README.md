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

- `specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md`
- `specs/pending/repo-expert-memory-local-first-v0/SIDECAR_PROTOCOL.md`

## Commands

- `bun run --cwd apps/desktop dev`
- `bun run --cwd apps/desktop dev:native`
- `bun run --cwd apps/desktop build`
- `bun run --cwd apps/desktop build:native`
