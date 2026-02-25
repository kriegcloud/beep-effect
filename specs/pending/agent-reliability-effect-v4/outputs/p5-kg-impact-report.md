# P5 KG Impact Report

## Scope

Controlled comparison of `adaptive` vs `adaptive_kg` using the February 25, 2026 live targeted matrix.

- Source suite: `outputs/agent-reliability/runs/latest.json`
- Diagnostics source: `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`

Matrix slice:

- Tasks: `apps_web_01`, `tooling_cli_01`, `package_lib_01`
- Agents: `codex`, `claude`
- Trials: `1`
- Runs per cohort: `6`

## Measured Deltas (`adaptive` -> `adaptive_kg`)

| Metric | `adaptive` | `adaptive_kg` | Delta (`adaptive_kg - adaptive`) |
|---|---:|---:|---:|
| Runs | 6 | 6 | 0 |
| Successes | 0 | 0 | 0 |
| Success Rate | 0.00% | 0.00% | 0.00pp |
| Runtime Failures | 6 | 6 | 0 |
| Wrong-API Incidents | 0 | 0 | 0 |
| Avg Wall Time | 62752.75 ms | 62302.09 ms | -450.66 ms |
| Total Cost | $0.0000 | $0.0000 | $0.0000 |

Retrieval/policy signal:

- `adaptive` selected policies include `adaptive`
- `adaptive_kg` selected policies include `adaptive` + `adaptive_kg`
- Avg `retrievedFacts` per run:
  - `adaptive`: `1.6667`
  - `adaptive_kg`: `1.6667`

## Interpretation

1. KG-enabled policy did not improve success outcomes in this live slice (`0/6` vs `0/6`).
2. Runtime timeout dominates both cohorts, masking potential semantic benefit.
3. Wall-time difference slightly favors `adaptive_kg` (`-450.66 ms` average), but the effect is small relative to full timeout-scale runtime.
4. Retrieval payload volume did not increase under `adaptive_kg` in this dataset.

## Caveats

1. Bounded timeout profile (`--smoke-timeout-minutes 1`) prioritizes deterministic completion over deep task execution.
2. Claude command tails are empty in diagnostics for all Claude runs, limiting retrieval-quality introspection.

## Decision

- Go/No-Go for enabling KG by default: `NO-GO`
- Rationale: no measured success lift, no wrong-API reduction signal, and no retrieval-volume improvement under current runtime behavior.
