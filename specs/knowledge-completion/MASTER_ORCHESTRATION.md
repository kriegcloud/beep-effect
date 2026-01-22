# Master Orchestration: Knowledge Completion

> Complete phase-by-phase workflow for completing the knowledge graph integration.

---

## Phase Overview

| Phase | Name | Agents | Duration | Output |
|-------|------|--------|----------|--------|
| **P1** | Discovery & Research | codebase-researcher, mcp-researcher | Medium | Research artifacts |
| **P2** | Architecture Review | code-reviewer, architecture-pattern-enforcer | Short | Review report |
| **P3** | @effect/ai Design | reflector, doc-writer | Medium | Design document |
| **P4** | LLM Refactoring | effect-code-writer, package-error-fixer | Long | Refactored services |
| **P5** | Test Coverage | test-writer | Medium | Test files |
| **P6** | GraphRAG Implementation | effect-code-writer | Long | GraphRAG services |
| **P7** | Todox Integration | effect-code-writer | Medium | Integration code |
| **P8** | Finalization | doc-writer, readme-updater | Short | Documentation |

---

## Phase 1: Discovery & Research

### Objective

Deep research on @effect/ai patterns, current implementation state, and gap analysis.

### Agent Assignments

1. **codebase-researcher**: Analyze `packages/knowledge/server/src/` implementation
2. **mcp-researcher**: Research @effect/ai documentation via Effect MCP
3. **codebase-researcher**: Analyze `tmp/effect-ontology` reference patterns

### Task Parallelization

**Can Run in Parallel** (no dependencies between these):
- Task P1.1-P1.2 (current impl analysis)
- Task P1.3-P1.4 (@effect/ai research)
- Task P1.5 (reference impl analysis)

**Must Run Sequentially** (depends on parallel tasks):
- Task P1.6 (gap analysis) — requires outputs from P1.1-P1.5

**Recommended Approach**:
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ codebase-researcher │   mcp-researcher    │ codebase-researcher │
│ (current impl)      │   (@effect/ai)      │ (reference impl)    │
│ P1.1, P1.2          │   P1.3, P1.4        │ P1.5                │
└─────────────────────┴─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │    Gap Analysis     │
                    │       P1.6          │
                    └─────────────────────┘
```

### Tasks

```markdown
- [ ] P1.1: Analyze current AiService implementation
- [ ] P1.2: Document all usages of AiService interface
- [ ] P1.3: Research @effect/ai LanguageModel API
- [ ] P1.4: Research @effect/ai Prompt API
- [ ] P1.5: Analyze effect-ontology patterns
- [ ] P1.6: Create gap analysis document
```

### Required Research

#### Current Implementation Analysis

Files to analyze:
```
packages/knowledge/server/src/
├── Ai/
│   ├── AiService.ts           # Custom interface (3 methods!) to be deleted
│   └── PromptTemplates.ts     # May need refactoring to use Prompt.make()
├── Extraction/
│   ├── EntityExtractor.ts     # Uses AiService.generateObjectWithSystem (NOT generateObject!)
│   ├── MentionExtractor.ts    # Uses AiService.generateObject
│   ├── RelationExtractor.ts   # Uses AiService.generateObject
│   └── ExtractionPipeline.ts  # Composes extraction services
└── ...
```

**AiService has 3 methods - document ALL usages:**
1. `generateObject` - Basic structured output
2. `generateObjectWithSystem` - With system prompt (used by EntityExtractor)
3. `generateText` - Raw text generation

#### @effect/ai Research Questions

1. What is the `LanguageModel.LanguageModel` service interface?
2. How does `Prompt.make()` work for structured prompts?
3. What is the `llm.generateObject()` API signature?
4. **Does @effect/ai support system prompts?** (EntityExtractor uses `generateObjectWithSystem`)
5. How do provider Layers compose (Anthropic, OpenAI)?
6. What prompt caching features exist?
7. **How do you create a mock LanguageModel Layer for tests?** (Verify `LanguageModel.make()` exists)

### Outputs

| File | Purpose |
|------|---------|
| `outputs/current-impl-analysis.md` | Analysis of current AiService usage |
| `outputs/effect-ai-research.md` | @effect/ai API documentation |
| `outputs/gap-analysis.md` | Differences and migration requirements |

### Exit Criteria

- [ ] All AiService usages documented
- [ ] @effect/ai API understood and documented
- [ ] Gap analysis complete
- [ ] Migration complexity assessed

### Handoff

Create `handoffs/HANDOFF_P2.md` with:
- Summary of findings
- Identified risks
- Questions for P2

---

## Phase 2: Architecture Review

### Objective

Evaluate repository alignment and identify architectural gaps beyond LLM integration.

### Agent Assignments

1. **code-reviewer**: Check Effect patterns compliance
2. **architecture-pattern-enforcer**: Validate slice structure

### Tasks

```markdown
- [ ] P2.1: Review service patterns (Effect.Service with accessors)
- [ ] P2.2: Check error handling (TaggedError patterns)
- [ ] P2.3: Validate Layer composition patterns
- [ ] P2.4: Check observability (spans, logging)
- [ ] P2.5: Review import patterns (@beep/* aliases)
- [ ] P2.6: Check test structure alignment
```

### Review Checklist

#### Effect Patterns Compliance

| Pattern | File | Status |
|---------|------|--------|
| Effect.Service with `accessors: true` | All services | TBD |
| TaggedError for errors | Error definitions | TBD |
| Namespace imports (Effect, Layer, etc.) | All files | TBD |
| @beep/* path aliases | All imports | TBD |

#### Repository Standards

| Standard | Requirement | Status |
|----------|-------------|--------|
| Biome formatting | `bun run lint:fix` passes | TBD |
| Type checking | `bun run check --filter @beep/knowledge-server` passes | TBD |
| No `any` types | Zero `any` usage | TBD |
| Schema validation | External data validated | TBD |

### Outputs

| File | Purpose |
|------|---------|
| `outputs/architecture-review.md` | Full compliance report |
| `outputs/remediation-plan.md` | Issues to fix with priorities |

### Exit Criteria

- [ ] All compliance checks complete
- [ ] Issues prioritized (P0/P1/P2)
- [ ] Remediation plan created

### Handoff

Create `handoffs/HANDOFF_P3.md` with:
- Critical issues requiring immediate attention
- Patterns to follow in refactoring
- Dependencies between issues

---

## Phase 3: @effect/ai Refactoring Design

### Objective

Design the LLM service refactoring with detailed implementation plan.

### Agent Assignments

1. **reflector**: Identify patterns from effect-ontology
2. **doc-writer**: Document the design

### Tasks

```markdown
- [ ] P3.1: Design LlmLayers.ts (provider composition)
- [ ] P3.2: Design LlmWithRetry.ts (retry wrapper)
- [ ] P3.3: Plan AiService deletion
- [ ] P3.4: Design extractor migration (EntityExtractor, etc.)
- [ ] P3.5: Design PromptTemplates migration
- [ ] P3.6: Plan Layer composition for tests
```

### Design Decisions

#### Provider Layer Structure

```typescript
// packages/knowledge/server/src/Runtime/LlmLayers.ts

import { LanguageModel } from "@effect/ai"
import { AnthropicProvider } from "@effect/ai-anthropic"
import { OpenAiProvider } from "@effect/ai-openai"

// Anthropic provider
export const AnthropicLive = AnthropicProvider.layer({
  apiKey: Config.string("ANTHROPIC_API_KEY"),
  model: Config.string("ANTHROPIC_MODEL").pipe(Config.withDefault("claude-haiku-4-5"))
})

// OpenAI provider
export const OpenAiLive = OpenAiProvider.layer({
  apiKey: Config.string("OPENAI_API_KEY"),
  model: Config.string("OPENAI_MODEL").pipe(Config.withDefault("gpt-4o-mini"))
})

// Provider selection via environment
export const LlmProviderLive = // Dynamic selection logic
```

#### Retry Wrapper Pattern

```typescript
// packages/knowledge/server/src/Service/LlmWithRetry.ts

export const generateObjectWithRetry = <A, I>(options: {
  prompt: string | StructuredPrompt
  schema: S.Schema<A, I>
  objectName: string
  retryConfig?: RetryConfig
}) => Effect.gen(function* () {
  const llm = yield* LanguageModel.LanguageModel

  return yield* llm.generateObject({
    prompt: Prompt.make(options.prompt),
    schema: options.schema,
    objectName: options.objectName
  }).pipe(
    Effect.timeout(Duration.millis(retryConfig.timeoutMs)),
    Effect.retry({ schedule: retryPolicy }),
    Effect.withSpan("llm.generateObject", { attributes: { objectName } })
  )
})
```

#### Extractor Migration Pattern

```typescript
// BEFORE (current)
export class EntityExtractor extends Effect.Service<EntityExtractor>()("EntityExtractor", {
  effect: Effect.gen(function* () {
    const ai = yield* AiService  // Custom interface
    return {
      extract: (chunk) => ai.generateObject(EntitySchema, prompt)
    }
  }),
  dependencies: [AiService.Default]  // Custom layer
})

// AFTER (refactored)
export class EntityExtractor extends Effect.Service<EntityExtractor>()("EntityExtractor", {
  effect: Effect.gen(function* () {
    const llm = yield* LanguageModel.LanguageModel  // @effect/ai
    return {
      extract: (chunk) => llm.generateObject({
        prompt: Prompt.make(buildEntityPrompt(chunk)),
        schema: EntitySchema,
        objectName: "entities"
      })
    }
  }),
  // No dependencies - LanguageModel provided at runtime
})
```

### Outputs

| File | Purpose |
|------|---------|
| `outputs/design-llm-layers.md` | Provider Layer design |
| `outputs/design-migration.md` | Step-by-step migration plan |
| `templates/llm-service.template.ts` | Copy-paste template |

### Exit Criteria

- [ ] All design decisions documented
- [ ] Migration sequence defined
- [ ] Templates created for common patterns
- [ ] Risk assessment complete

### Handoff

Create `handoffs/HANDOFF_P4.md` with:
- Complete migration checklist
- File modification order
- Verification steps

---

## Phase 4: LLM Refactoring Execution

### Objective

Execute the @effect/ai refactoring.

### Agent Assignments

1. **effect-code-writer**: Implement refactoring
2. **package-error-fixer**: Fix type errors during migration

### Tasks

```markdown
- [ ] P4.1: Add @effect/ai dependencies
- [ ] P4.2: Create LlmLayers.ts
- [ ] P4.3: Create LlmWithRetry.ts
      └── CHECKPOINT: bun tsc --noEmit packages/knowledge/server/src/Runtime/LlmLayers.ts
- [ ] P4.4: Migrate EntityExtractor.ts (uses generateObjectWithSystem)
      └── CHECKPOINT: bun run check --filter @beep/knowledge-server
      └── STOP IF ERRORS - do not proceed until resolved
- [ ] P4.5: Migrate MentionExtractor.ts
- [ ] P4.6: Migrate RelationExtractor.ts
      └── CHECKPOINT: bun run check --filter @beep/knowledge-server
- [ ] P4.7: Update ExtractionPipeline.ts Layer composition
- [ ] P4.8: Migrate PromptTemplates.ts to use Prompt.make()
- [ ] P4.9: Delete AiService.ts
- [ ] P4.10: Final verify: bun run check && bun run lint:fix --filter @beep/knowledge-server
```

**IMPORTANT**: Stop at any checkpoint failure. Fix errors before proceeding.

### Rollback Strategy

**CRITICAL**: Create a checkpoint before starting refactoring.

```bash
# Before P4.1 - Create safety branch
git checkout -b knowledge-completion-p4-refactoring
git add -A && git commit -m "checkpoint: pre-@effect/ai refactoring"
```

**If any migration step fails:**
1. `git stash` current changes
2. `git checkout main` to return to stable state
3. Document failure details in `REFLECTION_LOG.md`
4. Create `handoffs/P4_FAILURE_ANALYSIS.md` with:
   - Which step failed
   - Error messages
   - Attempted fixes
   - Recommended next steps

**Merge only after full verification passes.**

---

### Implementation Order

**Step 1: Dependencies**
```bash
cd packages/knowledge/server
bun add @effect/ai @effect/ai-anthropic @effect/ai-openai
```

**Step 2: New Files (CREATE)**
```
packages/knowledge/server/src/
├── Runtime/
│   └── LlmLayers.ts         # Provider selection layers
└── Service/
    └── LlmWithRetry.ts      # Retry wrapper utility
```

**Step 3: Migrate Files (MODIFY)**
```
packages/knowledge/server/src/
├── Extraction/
│   ├── EntityExtractor.ts   # Use LanguageModel.LanguageModel
│   ├── MentionExtractor.ts  # Use LanguageModel.LanguageModel
│   ├── RelationExtractor.ts # Use LanguageModel.LanguageModel
│   └── ExtractionPipeline.ts # Update Layer composition
└── Ai/
    └── PromptTemplates.ts   # Use Prompt.make() patterns
```

**Step 4: Delete Files (DELETE)**
```
packages/knowledge/server/src/
└── Ai/
    └── AiService.ts         # Custom interface no longer needed
```

### Verification Commands

```bash
# After each migration step
bun run check --filter @beep/knowledge-server

# If check fails, use package-error-fixer agent
# to diagnose and fix type errors

# After all migrations
bun run lint:fix --filter @beep/knowledge-server
bun run build --filter @beep/knowledge-server
```

### Exit Criteria

- [ ] All extraction services use `LanguageModel.LanguageModel`
- [ ] Custom `AiService` deleted
- [ ] Provider Layers created and documented
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run lint:fix` passes

### Handoff

Create `handoffs/HANDOFF_P5.md` with:
- Summary of changes
- Any deferred issues
- Test requirements

---

## Phase 5: Test Coverage

### Objective

Add comprehensive test coverage for all services.

### Agent Assignments

1. **test-writer**: Create tests using @beep/testkit patterns

### Tasks

```markdown
- [ ] P5.1: Create test Layer for mocked LanguageModel
- [ ] P5.2: Test EntityExtractor
- [ ] P5.3: Test MentionExtractor
- [ ] P5.4: Test RelationExtractor
- [ ] P5.5: Test ExtractionPipeline integration
- [ ] P5.6: Test OntologyService
- [ ] P5.7: Test EmbeddingService
- [ ] P5.8: Test EntityResolutionService
- [ ] P5.9: Test GroundingService
- [ ] P5.10: Verify: bun run test --filter @beep/knowledge-server
```

### Test Structure

```
packages/knowledge/server/test/
├── _shared/
│   ├── TestLayers.ts        # Shared test layers (MockLlm, etc.)
│   └── fixtures/            # Test data fixtures
├── Extraction/
│   ├── EntityExtractor.test.ts
│   ├── MentionExtractor.test.ts
│   ├── RelationExtractor.test.ts
│   └── ExtractionPipeline.test.ts
├── Ontology/
│   ├── OntologyParser.test.ts
│   └── OntologyService.test.ts
├── Embedding/
│   └── EmbeddingService.test.ts
├── EntityResolution/
│   └── EntityResolutionService.test.ts
└── Grounding/
    └── GroundingService.test.ts
```

### Test Layer Pattern

**⚠️ VERIFY DURING P1 RESEARCH**: The `LanguageModel.make()` API below is assumed.
Confirm actual mocking pattern from @effect/ai docs before implementing.

```typescript
// test/_shared/TestLayers.ts
import { LanguageModel } from "@effect/ai"
import { layer, effect } from "@beep/testkit"

// VERIFY: This mock pattern needs confirmation from @effect/ai research
// The actual API may differ - check effect-ai-research.md output
export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  LanguageModel.make({  // <-- VERIFY this API exists
    generateObject: (options) => Effect.succeed({
      value: options.schema.make(mockData),
      usage: { tokens: 100 }
    })
  })
)

// Composed test layer
export const TestLayer = Layer.mergeAll(
  MockLlmLive,
  OntologyService.Default,
  // ... other dependencies
)
```

**P1 Research Task**: Document the actual mock Layer pattern in `outputs/effect-ai-research.md`.

### Exit Criteria (Quantitative)

- [ ] **Test file count**: ≥ 9 test files (matching test structure above)
- [ ] **Tests per file**: ≥ 3 test cases each (happy path, edge case, error case)
- [ ] **No skipped tests**: Zero `it.skip` or `describe.skip` markers
- [ ] **All tests pass**: `bun run test --filter @beep/knowledge-server` exits 0
- [ ] **Layer composition**: At least 1 integration test using composed `TestLayer`

**Verification Command**:
```bash
# Count test files
find packages/knowledge/server/test -name "*.test.ts" | wc -l
# Should be ≥ 9

# Check for skipped tests
grep -r "\.skip" packages/knowledge/server/test/ || echo "No skipped tests ✓"

# Run tests
bun run test --filter @beep/knowledge-server
```

### Handoff

Create `handoffs/HANDOFF_P6.md` with:
- Test coverage summary (file count, test count)
- Any skipped tests and reasons (should be none)
- Integration test requirements

---

## Phase 6: GraphRAG Implementation

### Objective

Implement subgraph retrieval for agent context (P5 from original spec).

### Agent Assignments

1. **effect-code-writer**: Implement GraphRAG services

### Tasks

```markdown
- [ ] P6.1: Design GraphRAGService interface
- [ ] P6.2: Implement k-NN entity search via pgvector
- [ ] P6.3: Implement N-hop subgraph traversal
- [ ] P6.4: Implement RRF scoring for relevance
- [ ] P6.5: Create SubgraphExtractor for context assembly
- [ ] P6.6: Add tests for GraphRAG services
- [ ] P6.7: Verify: bun run check && bun run test
```

### Service Design

```typescript
// packages/knowledge/server/src/GraphRAG/GraphRAGService.ts

export interface GraphRAGQuery {
  readonly query: string           // Natural language query
  readonly topK: number            // Number of entities to retrieve
  readonly hops: number            // Traversal depth
  readonly filters?: EntityFilters // Optional filtering
}

export interface GraphRAGResult {
  readonly entities: ReadonlyArray<Entity>
  readonly relations: ReadonlyArray<Relation>
  readonly scores: ReadonlyMap<EntityId, number>
  readonly context: string         // Formatted for LLM context
}

export class GraphRAGService extends Effect.Service<GraphRAGService>()("GraphRAGService", {
  effect: Effect.gen(function* () {
    const embedding = yield* EmbeddingService
    const entityRepo = yield* EntityRepo
    const relationRepo = yield* RelationRepo

    return {
      query: (q: GraphRAGQuery) => Effect.gen(function* () {
        // 1. Embed query
        const queryEmbedding = yield* embedding.embed(q.query)

        // 2. k-NN search for seed entities
        const seeds = yield* entityRepo.knnSearch(queryEmbedding, q.topK)

        // 3. N-hop traversal
        const subgraph = yield* traverseNHops(seeds, q.hops)

        // 4. RRF scoring
        const scored = yield* rrfScore(subgraph, queryEmbedding)

        // 5. Format context
        const context = formatForLlm(scored)

        return { ...scored, context }
      })
    }
  }),
  dependencies: [EmbeddingService.Default, EntityRepo.Default, RelationRepo.Default],
  accessors: true
})
```

### Exit Criteria

- [ ] GraphRAGService implemented and tested
- [ ] k-NN search working with pgvector
- [ ] N-hop traversal working
- [ ] Context formatting for LLM ready

### Handoff

Create `handoffs/HANDOFF_P7.md` with:
- GraphRAG API documentation
- Performance characteristics
- Integration notes

---

## Phase 7: Todox Integration

### Objective

Integrate knowledge extraction with email pipeline (P6 from original spec).

### Agent Assignments

1. **effect-code-writer**: Implement integration code

### Tasks

```markdown
- [ ] P7.1: Design email extraction triggers
- [ ] P7.2: Implement extraction event handlers
- [ ] P7.3: Create client knowledge graph assembly
- [ ] P7.4: Add real-time extraction events
- [ ] P7.5: Test integration with mock emails
- [ ] P7.6: Verify: bun run check && bun run test
```

### Integration Points

```typescript
// Email extraction trigger
export const onEmailReceived = (email: Email) => Effect.gen(function* () {
  const pipeline = yield* ExtractionPipeline
  const graphRag = yield* GraphRAGService

  // Extract entities and relations from email
  const graph = yield* pipeline.extract(email.body)

  // Store in knowledge graph
  yield* persistGraph(graph)

  // Update embeddings
  yield* updateEmbeddings(graph.entities)

  // Trigger real-time event
  yield* emitExtractionComplete(email.id, graph)
})
```

### Exit Criteria

- [ ] Email extraction pipeline connected
- [ ] Client knowledge graph updates working
- [ ] Real-time events flowing
- [ ] Integration tests passing

### Handoff

Create `handoffs/HANDOFF_P8.md` with:
- Integration architecture
- Event flow documentation
- Remaining UI work (deferred)

---

## Phase 8: Finalization

### Objective

Documentation, cleanup, and final verification.

### Agent Assignments

1. **doc-writer**: Update documentation
2. **readme-updater**: Update package READMEs

### Tasks

```markdown
- [ ] P8.1: Update packages/knowledge/server/README.md
- [ ] P8.2: Create packages/knowledge/server/AGENTS.md
- [ ] P8.3: Update packages/knowledge/domain/README.md
- [ ] P8.4: Final architecture review
- [ ] P8.5: Performance benchmarking (optional)
- [ ] P8.6: Update REFLECTION_LOG.md with learnings
- [ ] P8.7: Mark spec complete
```

### Documentation Updates

| File | Updates Required |
|------|------------------|
| `packages/knowledge/server/README.md` | API documentation, usage examples |
| `packages/knowledge/server/AGENTS.md` | Agent instructions for knowledge services |
| `packages/knowledge/domain/README.md` | Domain model documentation |
| `specs/knowledge-completion/REFLECTION_LOG.md` | Cumulative learnings |

### Final Verification

```bash
# Full verification suite
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run build --filter @beep/knowledge-server
```

### Exit Criteria

- [ ] All documentation updated
- [ ] AGENTS.md files created
- [ ] All verification commands pass
- [ ] REFLECTION_LOG complete
- [ ] Spec marked as complete

---

## Cross-Phase Checkpoints

### After Each Phase

1. Run verification: `bun run check --filter @beep/knowledge-server`
2. Update REFLECTION_LOG.md with learnings
3. Create handoff document for next phase
4. Commit changes with descriptive message

### Recovery Procedures

If a phase fails:

1. Document the failure in REFLECTION_LOG.md
2. Analyze root cause
3. Create remediation plan
4. Resume from last known good state

### Context Preservation

For multi-session work:

1. Always read the latest `handoffs/HANDOFF_P[N].md` before starting
2. Check `REFLECTION_LOG.md` for accumulated learnings
3. Verify current state matches expected state from handoff
4. Update todo list before proceeding

---

## Quick Reference Commands

```bash
# Verification
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run build --filter @beep/knowledge-server

# Development
bun run dev --filter @beep/knowledge-server

# Dependencies
bun add @effect/ai @effect/ai-anthropic @effect/ai-openai --cwd packages/knowledge/server
```

---

## Success Criteria Summary

| Phase | Key Deliverable | Verification |
|-------|-----------------|--------------|
| P1 | Gap analysis | Research docs complete |
| P2 | Architecture review | Review report complete |
| P3 | Design docs | Templates created |
| P4 | Refactored services | `bun run check` passes |
| P5 | Test coverage | `bun run test` passes |
| P6 | GraphRAG service | Service functional |
| P7 | Todox integration | Events flowing |
| P8 | Documentation | READMEs updated |

---

## Contingencies

### If @effect/ai API differs from spec assumptions

The code examples in this spec are based on assumed patterns. If P1 research reveals different APIs:

1. Document actual API in `outputs/effect-ai-research.md`
2. Update Phase 3-4 code templates in this document
3. Update `templates/llm-service.template.ts` when created
4. Note API differences in `REFLECTION_LOG.md`
5. Extend Phase 3 duration if significant redesign needed

### If @effect/ai lacks system prompt support

EntityExtractor uses `generateObjectWithSystem`. If @effect/ai doesn't support this:

1. Research alternative: Can system prompt be embedded in `Prompt.make()`?
2. Check if providers (anthropic, openai) have system prompt in config
3. Document workaround in `outputs/effect-ai-research.md`
4. May require prompt restructuring in `PromptTemplates.ts`

### If Effect MCP is unavailable

If the `mcp-researcher` agent cannot access Effect documentation:

1. Fallback to `web-researcher` agent to fetch GitHub README/docs
2. Read source directly: `node_modules/@effect/ai/src/*.ts` (if installed)
3. Use `tmp/effect-ontology` as primary reference
4. Document degraded research quality in `REFLECTION_LOG.md`
5. Mark uncertain API assumptions with `// TODO: VERIFY` comments

### If reference repo structure differs

If `tmp/effect-ontology` paths don't match spec expectations:

1. Run `find tmp/effect-ontology -name "*.ts" | head -50` to explore
2. Update file paths in `HANDOFF_P1.md` and `AGENT_PROMPTS.md`
3. Document actual structure in `outputs/reference-patterns.md`
4. Proceed with available patterns

### If type errors persist after P4.4

If migrating EntityExtractor creates unfixable errors:

1. **DO NOT proceed** to P4.5-P4.9
2. Use rollback strategy (git stash, return to checkpoint)
3. Create `handoffs/P4_BLOCKERS.md` documenting:
   - Exact error messages
   - Attempted fixes
   - Root cause analysis
4. Consider alternative approaches:
   - Keep AiService as wrapper around @effect/ai
   - Migrate incrementally (one method at a time)
   - Request human review before continuing
