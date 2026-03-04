# Handoff P3: Cutover and Validation

## Mission

Execute final RR validation, production go-live checks, rollback rehearsal, and acceptance reporting for release decision.

## Locked Inputs

- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/final-recommendation.md`
- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/risk-register.md`
- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-results.md`
- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/implementation-readiness-checklist.md`

## Deliverables

- `../outputs/p3-cutover-and-validation/rr-execution-runbook.md`
- `../outputs/p3-cutover-and-validation/go-live-checklist.md`
- `../outputs/p3-cutover-and-validation/rollback-runbook.md`
- `../outputs/p3-cutover-and-validation/acceptance-report-template.md`

## Execution Contract

- Do not run production cutover until G4 criteria pass.
- No go decision if critical risk remains open.
- Rollback path must be pre-validated before release approval.

## Completion Criteria

- RR campaign is executed and evidence packet is complete.
- Go-live checklist has accountable sign-offs.
- Rollback runbook has tested restoration path and success checks.

## Verification

```sh
rg -n "G4|rollback|acceptance|RR-" specs/pending/palantir-light-infra-execution/outputs/p3-cutover-and-validation
```
