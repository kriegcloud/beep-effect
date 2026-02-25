# P2 Runner Contract

## Phase 2 Execution Snapshot (February 25, 2026)

- Run mode used: `dual-agent live` (`codex` + `claude`)
- Availability gate:
  - `command -v codex` -> available
  - `command -v claude` -> available
- Preconditions (executed before live runs):
  - `bun run --cwd tooling/agent-eval check` -> pass
  - `bun run --cwd tooling/agent-eval lint` -> pass
  - `bun run --cwd tooling/agent-eval test` -> pass
  - `bun run --cwd tooling/agent-eval docgen` -> pass

## Confidence Smokes (Targeted Live, Diagnostics Enabled)

All smokes used `--diagnostics true`, explicit `--progress-output`, and bounded `--max-wall-minutes`.

| Scope | Artifact | Planned/Completed | Success | Runtime Failures | Allowlist Pass |
|---|---|---:|---:|---:|---:|
| `apps_web_01` | `outputs/agent-reliability/smokes/2026-02-25-takeover-smoke-apps-web-r2.json` | `2/2` | `0` | `2` | `2/2` |
| `tooling_cli_01` | `outputs/agent-reliability/smokes/2026-02-25-takeover-smoke-tooling-cli.json` | `2/2` | `0` | `2` | `2/2` |
| `package_lib_01` | `outputs/agent-reliability/smokes/2026-02-25-takeover-smoke-package-lib.json` | `2/2` | `0` | `2` | `2/2` |

Smoke diagnostics aggregate (`*.diagnostics.jsonl`):

- `run.diagnostic` rows: `6`
- Timeouts: `6/6`
- Allowlist failures: `0/6`
- Avg wall time:
  - Codex: `182697.40 ms`
  - Claude: `182221.52 ms`
- Tail behavior:
  - `tailCharLimit`: `4000`
  - Codex tails truncated: `stdoutTruncated=3`, `stderrTruncated=3`
  - Claude zero-length tails: `3/3` (`stdoutLength=0`, `stderrLength=0`)

## Phase 2 Closure Run (Matched Baseline vs Live Candidate)

### Matrix definition

- Tasks: `apps_web_01`, `tooling_cli_01`, `package_lib_01`
- Conditions: `current`, `minimal`, `adaptive`, `adaptive_kg`
- Agents: `codex`, `claude`
- Trials: `1`
- Planned runs: `3 x 4 x 2 x 1 = 24`

### Baseline (matched matrix)

- Artifact: `outputs/agent-reliability/runs/baseline-targeted.json`
- Status: `completed`
- Planned/Completed: `24/24`
- Success: `24/24`

### Live candidate

- Artifact: `outputs/agent-reliability/runs/latest.json`
- Status: `completed`
- Planned/Completed: `24/24`
- Success: `0/24`
- Failure type mix: `runtime=24`
- Allowlist failures: `0`
- Suite wall/cost:
  - `totalWallMs=1499480.4253019998`
  - `averageWallMs=62478.35105424999`
  - `totalCostUsd=0`

### Generated Phase 2 artifacts

- `outputs/agent-reliability/runs/latest.json`
- `outputs/agent-reliability/weekly/latest-report.md`
- `outputs/agent-reliability/weekly/compare.md`

Comparison assumptions are aligned (same task/condition/agent/trial matrix) using:

- baseline: `outputs/agent-reliability/runs/baseline-targeted.json`
- candidate: `outputs/agent-reliability/runs/latest.json`

## Diagnostics Tail Schema and Observed Insights

Observed `run.diagnostic.command` payload fields include:

- `stdoutTail`, `stderrTail`
- `stdoutLength`, `stderrLength`
- `stdoutTruncated`, `stderrTruncated`
- `tailCharLimit`

Live candidate diagnostics (`outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`) insights:

1. Timeout root cause is dominant and universal.
   - `timedOut=true` for `24/24` runs
   - `failureType=runtime` for `24/24`
2. Allowlist false positives are not present.
   - `allowlist.pass=true` for `24/24`
   - `firstViolationPath=none` for all runs
3. Codex diagnostics are information-rich but tail-truncated.
   - Codex runs: `12`
   - `stdoutTruncated=12`, `stderrTruncated=12`
   - Max captured lengths before tailing: `stdoutLength=64770`, `stderrLength=20292`
4. Claude diagnostics are structurally present but payload-empty.
   - Claude runs: `12`
   - `stdoutLength=0`, `stderrLength=0` for all Claude runs
5. Acceptance command metadata is captured despite runtime classification.
   - `bun run check`: `16` rows
   - `bun run lint`: `8` rows

## Explicit Remaining Blockers

1. Runtime stability blocker:
   - Live success rate is `0%` (`0/24`) due subprocess timeout behavior.
2. Claude forensic visibility blocker:
   - `run.diagnostic.command` tails for Claude are consistently empty, limiting root-cause depth.
3. Detector live-signal blocker:
   - No touched source paths in timed-out runs (`touchedPathCount=0`), so detector firing cannot be validated on live edits.

## Phase 2 Status

Phase 2 is closed for runner-contract evidence collection and artifact generation, with blockers explicitly documented. The contract is stable enough for controlled measurement, but not yet for success-rate goals.
