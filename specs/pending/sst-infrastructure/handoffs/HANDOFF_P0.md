# P0 — SST Init + Provider Scaffold

**Date:** 2026-02-23
**Status:** PENDING
**Depends on:** Nothing (first phase)

---

## Working Memory (Current Phase)

### Goal

Initialize SST v3 in the beep-effect2 monorepo root and install all required providers. At phase exit, `bunx sst install` succeeds, provider types are generated, and the `infra/` directory skeleton is in place.

### Deliverables

1. `sst.config.ts` at monorepo root with app config and empty `run()` function
2. Provider installation: `railway`, `neon`, `@pulumiverse/vercel`
3. `infra/` directory with empty module files (`secrets.ts`, `railway.ts`, `database.ts`, `web.ts`)
4. `.gitignore` updated to exclude `.sst/`
5. Root `package.json` updated with SST dependency
6. `sst-env.d.ts` generated at monorepo root

### Success Criteria

- [ ] `bunx sst install` exits 0
- [ ] `.sst/platform/config.d.ts` exists and contains type declarations for `railway`, `neon`, and `vercel` namespaces
- [ ] `sst.config.ts` passes TypeScript compilation (`bunx tsc --noEmit sst.config.ts` or equivalent)
- [ ] `.sst/` is in `.gitignore`
- [ ] `infra/` directory exists with 4 skeleton module files

### Blocking Issues

- AWS SSO profiles must be configured. SST uses AWS S3 for state storage even though the app runs on Railway/Neon/Vercel. Two AWS accounts (dev: `487243850762`, prod: `703222328573`) are used for state isolation per environment. See "AWS SSO Profile Setup" below.
- AWS IAM Identity Center access must be provisioned for the developer (via `https://d-906617b551.awsapps.com/start`).
- 1Password CLI (`op`) must be installed and authenticated. All secrets are sourced from 1Password vaults via `op run`. See P2 for vault setup details.

### Key Constraints

- **Bun as package manager, Node as SST runtime.** Use `bunx sst` for all SST CLI commands. SST internally uses Node.js — this is expected and correct.
- **Do NOT create any cloud resources in P0.** The `run()` function should be empty or contain only comments. Resource creation begins in P1.
- **Provider versions must be pinned.** Use exact versions in the `providers` block, not ranges.
- **Triple-slash reference is required.** The first line of `sst.config.ts` must be `/// <reference path="./.sst/platform/config.d.ts" />` for provider type resolution.

### Implementation Order

1. **Set up AWS SSO profiles** (if not already configured):

   Add to `~/.aws/config`:

   ```ini
   [sso-session beep]
   sso_start_url = https://d-906617b551.awsapps.com/start
   sso_region = us-east-1
   sso_registration_scopes = sso:account:access

   [profile beep-dev]
   sso_session = beep
   sso_account_id = 487243850762
   sso_role_name = AdministratorAccess
   region = us-east-1

   [profile beep-prod]
   sso_session = beep
   sso_account_id = 703222328573
   sso_role_name = AdministratorAccess
   region = us-east-1
   ```

   Login and verify:

   ```bash
   aws sso login --profile beep-dev
   aws sts get-caller-identity --profile beep-dev
   # Expected: Account 487243850762
   ```

   **Note:** SSO sessions last 12 hours. Re-run `aws sso login` when they expire.

2. **Install SST** in the monorepo root:

   ```bash
   bun add -D sst
   ```

3. **Initialize SST** (creates `sst.config.ts` and `.sst/` directory):

   ```bash
   bunx sst init
   ```

   If `sst init` prompts for a home provider, select `aws`. If it generates a starter `sst.config.ts`, replace its contents with the skeleton below.

4. **Add providers:**

   ```bash
   bunx sst add railway
   bunx sst add neon
   bunx sst add @pulumiverse/vercel
   ```

   Each `sst add` command updates the `providers` block in `sst.config.ts` and runs `sst install` to download provider packages.

5. **Write `sst.config.ts` skeleton:**

   ```typescript
   /// <reference path="./.sst/platform/config.d.ts" />

   export default $config({
     app(input) {
       return {
         name: "beep-effect2",
         home: "aws",
         removal: input.stage === "production" ? "retain" : "remove",
         protect: input.stage === "production",
         providers: {
           aws: {
             region: "us-east-1",
             // SSO profile for local dev. CI uses OIDC federation (aws-actions/configure-aws-credentials).
             // Dev account (487243850762) for all non-production stages.
             // Prod account (703222328573) for production.
             profile: input.stage === "production" ? "beep-prod" : "beep-dev",
           },
           railway: "0.4.4",
           neon: "0.9.0",
           "@pulumiverse/vercel": "4.6.0",
         },
       };
     },

     async run() {
       // P1: Railway services (FalkorDB, Graphiti MCP, Auth Proxy)
       // const railway = await import("./infra/railway");

       // P2: Neon database + secrets
       // const secrets = await import("./infra/secrets");
       // const database = await import("./infra/database");

       // P3: Vercel deployment + env var wiring
       // const web = await import("./infra/web");
     },
   });
   ```

   **SST API notes:**
   - `input.stage` (no optional chaining) — `input` is always provided by SST with a `stage` property.
   - `protect` accepts a plain `boolean`, not an array check.
   - Provider versions: use string format `"X.Y.Z"` for exact pinning. After `sst add` runs, check what versions were actually installed and pin those. The `sst add` command may use a different format — adapt accordingly.
   - `$app.stage` is available inside `run()` (NOT inside `app()`). Inside `app()`, use `input.stage`.
   - `profile` in the AWS provider config uses SSO for local dev. In CI, OIDC temporary credentials (set by `aws-actions/configure-aws-credentials@v4`) override the profile via standard AWS SDK credential chain precedence.

   **SST Global Variables Available in `run()`:**
   - `$app` — `{ name, stage, protect, providers, removal }`
   - `$dev` — `boolean` (true when running `sst dev`)
   - `$interpolate` — tagged template literal for Output string interpolation
   - `$concat(...params)` — concatenate Outputs and strings
   - `$resolve(record)` — wait for multiple Outputs
   - `$jsonParse(text)` / `$jsonStringify(obj)` — JSON with Outputs

6. **Create `infra/` directory with skeleton files:**

   ```bash
   mkdir -p infra
   ```

   Create four files, each with a placeholder comment:

   **`infra/secrets.ts`:**
   ```typescript
   // Environment variable reads with validation.
   // Secrets are sourced from 1Password via `op run --env-file=.env.op.<stage>`.
   // See P2 for full implementation and vault mapping.

   export {};
   ```

   **`infra/railway.ts`:**
   ```typescript
   // Railway infrastructure: project, services (FalkorDB, Graphiti MCP, Auth Proxy),
   // environment variables, domains, and volumes.

   export {};
   ```

   **`infra/database.ts`:**
   ```typescript
   // Neon PostgreSQL: project, database, roles, and connection string outputs.

   export {};
   ```

   **`infra/web.ts`:**
   ```typescript
   // Vercel: project configuration, environment variable wiring from
   // Railway and Neon outputs, domain configuration.

   export {};
   ```

7. **Update `.gitignore`** — append if not already present:

   ```
   # SST
   .sst/
   sst-env.d.ts
   ```

8. **Run `sst install`** to verify provider resolution:

   ```bash
   bunx sst install
   ```

9. **Verify types generated:**

   ```bash
   ls -la .sst/platform/config.d.ts
   ```

   This file should contain type declarations for `railway`, `neon`, and `vercel` provider namespaces.

---

## Episodic Memory (Previous Context)

None — this is the first phase. The decision to use SST was made in the IaC evaluation (see conversation history or the spec README's ADR table).

Key prior decisions:
- SST v3 chosen over raw Pulumi, Alchemy, and CDKTF (deprecated)
- `@sst-provider/railway` v0.4.4 is the Railway bridge (**WARNING: severely outdated** — maps to TF provider v0.4.4 from Aug 2023, current TF provider is v0.6.1 from Nov 2025. See README ADR-014.)
- AWS is the SST `home` for state storage only — the app does NOT run on AWS

---

## Semantic Memory (Project Constants)

### Platform API Tokens (Required Before P1)

| Token | Environment Variable | Source |
|---|---|---|
| Railway | `RAILWAY_TOKEN` | [Railway Dashboard > Account Settings > Tokens](https://railway.app/account/tokens) |
| Neon | `NEON_API_KEY` | [Neon Console > Account > API Keys](https://console.neon.tech/app/settings/api-keys) |
| Vercel | `VERCEL_API_TOKEN` | [Vercel Dashboard > Settings > Tokens](https://vercel.com/account/tokens) |
| AWS | SSO profile (`beep-dev` / `beep-prod`) | AWS IAM Identity Center via `aws sso login` |

These tokens authenticate SST's provider calls. They are NOT the same as the app's runtime secrets. Railway/Neon/Vercel tokens and app secrets are sourced from 1Password vaults — see P2. AWS auth uses SSO profiles locally and OIDC federation in CI (see ADR-018 and P4).

### AWS Account Layout

| Account | ID | SSO Profile | SST Stages |
|---|---|---|---|
| Dev | `487243850762` | `beep-dev` | `dev`, `staging`, `pr-{N}`, personal |
| Prod | `703222328573` | `beep-prod` | `production` |
| Management | — | — | Not used for deployments |

Each account gets its own SST state bucket (auto-created on first deploy). State isolation prevents dev deploys from interfering with production state.

### Target Infrastructure (from Knowledge Graph App Spec)

| Component | Platform | Service/Resource |
|---|---|---|
| FalkorDB | Railway | Docker: `falkordb/falkordb:latest`, volume `/data`, 1GB RAM |
| Graphiti MCP | Railway | Docker: `zepai/knowledge-graph-mcp:standalone`, port 8000 |
| Auth Proxy | Railway | FastRelay or Caddy, public-facing, X-API-Key enforcement |
| PostgreSQL | Neon | Free tier, 0.5GB, better-auth tables |
| Web App | Vercel | Next.js App Router, Hobby + Fluid Compute |

### SST Directory Layout

```
beep-effect2/               (monorepo root)
|-- sst.config.ts           (SST entry point)
|-- sst-env.d.ts            (auto-generated, gitignored)
|-- .sst/                   (internal state, gitignored)
|-- .env.op.dev             (1Password op:// references for dev — safe to commit)
|-- .env.op.production      (1Password op:// references for production — safe to commit)
|-- infra/
|   |-- secrets.ts          (env var reads with validation — secrets from 1Password)
|   |-- railway.ts          (Railway project + services)
|   |-- database.ts         (Neon project + database)
|   |-- web.ts              (Vercel project + env wiring)
```

---

## Procedural Memory (Reference Links)

- [SST Init Guide](https://sst.dev/docs/)
- [SST Config Reference](https://sst.dev/docs/reference/config/)
- [SST Add Provider](https://sst.dev/docs/providers/)
- [SST Monorepo Setup](https://sst.dev/docs/set-up-a-monorepo/)
- [Spec README](../README.md)

---

## Verification Steps

```bash
# 1. SST installed
bun ls sst

# 2. Providers installed
bunx sst install

# 3. Config compiles (no runtime errors)
# SST doesn't have a standalone typecheck — verify by running:
bunx sst diff --stage dev 2>&1 | head -5
# Should show "No changes" or provider initialization, NOT a config error

# 4. .gitignore updated
grep -q ".sst/" .gitignore && echo "OK: .sst/ gitignored" || echo "FAIL: .sst/ not in .gitignore"

# 5. infra/ skeleton exists
ls infra/secrets.ts infra/railway.ts infra/database.ts infra/web.ts
```

---

## Known Issues & Gotchas

1. **`sst init` may scaffold a starter app.** If it generates example resources in `sst.config.ts`, delete them and replace with the skeleton above. Only the `app()` and empty `run()` are needed.

2. **Provider version format varies.** After `sst add`, check the actual format in `sst.config.ts`. Some providers use `"0.4.4"` (string version), others use `true` (latest), others use `{ version: "X" }` (object). Match whatever `sst add` produces.

3. **`sst install` requires network access.** It downloads provider binaries. First run may be slow (~30-60 seconds).

4. **AWS SSO for state storage.** If no SSO session is active, `sst deploy` will fail in P1. Verify now:
   ```bash
   aws sso login --profile beep-dev
   aws sts get-caller-identity --profile beep-dev
   ```
   Expected output: Account `487243850762`. If this fails, ensure IAM Identity Center access is provisioned.

5. **Bun + SST compatibility.** SST CLI runs on Node.js internally. Using `bunx sst` works because `bunx` delegates to the Node-based binary. Do NOT try to run SST's internal code with Bun runtime.

6. **`@sst-provider/railway` v0.4.4 is the ONLY published version.** It was published over a year ago and maps to TF provider v0.4.4 (Aug 2023). The TF provider has had breaking changes since: v0.5.0 replaced `region` (singular) with `regions` (list block), v0.6.0 renamed `team_id` to `workspace_id`. P1 MUST begin with a provider capability audit before writing any Railway resources. See README ADR-014 for mitigation options.

7. **`sst diff` can preview changes.** After P0, run `bunx sst diff --stage dev` to see what resources would be created without actually deploying. This is analogous to `terraform plan`.

---

## Success Criteria Checklist

- [ ] `sst` added to root `package.json` devDependencies
- [ ] `sst.config.ts` exists at monorepo root
- [ ] `sst.config.ts` has `name: "beep-effect2"`, `home: "aws"`
- [ ] `sst.config.ts` has `railway`, `neon`, `@pulumiverse/vercel` in providers
- [ ] `sst.config.ts` has `removal`/`protect` stage-conditional logic
- [ ] `bunx sst install` exits 0
- [ ] `.sst/platform/config.d.ts` generated with provider types
- [ ] `infra/secrets.ts`, `infra/railway.ts`, `infra/database.ts`, `infra/web.ts` exist
- [ ] `.sst/` and `sst-env.d.ts` are in `.gitignore`
- [ ] No cloud resources were created (empty `run()` function)
