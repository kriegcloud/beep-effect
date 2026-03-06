# Topology

## Thesis
The `v0` topology should stay small and explicit.

The sidecar is the runtime center of gravity, and the topology should reflect that. This is not the place to reproduce the full long-term bounded-context tree.

## V0 Topology
```text
.
├── apps/
│   └── desktop/                     # Tauri shell + React/Vite/TanStack Router UI
│
└── packages/
    ├── runtime/
    │   ├── protocol/                # HttpApi contracts, Rpc groups, run event schemas
    │   └── server/                  # Bun sidecar, cluster/runtime assembly, router, lifecycle
    │
    ├── repo-memory/
    │   ├── domain/                  # RepoId, RunId, Citation, RetrievalPacket, workflow payloads
    │   ├── server/                  # Repo workflows, projections, journal-facing services
    │   ├── drivers-local/           # SQLite-backed repo-memory persistence
    │   └── client/                  # UI-side client contracts/helpers
    │
    └── common/
        ├── identity/
        └── schema/
```

## Runtime Shape Inside `packages/runtime/server`
The `runtime/server` package owns the sidecar composition root.

It should assemble:
- Bun HTTP server
- shared `HttpRouter`
- internal cluster route at `"/__cluster"`
- control-plane `HttpApi` at `"/api/v0"`
- execution-plane `Rpc` at `"/api/v0/rpc"`
- `SqlMessageStorage`
- `SqlRunnerStorage`
- `Sharding`
- `Runners.layerRpc`
- `RunnerHealth.layerPing`
- `ClusterWorkflowEngine.layer`
- `SqlEventLogJournal`
- sidecar lifecycle / shutdown coordination

## Runtime Shape Inside `packages/repo-memory/server`
The `repo-memory/server` package owns repo-specific execution semantics.

It should define:
- `IndexRepoRun`
- `QueryRepoRun`
- projection-building logic for run summaries and final answers
- product-level run events
- retrieval packet materialization
- citation-facing answer assembly boundaries

It should not own:
- HTTP route registration
- Bun server lifecycle
- cluster transport setup
- shell concerns

## Dependency Rules
### UI and shell
- `apps/desktop` depends on `packages/runtime/protocol` and `packages/repo-memory/client`
- `apps/desktop` must not import `packages/runtime/server` internals
- the shell talks to the sidecar through the transport boundary, not in-process service imports

### Sidecar runtime
- `packages/runtime/server` composes `repo-memory/server`, `repo-memory/drivers-local`, and runtime infrastructure layers
- `packages/runtime/server` owns route layout and process lifecycle
- `packages/runtime/server` is the only package that should know about the final router topology

### Repo-memory packages
- `packages/repo-memory/domain` stays pure and schema-first
- `packages/repo-memory/server` depends on domain contracts and driver interfaces
- `packages/repo-memory/drivers-local` stays below semantic/runtime layers and only knows local persistence concerns
- `packages/repo-memory/client` depends on protocol/domain contracts, not server internals

### Common packages
- `packages/common/*` remain domain-agnostic support packages
- common packages must not grow sidecar-specific runtime logic

## Future Direction Only
These remain intentionally out of the `v0` topology:
- `apps/server`
- `apps/web`
- `apps/mobile`
- broad BC packages like `iam`, `pages`, `email`, `calendar`, `settings`

They are valid future directions, but they are not implementation obligations for this prototype.

## Notes On Temporary Code
The current codebase may carry temporary transport-compatible scaffolding while the cluster-first runtime is landing.

That does not change the topology authority in this document.
The target shape is still:
- `HttpApi` for control-plane reads and commands
- `Rpc` for run execution and event streaming
- cluster/workflow for durable lifecycle

## Questions Worth Keeping Open
- When should run projections move out of temporary compatibility code and become purely journal-derived?
- How much of the existing transport compatibility layer should survive once the workflow-proxy RPC surface is mounted?
