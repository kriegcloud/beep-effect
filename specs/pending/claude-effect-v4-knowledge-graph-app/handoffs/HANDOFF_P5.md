# Handoff P5: Deployment + Hardening

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working     | 2,000  | ~1,500    | OK     |
| Episodic    | 1,000  | ~400      | OK     |
| Semantic    | 500    | ~300      | OK     |
| Procedural  | Links  | Links     | OK     |

## Working Memory (Current Phase)

### Phase 5 Goal
Verify the Vercel deployment (already provisioned via SST IaC), confirm all environment variables are set correctly, run smoke tests, and produce a production runbook.

> **Infrastructure is already provisioned.** The Vercel project `beep-{stage}`, all 10 environment variables, Railway services, and Neon database were deployed via `op run --env-file=.env -- bunx sst deploy --stage dev`. See `specs/pending/sst-infrastructure/` for full infrastructure documentation.

### Deliverables
1. Verify Vercel project env vars are correctly set (already provisioned by SST IaC — `infra/web.ts`)
2. Railway FalkorDB verified for production traffic (from P1)
3. `apps/web/vercel.json` or `next.config.ts` adjustments for Node runtime routes
4. `outputs/p5-deployment/smoke-test-results.md` — Results of end-to-end smoke tests
5. `outputs/p5-deployment/runbook.md` — Production runbook (failure handling, rollback, cost monitoring)
6. `outputs/p5-deployment/env-contract.md` — Complete environment variable documentation

### Success Criteria
- [ ] Vercel deployment accessible at `https://beep-dev.vercel.app` (or stage-specific URL)
- [ ] All 10 env vars verified on Vercel project (set by SST IaC — `infra/web.ts`)
- [ ] Railway FalkorDB operational and reachable from Vercel via auth proxy
- [ ] Graphiti API health check passes from Vercel deployment (`https://auth-proxy-production-91fe.up.railway.app`)
- [ ] Smoke tests pass:
  - Auth: magic link sign-in with allowlisted email, reject non-allowlisted
  - Chat: POST /api/chat returns grounded answer
  - Graph: GET /api/graph/search returns nodes
  - UI: Graph page renders, chat page renders
- [ ] Node.js runtime configured for `/api/chat`, `/api/graph/*`
- [ ] Rate limiting active on API routes
- [ ] Request body size limits enforced
- [ ] Local pre-push quality gate passes: `op run --env-file=.env -- sh -c 'bun run build && bun run check && bun run test'`
- [ ] Production runbook committed

### Implementation Notes

**Next.js route segment config:**
```ts
// app/api/chat/route.ts
export const runtime = "nodejs"
export const maxDuration = 60 // seconds, for streaming tool-calling workloads (Fluid compute: 300s max on Hobby)
```

**Vercel environment variables (already set by SST IaC — `infra/web.ts`):**

> All env vars are provisioned by `op run --env-file=.env -- bunx sst deploy --stage dev`. Do NOT set them manually in the Vercel dashboard. To update a value, update it in 1Password and re-run the deploy command.

```
# Auth (Sensitive — from 1Password beep-app-core, targets: preview only for non-prod)
BETTER_AUTH_SECRET=<from 1Password: AUTH_SECRET>
BETTER_AUTH_URL=<from 1Password: BETTER_AUTH_URL — e.g., https://beep-dev.vercel.app>

# Database (Sensitive — computed by Neon provider, NOT from Neon Vercel marketplace)
DATABASE_URL=<neonProject.connectionUriPooler — pooled connection for app runtime>
DATABASE_URL_UNPOOLED=<neonProject.connectionUri — direct connection for Drizzle migrations>

# Email (Sensitive — from 1Password beep-email)
RESEND_API_KEY=<from 1Password: EMAIL_RESEND_API_KEY>

# Graph Backend (Sensitive — proxy URL from infra/railway.ts, API key from 1Password beep-data)
GRAPHITI_API_URL=https://auth-proxy-production-91fe.up.railway.app
GRAPHITI_API_KEY=<from 1Password: GRAPHITI_API_KEY>

# OpenAI (Sensitive — from 1Password beep-ai, mapped from AI_OPENAI_API_KEY to OPENAI_API_KEY)
OPENAI_API_KEY=<from 1Password: AI_OPENAI_API_KEY>

# Access Control (Non-sensitive — from 1Password beep-app-core, targets: preview + development)
ALLOWED_EMAILS=<from 1Password: APP_ADMINS_EMAILS>

# Optional (Non-sensitive — static default, targets: preview + development)
OPENAI_MODEL=gpt-4o-mini
```

**Env var scoping (Vercel restriction):**
- Sensitive vars CANNOT target `development` (local `vercel dev`) — only `preview` (non-prod) or `production` (prod)
- Non-sensitive vars target `preview` + `development` (non-prod) or `production` (prod)
- This is enforced automatically by SST IaC in `infra/web.ts`

**Local pre-push quality gate (lefthook):**
```bash
op run --env-file=.env -- sh -c 'bun run build && bun run check && bun run test'
```
- `bun run build` executes `apps/web` DB migrations before `next build`.
- This command requires valid `DATABASE_URL_UNPOOLED` credentials and reachable database network path.
- If this fails with DB auth errors, resolve secrets first before treating it as an application regression.

**Smoke test script:**
```bash
# Run after deployment
BASE_URL=https://beep-dev.vercel.app
GRAPHITI_API_URL=https://auth-proxy-production-91fe.up.railway.app

# 1. Auth: sign-in page loads
curl -s -o /dev/null -w "%{http_code}" $BASE_URL/sign-in  # expect 200

# 2. API: unauthenticated request rejected
curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/chat  # expect 401

# 3. Graphiti health (via Caddy auth proxy on Railway)
curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: $GRAPHITI_API_KEY" $GRAPHITI_API_URL/mcp  # expect 200

# 4. Graph: search returns data
# ... with session cookie
```

**Production hardening checklist:**
- [ ] Request body size limits: 16KB chat, 4KB graph search
- [ ] Rate limits: 30 chat/min, 60 graph/min per session
- [ ] Max tool iterations: 3 rounds per chat request
- [ ] Max output tokens: 4096
- [ ] OpenAI API key server-only (never in NEXT_PUBLIC_*)
- [ ] Session cookie secure + httpOnly
- [ ] CORS configured for production domain only
- [ ] Error responses don't leak stack traces
- [ ] Railway FalkorDB: only Caddy auth proxy is publicly exposed (FalkorDB + Graphiti on private network)

**Runbook sections:**
1. Deployment procedure:
   - App: Git push to trigger Vercel auto-deploy
   - Infrastructure: `op run --env-file=.env -- bunx sst deploy --stage dev`
2. Railway maintenance (FalkorDB backups, service health checks)
3. Environment variable rotation (update in 1Password, re-run SST deploy)
4. Failure modes and recovery:
   - Railway FalkorDB down -> show "graph temporarily unavailable" message; check Railway dashboard
   - Graphiti API failure -> retry with backoff, then error message
   - OpenAI API failure -> retry with backoff, then error message
   - FalkorDB "No active deployment" after SST redeploy -> click "Deploy the image" in Railway dashboard
5. Cost monitoring:
   - OpenAI usage dashboard
   - Vercel function invocations
   - Railway resource utilization (built-in metrics dashboard)
6. Rollback procedure (Vercel instant rollback)
7. Adding/removing users from allowlist (update `APP_ADMINS_EMAILS` in 1Password, re-run SST deploy)
8. FalkorDB backup procedure (Railway built-in volume backups + manual RDB dump export)

### Cost Projections (v1 Beta)

| Service                                    | Monthly Cost       | Notes                                                            |
|--------------------------------------------|--------------------|------------------------------------------------------------------|
| Vercel                                     | $0 (Hobby + Fluid) | Fluid compute: 300s duration on Hobby; Active CPU pricing        |
| Railway (FalkorDB + Graphiti + Auth Proxy) | $8-10 (Hobby plan) | Deployed via SST IaC; 3 services, private networking             |
| Neon PostgreSQL                            | $0 (free tier)     | Auth tables only                                                 |
| Resend                                     | $0 (free tier)     | 100 emails/day                                                   |
| OpenAI                                     | ~$5-20             | gpt-4o-mini at ~$0.15/M input, $0.60/M output; varies with usage |
| **Total**                                  | **$13-30/month**   |                                                                  |

## Episodic Memory

### From P0-P4
- Complete app: auth (better-auth magic link), Graphiti API, toolkit, chat, graph UI, atoms
- All routes tested locally
- react-force-graph-2d rendering with live data

## Semantic Memory

### Vercel Deployment
- Node.js runtime for AI/tool-calling routes (not Edge)
- `maxDuration` up to 300s on Hobby with Fluid compute (up to 800s on Pro)
- Module-level handler singleton prevents cold-start rebuild

### Sensitive Env Vars (set by SST IaC — infra/web.ts)
- Sensitive vars are marked `sensitive: true` in SST IaC (write-only after creation in Vercel)
- Sensitive: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, DATABASE_URL_UNPOOLED, RESEND_API_KEY, GRAPHITI_API_KEY, GRAPHITI_API_URL, OPENAI_API_KEY
- Non-Sensitive: ALLOWED_EMAILS, OPENAI_MODEL
- Sensitive vars CANNOT target `development` — only `preview` (non-prod) or `production` (prod)

## Procedural Memory

### References
- Vercel env docs: https://vercel.com/docs/environment-variables
- better-auth docs: https://www.better-auth.com/docs
- better-auth magic link: https://www.better-auth.com/docs/plugins/magic-link
- Research notes: `outputs/research.md` sections 5, 7
