# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772295334257
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
| adaptive_kg | 1 | 1 | 100.00% | 0 | $0.3505 | 100.00% | 4.40 |
| current | 1 | 1 | 100.00% | 0 | $0.8995 | 0.00% | n/a |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| codex:gpt-5.2 | 2 | 2 | 100.00% | 0 | $0.6250 | 50.00% | 4.40 |
