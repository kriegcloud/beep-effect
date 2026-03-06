# Cluster-First Repo Expert-Memory V0

## Summary
Replace the current ad hoc sidecar runtime with a `cluster-first`, `workflow-backed`, `local-first` architecture and record that decision in the spec set so there is no conflicting guidance left in the repo.

Lock these decisions:
- `effect/unstable/cluster` is the v0 runtime substrate.
- `ClusterWorkflowEngine` is the workflow engine.
- `SqlMessageStorage` + `SqlRunnerStorage` on `SQLite` are the durable runtime store.
- `HttpApi` is the control plane.
- `Rpc` is the execution and streaming plane.
- `EventJournal` is the product-level run audit log and projection input.
- The paused reduced `HttpApi` rewrite remains superseded.
- `HTTPAPI_RPC_PIVOT.md` is kept as a supporting evidence note, not an implementation checklist.

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
Implement repo runs in `packages/repo-memory/server` as real workflows:
- `IndexRepoRun`
- `QueryRepoRun`

Use:
- `Workflow.make(...)`
- `WorkflowProxy.toRpcGroup(...)`
- `WorkflowProxyServer.layerRpcHandlers(...)`

Rules:
- `runId === executionId`
- execution ids are deterministic from normalized payload + version stamp
- discard RPCs return `runId`
- resume RPCs come from workflow proxy generation
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
- workflow-derived RPCs for:
  - `IndexRepoRun`
  - `IndexRepoRunDiscard`
  - `IndexRepoRunResume`
  - `QueryRepoRun`
  - `QueryRepoRunDiscard`
  - `QueryRepoRunResume`
- one custom streamed RPC:
  - `StreamRunEvents`

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
Move `packages/repo-memory/drivers-local` off the JSON state-file model and onto SQLite-backed local stores for:
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

### `packages/repo-memory/domain`
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
- `specs/pending/repo-expert-memory-local-first-v0/CLUSTER_FIRST_SUBSTRATE_DECISION.md`

Keep and link:
- `specs/pending/repo-expert-memory-local-first-v0/HTTPAPI_RPC_PIVOT.md`
  - preserve it as transport-evidence and guardrail
  - do not treat it as the implementation checklist
  - link it from the new cluster-first decision doc and from the local-first v0 README

Update:
- `specs/pending/repo-expert-memory-local-first-v0/README.md`
- `specs/pending/repo-expert-memory-local-first-v0/TOPOLOGY.md`
- `specs/pending/repo-expert-memory-local-first-v0/SIDECARE_PROTOCOL.md`
- `specs/pending/repo-expert-memory-local-first-v0/VERTICAL_SLICE.md`
- `specs/pending/repo-expert-memory-local-first-v0/EVALUATION_AND_ACCEPTANCE.md`
- `specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md`
- `specs/pending/expert-memory-big-picture/GPT54_SIBLING_ONBOARDING.md`
- `specs/pending/expert-memory-big-picture/MINIMAL_NEW_CHAT_BOOTSTRAP_PROMPT.md`
- `specs/pending/expert-memory-big-picture/GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md`

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
- the role of `HTTPAPI_RPC_PIVOT.md` as supporting evidence

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
  - discard RPCs return deterministic `runId`
  - `StreamRunEvents` replays from cursor and continues live
  - disconnect does not kill underlying workflow
- journal/projection:
  - projection rebuild after restart
  - retrieval packet and citations visible from final run detail
- docs:
  - no conflicting architecture text remains
  - README and decision docs link to the pivot note correctly

## Assumptions
- single local runner only for v0, but implemented through real cluster services
- `RpcSerialization.layerNdjson` is used globally for v0
- `WorkflowProxy` is used for workflow execution/resume RPC generation
- the paused reduced `HttpApi` rewrite is abandoned rather than merged incrementally
