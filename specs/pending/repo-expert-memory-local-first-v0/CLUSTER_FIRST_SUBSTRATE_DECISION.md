# Cluster-First Substrate Decision

## Thesis
The repo expert-memory `v0` should run on a real durable runtime substrate, not a custom local run supervisor.

The locked decision is:
- `effect/unstable/workflow` is the semantic model for repo runs
- `effect/unstable/cluster` is the durable runtime substrate
- `HttpApi` is the control plane
- `Rpc` is the execution and streaming plane
- `EventJournal` is the product-level audit log and projection input
- `@effect/sql-sqlite-bun` is the `v0` local SQL provider
- storage code stays written against `effect/unstable/sql/SqlClient`

This replaces earlier guidance that leaned toward a custom local workflow engine or an incremental `HttpApi`-only transport rewrite.

## Why This Decision Was Made
Three constraints pushed the architecture in this direction:
- lifecycle correctness is non-negotiable
- run interruption, resume, and finalizers need a real durable execution substrate
- the app needs one coherent runtime story for `"/__cluster"`, `"/api/v0"`, and `"/api/v0/rpc"`

The custom local workflow-engine idea was directionally coherent but still would have required us to rebuild durable execution semantics ourselves. `cluster` already gives us the right class of substrate.

## Locked Runtime Shape
The sidecar runtime should be assembled from:
- one local SQLite database
- `SqlMessageStorage`
- `SqlRunnerStorage`
- `Sharding`
- `Runners.layerRpc`
- `RunnerHealth.layerPing`
- `ClusterWorkflowEngine.layer`
- one shared Bun HTTP server
- one shared `HttpRouter`
- internal cluster route at `"/__cluster"`
- app `HttpApi` under `"/api/v0"`
- app `Rpc` under `"/api/v0/rpc"`

Use:
- `HttpRunner.layerHttpOptions({ path: "/__cluster" })`
- `HttpRunner.layerClientProtocolHttp({ path: "__cluster" })`
- `RpcSerialization.layerNdjson`

Do not use `BunClusterHttp.layer(...)` as the top-level app assembly primitive.

`SingleRunner.layer(...)` remains useful evidence that Effect v4 already supports a real SQL-backed local cluster substrate for single-node applications. It is a validation point, not the final app assembly primitive for this repo, because the sidecar still needs explicit ownership of:
- `"/__cluster"`
- `"/api/v0"`
- `"/api/v0/rpc"`
- shutdown ordering and process lifecycle

## SQL Provider Decision
The local SQL provider decision is now explicit.

Use:
- `@effect/sql-sqlite-bun`

Rationale:
- Bun-native runtime fit for the sidecar
- explicit Effect lifecycle/finalizer wiring in the provider implementation
- no Node native addon packaging burden in the desktop-sidecar path
- compatible with the generic `SqlClient` contract used by cluster and eventlog

Keep the storage boundary at `effect/unstable/sql/SqlClient` so future providers remain swappable.

Alternatives considered:
- `@effect/sql-sqlite-node`
  - viable for a Node-hosted server
  - not the right default for a Bun-packaged desktop sidecar
  - adds a `better-sqlite3` native-addon packaging story we do not need for `v0`
- `@effect/sql-sqlite-wasm`
  - useful for browser or portability scenarios
  - not the right runtime fit for the local Bun sidecar
- `@effect/sql-sqlite-do`
  - specific to Cloudflare Durable Objects
  - not relevant to the local-first desktop runtime shape
- `@effect/sql-sqlite-react-native`
  - useful for a future native mobile runtime target
  - not the right provider for the Bun sidecar that owns `v0`

## Transport Decision
The public sidecar split is:
- `HttpApi` for health, repo registration, and read-side projections
- `Rpc` for workflow execution and streamed run events

More specifically:
- public run-start is `StartIndexRepoRun` and `StartQueryRepoRun`
- public replay/live execution streaming is `StreamRunEvents`
- `WorkflowProxyServer.layerRpcHandlers(...)` can still register workflow-generated handlers internally
- generated `WorkflowProxy` discard RPCs are not the public run-start surface because they do not return `runId`

Retire the old transport shape after migration:
- `POST /api/v0/repos/:repoId/index-runs`
- `POST /api/v0/query-runs`
- `GET /api/v0/runs/:runId/events`

Those routes are implementation leftovers, not the target architecture.

## Relationship To The Pivot Note
[HTTPAPI_RPC_PIVOT.md](./HTTPAPI_RPC_PIVOT.md) remains valuable, but only as supporting evidence.

Use it for:
- the proof that `HttpApi` still serves through `HttpRouter`
- the proof that `HttpApi` can technically stream raw responses
- the guardrail explaining why the paused rewrite should not be resumed

Do not use it as the implementation checklist.

## Relationship To The Main Plan
The detailed implementation plan lives in:
- [CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md](./CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md)

This decision doc exists so future readers can understand the durable architecture choice quickly without reading the longer plan first.

## Current Implementation Implication
The first safe implementation slice under this decision is:
- keep current public shapes stable where possible
- move run projections out of process-local memory and into SQLite
- preserve schema-first models, `DateTime`, and driver boundaries while the larger cluster/router cutover is still in progress

The current implemented slice now goes further:
- durable run projections are stored in SQLite
- the control plane is `HttpApi`
- run execution moved to custom public `Rpc` start handlers plus `StreamRunEvents`
- the old HTTP run mutation and SSE routes are no longer the active integration target
- one shared Bun router already hosts `"/__cluster"`, `"/api/v0"`, and `"/api/v0/rpc"`
- the desktop shell is now a real Tauri wrapper with Rust-managed sidecar lifecycle and a typed client over the public protocol
- restart/replay is already proved through spawned Bun lifecycle tests against the real sidecar entrypoint

What remains incomplete is not the transport split itself but the last runtime seams:
- explicit `RunProjector` and `RunStateMachine` extraction
- end-to-end interrupt/resume behavior and proof

## What This Supersedes
This decision supersedes:
- the idea of a custom local workflow engine as the preferred `v0` substrate
- any guidance that treats `cluster` as future-only
- the paused reduced `HttpApi` rewrite as the next implementation move
- any `HTTP + SSE` run-execution contract presented as the long-term design

## Questions Worth Keeping Open
- How much of the current handwritten runtime can be deleted immediately versus phased out behind a stable compatibility layer?
- Should `StreamRunEvents` remain the only streamed custom RPC beyond the two public start RPCs?
- When should projections move from temporary in-memory shape to journal-derived materialized state?
