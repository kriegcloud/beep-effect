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

## Transport Decision
The public sidecar split is:
- `HttpApi` for health, repo registration, and read-side projections
- `Rpc` for workflow execution and streamed run events

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

## What This Supersedes
This decision supersedes:
- the idea of a custom local workflow engine as the preferred `v0` substrate
- any guidance that treats `cluster` as future-only
- the paused reduced `HttpApi` rewrite as the next implementation move
- any `HTTP + SSE` run-execution contract presented as the long-term design

## Questions Worth Keeping Open
- How much of the current handwritten runtime can be deleted immediately versus phased out behind a stable compatibility layer?
- Should `StreamRunEvents` be the only custom RPC beyond workflow-proxy generated RPCs?
- When should projections move from temporary in-memory shape to journal-derived materialized state?
