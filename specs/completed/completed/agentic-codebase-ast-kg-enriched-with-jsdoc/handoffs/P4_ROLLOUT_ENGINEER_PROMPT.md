# P4 Rollout Engineer Prompt — Stage Decision and Fallback Drill

## Mission
Execute rollout readiness and fallback drill validation using frozen rollout/fallback policy.

## Inputs
1. `outputs/p2-design/rollout-and-fallback-design.md`
2. `outputs/p2-design/evaluation-design.md`
3. `outputs/p3-execution/integration-log.md`

## Required Outputs
1. `outputs/p4-validation/rollout-readiness.md`
2. `outputs/p4-validation/fallback-drill-report.md`
3. `outputs/p4-validation/agents/rollout-engineer.md`

## Required Checks
1. Rollout stage recommendation (R0/R1/R2/R3) with evidence.
2. Fallback trigger matrix drill validated and documented.
3. Rollback controls verified with no contradiction to lock table.
