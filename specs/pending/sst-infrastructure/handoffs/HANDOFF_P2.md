# P2 — Neon + 1Password Wiring

**Date:** 2026-02-23
**Status:** PENDING
**Depends on:** P1 (Railway services deployed)

---

## Working Memory (Current Phase)

### Goal

Define the Neon PostgreSQL database in `infra/database.ts` and wire all application secrets from 1Password into `infra/secrets.ts` via environment variables. At phase exit, `op run --env-file=.env.op.dev -- bunx sst deploy --stage dev` provisions a Neon database with all secrets available to the infra code.

### Deliverables

1. `infra/secrets.ts` — env var reads with validation (replaces `sst.Secret`)
2. `infra/database.ts` — Neon project, database, role, and connection string exports
3. Updated `sst.config.ts` — import secrets and database modules
4. `.env.op.dev` — 1Password reference file for dev stage
5. `.env.op.production` — 1Password reference file for production stage
6. New 1Password fields added to existing vault items (see Vault Setup below)

### Success Criteria

- [ ] `infra/secrets.ts` exports all 7 application secrets via `process.env` reads
- [ ] `infra/database.ts` creates Neon project, database, and role
- [ ] `op run --env-file=.env.op.dev -- bunx sst deploy --stage dev` provisions Neon database
- [ ] All 1Password fields exist in `beep-dev-secrets` vault
- [ ] Connection string output is accessible in `sst.config.ts` return values
- [ ] `infra/railway.ts` refactored to import secrets from `infra/secrets.ts` (plain strings, no `.value`)

### Blocking Issues

- `NEON_API_KEY` must be available (via 1Password `op run` or shell environment) for the Neon provider to authenticate.
- 1Password CLI (`op`) must be installed and authenticated.
- New fields must be added to existing 1Password items before first deploy.

### Key Constraints

- **Neon free tier limits.** 0.5GB storage, 1 project, 10 branches. For `dev` stage, a single project with one `main` branch is sufficient.
- **Secrets module is the single source of truth.** All secret reads live in `infra/secrets.ts`. Other infra modules import from there. No `process.env` reads in `railway.ts`, `database.ts`, or `web.ts`.
- **No `sst.Secret`.** Application secrets are sourced from 1Password vaults via `op run`, not from AWS SSM Parameter Store. This eliminates the `bunx sst secret set` ceremony entirely.
- **Do NOT use Neon's Vercel marketplace integration.** That creates an unmanaged, non-reproducible link. Instead, wire `DATABASE_URL` to Vercel explicitly in P3 using the Neon provider's connection string output.

### Implementation Order

1. **Add new fields to existing 1Password vault items:**

   The following fields need to be added to items in the `beep-dev-secrets` vault. Use `op item edit` or the 1Password UI.

   **New fields to add:**

   | Item | New Field | Type | Value |
   |---|---|---|---|
   | `beep-app-core` | `BETTER_AUTH_URL` | Concealed | `http://localhost:3000` (dev) |
   | `beep-data` | `FALKORDB_PASSWORD` | Concealed | `$(openssl rand -base64 32)` |
   | `beep-data` | `GRAPHITI_API_KEY` | Concealed | `$(openssl rand -base64 32)` |
   | `beep-build` | `RAILWAY_TOKEN` | Concealed | Railway API token |
   | `beep-build` | `NEON_API_KEY` | Concealed | Neon API key |
   | `beep-build` | `VERCEL_API_TOKEN` | Concealed | Vercel API token |

   **Existing fields (already present, no action needed):**

   | Item | Field | Maps To |
   |---|---|---|
   | `beep-app-core` | `AUTH_SECRET` | `BETTER_AUTH_SECRET` |
   | `beep-app-core` | `APP_ADMINS_EMAILS` | `ALLOWED_EMAILS` |
   | `beep-ai` | `AI_OPENAI_API_KEY` | `OPENAI_API_KEY` |
   | `beep-email` | `EMAIL_RESEND_API_KEY` | `RESEND_API_KEY` |
   | ~~`beep-cloud-aws`~~ | ~~`CLOUD_AWS_ACCESS_KEY_ID`~~ | ~~Not needed — CI uses OIDC~~ |
   | ~~`beep-cloud-aws`~~ | ~~`CLOUD_AWS_SECRET_ACCESS_KEY`~~ | ~~Not needed — CI uses OIDC~~ |

   **Add fields via CLI:**

   ```bash
   # Add new fields to existing items
   op item edit beep-app-core --vault beep-dev-secrets \
     'BETTER_AUTH_URL[concealed]=http://localhost:3000'

   op item edit beep-data --vault beep-dev-secrets \
     "FALKORDB_PASSWORD[concealed]=$(openssl rand -base64 32)" \
     "GRAPHITI_API_KEY[concealed]=$(openssl rand -base64 32)"

   op item edit beep-build --vault beep-dev-secrets \
     'RAILWAY_TOKEN[concealed]=<your-railway-token>' \
     'NEON_API_KEY[concealed]=<your-neon-api-key>' \
     'VERCEL_API_TOKEN[concealed]=<your-vercel-api-token>'
   ```

2. **Create `.env.op.dev`** (1Password reference file for dev stage):

   ```bash
   # .env.op.dev
   # 1Password secret references for the dev stage.
   # Used with: op run --env-file=.env.op.dev -- bunx sst deploy --stage dev
   #
   # These are op:// REFERENCES, not secret values. Safe to commit to git.
   # The `op run` command resolves them at runtime via authenticated 1Password CLI.

   # --- Provider tokens (authenticate SST providers) ---
   # NOTE: AWS auth is handled by SSO profile locally and OIDC federation in CI.
   # No AWS keys in 1Password — zero static AWS credentials.
   RAILWAY_TOKEN=op://beep-dev-secrets/beep-build/RAILWAY_TOKEN
   NEON_API_KEY=op://beep-dev-secrets/beep-build/NEON_API_KEY
   VERCEL_API_TOKEN=op://beep-dev-secrets/beep-build/VERCEL_API_TOKEN

   # --- App secrets (passed to Railway/Vercel as env vars) ---
   BETTER_AUTH_SECRET=op://beep-dev-secrets/beep-app-core/AUTH_SECRET
   BETTER_AUTH_URL=op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL
   ALLOWED_EMAILS=op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS
   FALKORDB_PASSWORD=op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD
   GRAPHITI_API_KEY=op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY
   OPENAI_API_KEY=op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY
   RESEND_API_KEY=op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY
   ```

   **Note:** This file is safe to commit to git. It contains `op://` references (pointers), not actual secret values. The `op run` command resolves them at runtime using authenticated 1Password CLI access.

3. **Create `.env.op.production`** (reference file for production stage):

   ```bash
   # .env.op.production
   # 1Password secret references for the production stage.
   # Production items should be created separately from dev items.
   #
   # Option A: Same vault, different items (suffix with -production)
   # Option B: Separate vault (e.g., beep-prod-secrets)
   #
   # For v1, use the same vault and items as dev. Update values in 1Password
   # to production-appropriate values before first production deploy.

   # --- Provider tokens (same across stages) ---
   # NOTE: AWS auth is handled by SSO profile locally and OIDC federation in CI.
   # No AWS keys in 1Password — zero static AWS credentials.
   RAILWAY_TOKEN=op://beep-dev-secrets/beep-build/RAILWAY_TOKEN
   NEON_API_KEY=op://beep-dev-secrets/beep-build/NEON_API_KEY
   VERCEL_API_TOKEN=op://beep-dev-secrets/beep-build/VERCEL_API_TOKEN

   # --- App secrets (production-specific values) ---
   # TODO: Create production-specific items or use a separate vault.
   # For v1, these point to the same dev items. Update values before production deploy.
   BETTER_AUTH_SECRET=op://beep-dev-secrets/beep-app-core/AUTH_SECRET
   BETTER_AUTH_URL=op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL
   ALLOWED_EMAILS=op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS
   FALKORDB_PASSWORD=op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD
   GRAPHITI_API_KEY=op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY
   OPENAI_API_KEY=op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY
   RESEND_API_KEY=op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY
   ```

4. **Check Neon provider types** in `.sst/platform/config.d.ts`:

   ```bash
   grep -r "class Project\|class Database\|class Role\|class Branch\|class Endpoint" .sst/platform/config.d.ts | grep -i neon | head -20
   ```

   Identify available Neon resources. Expected: `neon.Project`, `neon.Database`, `neon.Role`, `neon.Branch`, `neon.Endpoint`.

5. **Write `infra/secrets.ts`** — env var reads with validation:

   ```typescript
   // infra/secrets.ts
   //
   // Central secret reads from environment variables.
   // Secrets are sourced from 1Password via `op run`:
   //   op run --env-file=.env.op.<stage> -- bunx sst deploy --stage <stage>
   //
   // This module validates all required secrets are present at deploy time.
   // No sst.Secret — no AWS SSM dependency for application secrets.

   const requireEnv = (key: string): string => {
     const v = process.env[key];
     if (!v) {
       throw new Error(
         `Missing env var: ${key}. Deploy via 'op run --env-file=.env.op.<stage>' or set manually.`
       );
     }
     return v;
   };

   // --- Auth ---
   export const betterAuthSecret = requireEnv("BETTER_AUTH_SECRET");
   export const betterAuthUrl = requireEnv("BETTER_AUTH_URL");
   export const allowedEmails = requireEnv("ALLOWED_EMAILS");

   // --- Railway / Graph ---
   export const falkordbPassword = requireEnv("FALKORDB_PASSWORD");
   export const graphitiApiKey = requireEnv("GRAPHITI_API_KEY");
   export const openaiApiKey = requireEnv("OPENAI_API_KEY");

   // --- Email ---
   export const resendApiKey = requireEnv("RESEND_API_KEY");
   ```

6. **Refactor `infra/railway.ts`** to use plain string imports (no `.value`):

   ```typescript
   // infra/railway.ts — top of file
   import { falkordbPassword, openaiApiKey, graphitiApiKey } from "./secrets";

   // Secrets are plain strings (not sst.Secret objects).
   // Use directly — no .value accessor needed.
   // e.g., in VariableCollection: { name: "FALKORDB_PASSWORD", value: falkordbPassword }
   ```

7. **Write `infra/database.ts`:**

   (Neon outputs are computed by the provider, not from 1Password)

   ```typescript
   // infra/database.ts

   // --- Neon Project ---
   // Creating a Project auto-creates:
   //   - Default branch (accessible via project.defaultBranchId)
   //   - Default endpoint (accessible via project.defaultEndpointId)
   //   - Default database (accessible via project.databaseName)
   //   - Default role (accessible via project.databaseUser / project.databasePassword)
   //
   // Computed outputs include full connection URIs with credentials:
   //   - project.connectionUri       → direct connection (for migrations)
   //   - project.connectionUriPooler → pooled connection (for app runtime)

   const isPrPreview = $app.stage.startsWith("pr-");

   const neonProject = !isPrPreview
     ? new neon.Project("NeonProject", {
         name: `beep-${$app.stage}`,
         pgVersion: 17,
         regionId: "aws-us-east-1",
         branch: {
           name: "main",
           databaseName: "beep_auth",
           roleName: "beep_user",
         },
       })
     : undefined;

   // --- Linkable for type-safe access in app code ---
   // sst.Linkable exposes properties via Resource.NeonDb.xxx in app runtime
   const db = neonProject
     ? new sst.Linkable("NeonDb", {
         properties: {
           url: neonProject.connectionUriPooler,        // DATABASE_URL (pooled, for app)
           urlUnpooled: neonProject.connectionUri,       // DATABASE_URL_UNPOOLED (for migrations)
           host: neonProject.databaseHost,
           hostPooler: neonProject.databaseHostPooler,
           name: neonProject.databaseName,
           user: neonProject.databaseUser,
           password: neonProject.databasePassword,
         },
       })
     : undefined;

   // --- Exports (for use in infra/web.ts) ---
   export const connectionUri = neonProject?.connectionUri;
   export const connectionUriPooler = neonProject?.connectionUriPooler;
   export const projectId = neonProject?.id;
   export const neonDb = db;
   ```

   **Key design decisions:**
   - **No separate Branch/Database/Endpoint resources needed** — `neon.Project` handles everything for the default setup (see README ADR-015).
   - **`connectionUri` vs `connectionUriPooler`** — both are computed outputs on `neon.Project` that include full credentials. These are NOT from 1Password — they're generated by the Neon provider at deploy time.
   - **PR previews skip Neon** — Free tier allows only 1 project. PR stages skip database provisioning entirely.
   - **`sst.Linkable`** — wraps Neon outputs for type-safe `Resource.NeonDb.url` access in application code.

8. **Update `sst.config.ts`:**

   ```typescript
   async run() {
     const secrets = await import("./infra/secrets");
     const railway = await import("./infra/railway");
     const database = await import("./infra/database");

     return {
       railwayProjectId: railway.railwayProjectId,
       proxyUrl: railway.proxyUrl,
       neonProjectId: database.projectId,
       neonConnectionHost: database.connectionUri,
     };
   }
   ```

9. **Deploy and verify:**

   ```bash
   # Ensure SSO session is active (12-hour sessions)
   aws sso login --profile beep-dev

   # Deploy — SSO handles AWS auth, op run handles Railway/Neon/Vercel tokens + app secrets
   op run --env-file=.env.op.dev -- bunx sst deploy --stage dev
   ```

---

## Episodic Memory (Previous Context)

### P0-P1 Outcomes

- SST initialized with all providers
- Railway project created with 3 services (FalkorDB, Graphiti MCP, Auth Proxy)
- Any Railway provider gaps documented in `outputs/p1-railway-provider-gaps.md`

### Lessons from P1

- Note the actual provider property naming convention (camelCase vs snake_case)
- Note any `$interpolate` syntax patterns used successfully
- Note the environment ID resolution pattern that worked for Railway

---

## Semantic Memory (Project Constants)

### Complete Secret Inventory

| Env Var | 1Password Reference | Purpose | Stages |
|---|---|---|---|
| `BETTER_AUTH_SECRET` | `op://beep-dev-secrets/beep-app-core/AUTH_SECRET` | Session signing key | all |
| `BETTER_AUTH_URL` | `op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL` | Auth callback base URL | per-stage |
| `ALLOWED_EMAILS` | `op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS` | Magic link allowlist | per-stage |
| `FALKORDB_PASSWORD` | `op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD` | FalkorDB authentication | all |
| `GRAPHITI_API_KEY` | `op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY` | Auth proxy X-API-Key | all |
| `OPENAI_API_KEY` | `op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY` | Graphiti + AI routes | per-stage |
| `RESEND_API_KEY` | `op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY` | Magic link email delivery | per-stage |

### 1Password Vault Structure

| Vault | Items | Purpose |
|---|---|---|
| `beep-dev-secrets` | `beep-app-core`, `beep-ai`, `beep-data`, `beep-email`, `beep-build` | All dev/staging secrets + provider tokens (AWS uses OIDC, not 1Password) |
| `beep-automation-admin` | `beep-sync-service-account` | CI/CD service account (`OP_SERVICE_ACCOUNT_TOKEN`) |

**Note:** For production, either create separate items with `-production` suffix in `beep-dev-secrets` or create a dedicated `beep-prod-secrets` vault.

### Neon Resource Mapping (Simplified — see ADR-015)

| App Spec Resource | Neon Provider Resource | Notes |
|---|---|---|
| PostgreSQL database | `neon.Project` (auto-creates defaults) | Free tier: 1 project, 0.5GB |
| Connection string (pooled) | `project.connectionUriPooler` (computed output) | For app runtime via `@neondatabase/serverless` |
| Connection string (unpooled) | `project.connectionUri` (computed output) | For Drizzle migrations |
| Auth tables (user, session, account, verification) | N/A — application-level | Managed by Drizzle migrations, not IaC |

**No separate `neon.Branch`, `neon.Database`, `neon.Endpoint`, or `neon.Role` resources needed** — `neon.Project` auto-creates all of these and exposes computed outputs including `databaseHost`, `databaseHostPooler`, `databaseName`, `databaseUser`, `databasePassword`, `connectionUri`, `connectionUriPooler`, `defaultBranchId`, `defaultEndpointId`.

### Database Schema (Application Concern, NOT IaC)

The following tables are created by Drizzle migrations, not by the IaC:
- `user` — email, name, image, timestamps
- `session` — token, expires, userId
- `account` — provider, accountId, userId
- `verification` — identifier, token, expires

---

## Procedural Memory (Reference Links)

- [Neon SST Guide](https://neon.com/guides/neon-sst)
- [Neon Pulumi Provider](https://www.pulumi.com/registry/packages/neon/)
- [1Password CLI — `op run`](https://developer.1password.com/docs/cli/reference/commands/run/)
- [1Password Secret References](https://developer.1password.com/docs/cli/secret-references/)
- [SST Resource Linking](https://sst.dev/docs/linking/)
- [Knowledge Graph App — HANDOFF_P0 (Auth + DB)](../../../specs/pending/claude-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P0.md)
- [Spec README ADR-005, ADR-012, ADR-017](../README.md)

---

## Verification Steps

```bash
# 1. Verify 1Password fields exist
op read "op://beep-dev-secrets/beep-app-core/AUTH_SECRET" > /dev/null && echo "OK" || echo "MISSING"
op read "op://beep-dev-secrets/beep-app-core/BETTER_AUTH_URL" > /dev/null && echo "OK" || echo "MISSING"
op read "op://beep-dev-secrets/beep-app-core/APP_ADMINS_EMAILS" > /dev/null && echo "OK" || echo "MISSING"
op read "op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD" > /dev/null && echo "OK" || echo "MISSING"
op read "op://beep-dev-secrets/beep-data/GRAPHITI_API_KEY" > /dev/null && echo "OK" || echo "MISSING"
op read "op://beep-dev-secrets/beep-ai/AI_OPENAI_API_KEY" > /dev/null && echo "OK" || echo "MISSING"
op read "op://beep-dev-secrets/beep-email/EMAIL_RESEND_API_KEY" > /dev/null && echo "OK" || echo "MISSING"

# 2. Deploy with 1Password
op run --env-file=.env.op.dev -- bunx sst deploy --stage dev

# 3. Check Neon dashboard
# - Project exists with name beep-dev
# - Database beep_auth exists on main branch
# - Endpoint is active

# 4. Test connection (requires psql or Neon CLI)
# psql "<connection-string-from-outputs>" -c "SELECT 1;"
```

---

## Known Issues & Gotchas

1. **1Password CLI must be authenticated.** `op run` requires either biometric auth, a service account token (`OP_SERVICE_ACCOUNT_TOKEN`), or a Connect server. For local development, biometric is recommended. For CI/CD, use the service account token stored in `beep-automation-admin` vault.

2. **Neon free tier: 1 project limit.** Multiple stages needing separate Neon projects will exceed free tier. The implementation skips Neon for PR preview stages (`$app.stage.startsWith("pr-")`). For dev/staging, consider sharing a single Neon project with different databases, or upgrade to Neon Pro ($19/mo) for multiple projects.

3. **`neon.Project` auto-creates all defaults.** Do NOT create separate `neon.Branch`, `neon.Database`, `neon.Endpoint`, or `neon.Role` resources for the default setup. Use the `branch` input property on `neon.Project` to customize default names, then access computed outputs.

4. **Connection strings are computed outputs.** `project.connectionUri` and `project.connectionUriPooler` come from the Neon provider at deploy time — they are NOT from 1Password. These are Pulumi `Output<string>` values. SST handles encryption in state.

5. **Circular dependency risk.** `infra/secrets.ts` is imported by `infra/railway.ts` and `infra/database.ts`. Ensure `secrets.ts` has NO imports from other infra modules. It should only read from `process.env` and export plain strings.

6. **`sst.Linkable` for custom resources.** Since Neon resources aren't SST native components, use `sst.Linkable("NeonDb", { properties: { url: project.connectionUriPooler } })` to make Neon outputs available as `Resource.NeonDb.url` in application code via SST's linking system.

7. **`.env.op.*` files are safe to commit.** They contain `op://` references (pointers to 1Password items), not actual secret values. Anyone without 1Password access cannot resolve these references.

8. **Production secrets need separate 1Password items.** For v1, dev and production share the same 1Password items. Before first production deploy, either: (a) create production-specific items with `-production` suffix, (b) create a `beep-prod-secrets` vault, or (c) update values in-place (acceptable if only one environment is active).

---

## Success Criteria Checklist

- [ ] `infra/secrets.ts` reads all 7 secrets from `process.env` (no `sst.Secret`)
- [ ] `infra/railway.ts` imports plain string secrets from `infra/secrets.ts` (no `.value`)
- [ ] `infra/database.ts` creates Neon project and database
- [ ] `sst.config.ts` imports secrets, railway, and database modules
- [ ] `.env.op.dev` contains all 10 references (3 non-AWS provider tokens + 7 app secrets; AWS auth via SSO)
- [ ] `.env.op.production` exists (may share dev references for v1)
- [ ] All new 1Password fields created in `beep-dev-secrets` vault (6 new fields)
- [ ] `op run --env-file=.env.op.dev -- bunx sst deploy --stage dev` provisions Neon database without errors
- [ ] Neon dashboard shows project `beep-dev` with `beep_auth` database
- [ ] Output includes connection host/URI from Neon
