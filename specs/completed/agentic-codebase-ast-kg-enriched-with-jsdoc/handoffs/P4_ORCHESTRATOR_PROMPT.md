# P4 Orchestrator Prompt — Validation and Rollout Readiness

You are executing P4 for:
`specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc`

## Mission
Run validation and rollout readiness against frozen P0/P2/P3 contracts. Do not reopen architecture.

## Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P3.md`
4. `outputs/p2-design/*`
5. `outputs/p3-execution/*`

## Required Outputs
1. `outputs/p4-validation/coverage-correctness-report.md`
2. `outputs/p4-validation/semantic-enrichment-quality-report.md`
3. `outputs/p4-validation/query-usefulness-report.md`
4. `outputs/p4-validation/agent-performance-impact-report.md`
5. `outputs/p4-validation/rollout-readiness.md`
6. `outputs/p4-validation/fallback-drill-report.md`
7. `outputs/p4-validation/agents/validation-engineer.md`
8. `outputs/p4-validation/agents/rollout-engineer.md`

## Exit Gate
1. Quantitative thresholds from README are evaluated and statused.
2. Rollout stage decision is documented with fallback drill evidence.
3. No contradictions to locked defaults/interfaces.
