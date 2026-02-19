# IaC / Ops Production Plan (TodoX Wealth Mgmt Knowledge MVP)

## Scope, assumptions, and gaps to resolve

This plan targets the production posture of the monorepo and is grounded in:
- `.repos/effect-ontology/infra/*` patterns (Terraform + Cloud Run + Secret Manager + VPC connector).
- `docker-compose.yml` and `docker/grafana/otelcol-config.yaml` (local services + Grafana OTLP wiring).
- `@beep/shared-env` schemas and `.env.example` (required runtime configuration).
- `@beep/db-admin` migration workflow.

Assumptions that need confirmation:
- The production backend entry point is `apps/server` (Effect runtime). This is consistent with `apps/server/README.md`.
- The production Next.js apps are  and `apps/todox`, and `apps/marketing` is either a separate public site or optional.
- `APP_MCP_URL` points to an MCP service that is deployed separately (no standalone MCP app is defined in this repo).

Potential issues to resolve early:
- `apps/todox/README.md` lists `AUTH_SECRET`, but `@beep/shared-env` requires `BETTER_AUTH_SECRET`. Production must align with `BETTER_AUTH_SECRET` or the app will fail schema validation.
- `apps/todox/README.md` lists `REDIS_URL`, but `@beep/shared-env` requires `KV_REDIS_URL` and `KV_REDIS_PASSWORD`. This mismatch should be corrected in deployment config.
- `@beep/shared-env` requires non-empty `KV_REDIS_PASSWORD`. `.env.example` sets it to empty string; production needs a real password or schema validation will fail.

## Recommended deployment topology

### High-level topology (GCP, Cloud Run pattern)
- **Cloud Run Services**
  - `beep-api`: `apps/server` (Effect backend)
  - `beep-web`:  (Next.js)
  - `beep-todox`: `apps/todox` (Next.js)
  - `beep-marketing`: `apps/marketing` (Next.js)
- **PostgreSQL**
  - Prefer **Cloud SQL for PostgreSQL** with `pgvector` enabled.
  - If Cloud SQL + pgvector is not feasible, follow the effect-ontology pattern: a private Postgres instance on Compute Engine with VPC connector.
- **Redis**
  - **Memorystore (Redis)** with private IP, accessed via VPC connector.
- **Object Storage**
  - The codebase expects AWS S3 credentials (`CLOUD_AWS_*`). Either:
    - Use AWS S3 directly (recommended if already used elsewhere), or
    - Provide an S3-compatible endpoint and credentials (not currently modeled in env schema), or
    - Extend storage layer to support GCS (not in this plan).
- **Observability**
  - OTLP collector + Grafana stack (Tempo/Loki/Mimir) running as a managed service or on GKE/VM.
  - Production clients export OTLP to public HTTPS endpoints; CORS must allow frontend domains.

### Network and ingress
- **Cloud Run ingress**: public for the Next apps, optionally public for API.
- **Private connectivity**: Cloud Run → VPC connector → Postgres and Redis.
- **DNS + TLS**: domain mapping per service, e.g.
  - `api.example.com` → `beep-api`
  - `app.example.com` → `beep-web`
  - `todox.example.com` → `beep-todox`
  - `www.example.com` → `beep-marketing`

### Deployment split
- Each app is a separate image and Cloud Run service.
- Use a shared Artifact Registry and Terraform workspace per environment.
- Enforce environment-specific configuration through Secret Manager and Terraform variables.

## IaC plan (Terraform, patterned after effect-ontology)

### Structure (modeled after `.repos/effect-ontology/infra`)
- `infra/`
  - `main.tf`: providers, remote state, shared modules
  - `variables.tf`: environment + image + feature flags
  - `modules/`
    - `cloud-run/`: Cloud Run services, env vars, VPC connector
    - `postgres/`: Postgres instance + private networking
    - `redis/`: Memorystore + private networking
    - `secrets/`: Secret Manager bindings
    - `monitoring/`: uptime checks + alerts

### Terraform inputs (example)
- `project_id`, `environment`, `region`, `allow_unauthenticated`
- `image_api`, `image_web`, `image_todox`, `image_marketing`
- `enable_postgres`, `enable_redis`, `enable_monitoring`
- `min_instance_count_api` (set to 1 to avoid cold starts for SSE/long polling)

### Secret Manager pattern (from effect-ontology)
- Create secrets first, grant Cloud Run service account access.
- Inject secrets as environment variables in Cloud Run.
- Do not commit `terraform.tfvars`.

### Cloud Run baseline configuration
- `cpu`: 1-2 vCPU per service initially
- `memory`: 1-2 GiB for API, 512 MiB–1 GiB for Next apps
- `request_timeout`: 300s for API (increase if any long-lived streaming endpoints exist)
- `min_instances`: 1 for API if you need fast cold start + stable OTLP batching

## CI/CD flow

1. **Build images** (Bun + Next build)
   - `bun run build --filter @beep/server`
   - `bun run build --filter @beep/todox`
   - `bun run build --filter @beep/todox`
   - `bun run build --filter @beep/marketing`
2. **Push images** to Artifact Registry.
3. **Terraform plan/apply** in `infra/`.
4. **Run database migrations** (see next section).
5. **Deploy Cloud Run** with updated image tags.

## Database migrations (Drizzle / @beep/db-admin)

### Source of truth
- Unified migrations live in `packages/_internal/db-admin/drizzle/`.
- `drizzle.config.ts` expects `DB_PG_URL` and is loaded via `dotenvx`.

### Required production steps
- On schema changes:
  1. `bun run db:generate` (from repo root)
  2. Review new SQL in `packages/_internal/db-admin/drizzle/`
  3. Commit migrations alongside schema changes
- On deploy:
  - Run `bun run db:migrate` with `DB_PG_URL` injected (use Secret Manager)

### Recommended runtime strategy
- **Migration job**: Create a Cloud Run Job that executes `bun run db:migrate` as a pre-deploy step.
- **Avoid app startup migrations** to prevent concurrent migration attempts.

## Redis usage

- Redis is required for Better Auth sessions.
- Configure `KV_REDIS_URL`, `KV_REDIS_PORT`, `KV_REDIS_PASSWORD`.
- Use Memorystore in production and connect over VPC.
- If `KV_REDIS_PASSWORD` is empty, server config will fail validation.

## Observability (OTLP + Grafana LGTM)

### Server-side OTLP
- Env vars required by `@beep/shared-env`:
  - `OTLP_TRACE_EXPORTER_URL`
  - `OTLP_LOG_EXPORTER_URL`
  - `OTLP_METRIC_EXPORTER_URL`
- Keep OTLP endpoints reachable from Cloud Run.

### Client-side OTLP
- Next.js apps use:
  - `NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL`
  - `NEXT_PUBLIC_OTLP_LOG_EXPORTER_URL`
  - `NEXT_PUBLIC_OTLP_METRIC_EXPORTER_URL`
- The OTLP collector must allow CORS for the public app domains.

### Grafana stack
- Local uses `grafana/otel-lgtm` with OTLP HTTP on `:4318`.
- Production options:
  - **Grafana Cloud** (managed Tempo/Loki/Mimir)
  - **Self-hosted LGTM** on GKE or VM with persistent volumes

### Logging defaults
- Use `APP_LOG_FORMAT=json` and `APP_LOG_LEVEL=error` (see `documentation/PRODUCTION_CHECKLIST.md`).

## Environment variables and secrets

### Server-side required (schema enforced)
These are required by `@beep/shared-env/ServerEnv` and must be present in production:

App / base:
- `APP_NAME`, `APP_ENV`, `APP_DOMAIN`
- `APP_ADMIN_USER_IDS`
- `APP_LOG_FORMAT`, `APP_LOG_LEVEL`
- `APP_MCP_URL`, `APP_AUTH_URL`, `APP_API_URL`, `APP_API_HOST`, `APP_API_PORT`, `APP_CLIENT_URL`
- `APP_API_URL`, `APP_API_PORT`, `APP_API_HOST` (also under `APP_API_*` nested)

Auth:
- `BETTER_AUTH_SECRET`

Database:
- `DB_PG_URL`, `DB_PG_SSL`, `DB_PG_PORT`, `DB_PG_USER`, `DB_PG_PASSWORD`, `DB_PG_HOST`, `DB_PG_DATABASE`

Redis:
- `KV_REDIS_URL`, `KV_REDIS_PORT`, `KV_REDIS_PASSWORD`

OTLP:
- `OTLP_TRACE_EXPORTER_URL`, `OTLP_LOG_EXPORTER_URL`, `OTLP_METRIC_EXPORTER_URL`

Security:
- `SECURITY_TRUSTED_ORIGINS`

### Server-side optional / external integrations
These are required only if the feature is enabled:

Email:
- `EMAIL_FROM`, `EMAIL_TEST`, `EMAIL_RESEND_API_KEY`

Cloud storage:
- `CLOUD_AWS_REGION`, `CLOUD_AWS_ACCESS_KEY_ID`, `CLOUD_AWS_SECRET_ACCESS_KEY`, `CLOUD_AWS_S3_BUCKET_NAME`

OAuth providers:
- `OAUTH_PROVIDER_NAMES`
- `OAUTH_PROVIDER_*` client IDs and secrets for providers you enable

Payments:
- `PAYMENT_STRIPE_KEY`, `PAYMENT_STRIPE_WEBHOOK_SECRET`

AI services:
- `AI_OPENAI_API_KEY`, `AI_ANTHROPIC_API_KEY`

Marketing:
- `MARKETING_DUB_TOKEN`

Captcha:
- `CLOUD_GOOGLE_CAPTCHA_SITE_KEY`, `CLOUD_GOOGLE_CAPTCHA_SECRET_KEY`

Uploads:
- `UPLOADTHING_SECRET`

### Client-side required (NEXT_PUBLIC_*)
These are required by `@beep/shared-env/ClientEnv` for Next.js builds:
- `NEXT_PUBLIC_ENV`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DOMAIN`
- `NEXT_PUBLIC_AUTH_PROVIDER_NAMES`
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL`, `NEXT_PUBLIC_OTLP_LOG_EXPORTER_URL`, `NEXT_PUBLIC_OTLP_METRIC_EXPORTER_URL`
- `NEXT_PUBLIC_LOG_LEVEL`, `NEXT_PUBLIC_LOG_FORMAT`
- `NEXT_PUBLIC_CAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_AUTH_URL`, `NEXT_PUBLIC_AUTH_PATH`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_ENABLE_GEO_TRACKING`

### Deployment platform variables
- `VERCEL_PROJECT_ID`, `VERCEL_PROJECT_NAME` (only if deploying to Vercel)
- `TURBO_TOKEN`, `TURBO_TEAM` (if using Turborepo remote caching)

## Rollout checklist (prod)

1. **Provision infra** with Terraform (storage, secrets, postgres, redis, cloud run).
2. **Create secrets** in Secret Manager (DB password, Better Auth secret, OAuth secrets, API keys).
3. **Build & push** images for all services.
4. **Run migrations** with `bun run db:migrate` (Cloud Run Job or CI step).
5. **Deploy Cloud Run** services with pinned image digests.
6. **Verify health**: `GET /v1/health` and Next.js landing pages.
7. **Verify telemetry**: OTLP traces/logs/metrics visible in Grafana.
8. **Lock down CORS** with `SECURITY_TRUSTED_ORIGINS`.
9. **Log format**: enforce JSON logs in production.

## Recommended minimal production configuration (MVP)

- **Services**: `beep-api`, `beep-web`, `beep-todox`, `beep-marketing` (optional)
- **Database**: Postgres with pgvector enabled
- **Redis**: Memorystore
- **Storage**: AWS S3 bucket (if currently required by storage layer)
- **Secrets**: Secret Manager for all credentials
- **Observability**: Grafana Cloud or self-hosted LGTM

## Open questions for finalization

1. Which Next.js apps should be publicly exposed: `web`, `todox`, `marketing`, or a subset?
2. Is MCP a separate service that should be deployed, or should `APP_MCP_URL` point to a managed MCP provider?
3. Are we committed to AWS S3, or should we standardize on GCS for GCP deployments?
4. Do we need Cloud Run Jobs for background/cron tasks beyond migrations?
