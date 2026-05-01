# P3 Slice Implementation

## Purpose

P3 converts the deterministic runtime data-loop proof into executable package
topology without adding persistence, UI, real connectors, or real LLM calls.

## Implemented Topology

The first real slice packages are:

- `@beep/tenancy-domain`
- `@beep/workspace-domain`
- `@beep/epistemic-domain`
- `@beep/agent-capability-domain`
- `@beep/agent-capability-use-cases`
- `@beep/law-practice-domain`
- `@beep/wealth-management-domain`

The app-level proof harness is:

- `@beep/professional-runtime-proof`

## Boundary Shape

- Domain packages define schema-first models with repo-native positive integer
  entity IDs and readable fixture keys.
- `@beep/agent-capability-use-cases/public` exposes the SDK-facing context
  packet and candidate output-set contracts.
- `@beep/agent-capability-use-cases/test` exposes the deterministic fixture
  runner.
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
- shared-kernel promotion beyond existing references
