# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

## Context

Phases 2-3 are complete. Graphiti MCP + FalkorDB running in Docker, both Claude Code and Codex CLI configured as MCP clients, hook scripts registered, AGENTS.md written.

## Your Mission

Verify the full system end-to-end, add backup and convenience tooling:

1. **End-to-end test (Claude → Codex):**
   - In a Claude Code session, use the `add_memory` MCP tool: name="E2E Test from Claude", body="Cross-tool memory sharing works", group_id="beep-dev"
   - In a Codex CLI session, use `search_memory_facts` with query "E2E Test from Claude"
   - Confirm the memory is found

2. **End-to-end test (Codex → Claude):**
   - Reverse direction: write from Codex, search from Claude Code

3. **Persistence test:**
   ```bash
   docker compose -f ~/graphiti-mcp/docker-compose.yml down
   docker system prune -af
   docker compose -f ~/graphiti-mcp/docker-compose.yml up -d
   # Wait for healthy, then search for previously written memories
   ```

4. **Backup cron job** — add to crontab:
   ```bash
   0 3 * * 0 docker exec graphiti-mcp-falkordb-1 redis-cli BGSAVE && sleep 5 && docker run --rm -v graphiti_falkordb_data:/data -v ~/backups/graphiti:/backup alpine tar czf /backup/graphiti-$(date +\%Y\%m\%d).tar.gz -C /data .
   ```

5. **Shell aliases** — add to `~/.zshrc`:
   ```bash
   alias graphiti-status='curl -sf http://localhost:8000/health && echo "OK" || echo "DOWN"'
   alias graphiti-ui='xdg-open http://localhost:3000'
   alias graphiti-logs='docker compose -f ~/graphiti-mcp/docker-compose.yml logs -f'
   ```

6. **Update spec docs:**
   - Mark all phases complete in QUICK_START.md
   - Add P2-P4 entries to REFLECTION_LOG.md
   - Run full verification from README.md

## Critical Constraints

- NEVER use `docker compose down -v` (deletes named volumes)
- Backup cron container name must match actual running container
- End-to-end tests require actual Claude/Codex sessions (can't automate via bash)
- Create `~/backups/graphiti/` directory before cron fires

## Verification

```bash
curl -sf http://localhost:8000/health && echo "Graphiti OK"
docker volume inspect graphiti_falkordb_data
systemctl --user status graphiti-mcp
crontab -l | grep graphiti
type graphiti-status
```

## Success Criteria

- [ ] Cross-tool memory sharing verified (both directions)
- [ ] Data survives `docker system prune -af`
- [ ] Backup cron registered
- [ ] Shell aliases working
- [ ] All spec documents updated
- [ ] REFLECTION_LOG.md complete

### Handoff Document

Read full context in: `specs/pending/shared-memories/handoffs/HANDOFF_P4.md`
