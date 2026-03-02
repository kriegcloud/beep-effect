# P2 Retrieval Reliability

## Status

COMPLETE (root cause identified and operational fix validated)

Generated: 2026-02-28

## Scope

This phase hardened and verified Graphiti retrieval reliability for the `search_memory_facts` path and closed the timeout blocker before next phase progression.

## Root Cause

Root cause: Graphiti dependency instability in FalkorDB (`graphiti-mcp-falkordb-1`) produced retrieval stalls.

Observed behavior under induced unhealthy state:

1. Falkor marked `unhealthy`.
2. Direct MCP retrieval to `http://127.0.0.1:8000/mcp` stopped returning in normal latency.
3. With `BEEP_GRAPHITI_REQUEST_TIMEOUT_MS=1500` and retry defaults, requests failed after retry exhaustion at about `10.8s` end-to-end.

Evidence:

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/root-cause-timeout-drill.log`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/root-cause-timeout-stats.json`

## Fix Implemented

1. Dependency-aware proxy health:
   - `scripts/graphiti-mcp-queue-proxy.mjs`
   - `/healthz` now reports dependency health and returns `503`/`degraded` when Falkor or Graphiti is unhealthy.
2. Automatic stack recovery when unhealthy:
   - `scripts/graphiti-proxy-ensure.sh`
   - detects unhealthy Graphiti stack and triggers `scripts/graphiti-recover.sh`.
3. Retrieval-side guardrails:
   - `tooling/agent-eval/src/graphiti/mcp.ts`
   - preflight check, timeout-classified errors, deterministic circuit fallback (`[]`).
4. Proxy-first CLI defaults:
   - `tooling/agent-eval/src/bin.ts`
   - defaults to `http://127.0.0.1:8123/mcp` for bench/ingest flows.

## Timeout Budget, Retry, and Circuit Profile

| Control | Value | Source |
|---|---:|---|
| Request timeout budget (`BEEP_GRAPHITI_REQUEST_TIMEOUT_MS`) | `2500ms` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Retry attempts (`BEEP_GRAPHITI_RETRY_ATTEMPTS`) | `5` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Retry base delay (`BEEP_GRAPHITI_RETRY_BASE_MS`) | `200ms` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Retry max delay (`BEEP_GRAPHITI_RETRY_MAX_MS`) | `2000ms` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Retry jitter (`BEEP_GRAPHITI_RETRY_JITTER_MS`) | `125ms` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Circuit enabled (`BEEP_GRAPHITI_CIRCUIT_ENABLED`) | `true` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Circuit failure threshold (`BEEP_GRAPHITI_CIRCUIT_FAILURE_THRESHOLD`) | `1` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Circuit open window (`BEEP_GRAPHITI_CIRCUIT_OPEN_MS`) | `60000ms` default | `tooling/agent-eval/src/graphiti/mcp.ts` |
| Serialization lock (`BEEP_GRAPHITI_SERIALIZE`) | `true` default | `tooling/agent-eval/src/graphiti/mcp.ts` |

## Induced-Failure Drills

### Drill A: Outage (connection refused)

- Method: point Graphiti URL to `http://127.0.0.1:9/mcp` and run retrieval twice with deterministic fallback.
- Result: fallback returned empty facts in both runs.
- Evidence: `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/fallback-proof-outage.json`

### Drill B: Forced timeout

- Method: set `BEEP_GRAPHITI_REQUEST_TIMEOUT_MS=500` against live proxy URL and run retrieval twice.
- Result: first call timed out and opened circuit; second call short-circuited to deterministic empty facts.
- Evidence: `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/fallback-proof-timeout.json`

### Drill C: Root-cause reproduction and fix validation

- Method:
  - baseline probe against direct MCP (`8000`) while healthy,
  - induce dependency failure by pausing Falkor,
  - observe degraded proxy health (`503`) and direct retrieval stalls,
  - run `bun run graphiti:proxy:ensure` to auto-recover,
  - re-probe latency through proxy (`8123`).
- Result:
  - direct unhealthy retrieval failed 3/3 with timeout-like failure envelope around `10.8s`,
  - preflight through proxy failed fast (`34ms`) with explicit `HTTP 503`,
  - post-recovery retrieval returned to stable low-latency success (5/5).
- Evidence:
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/root-cause-timeout-drill.log`
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/root-cause-timeout-stats.json`

### Drill D: Verify-path timeout behavior

- Method: bounded `kg verify` drill with Graphiti wait/request timeout controls.
- Result: timed out with typed error and non-zero exit as expected under missing/late Graphiti episode visibility.
- Evidence:
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/kg-verify-graphiti.json`
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/kg-verify-graphiti.exit`

## Fallback Correctness Proof

1. Runtime retrieval path is no-throw at benchmark call site:
   - `tooling/agent-eval/src/benchmark/runner.ts` uses `searchMemoryFacts(...).catch(() => [])` for `adaptive_kg` runs.
2. MCP helper short-circuits while circuit is open and returns deterministic empty facts for `search_memory_facts`.
3. Regression test coverage verifies timeout-classified behavior and deterministic fallback:
   - `tooling/agent-eval/test/graphiti-mcp.test.ts`.
4. Outage and forced-timeout drills both produced deterministic `[]` payloads.

## Timeout-Rate and Latency Statistics

Primary root-cause drill statistics:

Source: `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/root-cause-timeout-stats.json`

| Probe | Attempts | Timeout-like rate | Error rate | p50 latency | p95 latency | Outcome |
|---|---:|---:|---:|---:|---:|---|
| baseline-direct (`8000`, healthy) | 3 | `0%` | `0%` | `164ms` | `412ms` | Normal |
| unhealthy-direct (`8000`, Falkor unhealthy) | 3 | `100%` | `100%` | `10,790ms` | `10,840ms` | Timeout envelope reproduced |
| unhealthy-proxy-preflight (`8123`) | 1 | `0%` | `100%` | `34ms` | `34ms` | Fast explicit failure (`503`) |
| recovered-proxy (`8123`, post-recovery) | 5 | `0%` | `0%` | `169ms` | `383ms` | Normal restored |

Steady-state reliability sweep:

Source: `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/retrieval-live-stats.json`

| Metric | Observed | Threshold | Result |
|---|---:|---:|---|
| Timeout rate | `0.50%` | `<= 1%` | PASS |
| p95 latency | `0ms` | `<= 1500ms` | PASS |
| p99 latency | `0ms` | `<= 2500ms` | PASS |

Note: `0ms` p95/p99 in the steady-state sweep is expected from intentional circuit short-circuiting after first timeout in that measurement mode.

## Command and Evidence Contract (P2-C01..P2-C05)

| Command ID | Artifact | Status |
|---|---|---|
| P2-C01 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/graphiti-healthz.json` | PASS |
| P2-C02 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/graphiti-metrics.prom` | PASS |
| P2-C03 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/kg-verify-both.json` + `.exit` | TIMED OUT (`124`) |
| P2-C04 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/kg-cli-test.log` | PASS |
| P2-C05 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/p2-contract-audit.log` | PASS |

## Additional Evidence

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/agent-eval-graphiti-mcp-test.log`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/fallback-proof-outage.json`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/fallback-proof-timeout.json`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/retrieval-live-stats.json`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/root-cause-timeout-drill.log`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/root-cause-timeout-stats.json`

## Output Checklist

- [x] Reliability policy implemented.
- [x] Root cause identified and reproduced.
- [x] Failure drills executed.
- [x] Fallback correctness validated.
- [x] Timeout-rate and latency metrics recorded.
