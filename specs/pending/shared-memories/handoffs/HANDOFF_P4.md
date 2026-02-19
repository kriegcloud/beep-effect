# Handoff P4: Verification & Polish

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,500 | OK |
| Episodic | 1,000 | ~800 | OK |
| Semantic | 500 | ~300 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 4 Goal
End-to-end verification of the shared memory system, backup configuration, shell convenience aliases, and documentation polish.

### Deliverables
1. End-to-end test: write memory in Claude Code → search in Codex CLI (and vice versa)
2. Weekly backup cron job for FalkorDB snapshots
3. Shell aliases in `~/.zshrc` for status, UI, and logs
4. Updated QUICK_START.md with final status
5. REFLECTION_LOG.md entry for P2-P4
6. Persistence test: survive `docker system prune -af` + restart

### Success Criteria
- [ ] Memory written from Claude Code is searchable from Codex CLI
- [ ] Memory written from Codex CLI is searchable from Claude Code
- [ ] Backup cron job configured and tested
- [ ] `docker system prune -af` + restart preserves all data
- [ ] Shell aliases work (`graphiti-status`, `graphiti-ui`, `graphiti-logs`)
- [ ] All spec documents updated with final status
- [ ] REFLECTION_LOG.md has entries for P2, P3, P4

### Blocking Issues
- P3 must be complete — both tools configured as MCP clients, hooks registered

### Implementation Order
1. End-to-end test: Claude Code writes, Codex reads
2. End-to-end test: Codex writes, Claude Code reads
3. Persistence test: `docker compose down` → `docker system prune -af` → `docker compose up -d` → verify data
4. Add backup cron job (weekly FalkorDB BGSAVE + tar to `~/backups/graphiti/`)
5. Add shell aliases to `~/.zshrc`
6. Update QUICK_START.md (mark all phases complete)
7. Add REFLECTION_LOG.md entries for P2-P4
8. Final verification: run all verification commands from README.md

## Episodic Memory (Previous Context)

### P0-P1 Outcomes
- Research complete: 11 solutions compared, Graphiti selected
- Implementation plan detailed with Docker, systemd, hooks, scripts

### P2 Outcomes (Expected)
- Docker stack running (FalkorDB + Graphiti MCP)
- Named volume `graphiti_falkordb_data` created
- Systemd service enabled and active
- Health check passing

### P3 Outcomes (Expected)
- Claude Code and Codex CLI configured as MCP clients
- Helper script (`graphiti-add-memory.py`) working
- Claude Code Stop hook and Codex notify hook registered
- AGENTS.md and CLAUDE.md/MEMORY.md updated with memory protocol

## Semantic Memory (Project Constants)

### End-to-End Test Plan

**Test 1: Claude Code → Codex CLI**
```
1. In Claude Code session: call add_memory with name "E2E Test from Claude" and body "Testing cross-tool memory sharing"
2. In Codex CLI session: call search_memory_facts with query "E2E Test from Claude"
3. Verify: result contains the memory
```

**Test 2: Codex CLI → Claude Code**
```
1. In Codex CLI session: call add_memory with name "E2E Test from Codex" and body "Reverse direction test"
2. In Claude Code session: call search_memory_facts with query "E2E Test from Codex"
3. Verify: result contains the memory
```

**Test 3: Persistence**
```bash
docker compose -f ~/graphiti-mcp/docker-compose.yml down
docker system prune -af
docker compose -f ~/graphiti-mcp/docker-compose.yml up -d
# Wait for healthy
curl -sf http://localhost:8000/health && echo "Survived prune"
# Search for previously written memories
```

### Backup Cron Schedule
| Schedule | Command | Retention |
|----------|---------|-----------|
| Weekly (Sun 3am) | BGSAVE + tar to `~/backups/graphiti/` | Manual cleanup |

### Shell Aliases
| Alias | Command |
|-------|---------|
| `graphiti-status` | `curl -sf http://localhost:8000/health && echo "OK" \|\| echo "DOWN"` |
| `graphiti-ui` | `xdg-open http://localhost:3000` |
| `graphiti-logs` | `docker compose -f ~/graphiti-mcp/docker-compose.yml logs -f` |

## Procedural Memory (Reference Links)

- [Graphiti Implementation Plan](../outputs/graphiti-implementation-plan.md) — Parts 4.4-4.5
- [README.md Verification Commands](../README.md#verification-commands)
- [REFLECTION_LOG.md](../REFLECTION_LOG.md)

## Verification Steps

```bash
# 1. End-to-end (manual in tool sessions)
# Claude Code: use add_memory tool, Codex: use search_memory_facts

# 2. Infrastructure still healthy
curl -sf http://localhost:8000/health && echo "Graphiti OK"
docker volume inspect graphiti_falkordb_data
systemctl --user status graphiti-mcp

# 3. All scripts executable
test -x ~/.local/bin/graphiti-add-memory.py && echo "Helper OK"
test -x ~/.local/bin/claude-graphiti-stop-hook.sh && echo "Claude hook OK"
test -x ~/.local/bin/codex-graphiti-notify-hook.sh && echo "Codex hook OK"

# 4. Backup cron registered
crontab -l | grep graphiti && echo "Backup cron OK"

# 5. Shell aliases
type graphiti-status 2>/dev/null && echo "Aliases OK"

# 6. Persistence test
docker compose -f ~/graphiti-mcp/docker-compose.yml down
docker system prune -af
docker compose -f ~/graphiti-mcp/docker-compose.yml up -d
sleep 30  # Wait for healthy
curl -sf http://localhost:8000/health && echo "Survived prune"
```

## Known Issues & Gotchas

1. **End-to-end tests require manual tool use** — can't fully automate MCP tool calls from bash; need actual Claude/Codex sessions.
2. **`docker system prune -af` removes images** — first restart after prune will re-pull ~500MB of images (covered by `TimeoutStartSec=300`).
3. **Backup cron uses `docker exec`** — container name may differ if compose project name changes. Verify with `docker ps`.
4. **Do NOT use `docker compose down -v`** during persistence test — the `-v` flag deletes named volumes.
