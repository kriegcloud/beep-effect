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

This started as a `greenfield, principle-driven` spec set. It now serves as the `current-state v0` spec set for the live repo shape, with historical decision notes kept nearby but clearly marked.

## Why This V0 Exists
The expert-memory material in [Expert Memory Big Picture](../expert-memory-big-picture/README.md) and [local-first-v0-architecture.md](../expert-memory-big-picture/local-first-v0-architecture.md) established the high-level thesis.

This folder turns that thesis into a concrete, implementable `v0` for one narrow proving ground:
- a user installs a native desktop app
- the app launches a local Bun sidecar
- the sidecar indexes a TypeScript repo deterministically
- the user asks questions about that repo
- the app returns grounded answers with visible citations and retrieval context

The current kernel proof for this slice is narrower than a full cross-domain claim system:
- deterministic repo artifacts
- bounded retrieval over those artifacts
- a frozen `RetrievalPacket`
- an answer rendered from that packet only
- extraction provenance and query-time explainability kept explicit and inspectable

This v0 is intentionally a `research prototype`, not a product-complete application.

## Current Architectural Authority
Use these documents as the normative current-state set:
1. [cluster-first-substrate-decision.md](./cluster-first-substrate-decision.md)
2. [topology.md](./topology.md)
3. [sidecar-protocol.md](./sidecar-protocol.md)
4. [vertical-slice.md](./vertical-slice.md)
5. [query-stages-and-retrieval-packet.md](./query-stages-and-retrieval-packet.md)
6. [evaluation-and-acceptance.md](./evaluation-and-acceptance.md)
7. [PLAN.md](./PLAN.md)

Historical and supporting context:
- [history/httpapi-rpc-pivot.md](./history/httpapi-rpc-pivot.md) is transport evidence and guardrail, not the implementation checklist
- [history/cluster-first-repo-expert-memory-plan.md](./history/cluster-first-repo-expert-memory-plan.md) is the historical sequencing note and remaining-work context, not the primary current-state checklist

Important reading posture:
- when the normative docs above and the historical notes drift, the normative docs above win
- the public execution contract is now `StartIndexRepoRun`, `StartQueryRepoRun`, `InterruptRepoRun`, `ResumeRepoRun`, and `StreamRunEvents`
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
- retrieval-side NLP enrichment limited to query hygiene, intent hints, bounded ranking/query expansion, and grounded summarization after citations are fixed
- sidecar-managed runtime and protocol

## Current Implementation Snapshot
- `packages/runtime/protocol` now exposes `ControlPlaneApi`, `SidecarBootstrap`, `RepoRunRpcGroup`, `StartIndexRepoRun`, `StartQueryRepoRun`, `InterruptRepoRun`, `ResumeRepoRun`, and `StreamRunEvents` as the public sidecar boundary.
- `packages/runtime/server` already mounts `"/__cluster"`, `"/api/v0"`, and `"/api/v0/rpc"` on one Bun server, emits a machine-readable bootstrap line on stdout, persists runtime state through `@effect/sql-sqlite-bun`, and serves local-origin CORS plus basic browser security headers.
- `packages/repo-memory/runtime` already owns deterministic TypeScript indexing, workflow-backed run acceptance/execution, journal-backed stream replay, SQLite-backed run projections, and bounded grounded retrieval for the current supported query classes.
- the current downstream contract now makes repo-memory `v0` the proving ground for the memory kernel at the `artifact-to-packet` stage rather than requiring a full `ClaimRecord` implementation inside this slice.
- `packages/repo-memory/model` now defines a shared pure `RunProjector`, and lifecycle `RunStreamEvent` payloads are now durable deltas rather than embedded full `RepoRun` snapshots.
- `packages/repo-memory/runtime` and `apps/desktop` now both project live run state from the same event stream instead of treating streamed lifecycle events as pre-materialized run snapshots.
- grounded retrieval now includes repo-local resolved file dependency and dependent queries backed by persisted `resolvedTargetFilePath` import-edge state.
- `packages/common/nlp` already exists as the shared home for retrieval-side query-hygiene and ranking helpers, and `packages/repo-memory/runtime` now composes those helpers through an explicit bounded query-preparation layer that normalizes phrasing into `QueryInterpretation`, performs deterministic symbol/file/module variant expansion, and surfaces inspectable selection notes in retrieval packets.
- `packages/repo-memory/client` is a real typed client, and `apps/desktop` is now a real Tauri v2 wrapper with Rust-managed sidecar lifecycle, native repo-directory picking, auto-connect on startup, same-origin `portless` desktop dev over HTTPS, and a manual base-URL debug override.
- Testing already follows the intended split: `@effect/vitest` supporting tests plus spawned Bun subprocess tests for real sidecar lifecycle proof, including durable index-run interrupt/resume through the public RPC path.

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
- `RunProjector`, `RunStateMachine`, the run event-log boundary, and the lifecycle controller now exist as explicit runtime seams; the remaining closure work is mostly about keeping projection bootstrap/cursor ownership and replay behavior honest rather than proving those seams from scratch.
- The concrete query-run contract is now implemented around the canonical `grounding -> retrieval -> packet -> answer` stage split, structured retrieval-packet payloads/issues, packet-only answer rendering, and a light `QueryRun.queryStages` projection derived from existing progress/packet/answer events without adding new durable event kinds.
- Extraction provenance and query-time explainability are now intentionally separated in both the docs and the repo-memory `v0` read model; the next closure work is hardening the explicit query-preparation layer plus any still-missing projection bootstrap/replay cleanup rather than introducing new query artifact kinds.
- Grounded query expansion should continue only through deterministic source-backed additions, with NLP kept on the candidate side of the boundary rather than becoming freeform semantic repo chat or durable canonical state.

## Relationship To Upstream Context
This spec is downstream of the big-picture reading set, not a replacement for it.

Use these documents as upstream context when the `why` behind a v0 decision matters:
- [Expert Memory Big Picture](../expert-memory-big-picture/README.md)
- [expert-memory-kernel.md](../expert-memory-big-picture/expert-memory-kernel.md)
- [claims-and-evidence.md](../expert-memory-big-picture/claims-and-evidence.md)
- [expert-memory-control-plane.md](../expert-memory-big-picture/expert-memory-control-plane.md)
- [local-first-v0-architecture.md](../expert-memory-big-picture/local-first-v0-architecture.md)
- [NLP in the Expert-Memory Big Picture for beep-effect](<../expert-memory-big-picture/research/NLP in the Expert-Memory Big Picture for beep-effect.md>)

## Success Condition
This spec succeeds if another engineer can implement a desktop research prototype without making new product-shape decisions about:
- what gets built first
- which runtime owns the business logic
- how the shell talks to the sidecar
- which runtime substrate owns durable lifecycle
- how workflows, streaming, and projections fit together
- what the first UI must do
- how the prototype will be judged
