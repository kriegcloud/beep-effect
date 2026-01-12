# E2B Sandboxes Research Report

> Research findings on Docker e2b sandboxes for MCP optimization in the beep-effect codebase.

---

## 1. Overview and Key Concepts

### What are E2B Sandboxes?

E2B (pronounced "etb") sandboxes are cloud-based secure execution environments for AI agents. They provide isolated Firecracker micro-VMs where AI-generated code can safely run without risking host system security. The platform allows agents to:

- Install packages
- Write files
- Run terminal commands
- Execute AI-generated code
- Access external services through MCP tools

### Docker Partnership

Docker and E2B have partnered to integrate the Docker MCP Catalog (200+ curated tools) directly into E2B sandboxes. This partnership provides:

| Component | Provider | Function |
|-----------|----------|----------|
| Code Execution Isolation | E2B | Sandboxed micro-VM execution environment |
| Tool Access Security | Docker | MCP Gateway with curated, audited tools |
| Tool Catalog | Docker | 200+ pre-verified MCP tools (GitHub, Notion, Stripe, etc.) |

### Model Context Protocol (MCP)

MCP is an open standard for connecting AI models to external tools and data sources. Each MCP server exposes a set of tools that AI agents can invoke, enabling real-world interactions through a standardized interface.

---

## 2. How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     E2B Sandbox (Firecracker microVM)       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Docker MCP Gateway (localhost)                       │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │ GitHub  │ │ Notion  │ │ Stripe  │ │ 197+ more   │  │  │
│  │  │   MCP   │ │   MCP   │ │   MCP   │ │   MCPs      │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ▲                                  │
│                           │ HTTP + Bearer Token              │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │              Agent Code Execution Area                 │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ Sandbox URL (external access)
                           │
              ┌────────────┴────────────┐
              │     Claude / AI Agent    │
              └─────────────────────────┘
```

### Sandbox Creation Flow

1. **Specify MCP tools** during sandbox creation with required credentials
2. **E2B launches** MCP tools as Docker containers inside the sandbox
3. **Gateway URL + Token** are generated for authenticated access
4. **Agent connects** via HTTP transport with bearer token authentication
5. **Code executes** in isolated environment with tool access

### Implementation Example (TypeScript)

```typescript
import { Sandbox } from "e2b";

const sandbox = await Sandbox.create({
  mcp: {
    browserbase: { apiKey: process.env.BROWSERBASE_API_KEY },
    github: { token: process.env.GITHUB_TOKEN },
    notion: { apiKey: process.env.NOTION_API_KEY }
  }
});

// Get connection details
const mcpUrl = sandbox.getMcpUrl();
const mcpToken = sandbox.getMcpToken();

// Agent can now use tools via HTTP
```

### Key Technical Details

| Aspect | Specification |
|--------|---------------|
| Underlying Technology | Firecracker micro-VMs |
| Cold Start Time | Under 200 milliseconds |
| Container Runtime | Docker containers inside sandbox |
| Access Modes | Internal (localhost) + External (sandbox URL) |
| Authentication | Bearer token via HTTP Authorization header |

---

## 3. Context Window Impact Analysis

### The Core Problem: MCP Token Overhead

Based on extensive research, MCP tools consume significant context window space:

| Setup | Tool Count | Token Overhead |
|-------|------------|----------------|
| Typical 5-server setup | 58 tools | ~55,000 tokens |
| Heavy MCP usage | 100+ tools | ~134,000 tokens |
| GitHub MCP alone | 27 tools | ~18,000 tokens |
| 3 MCP servers (filesystem, git, gateway) | ~40 tools | ~42,600 tokens |

**Critical Finding**: Tool definitions can consume 50%+ of Claude's context window before any actual work begins.

### Does E2B Reduce Context Window Load?

**Direct Answer: No, e2b sandboxes do not inherently reduce context window overhead.**

E2B sandboxes address **execution security**, not **context optimization**. The same tool definitions still need to be loaded into the AI agent's context for it to know what tools are available.

However, sandboxes enable patterns that CAN reduce context usage:

### Indirect Context Benefits

1. **Code Execution Pattern**
   - Instead of loading all tool definitions, present tools as code APIs
   - Agents discover tools by exploring filesystem on-demand
   - **Benchmark**: 150,000 tokens reduced to 2,000 tokens (98.7% reduction)

2. **Context-Efficient Filtering**
   - Data processing happens in sandbox before returning to model
   - Example: Filter 10,000 spreadsheet rows to 5 visible rows IN the sandbox
   - Prevents intermediate result duplication in context

3. **Control Flow Efficiency**
   - Loops, conditionals, and error handling execute directly
   - No context-consuming model iteration for procedural logic

### E2B Context Impact Summary

| Factor | Impact on Context Window |
|--------|-------------------------|
| Tool definitions | No reduction - still loaded into context |
| Intermediate data | Reduced - filtering happens in sandbox |
| Execution results | Potentially reduced - controlled data return |
| Tool discovery | Enables on-demand patterns (via code execution) |
| Overall | Indirect benefits only, not direct reduction |

---

## 4. Usage Recommendations for beep-effect

### When to Use E2B Sandboxes

**Use Cases That Benefit Most**:

1. **Multi-service workflows**
   - Orchestrating GitHub + Notion + Stripe operations
   - Cross-platform data aggregation
   - CI/CD automation with external service integration

2. **Secure code execution**
   - Running AI-generated Effect code safely
   - Testing database migrations in isolation
   - Executing untrusted user scripts

3. **Data-intensive operations**
   - Processing large datasets before returning results
   - Filtering/transforming data outside the context window
   - Document parsing and extraction

**Use Cases Where E2B Adds Little Value**:

- Simple read-only queries
- Single-tool operations
- Operations that don't require external service access
- Tasks where local execution is sufficient

### Integration Strategy for beep-effect

Given beep-effect's architecture (Effect Platform, Next.js 16, PostgreSQL), E2B could be valuable for:

| Scenario | Benefit | Priority |
|----------|---------|----------|
| AI-generated SQL execution | Sandboxed database testing | Medium |
| External API orchestration | Secure multi-service workflows | Low |
| Code generation testing | Safe Effect code execution | Medium |
| Document processing | Filter large documents before context | High |

### NOT Recommended for Direct Context Optimization

E2B sandboxes should not be adopted primarily for context window optimization. Better alternatives exist:

1. **Tool Search Tool** - Dynamic tool discovery (85% token reduction)
2. **Lazy-load MCP definitions** - Load only when needed
3. **Tool consolidation** - Reduce tool count through unified interfaces (60% reduction demonstrated)

---

## 5. Implementation Considerations

### Security Model

E2B provides a two-layer security model:

```
Layer 1: E2B Sandbox
├── Firecracker micro-VM isolation
├── Restricted network access (configurable)
├── Resource limits
└── Ephemeral environment

Layer 2: Docker MCP Gateway
├── Curated tool catalog
├── Automatic vulnerability scanning
├── Malicious behavior detection
└── Token management
```

### Operational Requirements

| Requirement | Details |
|-------------|---------|
| SDK Installation | `npm install e2b@latest` or `pip install e2b` |
| Authentication | E2B API key + per-tool credentials |
| Latency | ~200ms cold start + network overhead |
| Cost | Pay-per-use cloud sandbox execution |
| Persistence | Ephemeral by default; stateless execution |

### Integration with Claude Code

E2B provides direct integration paths:

```bash
# Connect Claude CLI to E2B sandbox MCP gateway
claude --mcp-url "$SANDBOX_MCP_URL" --mcp-token "$SANDBOX_MCP_TOKEN"
```

### Potential Challenges

1. **Latency**: Network round-trips to cloud sandbox add overhead
2. **State Management**: Sandboxes are ephemeral; state must be externalized
3. **Cost**: Cloud execution has per-second billing implications
4. **Complexity**: Additional infrastructure layer to manage
5. **Debugging**: Remote execution complicates troubleshooting

---

## 6. Key Findings and Recommendations

### Summary

| Question | Answer |
|----------|--------|
| Does E2B reduce context window load? | Not directly |
| Does E2B improve execution security? | Yes, significantly |
| Should beep-effect adopt E2B? | Only for specific use cases |
| Best approach for context optimization? | Tool Search Tool + lazy loading |

### Recommendations for beep-effect

1. **Do NOT adopt E2B primarily for context optimization**
   - Focus on Tool Search Tool and lazy-loading patterns instead
   - These provide 85%+ token reduction without infrastructure overhead

2. **Consider E2B for security-critical scenarios**
   - AI-generated code execution
   - Multi-service orchestration with sensitive credentials
   - Untrusted data processing

3. **Investigate Code Execution Pattern**
   - Present MCP tools as code APIs (filesystem-based discovery)
   - This pattern works with OR without E2B sandboxes
   - Provides the most significant context reduction (98.7%)

4. **Short-term: Focus on tool consolidation**
   - Reduce redundant tool definitions
   - Standardize parameter naming
   - Streamline tool descriptions
   - Expected benefit: 60% reduction

---

## Sources

- [E2B sandboxes | Docker Docs](https://docs.docker.com/ai/mcp-catalog-and-toolkit/e2b-sandboxes/)
- [Docker + E2B: Building the Future of Trusted AI | Docker](https://www.docker.com/blog/docker-e2b-building-the-future-of-trusted-ai/)
- [MCP Gateway | E2B Documentation](https://e2b.dev/docs/mcp)
- [Docker & E2B Partner to Introduce MCP Support | E2B Blog](https://e2b.dev/blog/docker-e2b-partner-to-introduce-mcp-support-in-e2b-sandbox)
- [Code Execution with MCP | Anthropic Engineering](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [Optimising MCP Server Context Usage in Claude Code | Scott Spence](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code)
- [Lazy-load MCP tool definitions | GitHub Issue #11364](https://github.com/anthropics/claude-code/issues/11364)
- [The Hidden Cost of MCPs and Custom Instructions | Self-Service BI](https://selfservicebi.co.uk/analytics%20edge/improve%20the%20experience/2025/11/23/the-hidden-cost-of-mcps-and-custom-instructions-on-your-context-window.html)
- [E2B | The Enterprise AI Agent Cloud](https://e2b.dev/)
- [E2B MCP Server | GitHub](https://github.com/e2b-dev/mcp-server)

---

*Generated: 2026-01-11*
*Research Agent: web-researcher*
*Spec: mcp-optimization-strategy Phase 3*
