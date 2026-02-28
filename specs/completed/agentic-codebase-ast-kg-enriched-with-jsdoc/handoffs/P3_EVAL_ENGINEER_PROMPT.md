# P3 Eval Engineer Prompt — Benchmark and Telemetry Wiring

## Mission
Wire benchmark conditions and telemetry so P4 can evaluate correctness, usefulness, and outcome impact against locked targets.

## Inputs
1. `outputs/p2-design/evaluation-design.md`
2. `outputs/p2-design/query-and-hook-contract.md`
3. `outputs/p2-design/rollout-and-fallback-design.md`
4. `handoffs/HANDOFF_P2.md`
5. Reuse anchors:
- `tooling/agent-eval/src/benchmark/*`
- `tooling/agent-eval/src/commands/bench.ts`
- `tooling/agent-eval/src/schemas/*`

## Required Output
1. `outputs/p3-execution/agents/eval-engineer.md`

## Required Checks
1. `baseline` and `kg_hook` conditions are both runnable.
2. Metrics and thresholds align exactly to evaluation-design contract.
3. Latency, relevance, and task-outcome telemetry are emitted for P4 reports.

## Exit Gate
1. Benchmark compare outputs are generated and reproducible.
2. Stage-gate evidence required for rollout is available.
3. No evaluation-layer TBD remains in agent output.
