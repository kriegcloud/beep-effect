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
