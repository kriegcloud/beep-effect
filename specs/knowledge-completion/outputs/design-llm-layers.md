# LLM Layers Design

> Provider Layer architecture for @effect/ai integration

---

## Executive Summary

This document defines the Layer architecture for integrating `@effect/ai` into the knowledge-server package. The design supports:
- Multiple LLM providers (Anthropic, OpenAI)
- Config-driven provider selection
- Clean test mocking via Layer substitution
- Retry and rate-limiting wrappers

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (EntityExtractor, MentionExtractor, RelationExtractor)     │
│                           │                                  │
│                           ▼                                  │
│              LanguageModel.LanguageModel                     │
│                    (Service Tag)                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Runtime Layer Selection                     │
│                                                              │
│   ┌──────────────────┐  ┌──────────────────┐                │
│   │  AnthropicLive   │  │   OpenAiLive     │                │
│   │                  │  │                  │                │
│   │ AnthropicLanguage│  │ OpenAiLanguage   │                │
│   │ Model.layer()    │  │ Model.layer()    │                │
│   │       │          │  │       │          │                │
│   │       ▼          │  │       ▼          │                │
│   │ AnthropicClient  │  │  OpenAiClient    │                │
│   │   .layer()       │  │    .layer()      │                │
│   │       │          │  │       │          │                │
│   │       ▼          │  │       ▼          │                │
│   │ FetchHttpClient  │  │ FetchHttpClient  │                │
│   │   .layer         │  │   .layer         │                │
│   └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
packages/knowledge/server/src/
├── Runtime/
│   ├── LlmLayers.ts          # Provider Layers
│   ├── LlmWithRetry.ts       # Retry wrapper (optional P4 scope)
│   └── index.ts
```

---

## LlmLayers.ts Design

### Provider Layer Composition

```typescript
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai"
import { FetchHttpClient } from "@effect/platform"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

// =============================================================================
// Configuration Schema
// =============================================================================

/**
 * LLM configuration from environment
 */
const LlmConfig = Config.all({
  provider: Config.string("LLM_PROVIDER").pipe(
    Config.withDefault("anthropic")
  ),
  apiKey: Config.string("LLM_API_KEY"),
  model: Config.string("LLM_MODEL").pipe(
    Config.withDefault("claude-sonnet-4-20250514")
  ),
})

// =============================================================================
// Provider Layers
// =============================================================================

/**
 * Anthropic provider Layer
 */
const makeAnthropicLayer = (apiKey: string, model: string) =>
  AnthropicLanguageModel.layer({ model }).pipe(
    Layer.provide(
      AnthropicClient.layer({ apiKey }).pipe(
        Layer.provide(FetchHttpClient.layer)
      )
    )
  )

/**
 * OpenAI provider Layer
 */
const makeOpenAiLayer = (apiKey: string, model: string) =>
  OpenAiLanguageModel.layer({ model }).pipe(
    Layer.provide(
      OpenAiClient.layer({ apiKey }).pipe(
        Layer.provide(FetchHttpClient.layer)
      )
    )
  )

// =============================================================================
// Dynamic Provider Selection
// =============================================================================

/**
 * LlmLive - Config-driven LanguageModel provider
 *
 * Selects provider based on LLM_PROVIDER environment variable.
 * Defaults to Anthropic if not specified.
 *
 * @example
 * ```typescript
 * const program = Effect.gen(function*() {
 *   const model = yield* LanguageModel.LanguageModel
 *   return yield* model.generateObject(prompt, schema)
 * })
 *
 * // Run with dynamic provider selection
 * program.pipe(Effect.provide(LlmLive), Effect.runPromise)
 * ```
 */
export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const config = yield* LlmConfig

    switch (config.provider) {
      case "openai":
        return makeOpenAiLayer(config.apiKey, config.model)

      case "anthropic":
      default:
        return makeAnthropicLayer(config.apiKey, config.model)
    }
  })
)

// =============================================================================
// Static Provider Layers (Direct Access)
// =============================================================================

/**
 * AnthropicLive - Direct Anthropic provider Layer
 *
 * Use when provider is known at compile time.
 */
export const AnthropicLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const apiKey = yield* Config.string("ANTHROPIC_API_KEY")
    const model = yield* Config.string("ANTHROPIC_MODEL").pipe(
      Config.withDefault("claude-sonnet-4-20250514")
    )
    return makeAnthropicLayer(apiKey, model)
  })
)

/**
 * OpenAiLive - Direct OpenAI provider Layer
 *
 * Use when provider is known at compile time.
 */
export const OpenAiLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const apiKey = yield* Config.string("OPENAI_API_KEY")
    const model = yield* Config.string("OPENAI_MODEL").pipe(
      Config.withDefault("gpt-4o")
    )
    return makeOpenAiLayer(apiKey, model)
  })
)
```

---

## Configuration Strategy

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_PROVIDER` | No | `anthropic` | Provider selection (`anthropic`, `openai`) |
| `LLM_API_KEY` | Yes | - | API key for selected provider |
| `LLM_MODEL` | No | Provider default | Model identifier |
| `ANTHROPIC_API_KEY` | Conditional | - | For direct Anthropic access |
| `OPENAI_API_KEY` | Conditional | - | For direct OpenAI access |

### Default Models

| Provider | Default Model |
|----------|--------------|
| Anthropic | `claude-sonnet-4-20250514` |
| OpenAI | `gpt-4o` |

---

## Error Handling

### Configuration Errors

Missing required config is caught at Layer construction:

```typescript
// Effect.Config surfaces missing env vars as ConfigError
const program = Effect.gen(function*() {
  const model = yield* LanguageModel.LanguageModel
  // ...
}).pipe(
  Effect.provide(LlmLive),
  Effect.catchTag("ConfigError", (e) =>
    Effect.logError("LLM configuration error", { error: e.message })
  )
)
```

### API Errors

Provider errors propagate as `LanguageModelResponse.Failure`:

```typescript
model.generateObject(prompt, schema).pipe(
  Effect.catchAll((failure) => {
    // Handle rate limits, auth errors, etc.
    return Effect.fail(new AiExtractionError({
      message: failure.message,
      retryable: isRetryable(failure)
    }))
  })
)
```

---

## Test Mocking Strategy

### Mock LanguageModel Layer

```typescript
import { LanguageModel } from "@effect/ai"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"

/**
 * MockLlmLive - Test Layer for LanguageModel
 */
export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  LanguageModel.LanguageModel.of({
    generate: () => Stream.empty,
    generateObject: () =>
      Effect.succeed({
        value: {},
        usage: { inputTokens: 0, outputTokens: 0 }
      })
  })
)
```

### Parameterized Mocks

```typescript
/**
 * Create mock with specific response
 */
export const createMockLlm = <A>(response: A) =>
  Layer.succeed(
    LanguageModel.LanguageModel,
    LanguageModel.LanguageModel.of({
      generate: () => Stream.empty,
      generateObject: () =>
        Effect.succeed({
          value: response,
          usage: { inputTokens: 100, outputTokens: 50 }
        })
    })
  )
```

---

## Layer Composition for Knowledge Server

### Full Runtime Layer

```typescript
// packages/knowledge/server/src/Runtime/index.ts

export const KnowledgeServerLive = Layer.mergeAll(
  // LLM provider
  LlmLive,

  // Extraction services (depend on LanguageModel)
  EntityExtractor.Default,
  MentionExtractor.Default,
  RelationExtractor.Default,
  ExtractionPipeline.Default,

  // Embedding services
  EmbeddingService.Default,

  // Other services
  OntologyService.Default,
  GroundingService.Default,
  NlpService.Default,
)
```

### Test Runtime Layer

```typescript
// packages/knowledge/server/test/_shared/TestLayers.ts

export const TestKnowledgeLive = Layer.mergeAll(
  MockLlmLive,
  MockEmbeddingLive,
  // ... other mock layers
)
```

---

## Migration Impact

### Files Created

| File | Purpose |
|------|---------|
| `src/Runtime/LlmLayers.ts` | Provider Layer definitions |
| `src/Runtime/index.ts` | Runtime exports |
| `test/_shared/TestLayers.ts` | Mock Layer definitions |

### Files Modified

| File | Change |
|------|--------|
| `EntityExtractor.ts` | Replace `AiService` with `LanguageModel.LanguageModel` |
| `MentionExtractor.ts` | Replace `AiService` with `LanguageModel.LanguageModel` |
| `RelationExtractor.ts` | Replace `AiService` with `LanguageModel.LanguageModel` |
| `ExtractionPipeline.ts` | Update Layer composition |

### Files Deleted

| File | Reason |
|------|--------|
| `src/Ai/AiService.ts` | Replaced by `@effect/ai` LanguageModel |

---

## Optional Enhancements (Post-P4)

### Rate-Limited Wrapper

```typescript
export const RateLimitedLlmLive = Layer.scoped(
  LanguageModel.LanguageModel,
  Effect.gen(function*() {
    const baseLlm = yield* LanguageModel.LanguageModel
    const limiter = yield* RateLimiter.make({
      limit: 10,
      interval: "1 minutes"
    })

    return LanguageModel.LanguageModel.of({
      generate: (req) => limiter(baseLlm.generate(req)),
      generateObject: (p, s, o) => limiter(baseLlm.generateObject(p, s, o))
    })
  })
).pipe(Layer.provide(LlmLive))
```

### Retry Wrapper

```typescript
export const generateObjectWithRetry = <A, I, R>(
  prompt: Prompt.Prompt,
  schema: S.Schema<A, I, R>,
  options?: { maxRetries?: number; timeout?: Duration.Duration }
) =>
  Effect.gen(function*() {
    const llm = yield* LanguageModel.LanguageModel

    return yield* llm.generateObject(prompt, schema).pipe(
      Effect.timeout(options?.timeout ?? Duration.seconds(30)),
      Effect.retry({ times: options?.maxRetries ?? 3 }),
      Effect.withSpan("llm.generateObject")
    )
  })
```

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Config-driven selection | Allows runtime provider switching without code changes |
| `Layer.unwrapEffect` for dynamic config | Effect-based config resolution at Layer construction |
| Direct provider Layers | Simpler composition when provider is known |
| FetchHttpClient.layer | Uses Effect platform HTTP client |
| Default models hardcoded | Prevents accidental use of expensive models |
