# Master Orchestration - Knowledge Server @effect/ai Migration

> Complete workflow for migrating `@beep/knowledge-server` embedding layer to `@effect/ai`.

---

## Phase 0: Discovery

### Objective
Research `@effect/ai` and `@effect/ai-openai` APIs, understand current usage patterns, and map the migration path.

**CRITICAL**: The local source files in `tmp/effect/packages/ai/` are the AUTHORITATIVE reference. Read these FIRST before any MCP research.

### Pre-requisite: Direct Source File Reading (REQUIRED FIRST)

**Before any agent delegation**, the orchestrator MUST read these files directly:

```
Task 0.0a: Read tmp/effect/packages/ai/ai/src/EmbeddingModel.ts
- Extract: EmbeddingModel class (line 88-91), Service interface (102-116), Result type (140-150), make() (192-256)

Task 0.0b: Read tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts
- Extract: layerBatched() (187-191), Config.Batched (65-71), makeBatched internal pattern (112-144)

Task 0.0c: Read tmp/effect/packages/ai/openai/src/OpenAiClient.ts
- Extract: OpenAiClient class, layerConfig(), createEmbedding()
```

### Agent Delegations (SUPPLEMENTARY)

#### Task 0.1: Research @effect/ai EmbeddingModel API (mcp-researcher) - SUPPLEMENTARY

```
Use the mcp-researcher agent to research Effect AI documentation.

NOTE: Orchestrator should have already read the source files directly. This is supplementary.

Topics (focus on gaps not covered by source):
1. Usage examples beyond source comments
2. Best practices for batching configuration
3. Cache configuration guidelines
4. Error handling patterns (AiError)

Output: Synthesize findings to supplement source file knowledge
```

#### Task 0.2: Research @effect/ai-openai OpenAI Implementation (mcp-researcher) - SUPPLEMENTARY

```
Use the mcp-researcher agent to research Effect AI OpenAI documentation.

NOTE: Orchestrator should have already read the source files directly. This is supplementary.

Topics (focus on gaps not covered by source):
1. Layer composition patterns and examples
2. Config options (dimensions, encoding_format)
3. Error mapping from OpenAI to AiError
4. Integration examples

Output: Synthesize findings to supplement source file knowledge
```

#### Task 0.3: Map Current Embedding Usage (codebase-researcher)

```
Use the codebase-researcher agent to analyze current embedding usage.

Research questions:
1. Which services depend on EmbeddingProvider?
2. How is TaskType used throughout the codebase?
3. What custom EmbeddingResult fields are actually used?
4. Where is EmbeddingError handled?
5. What Layer compositions exist for embeddings?

Scope: packages/knowledge/server/src/

Output: Usage map for orchestrator
```

### Phase 0 Completion Criteria

- [ ] `@effect/ai` EmbeddingModel API documented
- [ ] `@effect/ai-openai` OpenAI embedding patterns documented
- [ ] Current embedding usage mapped
- [ ] Gap analysis complete (what custom features need preservation)
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] handoffs/HANDOFF_P1.md created
- [ ] handoffs/P1_ORCHESTRATOR_PROMPT.md created

---

## Phase 1: Planning

### Objective
Design the migration strategy, define interface adapters, and create implementation order.

### Key Decisions Required

1. **Preserve vs Replace EmbeddingProvider?**
   - Option A: Keep EmbeddingProvider as adapter around EmbeddingModel
   - Option B: Replace EmbeddingProvider with direct EmbeddingModel usage

2. **TaskType Handling**
   - EmbeddingModel doesn't have TaskType concept
   - Options: Ignore (OpenAI doesn't need prefixes), Add wrapper, Use config override

3. **EmbeddingResult Mapping**
   - Current: `{ vector, model, usage: { totalTokens } }`
   - @effect/ai: `{ embeddings, index }`
   - Need adapter or service-level transformation

### Agent Delegations

#### Task 1.1: Design Interface Adapter (orchestrator decision)

Based on Phase 0 research, decide on adapter strategy and document in HANDOFF_P2.md.

#### Task 1.2: Validate Patterns Against Codebase (architecture-pattern-enforcer)

```
Use the architecture-pattern-enforcer agent to validate proposed patterns.

Validate:
1. Layer composition follows Effect patterns
2. Error types use Schema.TaggedError
3. Service dependencies follow slice boundaries
4. Import paths use @beep/* aliases

Output: outputs/architecture-review.md
```

### Phase 1 Completion Criteria

- [ ] Migration strategy decided and documented
- [ ] Interface adapter design complete
- [ ] Implementation order defined
- [ ] Risk assessment complete
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] handoffs/HANDOFF_P2.md created
- [ ] handoffs/P2_ORCHESTRATOR_PROMPT.md created

---

## Phase 2: Implementation

### Objective
Migrate embedding layer to use `@effect/ai` and `@effect/ai-openai`.

### Implementation Order

1. **Add dependencies** to `packages/knowledge/server/package.json`
2. **Create OpenAI client layer** using `OpenAiClient.layerConfig`
3. **Create embedding layer** using `OpenAiEmbeddingModel.layerBatched`
4. **Adapt EmbeddingService** to use `EmbeddingModel` interface
5. **Update MockProvider** to implement `EmbeddingModel`
6. **Remove custom OpenAiProvider** (or keep as deprecated wrapper)
7. **Update Layer compositions** in Runtime/

### Agent Delegations

#### Task 2.1: Add Dependencies (effect-code-writer)

```
Use the effect-code-writer agent to add required dependencies.

Target: packages/knowledge/server/package.json

Add:
- "@effect/ai": "workspace:*"
- "@effect/ai-openai": "workspace:*"

Note: These are Effect monorepo packages, use "workspace:*" or appropriate version.
```

#### Task 2.2: Create OpenAI Embedding Layer (effect-code-writer)

```
Use the effect-code-writer agent to create the OpenAI embedding layer.

Target: packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts

Pattern to follow (from @effect/ai-openai):

import * as OpenAiClient from "@effect/ai-openai/OpenAiClient"
import * as OpenAiEmbeddingModel from "@effect/ai-openai/OpenAiEmbeddingModel"
import { BunHttpClient } from "@effect/platform-bun"
import * as Config from "effect/Config"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

// Client layer from environment
export const OpenAiClientLive = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY"),
}).pipe(Layer.provide(BunHttpClient.layer))

// Embedding model layer
export const OpenAiEmbeddingLive = OpenAiEmbeddingModel.layerBatched({
  model: "text-embedding-3-small",
  config: {
    dimensions: 768,
    maxBatchSize: 100,
  },
}).pipe(Layer.provide(OpenAiClientLive))
```

#### Task 2.3: Adapt EmbeddingService (effect-code-writer)

```
Use the effect-code-writer agent to adapt EmbeddingService.

Target: packages/knowledge/server/src/Embedding/EmbeddingService.ts

Changes needed:
1. Import EmbeddingModel from @effect/ai
2. Replace EmbeddingProvider dependency with EmbeddingModel
3. Adapt embed() method to use EmbeddingModel.embed()
4. Adapt embedBatch() method to use EmbeddingModel.embedMany()
5. Remove TaskType parameter (or make optional/ignored)
```

#### Task 2.4: Update Mock Provider (effect-code-writer)

```
Use the effect-code-writer agent to update MockProvider.

Target: packages/knowledge/server/src/Embedding/providers/MockProvider.ts

Create mock implementing EmbeddingModel interface:

import * as EmbeddingModel from "@effect/ai/EmbeddingModel"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const MockEmbeddingLive: Layer.Layer<EmbeddingModel.EmbeddingModel> =
  Layer.effect(
    EmbeddingModel.EmbeddingModel,
    EmbeddingModel.make({
      maxBatchSize: 100,
      embedMany: (inputs) =>
        Effect.succeed(
          inputs.map((_, index) => ({
            index,
            embeddings: new Array(768).fill(0),
          }))
        ),
    })
  )
```

#### Task 2.5: Fix Package Errors (package-error-fixer)

```
Use the package-error-fixer agent to fix any type/build errors.

Target: @beep/knowledge-server

Run: bun run check --filter @beep/knowledge-server
Fix all errors iteratively.
```

### Phase 2 Completion Criteria

- [ ] Dependencies added to package.json
- [ ] `bun install` succeeds
- [ ] OpenAI client layer created
- [ ] OpenAI embedding layer created
- [ ] EmbeddingService adapted
- [ ] MockProvider updated
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] handoffs/HANDOFF_P3.md created
- [ ] handoffs/P3_ORCHESTRATOR_PROMPT.md created

---

## Phase 3: Verification

### Objective
Verify integration, run tests, fix edge cases, cleanup deprecated code.

### Agent Delegations

#### Task 3.1: Run Tests (orchestrator)

```bash
bun run test --filter @beep/knowledge-server
```

Document failures and delegate fixes.

#### Task 3.2: Update Tests (test-writer)

```
Use the test-writer agent to update tests for new patterns.

Targets:
- test/Embedding/EmbeddingService.test.ts
- test/Embedding/providers/*.test.ts

Ensure tests use MockEmbeddingLive layer.
```

#### Task 3.3: Cleanup Deprecated Code (effect-code-writer)

```
Use the effect-code-writer agent to cleanup deprecated code.

Tasks:
1. Remove custom OpenAI types from OpenAiProvider.ts
2. Remove unused EmbeddingError if replaced by AiError
3. Update exports in index.ts files
4. Remove 'openai' npm package from dependencies if no longer needed
```

#### Task 3.4: Final Verification (orchestrator)

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run lint:fix
```

### Phase 3 Completion Criteria

- [ ] All tests pass
- [ ] No type errors
- [ ] Deprecated code removed
- [ ] No lint errors
- [ ] Integration verified
- [ ] REFLECTION_LOG.md finalized
- [ ] Spec marked complete

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing consumers | Keep EmbeddingProvider as deprecated adapter initially |
| Test failures | Mock layer provides consistent behavior |
| Version incompatibility | Use workspace versions, verify compatibility |
| Missing @effect/ai features | Fallback to adapter pattern if needed |

---

## Verification Commands

```bash
# Type checking
bun run check --filter @beep/knowledge-server

# Tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint --filter @beep/knowledge-server

# Build
bun run build --filter @beep/knowledge-server
```
