# MCP Researcher Research Findings

> Phase 1 Output: Research data gathered from MCP tools, Effect patterns, and reference agents.

---

## MCP Tool Capabilities

### effect_docs_search

**Query Syntax:**
- Accepts natural language queries (e.g., "Layer composition")
- Works with specific API names (e.g., "Effect.gen", "Schema.TaggedError")
- Supports module names (e.g., "Effect.retry", "Effect acquireRelease")
- Partial matches are supported

**Result Format:**
```typescript
{
  results: Array<{
    documentId: number    // Unique ID for retrieval
    title: string         // API name or guide title
    description: string   // Brief description
  }>
}
```

**Behavior:**
- Returns up to ~50 results per query
- Results include both reference docs (API docs) and conceptual guides
- Results ordered by relevance
- Titles follow pattern: `Module.export` for APIs, descriptive for guides

**Effective Query Patterns:**
| Query Type | Example | Use Case |
|------------|---------|----------|
| API lookup | `Effect.gen` | Find specific function docs |
| Module search | `Layer composition` | Discover module patterns |
| Pattern search | `Schema TaggedError` | Find error handling patterns |
| Concept search | `Effect.retry` | Find related APIs and guides |

### get_effect_doc

**Parameters:**
- `documentId` (required): Number from search results
- `page` (optional): Page number for paginated content (default: 1)

**Result Format:**
```typescript
{
  content: string      // Full markdown documentation
  page: number         // Current page
  totalPages: number   // Total pages for document
}
```

**Content Structure:**
- Heading with module path (e.g., `# effect/Effect.gen`)
- Description of purpose and when to use
- Code examples with TypeScript
- Type signatures where applicable

**Pagination:**
- Most API docs fit in 1 page
- Guides/conceptual docs may span multiple pages
- Always check `totalPages` and iterate if needed

---

## Effect Pattern Rules

### Namespace Imports (REQUIRED)

```typescript
// Core modules - full namespace
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"
import * as Struct from "effect/Struct"
import * as Cause from "effect/Cause"
```

### Single-Letter Aliases (REQUIRED)

| Module | Alias | Common Use |
|--------|-------|------------|
| effect/Array | A | Array operations |
| effect/BigInt | BI | BigInt utilities |
| effect/Number | Num | Number operations |
| effect/Predicate | P | Type guards |
| effect/Function | F | Function utilities, pipe |
| effect/Option | O | Optional values |
| effect/Record | R | Record operations |
| effect/Schema | S | Validation, errors |
| effect/String | Str | String operations |
| effect/Brand | B | Branded types |
| effect/Boolean | Bool | Boolean operations |
| effect/SchemaAST | AST | Schema AST utilities |
| effect/DateTime | DateTime | Date/time handling |
| effect/Match | Match | Pattern matching |
| @effect/sql/Model | M | SQL model utilities |

### PascalCase Constructors (REQUIRED)

```typescript
// CORRECT - PascalCase
S.Struct({ name: S.String })
S.Array(S.Number)
S.Literal("active", "inactive")
S.Union(S.String, S.Number)

// FORBIDDEN - lowercase
S.struct({ name: S.string })  // Wrong!
S.array(S.number)              // Wrong!
```

### Forbidden Patterns

1. **No async/await** - Use `Effect.gen` instead
2. **No native array methods** - Use `A.map`, `A.filter`, etc.
3. **No native string methods** - Use `Str.split`, `Str.trim`, etc.
4. **No native Date** - Use `DateTime` from effect
5. **No switch statements** - Use `Match` for pattern matching
6. **No named imports from Effect** - Use namespace imports

### Required Patterns

```typescript
// Effect.gen for async-like flow
const program = Effect.gen(function* () {
  const value = yield* someEffect
  return value
})

// Effect Array operations
F.pipe(items, A.map((item) => item.name))
F.pipe(items, A.filter((item) => item.active))
F.pipe(items, A.findFirst((item) => item.id === id))

// Effect String operations
F.pipe(str, Str.split(" "))
F.pipe(str, Str.trim)
F.pipe(str, Str.toUpperCase)

// Tagged errors
class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { message: S.String, id: S.String }
) {}

// Pattern matching
const result = Match.value(response).pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => `Found ${r.data.length} items`),
  Match.exhaustive
)
```

---

## Reference Agent Analysis

### effect-researcher.md Structure

**Frontmatter:**
```yaml
---
name: effect-researcher
description: |
  Multi-line description with examples
model: sonnet
---
```

**Key Sections:**
1. **Knowledge Sources** - Three research channels
2. **Research Methodology** - Phase-based approach
3. **Output Formats** - Three distinct formats
4. **Effect Idioms Reference** - Quick lookup patterns
5. **Critical Rules** - Guardrails for the agent

**Effective Patterns from effect-researcher.md:**

1. **Multiple Knowledge Sources:**
   - MCP documentation tool
   - Source code exploration (`node_modules/effect/src/`)
   - Ecosystem libraries (`node_modules/@effect/`)

2. **Phased Research Methodology:**
   - Phase 1: Understand the problem
   - Phase 2: Deep dive research
   - Phase 3: Synthesize optimal solution

3. **Clear Output Formats:**
   - Format 1: Optimized Prompt (markdown)
   - Format 2: Refactored Code
   - Format 3: Research Report (markdown)

4. **Embedded Reference Tables:**
   - Import conventions
   - Service patterns
   - Error handling patterns
   - Collection operations

5. **Critical Rules Section:**
   - Always search docs first
   - Verify patterns in source
   - Prefer ecosystem solutions
   - Complete examples always
   - Project alignment required

---

## Key Modules Quick Reference

### Core Runtime

| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Effect | Effect | gen, succeed, fail, map, flatMap, provide, retry |
| effect/Layer | Layer | succeed, effect, merge, provide, mergeAll |
| effect/Context | Context | GenericTag, make, Tag |
| effect/Cause | Cause | pretty, squash, failures |
| effect/Exit | Exit | succeed, fail, match |
| effect/Scope | Scope | make, close, use |

### Data Types

| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Array | A | map, filter, findFirst, partition, head, tail |
| effect/Option | O | some, none, getOrElse, map, flatMap |
| effect/Either | Either | left, right, match |
| effect/Record | R | map, filter, keys, values |
| effect/HashMap | HashMap | empty, set, get, has |
| effect/HashSet | HashSet | empty, add, has, remove |

### Schema & Validation

| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Schema | S | Struct, Array, String, TaggedError, Class |
| effect/SchemaAST | AST | annotations, getIdentifier |

### Utilities

| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Function | F | pipe, flow, identity |
| effect/Predicate | P | isString, isNumber, and, or, not |
| effect/String | Str | split, trim, toUpperCase, includes |
| effect/Number | Num | greaterThan, lessThan, between |
| effect/DateTime | DateTime | now, make, add, format |
| effect/Match | Match | value, tag, when, exhaustive |

### Concurrency

| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Fiber | Fiber | join, interrupt, fork |
| effect/Deferred | Deferred | make, succeed, await |
| effect/Queue | Queue | bounded, offer, take |
| effect/Ref | Ref | make, get, set, update |
| effect/Semaphore | Semaphore | make, withPermits |

### Resource Management

| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Resource | Resource | make, auto |
| effect/Pool | Pool | make, get, invalidate |
| effect/Cache | Cache | make, get, set, invalidate |

### Error & Retry

| Module | Alias | Key APIs |
|--------|-------|----------|
| effect/Schedule | Schedule | recurs, exponential, fixed |
| Effect.retry | - | retry, retryOrElse |
| Effect.acquireRelease | - | acquireRelease, ensuring |

---

## MCP Tool Usage Examples

### Basic Search and Retrieve

```typescript
// Search for a pattern
const searchResults = mcp__effect_docs__effect_docs_search({
  query: "Effect.gen"
})

// Get document by ID from results
const doc = mcp__effect_docs__get_effect_doc({
  documentId: 5891,
  page: 1
})
```

### Multi-Page Document Retrieval

```typescript
// First, get page 1 and check total pages
const page1 = mcp__effect_docs__get_effect_doc({
  documentId: someId,
  page: 1
})

// If totalPages > 1, iterate
if (page1.totalPages > 1) {
  for (let page = 2; page <= page1.totalPages; page++) {
    const nextPage = mcp__effect_docs__get_effect_doc({
      documentId: someId,
      page
    })
    // Combine content...
  }
}
```

### Effective Search Strategies

1. **Start broad, then narrow:**
   - "Layer" -> "Layer composition" -> "Layer.provide"

2. **Search for concepts and APIs:**
   - "retry" returns both Effect.retry API and retrying guide

3. **Use module.method format for precision:**
   - "Effect.acquireRelease" more precise than "acquire release"

---

## Findings Summary

1. **MCP tools are reliable** - Consistent results, good coverage of Effect ecosystem
2. **Search is fuzzy** - Natural language works well
3. **Pagination exists** - Must handle multi-page docs
4. **Documentation quality is high** - Includes working code examples
5. **Effect patterns are strict** - Project enforces namespace imports, no async/await
6. **Reference agent is well-structured** - Good template for mcp-researcher
