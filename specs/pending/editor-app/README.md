# Editor App

## Thesis
This folder defines the first concrete `v0` for a local-first editor application that can eventually project one canonical document model into multiple external formats.

The locked defaults are now:
- product shape: `local-first native editor workspace`
- shell/runtime: `Tauri v2 + Bun + Effect`
- frontend: `React + Vite + TanStack Router`
- editor engine: `Lexical`
- canonical model: `app-owned block-tree AST`
- workspace posture: `app-owned workspace on local disk`
- persistence posture: `JSON page files + derived local database`
- identity model: `stable page id + user-facing path slug`
- markdown role: `import/export only`
- v1 exports: `JSON + Markdown`
- v1 imports: `Markdown pages/folders`
- discovery: `full-text search + backlinks`
- history: `local revision log`
- module posture: `internal modularity only`
- sync posture: `single-user now, multi-device later`

## Why This Exists
`apps/desktop` is already proving the repo-memory direction. This new app exists so we can build an Obsidian/Notion-like local editor without muddying the repo-memory proving ground.

The editor app has a different product thesis:
- page-first authoring instead of repo analysis
- durable local knowledge work instead of repo-specific retrieval
- a canonical structured document model that can project into many formats
- a separate runtime surface so editor iteration does not distort repo-memory architecture

## Core Decision
The canonical source of truth is not raw Markdown and not raw Lexical JSON.

The canonical source of truth is an app-owned block-tree AST persisted by the app. Lexical is the live editing engine. Markdown is an interoperability format. JSON is the canonical portable structural format.

That decision exists to preserve:
- structural fidelity for rich editing
- deterministic exports
- room for future DOCX/PDF/other renderers
- stable internal semantics even if the editing engine changes

## Current Architectural Authority
Use these files as the current-state authority for the editor app:
1. [DECISIONS.md](./DECISIONS.md)
2. [IMPLEMENTATION_BREAKDOWN.md](./IMPLEMENTATION_BREAKDOWN.md)
3. [ACCEPTANCE.md](./ACCEPTANCE.md)

The research reports in [`research/`](./research) are upstream evidence, not the implementation contract.

## V0 Deliverable
The first deliverable is a parallel desktop app at `apps/editor-app` with its own editor runtime stack:
- `packages/editor`
- `packages/editor-lexical`
- `packages/editor-protocol`
- `packages/editor-client`
- `packages/editor-runtime`

The runtime should own document/workspace semantics. The shell should stay thin and own only:
- native process lifecycle
- native dialogs
- native packaging
- native bootstrap/reconnect state

## V0 Scope
- single-user local workspace
- page tree with stable ids and slugs
- block-tree document model
- Lexical-driven page editing
- app-owned page persistence on local disk
- local revision log
- JSON and Markdown export
- Markdown import
- search-ready and backlink-ready architecture
- separate desktop shell and sidecar from repo-memory

## Out Of Scope For V0
- collaboration
- cloud sync
- public plugin SDK
- arbitrary external-folder mode as the primary storage model
- full Notion database primitives
- canvas/whiteboard surface
- DOCX/PDF export implementation
- mobile or web deployment

## Success Condition
This spec succeeds if another engineer can bootstrap the new editor app without reopening the major product-shape decisions:
- what the canonical document format is
- whether Markdown is the source of truth
- where persistence lives
- what runtime owns editor semantics
- how the desktop shell talks to the sidecar
- what v1 must include versus defer
