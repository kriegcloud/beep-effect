# Sidecar Protocol

## Thesis
The desktop shell and the Bun sidecar need one stable, explicit protocol boundary.

For `v0`, that boundary is:
- internal cluster transport at `"/__cluster"`
- `HttpApi` at `"/api/v0"` for control-plane reads and commands
- `Rpc` at `"/api/v0/rpc"` for workflow execution and streamed run events

The shell launches the sidecar as an official Tauri sidecar/external binary. The sidecar owns runtime semantics. The shell owns process launch and OS glue only.

## Official Grounding
This protocol is aligned to official primitives rather than plugin folklore:
- [Tauri v2 sidecars](https://v2.tauri.app/develop/sidecar/)
- [Tauri shell plugin](https://v2.tauri.app/plugin/shell/)
- [Bun standalone executables](https://bun.sh/docs/bundler/executables)
- [Effect HttpRunner](https://github.com/Effect-TS/effect-smol)
- [Effect WorkflowProxy](https://github.com/Effect-TS/effect-smol)
- [Effect EventJournal](https://github.com/Effect-TS/effect-smol)

## Explicit Rejections For V0
The implementation rejects these as `v0` foundations:
- full-stack Next.js local server as the primary backend runtime
- `tauri-plugin-js` as the primary lifecycle dependency
- shell-owned business logic
- a long-term `HTTP + SSE` run-execution contract
- a custom local workflow engine as the durable lifecycle substrate

## Process Model
### Shell startup sequence
1. The Tauri shell launches a packaged sidecar executable.
2. The shell passes:
   - `--host 127.0.0.1`
   - `--port <chosen local port>`
   - `--session-id <uuid>`
   - `--app-data-dir <absolute path>`
3. The sidecar boots the SQLite-backed cluster/runtime substrate.
4. The sidecar writes one bootstrap line to stdout as JSON.
5. The shell parses that bootstrap line and begins health checks.
6. The shell marks the sidecar usable only after a successful control-plane health response.

`v0` should not depend on `--port 0` for the real app flow. The shell should choose a concrete local port.

### Bootstrap stdout line
The first machine-readable stdout line should conceptually match `SidecarBootstrap`:

```json
{
  "type": "bootstrap",
  "sessionId": "7f7c55d1-3e8f-4d70-9955-6653f2f2ef2d",
  "version": "0.1.0",
  "host": "127.0.0.1",
  "port": 43117,
  "baseUrl": "http://127.0.0.1:43117",
  "pid": 12345
}
```

### Shutdown behavior
The shutdown order is part of the architecture:
1. stop accepting new app-facing requests
2. stop accepting new run submissions
3. close run event subscriptions
4. let cluster/workflow state persist
5. release runner ownership and cluster resources
6. close SQL and remaining infrastructure scopes

## Shared Router Layout
One Bun HTTP server should host one shared `HttpRouter` with three logical surfaces:
- `"/__cluster"` for internal cluster runner transport
- `"/api/v0"` for `HttpApi` control-plane routes
- `"/api/v0/rpc"` for app-facing `Rpc`

Use:
- `HttpRunner.layerHttpOptions({ path: "/__cluster" })`
- `HttpRunner.layerClientProtocolHttp({ path: "__cluster" })`
- `RpcSerialization.layerNdjson`

## Control Plane
The control plane is ordinary request/response API surface.

These routes are part of the target public surface:
- `GET /api/v0/health`
- `GET /api/v0/repos`
- `POST /api/v0/repos`
- `GET /api/v0/runs`
- `GET /api/v0/runs/:runId`

These routes should be modeled in `packages/runtime/protocol` as `HttpApi` contracts and served through `HttpApiBuilder` on the shared router.

## Execution Plane
The execution plane is workflow-backed `Rpc`, not ad hoc long-running HTTP routes.

The target public execution surface is:
- custom start RPCs for:
  - `StartIndexRepoRun`
  - `StartQueryRepoRun`
- one custom streamed RPC:
  - `StreamRunEvents`

The runtime may still register workflow-proxy generated handlers internally for:
- workflow resume
- workflow poll/inspection paths
- intra-runtime workflow integration

Those are not the primary desktop-facing run-start contract.

### `StreamRunEvents`
`StreamRunEvents` must:
- accept `runId` and optional replay cursor
- replay missing journaled events first
- then continue live
- not cancel the underlying workflow on client disconnect
- terminate only after a terminal run event is emitted

## Run Lifecycle Identity
- `runId === executionId`
- workflow execution IDs are deterministic from normalized payload + version stamp
- custom start RPCs compute `workflow.executionId(payload)` before dispatch, append `RunAccepted`, and return `runId` immediately
- generated `WorkflowProxy` discard RPCs do not return `runId`; they are not sufficient as the public run-start surface
- resume RPCs may still come from workflow proxy generation or internal workflow plumbing, but they are not the only execution-plane primitive

## Product-Level Run Events
`EventJournal` is the product audit model.

The durable event set is:
- `RunAccepted`
- `RunStarted`
- `RunProgressUpdated`
- `RetrievalPacketMaterialized`
- `AnswerDrafted`
- `RunCompleted`
- `RunFailed`
- `RunInterrupted`
- `RunResumed`

These events drive:
- `StreamRunEvents`
- run projections
- final answer detail views
- replay after reconnect/restart

## Retired Target Routes
These current HTTP routes should be treated as transitional only and removed after migration:
- `POST /api/v0/repos/:repoId/index-runs`
- `POST /api/v0/query-runs`
- `GET /api/v0/runs/:runId/events`

They are not the target transport model.

## Evidence Contracts
### `Citation`
`Citation` lives conceptually in `packages/repo-memory/model`.

Rules:
- every final grounded query answer should include citations when the system claims repo-grounded knowledge
- citations must point to real file spans or symbol-backed source spans
- citations belong in retrieval packets and final run details, not just transient stream output

### `RetrievalPacket`
`RetrievalPacket` is the bounded evidence-bearing answer context returned by the sidecar.

Rules:
- it should be durable enough to inspect after the run completes
- it should be visible from both `GET /runs/:runId` and streamed execution output
- it should remain smaller and more inspectable than a raw unbounded subgraph dump

## Questions Worth Keeping Open
- Should `StreamRunEvents` remain the only custom RPC beyond the two public start RPCs?
- Which compatibility routes should stay briefly during migration, and which should be deleted immediately once the cluster path lands?
