# Reflection Log - Knowledge Server @effect/ai Migration

> Cumulative learnings and pattern discoveries throughout the migration.

---

## Phase 0: Discovery

**Completed**: 2026-01-22

### Research Insights

#### @effect/ai EmbeddingModel API (Source: `tmp/effect/packages/ai/ai/src/EmbeddingModel.ts`)

**Service Interface** (lines 102-116):
```typescript
interface Service {
  readonly embed: (input: string) => Effect.Effect<Array<number>, AiError.AiError>
  readonly embedMany: (input: ReadonlyArray<string>, options?: {
    readonly concurrency?: Types.Concurrency | undefined
  }) => Effect.Effect<Array<Array<number>>, AiError.AiError>
}
```

**Result Type** (lines 140-150):
```typescript
interface Result {
  readonly index: number
  readonly embeddings: Array<number>
}
```

**Key Insight**: `EmbeddingModel.Result` is an intermediate type used by the `make()` constructor. The final `Service` interface returns `Array<number>` directly (not `Result`).

**Constructors**:
- `make()` - Primary constructor with batching + caching (lines 192-256)
- `makeDataLoader()` - Time-window batching via `@effect/experimental` (lines 269-311)

#### @effect/ai-openai OpenAiEmbeddingModel API (Source: `tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts`)

**Layer Creation**:
```typescript
// layerBatched (lines 187-191)
layerBatched(options: {
  readonly model: (string & {}) | Model
  readonly config?: Config.Batched
}): Layer.Layer<EmbeddingModel.EmbeddingModel, never, OpenAiClient.OpenAiClient>

// Config.Batched (lines 65-71)
interface Batched extends Omit<Config.Service, "model"> {
  readonly maxBatchSize?: number
  readonly cache?: {
    readonly capacity: number
    readonly timeToLive: Duration.DurationInput
  }
}
```

**Internal Implementation** (lines 112-144): Uses `EmbeddingModel.make()` internally, calling `client.createEmbedding()` and converting response to `Result` format.

#### @effect/ai-openai OpenAiClient API (Source: `tmp/effect/packages/ai/openai/src/OpenAiClient.ts`)

**Layer Creation**:
```typescript
// layer (lines 234-240)
layer(options: {
  readonly apiKey?: Redacted.Redacted | undefined
  readonly apiUrl?: string | undefined
  readonly organizationId?: Redacted.Redacted | undefined
  readonly projectId?: Redacted.Redacted | undefined
  readonly transformClient?: (client: HttpClient.HttpClient) => HttpClient.HttpClient
}): Layer.Layer<OpenAiClient, never, HttpClient.HttpClient>

// layerConfig (lines 246-260) - reads from Effect Config
```

**Dependency**: Requires `HttpClient.HttpClient` from `@effect/platform`.

#### AiError Types (Source: `tmp/effect/packages/ai/ai/src/AiError.ts`)

Union type `AiError.AiError` includes:
- `HttpRequestError` - Network/encoding issues
- `HttpResponseError` - HTTP status code errors
- `MalformedInput` - Input validation failures
- `MalformedOutput` - Response parsing failures
- `UnknownError` - Catch-all

### Codebase Patterns Discovered

#### 1. EmbeddingService as Facade

`EmbeddingProvider` is consumed ONLY by `EmbeddingService`. All other services use `EmbeddingService`:
- `GraphRAGService` → `EmbeddingService.embed()`
- `GroundingService` → `EmbeddingService.embed()`
- `EntityClusterer` → `EmbeddingService.getOrCreate()`

**Implication**: Migration can focus on `EmbeddingService` layer without touching consumers.

#### 2. TaskType Usage

| TaskType | Actually Used | By Service |
|----------|---------------|------------|
| `search_query` | ✅ | GraphRAGService, GroundingService, EntityClusterer |
| `search_document` | ✅ | GroundingService, EntityClusterer |
| `clustering` | ✅ | EmbeddingService, EntityClusterer |
| `classification` | ❌ Never used | - |

**Implication**: `classification` can be removed. TaskType itself is not used by OpenAI provider (identical processing for all types).

#### 3. EmbeddingResult Field Consumption

| Field | Consumed | By |
|-------|----------|-----|
| `vector` | ✅ | EmbeddingService (stores, returns) |
| `model` | ✅ | EmbeddingService (stores in cache) |
| `usage.totalTokens` | ❌ Never read | - |

**Implication**: Can simplify interface; usage tracking is dead code.

#### 4. Layer Composition Pattern

Current:
```
EmbeddingProvider (custom)
       ↓
EmbeddingService.Default (requires EmbeddingProvider + EmbeddingRepo)
       ↓
EmbeddingServiceLive (provides EmbeddingRepo.Default)
```

Target:
```
EmbeddingModel.EmbeddingModel (@effect/ai)
       ↓ (provided by)
OpenAiEmbeddingModel.layerBatched() (@effect/ai-openai)
       ↓ (requires)
OpenAiClient.layer() (@effect/ai-openai)
       ↓ (requires)
HttpClient.layer (@effect/platform-bun)
```

### Gotchas Identified

#### 1. Interface Mismatch

| Custom | @effect/ai |
|--------|-----------|
| `embed(text, taskType)` → `EmbeddingResult` | `embed(input)` → `Array<number>` |
| `embedBatch(texts, taskType)` → `ReadonlyArray<EmbeddingResult>` | `embedMany(inputs)` → `Array<Array<number>>` |
| Returns `{ vector, model, usage }` | Returns raw vector only |

**Action Needed**: EmbeddingService must be adapted to:
1. Drop TaskType from interface OR handle internally
2. Track model name separately (not from each result)
3. Accept raw vector arrays instead of EmbeddingResult

#### 2. Caching Architecture Difference

Custom caching: `EmbeddingService` does pgvector-based caching via `EmbeddingRepo`.

@effect/ai caching: `EmbeddingModel.make()` has built-in in-memory `Request.makeCache()`.

**Decision Needed**: Keep pgvector caching? Use @effect/ai caching? Both?

#### 3. Dynamic Import Removal

Current `OpenAiProvider.ts` uses:
```typescript
const { default: OpenAI } = yield* Effect.tryPromise({
  try: () => import("openai"),
  ...
});
```

With @effect/ai-openai: No dynamic import needed; HTTP client is injected via Layer.

#### 4. Error Type Migration

Custom `EmbeddingError`:
```typescript
class EmbeddingError extends S.TaggedError<EmbeddingError>()("EmbeddingError", {
  message: S.String,
  provider: S.String,
  retryable: S.Boolean,
  cause: S.optional(S.String),
})
```

@effect/ai errors: `AiError.AiError` union (HttpRequestError, HttpResponseError, etc.)

**Action Needed**: Either:
- Map `AiError` → `EmbeddingError` (preserve consumer interface)
- Update consumers to handle `AiError` directly (breaking change)

#### 5. Dimensions Configuration

Current: `OpenAiProviderOptions.dimensions` configures vector size (default 768).

@effect/ai-openai: Dimensions set via `Config.Service.dimensions` field.

Need to verify: Does `OpenAiEmbeddingModel.layerBatched()` support dimensions override?

---

## Phase 1: Planning

**Completed**: 2026-01-22

### Design Decisions

#### Decision 1: Adapter vs Direct Replacement → **Option B (Partial Replacement)**

**Analysis**:
- EmbeddingProvider IS exported from public API (`packages/knowledge/server/src/Embedding/index.ts`)
- @effect/ai dependencies already exist in package.json (`@effect/ai: ^0.33.2`, `@effect/ai-openai: ^0.37.2`)
- Only EmbeddingService consumes EmbeddingProvider directly
- Consumers (GraphRAGService, GroundingService, EntityClusterer) all use EmbeddingService

**Decision**: Update EmbeddingService to use `EmbeddingModel.EmbeddingModel` directly. Remove EmbeddingProvider abstraction.

**Rationale**:
1. EmbeddingService interface can remain unchanged (no breaking change to consumers)
2. Only internal implementation changes
3. EmbeddingProvider can be removed (or deprecated) as it's only used internally by EmbeddingService
4. Least disruption to existing code

**Risk**: Low - consumers don't instantiate EmbeddingProvider directly

---

#### Decision 2: TaskType Strategy → **Option B (Keep TaskType in interface, ignore in implementation)**

**Analysis**:
- OpenAI provider doesn't use TaskType meaningfully (identical processing in `prepareText`)
- TaskType is used in EmbeddingService public interface
- Consumers pass TaskType values: `search_query`, `search_document`, `clustering`
- `classification` type is never used in codebase

**Decision**: Keep TaskType parameter in EmbeddingService interface but ignore it in implementation.

**Rationale**:
1. Preserves backward compatibility - no changes needed in consumers
2. Future providers (Nomic, Voyage) may use task type prefixes for asymmetric search
3. Allows gradual migration without breaking changes

**Future Consideration**: Add TODO comment noting that @effect/ai doesn't have TaskType concept, but we keep it for API stability and future multi-provider support.

---

#### Decision 3: Caching Strategy → **Option A (Keep pgvector caching only)**

**Analysis**:
- pgvector caching provides **persistence across sessions** via EmbeddingRepo
- @effect/ai caching is **in-memory only** with TTL (`Request.Cache`)
- Current pgvector caching is already working well for knowledge graph workloads
- Dual caching would add complexity with marginal benefit

**Decision**: Keep pgvector caching in EmbeddingService, do not use @effect/ai's in-memory cache.

**Rationale**:
1. Persistence is valuable - embeddings are expensive to regenerate
2. Avoids double-caching complexity (hot cache + persistence)
3. pgvector caching is battle-tested in current implementation
4. Cross-session cache hits are more valuable than within-session for knowledge graphs

**Implementation**: Do NOT pass `cache` option to `OpenAiEmbeddingModel.layerBatched()`.

---

#### Decision 4: Error Mapping Strategy → **Option A (Map AiError → EmbeddingError)**

**Analysis**:
- Consumers use `EmbeddingError` in type signatures only (union types in return types)
- No specific catch handlers for `EmbeddingError._tag` found in codebase
- EmbeddingService already wraps errors into EmbeddingError

**Decision**: Map `AiError.AiError` to `EmbeddingError` inside EmbeddingService.

**Rationale**:
1. Preserves error contract for all consumers
2. Single point of error transformation (EmbeddingService)
3. Can include AiError details in the `cause` field for debugging
4. No breaking changes to consumer error handling

**Implementation Pattern**:
```typescript
import { AiError } from "@effect/ai/AiError";

const mapAiError = (aiError: AiError.AiError): EmbeddingError =>
  new EmbeddingError({
    message: aiError.message,
    provider: "openai",
    retryable: Match.value(aiError._tag).pipe(
      Match.when("HttpRequestError", () => true),
      Match.when("HttpResponseError", () => true),
      Match.orElse(() => false)
    ),
    cause: O.some(JSON.stringify({ _tag: aiError._tag })),
  });
```

---

#### Decision 5: Dimensions Configuration → **Confirmed Supported**

**Verification**: Checked `tmp/effect/packages/ai/openai/src/Generated.ts` line 5858:
```typescript
"dimensions": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1)), { nullable: true })
```

**Decision**: Pass dimensions via `Config.Batched`:

```typescript
OpenAiEmbeddingModel.layerBatched({
  model: "text-embedding-3-small",
  config: { dimensions: 768 }
})
```

**Note**: Default is `undefined` (uses model's default dimension). We MUST explicitly set 768 to match pgvector column.

---

### Interface Mapping Insights

#### Public API Changes

| Component | Change Type | Impact |
|-----------|-------------|--------|
| `EmbeddingService` | Interface unchanged | None |
| `EmbeddingService.embed()` | Keeps TaskType param | None |
| `EmbeddingService.embedEntities()` | Keeps TaskType param | None |
| `EmbeddingProvider` | Can be deprecated/removed | Low (internal only) |
| `EmbeddingError` | Unchanged | None |
| `TaskType` | Keep exporting | None |
| `EmbeddingResult` | Internal only | None |
| `EmbeddingConfig` | Internal only | None |

#### Layer Composition Change

**Before**:
```typescript
const KnowledgeLive = Layer.mergeAll(
  EmbeddingServiceLive,
).pipe(
  Layer.provide(OpenAiProviderLayer({ apiKey }))
);
```

**After**:
```typescript
import { OpenAiClient, OpenAiEmbeddingModel } from "@effect/ai-openai";
import { BunHttpClient } from "@effect/platform-bun";

const EmbeddingModelLive = OpenAiEmbeddingModel.layerBatched({
  model: "text-embedding-3-small",
  config: { dimensions: 768 }
}).pipe(
  Layer.provide(OpenAiClient.layer({
    apiKey: Redacted.make(process.env.OPENAI_API_KEY!)
  })),
  Layer.provide(BunHttpClient.layer)
);

const KnowledgeLive = Layer.mergeAll(
  EmbeddingServiceLive,
).pipe(
  Layer.provide(EmbeddingModelLive)
);
```

---

### Risk Assessment (Updated)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| EmbeddingService interface change | Low | Medium | Decision: Keep interface unchanged |
| Error contract change | Low | Low | Decision: Map AiError → EmbeddingError |
| Layer composition complexity | Medium | Medium | Document clearly, test in isolation |
| Missing @effect/ai feature | Low | Low | Fallback available (current code works) |
| Dimensions mismatch | Low | High | Explicitly configure 768 to match pgvector |
| pgvector caching regression | Low | Medium | Keep existing caching code unchanged |

---

## Phase 2: Implementation

**Completed**: 2026-01-22

### Migration Summary

Successfully migrated `EmbeddingService` and providers to use `@effect/ai` and `@effect/ai-openai`.

**Files Modified**:
- `packages/knowledge/server/src/Embedding/EmbeddingService.ts` - Now uses `EmbeddingModel.EmbeddingModel`
- `packages/knowledge/server/src/Embedding/providers/MockProvider.ts` - Implements `EmbeddingModel.Service`
- `packages/knowledge/server/src/Embedding/providers/OpenAiLayer.ts` - New factory for production use
- `packages/knowledge/server/src/Embedding/providers/index.ts` - Updated exports
- `packages/knowledge/server/src/Embedding/index.ts` - Updated exports

**Files Deleted**:
- `packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts` - Replaced by OpenAiLayer.ts

### Migration Challenges

#### 1. Namespace Import vs Named Import

**Issue**: Importing `EmbeddingModel` as a named import from `@effect/ai/EmbeddingModel` gives you the class directly, not a namespace.

**Symptom**:
```typescript
import { EmbeddingModel } from "@effect/ai/EmbeddingModel";
// ❌ EmbeddingModel.EmbeddingModel - Error: 'EmbeddingModel' only refers to a type
```

**Solution**: Use namespace import:
```typescript
import * as EmbeddingModel from "@effect/ai/EmbeddingModel";
// ✅ EmbeddingModel.EmbeddingModel - Works correctly
```

**Root Cause**: `@effect/ai` index.ts uses `export * as EmbeddingModel from "./EmbeddingModel.js"` (namespace re-export), but importing directly from the module gives the class.

#### 2. HttpClient Layer Provider

**Issue**: Assumed `BunHttpClient.layer` existed in `@effect/platform-bun`.

**Reality**: `@effect/platform-bun` doesn't export `BunHttpClient`. HTTP client is provided by `FetchHttpClient.layer` from `@effect/platform`.

**Solution**: Use `FetchHttpClient.layer` which works in both Node.js and Bun runtimes:
```typescript
import { FetchHttpClient } from "@effect/platform";

OpenAiClient.layer({ apiKey }).pipe(
  Layer.provide(FetchHttpClient.layer)
)
```

#### 3. exactOptionalPropertyTypes with Config

**Issue**: TypeScript's `exactOptionalPropertyTypes` rejects `undefined` in optional property assignments.

**Symptom**:
```typescript
const config = {
  dimensions: 768,
  maxBatchSize: options?.maxBatchSize, // ❌ Type 'number | undefined' is not assignable
};
```

**Solution**: Conditionally add optional properties:
```typescript
const config: OpenAiEmbeddingModel.Config.Batched = {
  dimensions: 768,
};
if (options?.maxBatchSize !== undefined) {
  (config as { maxBatchSize?: number }).maxBatchSize = options.maxBatchSize;
}
```

#### 4. Config.redacted Produces ConfigError

**Issue**: `Layer.unwrapEffect` with `Config.redacted` changes the error channel.

**Symptom**:
```typescript
export const Layer: Layer.Layer<EmbeddingModel.EmbeddingModel> = Layer.unwrapEffect(...)
// ❌ Type 'Layer<..., ConfigError, ...>' is not assignable to type 'Layer<..., never, ...>'
```

**Solution**: Explicitly type the error channel:
```typescript
import type { ConfigError } from "effect/ConfigError";

export const OpenAiEmbeddingLayerConfig: Layer.Layer<
  EmbeddingModel.EmbeddingModel,
  ConfigError
> = Layer.unwrapEffect(...)
```

### Patterns That Worked

#### 1. Error Mapping with Match

Clean transformation from `AiError.AiError` to domain-specific `EmbeddingError`:

```typescript
const mapAiError = (error: AiError.AiError): EmbeddingError =>
  new EmbeddingError({
    message: error.message,
    provider: "openai",
    retryable: Match.value(error._tag).pipe(
      Match.when("HttpRequestError", () => true),
      Match.when("HttpResponseError", () => true),
      Match.orElse(() => false)
    ),
    cause: JSON.stringify({ _tag: error._tag }),
  });
```

**Benefit**: Preserves error contract for consumers while adopting @effect/ai internally.

#### 2. Layer Composition from LlmLayers.ts

Followed existing pattern from `packages/knowledge/server/src/Runtime/LlmLayers.ts`:

```typescript
// Same pattern for both LanguageModel and EmbeddingModel
const makeOpenAiLayer = (apiKey, model) =>
  OpenAiEmbeddingModel.layerBatched({ model, config }).pipe(
    Layer.provide(OpenAiClient.layer({ apiKey })),
    Layer.provide(FetchHttpClient.layer)
  );
```

**Benefit**: Consistent with existing codebase patterns; easy to understand.

#### 3. Constants for Model Configuration

Instead of passing model config through every call, use constants at module level:

```typescript
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_DIMENSIONS = 768;

// Used in cache key generation and config
const cacheKey = computeCacheKey(text, DEFAULT_EMBEDDING_MODEL);
```

**Benefit**: `EmbeddingModel.Service` doesn't expose model config, so constants provide consistency.

#### 4. Backward Compatibility via Parameter Acceptance

Kept `TaskType` parameter in public API but ignored in implementation:

```typescript
const embed = (
  text: string,
  _taskType: TaskType,  // Prefixed with _ to indicate intentionally unused
  organizationId: ...,
  ontologyId: string
) => ...
```

**Benefit**: No breaking changes for consumers; future providers may use it.

### Anti-Patterns Discovered

#### 1. Mixing Option and Optional Types

**Anti-pattern**:
```typescript
cause: O.some(JSON.stringify({ _tag: error._tag }))  // ❌ Returns Option<string>
```

When schema expects `string | undefined` (via `S.optional(S.String)`), pass raw value:
```typescript
cause: JSON.stringify({ _tag: error._tag })  // ✅ Returns string
```

#### 2. Assuming Package Export Structure

**Anti-pattern**: Assuming `BunHttpClient` exists because `NodeHttpClient` exists in platform-node.

**Better approach**: Check actual package exports before writing code:
```bash
grep -r "export.*HttpClient" node_modules/@effect/platform-bun/src
```

### Verification Results

**Type Check**: ✅ Passed (`bun run check --filter @beep/knowledge-server`)

**Tests**: ✅ 55 pass, 0 fail
- All existing tests continue to pass
- No test modifications required (internal implementation change only)

---

## Phase 3: Verification

**Completed**: 2026-01-22

### Cleanup Results

| Task | Status |
|------|--------|
| Delete deprecated items from EmbeddingProvider.ts | Completed |
| Remove classification TaskType | Completed |
| Export audit | Completed |
| Documentation updates | Completed |
| Full verification suite | Passed |

### Deleted Items

The following deprecated items were removed from `EmbeddingProvider.ts`:
- `EmbeddingResult` interface
- `EmbeddingProvider` interface
- `EmbeddingProvider` Context tag
- `MockEmbeddingProvider` implementation
- `MockEmbeddingProviderLayer` layer

Kept items:
- `TaskType` - still used by consumers
- `EmbeddingConfig` - useful for configuration
- `EmbeddingError` - still used for error handling

### Verification Results

- **Type check**: `bun run check --filter @beep/knowledge-server` passed
- **Tests**: 55 pass, 0 fail
- **Lint**: Passed (2 pre-existing warnings in test files unrelated to migration)

### Test Insights

No test modifications were required. The migration was purely internal to `EmbeddingService`:
- All 55 existing tests continue to pass
- `MockEmbeddingModelLayer` provides the same behavior as the deprecated `MockEmbeddingProviderLayer`
- The test layer composition pattern (`EmbeddingServiceLive.pipe(Layer.provide(MockEmbeddingModelLayer))`) integrates cleanly

### Integration Learnings

1. **Export surface cleanup**: Removed `EmbeddingResult` from public exports since it's no longer used. Kept `EmbeddingConfig` and `TaskType` for backward compatibility.

2. **Deprecation strategy**: JSDoc `@deprecated` tags with migration guidance work well for gradual transition. Consumers can update at their own pace.

3. **Environment configuration**: `OpenAiEmbeddingLayerConfig` uses Effect Config which reads from environment variables. This is consistent with `LlmLayers.ts` patterns.

4. **Layer composition simplicity**: The new pattern is more concise:
   ```typescript
   // Before (deprecated)
   Layer.provide(OpenAiProviderLayer({ apiKey }))

   // After
   Layer.provide(OpenAiEmbeddingLayerConfig)  // reads from env
   // or
   Layer.provide(makeOpenAiEmbeddingLayer({ apiKey, model, dimensions }))
   ```

### Pattern Promotion Assessment

| Pattern | Score | Recommendation |
|---------|-------|----------------|
| Error mapping (AiError → domain error) | 85 | Promote - reusable for other @effect/ai integrations |
| Layer factory with Effect Config | 80 | Promote - consistent with codebase patterns |
| Namespace import for @effect/ai | 90 | Promote - critical for correct usage |

**High-value patterns for PATTERN_REGISTRY:**

1. **@effect/ai Namespace Import Pattern**
   ```typescript
   // REQUIRED - namespace import
   import * as EmbeddingModel from "@effect/ai/EmbeddingModel";
   EmbeddingModel.EmbeddingModel  // ✅ Works

   // WRONG - named import gives class, not namespace
   import { EmbeddingModel } from "@effect/ai/EmbeddingModel";
   EmbeddingModel.EmbeddingModel  // ❌ Error
   ```

2. **AiError Mapping Pattern**
   ```typescript
   import { AiError } from "@effect/ai/AiError";
   import * as Match from "effect/Match";

   const mapAiError = (error: AiError.AiError): DomainError =>
     new DomainError({
       message: error.message,
       retryable: Match.value(error._tag).pipe(
         Match.when("HttpRequestError", () => true),
         Match.when("HttpResponseError", () => true),
         Match.orElse(() => false)
       ),
       cause: JSON.stringify({ _tag: error._tag }),
     });
   ```

---

## Promoted Patterns

*Patterns scoring 75+ that should be promoted to PATTERN_REGISTRY*

| Pattern | Score | Destination |
|---------|-------|-------------|
| @effect/ai Namespace Import | 90 | effect-patterns.md |
| AiError → Domain Error Mapping | 85 | effect-patterns.md |
| Layer Factory with Effect Config | 80 | effect-patterns.md |
