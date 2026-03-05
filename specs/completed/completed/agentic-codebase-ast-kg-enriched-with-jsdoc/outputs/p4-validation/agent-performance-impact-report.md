# P4 Agent Performance Impact Report

## Scope
Evaluate agentic outcome thresholds from available benchmark artifacts without changing benchmark design.

## Inputs Reviewed
- `outputs/p2-design/evaluation-design.md`
- `outputs/agent-reliability/weekly/baseline-targeted-report.md`
- `outputs/agent-reliability/runs/baseline-targeted.json`
- `outputs/agent-reliability/weekly/latest-report.md`

## Baseline Comparison Basis
Primary comparison used: `current` (baseline) vs `adaptive_kg` in `baseline-targeted.json`.

## Measured Condition Summary (baseline-targeted)
- `current`: runs=6, success=100%, wrong-API incidents=0, check+lint pass=100%, median cost=$0.001435
- `adaptive_kg`: runs=6, success=100%, wrong-API incidents=0, check+lint pass=100%, median cost=$0.0012675

## Threshold Status

| Metric | Target | Delta vs baseline (`current`) | Status | Notes |
|---|---:|---:|---|---|
| Task success vs baseline | +10pp min | 0pp | FAIL | Both conditions at 100% |
| Wrong-API/resource hallucinations | -30% min | 0% | FAIL | Both conditions at 0 incidents |
| First-pass check+lint success | +20% min | 0pp | FAIL | Both conditions at 100% |
| Median token cost / successful task | -10% min | -11.7% | PASS | Cost proxy from benchmark pricing model |

## Quality Caveat
`agent-eval` defaults to simulation unless `--live` is used. Existing artifacts should be treated as directional until full live benchmark evidence is published for this spec-specific rollout decision.

## Conclusion
Agentic impact gate is not met (3/4 thresholds fail against current available evidence).
