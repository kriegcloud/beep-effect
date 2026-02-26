# P6 Final Scorecard

## Evidence base

Artifacts used:

- `outputs/agent-reliability/runs/latest.json`
- `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`
- `outputs/agent-reliability/weekly/latest-report.md`
- `outputs/agent-reliability/weekly/compare.md`
- `outputs/agent-reliability/episodes/latest.json`

Candidate metadata:

- `runMode`: `live`
- `executionBackend`: `sdk`
- Candidate matrix: three-task minimal slice (`6` runs)

## Day-90 criteria scorecard (fail vs blocked)

| Criterion | Measured Value | Status |
|---|---:|---|
| Mixed-task success rate | `0/6` (`0.00%`) | Fail |
| First-pass `check+lint+test` pass rate | `0/6` (`0.00%`) | Fail |
| Wrong-API incidents per successful task | N/A (`0` successful tasks) | Blocked |
| Median cost per successful task | N/A (`0` successful tasks) | Blocked |
| Detector live mutation evidence | Mutations present in `2/6` runs; incidents in `2/6` runs | Pass |
| Baseline/candidate comparability quality | `NON-COMPARABLE` (simulate baseline vs live candidate, matrix mismatch) | Fail |
| Closed-loop ingestion artifact | `outputs/agent-reliability/episodes/latest.json` length `6` | Pass |

## Key metrics and deltas

- Candidate run count: `6`
- Candidate successes: `0`
- Candidate critical incidents: `23`
- Candidate average wall time: `602447.50 ms`
- Candidate total cost: `$0`
- Confidence-smoke gate: failed (`0/6` successes)
- Control run (`apps_web_01` codex-only): runtime failure with timeout pattern reproduced

## Confidence level for full live-run success

- Confidence: `Low`
- Practical estimate for immediate full-matrix success: `<10%`

## Exact blockers and next action

1. Blocker: command timeout dominance (`command.timedOut=true` in all smoke/control runs).
   - Next action: run one per-category live probe with increased per-task timeout budget and verify `completionObserved=true` before rerunning matrix.
2. Blocker: broader live matrix is gated by smoke failure (`0/6` successes).
   - Next action: require at least one successful run per category in confidence smokes, then execute baseline/candidate full matrix with matched assumptions.
3. Blocker: adaptive/KG cohort metrics unavailable.
   - Next action: after gate pass, execute `current,minimal,adaptive,adaptive_kg` cohorts and regenerate P3/P5 deltas from that run set.

## Final decision

- Go/No-Go: `NO-GO`
