# P2 CI/CD Plan for Apply and Drift

## Owner

- `platform-devops`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/iac-operating-model.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/observability-and-sre-architecture.md`
- `../p1-foundation-build/foundation-stack-plan.md`
- `../p2-runtime-and-controls/rrc-001-implementation-runbook.md`

## Exact Tasks

1. Enforce CI validation gates: format, static validation, unit tests, and policy checks.
2. Enforce plan-before-apply workflow for Terraform/OpenTofu with approval requirements by environment.
3. Add scheduled drift detection jobs and route drift alerts to platform on-call.
4. Add deploy freeze control if drift, security gate, or runtime threshold gate fails.
5. Publish CI/CD evidence artifacts needed for G3 and G4 approvals.

## Entry Criteria

- G2 approved.
- CI identity has access to plan/apply roles by environment.
- Incident notification and on-call routing are active.

## Exit Criteria

- Pipeline enforces plan-before-apply without bypass.
- Drift job is running and tested for alert routing.
- G3 packet includes CI, apply, and drift evidence snapshots.

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
tofu plan -chdir=infra -detailed-exitcode
```

```sh
rg -n "drift|plan-before-apply|freeze" specs/pending/palantir-light-infra-execution/outputs/p2-runtime-and-controls/ci-cd-plan-apply-and-drift.md
```

## Rollback/Safety Notes

- If apply fails in `stage` or `prod`, freeze deployments and open incident channel immediately.
- Roll back only with reviewed plan artifacts from the same release window.
- Drift alert suppression is allowed only during approved maintenance windows.

## Pipeline Stages

| Stage | Gate | Blocking Condition |
|---|---|---|
| Validate | format, validation, tests | any failure blocks pipeline |
| Plan | Terraform/OpenTofu plan output | missing plan artifact blocks apply |
| Approve | environment-specific approval policy | missing approver blocks apply |
| Apply | controlled deployment step | apply failure triggers freeze |
| Drift | scheduled plan check | non-zero drift triggers incident and freeze |
