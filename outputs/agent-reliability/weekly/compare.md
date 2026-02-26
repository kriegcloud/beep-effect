# Agent Reliability Comparison (Baseline Targeted vs Confidence-Smoke Candidate)

- baselineRunAtEpochMs: 1772048632429
- baselineStatus: completed
- candidateRunAtEpochMs: 1772063516615
- candidateStatus: completed
- baselineRunMode: simulate
- candidateRunMode: live
- baselineExecutionBackend: unknown
- candidateExecutionBackend: sdk

> NON-COMPARABLE: baseline and candidate do not share equivalent matrix/run-mode assumptions.
> - conditions differ (baseline=adaptive,adaptive_kg,current,minimal candidate=minimal).
> - runMode differs (baseline=simulate, candidate=live).

| Metric | Baseline | Candidate | Delta |
|---|---:|---:|---:|
| Success Rate | 100.00% | 0.00% | -100.00pp |
| Wrong-API Incidents | 0 | 23 | 23 |
| Run Count | 24 | 6 | -18 |
