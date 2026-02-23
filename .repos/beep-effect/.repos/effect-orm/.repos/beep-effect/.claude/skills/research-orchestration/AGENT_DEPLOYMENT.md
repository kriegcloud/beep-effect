# Agent Deployment Strategies

Configuration and strategies for deploying parallel research agents in the research-orchestration skill.

## Available Agent Types

| Subagent Type | Best For | Tools Available |
|---------------|----------|-----------------|
| `Explore` | Codebase search, file discovery, pattern finding | Glob, Grep, Read |
| `general-purpose` | Complex multi-step research, web fetching | All tools |
| `effect-researcher` | Effect-specific patterns, API research | All + Effect MCP |
| `Plan` | Architecture design, implementation planning | All tools |

## Standard Agent Configurations

### 1. Codebase Auditor

```yaml
subagent_type: Explore
thoroughness: very thorough
focus: existing implementations, patterns, structure
```

**Prompt Template:**
```
Audit the codebase for patterns related to [TOPIC]:

1. Find all files implementing similar functionality
2. Identify naming conventions used
3. Map the package structure involved
4. Note any existing utilities or helpers

Deliverables:
- File list with brief descriptions
- Pattern summary (how similar things are done)
- Package dependency graph
- Recommended files to read in detail
```

### 2. AGENTS.md Scanner

```yaml
subagent_type: Explore
thoroughness: medium
focus: package guidelines, constraints, conventions
```

**Prompt Template:**
```
Collect AGENTS.md guidelines relevant to [PACKAGES]:

1. Find all AGENTS.md files in mentioned packages
2. Extract forbidden patterns
3. Extract required patterns
4. Note any package-specific conventions

Deliverables:
- List of AGENTS.md files found
- Consolidated forbidden patterns
- Consolidated required patterns
- Package-specific notes
```

### 3. Effect Researcher

```yaml
subagent_type: effect-researcher
thoroughness: very thorough
focus: Effect idioms, API patterns, best practices
```

**Prompt Template:**
```
Research Effect patterns for [CAPABILITY]:

1. Search Effect documentation for relevant APIs
2. Identify idiomatic approaches
3. Find example implementations
4. Note any gotchas or common mistakes

Use MCP tools:
- effect_docs_search for API discovery
- get_effect_doc for detailed documentation

Deliverables:
- Relevant Effect APIs identified
- Code patterns with examples
- Best practices summary
- Common pitfalls to avoid
```

### 4. Architecture Analyst

```yaml
subagent_type: Explore
thoroughness: very thorough
focus: architectural patterns, layer boundaries, dependencies
```

**Prompt Template:**
```
Analyze architecture patterns for [COMPONENT]:

1. Map the current layer structure
2. Identify dependency directions
3. Find boundary violations (if any)
4. Document the service composition pattern

Deliverables:
- Layer diagram (text-based)
- Dependency flow
- Boundary analysis
- Improvement opportunities
```

### 5. Documentation Fetcher

```yaml
subagent_type: general-purpose
thoroughness: medium
focus: external documentation, API references
```

**Prompt Template:**
```
Fetch documentation for [LIBRARY/API]:

1. Use WebFetch to retrieve official documentation
2. Extract relevant API signatures
3. Find usage examples
4. Note version-specific considerations

Deliverables:
- API reference summary
- Code examples from docs
- Version compatibility notes
- Links to detailed documentation
```

### 6. Pattern Researcher

```yaml
subagent_type: general-purpose
thoroughness: medium
focus: industry patterns, best practices, prior art
```

**Prompt Template:**
```
Research patterns for [PROBLEM DOMAIN]:

1. Use WebSearch to find best practices
2. Identify common solutions
3. Compare approaches (pros/cons)
4. Find prior art in similar projects

Deliverables:
- Pattern options identified
- Comparison matrix
- Recommended approach with rationale
- Reference implementations
```

## Deployment Patterns

### Pattern A: Full Research (6-8 agents)

Use for: Major refactoring, new feature design, architectural changes

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel Deployment (all at once)                         │
│                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Codebase   │ │ AGENTS.md  │ │ Effect     │              │
│  │ Auditor    │ │ Scanner    │ │ Researcher │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Arch       │ │ Doc        │ │ Pattern    │              │
│  │ Analyst    │ │ Fetcher    │ │ Researcher │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Pattern B: Focused Research (3-4 agents)

Use for: Specific feature implementation, bug investigation

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel Deployment                                        │
│                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Codebase   │ │ Effect     │ │ AGENTS.md  │              │
│  │ Auditor    │ │ Researcher │ │ Scanner    │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Pattern C: External Focus (2-3 agents)

Use for: Integration with external services, new library adoption

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel Deployment                                        │
│                                                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Doc        │ │ Pattern    │ │ Codebase   │              │
│  │ Fetcher    │ │ Researcher │ │ Auditor    │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Task Tool Call Example

Deploy all agents in a **single message** with multiple Task tool calls:

```typescript
// Agent 1: Codebase Auditor
Task({
  description: "Audit codebase patterns",
  subagent_type: "Explore",
  run_in_background: true,
  prompt: `Audit codebase for [TOPIC]...`
})

// Agent 2: Effect Researcher
Task({
  description: "Research Effect patterns",
  subagent_type: "effect-researcher",
  run_in_background: true,
  prompt: `Research Effect patterns for [TOPIC]...`
})

// Agent 3: AGENTS.md Scanner
Task({
  description: "Scan package guidelines",
  subagent_type: "Explore",
  run_in_background: true,
  prompt: `Collect AGENTS.md guidelines...`
})

// ... more agents as needed
```

## Agent Output Collection

After deployment, collect results:

```typescript
// Wait for all agents (blocking)
AgentOutputTool({ agentId: "agent1", block: true })
AgentOutputTool({ agentId: "agent2", block: true })
// ... etc
```

Or check progress without blocking:

```typescript
// Non-blocking status check
AgentOutputTool({ agentId: "agent1", block: false })
```

## Handling Agent Failures

| Failure Type | Response |
|--------------|----------|
| Agent timeout | Note in synthesis, proceed with other findings |
| Empty results | Broaden search parameters, retry once |
| Conflicting info | Flag for user review, present both perspectives |
| Tool errors | Log error, continue with available data |

## Performance Guidelines

1. **Maximize parallelism**: Deploy all independent agents at once
2. **Use background mode**: `run_in_background: true` always
3. **Be specific**: Vague prompts produce vague results
4. **Set expectations**: Include deliverables list in each prompt
5. **Right-size agents**: Don't use `general-purpose` when `Explore` suffices
