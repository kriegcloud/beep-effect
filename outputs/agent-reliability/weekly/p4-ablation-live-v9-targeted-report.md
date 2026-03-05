# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772299651692
- runMode: live
- executionBackend: cli
- status: completed
- strictTaskCount: 1
- plannedRunCount: 8
- completedRunCount: 8
- totalRuns: 8

## By Condition

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| adaptive | 2 | 0 | 0.00% | 0 | $0.3965 | 0.00% | n/a |
| adaptive_kg | 2 | 2 | 100.00% | 0 | $0.5787 | 100.00% | 4.40 |
| current | 2 | 0 | 0.00% | 0 | $0.4246 | 0.00% | n/a |
| minimal | 2 | 0 | 0.00% | 0 | $0.5336 | 0.00% | n/a |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| codex:gpt-5.2 | 8 | 2 | 25.00% | 0 | $0.4836 | 25.00% | 4.40 |
