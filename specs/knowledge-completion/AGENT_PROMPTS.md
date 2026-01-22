# Agent Prompts: Knowledge Completion

> Specialized prompts for agents used in each phase.

---

## Agent Overview

| Agent | Phase(s) | Purpose |
|-------|----------|---------|
| `codebase-researcher` | P1 | Analyze current implementation |
| `mcp-researcher` | P1 | Research @effect/ai documentation |
| `code-reviewer` | P2 | Check Effect patterns compliance |
| `architecture-pattern-enforcer` | P2 | Validate slice structure |
| `reflector` | P3 | Identify patterns from reference |
| `doc-writer` | P3, P8 | Document designs and APIs |
| `effect-code-writer` | P4, P6, P7 | Implement services |
| `package-error-fixer` | P4 | Fix type errors |
| `test-writer` | P5 | Create test files |
| `readme-updater` | P8 | Update README files |

---

## Phase 1: Discovery & Research

### codebase-researcher: Analyze Current Implementation

```markdown
## Task: Analyze Knowledge Server AiService Implementation

Research the current LLM integration in `packages/knowledge/server/src/`.

### Files to Analyze

1. `packages/knowledge/server/src/Ai/AiService.ts`
   - What is the interface definition?
   - What methods are exposed?
   - What types are used?

2. `packages/knowledge/server/src/Ai/PromptTemplates.ts`
   - How are prompts constructed?
   - What templates exist?

3. `packages/knowledge/server/src/Extraction/`
   - EntityExtractor.ts - How does it use AiService?
   - MentionExtractor.ts - How does it use AiService?
   - RelationExtractor.ts - How does it use AiService?
   - ExtractionPipeline.ts - How are services composed?

### Output Format

Create `outputs/current-impl-analysis.md` with:
- Interface definitions (code snippets)
- Usage patterns
- Dependencies
- Layer composition
- Total usage count of AiService methods

### Questions to Answer

1. How many services depend on AiService?
2. What `generateObject` calls exist?
3. What `generateObjectWithSystem` calls exist? (EntityExtractor uses this!)
4. What `generateText` calls exist?
5. Are there any provider implementations?
6. How is the service tested currently?
7. Does the code use legacy `Context.GenericTag` pattern?

**IMPORTANT**: AiService has 3 methods - document ALL of them:
- `generateObject`
- `generateObjectWithSystem`
- `generateText`
```

### mcp-researcher: Research @effect/ai

```markdown
## Task: Research @effect/ai Package

Use the Effect documentation MCP to research the @effect/ai package.

### Topics to Research

1. **LanguageModel Service**
   - What is `LanguageModel.LanguageModel`?
   - What methods does it provide?
   - How is it created/provided?

2. **Prompt API**
   - What is `Prompt.make()`?
   - What is `Prompt.Prompt` type?
   - How do structured prompts work?

3. **generateObject API**
   - What is the function signature?
   - What options does it accept?
   - What does it return?

4. **Provider Integration**
   - How does @effect/ai-anthropic work?
   - How does @effect/ai-openai work?
   - How is provider selection done?

5. **System Prompt Support** (CRITICAL)
   - Does @effect/ai support system prompts?
   - How do you pass a system prompt to `generateObject`?
   - EntityExtractor needs `generateObjectWithSystem` equivalent

6. **Mock Layer Pattern** (CRITICAL)
   - How do you create a mock `LanguageModel.LanguageModel` for tests?
   - Does `LanguageModel.make()` exist?
   - What's the pattern for `Layer.succeed(LanguageModel.LanguageModel, ...)`?

7. **Advanced Features**
   - Prompt caching
   - Streaming responses
   - Token usage tracking

### Output Format

Create `outputs/effect-ai-research.md` with:
- API documentation
- Code examples
- Provider setup patterns
- Common patterns
- **System prompt solution** (how to migrate `generateObjectWithSystem`)
- **Test mock pattern** (exact code for creating mock Layer)
```

---

## Phase 2: Architecture Review

### code-reviewer: Effect Patterns Compliance

```markdown
## Task: Review Effect Patterns Compliance

Review `packages/knowledge/server/src/` for Effect patterns compliance.

### Checklist

#### Service Patterns
- [ ] All services use `Effect.Service<T>()("ServiceName", { ... })`
- [ ] All services have `accessors: true`
- [ ] Dependencies declared in `dependencies: []`
- [ ] No manual Context.Tag usage

#### Import Patterns
- [ ] Namespace imports: `import * as Effect from "effect/Effect"`
- [ ] Single-letter aliases: `import * as S from "effect/Schema"`
- [ ] @beep/* path aliases used
- [ ] No relative `../../../` imports

#### Error Handling
- [ ] TaggedError for all errors
- [ ] No `throw` statements
- [ ] Effect.fail for failures
- [ ] Typed error channels

#### Schema Patterns
- [ ] PascalCase constructors (S.String, S.Struct)
- [ ] No lowercase schema functions
- [ ] Proper optional handling

### Output Format

Create `outputs/architecture-review.md` with:
- Compliance status for each file
- Violations found
- Remediation recommendations
- Priority (P0/P1/P2)
```

### architecture-pattern-enforcer: Validate Slice Structure

```markdown
## Task: Validate Knowledge Slice Structure

Check that `packages/knowledge/*` follows slice architecture.

### Expected Structure

```
packages/knowledge/
├── domain/          # Pure types, schemas, errors (no I/O)
├── tables/          # Database tables, RLS policies
├── server/          # Effect services, business logic
├── client/          # Client API wrappers
└── ui/              # React components (deferred)
```

### Validation Rules

1. **Domain Package**
   - No Effect services (only types/schemas)
   - No database imports
   - No I/O operations
   - Exports: entities, errors, schemas

2. **Tables Package**
   - Drizzle table definitions
   - RLS policies
   - Depends on: domain

3. **Server Package**
   - Effect services
   - Business logic
   - Depends on: domain, tables

4. **Client Package**
   - API client wrappers
   - Depends on: domain

### Output Format

Create `outputs/slice-structure-review.md` with:
- Structure compliance
- Dependency violations
- Missing packages
- Recommendations
```

---

## Phase 3: @effect/ai Design

### reflector: Identify Reference Patterns

```markdown
## Task: Extract Patterns from effect-ontology

Analyze `tmp/effect-ontology/packages/@core-v2/` for @effect/ai patterns.

### Files to Study

1. `src/Service/Extraction.ts`
   - How is LanguageModel used?
   - What prompt patterns exist?

2. `src/Service/LlmWithRetry.ts`
   - What is the retry pattern?
   - How is timeout handled?
   - What telemetry is added?

3. `src/Runtime/ProductionRuntime.ts`
   - How are provider Layers composed?
   - How is provider selection done?

4. `src/Runtime/EmbeddingLayers.ts`
   - How are embedding providers handled?
   - What's the Layer composition pattern?

### Output Format

Create `outputs/reference-patterns.md` with:
- Code snippets for each pattern
- Explanation of pattern purpose
- How to apply in knowledge package
- Differences from current implementation
```

### doc-writer: Document Design

```markdown
## Task: Document LLM Refactoring Design

Create design documentation for the @effect/ai migration.

### Documents to Create

1. `outputs/design-llm-layers.md`
   - Provider Layer architecture
   - Configuration approach
   - Selection logic

2. `outputs/design-migration.md`
   - Step-by-step migration plan
   - File modification order
   - Verification steps

3. `templates/llm-service.template.ts`
   - Template for services using LanguageModel
   - Copy-paste ready code

### Content Requirements

- Clear code examples
- Before/after comparisons
- Configuration examples
- Test setup guidance
```

---

## Phase 4: LLM Refactoring

### effect-code-writer: Implement Refactoring

```markdown
## Task: Refactor to @effect/ai

Implement the @effect/ai refactoring per the design documents.

### Pre-Implementation Checklist

1. Read `outputs/design-llm-layers.md`
2. Read `outputs/design-migration.md`
3. Verify current state with `bun run check --filter @beep/knowledge-server`

### Implementation Steps

1. **Add Dependencies**
   ```bash
   cd packages/knowledge/server
   bun add @effect/ai @effect/ai-anthropic @effect/ai-openai
   ```

2. **Create LlmLayers.ts**
   - Location: `packages/knowledge/server/src/Runtime/LlmLayers.ts`
   - Follow template in `templates/llm-service.template.ts`

3. **Create LlmWithRetry.ts**
   - Location: `packages/knowledge/server/src/Service/LlmWithRetry.ts`
   - Copy pattern from `tmp/effect-ontology`

4. **Migrate Extractors** (one at a time)
   - EntityExtractor.ts
   - MentionExtractor.ts
   - RelationExtractor.ts
   - Run `bun run check` after each

5. **Update ExtractionPipeline.ts**
   - Remove AiService.Default from Layer composition
   - Update service dependencies

6. **Migrate PromptTemplates.ts**
   - Use Prompt.make() for prompts

7. **Delete AiService.ts**
   - Only after all migrations verified

### Verification After Each Step

```bash
bun run check --filter @beep/knowledge-server
```

### Error Recovery

If type errors occur:
1. Read the error message carefully
2. Check if it's a missing import
3. Check if it's a type mismatch
4. Use package-error-fixer agent if stuck
```

### package-error-fixer: Fix Type Errors

```markdown
## Task: Fix Type Errors in Knowledge Server

Diagnose and fix type errors in `@beep/knowledge-server`.

### Diagnostic Steps

1. Run type check:
   ```bash
   bun run check --filter @beep/knowledge-server
   ```

2. Identify error patterns:
   - Missing imports
   - Type mismatches
   - Missing properties
   - Incompatible types

3. For each error:
   - Read the full error message
   - Identify the file and line
   - Understand the expected vs actual type
   - Apply the fix

### Common Fixes

1. **Missing LanguageModel import**
   ```typescript
   import { LanguageModel } from "@effect/ai"
   ```

2. **Prompt type mismatch**
   ```typescript
   // Wrong
   llm.generateObject({ prompt: "string" })

   // Correct
   llm.generateObject({ prompt: Prompt.make("string") })
   ```

3. **Schema type issues**
   ```typescript
   // Ensure schema is compatible with @effect/ai
   schema: S.Struct({ ... })
   ```

### Verification

After fixes, run:
```bash
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
```
```

---

## Phase 5: Test Coverage

### test-writer: Create Tests

```markdown
## Task: Create Test Coverage for Knowledge Services

Create comprehensive tests using @beep/testkit.

### Test Layer Setup

Create `packages/knowledge/server/test/_shared/TestLayers.ts`:

```typescript
import { Layer } from "effect/Layer"
import { LanguageModel } from "@effect/ai"
import { effect } from "@beep/testkit"

// Mock LanguageModel
export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  {
    generateObject: ({ schema, objectName }) =>
      Effect.succeed({
        value: mockDataForSchema(schema),
        usage: { tokens: 100 }
      })
  }
)
```

### Test Files to Create

1. `test/Extraction/EntityExtractor.test.ts`
2. `test/Extraction/MentionExtractor.test.ts`
3. `test/Extraction/RelationExtractor.test.ts`
4. `test/Extraction/ExtractionPipeline.test.ts`
5. `test/Ontology/OntologyService.test.ts`
6. `test/Embedding/EmbeddingService.test.ts`
7. `test/EntityResolution/EntityResolutionService.test.ts`
8. `test/Grounding/GroundingService.test.ts`

### Test Pattern

```typescript
import { effect, strictEqual } from "@beep/testkit"
import * as Effect from "effect/Effect"
import { EntityExtractor } from "@beep/knowledge-server/Extraction/EntityExtractor"
import { MockLlmLive } from "../_shared/TestLayers"

effect("extracts entities from chunk", () =>
  Effect.gen(function* () {
    const extractor = yield* EntityExtractor
    const result = yield* extractor.extract(testChunk)
    strictEqual(result.entities.length > 0, true)
  }).pipe(
    Effect.provide(EntityExtractor.Default),
    Effect.provide(MockLlmLive)
  )
)
```

### Verification

```bash
bun run test --filter @beep/knowledge-server
```
```

---

## Phase 6: GraphRAG Implementation

### effect-code-writer: Implement GraphRAG

```markdown
## Task: Implement GraphRAG Service

Create the GraphRAG service for subgraph retrieval.

### Service Location

`packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`

### Interface Design

```typescript
export interface GraphRAGQuery {
  readonly query: string
  readonly topK: number
  readonly hops: number
  readonly filters?: EntityFilters
}

export interface GraphRAGResult {
  readonly entities: ReadonlyArray<Entity>
  readonly relations: ReadonlyArray<Relation>
  readonly scores: ReadonlyMap<EntityId, number>
  readonly context: string
}
```

### Implementation Requirements

1. **k-NN Search**
   - Use pgvector for embedding similarity
   - Configurable topK parameter
   - Return scored results

2. **N-Hop Traversal**
   - Start from seed entities
   - Follow relations up to N hops
   - Collect related entities

3. **RRF Scoring**
   - Reciprocal Rank Fusion
   - Combine embedding similarity with graph distance
   - Return ranked results

4. **Context Formatting**
   - Format subgraph for LLM consumption
   - Include entity descriptions
   - Include relation types

### Dependencies

- EmbeddingService (for query embedding)
- EntityRepo (for entity search)
- RelationRepo (for relation traversal)

### Test Requirements

- Test k-NN search accuracy
- Test traversal depth limits
- Test context formatting
```

---

## Phase 7: Todox Integration

### effect-code-writer: Implement Integration

```markdown
## Task: Integrate Knowledge Extraction with Todox

Connect the knowledge graph to the email pipeline.

### Integration Points

1. **Email Extraction Trigger**
   - Location: `packages/comms/server/` or integration point
   - On email receive, trigger extraction

2. **Extraction Event Handler**
   ```typescript
   export const onEmailReceived = (email: Email) =>
     Effect.gen(function* () {
       const pipeline = yield* ExtractionPipeline
       const graph = yield* pipeline.extract(email.body)
       yield* persistGraph(graph)
       yield* emitExtractionComplete(email.id, graph)
     })
   ```

3. **Client Assembly**
   - Assemble knowledge graph per client
   - Filter by client context
   - Provide API for querying

4. **Real-time Events**
   - Emit events on extraction complete
   - Allow UI subscription
   - Support incremental updates

### Verification

- Test with mock emails
- Verify extraction triggers
- Check event emission
```

---

## Phase 8: Finalization

### doc-writer: Update Documentation

```markdown
## Task: Update Knowledge Package Documentation

Update all documentation for the knowledge packages.

### Files to Update

1. `packages/knowledge/server/README.md`
   - API documentation
   - Usage examples
   - Configuration guide

2. `packages/knowledge/domain/README.md`
   - Entity documentation
   - Schema reference

### Content Requirements

- Clear examples
- Configuration options
- Common patterns
- Troubleshooting
```

### readme-updater: Create AGENTS.md

```markdown
## Task: Create AGENTS.md Files

Create AGENTS.md for knowledge packages.

### Files to Create

1. `packages/knowledge/server/AGENTS.md`
2. `packages/knowledge/domain/AGENTS.md`

### Content Template

```markdown
# AGENTS.md

Instructions for AI agents working with this package.

## Package Purpose

[Description]

## Key Services

[List of services and their purposes]

## Common Tasks

[How to perform common operations]

## Dependencies

[What this package depends on]

## Testing

[How to test this package]
```
```

---

## Agent Invocation Examples

### Invoking codebase-researcher

```
Task tool with subagent_type='codebase-researcher':

"Analyze the AiService implementation in packages/knowledge/server/src/.
Document all usages, interface definition, and dependencies.
Output to outputs/current-impl-analysis.md."
```

### Invoking effect-code-writer

```
Task tool with subagent_type='effect-code-writer':

"Implement the LlmLayers.ts file following the design in outputs/design-llm-layers.md.
Use @effect/ai-anthropic and @effect/ai-openai for providers.
Follow Effect.Service patterns with accessors: true."
```

### Invoking test-writer

```
Task tool with subagent_type='test-writer':

"Create tests for EntityExtractor service in packages/knowledge/server.
Use @beep/testkit patterns with Mock LanguageModel layer.
Mirror src structure in test directory."
```
