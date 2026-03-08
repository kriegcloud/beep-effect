# Topology

## Thesis
The `v0` topology should stay small and explicit.

The sidecar is the runtime center of gravity, and the topology should reflect that. This is not the place to reproduce the full long-term bounded-context tree.
This document is a logical ownership map, not a literal full repo tree.

## V0 Logical Ownership Map
```text
.
├── apps/
│   └── desktop/
│       ├── src/                     # React/Vite/TanStack Router shell over the public client boundary
│       └── src-tauri/               # minimal Rust wrapper for sidecar lifecycle and native OS glue
│
└── packages/
    ├── runtime/
    │   ├── protocol/                # transport-only HttpApi contracts and Rpc groups
    │   └── server/                  # Bun sidecar, cluster/runtime assembly, shared router, bootstrap, lifecycle
    │
    ├── repo-memory/
    │   ├── model/                   # pure schemas, brands, tagged unions, workflow payloads
    │   ├── store/                   # repo-memory store service contracts
    │   ├── sqlite/                  # SQLite-backed repo-memory store implementations
    │   ├── runtime/                 # repo workflows, projections, grounded retrieval semantics
    │   └── client/                  # typed desktop-side HttpApi + Rpc client boundary
    │
    └── common/
        ├── identity/
        └── schema/
```

## Current Native Shell Boundary
- `apps/desktop/src-tauri` owns sidecar launch, bootstrap parsing, health gating, shutdown, and the native repo-folder picker.
- `apps/desktop/src` owns presentation, state inspection, and the optional manual-override debug path only.
- Desktop code still communicates exclusively through `packages/repo-memory/client` and `packages/runtime/protocol`; it does not import sidecar runtime internals in process.

## Runtime Shape Inside `packages/runtime/server`
The `runtime/server` package owns the sidecar composition root.

It already assembles:
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

## Runtime Shape Inside `packages/repo-memory/runtime`
The `repo-memory/runtime` package owns repo-specific execution semantics.

It currently defines:
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

Current debt to keep explicit:
- `RunProjector.ts` and `RunStateMachine.ts` exist as named seams in the package, but projection and transition logic still lives inside `RepoRunService`.
- Public interruption/resume behavior now exists through the runtime, typed client, desktop UI, and spawned sidecar tests; any remaining question is about how much broader coverage is worth keeping in `v0`, not whether the basic path exists.

## Dependency Rules
### UI and shell
- `apps/desktop` depends on `packages/runtime/protocol` and `packages/repo-memory/client`
- `apps/desktop` must not import `packages/runtime/server` internals
- the shell talks to the sidecar through the transport boundary, not in-process service imports
- the native wrapper owns only sidecar lifecycle, native file picking, and diagnostics
- manual base-URL override remains a debug fallback, not the primary product shape

### Sidecar runtime
- `packages/runtime/server` composes `repo-memory/runtime`, `repo-memory/sqlite`, and runtime infrastructure layers
- `packages/runtime/server` owns route layout and process lifecycle
- `packages/runtime/server` is the only package that should know about the final router topology

### Repo-memory packages
- `packages/repo-memory/model` stays pure and schema-first
- `packages/repo-memory/store` defines repo-memory storage contracts only
- `packages/repo-memory/sqlite` stays below semantic/runtime layers and only knows local persistence concerns
- `packages/repo-memory/runtime` depends on model/store contracts and owns repo-specific execution semantics
- `packages/repo-memory/client` depends on protocol/model contracts, not runtime internals

### Common packages
- `packages/common/*` remain domain-agnostic support packages
- common packages must not grow sidecar-specific runtime logic

## Future Direction Only
These remain intentionally outside the supported `v0` deliverable topology, even if placeholder directories already exist in the repo:
- `apps/server`
- `apps/web`
- `apps/mobile`
- broad BC packages like `iam`, `pages`, `email`, `calendar`, `settings`

They are valid future directions, but they are not implementation obligations for this prototype.

## Current Status
The transport split in this topology is already the live code path.

The old compatibility HTTP run routes are retired.
The remaining work is about finishing runtime seams and lifecycle honesty, not preserving transitional transport code.

## Questions Worth Keeping Open
- When should `RepoRunService` hand projection materialization and transition rules to real `RunProjector` and `RunStateMachine` modules?
- How much interruption/resume coverage should stay in `v0` beyond the currently proved durable index-run path?
