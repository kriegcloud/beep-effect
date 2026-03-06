# Implementation Breakdown

## Thesis
Implementation should now proceed from the cluster-first decision, not from the superseded `HttpApi` rewrite branch.

The point of this breakdown is to sequence the work so lifecycle, transport, and persistence land coherently.

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
- workflow-derived RPC surface
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
- generated workflow discard RPCs do not return `runId`
- resume RPCs can still come from workflow proxy generation

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
- bounded deterministic query interpretation
- source-grounded retrieval packets and citations for supported query classes

Current supported query classes:
- `countFiles`
- `countSymbols`
- `locateSymbol`
- `describeSymbol`
- `listFileExports`
- `listFileImports`
- `listFileImporters`
- `keywordSearch`

Current non-goals:
- freeform semantic repo QA
- model-generated answers without deterministic grounding
- long-lived `ts-morph` projects outside workflow-scoped indexing

## Workstream 10: Test split and lifecycle proof
Testing is now intentionally split by runtime concern.

Supporting tests:
- default to `@effect/vitest`
- use Node-backed supporting layers where possible
- use `sqlite-node` for local SQL integration in supporting tests
- keep `FileSystem`, `Path`, and `SqlClient` requirements inside layers and shared harnesses rather than leaking them through helper method signatures
- use schema JSON codecs in tests and fixtures; do not reintroduce native `JSON.parse` / `JSON.stringify`

Authoritative lifecycle test:
- spawn the real Bun sidecar through `packages/runtime/server/src/main.ts`
- keep `sqlite-bun`
- prove same-port shutdown/restart and replay against the real runtime

## Immediate Guardrail
The paused reduced `HttpApi` rewrite is not a prerequisite step.
It remains superseded.

Use [HTTPAPI_RPC_PIVOT.md](./HTTPAPI_RPC_PIVOT.md) as evidence and guardrail only.

## Questions Worth Keeping Open
- Which temporary compatibility code should stay just long enough to land cluster/workflow without breaking the dev loop?
- When should `workers` enter the design for CPU-bound parsing, if at all?
