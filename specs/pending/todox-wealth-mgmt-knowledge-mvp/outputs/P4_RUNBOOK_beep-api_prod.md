# Runbook: beep-api (prod)

> Instantiated from `templates/RUNBOOK_TEMPLATE.md` for the TodoX WM Knowledge MVP.

## Service

- Name: `beep-api` (`apps/server`)
- Environment: `prod`
- Owner: `TBD`

## Purpose

- `beep-api` is the production backend API for the TodoX WM Knowledge MVP: it handles auth/session flows, ingests Gmail material into Documents, serves Knowledge queries, and supports evidence-first meeting prep grounded in persisted spans.

## Architecture Summary

- Runtime: `GCP Cloud Run`
- Dependencies:
  - Postgres: `Cloud SQL for PostgreSQL` (private) with `pgvector` enabled
  - Redis: `Memorystore (Redis)` (private IP) for Better Auth session persistence
  - Object storage: `AWS S3` (via `CLOUD_AWS_*` env vars in `@beep/shared-env`)
  - OAuth provider: `Google`
  - OTLP backend: `Grafana Cloud` (preferred) or self-hosted collector reachable via HTTPS

Env-var truth source (must not drift):

- Source-of-truth is `@beep/shared-env` schema names.
- Known mismatch risks (from `outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`):
  - Use `BETTER_AUTH_SECRET` (not `AUTH_SECRET`).
  - Use `KV_REDIS_URL` and `KV_REDIS_PASSWORD` (not `REDIS_URL`).
  - `KV_REDIS_PASSWORD` must be non-empty or schema validation fails.

## SLOs (If Defined)

- Availability: `TBD`
- Latency: `TBD (p95 for /knowledge critical calls)`
- Error rate: `TBD`

## Operational Procedures

### Deploy

1. Confirm a new image is built for `apps/server` and pushed to Artifact Registry (or equivalent).
2. Run database migrations as a serialized pre-deploy job:
   - `TBD job`: Cloud Run Job (recommended) or CI step running `bun run db:migrate`.
   - Ensure `DB_PG_URL` is injected via Secret Manager.
3. Deploy the Cloud Run service `beep-api` using the new image digest.
4. Post-deploy smoke checks:
   - `GET /v1/health` (or equivalent health endpoint)
   - Exercise the `/knowledge` critical path used in the demo (login -> query -> evidence inspect).
5. Verify telemetry:
   - Traces/logs/metrics arrive via OTLP exporter endpoints for this environment.

### Rollback / Backout

1. Identify the last known-good Cloud Run revision for `beep-api`.
2. Roll back traffic to that revision (or redeploy with the previous image digest).
3. If rollback is due to schema changes:
   - Prefer roll-forward migrations. Only attempt rollback migrations if explicitly supported and rehearsed.
4. Re-run smoke checks and validate error/latency dashboards return to baseline.

### Database Migrations

- How to run migrations:
  - Recommended: Cloud Run Job (e.g. `beep-api-migrate-prod`) that runs `bun run db:migrate`.
  - Inject `DB_PG_URL` via Secret Manager.
  - Ensure the job is serialized (no concurrent runs).
- Failure handling:
  - Treat migration failure as a deploy blocker.
  - Check migration job logs first; then Postgres logs/metrics for lock contention or permission issues.
  - If partial migration occurred, coordinate a roll-forward fix (do not redeploy repeatedly into a broken schema).

### Secrets / Rotation

- Where secrets live: `GCP Secret Manager`
- Rotation procedure:
  - Rotate `BETTER_AUTH_SECRET`:
    - `TBD` (note: rotating may invalidate sessions; plan user-impact).
  - Rotate DB credentials:
    - `TBD` (coordinate Cloud SQL user/password update + Cloud Run secret version bump).
  - Rotate Redis password:
    - `TBD` (coordinate Memorystore auth config + secret update).
  - Rotate OAuth secrets:
    - `TBD` (coordinate Google Cloud console + secret version bump).

### Backups / Restore

- Backup schedule: `TBD (Cloud SQL automated backups + retention window)`
- Restore steps:
  1. Restore Cloud SQL to a new instance or point-in-time restore (preferred).
  2. Update `DB_PG_URL` to point to the restored instance (prod secrets).
  3. Run migrations if needed to align schema.
  4. Validate the `/knowledge` critical path and evidence resolvability.
- Verification:
  - Confirm core tables and `pgvector` extension exist.
  - Run smoke checks and verify read/write operations behave normally.

## Monitoring

- Dashboards:
  - `TBD (Grafana links: API latency/errors, DB saturation, Redis saturation, OTLP exporter health)`
- Alerts:
  - `TBD` (high error rate, elevated latency, migration job failure, auth/session failures)

## Common Incidents (Playbooks)

### 1) High Error Rate

- Symptoms:
  - Spike in 5xx responses.
  - Elevated error logs and trace error spans.
- Triage:
  - Check Cloud Run logs for the current revision (look for config/schema validation errors).
  - Check DB connectivity errors (timeouts, pool exhaustion).
  - Check Redis connectivity/auth (session failures).
  - Confirm required secrets exist and are readable by the service account.
- Mitigation:
  - Roll back to last known-good revision.
  - If caused by env var mismatch, fix env var names/values to match `@beep/shared-env` and redeploy.
- Resolution:
  - Patch the root cause and add a deploy gate check (e.g. schema-validated env var list in IaC).

### 2) Elevated Latency

- Symptoms:
  - Increased p95 latency on `/knowledge` critical calls.
- Triage:
  - Check Postgres CPU/IO/locks; confirm indexes exist; check slow query logs if enabled.
  - Check Redis latency and connection counts.
  - Check Cloud Run instance count and concurrency settings.
- Mitigation:
  - Temporarily scale Cloud Run instances or reduce concurrency.
  - If DB-bound, apply query/index fixes before scaling further.

### 3) Auth/Session Failures (Redis)

- Symptoms:
  - Login succeeds but sessions do not persist; frequent logouts; auth endpoints error.
- Triage:
  - Confirm `KV_REDIS_URL`, `KV_REDIS_PORT`, `KV_REDIS_PASSWORD` are present and correct.
  - Check Memorystore availability and auth settings.
  - Check for connection limit exhaustion.
- Mitigation:
  - Fix secret/env wiring; restart service to pick up new secret versions.
  - Scale Redis tier if saturated.

### 4) Evidence Resolvability Failures (UI dead links)

- Symptoms:
  - UI shows evidence links that cannot resolve to documents/spans; highlight fails.
- Triage:
  - Check that persisted span store (e.g. `knowledge.mention`) has documentId + offsets for the referenced items.
  - Validate org scoping (no cross-org IDs).
  - Inspect logs/traces for missing join paths or null IDs.
- Mitigation:
  - Roll back if the failure is release-introduced.
  - Hotfix the resolvability invariant (block writes that create dead ends).

## Known Risks / Constraints

- Production should treat env var contract drift as a deploy-blocking error; enforce `@beep/shared-env` schema names at deploy time.
- Storage is modeled as `AWS S3` in env schema; on GCP this implies cross-cloud dependency unless/until storage layer adds GCS support.

## Change Log

- `TBD (YYYY-MM-DD)`: initial prod runbook stub created.

