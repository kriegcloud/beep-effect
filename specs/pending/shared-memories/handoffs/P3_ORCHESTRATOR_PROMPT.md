# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

## Context

Phase 2 (Infrastructure) is complete. Graphiti MCP + FalkorDB are running locally via Docker with systemd auto-start. Health check passes at `http://localhost:8000/health`.

## Your Mission

Configure MCP clients, create hook scripts, and write agent instructions:

1. Create `~/.local/bin/graphiti-add-memory.py` — Python stdlib MCP HTTP helper that handles the 2-step JSON-RPC 2.0 handshake (`initialize` → `tools/call` with `mcp-session-id` header). See implementation plan Part 3.2.

2. Test the helper: `python3 ~/.local/bin/graphiti-add-memory.py --name "test" --group "beep-dev" "Hello from P3"`

3. Register Claude Code MCP client:
   ```bash
   claude mcp add --transport http graphiti-memory http://localhost:8000/mcp/ --scope user
   ```

4. Register Codex CLI MCP client in `~/.codex/config.toml`:
   ```toml
   [mcp_servers.graphiti-memory]
   url = "http://localhost:8000/mcp/"
   startup_timeout_sec = 30
   tool_timeout_sec = 60
   enabled = true
   ```

5. Create `~/.local/bin/claude-graphiti-stop-hook.sh` (reads transcript, sends last 3 assistant messages to Graphiti, backgrounded with `&`). Register in `~/.claude/settings.json` under `hooks.Stop`.

6. Create `~/.local/bin/codex-graphiti-notify-hook.sh` (reads notify JSON, sends last agent message to Graphiti). Register via `notify` in `~/.codex/config.toml`.

7. Write memory protocol in `~/.codex/AGENTS.md` and update CLAUDE.md/MEMORY.md for proactive Graphiti use.

## Critical Constraints

- All hook scripts exit 0 even on failure (never block the parent tool)
- All Graphiti calls backgrounded with `&` (fire-and-forget)
- `graphiti-add-memory.py` uses Python 3 stdlib only (no pip deps)
- MCP HTTP requires session handshake — NOT a simple REST API
- Coexists with existing claude-mem hooks (no conflicts)

## Verification

```bash
python3 ~/.local/bin/graphiti-add-memory.py --name "test" --group "beep-dev" "Verification"
claude mcp list | grep graphiti
test -x ~/.local/bin/claude-graphiti-stop-hook.sh && echo "OK"
test -x ~/.local/bin/codex-graphiti-notify-hook.sh && echo "OK"
```

## Success Criteria

- [ ] Helper script adds memory to Graphiti successfully
- [ ] Claude Code sees Graphiti MCP tools
- [ ] Codex CLI sees Graphiti MCP tools
- [ ] All 3 scripts are executable
- [ ] Claude Code Stop hook registered
- [ ] Codex notify hook registered
- [ ] AGENTS.md has memory protocol
- [ ] Short Claude session produces entities visible in FalkorDB UI

### Handoff Document

Read full context in: `specs/pending/shared-memories/handoffs/HANDOFF_P3.md`
