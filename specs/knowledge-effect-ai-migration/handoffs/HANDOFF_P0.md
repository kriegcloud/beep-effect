# Handoff Document - Phase 0: Discovery

> Full context for Phase 0 of the Knowledge Server @effect/ai migration.

---

## Spec Overview

**Goal**: Migrate `@beep/knowledge-server` embedding layer from custom OpenAI implementation to official `@effect/ai` and `@effect/ai-openai` packages.

**Problem**: Custom `OpenAiProvider.ts` bypasses Effect ecosystem patterns, reimplements batching/caching, uses direct `openai` npm package with dynamic imports.

---

## Phase 0 Mission

Research and document `@effect/ai` and `@effect/ai-openai` APIs, map current embedding usage, and identify migration path.

---

## Key Research Questions

### @effect/ai Questions

1. What is the `EmbeddingModel` service interface?
2. How does `EmbeddingModel.make()` configure batching and caching?
3. What is `EmbeddingModel.Result` type shape?
4. How do `AiError` types work?

### @effect/ai-openai Questions

1. How does `OpenAiClient` service work?
2. What does `OpenAiEmbeddingModel.layerBatched()` require?
3. How do the layers compose?
4. What configuration options are available?

### Current Codebase Questions

1. Which services depend on `EmbeddingProvider`?
2. Is `TaskType` parameter actually used by OpenAI?
3. What `EmbeddingResult` fields are actually consumed?
4. How are embeddings provided in tests vs production?

---

## Source References (AUTHORITATIVE)

**CRITICAL**: The local Effect AI source files are the PRIMARY reference. READ THESE FILES DIRECTLY using the Read tool - do not rely solely on MCP documentation.

### Primary Source Files (READ THESE FIRST)

| File | Purpose | Key Exports |
|------|---------|-------------|
| `tmp/effect/packages/ai/ai/src/EmbeddingModel.ts` | **Core embedding interface** | `EmbeddingModel` (Context.Tag), `Service` interface, `Result` type, `make()`, `makeDataLoader()` |
| `tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts` | **OpenAI embedding layer** | `layerBatched()`, `layerDataLoader()`, `Config.Batched` |
| `tmp/effect/packages/ai/openai/src/OpenAiClient.ts` | **OpenAI HTTP client** | `OpenAiClient` (Context.Tag), `layerConfig()`, `createEmbedding()` |

### Canonical Patterns (Extracted from Source)

**EmbeddingModel.Service Interface** (from `EmbeddingModel.ts:102-116`):
```typescript
export interface Service {
  readonly embed: (input: string) => Effect.Effect<Array<number>, AiError.AiError>
  readonly embedMany: (input: ReadonlyArray<string>, options?: {
    readonly concurrency?: Types.Concurrency | undefined
  }) => Effect.Effect<Array<Array<number>>, AiError.AiError>
}
```

**EmbeddingModel.Result Type** (from `EmbeddingModel.ts:140-150`):
```typescript
export interface Result {
  readonly index: number
  readonly embeddings: Array<number>
}
```

**EmbeddingModel.make() Constructor** (from `EmbeddingModel.ts:192-215`):
```typescript
export const make = (options: {
  readonly embedMany: (input: ReadonlyArray<string>) => Effect.Effect<Array<Result>, AiError.AiError>
  readonly maxBatchSize?: number
  readonly cache?: {
    readonly capacity: number
    readonly timeToLive: Duration.DurationInput
  }
}) => Effect.gen(function*() { ... })
```

**OpenAiEmbeddingModel.layerBatched()** (from `OpenAiEmbeddingModel.ts:187-191`):
```typescript
export const layerBatched = (options: {
  readonly model: (string & {}) | Model
  readonly config?: Config.Batched
}): Layer.Layer<EmbeddingModel.EmbeddingModel, never, OpenAiClient.OpenAiClient> =>
  Layer.effect(EmbeddingModel.EmbeddingModel, makeBatched(options))
```

### Secondary Sources (Supplementary)

| File | Purpose |
|------|---------|
| `tmp/effect/packages/ai/ai/src/AiError.ts` | Error types |
| Effect docs MCP | Supplementary API documentation |

### Current Implementation

| File | Purpose |
|------|---------|
| `packages/knowledge/server/src/Embedding/EmbeddingProvider.ts` | Custom interface |
| `packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts` | Custom OpenAI impl |
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | Service layer |

---

## Agent Delegations for Phase 0

### 1. mcp-researcher: @effect/ai API Research

Research EmbeddingModel interface, constructors, and error types. See AGENT_PROMPTS.md for full prompt.

### 2. mcp-researcher: @effect/ai-openai API Research

Research OpenAiClient, OpenAiEmbeddingModel, and layer composition. See AGENT_PROMPTS.md for full prompt.

### 3. codebase-researcher: Current Usage Mapping

Analyze which services use EmbeddingProvider and how. See AGENT_PROMPTS.md for full prompt.

---

## Expected Outputs

| Output | Location |
|--------|----------|
| @effect/ai API documentation | Orchestrator synthesis |
| @effect/ai-openai API documentation | Orchestrator synthesis |
| Current usage map | Orchestrator synthesis |
| Gap analysis | REFLECTION_LOG.md |

---

## Success Criteria

- [ ] `@effect/ai` EmbeddingModel API documented
- [ ] `@effect/ai-openai` OpenAI embedding patterns documented
- [ ] Current embedding usage mapped
- [ ] Gap analysis complete (what custom features need preservation)
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] handoffs/HANDOFF_P1.md created
- [ ] handoffs/P1_ORCHESTRATOR_PROMPT.md created

---

## Verification Commands

```bash
# Verify Effect AI source is available
ls tmp/effect/packages/ai/ai/src/EmbeddingModel.ts
ls tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts

# Verify current implementation exists
ls packages/knowledge/server/src/Embedding/
```

---

## Next Phase Preview

Phase 1 will use the research outputs to design the migration strategy, including:
- Decision on adapter pattern vs direct replacement
- TaskType handling strategy
- EmbeddingResult mapping approach
- Implementation order
