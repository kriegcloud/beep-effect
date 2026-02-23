# P1 — Railway Services

**Date:** 2026-02-23
**Status:** PENDING
**Depends on:** P0 (SST initialized, providers installed)

---

## Working Memory (Current Phase)

### Goal

Define the complete Railway infrastructure in `infra/railway.ts`: one Railway project containing three services (FalkorDB, Graphiti MCP, Auth Proxy) with persistent volumes, environment variables, private networking, and a public domain for the auth proxy. At phase exit, `bunx sst deploy --stage dev` provisions all Railway resources.

### Deliverables

1. `infra/railway.ts` — complete Railway infrastructure module
2. Updated `sst.config.ts` — uncomment Railway import in `run()`, wire outputs
3. Verified deployment — `bunx sst deploy --stage dev` creates all 3 Railway services

### Success Criteria

- [ ] Railway project created with name `beep-effect2-{stage}`
- [ ] FalkorDB service running from `falkordb/falkordb:latest` with persistent volume at `/data`
- [ ] Graphiti MCP service running from `zepai/knowledge-graph-mcp:standalone` with port 8000
- [ ] Auth Proxy service running (FastRelay or Caddy image) with public domain
- [ ] FalkorDB password set as Railway variable
- [ ] Graphiti MCP connected to FalkorDB via Railway private networking (`falkordb.railway.internal:6379`)
- [ ] Auth Proxy connected to Graphiti MCP via private networking
- [ ] `bunx sst deploy --stage dev` completes without errors

### Blocking Issues

- **`RAILWAY_TOKEN` must be set** in the shell environment before deploying. Obtain from Railway dashboard.
- **`@sst-provider/railway` v0.4.4 is severely outdated (CRITICAL).** It bridges TF provider v0.4.4 (Aug 2023), while TF provider is at v0.6.1 (Nov 2025). Known missing features: `regions` list block (v0.5.0+), `workspace_id` (v0.6.0+), volume creation bug fixes (v0.6.1). **P1 MUST begin with a provider capability audit** (step 2 below) before writing any resources. See README ADR-014 for mitigation options if the bridge is too stale.

### Key Constraints

- **Railway private networking is implicit.** Services within the same Railway project can reach each other at `<service-name>.railway.internal:<port>`. This is a Railway platform feature, NOT something configured via Terraform resources. The IaC only needs to set the correct connection strings as environment variables.
- **FalkorDB has no HTTP health check.** It speaks Redis protocol on port 6379. Do NOT configure an HTTP health check. **Note:** Neither `restart_policy` nor `health_check` attributes exist on the TF provider's `railway_service` resource. These are Railway platform defaults or must be configured via `railway.toml`.
- **Docker images are pulled, not built.** All three services use `sourceImage`, not `sourceRepo`. No Dockerfiles needed.
- **Railway free tier has limits.** Hobby plan: $5/mo base + usage. 3 services with 1 vCPU each should stay within ~$8-10/mo.

### Implementation Order

1. **Read the Railway Terraform provider docs** to understand available resources and their attributes:
   - [railway_project](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/project)
   - [railway_service](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/service)
   - [railway_variable](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/variable)
   - [railway_variable_collection](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/variable_collection)
   - [railway_service_domain](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/service_domain)
   - [railway_custom_domain](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/custom_domain)
   - [railway_tcp_proxy](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/tcp_proxy)

   **Important:** The Pulumi-bridged resources use camelCase property names (e.g., `projectId` not `project_id`, `sourceImage` not `source_image`). Verify by checking `.sst/platform/config.d.ts` for the `railway` namespace types.

2. **Check the actual provider types** available in the generated type declarations:

   ```bash
   grep -r "class Service\|class Project\|class Variable\|class Volume" .sst/platform/config.d.ts | head -20
   ```

   Document which resources exist and which are missing. If `railway.Volume` or `railway.Service` volume config doesn't exist, document the gap and propose a workaround.

3. **Write `infra/railway.ts`:**

   The module should export:
   - `project` — the Railway project
   - `falkordbDomain` — internal service name for FalkorDB (for Graphiti to connect)
   - `graphitiDomain` — internal service name for Graphiti MCP (for auth proxy to connect)
   - `proxyUrl` — public URL of the auth proxy (for Vercel to call)

   **Reference implementation** (based on verified TF provider v0.4.4 schemas, camelCase for Pulumi bridge):

   ```typescript
   // infra/railway.ts
   import { falkordbPassword, openaiApiKey, graphitiApiKey } from "./secrets";

   // --- Railway Project ---
   // Creating a project auto-creates a default environment.
   // Access its ID via: project.defaultEnvironment.id
   const project = new railway.Project("RailwayProject", {
     name: `beep-${$app.stage}`,
     description: `Knowledge Graph Explorer — ${$app.stage}`,
     // defaultEnvironment: { name: "production" }  // optional, defaults to "production"
   });

   // The default environment ID — used by ALL variable/domain resources
   const defaultEnvId = project.defaultEnvironment.apply(env => env.id);

   // --- FalkorDB Service ---
   const falkordb = new railway.Service("FalkorDb", {
     name: "falkordb",
     projectId: project.id,
     sourceImage: "falkordb/falkordb:latest",
     // Volume is a NESTED BLOCK on Service (not a separate resource).
     // Available since TF provider v0.4.0. May have bugs in v0.4.4 (fixed in v0.6.1).
     // If this fails, configure volume manually in Railway dashboard.
     volume: {
       name: "falkordb-data",
       mountPath: "/data",
     },
     // NOTE: In TF v0.4.4, use `region` (singular string, e.g., "us-west1").
     // In TF v0.5.0+, this was replaced with `regions` (list block).
     // Since SST bridge maps to v0.4.4, use the singular form:
     // region: "us-west1",  // optional — Railway auto-selects if omitted
   });

   // FalkorDB environment variables
   // VariableCollection requires: environmentId (required), serviceId (required), variables (required, min 1)
   new railway.VariableCollection("FalkorDbVars", {
     environmentId: defaultEnvId,
     serviceId: falkordb.id,
     variables: [
       { name: "FALKORDB_PASSWORD", value: falkordbPassword },
     ],
   });

   // --- Graphiti MCP Service ---
   const graphiti = new railway.Service("GraphitiMcp", {
     name: "graphiti-mcp",
     projectId: project.id,
     sourceImage: "zepai/knowledge-graph-mcp:standalone",
   });

   new railway.VariableCollection("GraphitiVars", {
     environmentId: defaultEnvId,
     serviceId: graphiti.id,
     variables: [
       {
         name: "FALKORDB_URI",
         // $interpolate is a tagged template literal — works in SST for Output interpolation
         value: $interpolate`redis://default:${falkordbPassword}@falkordb.railway.internal:6379`,
       },
       { name: "OPENAI_API_KEY", value: openaiApiKey },
       { name: "GRAPHITI_GROUP_ID", value: "effect-v4" },
       { name: "PORT", value: "8000" },
       { name: "SEMAPHORE_LIMIT", value: "5" },
     ],
   });

   // --- Auth Proxy Service ---
   const proxy = new railway.Service("AuthProxy", {
     name: "auth-proxy",
     projectId: project.id,
     sourceImage: "caddy:2-alpine", // Or a custom FastRelay image
   });

   // Auth proxy env vars — enforces X-API-Key header (see README ADR-016)
   new railway.VariableCollection("ProxyVars", {
     environmentId: defaultEnvId,
     serviceId: proxy.id,
     variables: [
       { name: "BACKEND_URL", value: "http://graphiti-mcp.railway.internal:8000" },
       { name: "API_KEY", value: graphitiApiKey },
       { name: "RATE_LIMIT", value: "100" },
     ],
   });

   // Public domain for the auth proxy (only public-facing service)
   // ServiceDomain requires: subdomain (required), environmentId (required), serviceId (required)
   // Outputs: domain (computed full domain), suffix (computed, e.g., "up.railway.app")
   const proxyDomain = new railway.ServiceDomain("ProxyDomain", {
     subdomain: `beep-graph-${$app.stage}`,
     environmentId: defaultEnvId,
     serviceId: proxy.id,
   });

   // --- Exports ---
   export const railwayProjectId = project.id;
   export const proxyUrl = $interpolate`https://${proxyDomain.domain}`;
   ```

   **Key corrections from provider schema research:**

   1. **`defaultEnvironment.id`** — `railway.Project` exposes `defaultEnvironment` as a computed nested object with `id` and `name`. Use `project.defaultEnvironment.apply(env => env.id)` to extract the ID. There is NO `environmentId` property on `railway.Service` — services don't expose their environment ID.

   2. **`volume`** — is a nested block on `railway.Service`, NOT a separate resource. No `railway.Volume` resource exists. The block takes `name` (required) and `mountPath` (required); `size` is computed. Volume was added in TF v0.4.0 but had creation bugs fixed in v0.6.1 — may fail with SST's v0.4.4 bridge.

   3. **`ServiceDomain`** — `subdomain` is REQUIRED (not optional). It also requires `environmentId` and `serviceId`. The computed `domain` output gives the full domain (e.g., `beep-graph-dev.up.railway.app`).

   4. **`VariableCollection`** — requires `environmentId` AND `serviceId` (both required). Variables is a list of `{ name, value }` objects (min 1 element).

   5. **`region` vs `regions`** — In TF v0.4.4 (what SST bridges), it's `region` (singular string). In v0.5.0+, it's `regions` (list of `{ region, numReplicas }` blocks). Since SST bridge maps to v0.4.4, use the singular form or omit entirely.

   6. **No `restartPolicy` or `healthCheck`** — These do NOT exist on the TF provider's `railway_service` resource. Configure via `railway.toml` or Railway dashboard instead.

   7. **No data sources** — The Railway TF provider has ZERO data sources. You cannot look up existing resources — only create/manage them.

4. **Update `sst.config.ts`** — uncomment the Railway import:

   ```typescript
   async run() {
     const railway = await import("./infra/railway");

     return {
       railwayProjectId: railway.railwayProjectId,
       proxyUrl: railway.proxyUrl,
     };
   }
   ```

5. **Ensure 1Password fields exist** (see P2 for full vault setup):

   The Railway secrets (`FALKORDB_PASSWORD`, `OPENAI_API_KEY`, `GRAPHITI_API_KEY`) must exist as fields in the `beep-dev-secrets` vault before deploying. If P2 hasn't been completed yet, set them as plain env vars:

   ```bash
   # Option A: Via 1Password (preferred, after P2 vault setup)
   op run --env-file=.env.op.dev -- bunx sst deploy --stage dev

   # Option B: Manual env vars (before P2 vault setup)
   RAILWAY_TOKEN=<your-token> \
   FALKORDB_PASSWORD="$(openssl rand -base64 32)" \
   OPENAI_API_KEY="sk-..." \
   GRAPHITI_API_KEY="$(openssl rand -base64 32)" \
   bunx sst deploy --stage dev
   ```

6. **Deploy and verify:**

   ```bash
   op run --env-file=.env.op.dev -- bunx sst deploy --stage dev
   ```

7. **Verify in Railway dashboard:**
   - Project exists with correct name
   - 3 services visible: `falkordb`, `graphiti-mcp`, `auth-proxy`
   - FalkorDB has persistent volume (if supported via IaC; otherwise note as manual step)
   - Auth proxy has a `*.up.railway.app` domain
   - Environment variables are set on each service

8. **Document gaps:** Create `outputs/p1-railway-provider-gaps.md` if any resources required manual configuration outside SST.

---

## Episodic Memory (Previous Context)

### P0 Outcomes

- SST initialized at monorepo root
- `railway`, `neon`, `@pulumiverse/vercel` providers installed
- `infra/` directory created with skeleton files
- `.sst/platform/config.d.ts` generated with provider types

---

## Semantic Memory (Project Constants)

### Railway Service Specifications (from Knowledge Graph App Spec)

| Service | Docker Image | Port | Resources | Volume |
|---|---|---|---|---|
| FalkorDB | `falkordb/falkordb:latest` | 6379 (Redis) | 1 GB RAM, 1 vCPU | `/data` (1 GB persistent) |
| Graphiti MCP | `zepai/knowledge-graph-mcp:standalone` | 8000 (HTTP) | 512 MB RAM, 0.5 vCPU | None |
| Auth Proxy | `caddy:2-alpine` or custom | 80/443 | 256 MB RAM | None |

### Railway Private Networking

Services in the same project communicate via `<service-name>.railway.internal:<port>`:

```
falkordb.railway.internal:6379        → FalkorDB Redis
graphiti-mcp.railway.internal:8000    → Graphiti MCP HTTP
auth-proxy.railway.internal:80        → Auth Proxy (internal, not used)
```

Only the Auth Proxy gets a public domain (`*.up.railway.app`).

### Environment Variable Contracts

**FalkorDB:**
```
FALKORDB_PASSWORD=<random-32-char>
```

**Graphiti MCP:**
```
FALKORDB_URI=redis://default:<FalkorDB-password>@falkordb.railway.internal:6379
OPENAI_API_KEY=<from-1Password>
GRAPHITI_GROUP_ID=effect-v4
PORT=8000
SEMAPHORE_LIMIT=5
```

**Auth Proxy:**
```
BACKEND_URL=http://graphiti-mcp.railway.internal:8000
API_KEY=<shared-secret-for-X-API-Key-header>
RATE_LIMIT=100
```

---

## Procedural Memory (Reference Links)

- [Railway Terraform Provider Docs](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs)
- [Railway Service Resource](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/service)
- [Railway Variable Collection](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/variable_collection)
- [Railway Service Domain](https://registry.terraform.io/providers/terraform-community-providers/railway/latest/docs/resources/service_domain)
- [`@sst-provider/railway` npm](https://www.npmjs.com/package/@sst-provider/railway)
- [1Password CLI — `op run`](https://developer.1password.com/docs/cli/reference/commands/run/)
- [Knowledge Graph App — HANDOFF_P1 (Railway Deployment)](../../../specs/pending/claude-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P1.md)
- [Spec README ADR-009, ADR-010, ADR-011, ADR-013](../README.md)

---

## Verification Steps

```bash
# 1. Verify 1Password fields exist (or set env vars manually)
op read "op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD" > /dev/null && echo "OK" || echo "MISSING"

# 2. Deploy Railway resources
op run --env-file=.env.op.dev -- bunx sst deploy --stage dev

# 3. Check outputs
bunx sst deploy --stage dev 2>&1 | grep -E "proxyUrl|railwayProjectId"

# 4. Verify Railway dashboard
# - Open https://railway.app and confirm project + 3 services exist
# - Confirm auth proxy has a *.up.railway.app domain
# - Confirm environment variables are set on each service

# 5. Test connectivity (after services are running)
# Auth proxy health check:
curl -s https://<proxy-domain>.up.railway.app/health

# Graphiti via proxy (with API key):
curl -s -H "X-API-Key: <graphiti-api-key>" \
  https://<proxy-domain>.up.railway.app/health
```

---

## Known Issues & Gotchas

1. **Volume creation bugs in v0.4.4.** The `volume` nested block on `railway_service` exists since TF provider v0.4.0 but had creation bugs fixed in v0.6.1. If volume creation fails via SST, configure the volume manually in the Railway dashboard and document in `outputs/p1-railway-provider-gaps.md`.

2. **Default environment ID.** `railway.Project` exposes `defaultEnvironment` as a computed nested object. Access the ID via `project.defaultEnvironment.apply(env => env.id)`. You do NOT need to create a separate `railway.Environment` resource for the default environment. However, if the Pulumi bridge doesn't expose `.defaultEnvironment`, you would need to create an explicit `railway.Environment` resource and use its `.id`.

3. **Private networking is a platform feature, not a Terraform resource.** You do NOT need to create network resources. Just use `<service-name>.railway.internal:<port>` in connection strings. The Terraform provider does not manage this — Railway handles it automatically for services in the same project.

4. **Service deployment timing.** `railway.Service` creates the service definition. The actual container deployment happens asynchronously after SST completes. Services may take 1-3 minutes to start after `sst deploy` returns.

5. **FalkorDB RDB dump loading.** The existing 70MB RDB dump needs to be loaded into FalkorDB's volume. This is NOT an IaC concern — it's a data migration step handled in the Knowledge Graph App Spec's P1. The IaC only provisions the empty volume.

6. **Auth Proxy configuration.** The Caddy/FastRelay image needs a configuration file (Caddyfile or config.json) that implements X-API-Key enforcement and reverse proxying. This config may need to be baked into a custom Docker image or mounted via Railway's environment. This is an application concern, not an IaC concern — but the IaC must pass the correct env vars.

---

## Success Criteria Checklist

- [ ] `infra/railway.ts` defines Railway project, 3 services, env vars, and proxy domain
- [ ] FalkorDB service uses `sourceImage: "falkordb/falkordb:latest"`
- [ ] Graphiti MCP service uses `sourceImage: "zepai/knowledge-graph-mcp:standalone"`
- [ ] Auth Proxy service has a public `ServiceDomain`
- [ ] FalkorDB password sourced from 1Password (`op://beep-dev-secrets/beep-data/FALKORDB_PASSWORD`)
- [ ] Graphiti MCP connects to FalkorDB via `falkordb.railway.internal:6379`
- [ ] Auth Proxy connects to Graphiti MCP via `graphiti-mcp.railway.internal:8000`
- [ ] `sst.config.ts` imports `infra/railway.ts` and returns `proxyUrl` output
- [ ] `bunx sst deploy --stage dev` completes without errors
- [ ] Railway dashboard shows project with 3 services and correct env vars
- [ ] `outputs/p1-railway-provider-gaps.md` created if any manual steps were needed
