# P0 Benchmark Protocol (Locked)

## Fixed Parameters

1. Task count: 18 exactly.
2. Agents: `codex`, `claude`.
3. Conditions: `current`, `minimal`, `adaptive`, `adaptive_kg`.
4. Trials: 2 per task/agent/condition tuple.
5. Full run count: 288.

## Success Rule

A run is successful only if:

1. All acceptance commands pass.
2. Critical wrong-API incident count is zero.
3. Touched-path allowlist is respected.

## Promotion Rule

A policy/config change is promotable only if:

1. Aggregate success rate improves, or
2. Wrong-API incidents decrease,

and

3. No regression in check/lint/test/docgen safety checks.

## Cadence

1. Monday: subset run + top 3 failure signatures.
2. Tue/Wed: one targeted policy/skill/detector change.
3. Thursday: A/B rerun.
4. Friday: Graphiti episode + lab note.
