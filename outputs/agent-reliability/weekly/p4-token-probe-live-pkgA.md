# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772296651170
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
| adaptive_kg | 1 | 1 | 100.00% | 0 | $0.7749 | 0.00% | 4.20 |
| current | 1 | 1 | 100.00% | 0 | $0.4226 | 0.00% | n/a |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| codex:gpt-5.2 | 2 | 2 | 100.00% | 0 | $0.5987 | 0.00% | 4.20 |
