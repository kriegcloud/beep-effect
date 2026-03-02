# Quick Start

> Fast entrypoint for executing the JSDoc-enriched AST KG impact-readiness spec.

## What This Spec Delivers

A decision-complete path to answer one question with evidence:

"Does JSDoc-enriched AST KG materially improve coding-agent outcomes in this repository?"

Before answering that, it first hardens CLI structure and Claude execution integration.

## Current Status

- PRE KG CLI Refactor + AI SDK Integration: Pending
- P0 Baseline and Gates: Pending
- P1 JSDoc Governance: Pending
- P2 Retrieval Reliability: Pending
- P3 Semantic Coverage: Pending
- P4 Ablation Benchmark: Pending
- P5 Rollout Decision: Pending

## Start Here

1. Read [README.md](./README.md) end-to-end.
2. Read [RUBRICS.md](./RUBRICS.md) and lock all thresholds.
3. Execute phases in order using [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md).
4. Update [outputs/manifest.json](./outputs/manifest.json) after each phase.

## Phase Entry Files

| Phase | Handoff | Prompt | Output |
|---|---|---|---|
| PRE | [HANDOFF_PRE.md](./handoffs/HANDOFF_PRE.md) | [PRE_ORCHESTRATOR_PROMPT.md](./handoffs/PRE_ORCHESTRATOR_PROMPT.md) | [p-pre-kg-cli-refactor-and-ai-sdk.md](./outputs/p-pre-kg-cli-refactor-and-ai-sdk.md) |
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [p0-baseline-and-gates.md](./outputs/p0-baseline-and-gates.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [p1-jsdoc-governance.md](./outputs/p1-jsdoc-governance.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [p2-retrieval-reliability.md](./outputs/p2-retrieval-reliability.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [p3-semantic-coverage.md](./outputs/p3-semantic-coverage.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [p4-ablation-benchmark.md](./outputs/p4-ablation-benchmark.md) |
| P5 | [HANDOFF_P5.md](./handoffs/HANDOFF_P5.md) | [P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md) | [p5-rollout-decision.md](./outputs/p5-rollout-decision.md) |

## Required Validation Commands

- `bun run --cwd tooling/cli test -- kg.test.ts`
- `bunx turbo run check --filter=@beep/ai-sdk`
- `bunx turbo run lint --filter=@beep/ai-sdk`
- `bunx turbo run test --filter=@beep/ai-sdk`
- `bun run beep kg verify --target both --group beep-ast-kg`
- `bun run beep kg parity --profile code-graph-functional --group beep-ast-kg`
- `bun run agent:bench --live`
- `bun run check`
- `bun run lint`
- `bun run test`
