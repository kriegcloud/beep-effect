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
- what does `packages/repo-memory/runtime/src/internal/RepoMemoryRuntime.ts` depend on?
- what depends on `packages/repo-memory/runtime/src/retrieval/GroundedRetrieval.ts`?
- what does `RunProjector.ts` depend on?
- search `cluster workflow`

## Current Proven Coverage
- Spawned Bun sidecar tests already prove bootstrap stdout discovery, control-plane health, same-port restart, and durable replay against the real sidecar entrypoint.
- Spawned Bun sidecar tests already prove local-origin CORS preflight and security headers against the real sidecar entrypoint.
- Spawned Bun sidecar tests already prove public-path interrupt/resume for durable index runs, including resume after sidecar restart.
- Grounded retrieval tests already prove source-backed answers, citation alignment, and retrieval-packet persistence for the current deterministic query classes.
- The current query interpreter already proves the stable typed boundary that retrieval-side NLP must preserve rather than replace.
- Query-run projection tests now prove that accepted query runs start with fixed pending `grounding`, `retrieval`, `packet`, and `answer` stages and that existing progress/packet/answer events rebuild the same final stage trace through replay.
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
- verify interruption/resume behavior without corrupting run state; this is already proved for durable index runs and should remain covered as the runtime changes

### 3. Query workflow lifecycle
- start a query workflow and receive a deterministic `runId`
- stream progress through `StreamRunEvents`
- verify query progress uses `grounding`, `retrieval`, `packet`, and `answer`
- verify `GET /runs/:runId` exposes the projected fixed query stage trace with stage status, timestamps, percent, and latest message
- verify disconnect does not kill the underlying run
- reconnect from cursor and receive missing events cleanly
- verify final run detail remains inspectable after completion
- verify replayed delta events project back into the same final run state visible through `GET /runs/:runId`

### 4. Grounded answer quality
- final answer must correspond to the repo question
- citations must point to real file spans or symbol-backed spans
- retrieval packet must be visible and bounded
- retrieval packet must expose normalized query, query kind, outcome, and structured payload or structured issue
- unsupported confidence should not be presented as certainty
- supported query classes must be source-grounded
- unsupported query classes must fail safe instead of inventing answers
- paraphrase, identifier-split, and relaxed file/module phrasings for supported queries should either collapse to the same grounded result or fail safe as unsupported
- deterministic fallback behavior must remain available for the current exact-match query path
- if retrieval-side NLP materially changes result selection, the explanation must remain inspectable through retrieval-packet notes and observability
- the final answer must be derivable from packet payload plus packet citations alone

### 5. Projection integrity
- `GET /runs` and `GET /runs/:runId` must reflect durable run state
- final retrieval packet and final answer must match the run event history
- projected query stages must match the run event history and replay back into the same stage trace
- packet payload, packet citations, and final answer must agree exactly
- replay after restart must rebuild the same projection state
- stream consumers must be able to rebuild equivalent run state from journal replay plus live events without relying on embedded run snapshots

### 6. Local operational behavior
- sidecar launches cleanly from the shell
- managed native startup waits for a healthy bootstrap instead of assuming readiness
- desktop dev same-origin requests through `https://desktop.localhost:1355/api/...` reach the sidecar successfully
- sidecar shuts down cleanly on signal
- no leaked long-lived resources after shutdown
- SQLite-backed runtime comes back without corrupting run history
- same-port restart validation is exercised through a spawned Bun subprocess against the real sidecar entrypoint
- native diagnostics surface startup failures instead of hanging silently
- supporting tests may use Node-backed harnesses, but those tests do not stand in for Bun lifecycle behavior

## Remaining P0 Closure Items
- Keep retrieval-side NLP formalized as explicit query preparation only through the query-to-retrieval path; do not introduce durable NLP candidate state in repo `v0`, and do not let the answer stage add support beyond the frozen packet.
- Harden the query-preparation acceptance surface with table-driven symbol/file/module/keyword cases plus explicit unsupported fallbacks.
- Land any still-missing projection bootstrap/cursor/replay cleanup without changing the public protocol boundary.
- Expand the canonical question set only when new query classes stay deterministic and source-grounded.

### 7. Type and spec discipline
- touched packages must pass typecheck
- supporting test suites should use `@effect/vitest` by default
- test fixtures and request/response bodies should use schema JSON codecs instead of native JSON helpers
- the spec set must not still recommend the superseded `HTTP + SSE` run model
- the spec set must not still recommend a custom local workflow engine
- the spec set must keep NLP scoped to retrieval-side enrichment and must not imply freeform semantic repo chat or NLP-derived canonical state
- the spec set must keep the packet as the frozen evidence product and the answer stage as render-only

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
- How much broader interrupt/resume coverage is needed beyond the currently proved durable index-run path?
- At what point should evaluation add latency targets instead of only correctness and inspectability?
- When should evaluation promote projection-bootstrap and replay-equivalence checks from focused supporting tests into the default acceptance gate?
