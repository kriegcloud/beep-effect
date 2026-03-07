# Repo Expert-Memory Local-First V0

## Thesis
This folder defines the first concrete `v0` for the expert-memory direction as a `local-first native research prototype` focused on `repo expert memory only`.

The chosen defaults are now locked to:
- product shape: `local-first native research prototype`
- first domain: `repo expert memory only`
- shell/runtime: `Tauri v2 + Bun + Effect`
- frontend: `React + Vite + TanStack Router`
- runtime substrate: `effect/unstable/cluster`
- workflow engine: `ClusterWorkflowEngine`
- control plane: `HttpApi`
- execution plane: `Rpc`
- audit/projection input: `EventJournal`
- local SQL provider: `@effect/sql-sqlite-bun`
- storage posture: `driver boundary`
- Rust posture: `minimal and contained`
- `apps/server`, `apps/web`, and `apps/mobile` are future direction only, not v0 deliverables

This remains a `greenfield, principle-driven` spec. The larger Claude-era tree is architectural guidance, not a package map to reproduce literally.

## Why This V0 Exists
The expert-memory material in [Expert Memory Big Picture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md) and [Local-First V0 Architecture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md) established the high-level thesis.

This folder turns that thesis into a concrete, implementable `v0` for one narrow proving ground:
- a user installs a native desktop app
- the app launches a local Bun sidecar
- the sidecar indexes a TypeScript repo deterministically
- the user asks questions about that repo
- the app returns grounded answers with visible citations and retrieval context

This v0 is intentionally a `research prototype`, not a product-complete application.

## Current Architectural Authority
Read these documents in order:
1. [CLUSTER_FIRST_SUBSTRATE_DECISION.md](./CLUSTER_FIRST_SUBSTRATE_DECISION.md)
2. [HTTPAPI_RPC_PIVOT.md](./HTTPAPI_RPC_PIVOT.md)
3. [TOPOLOGY.md](./TOPOLOGY.md)
4. [SIDECAR_PROTOCOL.md](./SIDECAR_PROTOCOL.md)
5. [VERTICAL_SLICE.md](./VERTICAL_SLICE.md)
6. [EVALUATION_AND_ACCEPTANCE.md](./EVALUATION_AND_ACCEPTANCE.md)
7. [IMPLEMENTATION_BREAKDOWN.md](./IMPLEMENTATION_BREAKDOWN.md)
8. [CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md](./CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md)

Important reading posture:
- [HTTPAPI_RPC_PIVOT.md](./HTTPAPI_RPC_PIVOT.md) is transport evidence and guardrail, not the implementation checklist
- the public execution contract is now `StartIndexRepoRun`, `StartQueryRepoRun`, and `StreamRunEvents`
- generated `WorkflowProxy` discard RPCs remain useful internally, but they do not replace the public run-start contract because they do not return `runId`

## In Scope For V0
- single-user desktop prototype
- local repo registration and indexing
- TypeScript-first deterministic ingestion
- grounded repo question answering
- visible citations and evidence panel
- local persistence of repo-memory artifacts and run artifacts
- cluster-backed durable workflow lifecycle
- journal-backed run projections
- sidecar-managed runtime and protocol

## Current Implementation Snapshot
- `packages/runtime/protocol` now exposes `ControlPlaneApi`, `SidecarBootstrap`, `RepoRunRpcGroup`, `StartIndexRepoRun`, `StartQueryRepoRun`, and `StreamRunEvents` as the public sidecar boundary.
- `packages/runtime/server` already mounts `"/__cluster"`, `"/api/v0"`, and `"/api/v0/rpc"` on one Bun server, emits a machine-readable bootstrap line on stdout, and persists runtime state through `@effect/sql-sqlite-bun`.
- `packages/repo-memory/runtime` already owns deterministic TypeScript indexing, workflow-backed run acceptance/execution, journal-backed stream replay, SQLite-backed run projections, and bounded grounded retrieval for the current supported query classes.
- `packages/repo-memory/client` is a real typed client, and `apps/desktop` is now a real Tauri v2 wrapper with Rust-managed sidecar lifecycle, native repo-directory picking, auto-connect on startup, and a manual base-URL debug override.
- Testing already follows the intended split: `@effect/vitest` supporting tests plus spawned Bun subprocess tests for real sidecar lifecycle proof.

## Out Of Scope For V0
- auth / IAM
- sync or collaboration
- hosted/server deployment as a deliverable
- mobile companion as a deliverable
- full bounded-context lattice (`pages`, `email`, `calendar`, `settings`, etc.)
- broad connector ecosystem beyond what the repo-memory flow needs
- Next.js as a full-stack local server
- resuming the paused `HttpApi` rewrite as a standalone branch of work

## Known Remaining P0 Gaps
- End-to-end interrupt/resume behavior is modeled in schemas and event vocabulary, but it is not yet implemented and proven through public runtime operations.
- `RunProjector` and `RunStateMachine` remain the intended runtime seams, but most projection/materialization and transition logic still lives inside `RepoRunService`.
- Grounded query expansion should continue only through deterministic source-backed additions, not freeform semantic repo chat.

## Relationship To Upstream Context
This spec is downstream of the big-picture reading set, not a replacement for it.

Use these documents as upstream context when the `why` behind a v0 decision matters:
- [Expert Memory Big Picture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md)
- [Expert Memory Kernel](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_KERNEL.md)
- [Claims And Evidence](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/CLAIMS_AND_EVIDENCE.md)
- [Expert Memory Control Plane](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_CONTROL_PLANE.md)
- [Local-First V0 Architecture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md)

## Success Condition
This spec succeeds if another engineer can implement a desktop research prototype without making new product-shape decisions about:
- what gets built first
- which runtime owns the business logic
- how the shell talks to the sidecar
- which runtime substrate owns durable lifecycle
- how workflows, streaming, and projections fit together
- what the first UI must do
- how the prototype will be judged
