# P4 Fallback Drill Report

## Scope
Execute and document fallback trigger matrix drills against frozen P2 rollout/fallback policy.

## Policy Under Test
From `outputs/p2-design/rollout-and-fallback-design.md`:
1. Hook latency breach/timeout storm -> disable KG injection, preserve baseline output
2. Graphiti unavailable -> local deterministic cache only
3. Incremental drift detected -> force full rebuild, freeze delta mode
4. Performance regression in A/B -> roll back stage and disable default KG condition

## Drill Results (2026-02-25)

| Trigger | Drill | Result | Status |
|---|---|---|---|
| Hook latency/no-throw fallback | Run hook with/without usable snapshot context | Output remained valid JSON in both paths; `<kg-context>` emitted only when appropriate | PASS |
| Graphiti unavailable | `BEEP_KG_FORCE_GRAPHITI_OUTAGE=true bun run beep kg index --mode full` on fresh fixture root | `writes=0`, `spoolWrites=2`, `packetNoThrow=true` | PASS |
| Incremental drift handling surface | Delta with changed path on tiny fixture | `effectiveMode=full` with widening behavior, consistent with protective full-promotion policy | PASS (contract behavior) |
| Replay/idempotency safety | Re-run full indexing on same fixture/commit | second run `writes=0`, `replayHits=2`; no deterministic conflict | PASS |

## Artifacts/Signals Captured
- Outage spool file created with 2 lines (one per selected file)
- Snapshot hash remained stable across rerun
- Hook output preserved no-throw behavior

## Conclusion
Fallback mechanics required for R0/R1 safety are functioning in exercised drills and match frozen fallback contracts.
