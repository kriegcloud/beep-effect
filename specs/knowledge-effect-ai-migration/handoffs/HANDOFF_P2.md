# Handoff Document - Phase 2: Implementation

> Implementation details for Phase 2 of the Knowledge Server @effect/ai migration.

---

## Phase 1 Summary

**Completed**: 2026-01-22

### Final Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| 1. Adapter vs Direct | **Option B: Partial Replacement** | EmbeddingService unchanged, remove EmbeddingProvider |
| 2. TaskType | **Option B: Keep in interface** | Backward compatible, ignore in implementation |
| 3. Caching | **Option A: pgvector only** | Persistence valuable, no dual-cache complexity |
| 4. Error Mapping | **Option A: Map AiError → EmbeddingError** | Preserve contract, single transformation point |
| 5. Dimensions | **Confirmed supported** | Pass via `config: { dimensions: 768 }` |

---

## Implementation Plan

### Step 1: Update EmbeddingService to use EmbeddingModel

**File**: `packages/knowledge/server/src/Embedding/EmbeddingService.ts`

**Changes**:

1. Replace `EmbeddingProvider` import with `EmbeddingModel`:
```typescript
// BEFORE
import { EmbeddingError, EmbeddingProvider, type TaskType } from "./EmbeddingProvider";

// AFTER
import { EmbeddingModel } from "@effect/ai/EmbeddingModel";
import { AiError } from "@effect/ai/AiError";
import { EmbeddingError, type TaskType } from "./EmbeddingProvider";
```

2. Update service effect to use EmbeddingModel:
```typescript
// BEFORE
const provider = yield* EmbeddingProvider;

// AFTER
const embeddingModel = yield* EmbeddingModel.EmbeddingModel;
```

3. Replace `provider.embed(text, taskType)` with:
```typescript
const vector = yield* embeddingModel.embed(text).pipe(
  Effect.mapError(mapAiError)
);
```

4. Replace `provider.embedBatch(texts, taskType)` with:
```typescript
const vectors = yield* embeddingModel.embedMany(texts).pipe(
  Effect.mapError(mapAiError)
);
```

5. Add error mapping function:
```typescript
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

6. Update `EmbeddingServiceLive` layer composition:
```typescript
// BEFORE
export const EmbeddingServiceLive = EmbeddingService.Default.pipe(
  Layer.provide(EmbeddingRepo.Default)
);

// AFTER - EmbeddingModel.EmbeddingModel must be provided by caller
export const EmbeddingServiceLive = EmbeddingService.Default.pipe(
  Layer.provide(EmbeddingRepo.Default)
);
```

7. Remove `provider.config` usage:
   - Model name for caching: Use hardcoded constant or config
   - `getConfig()` method: Return static config or remove

---

### Step 2: Create @effect/ai-based Mock Provider

**File**: `packages/knowledge/server/src/Embedding/providers/MockProvider.ts`

**Purpose**: Implement `EmbeddingModel.Service` interface for testing.

```typescript
import { EmbeddingModel } from "@effect/ai/EmbeddingModel";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const MOCK_DIMENSIONS = 768;

/**
 * Mock EmbeddingModel implementation for testing
 */
const mockService: EmbeddingModel.Service = {
  embed: (_input: string) =>
    Effect.succeed(A.replicate(0, MOCK_DIMENSIONS)),

  embedMany: (inputs: ReadonlyArray<string>) =>
    Effect.succeed(
      A.map(inputs, () => A.replicate(0, MOCK_DIMENSIONS))
    ),
};

/**
 * Layer providing mock EmbeddingModel for tests
 */
export const MockEmbeddingModelLayer = Layer.succeed(
  EmbeddingModel.EmbeddingModel,
  mockService
);
```

---

### Step 3: Create OpenAI Layer Factory

**File**: `packages/knowledge/server/src/Embedding/providers/OpenAiLayer.ts` (NEW)

**Purpose**: Provide preconfigured OpenAI embedding layer.

```typescript
import { OpenAiClient, OpenAiEmbeddingModel } from "@effect/ai-openai";
import { BunHttpClient } from "@effect/platform-bun";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

const DEFAULT_MODEL = "text-embedding-3-small";
const DEFAULT_DIMENSIONS = 768;

export interface OpenAiEmbeddingConfig {
  readonly model?: string;
  readonly dimensions?: number;
}

/**
 * Create OpenAI EmbeddingModel layer from options
 */
export const makeOpenAiEmbeddingLayer = (options?: OpenAiEmbeddingConfig) =>
  OpenAiEmbeddingModel.layerBatched({
    model: options?.model ?? DEFAULT_MODEL,
    config: {
      dimensions: options?.dimensions ?? DEFAULT_DIMENSIONS,
    },
  });

/**
 * OpenAI EmbeddingModel layer reading API key from config
 */
export const OpenAiEmbeddingLayerConfig = Layer.unwrapEffect(
  Effect.gen(function* () {
    const apiKey = yield* Config.redacted("OPENAI_API_KEY");
    const model = yield* Config.string("OPENAI_EMBEDDING_MODEL").pipe(
      Config.withDefault(DEFAULT_MODEL)
    );
    const dimensions = yield* Config.integer("OPENAI_EMBEDDING_DIMENSIONS").pipe(
      Config.withDefault(DEFAULT_DIMENSIONS)
    );

    return makeOpenAiEmbeddingLayer({ model, dimensions }).pipe(
      Layer.provide(OpenAiClient.layer({ apiKey })),
      Layer.provide(BunHttpClient.layer)
    );
  })
);

/**
 * OpenAI EmbeddingModel layer with explicit options
 */
export const OpenAiEmbeddingLayer = (apiKey: string, options?: OpenAiEmbeddingConfig) =>
  makeOpenAiEmbeddingLayer(options).pipe(
    Layer.provide(OpenAiClient.layer({
      apiKey: Redacted.make(apiKey),
    })),
    Layer.provide(BunHttpClient.layer)
  );
```

---

### Step 4: Update Exports

**File**: `packages/knowledge/server/src/Embedding/index.ts`

```typescript
// Provider interface and types (keep for backward compatibility)
export {
  type EmbeddingConfig,
  EmbeddingError,
  // EmbeddingProvider,  // Deprecated - remove or mark @deprecated
  type EmbeddingResult,
  // MockEmbeddingProvider,  // Deprecated
  // MockEmbeddingProviderLayer,  // Deprecated
  type TaskType,
} from "./EmbeddingProvider";

// Service
export { EmbeddingService, EmbeddingServiceLive } from "./EmbeddingService";

// New: @effect/ai-based layers
export {
  MockEmbeddingModelLayer,
} from "./providers/MockProvider";

export {
  OpenAiEmbeddingLayer,
  OpenAiEmbeddingLayerConfig,
  type OpenAiEmbeddingConfig,
} from "./providers/OpenAiLayer";
```

---

### Step 5: Delete Obsolete Files

**Files to delete**:
1. `packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts`
   - Replaced by `OpenAiLayer.ts`

**Files to keep (modified)**:
1. `EmbeddingProvider.ts` - Keep `EmbeddingError`, `TaskType` types; deprecate `EmbeddingProvider` interface
2. `MockProvider.ts` - Rewrite for `EmbeddingModel.Service`

---

### Step 6: Update Layer Composition in Knowledge Server

**File**: `packages/knowledge/server/src/index.ts` (or wherever KnowledgeLive is composed)

```typescript
import { EmbeddingServiceLive, OpenAiEmbeddingLayerConfig } from "./Embedding";

export const KnowledgeServerLive = Layer.mergeAll(
  EmbeddingServiceLive,
  // ... other services
).pipe(
  Layer.provide(OpenAiEmbeddingLayerConfig)
);
```

---

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `EmbeddingService.ts` | **Modify** | Use EmbeddingModel, add error mapping |
| `EmbeddingProvider.ts` | **Modify** | Keep types, deprecate interface |
| `providers/MockProvider.ts` | **Rewrite** | Implement EmbeddingModel.Service |
| `providers/OpenAiProvider.ts` | **Delete** | Replaced by @effect/ai-openai |
| `providers/OpenAiLayer.ts` | **Create** | New layer factory |
| `providers/index.ts` | **Modify** | Update exports |
| `index.ts` | **Modify** | Update exports |

---

## Testing Strategy

### Unit Tests

1. **EmbeddingService tests** (`test/Embedding/EmbeddingService.test.ts`):
   - Mock `EmbeddingModel.EmbeddingModel` using `MockEmbeddingModelLayer`
   - Test embed() returns correct vector
   - Test embedEntities() batches correctly
   - Test error mapping: AiError → EmbeddingError

2. **Error mapping tests**:
   - `HttpRequestError` → `retryable: true`
   - `HttpResponseError` → `retryable: true`
   - `MalformedInput` → `retryable: false`
   - `UnknownError` → `retryable: false`

### Integration Tests

1. **Layer composition test**:
   - Verify `EmbeddingServiceLive` works with `MockEmbeddingModelLayer`
   - Verify pgvector caching still functions

2. **Real OpenAI test** (manual/CI with secrets):
   - Verify `OpenAiEmbeddingLayerConfig` works end-to-end
   - Verify dimensions = 768 produces correct vector length

---

## Verification Checklist

### Pre-Implementation
- [ ] Confirm @effect/ai version compatibility (currently ^0.33.2)
- [ ] Confirm @effect/ai-openai version compatibility (currently ^0.37.2)
- [ ] Review AiError union types in source

### Post-Implementation
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] No EmbeddingProvider usage remains in EmbeddingService
- [ ] Error types are preserved (EmbeddingError)
- [ ] TaskType still accepted (but ignored)
- [ ] pgvector caching unchanged
- [ ] Layer composition documented

---

## Reference Files

### Source (AUTHORITATIVE)
| File | Key Content |
|------|-------------|
| `tmp/effect/packages/ai/ai/src/EmbeddingModel.ts` | Service interface |
| `tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts` | layerBatched() |
| `tmp/effect/packages/ai/ai/src/AiError.ts` | Error union type |

### Current Implementation
| File | Purpose |
|------|---------|
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | Target for changes |
| `packages/knowledge/server/src/Embedding/EmbeddingProvider.ts` | Types to preserve |
| `packages/knowledge/server/src/Embedding/providers/` | Providers to replace |

---

## Success Criteria for Phase 2

- [ ] EmbeddingService uses EmbeddingModel.EmbeddingModel
- [ ] Error mapping preserves EmbeddingError contract
- [ ] TaskType parameter kept but ignored
- [ ] pgvector caching unchanged
- [ ] MockEmbeddingModelLayer created for tests
- [ ] OpenAiEmbeddingLayer created with config support
- [ ] OpenAiProvider.ts deleted
- [ ] All tests pass
- [ ] Type check passes
