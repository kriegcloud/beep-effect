# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772298087951
- runMode: simulate
- executionBackend: mixed
- status: completed
- strictTaskCount: 18
- plannedRunCount: 288
- completedRunCount: 288
- totalRuns: 288

## By Condition

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| adaptive | 72 | 72 | 100.00% | 0 | $0.0018 | 100.00% | n/a |
| adaptive_kg | 72 | 72 | 100.00% | 0 | $0.0019 | 100.00% | 4.28 |
| current | 72 | 72 | 100.00% | 0 | $0.0022 | 0.00% | n/a |
| minimal | 72 | 72 | 100.00% | 0 | $0.0014 | 100.00% | n/a |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| claude:claude-sonnet-4-6 | 144 | 144 | 100.00% | 0 | $0.0030 | 75.00% | 4.27 |
| codex:gpt-5.2 | 144 | 144 | 100.00% | 0 | $0.0011 | 75.00% | 4.27 |
