# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772297053517
- runMode: live
- executionBackend: cli
- status: completed
- strictTaskCount: 1
- plannedRunCount: 4
- completedRunCount: 4
- totalRuns: 4

## By Condition

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| adaptive | 1 | 0 | 0.00% | 0 | $0.3740 | 0.00% | n/a |
| adaptive_kg | 1 | 1 | 100.00% | 0 | $0.3617 | 100.00% | 4.40 |
| current | 1 | 0 | 0.00% | 0 | $0.9900 | 0.00% | n/a |
| minimal | 1 | 0 | 0.00% | 0 | $0.2976 | 0.00% | n/a |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| codex:gpt-5.2 | 4 | 1 | 25.00% | 0 | $0.3678 | 25.00% | 4.40 |
