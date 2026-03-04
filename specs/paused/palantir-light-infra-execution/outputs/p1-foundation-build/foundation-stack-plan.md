# P1 Foundation Stack Plan

## Owner

- `platform-foundation`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/iac-operating-model.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/aws-first-reference-architecture.md`
- `../p0-execution-readiness/prerequisites-and-gates.md`
- `../p0-execution-readiness/ownership-and-raci.md`

## Exact Tasks

1. Bootstrap remote state backend and locking for foundation and platform modules.
2. Implement foundation modules in order: identity guardrails, shared networking primitives, logging/audit baseline, key-management baseline.
3. Run plan and apply per environment in sequence: `dev` -> `stage` -> `prod`.
4. Capture apply artifact hashes and plan summaries for change traceability.
5. Publish post-apply validation evidence for G2 gate review.

## Entry Criteria

- G1 approved.
- Environment and secrets matrix approved.
- Terraform/OpenTofu executor roles validated in target accounts.

## Exit Criteria

- Foundation modules are applied in all target environments with no unmanaged drift.
- Apply evidence package is stored and linked for each environment.
- G2 approval packet includes successful network/security baseline checks.

## Verification Commands

```sh
tofu fmt -check -recursive infra
```

```sh
tofu validate -chdir=infra
```

```sh
tofu plan -chdir=infra -var-file=environments/dev.tfvars -out=dev.plan
```

```sh
tofu show -json dev.plan | jq '.resource_changes | length'
```

## Rollback/Safety Notes

- Use saved plan artifacts for apply and rollback consistency.
- Stop promotion to the next environment on first failed apply or failed post-apply validation.
- Rollback must target only resources changed in the failed apply window.

## Environment Apply Order

| Order | Environment | Approval Model |
|---|---|---|
| 1 | dev | phase owner approval |
| 2 | stage | phase owner + security approval |
| 3 | prod | release-management change-window approval |
