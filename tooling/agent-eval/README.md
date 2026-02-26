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
- Worktree root (default): `${XDG_CACHE_HOME}/<repo-basename>/agent-eval/worktrees` or `${HOME}/.cache/<repo-basename>/agent-eval/worktrees`

## Bench Flags (selected)

- `--worktree` (default `true`)
- `--worktree-root <path>` (optional override; supports `~/...`)
- `--execution-backend <auto|cli|sdk>` (default `auto`)
- `--reasoning <none|minimal|low|medium|high|xhigh>` (unified reasoning effort)
- `--claude-effort <low|medium|high>` (legacy alias; prefer `--reasoning`)

## Graphiti Reliability Guard

`tooling/agent-eval/src/graphiti/mcp.ts` now includes:

- global cross-process serialization (lock directory) for MCP tool calls
- retry with exponential backoff + jitter for initialize/tool requests
- session reuse per Graphiti URL with reset-on-failure behavior

Environment knobs:

- `BEEP_GRAPHITI_SERIALIZE` (`true` by default)
- `BEEP_GRAPHITI_LOCK_DIR` (default `${TMPDIR:-/tmp}/beep-graphiti-memory.lock`)
- `BEEP_GRAPHITI_LOCK_TIMEOUT_MS` (default `45000`)
- `BEEP_GRAPHITI_RETRY_ATTEMPTS` (default `5`)
- `BEEP_GRAPHITI_RETRY_BASE_MS` (default `200`)
- `BEEP_GRAPHITI_RETRY_MAX_MS` (default `2000`)
- `BEEP_GRAPHITI_RETRY_JITTER_MS` (default `125`)

## Local Graphiti Queue Proxy (multi-clone safety)

Run one local proxy that serializes/queues all MCP traffic before forwarding to Graphiti:

- Start: `bun run graphiti:proxy`
- Health: `http://127.0.0.1:8123/healthz`
- Metrics: `http://127.0.0.1:8123/metrics`

Proxy knobs:

- `GRAPHITI_PROXY_HOST` (default `127.0.0.1`)
- `GRAPHITI_PROXY_PORT` (default `8123`)
- `GRAPHITI_PROXY_UPSTREAM` (default `http://127.0.0.1:8000/mcp`)
- `GRAPHITI_PROXY_CONCURRENCY` (default `1`)
- `GRAPHITI_PROXY_MAX_QUEUE` (default `500`)
- `GRAPHITI_PROXY_REQUEST_TIMEOUT_MS` (default `60000`)
- `GRAPHITI_PROXY_VERBOSE` (default `false`)

Route all clones/tools to the proxy MCP URL:

- `http://127.0.0.1:8123/mcp`

This allows one shared queue across multiple repo clones and agent processes, instead of each process overloading Graphiti directly.
