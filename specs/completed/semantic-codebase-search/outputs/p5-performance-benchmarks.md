# P5 Performance Benchmarks

Date: 2026-02-20
Harness: `.tmp-p5-runner-safe.mjs` (Bun runtime)
Raw results: `/tmp/p5-results-safe.json`

## Targets

- MCP tool latency target: `< 3s`
- Full index build target: `< 30s`

## Reindex Timings

| Operation | Result | Time | Target | Status |
|---|---:|---:|---:|---|
| `reindex(mode=full)` | Failed before indexing | 239.72ms | `<30s` full build | FAIL (blocked) |
| `reindex(mode=incremental)` | Failed before indexing | 78.19ms | `<3s` tool latency | FAIL (blocked) |

Failure message:
- `Failed to load embedding model: Could not locate file: "https://huggingface.co/nomic-ai/CodeRankEmbed/resolve/main/onnx/model.onnx".`

## MCP Tool Latency Runs

### `search_codebase`
- Runs: `54.10ms`, `55.13ms`, `65.25ms`
- Result: all failed before producing results (embedding init error)
- Status: **FAIL (blocked)**

### `browse_symbols`
- Runs: `56.17ms`, `64.90ms`, `55.90ms`
- Result: all failed before browse execution (embedding init error during layer startup)
- Status: **FAIL (blocked)**

### `find_related`
- Result: skipped (no retrievable seed symbol because `search_codebase` failed)
- Status: **FAIL (blocked)**

### `reindex` (incremental latency samples)
- Runs: `53.08ms`, `57.88ms`
- Result: failed before indexing (same embedding init error)
- Status: **FAIL (blocked)**

## Hook Runtime (informational)

Hook runtime is within timeout budget, but this does not satisfy MCP latency gates.

| Hook check | Runtime |
|---|---:|
| `SessionStart` | `236.09ms` |
| `UserPromptSubmit` (coding prompt) | `470.98ms` |
| `UserPromptSubmit` (skip short) | `462.35ms` |
| `UserPromptSubmit` (skip meta) | `458.83ms` |

## Benchmark Verdict

**FAIL** — MCP tool and index benchmarks are blocked by embedding model initialization failure; target comparisons are not meaningful until this defect is fixed.
