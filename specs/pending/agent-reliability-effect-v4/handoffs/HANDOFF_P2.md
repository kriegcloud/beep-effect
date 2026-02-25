# Handoff P2: Real Benchmark Execution Layer

## Context Budget

| Memory Type | Budget | Estimated | Status |
|---|---|---|---|
| Working | 2,000 | ~1,300 | OK |
| Episodic | 1,000 | ~500 | OK |
| Semantic | 500 | ~300 | OK |
| Procedural | Links | Links | OK |

## Working Context

Phase goal:

1. Implement real-run mode for Codex + Claude.
2. Keep dry-run mode for fast local regression.
3. Enforce initial model pins and runner contract.
4. Add worktree isolation default.

Deliverables:

1. Baseline run artifacts under `outputs/agent-reliability/runs/`.
2. `outputs/agent-reliability/baseline-report.md`.
3. `outputs/p2-runner-contract.md`.

Exit gate:

1. Baseline A/B (`current` vs `minimal`) completed with measured deltas.

## Episodic Context

1. P1 refactor should already have moved FS/path operations to Effect services.
2. Deterministic run matrix and schema compatibility should already be in place.

## Semantic Context

1. Run contract: 18 tasks x 4 conditions x 2 agents x 2 trials = 288 runs.
2. Live commands: `codex exec --json`, `claude -p --output-format json`.
3. Safety checks and wrong-API critical incidents gate run success.

## Procedural Context

1. Use spec guide and handoff standards in `.repos/beep-effect/specs/_guide/`.
2. Keep source-truth contract from `outputs/p0-source-of-truth-contract.md`.
