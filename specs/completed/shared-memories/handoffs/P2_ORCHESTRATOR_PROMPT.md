# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

## Context

Phase 1 (Discovery & Research) is complete. We've selected Graphiti + FalkorDB as the shared knowledge graph, deployed locally via Docker with systemd auto-start. Full research and implementation plan are in `specs/pending/shared-memories/outputs/`.

## Your Mission

Deploy the Graphiti MCP infrastructure:

1. Create `~/graphiti-mcp/docker-compose.yml` with:
   - `falkordb` service (image: `falkordb/falkordb:latest`, ports 6379+3000 on 127.0.0.1, named volume `graphiti_falkordb_data`, AOF persistence, healthcheck)
   - `graphiti-mcp` service (image: `zepai/knowledge-graph-mcp:standalone`, port 8000 on 127.0.0.1, env_file, depends_on falkordb healthy)
   - Named volume with explicit `name: graphiti_falkordb_data`

2. Create `~/graphiti-mcp/.env` with `OPENAI_API_KEY` and `GRAPHITI_TELEMETRY_ENABLED=false`

3. Start the stack: `docker compose up -d`

4. Verify: `curl http://localhost:8000/health` and `http://localhost:3000` loads

5. Create `~/.config/systemd/user/graphiti-mcp.service` (Type=oneshot, RemainAfterExit=yes, TimeoutStartSec=300)

6. Enable: `systemctl --user daemon-reload && systemctl --user enable --now graphiti-mcp`

## Critical Constraints

- All ports bound to `127.0.0.1` only
- Use `restart: unless-stopped` NOT `restart: always` (avoids systemd race)
- Named volume MUST have `name:` field (survives `docker system prune -af`)
- FalkorDB needs `REDIS_ARGS=--appendonly yes --appendfsync everysec`

## Verification

```bash
curl -sf http://localhost:8000/health && echo "OK"
docker volume inspect graphiti_falkordb_data
systemctl --user status graphiti-mcp
```

## Success Criteria

- [ ] Both containers running and healthy
- [ ] Health endpoint returns OK
- [ ] Named volume exists
- [ ] FalkorDB UI accessible
- [ ] Systemd service enabled and active

### Handoff Document

Read full context in: `specs/pending/shared-memories/handoffs/HANDOFF_P2.md`
