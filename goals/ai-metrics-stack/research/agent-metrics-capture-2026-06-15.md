# Agent-metrics capture — 2026-06-15

Durable snapshot of the AI-metrics analysis, regenerated from the local DuckDB **before** pruning the
redundant per-run Parquet snapshots from `.beep/ai-metrics`. The bulky Parquet exports (84G across 238
`forwarder-<ts>/` dirs) were full cumulative re-dumps of the DuckDB and held no unique data; the
queryable dataset survives in `.beep/ai-metrics/derived/ai-metrics.duckdb` (+ the newest retained
Parquet snapshot, + the encrypted `raw/codex/` source of truth). This file preserves the *analysis*,
which is the decision-informing artifact the `ai-metrics-stack` goal was built to produce.

## Provenance
- Command: `bun run beep ai-metrics report weekly --target local --data-root .beep/ai-metrics --since 2026-05-01T00:00:00Z --until 2026-06-15T23:59:59Z`
- Window: `2026-05-01` → `2026-06-15` (epoch ms 1777593600000 → 1781567999000), covering the full
  local ingest history (raw transcripts span ≈ May 9 → Jun 8).
- Source: local derived DuckDB (`derived/ai-metrics.duckdb`). Read-only; no archive key required for
  `--target local`.
- Supersedes the stale reports in `.beep/ai-metrics/reports/` (all of which covered early/mid-May only
  and predated the large June dataset).

## Config-impact scorecards (full window)

| configSnapshotId | total | outcome | flow | cost | tasks | labels | benchmarks | completionReady |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| config-6c5738fd…65f7d52 | 0.740 | 0.700 | 1.000 | 0.500 | 662 | 1 | 2 | yes |
| config-910eecbb…39ebf1 | 0.500 | 0.500 | 0.500 | 0.500 | 10 | 0 | 0 | no |
| config-d0b05a2d…ca895bc | 0.733 | 0.730 | 0.860 | 0.500 | 5 | 1 | 1 | yes |

Score weights: `outcome 0.7 · flow 0.2 · cost 0.1`.

### Reading the numbers
- `config-6c57…` is the dominant config (662 agent tasks over the window) and scores **0.740**
  (outcome 0.700, flow 1.000). This is the primary signal for agent work in the repo during May–June.
- The other two configs have tiny task counts (10, 5) and are not meaningful comparators.
- **Coverage gaps** (apply to all rows): `cost_metrics_unavailable`, `model_call_metrics_unavailable`,
  `tool_invocation_metrics_unavailable`, `no_benchmark_runs`/`no_labels` for the thin configs. The
  Codex transcript source did not emit cost / model-call / tool-invocation telemetry, so those
  dimensions default to 0.5 (unscored) rather than being measured. Improving fidelity requires
  capturing those signals at ingest, plus human outcome labels and benchmark runs.

## Raw report JSON (verbatim, for fidelity)

```json
{
  "coverageGaps": [
    "cost_metrics_unavailable_not_scored",
    "model_call_metrics_unavailable_not_scored",
    "no_benchmark_runs",
    "no_labels",
    "scorecard_completion_credit_blocked",
    "tool_invocation_metrics_unavailable_not_scored"
  ],
  "generatedAtEpochMillis": "1781553445220",
  "target": "local",
  "windowStartEpochMillis": "1777593600000",
  "windowEndEpochMillis": "1781567999000",
  "scores": [
    { "scorecard": { "configSnapshotId": "config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52", "scorecardId": "scorecard-d5224d721b321e63d768595bd71f3f7d109612e2bc467bd573a858d76875f4c1", "totalScore": "0.7403172205438067", "outcomeScore": "0.7004531722054381", "flowScore": "1", "costScore": "0.5", "taskCount": "662", "labelCount": "1", "benchmarkRunCount": "2", "completionReady": true, "weights": { "outcome": "0.7", "flow": "0.2", "cost": "0.1" } } },
    { "scorecard": { "configSnapshotId": "config-910eecbb488885f42c4caea393b4dd4512bee62869a1f0df7c9a27d42839ebf1", "totalScore": "0.5", "outcomeScore": "0.5", "flowScore": "0.5", "costScore": "0.5", "taskCount": "10", "labelCount": "0", "benchmarkRunCount": "0", "completionReady": false } },
    { "scorecard": { "configSnapshotId": "config-d0b05a2d64c9c40c21e0df11f8cfc611be5ce41139f52f4db79b77f73ca895bc", "totalScore": "0.733", "outcomeScore": "0.730", "flowScore": "0.860", "costScore": "0.5", "taskCount": "5", "labelCount": "1", "benchmarkRunCount": "1", "completionReady": true } }
  ]
}
```

## How to regenerate / go deeper
The full dataset stays queryable in `.beep/ai-metrics/derived/ai-metrics.duckdb`. Re-run the report any
time with a different window, or query the DuckDB directly (tables: `ai_metrics_turns`,
`ai_metrics_sessions`, `ai_metrics_agent_tasks`, `ai_metrics_scorecards`, …). To re-export a full
Parquet snapshot, run `ai-metrics forwarder run` (now self-pruning to the newest 5).
