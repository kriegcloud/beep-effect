# P3 RR Execution Runbook

## Owner

- `runtime-architecture`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-plan.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-results.md`
- `../p2-runtime-and-controls/rrc-001-implementation-runbook.md`
- `../p2-runtime-and-controls/audit-provenance-wiring-plan.md`

## Exact Tasks

1. Execute RR scenarios `RR-001` through `RR-006` using baseline profile.
2. Execute RR scenarios `RR-001` through `RR-006` using burst profile.
3. Capture evidence packet for each run: scenario ID, fault injection details, result, duplicate metrics, resume metrics, audit/provenance references.
4. Aggregate metrics across all runs and compare against closure thresholds.
5. Publish closure report with explicit status for `RISK-003` and gate recommendation for G4.

## Entry Criteria

- G3 approved.
- `RRC-001.v1` deployed in target runtime.
- RR harness and metric sinks are operational.

## Exit Criteria

- All RR scenarios have complete evidence packets.
- Aggregate thresholds are satisfied or explicit failure causes are documented.
- Closure report is published and reviewed by release management.

## Verification Commands

```sh
rg -n "RR-001|RR-002|RR-003|RR-004|RR-005|RR-006" specs/pending/palantir-light-infra-execution/outputs/p3-cutover-and-validation/rr-execution-runbook.md
```

```sh
bun run test
```

```sh
aws logs filter-log-events --log-group-name /platform-runtime/rr --max-items 50
```

## Rollback/Safety Notes

- Run RR scenarios in isolated execution windows; do not overlap with production change windows.
- If threshold breaches occur, block go-live and execute rollback runbook.
- Preserve all failed-run artifacts for incident and root-cause review.

## RR Thresholds

| Metric | Required Threshold |
|---|---|
| Duplicate side-effect critical incidents | `0` |
| Duplicate event rate | `<= 1 per 10,000` |
| Interrupted workflow resume success | `>= 99.5%` |
