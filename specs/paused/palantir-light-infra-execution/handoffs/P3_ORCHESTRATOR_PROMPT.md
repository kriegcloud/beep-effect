# P3 Orchestrator Prompt

Execute Phase P3 for `specs/pending/palantir-light-infra-execution`.

Requirements:
- Run final cutover readiness flow with RR evidence, go-live checks, and rollback readiness.
- Keep release decision criteria aligned with locked inputs.
- Update and validate these files:
  - `outputs/p3-cutover-and-validation/rr-execution-runbook.md`
  - `outputs/p3-cutover-and-validation/go-live-checklist.md`
  - `outputs/p3-cutover-and-validation/rollback-runbook.md`
  - `outputs/p3-cutover-and-validation/acceptance-report-template.md`

Deliverable expectations:
- RR execution sequence and threshold checks for go/no-go.
- Complete go-live checklist with sign-off model.
- Rollback runbook with restoration validation steps.
- Acceptance report template for final decision board review.

Verification before handoff:

```sh
rg -n "G4|RR-|rollback|acceptance|Exit Criteria" specs/pending/palantir-light-infra-execution/outputs/p3-cutover-and-validation
```
