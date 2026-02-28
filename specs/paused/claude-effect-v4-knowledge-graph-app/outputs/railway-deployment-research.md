# Railway Deployment Research: Graphiti MCP + FalkorDB

> **UPDATE (2026-02-23):** Railway infrastructure has been deployed via SST IaC (`infra/railway.ts`). The migration path described in Section 6 has been superseded by the SST-based deployment. See `specs/pending/sst-infrastructure/` for the actual implementation and `specs/pending/sst-infrastructure/outputs/p1-railway-provider-gaps.md` for known provider limitations. The research below remains valid for understanding Railway's capabilities and pricing.

Research into production hardening and Docker best practices for deploying the Graphiti MCP server + FalkorDB stack to Railway (railway.app).

---

## 1. Railway Deployment Model for Multi-Container Apps

Railway uses a **project-based** architecture where each project contains multiple **services** (not a single docker-compose deployment).

### Service Mapping

| Local Docker Compose Service | Railway Service |
|---|---|
| `falkordb` (falkordb/falkordb:latest) | Railway Service 1 - one-click FalkorDB template |
| `graphiti-mcp` (zepai/knowledge-graph-mcp:standalone) | Railway Service 2 - Docker image reference |
| Caddy reverse proxy | Railway Service 3 - `caddy:2-alpine` auth proxy (X-API-Key enforcement) |

### Key Capabilities

- Railway does not run `docker-compose.yml` natively, but supports **drag-and-drop import** of compose files onto the project canvas (auto-creates individual services with volumes)
- Services communicate over **private networking** using DNS: `falkordb.railway.internal:6379`
- Private traffic uses WireGuard encryption (ChaCha20, Curve25519, BLAKE2s) with zero egress charges
- Each service gets automatic public domains (`*.up.railway.app`) with auto TLS

### FalkorDB First-Class Support

Railway has **verified one-click FalkorDB templates** maintained by the FalkorDB team:
- **Single Instance**: development, testing, small production (our use case)
- **Cluster**: HA with master/replica nodes

The template auto-provisions FalkorDB, assigns a persistent volume, and exposes connection credentials via environment variables (`FALKORDB_PRIVATE_URL`, `FALKORDB_PUBLIC_URL`, `FALKORDB_PASSWORD`).

References: [Railway FalkorDB Template](https://railway.com/deploy/falkordb), [FalkorDB Railway Docs](https://docs.falkordb.com/operations/railway.html)

---

## 2. Pricing Analysis

### Per-Resource Rates

| Resource | Rate |
|---|---|
| CPU | $20 / vCPU / month |
| Memory | $10 / GB / month |
| Volume Storage | $0.15 / GB / month |
| Network Egress | $0.05 / GB / month |

### Plan Tiers

| Feature | Hobby ($5/mo) | Pro ($20/mo) |
|---|---|---|
| Included usage credit | $5 | $20 |
| Max RAM per service | 48 GB | 1 TB |
| Max volume per service | 5 GB | 1 TB |
| Max replicas | 6 | 42 |

### Estimated Monthly Cost for Graphiti Stack

Railway charges for **actual utilization** (not provisioned capacity).

**FalkorDB:**
- RAM: ~0.4 GB average (70MB RDB + graph indices) = $4.00/mo
- CPU: ~0.05 vCPU average (idle + query spikes) = $1.00/mo
- Volume: 1 GB = $0.15/mo

**Graphiti MCP:**
- RAM: ~0.25 GB average (Python process) = $2.50/mo
- CPU: ~0.03 vCPU average = $0.60/mo

**Total resource usage: ~$8.25/mo**

On **Hobby plan**: $5 subscription + ($8.25 - $5 credit) = **~$8.25/mo**

Under moderate load (100 queries/hour), CPU increases to 0.1-0.2 vCPU, pushing total to **$10-12/mo**.

---

## 3. Persistent Storage

### Volume Mechanics

- Data survives redeploys, container restarts, and image updates
- Live resize without downtime
- Hobby plan limit: 5 GB per volume (sufficient for 70MB RDB)
- Mount path: `/data` for FalkorDB

### Loading the 70MB RDB Dump

Most practical approach: **bake the RDB dump into a custom Docker image** that copies it to the data directory on first boot, then let FalkorDB load it.

Alternative: Connect via `redis-cli` to Railway's public FalkorDB URL and replicate data using RIOT (Redis Input/Output Tool).

### Backup Strategy

Railway has built-in **volume backups**:
- Manual on-demand + scheduled (daily/weekly/monthly)
- Incremental + copy-on-write (pay only for unique data)
- Restore overwrites volume contents

For external backups: sidecar service that runs `redis-cli BGSAVE` + uploads to S3/R2.

---

## 4. Docker Best Practices on Railway

### Health Checks

- **Deployment-time only** (verifies new deployments before routing traffic)
- Set health check endpoint path in service settings (e.g., `/health` for Graphiti MCP)
- Default timeout: 300s, configurable via `RAILWAY_HEALTHCHECK_TIMEOUT_SEC`
- FalkorDB is TCP (Redis protocol) -- Railway health checks are HTTP-only. Rely on restart policies instead.

### Resource Limits

- Set maximum CPU and RAM per service to prevent runaway costs
- Railway auto-scales down to actual usage (no minimums)

Recommended limits:
- FalkorDB: 1 GB RAM, 1 vCPU
- Graphiti MCP: 512 MB RAM, 0.5 vCPU

### Environment Variable Management

- Per-service via dashboard or `railway.toml`
- **Shared variables** across services (e.g., `FALKORDB_PASSWORD`)
- **Cross-service references**: `${{ service_name.VARIABLE }}`
- `PORT` variable auto-injected by Railway
- Sensitive values stored encrypted, never exposed in logs

### Internal Networking

- FalkorDB reachable at `falkordb.railway.internal:6379`
- Graphiti connects via: `FALKORDB_URI=redis://default:${FALKORDB_PASSWORD}@falkordb.railway.internal:6379`
- Use `http://` internally (WireGuard already encrypts)
- Zero egress charges for internal traffic

### Restart / Crash Recovery

Two policies:
- **Always**: Restarts on any stop (recommended for production)
- **On Failure**: Non-zero exit codes only, configurable max retries (default 10)

---

## 5. Production Hardening

### TLS/HTTPS

Railway provides **automatic TLS** for all public domains:
- Free Let's Encrypt certificates, auto-issued within ~1 hour
- Auto-renewed 30 days before expiration
- Works for `*.up.railway.app` and custom domains
- **No Caddy/nginx needed**

### API Key Authentication for Graphiti

The standard `zepai/knowledge-graph-mcp` image has no built-in API key auth. Options:

1. ~~**FastRelay template**~~: Not used — Caddy was chosen instead.
2. **Caddy reverse proxy (`caddy:2-alpine`)**: Deployed as Railway service. Validates X-API-Key header via Caddyfile, reverse-proxies to `graphiti-mcp.railway.internal:8000`. Rate limit configurable via `RATE_LIMIT` env var (default: 100).
3. **Private networking**: FalkorDB + Graphiti MCP stay on private network. Only the Caddy auth proxy is publicly exposed.

**Actual implementation**: Caddy auth proxy deployed via SST IaC (`infra/railway.ts`). Public URL: `https://auth-proxy-production-91fe.up.railway.app`. Caddyfile content managed as `CADDYFILE` env var. Start command set manually via Railway dashboard (provider gap).

### Rate Limiting

Railway has no built-in rate limiting. Options:
- FastRelay (100 req/min default, configurable)
- Caddy rate limiting zones
- Application-level in Next.js API routes
- Cloudflare WAF on custom domain

### Logging and Monitoring

Railway provides:
- **Log Explorer**: stdout/stderr capture, full-text search, structured attributes
- **Metrics**: CPU, memory, network per service (30 days history)
- **Alerts**: Email/webhook when CPU > threshold, RAM > threshold, etc.
- **Observability Dashboard**: Customizable widgets

### Cold Start

Railway services run **continuously by default** (no sleep). "Serverless" mode (App Sleeping) must be explicitly enabled.

**Keep Serverless disabled** for FalkorDB and Graphiti MCP. FalkorDB cold starts require loading the RDB dump into memory.

---

## 6. Migration Path

> **SUPERSEDED:** The manual migration path below has been replaced by SST IaC deployment. Use the following command to deploy all Railway services:
>
> ```bash
> op run --env-file=.env -- bunx sst deploy --stage dev
> ```
>
> See `infra/railway.ts` for the Railway infrastructure definition and `specs/pending/sst-infrastructure/outputs/p1-railway-provider-gaps.md` for known manual steps still required.

### Actual Deployment (via SST IaC)

**Deploy command:** `op run --env-file=.env -- bunx sst deploy --stage dev`

**What SST provisions automatically:**
1. Railway project `beep-{stage}` with 3 services (FalkorDB, Graphiti MCP, Caddy Auth Proxy)
2. All environment variables on each service (passwords, API keys, Caddyfile content)
3. Private networking between services (Railway platform feature)

**Manual steps still required (Railway provider v0.4.4 gaps):**
1. FalkorDB: Add persistent volume at `/data` via Railway dashboard
2. Auth Proxy: Generate `*.up.railway.app` domain via Railway dashboard
3. Auth Proxy: Set custom start command via Railway dashboard
4. Load RDB dump into FalkorDB volume (data migration, not infra)

**Deployed outputs (dev stage):**
- Railway Project ID: `52b18c0a-dfab-4335-aae6-f1b998f891c4`
- Auth Proxy URL: `https://auth-proxy-production-91fe.up.railway.app`

### Original Manual Steps (for reference only)

<details>
<summary>Click to expand original manual migration path</summary>

#### Step 1: FalkorDB

1. Deploy via [Railway one-click template](https://railway.com/deploy/falkordb)
2. Note `FALKORDB_PASSWORD` and `FALKORDB_PRIVATE_URL`
3. Volume auto-created at `/data`
4. Load RDB dump (custom Docker image with baked-in dump, or redis-cli replication)
5. Verify: `GRAPH.LIST`, `GRAPH.QUERY effect_v4 "MATCH (n) RETURN count(n)"`

#### Step 2: Graphiti MCP

1. Create new service, point to `zepai/knowledge-graph-mcp:standalone`
2. Set env vars:
   - `FALKORDB_URI=redis://default:${FALKORDB_PASSWORD}@falkordb.railway.internal:6379`
   - `OPENAI_API_KEY=<key>`
   - `GRAPHITI_GROUP_ID=effect-v4`
   - `PORT=8000`
3. Set health check: `/health`
4. Set restart policy: "Always"

#### Step 3: Auth Proxy

1. Deploy Caddy (`caddy:2-alpine`) as third service
2. Configure proxy to `graphiti-mcp.railway.internal:8000`
3. Enable X-API-Key header auth via Caddyfile
4. Expose only the proxy publicly

#### Step 4: Verification

1. Test MCP endpoint via public URL
2. Run search_nodes, search_memory_facts, get_episodes
3. Set up monitoring alerts (CPU > 80%, RAM > 80%)
4. Configure scheduled daily volume backups

#### Step 5: Client Configuration

1. Update `GRAPHITI_API_URL` in Vercel to point at Railway public URL
2. Set `GRAPHITI_API_KEY` to the X-API-Key value configured in the proxy

</details>

---

## 7. Platform Comparison

| Factor | Railway (Hobby) | Hetzner CX22 VPS | Fly.io |
|---|---|---|---|
| **Monthly cost** | ~$8-10/mo | ~$4/mo (fixed) | ~$6-10/mo |
| **Pricing model** | $5 sub + usage | Fixed monthly | Pay-as-you-go |
| **Setup complexity** | Low (one-click templates) | Medium (Docker, Caddy, systemd) | Medium (CLI, Fly.toml) |
| **FalkorDB support** | First-class template | Manual Docker | Manual Docker |
| **TLS/HTTPS** | Automatic | Manual (Caddy/certbot) | Automatic |
| **Private networking** | Built-in (WireGuard) | N/A (single machine) | Built-in (WireGuard) |
| **Persistent storage** | Volumes ($0.15/GB), 5GB Hobby limit | Full disk (40GB NVMe) | Volumes ($0.15/GB) |
| **Backups** | Built-in (scheduled + incremental) | Manual (cron + scripts) | Volume snapshots |
| **Monitoring** | Built-in (logs, metrics, alerts) | Manual (Grafana/Prometheus) | Basic metrics |
| **Crash recovery** | Auto-restart policies | systemd + Docker restart | Auto-restart |
| **Cold start** | No sleep by default | Always on | Configurable |
| **Maintenance burden** | Near zero | High (OS, Docker, certs) | Low |
| **SSH access** | No | Yes (full root) | Yes (fly ssh) |
| **Vendor lock-in** | Low (standard Docker) | None | Low |

### Recommendation

**Railway at ~$8-10/mo** is the strongest fit for this workload:
- FalkorDB one-click template eliminates setup friction
- Built-in observability (monitoring, alerts, logs) saves hours of Grafana/Prometheus configuration
- Automatic TLS removes the Caddy/certbot maintenance
- The $4-6/mo premium over Hetzner ($4/mo) pays for itself in saved maintenance time

**Hetzner CX22 at $4/mo** remains viable if minimizing cost is the top priority and you accept the ongoing sysadmin burden (OS patching, cert renewal, monitoring setup, backup scripts).

---

## Sources

- [Railway Pricing](https://docs.railway.com/reference/pricing/plans)
- [Railway Volumes](https://docs.railway.com/reference/volumes)
- [Railway Volume Backups](https://docs.railway.com/volumes/backups)
- [Railway Health Checks](https://docs.railway.com/deployments/healthchecks)
- [Railway Private Networking](https://docs.railway.com/networking/private-networking/how-it-works)
- [Railway Public Networking / TLS](https://docs.railway.com/networking/public-networking)
- [Railway Restart Policy](https://docs.railway.com/deployments/restart-policy)
- [Railway Observability](https://docs.railway.com/observability)
- [FalkorDB Railway Template](https://railway.com/deploy/falkordb)
- [FalkorDB Railway Docs](https://docs.falkordb.com/operations/railway.html)
- [Graphiti MCP Server](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)
- [Railway vs Fly Comparison](https://docs.railway.com/platform/compare-to-fly)
- [Fly.io Pricing](https://fly.io/pricing/)
