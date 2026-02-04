# Effect-Native Cloud Run Migration Plan

**Date:** 2024-12-10
**Status:** Draft
**Goal:** Replace custom stateful services with Effect-native abstractions for Cloud Run scalability

## Executive Summary

Our current MVP has 4 stateful components blocking multi-instance Cloud Run deployment:
- `ExtractionCache` - filesystem-based, lost on instance restart
- `ExecutionDeduplicator` - in-memory Ref+Deferred, no cross-instance coordination
- `CentralRateLimiter` - per-instance, causes API quota exhaustion at scale
- `JobManager` - in-memory job state, lost on restart

Effect provides production-ready abstractions that solve all these problems with ~85% code reduction:

| Current (Custom) | Effect-Native Replacement | LOC Saved |
|------------------|---------------------------|-----------|
| ExtractionCache (111 LOC) | KeyValueStore + Schema | ~90% |
| ExecutionDeduplicator (102 LOC) | PersistedCache | ~95% |
| CentralRateLimiter (341 LOC) | RateLimiter + RateLimiterStore | ~80% |

## Phase 1: KeyValueStore-based ExtractionCache

### Current Implementation Analysis

```typescript
// packages/@core-v2/src/Service/ExtractionCache.ts
// Problems:
// 1. Uses FileSystem directly - lost on Cloud Run restart
// 2. No TTL support (parameter ignored)
// 3. Manual JSON serialization
// 4. 111 lines of custom code
```

### Effect-Native Solution

**Source:** `@effect/platform` - `KeyValueStore`

```typescript
// KeyValueStore provides:
interface KeyValueStore {
  get: (key: string) => Effect<Option<string>, PlatformError>
  set: (key: string, value: string) => Effect<void, PlatformError>
  remove: (key: string) => Effect<void, PlatformError>
  clear: Effect<void, PlatformError>
  // Schema integration!
  forSchema: <A, I, R>(schema: Schema<A, I, R>) => SchemaStore<A, R>
}

// Available backends:
KeyValueStore.layerMemory      // In-memory (tests)
KeyValueStore.layerFileSystem  // FileSystem (local dev)
// Custom: Redis backend for Cloud Run
```

### Implementation

**File:** `packages/@core-v2/src/Service/ExtractionCache.ts` (refactored)

```typescript
import { KeyValueStore, PlatformError } from "@effect/platform"
import { Context, Effect, Layer, Schema } from "effect"
import { CachedExtractionResultSchema } from "../Domain/Schema/Cache.js"

// Tag for our typed cache
export class ExtractionCache extends Context.Tag("@core-v2/ExtractionCache")<
  ExtractionCache,
  KeyValueStore.SchemaStore<typeof CachedExtractionResultSchema.Type, never>
>() {}

// Production layer using underlying KeyValueStore
export const ExtractionCacheLive = Layer.scoped(
  ExtractionCache,
  Effect.gen(function*() {
    const store = yield* KeyValueStore.KeyValueStore
    return store.forSchema(CachedExtractionResultSchema)
  })
)

// Test layer (in-memory)
export const ExtractionCacheTest = ExtractionCacheLive.pipe(
  Layer.provideMerge(KeyValueStore.layerMemory)
)
```

**Schema Definition:**

```typescript
// packages/@core-v2/src/Domain/Schema/Cache.ts
import { Schema } from "effect"

export const CachedExtractionResultSchema = Schema.Struct({
  entities: Schema.Array(Schema.Unknown),
  relations: Schema.Array(Schema.Unknown),
  metadata: Schema.Struct({
    computedAt: Schema.String,
    model: Schema.String,
    temperature: Schema.Number,
    computedIn: Schema.Number
  })
})
```

**Redis Backend for Cloud Run:**

```typescript
// packages/@core-v2/src/Service/RedisKeyValueStore.ts
import { KeyValueStore, PlatformError } from "@effect/platform"
import { Effect, Layer, Option } from "effect"
import { Redis } from "ioredis"

export const layerRedis = (url: string): Layer.Layer<KeyValueStore.KeyValueStore> =>
  Layer.scoped(
    KeyValueStore.KeyValueStore,
    Effect.acquireRelease(
      Effect.sync(() => new Redis(url)),
      (redis) => Effect.sync(() => redis.quit())
    ).pipe(
      Effect.map((redis) =>
        KeyValueStore.make({
          get: (key) =>
            Effect.tryPromise({
              try: () => redis.get(key),
              catch: (e) => PlatformError.SystemError({ reason: "Unknown", error: e })
            }).pipe(Effect.map(Option.fromNullable)),
          set: (key, value) =>
            Effect.tryPromise({
              try: () => redis.set(key, typeof value === "string" ? value : Buffer.from(value)),
              catch: (e) => PlatformError.SystemError({ reason: "Unknown", error: e })
            }).pipe(Effect.asVoid),
          remove: (key) =>
            Effect.tryPromise({
              try: () => redis.del(key),
              catch: (e) => PlatformError.SystemError({ reason: "Unknown", error: e })
            }).pipe(Effect.asVoid),
          clear: Effect.tryPromise({
            try: () => redis.flushdb(),
            catch: (e) => PlatformError.SystemError({ reason: "Unknown", error: e })
          }).pipe(Effect.asVoid),
          size: Effect.tryPromise({
            try: () => redis.dbsize(),
            catch: (e) => PlatformError.SystemError({ reason: "Unknown", error: e })
          })
        })
      )
    )
  )
```

### Migration Steps

1. [ ] Create `CachedExtractionResultSchema` in Domain/Schema
2. [ ] Refactor ExtractionCache to use KeyValueStore
3. [ ] Add Redis KeyValueStore layer
4. [ ] Update ProductionRuntime to provide Redis layer
5. [ ] Add tests with layerMemory

---

## Phase 2: PersistedCache-based ExecutionDeduplicator

### Current Implementation Analysis

```typescript
// packages/@core-v2/src/Service/ExecutionDeduplicator.ts
// Problems:
// 1. In-memory Ref<Map> - no cross-instance coordination
// 2. Manual Deferred management
// 3. No persistence - duplicate LLM calls across instances ($$$)
// 4. 102 lines of custom code
```

### Effect-Native Solution

**Source:** `@effect/experimental` - `PersistedCache`

PersistedCache combines:
- In-memory cache (fast lookups)
- Persistent storage (survives restarts)
- Built-in deduplication via lookup function
- Automatic TTL management

```typescript
// PersistedCache provides:
interface PersistedCache<K> {
  get: (key: K) => Effect<SuccessType<K>, FailureType<K> | PersistenceError>
  invalidate: (key: K) => Effect<void, PersistenceError>
}

// Constructor:
PersistedCache.make({
  storeId: "extraction-results",
  lookup: (key) => performExtraction(key),  // Only called if not cached!
  timeToLive: (key, exit) => Duration.hours(24),
  inMemoryCapacity: 100,
  inMemoryTTL: Duration.minutes(10)
})
```

### Implementation

**Key Schema (implements Persistable):**

```typescript
// packages/@core-v2/src/Domain/Schema/ExtractionKey.ts
import { Schema, PrimaryKey } from "effect"

export class ExtractionKey extends Schema.Class<ExtractionKey>("ExtractionKey")({
  idempotencyKey: Schema.String,
  ontologyVersion: Schema.String
}, {
  // PrimaryKey for cache lookup
  [PrimaryKey.symbol]() {
    return `${this.idempotencyKey}:${this.ontologyVersion}`
  }
}) {}

// Result schema for persistence
export class ExtractionResult extends Schema.Class<ExtractionResult>("ExtractionResult")({
  entities: Schema.Array(EntitySchema),
  relations: Schema.Array(RelationSchema)
}) {}

// Error schema
export class ExtractionError extends Schema.TaggedError<ExtractionError>()("ExtractionError", {
  message: Schema.String
}) {}
```

**Deduplicated Cache Service:**

```typescript
// packages/@core-v2/src/Service/ExtractionDeduplicator.ts
import { PersistedCache, Persistence } from "@effect/experimental"
import { Context, Effect, Layer, Duration } from "effect"
import { ExtractionKey, ExtractionResult, ExtractionError } from "../Domain/Schema/ExtractionKey.js"
import { ExtractionWorkflow } from "../Workflow/StreamingExtraction.js"

// Service type
export class ExtractionDeduplicator extends Context.Tag("@core-v2/ExtractionDeduplicator")<
  ExtractionDeduplicator,
  PersistedCache.PersistedCache<ExtractionKey>
>() {}

// Implementation - Layer.scoped for resource cleanup
export const ExtractionDeduplicatorLive = Layer.scoped(
  ExtractionDeduplicator,
  Effect.gen(function*() {
    const workflow = yield* ExtractionWorkflow

    return yield* PersistedCache.make({
      storeId: "extractions",

      // This is the magic - only called if NOT in cache
      lookup: (key: ExtractionKey) =>
        workflow.extract(key.text, key.config).pipe(
          Effect.map((result) => new ExtractionResult({
            entities: result.entities,
            relations: result.relations
          }))
        ),

      // Cache for 24 hours
      timeToLive: (key, exit) => Duration.hours(24),

      // Keep 100 recent results in memory
      inMemoryCapacity: 100,
      inMemoryTTL: Duration.minutes(10)
    })
  })
)

// Usage in JobManager is now trivial:
// const result = yield* deduplicator.get(new ExtractionKey({
//   idempotencyKey: computeIdempotencyKey(text, model, version),
//   ontologyVersion: "v1"
// }))
// That's it! Deduplication, caching, and persistence all handled
```

### Persistence Backend

```typescript
// packages/@core-v2/src/Service/RedisPersistence.ts
import { Persistence } from "@effect/experimental"
import { KeyValueStore } from "@effect/platform"
import { Layer } from "effect"
import { layerRedis } from "./RedisKeyValueStore.js"

// Persistence backed by Redis KeyValueStore
export const RedisPersistenceLive = (url: string) =>
  Persistence.layerKeyValueStore.pipe(
    Layer.provideMerge(layerRedis(url))
  )
```

### Migration Steps

1. [ ] Add `@effect/experimental` dependency
2. [ ] Create ExtractionKey schema with PrimaryKey
3. [ ] Refactor ExecutionDeduplicator to use PersistedCache
4. [ ] Simplify JobManager (remove manual dedup logic)
5. [ ] Add tests with Persistence.layerMemory

---

## Phase 3: Distributed RateLimiter

### Current Implementation Analysis

```typescript
// packages/@core-v2/src/Service/LlmControl/RateLimiter.ts
// Problems:
// 1. Per-instance rate limiting - 10 instances x 50 req/min = 500 req/min attempted
// 2. Manual sliding window implementation
// 3. Circuit breaker tightly coupled
// 4. 341 lines of custom code
```

### Effect-Native Solution

**Source:** `@effect/experimental` - `RateLimiter` + `RateLimiterStore`

```typescript
// RateLimiter provides:
interface RateLimiter {
  consume: (options: {
    algorithm: "fixed-window" | "token-bucket"
    onExceeded: "delay" | "fail"
    window: Duration
    limit: number
    key: string
    tokens?: number
  }) => Effect<ConsumeResult, RateLimiterError>
}

// ConsumeResult includes:
interface ConsumeResult {
  delay: Duration      // How long to wait
  limit: number        // Max requests in window
  remaining: number    // Remaining requests
  resetAfter: Duration // Time until reset
}

// Swappable backends:
RateLimiter.layerStoreMemory  // In-memory (single instance)
// Custom: Redis backend for distributed
```

### Implementation

**Redis RateLimiter Store:**

```typescript
// packages/@core-v2/src/Service/RedisRateLimiterStore.ts
import { RateLimiter, RateLimiterStore } from "@effect/experimental"
import { Effect, Layer, Duration } from "effect"
import { Redis } from "ioredis"

export const layerRedisStore = (url: string): Layer.Layer<RateLimiterStore> =>
  Layer.scoped(
    RateLimiterStore,
    Effect.acquireRelease(
      Effect.sync(() => new Redis(url)),
      (redis) => Effect.sync(() => redis.quit())
    ).pipe(
      Effect.map((redis) => ({
        fixedWindow: (options) =>
          Effect.tryPromise({
            try: async () => {
              const key = `ratelimit:${options.key}`
              const multi = redis.multi()
              multi.incr(key)
              multi.pttl(key)
              const results = await multi.exec()
              const count = results?.[0]?.[1] as number ?? 0
              const ttl = results?.[1]?.[1] as number ?? -1

              if (ttl === -1) {
                const expireMs = Duration.toMillis(options.refillRate)
                await redis.pexpire(key, expireMs)
                return [count, expireMs] as const
              }

              return [count, Math.max(0, ttl)] as const
            },
            catch: (e) => new RateLimiter.RateLimitStoreError({
              message: `Redis error: ${e}`,
              cause: e
            })
          }),

        tokenBucket: (options) =>
          Effect.tryPromise({
            try: async () => {
              // Lua script for atomic token bucket
              const script = `
                local key = KEYS[1]
                local tokens = tonumber(ARGV[1])
                local limit = tonumber(ARGV[2])
                local refillMs = tonumber(ARGV[3])
                local now = tonumber(ARGV[4])
                local allowOverflow = ARGV[5] == "true"

                local data = redis.call("HMGET", key, "tokens", "lastRefill")
                local currentTokens = tonumber(data[1]) or limit
                local lastRefill = tonumber(data[2]) or now

                -- Refill tokens
                local elapsed = now - lastRefill
                local refills = math.floor(elapsed / refillMs)
                currentTokens = math.min(limit, currentTokens + refills)

                -- Consume
                local newTokens = currentTokens - tokens
                if not allowOverflow and newTokens < 0 then
                  return currentTokens - tokens  -- Return negative (rejected)
                end

                redis.call("HMSET", key, "tokens", newTokens, "lastRefill", now)
                redis.call("PEXPIRE", key, refillMs * limit)

                return newTokens
              `

              const result = await redis.eval(
                script,
                1,
                `ratelimit:bucket:${options.key}`,
                options.tokens,
                options.limit,
                Duration.toMillis(options.refillRate),
                Date.now(),
                options.allowOverflow
              )

              return result as number
            },
            catch: (e) => new RateLimiter.RateLimitStoreError({
              message: `Redis error: ${e}`,
              cause: e
            })
          })
      }))
    )
  )
```

**LLM Rate Limiter Service:**

```typescript
// packages/@core-v2/src/Service/LlmRateLimiter.ts
import { RateLimiter } from "@effect/experimental"
import { Context, Effect, Layer, Duration } from "effect"

export class LlmRateLimiter extends Context.Tag("@core-v2/LlmRateLimiter")<
  LlmRateLimiter,
  {
    readonly withRateLimit: <A, E, R>(
      estimatedTokens: number,
      effect: Effect.Effect<A, E, R>
    ) => Effect.Effect<A, E | RateLimiter.RateLimiterError, R>
  }
>() {}

export const LlmRateLimiterLive = Layer.scoped(
  LlmRateLimiter,
  Effect.gen(function*() {
    const limiter = yield* RateLimiter.RateLimiter

    return {
      withRateLimit: <A, E, R>(estimatedTokens: number, effect: Effect.Effect<A, E, R>) =>
        Effect.gen(function*() {
          // Check request limit (50/min for Anthropic)
          const requestResult = yield* limiter.consume({
            algorithm: "fixed-window",
            onExceeded: "delay",
            window: Duration.minutes(1),
            limit: 50,
            key: "llm:requests"
          })

          // Check token limit (100k/min)
          const tokenResult = yield* limiter.consume({
            algorithm: "token-bucket",
            onExceeded: "delay",
            window: Duration.minutes(1),
            limit: 100_000,
            key: "llm:tokens",
            tokens: estimatedTokens
          })

          // Wait if needed
          const maxDelay = Duration.max(requestResult.delay, tokenResult.delay)
          if (!Duration.isZero(maxDelay)) {
            yield* Effect.logInfo("Rate limited, waiting", { delay: maxDelay })
            yield* Effect.sleep(maxDelay)
          }

          return yield* effect
        })
    }
  })
)
```

### Migration Steps

1. [ ] Create Redis RateLimiterStore implementation
2. [ ] Create simplified LlmRateLimiter service
3. [ ] Remove CentralRateLimiterService
4. [ ] Update LLM call sites to use new rate limiter
5. [ ] Keep circuit breaker separate (or use Effect retry with backoff)

---

## Phase 4: Production Runtime Composition

### Layer Composition

```typescript
// packages/@core-v2/src/Runtime/ProductionRuntime.ts
import { Layer } from "effect"
import { KeyValueStore } from "@effect/platform"
import { Persistence, RateLimiter } from "@effect/experimental"

// Redis URL from config
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379"

// Compose all layers
export const ProductionRuntimeLive = Layer.mergeAll(
  // Cache backed by Redis
  ExtractionCacheLive.pipe(
    Layer.provideMerge(layerRedis(redisUrl))
  ),

  // Deduplication with Redis persistence
  ExtractionDeduplicatorLive.pipe(
    Layer.provideMerge(RedisPersistenceLive(redisUrl))
  ),

  // Distributed rate limiting
  LlmRateLimiterLive.pipe(
    Layer.provideMerge(RateLimiter.layer),
    Layer.provideMerge(layerRedisStore(redisUrl))
  ),

  // Other services...
  JobManagerLive,
  ExtractionWorkflowLive
)

// Test runtime with in-memory everything
export const TestRuntimeLive = Layer.mergeAll(
  ExtractionCacheLive.pipe(
    Layer.provideMerge(KeyValueStore.layerMemory)
  ),
  ExtractionDeduplicatorLive.pipe(
    Layer.provideMerge(Persistence.layerMemory)
  ),
  LlmRateLimiterLive.pipe(
    Layer.provideMerge(RateLimiter.layer),
    Layer.provideMerge(RateLimiter.layerStoreMemory)
  )
)
```

---

## Cloud Run Configuration

### Redis Setup

1. **Memorystore for Redis** (managed):
   ```bash
   gcloud redis instances create ontology-cache \
     --region=us-central1 \
     --tier=basic \
     --size=1 \
     --redis-version=redis_7_0
   ```

2. **Connect Cloud Run to VPC** for Redis access

### Environment Variables

```yaml
# cloudbuild.yaml additions
env:
  - REDIS_URL=redis://10.0.0.1:6379  # Internal IP
```

### Scaling Configuration

```yaml
# Cloud Run service config
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containerConcurrency: 80  # Requests per instance
      timeoutSeconds: 300
```

---

## Summary: Code Reduction

| Service | Before | After | Reduction |
|---------|--------|-------|-----------|
| ExtractionCache | 111 LOC | ~15 LOC | 86% |
| ExecutionDeduplicator | 102 LOC | ~25 LOC | 75% |
| CentralRateLimiter | 341 LOC | ~40 LOC | 88% |
| Redis backends | 0 LOC | ~100 LOC | (new) |
| **Total** | **554 LOC** | **~180 LOC** | **67%** |

Plus:
- Type-safe schemas throughout
- Automatic TTL management
- Built-in deduplication
- Swappable backends for testing
- Effect-native error handling

---

## Implementation Order

1. **Phase 1:** KeyValueStore cache (lowest risk, immediate benefit)
2. **Phase 2:** PersistedCache deduplication (biggest cost savings)
3. **Phase 3:** Distributed rate limiting (enables true scaling)
4. **Phase 4:** Production runtime + Redis setup
5. **Testing:** Run single instance first, then scale to 3, then 10

---

## References

- Effect Platform KeyValueStore: `docs/effect-source/platform/src/KeyValueStore.ts`
- Effect Experimental Persistence: `docs/effect-source/experimental/src/Persistence.ts`
- Effect Experimental PersistedCache: `docs/effect-source/experimental/src/PersistedCache.ts`
- Effect Experimental RateLimiter: `docs/effect-source/experimental/src/RateLimiter.ts`
