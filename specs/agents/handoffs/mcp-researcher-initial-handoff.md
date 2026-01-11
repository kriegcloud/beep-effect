# MCP Researcher Agent — Initial Handoff

> **Priority**: Tier 2 (Research)
> **Spec Location**: `specs/agents/mcp-researcher/README.md`
> **Target Output**: `.claude/agents/mcp-researcher.md` (300-400 lines)

---

## Mission

Create the **mcp-researcher** agent — an Effect documentation specialist that uses MCP tools to search and retrieve Effect library documentation, extracting patterns and synthesizing codebase-specific recommendations.

---

## Critical Constraints

1. **NEVER use `async/await`** — All examples must use `Effect.gen`
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **NEVER use named imports from Effect** — Use `import * as Effect from "effect/Effect"`
4. **Agent definition must be 300-400 lines**
5. **All code examples must align with `.claude/rules/effect-patterns.md`**

---

## Phase 1: Research (Read-Only)

### Task 1.1: Test MCP Tools

**Execute MCP searches to understand capabilities**:

```typescript
// Search for common topics
mcp__effect_docs__effect_docs_search({ query: "Layer composition" })
mcp__effect_docs__effect_docs_search({ query: "Schema TaggedError" })
mcp__effect_docs__effect_docs_search({ query: "Effect.gen" })

// Retrieve a document
mcp__effect_docs__get_effect_doc({ documentId: [from search], page: 1 })
```

**Document**:
- Search query syntax that works well
- Document pagination behavior
- Coverage of Effect modules

### Task 1.2: Study Effect Pattern Rules

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`

**Extract**:
- Required namespace imports
- Alias table (A, O, S, etc.)
- Forbidden patterns
- PascalCase constructor rules

### Task 1.3: Review Existing Effect Researcher

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/effect-researcher.md`

**Extract**:
- How it structures research methodology
- Output format
- Integration with codebase patterns

### Task 1.4: Study Agent Template

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

### Output: `specs/agents/mcp-researcher/outputs/research-findings.md`

```markdown
# MCP Researcher Research Findings

## MCP Tool Capabilities
### effect_docs_search
[Query syntax, result format]

### get_effect_doc
[Pagination, content structure]

## Effect Pattern Rules
[Namespace imports, aliases, forbidden patterns]

## Reference Agent Analysis
[What works well in effect-researcher.md]

## Key Modules Quick Reference
| Module | Alias | Common Use |
|--------|-------|------------|
| effect/Effect | Effect | Core runtime |
| effect/Layer | Layer | Dependency injection |
| effect/Schema | S | Validation |
| effect/Array | A | Array operations |
| effect/Option | O | Optional values |
```

---

## Phase 2: Design

### Task 2.1: Design Research Methodology

1. **Query Formulation** — How to create effective MCP search queries
2. **Result Triage** — How to identify relevant documents
3. **Pattern Extraction** — How to pull code patterns from docs
4. **Codebase Integration** — How to adapt patterns to beep-effect style

### Task 2.2: Define Output Format

```markdown
# Effect Patterns Research: [Topic]

## Search Queries Used
- "query 1" → [N results, relevance notes]
- "query 2" → [N results, relevance notes]

## Relevant Modules
| Module | Purpose | Documentation ID |
|--------|---------|-----------------|

## Documentation Findings

### Pattern: [Name]
**Source**: Effect docs [documentId]
**Official Example**:
```typescript
[Code from Effect docs]
```

**Beep-Effect Adaptation**:
```typescript
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
// Adapted for repository patterns
```

## Critical Rules
[Effect-specific constraints to follow]

## Integration Recommendations
[How to apply in beep-effect codebase]
```

### Task 2.3: Create Module Quick Reference

Build a quick-lookup table:

```markdown
## Effect Module Reference

### Core
| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Effect | Effect | gen, succeed, fail, map, flatMap |
| effect/Layer | Layer | succeed, effect, merge, provide |
| effect/Context | Context | GenericTag, make |
| effect/Cause | Cause | pretty, squash, failures |

### Data
| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Array | A | map, filter, findFirst, partition |
| effect/Option | O | some, none, getOrElse, map |
| effect/Record | R | map, filter, keys, values |

### Schema
| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Schema | S | Struct, Array, String, TaggedError |
| effect/SchemaAST | AST | annotations, getIdentifier |
```

### Output: `specs/agents/mcp-researcher/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/mcp-researcher.md`:

```markdown
---
description: Effect documentation researcher using MCP tools for pattern discovery
tools: [mcp__effect_docs__effect_docs_search, mcp__effect_docs__get_effect_doc, Read]
---

# MCP Researcher Agent

[Purpose statement]

## MCP Tools Reference

### effect_docs_search
[Syntax and usage]

### get_effect_doc
[Pagination and retrieval]

## Methodology

### Step 1: Query Formulation
[How to create effective searches]

### Step 2: Document Retrieval
[How to navigate paginated results]

### Step 3: Pattern Extraction
[What to extract from docs]

### Step 4: Codebase Integration
[How to adapt to beep-effect patterns]

## Effect Module Quick Reference
[Table of modules with aliases]

## Output Format
[Structure]

## Examples
[Sample research task and output]
```

### Task 3.2: Include Effect Pattern Enforcement

Ensure all code examples in agent definition:
- Use namespace imports (`import * as Effect from "effect/Effect"`)
- Use correct aliases (S, A, O, etc.)
- Never use async/await
- Never use native methods

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/mcp-researcher.md
wc -l .claude/agents/mcp-researcher.md

# Verify no async/await
grep -i "async\|await" .claude/agents/mcp-researcher.md && echo "FAIL" || echo "PASS"

# Verify namespace imports
grep "import \* as Effect" .claude/agents/mcp-researcher.md

# Verify MCP tool references
grep "mcp__effect_docs" .claude/agents/mcp-researcher.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/mcp-researcher.md`
- [ ] Length is 300-400 lines
- [ ] Follows template structure with frontmatter
- [ ] Uses MCP tools correctly
- [ ] Includes Effect module quick reference
- [ ] All examples use Effect patterns
- [ ] Tested with sample Effect research

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the mcp-researcher agent creation spec.

Your goal: Create `.claude/agents/mcp-researcher.md` (300-400 lines) — an Effect documentation researcher using MCP tools.

CRITICAL RULES:
1. All code examples MUST use namespace imports
2. All code examples MUST use Effect.gen (no async/await)
3. All arrays/strings MUST use Effect utilities (A.map, Str.split)

PHASE 1 - Research:
1. Test MCP tools with sample searches (Layer, Schema, Effect.gen)
2. Read documentation/EFFECT_PATTERNS.md
3. Read .claude/rules/effect-patterns.md
4. Read .claude/agents/effect-researcher.md
5. Output to specs/agents/mcp-researcher/outputs/research-findings.md

PHASE 2 - Design:
1. Design research methodology
2. Create Effect module quick reference table
3. Define output format
4. Output to specs/agents/mcp-researcher/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/mcp-researcher.md
2. Include MCP tool examples
3. Include module reference table
4. Test with sample research (e.g., "How to use Effect.retry?")

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1.
```
