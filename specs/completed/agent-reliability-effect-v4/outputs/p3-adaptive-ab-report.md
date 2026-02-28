# P3 Adaptive A/B Report

## Scope and artifacts

Target comparison: `current` vs `adaptive`.

Artifacts used:

- `outputs/agent-reliability/runs/latest.json`
- `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`
- `outputs/agent-reliability/weekly/compare.md`

Run metadata in candidate artifact:

- `runMode`: `live`
- `executionBackend`: `sdk`
- Executed conditions: `minimal` only

## Measured `current` vs `adaptive` deltas

| Metric | `current` | `adaptive` | Delta (`adaptive - current`) |
|---|---:|---:|---:|
| Runs | 0 | 0 | 0 |
| Successes | 0 | 0 | 0 |
| Success Rate | N/A | N/A | N/A |
| Wrong-API Incidents | 0 | 0 | 0 |

Concrete observation from available artifact:

- Minimal-only slice runs: `6`
- Minimal-only successes: `0`

## Caveats

1. Confidence gate failed before broader live execution (`0/6` dual-agent smoke successes), so `current`/`adaptive` cohorts were not run.
2. `outputs/agent-reliability/weekly/compare.md` explicitly marks baseline-vs-candidate as `NON-COMPARABLE` (`simulate` vs `live`, matrix mismatch).

## Decision

- Adaptive A/B promotion decision: `NO-GO`
- Reason: required `current` vs `adaptive` live evidence is blocked and no success signal exists in the executed minimal slice.
