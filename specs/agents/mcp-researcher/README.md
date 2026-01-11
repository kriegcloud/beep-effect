# MCP Researcher Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/mcp-researcher.md` (300-400 lines)

---

## Purpose

Create a specialized agent for researching Effect documentation via MCP tools, extracting relevant patterns, and synthesizing recommendations for specific use cases in the beep-effect codebase.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- Effect documentation search via MCP
- Pattern extraction from Effect docs
- Codebase integration recommendations
- Code examples aligned with repository patterns

### Out of Scope
- Non-Effect library research (use web-researcher)
- Modifying Effect library code
- Creating new Effect modules

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/mcp-researcher.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 300-400 lines
- [ ] Uses `mcp__effect_docs__effect_docs_search` and `mcp__effect_docs__get_effect_doc` tools
- [ ] Code examples follow Effect patterns (namespace imports)
- [ ] Output format compatible with spec workflow
- [ ] Tested with sample Effect pattern research

---

## Agent Capabilities

### Core Functions
1. **Search Effect Docs** - Find relevant documentation via MCP search
2. **Retrieve Details** - Get full documentation for specific topics
3. **Extract Patterns** - Identify code patterns and best practices
4. **Synthesize** - Create beep-effect-specific recommendations

### Knowledge Sources
- Effect documentation (via MCP tools)
- `documentation/EFFECT_PATTERNS.md`
- Existing Effect usage in codebase
- `.claude/rules/effect-patterns.md`

### MCP Tools
```typescript
// Search for Effect documentation
mcp__effect_docs__effect_docs_search({ query: "Layer composition" })

// Get detailed documentation
mcp__effect_docs__get_effect_doc({ documentId: 123, page: 1 })
```

### Output Format
```markdown
# Effect Patterns Research: [Topic]

## Relevant Modules
- `effect/Module` - Purpose and use cases

## Documentation Findings
### Pattern: [Name]
[Code example from Effect docs]

## Codebase Integration
[How to apply patterns in beep-effect]

## Critical Rules
[Effect-specific constraints to follow]
```

---

## Research Phase

Before creating the agent definition, research:

### 1. MCP Tool Capabilities
- Search query syntax
- Document retrieval pagination
- Available documentation coverage

### 2. Effect Module Reference
- Core modules: Effect, Layer, Context, Cause
- Schema: S.Struct, S.Array, S.TaggedError
- Utilities: A (Array), O (Option), Match

### 3. Existing Effect Patterns
- Read `documentation/EFFECT_PATTERNS.md`
- Review `.claude/rules/effect-patterns.md`
- Check existing agents like `effect-researcher.md`

---

## Implementation Plan

### Phase 1: Research
1. Test MCP tools with sample queries
2. Document query patterns that work well
3. Review existing Effect patterns in codebase
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design research methodology
2. Define output format with examples
3. Create Effect module quick reference
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Validate MCP tool references
3. Test with sample Effect research
4. Output: `.claude/agents/mcp-researcher.md`

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/effect-researcher.md`

### MCP Tools
- `mcp__effect_docs__effect_docs_search`
- `mcp__effect_docs__get_effect_doc`

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/mcp-researcher.md
wc -l .claude/agents/mcp-researcher.md

# Verify Effect patterns in examples
grep -i "import \* as Effect" .claude/agents/mcp-researcher.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [web-researcher](../web-researcher/README.md) - General web research agent
