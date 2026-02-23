# Duration: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Duration Solves

Working with time spans in JavaScript is surprisingly error-prone. The standard approach relies on milliseconds as numbers, leading to confusion, unit conversion errors, and lack of type safety:

```typescript
// Traditional approach - prone to errors and confusion
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Which unit is this? Milliseconds? Seconds?
function setTimeout(callback: () => void, delay: number) {
  // ...
}

// Manual conversions everywhere
const cacheTimeout = 5 * MINUTE; // Is this 5 minutes or 300000?
const retryDelay = 2 * SECOND;   // Easy to forget conversion
const sessionDuration = 30;       // 30 what? Seconds? Minutes?

// Arithmetic becomes complex
function addMinutesToMs(ms: number, minutes: number): number {
  return ms + (minutes * 60 * 1000);
}

// Comparing durations requires careful unit alignment
function isExpired(createdAt: number, ttlSeconds: number): boolean {
  const now = Date.now();
  const elapsedMs = now - createdAt;
  const ttlMs = ttlSeconds * 1000; // Don't forget to convert!
  return elapsedMs > ttlMs;
}

// Formatting for display is manual
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
```

This approach leads to:
- **Unit Confusion** - Mixing milliseconds, seconds, and other units without type safety
- **Conversion Errors** - Forgetting to multiply/divide by 1000, 60, etc.
- **Poor Readability** - Code intent unclear without explicit unit comments
- **Calculation Complexity** - Manual arithmetic for duration operations
- **No Validation** - Easy to create invalid durations (negative values, overflow)

### The Duration Solution

Effect's Duration module provides a type-safe, unit-aware abstraction for time spans:

```typescript
import { Duration, Effect, pipe } from "effect"

// Clear, type-safe duration creation
const cacheTimeout = Duration.minutes(5)      // Obviously 5 minutes
const retryDelay = Duration.seconds(2)        // Obviously 2 seconds
const sessionDuration = Duration.hours(1.5)   // Supports decimals

// Arithmetic operations with type safety
const totalTimeout = Duration.add(cacheTimeout, retryDelay)

// Comparisons are straightforward
const isLonger = Duration.greaterThan(sessionDuration, cacheTimeout)

// Automatic formatting
console.log(Duration.format(sessionDuration)) // "1 hour 30 minutes"

// Integration with Effect operations
const withTimeout = Effect.sleep(Duration.seconds(5)).pipe(
  Effect.timeout(Duration.seconds(3))
)
```

### Key Concepts

**Duration**: A type-safe representation of a time span with nanosecond precision. Durations are immutable and support arithmetic operations.

```typescript
const duration: Duration.Duration = Duration.seconds(30)
```

**Duration Units**: Multiple units for creating durations - nanos, micros, millis, seconds, minutes, hours, days, weeks.

```typescript
const nano = Duration.nanos(1000n)
const micro = Duration.micros(1000)
const milli = Duration.millis(1000)
const second = Duration.seconds(1)
// All represent the same duration
```

**Duration Arithmetic**: Type-safe operations for adding, subtracting, and scaling durations.

```typescript
const sum = Duration.add(Duration.minutes(5), Duration.seconds(30))
const difference = Duration.subtract(Duration.hours(2), Duration.minutes(30))
const scaled = Duration.times(Duration.minutes(10), 3)
```

## Basic Usage Patterns

### Creating Durations

```typescript
import { Duration } from "effect"

// From different units
const fromNanos = Duration.nanos(1000000n)      // BigInt for precision
const fromMicros = Duration.micros(1000)        // 1 millisecond
const fromMillis = Duration.millis(1000)        // 1 second
const fromSeconds = Duration.seconds(60)        // 1 minute
const fromMinutes = Duration.minutes(60)        // 1 hour
const fromHours = Duration.hours(24)            // 1 day
const fromDays = Duration.days(7)               // 1 week
const fromWeeks = Duration.weeks(4)             // ~1 month

// Special values
const zero = Duration.zero                      // 0 duration
const infinity = Duration.infinity              // Infinite duration

// From numeric values with decimals
const preciseTime = Duration.seconds(2.5)       // 2.5 seconds
const partialHour = Duration.hours(1.75)        // 1 hour 45 minutes

// From a Date difference
const start = new Date('2024-01-01')
const end = new Date('2024-01-02')
const elapsed = Duration.millis(end.getTime() - start.getTime())
```

### Duration Arithmetic

```typescript
import { Duration, pipe } from "effect"

// Addition
const totalTime = Duration.add(Duration.minutes(30), Duration.seconds(45)) // 30 minutes 45 seconds

// Chaining additions
const accumulated = pipe(
  Duration.add(Duration.hours(1), Duration.minutes(30)),
  Duration.add(Duration.seconds(15))
) // 1 hour 30 minutes 15 seconds

// Subtraction
const remaining = Duration.subtract(Duration.hours(2), Duration.minutes(45)) // 1 hour 15 minutes

// Multiplication
const tripled = Duration.times(Duration.minutes(20), 3) // 60 minutes

// Division (returns number)
const ratio = Duration.divide(Duration.hours(3), Duration.hours(1)) // 3
```

### Duration Comparisons

```typescript
import { Duration, pipe } from "effect"

const timeout1 = Duration.seconds(30)
const timeout2 = Duration.minutes(1)

// Equality check
const isEqual = Duration.equals(timeout1, Duration.seconds(30)) // true

// Ordering comparisons
const isLess = Duration.lessThan(timeout1, timeout2)           // true
const isLessOrEqual = Duration.lessThanOrEqualTo(timeout1, timeout2) // true
const isGreater = Duration.greaterThan(timeout2, timeout1)     // true
const isGreaterOrEqual = Duration.greaterThanOrEqualTo(timeout2, timeout1) // true

// Finding min/max
const minimum = Duration.min(timeout1, timeout2) // 30 seconds
const maximum = Duration.max(timeout1, timeout2) // 1 minute

// Clamping to a range
const clamped = Duration.clamp(Duration.seconds(90), {
  minimum: Duration.seconds(30),
  maximum: Duration.minutes(1)
}) // Returns 1 minute (clamped to maximum)
```

## Real-World Examples

### Example 1: API Rate Limiting

Managing rate limits with precise time windows and backoff strategies:

```typescript
import { Effect, Duration, Ref, pipe, Schedule } from "effect"

interface RateLimiter {
  readonly checkLimit: Effect.Effect<void, RateLimitExceeded>
  readonly recordRequest: Effect.Effect<void>
}

class RateLimitExceeded {
  readonly _tag = "RateLimitExceeded"
  constructor(
    readonly retryAfter: Duration.Duration,
    readonly limit: number,
    readonly window: Duration.Duration
  ) {}
}

const makeRateLimiter = (
  limit: number,
  window: Duration.Duration
): Effect.Effect<RateLimiter> =>
  Effect.gen(function* () {
    const requests = yield* Ref.make<Array<number>>([])
    
    const checkLimit = Effect.gen(function* () {
      const now = Date.now()
      const windowStart = now - Number(Duration.toMillis(window))
      
      const currentRequests = yield* Ref.get(requests)
      const validRequests = currentRequests.filter(time => time > windowStart)
      
      if (validRequests.length >= limit) {
        const oldestRequest = Math.min(...validRequests)
        const retryAfter = Duration.millis(oldestRequest + Number(Duration.toMillis(window)) - now)
        
        return yield* Effect.fail(
          new RateLimitExceeded(retryAfter, limit, window)
        )
      }
      
      yield* Ref.set(requests, validRequests)
    })
    
    const recordRequest = Effect.gen(function* () {
      const now = Date.now()
      yield* Ref.update(requests, (reqs) => [...reqs, now])
    })
    
    return { checkLimit, recordRequest }
  })

// Usage with retry strategy
const makeApiCall = (url: string) =>
  Effect.gen(function* () {
    const limiter = yield* makeRateLimiter(100, Duration.minutes(1))
    
    yield* limiter.checkLimit
    yield* limiter.recordRequest
    
    // Make the actual API call
    return yield* Effect.tryPromise({
      try: () => fetch(url),
      catch: (error) => new Error(`API call failed: ${error}`)
    })
  })

// Retry with exponential backoff on rate limit
const apiCallWithRetry = (url: string) =>
  pipe(
    Effect.retry(
      makeApiCall(url),
      Schedule.either(
        Schedule.exponential(Duration.seconds(1), 2),
        Schedule.recurs(5) // Max 5 retries
      )
    ),
    Effect.catchTag("RateLimitExceeded", (error) =>
      Effect.gen(function* () {
        console.log(`Rate limited. Retry after ${Duration.format(error.retryAfter)}`)
        yield* Effect.sleep(error.retryAfter)
        return yield* makeApiCall(url)
      })
    )
  )
```

### Example 2: Cache with TTL Management

Implementing a cache with time-to-live and stale-while-revalidate patterns:

```typescript
import { Effect, Duration, Ref, Option, pipe } from "effect"

interface CacheEntry<T> {
  readonly value: T
  readonly insertedAt: number
  readonly ttl: Duration.Duration
  readonly staleWhileRevalidate?: Duration.Duration
}

interface Cache<T> {
  readonly get: (key: string) => Effect.Effect<Option.Option<T>>
  readonly set: (
    key: string,
    value: T,
    ttl: Duration.Duration,
    staleWhileRevalidate?: Duration.Duration
  ) => Effect.Effect<void>
  readonly invalidate: (key: string) => Effect.Effect<void>
  readonly cleanup: Effect.Effect<number>
}

const makeCache = <T>(): Effect.Effect<Cache<T>> =>
  Effect.gen(function* () {
    const store = yield* Ref.make<Map<string, CacheEntry<T>>>(new Map())
    
    const isExpired = (entry: CacheEntry<T>, now: number): boolean => {
      const age = Duration.millis(now - entry.insertedAt)
      return Duration.greaterThan(age, entry.ttl)
    }
    
    const isStale = (entry: CacheEntry<T>, now: number): boolean => {
      if (!entry.staleWhileRevalidate) return false
      
      const age = Duration.millis(now - entry.insertedAt)
      const staleTime = Duration.add(entry.ttl, entry.staleWhileRevalidate)
      
      return Duration.greaterThan(age, staleTime)
    }
    
    const get = (key: string) =>
      Effect.gen(function* () {
        const now = Date.now()
        const entries = yield* Ref.get(store)
        const entry = entries.get(key)
        
        if (!entry) return Option.none()
        
        if (isStale(entry, now)) {
          // Remove completely stale entries
          yield* Ref.update(store, (map) => {
            const newMap = new Map(map)
            newMap.delete(key)
            return newMap
          })
          return Option.none()
        }
        
        if (isExpired(entry, now) && entry.staleWhileRevalidate) {
          // Return stale value but mark for revalidation
          console.log(`Cache hit (stale): ${key}`)
          return Option.some(entry.value)
        }
        
        if (!isExpired(entry, now)) {
          console.log(`Cache hit: ${key}`)
          return Option.some(entry.value)
        }
        
        return Option.none()
      })
    
    const set = (
      key: string,
      value: T,
      ttl: Duration.Duration,
      staleWhileRevalidate?: Duration.Duration
    ) =>
      Ref.update(store, (map) => {
        const newMap = new Map(map)
        newMap.set(key, {
          value,
          insertedAt: Date.now(),
          ttl,
          staleWhileRevalidate
        })
        return newMap
      })
    
    const invalidate = (key: string) =>
      Ref.update(store, (map) => {
        const newMap = new Map(map)
        newMap.delete(key)
        return newMap
      })
    
    const cleanup = Effect.gen(function* () {
      const now = Date.now()
      const entries = yield* Ref.get(store)
      let removed = 0
      
      const newMap = new Map<string, CacheEntry<T>>()
      
      for (const [key, entry] of entries) {
        if (!isStale(entry, now)) {
          newMap.set(key, entry)
        } else {
          removed++
        }
      }
      
      yield* Ref.set(store, newMap)
      return removed
    })
    
    return { get, set, invalidate, cleanup }
  })

// Usage example with automatic cleanup
const cacheProgram = Effect.gen(function* () {
  const cache = yield* makeCache<string>()
  
  // Set values with different TTLs
  yield* cache.set(
    "user:123",
    "John Doe",
    Duration.minutes(5),
    Duration.minutes(1) // Serve stale for 1 minute after expiry
  )
  
  yield* cache.set(
    "config:app",
    "production",
    Duration.hours(1)
  )
  
  // Schedule periodic cleanup
  yield* Effect.fork(
    Effect.repeat(
      cache.cleanup,
      Schedule.fixed(Duration.minutes(5))
    )
  )
  
  // Check cache after some time
  yield* Effect.sleep(Duration.minutes(6))
  
  const user = yield* cache.get("user:123") // May return stale value
  const config = yield* cache.get("config:app") // Still fresh
  
  console.log({ user, config })
})
```

### Example 3: Performance Monitoring

Tracking operation durations and calculating statistics:

```typescript
import { Effect, Duration, Ref, Chunk, pipe } from "effect"

interface PerformanceMetrics {
  readonly min: Duration.Duration
  readonly max: Duration.Duration
  readonly mean: Duration.Duration
  readonly median: Duration.Duration
  readonly p95: Duration.Duration
  readonly p99: Duration.Duration
}

interface PerformanceMonitor {
  readonly track: <A, E>(
    name: string,
    effect: Effect.Effect<A, E>
  ) => Effect.Effect<A, E>
  readonly getMetrics: (name: string) => Effect.Effect<Option.Option<PerformanceMetrics>>
  readonly reset: (name: string) => Effect.Effect<void>
}

const makePerformanceMonitor = (): Effect.Effect<PerformanceMonitor> =>
  Effect.gen(function* () {
    const measurements = yield* Ref.make<Map<string, Chunk.Chunk<Duration.Duration>>>(new Map())
    
    const calculateMetrics = (durations: Chunk.Chunk<Duration.Duration>): PerformanceMetrics => {
      const sorted = pipe(
        Chunk.toArray(durations),
        (arr) => arr.sort((a, b) => 
          Number(Duration.toNanos(a) - Duration.toNanos(b))
        ),
        Chunk.fromIterable
      )
      
      const size = Chunk.size(sorted)
      const sum = Chunk.reduce(
        sorted,
        Duration.zero,
        (acc, duration) => Duration.add(acc, duration)
      )
      
      return {
        min: Chunk.unsafeGet(sorted, 0),
        max: Chunk.unsafeGet(sorted, size - 1),
        mean: Duration.millis(Number(Duration.toMillis(sum)) / size),
        median: Chunk.unsafeGet(sorted, Math.floor(size / 2)),
        p95: Chunk.unsafeGet(sorted, Math.floor(size * 0.95)),
        p99: Chunk.unsafeGet(sorted, Math.floor(size * 0.99))
      }
    }
    
    const track = <A, E>(name: string, effect: Effect.Effect<A, E>) =>
      Effect.gen(function* () {
        const start = yield* Effect.sync(() => process.hrtime.bigint())
        
        try {
          return yield* effect
        } finally {
          const end = yield* Effect.sync(() => process.hrtime.bigint())
          const duration = Duration.nanos(end - start)
          
          yield* Ref.update(measurements, (map) => {
            const newMap = new Map(map)
            const existing = newMap.get(name) || Chunk.empty<Duration.Duration>()
            newMap.set(name, Chunk.append(existing, duration))
            return newMap
          })
          
          console.log(`${name} took ${Duration.format(duration)}`)
        }
      })
    
    const getMetrics = (name: string) =>
      Effect.gen(function* () {
        const map = yield* Ref.get(measurements)
        const durations = map.get(name)
        
        if (!durations || Chunk.isEmpty(durations)) {
          return Option.none()
        }
        
        return Option.some(calculateMetrics(durations))
      })
    
    const reset = (name: string) =>
      Ref.update(measurements, (map) => {
        const newMap = new Map(map)
        newMap.delete(name)
        return newMap
      })
    
    return { track, getMetrics, reset }
  })

// Usage in a web service
const webServiceExample = Effect.gen(function* () {
  const monitor = yield* makePerformanceMonitor()
  
  // Track database queries
  const queryDatabase = monitor.track(
    "db.query",
    Effect.gen(function* () {
      yield* Effect.sleep(Duration.millis(Math.random() * 100))
      return { id: 1, name: "Product" }
    })
  )
  
  // Track API calls
  const callExternalApi = monitor.track(
    "api.external",
    Effect.gen(function* () {
      yield* Effect.sleep(Duration.millis(Math.random() * 500))
      return { status: "success" }
    })
  )
  
  // Simulate load
  yield* Effect.all(
    Array.from({ length: 100 }, () =>
      Effect.all([queryDatabase, callExternalApi])
    ),
    { concurrency: 10 }
  )
  
  // Get performance report
  const dbMetrics = yield* monitor.getMetrics("db.query")
  const apiMetrics = yield* monitor.getMetrics("api.external")
  
  if (Option.isSome(dbMetrics)) {
    const m = dbMetrics.value
    console.log("Database Performance:")
    console.log(`  Min: ${Duration.format(m.min)}`)
    console.log(`  Max: ${Duration.format(m.max)}`)
    console.log(`  Mean: ${Duration.format(m.mean)}`)
    console.log(`  P95: ${Duration.format(m.p95)}`)
    console.log(`  P99: ${Duration.format(m.p99)}`)
  }
})
```

## Advanced Features Deep Dive

### Duration Decoding and Validation

Effect provides built-in support for parsing and validating duration strings:

#### Basic Duration Parsing

```typescript
import { Duration, Either } from "effect"

// Parse duration strings
const fromString1 = Duration.decode("100 millis")    // Right(100ms)
const fromString2 = Duration.decode("2 seconds")     // Right(2s)
const fromString3 = Duration.decode("5 minutes")     // Right(5m)
const fromString4 = Duration.decode("1 hour")        // Right(1h)
const fromString5 = Duration.decode("3 days")        // Right(3d)

// Handle invalid inputs
const invalid1 = Duration.decode("invalid")          // Left(error)
const invalid2 = Duration.decode("-5 seconds")       // Left(error)

// Safe parsing with fallback
const safeParse = (input: string, fallback: Duration.Duration) =>
  Either.getOrElse(Duration.decode(input), () => fallback)

const timeout = safeParse(
  process.env.TIMEOUT || "30 seconds",
  Duration.seconds(30)
)
```

#### Real-World Duration Validation

```typescript
import { Schema, Effect, Duration } from "effect"

// Schema for configuration validation
const ServerConfig = Schema.Struct({
  port: Schema.Number,
  timeout: Schema.compose(
    Schema.String,
    Schema.transform(
      Schema.Any,
      (s) => Duration.decode(s),
      (d) => Duration.format(d)
    )
  ),
  keepAlive: Schema.compose(
    Schema.String,
    Schema.transform(
      Schema.Any,
      (s) => Duration.decode(s),
      (d) => Duration.format(d)
    )
  ),
  gracefulShutdown: Schema.compose(
    Schema.String,
    Schema.transform(
      Schema.Any,
      (s) => Duration.decode(s),
      (d) => Duration.format(d)
    )
  )
})

// Validate configuration
const config = {
  port: 3000,
  timeout: "30 seconds",
  keepAlive: "5 minutes",
  gracefulShutdown: "10 seconds"
}

const parseConfig = Schema.decodeUnknown(ServerConfig)
const validatedConfig = parseConfig(config)
```

#### Advanced Duration Constraints

```typescript
import { Effect, Duration, pipe } from "effect"

// Create duration validators
const validateTimeout = (duration: Duration.Duration) =>
  Effect.gen(function* () {
    if (Duration.lessThan(duration, Duration.seconds(1))) {
      return yield* Effect.fail("Timeout too short: minimum 1 second")
    }
    
    if (Duration.greaterThan(duration, Duration.minutes(5))) {
      return yield* Effect.fail("Timeout too long: maximum 5 minutes")
    }
    
    return duration
  })

// Validate duration relationships
const validateRetryStrategy = (
  initialDelay: Duration.Duration,
  maxDelay: Duration.Duration,
  timeout: Duration.Duration
) =>
  Effect.gen(function* () {
    if (Duration.greaterThanOrEqualTo(initialDelay, maxDelay)) {
      return yield* Effect.fail("Initial delay must be less than max delay")
    }
    
    if (Duration.greaterThanOrEqualTo(maxDelay, timeout)) {
      return yield* Effect.fail("Max delay must be less than timeout")
    }
    
    // Calculate maximum possible retry time
    const maxRetries = 5
    const totalRetryTime = Duration.times(maxDelay, maxRetries)
    
    if (Duration.greaterThan(totalRetryTime, timeout)) {
      return yield* Effect.fail("Total retry time exceeds timeout")
    }
    
    return { initialDelay, maxDelay, timeout }
  })
```

### Duration Formatting and Display

Control how durations are displayed to users:

```typescript
import { Duration } from "effect"

// Default formatting
const d1 = Duration.seconds(65)
console.log(Duration.format(d1)) // "1 minute 5 seconds"

const d2 = Duration.hours(25.5)
console.log(Duration.format(d2)) // "1 day 1 hour 30 minutes"

// Custom formatting helper
const formatCompact = (duration: Duration.Duration): string => {
  const totalSeconds = Number(Duration.toSeconds(duration))
  
  if (totalSeconds < 60) return `${totalSeconds}s`
  if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)}m`
  if (totalSeconds < 86400) return `${Math.floor(totalSeconds / 3600)}h`
  return `${Math.floor(totalSeconds / 86400)}d`
}

// Human-readable relative formatting
const formatRelative = (duration: Duration.Duration): string => {
  const ms = Number(Duration.toMillis(duration))
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return days === 1 ? "1 day ago" : `${days} days ago`
  if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  if (minutes > 0) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`
  if (seconds > 0) return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`
  return "just now"
}

// Usage
const age = Duration.minutes(45)
console.log(formatCompact(age))    // "45m"
console.log(formatRelative(age))   // "45 minutes ago"
```

### Duration and BigInt Precision

For high-precision timing needs:

```typescript
import { Duration } from "effect"

// Using BigInt for nanosecond precision
const precise = Duration.nanos(123456789012345n)

// Converting between units with precision
const nanos = Duration.toNanos(Duration.seconds(1.123456789))
console.log(nanos) // 1123456789n

// High-precision timing
const measurePrecise = <A>(f: () => A): [A, Duration.Duration] => {
  const start = process.hrtime.bigint()
  const result = f()
  const end = process.hrtime.bigint()
  return [result, Duration.nanos(end - start)]
}

// Precision arithmetic
const d1 = Duration.nanos(999999999n)  // Just under 1 second
const d2 = Duration.nanos(1n)          // 1 nanosecond
const sum = Duration.add(d1, d2)       // Exactly 1 second

console.log(Duration.toSeconds(sum))   // 1
console.log(Duration.toNanos(sum))     // 1000000000n
```

## Practical Patterns & Best Practices

### Pattern 1: Duration Constants

```typescript
import { Duration } from "effect"

// Define application-wide duration constants
export const Timeouts = {
  api: Duration.seconds(30),
  database: Duration.seconds(10),
  cache: Duration.minutes(5),
  session: Duration.hours(24),
  gracefulShutdown: Duration.seconds(10)
} as const

// Environment-based durations
export const getTimeout = (key: keyof typeof Timeouts): Duration.Duration => {
  const envVar = process.env[`TIMEOUT_${key.toUpperCase()}`]
  
  if (envVar) {
    return Either.getOrElse(Duration.decode(envVar), () => Timeouts[key])
  }
  
  return Timeouts[key]
}

// Usage patterns for different environments
export const EnvironmentTimeouts = {
  development: {
    api: Duration.minutes(5),        // Longer for debugging
    database: Duration.minutes(1),
    cache: Duration.seconds(30)      // Shorter for testing
  },
  production: {
    api: Duration.seconds(30),
    database: Duration.seconds(10),
    cache: Duration.hours(1)
  },
  test: {
    api: Duration.millis(100),       // Fast for tests
    database: Duration.millis(50),
    cache: Duration.millis(10)
  }
} as const
```

### Pattern 2: Deadline Management

```typescript
import { Effect, Duration, Clock, pipe } from "effect"

// Deadline tracking for operations
interface Deadline {
  readonly remaining: Effect.Effect<Duration.Duration>
  readonly isExpired: Effect.Effect<boolean>
  readonly orElse: <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    fallback: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>
}

const makeDeadline = (duration: Duration.Duration): Effect.Effect<Deadline> =>
  Effect.gen(function* () {
    const startTime = yield* Clock.currentTimeMillis
    const deadlineTime = startTime + Number(Duration.toMillis(duration))
    
    const remaining = Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const remainingMs = deadlineTime - now
      
      if (remainingMs <= 0) {
        return Duration.zero
      }
      
      return Duration.millis(remainingMs)
    })
    
    const isExpired = Effect.map(remaining, (d) => Duration.equals(d, Duration.zero))
    
    const orElse = <A, E, R>(
      effect: Effect.Effect<A, E, R>,
      fallback: Effect.Effect<A, E, R>
    ) =>
      Effect.gen(function* () {
        const timeLeft = yield* remaining
        
        if (Duration.equals(timeLeft, Duration.zero)) {
          return yield* fallback
        }
        
        return yield* pipe(
          Effect.timeout(effect, timeLeft),
          Effect.catchTag("TimeoutException", () => fallback)
        )
      })
    
    return { remaining, isExpired, orElse }
  })

// Usage in request processing
const processWithDeadline = Effect.gen(function* () {
  const deadline = yield* makeDeadline(Duration.seconds(5))
  
  // Check remaining time
  const timeLeft = yield* deadline.remaining
  console.log(`Time remaining: ${Duration.format(timeLeft)}`)
  
  // Try primary operation, fallback if deadline approaches
  const result = yield* deadline.orElse(
    Effect.gen(function* () {
      // Primary operation
      yield* Effect.sleep(Duration.seconds(2))
      return { source: "primary", data: "full results" }
    }),
    Effect.gen(function* () {
      // Fallback operation
      return { source: "cache", data: "cached results" }
    })
  )
  
  return result
})
```

### Pattern 3: Duration-based Retry Strategies

```typescript
import { Effect, Duration, Schedule, pipe } from "effect"

// Custom retry schedules with duration patterns
const retrySchedules = {
  // Fixed interval with jitter
  withJitter: (baseDelay: Duration.Duration, jitterFactor = 0.1) =>
    Schedule.jittered(
      Schedule.fixed(baseDelay),
      { min: 1 - jitterFactor, max: 1 + jitterFactor }
    ),
  
  // Exponential backoff with cap
  exponentialCapped: (
    initial: Duration.Duration,
    factor: number,
    cap: Duration.Duration
  ) =>
    Schedule.either(
      Schedule.exponential(initial, factor),
      Schedule.spaced(cap)
    ),
  
  // Linear increase with maximum
  linearBounded: (
    initial: Duration.Duration,
    increment: Duration.Duration,
    max: Duration.Duration
  ) => {
    const schedule = Schedule.recurse(initial, (duration) =>
      Duration.min(Duration.add(duration, increment), max)
    )
    return Schedule.delayed(schedule, (duration) => duration)
  },
  
  // Fibonacci-based backoff
  fibonacci: (unit: Duration.Duration) => {
    let prev = 0
    let curr = 1
    
    return Schedule.delayed(
      Schedule.forever,
      () => {
        const next = prev + curr
        prev = curr
        curr = next
        return Duration.times(unit, prev)
      }
    )
  }
}

// Usage with different retry patterns
const resilientApiCall = <A>(
  operation: Effect.Effect<A, Error>,
  strategy: "aggressive" | "standard" | "conservative" = "standard"
) => {
  const schedules = {
    aggressive: retrySchedules.withJitter(Duration.millis(100)),
    standard: retrySchedules.exponentialCapped(
      Duration.seconds(1),
      2,
      Duration.seconds(30)
    ),
    conservative: retrySchedules.linearBounded(
      Duration.seconds(5),
      Duration.seconds(5),
      Duration.minutes(1)
    )
  }
  
  return pipe(
    Effect.retry(operation, schedules[strategy]),
    Effect.timeout(Duration.minutes(5))
  )
}
```

## Integration Examples

### Integration with Schedule Module

```typescript
import { Effect, Duration, Schedule, pipe } from "effect"

// Complex scheduling patterns
const businessHoursSchedule = Schedule.whileOutput(
  Schedule.fixed(Duration.minutes(30)),
  (_, output) => {
    const now = new Date()
    const hour = now.getHours()
    const isBusinessHours = hour >= 9 && hour < 17
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5
    
    return isBusinessHours && isWeekday
  }
)

// Rate-limited scheduling
const rateLimitedSchedule = (
  maxPerWindow: number,
  window: Duration.Duration
) => {
  let timestamps: number[] = []
  
  return Schedule.recurWhile(() => {
    const now = Date.now()
    const windowStart = now - Number(Duration.toMillis(window))
    
    // Remove old timestamps
    timestamps = timestamps.filter(t => t > windowStart)
    
    if (timestamps.length < maxPerWindow) {
      timestamps.push(now)
      return true
    }
    
    return false
  })
}

// Adaptive scheduling based on duration
const adaptiveSchedule = Schedule.recurWith<Duration.Duration, any, Duration.Duration>(
  Duration.seconds(1),
  (duration, { iterations, output }) => {
    if (iterations < 5) {
      // Start fast
      return duration
    } else if (iterations < 20) {
      // Exponential backoff
      return Duration.times(duration, 1.5)
    } else {
      // Cap at 1 minute
      return Duration.min(duration, Duration.minutes(1))
    }
  }
)
```

### Testing Strategies

```typescript
import { Effect, Duration, TestClock, TestContext, pipe } from "effect"
import { describe, test, expect } from "@beep/testkit"

// Testing time-based operations
describe("Duration-based operations", () => {
  test("timeout behavior", () =>
    Effect.gen(function* () {
      const fiber = yield* pipe(
        Effect.timeout(Effect.sleep(Duration.seconds(10)), Duration.seconds(5)),
        Effect.fork
      )
      
      // Advance time by 4 seconds
      yield* TestClock.adjust(Duration.seconds(4))
      
      // Should still be running
      const midCheck = yield* fiber.poll
      expect(midCheck).toBeNone()
      
      // Advance past timeout
      yield* TestClock.adjust(Duration.seconds(2))
      
      // Should have timed out
      const result = yield* fiber.await
      expect(Exit.isFailure(result)).toBe(true)
    }).pipe(Effect.provide(TestContext.TestContext))
  )
  
  test("retry with delays", () =>
    Effect.gen(function* () {
      let attempts = 0
      
      const operation = Effect.gen(function* () {
        attempts++
        if (attempts < 3) {
          return yield* Effect.fail("Not ready")
        }
        return "Success"
      })
      
      const fiber = yield* pipe(
        Effect.retry(
          operation,
          Schedule.exponential(Duration.seconds(1), 2)
        ),
        Effect.fork
      )
      
      // First retry after 1 second
      yield* TestClock.adjust(Duration.seconds(1))
      expect(attempts).toBe(2)
      
      // Second retry after 2 seconds
      yield* TestClock.adjust(Duration.seconds(2))
      expect(attempts).toBe(3)
      
      const result = yield* fiber.await
      expect(Exit.isSuccess(result)).toBe(true)
    }).pipe(Effect.provide(TestContext.TestContext))
  )
})

// Property-based testing with durations
import * as fc from "fast-check"

test("duration arithmetic properties", () => {
  fc.assert(
    fc.property(
      fc.nat(1000000),
      fc.nat(1000000),
      (a, b) => {
        const d1 = Duration.millis(a)
        const d2 = Duration.millis(b)
        
        // Commutative property
        expect(Duration.add(d1, d2)).toEqual(Duration.add(d2, d1))
        
        // Identity property
        expect(Duration.add(d1, Duration.zero)).toEqual(d1)
        
        // Ordering consistency
        if (a < b) {
          expect(Duration.lessThan(d1, d2)).toBe(true)
        }
      }
    )
  )
})
```

## Conclusion

Duration provides type-safe time span handling, precise arithmetic operations, and seamless integration with Effect's ecosystem for building robust time-aware applications.

Key benefits:
- **Type Safety**: Eliminates unit confusion and conversion errors through explicit duration types
- **Precision**: Nanosecond precision with BigInt support for accurate timing
- **Integration**: Works seamlessly with Schedule, Effect timeouts, and testing utilities

Duration excels in scenarios requiring precise time measurements, deadline management, and complex scheduling patterns, making it essential for building reliable distributed systems and time-sensitive applications.