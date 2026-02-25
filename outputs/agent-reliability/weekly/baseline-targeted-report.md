# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772048632429
- status: completed
- strictTaskCount: 3
- plannedRunCount: 24
- completedRunCount: 24
- totalRuns: 24

## By Condition

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost |
|---|---:|---:|---:|---:|---:|
| adaptive | 6 | 6 | 100.00% | 0 | $0.0017 |
| adaptive_kg | 6 | 6 | 100.00% | 0 | $0.0019 |
| current | 6 | 6 | 100.00% | 0 | $0.0021 |
| minimal | 6 | 6 | 100.00% | 0 | $0.0014 |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost |
|---|---:|---:|---:|---:|---:|
| claude:claude-sonnet-4-6 | 12 | 12 | 100.00% | 0 | $0.0030 |
| codex:gpt-5.2 | 12 | 12 | 100.00% | 0 | $0.0011 |
