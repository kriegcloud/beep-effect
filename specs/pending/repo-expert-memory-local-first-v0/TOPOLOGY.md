# V0 Topology

## Thesis
The `v0` topology should be the smallest package and app graph that cleanly supports a local-first repo-memory prototype.

It should not attempt to reproduce the full long-term bounded-context lattice. It should only create the packages needed to prove the local-first sidecar architecture and grounded repo-memory workflow.

## Actual V0 Topology
```text
.
├── apps/
│   └── desktop/                  # Tauri v2 shell + React/Vite/TanStack Router frontend
│
└── packages/
    ├── runtime/
    │   ├── protocol/             # shell <-> sidecar contracts, SSE event shapes, shared request/response types
    │   └── server/               # Bun + Effect sidecar composition root and transport host
    │
    ├── repo-memory/
    │   ├── domain/               # RepoTarget, IndexRun, QueryRun, Citation, RetrievalPacket, repo-memory errors
    │   ├── server/               # ingestion, indexing, retrieval, grounded-answer orchestration services
    │   ├── client/               # protocol-aware client helpers for desktop frontend
    │   └── drivers-local/        # local graph/search/artifact/persistence adapters
    │
    └── common/
        ├── utils/                # existing generic utilities
        ├── schema/               # existing generic schema primitives
        ├── identity/             # existing identity/tagging helpers where useful
        └── ui/                   # existing domain-agnostic UI primitives if reused
```

## Package Responsibilities
### `apps/desktop`
Owns:
- Tauri shell configuration
- sidecar launch and lifecycle supervision
- React UI
- Vite build
- TanStack Router route tree
- sidecar health/reconnect UX

Must not own:
- repo-memory semantics
- indexing logic
- retrieval logic
- graph driver logic

### `packages/runtime/protocol`
Owns the stable shell-to-sidecar contract:
- `SidecarBootstrap`
- `RepoRegistration`
- `IndexRun`
- `QueryRun`
- `RunStreamEvent`

This package is transport-aware but domain-light. It defines how the UI and sidecar speak, not how repo-memory itself works internally.

### `packages/runtime/server`
Owns the sidecar runtime composition:
- Bun HTTP host
- SSE host
- Effect layer composition
- process bootstrap behavior
- health endpoint
- runtime logging and diagnostics boundary

It depends on `packages/repo-memory/server` and `packages/runtime/protocol`.

### `packages/repo-memory/domain`
Owns the repo-memory domain model:
- `RepoTarget`
- `Citation`
- `RetrievalPacket`
- repo-memory run/result summaries
- repo-memory-specific typed errors

This package should be the semantic home for evidence-bearing answer primitives.

### `packages/repo-memory/server`
Owns repo-memory behavior:
- repo registration service
- indexing service
- query service
- grounded-answer orchestration
- retrieval packet assembly

It depends on `repo-memory/domain`, `runtime/protocol`, and `repo-memory/drivers-local` abstractions.

### `packages/repo-memory/client`
Owns UI-facing helpers for the desktop frontend:
- typed request helpers for runtime protocol
- SSE subscription helpers
- view-model shaping for query/index runs

It must not reach into server internals.

### `packages/repo-memory/drivers-local`
Owns the first local persistence layer:
- local repo registry storage
- local index artifact storage
- local graph/search/vector/artifact adapters
- local run artifact persistence

This package sits below repo-memory semantics and below the runtime protocol.

## Dependency Rules
Lock these dependency rules for v0:
- frontend depends on `runtime/protocol` and `repo-memory/client`, never server internals
- `runtime/server` composes `repo-memory/server` and drivers, but does not contain repo semantics itself
- `repo-memory/server` depends on `repo-memory/domain` and local driver abstractions, not on the desktop shell
- `repo-memory/drivers-local` stays below semantic and runtime layers
- `common/*` remains domain-agnostic
- no package in v0 may depend on hypothetical future BC packages such as `iam`, `pages`, `email`, `calendar`, or `settings`

## Future Direction Only
These are explicitly not part of the v0 topology, even though they remain valid future directions:
- `apps/server`
- `apps/web`
- `apps/mobile`
- full BC lattice like `iam`, `pages`, `email`, `calendar`, `settings`
- workspace and page-tree product concepts as first-class runtime concerns

If a later spec promotes them, they should be layered on top of the sidecar/runtime principles established here rather than folded into v0.

## Principle Borrowed From The Claude Tree
The Claude-era tree remains useful as a principles document in three ways:
- dependency direction should remain disciplined and layered
- common packages should stay domain-agnostic
- future product expansion should happen by adding bounded packages around a stable runtime/protocol core, not by bloating the first prototype

That is the relationship. `v0` uses the principles, not the whole tree.
