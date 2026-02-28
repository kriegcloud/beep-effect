# Handoff P1: FalkorDB Railway Deployment + Verification

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,500 | OK |
| Episodic | 1,000 | ~500 | OK |
| Semantic | 500 | ~350 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 1 Goal
Load the 70MB RDB dump into the already-deployed FalkorDB Railway service and verify the deployed graph produces correct results for canonical queries.

> **Infrastructure is already provisioned.** The Railway project `beep-{stage}` with 3 services (FalkorDB, Graphiti MCP, Caddy Auth Proxy) was deployed via SST IaC (`infra/railway.ts`). See `specs/pending/sst-infrastructure/` for full infrastructure documentation. P1 focuses on **data migration and verification only**.

**Key insight:** No re-ingestion required. The local FalkorDB dump contains the fully-built graph (2,229 nodes, 9,697 edges) that already passed 95% verification. The Railway services are already running with correct environment variables and private networking configured.

### Deliverables
1. RDB dump loaded into FalkorDB's persistent volume on Railway
2. Graph integrity verified (node/edge counts match local baseline)
3. Canonical verification queries pass against the deployed Graphiti API
4. `outputs/p1-railway-deployment/deployment-log.md` — Data loading steps, URLs
5. `outputs/p1-railway-deployment/verification-report.md` — Query results compared to local baseline

### Prerequisites (Already Done)
- [x] Railway project `beep-dev` running (Hobby plan, ~$8-10/mo) — deployed via SST IaC
- [x] FalkorDB service running (`falkordb/falkordb:latest`) with persistent volume at `/data`
- [x] Graphiti MCP service running and connected to FalkorDB via `falkordb.railway.internal:6379`
- [x] Caddy auth proxy (`caddy:2-alpine`) with X-API-Key enforcement protecting Graphiti endpoint
- [x] Auth proxy public URL: `https://auth-proxy-production-91fe.up.railway.app`
- [x] All environment variables set on Railway services via SST IaC
- [x] Manual steps completed: FalkorDB volume, auth proxy domain, auth proxy start command

### Success Criteria
- [ ] Verification queries return relevant results matching local baseline:
  - "How do I create a tagged service in Effect v4?" -> ServiceMap.Service (NOT Context.GenericTag)
  - "How do I catch errors?" -> Effect.catch (NOT Effect.catchAll)
  - "Where is FileSystem?" -> main effect package (NOT @effect/platform)
  - "Schema decoding methods" -> decodeUnknownEffect, decodeUnknownSync
  - "Array filtering functions" -> filter, partition, getSomes
- [ ] Query latency acceptable (<500ms from Vercel regions)
- [ ] Graph integrity verified: 2,229 nodes, 9,697 edges (matching local counts)

### Implementation Notes

> **All Railway services are already deployed via SST IaC.** The only remaining P1 work is loading the RDB dump and verifying the graph.

**Deployed infrastructure (from SST — no action needed):**

| Service | Image | Internal URL | Public URL |
|---------|-------|-------------|------------|
| FalkorDB | `falkordb/falkordb:latest` | `falkordb.railway.internal:6379` | N/A (private) |
| Graphiti MCP | `zepai/knowledge-graph-mcp:standalone` | `graphiti-mcp.railway.internal:8000` | N/A (private) |
| Caddy Auth Proxy | `caddy:2-alpine` | `auth-proxy.railway.internal:80` | `https://auth-proxy-production-91fe.up.railway.app` |

**Environment variables (already set by SST IaC — see `infra/railway.ts`):**
- FalkorDB: `FALKORDB_PASSWORD`
- Graphiti MCP: `FALKORDB_URI`, `OPENAI_API_KEY`, `GRAPHITI_GROUP_ID=effect-v4`, `PORT=8000`, `SEMAPHORE_LIMIT=5`
- Auth Proxy: `BACKEND_URL`, `API_KEY`, `RATE_LIMIT=100`, `CADDYFILE`, `PORT=80`

**RDB dump loading:**
```bash
# Option A: Custom Docker image with baked-in dump
FROM falkordb/falkordb:latest
COPY dump.rdb /data/dump.rdb

# Option B: Redis CLI replication from local
redis-cli -u $RAILWAY_FALKORDB_PUBLIC_URL --pipe < local-dump.rdb
```

**Verification script (run from local or CI):**
```bash
BASE_URL=https://auth-proxy-production-91fe.up.railway.app
API_KEY=<from 1Password: beep-data/GRAPHITI_API_KEY>

# Verify graph node count
curl -s -H "X-API-Key: $API_KEY" $BASE_URL/mcp \
  -d '{"method":"search_nodes","params":{"query":"Effect","max_nodes":1}}' \
  | jq '.result'

# Run canonical queries
for query in \
  "How do I create a tagged service?" \
  "How do I catch errors?" \
  "Where is FileSystem?" \
  "Schema decoding methods" \
  "Array filtering functions"; do
  echo "Query: $query"
  curl -s -H "X-API-Key: $API_KEY" $BASE_URL/mcp \
    -d "{\"method\":\"search_nodes\",\"params\":{\"query\":\"$query\",\"max_nodes\":5}}" \
    | jq '.result[].name'
  echo "---"
done
```

### Key Advantages Over Zep Cloud
- **Zero re-ingestion:** Load 70MB dump vs re-uploading 2,155 episodes ($25+ in credits)
- **100% data fidelity:** Exact same graph that passed 95% verification locally
- **Full control:** Cypher queries, custom indexes, no vendor API limitations
- **Cost:** ~$8-10/mo (Railway Hobby) vs $25/mo (Zep Cloud Flex)
- **IaC-managed infrastructure:** Deployed via SST (`infra/railway.ts`); Railway provides auto TLS, monitoring, restart policies
- **Private networking:** FalkorDB + Graphiti communicate internally (WireGuard encrypted)

### Infrastructure Reference
- SST infrastructure spec: `specs/pending/sst-infrastructure/`
- Railway IaC module: `infra/railway.ts`
- Railway provider gaps: `specs/pending/sst-infrastructure/outputs/p1-railway-provider-gaps.md`
- Deploy command: `op run --env-file=.env -- bunx sst deploy --stage dev`
- Railway deployment research: `outputs/railway-deployment-research.md`

## Episodic Memory

### From P0
- better-auth magic link auth working with email allowlist
- Auth-gated layout operational
- All env vars documented

## Semantic Memory

### FalkorDB/Graphiti Stack
- FalkorDB: Redis-compatible graph DB, supports Cypher via GRAPH.QUERY
- RDB dump is a standard Redis dump — portable across FalkorDB versions
- Graphiti MCP server: Python service wrapping FalkorDB with embedding search
- MCP endpoint at `/mcp`, REST API available
- Environment: `FALKORDB_URI`, `GRAPHITI_GROUP_ID`, `OPENAI_API_KEY`, `SEMAPHORE_LIMIT`

### Local Graph Statistics
- 70MB RDB dump at `~/graphiti-mcp/data/dump.rdb`
- 16 Redis keys, 8 graphs (effect-v4 is primary)
- effect-v4 graph: 2,229 nodes, 9,697 edges
- Node labels: Entity (918), Entity/Document (466), Episodic (235), Entity/Topic (164)
- Each node: uuid, name, group_id, summary, name_embedding (1024-dim vector)
- Verified at 95% accuracy (10.5/11 tests)

## Procedural Memory

### References
- Railway deployment research: `outputs/railway-deployment-research.md`
- Local Docker setup: `~/graphiti-mcp/docker-compose.yml`
- Local data: `~/graphiti-mcp/data/dump.rdb`
- Local verification report: `specs/completed/effect-v4-knowledge-graph/outputs/p6-verification/report.md`
- Graphiti MCP image: `zepai/knowledge-graph-mcp` on Docker Hub
- FalkorDB Railway template: https://railway.com/deploy/falkordb
- FalkorDB Railway docs: https://docs.falkordb.com/operations/railway.html
- Railway private networking: https://docs.railway.com/networking/private-networking/how-it-works
- Railway volume backups: https://docs.railway.com/volumes/backups
- FalkorDB docs: https://docs.falkordb.com/
