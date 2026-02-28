# Agent Performance Backlog (Ranked)

## Scoring Model
- Weights: Impact `50%`, Effort `20%`, Risk `20%`, Confidence `10%`.
- Formula: `((Impact*0.5) + ((6-Effort)*0.2) + ((6-Risk)*0.2) + (Confidence*0.1)) / 5 * 100`.
- Scale: `1-5` for each component.

## Ranked Backlog

| Rank | ID | Recommendation | Weighted Score | Impact | Effort | Risk | Confidence | Horizon | Owner | Evidence Anchor |
|---:|---|---|---:|---:|---:|---:|---:|---|---|---|
| 1 | AP-01 | Commit-aware + count-aware `kg verify` contract | 92 | 5 | 2 | 2 | 5 | 1-2 days | tooling | `...004554Z-fullrepo-verify-both.json`, `...004744Z...`, `...011541Z...`, `tooling/cli/src/commands/kg.ts` |
| 2 | AP-02 | Adaptive verify polling + per-request timeout | 86 | 5 | 3 | 2 | 4 | 1-2 days | tooling | `...012316Z-verify-fix-verify-graphiti.json`, `...020435Z-final2-verify-both.json`, `...013753Z-continue3-verify-graphiti-probe.json` |
| 3 | AP-03 | Shared resilient Graphiti MCP transport for CLI + agent-eval | 82 | 5 | 3 | 3 | 4 | 1 week | tooling + agent-eval | `tooling/agent-eval/src/graphiti/mcp.ts`, `tooling/cli/src/commands/kg.ts` |
| 4 | AP-04 | Proxy-first routing defaults + health preflight gate | 80 | 4 | 2 | 2 | 4 | 1-2 days | platform | `group-isolation-runbook.md`, `...010710Z-graphiti-proxy-queue-drill.json` |
| 5 | AP-05 | Proxy latency/queue histograms + pressure budgets | 76 | 4 | 3 | 2 | 4 | 1 week | platform | `scripts/graphiti-mcp-queue-proxy.mjs`, `...010710Z-graphiti-proxy-queue-drill.json` |
| 6 | AP-06 | Budget strict parity fallback and force real path coverage | 72 | 4 | 3 | 3 | 4 | 1-2 weeks | tooling | strict parity artifacts (`...004554Z...`, `...004744Z...`, `...011541Z...`, `...020435Z...`) |
| 7 | AP-08 | Group/ledger hygiene guardrails (`--require-empty-group`) | 70 | 3 | 2 | 2 | 4 | 1-2 days | tooling | `...004554Z-fullrepo-publish-both.json`, `...004719Z-fullrepo-publish-both.json`, `...verify-falkor-default-group.json` |
| 8 | AP-09 | Fail-closed recovery automation with visibility barrier | 70 | 3 | 2 | 2 | 4 | 1-2 days | platform | `...004956Z-graphiti-recover-smoke.log`, `...010811Z-graphiti-recover-smoke.log` |
| 9 | AP-07 | Nightly excellence regression pipeline | 68 | 4 | 4 | 3 | 4 | 1-2 weeks | agent-eval + platform | `resilience-drill-report.md`, `final-excellence-scorecard.md` |
|10 | AP-10 | Opinionated env profiles for local/proxy/CI | 66 | 2 | 1 | 1 | 3 | 1-2 days | platform | `tooling/agent-eval/README.md`, proxy/verify env knobs |

## Implementation-Ready Next Steps

### AP-01
- Add `--expect-commit` and `--expect-min-episodes` flags to `kg verify` in `tooling/cli/src/commands/kg.ts`.
- Parse returned episodes and compute commit-matched count.
- Update verify JSON output schema with contract fields.

### AP-02
- Add `BEEP_GRAPHITI_VERIFY_REQUEST_TIMEOUT_MS` and wrap verify MCP fetch with `AbortSignal.timeout`.
- Replace fixed polling cadence with bounded backoff + jitter.
- Add attempt-level telemetry fields to verify output.

### AP-03
- Extract common Graphiti MCP transport module from `tooling/agent-eval/src/graphiti/mcp.ts`.
- Migrate `kg publish` and `kg verify` to the shared transport.
- Keep one env knob surface for retries, serialization, and lock timeout.

### AP-04
- Change local default Graphiti endpoint to `http://127.0.0.1:8123/mcp` with explicit opt-out.
- Add preflight checks (`/healthz`, optional `/metrics`) before heavy Graphiti operations.
- Emit clear operator guidance when proxy is unavailable.

### AP-05
- Extend proxy state with per-request queue wait and upstream latency measurements.
- Publish p50/p95/p99 and status-code counters from `/metrics`.
- Add queue-pressure budget response mode and document thresholds.

## Validation Gates by Phase
- Phase 1 gate: AP-01/AP-02/AP-04/AP-08/AP-09 merged and Graphiti verify p95 `<= 45,000 ms`.
- Phase 2 gate: AP-03/AP-05/AP-10 merged and full-cycle p95 wall-clock `<= 110,000 ms`.
- Phase 3 gate: AP-06/AP-07 merged and strict-parity fallback ratio `< 20%` on canonical nightly runs.
