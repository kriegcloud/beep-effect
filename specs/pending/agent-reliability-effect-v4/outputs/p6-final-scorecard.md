# P6 Final Scorecard (Day 90)

## Evidence Base

- Baseline (matched matrix): `outputs/agent-reliability/runs/baseline-targeted.json`
- Live candidate: `outputs/agent-reliability/runs/latest.json`
- Comparison: `outputs/agent-reliability/weekly/compare.md`
- Diagnostics: `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`
- Closed-loop episodes: `outputs/agent-reliability/episodes/latest.json`

Matrix compared: `3 tasks x 4 conditions x 2 agents x 1 trial = 24 runs`.

## Scorecard Criteria

| Criterion | Baseline | Candidate | Delta | Status |
|---|---:|---:|---:|---|
| Mixed-task success rate | 100.00% (24/24) | 0.00% (0/24) | -100.00pp | Fail |
| Wrong-API incidents per successful task | 0.0000 | N/A (no successes) | N/A | Blocked |
| First-pass `check+lint` pass rate | 100.00% (24/24) | 0.00% (0/24) | -100.00pp | Fail |
| Median token-cost per successful task | $0.001643 | N/A (no successes) | N/A | Blocked |
| Closed-loop ops validation (`ingest`) | Not run in baseline | `24` episodes emitted | +24 episodes | Pass |

## Reliability Summary

- Candidate status: `completed` (`plannedRunCount=24`, `completedRunCount=24`)
- Outcome distribution: `runtime=24`, all other failure categories `0`
- Allowlist false-positive regression: not observed (`allowlist pass 24/24`)

## Confidence for Full Live Run Success

- Confidence level: `Low`
- Practical estimate under current harness/runtime settings: `<10%` chance of meaningful success-rate improvement in a full live matrix without runtime remediation.

## Go/No-Go

- Final decision: `NO-GO`
- Reason: mandatory success and first-pass quality criteria regressed by `-100pp`, with runtime timeouts preventing substantive execution.

## Exact Blockers and Next Action

1. Blocker: universal runtime timeout across agents and conditions (`24/24`).
   - Next action: run a focused live probe with increased task timeout budget (for example `--smoke-timeout-minutes 3-5`) on one task per category to confirm completions are possible.
2. Blocker: Claude diagnostics tails are empty (`stdoutLength=0`, `stderrLength=0` in `12/12` Claude runs).
   - Next action: instrument/verify Claude subprocess stream capture in the runner so tail diagnostics are usable.
3. Blocker: detector live efficacy unproven because timed-out runs produce no touched source files.
   - Next action: after runtime stability is restored, execute a small mutation-capable live slice and verify detector rule firing against touched-file evidence.
