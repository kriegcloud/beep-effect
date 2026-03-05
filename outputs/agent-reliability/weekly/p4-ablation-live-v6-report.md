# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772298656718
- runMode: live
- executionBackend: cli
- status: completed
- strictTaskCount: 4
- plannedRunCount: 16
- completedRunCount: 16
- totalRuns: 16

## By Condition

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| adaptive | 4 | 0 | 0.00% | 0 | $0.0019 | 0.00% | n/a |
| adaptive_kg | 4 | 0 | 0.00% | 0 | $0.0021 | 50.00% | 4.35 |
| current | 4 | 0 | 0.00% | 0 | $0.0024 | 0.00% | n/a |
| minimal | 4 | 0 | 0.00% | 0 | $0.0015 | 0.00% | n/a |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| codex:gpt-5.2 | 16 | 0 | 0.00% | 0 | $0.0020 | 12.50% | 4.35 |
