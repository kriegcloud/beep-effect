# Desktop App

This app is the thin local-first shell for the repo expert-memory prototype.

## Current scope

- `React + Vite + TanStack Router`
- consume public workspace packages only
- reserve the application slot for the future Tauri shell

## Deliberate non-goals for this scaffold

- no full `src-tauri` runtime yet
- no shell-owned business logic
- no fake Next.js local server

The real runtime still belongs in the Bun + Effect sidecar described in:

- `specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md`
- `specs/pending/repo-expert-memory-local-first-v0/SIDECAR_PROTOCOL.md`
