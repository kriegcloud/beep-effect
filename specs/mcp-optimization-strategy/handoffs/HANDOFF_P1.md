# MCP Optimization Strategy: Handoff P1

> Implementation handoff for executing the MCP context optimization strategy in the beep-effect codebase.

---

## Session Summary: Research Phase Completed

| Metric | Status |
|--------|--------|
| Research reports generated | 7 (5 capabilities + 2 synthesis) |
| Primary recommendation | Tool Search Tool (85%+ reduction) |
| Secondary recommendation | MCP Gateway + Profiles |
| Context target | <10,000 tokens (from 67,300 baseline) |

---

## P1 Execution Tasks

### Task 1: Audit Current MCP Configuration

**Objective**: Establish baseline token overhead

**Sub-agent prompt**:
```
Audit MCP configuration in the beep-effect codebase.

1. Find all MCP-related configuration files:
   - .claude/settings.json
   - .claude/servers.json (if exists)
   - Any mcp-config files

2. List all MCP servers currently configured

3. For each server, identify:
   - Server name
   - Number of tools exposed
   - Estimated token overhead (tools * ~300 tokens)

4. Calculate total baseline overhead

5. Identify top 5 most frequently used tools (based on agent definitions and skill prompts)

Output: specs/mcp-optimization-strategy/outputs/mcp-audit.md
```

### Task 2: Implement Tool Search Tool

**Objective**: Reduce context overhead by 85%+

**Prerequisites**:
- Claude Opus 4.5 or Sonnet 4.5
- Beta header access: `advanced-tool-use-2025-11-20`

**Configuration template**:
```json
{
  "tools": [
    {
      "type": "tool_search_tool_bm25_20251119",
      "name": "tool_search"
    },
    {
      "type": "mcp_toolset",
      "mcp_server_name": "[SERVER_NAME]",
      "default_config": {
        "defer_loading": true
      },
      "configs": {
        "[HIGH_FREQ_TOOL_1]": { "defer_loading": false },
        "[HIGH_FREQ_TOOL_2]": { "defer_loading": false },
        "[HIGH_FREQ_TOOL_3]": { "defer_loading": false }
      }
    }
  ]
}
```

**Sub-agent prompt**:
```
Implement Tool Search Tool for beep-effect MCP configuration.

Based on the audit in outputs/mcp-audit.md:

1. Configure mcp_toolset with defer_loading: true as default

2. Keep these tools non-deferred (top 5 from audit):
   - [list from audit]

3. Update MCP configuration files

4. Test tool discovery with sample queries:
   - "What tools can read files?"
   - "How do I query the database?"
   - "What git operations are available?"

5. Measure token usage before/after

Output: Implementation report with before/after metrics
```

### Task 3: Configure MCP Gateway (Optional Phase)

**Objective**: Centralized management + profile filtering

**Prerequisites**:
- Docker Desktop or Docker CLI with MCP plugin
- Gateway binary from GitHub releases

**Sub-agent prompt**:
```
Deploy MCP Gateway for beep-effect.

1. Install Docker MCP Gateway:
   - Download from github.com/docker/mcp-gateway/releases
   - Place in ~/.docker/cli-plugins/

2. Create task profiles:

   Profile: development
   - filesystem, git, typescript-language-server, biome

   Profile: database
   - postgresql, drizzle-orm-helper

   Profile: research
   - brave-search, web-fetch

3. Connect Claude Code:
   docker mcp client connect claude-code --global

4. Test profile switching

5. Configure resource limits:
   - CPU: 1.0 per container
   - Memory: 2GB per container

Output: Gateway deployment report with profile configurations
```

---

## Verification Commands

After implementation, run these checks:

```bash
# 1. Verify MCP configuration
cat ~/.claude/settings.json | jq '.mcpServers'

# 2. Check gateway status (if deployed)
docker mcp gateway status

# 3. Test tool search (in Claude Code session)
# Ask: "What tools are available for file operations?"
# Should return 3-5 relevant tools, not all tools

# 4. Monitor token usage
# Check Claude Code debug output for context usage
```

---

## Success Criteria

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Initial MCP context | 67,300 tokens | <10,000 tokens | API response usage |
| Tools loaded initially | 40-100 | 3-5 | Tool count in context |
| Tool search requests | N/A | 2-5 per session | usage.server_tool_use |
| Tool selection accuracy | Baseline | Maintained | Manual validation |

---

## Risk Mitigations

1. **Keep fallback configuration**: Save current MCP config before changes
2. **Test incrementally**: Enable tool search for one server first
3. **Monitor for regressions**: Watch for tool discovery failures
4. **Beta feature awareness**: Tool search may change; pin version if possible

---

## P1 Orchestrator Prompt

```
You are executing Phase 1 of the MCP Optimization Strategy for beep-effect.

Context:
- Goal: Reduce MCP context overhead from ~67,300 tokens to <10,000 tokens
- Primary method: Tool Search Tool (defer loading + on-demand discovery)
- Secondary method: MCP Gateway with profiles

Your tasks:
1. Audit current MCP configuration (Task 1)
2. Implement Tool Search Tool (Task 2)
3. Optionally configure MCP Gateway (Task 3)

Critical rules:
1. Preserve existing MCP functionality
2. Keep 3-5 high-frequency tools non-deferred
3. Test thoroughly before declaring success
4. Document before/after token measurements

Reference: specs/mcp-optimization-strategy/outputs/phase3-master-report.md

Begin with Task 1: Audit current MCP configuration.
```

---

## Notes for Next Agent

1. **Phase 3 master report** contains comprehensive implementation guidance
2. **Tool Search Tool** is the highest-impact, lowest-complexity optimization
3. **MCP Gateway** adds operational value but is optional for context optimization
4. **Skip Programmatic Tool Calling** - MCP tools are explicitly excluded
5. **E2B Sandboxes** only if security-critical scenarios emerge

---

## Related Files

| File | Purpose |
|------|---------|
| `outputs/phase3-master-report.md` | Complete research synthesis |
| `outputs/tool-search-report.md` | Tool Search Tool details |
| `outputs/mcp-gateway-report.md` | Gateway configuration guide |
| `REFLECTION_LOG.md` | Research methodology learnings |
| `README.md` | Spec overview and structure |

---

*Generated: 2026-01-11*
*Spec: mcp-optimization-strategy*
*Phase: P1 Implementation Handoff*
