# Agent Performance Improvement Plan (P8 Candidate)

## Baseline Snapshot (Evidence-Backed)
- Falkor full-publish runtime dropped from `1,346,707 ms` to `15,551 ms` (98.85% faster) per `outputs/p7-kg-excellence/falkor-batching-report.md` and `outputs/p7-kg-excellence/evidence/20260226T004744Z-fullrepo-publish-both.json`.
- Final rerun remained stable with zero sink failures and mixed write/replay behavior: `outputs/p7-kg-excellence/evidence/20260226T020435Z-final2-publish-both.json`.
- The dominant remaining latency is Graphiti visibility during verify, not publish:
  - Graphiti publish `1,211 ms` vs verify wait `109,443 ms` in `outputs/p7-kg-excellence/evidence/20260226T012316Z-verify-fix-publish-graphiti.json` + `outputs/p7-kg-excellence/evidence/20260226T012316Z-verify-fix-verify-graphiti.json` (~90.37x).
  - Graphiti publish `1,542 ms` vs verify wait `68,271 ms` in final rerun artifacts (~44.27x).
- Strict parity currently passes entirely via fallback (`eligibleCallEdges: 0`, `observedPaths: 0`) in all strict artifacts:
  - `outputs/p7-kg-excellence/evidence/20260226T004554Z-fullrepo-parity-strict.json`
  - `outputs/p7-kg-excellence/evidence/20260226T004744Z-fullrepo-parity-strict.json`
  - `outputs/p7-kg-excellence/evidence/20260226T011541Z-continue-parity-strict.json`
  - `outputs/p7-kg-excellence/evidence/20260226T020435Z-final2-parity-strict.json`
- Queue proxy burst reliability is proven (20/20 success, `peakQueueDepth: 18`, no rejects): `outputs/p7-kg-excellence/evidence/20260226T010710Z-graphiti-proxy-queue-drill.json`.

## Weighted Scoring Model
- Weights: Impact `50%`, Effort `20%`, Risk `20%`, Confidence `10%`.
- Scale: each component scored `1-5`.
- Normalization:
  - Higher is better for Impact and Confidence.
  - Lower is better for Effort and Risk.
- Formula:
  - `WeightedScore = ((Impact*0.5) + ((6-Effort)*0.2) + ((6-Risk)*0.2) + (Confidence*0.1)) / 5 * 100`

## Prioritized Recommendations

### 1) AP-01: Make `kg verify` Commit-Aware and Count-Aware (Score: 92)
- Problem statement:
  - Historical verify artifacts returned `No episodes found` immediately after publish (`outputs/p7-kg-excellence/evidence/20260226T004554Z-fullrepo-verify-both.json`, `...004744Z...`, `...011541Z...`), showing read-after-write inconsistency risk.
  - Current verify logic in `tooling/cli/src/commands/kg.ts` treats success as `episodesObserved > 0` and does not assert commit matching.
- Proposed change:
  - Extend `kg verify` with `--expect-commit <sha>` (default: `--commit`) and `--expect-min-episodes <n>` (default: `1`).
  - Parse episode metadata (`name` and/or content) to require commit match.
  - Emit `episodesCommitMatched`, `episodesScanned`, and `contractSatisfied` in verify output.
- Expected impact:
  - Reliability: reduce false-positive verify passes from stale group data.
  - Quality: make verify result semantically tied to the intended commit.
  - Throughput: fewer reruns caused by ambiguous verify outcomes.
- Effort and risk:
  - Effort: `S`
  - Risk: `Low`
- Validation experiment:
```bash
GROUP="beep-ast-kg-ap01-$(date -u +%Y%m%dT%H%M%SZ)"
bun run beep kg publish --target graphiti --mode full --group "$GROUP" > /tmp/ap01-publish.json
COMMIT="$(jq -r '.commitSha' /tmp/ap01-publish.json)"
bun run beep kg verify --target graphiti --group "$GROUP" --commit "$COMMIT" --expect-commit "$COMMIT" --expect-min-episodes 1 > /tmp/ap01-verify-pass.json
bun run beep kg verify --target graphiti --group "$GROUP" --commit "$COMMIT" --expect-commit "deadbeef" --expect-min-episodes 1
```
- Success thresholds:
  - Pass command exits `0` and reports `contractSatisfied: true`.
  - Wrong-commit command exits non-zero.
- Owner suggestion: `tooling`

### 2) AP-02: Add Adaptive Verify Polling + Per-Request Timeout (Score: 86)
- Problem statement:
  - Verify wait long-tail is high: `109,443 ms`, `68,271 ms`, `42,261 ms` in `...012316Z-verify-fix-verify-graphiti.json`, `...020435Z-final2-verify-both.json`, `...013753Z-continue3-verify-graphiti-probe.json`.
  - `mcpPost` in `tooling/cli/src/commands/kg.ts` currently has no fetch timeout, so individual attempts can hang unpredictably.
- Proposed change:
  - Add `BEEP_GRAPHITI_VERIFY_REQUEST_TIMEOUT_MS` and use `AbortSignal.timeout(...)` for verify MCP calls.
  - Replace fixed poll sleep with adaptive backoff (`min`, `max`, `multiplier`, jitter).
  - Emit attempt telemetry (`attemptDurationsMs`, `firstVisibleAtMs`, `p50AttemptMs`, `p95AttemptMs`).
- Expected impact:
  - Latency: reduce verify p95 from current `68-109s` to <= `30s` under healthy local conditions.
  - Reliability: fewer hung verify attempts and cleaner timeout behavior.
- Effort and risk:
  - Effort: `S/M`
  - Risk: `Low`
- Validation experiment:
```bash
for i in 1 2 3; do
  GROUP="beep-ast-kg-ap02-$(date -u +%Y%m%dT%H%M%SZ)-$i"
  bun run beep kg publish --target graphiti --mode full --group "$GROUP" > "/tmp/ap02-publish-$i.json"
  COMMIT="$(jq -r '.commitSha' "/tmp/ap02-publish-$i.json")"
  BEEP_GRAPHITI_VERIFY_REQUEST_TIMEOUT_MS=5000 \
  BEEP_GRAPHITI_VERIFY_WAIT_MS=120000 \
  BEEP_GRAPHITI_VERIFY_POLL_MIN_MS=250 \
  BEEP_GRAPHITI_VERIFY_POLL_MAX_MS=4000 \
  bun run beep kg verify --target graphiti --group "$GROUP" --commit "$COMMIT" > "/tmp/ap02-verify-$i.json"
done
jq -s '[.[].graphiti.waitedMs] | sort | {p95: .[(length*95/100|floor)], max: max}' /tmp/ap02-verify-*.json
```
- Success thresholds:
  - Verify `timedOut` remains `false` for all runs.
  - p95 `waitedMs <= 30000` and max `waitedMs <= 60000`.
- Owner suggestion: `tooling`

### 3) AP-03: Unify CLI Transport with the Resilient Graphiti MCP Client (Score: 82)
- Problem statement:
  - `tooling/agent-eval/src/graphiti/mcp.ts` already has lock, retry, backoff, and session reuse.
  - `tooling/cli/src/commands/kg.ts` uses a separate lightweight MCP path without retry/lock semantics.
  - This split increases behavior drift under outages and parallel load.
- Proposed change:
  - Extract a shared Graphiti MCP transport module and migrate `kg publish/verify` onto it.
  - Reuse env knobs already documented in `tooling/agent-eval/README.md` (`BEEP_GRAPHITI_SERIALIZE`, retry knobs, lock timeout knobs).
  - Keep a single error taxonomy for `initialize`, `tools/call`, and parse failures.
- Expected impact:
  - Reliability: fewer transport-related flakes during concurrent agent workloads.
  - Quality: consistent behavior across `tooling/cli` and `tooling/agent-eval`.
  - Speed: less engineering time spent reconciling two clients.
- Effort and risk:
  - Effort: `M`
  - Risk: `Medium`
- Validation experiment:
```bash
GROUP="beep-ast-kg-ap03-$(date -u +%Y%m%dT%H%M%SZ)"
bun run beep kg publish --target graphiti --mode full --group "$GROUP" > /tmp/ap03-publish.json
COMMIT="$(jq -r '.commitSha' /tmp/ap03-publish.json)"
seq 1 20 | xargs -P 10 -I{} sh -c 'bun run beep kg verify --target graphiti --group "'"$GROUP"'" --commit "'"$COMMIT"'" > /tmp/ap03-verify-{}.json'
rg -n "request failed|missing mcp-session-id|timed out" /tmp/ap03-verify-*.json || true
```
- Success thresholds:
  - 20/20 verify commands exit `0`.
  - No transport failure signatures found by `rg`.
- Owner suggestion: `tooling` + `agent-eval`

### 4) AP-04: Make Queue Proxy Routing Default + Preflight Gate (Score: 80)
- Problem statement:
  - Route policy and runbook call for `http://127.0.0.1:8123/mcp`, but current defaults in code/docs still center on direct `:8000/mcp`.
  - Multi-clone load safety evidence exists only when proxy is used (`...010710Z-graphiti-proxy-queue-drill.json`).
- Proposed change:
  - Default Graphiti endpoint to `http://127.0.0.1:8123/mcp` for local runs (with explicit opt-out).
  - Add a preflight check in `kg publish` and `kg verify`:
    - `GET /healthz`
    - Optional `GET /metrics` pressure check before high-fanout operations.
  - Surface actionable error when proxy is unavailable.
- Expected impact:
  - Reliability under parallel load: fewer upstream overload incidents.
  - Throughput consistency: one shared backpressure surface for all clones.
- Effort and risk:
  - Effort: `S`
  - Risk: `Low`
- Validation experiment:
```bash
bun run graphiti:proxy > /tmp/ap04-proxy.log 2>&1 &
PROXY_PID=$!
curl -fsS http://127.0.0.1:8123/healthz > /tmp/ap04-health.json
GROUP="beep-ast-kg-ap04-$(date -u +%Y%m%dT%H%M%SZ)"
BEEP_GRAPHITI_URL=http://127.0.0.1:8123/mcp bun run beep kg publish --target both --mode full --group "$GROUP" > /tmp/ap04-publish.json
curl -fsS http://127.0.0.1:8123/metrics > /tmp/ap04-metrics.json
kill "$PROXY_PID"
```
- Success thresholds:
  - Publish exits `0`.
  - Proxy metrics show `rejected: 0`, `failed: 0`, and `processed > 0`.
- Owner suggestion: `platform`

### 5) AP-05: Add Proxy Queue/Latency Histograms and Pressure Budgets (Score: 76)
- Problem statement:
  - Current proxy metrics expose counts only (`processed`, `failed`, `rejected`, `peakQueueDepth`) and cannot show p95 queue wait/upstream time.
  - Burst evidence shows queue depth growth to `18` at concurrency `1`, but there is no latency SLO visibility.
- Proposed change:
  - In `scripts/graphiti-mcp-queue-proxy.mjs`, capture per-request timing:
    - queue wait
    - upstream duration
    - status code distribution
  - Extend `/metrics` with p50/p95/p99 fields and configurable pressure budgets.
  - Add optional overload mode that returns 429/503 when queue wait budget is exceeded.
- Expected impact:
  - Reliability: earlier detection of overload before failure.
  - Latency: tuneable queue behavior under fanout.
- Effort and risk:
  - Effort: `M`
  - Risk: `Low/Medium`
- Validation experiment:
```bash
GRAPHITI_PROXY_CONCURRENCY=1 GRAPHITI_PROXY_MAX_QUEUE=200 bun run graphiti:proxy > /tmp/ap05-proxy.log 2>&1 &
PROXY_PID=$!
bun -e 'const n=100; await Promise.all(Array.from({length:n},(_,i)=>fetch("http://127.0.0.1:8123/mcp",{method:"POST",headers:{"content-type":"application/json","accept":"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:`init-${i}`,method:"initialize",params:{protocolVersion:"2024-11-05",capabilities:{},clientInfo:{name:"ap05",version:"0.0.0"}}})}).then(r=>r.status)));'
curl -fsS http://127.0.0.1:8123/metrics > /tmp/ap05-metrics.json
kill "$PROXY_PID"
```
- Success thresholds:
  - `rejected == 0`, `failed == 0`.
  - New metrics include `p95QueueWaitMs` and `p95UpstreamMs`.
  - `p95QueueWaitMs <= 10000` for the burst scenario.
- Owner suggestion: `platform`

### 6) AP-06: Turn Strict Parity Fallback into a Budgeted Exception (Score: 72)
- Problem statement:
  - All strict parity runs pass with fallback due to `eligibleCallEdges: 0`, so path-finding quality is unexercised.
- Proposed change:
  - Add `--strict-max-fallback-ratio` and fail strict parity if fallback exceeds budget over run history.
  - Track fallback ratio in artifact output.
- Expected impact:
  - Quality: strict profile becomes a real signal, not a permanent bypass.
- Effort and risk:
  - Effort: `M`
  - Risk: `Medium`
- Validation experiment:
```bash
GROUP="beep-ast-kg-ap06-$(date -u +%Y%m%dT%H%M%SZ)"
bun run beep kg publish --target falkor --mode full --group "$GROUP"
bun run beep kg parity --profile code-graph-strict --group "$GROUP" --strict-min-paths 1 --strict-max-fallback-ratio 0.2 > /tmp/ap06-parity.json
```
- Success thresholds:
  - Output includes fallback ratio.
  - Command fails when ratio exceeds budget.
- Owner suggestion: `tooling`

### 7) AP-08: Add Group/Ledger Hygiene Guardrails for Reproducible Runs (Score: 70)
- Problem statement:
  - Full publish artifacts include replay hits in “full” mode (e.g., `...004554Z-fullrepo-publish-both.json` has replay `1`; `...004719Z...` has replay `245`), indicating non-fresh-state drift in some runs.
  - Default/smoke group verification files show noisy low counts (`...verify-falkor-default-group.json`, `...verify-falkor-smoke-group.json`).
- Proposed change:
  - Add `--require-empty-group` for full publish.
  - Add optional auto-generated run group when `--group` is omitted in full mode.
  - Persist group provenance metadata alongside receipts.
- Expected impact:
  - Reliability: fewer cross-run contamination effects.
  - Quality: cleaner benchmark reproducibility.
- Effort and risk:
  - Effort: `S`
  - Risk: `Low`
- Validation experiment:
```bash
GROUP="beep-ast-kg-ap08-$(date -u +%Y%m%dT%H%M%SZ)"
bun run beep kg publish --target both --mode full --group "$GROUP" --require-empty-group > /tmp/ap08-first.json
bun run beep kg publish --target both --mode full --group "$GROUP" --require-empty-group > /tmp/ap08-second.json
```
- Success thresholds:
  - First run exits `0`.
  - Second run exits non-zero with explicit “group not empty” error.
- Owner suggestion: `tooling`

### 8) AP-09: Make Recovery Automation Fail-Closed on Partial Visibility (Score: 70)
- Problem statement:
  - Recovery smoke evidence includes partial completion with no episodes found (`outputs/p7-kg-excellence/evidence/20260226T004956Z-graphiti-recover-smoke.log`).
- Proposed change:
  - In `scripts/graphiti-recover.sh`, add verify polling knobs and non-zero exit on partial outcomes unless `--allow-partial` is set.
  - Reuse the same verify contract used by `kg verify`.
- Expected impact:
  - Reliability: recovery automation becomes dependable for unattended operation.
- Effort and risk:
  - Effort: `S`
  - Risk: `Low`
- Validation experiment:
```bash
bash scripts/graphiti-recover.sh --dry-run
bash scripts/graphiti-recover.sh --group beep-ast-kg-empty-check --skip-republish --verify-wait-ms 20000
bash scripts/graphiti-recover.sh --group beep-ast-kg --republish --verify-wait-ms 120000
```
- Success thresholds:
  - Empty-group run exits non-zero.
  - Republish run exits `0` with explicit episodes-visible confirmation.
- Owner suggestion: `platform`

### 9) AP-07: Productize the Drill Suite as a Nightly Regression Pipeline (Score: 68)
- Problem statement:
  - P7 resilience/performance drills are high quality but manual and ad hoc (`resilience-drill-report.md`, multiple evidence files).
- Proposed change:
  - Add a single orchestrator script (e.g., `scripts/kg-excellence-regression.sh`) that runs publish/verify/parity + outage drills + queue burst and emits a scorecard artifact.
- Expected impact:
  - Reliability: earlier detection of regressions.
  - Throughput: less manual operator overhead.
- Effort and risk:
  - Effort: `M/L`
  - Risk: `Medium`
- Validation experiment:
```bash
bash scripts/kg-excellence-regression.sh --output outputs/p8-regression/evidence
```
- Success thresholds:
  - Script exits `0` and writes all required artifact classes.
  - Gate thresholds enforced in script output.
- Owner suggestion: `agent-eval` + `platform`

### 10) AP-10: Add Opinionated Env Profiles for Local/Proxy/CI Modes (Score: 66)
- Problem statement:
  - Multiple tuning knobs exist across CLI, agent-eval, and proxy with no first-class profile presets.
- Proposed change:
  - Add documented profile files (for example `.env.kg.local`, `.env.kg.proxy`, `.env.kg.ci`) and README sections with one-line activation commands.
- Expected impact:
  - Reliability: fewer misconfigured runs.
  - Quality: more consistent reproduction of measured behavior.
- Effort and risk:
  - Effort: `S`
  - Risk: `Low`
- Validation experiment:
```bash
set -a && source .env.kg.proxy && set +a
GROUP="beep-ast-kg-ap10-$(date -u +%Y%m%dT%H%M%SZ)"
bun run beep kg publish --target both --mode full --group "$GROUP"
bun run beep kg verify --target both --group "$GROUP"
```
- Success thresholds:
  - Full cycle succeeds using profile defaults only.
- Owner suggestion: `platform`

## 30/60/90-Day Execution Roadmap with KPI Targets

### Day 0-30 (Quick Wins)
- Execute: `AP-01`, `AP-02`, `AP-04`, `AP-08`, `AP-09`.
- KPI targets:
  - Graphiti verify p95 `waitedMs <= 45,000`.
  - Verify false-positive/false-negative rate from stale/empty reads `<= 2%`.
  - Proxy burst test (`>=20` parallel initialize calls): `failed=0`, `rejected=0`.

### Day 31-60 (Stability + Observability)
- Execute: `AP-03`, `AP-05`, `AP-10`.
- KPI targets:
  - Graphiti verify p95 `waitedMs <= 30,000`.
  - Full cycle (`publish both + verify both + parity strict`) p95 wall-clock `<= 110,000 ms`.
  - Proxy metrics include queue/upstream p95 and are captured in evidence artifacts.

### Day 61-90 (Quality Gates + Continuous Enforcement)
- Execute: `AP-06`, `AP-07`.
- KPI targets:
  - Strict parity fallback ratio `< 20%` on canonical runs.
  - Nightly regression pipeline pass rate `>= 95%` over rolling 14 days.
  - End-to-end rerun confidence: no manual intervention required for standard publish/verify/parity pipeline in two consecutive weeks.
