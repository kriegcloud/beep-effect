# Shared Memory Layer: Claude Code + Codex CLI

> Research spec for establishing a unified memory system across AI coding assistants

## Problem Statement

When the weekly Claude Max rate limit is hit, development switches to OpenAI Codex CLI. Currently, each tool maintains isolated context — claude-mem (SQLite + ChromaDB) powers Claude Code's memory, while Codex CLI has no equivalent cross-session memory. This creates knowledge divergence: decisions made, bugs discovered, and patterns learned in one tool are invisible to the other.

**Goal:** A single shared memory backend that both Claude Code and Codex CLI can read from and write to, so switching between tools is seamless.

---

## Current State

### Claude Code: claude-mem Plugin (v9.1.1)

Claude Code's memory is powered by `claude-mem@thedotmack`, a sophisticated two-process system:

| Component | Role |
|-----------|------|
| **Background worker** | HTTP server on `127.0.0.1:37777` — records observations via Claude API, manages session lifecycle, syncs ChromaDB embeddings |
| **MCP server** | stdio process spawned on-demand — proxies search/query ops to Claude Code as MCP tools |

**Storage:**
- `~/.claude-mem/claude-mem.db` — SQLite (45MB), 6,444+ observations with FTS5 full-text search
- `~/.claude-mem/vector-db/` — ChromaDB (144MB) for semantic vector search
- Observations contain: `title`, `subtitle`, `narrative`, `text`, `facts`, `concepts`, `files_read`, `files_modified`, `type` (bugfix/feature/refactor/discovery/decision/change)

**Hooks drive the workflow:**
- `SessionStart` → starts worker, injects recent activity context
- `UserPromptSubmit` → ensures worker running, initializes session
- `PostToolUse` → records what was observed after every tool call
- `Stop` → summarizes session and marks complete

**MCP Tools exposed (3-layer workflow):**
1. `search(query)` → returns index with observation IDs (~50-100 tokens/result)
2. `timeline(anchor=ID)` → context around interesting results
3. `get_observations([IDs])` → full details for filtered IDs
4. `save_memory(text, title)` → manual memory save

**Key insight:** claude-mem's value comes from its *automatic observation recording* via hooks — every tool call generates structured observations without manual intervention. This is the hardest part to replicate in Codex.

### Codex CLI: Current Memory Capabilities

Codex CLI (Apache 2.0, Rust-based) has **full MCP client support** but no built-in cross-session memory:

**What exists:**
- Session transcripts persisted to `~/.codex/sessions/` as JSONL rollout files
- `codex resume <id>` / `codex fork` for session management
- `/compact` command for context summarization
- `AGENTS.md` for persistent project instructions (equivalent to `CLAUDE.md`)
- An experimental `[memories]` config section with `memory_tool` feature flag (internal, not well-documented)

**What does NOT exist:**
- Automatic cross-session memory of facts/decisions
- Hook system for observation recording (PRs #9796 and #11067 were closed by maintainers — they're designing hooks internally)
- Built-in memory consolidation

**MCP configuration format:**
```toml
# ~/.codex/config.toml
[mcp_servers.my-memory]
command = "npx"
args = ["-y", "@my/mcp-server"]
enabled = true

# Or HTTP transport:
[mcp_servers.my-memory]
url = "https://example.com/mcp"
bearer_token_env_var = "MY_API_KEY"
```

**Critical compatibility detail:** Codex also supports `project_doc_fallback_filenames = ["CLAUDE.md"]` so it can read CLAUDE.md files if no AGENTS.md exists.

---

## Evaluated Solutions

### Tier 1: Best Fit for Shared Memory

#### 1. Basic Memory MCP

**The most purpose-built solution for this exact use case.**

| Aspect | Details |
|--------|---------|
| **MCP Support** | Yes, official first-party |
| **Cross-tool docs** | Explicitly documented for [Claude Code](https://docs.basicmemory.com/integrations/claude-code) AND [Codex CLI](https://docs.basicmemory.com/integrations/codex) |
| **Storage** | Human-readable Markdown files + SQLite index |
| **Self-hosted** | Yes — `uv tool install basic-memory` |
| **Cloud** | Yes — Basic Memory Cloud with OAuth |
| **Docker** | Yes — `mcp/basic-memory` on Docker Hub |

**How it works:** Memories are stored as standard Markdown files with semantic link patterns. A local SQLite database indexes them. LLMs navigate via `memory://` URIs that traverse the knowledge graph of linked notes. You can open the files in Obsidian, VS Code, or any text editor.

**MCP Tools:** `write_note`, `read_note`, `search_notes`, `edit_note`, `recent_activity`, `build_context`, `canvas`

**Claude Code config:**
```json
{
  "mcpServers": {
    "basic-memory": {
      "command": "uvx",
      "args": ["basic-memory", "mcp"]
    }
  }
}
```

**Codex CLI config (local):**
```toml
[mcp_servers.basic-memory]
command = "uvx"
args = ["basic-memory", "mcp"]
```

**Codex CLI config (cloud):**
```toml
[mcp_servers.basic-memory]
url = "https://cloud.basicmemory.com/mcp"
bearer_token_env_var = "BASIC_MEMORY_API_KEY"
```

**Strengths:**
- Zero proprietary formats — Markdown files you own
- Explicitly tested and documented for both tools
- Simplest setup (single command install)
- Knowledge graph via semantic links between notes
- Files editable by humans outside of AI tools

**Weaknesses:**
- No automatic observation recording (must be prompted to write notes)
- Less semantic search capability than vector-based solutions
- Cloud version requires API key management

---

#### 2. OpenMemory MCP (mem0, self-hosted)

**Best for semantic/vector search over memories.**

| Aspect | Details |
|--------|---------|
| **MCP Support** | Yes, official first-party |
| **Cross-tool** | Explicitly supports Claude, Codex, Cursor, VS Code |
| **Storage** | PostgreSQL + Qdrant vector DB |
| **Self-hosted** | Yes — single `docker-compose` command |
| **Cloud** | Yes — `api.mem0.ai` or `app.openmemory.dev` |
| **Community fork** | [CaviraOSS/OpenMemory](https://github.com/CaviraOSS/OpenMemory) adds explicit Codex support |

**How it works:** Full local stack via Docker: FastAPI + PostgreSQL (pgvector) + Qdrant. All memory stays on-machine. Multiple MCP clients point at the same instance and share the same memory pool.

**MCP Tools:** `add_memories`, `search_memory`, `get_memory`, `update_memory`, `delete_memory`, `delete_all_memories`

**Self-hosted setup:**
```bash
git clone https://github.com/mem0ai/mem0-mcp
cd mem0-mcp
docker-compose up -d
```

**Claude Code config:**
```json
{
  "mcpServers": {
    "openmemory": {
      "command": "npx",
      "args": ["-y", "mem0-mcp"],
      "env": { "MEM0_API_KEY": "your-key" }
    }
  }
}
```

**Codex CLI config:**
```toml
[mcp_servers.openmemory]
url = "http://localhost:8080/mcp"
# or for cloud:
# url = "https://api.mem0.ai/mcp"
# bearer_token_env_var = "MEM0_API_KEY"
```

**Strengths:**
- True semantic vector search (finds related memories even with different wording)
- Closest to claude-mem's ChromaDB-based search quality
- Built-in web UI for browsing memories
- Docker makes deployment reproducible

**Weaknesses:**
- Heavier infrastructure (PostgreSQL + Qdrant + FastAPI)
- Docker required for self-hosted
- No automatic observation recording (manual save only via MCP tools)

---

#### 3. Graphiti MCP (Zep) — Knowledge Graph

**Most sophisticated memory architecture.**

| Aspect | Details |
|--------|---------|
| **MCP Support** | Yes, official MCP Server 1.0 |
| **Storage** | FalkorDB (Redis-compatible graph DB) |
| **Self-hosted** | Yes — Docker |
| **Cloud** | Yes — Zep Cloud |
| **Maturity** | 20,000+ GitHub stars |

**How it works:** Temporally-aware knowledge graph. Rather than flat vector search, it builds a real-time knowledge graph where each fact has timestamps and relationships. Hybrid search: semantic embeddings + BM25 keyword + direct graph traversal. No LLM calls during retrieval (P95: 300ms).

**Nine preconfigured entity types:** Preference, Requirement, Procedure, Location, Event, Organization, Document, Topic, Object

**Strengths:**
- Tracks how knowledge evolves over time (not just latest state)
- Relationship-aware queries ("what decisions affected the auth module?")
- Best retrieval accuracy (18.5% improvement over MemGPT on DMR benchmark)
- Fully local operation

**Weaknesses:**
- Heaviest setup (FalkorDB + Graphiti server)
- Most complex to configure
- Overkill for simple fact storage

---

### Tier 2: Viable Alternatives

#### 4. Anthropic Knowledge Graph Memory Server

The official reference implementation from Anthropic (`@modelcontextprotocol/server-memory`).

**Storage:** JSONL file on disk (`memory.json`) — entities with observations + directed relations

**Tools:** `create_entities`, `create_relations`, `add_observations`, `search_nodes`, `read_graph`, `open_nodes`, `delete_entities`, `delete_observations`, `delete_relations`

**Strengths:** Canonical reference, dead simple, zero dependencies, human-readable file. Enhanced forks exist: [JamesPrial/mcp-memory-enhanced](https://github.com/JamesPrial/mcp-memory-enhanced) (SQLite, 3-10x faster), [n-r-w/knowledgegraph-mcp](https://github.com/n-r-w/knowledgegraph-mcp) (PostgreSQL/SQLite + fuzzy search).

**Weaknesses:** JSONL doesn't scale, no semantic search, no vector embeddings.

#### 5. mcp-memory-service (doobidoo)

Open-source framework-agnostic memory supporting 13+ tools. ChromaDB + sentence transformers, optional Cloudflare sync, dream-inspired memory consolidation. Has a companion dashboard.

**Notable:** Has **Claude Code-specific hooks** for automatic context injection at session start.

#### 6. mcp-memory-libsql

Uses libSQL (SQLite-compatible, Turso-backed) with built-in vector search. Supports both local files and remote Turso cloud databases for multi-machine sharing.

#### 7. ChromaDB MCP (chroma-core)

Official first-party from Chroma team. Exposes Chroma's vector database as MCP tools. If you want to keep claude-mem's existing ChromaDB data accessible, this is interesting — but it only exposes raw vector operations, not structured observations.

#### 8. Cognee MCP

Knowledge graph engine with polyglot persistence (relational + vector + graph). Configurable backends: NetworkX/Neo4j (graph), LanceDB/Qdrant (vector), SQLite/PostgreSQL (relational). Active research project.

#### 9. Pieces for Developers

Captures workflow activity across apps (IDE, browser, Slack). Single-machine only. More about "what was I doing" than structured project memory. Not a good fit for cross-tool shared memory.

#### 10. Letta (MemGPT)

Full agent framework with native shared memory blocks. The core MCP wrapper is community-maintained. More complex than needed for this use case — better suited if you want a full stateful agent framework.

---

## Comparison Matrix

| Solution | Semantic Search | Auto-Record | Cross-Tool Docs | Setup Complexity | Storage Format | Self-Hosted | Cloud |
|----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Basic Memory** | Partial (SQLite FTS) | No | Both explicitly | Trivial | Markdown + SQLite | Yes | Yes |
| **OpenMemory (mem0)** | Yes (Qdrant vectors) | No | Both supported | Medium (Docker) | PostgreSQL + Qdrant | Yes | Yes |
| **Graphiti (Zep)** | Yes (hybrid) | No | MCP-generic | High (Docker) | FalkorDB graph | Yes | Yes |
| **Anthropic KG Memory** | No | No | MCP-generic | Trivial | JSONL file | Yes | No |
| **mcp-memory-service** | Yes (ChromaDB) | Partial (hooks) | MCP-generic | Medium | ChromaDB + SQLite | Yes | Optional |
| **mcp-memory-libsql** | Yes (built-in) | No | MCP-generic | Low | libSQL/Turso | Yes | Yes |
| **ChromaDB MCP** | Yes (vectors) | No | MCP-generic | Low-Medium | ChromaDB | Yes | Yes |

---

## The Auto-Recording Gap

The biggest gap between any shared MCP memory server and claude-mem is **automatic observation recording**. Claude-mem's value isn't just in storing and searching — it's that every tool call automatically generates a structured observation via PostToolUse hooks. None of the shared memory servers provide this.

### Why This Matters

With claude-mem:
```
You use a tool → PostToolUse hook fires → worker generates observation → stored in SQLite + ChromaDB
```
No manual effort. Memories accumulate passively.

With any shared MCP memory server:
```
You must explicitly ask the AI to "save this to memory" → MCP tool called → stored
```
This requires either discipline or prompt engineering to make the AI save useful observations.

### Possible Mitigations

1. **Claude Code hooks + shared server:** Keep claude-mem's hooks but have them also write to a shared MCP memory server. Codex reads from the shared server. This gives you automatic recording from Claude Code sessions, with Codex benefiting as a consumer.

2. **Codex Skills as pseudo-hooks:** Create a Codex Skill that includes instructions like "after completing any significant task, save a structured observation to memory." Not automatic, but increases the likelihood of memory writes.

3. **Wrapper script approach:** A post-session script that processes Codex's session rollout files (`~/.codex/sessions/*.jsonl`) and extracts observations into the shared memory. Could run as a cron job or `notify` hook (the one hook Codex does have fires on `agent-turn-complete`).

4. **Wait for Codex hooks:** OpenAI maintainers have acknowledged demand (Discussion #2150, 69+ participants) and are designing hooks internally. Once available, a symmetric hook-based recording system becomes possible.

---

## Recommended Architecture

### Option A: Basic Memory (Simplest, Recommended Starting Point)

```
                    Shared Memory Layer
                    ==================
                    Basic Memory MCP
                    (Markdown + SQLite)
                   /                    \
                  /                      \
    Claude Code                      Codex CLI
    ~/.claude MCP config             ~/.codex/config.toml
    (stdio transport)                (stdio or HTTP transport)
                  \                      /
                   \                    /
                    Human-readable
                    Markdown files
                    (also viewable in
                     Obsidian/VS Code)
```

**Setup time:** ~5 minutes
**Maintenance:** Near-zero
**Storage:** `~/basic-memory/` directory of Markdown files

**Steps:**
1. `uv tool install basic-memory`
2. Configure in Claude Code's MCP settings
3. Configure in `~/.codex/config.toml`
4. Both tools now share the same knowledge base
5. Optionally: open `~/basic-memory/` in Obsidian for a visual knowledge graph

**When to choose:** You want the fastest path to shared memory with human-readable storage and zero infrastructure.

### Option B: OpenMemory + claude-mem Bridge (Maximum Fidelity)

```
    Claude Code                              Codex CLI
        |                                        |
    claude-mem                              OpenMemory MCP
    (auto-records via hooks)                (read + manual write)
        |                                        |
    SQLite + ChromaDB                       shared ──┐
    (primary, auto)                                  │
        |                                            │
    Bridge Script ──────────────────────────> OpenMemory
    (sync observations to shared backend)    PostgreSQL + Qdrant
                                             (Docker, local)
```

**Setup time:** ~30 minutes
**Maintenance:** Docker containers, bridge script
**Storage:** PostgreSQL + Qdrant (Docker volumes)

**Steps:**
1. Keep claude-mem as-is (automatic recording continues)
2. Deploy OpenMemory via `docker-compose`
3. Configure OpenMemory MCP in `~/.codex/config.toml`
4. Write a bridge script that reads claude-mem's SQLite observations and syncs to OpenMemory
5. Run bridge on a schedule (cron) or as part of claude-mem's Stop hook
6. Codex reads from OpenMemory; Claude Code writes automatically via claude-mem

**When to choose:** You want to keep claude-mem's automatic recording and get the best semantic search quality for Codex.

### Option C: Graphiti Knowledge Graph (Maximum Intelligence)

```
    Claude Code                      Codex CLI
        |                                |
    Graphiti MCP                    Graphiti MCP
    (write + read)                  (write + read)
        |                                |
        └──────── FalkorDB ──────────────┘
                  (Docker)
                  Temporal knowledge graph
                  with relationships
```

**Setup time:** ~45 minutes
**Maintenance:** Docker containers
**Storage:** FalkorDB (Redis-compatible graph DB)

**When to choose:** You need relationship-aware queries, temporal tracking of how knowledge evolves, and don't mind the setup complexity.

---

## Utility: add-mcp CLI

[add-mcp](https://neon.com/blog/add-mcp) (from Neon) is a CLI that installs an MCP server configuration across all your coding agents with one command. It auto-detects installed agents and writes the correct config files. Supports: Claude Code, Claude Desktop, Codex CLI, Cursor, Gemini CLI, Goose, OpenCode, VS Code + Copilot, Zed.

```bash
npx add-mcp basic-memory -- uvx basic-memory mcp
```

This would configure Basic Memory in both Claude Code and Codex CLI simultaneously.

---

## Implementation Plan

### Phase 1: Immediate (Option A)

1. Install Basic Memory: `uv tool install basic-memory`
2. Use `add-mcp` to configure for both tools:
   ```bash
   npx add-mcp basic-memory -- uvx basic-memory mcp
   ```
3. Add instruction to both CLAUDE.md and AGENTS.md:
   ```
   When you make important discoveries, decisions, or learn project patterns,
   save them to shared memory using the basic-memory write_note tool.
   At the start of each session, use search_notes to check for relevant context.
   ```
4. Test: make a decision in Claude Code, switch to Codex, verify it's accessible

### Phase 2: Enhanced (Optional, adds auto-recording)

1. Create a bridge script that:
   - Reads claude-mem's `~/.claude-mem/claude-mem.db` SQLite observations
   - Converts observations to Basic Memory Markdown notes
   - Runs on claude-mem's Stop hook or as a cron job
2. This gives Codex access to claude-mem's automatically-recorded observations
3. Add a Codex notify hook script that processes session rollouts into Basic Memory notes

### Phase 3: Upgrade path (when Codex hooks land)

1. When Codex ships its hook system, create PostToolUse-equivalent hooks
2. Mirror claude-mem's automatic observation pattern for Codex
3. Both tools now auto-record to the same shared backend
4. Optionally migrate from Basic Memory to OpenMemory/Graphiti for better semantic search

---

## Appendix: Feature Comparison — Claude Code vs Codex CLI

| Feature | Claude Code | Codex CLI |
|---------|-------------|-----------|
| **License** | Proprietary (free tool) | Apache 2.0 (open source) |
| **Core language** | TypeScript/Node.js | Rust |
| **Instruction files** | `CLAUDE.md` (Claude-only) | `AGENTS.md` (industry standard: Cursor, Builder.io, Jules) |
| **MCP client** | Yes | Yes |
| **MCP server** | Yes | Yes (`codex mcp-server`) |
| **Hooks/Lifecycle** | Full (PreToolUse, PostToolUse, Stop, Notification) | Minimal (`notify` on agent-turn-complete only) |
| **Skills/Extensions** | Yes (`.claude/commands/`, SKILL.md) | Yes (`.agents/skills/`, SKILL.md) |
| **Sub-agents** | Built-in, stable | Experimental (`multi_agent = true`) |
| **Built-in web search** | No (requires MCP) | Yes (first-party) |
| **Session persistence** | JSONL, resume | JSONL, resume/fork |
| **Cross-session memory** | Via claude-mem plugin (auto-recording) | Not built-in (MCP memory servers) |
| **Sandboxing** | File permission-based | OS-level (Seatbelt/Landlock/bubblewrap) |
| **Config format** | JSON/JSONC | TOML |
| **Fallback instruction files** | N/A | `project_doc_fallback_filenames = ["CLAUDE.md"]` |
| **SWE-bench** | ~72.7% | ~69.1% |

### Cross-tool Configuration Cheat Sheet

**Make Codex read CLAUDE.md as fallback:**
```toml
# ~/.codex/config.toml
project_doc_fallback_filenames = ["CLAUDE.md", "CONTEXT.md"]
```

**Configure same MCP server in both:**

Claude Code (`~/.claude/settings.json` or project `.mcp.json`):
```json
{
  "mcpServers": {
    "shared-memory": {
      "command": "uvx",
      "args": ["basic-memory", "mcp"]
    }
  }
}
```

Codex CLI (`~/.codex/config.toml`):
```toml
[mcp_servers.shared-memory]
command = "uvx"
args = ["basic-memory", "mcp"]
```

---

## Sources

### MCP Memory Servers
- [Basic Memory — GitHub](https://github.com/basicmachines-co/basic-memory) | [Codex docs](https://docs.basicmemory.com/integrations/codex) | [Claude Code docs](https://docs.basicmemory.com/integrations/claude-code)
- [OpenMemory (mem0) — GitHub](https://github.com/mem0ai/mem0-mcp) | [Blog](https://mem0.ai/blog/introducing-openmemory-mcp) | [Landing](https://mem0.ai/openmemory)
- [Graphiti (Zep) — GitHub](https://github.com/getzep/graphiti) | [MCP Server 1.0 blog](https://blog.getzep.com/graphiti-hits-20k-stars-mcp-server-1-0/) | [Docs](https://help.getzep.com/graphiti/getting-started/mcp-server)
- [Anthropic KG Memory — GitHub](https://github.com/modelcontextprotocol/servers) | [Enhanced fork](https://github.com/JamesPrial/mcp-memory-enhanced)
- [mcp-memory-service — GitHub](https://github.com/doobidoo/mcp-memory-service)
- [mcp-memory-libsql — GitHub](https://github.com/joleyline/mcp-memory-libsql) | [Go port](https://github.com/ZanzyTHEbar/mcp-memory-libsql-go)
- [ChromaDB MCP — GitHub](https://github.com/chroma-core/chroma-mcp) | [Docs](https://docs.trychroma.com/integrations/frameworks/anthropic-mcp)
- [Cognee — GitHub](https://github.com/topoteretes/cognee) | [MCP quickstart](https://docs.cognee.ai/cognee-mcp/mcp-quickstart)
- [Pieces MCP — Blog](https://pieces.app/blog/introducing-the-pieces-mcp-server)
- [Letta — GitHub](https://github.com/letta-ai/letta-code) | [MCP wrapper](https://github.com/oculairmedia/Letta-MCP-server) | [Shared memory blocks](https://docs.letta.com/tutorials/shared-memory-blocks)
- [mcp-memory-keeper — GitHub](https://github.com/mkreyman/mcp-memory-keeper)

### Codex CLI
- [Codex CLI — GitHub](https://github.com/openai/codex)
- [MCP configuration](https://developers.openai.com/codex/mcp/)
- [Config reference](https://developers.openai.com/codex/config-reference/) | [Basics](https://developers.openai.com/codex/config-basic/) | [Advanced](https://developers.openai.com/codex/config-advanced/) | [Sample](https://developers.openai.com/codex/config-sample/)
- [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/)
- [Skills](https://developers.openai.com/codex/skills/) | [Slash commands](https://developers.openai.com/codex/cli/slash-commands/)
- [Hooks discussion #2150](https://github.com/openai/codex/discussions/2150)
- [MCP config issue #3441](https://github.com/openai/codex/issues/3441)
- [Memory bank request #4655](https://github.com/openai/codex/issues/4655)

### Utilities
- [add-mcp (Neon) — Blog](https://neon.com/blog/add-mcp) — install MCP server across all agents with one command
- [CaviraOSS/OpenMemory fork](https://github.com/CaviraOSS/OpenMemory) — adds explicit Codex support
