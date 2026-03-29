# Implementation Breakdown

## Thesis
Implementation should now proceed from the cluster-first decision, not from the superseded `HttpApi` rewrite branch.

The point of this breakdown is to sequence the work so lifecycle, transport, and persistence land coherently.

## Current Status By Workstream
- Contracts: landed in `packages/repo-memory/model`, `packages/repo-memory/store`, and `packages/runtime/protocol`.
- Local SQL substrate: landed on `@effect/sql-sqlite-bun` in `packages/repo-memory/sqlite`.
- Durable runtime substrate: landed in `packages/runtime/server` with one Bun server hosting `"/__cluster"`, `"/api/v0"`, and `"/api/v0/rpc"`.
- Workflow-backed repo runs: landed with deterministic execution ids, custom public run-start and run-command RPCs, and internal workflow-proxy handler registration.
- Product-level run journal and projections: landed for acceptance, progress, retrieval packet, answer, completion, failure, interruption, resume, and replay; lifecycle events are now durable deltas, and a shared pure `RunProjector` is now part of the contract used by both runtime and desktop.
- Desktop shell integration: landed with a real Tauri wrapper, Rust-managed sidecar lifecycle, native repo-folder picking, same-origin `portless` desktop dev over HTTPS, and a debug-only manual URL override.
- Compatibility cleanup: landed; the old HTTP run-mutation and SSE routes are no longer the active integration target.
- Grounded retrieval: landed with bounded deterministic query interpretation, durable citations/retrieval packets, and repo-local resolved file dependency/dependent retrieval over persisted import-edge targets.
- Query stage trace projection: landed as a light fixed `QueryRun.queryStages` surface derived from existing `RunProgressUpdated`, `RetrievalPacketMaterialized`, and `AnswerDrafted` events without adding new durable event kinds.
- Retrieval-side NLP enrichment: not yet landed; it is the next bounded phase over the existing query-to-retrieval path and must preserve deterministic fallback plus citation-first grounding.
- Test split and lifecycle proof: landed with `@effect/vitest` supporting tests and spawned Bun subprocess lifecycle tests.
- Remaining `v0` closure: keep the explicit `grounding -> retrieval -> packet -> answer` split and fixed light query-stage trace stable, then finish the broader projection bootstrap/cursor pipeline and decider-style runtime split without regressing the already-landed lifecycle behavior.

## Workstream 1: Contracts
Lock the public contracts first.

### `packages/repo-memory/model`
Define and keep stable:
- `RepoId`
- `RunId`
- `RunEventSequence`
- `RunCursor`
- `Citation`
- `RetrievalPacket`
- `RetrievalOutcome`
- `RetrievalPayload`
- `RetrievalIssue`
- `RetrievalRequestedTarget`
- `RetrievalSubject`
- `RetrievalCandidate`
- `RetrievalItem`
- `RetrievalFacet`
- workflow payloads for `IndexRepoRun` and `QueryRepoRun`

### `packages/repo-memory/store`
Define and keep stable:
- repo registry store contract
- snapshot/artifact store contract
- symbol/import-edge store contract
- run/retrieval-packet store contract

### `packages/runtime/protocol`
Define and keep stable:
- `ControlPlaneApi`
- `RepoRunRpcGroup`
- `StreamRunEventsRequest`
- `RunStreamEvent`
- public `HttpApi` error payloads
- public `Rpc` error payloads

## Workstream 2: Local SQL substrate
Adopt:
- `@effect/sql-sqlite-bun`
- `packages/repo-memory/sqlite`
- one local SQLite database under app data

Use the generic `SqlClient` abstraction so the provider choice remains swappable.

## Workstream 3: Durable runtime substrate
Assemble the sidecar runtime from:
- `SqlMessageStorage`
- `SqlRunnerStorage`
- `Sharding`
- `Runners.layerRpc`
- `RunnerHealth.layerPing`
- `ClusterWorkflowEngine.layer`

Keep the runtime server as the explicit composition root. Do not collapse this into `BunClusterHttp.layer(...)`.

## Workstream 4: Workflow-backed repo runs
Implement in `packages/repo-memory/runtime`:
- `IndexRepoRun`
- `QueryRepoRun`

Use:
- `Workflow.make(...)`
- `WorkflowProxy.toRpcGroup(...)`
- `WorkflowProxyServer.layerRpcHandlers(...)`

Rules:
- `runId === executionId`
- execution IDs are deterministic from normalized payload + version stamp
- custom public start RPCs compute `workflow.executionId(payload)` and return `runId`
- explicit public run-command RPCs acknowledge interrupt/resume against an existing `runId`
- generated workflow discard RPCs do not return `runId` and do not replace the public run-control surface
- workflow proxy generation can still support internal resume/poll plumbing

## Workstream 5: Product-level run journal and projections
Add:
- `EventJournal`
- `RunProjectionStore`

Journal product events such as:
- `RunAccepted`
- `RunStarted`
- `RunProgressUpdated`
- `RetrievalPacketMaterialized`
- `AnswerDrafted`
- `RunCompleted`
- `RunFailed`
- `RunInterrupted`
- `RunResumed`

Use journal events to build run summaries and final answer detail views.

Current reality:
- lifecycle events are delta-shaped, not embedded full-run snapshots
- the shared `RunProjector` in `packages/repo-memory/model` is already the canonical projection function for runtime and desktop consumers
- `RetrievalPacketMaterialized` now conceptually freezes the packet before `AnswerDrafted`
- `QueryRun.queryStages` can now be projected as a fixed light stage trace from existing progress/packet/answer events
- the remaining architecture gap is not projector existence but durable projection bootstrap/cursor ownership and the broader decider split around `RepoRunService`

## Workstream 6: Shared router assembly
Host one shared router with:
- `"/__cluster"`
- `"/api/v0"`
- `"/api/v0/rpc"`

Use:
- `HttpRunner.layerHttpOptions({ path: "/__cluster" })`
- `HttpRunner.layerClientProtocolHttp({ path: "__cluster" })`
- `HttpApiBuilder.layer(...)`
- `RpcServer.layerHttp(...)`

## Workstream 7: Desktop shell integration
Keep the desktop app thin.

The shell should own:
- sidecar launch
- bootstrap discovery
- disconnected/restart UI state
- native OS integration

The shell should not own:
- repo-memory semantics
- workflow lifecycle
- retrieval logic

## Workstream 8: Compatibility cleanup
Delete the superseded public transport surface once the new runtime path lands:
- `POST /api/v0/repos/:repoId/index-runs`
- `POST /api/v0/query-runs`
- `GET /api/v0/runs/:runId/events`

Also remove doc language that still treats those as the target design.

## Workstream 9: Grounded retrieval
The current next slice is no longer hypothetical. It is:
- deterministic TypeScript extraction at index time
- persisted source snapshots, source files, symbol records, and import edges in SQLite
- bounded deterministic grounding
- source-grounded retrieval packets and citations for supported query classes
- packet-only answer rendering from a frozen evidence product

Current supported query classes:
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
- `listFileDependencies`
- `listFileDependents`
- `keywordSearch`

Current non-goals:
- freeform semantic repo QA
- model-generated answers without deterministic grounding
- long-lived `ts-morph` projects outside workflow-scoped indexing

This workstream establishes the accepted typed boundary for repo questions.
Any later NLP work must sit on top of this path as bounded enrichment rather than replacing the source-grounded contract.

The normative query-stage contract is now:
- `grounding`
- `retrieval`
- `packet`
- `answer`

The packet contract is now:
- bounded durable evidence product
- packet-level citations
- structured `payload` for resolved outcomes
- structured `issue` for unresolved outcomes
- answer derivable from packet only

## Workstream 10: Retrieval-side NLP enrichment
The next `v0` phase should improve query ergonomics and recall without changing the truth boundary.

This work belongs between raw user question text and the existing `QueryInterpretation` plus `RetrievalPacket` path.

Use `packages/common/nlp` for shared helpers such as:
- query cleanup and normalization
- identifier-aware tokenization and splitting
- file, module, and symbol phrase normalization
- optional versioned heuristic or provider adapters when the runtime truly needs them

Use `packages/repo-memory/runtime` to compose those helpers into:
- bounded intent hints for the existing deterministic query kinds
- bounded ranking and query expansion over already-indexed source-backed artifacts
- grounded summarization only after citations and retrieval packet contents are fixed

Rules:
- `QueryInterpretation` remains the accepted typed boundary for supported repo queries.
- `RetrievalPacket` remains the bounded evidence-bearing output.
- deterministic fallback behavior must remain available for critical retrieval flows.
- materially important normalization or ranking decisions should stay inspectable through retrieval-packet notes, structured logs, spans, and metrics.
- NLP enrichment must not bypass packet freezing or cause the answer stage to add unstated support.

Non-goals:
- freeform semantic repo chat
- opaque ranking disconnected from files, symbols, import edges, or citations
- direct writes of NLP-derived output into canonical repo-memory state
- durable mention, entity, relation, or claim candidate records in repo `v0`
- mandatory embeddings or model dependency for repo `v0`

## Workstream 11: Test split and lifecycle proof
Testing is now intentionally split by runtime concern.

Supporting tests:
- default to `@effect/vitest`
- use Node-backed supporting layers where possible
- use `sqlite-node` for local SQL integration in supporting tests
- keep `FileSystem`, `Path`, and `SqlClient` requirements inside layers and shared harnesses rather than leaking them through helper method signatures
- use schema JSON codecs in tests and fixtures; do not reintroduce native `JSON.parse` / `JSON.stringify`
- prove that packet payload, citations, and final answer stay aligned
- prove that replay rebuilds the same packet and the same final answer
- prove that query-run progress phases use `grounding`, `retrieval`, `packet`, and `answer`
- when workstream 10 lands, prove that paraphrase, identifier-split, and relaxed file/module phrasings either collapse to the same grounded result or fail safe as unsupported
- when workstream 10 lands, prove that disabling enrichment preserves the current deterministic interpreter behavior

Authoritative lifecycle test:
- spawn the real Bun sidecar through `packages/runtime/server/src/main.ts`
- keep `sqlite-bun`
- prove same-port shutdown/restart, replay, and public-path interruption/resume against the real runtime

## Immediate Guardrail
The paused reduced `HttpApi` rewrite is not a prerequisite step.
It remains superseded.

Use [HTTPAPI_RPC_PIVOT.md](./HTTPAPI_RPC_PIVOT.md) as evidence and guardrail only.

## Questions Worth Keeping Open
- Which temporary compatibility code should stay just long enough to land cluster/workflow without breaking the dev loop?
- When should `workers` enter the design for CPU-bound parsing, if at all?
- When, if ever, should optional embeddings become a real dependency rather than a bounded retrieval-side helper?
