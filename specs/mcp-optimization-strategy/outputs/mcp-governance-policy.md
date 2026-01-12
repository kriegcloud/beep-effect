# MCP Governance Policy

> Guidelines for managing MCP servers in the beep-effect monorepo to maintain optimal context window efficiency.

---

## Policy Objectives

1. Maintain MCP token overhead below 10,000 tokens
2. Prevent uncontrolled MCP server expansion
3. Ensure high-frequency tools remain immediately available
4. Establish clear criteria for Tool Search activation

---

## Current Configuration

| Server | Tools | Status | Token Estimate |
|--------|-------|--------|----------------|
| effect_docs | 2 | Active | ~600 |
| ide | 1 | Active | ~300 |
| shadcn | ~10 | App-specific | ~3,000 |
| **Total** | **~13** | - | **~3,900** |

**Budget Status**: Within target (<10,000 tokens)

---

## Adding New MCP Servers

### Pre-Addition Checklist

Before adding a new MCP server, complete this checklist:

- [ ] Document the server's purpose and tools
- [ ] Estimate token overhead (tools × ~300 tokens)
- [ ] Verify total overhead remains <10,000 tokens
- [ ] Identify if any tools will be high-frequency
- [ ] Update this governance document

### Approval Criteria

| Criteria | Threshold | Action |
|----------|-----------|--------|
| Single server addition | <5 tools | Add directly |
| Single server addition | 5-10 tools | Review required |
| Single server addition | >10 tools | Tool Search required |
| Total MCP tools | >10 | Activate Tool Search |
| Total MCP overhead | >10,000 tokens | Immediate optimization |

### Addition Template

```yaml
# New MCP Server Proposal
server_name: [name]
provider: [command/url]
tools_count: [number]
token_estimate: [tools × 300]
high_frequency_tools:
  - [tool_1]: [usage_pattern]
  - [tool_2]: [usage_pattern]
justification: [why this server is needed]
optimization_plan: [deferred loading strategy if applicable]
```

---

## Tool Search Activation

### Trigger Criteria

Activate Tool Search when ANY of these conditions are met:

| Condition | Threshold |
|-----------|-----------|
| Total MCP tools | >10 |
| Single server tools | >5 |
| Token overhead | >7,000 tokens |
| Context budget concerns | User-reported |

### Activation Steps

1. **Verify prerequisites**
   - Claude Opus 4.5 or Sonnet 4.5 model
   - Beta header access: `advanced-tool-use-2025-11-20`

2. **Copy configuration template**
   ```bash
   cp specs/mcp-optimization-strategy/outputs/tool-search-config-template.json \
      .claude/tool-search-config.json
   ```

3. **Update for current servers**
   - Add any new MCP servers to the configuration
   - Identify high-frequency tools (>5 agent references)
   - Set `defer_loading: false` for high-frequency tools

4. **Test activation**
   - Verify tool search returns relevant results
   - Confirm high-frequency tools load immediately
   - Measure token reduction

5. **Update audit**
   - Record before/after token usage
   - Update `mcp-audit.md` with new baseline

---

## High-Frequency Tool Designation

### Criteria for Non-Deferred Loading

A tool should have `defer_loading: false` when:

1. Referenced by ≥5 agents in the manifest
2. Used in >50% of typical sessions
3. Critical for core workflows (documentation, diagnostics)
4. Low individual token cost (<500 tokens)

### Current High-Frequency Tools

| Tool | Agent Usage | Status |
|------|-------------|--------|
| `mcp__effect_docs__effect_docs_search` | 7 | Non-deferred |
| `mcp__effect_docs__get_effect_doc` | 6 | Non-deferred |
| `mcp__ide__getDiagnostics` | Session | Non-deferred |

### Review Cadence

Review high-frequency tool designations:
- Monthly for active development periods
- Quarterly during stable periods
- Immediately after adding new MCP servers

---

## Monitoring

### Key Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Initial context tokens (MCP) | <10,000 | >15,000 |
| Tool search requests/session | <5 | >10 |
| Failed tool discoveries | 0 | >3 |

### Monitoring Commands

```bash
# Check current MCP configuration
cat ~/.claude/settings.json | jq '.mcpServers'
cat .claude/settings.json | jq '.mcpServers'

# List MCP configs in project
find . -name "*.mcp.json" -o -name ".mcp.json"

# Count tools in agent manifest
grep -c "mcp__" .claude/agents-manifest.yaml
```

---

## Exception Process

For situations requiring deviation from this policy:

1. Document the exception and rationale
2. Obtain approval from project lead
3. Set a review date (max 30 days)
4. Update this document with the exception

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-01-11 | Initial policy creation | P1 Implementation |

---

**Related Documents**:
- `mcp-audit.md`: Current configuration audit
- `tool-search-config-template.json`: Ready-to-deploy configuration
- `phase3-master-report.md`: Research synthesis

