# Acceptance

## Thesis
This bootstrap should be judged by whether it proves the editor app architecture, not by whether it already matches Obsidian or Notion feature-for-feature.

## Required Acceptance Checks

### 1. App boundary
- `apps/editor-app` exists as a separate app from `apps/desktop`
- the editor app has its own sidecar/client/protocol stack
- repo-memory packages are not being repurposed as the editor runtime

### 2. Canonical model
- page documents are persisted as app-owned JSON
- the page model is a block tree
- each page has a stable id and a user-facing slug/path
- Lexical is not the persisted source of truth
- Markdown is not the persisted source of truth

### 3. Sidecar lifecycle
- the shell can start the managed sidecar
- the shell can read sidecar health/bootstrap
- startup waits for a healthy sidecar instead of assuming readiness
- failures surface in the shell instead of hanging silently

### 4. Local workspace behavior
- the runtime initializes a workspace in local app data
- at least one starter page exists for first-run bootstrap
- the page list is durable across restart
- editing and saving a page persists across restart

### 5. Editor boundary
- the editor UI renders through Lexical
- the app converts between Lexical state and the canonical AST
- page edits flow through the sidecar contract instead of browser-only local state

### 6. Interoperability direction
- the runtime can expose or reserve export boundaries for canonical JSON and Markdown
- the spec and code clearly preserve room for later DOCX/PDF exporters

### 7. Search-and-knowledge direction
- the architecture leaves a clear place for backlinks and search
- the v0 surface includes page-link/backlink direction even if full indexing is deferred

### 8. Repo discipline
- the new app is represented in the monorepo config
- `bun config-sync` runs after the app is added
- touched packages/apps pass targeted typecheck

## Prototype-Grade, Not Product-Complete
V0 does not need:
- public plugins
- collaboration
- sync
- database blocks
- polished export coverage

V0 does need:
- a correct document ownership model
- a correct shell/runtime split
- durable local persistence
- a real editor boundary
