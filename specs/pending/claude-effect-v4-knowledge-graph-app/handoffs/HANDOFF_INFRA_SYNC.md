# Infrastructure Sync — Reconcile Knowledge Graph App Spec with Deployed SST Stack

**Date:** 2026-02-23
**Status:** PENDING
**Priority:** BLOCKING — Must complete before any agent executes P0-P5

---

## Objective

The `specs/pending/sst-infrastructure/` spec has been fully implemented (P1-P3 deployed via SST). The `specs/pending/claude-effect-v4-knowledge-graph-app/` spec was written BEFORE the infrastructure was provisioned and contains outdated assumptions, placeholder values, and conflicting instructions. An agent executing any phase (P0-P5) of the knowledge graph app spec will encounter misleading infrastructure information.

**Your task:** Update every file in `specs/pending/claude-effect-v4-knowledge-graph-app/` so that all infrastructure references match the actual deployed state. Do NOT change application logic, UI design, or feature requirements — only update infrastructure-related content.

---

## Source of Truth

The following files define the actual deployed infrastructure. Read them ALL before making any changes:

| File | Contents |
|------|----------|
| `infra/secrets.ts` | All 1Password secret reads (env var names, vault structure) |
| `infra/railway.ts` | Railway project, 3 services, env vars, auth proxy URL |
| `infra/database.ts` | Neon PostgreSQL config (name, region, PG version, branch, role) |
| `infra/web.ts` | Vercel project config, all 10 env vars with targets and sensitivity |
| `sst.config.ts` | Provider versions, AWS accounts, stage logic, deploy outputs |
| `specs/pending/sst-infrastructure/outputs/p1-railway-provider-gaps.md` | Known provider bugs and manual steps |

**Deployed outputs (dev stage):**

```
railwayProjectId: 52b18c0a-dfab-4335-aae6-f1b998f891c4
proxyUrl: https://auth-proxy-production-91fe.up.railway.app
neonProjectId: wild-mouse-07270851
neonConnectionHost: postgres://beep_user:***@ep-square-boat-aiih9dwp.c-4.us-east-1.aws.neon.tech/beep_auth?sslmode=require
vercelProjectId: prj_r2MsP7gFt7RbeORZk1CGaZ8ID9dq
vercelProjectUrl: https://beep-dev.vercel.app
```

---

## Conflict Map — What Must Change

### 1. Vercel Project Identity

| Field | Spec Says | Actual |
|-------|-----------|--------|
| Project name | Not specified / implied `effect-v4-kg` | `beep-{stage}` (e.g., `beep-dev`) |
| URL | `https://effect-v4-kg.vercel.app` | `https://beep-{stage}.vercel.app` |
| Git repo | Not specified | `kriegcloud/beep-effect` |
| Framework | Implied Next.js | `nextjs` (explicit) |
| Build command | Not specified | `bun run build` |
| Install command | Not specified | `bun install` |
| Root directory | Not specified | `apps/web` |
| `BETTER_AUTH_URL` | `https://yourapp.vercel.app` (placeholder) | Set via 1Password per stage |

**Files affected:** README.md, HANDOFF_P0.md, HANDOFF_P5.md, any smoke test URLs

### 2. Graphiti API URL (Auth Proxy)

| Field | Spec Says | Actual |
|-------|-----------|--------|
| Public URL | `https://graph.yourdomain.com` (placeholder) | `https://auth-proxy-production-91fe.up.railway.app` |
| Env var name | `GRAPHITI_API_URL` | `GRAPHITI_API_URL` (correct) |
| Proxy software | "FastRelay or Caddy" (ambiguous) | Caddy (`caddy:2-alpine`) |
| Auth mechanism | "X-API-Key header" | X-API-Key header via Caddyfile (correct) |
| Rate limit | "100 req/min (FastRelay default)" | Caddy-level, `RATE_LIMIT=100` env var |

**Files affected:** README.md, HANDOFF_P1.md, HANDOFF_P2.md, HANDOFF_P3.md, HANDOFF_P5.md, railway-deployment-research.md

### 3. Railway Configuration

| Field | Spec Says | Actual |
|-------|-----------|--------|
| Setup method | Manual (Railway dashboard + one-click template) | SST IaC (`infra/railway.ts`) — `op run --env-file=.env -- bunx sst deploy --stage dev` |
| Project name | Not standardized | `beep-{stage}` |
| FalkorDB image | `falkordb/falkordb:latest` | Same (correct) |
| FalkorDB volume | Assumed auto-provisioned | Must be created manually via dashboard (provider v0.4.4 bug) |
| Graphiti image | `zepai/knowledge-graph-mcp:standalone` | Same (correct) |
| Auth proxy image | Not specified | `caddy:2-alpine` |
| Auth proxy start command | Not specified | Must be set manually in dashboard (provider has no startCommand field) |
| ServiceDomain | Assumed auto-created | Must be generated manually (provider 400 bug) |
| `GRAPHITI_GROUP_ID` | `effect-v4` | `effect-v4` (correct — set in Railway vars) |

**Files affected:** HANDOFF_P1.md, outputs/railway-deployment-research.md

### 4. Neon Database

| Field | Spec Says | Actual |
|-------|-----------|--------|
| Setup method | Manual (Neon dashboard) | SST IaC (`infra/database.ts`) |
| Project name | Not specified | `beep-{stage}` |
| PG version | Not specified | 17 |
| Region | Not specified | `aws-us-east-1` |
| Database name | Not specified | `beep_auth` |
| Role name | Not specified | `beep_user` |
| Branch name | Not specified | `main` |
| Free tier history | Not mentioned | 21600s (6 hours, max for free tier) |
| Connection strings | "from Neon dashboard" | Computed Pulumi outputs (`connectionUri`, `connectionUriPooler`) |
| Vercel integration | "auto-syncs via marketplace" | Set by SST IaC (`infra/web.ts`) — no marketplace integration needed |
| PR preview behavior | Not mentioned | Skipped entirely for `pr-*` stages |

**Files affected:** README.md, HANDOFF_P0.md, HANDOFF_P5.md

### 5. Secret Management

| Field | Spec Says | Actual |
|-------|-----------|--------|
| Method | "Set manually in Vercel dashboard" | 1Password vault + `op run --env-file=.env` + SST IaC |
| Vault | Not mentioned | `beep-dev-secrets` (items: `beep-app-core`, `beep-data`, `beep-ai`, `beep-email`, `beep-build`) |
| `OPENAI_API_KEY` source | Direct env var | 1Password field `AI_OPENAI_API_KEY` (mapped to `OPENAI_API_KEY` in Vercel) |
| Provider tokens | Not mentioned | `RAILWAY_TOKEN`, `NEON_API_KEY`, `VERCEL_API_TOKEN` in `beep-build` item |

**Files affected:** README.md, HANDOFF_P0.md, HANDOFF_P5.md

### 6. Deployment Workflow

| Field | Spec Says | Actual |
|-------|-----------|--------|
| Deploy command | Manual per-service (Railway CLI, Vercel CLI, Neon dashboard) | Single command: `op run --env-file=.env -- bunx sst deploy --stage dev` |
| Vercel deploy trigger | Manual or Git push | Git push (auto-deploy via `gitRepository` config) |
| Smoke test base URL | `https://effect-v4-kg.vercel.app` | `https://beep-dev.vercel.app` (dev) |

**Files affected:** HANDOFF_P1.md, HANDOFF_P5.md

### 7. Vercel Environment Variable Scoping

| Field | Spec Says | Actual |
|-------|-----------|--------|
| Sensitive var targets | All targets | Sensitive vars CANNOT target `development` — only `preview` (non-prod) or `production` (prod) |
| Non-sensitive targets | All targets | `preview` + `development` (non-prod) or `production` (prod) |

**Files affected:** HANDOFF_P5.md

### 8. Provider Versions (new info — spec has none)

| Provider | Version |
|----------|---------|
| `railway` | `0.4.4` |
| `neon` | `0.9.0` |
| `@pulumiverse/vercel` | `4.6.0` |
| AWS region | `us-east-1` |

---

## Execution Instructions

### Phase 1: Read source of truth files

Read ALL of these before editing anything:
- `infra/secrets.ts`
- `infra/railway.ts`
- `infra/database.ts`
- `infra/web.ts`
- `sst.config.ts`
- `specs/pending/sst-infrastructure/outputs/p1-railway-provider-gaps.md`
- `specs/pending/sst-infrastructure/handoffs/HANDOFF_P1.md` (Railway gaps)
- `specs/pending/sst-infrastructure/handoffs/HANDOFF_P2.md` (Neon config)
- `specs/pending/sst-infrastructure/handoffs/HANDOFF_P3.md` (Vercel wiring)

### Phase 2: Update each file

Work through every file in `specs/pending/claude-effect-v4-knowledge-graph-app/`:

1. **README.md** — Update: Vercel URL pattern, Graphiti API URL, Neon details, deployment commands, env var table, cost section, secret management approach. Add reference to SST infrastructure.

2. **HANDOFF_P0.md** — Update: Neon connection string source (SST output, not dashboard), `BETTER_AUTH_URL` value (from 1Password, not placeholder), database setup (already provisioned via SST).

3. **HANDOFF_P1.md** — Major rewrite: Railway services are already deployed via SST. P1 should focus on data migration (loading RDB dump) and verification, NOT infrastructure setup. Remove all "create Railway project" and "deploy services" instructions — they're done. Keep: data loading, verification queries, health checks. Add: manual steps still needed (volume, start command, domain — from provider gaps doc).

4. **HANDOFF_P2.md** — Update: Graphiti API URL to actual proxy URL. Confirm MCP endpoint paths. Update any connection instructions.

5. **HANDOFF_P3.md** — Update: Env var references to match actual names. `GRAPHITI_API_URL` is the proxy URL (not a custom domain). `OPENAI_MODEL` default is `gpt-4o-mini`.

6. **HANDOFF_P4.md** — Likely minimal changes. Check for any URL references.

7. **HANDOFF_P5.md** — Major updates: Replace manual deployment with SST deploy command. Update Vercel env var instructions (they're set by IaC, not dashboard). Update smoke test URLs. Add sensitive var scoping note. Replace secret management instructions with 1Password + SST approach.

8. **outputs/research.md** — Check for stale infra assumptions.

9. **outputs/railway-deployment-research.md** — Update to reflect actual SST-based deployment. Reference provider gaps doc.

### Phase 3: Add infrastructure reference section

Add a new section to README.md (or a new file `outputs/infrastructure-state.md`) documenting:
- What is already provisioned and how
- The single deploy command
- Known manual steps (Railway volume, start command, domain)
- How to verify infrastructure is running
- How secrets flow (1Password → `op run` → `process.env` → SST → Vercel env vars)

### Phase 4: Verify no conflicts remain

After all edits, grep through the entire spec directory for:
- `effect-v4-kg` (old Vercel URL)
- `graph.yourdomain.com` (placeholder proxy URL)
- `yourapp.vercel.app` (placeholder Vercel URL)
- `FastRelay` (replaced by Caddy)
- `manually in Vercel dashboard` (replaced by IaC)
- `Neon dashboard` (database is SST-managed)
- `Railway dashboard` (setup is SST-managed — keep references only for manual steps: volume, start command, domain)

---

## Key Principles

1. **Do NOT remove application/feature requirements.** Only update infrastructure references.
2. **Do NOT change the phase structure (P0-P5).** The phases are about app development, not infra.
3. **Be explicit about what's already done.** Each handoff should clearly state "Infrastructure is already provisioned" so agents don't try to recreate it.
4. **Keep manual steps documented.** Railway volume creation, start command, and domain generation still require manual dashboard actions.
5. **Preserve verification queries.** The FalkorDB graph verification queries (node counts, canonical questions) are still valid and important.
6. **Reference the SST infra spec.** Link to `specs/pending/sst-infrastructure/` for full infrastructure documentation.
