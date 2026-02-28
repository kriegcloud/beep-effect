# P2 Runner Contract

## Phase 2 Execution Snapshot (February 25, 2026)

### Preconditions and availability

Executed and passed:

- `bun run --cwd tooling/agent-eval check`
- `bun run --cwd tooling/agent-eval lint`
- `bun run --cwd tooling/agent-eval test`
- `bun run --cwd tooling/agent-eval docgen`

CLI availability:

- `command -v codex` -> available
- `command -v claude` -> available

### Actual run mode and backend used

- Run mode: `live`
- Agent mode: `dual-agent` for confidence smokes (`codex`, `claude`)
- Execution backend observed in diagnostics: `sdk` for all smoke/control runs (`7/7`)
- `auto` fallback reason observed: none in this slice (no CLI fallback triggered)

## Confidence Smokes (live, diagnostics enabled)

Artifacts:

- `outputs/agent-reliability/smokes/2026-02-25-apps-web-v3.json`
- `outputs/agent-reliability/smokes/2026-02-25-tooling-cli.json`
- `outputs/agent-reliability/smokes/2026-02-25-package-lib.json`
- `outputs/agent-reliability/smokes/2026-02-25-native-timeout-control-v2.json`
- `outputs/agent-reliability/smokes/2026-02-25-confidence-summary.json`
- `outputs/agent-reliability/smokes/2026-02-25-confidence-diagnostics-summary.json`

| Scope | Planned/Completed | Success | Runtime | Effect Compliance | Allowlist Pass |
|---|---:|---:|---:|---:|---:|
| `apps_web_01` (dual) | `2/2` | `0` | `2` | `0` | `2/2` |
| `tooling_cli_01` (dual) | `2/2` | `0` | `1` | `1` | `2/2` |
| `package_lib_01` (dual) | `2/2` | `0` | `1` | `1` | `2/2` |
| `apps_web_01` native-timeout control (codex-only) | `1/1` | `0` | `1` | `0` | `1/1` |

Aggregate (three dual smokes):

- Runs: `6`
- Successes: `0`
- Confidence gate pass condition: **not met** (`0/6`)

Diagnostics aggregate (dual smokes + control):

- `run.diagnostic` rows: `7`
- `command.timedOut=true`: `7/7`
- `command.completionObserved=true`: `0/7`
- `command.stdoutTruncated=true`: `7/7`
- `command.stderrTruncated=true`: `0/7`
- `allowlist.pass=true`: `7/7`

## Diagnostics tail schema and observed insights

Observed `run.diagnostic.command` fields:

- Existing tails/length/truncation fields:
  - `stdoutTail`, `stderrTail`
  - `stdoutLength`, `stderrLength`
  - `stdoutTruncated`, `stderrTruncated`
  - `tailCharLimit`
- Added command execution metadata:
  - `backend`, `completionObserved`, `exitCode`, `signal`, `fallbackReason`

Observed acceptance diagnostics fields:

- `acceptance.failedCommandDiagnostics.stdoutTail`
- `acceptance.failedCommandDiagnostics.stderrTail`
- `acceptance.failedCommandDiagnostics.stdoutLength`
- `acceptance.failedCommandDiagnostics.stderrLength`
- `acceptance.failedCommandDiagnostics.stdoutTruncated`
- `acceptance.failedCommandDiagnostics.stderrTruncated`
- `acceptance.failedCommandDiagnostics.tailCharLimit`
- `acceptance.failedCommandDiagnostics.exitCode`
- `acceptance.failedCommandDiagnostics.signal`

Observed timeout/root-cause tail patterns:

- Codex stderr tail pattern: `The operation was aborted.`
- Claude stderr tail pattern: `Claude Code process aborted by user`
- `stdoutLength` high and truncated in all timed-out runs, indicating long in-progress sessions rather than immediate process crashes.

## Phase 2 closure artifacts refreshed

- `outputs/agent-reliability/runs/latest.json` (confidence-smoke aggregate across three task slices)
- `outputs/agent-reliability/runs/latest.json.progress.jsonl`
- `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`
- `outputs/agent-reliability/weekly/latest-report.md`
- `outputs/agent-reliability/weekly/compare.md`

Comparison caveat is explicit in `outputs/agent-reliability/weekly/compare.md`:

- Baseline: `outputs/agent-reliability/runs/baseline-targeted.json` (`simulate`)
- Candidate: `outputs/agent-reliability/runs/latest.json` (`live`)
- Result: marked `NON-COMPARABLE` with matrix/run-mode caveats.

## Explicit remaining blockers

1. Confidence gate blocker: `0/6` successful dual-agent smoke runs.
2. Command completion blocker: `completionObserved=false` in `7/7` smoke/control runs.
3. Timeout blocker: `command.timedOut=true` in `7/7` smoke/control runs.
4. Broader live matrix blocker: full Phase 2 baseline/candidate live matrix was not executed after confidence-gate failure.

## Phase 2 status

- Phase 2 runner contract evidence collection: `COMPLETE`
- Phase 2 broader live matrix execution: `BLOCKED`
- Go/No-Go for moving to full live matrix now: `NO-GO`
