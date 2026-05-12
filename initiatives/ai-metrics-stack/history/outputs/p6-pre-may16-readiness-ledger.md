# P6 Pre-May-16 Readiness Ledger

## Status

Started on May 9, 2026 while the credited seven-day proof window is still
running.

This ledger records work that can safely move P6 closer to closeout before May
16, 2026 02:26 America/Chicago. It deliberately does not change the forwarder
implementation, timer cadence, `max-files` budget, source window, proof data
root, hash salt, archive key, or pinned proof worktree.

## Guardrails

- Do not mark P6 complete before May 16, 2026 02:26 America/Chicago.
- Do not restart the credited proof clock unless the proof runner, source
  window, privacy contract, timer cadence, or data root changes.
- Do not write outcome labels without explicit human judgment.
- Do not print raw transcript bodies, prompt text, output text, or secret
  values while collecting evidence.

## May 9, 2026 Readiness Check

Collected at approximately May 9, 2026 04:22-04:24 America/Chicago.

### Timer And Proof Runner

- Main checkout branch:
  `codex/ai-metrics-pre-may16-readiness`
- Proof runner worktree:
  `/home/elpresidank/YeeBois/projects/beep-effect-worktrees/ai-metrics-p6-proof`
- Proof runner state: detached and locked with reason
  `AI metrics P6 proof runner pinned through 2026-05-16`
- Proof runner commit:
  `63c419721c735bfb860ccfa9bf1b31efbb23e33c`
- Installed service working directory:
  `/home/elpresidank/YeeBois/projects/beep-effect-worktrees/ai-metrics-p6-proof`
- Installed service data root:
  `/home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics`
- Timer state: `enabled`, `active`
- Scheduled service run:
  - start: May 9, 2026 04:22:15 America/Chicago
  - exit: May 9, 2026 04:23:00 America/Chicago
  - state: `inactive`
  - result: `success`
  - exit status: `0`

### Latest Forwarder Status

- Ingest run:
  `forwarder-1778318537681`
- Config snapshot:
  `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52`
- Source files: `5`
- Derived turns: `3516`
- Source coverage:
  - Codex: `131` candidates, `5` included, `limitedByMaxFiles=true`,
    `10` size-excluded
  - Claude Code: `0` candidates, `0` included
  - OpenClaw: `0` candidates, `0` included
- Parquet export:
  `/home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics/derived/parquet/forwarder-1778318537681`

### Phoenix Health

- Endpoint: `https://dankserver.tailc7c348.ts.net:8447/`
- HTTP status: `200`
- Phoenix version header: `15.5.0`

### Source Discovery

Recent source discovery with `--max-files 50`:

| sourceKind | candidates | included | limitedByMaxFiles |
| --- | ---: | ---: | --- |
| `codex` | 141 | 50 | yes |
| `claude` | 0 | 0 | no |
| `openclaw` | 0 | 0 | no |

All-time source discovery with `--all --max-files 50`:

| sourceKind | candidates | included | limitedByMaxFiles |
| --- | ---: | ---: | --- |
| `codex` | 3151 | 50 | yes |
| `claude` | 396 | 50 | yes |
| `openclaw` | 1 | 1 | no |

The active proof remains Codex-only in the recent source window. Claude Code
and OpenClaw remain proven as adapter-visible all-time sources outside the
credited proof window.

### Labels

No labels were written during this readiness pass. The isolated-runner config
still needs at least one explicit human-approved outcome label before it can be
completion-ready.

Deploy-safe queued candidates for the isolated-runner config:

| agentTaskId | sourceKind | turnCount |
| --- | --- | ---: |
| `agent-task-c886e04027aa404a83038636272c53be5e7e157681749b3efb96c10a6202ca25` | `codex` | 506 |
| `agent-task-00ad860fd2e6e82770cd44cf8a76ee02b740dc38baf167f9a70b47313183b240` | `codex` | 1238 |
| `agent-task-75df913a8e64fe66e82381aa87ce98ea1864502c2640cba19dd2928a98682fc6` | `codex` | 410 |
| `agent-task-96b706f6e08bfffb44f60ede423e0a9b8bbd467bde6893a86505fc0f12768cd7` | `codex` | 494 |
| `agent-task-7185336c2117c8e71aa4814fac05bc7785a6c85c5775292175e36c212bd6d980` | `codex` | 4384 |

When the operator gives a judgment, use the CLI shape below and keep the note
redacted:

```sh
bun run beep ai-metrics label add \
  --target local \
  --task '<agent-task-id>' \
  --passed true \
  --quality-gate passed \
  --rating 5 \
  --interventions 0 \
  --follow-up-fix false \
  --note '<redacted human judgment note>' \
  --json
```

The exact `passed`, `quality-gate`, `rating`, `interventions`, and
`follow-up-fix` values must come from human review of the work outcome.

### Benchmarks

Recorded one additional benchmark run against the isolated-runner config after
the fresh scheduled timer health smoke:

- Benchmark run:
  `benchmark-run-b5aa29ef19fcf32c96f4db264895f25ee96980e662452f862eef149fe61ded9a`
- Benchmark case:
  `ai-metrics-p6-proof-runner-isolation`
- Config snapshot:
  `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52`
- Passed: `true`
- Quality gate: `passed`
- Elapsed: `45000` milliseconds
- Redacted note:
  `2026-05-09 04:22 CDT scheduled timer health smoke: forwarder-1778318537681, Phoenix 15.5.0, proof worktree unchanged`

`ai-metrics benchmark compare --json` still reports the outcome-heavy score
model as `ready-for-derived-runs`.

### Intermediate Report

Generated an intermediate local weekly report after the extra benchmark run:

- Markdown:
  `.beep/ai-metrics/reports/weekly-1777713840128-1778318640128.md`
- JSON:
  `.beep/ai-metrics/reports/weekly-1777713840128-1778318640128.json`

Scorecard summary:

| configSnapshotId | tasks | labels | benchmarks | completionReady | gaps |
| --- | ---: | ---: | ---: | --- | --- |
| `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52` | 5 | 0 | 2 | no | `no_labels`, unavailable model/tool/cost metrics |
| `config-d0b05a2d64c9c40c21e0df11f8cfc611be5ce41139f52f4db79b77f73ca895bc` | 5 | 1 | 1 | yes | unavailable model/tool/cost metrics |
| `config-910eecbb488885f42c4caea393b4dd4512bee62869a1f0df7c9a27d42839ebf1` | 10 | 0 | 0 | no | `no_labels`, `no_benchmark_runs`, unavailable model/tool/cost metrics |

## May 12, 2026 P6c/P7a-b Safe Proof

Collected at approximately May 12, 2026 07:02-07:11 America/Chicago.

This pass reconciled the merged P7a/b implementation with the still-running P6
proof. It did not rerender the timer, update the pinned proof worktree, write
outcome labels, confirm remote mirror sync, run retention delete/compact, or
write mirror artifacts into the active proof data root.

### Timer And Proof Runner

- Follow-up branch:
  `codex/ai-metrics-p6c-p7-followup`
- Proof runner worktree:
  `/home/elpresidank/YeeBois/projects/beep-effect-worktrees/ai-metrics-p6-proof`
- Proof runner state: detached and locked with reason
  `AI metrics P6 proof runner pinned through 2026-05-16`
- Proof runner commit:
  `63c419721c735bfb860ccfa9bf1b31efbb23e33c`
- Installed service working directory:
  `/home/elpresidank/YeeBois/projects/beep-effect-worktrees/ai-metrics-p6-proof`
- Installed service data root:
  `/home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics`
- Timer state: enabled, active, next scheduled run May 12, 2026 07:12:14
  America/Chicago
- Last scheduled service run:
  - start: May 12, 2026 06:56:36 America/Chicago
  - exit: May 12, 2026 06:56:54 America/Chicago
  - state: `inactive`
  - result: `success`
  - exit status: `0`

### Latest Forwarder Status

- Ingest run:
  `forwarder-1778586999944`
- Config snapshot:
  `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52`
- Source files: `5`
- Derived turns: `1300`
- Source coverage:
  - Codex: `178` candidates, `5` included, `limitedByMaxFiles=true`,
    `14` size-excluded
  - Claude Code: `0` candidates, `0` included
  - OpenClaw: `0` candidates, `0` included
- Parquet export:
  `/home/elpresidank/YeeBois/projects/beep-effect/.beep/ai-metrics/derived/parquet/forwarder-1778586999944`
- `otlpExport`: `null` because the pinned proof runner still predates the
  later additive forwarder OTLP status behavior.

### Phoenix Health

- Endpoint: `https://dankserver.tailc7c348.ts.net:8447/`
- HTTP status: `200`
- Phoenix version header: `15.5.0`

### Source Discovery

Recent source discovery with `--max-files 50`:

| sourceKind | candidates | included | limitedByMaxFiles | status |
| --- | ---: | ---: | --- | --- |
| `codex` | 192 | 50 | yes | available |
| `claude` | 0 | 0 | no | missing source root |
| `openclaw` | 0 | 0 | no | outside selected modified-time window |

The active proof remains Codex-only in the recent source window.

### Labels

No labels were written during this pass. The isolated-runner config still needs
at least one explicit human-approved outcome label before it can be
completion-ready.

Deploy-safe queued candidates for the isolated-runner config:

| agentTaskId | sourceKind | turnCount |
| --- | --- | ---: |
| `agent-task-39551a738402b9c791196b3de15fa175bf769e842f3bb9ec0d1ce0bbe80eb412` | `codex` | 667 |
| `agent-task-f86914324ec15a092d633bbc488c0805753ffcad47f05264fe7856cc94a899fd` | `codex` | 237 |
| `agent-task-65680d514e2390632e656a50fbc3901bbf9f960922145caa48f018b7ada7b367` | `codex` | 971 |
| `agent-task-c334eba9e05c99e900fdd45f85e862e4e0a2760aa4ca01989a87aab0747d2890` | `codex` | 674 |
| `agent-task-48742b6c550eb989114387986a1a9240911d6e0b54f7d4c1994b5a7677bf0f82` | `codex` | 716 |
| `agent-task-13273f8bab1d156c6d328c5aa62df35ac67517941c0d053a2e34df01c7d1002b` | `codex` | 500 |
| `agent-task-996c5816d995a4eea270f20aa95f31f651f694bc5b4c7ac28bd29971ed706936` | `codex` | 1606 |
| `agent-task-74e4bc43392308fde95146540c04d790132ad90c41db698ea3b6ab863f8119c2` | `codex` | 2911 |
| `agent-task-9294bfe8f5811865405c8bb55ac3c1828251deda61d61e35e66d652fb6692221` | `codex` | 1687 |
| `agent-task-9b229e6e7b921d951a225503edc0c85dcd8d338eeb8e04bc24ec56c11d15f1de` | `codex` | 2617 |

### Benchmarks And Report State

Benchmark case list returned two cases:

- `ai-metrics-p6-proof-runner-isolation`
- `ai-metrics-p6a-closeout-smoke`

Latest existing weekly report inspected:

- Markdown:
  `.beep/ai-metrics/reports/weekly-1777952495719-1778557295719.md`
- JSON:
  `.beep/ai-metrics/reports/weekly-1777952495719-1778557295719.json`

Scorecard summary:

| configSnapshotId | tasks | labels | benchmarks | completionReady | gaps |
| --- | ---: | ---: | ---: | --- | --- |
| `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52` | 26 | 0 | 2 | no | `no_labels`, unavailable model/tool/cost metrics |
| `config-910eecbb488885f42c4caea393b4dd4512bee62869a1f0df7c9a27d42839ebf1` | 10 | 0 | 0 | no | `no_labels`, `no_benchmark_runs`, unavailable model/tool/cost metrics |
| `config-d0b05a2d64c9c40c21e0df11f8cfc611be5ce41139f52f4db79b77f73ca895bc` | 5 | 1 | 1 | yes | unavailable model/tool/cost metrics |

### P7 Mirror And Retention Proof

- Copied the active proof data root to disposable root
  `/tmp/ai-metrics-p7-proof-data` for mirror build proof.
- Disposable copy size: `3.5G`.
- Mirror build succeeded:
  - bundle id: `p7-mirror-1778587546832`
  - bundle root:
    `/tmp/ai-metrics-p7-proof-data/mirror/bundles/p7-mirror-1778587546832`
  - privacy proof: `safe=true`, `forbiddenMatches=[]`
  - omitted table: `ai_metrics_raw_archive_objects`
  - mirror work DuckDB was cleaned after build
- Mirror row counts:

| table | rows |
| --- | ---: |
| `ai_metrics_ingest_runs` | 117 |
| `ai_metrics_source_files` | 595 |
| `ai_metrics_agent_tasks` | 69 |
| `ai_metrics_sessions` | 595 |
| `ai_metrics_turns` | 412929 |
| `ai_metrics_model_calls` | 0 |
| `ai_metrics_tool_invocations` | 0 |
| `ai_metrics_outcome_labels` | 1 |
| `ai_metrics_benchmark_cases` | 2 |
| `ai_metrics_benchmark_runs` | 3 |
| `ai_metrics_scorecards` | 24 |

- Mirror sync stayed dry-run and planned only:
  - `ssh dankserver-yubi mkdir -p /srv/data/ai-metrics/p7-derived-mirror`
  - `rsync -az --delete ... dankserver-yubi:/srv/data/ai-metrics/p7-derived-mirror/`
  - confirmation token remains `p7-derived-mirror`
- Remote mirror status is not present yet. Direct remote check showed
  `/srv/data/ai-metrics/p7-derived-mirror/manifest.json` is `missing`, which is
  expected because no confirmed sync was run.
- Retention inventory against the active root succeeded without mutation:
  - raw archive object rows: `595`
  - derived export directories: `122`
  - report files: `18`
- Restore drill first rejected the disposable copy because copied DuckDB rows
  still point at the active raw archive layout; that path validation is
  expected for copied data roots.
- Restore drill then used the active root as read source and
  `/tmp/ai-metrics-p7-restore` as disposable restore target for the bounded
  window `2026-05-12T11:00:00Z` to `2026-05-12T13:00:00Z`:
  - replayed objects: `1`
  - hash matched: `true`
  - transcript text printed: `false`

## Remaining Pre-May-16 Work

- Continue daily timer/Phoenix/source/report health checks without changing the
  proof runner or source window.
- Keep the credited proof running until May 16, 2026 02:26 America/Chicago,
  then generate the final seven-day report.
- Keep additional P7 work limited to P7a/b health proof and documentation until
  the credited proof window completes or is explicitly abandoned. Any P7 proof
  that writes mirror or restore artifacts must run against a disposable copy of
  the proof data root rather than the active root.

## May 12, 2026 P6c Label Gate

Collected at approximately May 12, 2026 10:58 America/Chicago.

This pass used the explicit human clean-pass judgment from the planning session
and did not change the proof runner, timer cadence, source window, proof data
root, hash salt, archive key, or pinned proof worktree.

### Label

- Label id:
  `label-a97eea43d276877eb5a28283a57a39cf00ece92b4b098f82d92f552815d31b84`
- Agent task:
  `agent-task-f86914324ec15a092d633bbc488c0805753ffcad47f05264fe7856cc94a899fd`
- Config snapshot:
  `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52`
- Passed: `true`
- Quality gate: `passed`
- Rating: `5`
- Interventions: `0`
- Follow-up fix: `false`
- Note: `P6c human review: clean pass; no follow-up fix required; redacted note only.`

### Regenerated Intermediate Report

- Markdown:
  `.beep/ai-metrics/reports/weekly-1777996696860-1778601496860.md`
- JSON:
  `.beep/ai-metrics/reports/weekly-1777996696860-1778601496860.json`

Scorecard summary for the active isolated-runner config:

| configSnapshotId | tasks | labels | benchmarks | completionReady | gaps |
| --- | ---: | ---: | ---: | --- | --- |
| `config-6c5738fd0e1932ced6043ab52c7df04e52278b1024470769243b724c265f7d52` | 58 | 1 | 2 | yes | unavailable model/tool/cost metrics |

The human-label gate is closed for P6c. The remaining closeout gate is elapsed
proof time through May 16, 2026 02:26 America/Chicago, followed by the final
seven-day report and V1 mirror closeout.
