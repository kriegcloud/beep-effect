# P7-T6 Dual-Write Resilience Drill Report

## Objective
Execute repeatable outage drills for Falkor outage, Graphiti outage, and partial-write recovery.

## Drill Matrix

| Drill | Command Path | Expected | Observed | Status |
|---|---|---|---|---|
| Graphiti outage fallback | `BEEP_KG_FORCE_GRAPHITI_OUTAGE=true beep kg index --mode full` | No throw, spool capture | `packetNoThrow=true`, `spoolWrites=509` | PASS |
| Falkor outage during dual-write replay | `BEEP_FALKOR_CONTAINER=<missing> beep kg replay --target both` | Falkor failures, Graphiti continues | Falkor `failed=1018`; Graphiti `written=509`, `replayed=509`, `failed=0` | PASS |
| Partial write recovery replay | replay again with healthy Falkor on same group | Missing sink catches up, healthy sink dedupes | Falkor `written=509`, `replayed=509`; Graphiti `written=0`, `replayed=1018` | PASS |

## Evidence Packet
- Graphiti outage index: `outputs/p7-kg-excellence/evidence/20260228T110010Z-drill-graphiti-outage-index-full.json`
- Falkor outage replay: `outputs/p7-kg-excellence/evidence/20260228T110010Z-drill-falkor-outage-replay-both.json`
- Recovery replay: `outputs/p7-kg-excellence/evidence/20260228T110010Z-drill-recovery-replay-both.json`
- Drill metadata: `outputs/p7-kg-excellence/evidence/20260228T110010Z-drill.meta.txt`

## Notes
- Replay attempted `1018` envelopes because the spool contained two `509`-envelope batches for the same commit; dedupe counters confirmed deterministic sink behavior.

## Acceptance Check
- Falkor outage drill executed: **PASS**
- Graphiti outage fallback drill executed: **PASS**
- Partial write recovery drill executed with evidence: **PASS**

