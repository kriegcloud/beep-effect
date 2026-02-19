# MCP Server Enablement Guide

> Reference for agents that need MCP tools. Include this section in agents that depend on MCP servers.

---

## Overview

Some agents require MCP (Model Context Protocol) servers to function. This guide explains the **realistic workflow** for MCP server enablement, including what agents can do automatically and what requires user intervention.

---

## Key Principle: Agents Cannot Fully Self-Enable MCP Servers

**Important**: While agents can attempt to add MCP servers via Docker MCP tools, servers typically require **manual enablement in Docker Desktop MCP Toolkit** before they'll work. Agents should:

1. **Detect** when MCP tools are unavailable
2. **Instruct** users on how to enable the server
3. **Fall back** to local alternatives while waiting
4. **Retry** after user confirms enablement

---

## Enablement Workflow

### Step 1: Attempt to Use MCP Tool

```
mcp__effect_docs__effect_docs_search({ query: "Effect.gen" })
```

### Step 2: If Tool Not Found, Check Catalog

```
mcp__MCP_DOCKER__mcp-find({ query: "effect" })
```

### Step 3: Attempt Programmatic Enablement

```
mcp__MCP_DOCKER__mcp-add({ name: "effect-mcp", activate: true })
```

### Step 4: If Still Failing, Provide User Instructions

If the server shows "0 tools" or fails to initialize, tell the user:

```markdown
## MCP Server Enablement Required

The **effect-mcp** server needs to be enabled in Docker Desktop:

1. Open **Docker Desktop**
2. Go to **Settings** → **MCP Toolkit** (or Extensions → MCP Catalog)
3. Find **effect-mcp** in the catalog
4. Click **Enable** or toggle it on
5. Wait for the container to start (check Docker Desktop for status)
6. Return here and confirm "I've enabled it"

**While waiting**, I'll use the fallback: `node_modules/effect/src/`
```

### Step 5: Fall Back to Local Sources

While waiting for user action, use local alternatives:
- `node_modules/effect/src/` for Effect core
- `node_modules/@effect/` for ecosystem packages
- `packages/` for project-specific patterns

---

## Servers Requiring Secrets/Tokens

Some MCP servers require API keys or secrets. When detected, provide setup instructions:

### Template for Secret-Required Servers

```markdown
## MCP Server Setup: [SERVER_NAME]

This server requires authentication. To set it up:

### 1. Obtain API Key
[Instructions specific to the service]

### 2. Configure in Docker Desktop
1. Open **Docker Desktop** → **Settings** → **MCP Toolkit**
2. Find **[server-name]** and click **Configure**
3. Enter the required values:
   - `api_key`: Your API key from step 1
   - [other fields as needed]

### 3. Enable the Server
Toggle the server on and wait for initialization.

### Environment Variables (Alternative)
If using environment-based configuration:
```bash
export [SERVER]_API_KEY="your-key-here"
```
```

---

## Known MCP Servers

### effect-mcp

**Purpose**: Search and retrieve Effect library documentation.

**Catalog name**: `effect-mcp`

**Tools** (when enabled):
- `effect_docs_search`: Search documentation
- `get_effect_doc`: Retrieve full document by ID

**Requires secrets**: No

**User enablement**:
1. Docker Desktop → Settings → MCP Toolkit
2. Enable `effect-mcp`
3. Wait for container to start

**Fallback**: `node_modules/effect/src/`

**Source**: [niklaserik/effect-mcp](https://github.com/niklaserik/effect-mcp)

---

### ide

**Purpose**: IDE integration for diagnostics and navigation.

**Tools**:
- `mcp__ide__getDiagnostics`: Get diagnostic info from IDE

**Note**: Provided by IDE integration (VS Code, Cursor), not Docker MCP.

**Fallback**: Use Glob/Grep for code navigation

---

### elevenlabs (Example: Requires Secrets)

**Purpose**: Text-to-speech and audio processing.

**Catalog name**: `elevenlabs`

**Requires secrets**: Yes - `elevenlabs.api_key`

**User enablement**:
1. Get API key from [ElevenLabs Dashboard](https://elevenlabs.io/)
2. Docker Desktop → MCP Toolkit → Configure `elevenlabs`
3. Enter `api_key` and `data` directory path
4. Enable the server

---

## Docker MCP Tools Reference

### mcp-find

Search for available MCP servers in the catalog.

```
mcp__MCP_DOCKER__mcp-find({ query: "effect" })
```

**Returns**: List of servers with `name`, `description`, `config_schema`, `required_secrets`

### mcp-add

Attempt to add and start an MCP server.

```
mcp__MCP_DOCKER__mcp-add({ name: "effect-mcp", activate: true })
```

**Note**: May show "0 tools" if server not enabled in Docker Desktop.

### mcp-config-set

Configure server settings (for servers with `config_schema`).

```
mcp__MCP_DOCKER__mcp-config-set({
  server: "elevenlabs",
  config: { data: "/path/to/audio" }
})
```

### mcp-exec

Execute a tool from an enabled MCP server.

```
mcp__MCP_DOCKER__mcp-exec({
  name: "effect_docs_search",
  arguments: { query: "Layer composition" }
})
```

---

## Fallback Strategies

| Server | Primary Tool | Fallback Location |
|--------|--------------|-------------------|
| effect-mcp | MCP search | `node_modules/effect/src/` |
| ide | getDiagnostics | Grep/Glob for errors |
| shadcn | Component tools | Manual component creation |

---

## Agent Response Templates

### When MCP Is Available
```
✅ Using Effect documentation MCP server
[proceed with documentation lookup]
```

### When MCP Needs User Enablement
```
⚠️ The effect-mcp server is not available.

**To enable it:**
1. Open Docker Desktop → Settings → MCP Toolkit
2. Enable the `effect-mcp` server
3. Wait for the container to initialize
4. Let me know when it's ready

**In the meantime**, I'll search the local Effect source code...
[proceed with fallback]
```

### When MCP Requires Secrets
```
🔐 The [server] MCP server requires configuration.

**Setup instructions:**
1. Obtain your API key from [service website]
2. In Docker Desktop MCP Toolkit, configure [server]:
   - api_key: [your key]
3. Enable the server

Let me know when configured, or I can proceed with alternatives.
```

---

## Troubleshooting

### "Successfully added 0 tools"

The server was added to the session but isn't exposing tools. This usually means:
- Server not enabled in Docker Desktop MCP Toolkit
- Container failed to start
- Server initialization error

**Solution**: Ask user to check Docker Desktop for server status.

### "EOF" or "failed to initialize"

Container startup failure. Check:
- Docker Desktop is running
- No resource constraints
- Server logs in Docker Desktop

### "Tool not found in current session"

Server tools aren't registered. Try:
1. `mcp-add` with `activate: true`
2. If still failing, user needs manual enablement

---

**Related Files**:
- `specs/mcp-optimization-strategy/outputs/mcp-governance-policy.md`
- `specs/mcp-optimization-strategy/outputs/tool-search-config-template.json`
- `.claude/agents-manifest.yaml`
