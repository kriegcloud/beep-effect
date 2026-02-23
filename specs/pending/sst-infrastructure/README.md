# SST Infrastructure for Knowledge Graph Explorer

> Codify the beep-effect2 Knowledge Graph Explorer infrastructure as TypeScript using SST v3 (Ion), replacing manual Railway/Neon/Vercel dashboard management with reproducible, version-controlled IaC.

## Quick Navigation

- [Handoff P0 — SST Init + Provider Scaffold](./handoffs/HANDOFF_P0.md)
- [Handoff P1 — Railway Services](./handoffs/HANDOFF_P1.md)
- [Handoff P2 — Neon + 1Password Wiring](./handoffs/HANDOFF_P2.md)
- [Handoff P3 — Vercel + Integration Wiring](./handoffs/HANDOFF_P3.md)
- [Handoff P4 — Multi-Stage + CI/CD](./handoffs/HANDOFF_P4.md)
- [Knowledge Graph App Spec](../claude-effect-v4-knowledge-graph-app/README.md)

## Purpose

**Problem:** The Knowledge Graph Explorer app (see `specs/pending/claude-effect-v4-knowledge-graph-app/`) targets three managed platforms — Railway, Neon, and Vercel — with ~10 environment variables, 3 Railway services, a PostgreSQL database, and a Next.js deployment. Today this is managed manually through platform dashboards. Manual management creates:

- No reproducibility — tearing down and recreating environments requires remembering exact configurations
- No environment parity — dev/staging/production drift
- Secret sprawl — environment variables scattered across 3 platform dashboards
- No PR preview environments — each preview requires manual Railway/Neon setup
- Onboarding friction — new contributors must manually configure 3 platforms

**Solution:** Define all infrastructure in TypeScript using SST v3, which orchestrates Pulumi + Terraform providers. Railway services, Neon databases, Vercel projects, and secrets are declared in an `infra/` directory and deployed via `bunx sst deploy --stage <env>`.

**Why SST over raw Pulumi:**

- SST already bridges the Railway Terraform provider (`@sst-provider/railway`)
- Single `sst.config.ts` entry point with dynamic imports from `infra/` modules
- Compatible with 1Password `op run` for secret injection (replaces `sst.Secret` — see ADR-017)
- Stage isolation by default — each stage gets fully independent resources
- Resource linking generates type-safe `Resource.X.value` accessors in app code
- `sst dev` multiplexer for local development with live infrastructure
- Bun-compatible as package manager (uses `bunx sst` for CLI commands)

## Success Criteria

- [ ] `sst.config.ts` exists at monorepo root with `railway`, `neon`, `@pulumiverse/vercel` providers configured
- [ ] `infra/` directory contains modular infrastructure definitions (secrets, railway, database, web)
- [ ] `bunx sst deploy --stage dev` provisions: Railway project with 3 services (FalkorDB, Graphiti MCP, Auth Proxy), Neon database, and wires env vars to Vercel
- [ ] `bunx sst deploy --stage production` provisions production-grade resources with `protect: true` and `removal: "retain"`
- [ ] All sensitive values sourced from 1Password vaults via `op run` — no plaintext secrets in config or state
- [ ] `bunx sst remove --stage dev` cleanly tears down all dev resources
- [ ] `.sst/` directory gitignored, `infra/` directory version-controlled
- [ ] CI workflow can deploy via `bunx sst deploy --stage pr-${{ github.event.pull_request.number }}`
- [ ] Resource outputs (URLs, connection strings) accessible via `sst.config.ts` return values

## Architecture Decision Records

| ID | Decision | Rationale |
|---|---|---|
| ADR-001 | SST v3 (Ion) over raw Pulumi | SST provides Railway bridge, secret management, stage isolation, and resource linking out of the box. Raw Pulumi would require manually bridging the Railway Terraform provider and building secret/stage workflows from scratch. |
| ADR-002 | `@sst-provider/railway` for Railway resources | Official SST-maintained Pulumi bridge of the community Terraform Railway provider. Published by `sst-publisher`. **WARNING:** SST bridge is pinned at v0.4.4 (Aug 2023), while TF provider is at v0.6.1 (Nov 2025). See ADR-014. |
| ADR-003 | `neon` Pulumi provider for Neon PostgreSQL | Direct Neon API integration. `neon.Project` auto-creates default branch, database, role, endpoint and exposes `connectionUri`/`connectionUriPooler` as computed outputs. No separate Branch/Database/Endpoint resources needed for default setup. |
| ADR-004 | `@pulumiverse/vercel` for Vercel deployment | Pulumi community provider (`@pulumiverse/vercel`, latest v4.6.0). 34 resources including `Project`, `ProjectEnvironmentVariable`, `ProjectEnvironmentVariables` (batch), `ProjectDomain`. Targets are plain strings: `"production"`, `"preview"`, `"development"`. |
| ADR-005 | 1Password `op run` for all sensitive values | Application secrets sourced from 1Password vaults via `op run --env-file=.env.op.<stage>`. Eliminates `sst.Secret` and AWS SSM dependency for app secrets. `infra/secrets.ts` reads from `process.env` with validation. Provider tokens (AWS, Railway, Neon, Vercel) also sourced from 1Password. Single `OP_SERVICE_ACCOUNT_TOKEN` GitHub secret replaces 5 separate CI secrets. |
| ADR-006 | `infra/` directory with modular files | Follows SST monorepo convention. Each file exports resources for a single concern (secrets, railway, database, web). Dynamic imports in `sst.config.ts` `run()` function. |
| ADR-007 | AWS as SST `home` provider | SST needs a "home" provider for state storage. AWS S3 is used for encrypted state and SSM for internal metadata. This does NOT mean the app runs on AWS — Railway/Neon/Vercel remain the runtime platforms. Uses AWS Organizations with separate dev/prod accounts (see ADR-018). |
| ADR-008 | Stage naming: `dev`, `staging`, `production`, `pr-{N}` | `dev` = shared development, `staging` = pre-production, `production` = live. PR stages (`pr-123`) are ephemeral and use 1Password dev vault secrets. Personal stages use OS username (SST default). |
| ADR-009 | Railway FalkorDB via `sourceImage` not `sourceRepo` | FalkorDB is deployed from the official Docker image `falkordb/falkordb:latest`, not built from source. Persistent volume at `/data` for RDB dump. **Note:** Volume is a nested block on `railway.Service`, not a separate resource. Volume creation bug fixed in TF provider v0.6.1 — may not work in SST bridge v0.4.4. |
| ADR-010 | Graphiti MCP via `sourceImage: "zepai/knowledge-graph-mcp:standalone"` | Pre-built Docker image from Zep AI. No custom build required. Connected to FalkorDB via Railway private networking. |
| ADR-011 | Auth Proxy as separate Railway service | FastRelay or Caddy reverse proxy with X-API-Key enforcement. Only public-facing service — FalkorDB and Graphiti remain on private network. |
| ADR-012 | Neon free tier with single branch | v1 beta scope. Single `main` branch, 0.5GB storage. Upgrade path to Neon branching per stage if needed. |
| ADR-013 | No Railway health checks for FalkorDB | FalkorDB uses Redis protocol (TCP), not HTTP. Railway health checks are HTTP-only. Rely on Railway's default restart behavior. **Note:** Neither `restart_policy` nor `health_check` are exposed by the Terraform provider — these are Railway platform defaults or must be configured via `railway.toml`. |
| ADR-014 | `@sst-provider/railway` version lag is a blocking risk | SST bridge is v0.4.4 (maps to TF provider v0.4.4, Aug 2023). TF provider is now v0.6.1 (Nov 2025). **Breaking changes missed:** v0.5.0 replaced `region` (singular) with `regions` (list block), v0.6.0 renamed `team_id` to `workspace_id`, v0.6.1 fixed volume creation bugs. **Mitigation:** In P1, first verify which resources/attributes actually work. If the bridge is too stale, options: (a) fork `sst/pulumi-railway` and rebuild against TF provider v0.6.1, (b) use raw Pulumi Terraform bridge directly, (c) manage Railway via `railway` CLI in a post-deploy script. |
| ADR-015 | Neon `connectionUri` simplification | `neon.Project` auto-creates a default branch, database, role, and endpoint. The project resource exposes `connectionUri` (direct) and `connectionUriPooler` (pooled) as computed outputs including credentials. No need to create separate `neon.Branch`, `neon.Database`, or `neon.Endpoint` resources for the default setup. Use `sst.Linkable` to expose connection strings to app code. |
| ADR-016 | Auth proxy uses X-API-Key header (not Bearer token) | All KG app spec documents specify `X-API-Key` header enforcement. FastRelay natively supports Bearer tokens; if using FastRelay, configure it for custom header validation or use Caddy with `header_up` matching instead. Standardize on `X-API-Key: <shared-secret>` across all specs. |
| ADR-017 | 1Password replaces `sst.Secret` for secret management | All 7 application secrets + 5 provider tokens sourced from existing 1Password vaults (`beep-dev-secrets`) via `op run` CLI. Eliminates `bunx sst secret set` ceremony (13+ manual commands). `.env.op.<stage>` files map `op://` references to env var names. CI/CD uses `1password/load-secrets-action@v2` with a single `OP_SERVICE_ACCOUNT_TOKEN`. AWS SSM is no longer needed for app secrets (still used by SST for internal state). |
| ADR-018 | AWS Organizations with per-account state isolation | SST state stored in separate AWS accounts: dev account (`487243850762`) for dev/staging/PR stages, prod account (`703222328573`) for production. Uses AWS IAM Identity Center (SSO) for local dev (`aws sso login --profile beep-dev`). CI uses GitHub Actions OIDC federation (`aws-actions/configure-aws-credentials@v4`) to assume per-account IAM roles — zero static AWS keys. SST auto-bootstraps (creates S3 bucket + SSM) per-account on first deploy. Management account is not used for deployments. |

## Phase Breakdown

| Phase | Focus | Outputs | Agent(s) | Sessions |
|---|---|---|---|---|
| P0 | SST Init + Provider Scaffold | `sst.config.ts`, `infra/` skeleton, `.gitignore` updates, provider installation | 1 | 1 |
| P1 | Railway Services | `infra/railway.ts` — FalkorDB, Graphiti MCP, Auth Proxy with volumes, networking, domains | 1 | 1 |
| P2 | Neon + 1Password Wiring | `infra/database.ts`, `infra/secrets.ts`, `.env.op.*` — Neon project/database, 1Password secret wiring | 1 | 1 |
| P3 | Vercel + Integration Wiring | `infra/web.ts` — Vercel project, env var wiring from Railway/Neon outputs | 1 | 1 |
| P4 | Multi-Stage + CI/CD | Stage-conditional logic, PR preview workflow, GitHub Actions integration, teardown | 1 | 1 |

## Phase Exit Criteria

| Phase | Done When |
|---|---|
| P0 | `bunx sst install` succeeds, `sst.config.ts` compiles, `.sst/platform/config.d.ts` generated with provider types |
| P1 | **COMPLETE** — Railway project `beep-dev` with 3 services deployed. Auth proxy at `auth-proxy-production-91fe.up.railway.app`. 4 provider gaps documented (volume, domain, start command, API token scope). See `outputs/p1-railway-provider-gaps.md`. |
| P2 | Neon database provisioned, all 1Password fields exist, `op run --env-file=.env -- bunx sst deploy --stage dev` succeeds |
| P3 | Vercel project created with env vars wired from Railway/Neon outputs, `bunx sst deploy --stage dev` return values include all URLs |
| P4 | `--stage production` deploys with `protect: true`, `--stage pr-123` deploys with 1Password service account, GitHub Actions workflow with `1password/load-secrets-action` exists |

## Complexity Assessment

```
Phases:       5  x2  = 10
Agents:       1  x3  = 3
CrossPkg:     1  x0.5= 0.5
ExtDeps:      4  x3  = 12    (SST, Railway provider, Neon provider, Vercel provider)
Uncertainty:  2  x5  = 10    (Railway provider maturity, cross-provider wiring)
Research:     1  x2  = 2
                      ----
Total:              37.5 -> Medium complexity
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| `@sst-provider/railway` v0.4.4 is 2+ years behind TF provider v0.6.1 | **Critical** | **High** | P1 MUST begin with a provider capability audit. Known gaps: `regions` block (v0.5.0+), `workspace_id` (v0.6.0+), volume bug fixes (v0.6.1). Fallbacks: (a) rebuild bridge from TF v0.6.1, (b) raw Pulumi TF bridge, (c) Railway CLI wrapper. See ADR-014. |
| Railway private networking not expressible via Terraform provider | Medium | Low | Railway internal DNS (`*.railway.internal`) is implicit for services in the same project — no provider config needed. Just set correct connection strings as env vars. This is confirmed behavior. |
| Railway volume creation may fail on SST bridge v0.4.4 | High | Medium | Volume is a nested block on `railway_service` (not a separate resource). TF provider v0.6.1 fixed volume creation bugs. If SST's v0.4.4 bridge fails, configure volume manually in Railway dashboard and document as a gap. |
| Neon Pulumi provider version lag (`@sst-provider/neon` v0.9.0 vs registry v0.13.0) | Low | Medium | Pin to v0.9.0. Core resources (`Project`, `Branch`, `Database`) are stable. `connectionUri` output exists in v0.9.0. |
| Vercel provider cannot wire env vars from Railway/Neon outputs | Medium | Low | `vercel.ProjectEnvironmentVariable` accepts `Output<string>` values. Cross-provider references work via Pulumi's output resolution. If issues arise, use `$interpolate` to construct the value from Neon output components. |
| SST state corruption during parallel deploys | Medium | Low | SST uses Pulumi's state locking. CI must serialize deploys per stage via GitHub Actions concurrency groups. |
| AWS credentials required for SST `home` even though app doesn't run on AWS | Low | High | Uses AWS Organizations with SSO for local dev and OIDC federation for CI (zero static AWS keys). Minimal IAM policy per-account (S3 + SSM + STS). See ADR-018 and P4 IAM policy. |
| Railway cost multiplication across stages | Medium | High | Each SST stage creates a separate Railway project ($5/mo Hobby base per project). 3 stages = $15/mo base. Mitigate: share Railway project across non-production stages or skip Railway in PR previews. |
| 1Password service availability | Low | Low | `op run` requires 1Password CLI + authentication. If 1Password is down, deploys are blocked. Mitigate: secrets can be set as plain env vars as fallback (bypassing `op run`). |

## Dependencies

### System

- Bun >= 1.0 (package manager)
- Node.js >= 18 (SST runtime — Bun is package manager only, SST CLI runs on Node)
- AWS Organizations with dev account (`487243850762`) and prod account (`703222328573`)
- AWS CLI v2 configured with SSO profiles (`beep-dev`, `beep-prod`) — see P0 for setup
- AWS IAM Identity Center (SSO) via `https://d-906617b551.awsapps.com/start`

### External

- SST v3 (`sst` npm package, >= 3.0.0)
- `@sst-provider/railway` v0.4.4 (only published version — bridges TF provider v0.4.4, **not** latest v0.6.1)
- `@sst-provider/neon` v0.9.0 (bridges Neon TF provider)
- `@pulumiverse/vercel` (latest v4.6.0)
- Railway API token (`RAILWAY_TOKEN`) — stored in 1Password `beep-dev-secrets/beep-build`
- Neon API key (`NEON_API_KEY`) — stored in 1Password `beep-dev-secrets/beep-build`
- Vercel API token (`VERCEL_API_TOKEN`) — stored in 1Password `beep-dev-secrets/beep-build`
- 1Password CLI (`op`) >= 2.0 — for `op run` secret injection
- 1Password service account token — for CI/CD (stored in `beep-automation-admin` vault)

### References

- [SST v3 Documentation](https://sst.dev/docs/)
- [SST Config Reference](https://sst.dev/docs/reference/config/)
- [SST Providers](https://sst.dev/docs/providers/)
- [1Password CLI — `op run`](https://developer.1password.com/docs/cli/reference/commands/run/)
- [SST Monorepo Setup](https://sst.dev/docs/set-up-a-monorepo/)
- [SST CLI Reference](https://sst.dev/docs/reference/cli/)
- [`@sst-provider/railway` npm](https://www.npmjs.com/package/@sst-provider/railway)
- [Railway Terraform Provider](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs)
- [Neon SST Guide](https://neon.com/guides/neon-sst)
- [Knowledge Graph App Spec](../claude-effect-v4-knowledge-graph-app/README.md)

## Verification Commands

```bash
# P0: SST initialized and providers installed
bunx sst install
cat .sst/platform/config.d.ts | head -20

# P1: Railway services deployed
bunx sst deploy --stage dev 2>&1 | grep -E "(railway|Railway)"

# P2: 1Password fields exist + Neon deployed
op read "op://beep-dev-secrets/beep-app-core/AUTH_SECRET" > /dev/null && echo "OK"
op run --env-file=.env -- bunx sst deploy --stage dev

# P3: Full stack deployed
op run --env-file=.env -- bunx sst deploy --stage dev

# P4: Production deploy
op run --env-file=.env.op.production -- bunx sst deploy --stage production

# Teardown dev
op run --env-file=.env.op.dev -- bunx sst remove --stage dev
```

## Key Files

| Path | Purpose |
|---|---|
| `sst.config.ts` | SST entry point — app config + dynamic imports from `infra/` |
| `infra/secrets.ts` | Env var reads with validation (secrets from 1Password via `op run`) |
| `infra/railway.ts` | Railway project, services (FalkorDB, Graphiti, Proxy), domains |
| `infra/database.ts` | Neon project (auto-creates defaults), `connectionUri`/`connectionUriPooler` outputs, `sst.Linkable` |
| `infra/web.ts` | Vercel project, env var wiring, domain config |
| `.env.op.dev` | 1Password `op://` references for dev stage (safe to commit) |
| `.env.op.production` | 1Password `op://` references for production stage (safe to commit) |
| `.sst/` | SST internal state (gitignored) |
| `sst-env.d.ts` | Auto-generated types for linked resources |

## Related Specs

- [Knowledge Graph Explorer App](../claude-effect-v4-knowledge-graph-app/README.md) — the application this infrastructure supports
- [Shared Memories](../../completed/shared-memories/README.md) — Graphiti/FalkorDB local setup (development reference)
