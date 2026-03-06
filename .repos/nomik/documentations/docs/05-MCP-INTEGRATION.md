# NOMIK — MCP Integration

## What Is MCP?

The **Model Context Protocol (MCP)** is an open standard by Anthropic that lets AI assistants connect to external tools and data sources. NOMIK exposes an MCP server that gives AI assistants direct access to the code knowledge graph.

## Setup

### Automatic (recommended)

```bash
nomik setup-cursor       # Cursor AI
nomik setup-windsurf     # Windsurf AI
nomik setup-claude       # Claude Desktop
nomik setup-antigravity  # Antigravity Editor
```

Each command auto-creates the correct config file with Neo4j credentials and project ID.

> In stdio mode, you do **not** need `nomik serve`. The IDE launches the MCP server on demand.

### Manual Config

```json
{
  "mcpServers": {
    "nomik": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "NOMIK_GRAPH_URI": "bolt://localhost:7687",
        "NOMIK_GRAPH_USER": "neo4j",
        "NOMIK_GRAPH_PASS": "nomik_local",
        "NOMIK_PROJECT_ID": "my-project",
        "NOMIK_ROLE": "dev",
        "NOMIK_SAMPLING": "false"
      }
    }
  }
}
```

Config file locations:
- **Cursor**: `.cursor/mcp.json` (project) or global
- **Windsurf**: `~/.codeium/windsurf/mcp_config.json`
- **Claude Desktop**: `%APPDATA%\Claude\claude_desktop_config.json` (Windows) / `~/Library/Application Support/Claude/` (macOS)
- **Antigravity**: Platform-specific `mcp_config.json`

## MCP Capabilities

NOMIK exposes **4 MCP capabilities**:

| Capability | Count | Description |
|---|---|---|
| **Tools** | 21 | Callable functions for graph queries |
| **Resources** | 9 | Browsable data endpoints (`nomik://stats`, etc.) |
| **Prompts** | 6 | Pre-built conversation starters |
| **Sampling** | 3 helpers | Server→client LLM completion requests |

See [CLI & MCP Reference](11-CLI-TOOLS-REFERENCE.md) for the complete list.

## Role-Scoped Access

Set `NOMIK_ROLE` to filter what tools/resources/prompts the AI can see:

| Role | Use Case | Access |
|---|---|---|
| `dev` (default) | Full access | All 21 tools, 9 resources, 6 prompts |
| `architect` | Architecture review | rules, communities, flows, diff, onboard |
| `security` | Security audit | audit, guard, rules, health |
| `pm` | Project management | onboard, changes, changelog, health |

## MCP Sampling

When `NOMIK_SAMPLING=true`, the server can request the client's LLM to generate completions. This enables the server to enrich raw graph data with AI-generated summaries:

```
Server queries Neo4j → gets 80 affected nodes
Server sends sampling/createMessage → "Summarize this impact data"
Client LLM generates human-readable summary
Server returns enriched response
```

Pre-built helpers:
- `sampleImpactSummary()` — summarize impact analysis
- `sampleHealthSummary()` — prioritized health action plan
- `sampleMigrationPlan()` — step-by-step migration guide

Falls back gracefully if the client doesn't support sampling.

## How It Works

```
User: "What breaks if I change processPayment?"

AI calls nm_impact → NOMIK queries Neo4j →

[
  { "name": "POST /api/checkout", "type": "Route", "depth": 1, "relationship": "CALLS" },
  { "name": "handleRefund", "type": "Function", "depth": 1, "relationship": "CALLS" },
  { "name": "CheckoutForm", "type": "Function", "depth": 2, "relationship": "DEPENDS_ON" }
]

→ AI uses precise graph data instead of grepping 47 files
```

## Transport

| Transport | Use Case |
|---|---|
| **stdio** | Cursor, Windsurf, Claude Desktop (local) |
| **SSE** | Remote access, web dashboards |
| **Streamable HTTP** | Production / multi-client |

For local development, **stdio** is all you need.
