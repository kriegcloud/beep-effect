# P0 Environment and Secrets Matrix

## Owner

- `platform-security`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/aws-first-reference-architecture.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/compliance-control-mapping.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p2-validation/risk-register.md`

## Exact Tasks

1. Define environment inventory for `dev`, `stage`, and `prod` including AWS account IDs and region policy.
2. Define secret classes and owner for each class: IaC backend, runtime auth, policy signing, database, observability, and incident channels.
3. Enforce secret storage policy: managed secret store only, no plaintext repository secrets.
4. Define rotation cadence, emergency rotation owner, and validation checks for each secret class.
5. Add break-glass protocol with ticketing and incident review requirements.

## Entry Criteria

- G0 is approved.
- Security and DevOps owner assignments are active.
- Environment list is approved by platform management.

## Exit Criteria

- Every environment has a complete secret ownership row.
- Rotation policy and emergency rotation owner exist for every secret class.
- Secret leak detection command set is documented.

## Verification Commands

```sh
rg -n "dev|stage|prod|rotation|break-glass" specs/pending/palantir-light-infra-execution/outputs/p0-execution-readiness/environment-and-secrets-matrix.md
```

```sh
rg -n "AKIA|BEGIN PRIVATE KEY|SECRET_ACCESS_KEY" --glob '!**/*.md' .
```

```sh
aws secretsmanager list-secrets --max-items 20
```

## Rollback/Safety Notes

- If a secret leak is detected, revoke and rotate affected secrets immediately and suspend deployments.
- Break-glass usage requires post-incident review within 24 hours.
- Shared credentials are prohibited; issue must block phase progression until remediated.

## Environment Matrix

| Environment | Primary Region | Account Purpose | Deployment Policy |
|---|---|---|---|
| dev | us-east-1 | integration and fast feedback | auto-apply allowed after passing CI gates |
| stage | us-east-1 | pre-production validation | manual apply with two-party approval |
| prod | us-east-1 | customer-facing production | manual apply, change window, and rollback plan required |

## Secrets Matrix

| Secret Class | Store | Owner | Rotation Cadence | Emergency Rotation Owner |
|---|---|---|---|---|
| IaC backend credentials | AWS Secrets Manager | platform-devops | 90 days | platform-security |
| Runtime service credentials | AWS Secrets Manager | runtime-architecture | 60 days | platform-security |
| Policy signing material | AWS KMS + Secrets Manager | security-architecture | 30 days | security-architecture |
| Database access credentials | AWS Secrets Manager | data-architecture | 60 days | platform-security |
| Observability ingest credentials | AWS Secrets Manager | sre-platform | 90 days | platform-devops |
| Incident notification tokens | AWS Secrets Manager | release-management | 90 days | platform-security |
