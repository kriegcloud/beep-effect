# @beep/agent-eval

Benchmark and reliability harness for Codex + Claude workflows in the beep-effect monorepo.

## Commands

- `bench`: run benchmark suite and emit JSON artifacts
- `report`: render markdown report from benchmark JSON
- `compare`: compare two benchmark runs
- `ingest`: convert failed runs to Graphiti-compatible feedback episodes

## Default Paths

- Tasks: `benchmarks/agent-reliability/tasks`
- Run output: `outputs/agent-reliability/runs/latest.json`
- Weekly reports: `outputs/agent-reliability/weekly/`
- Worktree root (default): `${XDG_CACHE_HOME}/beep-effect3/agent-eval/worktrees` or `${HOME}/.cache/beep-effect3/agent-eval/worktrees`

## Bench Flags (selected)

- `--worktree` (default `true`)
- `--worktree-root <path>` (optional override; supports `~/...`)
- `--reasoning <none|minimal|low|medium|high|xhigh>` (unified reasoning effort)
- `--claude-effort <low|medium|high>` (legacy alias; prefer `--reasoning`)
