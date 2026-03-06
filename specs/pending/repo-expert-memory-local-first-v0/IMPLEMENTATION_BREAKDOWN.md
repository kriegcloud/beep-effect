# Implementation Breakdown

## Thesis
Implementation should now proceed from the cluster-first decision, not from the superseded `HttpApi` rewrite branch.

The point of this breakdown is to sequence the work so lifecycle, transport, and persistence land coherently.

## Workstream 1: Contracts
Lock the public contracts first.

### `packages/repo-memory/domain`
Define and keep stable:
- `RepoId`
- `RunId`
- `RunEventSequence`
- `RunCursor`
- `Citation`
- `RetrievalPacket`
- workflow payloads for `IndexRepoRun` and `QueryRepoRun`

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
Implement:
- `IndexRepoRun`
- `QueryRepoRun`

Use:
- `Workflow.make(...)`
- `WorkflowProxy.toRpcGroup(...)`
- `WorkflowProxyServer.layerRpcHandlers(...)`

Rules:
- `runId === executionId`
- execution IDs are deterministic from normalized payload + version stamp
- discard RPCs return `runId`
- resume RPCs come from workflow proxy generation

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

## Immediate Guardrail
The paused reduced `HttpApi` rewrite is not a prerequisite step.
It remains superseded.

Use [HTTPAPI_RPC_PIVOT.md](./HTTPAPI_RPC_PIVOT.md) as evidence and guardrail only.

## Questions Worth Keeping Open
- Which temporary compatibility code should stay just long enough to land cluster/workflow without breaking the dev loop?
- When should `workers` enter the design for CPU-bound parsing, if at all?
