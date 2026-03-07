# Evaluation And Acceptance

## Thesis
This prototype should be judged by whether it proves the `expert-memory runtime shape`, not by whether it looks feature-complete.

That means acceptance needs to cover:
- grounded repo answers
- durable run lifecycle
- restart/reconnect behavior
- inspectable retrieval packets and citations
- clean local-first operational behavior

## Canonical Question Set
The prototype needs a fixed question set against `beep-effect3` so regressions are visible.

At minimum, include questions like:
- describe symbol `StartQueryRepoRun`
- locate symbol `TypeScriptIndexService`
- what does `packages/runtime/server/src/index.ts` export?
- how many indexed TypeScript files are in the latest snapshot?
- how many indexed symbols are in the latest snapshot?
- what does `packages/runtime/server/src/index.ts` import?
- what imports `./internal/GroundedRetrieval.js`?
- search `cluster workflow`

## Current Proven Coverage
- Spawned Bun sidecar tests already prove bootstrap stdout discovery, control-plane health, same-port restart, and durable replay against the real sidecar entrypoint.
- Grounded retrieval tests already prove source-backed answers, citation alignment, and retrieval-packet persistence for the current deterministic query classes.
- The native Tauri wrapper already owns managed startup/shutdown and folder picking while the React shell stays thin over the public protocol.

## Acceptance Checks
### 1. Repo registration
- register `beep-effect3`
- repo is durable across sidecar restart
- repo list remains consistent after restart

### 2. Index workflow lifecycle
- start an index workflow and receive a deterministic `runId`
- observe accepted, running, and terminal state
- verify the final run detail is durable after restart
- verify interruption/resume behavior without corrupting run state; this remains an open `v0` closure item rather than a behavior already proved today

### 3. Query workflow lifecycle
- start a query workflow and receive a deterministic `runId`
- stream progress through `StreamRunEvents`
- verify disconnect does not kill the underlying run
- reconnect from cursor and receive missing events cleanly
- verify final run detail remains inspectable after completion

### 4. Grounded answer quality
- final answer must correspond to the repo question
- citations must point to real file spans or symbol-backed spans
- retrieval packet must be visible and bounded
- unsupported confidence should not be presented as certainty
- supported query classes must be source-grounded
- unsupported query classes must fail safe instead of inventing answers

### 5. Projection integrity
- `GET /runs` and `GET /runs/:runId` must reflect durable run state
- final retrieval packet and final answer must match the run event history
- replay after restart must rebuild the same projection state

### 6. Local operational behavior
- sidecar launches cleanly from the shell
- managed native startup waits for a healthy bootstrap instead of assuming readiness
- sidecar shuts down cleanly on signal
- no leaked long-lived resources after shutdown
- SQLite-backed runtime comes back without corrupting run history
- same-port restart validation is exercised through a spawned Bun subprocess against the real sidecar entrypoint
- native diagnostics surface startup failures instead of hanging silently
- supporting tests may use Node-backed harnesses, but those tests do not stand in for Bun lifecycle behavior

## Remaining P0 Closure Items
- Implement and prove real interrupt/resume behavior through the public runtime path.
- Extract `RunProjector` and `RunStateMachine` as explicit runtime seams without changing the public protocol boundary.
- Expand the canonical question set only when new query classes stay deterministic and source-grounded.

### 7. Type and spec discipline
- touched packages must pass typecheck
- supporting test suites should use `@effect/vitest` by default
- test fixtures and request/response bodies should use schema JSON codecs instead of native JSON helpers
- the spec set must not still recommend the superseded `HTTP + SSE` run model
- the spec set must not still recommend a custom local workflow engine

## Prototype-Grade, Not SLA-Grade
This is still a research prototype.

It does not need:
- hosted-service SLAs
- horizontal scale
- polished team collaboration flows
- production observability depth

It does need:
- correctness in the lifecycle model
- clarity in the transport model
- inspectability in the answer model

## Questions Worth Keeping Open
- What is the smallest restart/resume test that proves the cluster/workflow substrate is really earning its place?
- At what point should evaluation add latency targets instead of only correctness and inspectability?
- When should evaluation add dependency-aware retrieval instead of declaration/export-only grounding?
