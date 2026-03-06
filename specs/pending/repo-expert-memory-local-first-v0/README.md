# Repo Expert-Memory Local-First V0

## Thesis
This spec defines the first concrete `v0` for the expert-memory direction as a `local-first native research prototype` focused on `repo expert memory only`.

The chosen defaults are locked for this spec set:
- product shape: `local-first native research prototype`
- first domain: `repo expert memory only`
- shell/runtime: `Tauri v2 + Bun + Effect`
- frontend: `React + Vite + TanStack Router`
- backend center of gravity: `sidecar`, not frontend framework
- storage posture: `driver boundary`
- Rust posture: `minimal and contained`
- `apps/server`, `apps/web`, and `apps/mobile` are future direction only, not v0 deliverables

This is a `greenfield, principle-driven` spec. The larger Claude-era tree is architectural guidance, not a package map to reproduce literally.

## Why This V0 Exists
The expert-memory material in [Expert Memory Big Picture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md) and [Local-First V0 Architecture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md) established the high-level thesis.

This folder turns that thesis into a concrete, implementable `v0` for one narrow proving ground:
- a user installs a native desktop app
- the app launches a local Bun sidecar
- the sidecar indexes a TypeScript repo deterministically
- the user asks questions about that repo
- the app returns grounded answers with visible citations and retrieval context

This v0 is intentionally a `research prototype`, not a product-complete application.

## Chosen Defaults
### In scope for v0
- single-user desktop prototype
- local repo registration and indexing
- TypeScript-first deterministic ingestion
- grounded repo question answering
- visible citations and evidence panel
- local persistence of repo-memory artifacts and run artifacts
- sidecar-managed runtime and protocol

### Out of scope for v0
- auth / IAM
- sync or collaboration
- hosted/server deployment
- mobile companion
- full bounded-context lattice (`pages`, `email`, `calendar`, `settings`, etc.)
- broad connector ecosystem beyond what the repo-memory flow needs
- Next.js as a full-stack local server

## Reading Order
1. [TOPOLOGY.md](./TOPOLOGY.md)
2. [SIDECARE_PROTOCOL.md](./SIDECARE_PROTOCOL.md)
3. [VERTICAL_SLICE.md](./VERTICAL_SLICE.md)
4. [EVALUATION_AND_ACCEPTANCE.md](./EVALUATION_AND_ACCEPTANCE.md)
5. [IMPLEMENTATION_BREAKDOWN.md](./IMPLEMENTATION_BREAKDOWN.md)

## Relationship To Upstream Context
This spec is downstream of the big-picture reading set, not a replacement for it.

Use these documents as upstream context when the why behind a v0 decision matters:
- [Expert Memory Big Picture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md)
- [Expert Memory Kernel](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_KERNEL.md)
- [Claims And Evidence](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/CLAIMS_AND_EVIDENCE.md)
- [Local-First V0 Architecture](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md)

## Success Condition
This spec succeeds if another engineer can implement a desktop research prototype without making new product-shape decisions about:
- what gets built first
- which runtime owns the business logic
- how the shell talks to the sidecar
- which packages exist in v0
- what the first UI must do
- how the prototype will be judged
