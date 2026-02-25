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

## Agent Invocation Contract

1. Codex: `codex exec --json --model gpt-5.2 <prompt>`
2. Claude: `claude -p <prompt> --output-format json --model claude-sonnet-4-6`
3. Model pins: `gpt-5.2` and `claude-sonnet-4-6`.

## Schema Contract

1. Suite rows are stored under top-level `records`.
2. Full matrix target: `18 tasks x 4 conditions x 2 agents x 2 trials = 288` records.

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
   - unique per-run worktree path
   - repo `node_modules` symlinked into worktree so `bun run` tools resolve
   - dirty primary-tree fallback is blocked when worktree creation fails
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

## Exit Gate Status

1. Dry baseline artifacts: complete.
2. Smoke gate (`24` records): complete.
3. Mandatory Effect-first scorer contract: implemented and validated.
4. Baseline acceptance + runner reliability cleanup: complete.
5. Full live candidate + compare: pending rerun after push.
