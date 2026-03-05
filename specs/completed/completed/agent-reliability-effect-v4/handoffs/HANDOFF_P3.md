# Handoff P3: Adaptive Overlay and Skill Enforcement

## Context Budget

| Memory Type | Budget | Estimated | Status |
|---|---|---|---|
| Working | 2,000 | ~1,000 | OK |
| Episodic | 1,000 | ~450 | OK |
| Semantic | 500 | ~300 | OK |
| Procedural | Links | Links | OK |

## Working Context

Phase goal:

1. Enforce immutable core + task-aware overlays.
2. Cap active focused skills to max 3 deterministically.
3. Remove broad always-on instruction fanout.
4. Run A/B and capture adaptive delta.

Deliverables:

1. Weekly benchmark report artifacts.
2. `outputs/p3-adaptive-ab-report.md`.

Exit gate:

1. `adaptive` beats `current`, or lowers wrong-API incidents without safety regression.

## Episodic Context

1. P2 produced baseline run contract and baseline report.
2. Existing overlays and skills are present in `.agents/policies` and `.agents/skills/effect-v4-*`.

## Semantic Context

1. Core legal constraints remain in `AGENTS.md` and `standards/effect-laws-v1.md`.
2. Promotion remains benchmark-gated.

## Procedural Context

1. Reuse deterministic selection and packet-capping logic.
2. Do not expand skill fanout beyond 3 modules.
