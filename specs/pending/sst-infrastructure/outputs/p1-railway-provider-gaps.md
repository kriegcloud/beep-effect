# P1 — Railway Provider Gaps

**Date:** 2026-02-23
**Provider:** `@sst-provider/railway` v0.4.4 (bridges TF provider v0.4.4)

---

## Gap 1: Volume Creation Fails

**Resource:** `railway.Service` → `volume` nested block
**Error:** `Unable to create volume, got error: input: Problem processing request`
**Root Cause:** Known creation bug in TF provider v0.4.4, fixed in v0.6.1.

### Workaround

Configure the FalkorDB persistent volume manually in the Railway dashboard:

1. Open https://railway.app → project `beep-dev`
2. Click the `falkordb` service
3. Go to Settings → Volumes
4. Add volume: mount path `/data`, name `falkordb-data`
5. Redeploy the service

---

## Gap 2: ServiceDomain Creation Fails

**Resource:** `railway.ServiceDomain`
**Error:** `Unable to update service domain, got error: returned error 400 Bad Request`
**Root Cause:** Likely API incompatibility between TF provider v0.4.4 and Railway's current API (the provider creates the domain then tries to update it with the subdomain — the update call fails).

### Workaround

Generate the auth proxy domain manually in the Railway dashboard:

1. Open https://railway.app → project `beep-dev`
2. Click the `auth-proxy` service
3. Go to Settings → Networking → Public Networking
4. Click "Generate Domain"
5. Note the generated `*.up.railway.app` URL for use in Vercel env vars (P3)

---

## Gap 3: No Start Command Field on Service

**Resource:** `railway.Service`
**Issue:** The provider exposes no `startCommand` / `command` / `entrypoint` field.
**Impact:** Cannot override Docker CMD via IaC. Required for auth-proxy (Caddy) to load its Caddyfile from the `CADDYFILE` environment variable.

### Workaround

Set the start command manually in the Railway dashboard:

1. Open https://railway.app → project `beep-dev`
2. Click the `auth-proxy` service
3. Go to Settings → Deploy → Custom Start Command
4. Set to: `sh -c 'printf "%s" "$CADDYFILE" > /etc/caddy/Caddyfile && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile'`
5. Redeploy the service

The `CADDYFILE` env var is managed via IaC in `infra/railway.ts`.

---

## Gap 4: Railway API Token Scope

The `RAILWAY_TOKEN` stored in 1Password works for the Terraform provider but returns 401 on Railway's GraphQL API (`backboard.railway.app/graphql/v2`). This means automated domain creation via API fallback is not possible with the current token.

### Recommendation

If API automation is needed later, generate a **personal access token** (not a project/team token) from Railway dashboard → Account Settings → Tokens.

---

## Summary

| Feature | IaC Status | Manual Step Required |
|---|---|---|
| Project creation | Working | No |
| Service creation | Working | No |
| VariableCollection | Working | No |
| Volume (nested on Service) | Failed (v0.4.4 bug) | Yes — add via dashboard |
| ServiceDomain | Failed (400 Bad Request) | Yes — generate via dashboard |
| Start command override | Not supported | Yes — set via dashboard |

---

## Operational Notes (Not Provider Gaps)

### `PORT` Env Var for Multi-EXPOSE Images

Docker images that EXPOSE multiple ports (e.g., `caddy:2-alpine` exposes 80, 443, 2019) require a `PORT` env var so Railway knows which port to route public traffic to. Without it, Railway's edge proxy returns 502 with `x-railway-fallback: true` header. Set `PORT=80` in the service's `VariableCollection`.

### `encodeURIComponent` for Passwords in Redis URIs

FalkorDB passwords generated with `openssl rand -base64 32` contain `+`, `/`, `=` which break Redis URI parsing. The `FALKORDB_URI` must URL-encode the password:
```typescript
const encodedFalkordbPassword = encodeURIComponent(falkordbPassword);
// Then: redis://default:${encodedFalkordbPassword}@falkordb.railway.internal:6379
```

### FalkorDB Redeploy After SST Updates

SST deploys that update service config can cause FalkorDB's active deployment to be replaced with no new deployment auto-starting. Check Railway dashboard after each `sst deploy` — if FalkorDB shows "No active deployment", click "Deploy the image" to restart.

### Auth Proxy Public URL

The generated public domain is: `auth-proxy-production-91fe.up.railway.app`
This was generated manually via Railway dashboard (Gap 2). It is NOT available as a Pulumi Output.

---

### Mitigation Path

When `@sst-provider/railway` updates to bridge TF provider >= v0.6.1, re-enable:
1. `volume` block on FalkorDb service
2. `railway.ServiceDomain` resource for auth proxy
3. Check if `startCommand` field is added to `railway.Service`
