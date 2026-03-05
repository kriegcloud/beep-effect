# Master Orchestration

## Objective

Execute a strict evidence program that can promote or reject JSDoc-enriched AST KG as a production-grade agent capability for this repository, with a mandatory pre-phase for tooling hardening.

## Command-First Discovery

Run before any phase execution:

1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`

## Phase Plan

## PRE: KG CLI Modularization + AI SDK Integration

- Owner: Orchestrator + CLI Refactor Engineer + SDK Integration Engineer
- Deliverable: [outputs/p-pre-kg-cli-refactor-and-ai-sdk.md](./outputs/p-pre-kg-cli-refactor-and-ai-sdk.md)
- Required inputs:
  - [README.md](./README.md)
  - [tooling/cli/src/commands/kg.ts](/home/elpresidank/YeeBois/projects/beep-effect3/tooling/cli/src/commands/kg.ts)
  - [tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts](/home/elpresidank/YeeBois/projects/beep-effect3/tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts)
  - [packages/ai/sdk/README.md](/home/elpresidank/YeeBois/projects/beep-effect3/packages/ai/sdk/README.md)
- Exit criteria:
  - Modularization plan for `kg.ts` is decision-complete.
  - Effect-first rules for refactor are explicit.
  - `@beep/ai-sdk` Claude integration contract is locked.

## P0: Baseline and Gate Freeze

- Owner: Orchestrator
- Deliverable: [outputs/p0-baseline-and-gates.md](./outputs/p0-baseline-and-gates.md)
- Required inputs:
  - [outputs/p-pre-kg-cli-refactor-and-ai-sdk.md](./outputs/p-pre-kg-cli-refactor-and-ai-sdk.md)
  - [RUBRICS.md](./RUBRICS.md)
  - [outputs/initial_plan.md](./outputs/initial_plan.md)
- Exit criteria:
  - All thresholds are frozen.
  - Data contracts for retrieval and benchmark evaluation are explicit.

## P1: JSDoc Governance Contract

- Owner: Orchestrator + Governance Engineer
- Deliverable: [outputs/p1-jsdoc-governance.md](./outputs/p1-jsdoc-governance.md)
- Required inputs:
  - [outputs/p0-baseline-and-gates.md](./outputs/p0-baseline-and-gates.md)
  - existing jsdoc/lint config in repo
- Exit criteria:
  - Required semantic tags are defined by scope.
  - CI enforcement and stale-doc policy are locked.

## P2: Retrieval Reliability Hardening

- Owner: Orchestrator + Reliability Engineer
- Deliverable: [outputs/p2-retrieval-reliability.md](./outputs/p2-retrieval-reliability.md)
- Required inputs:
  - [outputs/p0-baseline-and-gates.md](./outputs/p0-baseline-and-gates.md)
  - [outputs/p1-jsdoc-governance.md](./outputs/p1-jsdoc-governance.md)
- Exit criteria:
  - Timeout budget, retry policy, and fallback behavior are measured and verified.
  - No-throw behavior is proven under outage/timeout drills.

## P3: Semantic Coverage and Quality

- Owner: Orchestrator + Semantic Quality Engineer
- Deliverable: [outputs/p3-semantic-coverage.md](./outputs/p3-semantic-coverage.md)
- Required inputs:
  - [outputs/p1-jsdoc-governance.md](./outputs/p1-jsdoc-governance.md)
- Exit criteria:
  - Parse success, precision, and recall are measured on labeled data.
  - Coverage target for scoped modules is achieved or explicitly failed with root cause.

## P4: Live Ablation Benchmark

- Owner: Orchestrator + Benchmark Engineer
- Deliverable: [outputs/p4-ablation-benchmark.md](./outputs/p4-ablation-benchmark.md)
- Required inputs:
  - [outputs/p2-retrieval-reliability.md](./outputs/p2-retrieval-reliability.md)
  - [outputs/p3-semantic-coverage.md](./outputs/p3-semantic-coverage.md)
- Exit criteria:
  - Four-mode ablation is complete (`baseline`, `semantic_only`, `ast_only`, `ast_jsdoc_hybrid`).
  - Claude run path in benchmark harness is `@beep/ai-sdk`.
  - All gate metrics are reported with deltas and confidence notes.

## P5: Rollout Decision and Runbook

- Owner: Orchestrator + Rollout Engineer
- Deliverable: [outputs/p5-rollout-decision.md](./outputs/p5-rollout-decision.md)
- Required inputs:
  - [outputs/p4-ablation-benchmark.md](./outputs/p4-ablation-benchmark.md)
  - [RUBRICS.md](./RUBRICS.md)
- Exit criteria:
  - Explicit go/no-go decision.
  - Staged rollout and rollback policy captured.

## Operational Rules

1. Do not move to next phase with unresolved blocker from current phase.
2. Record all deviations from plan in [REFLECTION_LOG.md](./REFLECTION_LOG.md).
3. Keep evidence reproducible with command snippets and timestamps.
4. If a metric is unavailable, explicitly mark as blocked and explain why.
5. PRE phase is mandatory and cannot be skipped.

## Completion Rule

The orchestration is complete only when [outputs/p5-rollout-decision.md](./outputs/p5-rollout-decision.md) contains a strict gate-by-gate pass/fail table and a final recommendation.
