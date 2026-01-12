# Tool Search Tool - Research Report

## 1. Overview and Key Concepts

The **Tool Search Tool** is an Anthropic API feature (currently in public beta) that enables Claude to work with hundreds or thousands of tools by dynamically discovering and loading them on-demand. Rather than loading all tool definitions into the context window upfront, Claude searches a tool catalog and loads only the tools it needs.

### Core Problem Being Solved

1. **Context Efficiency**: Tool definitions consume significant context window space (50 tools is roughly 10-20K tokens), leaving less room for actual work
2. **Tool Selection Accuracy**: Claude's ability to correctly select tools degrades significantly when more than 30-50 tools are conventionally available

### Key Terminology

| Term | Definition |
|------|------------|
| Tool Catalog | The complete set of tool definitions provided to the API, including deferred tools |
| Deferred Loading | Tools marked with `defer_loading: true` are not loaded into context until discovered |
| Tool Reference | A lightweight pointer to a tool that gets expanded to full definition when needed |
| Server Tool Use | A tool invocation handled server-side by Anthropic (tool search is a server tool) |

---

## 2. How It Works

### Search Variants

Two search algorithms are available:

| Variant | Type Identifier | Query Format |
|---------|----------------|--------------|
| Regex | `tool_search_tool_regex_20251119` | Python `re.search()` regex patterns (max 200 chars) |
| BM25 | `tool_search_tool_bm25_20251119` | Natural language queries |

### Workflow

1. Include a tool search tool in the `tools` array
2. Provide all tool definitions with `defer_loading: true` for tools that should not load immediately
3. Claude initially sees only the tool search tool and non-deferred tools
4. When Claude needs additional tools, it searches using the tool search tool
5. The API returns 3-5 most relevant `tool_reference` blocks
6. These references are automatically expanded into full tool definitions
7. Claude selects from discovered tools and invokes them

### API Configuration

```json
{
  "tools": [
    {
      "type": "tool_search_tool_regex_20251119",
      "name": "tool_search_tool_regex"
    },
    {
      "name": "get_weather",
      "description": "Get weather for a location",
      "input_schema": { ... },
      "defer_loading": true
    }
  ]
}
```

### Beta Headers Required

| Provider | Beta Header | Supported Models |
|----------|-------------|------------------|
| Claude API / Microsoft Foundry | `advanced-tool-use-2025-11-20` | Claude Opus 4.5, Claude Sonnet 4.5 |
| Google Cloud Vertex AI | `tool-search-tool-2025-10-19` | Claude Opus 4.5, Claude Sonnet 4.5 |
| Amazon Bedrock | `tool-search-tool-2025-10-19` | Claude Opus 4.5 only |

---

## 3. Context Window Impact Analysis

### Quantitative Impact

| Scenario | Tokens Consumed | Notes |
|----------|----------------|-------|
| 50 tools loaded conventionally | ~10,000-20,000 tokens | All definitions in context |
| 50 tools with tool search | ~1,000-2,000 tokens initially | Only search tool + 3-5 frequently used tools |
| Per-search overhead | Minimal | Returns 3-5 tool references, expanded on-demand |

### What Gets Searched

The tool search indexes:
- Tool names
- Tool descriptions
- Argument names
- Argument descriptions

### Context Savings Formula

```
Savings = (N - K) * avg_tool_tokens

Where:
  N = total tools in catalog
  K = non-deferred tools (recommended: 3-5 most used)
  avg_tool_tokens = average tokens per tool definition (~200-400)
```

**Example**: 100 tools, 5 non-deferred, 300 tokens/tool average
- Traditional: 30,000 tokens
- With tool search: 1,500 tokens initially + ~1,200 tokens per search (4 tools returned)
- Net savings: 25,000-28,000 tokens

### Accuracy Improvement

Beyond context savings, tool search improves selection accuracy. Claude's tool selection degrades with more than 30-50 conventional tools. Tool search maintains high accuracy even with thousands of tools by presenting only relevant options.

---

## 4. Usage Recommendations for beep-effect

### When to Use Tool Search

**Recommended for beep-effect if:**
- MCP servers provide 10+ tools combined
- Tool definitions consume >10K tokens
- Building systems that integrate multiple MCP servers
- Tool library is expected to grow over time

**May not be needed if:**
- Less than 10 tools total across all MCP servers
- All tools are frequently used in every conversation
- Tool definitions are very small (<100 tokens total)

### MCP Integration Pattern

Tool search integrates directly with MCP servers using `mcp_toolset`:

```json
{
  "tools": [
    {
      "type": "tool_search_tool_regex_20251119",
      "name": "tool_search_tool_regex"
    },
    {
      "type": "mcp_toolset",
      "mcp_server_name": "database-server",
      "default_config": {
        "defer_loading": true
      },
      "configs": {
        "frequently_used_tool": {
          "defer_loading": false
        }
      }
    }
  ]
}
```

### Recommended Configuration Strategy

1. **Keep 3-5 most frequently used tools non-deferred** - These load immediately for common operations
2. **Defer everything else** - Specialized tools load on-demand
3. **Write descriptive tool names and descriptions** - Search quality depends on good metadata
4. **Add a system prompt section** describing available tool categories

---

## 5. Implementation Considerations

### Limits

| Constraint | Value |
|------------|-------|
| Maximum tools in catalog | 10,000 |
| Search results per query | 3-5 tools |
| Regex pattern length | 200 characters |
| Supported models | Sonnet 4.5+, Opus 4.5+ (no Haiku) |

### Custom Tool Search Implementation

You can implement your own search logic (embeddings, semantic search) by returning `tool_reference` blocks:

```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_your_tool_id",
  "content": [
    { "type": "tool_reference", "tool_name": "discovered_tool_name" }
  ]
}
```

This enables advanced search algorithms while maintaining API compatibility.

### Compatibility Notes

- **NOT compatible with tool use examples** - Cannot provide example tool calls when using tool search
- **Works with prompt caching** - Add `cache_control` breakpoints for multi-turn optimization
- **Works with streaming** - Tool search events stream normally
- **Works with batch API** - Same pricing as regular API requests

### Error Handling

Key errors to handle:
- `invalid_pattern` - Malformed regex (regex variant only)
- `pattern_too_long` - Exceeds 200 character limit
- `too_many_requests` - Rate limit exceeded
- 400 error if all tools are deferred (at least one must be non-deferred)

### Monitoring

Usage tracked in response:

```json
{
  "usage": {
    "server_tool_use": {
      "tool_search_requests": 2
    }
  }
}
```

---

## 6. Relevance to MCP Optimization Strategy

### High Applicability

Tool search directly addresses MCP optimization concerns:

1. **Reduced initial context consumption** - MCP servers with many tools no longer bloat the context
2. **Scalability** - Can integrate multiple MCP servers without tool count becoming a bottleneck
3. **Maintained accuracy** - Tool selection quality stays high even as tool count grows

### Integration Approach for beep-effect

Given beep-effect uses MCP for various integrations, the recommended approach:

1. **Audit current MCP tool count** - Determine if >10 tools are exposed
2. **Identify high-frequency tools** - These should remain non-deferred
3. **Configure `mcp_toolset` with `default_config.defer_loading: true`**
4. **Override specific high-use tools** with `defer_loading: false`
5. **Monitor `tool_search_requests`** in usage metrics

### Tradeoffs vs Static Loading

| Aspect | Tool Search | Static Loading |
|--------|-------------|----------------|
| Initial context usage | Low | High (scales with tool count) |
| Per-request overhead | Search adds latency | None |
| Tool discovery | May miss tools if descriptions poor | All tools always visible |
| Complexity | Higher (beta feature, new patterns) | Simple |
| Best for | 10+ tools, growing catalogs | Small, stable tool sets |

---

## Sources

- [Anthropic Tool Search Tool Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)
- Beta headers: `advanced-tool-use-2025-11-20` (Claude API), `tool-search-tool-2025-10-19` (Vertex/Bedrock)
