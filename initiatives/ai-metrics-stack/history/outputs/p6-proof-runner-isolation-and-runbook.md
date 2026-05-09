# P6 Proof Runner Isolation And Runbook

## Status

Implemented on May 9, 2026 during the restarted P6 proof window.

The credited proof window still started on May 9, 2026 02:26
America/Chicago. The earliest completion remains May 16, 2026 02:26
America/Chicago. This change isolates the host runner that executes the
workstation timer; it does not widen source discovery, change timer budgets, or
move the proof data root.

## Proof Runner Isolation

- Created a dedicated Git worktree:
  `/home/elpresidank/YeeBois/projects/beep-effect-worktrees/ai-metrics-p6-proof`
- Pinned it at commit
  `63c419721c735bfb860ccfa9bf1b31efbb23e33c`.
- Kept it detached from a branch and locked it with Git worktree metadata:
  `AI metrics P6 proof runner pinned through 2026-05-16`.
- Bootstrapped the worktree with `bun install --frozen-lockfile`.
- Re-rendered and installed the workstation user timer so
  `beep-ai-metrics-forwarder.service` uses:
  - `WorkingDirectory=/home/elpresidank/YeeBois/projects/beep-effect-worktrees/ai-metrics-p6-proof`
  - `--data-root /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics`
  - `EnvironmentFile=%h/.config/beep/ai-metrics.env`
- Preserved existing runtime secret values in `~/.config/beep/ai-metrics.env`;
  checked-in files still use only 1Password secret references.
- Verified the installed service uses the proof worktree and original proof
  data root, and does not pin `/home/elpresidank/.bun/bin/bun`.

## Isolation Evidence

- Timer state after installation:
  - unit: `beep-ai-metrics-forwarder.timer`
  - state: `enabled`, `active`
  - next scheduled run: May 9, 2026 04:22:14 America/Chicago
  - last trigger: May 9, 2026 04:04:06 America/Chicago
- Forced service run after installation:
  - state: `inactive`
  - result: `success`
  - exit status: `0`
  - start: May 9, 2026 04:05:18 America/Chicago
  - exit: May 9, 2026 04:05:47 America/Chicago
- Latest bounded forwarder status after isolation:
  - ingest run: `forwarder-1778317519950`
  - config snapshot:
    `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52`
  - source files: `5`
  - derived turns: `3516`
  - source coverage:
    - Codex: `132` candidates, `5` included, `limitedByMaxFiles=true`,
      `10` size-excluded
    - Claude Code: `0` candidates, `0` included
    - OpenClaw: `0` candidates, `0` included
  - Parquet export:
    `/home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics/derived/parquet/forwarder-1778317519950`
- Phoenix health after isolation:
  - endpoint: `https://dankserver.tailc7c348.ts.net:8447/`
  - HTTP status: `200`
  - `x-phoenix-server-version: 15.5.0`

## Source Availability

Recent source discovery remains Codex-only for the credited proof window:

- Codex: `142` recent candidates, `50` included with `--max-files 50`
- Claude Code: `0` recent candidates
- OpenClaw: `0` recent candidates

All-time discovery proves the non-Codex source adapters still have available
inputs outside the active proof window:

- Codex: `3151` candidates, `50` included with `--all --max-files 50`
- Claude Code: `396` candidates, `50` included with `--all --max-files 50`
- OpenClaw: `1` candidate, `1` included with `--all --max-files 50`

The P6 proof keeps the bounded recent window and current timer budgets stable.
Backfill or broader source windows are deferred to P7 topology planning.

## Labels And Benchmarks

- The label queue returned `10` deploy-safe queued Codex task rows after
  isolation. No new labels were written because labels require explicit human
  outcome judgment.
- Added a real benchmark case for the isolation workflow:
  `ai-metrics-p6-proof-runner-isolation`
- Recorded a benchmark run for the isolated-runner config snapshot:
  `benchmark-run-6f5eacb09e645a4edbeb95a1a1c258eb806ad918d4f269d8adbb139ac18d05b9`
- Benchmark checks:
  - `worktree-lock`
  - `timer-working-directory`
  - `absolute-data-root`
  - `phoenix-health`
- Prompt hash:
  `7ee6aa38d0218345d0ed90ba6eeaf957104b288d776ad3ead8c67887dd8f8295`

The generated weekly report after isolation is:

- Markdown:
  `/home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics/reports/weekly-1777712918992-1778317718992.md`
- JSON:
  `/home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics/reports/weekly-1777712918992-1778317718992.json`

Scorecard summary:

| configSnapshotId | tasks | labels | benchmarks | completionReady | gaps |
| --- | ---: | ---: | ---: | --- | --- |
| `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52` | 5 | 0 | 1 | no | `no_labels`, unavailable model/tool/cost metrics |
| `config-d0b05a2d64c9c40c21e0df11f8cfc611be5ce41139f52f4db79b77f73ca895bc` | 5 | 1 | 1 | yes | unavailable model/tool/cost metrics |
| `config-910eecbb488885f42c4caea393b4dd4512bee62869a1f0df7c9a27d42839ebf1` | 10 | 0 | 0 | no | `no_labels`, `no_benchmark_runs`, unavailable model/tool/cost metrics |

## Daily Health Checklist

Run these commands serially. Do not run DuckDB-backed AI metrics commands in
parallel against the same local database.

Record dated daily results in
[p6-pre-may16-readiness-ledger.md](./p6-pre-may16-readiness-ledger.md) until the
proof window can be closed.

```sh
git -C /home/elpresidank/YeeBois/projects/beep-effect status --short --branch
git -C /home/elpresidank/YeeBois/projects/beep-effect-worktrees/ai-metrics-p6-proof status --short --branch
git -C /home/elpresidank/YeeBois/projects/beep-effect worktree list --porcelain

systemctl --user list-timers beep-ai-metrics-forwarder.timer --no-pager
systemctl --user show beep-ai-metrics-forwarder.service \
  --property=ActiveState,Result,ExecMainStatus,ExecMainStartTimestamp,ExecMainExitTimestamp \
  --no-pager
systemctl --user cat beep-ai-metrics-forwarder.service --no-pager

jq '{ingestRunId,configSnapshotId,sourceFileCount,turnCount,sourceCoverage,parquetExportDir}' \
  /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics/forwarder/status/latest.json

curl -kIs --max-time 10 https://dankserver.tailc7c348.ts.net:8447/ | sed -n '1,12p'

bun run beep ai-metrics sources discover \
  --target local \
  --hash-salt local-smoke \
  --json \
  --max-files 50

bun run beep ai-metrics label queue \
  --target dankserver \
  --data-root /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics \
  --hash-salt-secret-ref 'op://TBK/ai-metrics/hash-salt' \
  --raw-archive-key-secret-ref 'op://TBK/ai-metrics/raw-archive-key' \
  --json \
  --limit 10

bun run beep ai-metrics benchmark case list \
  --target dankserver \
  --data-root /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics \
  --hash-salt-secret-ref 'op://TBK/ai-metrics/hash-salt' \
  --raw-archive-key-secret-ref 'op://TBK/ai-metrics/raw-archive-key' \
  --json
```

## Final P6 Closeout Template

Do not mark P6 complete until after May 16, 2026 02:26 America/Chicago.

After the proof window, generate the final report:

```sh
bun run beep ai-metrics report weekly \
  --target dankserver \
  --data-root /home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics \
  --hash-salt-secret-ref 'op://TBK/ai-metrics/hash-salt' \
  --raw-archive-key-secret-ref 'op://TBK/ai-metrics/raw-archive-key' \
  --json
```

The final closeout should record:

- exact proof window start and end
- timer state and last successful service run
- latest forwarder run id, source coverage, derived turns, and Parquet export
- Phoenix health and version
- labels and benchmark runs linked to the scored config snapshots
- final weekly report paths and `completionReady` status
- remaining explicit not-scored gaps for model/tool/token/cost metrics
- whether any proof interruption happened, and whether the clock restarted
