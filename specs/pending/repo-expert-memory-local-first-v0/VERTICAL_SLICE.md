# Vertical Slice

## Thesis
The first runnable slice should prove the `local-first expert-memory` loop end to end, using the real runtime shape wherever it matters.

That means the slice is not just `index a repo and answer a question`. It is:
- launch the local sidecar
- register a repo
- run a durable index workflow
- run a durable query workflow
- inspect grounded output, citations, and retrieval packet
- survive disconnect/reconnect without losing the run story

## First Runnable Slice
The first runnable slice is:
1. select a local repo
2. register it with the sidecar
3. index TypeScript sources deterministically
4. persist repo-memory artifacts locally
5. ask a repo question in the desktop UI
6. receive a grounded answer with citations and retrieval packet
7. inspect the completed run detail after the fact

## Current Implementation Snapshot
- The native desktop shell already auto-launches the managed sidecar, registers repos through the control plane, starts runs through custom public RPCs, and renders run lists, run detail, citations, retrieval packets, and event history.
- Desktop dev now runs through `portless` with a same-origin `https://desktop.localhost:1355` shell URL and `"/api"` proxying to the managed sidecar.
- The sidecar already persists repo-memory artifacts and run projections in SQLite, and it already replays journaled run events after reconnect or restart.
- Spawned Bun lifecycle tests already prove bootstrap discovery, same-port restart, replay, and local-origin CORS/security headers against the real sidecar entrypoint.

## Scope In
Lock these in for `v0`:
- single-user local desktop prototype
- TypeScript-first repo ingestion
- deterministic-first extraction
- `ts-morph` used only at index time, scoped per workspace / `tsconfig`
- workflow-backed run lifecycle
- cluster-backed durable execution substrate
- visible citations and evidence panel
- retrieval packet visibility
- enough provenance and temporal identity to explain when a run happened and what it used
- reconnectable streamed run events through `Rpc`

## Scope Out
Lock these out for `v0`:
- auth / IAM
- multi-user collaboration
- sync
- `pages` / workspaces as first-class business contexts
- email / calendar / settings product surfaces
- broad agent connector ecosystems
- semantic-web maximalism
- cloud deployment hardening

## User Flow
### 1. Register repo
The native desktop app auto-starts the managed local sidecar and waits for a healthy bootstrap.
In desktop dev, the React shell talks to the sidecar through same-origin `"/api"` while the sidecar still reports its direct bind address in bootstrap payloads.
The user picks a local repo path from the desktop UI through the native folder picker.
The shell forwards that request to the sidecar control plane.
The sidecar returns a stable `RepoRegistration`.

Browser/manual mode remains useful for debugging, but it is not the primary `v0` product shape.

### 2. Start index run
The UI triggers `StartIndexRepoRun` through the execution plane.
The sidecar returns a deterministic `runId`.
The UI opens a `StreamRunEvents` subscription.

### 3. Watch run progress
The UI renders:
- accepted/running/completed state
- progress messages
- final index summary

Progress is streamed through `Rpc`, not modeled as the long-term SSE contract.

### 4. Ask a query
The user asks a question about the repo.
The UI triggers `StartQueryRepoRun` and subscribes to `StreamRunEvents`.

### 5. Inspect grounded result
The final query view must show:
- final answer
- citations
- retrieval packet
- run metadata
- enough history to understand what happened

Supported query classes in the current grounded slice:
- `countFiles`
- `countSymbols`
- `locateSymbol`
- `describeSymbol`
- `symbolParams`
- `symbolReturns`
- `symbolThrows`
- `symbolDeprecation`
- `listFileExports`
- `listFileImports`
- `listFileImporters`
- `keywordSearch`

Out of scope for this slice:
- freeform semantic repo QA
- model-synthesized answers without deterministic source backing

Testing posture for this slice:
- `@effect/vitest` is the default supporting harness
- Node-backed supporting tests are intentional for service and SQL integration logic
- spawned Bun subprocess tests are the lifecycle source of truth
- lifecycle tests should continue to prove machine-readable bootstrap, same-port restart, and replay of only missing events against the real sidecar entrypoint

## Remaining Slice Gaps
- End-to-end interrupt/resume behavior is not yet implemented even though the event model and projection schema reserve it.
- `RunProjector` and `RunStateMachine` still need to become real runtime seams instead of staying embedded in `RepoRunService`.

## Minimal Data Shown In The UI
The first UI does not need to be broad, but it does need to be inspectable.

Minimum surfaces:
- managed sidecar status card
- repo picker / registration view
- run list
- run detail view
- question input
- answer panel
- citations panel
- retrieval packet panel
- runtime health / disconnected state indicator
- startup failure diagnostics including recent stderr
- manual URL override only as a debug panel

## Why This Slice Matters
This slice proves the larger thesis on a bounded problem:
- deterministic substrate
- durable lifecycle
- product-level run audit
- grounded output
- local-first trust posture

If this slice fails, broader domain transfer to law, wealth, or compliance should not be trusted yet.

## Questions Worth Keeping Open
- How much answer assembly can stay deterministic in the first slice before a model is actually useful?
- When should the bounded grounded query set expand beyond declaration/export lookup into dependency-aware retrieval?
