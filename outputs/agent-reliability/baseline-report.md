# Agent Reliability Benchmark Report

- formatVersion: 1
- runAtEpochMs: 1772265104247
- runMode: simulate
- executionBackend: mixed
- status: completed
- strictTaskCount: 18
- plannedRunCount: 288
- completedRunCount: 288
- totalRuns: 288

## By Condition

| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost |
|---|---:|---:|---:|---:|---:|
| adaptive | 72 | 72 | 100.00% | 0 | $0.0018 |
| adaptive_kg | 72 | 72 | 100.00% | 0 | $0.0019 |
| current | 72 | 72 | 100.00% | 0 | $0.0022 |
| minimal | 72 | 72 | 100.00% | 0 | $0.0014 |

## By Agent

| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost |
|---|---:|---:|---:|---:|---:|
| claude:claude-sonnet-4-6 | 144 | 144 | 100.00% | 0 | $0.0030 |
| codex:gpt-5.2 | 144 | 144 | 100.00% | 0 | $0.0011 |
