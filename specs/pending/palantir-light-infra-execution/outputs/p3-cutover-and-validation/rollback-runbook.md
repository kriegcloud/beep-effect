# P3 Rollback Runbook

## Owner

- `release-management`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/risk-register.md`
- `../p2-runtime-and-controls/ci-cd-plan-apply-and-drift.md`
- `../p2-runtime-and-controls/rrc-001-implementation-runbook.md`
- `../p1-foundation-build/foundation-stack-plan.md`

## Exact Tasks

1. Define rollback triggers: RR threshold breach, critical incident, security control regression, or failed smoke checks.
2. Execute rollback in order: runtime release rollback, configuration rollback, infrastructure rollback for changed modules only.
3. Validate post-rollback integrity for workflows, audit logs, and policy decision paths.
4. Publish rollback incident summary with timeline, impact, and corrective actions.
5. Re-open gate progression only after post-rollback verification passes.

## Entry Criteria

- G3 approved and cutover window active.
- Rollback artifacts and previous known-good release references are available.
- Incident bridge and on-call teams are active.

## Exit Criteria

- Runtime and infrastructure return to last known-good state.
- Post-rollback verification checks are green.
- Incident report is published and acknowledged.

## Verification Commands

```sh
git log --oneline -n 20
```

```sh
tofu plan -chdir=infra -detailed-exitcode
```

```sh
bun run check && bun run test
```

```sh
aws logs filter-log-events --log-group-name /platform-runtime/audit --max-items 50
```

## Rollback/Safety Notes

- Never perform destructive cleanup before evidence capture completes.
- Preserve audit and checkpoint stores during rollback.
- Production rollback steps require live approval from release-management and security-architecture.

## Trigger Matrix

| Trigger | Immediate Action | Escalation |
|---|---|---|
| RR threshold breach | block go-live and rollback runtime release | runtime-architecture + release-management |
| Critical security regression | isolate affected components and rollback control changes | security-architecture + release-management |
| CI/CD deploy failure in production window | stop deployment and rollback changed modules | platform-devops + release-management |
