# MCP Researcher Agent Design

> Phase 2 Output: Methodology, output format, and module quick reference design.

---

## Research Methodology

### Step 1: Query Formulation

**Goal:** Create effective MCP search queries based on user requests.

**Strategy:**
1. Extract key terms from user's question
2. Identify likely Effect modules involved
3. Formulate 2-3 search queries of varying specificity

**Query Types:**
| Type | Pattern | Example |
|------|---------|---------|
| API Lookup | `Module.method` | `Effect.retry` |
| Concept Search | `[concept] [module]` | `Layer composition` |
| Pattern Search | `[pattern] [domain]` | `Schema TaggedError` |
| Guide Search | `[action]` | `error handling` |

**Query Refinement:**
```
User: "How do I handle errors with retries?"
Initial queries:
  1. "Effect.retry" (API lookup)
  2. "retry error handling" (concept search)
  3. "Schedule exponential" (related API)
```

### Step 2: Document Retrieval

**Goal:** Efficiently retrieve and combine relevant documentation.

**Strategy:**
1. Execute search queries in parallel
2. Score results by relevance to user's question
3. Retrieve top 3-5 documents
4. Handle pagination for long documents
5. Combine content for synthesis

**Retrieval Algorithm:**
```
1. Search with primary query
2. Filter results to most relevant (by title match, description)
3. Retrieve document content
4. If totalPages > 1, retrieve all pages
5. Repeat for secondary queries
6. Deduplicate by documentId
```

### Step 3: Pattern Extraction

**Goal:** Extract applicable code patterns from documentation.

**What to Extract:**
1. **Type signatures** - Function parameters and return types
2. **Code examples** - Working TypeScript examples
3. **Usage notes** - When to use, caveats
4. **Related APIs** - Links to complementary functions

**Extraction Template:**
```markdown
### Pattern: [Name]
**Source**: Effect docs [documentId]
**Purpose**: [When to use]
**Signature**:
```typescript
[Type signature from docs]
```
**Example**:
```typescript
[Code example from docs]
```
```

### Step 4: Codebase Integration

**Goal:** Adapt Effect patterns to beep-effect style.

**Transformation Rules:**
1. Replace named imports with namespace imports
2. Apply required aliases (A, O, S, F, Str)
3. Replace async/await with Effect.gen
4. Replace native methods with Effect utilities
5. Ensure PascalCase constructors
6. Add appropriate type annotations

**Adaptation Template:**
```typescript
// Original from Effect docs
import { Effect, pipe } from "effect"

const result = await Effect.runPromise(...)

// Adapted for beep-effect
import * as Effect from "effect/Effect"
import * as F from "effect/Function"

const result = Effect.gen(function* () {
  return yield* ...
})
```

---

## Output Format

### Standard Research Output

```markdown
# Effect Patterns Research: [Topic]

## Search Queries Used
- "[query 1]" -> [N results, relevance notes]
- "[query 2]" -> [N results, relevance notes]

## Relevant Modules
| Module | Purpose | Documentation ID |
|--------|---------|-----------------|
| effect/Module | What it does | documentId |

## Documentation Findings

### Pattern: [Name]
**Source**: Effect docs [documentId]
**Official Example**:
```typescript
[Code from Effect docs - verbatim]
```

**Beep-Effect Adaptation**:
```typescript
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"
import * as A from "effect/Array"
import * as F from "effect/Function"

// Adapted code following project patterns
```

## Critical Rules
[Effect-specific constraints identified from docs]

## Integration Recommendations
[How to apply in beep-effect codebase]
- Which services to modify
- Layer composition needed
- Error types to define
```

### Quick Answer Format (for simple lookups)

```markdown
## [API Name]

**Purpose**: [One-line description]

**Import**:
```typescript
import * as Module from "effect/Module"
```

**Usage**:
```typescript
// Idiomatic example
```

**Related**: [Comma-separated list of related APIs]
```

### Comparison Format (for "X vs Y" questions)

```markdown
## [Option A] vs [Option B]

| Aspect | [Option A] | [Option B] |
|--------|------------|------------|
| Use Case | ... | ... |
| Performance | ... | ... |
| Complexity | ... | ... |

**Recommendation**: [Which to use and why]

**Example with [Recommended Option]**:
```typescript
// Code example
```
```

---

## Effect Module Quick Reference

### Core - Runtime & Composition

| Module | Alias | Purpose | Key APIs |
|--------|-------|---------|----------|
| effect/Effect | Effect | Effectful computations | gen, succeed, fail, map, flatMap, retry |
| effect/Layer | Layer | Dependency injection | succeed, effect, provide, merge, mergeAll |
| effect/Context | Context | Service context | GenericTag, make, Tag |
| effect/Scope | Scope | Resource lifecycle | make, close, extend |
| effect/Runtime | Runtime | Effect execution | runPromise, runSync |

### Data - Collections & Containers

| Module | Alias | Purpose | Key APIs |
|--------|-------|---------|----------|
| effect/Array | A | Array operations | map, filter, findFirst, head, partition |
| effect/Option | O | Optional values | some, none, getOrElse, map, flatMap |
| effect/Either | Either | Success/failure | left, right, match, fromOption |
| effect/Record | R | Object operations | map, filter, keys, values |
| effect/HashMap | HashMap | Hash map | empty, set, get, has, remove |
| effect/HashSet | HashSet | Hash set | empty, add, has, remove |

### Schema - Validation & Errors

| Module | Alias | Purpose | Key APIs |
|--------|-------|---------|----------|
| effect/Schema | S | Data validation | Struct, Array, String, TaggedError, Class |
| effect/SchemaAST | AST | Schema internals | annotations, getIdentifier |

### Utilities - Helpers

| Module | Alias | Purpose | Key APIs |
|--------|-------|---------|----------|
| effect/Function | F | Function utilities | pipe, flow, identity, compose |
| effect/Predicate | P | Type guards | isString, isNumber, and, or, not |
| effect/String | Str | String operations | split, trim, toUpperCase, includes |
| effect/Number | Num | Number operations | greaterThan, lessThan, between |
| effect/DateTime | DateTime | Date/time handling | now, make, add, subtract, format |
| effect/Match | Match | Pattern matching | value, tag, when, exhaustive |

### Concurrency - Async Patterns

| Module | Alias | Purpose | Key APIs |
|--------|-------|---------|----------|
| effect/Fiber | Fiber | Concurrent effects | join, interrupt, fork, await |
| effect/Deferred | Deferred | Promise-like sync | make, succeed, fail, await |
| effect/Queue | Queue | Async queues | bounded, unbounded, offer, take |
| effect/Ref | Ref | Mutable reference | make, get, set, update, modify |
| effect/Semaphore | Semaphore | Concurrency control | make, withPermits |
| effect/Pool | Pool | Resource pooling | make, get, invalidate |

### Error - Recovery & Retry

| Module | Alias | Purpose | Key APIs |
|--------|-------|---------|----------|
| effect/Cause | Cause | Error causes | pretty, squash, failures |
| effect/Exit | Exit | Computation result | succeed, fail, match, isSuccess |
| effect/Schedule | Schedule | Retry policies | recurs, exponential, fixed, forever |

### IO - External Effects

| Module | Alias | Purpose | Key APIs |
|--------|-------|---------|----------|
| effect/Stream | Stream | Streaming data | make, fromIterable, map, filter |
| effect/Sink | Sink | Stream consumers | collectAll, forEach, head |
| effect/PubSub | PubSub | Publish/subscribe | bounded, publish, subscribe |

---

## Agent Behavior Specifications

### Input Processing

1. Parse user query for:
   - Topic/concept being researched
   - Specific APIs mentioned
   - Whether adaptation to beep-effect is needed

2. Classify query type:
   - API lookup (simple)
   - Pattern discovery (medium)
   - Architecture guidance (complex)

### Search Strategy by Query Type

**API Lookup:**
- Single search with exact API name
- One document retrieval
- Quick answer format

**Pattern Discovery:**
- 2-3 searches with related terms
- 3-5 document retrievals
- Standard research output format

**Architecture Guidance:**
- Multiple searches across domains
- Source code exploration
- Research report with recommendations

### Error Handling

1. **No search results:** Broaden query, suggest alternatives
2. **Document not found:** Report to user, try related IDs
3. **Pagination error:** Fall back to first page only
4. **Conflicting information:** Prefer official docs, note discrepancy

### Output Guardrails

Every code example MUST:
- [ ] Use namespace imports (`import * as X from "effect/X"`)
- [ ] Use correct aliases (A, O, S, F, Str, etc.)
- [ ] Use Effect.gen (no async/await)
- [ ] Use Effect utilities (no native methods)
- [ ] Use PascalCase constructors
- [ ] Include complete imports
- [ ] Be syntactically valid TypeScript

---

## Integration with beep-effect

### Package Awareness

The agent should know:
- `@beep/schema` for project-wide schemas
- `@beep/utils` for utility functions (noOp, nullOp)
- `@beep/testkit` for testing utilities
- Slice structure: domain -> tables -> server -> client -> ui

### Common Adaptations

1. **Error definitions** - Use project's error patterns
2. **Service definitions** - Follow Effect.Service pattern
3. **Layer composition** - Align with existing layer structure
4. **Collection operations** - Always use F.pipe with Effect utilities
