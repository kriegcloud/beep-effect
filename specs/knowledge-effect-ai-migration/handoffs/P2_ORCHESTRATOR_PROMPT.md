# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 of the Knowledge Server @effect/ai migration.

---

## Prompt

You are executing Phase 2 (Implementation) of the `knowledge-effect-ai-migration` spec.

### Context

Phase 1 Planning is complete. Final decisions:

| Decision | Choice |
|----------|--------|
| Adapter vs Direct | **Option B: Partial Replacement** - Update EmbeddingService, remove EmbeddingProvider |
| TaskType | **Option B: Keep in interface** - Accept param but ignore in implementation |
| Caching | **Option A: pgvector only** - Keep existing caching, no @effect/ai cache |
| Error Mapping | **Option A: Map AiError → EmbeddingError** - Single transformation in EmbeddingService |
| Dimensions | Pass via `config: { dimensions: 768 }` |

### Your Mission

Implement the @effect/ai migration following the implementation plan.

### Implementation Steps

Execute these steps IN ORDER:

#### Step 1: Update EmbeddingService (CRITICAL)

**READ** the current implementation:
```
packages/knowledge/server/src/Embedding/EmbeddingService.ts
```

**MODIFY** to:
1. Import `EmbeddingModel` from `@effect/ai/EmbeddingModel`
2. Import `AiError` from `@effect/ai/AiError`
3. Replace `EmbeddingProvider` dependency with `EmbeddingModel.EmbeddingModel`
4. Replace `provider.embed(text, taskType)` with `embeddingModel.embed(text)`
5. Replace `provider.embedBatch(texts, taskType)` with `embeddingModel.embedMany(texts)`
6. Add `mapAiError()` function to convert AiError → EmbeddingError
7. Handle missing `provider.config.model` - use constant or env config

**IMPORTANT**: Keep the `taskType` parameter in the public interface but do NOT use it.

#### Step 2: Create OpenAI Layer Factory

**CREATE** new file:
```
packages/knowledge/server/src/Embedding/providers/OpenAiLayer.ts
```

**Contents**:
- `makeOpenAiEmbeddingLayer(options)` - Factory function
- `OpenAiEmbeddingLayerConfig` - Layer reading from Effect Config
- `OpenAiEmbeddingLayer(apiKey, options)` - Layer with explicit API key

**Reference**: See `handoffs/HANDOFF_P2.md` Step 3 for code template.

#### Step 3: Rewrite MockProvider

**MODIFY** file:
```
packages/knowledge/server/src/Embedding/providers/MockProvider.ts
```

**Changes**:
- Implement `EmbeddingModel.Service` interface instead of `EmbeddingProvider`
- Export `MockEmbeddingModelLayer` (Layer providing `EmbeddingModel.EmbeddingModel`)
- Keep mock returning zero vectors of dimension 768

#### Step 4: Update Exports

**MODIFY** files:
```
packages/knowledge/server/src/Embedding/index.ts
packages/knowledge/server/src/Embedding/providers/index.ts
```

**Changes**:
- Export new layers: `MockEmbeddingModelLayer`, `OpenAiEmbeddingLayer`, `OpenAiEmbeddingLayerConfig`
- Deprecate or remove: `EmbeddingProvider`, `MockEmbeddingProvider`, `MockEmbeddingProviderLayer`
- Keep: `EmbeddingError`, `TaskType`, `EmbeddingService`, `EmbeddingServiceLive`

#### Step 5: Delete OpenAiProvider

**DELETE** file:
```
packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts
```

This is replaced by `OpenAiLayer.ts` using @effect/ai-openai.

#### Step 6: Verify

**RUN** verification commands:
```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

### Error Mapping Reference

Use this function in EmbeddingService:

```typescript
import { AiError } from "@effect/ai/AiError";
import * as Match from "effect/Match";
import * as O from "effect/Option";

const mapAiError = (error: AiError.AiError): EmbeddingError =>
  new EmbeddingError({
    message: error.message,
    provider: "openai",
    retryable: Match.value(error._tag).pipe(
      Match.when("HttpRequestError", () => true),
      Match.when("HttpResponseError", () => true),
      Match.orElse(() => false)
    ),
    cause: O.some(JSON.stringify({ _tag: error._tag })),
  });
```

### Layer Composition Reference

The new dependency graph:

```
EmbeddingService.Default
    requires: EmbeddingModel.EmbeddingModel, EmbeddingRepo
         ↓
OpenAiEmbeddingModel.layerBatched({ model, config: { dimensions } })
    requires: OpenAiClient.OpenAiClient
         ↓
OpenAiClient.layer({ apiKey })
    requires: HttpClient.HttpClient
         ↓
BunHttpClient.layer
```

### Gotchas to Watch

1. **Model name for caching**: Current code uses `provider.config.model` for cache key. You'll need to:
   - Either inject model name via config
   - Or use a constant (e.g., `"text-embedding-3-small"`)

2. **EmbeddingModel returns Array<number>**: Not `EmbeddingResult`. No `usage` field. Handle this in EmbeddingService.

3. **embedMany returns Array<Array<number>>**: Need to map to internal format.

4. **HttpClient dependency**: `OpenAiClient.layer` requires `HttpClient.HttpClient`. Use `BunHttpClient.layer` from `@effect/platform-bun`.

5. **Config.redacted**: Use `Config.redacted("OPENAI_API_KEY")` not `Config.string()` for API keys.

### Outputs

1. **Modified EmbeddingService.ts** - Uses EmbeddingModel.EmbeddingModel
2. **New OpenAiLayer.ts** - Factory for OpenAI layers
3. **Modified MockProvider.ts** - Implements EmbeddingModel.Service
4. **Updated exports** - index.ts files
5. **Deleted OpenAiProvider.ts** - Replaced by @effect/ai-openai
6. **Update REFLECTION_LOG.md** - Document Phase 2 challenges and patterns

### Success Criteria

- [ ] EmbeddingService compiles with EmbeddingModel.EmbeddingModel dependency
- [ ] Error mapping converts all AiError variants to EmbeddingError
- [ ] TaskType parameter accepted but not used
- [ ] MockEmbeddingModelLayer works for tests
- [ ] OpenAiEmbeddingLayer properly configured with dimensions=768
- [ ] OpenAiProvider.ts deleted
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

### Handoff Document

Read full implementation details in: `specs/knowledge-effect-ai-migration/handoffs/HANDOFF_P2.md`

### After Completion

Update `REFLECTION_LOG.md` Phase 2 section with:
- Any challenges encountered
- Patterns that worked well
- Anti-patterns discovered

Then create `HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md` for Phase 3 (Verification & Cleanup).
