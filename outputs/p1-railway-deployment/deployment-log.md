# P1 Deployment Log: FalkorDB Data Migration

**Date**: 2026-02-23
**Branch**: claude-effect-v4-knowledge-graph-app

## Pre-existing Infrastructure

Railway project `beep-dev` with 3 services already deployed via SST IaC:

| Service | Image | Internal URL |
|---------|-------|-------------|
| FalkorDB | falkordb/falkordb:latest | falkordb.railway.internal:6379 |
| Graphiti MCP | zepai/knowledge-graph-mcp:standalone | graphiti-mcp.railway.internal:8000 |
| Auth Proxy | caddy:2-alpine | auth-proxy-production-91fe.up.railway.app |

## Data Migration Steps

### 1. OpenAI API Key Update

The deployed Graphiti MCP had an expired OpenAI API key. Updated via:

```
op item edit beep-ai AI_OPENAI_API_KEY=<new-key> --vault beep-dev-secrets
npx sst deploy --stage dev
```

### 2. Custom Docker Image for Seeding

Railway's persistent volume at `/data` overrides any baked-in files at that path.
Solution: stage the dump in `/seed/` and copy on first boot.

**Dockerfile** (`ghcr.io/kriegcloud/falkordb-seeded:seed-v2`):

```dockerfile
FROM falkordb/falkordb:latest
COPY dump.rdb /seed/dump.rdb
COPY entrypoint.sh /seed/entrypoint.sh
RUN chmod +x /seed/entrypoint.sh
ENTRYPOINT ["/seed/entrypoint.sh"]
CMD ["redis-server", "--loadmodule", "/var/lib/falkordb/bin/falkordb.so"]
```

**entrypoint.sh**:

```bash
#!/bin/sh
if [ ! -f /data/dump.rdb ]; then
  echo "Seeding /data/dump.rdb from /seed/dump.rdb..."
  cp /seed/dump.rdb /data/dump.rdb
  echo "Seed complete."
else
  echo "Existing dump.rdb found, skipping seed."
fi
exec /var/lib/falkordb/bin/run.sh "$@"
```

### 3. Build & Push

```bash
cp ~/graphiti-mcp/data/dump.rdb /tmp/falkordb-seed/dump.rdb
docker build -t ghcr.io/kriegcloud/falkordb-seeded:seed-v2 /tmp/falkordb-seed/
docker push ghcr.io/kriegcloud/falkordb-seeded:seed-v2
```

GHCR package visibility set to Public (Railway can't pull private images).

### 4. Deploy to Railway

Updated `infra/railway.ts` sourceImage to `ghcr.io/kriegcloud/falkordb-seeded:seed-v2`,
then ran `npx sst deploy --stage dev`.

### 5. Verification

Deploy logs confirmed seed success. Graphiti MCP queries against group `effect-v4`
return correct Effect v4 knowledge (see verification-report.md).

### 6. Revert sourceImage

After confirming data persists on the volume, reverted `infra/railway.ts` to
`falkordb/falkordb:latest`. Future deploys use the upstream image; the seeded
data lives on the persistent volume.

## Issues Encountered

| Issue | Resolution |
|-------|-----------|
| Railway CLI `whoami` fails with account-scoped token | Known CLI bug; used GraphQL API directly for verification |
| OpenAI 401 on Graphiti MCP | Updated API key in 1Password + SST redeploy |
| Docker volume mount hides baked-in `/data` files | Stage in `/seed/`, copy via entrypoint on first boot |
| GHCR image defaults to private | Changed to Public via GitHub package settings |
| SST doesn't detect same-tag image changes | Bumped tag from `seed-v1` to `seed-v2` |

## Artifacts

- Docker image: `ghcr.io/kriegcloud/falkordb-seeded:seed-v2` (public, GHCR)
- Source dump: `~/graphiti-mcp/data/dump.rdb` (93MB, local)
- Railway project: `beep-dev` (3 services, all healthy)
- Auth proxy: `https://auth-proxy-production-91fe.up.railway.app`
