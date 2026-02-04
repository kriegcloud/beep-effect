# Effect-Native Cloud Run Migration Plan v2

**Date:** 2024-12-10
**Status:** Draft - Comprehensive
**Goal:** Production-ready multi-instance Cloud Run deployment with Effect-native abstractions

## Design Decisions

### Redis Configuration
- **Offering:** Memorystore Basic (1GB) - sufficient for cache/dedup/rate-limit
- **TLS:** Required in production, optional in dev
- **Auth:** IAM-based (no password in Memorystore)
- **Latency Budget:** p99 < 10ms for get/set operations
- **Connection:** VPC connector (no public egress)

### TTL Policies
| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Extraction cache | 24 hours | Balance freshness vs cost |
| Dedup handles | 1 hour | Prevent duplicate in-flight, allow retry |
| Rate limit windows | 1 minute | Match API rate limit windows |

### Fallback Posture
- **Redis unavailable:** Fail fast with clear error (no silent degradation)
- **Rationale:** Prefer predictable failure over unpredictable behavior; in-memory fallback causes rate limit exhaustion at scale

### Provider Rate Limits (configurable)
| Provider | Requests/min | Tokens/min | Concurrent |
|----------|--------------|------------|------------|
| Anthropic | 50 | 100,000 | 5 |
| OpenAI | 60 | 150,000 | 10 |
| Google | 60 | 100,000 | 8 |

---

## Phase 0: Foundations

### 0.1 Dependencies

```json
{
  "dependencies": {
    "@effect/platform": "^0.72.0",
    "@effect/experimental": "^0.35.0",
    "ioredis": "^5.4.1"
  }
}
```

Pin exact versions in lockfile. Test Effect version compatibility before upgrading.

### 0.2 Redis Client Wrapper

A resilient Redis client with timeout, retry, circuit breaker, and observability.

```typescript
// packages/@core-v2/src/Infrastructure/Redis/RedisClient.ts
import { Context, Data, Duration, Effect, Layer, Schedule, pipe } from "effect"
import { Redis } from "ioredis"

// =============================================================================
// Configuration
// =============================================================================

export interface RedisConfig {
  readonly url: string
  readonly tls: boolean
  readonly connectTimeoutMs: number
  readonly commandTimeoutMs: number
  readonly maxRetries: number
  readonly retryDelayMs: number
  readonly poolSize: number
  readonly keyPrefix: string
}

export const DEFAULT_REDIS_CONFIG: RedisConfig = {
  url: "redis://localhost:6379",
  tls: false,
  connectTimeoutMs: 5000,
  commandTimeoutMs: 1000,
  maxRetries: 3,
  retryDelayMs: 100,
  poolSize: 10,
  keyPrefix: "ontology:"
}

// =============================================================================
// Errors
// =============================================================================

export class RedisError extends Data.TaggedError("RedisError")<{
  readonly operation: string
  readonly cause: unknown
  readonly retriable: boolean
}> {
  get message() {
    return `Redis ${this.operation} failed: ${this.cause}`
  }
}

export class RedisUnavailableError extends Data.TaggedError("RedisUnavailableError")<{
  readonly reason: string
}> {
  get message() {
    return `Redis unavailable: ${this.reason}`
  }
}

// =============================================================================
// Service Interface
// =============================================================================

export interface RedisClientApi {
  readonly get: (key: string) => Effect.Effect<string | null, RedisError>
  readonly set: (key: string, value: string, ttlSeconds?: number) => Effect.Effect<void, RedisError>
  readonly del: (key: string) => Effect.Effect<void, RedisError>
  readonly incr: (key: string) => Effect.Effect<number, RedisError>
  readonly expire: (key: string, ttlSeconds: number) => Effect.Effect<void, RedisError>
  readonly pttl: (key: string) => Effect.Effect<number, RedisError>
  readonly eval: <T>(script: string, keys: string[], args: (string | number)[]) => Effect.Effect<T, RedisError>
  readonly healthCheck: () => Effect.Effect<boolean, RedisError>
  readonly metrics: () => Effect.Effect<RedisMetrics>
}

export interface RedisMetrics {
  readonly commandsExecuted: number
  readonly commandsFailed: number
  readonly avgLatencyMs: number
  readonly circuitState: "closed" | "open" | "half_open"
}

// =============================================================================
// Implementation
// =============================================================================

export class RedisClient extends Context.Tag("@core-v2/RedisClient")<
  RedisClient,
  RedisClientApi
>() {}

export const RedisClientLive = (config: RedisConfig): Layer.Layer<RedisClient> =>
  Layer.scoped(
    RedisClient,
    Effect.acquireRelease(
      makeRedisClient(config),
      () => Effect.logInfo("Redis client closing").pipe(Effect.asVoid)
    )
  )

// Implementation details in makeRedisClient...
```

### 0.3 Extended Configuration

```typescript
// packages/@core-v2/src/Service/Config.ts - additions

export interface Config {
  // ... existing fields ...

  readonly redis: {
    readonly url: string
    readonly tls: boolean
    readonly connectTimeoutMs: number
    readonly commandTimeoutMs: number
    readonly maxRetries: number
    readonly keyPrefix: string
  }

  readonly cache: {
    readonly extractionTtlSeconds: number
    readonly dedupTtlSeconds: number
    readonly maxEntries: number
  }

  readonly rateLimits: {
    readonly anthropic: ProviderRateLimits
    readonly openai: ProviderRateLimits
    readonly google: ProviderRateLimits
  }
}

export interface ProviderRateLimits {
  readonly requestsPerMinute: number
  readonly tokensPerMinute: number
  readonly maxConcurrent: number
}
```

### 0.4 Observability Foundation

```typescript
// packages/@core-v2/src/Infrastructure/Observability/Metrics.ts
import { Metric } from "effect"

// Cache metrics
export const cacheHits = Metric.counter("cache_hits_total")
export const cacheMisses = Metric.counter("cache_misses_total")
export const cacheLatency = Metric.histogram("cache_latency_ms", {
  boundaries: [1, 5, 10, 25, 50, 100, 250, 500]
})

// Dedup metrics
export const dedupLookups = Metric.counter("dedup_lookups_total")
export const dedupHits = Metric.counter("dedup_hits_total")
export const dedupNewExecutions = Metric.counter("dedup_new_executions_total")

// Rate limit metrics
export const rateLimitDelays = Metric.counter("ratelimit_delays_total")
export const rateLimitDelayMs = Metric.histogram("ratelimit_delay_ms", {
  boundaries: [100, 500, 1000, 5000, 10000, 30000, 60000]
})
export const rateLimitExceeded = Metric.counter("ratelimit_exceeded_total")

// Redis metrics
export const redisCommands = Metric.counter("redis_commands_total")
export const redisErrors = Metric.counter("redis_errors_total")
export const redisLatency = Metric.histogram("redis_latency_ms", {
  boundaries: [1, 2, 5, 10, 25, 50, 100]
})
```

---

## Phase 1: KeyValueStore Cache

### 1.1 Schema Definition (type-safe, no Unknown)

```typescript
// packages/@core-v2/src/Domain/Schema/Cache.ts
import { Schema } from "effect"
import { EntitySchema, RelationSchema } from "./Entity.js"

export class CachedExtractionResult extends Schema.Class<CachedExtractionResult>(
  "CachedExtractionResult"
)({
  entities: Schema.Array(EntitySchema),
  relations: Schema.Array(RelationSchema),
  metadata: Schema.Struct({
    computedAt: Schema.DateFromString,
    model: Schema.String,
    temperature: Schema.Number,
    computedInMs: Schema.Number,
    ontologyVersion: Schema.String,
    inputHash: Schema.String
  })
}) {}

export class CacheSchemaError extends Schema.TaggedError<CacheSchemaError>()(
  "CacheSchemaError",
  { key: Schema.String, parseError: Schema.String }
) {}
```

### 1.2 Redis-backed KeyValueStore

```typescript
// packages/@core-v2/src/Infrastructure/Redis/RedisKeyValueStore.ts
import { KeyValueStore, PlatformError } from "@effect/platform"
import { Effect, Layer, Option } from "effect"
import { RedisClient } from "./RedisClient.js"

export const RedisKeyValueStoreLive: Layer.Layer<
  KeyValueStore.KeyValueStore,
  never,
  RedisClient
> = Layer.scoped(
  KeyValueStore.KeyValueStore,
  Effect.gen(function*() {
    const redis = yield* RedisClient

    return KeyValueStore.make({
      get: (key) =>
        redis.get(key).pipe(
          Effect.map(Option.fromNullable),
          Effect.mapError(toPlatformError)
        ),
      set: (key, value) =>
        redis.set(key, typeof value === "string" ? value : new TextDecoder().decode(value)).pipe(
          Effect.mapError(toPlatformError)
        ),
      remove: (key) => redis.del(key).pipe(Effect.mapError(toPlatformError)),
      clear: Effect.fail(PlatformError.SystemError({ reason: "NotSupported", module: "Redis", method: "clear", message: "Not supported" })),
      size: Effect.fail(PlatformError.SystemError({ reason: "NotSupported", module: "Redis", method: "size", message: "Not supported" }))
    })
  })
)
```

### 1.3 ExtractionCache Service

```typescript
// packages/@core-v2/src/Service/ExtractionCache.ts
export class ExtractionCache extends Context.Tag("@core-v2/ExtractionCache")<
  ExtractionCache,
  ExtractionCacheApi
>() {}

export const ExtractionCacheLive: Layer.Layer<
  ExtractionCache,
  never,
  KeyValueStore.KeyValueStore | ConfigService
> = Layer.scoped(
  ExtractionCache,
  Effect.gen(function*() {
    const store = yield* KeyValueStore.KeyValueStore
    const config = yield* ConfigService
    const schemaStore = store.forSchema(CachedExtractionResult)

    return {
      get: (key) => schemaStore.get(key).pipe(
        Effect.catchTag("ParseError", () => store.remove(key).pipe(Effect.map(() => Option.none())))
      ),
      set: (key, value) => schemaStore.set(key, value),
      invalidate: (key) => store.remove(key)
    }
  })
)
```

---

## Phase 2: PersistedCache Deduplication

### 2.1 Extraction Key (includes model/temp/version - no collisions)

```typescript
// packages/@core-v2/src/Domain/Schema/ExtractionKey.ts
import { Schema, PrimaryKey } from "effect"
import { createHash } from "crypto"

export class ExtractionKey extends Schema.Class<ExtractionKey>("ExtractionKey")({
  textHash: Schema.String,
  model: Schema.String,
  ontologyVersion: Schema.String,
  temperature: Schema.Number
}) {
  [PrimaryKey.symbol]() {
    return `${this.textHash}:${this.model}:${this.ontologyVersion}:${this.temperature}`
  }

  static fromInputs(text: string, model: string, ontologyVersion: string, temperature: number) {
    const hash = createHash("sha256").update(text).digest("hex").slice(0, 32)
    return new ExtractionKey({ textHash: hash, model, ontologyVersion, temperature })
  }
}
```

### 2.2 Redis Persistence Backend

```typescript
// packages/@core-v2/src/Infrastructure/Redis/RedisPersistence.ts
export const RedisBackingPersistenceLive: Layer.Layer<
  Persistence.BackingPersistence,
  never,
  RedisClient
> = Layer.scoped(
  Persistence.BackingPersistence,
  Effect.gen(function*() {
    const redis = yield* RedisClient
    // ... implementation with get/set/remove using redis client
  })
)

export const RedisPersistenceLive = Persistence.layerResult.pipe(
  Layer.provideMerge(RedisBackingPersistenceLive)
)
```

### 2.3 Extraction Deduplicator with Backpressure

```typescript
// packages/@core-v2/src/Service/ExtractionDeduplicator.ts
export const ExtractionDeduplicatorLive: Layer.Layer<
  ExtractionDeduplicator,
  never,
  ExtractionWorkflow | Persistence.ResultPersistence | ConfigService
> = Layer.scoped(
  ExtractionDeduplicator,
  Effect.gen(function*() {
    const workflow = yield* ExtractionWorkflow
    const config = yield* ConfigService

    // Bounded concurrency for backpressure
    const semaphore = yield* Effect.makeSemaphore(config.runtime.extractionConcurrency)

    const cache = yield* PersistedCache.make<ExtractionKey, never>({
      storeId: "extractions-v1",
      lookup: (key) => semaphore.withPermits(1)(/* extraction logic */),
      timeToLive: (key, exit) => Duration.seconds(config.cache.dedupTtlSeconds),
      inMemoryCapacity: 100,
      inMemoryTTL: Duration.minutes(5)
    })

    return { extract: (key, text) => /* use cache with semaphore */ }
  })
)
```

---

## Phase 3: Distributed Rate Limiting

### 3.1 Config-Driven Provider Limits

```typescript
// packages/@core-v2/src/Service/LlmRateLimiter.ts
export const LlmRateLimiterLive: Layer.Layer<
  LlmRateLimiter,
  never,
  RateLimiter.RateLimiter | ConfigService
> = Layer.scoped(
  LlmRateLimiter,
  Effect.gen(function*() {
    const limiter = yield* RateLimiter.RateLimiter
    const config = yield* ConfigService

    const getLimits = (): ProviderRateLimits => config.rateLimits[config.llm.provider]
    const keyPrefix = `llm:${config.llm.provider}`

    return {
      withRateLimit: (estimatedTokens, effect) =>
        Effect.gen(function*() {
          const limits = getLimits()

          const requestResult = yield* limiter.consume({
            algorithm: "fixed-window",
            onExceeded: "delay",
            window: Duration.minutes(1),
            limit: limits.requestsPerMinute,
            key: `${keyPrefix}:requests`
          })

          const tokenResult = yield* limiter.consume({
            algorithm: "token-bucket",
            onExceeded: "delay",
            window: Duration.minutes(1),
            limit: limits.tokensPerMinute,
            key: `${keyPrefix}:tokens`,
            tokens: estimatedTokens
          })

          // Delay with jitter
          const baseDelay = Duration.max(requestResult.delay, tokenResult.delay)
          if (!Duration.isZero(baseDelay)) {
            const jitter = Math.random() * 100
            yield* Effect.sleep(Duration.millis(Duration.toMillis(baseDelay) + jitter))
          }

          return yield* effect
        })
    }
  })
)
```

### 3.2 Redis Rate Limiter Store (hardened Lua scripts)

```typescript
// packages/@core-v2/src/Infrastructure/Redis/RedisRateLimiterStore.ts
const FIXED_WINDOW_SCRIPT = `
local key = KEYS[1]
local tokens = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "count", "windowStart")
local count = tonumber(data[1]) or 0
local windowStart = tonumber(data[2]) or now

if now - windowStart >= windowMs then
  count = 0
  windowStart = now
end

local newCount = count + tokens
if limit and newCount > limit then
  return {count + tokens, windowMs - (now - windowStart)}
end

redis.call("HMSET", key, "count", newCount, "windowStart", windowStart)
redis.call("PEXPIRE", key, windowMs * 2)
return {newCount, windowMs - (now - windowStart)}
`

export const RedisRateLimiterStoreLive: Layer.Layer<
  RateLimiter.RateLimiterStore,
  never,
  RedisClient
> = Layer.scoped(
  RateLimiter.RateLimiterStore,
  Effect.gen(function*() {
    const redis = yield* RedisClient
    return RateLimiter.RateLimiterStore.of({
      fixedWindow: (options) => redis.eval(FIXED_WINDOW_SCRIPT, [...], [...]),
      tokenBucket: (options) => redis.eval(TOKEN_BUCKET_SCRIPT, [...], [...])
    })
  })
)
```

---

## Phase 4: Production Runtime

### 4.1 Layer Composition

```typescript
// packages/@core-v2/src/Runtime/ProductionRuntime.ts
const RedisLayer = RedisClientLive({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
  tls: process.env.REDIS_TLS === "true",
  // ... other config
})

const InfrastructureLayers = Layer.mergeAll(
  RedisKeyValueStoreLive,
  RedisPersistenceLive,
  RedisRateLimiterStoreLive
).pipe(Layer.provideMerge(RedisLayer))

const ServiceLayers = Layer.mergeAll(
  ExtractionCacheLive,
  ExtractionDeduplicatorLive,
  LlmRateLimiterLive.pipe(Layer.provideMerge(RateLimiter.layer)),
  JobManagerLive
)

export const ProductionLayers = ServiceLayers.pipe(
  Layer.provideMerge(InfrastructureLayers),
  Layer.provideMerge(ConfigLayer)
)
```

### 4.2 Health Checks (Redis-aware)

```typescript
ready: () =>
  Effect.gen(function*() {
    const redisHealthy = yield* redis.healthCheck().pipe(
      Effect.timeout(Duration.seconds(2)),
      Effect.catchAll(() => Effect.succeed(false))
    )
    const metrics = yield* redis.metrics()

    if (!redisHealthy) return { status: "error", redis: "unhealthy" }
    if (metrics.circuitState === "open") return { status: "degraded", redis: "circuit_open" }
    return { status: "ok" }
  })
```

---

## Phase 5: SLOs and Observability

### 5.1 SLO Definitions

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Redis p99 latency | < 10ms | > 50ms for 5min |
| Redis availability | 99.9% | < 99% for 5min |
| Cache hit rate | > 70% | < 50% for 15min |
| Dedup success rate | > 95% | < 90% for 5min |
| Rate limit delay p99 | < 5s | > 30s for 5min |

---

## Implementation Checklist

### Phase 0: Foundations
- [ ] Add `@effect/experimental@^0.35.0` dependency
- [ ] Add `ioredis@^5.4.1` dependency
- [ ] Create `Infrastructure/Redis/RedisClient.ts` with retry/circuit-breaker
- [ ] Extend `Config.ts` with redis/cache/rateLimits sections
- [ ] Create `Infrastructure/Observability/Metrics.ts`

### Phase 1: KeyValueStore Cache
- [ ] Create `Domain/Schema/Cache.ts` with typed schema
- [ ] Create `Infrastructure/Redis/RedisKeyValueStore.ts`
- [ ] Refactor `Service/ExtractionCache.ts` to use KeyValueStore
- [ ] Add unit tests (schema validation)
- [ ] Add integration tests (Redis TTL, concurrent access)

### Phase 2: PersistedCache Dedup
- [ ] Create `Domain/Schema/ExtractionKey.ts` with PrimaryKey
- [ ] Create `Infrastructure/Redis/RedisPersistence.ts`
- [ ] Refactor `Service/ExtractionDeduplicator.ts` to use PersistedCache
- [ ] Simplify `Service/JobManager.ts`
- [ ] Add unit tests (key collision, TTL)
- [ ] Add integration tests (multi-process dedup)

### Phase 3: Distributed Rate Limiting
- [ ] Create `Infrastructure/Redis/RedisRateLimiterStore.ts` with Lua scripts
- [ ] Create `Service/LlmRateLimiter.ts` with config-driven limits
- [ ] Remove old `Service/LlmControl/RateLimiter.ts`
- [ ] Add unit tests (fixed-window, token-bucket)
- [ ] Add integration tests (multi-client contention)

### Phase 4: Production Runtime
- [ ] Update `Runtime/ProductionRuntime.ts` with layer composition
- [ ] Update `Runtime/HealthCheck.ts` with Redis health
- [ ] Create Cloud Run service config with VPC connector
- [ ] Create secrets in Secret Manager
- [ ] Test single instance deployment
- [ ] Scale to 3 instances, validate dedup/rate-limit
- [ ] Scale to 10 instances, load test

### Phase 5: Observability
- [ ] Export metrics to Cloud Monitoring
- [ ] Configure alert policies
- [ ] Add structured logging
- [ ] Create dashboard

---

## References

- Effect Platform: `docs/effect-source/platform/src/KeyValueStore.ts`
- Effect Experimental: `docs/effect-source/experimental/src/`
- Cloud Run VPC: https://cloud.google.com/run/docs/configuring/vpc-connectors
- Memorystore: https://cloud.google.com/memorystore/docs/redis
