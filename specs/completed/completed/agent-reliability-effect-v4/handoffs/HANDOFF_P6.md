# Handoff P6: Console + Playbook + Promotion Lock

## Context Budget

| Memory Type | Budget | Estimated | Status |
|---|---|---|---|
| Working | 2,000 | ~1,100 | OK |
| Episodic | 1,000 | ~450 | OK |
| Semantic | 500 | ~350 | OK |
| Procedural | Links | Links | OK |

## Working Context

Phase goal:

1. Build minimal reliability console in `apps/web`.
2. Publish `docs/agent-reliability-playbook.md`.
3. Enforce promotion policy requiring benchmark gain or documented exception.
4. Produce day-90 scorecard.

Deliverables:

1. `apps/web/src/app/agent-reliability/` implementation.
2. `docs/agent-reliability-playbook.md`.
3. `outputs/p6-final-scorecard.md`.

Exit gate:

1. Day-90 criteria evaluated and documented.

## Episodic Context

1. KG loop and adaptive runner metrics should be stable before UI/productization work.

## Semantic Context

1. Reliability-first remains the primary objective.
2. Promotion lock policy is mandatory for post-phase operation.

## Procedural Context

1. Keep UI scope intentionally minimal and operationally focused.
2. Playbook should encode weekly cadence and promotion governance.
