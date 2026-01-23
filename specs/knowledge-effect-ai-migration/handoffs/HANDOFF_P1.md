# Handoff Document - Phase 1: Planning

> Full context for Phase 1 of the Knowledge Server @effect/ai migration.

---

## Phase 0 Summary

**Completed**: 2026-01-22

### Key Findings

#### 1. API Interface Comparison

| Feature | Custom EmbeddingProvider | @effect/ai EmbeddingModel |
|---------|-------------------------|---------------------------|
| Single embed | `embed(text, taskType) → EmbeddingResult` | `embed(input) → Array<number>` |
| Batch embed | `embedBatch(texts, taskType) → EmbeddingResult[]` | `embedMany(inputs) → Array<Array<number>>` |
| Return type | `{ vector, model, usage }` | Raw `Array<number>` |
| Error type | `EmbeddingError` | `AiError.AiError` |
| TaskType | 4 types (1 unused) | None |
| Caching | pgvector (EmbeddingRepo) | In-memory Request.Cache |

#### 2. Current Architecture

```
EmbeddingProvider (custom interface)
       ↓
EmbeddingService (caching facade)
       ↓
┌──────┴────────┬────────────────┐
│               │                │
GraphRAGService GroundingService EntityClusterer
```

#### 3. Target Architecture

```
EmbeddingModel.EmbeddingModel (@effect/ai Context.Tag)
       ↓
OpenAiEmbeddingModel.layerBatched (provides EmbeddingModel)
       ↓
OpenAiClient.layer (provides OpenAiClient)
       ↓
HttpClient.layer (@effect/platform-bun)
```

---

## Phase 1 Mission

Design the migration strategy by making decisions on:

1. **Adapter Pattern vs Direct Replacement**
2. **TaskType Handling Strategy**
3. **Caching Strategy**
4. **Error Mapping Strategy**
5. **Interface Changes**

---

## Decision Points

### Decision 1: Adapter Pattern vs Direct Replacement

**Option A: Adapter Pattern**
- Keep `EmbeddingProvider` interface
- Create `EffectAiEmbeddingProvider` that wraps `EmbeddingModel.EmbeddingModel`
- EmbeddingService unchanged
- Lowest risk, highest code duplication

**Option B: Partial Replacement**
- Update `EmbeddingService` to use `EmbeddingModel.EmbeddingModel` directly
- Keep EmbeddingService public interface
- Remove EmbeddingProvider abstraction
- Medium risk, clean architecture

**Option C: Full Replacement**
- Remove EmbeddingService caching layer
- Consumers use `EmbeddingModel.EmbeddingModel` directly
- Highest risk, most code changes

**Recommendation**: Option B - EmbeddingService as the only consumer of EmbeddingProvider makes Option B viable with minimal consumer impact.

### Decision 2: TaskType Handling

**Finding**: TaskType is NOT used by OpenAI provider (identical processing for all types).

**Options**:
A. Remove TaskType entirely (breaking change to EmbeddingService)
B. Keep TaskType in EmbeddingService interface but ignore in implementation
C. Keep TaskType for future multi-provider support (Nomic, Voyage use prefixes)

**Recommendation**: Option B for now, with TODO for Option C.

### Decision 3: Caching Strategy

**Current**: pgvector-based caching in EmbeddingService using EmbeddingRepo.

**@effect/ai Option**: In-memory `Request.Cache` with capacity and TTL.

**Options**:
A. Keep pgvector caching only (persisted, cross-session)
B. Use @effect/ai caching only (in-memory, per-session)
C. Both: @effect/ai for hot cache, pgvector for persistence

**Recommendation**: Option A - pgvector caching provides persistence and is already working. @effect/ai caching adds complexity for marginal benefit.

### Decision 4: Error Mapping

**Current Error**:
```typescript
class EmbeddingError extends S.TaggedError<EmbeddingError>()("EmbeddingError", {
  message: S.String,
  provider: S.String,
  retryable: S.Boolean,
  cause: S.optional(S.String),
})
```

**@effect/ai Errors**: `HttpRequestError | HttpResponseError | MalformedInput | MalformedOutput | UnknownError`

**Options**:
A. Map `AiError` → `EmbeddingError` in EmbeddingService
B. Update consumers to handle `AiError.AiError`
C. Create union type `EmbeddingError | AiError.AiError`

**Recommendation**: Option A - Preserve EmbeddingService interface contract.

### Decision 5: Dimensions Configuration

**Current**: `OpenAiProviderOptions.dimensions` (default 768)

**@effect/ai-openai**: Via `Config.Service.dimensions` field in `layerBatched()` config.

**Finding**: `OpenAiEmbeddingModel.Config.Batched` extends `Config.Service` which includes all OpenAI embedding request params including `dimensions`.

**Action**: Pass dimensions via config:
```typescript
OpenAiEmbeddingModel.layerBatched({
  model: "text-embedding-3-small",
  config: { dimensions: 768 }
})
```

---

## Implementation Plan Outline

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `EmbeddingService.ts` | Modify | Replace EmbeddingProvider with EmbeddingModel |
| `EmbeddingProvider.ts` | Keep/Adapt | Keep for type definitions or remove |
| `providers/OpenAiProvider.ts` | Delete | Replaced by @effect/ai-openai |
| `providers/MockProvider.ts` | Rewrite | Implement EmbeddingModel.Service |
| `package.json` | Modify | Add @effect/ai, @effect/ai-openai deps |

### Files NOT Needing Changes

| File | Reason |
|------|--------|
| `GraphRAGService.ts` | Uses EmbeddingService (unchanged interface) |
| `GroundingService.ts` | Uses EmbeddingService (unchanged interface) |
| `EntityClusterer.ts` | Uses EmbeddingService (unchanged interface) |

### Layer Composition Change

**Before**:
```typescript
const KnowledgeLive = Layer.mergeAll(
  EmbeddingServiceLive,
  OpenAiProviderLayer({ apiKey }),
  // ...
);
```

**After**:
```typescript
import { OpenAiClient, OpenAiEmbeddingModel } from "@effect/ai-openai";
import { BunHttpClient } from "@effect/platform-bun";

const EmbeddingLive = OpenAiEmbeddingModel.layerBatched({
  model: "text-embedding-3-small",
  config: { dimensions: 768 }
}).pipe(
  Layer.provide(OpenAiClient.layerConfig({
    apiKey: Config.redacted("OPENAI_API_KEY")
  })),
  Layer.provide(BunHttpClient.layer)
);

const KnowledgeLive = Layer.mergeAll(
  EmbeddingServiceLive,
  // ...
).pipe(
  Layer.provide(EmbeddingLive)
);
```

---

## Testing Strategy

### Unit Tests

1. **EmbeddingService tests** - Mock `EmbeddingModel.EmbeddingModel` service
2. **Error mapping tests** - Verify `AiError` → `EmbeddingError` conversion

### Integration Tests

1. **Layer composition** - Verify full stack works with real OpenAI
2. **Mock provider** - Verify mock provider implements `EmbeddingModel.Service`

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| EmbeddingService interface change | Medium | Keep TaskType param, ignore in impl |
| Error contract change | Low | Map errors, preserve contract |
| Layer composition complexity | Medium | Document clearly, test thoroughly |
| Missing @effect/ai feature | Low | Fallback to custom impl if needed |

---

## Success Criteria for Phase 1

- [ ] Decision on adapter vs direct replacement finalized
- [ ] TaskType handling strategy documented
- [ ] Caching strategy decided
- [ ] Error mapping strategy documented
- [ ] Implementation order defined
- [ ] Test strategy outlined
- [ ] REFLECTION_LOG.md updated
- [ ] handoffs/HANDOFF_P2.md created
- [ ] handoffs/P2_ORCHESTRATOR_PROMPT.md created

---

## Reference Files

### Source Files (AUTHORITATIVE)

| File | Key Patterns |
|------|--------------|
| `tmp/effect/packages/ai/ai/src/EmbeddingModel.ts` | Service interface, make(), Result type |
| `tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts` | layerBatched(), Config.Batched |
| `tmp/effect/packages/ai/openai/src/OpenAiClient.ts` | layer(), layerConfig() |
| `tmp/effect/packages/ai/ai/src/AiError.ts` | AiError union type |

### Current Implementation

| File | Purpose |
|------|---------|
| `packages/knowledge/server/src/Embedding/EmbeddingProvider.ts` | Custom interface |
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | Caching facade |
| `packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts` | Custom OpenAI impl |
| `packages/knowledge/server/src/Embedding/providers/MockProvider.ts` | Test mock |

---

## Next Phase Preview

Phase 2 will implement:
1. Add dependencies to package.json
2. Rewrite EmbeddingService to use EmbeddingModel
3. Create new mock provider
4. Delete OpenAiProvider.ts
5. Update layer composition
