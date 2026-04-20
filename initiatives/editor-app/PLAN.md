# Implementation Breakdown

## Thesis
Implementation should start with a clean bootstrap that proves the architecture, not with an attempt to finish the entire product at once.

The first implementation goal is:
- a real `apps/editor-app` Tauri shell
- a real editor sidecar runtime
- a real canonical document model
- a minimal but coherent local-first workspace flow

## Workstream 1: Specs And Decisions
Land and keep current:
- `README.md`
- `decisions.md`
- `PLAN.md`
- `history/acceptance.md`

These documents are the source of truth for the bootstrap.

## Workstream 2: Canonical editor domain
Use `packages/editor` as the engine-agnostic document domain.

It should define:
- page identifiers
- page slugs
- block ids
- block kinds
- page documents
- workspace manifests
- revision records
- page summaries

Rules:
- schemas first
- no raw Lexical JSON as persisted truth
- no Markdown as persisted truth

## Workstream 3: Lexical adapter
Use `packages/editor-lexical` for the editor-engine bridge.

It should own:
- editor presentation component(s)
- minimal Lexical node registration for v0
- AST -> Lexical initial-state projection
- Lexical serialized-state -> AST projection

Rules:
- Lexical is the live editing engine
- the adapter boundary is explicit
- the adapter may be lossy only where v0 block coverage is intentionally limited

## Workstream 4: Public sidecar protocol
Use `packages/editor-protocol` for the sidecar contract.

Start with a small control-plane surface:
- sidecar health/bootstrap
- workspace summary
- page list
- page detail
- page save/update

Add format and revision endpoints only when the runtime implementation exists.

## Workstream 5: Typed client
Use `packages/editor-client` for the browser/native shell client.

The client should:
- normalize the sidecar base URL
- expose typed calls over the control plane
- map transport failures into typed client errors

Keep this boundary similar in spirit to `packages/repo-memory/client`, but editor-specific.

## Workstream 6: Editor runtime
Use `packages/editor-runtime` as the Effect-first sidecar.

The runtime should own:
- runtime config loading from env
- bootstrap stdout emission
- local workspace initialization
- page file persistence
- health endpoint
- page/workspace handlers

V0 bootstrap storage shape:
- one app data root
- one workspace manifest
- one `pages/` directory with canonical JSON documents
- one revisions area reserved for local history
- room for a later derived SQLite database

## Workstream 7: Desktop shell
Use `apps/editor-app` as a thin Tauri shell patterned after `apps/desktop`.

The shell should own:
- Tauri bootstrap
- managed sidecar lifecycle
- native file/folder dialogs
- reconnect/startup state
- the editor workspace UI shell

The shell should not own:
- persistence semantics
- document model semantics
- import/export logic
- search/backlink logic

## Workstream 8: V0 UI slice
Bootstrap a deliberate but narrow UI:
- left sidebar for workspace/pages
- central editor panel
- small right/details panel for metadata and architectural direction
- sidecar connection status

The first UI is allowed to be incomplete as long as the app boundary is real.

## Workstream 9: Validation
After the app is added:
- run `bun config-sync`
- typecheck the touched packages/apps
- verify the desktop shell and sidecar compile coherently

## Suggested Sequencing
1. Lock specs.
2. Define canonical editor schemas in `packages/editor`.
3. Define protocol and client.
4. Implement minimal runtime with local page persistence.
5. Implement the Lexical adapter.
6. Replace the generic `apps/editor-app` scaffold with the real Tauri shell.
7. Run config sync and targeted validation.
