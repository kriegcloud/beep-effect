# Shared Memory Layer: Claude Code + Codex CLI

> A persistent knowledge graph (Graphiti + FalkorDB) accessible to both Claude Code and Codex CLI via MCP, with automatic observation recording via hooks.

## Quick Navigation

- [Quick Start](./QUICK_START.md) - 5-minute triage
- [Research: Memory Solutions](./outputs/shared-memory-research.md) - Comparison of 11 MCP memory servers
- [Research: Graphiti Implementation](./outputs/graphiti-implementation-plan.md) - Detailed Graphiti deployment plan
- [Phase 1 Handoff](./handoffs/HANDOFF_P1.md) - Start here for implementation
- [Reflection Log](./REFLECTION_LOG.md) - Cumulative learnings

## Purpose

**Problem:** When the weekly Claude Max rate limit is hit, development switches to Codex CLI. Each tool maintains isolated context — claude-mem (SQLite + ChromaDB) powers Claude Code's memory, while Codex has no cross-session memory. Decisions, bugs, and patterns learned in one tool are invisible to the other.

**Solution:** Deploy Graphiti (temporal knowledge graph) on FalkorDB as a shared MCP memory server, with systemd auto-start and hook-based auto-recording, so both Claude Code and Codex CLI read/write to the same knowledge graph.

**Why it matters:** Eliminates knowledge divergence when switching tools. Memories accumulate passively via hooks rather than requiring manual "save to memory" prompts.

## Success Criteria

- [ ] FalkorDB + Graphiti MCP running via Docker with named volume persistence
- [ ] Systemd user service auto-starts on login
- [ ] Named volume survives `docker system prune -af`
- [ ] Claude Code configured as MCP client to Graphiti
- [ ] Codex CLI configured as MCP client to Graphiti
- [ ] Claude Code Stop hook auto-records session summaries to Graphiti
- [ ] Codex CLI notify hook auto-records turn summaries to Graphiti
- [ ] AGENTS.md instructs Codex to proactively use Graphiti MCP tools
- [ ] CLAUDE.md / MEMORY.md instructs Claude Code to proactively use Graphiti MCP tools
- [ ] End-to-end verified: write memory in Claude Code, retrieve in Codex CLI (and vice versa)
- [ ] Backup cron job configured for weekly FalkorDB snapshots

## Architecture Decision Records

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-001 | Graphiti + FalkorDB over Basic Memory or mem0 | Temporal knowledge graph with relationship tracking; deduplication; best retrieval accuracy |
| AD-002 | Local Docker over remote Tailscale server | Simpler setup, works offline, <1ms latency; can upgrade to remote later by changing one env var |
| AD-003 | Named Docker volumes for persistence | Survives `docker system prune -af`; only deleted by explicit `docker compose down -v` |
| AD-004 | Systemd user service over system service | Runs in user context, no root needed, starts on login; `loginctl enable-linger` for boot-start |
| AD-005 | Python stdlib HTTP helper for hooks | No external dependencies; handles MCP JSON-RPC 2.0 init + tool call handshake |
| AD-006 | Dual recording strategy (hooks + agent instructions) | Hooks provide baseline auto-recording; AGENTS.md/CLAUDE.md enable proactive, higher-quality saves |

## Phase Breakdown

| Phase | Focus | Outputs | Agent(s) | Sessions |
|-------|-------|---------|----------|----------|
| P0 | Scaffolding | README.md, REFLECTION_LOG.md, spec structure | doc-writer | 1 |
| P1 | Discovery & Research | shared-memory-research.md, graphiti-implementation-plan.md | web-researcher, codebase-researcher | 1 |
| P2 | Infrastructure Setup | docker-compose.yml, .env, systemd service, verification | code-writer | 1 |
| P3 | Integration & Hooks | MCP configs, hook scripts, helper scripts, AGENTS.md | code-writer | 1 |
| P4 | Verification & Polish | End-to-end test, backup cron, shell aliases, docs | test-writer | 1 |

## Phase Exit Criteria

| Phase | Done When |
|-------|-----------|
| P0 | Spec structure exists, README complete, REFLECTION_LOG initialized |
| P1 | Research outputs complete: 11 solutions compared, Graphiti plan detailed |
| P2 | `curl http://localhost:8000/health` returns OK, systemd service enabled, volume verified |
| P3 | Both Claude Code and Codex see Graphiti MCP tools, hooks registered, scripts executable |
| P4 | Memory written from Claude Code is searchable from Codex CLI, backup cron active |

## Complexity Assessment

```
Phases:       5  ×2 = 10
Agents:       3  ×3 =  9
CrossPkg:     0  ×0.5= 0
ExtDeps:      3  ×3 =  9  (Docker, Graphiti, FalkorDB)
Uncertainty:  2  ×5 = 10  (MCP HTTP protocol, Codex notify hook schema)
Research:     2  ×2 =  4
                     ----
Total:              42  → Medium complexity
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Graphiti MCP HTTP requires session handshake | Medium | Confirmed | Python helper script wraps the 2-step init + tool call |
| Codex `notify` hook schema underdocumented | Low | High | AGENTS.md proactive instructions are the primary Codex recording path |
| FalkorDB memory usage grows large | Low | Low | `--maxmemory 4gb` cap; monitoring via `redis-cli INFO memory` |
| LLM costs for entity extraction | Low | Confirmed | Use gpt-4o-mini; ~$0.05-0.50/day at typical usage |
| Hook scripts block session if Graphiti is down | Medium | Low | All hook calls backgrounded with `&`; fire-and-forget |

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Docker & Docker Compose | System | Installed |
| OpenAI API key | External | Available |
| Python 3 (stdlib only) | System | Installed |
| `~/.claude/settings.json` | Config | Exists |
| `~/.codex/config.toml` | Config | Exists |
| Graphiti source at `~/YeeBois/dev/references/graphiti` | Reference | Cloned |

## Verification Commands

```bash
# Infrastructure
curl -sf http://localhost:8000/health && echo "Graphiti OK"
docker volume inspect graphiti_falkordb_data
systemctl --user status graphiti-mcp

# MCP tools visible
claude mcp list | grep graphiti
# Codex: run /mcp in interactive session

# Hook scripts
test -x ~/.local/bin/graphiti-add-memory.py && echo "Helper OK"
test -x ~/.local/bin/claude-graphiti-stop-hook.sh && echo "Claude hook OK"
test -x ~/.local/bin/codex-graphiti-notify-hook.sh && echo "Codex hook OK"

# End-to-end
python3 ~/.local/bin/graphiti-add-memory.py --name "test" --group "beep-dev" "Hello from verification"
```

## Key Files

| File | Purpose |
|------|---------|
| `~/graphiti-mcp/docker-compose.yml` | Docker stack definition |
| `~/graphiti-mcp/.env` | API keys and config |
| `~/.config/systemd/user/graphiti-mcp.service` | Auto-start service |
| `~/.local/bin/graphiti-add-memory.py` | MCP HTTP helper (Python stdlib) |
| `~/.local/bin/claude-graphiti-stop-hook.sh` | Claude Code Stop hook |
| `~/.local/bin/codex-graphiti-notify-hook.sh` | Codex CLI notify hook |
| `~/.claude/settings.json` | Claude Code hook registration |
| `~/.codex/config.toml` | Codex MCP + notify config |
| `~/.codex/AGENTS.md` | Codex proactive memory instructions |

## Related Specs

- **[semantic-codebase-search](../semantic-codebase-search/README.md)** — Complementary system. Shared-memories provides cross-session episodic memory ("what did we decide about X?") via Graphiti knowledge graph. Codebase-search provides live code awareness ("does X already exist?") via LanceDB + BM25. Both inject context via Claude Code hooks at different events (Stop vs SessionStart/UserPromptSubmit). No infrastructure overlap — different storage (FalkorDB vs LanceDB), different embeddings (OpenAI API vs local ONNX), different extraction (LLM-powered vs deterministic AST). Hook scripts and MCP server names must not conflict.
