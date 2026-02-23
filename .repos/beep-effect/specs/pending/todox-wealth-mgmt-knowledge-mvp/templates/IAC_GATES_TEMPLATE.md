# IaC Gates Template

> Use this template to produce an environment-specific IaC gate doc under `outputs/` (e.g. `outputs/P3_IAC_GATES_[env].md`).

## Environment

- Name: `[staging | prod]`
- Cloud/provider: `[GCP | AWS | other]`
- Region(s): `[region list]`
- DNS domains: `[list]`
- Owner: `[team/person]`

## Provisioning Gates (Pass/Fail)

- [ ] Infrastructure is reproducible from versioned IaC (no console-click drift).
- [ ] Remote state is configured and access controlled.
- [ ] Resource naming conventions prevent collisions across environments.

## Networking Gates (Pass/Fail)

- [ ] TLS/HTTPS enforced for all public endpoints.
- [ ] Private connectivity exists to Postgres/Redis (no public DB if avoidable).
- [ ] Ingress rules and firewall rules are least-privilege.
- [ ] CORS and trusted origins are locked down for the deployed domains.

## Secrets & Config Gates (Pass/Fail)

- [ ] Secrets live only in a secret manager (no plaintext in IaC vars files).
- [ ] Runtime env vars align with `@beep/shared-env` schema names and required fields.
- [ ] Rotation plan exists for:
  - [ ] auth secret(s)
  - [ ] OAuth client secrets
  - [ ] database credentials
  - [ ] redis credentials

## Database Gates (Pass/Fail)

- [ ] Postgres is provisioned with required extensions (e.g. vector support if needed).
- [ ] Backups enabled and retention configured.
- [ ] Restore procedure exists and is tested or tabletop exercised.
- [ ] Connection pooling strategy is documented (limits, timeouts).

## Migrations Gates (Pass/Fail)

- [ ] Migrations run as a job (pre-deploy), serialized, with clear failure handling.
- [ ] A failed migration blocks deploy and is observable (alerts/logging).
- [ ] Roll-forward/rollback strategy is documented for schema changes.

## Observability Gates (Pass/Fail)

- [ ] OTLP collector endpoints exist and are reachable from:
  - [ ] server runtime
  - [ ] browser/client runtime (if client telemetry is enabled)
- [ ] Dashboards exist for core signals (latency/error/availability).
- [ ] Alerts exist and route to on-call.

## Deployment Gates (Pass/Fail)

- [ ] Images are pinned by digest (or equivalent immutability).
- [ ] Deploy is automated (CI/CD) with environment promotion steps.
- [ ] Smoke tests exist and run post-deploy (health + `/knowledge` critical paths).
- [ ] Rollback is documented and verified (at least once in staging).

## Notes / Decisions

- `[record any env var mismatches fixed, topology decisions, or exceptions]`

