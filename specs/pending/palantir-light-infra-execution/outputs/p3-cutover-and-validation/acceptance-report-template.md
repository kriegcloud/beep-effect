# P3 Acceptance Report Template

## Owner

- `release-management`

## Inputs

- `../p3-cutover-and-validation/rr-execution-runbook.md`
- `../p3-cutover-and-validation/go-live-checklist.md`
- `../p3-cutover-and-validation/rollback-runbook.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/final-recommendation.md`

## Exact Tasks

1. Compile gate outcomes for G0 through G4 with evidence references.
2. Summarize RR metrics and threshold pass/fail outcomes.
3. Document open risks, accepted risks, and mitigation owners.
4. Record final release decision and signatories.
5. Archive the report in release evidence storage.

## Entry Criteria

- G4 decision meeting is scheduled.
- RR report and go-live checklist are complete.
- Rollback readiness status is available.

## Exit Criteria

- Acceptance report contains full gate/evidence summary.
- Final decision is signed by required approvers.
- Report is stored in the release evidence path.

## Verification Commands

```sh
rg -n "Gate Summary|RR Metrics|Risk Summary|Release Decision|Signatories" specs/pending/palantir-light-infra-execution/outputs/p3-cutover-and-validation/acceptance-report-template.md
```

```sh
rg -n "G0|G1|G2|G3|G4" specs/pending/palantir-light-infra-execution/outputs/p3-cutover-and-validation/acceptance-report-template.md
```

## Rollback/Safety Notes

- If the decision is no-go, attach rollback execution status and blocked items before closing the report.
- If any critical risk is open, release decision must remain no-go.
- Sign-off is invalid without matching evidence references.

## Report Structure

### Header

- Report date:
- Release window:
- Report owner:

### Gate Summary

| Gate | Status | Evidence Reference |
|---|---|---|
| G0 |  |  |
| G1 |  |  |
| G2 |  |  |
| G3 |  |  |
| G4 |  |  |

### RR Metrics

| Metric | Threshold | Observed | Status |
|---|---|---|---|
| Duplicate side-effect critical incidents | 0 |  |  |
| Duplicate event rate | <= 1 per 10,000 |  |  |
| Interrupted workflow resume success | >= 99.5% |  |  |

### Risk Summary

| Risk ID | Status | Owner | Mitigation State |
|---|---|---|---|

### Release Decision

- Decision (`go` or `no-go`):
- Decision rationale:

### Signatories

- release-management:
- runtime-architecture:
- security-architecture:
- platform-foundation:
