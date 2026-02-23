# Graphiti Knowledge Graph: Implementation Plan

> Detailed plan for deploying Graphiti MCP with auto-recording hooks for Claude Code + Codex CLI

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Your Workstation                       │
│                                                           │
│  ┌──────────────┐          ┌──────────────┐              │
│  │  Claude Code  │          │  Codex CLI   │              │
│  │              │          │              │              │
│  │ claude-mem   │          │ AGENTS.md    │              │
│  │ (auto-record)│          │ (proactive   │              │
│  │              │          │  memory use) │              │
│  └──────┬───────┘          └──────┬───────┘              │
│         │ MCP (stdio/http)        │ MCP (http)           │
│         └──────────┬──────────────┘                      │
│                    │                                      │
│         ┌──────────▼──────────┐                          │
│         │  Graphiti MCP Server │ ← systemd user service  │
│         │  :8000/mcp/          │                          │
│         └──────────┬──────────┘                          │
│                    │ Redis protocol                       │
│         ┌──────────▼──────────┐                          │
│         │    FalkorDB          │ ← Docker, named volume  │
│         │    :6379             │                          │
│         │    :3000 (Web UI)    │                          │
│         └─────────────────────┘                          │
│                    │                                      │
│         ┌──────────▼──────────┐                          │
│         │  falkordb_data       │ ← Named Docker volume   │
│         │  (survives prune)    │   NOT deleted by         │
│         │                      │   docker system prune -af│
│         └─────────────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

### Why Local vs Remote Server?

**Recommendation: Start local, add remote later if needed.**

| Factor | Local (Docker) | Remote (Tailscale) |
|--------|:-:|:-:|
| Latency | <1ms | 1-5ms direct, 20-150ms relayed |
| Setup complexity | Low | Medium (need server + Tailscale) |
| Survives `docker system prune -af` | Yes (named volumes) | N/A (data on server) |
| Available offline | Yes | No (needs network) |
| Multi-machine access | No | Yes |
| Backup complexity | Low | Lower (centralized) |

Graphiti's `add_memory` does multiple sequential graph operations per episode. Over a good Tailscale direct path (+5ms RTT), this adds 25-200ms per ingestion — negligible for interactive use. **But starting local keeps things simple and available offline.** You can always add a remote FalkorDB later by just changing the `FALKORDB_URI` env var.

---

## Part 1: Infrastructure Setup

### 1.1 Create the Graphiti Deployment Directory

```bash
mkdir -p ~/graphiti-mcp
```

### 1.2 Docker Compose File

Create `~/graphiti-mcp/docker-compose.yml`:

```yaml
services:
  falkordb:
    image: falkordb/falkordb:latest
    ports:
      - "127.0.0.1:6379:6379"   # Redis/FalkorDB (localhost only)
      - "127.0.0.1:3000:3000"   # Browser UI (localhost only)
    volumes:
      - falkordb_data:/data
    environment:
      - REDIS_ARGS=--appendonly yes --appendfsync everysec --maxmemory 4gb --maxmemory-policy allkeys-lru
      - FALKORDB_ARGS=THREAD_COUNT 4 CACHE_SIZE 50
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  graphiti-mcp:
    image: zepai/knowledge-graph-mcp:standalone
    ports:
      - "127.0.0.1:8000:8000"   # MCP HTTP endpoint (localhost only)
    env_file:
      - .env
    environment:
      - FALKORDB_URI=redis://falkordb:6379
      - FALKORDB_DATABASE=beep_knowledge
      - GRAPHITI_GROUP_ID=main
      - SEMAPHORE_LIMIT=10
    depends_on:
      falkordb:
        condition: service_healthy
    restart: unless-stopped

volumes:
  falkordb_data:
    name: graphiti_falkordb_data  # Explicit name = survives docker system prune -af
```

### 1.3 Environment File

Create `~/graphiti-mcp/.env`:

```bash
# LLM provider for entity extraction and embeddings
# Graphiti uses this for knowledge graph construction (NOT for your coding sessions)
OPENAI_API_KEY=sk-your-key-here

# Optional: Use Anthropic instead of OpenAI for graph construction
# ANTHROPIC_API_KEY=sk-ant-your-key-here

# Telemetry (anonymous, opt-out)
GRAPHITI_TELEMETRY_ENABLED=false
```

### 1.4 Persistence Safety

**Named Docker volumes survive `docker system prune -af`.**

The key is the explicit `name: graphiti_falkordb_data` in the compose file. Docker's prune behavior:

- `docker system prune -af` → removes containers, images, build cache. **Does NOT touch named volumes.**
- `docker system prune -af --volumes` → still only removes **anonymous** volumes not referenced by any container.
- `docker volume prune` → removes unused volumes, but named volumes referenced by compose are safe.

**The only way to lose data:** `docker compose down -v` (the `-v` flag explicitly removes named volumes) or `docker volume rm graphiti_falkordb_data`.

FalkorDB is configured with `--appendonly yes` (AOF persistence) so data survives container crashes. RDB snapshots are also taken by default.

### 1.5 Systemd User Service (Auto-Start on Login)

Create `~/.config/systemd/user/graphiti-mcp.service`:

```ini
[Unit]
Description=Graphiti MCP Knowledge Graph Server
Documentation=https://github.com/getzep/graphiti
After=default.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=%h/graphiti-mcp
ExecStartPre=/usr/bin/docker compose pull --quiet
ExecStart=/usr/bin/docker compose up -d --remove-orphans
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300
TimeoutStopSec=120

[Install]
WantedBy=default.target
```

Enable it:

```bash
systemctl --user daemon-reload
systemctl --user enable graphiti-mcp.service
systemctl --user start graphiti-mcp.service

# Optional: start at BOOT even before login (useful for headless/server)
loginctl enable-linger $USER
```

Verify:

```bash
systemctl --user status graphiti-mcp.service
curl http://localhost:8000/health
```

### 1.6 Browser UI Access

Once running, the FalkorDB graph explorer is available at `http://localhost:3000`. You can visually browse entities, relationships, and run graph queries.

---

## Part 2: MCP Client Configuration

### 2.1 Claude Code

Add Graphiti as an MCP server. Run:

```bash
claude mcp add --transport http graphiti-memory http://localhost:8000/mcp/ --scope user
```

Or manually add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "graphiti-memory": {
      "type": "http",
      "url": "http://localhost:8000/mcp/"
    }
  }
}
```

### 2.2 Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.graphiti-memory]
url = "http://localhost:8000/mcp/"
startup_timeout_sec = 30
tool_timeout_sec = 60
enabled = true
```

### 2.3 Verify Both Tools See Graphiti

**Claude Code:** Start a session, then check available tools — you should see `add_memory`, `search_nodes`, `search_memory_facts`, etc.

**Codex CLI:** Run `/mcp` in an interactive session to list configured MCP tools.

---

## Part 3: Auto-Recording Hooks

### 3.1 The MCP HTTP Protocol Challenge

Graphiti's HTTP endpoint uses MCP's Streamable HTTP transport (JSON-RPC 2.0), not a plain REST API. Every call requires:
1. An `initialize` handshake to get an `mcp-session-id` header
2. A `tools/call` request with that session ID

We need a helper script that handles this two-step dance.

### 3.2 Graphiti HTTP Helper Script

Create `~/.local/bin/graphiti-add-memory.py`:

```python
#!/usr/bin/env python3
"""Send a memory to Graphiti MCP via HTTP. Handles MCP session initialization."""

import json
import sys
import urllib.request

GRAPHITI_URL = "http://localhost:8000/mcp/"
PROTOCOL_VERSION = "2024-11-05"


def mcp_request(payload, session_id=None):
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
    }
    if session_id:
        headers["mcp-session-id"] = session_id

    data = json.dumps(payload).encode()
    req = urllib.request.Request(GRAPHITI_URL, data=data, headers=headers)

    try:
        resp = urllib.request.urlopen(req, timeout=15)
        sid = resp.headers.get("mcp-session-id")
        body = json.loads(resp.read())
        return body, sid
    except Exception as e:
        print(f"graphiti-add-memory: error: {e}", file=sys.stderr)
        return None, None


def add_memory(name, body, group_id="main", source="text", source_description=""):
    # Step 1: Initialize
    init_resp, session_id = mcp_request({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {},
            "clientInfo": {"name": "graphiti-hook", "version": "1.0"},
        },
    })

    if not session_id:
        print("graphiti-add-memory: failed to initialize MCP session", file=sys.stderr)
        return False

    # Step 2: Call add_memory tool
    result, _ = mcp_request(
        {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": "add_memory",
                "arguments": {
                    "name": name,
                    "episode_body": body,
                    "source": source,
                    "source_description": source_description,
                    "group_id": group_id,
                },
            },
        },
        session_id,
    )

    if result and "error" not in result:
        return True
    else:
        print(f"graphiti-add-memory: tool call failed: {result}", file=sys.stderr)
        return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Add memory to Graphiti")
    parser.add_argument("--name", required=True, help="Memory title")
    parser.add_argument("--group", default="main", help="Group ID (default: main)")
    parser.add_argument("--source", default="text", help="Source type")
    parser.add_argument("--source-desc", default="", help="Source description")
    parser.add_argument(
        "body", nargs="?", default=None, help="Memory body (or read from stdin)"
    )
    args = parser.parse_args()

    body = args.body if args.body else sys.stdin.read().strip()
    if not body:
        sys.exit(0)

    success = add_memory(args.name, body, args.group, args.source, args.source_desc)
    sys.exit(0 if success else 1)
```

Make it executable:

```bash
chmod +x ~/.local/bin/graphiti-add-memory.py
```

### 3.3 Claude Code: Stop Hook

This hook fires when Claude finishes responding. It reads the session transcript and sends a summary to Graphiti.

Create `~/.local/bin/claude-graphiti-stop-hook.sh`:

```bash
#!/bin/bash
# Claude Code Stop hook → sends session summary to Graphiti

# Read hook JSON from stdin
INPUT=$(cat)
TRANSCRIPT_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('transcript_path',''))" 2>/dev/null)
SESSION_ID=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('session_id',''))" 2>/dev/null)
CWD=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('cwd',''))" 2>/dev/null)

# Skip if no transcript
[ -z "$TRANSCRIPT_PATH" ] && exit 0
[ ! -f "$TRANSCRIPT_PATH" ] && exit 0

# Extract last few assistant messages from transcript (most recent context)
SUMMARY=$(python3 -c "
import json, sys

transcript_path = '$TRANSCRIPT_PATH'
messages = []
try:
    with open(transcript_path) as f:
        for line in f:
            try:
                msg = json.loads(line.strip())
                if msg.get('role') == 'assistant' and msg.get('content'):
                    # Extract text content blocks
                    content = msg['content']
                    if isinstance(content, list):
                        texts = [b.get('text','') for b in content if b.get('type') == 'text']
                        text = ' '.join(texts)
                    elif isinstance(content, str):
                        text = content
                    else:
                        continue
                    if text.strip():
                        messages.append(text.strip())
            except (json.JSONDecodeError, KeyError):
                continue
except FileNotFoundError:
    sys.exit(0)

# Take last 3 assistant messages, truncate to ~4000 chars total
recent = messages[-3:]
combined = '\n---\n'.join(recent)
if len(combined) > 4000:
    combined = combined[-4000:]

print(combined)
" 2>/dev/null)

# Skip empty summaries
[ -z "$SUMMARY" ] && exit 0

# Determine project name from CWD
PROJECT=$(basename "$CWD" 2>/dev/null || echo "unknown")

# Send to Graphiti (fire and forget, don't block Claude)
python3 ~/.local/bin/graphiti-add-memory.py \
  --name "Claude Code session in $PROJECT" \
  --group "beep-dev" \
  --source "text" \
  --source-desc "claude-code stop hook (session: $SESSION_ID)" \
  "$SUMMARY" &

exit 0
```

Make executable:

```bash
chmod +x ~/.local/bin/claude-graphiti-stop-hook.sh
```

### 3.4 Register the Claude Code Hook

Add to `~/.claude/settings.json` (merge with existing content):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/home/elpresidank/.local/bin/claude-graphiti-stop-hook.sh",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

This runs alongside claude-mem's existing hooks — they don't conflict. Claude-mem's plugin hooks fire from its `hooks.json`, and this fires from `settings.json`. Both get the same stdin data.

### 3.5 Codex CLI: Notify Hook

Codex has a `notify` config key that fires on `agent-turn-complete`. Add to `~/.codex/config.toml`:

```toml
notify = ["bash", "/home/elpresidank/.local/bin/codex-graphiti-notify-hook.sh"]
```

Create `~/.local/bin/codex-graphiti-notify-hook.sh`:

```bash
#!/bin/bash
# Codex CLI notify hook → sends turn summary to Graphiti

INPUT=$(cat)

# Extract the last assistant message from the turn
LAST_MSG=$(python3 -c "
import sys, json
data = json.load(sys.stdin)
# Try common fields for agent's last message
msg = data.get('last_assistant_message', '') or data.get('last_agent_message', '') or ''
# Truncate to ~4000 chars
if len(msg) > 4000:
    msg = msg[-4000:]
print(msg)
" <<< "$INPUT" 2>/dev/null)

[ -z "$LAST_MSG" ] && exit 0

# Determine project from CWD
CWD=$(python3 -c "import sys,json; print(json.load(sys.stdin).get('cwd',''))" <<< "$INPUT" 2>/dev/null)
PROJECT=$(basename "$CWD" 2>/dev/null || echo "unknown")

# Send to Graphiti (fire and forget)
python3 ~/.local/bin/graphiti-add-memory.py \
  --name "Codex session in $PROJECT" \
  --group "beep-dev" \
  --source "text" \
  --source-desc "codex-cli notify hook" \
  "$LAST_MSG" &

exit 0
```

```bash
chmod +x ~/.local/bin/codex-graphiti-notify-hook.sh
```

### 3.6 Codex CLI: AGENTS.md for Proactive Memory Use

Since Codex's notify hook is limited (fires once per turn, limited data), the more powerful approach is instructing Codex to proactively use Graphiti's MCP tools. Add to `~/.codex/AGENTS.md`:

```markdown
## Shared Memory Protocol

You have access to a `graphiti-memory` MCP server that maintains a shared knowledge graph
across all coding sessions (Claude Code and Codex CLI share this).

### Session Start
At the start of every session, call `search_memory_facts` with a query describing
the current task to retrieve relevant past context and decisions.

### During Work
When you discover important facts, make architectural decisions, fix tricky bugs,
or learn project-specific patterns, call `add_memory` with:
- `name`: Short descriptive title (e.g., "Effect v4 Schema.decode doesn't exist")
- `episode_body`: The full observation with context
- `source`: "text"
- `group_id`: "beep-dev"

### Session End
Before ending a session, call `add_memory` with a summary of what was accomplished,
key decisions made, and any unresolved issues.
```

---

## Part 4: Additional Considerations

### 4.1 LLM Cost for Graph Construction

Graphiti uses an LLM (OpenAI by default) to extract entities and relationships from every `add_memory` call. This means:
- Every memory write incurs API costs (entity extraction, deduplication, embedding generation)
- Using `gpt-4o-mini` is much cheaper than `gpt-4o` for this
- Configure in `~/graphiti-mcp/config.yaml` (mount into the container) or via env vars

**Cost estimate:** Each `add_memory` call costs roughly $0.001-0.005 depending on text length and model. With ~50-100 memories per day, that's $0.05-0.50/day.

You can configure a cheaper model for graph construction:

```yaml
# ~/graphiti-mcp/config.yaml (mount into container)
llm:
  provider: openai
  model: gpt-4o-mini  # Much cheaper than gpt-4o, good enough for entity extraction

embedder:
  provider: openai
  model: text-embedding-3-small  # Cheapest embedding model
  dimensions: 1536
```

### 4.2 Group ID Strategy

Use a single `group_id` for all sessions from both tools so they share the same knowledge graph:

- `beep-dev` — all development sessions (recommended starting point)

If you later want project isolation:
- `beep-dev/repo-utils` — per-package
- `beep-dev/cli` — per-package

Graphiti's `search_memory_facts` accepts `group_ids` as a list, so you can query across groups.

### 4.3 Memory Deduplication

Graphiti automatically handles this. When you `add_memory` with similar content, the entity extraction pipeline:
1. Extracts entities from the new text
2. Matches them against existing entities (by name + embedding similarity)
3. Merges duplicate entities rather than creating new ones
4. Updates or creates relationships as appropriate
5. Maintains temporal metadata (when facts were first/last seen)

This means sending the same observation twice won't create duplicates — it'll strengthen existing graph connections.

### 4.4 Backup Strategy

Weekly backup via cron:

```bash
# Add to crontab: crontab -e
0 3 * * 0 docker exec graphiti-mcp-falkordb-1 redis-cli BGSAVE && sleep 5 && docker run --rm -v graphiti_falkordb_data:/data -v ~/backups/graphiti:/backup alpine tar czf /backup/graphiti-$(date +\%Y\%m\%d).tar.gz -C /data .
```

### 4.5 Monitoring

Check if Graphiti is healthy:

```bash
curl -sf http://localhost:8000/health && echo "OK" || echo "DOWN"
```

Add to your shell profile (`~/.zshrc`):

```bash
alias graphiti-status='curl -sf http://localhost:8000/health && echo "✓ Graphiti OK" || echo "✗ Graphiti DOWN"'
alias graphiti-ui='xdg-open http://localhost:3000'  # Open FalkorDB browser
alias graphiti-logs='docker compose -f ~/graphiti-mcp/docker-compose.yml logs -f'
```

### 4.6 Resource Usage

FalkorDB is an in-memory database (Redis-based). Expected resource usage:

| Metric | Small (< 1000 memories) | Medium (1000-10000) | Large (10000+) |
|--------|:-:|:-:|:-:|
| RAM | ~200MB | ~500MB-1GB | 2-4GB |
| Disk (volume) | ~50MB | ~200MB | 500MB+ |
| CPU | Negligible idle | Negligible idle | Negligible idle |

The Graphiti MCP server itself uses ~100-200MB RAM (Python process).

### 4.7 What Happens If Graphiti Is Down?

- Claude Code / Codex CLI MCP calls to Graphiti will fail (timeout)
- Hook scripts fire-and-forget (backgrounded with `&`), so they won't block your session
- The model will mention it couldn't reach the memory server — not a hard failure
- Restart with: `systemctl --user restart graphiti-mcp`

### 4.8 Future: Remote FalkorDB on Dedicated Server

When you want multi-machine access:

1. Run FalkorDB on your server with Tailscale:
   ```yaml
   # On server
   services:
     falkordb:
       image: falkordb/falkordb:latest
       ports:
         - "0.0.0.0:6379:6379"  # Accessible via Tailscale IP
       environment:
         - REDIS_ARGS=--requirepass your-strong-password --appendonly yes
       volumes:
         - falkordb_data:/data
   ```

2. Change the local Graphiti MCP to point at the remote FalkorDB:
   ```bash
   # ~/graphiti-mcp/.env
   FALKORDB_URI=redis://100.x.x.x:6379  # Tailscale IP of your server
   FALKORDB_PASSWORD=your-strong-password
   ```

3. Check latency: `tailscale ping your-server-name`
   - Direct path (< 5ms): excellent, no perceptible delay
   - DERP relay (20-150ms): still fine for interactive use

---

## Implementation Checklist

### Phase 1: Infrastructure (15 minutes)
- [ ] Create `~/graphiti-mcp/` directory
- [ ] Write `docker-compose.yml` (from section 1.2)
- [ ] Write `.env` with API key (from section 1.3)
- [ ] `docker compose up -d` and verify with `curl http://localhost:8000/health`
- [ ] Browse `http://localhost:3000` to see FalkorDB UI

### Phase 2: Systemd Service (5 minutes)
- [ ] Create `~/.config/systemd/user/graphiti-mcp.service` (from section 1.5)
- [ ] `systemctl --user daemon-reload && systemctl --user enable graphiti-mcp`
- [ ] Verify: `systemctl --user status graphiti-mcp`

### Phase 3: MCP Client Config (5 minutes)
- [ ] Add Graphiti to Claude Code: `claude mcp add --transport http graphiti-memory http://localhost:8000/mcp/ --scope user`
- [ ] Add Graphiti to Codex CLI: edit `~/.codex/config.toml` (from section 2.2)
- [ ] Verify in both tools: check MCP tools list

### Phase 4: Hook Scripts (10 minutes)
- [ ] Create `~/.local/bin/graphiti-add-memory.py` (from section 3.2)
- [ ] Create `~/.local/bin/claude-graphiti-stop-hook.sh` (from section 3.3)
- [ ] Create `~/.local/bin/codex-graphiti-notify-hook.sh` (from section 3.5)
- [ ] `chmod +x` all three scripts
- [ ] Register Claude Code hook in `~/.claude/settings.json` (from section 3.4)
- [ ] Add `notify` to `~/.codex/config.toml` (from section 3.5)

### Phase 5: Agent Instructions (5 minutes)
- [ ] Add memory protocol to `~/.codex/AGENTS.md` (from section 3.6)
- [ ] Add similar instructions to CLAUDE.md or MEMORY.md for Claude Code
- [ ] Test: start a Claude Code session, make a discovery, check FalkorDB UI for new entities

### Phase 6: Polish (10 minutes)
- [ ] Add shell aliases (from section 4.5)
- [ ] Set up weekly backup cron job (from section 4.4)
- [ ] Test full flow: write memory in Claude Code → search for it in Codex CLI

**Total estimated setup time: ~50 minutes**

---

## Sources

- [Graphiti MCP Server README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md)
- [FalkorDB Docker Docs](https://docs.falkordb.com/operations/docker.html)
- [FalkorDB Persistence Docs](https://docs.falkordb.com/operations/persistence.html)
- [Zep: Graphiti MCP Server](https://help.getzep.com/graphiti/getting-started/mcp-server)
- [Docker system prune reference](https://docs.docker.com/reference/cli/docker/system/prune/)
- [Claude Code hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Codex CLI MCP configuration](https://developers.openai.com/codex/mcp/)
- [Codex CLI advanced configuration](https://developers.openai.com/codex/config-advanced/)
