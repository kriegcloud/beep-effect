# MCP Gateway Research Report

> Docker MCP Gateway evaluation for context window optimization and tool management.

---

## 1. Overview and Key Concepts

### What is MCP Gateway?

Docker's MCP Gateway is an open-source solution that acts as a **centralized proxy** between AI clients (like Claude Code) and MCP servers. Instead of configuring each AI application individually to connect to multiple MCP servers, the Gateway provides a **single unified endpoint** that aggregates all tool access.

### Core Architecture

```
AI Client (Claude Code)
         ↓
    MCP Gateway (single endpoint)
         ↓
    ┌────┴────┐
    ↓         ↓
Container  Container  ...
(Server A) (Server B)
```

The Gateway operates through containerization:
1. Client sends a tool request to the Gateway
2. Gateway identifies which server handles that tool
3. Gateway launches the server as an isolated Docker container (if not running)
4. Gateway injects credentials and applies security restrictions
5. Request is forwarded; response returns through the Gateway

### Key Capabilities

| Capability | Description |
|-----------|-------------|
| **Server Aggregation** | Multiple MCP servers exposed through single endpoint |
| **Tool Filtering/Profiles** | Scope which tools different clients see |
| **Container Isolation** | Each MCP server runs in isolated Docker container |
| **Credential Management** | Centralized secrets injection at runtime |
| **Lifecycle Management** | On-demand container startup/shutdown |
| **Security Controls** | Restricted privileges, network access, resource limits |
| **Logging/Tracing** | Built-in observability for all tool calls |

---

## 2. How It Works

### Server Lifecycle Management

The Gateway manages the complete lifecycle of MCP servers:

```bash
# Enable a server from the catalog
docker mcp server enable brave-search

# Connect Claude Code to the gateway
docker mcp client connect claude-code --global

# Run the gateway
docker mcp gateway run
```

### Tool Routing

When an AI application requests a tool:
1. Gateway maintains a registry of available tools and their MCP server endpoints
2. Gateway looks up which server handles the requested tool
3. If the server container isn't running, Gateway starts it
4. Credentials are injected only into the target container at runtime
5. Request is routed to the appropriate container
6. Response returns through the Gateway

### Configuration Files

| File | Purpose |
|------|---------|
| `docker-mcp.yaml` | Server catalog definitions |
| `registry.yaml` | Enabled server registry |
| `config.yaml` | Per-server runtime configuration |
| `tools.yaml` | Enabled tools per server |

### Integration with Claude Code

Integration uses the `CLAUDE_CONFIG_DIR` environment variable:

```bash
# Connect gateway to Claude Code globally
docker mcp client connect claude-code --global

# This updates $CLAUDE_CONFIG_DIR/.claude.json
```

---

## 3. Context Window Impact Analysis

### Does MCP Gateway Reduce Context Window Overhead?

**Short Answer: No direct reduction.**

The MCP Gateway does **not** reduce the number of tool definitions sent to the LLM. Here's why:

| What Gateway Does | What Gateway Does NOT Do |
|-------------------|-------------------------|
| Aggregates multiple servers into one endpoint | Reduce tool definition tokens |
| Manages container lifecycle | Implement dynamic/lazy tool loading |
| Centralizes credential management | Filter tool definitions based on context |
| Provides security isolation | Optimize tool descriptions for token efficiency |

### The Core Problem Remains

According to research, MCP tools consume significant context:
- 66,000+ tokens observed for tool definitions alone
- This represents ~33% of Claude's 200k token window
- Every tool definition permanently consumes context space

**The Gateway merely changes WHERE tools come from, not HOW MANY tool definitions are sent to the model.**

### What the Gateway Actually Helps With

| Benefit | Context Impact |
|---------|----------------|
| **Profile Filtering** | Can limit tools per session, reducing definitions |
| **Single Configuration Point** | Easier to manage which tools are available |
| **Selective Server Enablement** | `docker mcp server enable/disable` controls tool availability |

The profile filtering capability is the key feature for context optimization:

> "If I have 30 servers, can I scope what a given client sees? Yes. Choose the servers per Gateway run, then filter tools, prompts, and resources so the client only gets the subset you want."

---

## 4. Usage Recommendations for beep-effect

### When to Use MCP Gateway

| Use Case | Recommendation |
|----------|---------------|
| Managing multiple MCP servers | **Recommended** - centralized control |
| Security isolation needs | **Recommended** - container-based isolation |
| Credential management | **Recommended** - secrets injected at runtime |
| Production MCP deployments | **Recommended** - enterprise-ready observability |
| Direct context window reduction | **Not applicable** - doesn't reduce token usage |

### When NOT to Use MCP Gateway

| Scenario | Reason |
|----------|--------|
| Simple single-server setups | Overhead not justified |
| Token optimization focus | Gateway doesn't reduce tool definition tokens |
| Dynamic tool loading needs | Gateway loads all enabled tools statically |

### Practical Integration Strategy

For beep-effect, a hybrid approach would be most effective:

1. **Use Gateway for Infrastructure Management**
   - Container isolation for untrusted MCP servers
   - Centralized credential management
   - Audit logging for tool calls

2. **Use Profiles for Context Optimization**
   - Create task-specific profiles (e.g., "coding", "research", "database")
   - Each profile enables only relevant servers/tools
   - Reduces tool definitions loaded per session

3. **Combine with Other Optimization Techniques**
   - Dynamic toolsets (search_tools -> describe_tools -> execute_tool)
   - Tool consolidation (merge related tools with parameters)
   - Description trimming (concise tool descriptions)

### Example Profile Strategy

```yaml
# Profile: "development" - core coding tools only
servers:
  - filesystem
  - git
  - typescript-language-server

# Profile: "research" - web and documentation tools
servers:
  - brave-search
  - web-fetch
  - documentation-mcp

# Profile: "database" - database operations
servers:
  - postgresql
  - sql-analyzer
```

---

## 5. Implementation Considerations

### Docker Desktop Integration

For Docker Desktop users, the Gateway runs automatically when MCP Toolkit is enabled:
- No manual configuration required
- Access via Docker Desktop GUI
- Servers enabled through catalog browser

### CLI-Based Setup

For Docker Engine (without Desktop):

```bash
# 1. Download the binary from GitHub releases
# Place in ~/.docker/cli-plugins/

# 2. Enable desired servers
docker mcp server enable brave-search
docker mcp server enable filesystem

# 3. Connect Claude Code
docker mcp client connect claude-code --global

# 4. Run the gateway
docker mcp gateway run --port 8080 --transport streaming
```

### Resource Limits

The Gateway enforces container resource limits:
- **CPU**: 1 CPU per MCP tool container
- **Memory**: 2 GB per container
- **Network**: Restricted by default
- **Privileges**: Minimal host access

### Security Considerations

| Security Feature | Benefit |
|-----------------|---------|
| Container isolation | Compromised server can't affect host |
| Credential scoping | Secrets only visible to target container |
| Provenance verification | Supply-chain validation before execution |
| SBOM checks | Vulnerability scanning via Docker Scout |
| Audit logging | Full visibility of tool invocations |

### Comparison with Other Gateway Solutions

| Feature | Docker MCP Gateway | Microsoft MCP Gateway | IBM ContextForge |
|---------|-------------------|----------------------|------------------|
| Focus | Container orchestration | Kubernetes scaling | Federation/registry |
| Tool routing | Server-based | Dynamic registration | Multi-transport |
| Best for | Local dev + prod | Enterprise K8s | Multi-cluster |

---

## 6. Key Findings Summary

### Direct Context Window Benefits

**Minimal.** The Gateway doesn't fundamentally change how tool definitions are sent to the LLM. All enabled tools' definitions still consume context space.

### Indirect Optimization Opportunities

1. **Profile Filtering**: Create task-specific profiles to load only relevant tools
2. **Server Management**: Easily enable/disable servers to control available tools
3. **Single Configuration**: Manage tool availability from one place

### Recommended Strategy for beep-effect

1. **Adopt Gateway for operational benefits** (security, logging, credential management)
2. **Create task-specific profiles** to reduce per-session tool count
3. **Combine with dynamic toolset patterns** for maximum context savings
4. **Consolidate tools** where possible to reduce definition count

### Context Reduction Estimate

| Strategy | Estimated Reduction |
|----------|-------------------|
| Gateway alone | 0% (no direct reduction) |
| Gateway + Profiles | 30-50% (fewer tools per session) |
| Gateway + Profiles + Tool Consolidation | 50-70% |
| Gateway + Dynamic Toolsets | 80-95% (load tools on-demand) |

---

## Sources

- [MCP Gateway - Docker Docs](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [AI Guide to the Galaxy: MCP Toolkit and Gateway, Explained - Docker Blog](https://www.docker.com/blog/mcp-toolkit-gateway-explained/)
- [Docker MCP Gateway - GitHub](https://github.com/docker/mcp-gateway)
- [Add MCP Servers to Claude Code with MCP Toolkit - Docker Blog](https://www.docker.com/blog/add-mcp-servers-to-claude-code-with-mcp-toolkit/)
- [Reducing MCP Token Usage by 100x - Speakeasy](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
- [Optimising MCP Server Context Usage in Claude Code - Scott Spence](https://scottspence.com/posts/optimising-mcp-server-context-usage-in-claude-code)
- [Microsoft MCP Gateway - GitHub](https://github.com/microsoft/mcp-gateway)
- [MCP Context Forge - IBM](https://ibm.github.io/mcp-context-forge/)
- [The MCP Gateway: Enabling Secure and Scalable Enterprise AI Integration - InfraCloud](https://www.infracloud.io/blogs/mcp-gateway/)
