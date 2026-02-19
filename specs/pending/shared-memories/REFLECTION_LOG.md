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

## Template for Future Phases

### P[N]: [Phase Name] (YYYY-MM-DD)

**What worked:**
- ...

**What failed:**
- ...

**What we learned:**
- ...

**Methodology improvements:**
- ...
