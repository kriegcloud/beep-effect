# Cluster-First Repo Expert-Memory V0

## Summary
Replace the current ad hoc sidecar runtime with a `cluster-first`, `workflow-backed`, `local-first` architecture and record that decision in the initiative packet so there is no conflicting guidance left in the repo.

Large parts of this plan are now implemented. Use [README.md](../README.md), [SPEC.md](../SPEC.md), and [PLAN.md](../PLAN.md) for the current-state view, and use this file as the historical sequencing and remaining-work reference.
Later implementation also added explicit public `InterruptRepoRun` and `ResumeRepoRun` RPCs, so the transport bullets below should be read as the origin of the run-control split rather than the exhaustive final protocol list.

Lock these decisions:
- `effect/unstable/cluster` is the v0 runtime substrate.
- `ClusterWorkflowEngine` is the workflow engine.
- `SqlMessageStorage` + `SqlRunnerStorage` on `SQLite` are the durable runtime store.
- `HttpApi` is the control plane.
- `Rpc` is the execution and streaming plane.
- `EventJournal` is the product-level run audit log and projection input.
- The paused reduced `HttpApi` rewrite remains superseded.
- `history/httpapi-rpc-pivot.md` is kept as a supporting evidence note, not an implementation checklist.

## Implementation Changes

### 1. Sidecar runtime
Rebuild the sidecar in `packages/runtime/server` as explicit layers, not a single `SidecarRuntime` wrapper around handwritten routes.

Use this assembly:
- local SQL:
  - `@effect/sql-sqlite-bun`
  - one sidecar-local SQLite DB under app data
- cluster runtime:
  - `SqlMessageStorage`
  - `SqlRunnerStorage`
  - `Sharding`
  - `Runners.layerRpc`
  - `RunnerHealth.layerPing`
  - `ClusterWorkflowEngine.layer`
- app server:
  - one Bun HTTP server
  - one shared `HttpRouter`
  - cluster internal route at `"/__cluster"`
  - app `HttpApi` at `"/api/v0"`
  - app `Rpc` at `"/api/v0/rpc"`

Do not use `BunClusterHttp.layer(...)` as the top-level assembly primitive. Compose the lower-level cluster layers manually so the sidecar owns route layout and lifecycle.

Use:
- `HttpRunner.layerHttpOptions({ path: "/__cluster" })`
- `HttpRunner.layerClientProtocolHttp({ path: "__cluster" })`
- `RpcSerialization.layerNdjson`

### 2. Lifecycle and shutdown
Create a top-level `SidecarProcessRuntime` that owns:
- process scope
- SQL scope
- cluster scope
- `HttpApi` scope
- app-facing `Rpc` scope
- journal/projection scope
- signal handling

Shutdown order is fixed:
1. stop accepting new app requests
2. stop accepting new run submissions
3. close run event subscriptions
4. let cluster/workflow state persist
5. release runner ownership and cluster resources
6. close SQL and remaining infrastructure scopes

Do not rely on incidental nested finalizers as the only lifecycle model.

### 3. Workflow model
Implement repo runs in `packages/repo-memory/runtime` as real workflows:
- `IndexRepoRun`
- `QueryRepoRun`

Use:
- `Workflow.make(...)`
- `WorkflowProxy.toRpcGroup(...)`
- `WorkflowProxyServer.layerRpcHandlers(...)`

Rules:
- `runId === executionId`
- execution ids are deterministic from normalized payload + version stamp
- public start RPCs compute `workflow.executionId(payload)` and return `runId` explicitly
- generated workflow discard RPCs do not return `runId`
- workflow proxy generation can still support internal resume/poll plumbing, but product-visible run commands may be explicit RPCs
- no custom local `WorkflowEngine`
- no ad hoc run fibers as the authoritative lifecycle

### 4. Transport split
Refactor `packages/runtime/protocol` into two explicit surfaces.

`HttpApi` control plane:
- `GET /api/v0/health`
- `GET /api/v0/repos`
- `POST /api/v0/repos`
- `GET /api/v0/runs`
- `GET /api/v0/runs/:runId`

`Rpc` execution plane:
- custom public start RPCs for:
  - `StartIndexRepoRun`
  - `StartQueryRepoRun`
- custom public run-command RPCs for:
  - `InterruptRepoRun`
  - `ResumeRepoRun`
- one custom streamed RPC:
  - `StreamRunEvents`
- workflow-generated RPC handlers may still exist internally for poll or workflow-internal resume plumbing

`StreamRunEvents` rules:
- input: `runId` plus optional replay cursor
- replay missing journal events first
- then continue live
- client disconnect does not cancel the workflow
- stream ends only after a terminal journal event is emitted

Retire these current HTTP routes after migration:
- `POST /api/v0/repos/:repoId/index-runs`
- `POST /api/v0/query-runs`
- `GET /api/v0/runs/:runId/events`

Implementation reference for the control-plane `HttpApi` style:
- reuse the local repo pattern already present in:
  - `packages/ai/sdk/src/core/service/AgentHttpApi.ts`
  - `packages/ai/sdk/src/core/service/AgentHttpHandlers.ts`
  - `packages/ai/sdk/src/core/service/AgentHttpServer.ts`

### 5. Event journal and projections
Keep `EventJournal` as the product-level run log.

Journal these events:
- `RunAccepted`
- `RunStarted`
- `RunProgressUpdated`
- `RetrievalPacketMaterialized`
- `AnswerDrafted`
- `RunCompleted`
- `RunFailed`
- `RunInterrupted`
- `RunResumed`

Build `RunProjectionStore` from those events:
- run summary
- run status
- final retrieval packet
- final answer snapshot
- last event sequence

`GET /runs` and `GET /runs/:runId` read projections, not raw cluster runtime state.

Cluster mailbox persistence is infrastructure. `EventJournal` is the user-facing audit model.

### 6. Repo-memory storage
Implement `packages/repo-memory/sqlite` as the SQLite-backed local store layer over `packages/repo-memory/store` contracts for:
- repo registration
- source snapshot metadata
- index manifests
- extraction artifacts
- citation backing records
- retrieval packet records or references

Keep runtime infrastructure tables separate from semantic repo-memory tables, even inside one DB.

### 7. Reactivity and workers
Use `Reactivity` for invalidation keys:
- `repos`
- `repo:{repoId}`
- `repo-index:{repoId}`
- `runs`
- `run:{runId}`

`workers` are optional only for CPU-bound indexing/parsing after profiling. They are not the primary runtime substrate.

## Public Interfaces

### `packages/repo-memory/model`
Keep and extend:
- `RepoId`
- `RunId`
- `Citation`
- `RetrievalPacket`

Add:
- workflow payload schemas for `IndexRepoRun` and `QueryRepoRun`
- `RunSummary`
- `RunTerminalState`
- `RunCursor`
- `RunEventSequence`
- `RunStreamFailure`

### `packages/repo-memory/store`
Define the repo-memory storage service contracts:
- repo registry store
- snapshot/artifact store
- symbol/import-edge store
- run/retrieval-packet store

### `packages/repo-memory/sqlite`
Provide the local `SqlClient`-backed implementations for the repo-memory store contracts.

### `packages/repo-memory/runtime`
Implement repo workflows, projections, grounded retrieval, and repo-specific runtime semantics.

### `packages/runtime/protocol`
Split into:
- `ControlPlaneApi`
- `RepoRunRpcGroup`
- `StreamRunEventsRequest`
- `RunStreamEvent`
- `SidecarBootstrap`
- public `HttpApi` error schemas
- public `Rpc` error schemas

Lock:
- `runId` is the only external execution identity
- sidecar launch config uses a concrete chosen port in real app flows; production sidecar does not rely on `port: 0`

## Documentation and Memory Updates
Write this down in the repo as part of the same implementation plan.

Create:
- `initiatives/repo-expert-memory-local-first-v0/cluster-first-substrate-decision.md`

Keep and link:
- `initiatives/repo-expert-memory-local-first-v0/history/httpapi-rpc-pivot.md`
  - preserve it as transport-evidence and guardrail
  - do not treat it as the implementation checklist
  - link it from the new cluster-first decision doc and from the local-first v0 README

Update:
- `initiatives/repo-expert-memory-local-first-v0/README.md`
- `initiatives/repo-expert-memory-local-first-v0/topology.md`
- `initiatives/repo-expert-memory-local-first-v0/sidecar-protocol.md`
- `initiatives/repo-expert-memory-local-first-v0/vertical-slice.md`
- `initiatives/repo-expert-memory-local-first-v0/evaluation-and-acceptance.md`
- `initiatives/expert-memory-big-picture/local-first-v0-architecture.md`
- `initiatives/expert-memory-big-picture/expert-memory-onboarding.md`
- `initiatives/expert-memory-big-picture/MINIMAL_NEW_CHAT_BOOTSTRAP_PROMPT.md`
- `initiatives/expert-memory-big-picture/graphiti-memory-bootstrap-and-query-catalog.md`

Required doc corrections:
- remove or replace any “custom local workflow engine” recommendation
- remove or replace any “cluster is future-only” language
- state clearly:
  - `workflow` is the semantic execution model
  - `cluster` is the durable runtime substrate
  - `HttpApi` is control plane
  - `Rpc` is execution plane
  - `EventJournal` is product audit/projection input

Also write a final Graphiti memory episode summarizing:
- the cluster-first substrate decision
- the paused `HttpApi` rewrite
- the role of `history/httpapi-rpc-pivot.md` as supporting evidence

## Test Plan
- cluster/workflow:
  - run, poll, interrupt, resume, complete
  - restart sidecar and verify resume
  - deferred/activity behavior survives replay
  - finalizers/compensation do not leak or double-run
- sidecar lifecycle:
  - boot one SQLite-backed cluster runtime
  - mount `"/__cluster"`, `"/api/v0"`, and `"/api/v0/rpc"` on one router
  - graceful shutdown releases runner ownership and closes subscriptions
- control plane:
  - all five `HttpApi` endpoints return deterministic public payloads
- execution plane:
  - `StartIndexRepoRun` and `StartQueryRepoRun` return deterministic `runId`
  - `InterruptRepoRun` and `ResumeRepoRun` acknowledge against stable `runId`
  - `StreamRunEvents` replays from cursor and continues live
  - disconnect does not kill underlying workflow
- journal/projection:
  - projection rebuild after restart
  - retrieval packet and citations visible from final run detail
- docs:
  - no conflicting architecture text remains
  - README and decision docs link to the pivot note correctly
  - docs do not claim that generated discard RPCs return `runId`

## Assumptions
- single local runner only for v0, but implemented through real cluster services
- `RpcSerialization.layerNdjson` is used globally for v0
- `WorkflowProxy` remains useful for internal workflow handler generation, but public run control stays explicit RPCs over stable `runId`
- the paused reduced `HttpApi` rewrite is abandoned rather than merged incrementally
