# IaC Gates (staging)

> Instantiated from `templates/IAC_GATES_TEMPLATE.md` for the TodoX WM Knowledge MVP.

## Environment

- Name: `staging`
- Cloud/provider: `GCP (Cloud Run)`
- Region(s): `TBD (pick 1-2, e.g. us-central1)`
- DNS domains: `TBD (e.g. api.staging.<domain>)`
- Owner: `TBD`

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

Notes (env contract source-of-truth and known mismatches to avoid):

- Source-of-truth: `@beep/shared-env` schemas (do not follow handwritten docs if they drift).
- Known mismatches called out in `outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`:
  - Some docs list `AUTH_SECRET`, but `@beep/shared-env` requires `BETTER_AUTH_SECRET`.
  - Some docs list `REDIS_URL`, but `@beep/shared-env` requires `KV_REDIS_URL` and `KV_REDIS_PASSWORD`.
  - `KV_REDIS_PASSWORD` must be non-empty; staging must use a real password (empty string will fail schema validation).

## Database Gates (Pass/Fail)

- [ ] Postgres is provisioned with required extensions (e.g. vector support if needed).
- [ ] Backups enabled and retention configured.
- [ ] Restore procedure exists and is tested or tabletop exercised.
- [ ] Connection pooling strategy is documented (limits, timeouts).

Pre-fill (expected deps for this MVP):

- Postgres: `Cloud SQL for PostgreSQL` with `pgvector` enabled (or equivalent private Postgres per `.repos/effect-ontology/infra` patterns).
- Redis: `Memorystore (Redis)` private IP, used for Better Auth session persistence.

## Migrations Gates (Pass/Fail)

- [ ] Migrations run as a job (pre-deploy), serialized, with clear failure handling.
- [ ] A failed migration blocks deploy and is observable (alerts/logging).
- [ ] Roll-forward/rollback strategy is documented for schema changes.

Pre-fill (recommended approach):

- Use a Cloud Run Job (or CI step) to run `bun run db:migrate` with `DB_PG_URL` injected via Secret Manager.
- Do not run migrations on app startup.

## Observability Gates (Pass/Fail)

- [ ] OTLP collector endpoints exist and are reachable from:
  - [ ] server runtime
  - [ ] browser/client runtime (if client telemetry is enabled)
- [ ] Dashboards exist for core signals (latency/error/availability).
- [ ] Alerts exist and route to on-call.

Pre-fill (expected posture):

- Dev uses Grafana LGTM container (OTLP HTTP `:4318`); staging should export OTLP to a reachable collector (Grafana Cloud or self-hosted).

## Deployment Gates (Pass/Fail)

- [ ] Images are pinned by digest (or equivalent immutability).
- [ ] Deploy is automated (CI/CD) with environment promotion steps.
- [ ] Smoke tests exist and run post-deploy (health + `/knowledge` critical paths).
- [ ] `/settings?settingsTab=connections` resolves in staging (OAuth callback URL contract; redirects are acceptable).
- [ ] Rollback is documented and verified (at least once in staging).

Pre-fill (primary service):

- `beep-api` = `apps/server` (Cloud Run Service).

## Notes / Decisions

- `TBD: region, DNS, service naming conventions, and whether Postgres/Redis are Cloud-managed or VM-hosted per effect-ontology patterns.`
