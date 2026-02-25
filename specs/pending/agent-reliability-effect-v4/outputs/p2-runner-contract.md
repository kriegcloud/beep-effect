# P2 Runner Contract

## Modes

1. `dry`: no external agent CLI invocation; deterministic local regression mode.
2. `live`: executes Codex or Claude CLI with pinned models.

## Bench Flag Contract

1. `--live` default: `false`.
2. `--worktree` default: `true` (disposable git worktree isolation).
3. `--trials` default: `2`.
4. `--strict-task-count` default: `18`.
5. `--smoke` default: `false`.
6. `--smoke-task-limit` default: `1`.
7. `--smoke-timeout-minutes` default: `1`.
8. `--graphiti-url` default: `http://localhost:8000/mcp`.
9. `--graphiti-group-id` default: `beep-dev`.
10. `--conditions` default: all (`current,minimal,adaptive,adaptive_kg`).
11. `--agents` default: both (`codex,claude`).
12. `--task-ids` default: empty (no filter; all loaded tasks).
13. `--max-wall-minutes` default: unset (no suite wall cap).
14. `--progress-output` default: `${output}.progress.jsonl`.
15. `--diagnostics` default: `false`.
16. `--diagnostics-output` default: `${output}.diagnostics.jsonl`.
17. `--codex-model` default: `gpt-5.2`.
18. `--claude-model` default: `claude-sonnet-4-6`.
19. `--reasoning` default: unset.
    - accepted values: `none,minimal,low,medium,high,xhigh`
    - codex mapping: `-c model_reasoning_effort="<value>"`
    - claude compatibility: only `low|medium|high` are valid when Claude is selected
20. `--claude-effort` default: unset (legacy alias; same as `--reasoning` for Claude-compatible values).
21. `--worktree-root` default (when `--worktree true`):
    - `${XDG_CACHE_HOME}/<repo-basename>/agent-eval/worktrees` when `XDG_CACHE_HOME` is set.
    - `${HOME}/.cache/<repo-basename>/agent-eval/worktrees` otherwise.
    - config error when neither `XDG_CACHE_HOME` nor `HOME` is available.

### Targeting + Budget Rules

1. `strict-task-count` validation is performed against the full loaded catalog before any `task-ids` filtering.
2. `task-ids` filters are exact ID matches and fail fast when any unknown task ID is requested.
3. `max-wall-minutes` applies at suite scope:
   - each subprocess timeout is capped by remaining suite wall budget
   - suite aborts safely when budget is exhausted
   - partial artifacts are still written
   - CLI exits non-zero after writing partial artifacts
4. `progress-output` is incrementally flushed during the run (JSONL), not only at suite end.
5. When `--diagnostics true`, `diagnostics-output` receives machine-readable forensic events:
   - `run.diagnostic`: raw `git status --porcelain`, parsed touched paths, first allowlist mismatch, acceptance command outcome, detector rule IDs, and run root-cause summary
   - `suite.metrics`: aggregate counts (`success`, `wrong_api`, `effect_compliance`, `acceptance`, `allowlist`, `runtime`) plus cost/wall-clock totals
6. Model/effort overrides:
   - `--codex-model` and `--claude-model` override default pinned models for experiments
   - `--reasoning` sets unified effort for both providers (`model_reasoning_effort` for Codex, `--effort` for Claude)
   - `--claude-effort` remains accepted for backward compatibility and conflicts with `--reasoning` if values differ
7. Worktree isolation root:
   - `--worktree-root` accepts absolute or relative paths and supports `~/...` expansion via `HOME`.
   - default root is repo-portable and keyed by repository basename.
   - worktree root is created before suite execution when isolation is enabled.
   - worktree creation is fail-fast; no fallback to primary repo cwd.

## Agent Invocation Contract

1. Codex: `codex exec --json --model gpt-5.2 [-c model_reasoning_effort="<value>"] <prompt>`
2. Claude: `claude -p <prompt> --output-format json --model claude-sonnet-4-6`
3. Model pins: `gpt-5.2` and `claude-sonnet-4-6`.

## Schema Contract

1. Suite rows are stored under top-level `records`.
2. Full matrix target: `18 tasks x 4 conditions x 2 agents x 2 trials = 288` records.
3. Suite-level incomplete metadata (optional for backward compatibility):
   - `status`: `completed | aborted_wall_cap`
   - `plannedRunCount`
   - `completedRunCount`
   - `abortReason` (nullable string)

## Effect-First Compliance Gate (Mandatory)

Scoring now enforces mandatory Effect-first usage from touched source files (`*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.mts`, `*.cts`) and fails runs on critical violations.

### Enforced anti-patterns

1. Node core FS/path usage (`node:fs`, `node:path`, and require variants).
2. Native date APIs (`Date.now`, `new Date`).
3. Native array chains (`.map`, `.flatMap`, `.filter`, `.reduce`) outside Effect aliases.
4. Native JSON APIs (`JSON.parse`, `JSON.stringify`).
5. `S.Union([S.Literal(...), ...])` where `S.Literals([...])` should be used.
6. Native errors (`new Error`, `extends Error`).
7. Native `try/catch` blocks.
8. Nullable unions/initializers (`| null`, `= null`).
9. Type assertions (`as ...`) and non-null assertions (`!`).
10. Native throw statements (`throw ...`).
11. Native Promise construction/statics (`new Promise`, `Promise.all`, etc.).

## Verification Evidence (February 25, 2026)

### Stage 0: Safety Gate

1. `bun run --cwd tooling/agent-eval check` passed.
2. `bun run --cwd tooling/agent-eval lint` passed.
3. `bun run --cwd tooling/agent-eval test` passed.
4. `bun run --cwd tooling/agent-eval docgen` passed.

### Stage 1: Authoritative Dry Baseline

Command:

```bash
bun run agent:bench -- --live false --output outputs/agent-reliability/runs/baseline.json --report-output outputs/agent-reliability/baseline-report.md
```

Observed suite (`outputs/agent-reliability/runs/baseline.json`):

1. `recordCount`: `288`
2. `strictTaskCount`: `18`
3. Per condition: `72` each (`current`, `minimal`, `adaptive`, `adaptive_kg`)
4. Per agent: `144` each (`codex`, `claude`)

### Stage 2: Live Smoke (3-task subset)

Executed bounded smoke command:

```bash
bun run agent:bench -- --live true --task-directory /tmp/p2-live-smoke-tasks --strict-task-count 3 --smoke true --smoke-task-limit 3 --smoke-timeout-minutes 1 --trials 1 --output /tmp/p2-live-smoke.json --report-output /tmp/p2-live-smoke.md
```

Hard gate check:

```bash
bun -e 'import fs from "node:fs";const s=JSON.parse(fs.readFileSync("/tmp/p2-live-smoke.json","utf8"));const n=(s.records??[]).length;if(n!==24)process.exit(1);'
```

Observed smoke summary:

1. `recordCount`: `24`
2. `success`: `0`
3. `failures`: `24`
4. Failure types: `allowlist=3`, `acceptance=21`
5. Compliance-rule hits observed: `node-core-import`, `type-assertion-as`

Smoke artifacts archived:

1. `outputs/agent-reliability/runs/live-smoke-strict3.json`
2. `outputs/agent-reliability/weekly/live-smoke-strict3.md`

### Runner Reliability Fixes Applied After Stage 2

1. Fixed touched-path parsing bug that dropped the first character of each `git status --porcelain` path.
2. Hardened worktree behavior:
   - unique per-run worktree path under external cache root
   - repo `node_modules` symlinked into worktree so `bun run` tools resolve
   - no primary-tree fallback when worktree creation fails (explicit invariant error)
3. Ignored benchmark-injected `node_modules` path from touched-path allowlist scoring.
4. Fixed failure signature classification to distinguish:
   - `runtime` (agent command failed/timed out)
   - `acceptance` (acceptance command failed)
5. Added explicit hard constraints to prompt packets so agents are warned about scorer-enforced bans.

Post-fix one-task live smoke validation (`tooling_cli_01`, strict=1, smoke timeout=1 minute):

1. `recordCount`: `8`
2. `allowlist` failures: `0` (false positive resolved)
3. Remaining failures were non-allowlist (agent execution quality/success issue), not isolation/path artifacts.

### Acceptance Baseline Health (direct repo checks)

1. `apps/web`: `bun run lint` passes.
2. `tooling/cli`: `bun run check` passes.
3. `packages/common/utils`: `bun run check` passes.

Interpretation: local baseline acceptance commands are now green before rerun.

### Stage 3: Full Live Candidate + Compare

Current execution command (started):

```bash
bun run agent:bench -- --live true --output outputs/agent-reliability/runs/latest.json --report-output outputs/agent-reliability/weekly/latest-report.md
```

Then compare command:

```bash
bun run agent:bench:compare -- --baseline outputs/agent-reliability/runs/baseline.json --candidate outputs/agent-reliability/runs/latest.json --output outputs/agent-reliability/weekly/compare.md --title "Agent Reliability Comparison (Baseline vs Live Candidate)"
```

Status: `ready_to_rerun_after_push` (previous managed live run was intentionally stopped while baseline and runner-contract fixes were applied).

## Targeted Recipes

### 1) Effect-compliance focused slice

```bash
bun run agent:bench -- \
  --live true \
  --trials 1 \
  --task-ids package_lib_01,package_lib_02,package_lib_05 \
  --conditions adaptive,adaptive_kg \
  --agents codex,claude \
  --max-wall-minutes 30 \
  --output /tmp/effect-compliance.json \
  --report-output /tmp/effect-compliance.md
```

### 2) Runtime-stability focused slice

```bash
bun run agent:bench -- \
  --live true \
  --trials 1 \
  --task-ids apps_web_01 \
  --conditions current,minimal \
  --agents codex,claude \
  --max-wall-minutes 20 \
  --output /tmp/runtime-stability.json \
  --report-output /tmp/runtime-stability.md
```

### 3) Agent-comparison focused slice

```bash
bun run agent:bench -- \
  --live true \
  --trials 1 \
  --task-ids tooling_cli_01,tooling_cli_02,tooling_cli_04 \
  --conditions minimal \
  --agents codex,claude \
  --max-wall-minutes 25 \
  --output /tmp/agent-compare.json \
  --report-output /tmp/agent-compare.md
```

### 4) Forensic diagnostic smoke

```bash
bun run agent:bench -- \
  --live true \
  --smoke true \
  --smoke-task-limit 3 \
  --smoke-timeout-minutes 3 \
  --trials 1 \
  --task-ids apps_web_01,tooling_cli_01,package_lib_01 \
  --conditions minimal \
  --agents codex,claude \
  --diagnostics true \
  --output /tmp/agent-diagnostics-smoke.json \
  --report-output /tmp/agent-diagnostics-smoke.md
```

### 5) Model-override smoke (speed vs quality probe)

```bash
bun run agent:bench -- \
  --live true \
  --smoke true \
  --smoke-task-limit 1 \
  --smoke-timeout-minutes 8 \
  --task-ids tooling_cli_01 \
  --conditions minimal \
  --agents codex,claude \
  --codex-model gpt-5.3-codex-spark \
  --claude-model claude-sonnet-4-6 \
  --claude-effort low \
  --diagnostics true \
  --output /tmp/model-override-smoke.json \
  --report-output /tmp/model-override-smoke.md
```

## Exit Gate Status

1. Dry baseline artifacts: complete.
2. Smoke gate (`24` records): complete.
3. Mandatory Effect-first scorer contract: implemented and validated.
4. Baseline acceptance + runner reliability cleanup: complete.
5. Full live candidate + compare: pending rerun after push.
