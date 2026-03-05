# Handoff P2: Infrastructure Setup

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,800 | OK |
| Episodic | 1,000 | ~600 | OK |
| Semantic | 500 | ~400 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 2 Goal
Deploy Graphiti MCP Server + FalkorDB as a Docker stack with systemd auto-start and persistent storage.

### Deliverables
1. `~/graphiti-mcp/docker-compose.yml` — FalkorDB + Graphiti MCP standalone containers
2. `~/graphiti-mcp/.env` — API keys (OPENAI_API_KEY at minimum)
3. `~/.config/systemd/user/graphiti-mcp.service` — auto-start on login
4. Verification: `curl http://localhost:8000/health` returns OK

### Success Criteria
- [ ] `docker compose up -d` starts both containers without errors
- [ ] `curl -sf http://localhost:8000/health` returns healthy status
- [ ] `docker volume inspect graphiti_falkordb_data` shows the named volume exists
- [ ] FalkorDB UI accessible at `http://localhost:3000`
- [ ] `systemctl --user status graphiti-mcp` shows active
- [ ] After `docker system prune -af` + restart, data persists

### Blocking Issues
- Need OPENAI_API_KEY in `.env` for Graphiti's entity extraction LLM
- FalkorDB image `falkordb/falkordb:latest` and Graphiti image `zepai/knowledge-graph-mcp:standalone` must be pullable

### Key Constraints
- All ports bound to `127.0.0.1` only (not exposed to network)
- Named volume must have explicit `name:` field to survive prune
- `restart: unless-stopped` in compose (not `always` — avoids systemd race)
- FalkorDB configured with `--appendonly yes` for AOF durability

### Implementation Order
1. Create `~/graphiti-mcp/` directory
2. Write `docker-compose.yml` with two services + named volume
3. Write `.env` with OPENAI_API_KEY
4. `docker compose up -d` and verify health
5. Browse `http://localhost:3000` to confirm FalkorDB UI
6. Create systemd user service file
7. `systemctl --user daemon-reload && systemctl --user enable --now graphiti-mcp`
8. Verify systemd status

## Episodic Memory (Previous Context)

### P0-P1 Outcomes
- Research phase compared 11 MCP memory servers
- Graphiti selected for temporal knowledge graph with deduplication
- Local Docker deployment chosen (simpler, offline-capable, upgradeable to remote)
- Full implementation plan written with Docker, systemd, hooks, and scripts

### Key Decisions
- AD-001: Graphiti + FalkorDB over alternatives
- AD-002: Local Docker over remote Tailscale
- AD-003: Named Docker volumes for persistence
- AD-004: Systemd user service

## Semantic Memory (Project Constants)

### Docker Images
| Image | Purpose |
|-------|---------|
| `falkordb/falkordb:latest` | Graph DB (Redis-based) with browser UI |
| `zepai/knowledge-graph-mcp:standalone` | Graphiti MCP server (connects to external FalkorDB) |

### Ports
| Port | Service | Binding |
|------|---------|---------|
| 6379 | FalkorDB (Redis protocol) | 127.0.0.1 |
| 3000 | FalkorDB Browser UI | 127.0.0.1 |
| 8000 | Graphiti MCP HTTP (`/mcp/`) | 127.0.0.1 |

### Environment Variables
| Var | Required | Default |
|-----|----------|---------|
| `OPENAI_API_KEY` | Yes | — |
| `FALKORDB_URI` | No (set in compose) | `redis://falkordb:6379` |
| `FALKORDB_DATABASE` | No | `beep_knowledge` |
| `GRAPHITI_GROUP_ID` | No | `main` |
| `SEMAPHORE_LIMIT` | No | `10` |
| `GRAPHITI_TELEMETRY_ENABLED` | No | `false` |

## Procedural Memory (Reference Links)

- [Graphiti Implementation Plan](../outputs/graphiti-implementation-plan.md) — Section 1 (Infrastructure Setup)
- [Graphiti MCP Server README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)
- [FalkorDB Docker Docs](https://docs.falkordb.com/operations/docker.html)
- Local source: `~/YeeBois/dev/references/graphiti/mcp_server/docker/`

## Verification Steps

```bash
# 1. Containers running
docker compose -f ~/graphiti-mcp/docker-compose.yml ps

# 2. Health check
curl -sf http://localhost:8000/health && echo "OK" || echo "FAIL"

# 3. Named volume exists
docker volume inspect graphiti_falkordb_data

# 4. FalkorDB responding
docker exec graphiti-mcp-falkordb-1 redis-cli ping

# 5. Systemd service
systemctl --user status graphiti-mcp

# 6. Persistence test (simulate prune)
docker compose -f ~/graphiti-mcp/docker-compose.yml down
docker system prune -af
docker compose -f ~/graphiti-mcp/docker-compose.yml up -d
curl -sf http://localhost:8000/health && echo "Survived prune"
```

## Known Issues & Gotchas

1. **First `docker compose up` pulls ~500MB** of images — `TimeoutStartSec=300` in systemd handles this
2. **FalkorDB older images had signal handling bugs** (issue #911) — use `latest` which has the fix
3. **Do NOT use `docker compose down -v`** — the `-v` flag deletes named volumes
4. **`restart: unless-stopped` not `always`** — prevents systemd + Docker restart race condition

## Success Criteria Checklist

- [ ] `~/graphiti-mcp/docker-compose.yml` exists and is valid
- [ ] `~/graphiti-mcp/.env` exists with OPENAI_API_KEY
- [ ] `docker compose up -d` succeeds
- [ ] Health check passes
- [ ] Named volume `graphiti_falkordb_data` exists
- [ ] FalkorDB UI at localhost:3000 loads
- [ ] Systemd service file created and enabled
- [ ] Systemd service shows active after `start`
