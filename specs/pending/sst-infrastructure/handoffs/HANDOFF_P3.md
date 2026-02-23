# P3 — Vercel + Integration Wiring

**Date:** 2026-02-23
**Status:** PENDING
**Depends on:** P2 (Neon database provisioned, all secrets defined)

---

## Working Memory (Current Phase)

### Goal

Define the Vercel project in `infra/web.ts` and wire all environment variables from Railway outputs, Neon outputs, and 1Password secrets into the Vercel project. At phase exit, `op run --env-file=.env -- bunx sst deploy --stage dev` provisions a complete, connected infrastructure — Railway services, Neon database, and Vercel project with all env vars populated.

### Deliverables

1. `infra/web.ts` — Vercel project, environment variables wired from all sources
2. Updated `sst.config.ts` — import web module, return Vercel project URL
3. End-to-end deployment — single `bunx sst deploy --stage dev` provisions everything
4. Outputs document — all URLs and connection strings returned by `sst deploy`

### Success Criteria

- [ ] Vercel project created with name `beep-{stage}`
- [ ] All 10 environment variables set on the Vercel project
- [ ] Env vars correctly reference Railway proxy URL, Neon connection string, and 1Password secrets
- [ ] Sensitive env vars marked appropriately in Vercel
- [ ] `bunx sst deploy --stage dev` completes end-to-end (Railway + Neon + Vercel)
- [ ] Deploy outputs include: `proxyUrl`, `neonConnectionHost`, `vercelProjectUrl`

### Blocking Issues

- `VERCEL_API_TOKEN` must be available (via 1Password `op run` or shell environment).
- If using a Vercel team, `VERCEL_TEAM_ID` may also be required.

### Key Constraints

- **Vercel project is Git-connected.** The IaC creates the Vercel project and sets env vars, but actual app deployments are triggered by Git pushes (Vercel's default). The IaC does NOT deploy the app code — it provisions the project configuration.
- **Environment variables must be set BEFORE the first Vercel deployment.** Otherwise the app will fail to start due to missing env vars.
- **Vercel env var scoping.** Vercel supports `production`, `preview`, and `development` scopes. Map SST stages accordingly: `production` stage sets `production` scope, all others set `preview` + `development`.
- **Do NOT create Vercel DNS/domain records via IaC for v1.** The default `*.vercel.app` domain is sufficient. Custom domains can be added in a future iteration.

### Implementation Order

1. **Check Vercel provider types** in `.sst/platform/config.d.ts`:

   ```bash
   grep -r "class Project\|class ProjectEnvironmentVariable\|class Deployment" .sst/platform/config.d.ts | grep -i vercel | head -20
   ```

   Expected resources: `vercel.Project`, `vercel.ProjectEnvironmentVariable`, `vercel.ProjectDomain`.

2. **Write `infra/web.ts`:**

   Based on verified `@pulumiverse/vercel` v4.6.0 provider research:

   ```typescript
   // infra/web.ts

   // Secrets are plain strings from process.env (via 1Password op run).
   // No .value accessor needed — these are NOT sst.Secret objects.
   import {
     betterAuthSecret,
     betterAuthUrl,
     allowedEmails,
     graphitiApiKey,
     openaiApiKey,
     resendApiKey,
   } from "./secrets";
   // NOTE: proxyUrl is NOT a Pulumi Output — the domain was generated manually (Gap 2).
   // Use the constant from railway.ts or hardcode until ServiceDomain works in a future provider version.
   import { proxyUrl } from "./railway";
   import { connectionUri, connectionUriPooler } from "./database";

   const isProduction = $app.stage === "production";

   // --- Vercel Project ---
   // gitRepository links to GitHub for auto-deployments on push.
   // Requires the Vercel GitHub integration to be installed on the repo.
   const project = new vercel.Project("VercelProject", {
     name: `beep-${$app.stage}`,
     framework: "nextjs",
     buildCommand: "bun run build",
     installCommand: "bun install",
     rootDirectory: "apps/web",
     gitRepository: {
       type: "github",
       repo: "kriegcloud/beep-effect2",
       productionBranch: "main",
     },
     // If using a Vercel team, set teamId here or configure via VERCEL_TEAM env var on the provider
   });

   // --- Environment Variables ---
   // Targets are plain strings: "production", "preview", "development" (confirmed from provider docs)
   const targets = isProduction
     ? ["production"]
     : ["preview", "development"];

   // Loop approach (works — Pulumi resource names are just strings)
   // Secrets are plain strings (from 1Password via process.env).
   // Neon/Railway outputs are Output<string> (computed at deploy time).
   // Both work as Pulumi Input<string>.
   const envVars: Array<{ key: string; value: any; sensitive: boolean }> = [
     // Auth (from 1Password)
     { key: "BETTER_AUTH_SECRET", value: betterAuthSecret, sensitive: true },
     { key: "BETTER_AUTH_URL", value: betterAuthUrl, sensitive: true },
     { key: "ALLOWED_EMAILS", value: allowedEmails, sensitive: false },

     // Graph API (proxyUrl is Output<string> from Railway; graphitiApiKey is plain string from 1Password)
     { key: "GRAPHITI_API_URL", value: proxyUrl, sensitive: true },
     { key: "GRAPHITI_API_KEY", value: graphitiApiKey, sensitive: true },

     // AI (from 1Password)
     { key: "OPENAI_API_KEY", value: openaiApiKey, sensitive: true },

     // Database (from Neon computed outputs — Output<string>, includes credentials)
     { key: "DATABASE_URL", value: connectionUriPooler, sensitive: true },
     { key: "DATABASE_URL_UNPOOLED", value: connectionUri, sensitive: true },

     // Email (from 1Password)
     { key: "RESEND_API_KEY", value: resendApiKey, sensitive: true },
   ];

   for (const env of envVars) {
     new vercel.ProjectEnvironmentVariable(`VercelEnv-${env.key}`, {
       projectId: project.id,
       key: env.key,
       value: env.value,
       targets: targets,
       sensitive: env.sensitive,
     });
   }

   // OPENAI_MODEL (non-sensitive, static default)
   new vercel.ProjectEnvironmentVariable("VercelEnv-OPENAI_MODEL", {
     projectId: project.id,
     key: "OPENAI_MODEL",
     value: "gpt-4o-mini",
     targets: targets,
     sensitive: false,
   });

   // --- Exports ---
   export const vercelProjectId = project.id;
   export const vercelProjectUrl = $interpolate`https://beep-${$app.stage}.vercel.app`;
   ```

   **Verified provider details:**
   - **`targets` are plain strings** — `"production"`, `"preview"`, `"development"`. NOT enum values. At least one of `targets` or `customEnvironmentIds` is required.
   - **`sensitive` property exists** — boolean, marks variable as write-only after creation.
   - **Loop approach works** — Pulumi resource names are just logical identifiers (strings). Dynamic names in loops are fully supported.
   - **Alternative: `vercel.ProjectEnvironmentVariables` (plural)** — batch resource that accepts a `variables` array. Could replace the loop if preferred.
   - **`gitRepository` block** — takes `type` (required: `"github"` | `"gitlab"` | `"bitbucket"`), `repo` (required: `"owner/repo"`), `productionBranch` (optional). Requires the Vercel GitHub integration to be installed on the repo.
   - **`DATABASE_URL_UNPOOLED` added** — Neon `connectionUri` (direct, for Drizzle migrations). `DATABASE_URL` uses `connectionUriPooler` (pooled, for app runtime via `@neondatabase/serverless`).
   - **Cross-provider references work** — `proxyUrl` from `infra/railway.ts` and `connectionUri`/`connectionUriPooler` from `infra/database.ts` are Pulumi `Output<string>` values. SST resolves these at deploy time.

3. **Update `sst.config.ts`:**

   ```typescript
   async run() {
     const secrets = await import("./infra/secrets");
     const railway = await import("./infra/railway");
     const database = await import("./infra/database");
     const web = await import("./infra/web");

     return {
       // Railway
       railwayProjectId: railway.railwayProjectId,
       proxyUrl: railway.proxyUrl, // NOTE: string constant, not Pulumi Output (domain was manual)

       // Neon
       neonProjectId: database.projectId,
       neonConnectionHost: database.connectionUri,

       // Vercel
       vercelProjectId: web.vercelProjectId,
       vercelProjectUrl: web.vercelProjectUrl,
     };
   }
   ```

4. **Deploy end-to-end:**

   ```bash
   op run --env-file=.env -- bunx sst deploy --stage dev
   ```

5. **Verify environment variables in Vercel dashboard:**
   - Open the Vercel project settings > Environment Variables
   - Confirm all 10 env vars are present
   - Confirm sensitive vars show as encrypted (no readable value)
   - Confirm targets match (preview + development for dev stage)

6. **Test a deployment trigger:**
   - Push a commit to the repo
   - Verify Vercel picks up the project and starts a build
   - Check build logs for env var availability (Next.js will warn if expected env vars are missing)

---

## Episodic Memory (Previous Context)

### P0-P2 Outcomes

- SST initialized, all providers installed
- Railway project `beep-dev` with 3 services deployed and accessible
- Auth Proxy public URL: `https://auth-proxy-production-91fe.up.railway.app`
- Neon database provisioned (pending P2 completion)
- 1Password vault fields created and validated (P1 secrets already working)
- `infra/secrets.ts` is the single source of truth for all secrets (reads from `process.env`)
- Cross-module import pattern established (secrets -> railway)

### P1 Important Notes for P3

1. **`proxyUrl` is NOT a Pulumi Output.** The auth proxy URL was generated manually via Railway dashboard (ServiceDomain creation failed — Gap 2). `infra/railway.ts` only exports `railwayProjectId`. For P3, the proxy URL must be either:
   - **Option A:** Hardcoded as a constant: `const PROXY_URL = "https://auth-proxy-production-91fe.up.railway.app"`
   - **Option B:** Added as a new export in `infra/railway.ts` (string constant, not Pulumi Output)
   - **Option C:** Read from an env var / 1Password

2. **OpenAI API key env var naming.** The 1Password field is `AI_OPENAI_API_KEY` (in `beep-ai` item). `infra/secrets.ts` reads it as `AI_OPENAI_API_KEY`. If Vercel env vars need `OPENAI_API_KEY` (without the `AI_` prefix), map it in `infra/web.ts`.

3. **Deploy command uses `.env` not `.env.op.dev`.** The existing `.env` file already has all `op://` references. Command: `op run --env-file=.env -- bunx sst deploy --stage dev`

### Key Patterns Established

- Provider type checking via `grep` on `.sst/platform/config.d.ts`
- `$interpolate` syntax for cross-resource references (used in Railway `FALKORDB_URI`)
- 1Password `op run --env-file=.env` + `process.env` read pattern (plain strings, no `.value`)
- Module export/import pattern across `infra/` files
- `encodeURIComponent` for passwords in URIs with special characters

---

## Semantic Memory (Project Constants)

### Complete Environment Variable Contract (from Knowledge Graph App Spec)

| Env Var | Source | Vercel Scope | Sensitive |
|---|---|---|---|
| `BETTER_AUTH_SECRET` | 1Password (`op://beep-dev-secrets/beep-app-core/AUTH_SECRET`) | all | Yes |
| `BETTER_AUTH_URL` | 1Password (`op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL`) | per-stage | Yes |
| `ALLOWED_EMAILS` | 1Password (`op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS`) | per-stage | No |
| `DATABASE_URL` | `neonProject.connectionUriPooler` (computed) | all | Yes |
| `DATABASE_URL_UNPOOLED` | `neonProject.connectionUri` (computed) | all | Yes |
| `GRAPHITI_API_URL` | Railway `proxyUrl` output (computed) | all | Yes |
| `GRAPHITI_API_KEY` | 1Password (`op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY`) | all | Yes |
| `OPENAI_API_KEY` | 1Password (`op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY`) | all | Yes |
| `OPENAI_MODEL` | Static: `"gpt-4o-mini"` | all | No |
| `RESEND_API_KEY` | 1Password (`op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY`) | all | Yes |

**Neon connection strings are computed outputs on `neon.Project`:**
- `project.connectionUriPooler` → `DATABASE_URL` (pooled, for app runtime via `@neondatabase/serverless`)
- `project.connectionUri` → `DATABASE_URL_UNPOOLED` (direct, for Drizzle migrations)
Both are complete `postgres://user:password@host/db?sslmode=require` URIs with embedded credentials. No manual construction needed.

### Import Graph

```
infra/secrets.ts    (reads process.env, no imports from infra/)
    ↑
infra/railway.ts    (imports: secrets — plain strings)
    ↑
infra/database.ts   (no secret imports — Neon outputs are computed)
    ↑
infra/web.ts        (imports: secrets, railway, database)
    ↑
sst.config.ts       (dynamic imports: secrets, railway, database, web)
```

This is a DAG — no circular dependencies.

---

## Procedural Memory (Reference Links)

- [Vercel Pulumi Provider](https://www.pulumi.com/registry/packages/vercel/)
- [@pulumiverse/vercel npm](https://www.npmjs.com/package/@pulumiverse/vercel)
- [SST Resource Linking](https://sst.dev/docs/linking/)
- [SST Environment Variables](https://sst.dev/docs/environment-variables/)
- [Knowledge Graph App — HANDOFF_P5 (Deployment)](../../../specs/pending/claude-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P5.md)
- [Spec README ADR-004](../README.md)

---

## Verification Steps

```bash
# 1. End-to-end deploy
op run --env-file=.env -- bunx sst deploy --stage dev

# 2. Check all outputs
bunx sst deploy --stage dev 2>&1 | grep -E "proxyUrl|neonConnection|vercelProject"

# 3. Verify Vercel env vars (via Vercel CLI)
npx vercel env ls --project beep-dev

# 4. Verify env var values propagate (trigger a build)
# Push a commit or run: npx vercel --prod (if configured)
# Check build logs for env var warnings

# 5. Quick smoke test (after app deploys)
curl -s https://beep-dev.vercel.app/api/health || echo "App not yet deployed"
```

---

## Known Issues & Gotchas

1. **Vercel project Git linking.** The Vercel provider's `gitRepository` block may fail if the repo isn't already connected to Vercel. Two approaches: (a) link the repo to Vercel manually first (dashboard), then manage only env vars via IaC; or (b) use the provider's import mechanism to adopt an existing Vercel project.

2. **Cross-provider output resolution.** When `infra/web.ts` references `proxyUrl` from `infra/railway.ts`, SST resolves this at deploy time. If Railway resources fail to provision, the Vercel env vars will also fail. The deploy order is: secrets -> railway -> database -> web (following the import DAG).

3. **Vercel env var updates.** Changing a Vercel env var via IaC does NOT automatically trigger a redeploy. You must push a commit or manually trigger a build in the Vercel dashboard for changes to take effect.

4. **Pulumi resource naming in loops.** If the for-loop approach for env vars fails (Pulumi may require statically-known resource names), replace with individual `new vercel.ProjectEnvironmentVariable(...)` declarations for each env var.

5. **`DATABASE_URL_UNPOOLED` may require separate handling.** If the Neon provider doesn't expose an unpooled connection string, you may need to: (a) construct it from components using `$interpolate`, or (b) skip it in IaC and set it manually in Vercel dashboard.

6. **Vercel team scope.** If the Vercel account is a team (not personal), the provider may require `VERCEL_TEAM_ID` in addition to `VERCEL_API_TOKEN`. Check provider docs.

7. **Auth Proxy URL is a string constant, not a Pulumi Output.** The Railway ServiceDomain resource failed (Gap 2), so the domain was generated manually. `proxyUrl` must be exported from `infra/railway.ts` as a plain string constant (`"https://auth-proxy-production-91fe.up.railway.app"`), not computed from a Pulumi resource. This means changing the Railway project (e.g., creating a new stage) requires manually generating a new domain and updating the constant.

8. **OpenAI API key env var mapping.** The 1Password field and `infra/secrets.ts` use `AI_OPENAI_API_KEY`. If the Vercel app expects `OPENAI_API_KEY`, map it in the env vars loop: `{ key: "OPENAI_API_KEY", value: openaiApiKey, sensitive: true }` where `openaiApiKey` comes from `infra/secrets.ts`.

---

## Success Criteria Checklist

- [ ] `infra/web.ts` defines Vercel project and all environment variables
- [ ] No circular imports in the `infra/` module graph
- [ ] `sst.config.ts` imports all 4 infra modules and returns all outputs
- [ ] `bunx sst deploy --stage dev` provisions Railway + Neon + Vercel without errors
- [ ] Vercel dashboard shows project `beep-dev` with 10 env vars
- [ ] Sensitive env vars are not readable in Vercel dashboard
- [ ] Deploy outputs include `proxyUrl`, `neonConnectionHost`, `vercelProjectUrl`
- [ ] A Git push to the repo triggers a Vercel build that has access to all env vars
