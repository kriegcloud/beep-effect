# P4 Effect v4 Detector Report

## Scope and artifacts

Artifacts used:

- `outputs/agent-reliability/runs/latest.json`
- `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`
- `outputs/agent-reliability/smokes/2026-02-25-confidence-summary.json`

Run metadata:

- `runMode`: `live`
- `executionBackend`: `sdk`
- Slice: three minimal confidence-smoke tasks aggregated (`apps_web_01`, `tooling_cli_01`, `package_lib_01`)

## Detector incident and mutation metrics

From `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`:

- Total runs: `6`
- Runs with detector critical incidents (`criticalIncidentCount > 0`): `2`
- Total critical incidents: `23`
- Wrong-API incidents: `0`
- Effect-compliance incidents: `23`
- Dominant rule id: `type-assertion-as`

Touched-path evidence:

- Runs with `touchedPathCount > 0`: `2/6`
- Total touched paths across runs: `6`
- Live mutations present: `YES`
  - `tooling_cli_01:minimal:claude:1` touched paths: `5`
  - `package_lib_01:minimal:claude:1` touched paths: `1`

Timeout context:

- `command.timedOut=true`: `6/6`
- `command.completionObserved=true`: `0/6`

## Interpretation

1. Detector wiring is active in live runs and can emit critical effect-compliance incidents when files are mutated.
2. Detector signal is currently mixed with universal command timeout behavior, so quality impact cannot be isolated from runtime instability.

## Decision

- Detector live-signal presence: `GO` (mutations + incident firing observed)
- Detector efficacy claim for rollout: `NO-GO` (runtime timeout dominates all runs)
