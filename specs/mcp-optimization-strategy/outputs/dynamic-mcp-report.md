# Docker Dynamic MCP Research Report

## Overview and Key Concepts

Docker Dynamic MCP enables AI agents to discover and add MCP (Model Context Protocol) servers during conversations without manual pre-configuration. Rather than setting up every server before starting a session, agents can search the MCP Catalog and add servers as needed at runtime.

### Core Components

1. **MCP Gateway**: The open-source foundation that orchestrates MCP servers as isolated Docker containers, providing a unified endpoint for AI applications.

2. **MCP Catalog**: A curated collection of 220+ verified MCP servers, packaged as container images via Docker Hub with full provenance and SBOM metadata.

3. **MCP Toolkit**: A graphical interface in Docker Desktop for discovery, configuration, and management of MCP servers.

### Management Tools

The MCP Gateway exposes six primary tools for agent interaction:

| Tool | Purpose |
|------|---------|
| `mcp-find` | Search for MCP servers in the catalog by name or description |
| `mcp-add` | Add new servers to the current session |
| `mcp-config-set` | Configure MCP server settings |
| `mcp-remove` | Remove servers from active sessions |
| `mcp-exec` | Execute tools available in the current session |
| `code-mode` | Create JavaScript-enabled tools combining multiple server capabilities (experimental) |

---

## How It Works

### Dynamic Tool Registration

Tools are registered on-demand when agents invoke `mcp-add`. The architecture supports:

1. **Runtime Discovery**: Agents search the catalog during conversation using natural language queries like "What MCP servers can I use for working with SQL databases?"

2. **Automatic Installation**: The Gateway handles server setup without user intervention, including:
   - Launching servers as isolated containers
   - Injecting credentials securely
   - Applying security restrictions
   - Routing requests appropriately

3. **Session-Scoped Tools**: Dynamically added servers exist only in the current session. Previously added servers are NOT automatically included when starting a new session.

### Trigger Mechanisms

| Trigger | Action |
|---------|--------|
| Agent calls `mcp-find` | Searches catalog, returns matching servers |
| Agent calls `mcp-add` | Installs and activates server in session |
| Agent calls `mcp-remove` | Deactivates server, frees resources |
| Session ends | All dynamically added servers are cleared |

### Container Isolation

MCP servers run in isolated Docker containers with:
- Restricted privileges
- Limited network access
- Resource constraints (default: 1 CPU, 2GB memory)
- Built-in logging and call-tracing

---

## Context Window Impact Analysis

### The Fundamental Problem

Traditional MCP implementations load ALL tool definitions upfront into the conversation context, regardless of whether tools will be used. Real-world measurements from Claude Code users reveal:

| Configuration | MCP Token Usage | % of 200k Budget |
|---------------|-----------------|------------------|
| 7 active servers (unoptimized) | 67,300 tokens | 33.7% |
| 3 core servers (manual trim) | 42,600 tokens | 21.3% |
| Target with lazy loading | ~10,000 tokens | 5% |

**Key Insight**: Even aggressive manual trimming to 3 core servers still consumes 21.3% of context budget before any conversation begins.

### How Dynamic MCP Helps

Dynamic MCP provides **partial mitigation** through session-scoped loading:

| Benefit | Mechanism |
|---------|-----------|
| On-demand discovery | Tools load only when explicitly added via `mcp-add` |
| Session isolation | New sessions start clean without previously added servers |
| Runtime flexibility | Agents determine what capabilities they need and trigger loading accordingly |

### Quantified Context Savings

Based on community testing:

| Metric | Before | After Dynamic Loading | Reduction |
|--------|--------|----------------------|-----------|
| Baseline MCP context | 67k tokens | Variable (on-demand) | Up to 85% |
| Context efficiency | Fixed overhead | Usage-based | Dynamic |

### Critical Limitation

Dynamic MCP does NOT solve the fundamental problem that once a server IS added, its **full tool definitions** still consume substantial context. The real solution requires **lazy loading of tool definitions themselves** (see Related Approaches section).

---

## Usage Recommendations for beep-effect

### When to Use Docker Dynamic MCP

1. **Multi-tenant or Variable Workflows**: When different sessions require different tool combinations
2. **Exploration and Discovery**: When the required tools are not known in advance
3. **Catalog Access**: When needing access to Docker's 220+ verified MCP servers
4. **Security-Sensitive Environments**: When container isolation and credential injection are important

### When NOT to Use Docker Dynamic MCP

1. **Fixed Toolset Sessions**: If beep-effect workflows always use the same MCP servers
2. **Latency-Critical Operations**: Dynamic server startup adds overhead
3. **Air-Gapped Environments**: Requires access to Docker Hub catalog
4. **Simple Setups**: Adds complexity for minimal benefit if only 2-3 servers needed

### Recommended Configuration for beep-effect

Given beep-effect's architecture (Effect-based monorepo with PostgreSQL, Redis, S3), consider this tiered approach:

**Tier 1 - Always Active (via static config)**:
- Filesystem access (code exploration)
- Git operations (version control)

**Tier 2 - Dynamically Added (via `mcp-add`)**:
- Database tools (when working on persistence layers)
- AWS/S3 tools (when working on storage)
- Docker tools (when working on deployment)

**Tier 3 - On-Demand Discovery (via `mcp-find`)**:
- Specialized tools discovered during conversation

### Feature Toggle

Users can disable dynamic features entirely if needed:
```bash
docker mcp feature disable dynamic-tools
docker mcp feature enable dynamic-tools
```

---

## Implementation Considerations

### Integration with Claude Code

Configure Claude Code to use MCP Gateway:

```bash
# Set custom config directory (optional)
export CLAUDE_CONFIG_DIR=/path/to/config

# Claude Code will use $CLAUDE_CONFIG_DIR/.claude.json for MCP configuration
```

Multiple clients (VS Code, Cursor, Claude Desktop, Claude Code) can connect to the same Gateway simultaneously, ensuring consistency.

### Resource Limits

For production use, configure explicit resource limits:

```bash
docker mcp gateway run \
  --catalog my-private-catalog \
  --memory-limit 2g \
  --cpu-limit 1.0
```

### Current Workaround (Manual Server Management)

Until native lazy loading is implemented in Claude Code:

```bash
# Disable servers when not needed
claude mcp remove github
claude mcp remove docker

# Re-enable for specific tasks
claude mcp add github
```

**Limitations of this approach**:
- Requires manual intervention
- May require session restart
- Disruptive to workflow
- Requires knowing tool needs in advance

### Related Approaches for Further Optimization

Docker Dynamic MCP addresses **server-level** loading. For **tool-definition-level** optimization, consider:

1. **Code Execution with MCP** (Anthropic approach):
   - Present MCP servers as code APIs
   - Agent writes code to interact with tools
   - Reduces token usage by 98.7% in some scenarios (150k to 2k tokens)

2. **Tiered Tool Definitions** (proposed in Claude Code issues):
   - Tier 1: Minimal descriptions (50-100 tokens per tool)
   - Tier 2: Full definitions loaded on-demand
   - Tier 3: Extended documentation via project context

3. **Filesystem-Based Tool Discovery**:
   - Tools represented as files in `./servers/` directory
   - Models read only specific tool files needed
   - Progressive disclosure based on detail level needed

---

## Architectural Decision

### Should beep-effect Adopt Docker Dynamic MCP?

**Recommendation: Partial Adoption**

| Aspect | Recommendation |
|--------|----------------|
| Gateway as unified endpoint | YES - simplifies multi-client configuration |
| Dynamic tool discovery | CONDITIONAL - useful for exploration, not for fixed workflows |
| Catalog access | OPTIONAL - depends on need for Docker's curated servers |
| Container isolation | YES - improves security posture |

### Implementation Priority

1. **Low Effort, High Impact**: Use MCP Gateway as unified endpoint for existing servers
2. **Medium Effort**: Implement tiered server activation (static core + dynamic extras)
3. **Future**: Monitor Claude Code lazy-loading features (Issues #7336, #11364) for native solution

---

## Sources

- [Docker Dynamic MCP Documentation](https://docs.docker.com/ai/mcp-catalog-and-toolkit/dynamic-mcp/)
- [Docker MCP Catalog and Toolkit](https://docs.docker.com/ai/mcp-catalog-and-toolkit/)
- [MCP Gateway Documentation](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [Add MCP Servers to Claude Code with MCP Toolkit](https://www.docker.com/blog/add-mcp-servers-to-claude-code-with-mcp-toolkit/)
- [Claude Code Issue #11364: Lazy-load MCP tool definitions](https://github.com/anthropics/claude-code/issues/11364)
- [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP Specification (November 2025)](https://modelcontextprotocol.io/specification/2025-11-25)
- [Docker MCP Gateway GitHub](https://github.com/docker/mcp-gateway)
