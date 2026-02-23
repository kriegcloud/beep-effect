# Reflection Log: Shared Memory Layer

> Cumulative learnings from each phase

---

## P0: Scaffolding (2026-02-19)

**What worked:**
- Starting with broad research (11 solutions) before narrowing to one
- Parallel research agents for Codex CLI capabilities, MCP memory servers, and deployment details

**What we learned:**
- MCP is the universal bridge — both Claude Code and Codex CLI are MCP clients
- Codex CLI has full MCP support via `[mcp_servers.*]` in config.toml
- Codex's `project_doc_fallback_filenames` can include `CLAUDE.md` for cross-tool instruction sharing
- Codex has no real hook system yet (PRs closed, OpenAI designing internally)

**Methodology notes:**
- Research phase used 5 parallel agents, each exploring different angles
- Total research investment: ~500K tokens across all agents
- The Graphiti source code exploration was invaluable — revealed the MCP HTTP session handshake requirement that would have been a blocker during implementation

---

## P1: Discovery & Research (2026-02-19)

**What worked:**
- Having the Graphiti source cloned locally (`~/YeeBois/dev/references/graphiti`) enabled deep code exploration
- Reading the actual MCP server source revealed the JSON-RPC 2.0 session protocol that external docs don't fully explain

**Key findings:**
1. Graphiti MCP HTTP endpoint requires 2-step handshake: `initialize` → `tools/call` with `mcp-session-id` header
2. Named Docker volumes survive `docker system prune -af` (only `-v` flag on `docker compose down` deletes them)
3. Claude Code hooks receive JSON on stdin with `session_id`, `transcript_path`, `cwd`, `tool_name`, etc.
4. Claude Code hooks from plugins (`hooks.json`) and settings.json coexist without conflicts
5. FalkorDB uses Redis protocol — remote deployment over Tailscale is trivial (change one env var)
6. Graphiti uses LLM for entity extraction — cost ~$0.05-0.50/day with gpt-4o-mini

**Risks identified:**
- Codex `notify` hook payload schema is underdocumented (inferred from binary analysis)
- Graphiti MCP server doesn't expose stateless HTTP mode — hooks need the session dance

**Decisions made:**
- AD-001 through AD-006 documented in README.md

---

## P2: Infrastructure Setup (2026-02-19)

**What worked:**
- Docker Compose with healthcheck dependency (`depends_on: condition: service_healthy`) ensured Graphiti waits for FalkorDB
- Systemd user service with `RemainAfterExit=yes` correctly tracks the Docker stack lifecycle
- `loginctl enable-linger` allows services to start at boot without login

**What failed:**
- Initial volume mount path was wrong (`/data` instead of `/var/lib/falkordb/data`) — FalkorDB silently wrote to a different directory, causing data loss on container recreate
- Named Docker volumes were vulnerable to `docker compose down -v`

**What we learned:**
1. Always verify the actual data directory inside a container (`redis-cli CONFIG GET dir`) — don't trust external docs
2. Bind mounts (`./data:/var/lib/falkordb/data`) are strictly safer than named volumes for critical data
3. FalkorDB stores data at `/var/lib/falkordb/data`, NOT `/data`

**Methodology improvements:**
- Added destructive testing (`docker compose down -v`) as a standard verification step for any persistence claim

---

## P3: Integration & Hooks (2026-02-19)

**What worked:**
- Python stdlib-only HTTP helper (`graphiti-add-memory.py`) avoids all dependency management
- Fire-and-forget pattern (background with `&`, always exit 0) makes hooks invisible to the user
- Single `group_id: "beep-dev"` across all repo clones gives shared memory for free
- Git context enrichment (changed files + recent commits) adds high-value metadata to every memory

**What failed:**
- MCP endpoint URL: `/mcp/` (with trailing slash) returns 307 redirect — must use `/mcp`
- SSE response format: Graphiti returns `event: message\ndata: {json}`, not plain JSON — required custom parsing
- Initial implementation plan had multiple stale values that diverged from deployed state

**What we learned:**
1. MCP Streamable HTTP transport uses SSE (`text/event-stream`) — parse `data:` lines, not raw response body
2. MCP requires 3-step handshake: `initialize` → `notifications/initialized` → `tools/call` (not 2-step as originally documented)
3. Branch info in hooks is low value (ephemeral, noisy after merge) — changed files and commit messages are high value
4. Codex CLI's `notify` hook receives `last_assistant_message` and `cwd` on stdin as JSON
5. `beep_knowledge` (from FALKORDB_DATABASE env var) is just the database name; `beep-dev` (from group_id) is the actual graph name within it

**Key decisions:**
- Rejected branch info enrichment (noise vs signal)
- Added git status + recent commits to both hooks
- Switched from named volume to bind mount after discovering vulnerability

**Hardening results:**
- `docker system prune -af` → data survives
- `docker compose down -v` → data survives (bind mount)
- Graphiti down → hooks exit 0, no session blocking
- Empty/garbage/no stdin → hooks exit 0
- Non-git directory → hooks exit 0, skip git context
