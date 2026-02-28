# Agent Prompts

## PRE Orchestrator Prompt

Define and lock pre-phase implementation details for refactoring `kg.ts` and integrating Claude execution through `@beep/ai-sdk`.

Write:

- `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md`

Must include:

- `kg.ts` module split map and ownership
- Effect-first migration rules and banned patterns
- typed tooling error model plan
- benchmark Claude executor migration plan (`@anthropic-ai/claude-agent-sdk` -> `@beep/ai-sdk`)
- parity verification strategy before/after refactor

## P0 Orchestrator Prompt

Freeze the baseline and all success gates for evaluating JSDoc-enriched AST KG impact.

Write:

- `outputs/p0-baseline-and-gates.md`

Must include:

- metric names
- exact thresholds
- measurement method
- evidence source per metric
- blocked-metric policy

## P1 Orchestrator Prompt

Define and lock the JSDoc semantic governance contract for high-value modules.

Write:

- `outputs/p1-jsdoc-governance.md`

Must include:

- required tag set and syntax
- lint enforcement strategy
- stale-doc detection rule
- scope rollout order

## P2 Orchestrator Prompt

Harden and verify retrieval reliability for agent runtime usage.

Write:

- `outputs/p2-retrieval-reliability.md`

Must include:

- timeout budget and retry profile
- fallback behavior under Graphiti timeout
- no-throw guarantee proof
- outage drill evidence

## P3 Orchestrator Prompt

Measure semantic coverage and semantic edge quality on a labeled set.

Write:

- `outputs/p3-semantic-coverage.md`

Must include:

- parse success rate
- semantic edge precision
- semantic edge recall
- scoped coverage heatmap

## P4 Orchestrator Prompt

Run live four-way ablation benchmark and report comparative outcomes.

Write:

- `outputs/p4-ablation-benchmark.md`

Must include:

- `baseline` vs `semantic_only` vs `ast_only` vs `ast_jsdoc_hybrid`
- task success delta
- wrong-API/hallucination delta
- first-pass check/lint delta
- median cost delta
- explicit evidence that Claude backend is executed via `@beep/ai-sdk`

## P5 Orchestrator Prompt

Make final rollout recommendation using locked rubrics.

Write:

- `outputs/p5-rollout-decision.md`

Must include:

- gate-by-gate pass/fail matrix
- final go/no-go decision
- staged rollout plan
- rollback triggers
