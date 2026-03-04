# P2 Orchestrator Prompt — Review and Validate Results

## Context

Phase 1 execution artifacts are available. Perform structured validation, identify gaps/risks, and publish a final recommendation.

## Mission

Evaluate P1 conclusions against validation scenarios and produce final decision artifacts.

## Required outputs

1. `outputs/p2-validation/validation-plan.md`
2. `outputs/p2-validation/validation-results.md`
3. `outputs/p2-validation/gap-analysis.md`
4. `outputs/p2-validation/risk-register.md`
5. `outputs/p2-validation/final-recommendation.md`
6. `outputs/p2-validation/implementation-readiness-checklist.md`

## Constraints

- Source quality: validation must cite P1 evidence artifacts directly
- Evidence standards: every check result must include `evidenceRef`
- Use `ValidationCheck` and `RiskEntry` structures
- Include explicit go/no-go recommendation and unresolved critical risk handling

## Completion checklist

- [ ] Validation plan covers all required scenarios
- [ ] Validation results include status and evidence for each scenario
- [ ] Gap analysis and risk register are complete and aligned
- [ ] Final recommendation states go/no-go with rationale
- [ ] Implementation readiness checklist is complete
