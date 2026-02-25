# Handoff P3: Integration & Hooks

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,900 | OK |
| Episodic | 1,000 | ~700 | OK |
| Semantic | 500 | ~400 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 3 Goal
Configure both Claude Code and Codex CLI as MCP clients to Graphiti, create hook scripts for auto-recording, and write agent instruction files for proactive memory use.

### Deliverables
1. Claude Code MCP config — `graphiti-memory` registered via `claude mcp add`
2. Codex CLI MCP config — `[mcp_servers.graphiti-memory]` in `~/.codex/config.toml`
3. `~/.local/bin/graphiti-add-memory.py` — Python stdlib MCP HTTP helper
4. `~/.local/bin/claude-graphiti-stop-hook.sh` — Claude Code Stop hook
5. `~/.local/bin/codex-graphiti-notify-hook.sh` — Codex CLI notify hook
6. Claude Code hook registration in `~/.claude/settings.json`
7. Codex `notify` config in `~/.codex/config.toml`
8. `~/.codex/AGENTS.md` — proactive memory instructions for Codex
9. CLAUDE.md / MEMORY.md additions — proactive memory instructions for Claude Code

### Success Criteria
- [ ] Claude Code sees Graphiti MCP tools (`add_memory`, `search_nodes`, `search_memory_facts`)
- [ ] Codex CLI sees Graphiti MCP tools via `/mcp` command
- [ ] `graphiti-add-memory.py` successfully handles MCP session init + tool call
- [ ] Claude Code Stop hook fires and sends summary to Graphiti (verify in FalkorDB UI)
- [ ] Codex notify hook fires on `agent-turn-complete`
- [ ] AGENTS.md instructs Codex to search memories at session start
- [ ] CLAUDE.md / MEMORY.md instructs Claude Code to use Graphiti proactively

### Blocking Issues
- P2 must be complete — Graphiti MCP must be running at `http://localhost:8000`
- `~/.claude/settings.json` must exist (hooks registration)
- `~/.codex/config.toml` must exist (MCP + notify registration)
- `~/.local/bin/` must be in `$PATH`

### Key Constraints
- Hook scripts must fire-and-forget (background with `&`) — never block the session
- `graphiti-add-memory.py` uses Python stdlib only — no pip dependencies
- MCP HTTP transport requires 2-step handshake: `initialize` → `tools/call` with `mcp-session-id` header
- Claude Code hooks from `settings.json` coexist with plugin hooks from `hooks.json` (no conflicts)
- Codex `notify` hook schema is underdocumented — AGENTS.md proactive instructions are the primary Codex recording path
- All scripts must handle Graphiti-down gracefully (exit 0, log to stderr)

### Implementation Order
1. Create `~/.local/bin/graphiti-add-memory.py` (the shared helper)
2. Test helper: `python3 ~/.local/bin/graphiti-add-memory.py --name "test" --group "beep-dev" "Hello from P3"`
3. Register Claude Code MCP client: `claude mcp add --transport http graphiti-memory http://localhost:8000/mcp --scope user`
4. Register Codex CLI MCP client: edit `~/.codex/config.toml`
5. Start a new session and verify both tools see Graphiti tools
6. Create `claude-graphiti-stop-hook.sh`
7. Register hook in `~/.claude/settings.json`
8. Create `codex-graphiti-notify-hook.sh`
9. Register `notify` in `~/.codex/config.toml`
10. Write `~/.codex/AGENTS.md` memory protocol section
11. Add Graphiti instructions to CLAUDE.md / MEMORY.md
12. Test hooks: run a short Claude Code session, check FalkorDB UI for new entities

## Episodic Memory (Previous Context)

### P0-P1 Outcomes
- 11 MCP memory solutions researched; Graphiti selected for temporal knowledge graph
- Implementation plan written with Docker, systemd, hooks, and scripts
- MCP HTTP session handshake requirement discovered from Graphiti source code

### P2 Outcomes (Expected)
- FalkorDB + Graphiti MCP running in Docker at localhost:8000
- Named volume `graphiti_falkordb_data` persists across prune
- Systemd user service `graphiti-mcp` enabled and active
- Health check at `http://localhost:8000/health` returns OK
- FalkorDB UI accessible at `http://localhost:3000`

## Semantic Memory (Project Constants)

### MCP Registration
| Tool | Method | Config Location |
|------|--------|-----------------|
| Claude Code | `claude mcp add --transport http` | `~/.claude.json` |
| Codex CLI | `[mcp_servers.*]` in TOML | `~/.codex/config.toml` |

### Script Files
| Script | Purpose | Dependencies |
|--------|---------|--------------|
| `graphiti-add-memory.py` | MCP HTTP helper (init + tool call) | Python 3 stdlib |
| `claude-graphiti-stop-hook.sh` | Claude Code Stop hook | graphiti-add-memory.py |
| `codex-graphiti-notify-hook.sh` | Codex CLI notify hook | graphiti-add-memory.py |

### MCP JSON-RPC 2.0 Protocol
1. `POST /mcp` with `initialize` → response includes `mcp-session-id` header
2. `POST /mcp` with `tools/call` + `mcp-session-id` header → tool result

### Hook Data
| Hook | Event | Stdin Fields |
|------|-------|-------------|
| Claude Code Stop | End of response | `session_id`, `transcript_path`, `cwd`, `tool_name` |
| Codex notify | `agent-turn-complete` | `last_agent_message`, `cwd` (schema inferred) |

## Procedural Memory (Reference Links)

- [Graphiti Implementation Plan](../outputs/graphiti-implementation-plan.md) — Parts 2-3
- [Claude Code Hooks Docs](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Codex CLI Config](https://developers.openai.com/codex/config-advanced/)
- [Graphiti MCP Server README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)

## Verification Steps

```bash
# 1. Helper script works
python3 ~/.local/bin/graphiti-add-memory.py --name "P3 test" --group "beep-dev" "Integration test"

# 2. Claude Code MCP tools visible
claude mcp list | grep graphiti

# 3. Codex CLI MCP tools visible
codex mcp list | grep graphiti

# 4. Scripts are executable
test -x ~/.local/bin/graphiti-add-memory.py && echo "Helper OK"
test -x ~/.local/bin/claude-graphiti-stop-hook.sh && echo "Claude hook OK"
test -x ~/.local/bin/codex-graphiti-notify-hook.sh && echo "Codex hook OK"

# 5. Hook registration
grep -q "claude-graphiti-stop-hook" ~/.claude/settings.json && echo "Hook registered"

# 6. FalkorDB shows new entities after test
curl -sf http://localhost:3000 > /dev/null && echo "FalkorDB UI OK"
```

## Known Issues & Gotchas

1. **Codex `notify` hook schema is underdocumented** — field names inferred from binary analysis. If schema changes, AGENTS.md proactive instructions are the fallback.
2. **Claude Code `settings.json` hooks merge with plugin `hooks.json`** — no conflicts, but be careful not to overwrite existing Stop hooks.
3. **MCP session IDs expire** — the helper creates a fresh session per call (correct approach for stateless hook scripts).
4. **`graphiti-add-memory.py` timeout is 15s** — if Graphiti is slow on first call (cold start), increase to 30s.
5. **Hook scripts must exit 0 even on failure** — non-zero exit codes may interfere with the parent tool's behavior.
