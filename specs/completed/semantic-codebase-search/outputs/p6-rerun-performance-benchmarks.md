# P6 Rerun Performance Benchmarks

Date: 2026-02-20
Harness: `scratchpad/p6-rerun-harness.mjs` (Node + built dist modules)
Raw results: `/tmp/p6-results.json`

## Targets

- MCP tool latency target: `< 3s`
- Full index build target: `< 30s`

## Reindex Timings

| Operation | Result | Time | Target | Status |
|---|---:|---:|---:|---|
| `reindex(mode=full)` | Completed | `18.166s` | `<30s` | PASS |
| `reindex(mode=incremental)` | Completed | `52ms` | `<3s` tool latency | PASS |

Final full-index stats:
- Files scanned: `69`
- Files changed: `69`
- Symbols indexed: `302`
- Symbols removed: `0`

Final incremental stats:
- Files scanned: `69`
- Files changed: `0`
- Symbols indexed: `0`
- Symbols removed: `0`

## MCP Tool Latency Samples

### `search_codebase`
- Runs: `99.33ms`, `82.81ms`, `77.18ms`
- Max: `99.33ms`
- Status: **PASS**

### `find_related`
- Runs: `138.76ms`, `131.47ms`, `167.87ms`
- Max: `167.87ms`
- Status: **PASS**

### `browse_symbols`
- Runs: `26.82ms`, `18.17ms`, `14.43ms`
- Max: `26.82ms`
- Status: **PASS**

### `reindex` (incremental latency samples)
- Runs: `99.75ms`, `77.35ms`
- Max: `99.75ms`
- Status: **PASS**

## Hook Runtime (informational)

| Hook check | Runtime |
|---|---:|
| `SessionStart` | `192.96ms` |
| `UserPromptSubmit` (coding prompt) | `426.44ms` |
| `UserPromptSubmit` (skip short) | `380.11ms` |
| `UserPromptSubmit` (skip meta) | `399.92ms` |

## Benchmark Verdict

**PASS** — all measured MCP tool latencies are below `3s`, and full index build is below `30s`.
