# Handoff P5: Deployment + Hardening

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,500 | OK |
| Episodic | 1,000 | ~400 | OK |
| Semantic | 500 | ~300 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 5 Goal
Deploy the complete application to Vercel, wire all production environment variables, run smoke tests, and produce a production runbook.

### Deliverables
1. Vercel project configured with all env vars
2. FalkorDB VPS verified for production traffic (from P1)
3. `apps/web/vercel.json` or `next.config.ts` adjustments for Node runtime routes
4. `outputs/p5-deployment/smoke-test-results.md` — Results of end-to-end smoke tests
5. `outputs/p5-deployment/runbook.md` — Production runbook (failure handling, rollback, cost monitoring)
6. `outputs/p5-deployment/env-contract.md` — Complete environment variable documentation

### Success Criteria
- [ ] Vercel preview deployment accessible at a preview URL
- [ ] All env vars configured in Vercel dashboard (marked Sensitive where needed)
- [ ] FalkorDB VPS operational and reachable from Vercel
- [ ] Graphiti API health check passes from Vercel deployment
- [ ] Smoke tests pass:
  - Auth: magic link sign-in with allowlisted email, reject non-allowlisted
  - Chat: POST /api/chat returns grounded answer
  - Graph: GET /api/graph/search returns nodes
  - UI: Graph page renders, chat page renders
- [ ] Node.js runtime configured for `/api/chat`, `/api/graph/*`
- [ ] Rate limiting active on API routes
- [ ] Request body size limits enforced
- [ ] Production runbook committed

### Implementation Notes

**Next.js route segment config:**
```ts
// app/api/chat/route.ts
export const runtime = "nodejs"
export const maxDuration = 60 // seconds, for streaming tool-calling workloads (Fluid compute: 300s max on Hobby)
```

**Vercel environment variables:**
```
# Auth (Sensitive)
BETTER_AUTH_SECRET=<32+ chars, high entropy>
BETTER_AUTH_URL=https://yourapp.vercel.app

# Database (Sensitive, auto-synced by Neon Vercel integration)
DATABASE_URL=<neon pooled connection string>
DATABASE_URL_UNPOOLED=<neon direct connection for migrations>

# Email (Sensitive)
RESEND_API_KEY=<from resend.com dashboard>

# Graph Backend (Sensitive)
GRAPHITI_API_URL=https://graph.yourdomain.com
GRAPHITI_API_KEY=<shared secret>

# OpenAI (Sensitive)
OPENAI_API_KEY=<production key>

# Access Control
ALLOWED_EMAILS=<comma-separated list>

# Optional
OPENAI_MODEL=gpt-4o-mini
```

**Smoke test script:**
```bash
# Run after deployment
BASE_URL=https://effect-v4-kg.vercel.app

# 1. Auth: sign-in page loads
curl -s -o /dev/null -w "%{http_code}" $BASE_URL/sign-in  # expect 200

# 2. API: unauthenticated request rejected
curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/chat  # expect 401

# 3. Graphiti health (direct VPS check)
curl -s -o /dev/null -w "%{http_code}" -H "X-API-Key: $GRAPHITI_API_KEY" $GRAPHITI_API_URL/health  # expect 200

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
- [ ] FalkorDB VPS firewall: only Caddy ports (80, 443) exposed

**Runbook sections:**
1. Deployment procedure (Vercel push)
2. VPS maintenance (Docker updates, FalkorDB backups)
3. Environment variable rotation
4. Failure modes and recovery:
   - FalkorDB VPS down -> show "graph temporarily unavailable" message
   - Graphiti API failure -> retry with backoff, then error message
   - OpenAI API failure -> retry with backoff, then error message
5. Cost monitoring:
   - OpenAI usage dashboard
   - Vercel function invocations
   - VPS resource utilization (CPU, memory, disk)
6. Rollback procedure (Vercel instant rollback)
7. Adding/removing users from allowlist (update env var, redeploy)
8. FalkorDB backup procedure (RDB dump export)

### Cost Projections (v1 Beta)

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Vercel | $0 (Hobby + Fluid) | Fluid compute: 300s duration on Hobby; Active CPU pricing |
| FalkorDB VPS | $4-8 (Hetzner CX22) | 2 vCPU, 4GB RAM; FalkorDB + Graphiti + Caddy |
| Neon PostgreSQL | $0 (free tier) | Auth tables only |
| Resend | $0 (free tier) | 100 emails/day |
| OpenAI | ~$5-20 | gpt-4o-mini at ~$0.15/M input, $0.60/M output; varies with usage |
| **Total** | **$9-28/month** | |

## Episodic Memory

### From P0-P4
- Complete app: auth (better-auth magic link), Graphiti API, toolkit, chat, graph UI, atoms
- All routes tested locally
- react-force-graph-2d rendering with live data

## Semantic Memory

### Vercel Deployment
- Node.js runtime for AI/tool-calling routes (not Edge)
- `maxDuration` up to 60s on Pro plan (10s on Hobby for serverless)
- Module-level handler singleton prevents cold-start rebuild

### Sensitive Env Vars
- Mark as "Sensitive" in Vercel dashboard = write-only (no readback)
- Required Sensitive: BETTER_AUTH_SECRET, DATABASE_URL, RESEND_API_KEY, GRAPHITI_API_KEY, GRAPHITI_API_URL, OPENAI_API_KEY
- Non-Sensitive: ALLOWED_EMAILS, OPENAI_MODEL

## Procedural Memory

### References
- Vercel env docs: https://vercel.com/docs/environment-variables
- better-auth docs: https://www.better-auth.com/docs
- better-auth magic link: https://www.better-auth.com/docs/plugins/magic-link
- Research notes: `outputs/research.md` sections 5, 7
