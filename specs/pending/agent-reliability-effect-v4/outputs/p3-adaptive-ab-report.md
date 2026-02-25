# P3 Adaptive A/B Report

## Scope

Adaptive policy comparison using matched live matrix artifacts from February 25, 2026.

- Source suite: `outputs/agent-reliability/runs/latest.json`
- Matched baseline: `outputs/agent-reliability/runs/baseline-targeted.json`
- Compare artifact: `outputs/agent-reliability/weekly/compare.md`

Matrix used:

- Tasks: `apps_web_01`, `tooling_cli_01`, `package_lib_01`
- Agents: `codex`, `claude`
- Trials: `1`
- Condition cohorts compared:
  - A: `current`
  - B: `adaptive`
- Runs per cohort: `6`

## Measured Results (`current` vs `adaptive`)

| Metric | `current` | `adaptive` | Delta (`adaptive - current`) |
|---|---:|---:|---:|
| Runs | 6 | 6 | 0 |
| Successes | 0 | 0 | 0 |
| Success Rate | 0.00% | 0.00% | 0.00pp |
| Runtime Failures | 6 | 6 | 0 |
| Wrong-API Incidents | 0 | 0 | 0 |
| Avg Wall Time | 62272.64 ms | 62752.75 ms | +480.12 ms |
| Total Cost | $0.0000 | $0.0000 | $0.0000 |

Agent-level wall-time deltas:

- Codex: `62035.10 ms` -> `62683.99 ms` (`+648.89 ms`)
- Claude: `62510.17 ms` -> `62821.52 ms` (`+311.35 ms`)

## Interpretation

1. There is no adaptive lift on success rate in this live slice (`0/6` vs `0/6`).
2. Runtime timeout failures dominate both cohorts equally.
3. Cost and wrong-API metrics are flat because no runs reached successful completion.

## Caveats

1. This live slice was intentionally bounded (`--smoke-timeout-minutes 1`) to ensure deterministic completion under wall budget.
2. Because every run failed at runtime timeout, this dataset cannot establish quality differences in generated code.

## Decision

- Go/No-Go (adaptive promotion over current): `NO-GO`
- Rationale: no measurable success gain, no quality gain signal, and slightly higher average wall time for adaptive under current runtime constraints.
