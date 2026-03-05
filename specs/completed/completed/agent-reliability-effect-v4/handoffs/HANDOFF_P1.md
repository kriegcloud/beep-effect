# Handoff P1: Harness Hardening

## Context Budget

| Memory Type | Budget | Estimated | Status |
|---|---|---|---|
| Working | 2,000 | ~1,200 | OK |
| Episodic | 1,000 | ~500 | OK |
| Semantic | 500 | ~350 | OK |
| Procedural | Links | Links | OK |

## Working Context

Phase goal:

1. Refactor `tooling/agent-eval` in place.
2. Replace `node:fs` and `node:path` usage in `src/**` with `effect/FileSystem` and `effect/Path`.
3. Move Node layer provisioning to CLI boundary only.
4. Replace nested benchmark loops with deterministic matrix execution.

Deliverables:

1. Refactored harness code.
2. `outputs/p1-harness-design.md`.
3. `outputs/p1-effect-v4-verification.md`.

Exit gate:

1. `tooling/agent-eval` passes `check`, `lint`, `test`, `docgen`.

## Episodic Context

1. P0 scaffold and source-truth contract are complete.
2. Existing scaffold is functional but uses Node fs/path and imperative loop tower.
3. Policy overlays and focused skills already exist and should be reused.

## Semantic Context

Constants:

1. Truth source for Effect API decisions is local-only (`.repos/effect-v4` + Graphiti effect-v4).
2. Benchmark protocol is fixed: 18 tasks, 2 agents, 4 conditions, 2 trials.
3. Promotion decisions are benchmark-gated.

## Procedural Context

1. Spec guide: `.repos/beep-effect/specs/_guide/README.md`
2. Handoff standards: `.repos/beep-effect/specs/_guide/HANDOFF_STANDARDS.md`
3. Effect migration references: `.repos/effect-v4/MIGRATION.md`
