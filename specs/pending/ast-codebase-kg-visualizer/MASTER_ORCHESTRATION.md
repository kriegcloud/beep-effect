# Master Orchestration

## Objective

Execute a strict, evidence-backed program that upgrades AST KG visualizer work from sample artifacts into a canonical repository implementation contract.

## Command-First Discovery

Run before any phase execution:

1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`

## Phase Plan

## PRE: Contract Alignment + Mapping Freeze

- Owner: Orchestrator
- Deliverable: [outputs/p-pre-contract-and-source-alignment.md](./outputs/p-pre-contract-and-source-alignment.md)
- Required inputs:
  - [README.md](./README.md)
  - [tooling/cli/src/commands/kg.ts](../../../tooling/cli/src/commands/kg.ts)
  - [outputs/kg-bundle/README.md](./outputs/kg-bundle/README.md)
  - [outputs/kg-bundle/sample-graph-v2.json](./outputs/kg-bundle/sample-graph-v2.json)
- Exit criteria:
  - source-of-truth alignment complete
  - immutable mapping tables complete
  - command/evidence contract frozen for P0..P5

## P0: Architecture + Gates Freeze

- Owner: Orchestrator
- Deliverable: [outputs/p0-architecture-and-gates.md](./outputs/p0-architecture-and-gates.md)
- Required inputs:
  - [outputs/p-pre-contract-and-source-alignment.md](./outputs/p-pre-contract-and-source-alignment.md)
  - [RUBRICS.md](./RUBRICS.md)
- Exit criteria:
  - CLI/API/UI file boundaries frozen
  - acceptance gates frozen
  - no open architecture decisions (`TBD=0`)

## P1: KG Export CLI

- Owner: Orchestrator + KG Export Engineer
- Deliverable: [outputs/p1-kg-export-cli.md](./outputs/p1-kg-export-cli.md)
- Required inputs:
  - [outputs/p0-architecture-and-gates.md](./outputs/p0-architecture-and-gates.md)
  - [tooling/cli/src/commands/kg.ts](../../../tooling/cli/src/commands/kg.ts)
  - [tooling/cli/test/kg.test.ts](../../../tooling/cli/test/kg.test.ts)
- Exit criteria:
  - command contract frozen
  - deterministic export strategy documented
  - unit test matrix complete

## P2: API + Loader

- Owner: Orchestrator + API Engineer
- Deliverable: [outputs/p2-web-api-and-loader.md](./outputs/p2-web-api-and-loader.md)
- Required inputs:
  - [outputs/p1-kg-export-cli.md](./outputs/p1-kg-export-cli.md)
  - [apps/web/src/app/api/graph/search/route.ts](../../../apps/web/src/app/api/graph/search/route.ts)
- Exit criteria:
  - typed API response contracts frozen
  - missing/malformed export handling frozen
  - API test plan complete

## P3: `/kg` D3 UI

- Owner: Orchestrator + UI Engineer
- Deliverable: [outputs/p3-d3-ui-implementation.md](./outputs/p3-d3-ui-implementation.md)
- Required inputs:
  - [outputs/p2-web-api-and-loader.md](./outputs/p2-web-api-and-loader.md)
  - [outputs/kg-bundle/visualize-v2.html](./outputs/kg-bundle/visualize-v2.html)
  - existing graph components under `apps/web/src/components/graph`
- Exit criteria:
  - component architecture frozen
  - interaction contract frozen
  - accessibility expectations frozen

## P4: Performance + E2E Validation

- Owner: Orchestrator + Performance/E2E Engineer
- Deliverable: [outputs/p4-performance-and-e2e-validation.md](./outputs/p4-performance-and-e2e-validation.md)
- Required inputs:
  - [outputs/p3-d3-ui-implementation.md](./outputs/p3-d3-ui-implementation.md)
  - [playwright.config.ts](../../../playwright.config.ts)
  - [e2e/smoke.spec.ts](../../../e2e/smoke.spec.ts)
- Exit criteria:
  - unit + API + E2E checks defined and executed
  - scale gate evidence captured
  - regressions and mitigations documented

## P5: Rollout Decision + Runbook

- Owner: Orchestrator + Rollout Engineer
- Deliverable: [outputs/p5-rollout-decision.md](./outputs/p5-rollout-decision.md)
- Required inputs:
  - [outputs/p4-performance-and-e2e-validation.md](./outputs/p4-performance-and-e2e-validation.md)
  - [RUBRICS.md](./RUBRICS.md)
- Exit criteria:
  - go/limited-go/no-go decision is explicit
  - rollback triggers are explicit
  - operational runbook actions are explicit

## Operational Rules

1. Do not advance phases with unresolved blockers from the current phase.
2. Record deviations and corrections in [REFLECTION_LOG.md](./REFLECTION_LOG.md).
3. Keep evidence reproducible with command snippets and timestamps.
4. Preserve `outputs/kg-bundle/*` as frozen reference artifacts.
5. Keep `/kg` additive; do not replace existing `/(app)/page.tsx` behavior in this workstream.

## Completion Rule

Orchestration is complete only when [outputs/p5-rollout-decision.md](./outputs/p5-rollout-decision.md) contains a gate-by-gate verdict and a final recommendation supported by captured evidence.
