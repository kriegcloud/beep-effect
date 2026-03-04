# P3 Go-Live Checklist

## Owner

- `release-management`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/final-recommendation.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/implementation-readiness-checklist.md`
- `../p3-cutover-and-validation/rr-execution-runbook.md`
- `../p3-cutover-and-validation/rollback-runbook.md`

## Exact Tasks

1. Verify G4 prerequisites: RR closure evidence, CI/CD health, and rollback drill result.
2. Validate production change window approvals and incident staffing.
3. Confirm monitoring dashboards and alert routes are active before cutover.
4. Run pre-cutover smoke checks and confirm no critical open risks.
5. Record final sign-off from release manager, runtime owner, security owner, and platform owner.

## Entry Criteria

- G3 approved.
- RR execution report published.
- Rollback runbook validated in stage.

## Exit Criteria

- Go-live checklist has full sign-off.
- No unresolved critical operational risks remain.
- Cutover decision is logged with timestamp and approver names.

## Verification Commands

```sh
bun run check
```

```sh
bun run lint
```

```sh
bun run test
```

```sh
rg -n "Sign-off|critical risk|G4" specs/pending/palantir-light-infra-execution/outputs/p3-cutover-and-validation/go-live-checklist.md
```

## Rollback/Safety Notes

- Any failed smoke check or Sev-1 alert blocks go-live.
- If staffing is below minimum on-call requirements, delay cutover.
- Rollback authority is held by release-management once cutover starts.

## Checklist

| Item | Owner | Status |
|---|---|---|
| RR thresholds satisfied | runtime-architecture | required |
| CI/CD green for release commit | platform-devops | required |
| Security controls validated | security-architecture | required |
| Monitoring and alerts live | sre-platform | required |
| Rollback drill passed | release-management | required |
| Final approval recorded | release-management | required |
