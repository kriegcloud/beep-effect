# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772293315461
- runMode: live
- executionBackend: cli
- status: completed
- strictTaskCount: 1
- plannedRunCount: 2
- completedRunCount: 2
- totalRuns: 2

## By Condition

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| adaptive_kg | 1 | 1 | 100.00% | 0 | $0.7266 | 0.00% | 4.40 |
| current | 1 | 0 | 0.00% | 0 | $0.0024 | 0.00% | n/a |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| codex:gpt-5.2 | 2 | 1 | 50.00% | 0 | $0.3645 | 0.00% | 4.40 |
