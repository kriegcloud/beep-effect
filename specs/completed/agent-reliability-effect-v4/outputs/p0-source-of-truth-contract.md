# P0 Source-of-Truth Contract

## Effect API Truth

Effect v4 API and migration decisions are constrained to:

1. `.repos/effect-smol/LLMS.md`
2. `.repos/effect-smol/MIGRATION.md`
3. `specs/completed/effect-v4-knowledge-graph/outputs/p6-verification/report.md`
4. Graphiti `group_id: effect-v4`

No external Effect API sources are used for authoritative migration decisions.

## Repo Memory Truth

Operational repository memory is stored/retrieved via Graphiti:

- `group_id: beep-dev`

## Enforcement Rules

1. Detector and correction index entries must map back to source items above.
2. Policy/skill prompts must not introduce unverified API claims.
3. Promotion decisions are benchmark-gated, not intuition-gated.
