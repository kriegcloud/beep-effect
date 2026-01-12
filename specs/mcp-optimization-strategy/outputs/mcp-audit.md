# MCP Configuration Audit Report

> Baseline assessment of MCP server configuration and context token overhead for beep-effect.

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **MCP servers configured** | 3 (effect_docs, ide, shadcn) |
| **Total MCP tools available** | ~5-10 |
| **Estimated baseline token overhead** | ~3,000-5,000 tokens |
| **Optimization potential** | Low (already lean configuration) |

**Key Finding**: The current MCP configuration is significantly leaner than the hypothetical 67,300-token baseline from the research phase. The optimization strategy remains valuable as a proactive measure for future MCP expansion.

---

## 1. Configuration Locations Audited

### 1.1 Global Claude Settings

**Location**: `~/.claude/settings.json`

```json
{}
```

**Status**: Empty - no global MCP servers configured.

### 1.2 Project-Level Settings

**Location**: `.claude/settings.json`

```json
{
  "permissions": {
    "allow": ["Bash(bun:*)", "Bash(git:*)", ...],
    "deny": [...]
  }
}
```

**Status**: Contains permission rules only, no MCP server definitions.

### 1.3 App-Specific MCP Configuration

**Location**: `apps/todox/.mcp.json`

```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```

**Status**: Single MCP server (shadcn) for UI components.

---

## 2. Active MCP Servers

### 2.1 effect_docs (Active)

| Property | Value |
|----------|-------|
| **Provider** | External MCP server |
| **Tools** | 2 |
| **Token overhead** | ~600 tokens |

**Tools exposed**:
- `mcp__effect_docs__effect_docs_search`: Search Effect documentation
- `mcp__effect_docs__get_effect_doc`: Retrieve specific documentation page

**Usage in agents**: 7 agents reference this server.

### 2.2 ide (Active)

| Property | Value |
|----------|-------|
| **Provider** | IDE integration |
| **Tools** | 1+ |
| **Token overhead** | ~300 tokens |

**Tools exposed**:
- `mcp__ide__getDiagnostics`: Get diagnostic info from IDE

**Usage in agents**: Not directly referenced in agent definitions.

### 2.3 shadcn (Conditional)

| Property | Value |
|----------|-------|
| **Provider** | npx shadcn@latest |
| **Tools** | ~10 (estimated) |
| **Token overhead** | ~3,000 tokens |
| **Status** | Only active in todox app context |

**Note**: This server provides UI component management tools.

---

## 3. Tool Usage Analysis

### 3.1 Built-in Tools (Most Frequently Used)

| Tool | Agent Usage Count | Category |
|------|-------------------|----------|
| Read | 21 | File operations |
| Glob | 21 | File discovery |
| Grep | 21 | Content search |
| Write | 10 | File creation |
| Edit | 10 | File modification |
| Bash | 1 | System commands |

### 3.2 External Tools (Web)

| Tool | Agent Usage Count |
|------|-------------------|
| WebSearch | 2 |
| WebFetch | 2 |

### 3.3 MCP Tools

| Tool | Agent Usage Count | Server |
|------|-------------------|--------|
| mcp__effect_docs__effect_docs_search | 7 | effect_docs |
| mcp__effect_docs__get_effect_doc | 6 | effect_docs |
| mcp__ide__getDiagnostics | 0* | ide |

*Not explicitly referenced in agent definitions but available in session.

---

## 4. Token Overhead Calculation

### 4.1 Current Baseline

| Server | Tools | Est. Tokens |
|--------|-------|-------------|
| effect_docs | 2 | 600 |
| ide | 1 | 300 |
| shadcn (when active) | ~10 | 3,000 |
| **Total (typical)** | **3** | **~900** |
| **Total (with shadcn)** | **~13** | **~3,900** |

### 4.2 Comparison to Research Assumptions

| Scenario | Token Overhead | Notes |
|----------|---------------|-------|
| Research baseline | 67,300 | 7 servers, ~50 tools |
| Current (typical) | ~900 | 2 servers, 3 tools |
| Current (max) | ~3,900 | 3 servers, ~13 tools |
| Optimization target | <10,000 | Already achieved |

---

## 5. Recommendations

### 5.1 Current State Assessment

The beep-effect codebase already operates within the target token budget (<10,000 tokens for MCP). The optimization strategy should be implemented **proactively** to:

1. Establish patterns before MCP expansion
2. Prevent context bloat as new servers are added
3. Maintain operational best practices

### 5.2 Prioritized Actions

| Priority | Action | Rationale |
|----------|--------|-----------|
| **P0** | Document current configuration | Establish baseline for tracking |
| **P1** | Create MCP governance policy | Prevent uncontrolled expansion |
| **P2** | Prepare Tool Search config template | Ready for activation when >10 tools |
| **P3** | Monitor MCP tool additions | Track context growth over time |

### 5.3 Tool Search Implementation Criteria

Implement Tool Search Tool **when any of these conditions are met**:

- Total MCP tools exceed 10
- New MCP server with >5 tools is added
- Context budget concerns emerge
- Multi-server workflows become common

---

## 6. Top 5 High-Frequency Tools (For Non-Deferred Loading)

Based on agent usage analysis, these tools should remain non-deferred when Tool Search is implemented:

| Rank | Tool | Usage | Rationale |
|------|------|-------|-----------|
| 1 | `mcp__effect_docs__effect_docs_search` | 7 agents | Primary documentation lookup |
| 2 | `mcp__effect_docs__get_effect_doc` | 6 agents | Document retrieval |
| 3 | `mcp__ide__getDiagnostics` | Session | IDE integration core |
| 4 | (Reserved) | - | Future high-frequency tool |
| 5 | (Reserved) | - | Future high-frequency tool |

**Note**: shadcn tools are app-specific and should use profile filtering rather than non-deferred loading.

---

## 7. Configuration Template

When Tool Search implementation is triggered, use this configuration:

```json
{
  "tools": [
    {
      "type": "tool_search_tool_bm25_20251119",
      "name": "tool_search"
    },
    {
      "type": "mcp_toolset",
      "mcp_server_name": "effect_docs",
      "default_config": {
        "defer_loading": true
      },
      "configs": {
        "effect_docs_search": { "defer_loading": false },
        "get_effect_doc": { "defer_loading": false }
      }
    },
    {
      "type": "mcp_toolset",
      "mcp_server_name": "ide",
      "default_config": {
        "defer_loading": false
      }
    }
  ]
}
```

---

## 8. Appendix: Agent-Tool Matrix

### Agents Using MCP Tools

| Agent | effect_docs Tools | IDE Tools |
|-------|-------------------|-----------|
| mcp-researcher | search, get_doc | - |
| effect-researcher | search, get_doc | - |
| effect-schema-expert | search, get_doc | - |
| effect-predicate-master | search, get_doc | - |
| test-writer | search, get_doc | - |
| code-observability-writer | search | - |

### Agents Using Web Tools

| Agent | WebSearch | WebFetch |
|-------|-----------|----------|
| web-researcher | Yes | Yes |
| ai-trends-researcher | Yes | Yes |

---

**Generated**: 2026-01-11
**Phase**: P1 - Implementation
**Spec**: mcp-optimization-strategy
