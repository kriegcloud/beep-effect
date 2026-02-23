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
Deploy the existing FalkorDB graph database to Railway by porting the 70MB RDB dump, run the Graphiti MCP server alongside it with private networking, configure an auth proxy for API key enforcement, then verify the deployed graph produces correct results for canonical queries.

**Key insight:** No re-ingestion required. The local FalkorDB dump contains the fully-built graph (2,229 nodes, 9,697 edges) that already passed 95% verification. Railway has a first-class FalkorDB template with auto TLS and built-in monitoring.

### Deliverables
1. Railway project with FalkorDB service (one-click template + persistent volume)
2. Graphiti MCP service connected via private networking
3. FastRelay/Caddy auth proxy service (X-API-Key enforcement)
4. RDB dump loaded and verified on Railway
5. `outputs/p1-railway-deployment/deployment-log.md` — Setup steps, URLs, env vars
6. `outputs/p1-railway-deployment/verification-report.md` — Query results compared to local baseline

### Success Criteria
- [ ] Railway project running (Hobby plan, ~$8-10/mo)
- [ ] FalkorDB service running with ported RDB dump (70MB) on persistent volume
- [ ] Graphiti MCP service running and connected to FalkorDB via `falkordb.railway.internal:6379`
- [ ] Auth proxy (FastRelay/Caddy) with auto TLS protecting Graphiti endpoint
- [ ] API authentication (X-API-Key header) protecting Graphiti endpoint
- [ ] Verification queries return relevant results matching local baseline:
  - "How do I create a tagged service in Effect v4?" -> ServiceMap.Service (NOT Context.GenericTag)
  - "How do I catch errors?" -> Effect.catch (NOT Effect.catchAll)
  - "Where is FileSystem?" -> main effect package (NOT @effect/platform)
  - "Schema decoding methods" -> decodeUnknownEffect, decodeUnknownSync
  - "Array filtering functions" -> filter, partition, getSomes
- [ ] Query latency acceptable (<500ms from Vercel regions)
- [ ] Graph integrity verified: 2,229 nodes, 9,697 edges (matching local counts)

### Implementation Notes

**Railway project setup:**

1. **FalkorDB:** Deploy via [Railway one-click template](https://railway.com/deploy/falkordb)
   - Auto-provisions container, persistent volume at `/data`, connection credentials
   - Note: `FALKORDB_PASSWORD`, `FALKORDB_PRIVATE_URL` from service variables
   - Set restart policy: "Always"
   - Resource limits: 1 GB RAM, 1 vCPU

2. **RDB dump loading:**
   ```bash
   # Option A: Custom Docker image with baked-in dump
   FROM falkordb/falkordb:latest
   COPY dump.rdb /data/dump.rdb

   # Option B: Redis CLI replication from local
   redis-cli -u $RAILWAY_FALKORDB_PUBLIC_URL --pipe < local-dump.rdb
   ```

3. **Graphiti MCP:** Create new service with Docker image `zepai/knowledge-graph-mcp:standalone`
   - Environment variables:
     - `FALKORDB_URI=redis://default:${FALKORDB_PASSWORD}@falkordb.railway.internal:6379`
     - `OPENAI_API_KEY=${OPENAI_API_KEY}`
     - `GRAPHITI_GROUP_ID=effect-v4`
     - `PORT=8000`
     - `SEMAPHORE_LIMIT=5`
   - Health check path: `/health`
   - Restart policy: "Always"
   - Resource limits: 512 MB RAM, 0.5 vCPU

4. **Auth proxy:** Deploy FastRelay or Caddy as third service
   - Proxies to `graphiti-mcp.railway.internal:8000`
   - Enforces X-API-Key header authentication
   - Only this service exposed publicly (FalkorDB + Graphiti stay on private network)
   - Railway provides automatic TLS on public domain

**Verification script (run from local or CI):**
```bash
BASE_URL=https://graph.yourdomain.com
API_KEY=<shared-secret>

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
- **Managed infrastructure:** Railway provides auto TLS, monitoring, backups, restart policies
- **Private networking:** FalkorDB + Graphiti communicate internally (WireGuard encrypted)

### Why Railway Over VPS
- One-click FalkorDB template eliminates Docker/systemd/firewall setup
- Built-in observability (logs, metrics, alerts) saves hours of Grafana/Prometheus configuration
- Automatic TLS removes Caddy/certbot maintenance
- Scheduled volume backups via checkbox (vs manual cron scripts)
- $4-6/mo premium over Hetzner VPS pays for itself in saved maintenance time

See: `outputs/railway-deployment-research.md` for full comparison

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
