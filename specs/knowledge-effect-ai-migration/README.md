# Knowledge Server @effect/ai Migration Spec

> Refactor `@beep/knowledge-server` to properly use `@effect/ai` and `@effect/ai-openai` instead of custom OpenAI implementation.

---

## Problem Statement

The `packages/knowledge/server/src/Embedding/` module currently uses a **custom OpenAI implementation** that:

1. **Bypasses official Effect patterns** - Uses direct `openai` npm package with dynamic imports
2. **Duplicates functionality** - Reimplements batching, caching, and error handling that `@effect/ai` provides
3. **Creates maintenance burden** - Custom interfaces that don't align with the Effect ecosystem
4. **Misses features** - No telemetry integration, no standardized error types, no data loader patterns

## Target State

Replace custom implementation with official `@effect/ai` and `@effect/ai-openai` packages:

- `EmbeddingModel` service tag from `@effect/ai`
- `OpenAiClient` and `OpenAiEmbeddingModel` from `@effect/ai-openai`
- `AiError` standardized error types
- Built-in batching, caching, and telemetry

## Complexity Assessment

| Factor | Weight | Value | Score |
|--------|--------|-------|-------|
| Phase Count | 2 | 4 | 8 |
| Agent Diversity | 3 | 4 | 12 |
| Cross-Package | 4 | 1 | 4 |
| External Deps | 3 | 2 | 6 |
| Uncertainty | 5 | 3 | 15 |
| Research Required | 2 | 4 | 8 |
| **Total** | | | **53** |

**Classification**: High Complexity - Requires MASTER_ORCHESTRATION, AGENT_PROMPTS, per-task checkpoints

---

## Current State Analysis

### Files Requiring Changes

| File | Current State | Target State |
|------|---------------|--------------|
| `Embedding/EmbeddingProvider.ts` | Custom interface with `TaskType` | Adapter around `EmbeddingModel` OR removal |
| `Embedding/providers/OpenAiProvider.ts` | Custom OpenAI with dynamic import | Use `@effect/ai-openai/OpenAiEmbeddingModel` |
| `Embedding/providers/MockProvider.ts` | Custom mock | Implement `EmbeddingModel` interface |
| `Embedding/EmbeddingService.ts` | Uses custom `EmbeddingProvider` | Use `EmbeddingModel` from `@effect/ai` |
| `package.json` | Missing deps | Add `@effect/ai`, `@effect/ai-openai` |

### Current Architecture

```
EmbeddingService
    └─► EmbeddingProvider (custom)
            └─► OpenAiProvider (custom, dynamic import of 'openai')
```

### Target Architecture

```
EmbeddingService (adapted)
    └─► EmbeddingModel (@effect/ai)
            └─► OpenAiEmbeddingModel.layerBatched (@effect/ai-openai)
                    └─► OpenAiClient (@effect/ai-openai)
                            └─► HttpClient (@effect/platform)
```

---

## Success Criteria

- [ ] `@effect/ai` and `@effect/ai-openai` added to `@beep/knowledge-server` dependencies
- [ ] `EmbeddingProvider` replaced/adapted to use `EmbeddingModel` from `@effect/ai`
- [ ] `OpenAiProvider.ts` replaced with `OpenAiEmbeddingModel` layer composition
- [ ] `EmbeddingService` works with new `EmbeddingModel` interface
- [ ] Existing tests pass (or are updated to match new patterns)
- [ ] `MockProvider` implements `EmbeddingModel` interface
- [ ] No direct `openai` npm package usage (use `@effect/ai-openai` instead)
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

---

## Phase Overview

| Phase | Name | Key Activities |
|-------|------|----------------|
| P0 | Discovery | Research `@effect/ai` patterns, map current usage |
| P1 | Planning | Design migration strategy, interface adapters |
| P2 | Implementation | Migrate embedding layer, update consumers |
| P3 | Verification | Test integration, fix edge cases, cleanup |

---

## Quick Start

```bash
# Start Phase 0 Discovery
# Copy-paste from: handoffs/P0_ORCHESTRATOR_PROMPT.md
```

---

## Primary Source References (AUTHORITATIVE)

**CRITICAL**: The following local source files are the AUTHORITATIVE reference for correct implementation. READ THESE FILES DIRECTLY - do not rely solely on MCP documentation or web searches.

### Source File 1: `tmp/effect/packages/ai/ai/src/EmbeddingModel.ts`

**Purpose**: Core `EmbeddingModel` interface and constructors

**Canonical Service Interface**:
```typescript
export interface Service {
  readonly embed: (input: string) => Effect.Effect<Array<number>, AiError.AiError>
  readonly embedMany: (input: ReadonlyArray<string>, options?: {
    readonly concurrency?: Types.Concurrency | undefined
  }) => Effect.Effect<Array<Array<number>>, AiError.AiError>
}
```

**Canonical Result Type**:
```typescript
export interface Result {
  readonly index: number
  readonly embeddings: Array<number>
}
```

**Canonical make() Constructor**:
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

### Source File 2: `tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts`

**Purpose**: OpenAI-specific embedding layer using `OpenAiClient`

**Canonical layerBatched() Pattern**:
```typescript
export const layerBatched = (options: {
  readonly model: (string & {}) | Model
  readonly config?: Config.Batched
}): Layer.Layer<EmbeddingModel.EmbeddingModel, never, OpenAiClient.OpenAiClient> =>
  Layer.effect(EmbeddingModel.EmbeddingModel, makeBatched(options))
```

**Canonical Config.Batched Interface**:
```typescript
interface Batched extends Omit<Config.Service, "model"> {
  readonly maxBatchSize?: number
  readonly cache?: {
    readonly capacity: number
    readonly timeToLive: Duration.DurationInput
  }
}
```

**Internal makeBatched() Pattern** (how it uses EmbeddingModel.make):
```typescript
const makeBatched = Effect.fnUntraced(function*(options) {
  const client = yield* OpenAiClient.OpenAiClient
  const { config = {}, model } = options
  const { cache, maxBatchSize = 2048, ...globalConfig } = config

  return yield* EmbeddingModel.make({
    cache,
    maxBatchSize,
    embedMany: Effect.fnUntraced(function*(input) {
      const request = yield* makeRequest(input)
      const response = yield* client.createEmbedding(request)
      return makeResults(response)  // Converts to Array<Result>
    })
  })
})
```

### Source File 3: `tmp/effect/packages/ai/openai/src/OpenAiClient.ts`

**Purpose**: HTTP client for OpenAI API

**Key Methods**:
- `createEmbedding(request)` - Calls OpenAI embeddings endpoint
- `layerConfig({apiKey, ...})` - Creates client layer from config

---

## Secondary References

| Document | Purpose |
|----------|---------|
| `.claude/rules/effect-patterns.md` | Effect patterns for this codebase |
| `specs/_guide/README.md` | Spec creation guide |
| Effect docs MCP | Supplementary API documentation |

---

## Entry Points

- **Start here**: [P0_ORCHESTRATOR_PROMPT.md](handoffs/P0_ORCHESTRATOR_PROMPT.md)
- **Detailed workflow**: [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md)
- **Agent prompts**: [AGENT_PROMPTS.md](AGENT_PROMPTS.md)
