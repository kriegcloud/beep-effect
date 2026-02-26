# P5 KG Impact Report

## Scope and artifacts

Target comparison: `adaptive` vs `adaptive_kg`.

Artifacts used:

- `outputs/agent-reliability/runs/latest.json`
- `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`

Run metadata:

- `runMode`: `live`
- `executionBackend`: `sdk`
- Executed conditions in artifact: `minimal` only

## Measured `adaptive` vs `adaptive_kg` metrics

| Metric | `adaptive` | `adaptive_kg` | Delta (`adaptive_kg - adaptive`) |
|---|---:|---:|---:|
| Runs | 0 | 0 | 0 |
| Successes | 0 | 0 | 0 |
| Success Rate | N/A | N/A | N/A |
| Critical Incidents | 0 | 0 | 0 |
| Avg Wall Time | N/A | N/A | N/A |
| Total Cost | N/A | N/A | N/A |
| Retrieval Facts per Run | N/A | N/A | N/A |

Available reference from executed minimal slice (not KG comparison):

- Minimal runs: `6`
- Avg retrieved facts per run: `1.6667`

## Caveats

1. Confidence gate failure blocked broader live execution before `adaptive` and `adaptive_kg` cohorts were run.
2. No condition-level KG delta can be established from the current candidate artifact.

## Decision

- KG default-enable decision: `NO-GO`
- Reason: required `adaptive` vs `adaptive_kg` live evidence is unavailable; current executed slice has `0` successes.
