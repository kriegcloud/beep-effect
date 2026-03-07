# Sidecar Protocol

## Thesis
The desktop shell and the Bun sidecar need one stable, explicit protocol boundary.

For `v0`, that boundary is:
- internal cluster transport at `"/__cluster"`
- `HttpApi` at `"/api/v0"` for control-plane reads and commands
- `Rpc` at `"/api/v0/rpc"` for workflow execution and streamed run events

The sidecar owns runtime semantics.
The shell owns process launch, bootstrap discovery, health gating, shutdown, native file picking, and diagnostics only.

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
1. The native shell decides whether it is in:
   - managed dev mode using raw `bun run packages/runtime/server/src/main.ts`
   - managed packaged mode using the bundled `repo-memory-sidecar` external binary
2. The shell chooses a concrete localhost port and generates a fresh `sessionId`.
3. The shell passes startup configuration through environment variables:
   - `BEEP_REPO_MEMORY_HOST=127.0.0.1`
   - `BEEP_REPO_MEMORY_PORT=<chosen local port>`
   - `BEEP_REPO_MEMORY_SESSION_ID=<uuid>`
   - `BEEP_REPO_MEMORY_APP_DATA_DIR=<absolute path>`
   - `BEEP_REPO_MEMORY_VERSION=<desktop version>`
   - `BEEP_REPO_MEMORY_OTLP_ENABLED=false`
   - `BEEP_REPO_MEMORY_DEVTOOLS_ENABLED=false`
4. The sidecar boots the SQLite-backed cluster/runtime substrate.
5. The sidecar writes one machine-readable bootstrap line to stdout as JSON.
6. The shell parses that bootstrap line and begins health checks against `GET /api/v0/health`.
7. The shell marks the sidecar usable only after the health payload decodes as `SidecarBootstrap`.

`v0` does not rely on `port: 0` for the real app flow.
The shell chooses a concrete local port.

## Current Shell Integration
- `apps/desktop/src-tauri` now owns four native commands: `start_sidecar`, `stop_sidecar`, `get_sidecar_state`, and `pick_repo_directory`.
- Dev mode launches `bun run packages/runtime/server/src/main.ts` from the repo root. Packaged mode launches the bundled `repo-memory-sidecar` external binary.
- The React shell auto-starts the managed sidecar, waits for bootstrap plus `GET /api/v0/health`, and keeps manual base-URL connection only as a debug override.
- The shared desktop-side client boundary already lives in `packages/repo-memory/client` and talks only through `ControlPlaneApi` plus `RepoRunRpcGroup`.

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

The current runtime also includes:
- `status`
- `startedAt`

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

These routes are the live public surface:
- `GET /api/v0/health`
- `GET /api/v0/repos`
- `POST /api/v0/repos`
- `GET /api/v0/runs`
- `GET /api/v0/runs/:runId`

`GET /api/v0/health` returns `SidecarBootstrap`.
These routes are modeled in `packages/runtime/protocol` as `HttpApi` contracts and served through `HttpApiBuilder` on the shared router.

## Execution Plane
The execution plane is workflow-backed `Rpc`, not ad hoc long-running HTTP routes.

The live public execution surface is:
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

`RunInterrupted` and `RunResumed` remain part of the locked event vocabulary even though end-to-end interruption/resume commands are still an open `v0` gap.

## Retired Routes
These HTTP routes are retired and should not be reintroduced:
- `POST /api/v0/repos/:repoId/index-runs`
- `POST /api/v0/query-runs`
- `GET /api/v0/runs/:runId/events`

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
- What is the smallest native-sidecar diagnostic surface that still makes startup failures inspectable without pulling repo-memory semantics into Rust?
