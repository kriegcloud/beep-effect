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

## Scope In
Lock these in for `v0`:
- single-user local desktop prototype
- TypeScript-first repo ingestion
- deterministic-first extraction
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
The user picks a local repo path from the desktop UI.
The shell forwards that request to the sidecar control plane.
The sidecar returns a stable `RepoRegistration`.

### 2. Start index run
The UI triggers `IndexRepoRunDiscard` or `IndexRepoRun` through the execution plane.
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
The UI triggers `QueryRepoRunDiscard` or `QueryRepoRun` and subscribes to `StreamRunEvents`.

### 5. Inspect grounded result
The final query view must show:
- final answer
- citations
- retrieval packet
- run metadata
- enough history to understand what happened

## Minimal Data Shown In The UI
The first UI does not need to be broad, but it does need to be inspectable.

Minimum surfaces:
- repo picker / registration view
- run list
- run detail view
- question input
- answer panel
- citations panel
- retrieval packet panel
- runtime health / disconnected state indicator

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
- When should the first slice move from metadata-backed answers to real source-backed retrieval packets?
