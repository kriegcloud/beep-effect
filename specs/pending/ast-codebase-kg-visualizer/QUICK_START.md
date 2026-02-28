# Quick Start

> Fast entrypoint for executing the canonical AST KG visualizer spec package.

## What This Spec Delivers

A decision-complete orchestration package for implementing a deterministic KG v1 export path and an authenticated `/kg` D3 visualizer in `apps/web`.

## Current Status

- PRE Contract Alignment + Mapping Freeze: Pending
- P0 Architecture + Gates: Pending
- P1 `kg export` CLI Plan: Pending
- P2 API + Loader Contract: Pending
- P3 D3 UI Contract: Pending
- P4 Performance + E2E Validation: Pending
- P5 Rollout Decision: Pending

## Start Here

1. Read [README.md](./README.md) end-to-end.
2. Read [RUBRICS.md](./RUBRICS.md) and lock phase gates.
3. Execute phases in order from [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md).
4. Update [outputs/manifest.json](./outputs/manifest.json) after each phase.

## Phase Entry Files

| Phase | Handoff | Prompt | Output |
|---|---|---|---|
| PRE | [HANDOFF_PRE.md](./handoffs/HANDOFF_PRE.md) | [PRE_ORCHESTRATOR_PROMPT.md](./handoffs/PRE_ORCHESTRATOR_PROMPT.md) | [p-pre-contract-and-source-alignment.md](./outputs/p-pre-contract-and-source-alignment.md) |
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [p0-architecture-and-gates.md](./outputs/p0-architecture-and-gates.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [p1-kg-export-cli.md](./outputs/p1-kg-export-cli.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [p2-web-api-and-loader.md](./outputs/p2-web-api-and-loader.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [p3-d3-ui-implementation.md](./outputs/p3-d3-ui-implementation.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [p4-performance-and-e2e-validation.md](./outputs/p4-performance-and-e2e-validation.md) |
| P5 | [HANDOFF_P5.md](./handoffs/HANDOFF_P5.md) | [P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md) | [p5-rollout-decision.md](./outputs/p5-rollout-decision.md) |

## Specialist Prompts

- [P1 KG Export Engineer](./handoffs/P1_KG_EXPORT_ENGINEER_PROMPT.md)
- [P2 API Engineer](./handoffs/P2_API_ENGINEER_PROMPT.md)
- [P3 UI Engineer](./handoffs/P3_UI_ENGINEER_PROMPT.md)
- [P4 Perf + E2E Engineer](./handoffs/P4_PERF_E2E_ENGINEER_PROMPT.md)
- [P5 Rollout Engineer](./handoffs/P5_ROLLOUT_ENGINEER_PROMPT.md)

## Required Validation Commands

- `bun run beep docs laws`
- `bun run beep docs skills`
- `bun run beep docs policies`
- `bun run agents:pathless:check`
- `find specs/pending/ast-codebase-kg-visualizer -type f | sort`
- `cat specs/pending/ast-codebase-kg-visualizer/outputs/manifest.json`

## Done Condition

Proceed only when every phase output is present, phase checklists are complete, and `outputs/manifest.json` phase statuses are updated.
