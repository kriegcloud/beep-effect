# Effect Patterns Guide

> Comprehensive patterns and guidelines for building Effect-native services in this codebase.
> Generated from audit of existing implementation patterns.

## Table of Contents

1. [Service Definition Patterns](#1-service-definition-patterns)
2. [Layer Composition Patterns](#2-layer-composition-patterns)
3. [Error Handling Patterns](#3-error-handling-patterns)
4. [Schema & Validation Patterns](#4-schema--validation-patterns)
5. [Resource Management Patterns](#5-resource-management-patterns)
6. [Workflow & Activity Patterns](#6-workflow--activity-patterns)
7. [Critical Issues to Address](#7-critical-issues-to-address)
8. [Templates](#8-templates)
9. [Request API & Batching Patterns](#9-request-api--batching-patterns)

---

## 1. Service Definition Patterns

### Recommended: Effect.Service

Use `Effect.Service<T>()` for all new services. This is the modern, self-registering pattern:

```typescript
// GOOD: Self-registering service
export class MyService extends Effect.Service<MyService>()("@core-v2/MyService", {
  dependencies: [ConfigService, StorageService],
  effect: Effect.gen(function*() {
    const config = yield* ConfigService
    const storage = yield* StorageService

    return {
      doSomething: (input: Input) => Effect.gen(function*() {
        // implementation
      })
    }
  })
}) {}
```

### Legacy: Context.Tag (Avoid for new code)

Some foundational services use `Context.Tag`. Maintain but don't extend this pattern:

```typescript
// LEGACY: Still works but prefer Effect.Service
export const ConfigService = Context.GenericTag<ConfigService>("@core-v2/ConfigService")

export const ConfigServiceDefault = Layer.effect(
  ConfigService,
  Effect.gen(function*() {
    // implementation
  })
)
```

### Service Interface Pattern

Always define the service interface separately for testability:

```typescript
export interface MyServiceMethods {
  readonly doSomething: (input: Input) => Effect.Effect<Output, MyError>
  readonly doOther: (id: string) => Effect.Effect<Option.Option<Item>, MyError>
}

export class MyService extends Context.Tag("@core-v2/MyService")<
  MyService,
  MyServiceMethods
>() {
  static readonly Default: Layer.Layer<MyService, never, Dependencies> = ...
  static readonly Test: Layer.Layer<MyService> = ...
}
```

---

## 2. Layer Composition Patterns

### Three-Tier Layer Architecture

```
┌─────────────────────────────────────────────┐
│           ProductionInfrastructure          │  ← Complete runtime
├─────────────────────────────────────────────┤
│  ExtractionLayers │ OntologyLayers │ LlmLayers │  ← Service bundles
├─────────────────────────────────────────────┤
│         ConfigService (Foundation)           │  ← Base dependencies
└─────────────────────────────────────────────┘
```

### Composition with provideMerge

Use `Layer.provideMerge` for order-independent composition:

```typescript
// GOOD: Clear dependency graph
const OntologyBundle = Layer.mergeAll(
  OntologyService.Default,
  RdfBuilder.Default
).pipe(
  Layer.provideMerge(NlpService.Default),
  Layer.provideMerge(ConfigServiceDefault)
)
```

### Explicit Dependencies

Always declare dependencies explicitly, never rely on parent scope:

```typescript
// GOOD: Explicit
dependencies: [
  RdfBuilder.Default,
  ConfigService.Default,  // Don't assume parent provides this
  NlpService.Default
]

// BAD: Implicit (avoid)
dependencies: [
  // ConfigService provided by parent scope  ← Don't do this
]
```

### Test/Live Swapping

Every service should have `.Default` (live) and `.Test` static properties:

```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  // ...
}) {
  static readonly Test = Layer.succeed(MyService, {
    doSomething: () => Effect.succeed(mockResult)
  })
}
```

---

## 3. Error Handling Patterns

### Error Type Definition

Use `Schema.TaggedError` for domain errors (serializable):

```typescript
// Domain errors (in Domain/Error/)
export class EntityExtractionFailed extends Schema.TaggedError<EntityExtractionFailed>()(
  "EntityExtractionFailed",
  {
    message: Schema.String,
    entityType: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}
```

Use `Data.TaggedError` for runtime errors (non-serializable):

```typescript
// Runtime errors (keep in same module)
export class CircuitOpenError extends Data.TaggedError("CircuitOpenError")<{
  readonly serviceName: string
  readonly retryAfterMs: number
}> {}
```

### Error Recovery with catchTag

Use `catchTag` for specific error handling:

```typescript
// GOOD: Specific error handling
yield* doOperation().pipe(
  Effect.catchTag("TimeoutError", (e) =>
    Effect.logWarning("Operation timed out", { stage: e.stage }).pipe(
      Effect.andThen(Effect.fail(new RecoverableError({ cause: e })))
    )
  ),
  Effect.catchTag("RateLimitError", (e) =>
    Effect.sleep(e.retryAfterMs).pipe(
      Effect.andThen(Effect.retry(Schedule.once))
    )
  )
)
```

### Retry Strategies

Use the centralized retry policy from `Service/Retry.ts`:

```typescript
import { createRetryPolicy, isRetryable } from "../Service/Retry.js"

const policy = createRetryPolicy({
  maxAttempts: 3,
  baseDelay: Duration.millis(500),
  maxDelay: Duration.seconds(10)
})

yield* riskyOperation().pipe(
  Effect.retry(policy)
)
```

### Error Context Preservation

Never lose error context with string conversion:

```typescript
// BAD: Loses error context
Effect.mapError((e) => String(e))

// GOOD: Preserve structured error
Effect.mapError((e) => new ActivityError({
  message: e instanceof Error ? e.message : String(e),
  cause: e,
  retryable: isRetryable(e)
}))
```

---

## 4. Schema & Validation Patterns

### Branded Types

Always use branded types for domain identifiers:

```typescript
// In Domain/Identity.ts
export const BatchId = Schema.String.pipe(
  Schema.pattern(/^batch-[a-f0-9]{12}$/),
  Schema.brand("BatchId"),
  Schema.annotations({
    title: "Batch ID",
    description: "Unique identifier for a batch extraction job"
  })
)
export type BatchId = typeof BatchId.Type
```

### Domain Models with Schema.Class

```typescript
export class Entity extends Schema.Class<Entity>("Entity")({
  id: EntityIdSchema,
  type: IriSchema,
  label: Schema.String,
  confidence: Schema.Number.pipe(Schema.between(0, 1)),
  attributes: AttributesSchema
}) {
  // Instance methods
  isHighConfidence(): boolean {
    return this.confidence >= 0.8
  }
}
```

### JSON Boundary Validation

Always use `Schema.parseJson` at JSON boundaries:

```typescript
// GOOD: Single-step parse + validate
const payload = yield* Schema.decodeUnknown(
  Schema.parseJson(BatchRequest)
)(rawJson)

// BAD: Two-step (avoid)
const parsed = JSON.parse(rawJson)
const payload = yield* Schema.decodeUnknown(BatchRequest)(parsed)
```

### Config Loading

Use Effect.Config with proper validation:

```typescript
const LlmConfig = Config.all({
  provider: Config.literal("anthropic", "openai", "google")("LLM_PROVIDER"),
  apiKey: Config.redacted("LLM_API_KEY"),
  model: Config.string("LLM_MODEL").pipe(Config.withDefault("claude-haiku-4-5")),
  temperature: Config.number("LLM_TEMPERATURE").pipe(
    Config.withDefault(0.7),
    Config.validate({
      message: "Temperature must be between 0 and 2",
      validation: (n) => n >= 0 && n <= 2
    })
  )
})
```

---

## 5. Resource Management Patterns

### Scoped Resources with acquireRelease

```typescript
// GOOD: Proper resource lifecycle
const makeConnection = Effect.acquireRelease(
  Effect.tryPromise(() => createConnection(config)),
  (conn) => Effect.promise(() => conn.close())
)

// Usage
yield* Effect.scoped(
  Effect.gen(function*() {
    const conn = yield* makeConnection
    return yield* useConnection(conn)
  })
)
```

### Layer.scoped for Service Resources

```typescript
// GOOD: Resources cleaned up when layer disposed
export const MyServiceLive = Layer.scoped(
  MyService,
  Effect.gen(function*() {
    const scope = yield* Scope.Scope
    const pool = yield* ConnectionPool.make(config).pipe(Scope.extend(scope))

    return {
      query: (sql) => pool.query(sql)
    }
  })
)
```

### Finalizers for Cleanup

```typescript
// In streams or long-running operations
yield* Stream.fromQueue(queue).pipe(
  Stream.ensuring(Queue.shutdown(queue)),
  Stream.tap((item) => processItem(item))
)

// In fibers
const fiber = yield* Effect.fork(backgroundTask)
yield* Effect.addFinalizer(() =>
  Fiber.interrupt(fiber).pipe(Effect.ignore)
)
```

### Graceful Shutdown Pattern

```typescript
// Track in-flight work
const trackRequest = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.gen(function*() {
    yield* Ref.update(inFlightRef, (n) => n + 1)
    return yield* effect.pipe(
      Effect.ensuring(Ref.update(inFlightRef, (n) => n - 1))
    )
  })

// Drain before shutdown
const drain = Effect.gen(function*() {
  let remaining = yield* Ref.get(inFlightRef)
  while (remaining > 0) {
    yield* Effect.sleep(Duration.millis(100))
    remaining = yield* Ref.get(inFlightRef)
  }
}).pipe(Effect.timeout(Duration.seconds(30)))
```

---

## 6. Workflow & Activity Patterns

### Activity Definition

```typescript
export const ExtractionActivity = Activity.make("extraction", {
  input: ExtractionActivityInput,
  output: ExtractionActivityOutput,
  error: ActivityErrorSchema,  // Use discriminated union, not string

  execute: (input) => Effect.gen(function*() {
    const extractor = yield* EntityExtractor
    const result = yield* extractor.extract(input.document)

    return {
      entities: result.entities.length,
      relations: result.relations.length
    }
  }).pipe(
    Effect.withSpan("activity.extraction"),
    Effect.retry(activityRetryPolicy)
  )
})
```

### Workflow State Management

Keep state within workflow, not external:

```typescript
// GOOD: State in workflow response
const BatchWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchPayload,
  success: BatchResult,
  error: BatchError,

  execute: (payload) => Effect.gen(function*() {
    // Track state internally
    let processed = 0

    for (const doc of payload.documents) {
      yield* ExtractionActivity.execute({ document: doc })
      processed++
    }

    return { processed, status: "complete" }
  })
})

// BAD: External state mutation inside workflow
yield* externalStateStore.set(batchId, { progress: 50 })  // Don't do this!
```

### Typed Activity Errors

```typescript
// Define discriminated error union
export const ActivityErrorSchema = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("Timeout"),
    stage: Schema.String,
    durationMs: Schema.Number
  }),
  Schema.Struct({
    _tag: Schema.Literal("ServiceFailure"),
    service: Schema.String,
    message: Schema.String,
    retryable: Schema.Boolean
  }),
  Schema.Struct({
    _tag: Schema.Literal("ValidationFailed"),
    field: Schema.String,
    reason: Schema.String
  })
)
```

---

## 7. Critical Issues to Address

### HIGH Priority

| Issue | Location | Impact |
|-------|----------|--------|
| GCS Storage client never closed | `Service/Storage.ts:33` | Resource leak |
| RDF finalizer does nothing | `Service/Rdf.ts:195` | Memory leak |
| Activity errors lose type info | `Workflow/DurableActivities.ts:66` | Can't discriminate errors |
| Duplicate CircuitOpenError classes | `Runtime/CircuitBreaker.ts`, `Service/LlmControl/RateLimiter.ts` | Confusing catchTag |
| State race in workflow | `Service/WorkflowOrchestrator.ts:242` | Inconsistent on replay |

### MEDIUM Priority

| Issue | Location | Impact |
|-------|----------|--------|
| Mixed service definition patterns | Throughout `/Service/` | Cognitive overhead |
| IRI casting bypasses validation | `Workflow/Activities.ts:98` | Type safety gap |
| Silent error swallowing | `Cluster/ExtractionEntityHandler.ts:573` | Lost failures |
| No ShaclService.Test | `Service/Shacl.ts` | Test inconsistency |
| JSON.parse without Schema | `Service/ExtractionCache.ts:68` | No validation |

---

## 8. Templates

### New Service Template

```typescript
/**
 * Service: [Name]
 *
 * [Description of what this service does]
 *
 * @since 2.0.0
 * @module Service/[Name]
 */

import { Context, Effect, Layer, Schema } from "effect"
import { ConfigService } from "./Config.js"

// ─────────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────────

export class MyServiceError extends Schema.TaggedError<MyServiceError>()(
  "MyServiceError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

// ─────────────────────────────────────────────────────────────────
// Service Interface
// ─────────────────────────────────────────────────────────────────

export interface MyServiceMethods {
  readonly doOperation: (input: Input) => Effect.Effect<Output, MyServiceError>
}

// ─────────────────────────────────────────────────────────────────
// Service Definition
// ─────────────────────────────────────────────────────────────────

export class MyService extends Context.Tag("@core-v2/MyService")<
  MyService,
  MyServiceMethods
>() {
  static readonly Default: Layer.Layer<MyService, never, ConfigService> =
    Layer.scoped(
      MyService,
      Effect.gen(function*() {
        const config = yield* ConfigService
        const resource = yield* acquireResource(config)

        return {
          doOperation: (input) => Effect.gen(function*() {
            // Implementation
          }).pipe(
            Effect.mapError((e) => new MyServiceError({
              message: `Operation failed: ${e}`,
              cause: e
            }))
          )
        }
      })
    )

  static readonly Test: Layer.Layer<MyService> = Layer.succeed(MyService, {
    doOperation: () => Effect.succeed(mockOutput)
  })
}
```

### New Activity Template

```typescript
import { Activity, Schema } from "@effect/workflow"

// ─────────────────────────────────────────────────────────────────
// Input/Output Schemas
// ─────────────────────────────────────────────────────────────────

export const MyActivityInput = Schema.Struct({
  documentUri: GcsUri,
  options: Schema.optional(Schema.Struct({
    maxItems: Schema.Number.pipe(Schema.positive())
  }))
})

export const MyActivityOutput = Schema.Struct({
  processedCount: Schema.Number,
  outputUri: GcsUri
})

export const MyActivityError = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("InputNotFound"),
    uri: Schema.String
  }),
  Schema.Struct({
    _tag: Schema.Literal("ProcessingFailed"),
    message: Schema.String,
    retryable: Schema.Boolean
  })
)

// ─────────────────────────────────────────────────────────────────
// Activity Definition
// ─────────────────────────────────────────────────────────────────

export const MyActivity = Activity.make("my-activity", {
  input: MyActivityInput,
  output: MyActivityOutput,
  error: MyActivityError,

  execute: (input) => Effect.gen(function*() {
    const storage = yield* StorageService
    const processor = yield* ProcessorService

    const content = yield* storage.get(input.documentUri).pipe(
      Effect.flatMap(Option.match({
        onNone: () => Effect.fail({
          _tag: "InputNotFound" as const,
          uri: input.documentUri
        }),
        onSome: Effect.succeed
      }))
    )

    const result = yield* processor.process(content).pipe(
      Effect.mapError((e) => ({
        _tag: "ProcessingFailed" as const,
        message: String(e),
        retryable: isRetryable(e)
      }))
    )

    return {
      processedCount: result.items.length,
      outputUri: result.outputPath
    }
  }).pipe(
    Effect.withSpan("activity.my-activity"),
    Effect.retry(activityRetryPolicy)
  )
})
```

---

## 9. Request API & Batching Patterns

### Overview

The Effect Request API enables automatic batching and deduplication of operations. This is essential for:
- Reducing API calls to external services
- Deduplicating identical requests within a time window
- Implementing efficient batch processing

**When to use:**
- External API calls that support batching (e.g., embeddings, LLM calls)
- Database queries that can be batched
- Any operation where multiple concurrent requests can be combined

### Request Definition

```typescript
import { Request } from "effect"

/**
 * Define a request type using Request.tagged
 *
 * The request includes all input parameters and extends Request<Success, Error>
 */
export interface EmbedTextRequest extends Request.Request<Embedding, EmbeddingError> {
  readonly _tag: "EmbedTextRequest"
  readonly text: string
  readonly taskType: EmbeddingTaskType
  readonly metadata: ProviderMetadata
}

export const EmbedTextRequest = Request.tagged<EmbedTextRequest>("EmbedTextRequest")
```

### Request Deduplication

Effect automatically deduplicates requests within a batch window based on structural equality:

```typescript
/**
 * Generate hash for custom deduplication logic
 *
 * Useful when you need more control over what constitutes "same request"
 */
export const embedRequestHash = (req: EmbedTextRequest): string =>
  `${req.metadata.providerId}::${req.metadata.modelId}::${req.taskType}::${req.text}`
```

### RequestResolver Pattern

```typescript
import { RequestResolver, Effect, Exit, Array } from "effect"

/**
 * Create a batched resolver
 *
 * The resolver:
 * 1. Receives an array of requests
 * 2. Performs batched operation
 * 3. Completes each request with its result
 */
export const makeEmbeddingResolver = (
  provider: EmbeddingProviderMethods,
  maxBatchSize: number = 128
): RequestResolver.RequestResolver<EmbedTextRequest, never> =>
  RequestResolver.makeBatched((requests: ReadonlyArray<EmbedTextRequest>) =>
    Effect.gen(function* () {
      if (requests.length === 0) return

      // Group by common property (e.g., taskType)
      const grouped = Array.groupBy(requests, (r) => r.taskType)

      for (const [_taskType, batch] of Object.entries(grouped)) {
        // Chunk into maxBatchSize to respect API limits
        const chunks = Array.chunksOf(batch, maxBatchSize)

        for (const chunk of chunks) {
          if (chunk.length === 0) continue

          // Process chunk and complete requests
          yield* provider.embedBatch(chunk.map((r) => ({ text: r.text, taskType: r.taskType }))).pipe(
            Effect.matchEffect({
              onSuccess: (embeddings) =>
                Effect.forEach(
                  chunk,
                  (req, i) => Request.complete(req, Exit.succeed(embeddings[i])),
                  { discard: true }
                ),
              onFailure: (error) =>
                Effect.forEach(
                  chunk,
                  (req) => Request.complete(req, Exit.fail(error)),
                  { discard: true }
                )
            })
          )
        }
      }
    })
  ).pipe(RequestResolver.batchN(maxBatchSize))
```

### Using Requests

```typescript
// In service implementation
export const EmbeddingServiceLive = Layer.effect(
  EmbeddingService,
  Effect.gen(function* () {
    const provider = yield* EmbeddingProvider
    const cache = yield* EmbeddingCache

    const resolver = makeEmbeddingResolver(provider)

    return {
      embed: (text, taskType = "search_document") =>
        Effect.gen(function* () {
          const hash = yield* hashCacheKey(text, taskType)
          const cached = yield* cache.get(hash)
          if (Option.isSome(cached)) return cached.value

          // Create request and resolve via batching
          const request = EmbedTextRequest({ text, taskType, metadata: provider.metadata })
          const embedding = yield* Effect.request(request, resolver)

          yield* cache.set(hash, embedding)
          return embedding
        }),

      embedBatch: (texts, taskType = "search_document") =>
        // Effect.forEach with batching:true enables Request API
        Effect.forEach(
          texts,
          (text) => embedWithCache(text, taskType),
          { concurrency: "unbounded", batching: true }
        )
    }
  })
)
```

### Batch Window Configuration

The default batch window is **10ms**. Requests arriving within this window are collected:

```typescript
// Adjust globally (rarely needed)
Layer.setRequestBatching(true)   // Enable batching
Layer.setRequestCache(true)       // Enable request caching
```

### Best Practices

**DO:**
- Use Request API for external API calls that support batching
- Group requests by common properties before batching
- Respect API batch size limits via `Array.chunksOf`
- Complete all requests (success or failure) to prevent hangs
- Use `Effect.ensuring` to guarantee request completion

**DON'T:**
- Use batching for operations that don't benefit from it
- Forget to handle errors (complete failed requests with `Exit.fail`)
- Exceed provider batch size limits
- Mix incompatible request types in a single batch

### Testing Batching

```typescript
import { it } from "@effect/vitest"
import { Effect } from "effect"

it.effect("batches multiple concurrent requests", () =>
  Effect.gen(function* () {
    const calls = yield* Ref.make(0)

    const resolver = RequestResolver.makeBatched((requests) =>
      Effect.gen(function* () {
        yield* Ref.update(calls, (n) => n + 1)
        // Complete all requests
        yield* Effect.forEach(
          requests,
          (req) => Request.complete(req, Exit.succeed(req.input.length)),
          { discard: true }
        )
      })
    )

    // Create 10 concurrent requests
    const results = yield* Effect.all(
      Array.range(0, 9).map((i) => Effect.request(MyRequest({ input: `text${i}` }), resolver)),
      { concurrency: "unbounded", batching: true }
    )

    expect(results).toHaveLength(10)

    // Should batch into single call
    const callCount = yield* Ref.get(calls)
    expect(callCount).toBe(1)
  })
)
```

### Example: Embedding Service

See **embedding architecture** for full implementation:
- `Service/EmbeddingProvider.ts` - Provider interface
- `Service/EmbeddingRequest.ts` - Request definition
- `Service/EmbeddingResolver.ts` - Batching resolver
- `Service/Embedding.ts` - Service with Request API integration

---

## Checklist for New Services

- [ ] Use `Effect.Service` or `Context.Tag` with interface
- [ ] Define typed errors with `Schema.TaggedError`
- [ ] Declare explicit dependencies (no implicit parent scope)
- [ ] Use `Layer.scoped` for resources that need cleanup
- [ ] Add finalizers for external resources
- [ ] Create `.Default` and `.Test` layer variants
- [ ] Use branded types for identifiers
- [ ] Validate JSON at boundaries with `Schema.parseJson`
- [ ] Add OpenTelemetry spans with `Effect.withSpan`
- [ ] Follow retry patterns from `Service/Retry.ts`

---

*Last updated: 2025-12-16*
*Generated from codebase audit*
