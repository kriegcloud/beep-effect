# P3 Slice Implementation

## Purpose

P3 converts the deterministic runtime data-loop proof into executable package
topology without adding persistence, UI, real connectors, or real LLM calls.

## Implemented Topology

The first real slice packages are:

- `@beep/shared-domain`
- `@beep/workspace-domain`
- `@beep/epistemic-domain`
- `@beep/agents-domain`
- `@beep/agents-use-cases`
- `@beep/law-practice-domain`
- `@beep/wealth-management-domain`

The app-level proof harness is:

- `@beep/professional-runtime-proof`

## Boundary Shape

- Shared-domain owns the canonical organization, user, and membership language.
  Slice domain packages define schema-first models with repo-native positive
  integer entity IDs.
- Readable fixture keys remain in the proof harness mapping layer.
- `@beep/agents-use-cases/public` exposes the SDK-facing context
  packet and candidate output-set contracts.
- `@beep/agents-use-cases/proof` exposes the deterministic fixture
  runner used by the proof app; `/test` re-exports it for package tests.
- Law and wealth packages remain context-only. They do not own runtime workflow
  orchestration yet.
- The proof harness composes the slices at the app boundary and imports both
  product verticals only from there.

## Executable Proof

The app-level test runs both P2 fixture scenarios:

```sh
bun run --cwd apps/professional-runtime-proof test
```

The test proves:

- fixture seeds decode into domain models
- readable fixture keys map to repo-native entity IDs
- normalized email artifacts decode into workspace models
- deterministic agent output matches the expected claim, task, draft, approval,
  and context-packet snapshots
- candidate outputs decode into workspace and epistemic models

## Deferred

- Drizzle or PGlite tables
- production repositories
- real email connector execution
- real LLM extraction
- native review UI
- tenancy lifecycle use-cases, repositories, and adapters
