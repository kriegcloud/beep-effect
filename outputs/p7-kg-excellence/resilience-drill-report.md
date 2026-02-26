# Resilience Drill Report

## Drill Matrix

| Scenario | Group | Expected | Outcome | Evidence |
|---|---|---|---|---|
| Falkor outage during dual-write replay | `beep-ast-kg-drill-falkor-20260226T005052Z` | Falkor fails, Graphiti continues | PASS | `outputs/p7-kg-excellence/evidence/20260226T005052Z-drill-falkor-outage.json` |
| Falkor outage recovery replay | `beep-ast-kg-drill-falkor-20260226T005052Z` | Missing Falkor writes recover; Graphiti dedupes | PASS | `outputs/p7-kg-excellence/evidence/20260226T005052Z-drill-falkor-recovery.json`, `outputs/p7-kg-excellence/evidence/20260226T005052Z-drill-falkor-recovery-verify.json` |
| Graphiti outage during dual-write replay | `beep-ast-kg-drill-graphiti-20260226T005052Z` | Replay fails on Graphiti init; Falkor side remains queryable for commit/group | PASS | `outputs/p7-kg-excellence/evidence/20260226T005052Z-drill-graphiti-outage.log`, `outputs/p7-kg-excellence/evidence/20260226T005052Z-drill-graphiti-outage-falkor-verify.json` |
| Graphiti outage recovery replay | `beep-ast-kg-drill-graphiti-20260226T005052Z` | Falkor dedupes, Graphiti writes recover | PASS | `outputs/p7-kg-excellence/evidence/20260226T005052Z-drill-graphiti-recovery.json` |
| Parallel-clone burst through queue proxy | host-local shared proxy | No request loss under burst; queue depth rises without upstream failure | PASS | `outputs/p7-kg-excellence/evidence/20260226T010710Z-graphiti-proxy-queue-drill.json` |

## Key Metrics

### Falkor outage run
- Falkor: attempted 244, written 0, failed 244.
- Graphiti: attempted 244, written 244, failed 0.

### Falkor recovery run
- Falkor: attempted 244, written 244, failed 0.
- Graphiti: replayed 244, dedupeHits 244, failed 0.

### Graphiti outage run
- Expected CLI failure confirmed (`ConnectionRefused` at `http://127.0.0.1:65534/mcp`).
- Falkor verification after failure: fileCount 244, commitCount 1 for outage group.

### Graphiti recovery run
- Falkor: replayed 244, dedupeHits 244.
- Graphiti: written 244, failed 0.

### Queue proxy burst run
- Burst: 20 concurrent initialize requests routed through proxy.
- Responses: 20/20 HTTP 200.
- Proxy metrics: peakQueueDepth 18, processed 20, failed 0, rejected 0.

## Decision
Outage and recovery drills are repeatable across sink failures, and queue-based routing absorbs local parallel clone bursts without request loss: **PASS**.
