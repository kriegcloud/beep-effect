# Programmatic Tool Calling Research Report

> Research output for MCP Optimization Strategy - Phase 3

---

## 1. Overview and Key Concepts

### What is Programmatic Tool Calling?

Programmatic tool calling is a feature (currently in public beta) that allows Claude to write code that calls tools programmatically within a code execution container, rather than requiring round trips through the model for each tool invocation.

**Key distinction from standard tool use:**

| Aspect | Standard Tool Use | Programmatic Tool Calling |
|--------|-------------------|---------------------------|
| Invocation | Claude calls tools directly, one at a time | Claude writes Python code that calls tools as functions |
| Round trips | One model sampling per tool call | Multiple tool calls in single code execution |
| Data processing | All results go into context | Results processed in code before reaching context |
| Token consumption | Full tool results consume context | Intermediate results never enter context |

### Core Mechanism

1. Claude writes Python code that invokes tools as async functions
2. Code runs in a sandboxed container via code execution
3. When a tool function is called, execution pauses and API returns a `tool_use` block
4. Developer provides tool result, code execution continues
5. **Critical**: Intermediate tool results are NOT loaded into Claude's context window
6. Only the final code execution output reaches Claude

### Model Compatibility

| Model | Tool Version |
|-------|--------------|
| Claude Opus 4.5 | `code_execution_20250825` |
| Claude Sonnet 4.5 | `code_execution_20250825` |

### Requirements

- Beta header: `"advanced-tool-use-2025-11-20"`
- Code execution tool must be enabled
- API access (not available via direct Claude chat interfaces)

---

## 2. How It Works

### The `allowed_callers` Field

Tools declare how they can be invoked:

```json
{
  "name": "query_database",
  "description": "Execute a SQL query",
  "input_schema": {...},
  "allowed_callers": ["code_execution_20250825"]
}
```

**Possible values:**
- `["direct"]` - Only Claude can call directly (default)
- `["code_execution_20250825"]` - Only callable from code execution
- `["direct", "code_execution_20250825"]` - Both modes

**Best practice**: Choose one mode per tool rather than enabling both.

### Execution Flow

```
1. User Request
     |
     v
2. Claude writes Python code with tool calls
     |
     v
3. Code execution begins in sandbox
     |
     v
4. Tool function called -> API pauses -> Returns tool_use block
     |
     v
5. Developer provides tool result
     |
     v
6. Code continues (results NOT in Claude's context)
     |
     v
7. Repeat 4-6 for each tool call
     |
     v
8. Code completes -> Final stdout/output returned to Claude
     |
     v
9. Claude processes final output and responds
```

### Container Lifecycle

- **Creation**: New container per session (or reuse existing)
- **Expiration**: ~4.5 minutes of inactivity
- **State**: Maintained across tool calls within session
- **Reuse**: Pass container ID to maintain state across requests

---

## 3. Context Window Impact Analysis

### Token Efficiency Benefits

This is the most significant finding for MCP optimization:

| Factor | Standard Tool Use | Programmatic Tool Calling |
|--------|-------------------|---------------------------|
| Tool results in context | Yes (full results) | No (only final output) |
| Intermediate processing | Consumes tokens | Zero token cost |
| Multiple tool calls | N x token cost | 1 x token cost (summary only) |

**Quantified benefit**: Calling 10 tools directly uses ~10x the tokens of calling them programmatically and returning a summary.

### What Enters Context Window

**With Programmatic Tool Calling:**
- Tool definitions (still required)
- Claude's generated code
- Final code execution result (stdout/return value)
- Claude's response

**What NEVER enters context:**
- Individual tool results
- Intermediate processing output
- Loop iterations
- Filtered/aggregated data before final output

### Context Reduction Patterns

1. **Data filtering**: Process 1000 records, return only 10 relevant ones
2. **Aggregation**: Sum/average/count data in code, return single value
3. **Early termination**: Stop processing once criteria met
4. **Conditional branching**: Choose tool based on intermediate result

### Example Impact

```python
# Scenario: Query 5 regions for sales data

# Standard tool use:
# - 5 tool calls = 5 context entries
# - All raw data enters context
# - Claude processes all data

# Programmatic tool calling:
regions = ["West", "East", "Central", "North", "South"]
results = {}
for region in regions:
    data = await query_database(f"SELECT * FROM sales WHERE region='{region}'")
    results[region] = sum(row["revenue"] for row in data)

top_region = max(results.items(), key=lambda x: x[1])
print(f"Top region: {top_region[0]} with ${top_region[1]:,}")

# Result: Only the final print statement enters context
```

---

## 4. Usage Recommendations for beep-effect

### Applicability Assessment

**High Value Use Cases for beep-effect:**

1. **Database queries with aggregation**
   - Query multiple tables
   - Aggregate/filter results in code
   - Return only relevant findings

2. **Multi-file operations**
   - Read multiple files
   - Process/compare content
   - Return summarized differences

3. **API data processing**
   - Fetch from multiple endpoints
   - Combine/transform data
   - Return synthesized result

4. **Log analysis**
   - Fetch large log volumes
   - Filter for errors/patterns
   - Return only relevant entries

### Limitations Relevant to beep-effect

**Critical limitation**: The following tools CANNOT be called programmatically:
- Web search
- Web fetch
- **Tools provided by an MCP connector**

This means programmatic tool calling **does not directly address MCP tool overhead** as MCP tools cannot be called from code execution.

### Indirect Benefits for MCP Optimization

While MCP tools cannot be called programmatically, there are indirect benefits:

1. **Reduced competition for context**: If non-MCP tools are called programmatically, more context is available for MCP tool results

2. **Hybrid workflows**: Use programmatic calling for data processing, standard calls for MCP tools

3. **Pre/post processing**: Programmatic code can prepare inputs for MCP tools or process their outputs

### Feature Incompatibilities

- Structured outputs (`strict: true`) not supported
- Cannot force programmatic calling via `tool_choice`
- `disable_parallel_tool_use: true` not supported

---

## 5. Implementation Considerations

### When to Use Programmatic Tool Calling

**Good candidates:**
- Processing large datasets where only aggregates needed
- Multi-step workflows with 3+ dependent tool calls
- Operations requiring filtering/sorting/transformation
- Tasks where intermediate data shouldn't influence reasoning
- Parallel operations across many items

**Poor candidates:**
- Single tool calls with simple responses
- Tools needing immediate user feedback
- Very fast operations (code execution overhead may exceed benefit)
- MCP-provided tools (not supported)

### Container Management

```typescript
// Reuse containers for related requests
const response1 = await client.messages.create({...});
const containerId = response1.container.id;

const response2 = await client.messages.create({
  container: containerId,  // Maintains state
  ...
});
```

### Error Handling

- Monitor `expires_at` field for container expiration
- Implement timeouts for tool execution
- Handle `TimeoutError` gracefully
- Tool errors are passed to code for handling

### Tool Design Best Practices

1. **Detailed output descriptions**: Claude deserializes results in code
2. **Return structured data**: JSON preferred for programmatic processing
3. **Keep responses concise**: Minimize processing overhead

---

## 6. Relevance to MCP Optimization Strategy

### Direct Applicability: LOW

The key finding is that **MCP connector tools cannot be called programmatically**. This significantly limits direct applicability for MCP context optimization.

### Indirect Value: MEDIUM

1. **Context budget reallocation**: Reduce non-MCP tool overhead to give MCP tools more room

2. **Complementary strategy**: Combine with other approaches:
   - Use programmatic calling for built-in tools
   - Use tool search for on-demand MCP discovery
   - Use MCP gateway for tool consolidation

3. **Future potential**: Anthropic may add MCP support in future releases

### Alternative Approaches to Consider

Given the MCP limitation, prioritize these strategies instead:

| Strategy | Direct MCP Impact | Implementation Complexity |
|----------|-------------------|---------------------------|
| Tool search tool | High - removes static definitions | Low |
| MCP gateway | High - consolidates definitions | Medium |
| Dynamic MCP registration | High - load on demand | Medium |
| Programmatic calling | Low - MCP not supported | N/A for MCP |
| e2b sandboxes | Medium - offload execution | High |

### Recommendation

**Do not prioritize programmatic tool calling for MCP optimization**. While it's a powerful feature for reducing context usage from tool results, the explicit exclusion of MCP connector tools makes it unsuitable for the primary goal of reducing MCP overhead.

**Consider for**: Non-MCP database queries, file processing, API integrations where data aggregation/filtering is valuable.

---

## Sources

- [Programmatic Tool Calling Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)
- [Code Execution Tool Documentation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool)
- [Tool Use Overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)

---

## Summary

Programmatic tool calling is a powerful feature that can significantly reduce context window consumption by allowing Claude to process tool results in code before they reach the context. However, its explicit exclusion of MCP connector tools makes it **not directly applicable** to the MCP optimization strategy.

The feature remains valuable for:
- Reducing context from non-MCP tool calls
- Multi-step workflows with built-in tools
- Data processing and aggregation scenarios

For MCP optimization specifically, prioritize:
1. Tool search tool (on-demand discovery)
2. MCP gateway (definition consolidation)
3. Dynamic MCP registration (lazy loading)
