# Clock: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Clock Solves

Time-based operations in JavaScript are notoriously difficult to test and manage. Direct usage of `Date.now()`, `setTimeout()`, and `setInterval()` creates tight coupling to system time, making code hard to test and reason about:

```typescript
// Traditional approach - tightly coupled to system time
const delayExecution = async (ms: number) => {
  await new Promise(resolve => setTimeout(resolve, ms))
}

const measureExecutionTime = async <T>(operation: () => Promise<T>) => {
  const start = Date.now()
  const result = await operation()
  const end = Date.now()
  return { result, duration: end - start }
}

// Testing is problematic - real time passes
test("delayed execution", async () => {
  const start = Date.now()
  await delayExecution(1000) // Actually waits 1 second
  const end = Date.now()
  expect(end - start).toBeGreaterThan(1000) // Flaky test
})

// Caching with TTL - hard to test
class Cache<T> {
  private store = new Map<string, { value: T; timestamp: number }>()
  
  set(key: string, value: T, ttlMs = 60000) {
    this.store.set(key, { value, timestamp: Date.now() })
  }
  
  get(key: string, ttlMs = 60000): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    
    if (Date.now() - entry.timestamp > ttlMs) {
      this.store.delete(key)
      return undefined
    }
    
    return entry.value
  }
}

// Rate limiting with Effect and Clock service
const createRateLimiter = (maxRequests: number, windowMs: number) =>
  Effect.gen(function* () {
    const requests = yield* Ref.make<number[]>([])
    
    const isAllowed = Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentRequests = yield* Ref.get(requests)
      
      // Filter out old requests
      const validRequests = currentRequests.filter(time => now - time < windowMs)
      
      if (validRequests.length >= maxRequests) {
        return false
      }
      
      // Add current request
      yield* Ref.set(requests, [...validRequests, now])
      return true
    })
    
    return { isAllowed }
  })

// Scheduling based on real time
class Scheduler {
  private timers = new Map<string, NodeJS.Timeout>()
  
  schedule(id: string, delayMs: number, callback: () => void) {
    const timer = setTimeout(() => {
      callback()
      this.timers.delete(id)
    }, delayMs)
    
    this.timers.set(id, timer)
  }
  
  cancel(id: string) {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
  }
}
```

This approach leads to:
- **Untestable Code** - Tests must wait for real time to pass
- **Flaky Tests** - Time-based assertions are unreliable
- **Non-deterministic Behavior** - Timing issues in production
- **Difficult Debugging** - Time-dependent bugs are hard to reproduce
- **Tight Coupling** - Direct dependency on system clock

### The Clock Solution

Effect's Clock module provides a time abstraction that can be controlled and mocked for testing:

```typescript
import { Clock, Effect, Duration, TestClock, TestContext, pipe } from "effect"

// Time operations through Clock service
const delayExecution = (duration: Duration.Duration) =>
  Effect.sleep(duration)

const measureExecutionTime = <A, E, R>(
  operation: Effect.Effect<A, E, R>
): Effect.Effect<{ result: A; duration: Duration.Duration }, E, R> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    const result = yield* operation
    const end = yield* Clock.currentTimeMillis
    return {
      result,
      duration: Duration.millis(end - start)
    }
  })

// Testable with virtual time
test("delayed execution", () =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeMillis
    
    // Start the delay
    const delayedFiber = yield* Effect.fork(
      delayExecution(Duration.seconds(1))
    )
    
    // Advance virtual time
    yield* TestClock.adjust(Duration.seconds(1))
    
    // Complete immediately
    yield* delayedFiber.await
    
    const end = yield* Clock.currentTimeMillis
    expect(end - start).toBe(1000)
  }).pipe(
    Effect.provide(TestContext.TestContext)
  )
)

// Testable cache
const makeCache = <T>() =>
  Effect.gen(function* () {
    const store = yield* Ref.make(new Map<string, { value: T; timestamp: number }>())
    
    const set = (key: string, value: T, ttl: Duration.Duration) =>
      Effect.gen(function* () {
        const timestamp = yield* Clock.currentTimeMillis
        yield* Ref.update(store, map => 
          map.set(key, { value, timestamp })
        )
      })
    
    const get = (key: string, ttl: Duration.Duration) =>
      Effect.gen(function* () {
        const now = yield* Clock.currentTimeMillis
        const entries = yield* Ref.get(store)
        const entry = entries.get(key)
        
        if (!entry) return Option.none<T>()
        
        if (now - entry.timestamp > Duration.toMillis(ttl)) {
          yield* Ref.update(store, map => {
            map.delete(key)
            return map
          })
          return Option.none<T>()
        }
        
        return Option.some(entry.value)
      })
    
    return { set, get }
  })
```

### Key Concepts

**Clock Service**: A service that provides time-related operations that can be mocked or controlled.

```typescript
// Access current time through Clock service
const now = yield* Clock.currentTimeMillis
const currentDate = yield* Clock.currentTimeNanos
```

**Virtual Time**: Test implementation of Clock that allows time manipulation without waiting.

```typescript
// Advance virtual time by specific duration
yield* TestClock.adjust(Duration.seconds(30))

// Set virtual time to specific value
yield* TestClock.setTime(1000000)
```

**Time-based Effects**: Operations that depend on time but remain testable.

```typescript
// Sleep for specific duration
yield* Effect.sleep(Duration.seconds(5))

// Timeout operations
yield* pipe(
  Effect.timeout(longRunningOperation, Duration.minutes(1))
)
```

## Basic Usage Patterns

### Getting Current Time

```typescript
import { Clock, Effect, Duration } from "effect"

// Get current time in milliseconds
const getCurrentTime = Effect.gen(function* () {
  const millis = yield* Clock.currentTimeMillis
  console.log(`Current time: ${millis}ms`)
  return millis
})

// Get current time in nanoseconds (higher precision)
const getCurrentTimeNanos = Effect.gen(function* () {
  const nanos = yield* Clock.currentTimeNanos
  console.log(`Current time: ${nanos}ns`)
  return nanos
})

// Get current time as Date
const getCurrentDate = Effect.gen(function* () {
  const millis = yield* Clock.currentTimeMillis
  return new Date(millis)
})

// Time-based operations
const timeStampOperation = <A, E, R>(
  operation: Effect.Effect<A, E, R>
): Effect.Effect<{ result: A; timestamp: number }, E, R> =>
  Effect.gen(function* () {
    const timestamp = yield* Clock.currentTimeMillis
    const result = yield* operation
    return { result, timestamp }
  })

// Usage
const example = Effect.gen(function* () {
  const startTime = yield* Clock.currentTimeMillis
  
  // Perform some operation
  yield* Effect.sleep(Duration.seconds(1))
  
  const endTime = yield* Clock.currentTimeMillis
  const elapsed = endTime - startTime
  
  console.log(`Operation took ${elapsed}ms`)
})
```

### Sleep and Delays

```typescript
import { Effect, Duration, Clock, pipe } from "effect"

// Basic sleep
const basicSleep = Effect.gen(function* () {
  console.log("Starting...")
  yield* Effect.sleep(Duration.seconds(2))
  console.log("Done!")
})

// Conditional sleep
const conditionalSleep = (condition: boolean) =>
  Effect.gen(function* () {
    if (condition) {
      console.log("Waiting...")
      yield* Effect.sleep(Duration.seconds(1))
    }
    console.log("Continuing...")
  })

// Sleep with progress tracking
const sleepWithProgress = (total: Duration.Duration) =>
  Effect.gen(function* () {
    const steps = 10
    const stepDuration = Duration.divide(total, steps)
    
    for (let i = 0; i < steps; i++) {
      yield* Effect.sleep(stepDuration)
      const progress = ((i + 1) / steps) * 100
      console.log(`Progress: ${progress.toFixed(1)}%`)
    }
  })

// Interruptible sleep
const interruptibleSleep = (duration: Duration.Duration) =>
  Effect.gen(function* () {
    console.log("Starting sleep...")
    
    try {
      yield* Effect.sleep(duration)
      console.log("Sleep completed normally")
    } catch (error) {
      console.log("Sleep was interrupted")
      throw error
    }
  })

// Sleep with timeout using pipe for simple transformation
const sleepWithTimeout = (
  sleepDuration: Duration.Duration,
  timeoutDuration: Duration.Duration
) =>
  pipe(
    Effect.timeout(Effect.sleep(sleepDuration), timeoutDuration),
    Effect.catchTag("TimeoutException", () =>
      Effect.succeed("Timed out!")
    )
  )
```

### Timing Operations

```typescript
import { Effect, Clock, Duration, Ref, pipe } from "effect"

// Measure execution time
const measureTime = <A, E, R>(
  operation: Effect.Effect<A, E, R>
): Effect.Effect<{ result: A; duration: Duration.Duration }, E, R> =>
  Effect.gen(function* () {
    const start = yield* Clock.currentTimeNanos
    const result = yield* operation
    const end = yield* Clock.currentTimeNanos
    
    return {
      result,
      duration: Duration.nanos(end - start)
    }
  })

// Benchmark multiple operations
const benchmark = <A, E, R>(
  operations: Record<string, Effect.Effect<A, E, R>>
) =>
  Effect.gen(function* () {
    const results: Record<string, Duration.Duration> = {}
    
    for (const [name, operation] of Object.entries(operations)) {
      const { duration } = yield* measureTime(operation)
      results[name] = duration
      console.log(`${name}: ${Duration.format(duration)}`)
    }
    
    return results
  })

// Performance monitoring
const createPerformanceMonitor = () =>
  Effect.gen(function* () {
    const measurements = yield* Ref.make<Array<{ name: string; duration: Duration.Duration }>>([])
    
    const measure = <A, E, R>(
      name: string,
      operation: Effect.Effect<A, E, R>
    ): Effect.Effect<A, E, R> =>
      Effect.gen(function* () {
        const start = yield* Clock.currentTimeNanos
        const result = yield* operation
        const end = yield* Clock.currentTimeNanos
        
        const duration = Duration.nanos(end - start)
        yield* Ref.update(measurements, (arr) => [...arr, { name, duration }])
        
        return result
      })
    
    const getReport = () =>
      Effect.gen(function* () {
        const data = yield* Ref.get(measurements)
        const grouped = data.reduce((acc, { name, duration }) => {
          if (!acc[name]) {
            acc[name] = []
          }
          acc[name].push(duration)
          return acc
        }, {} as Record<string, Duration.Duration[]>)
        
        const report: Record<string, {
          count: number
          total: Duration.Duration
          average: Duration.Duration
          min: Duration.Duration
          max: Duration.Duration
        }> = {}
        
        for (const [name, durations] of Object.entries(grouped)) {
          const total = durations.reduce(
            (sum, d) => Duration.add(sum, d),
            Duration.zero
          )
          const average = Duration.divide(total, durations.length)
          const min = durations.reduce(Duration.min)
          const max = durations.reduce(Duration.max)
          
          report[name] = {
            count: durations.length,
            total,
            average,
            min,
            max
          }
        }
        
        return report
      })
    
    return { measure, getReport }
  })

// Usage example
const performanceExample = Effect.gen(function* () {
  const monitor = yield* createPerformanceMonitor()
  
  // Measure different operations
  yield* monitor.measure("fast-operation", Effect.sleep(Duration.millis(10)))
  yield* monitor.measure("slow-operation", Effect.sleep(Duration.millis(100)))
  yield* monitor.measure("fast-operation", Effect.sleep(Duration.millis(15)))
  
  const report = yield* monitor.getReport()
  
  Object.entries(report).forEach(([name, stats]) => {
    console.log(`${name}:`)
    console.log(`  Count: ${stats.count}`)
    console.log(`  Average: ${Duration.format(stats.average)}`)
    console.log(`  Min: ${Duration.format(stats.min)}`)
    console.log(`  Max: ${Duration.format(stats.max)}`)
  })
})
```

## Real-World Examples

### Example 1: Circuit Breaker with Time-based Recovery

Implementing a circuit breaker that uses time-based recovery logic:

```typescript
import { Effect, Ref, Clock, Duration, pipe } from "effect"

type CircuitState =
  | { _tag: "Closed" }
  | { _tag: "Open"; openedAt: number }
  | { _tag: "HalfOpen" }

interface CircuitBreakerConfig {
  readonly failureThreshold: number
  readonly recoveryTimeout: Duration.Duration
  readonly monitoringWindow: Duration.Duration
}

class CircuitBreaker {
  constructor(
    private readonly config: CircuitBreakerConfig,
    private readonly state: Ref.Ref<CircuitState>,
    private readonly failures: Ref.Ref<number[]>
  ) {}
  
  static make = (config: CircuitBreakerConfig) =>
    Effect.gen(function* () {
      const state = yield* Ref.make<CircuitState>({ _tag: "Closed" })
      const failures = yield* Ref.make<number[]>([])
      
      return new CircuitBreaker(config, state, failures)
    })
  
  execute = <A, E, R>(
    operation: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E | CircuitBreakerError, R> =>
    Effect.gen(function* () {
      const currentState = yield* this.getState()
      
      switch (currentState._tag) {
        case "Open":
          return yield* Effect.fail(
            new CircuitBreakerError("Circuit breaker is open")
          )
        
        case "HalfOpen":
          return yield* this.executeHalfOpen(operation)
        
        case "Closed":
          return yield* this.executeClosed(operation)
      }
    })
  
  private getState = (): Effect.Effect<CircuitState> =>
    Effect.gen(function* () {
      const currentState = yield* Ref.get(this.state)
      
      if (currentState._tag === "Open") {
        const now = yield* Clock.currentTimeMillis
        const recoveryTime = currentState.openedAt + 
          Number(Duration.toMillis(this.config.recoveryTimeout))
        
        if (now >= recoveryTime) {
          yield* Ref.set(this.state, { _tag: "HalfOpen" })
          return { _tag: "HalfOpen" }
        }
      }
      
      return currentState
    })
  
  private executeClosed = <A, E, R>(
    operation: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E | CircuitBreakerError, R> =>
    Effect.gen(function* () {
      const result = yield* Effect.either(operation)
      
      if (result._tag === "Left") {
        yield* this.recordFailure()
        return yield* Effect.fail(result.left)
      }
      
      yield* this.recordSuccess()
      return result.right
    })
  
  private executeHalfOpen = <A, E, R>(
    operation: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E | CircuitBreakerError, R> =>
    Effect.gen(function* () {
      const result = yield* Effect.either(operation)
      
      if (result._tag === "Left") {
        yield* this.openCircuit()
        return yield* Effect.fail(result.left)
      }
      
      yield* this.closeCircuit()
      return result.right
    })
  
  private recordFailure = () =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const windowStart = now - Number(Duration.toMillis(this.config.monitoringWindow))
      
      yield* Ref.update(this.failures, (failures) => {
        const recentFailures = failures.filter(time => time > windowStart)
        return [...recentFailures, now]
      })
      
      const currentFailures = yield* Ref.get(this.failures)
      
      if (currentFailures.length >= this.config.failureThreshold) {
        yield* this.openCircuit()
      }
    })
  
  private recordSuccess = () =>
    Ref.set(this.failures, [])
  
  private openCircuit = () =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      yield* Ref.set(this.state, { _tag: "Open", openedAt: now })
      yield* Ref.set(this.failures, [])
    })
  
  private closeCircuit = () =>
    Effect.gen(function* () {
      yield* Ref.set(this.state, { _tag: "Closed" })
      yield* Ref.set(this.failures, [])
    })
  
  getStatus = () =>
    Effect.gen(function* () {
      const state = yield* this.getState()
      const failureCount = yield* Ref.get(this.failures)
      
      return {
        state: state._tag,
        failureCount: failureCount.length,
        nextRetryAt: state._tag === "Open" 
          ? state.openedAt + Number(Duration.toMillis(this.config.recoveryTimeout))
          : null
      }
    })
}

class CircuitBreakerError {
  readonly _tag = "CircuitBreakerError"
  constructor(readonly message: string) {}
}

// Usage example
const circuitBreakerExample = Effect.gen(function* () {
  const circuitBreaker = yield* CircuitBreaker.make({
    failureThreshold: 3,
    recoveryTimeout: Duration.seconds(30),
    monitoringWindow: Duration.minutes(1)
  })
  
  // Simulate failing service
  const unreliableService = Effect.gen(function* () {
    const random = Math.random()
    if (random < 0.7) {
      return yield* Effect.fail(new Error("Service unavailable"))
    }
    return "Success!"
  })
  
  // Execute with circuit breaker protection
  for (let i = 0; i < 10; i++) {
    const result = yield* Effect.either(
      circuitBreaker.execute(unreliableService)
    )
    
    const status = yield* circuitBreaker.getStatus()
    
    console.log(`Attempt ${i + 1}: ${result._tag} (Circuit: ${status.state})`)
    
    if (result._tag === "Left" && result.left instanceof CircuitBreakerError) {
      console.log("  Circuit breaker is open, skipping call")
    }
    
    yield* Effect.sleep(Duration.seconds(1))
  }
})
```

### Example 2: Time-based Cache with Expiration

Building a sophisticated cache system with time-based expiration and refresh logic:

```typescript
import { Effect, Ref, Clock, Duration, Option, HashMap, pipe } from "effect"

interface CacheEntry<T> {
  readonly value: T
  readonly createdAt: number
  readonly lastAccessedAt: number
  readonly hitCount: number
  readonly ttl: Duration.Duration
}

interface CacheStats {
  readonly hits: number
  readonly misses: number
  readonly evictions: number
  readonly size: number
}

class TimeBasedCache<T> {
  constructor(
    private readonly store: Ref.Ref<HashMap.HashMap<string, CacheEntry<T>>>,
    private readonly stats: Ref.Ref<CacheStats>,
    private readonly maxSize: number
  ) {}
  
  static make = <T>(maxSize = 1000) =>
    Effect.gen(function* () {
      const store = yield* Ref.make(HashMap.empty<string, CacheEntry<T>>())
      const stats = yield* Ref.make<CacheStats>({
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0
      })
      
      return new TimeBasedCache(store, stats, maxSize)
    })
  
  get = (key: string): Effect.Effect<Option.Option<T>> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentStore = yield* Ref.get(this.store)
      const entry = HashMap.get(currentStore, key)
      
      if (Option.isNone(entry)) {
        yield* this.recordMiss()
        return Option.none()
      }
      
      const cacheEntry = entry.value
      const age = now - cacheEntry.createdAt
      
      if (age > Number(Duration.toMillis(cacheEntry.ttl))) {
        // Entry expired
        yield* this.evict(key)
        yield* this.recordMiss()
        return Option.none()
      }
      
      // Update access time and hit count
      const updatedEntry: CacheEntry<T> = {
        ...cacheEntry,
        lastAccessedAt: now,
        hitCount: cacheEntry.hitCount + 1
      }
      
      yield* Ref.update(this.store, (store) =>
        HashMap.set(store, key, updatedEntry)
      )
      
      yield* this.recordHit()
      return Option.some(cacheEntry.value)
    })
  
  set = (
    key: string,
    value: T,
    ttl: Duration.Duration = Duration.minutes(10)
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentStore = yield* Ref.get(this.store)
      
      // Check if we need to evict entries
      if (HashMap.size(currentStore) >= this.maxSize) {
        yield* this.evictLRU()
      }
      
      const entry: CacheEntry<T> = {
        value,
        createdAt: now,
        lastAccessedAt: now,
        hitCount: 0,
        ttl
      }
      
      yield* Ref.update(this.store, (store) =>
        HashMap.set(store, key, entry)
      )
      
      yield* Ref.update(this.stats, (stats) => ({
        ...stats,
        size: stats.size + 1
      }))
    })
  
  // Get with refresh - fetch fresh data if expired
  getOrRefresh = <E, R>(
    key: string,
    refresher: Effect.Effect<T, E, R>,
    ttl: Duration.Duration = Duration.minutes(10)
  ): Effect.Effect<T, E, R> =>
    Effect.gen(function* () {
      const cached = yield* this.get(key)
      
      if (Option.isSome(cached)) {
        return cached.value
      }
      
      // Cache miss - fetch fresh data
      const fresh = yield* refresher
      yield* this.set(key, fresh, ttl)
      return fresh
    })
  
  // Proactive refresh of entries nearing expiration
  refreshExpiring = <E, R>(
    refresher: (key: string, value: T) => Effect.Effect<T, E, R>,
    thresholdPercent = 0.8
  ): Effect.Effect<number, E, R> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentStore = yield* Ref.get(this.store)
      let refreshed = 0
      
      for (const [key, entry] of HashMap.toEntries(currentStore)) {
        const age = now - entry.createdAt
        const ttlMs = Number(Duration.toMillis(entry.ttl))
        const agePercent = age / ttlMs
        
        if (agePercent >= thresholdPercent && agePercent < 1) {
          try {
            const fresh = yield* refresher(key, entry.value)
            yield* this.set(key, fresh, entry.ttl)
            refreshed++
          } catch (error) {
            // Continue with other entries if one fails
            console.warn(`Failed to refresh key ${key}:`, error)
          }
        }
      }
      
      return refreshed
    })
  
  private evict = (key: string): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* Ref.update(this.store, (store) =>
        HashMap.remove(store, key)
      )
      
      yield* Ref.update(this.stats, (stats) => ({
        ...stats,
        evictions: stats.evictions + 1,
        size: Math.max(0, stats.size - 1)
      }))
    })
  
  private evictLRU = (): Effect.Effect<void> =>
    Effect.gen(function* () {
      const currentStore = yield* Ref.get(this.store)
      const entries = HashMap.toEntries(currentStore)
      
      if (entries.length === 0) return
      
      // Find least recently used entry
      const lruEntry = entries.reduce((lru, [key, entry]) =>
        entry.lastAccessedAt < lru[1].lastAccessedAt ? [key, entry] : lru
      )
      
      yield* this.evict(lruEntry[0])
    })
  
  private recordHit = (): Effect.Effect<void> =>
    Ref.update(this.stats, (stats) => ({
      ...stats,
      hits: stats.hits + 1
    }))
  
  private recordMiss = (): Effect.Effect<void> =>
    Ref.update(this.stats, (stats) => ({
      ...stats,
      misses: stats.misses + 1
    }))
  
  // Cleanup expired entries
  cleanup = (): Effect.Effect<number> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentStore = yield* Ref.get(this.store)
      let removed = 0
      
      const cleanStore = HashMap.filter(currentStore, (entry) => {
        const age = now - entry.createdAt
        const isExpired = age > Number(Duration.toMillis(entry.ttl))
        
        if (isExpired) {
          removed++
        }
        
        return !isExpired
      })
      
      yield* Ref.set(this.store, cleanStore)
      yield* Ref.update(this.stats, (stats) => ({
        ...stats,
        evictions: stats.evictions + removed,
        size: stats.size - removed
      }))
      
      return removed
    })
  
  getStats = (): Effect.Effect<CacheStats & { hitRate: number }> =>
    Effect.gen(function* () {
      const stats = yield* Ref.get(this.stats)
      const total = stats.hits + stats.misses
      const hitRate = total > 0 ? stats.hits / total : 0
      
      return { ...stats, hitRate }
    })
  
  // Get detailed entry information
  getEntryInfo = (key: string): Effect.Effect<Option.Option<{
    age: Duration.Duration
    ttl: Duration.Duration
    hitCount: number
    expiresIn: Duration.Duration
  }>> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentStore = yield* Ref.get(this.store)
      const entry = HashMap.get(currentStore, key)
      
      if (Option.isNone(entry)) {
        return Option.none()
      }
      
      const cacheEntry = entry.value
      const age = Duration.millis(now - cacheEntry.createdAt)
      const expiresIn = Duration.subtract(
        cacheEntry.ttl,
        age
      )
      
      return Option.some({
        age,
        ttl: cacheEntry.ttl,
        hitCount: cacheEntry.hitCount,
        expiresIn
      })
    })
}

// Usage example with automatic cleanup
const cacheExample = Effect.gen(function* () {
  const cache = yield* TimeBasedCache.make<string>(100)
  
  // Simulate data fetcher
  const fetchUserData = (userId: string) =>
    Effect.gen(function* () {
      console.log(`Fetching user data for ${userId}`)
      yield* Effect.sleep(Duration.millis(100)) // Simulate network delay
      return `User data for ${userId}`
    })
  
  // Set up periodic cleanup
  const cleanupFiber = yield* Effect.fork(
    Effect.repeat(
      Effect.gen(function* () {
        const removed = yield* cache.cleanup()
        if (removed > 0) {
          console.log(`Cleaned up ${removed} expired entries`)
        }
      }),
      Schedule.fixed(Duration.minutes(1))
    )
  )
  
  // Use cache with auto-refresh
  for (let i = 0; i < 10; i++) {
    const userData = yield* cache.getOrRefresh(
      `user:${i % 3}`, // Reuse some keys
      fetchUserData(`user:${i % 3}`),
      Duration.seconds(5)
    )
    
    console.log(`Got: ${userData}`)
    
    const info = yield* cache.getEntryInfo(`user:${i % 3}`)
    if (Option.isSome(info)) {
      console.log(`  Age: ${Duration.format(info.value.age)}, Expires in: ${Duration.format(info.value.expiresIn)}`)
    }
    
    yield* Effect.sleep(Duration.seconds(1))
  }
  
  // Show final stats
  const stats = yield* cache.getStats()
  console.log(`Cache stats: ${stats.hits} hits, ${stats.misses} misses, ${(stats.hitRate * 100).toFixed(1)}% hit rate`)
  
  yield* Fiber.interrupt(cleanupFiber)
})
```

### Example 3: Distributed Rate Limiter with Clock

Building a distributed rate limiter that uses precise time windows:

```typescript
import { Effect, Ref, Clock, Duration, HashMap, Array, pipe } from "effect"

interface RateLimitWindow {
  readonly requests: number[]
  readonly windowStart: number
}

interface RateLimitConfig {
  readonly maxRequests: number
  readonly windowSize: Duration.Duration
  readonly keyExpiration: Duration.Duration
}

class DistributedRateLimiter {
  constructor(
    private readonly config: RateLimitConfig,
    private readonly windows: Ref.Ref<HashMap.HashMap<string, RateLimitWindow>>
  ) {}
  
  static make = (config: RateLimitConfig) =>
    Effect.gen(function* () {
      const windows = yield* Ref.make(HashMap.empty<string, RateLimitWindow>())
      
      return new DistributedRateLimiter(config, windows)
    })
  
  // Check if request is allowed
  checkLimit = (key: string): Effect.Effect<RateLimitResult> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const windowMs = Number(Duration.toMillis(this.config.windowSize))
      const windowStart = Math.floor(now / windowMs) * windowMs
      
      const currentWindows = yield* Ref.get(this.windows)
      const existingWindow = HashMap.get(currentWindows, key)
      
      let window: RateLimitWindow
      
      if (Option.isSome(existingWindow) && existingWindow.value.windowStart === windowStart) {
        // Same window, check request count
        window = existingWindow.value
        
        if (window.requests.length >= this.config.maxRequests) {
          const resetTime = windowStart + windowMs
          const retryAfter = Duration.millis(resetTime - now)
          
          return {
            allowed: false,
            remaining: 0,
            resetTime,
            retryAfter
          }
        }
      } else {
        // New window
        window = {
          requests: [],
          windowStart
        }
      }
      
      // Add current request
      const updatedWindow: RateLimitWindow = {
        ...window,
        requests: [...window.requests, now]
      }
      
      yield* Ref.update(this.windows, (windows) =>
        HashMap.set(windows, key, updatedWindow)
      )
      
      const remaining = this.config.maxRequests - updatedWindow.requests.length
      const resetTime = windowStart + windowMs
      
      return {
        allowed: true,
        remaining,
        resetTime,
        retryAfter: Duration.zero
      }
    })
  
  // Sliding window rate limiter
  checkSlidingWindow = (key: string): Effect.Effect<RateLimitResult> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const windowMs = Number(Duration.toMillis(this.config.windowSize))
      const windowStart = now - windowMs
      
      const currentWindows = yield* Ref.get(this.windows)
      const existingWindow = HashMap.get(currentWindows, key)
      
      let validRequests: number[] = []
      
      if (Option.isSome(existingWindow)) {
        // Filter out requests outside the sliding window
        validRequests = existingWindow.value.requests.filter(
          (timestamp) => timestamp > windowStart
        )
      }
      
      if (validRequests.length >= this.config.maxRequests) {
        const oldestRequest = Math.min(...validRequests)
        const resetTime = oldestRequest + windowMs
        const retryAfter = Duration.millis(resetTime - now)
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter
        }
      }
      
      // Add current request
      const updatedRequests = [...validRequests, now]
      const updatedWindow: RateLimitWindow = {
        requests: updatedRequests,
        windowStart: now
      }
      
      yield* Ref.update(this.windows, (windows) =>
        HashMap.set(windows, key, updatedWindow)
      )
      
      const remaining = this.config.maxRequests - updatedRequests.length
      const oldestRequest = Math.min(...updatedRequests)
      const resetTime = oldestRequest + windowMs
      
      return {
        allowed: true,
        remaining,
        resetTime,
        retryAfter: Duration.zero
      }
    })
  
  // Cleanup expired windows
  cleanup = (): Effect.Effect<number> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const expirationMs = Number(Duration.toMillis(this.config.keyExpiration))
      const currentWindows = yield* Ref.get(this.windows)
      
      let removed = 0
      const cleanWindows = HashMap.filter(currentWindows, (window) => {
        const age = now - window.windowStart
        const isExpired = age > expirationMs
        
        if (isExpired) {
          removed++
        }
        
        return !isExpired
      })
      
      yield* Ref.set(this.windows, cleanWindows)
      return removed
    })
  
  // Get current status for a key
  getStatus = (key: string): Effect.Effect<Option.Option<{
    requestCount: number
    windowStart: number
    windowEnd: number
    remaining: number
  }>> =>
    Effect.gen(function* () {
      const currentWindows = yield* Ref.get(this.windows)
      const window = HashMap.get(currentWindows, key)
      
      if (Option.isNone(window)) {
        return Option.none()
      }
      
      const windowMs = Number(Duration.toMillis(this.config.windowSize))
      const windowValue = window.value
      
      return Option.some({
        requestCount: windowValue.requests.length,
        windowStart: windowValue.windowStart,
        windowEnd: windowValue.windowStart + windowMs,
        remaining: this.config.maxRequests - windowValue.requests.length
      })
    })
  
  // Get global statistics
  getGlobalStats = (): Effect.Effect<{
    totalKeys: number
    totalRequests: number
    averageRequestsPerKey: number
  }> =>
    Effect.gen(function* () {
      const currentWindows = yield* Ref.get(this.windows)
      const windows = HashMap.values(currentWindows)
      
      const totalKeys = windows.length
      const totalRequests = windows.reduce(
        (sum, window) => sum + window.requests.length,
        0
      )
      const averageRequestsPerKey = totalKeys > 0 ? totalRequests / totalKeys : 0
      
      return {
        totalKeys,
        totalRequests,
        averageRequestsPerKey
      }
    })
}

interface RateLimitResult {
  readonly allowed: boolean
  readonly remaining: number
  readonly resetTime: number
  readonly retryAfter: Duration.Duration
}

// Usage example with HTTP headers
const rateLimiterExample = Effect.gen(function* () {
  const rateLimiter = yield* DistributedRateLimiter.make({
    maxRequests: 10,
    windowSize: Duration.minutes(1),
    keyExpiration: Duration.hours(1)
  })
  
  // Set up cleanup job
  const cleanupFiber = yield* Effect.fork(
    Effect.repeat(
      Effect.gen(function* () {
        const removed = yield* rateLimiter.cleanup()
        if (removed > 0) {
          console.log(`Cleaned up ${removed} expired rate limit windows`)
        }
      }),
      Schedule.fixed(Duration.minutes(5))
    )
  )
  
  // Simulate API requests
  const simulateRequests = (clientId: string, count: number) =>
    Effect.gen(function* () {
      console.log(`\nSimulating ${count} requests for client ${clientId}`)
      
      for (let i = 0; i < count; i++) {
        const result = yield* rateLimiter.checkLimit(clientId)
        
        if (result.allowed) {
          console.log(`Request ${i + 1}: ALLOWED (${result.remaining} remaining)`)
        } else {
          console.log(`Request ${i + 1}: BLOCKED (retry after ${Duration.format(result.retryAfter)})`)
          
          // Wait for retry period
          yield* Effect.sleep(result.retryAfter)
        }
        
        yield* Effect.sleep(Duration.seconds(1))
      }
    })
  
  // Test with multiple clients
  yield* Effect.all([
    simulateRequests("client-1", 12),
    simulateRequests("client-2", 8),
    simulateRequests("client-3", 15)
  ], { concurrency: 3 })
  
  // Show final stats
  const stats = yield* rateLimiter.getGlobalStats()
  console.log(`\nGlobal stats: ${stats.totalKeys} clients, ${stats.totalRequests} total requests`)
  
  yield* Fiber.interrupt(cleanupFiber)
})
```

## Advanced Features Deep Dive

### Clock Service Implementation

Understanding how to implement custom Clock services:

#### Custom Clock Implementation

```typescript
import { Clock, Effect, Context, Layer, Duration } from "effect"

// Custom clock that can be controlled
class ControllableClock implements Clock.Clock {
  constructor(private currentTime: number) {}
  
  currentTimeMillis: Effect.Effect<number> = Effect.succeed(this.currentTime)
  
  currentTimeNanos: Effect.Effect<bigint> = Effect.succeed(
    BigInt(this.currentTime) * 1000000n
  )
  
  sleep: (duration: Duration.Duration) => Effect.Effect<void> = (duration) =>
    Effect.gen(function* () {
      // In a real implementation, this would schedule the continuation
      // For this example, we'll advance time immediately
      this.currentTime += Number(Duration.toMillis(duration))
    })
  
  setTime = (time: number): Effect.Effect<void> =>
    Effect.sync(() => {
      this.currentTime = time
    })
  
  advanceTime = (duration: Duration.Duration): Effect.Effect<void> =>
    Effect.sync(() => {
      this.currentTime += Number(Duration.toMillis(duration))
    })
}

// Layer for custom clock
const makeControllableClock = (initialTime: number) =>
  Layer.succeed(Clock.Clock, new ControllableClock(initialTime))

// Usage
const customClockExample = Effect.gen(function* () {
  const initialTime = Date.now()
  
  console.log("Starting time:", new Date(initialTime))
  
  // Advance time by 1 hour
  const clock = new ControllableClock(initialTime)
  yield* clock.advanceTime(Duration.hours(1))
  
  const newTime = yield* clock.currentTimeMillis
  console.log("After advancing:", new Date(newTime))
}).pipe(Effect.provide(makeControllableClock(Date.now())))
```

#### Clock-based Scheduling

```typescript
import { Effect, Clock, Duration, Schedule, Fiber, pipe } from "effect"

// Time-based scheduling utilities
const TimeScheduler = {
  // Schedule at specific intervals
  every: (interval: Duration.Duration) =>
    Schedule.fixed(interval),
  
  // Schedule with exponential backoff
  exponentialBackoff: (
    initial: Duration.Duration,
    max: Duration.Duration,
    factor = 2
  ) =>
    Schedule.either(
      Schedule.exponential(initial, factor),
      Schedule.spaced(max)
    ),
  
  // Schedule with jitter to avoid thundering herd
  withJitter: (baseSchedule: Schedule.Schedule<unknown, unknown, Duration.Duration>) =>
    Schedule.jittered(baseSchedule, { min: 0.8, max: 1.2 }),
  
  // Schedule only during business hours
  businessHours: (
    baseSchedule: Schedule.Schedule<unknown, unknown, Duration.Duration>,
    timezone = "UTC"
  ) =>
    Schedule.whileOutput(
      baseSchedule,
      () =>
        Effect.gen(function* () {
          const now = yield* Clock.currentTimeMillis
          const date = new Date(now)
          const hour = date.getHours()
          const dayOfWeek = date.getDay()
          
          // Monday-Friday, 9 AM - 5 PM
          return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 17
        })
    ),
  
  // Conditional scheduling
  when: <A>(
    condition: Effect.Effect<boolean>,
    schedule: Schedule.Schedule<unknown, A, Duration.Duration>
  ) =>
    Schedule.whileOutput(schedule, () => condition)
}

// Advanced scheduling example
const advancedSchedulingExample = Effect.gen(function* () {
  // Task that should run every 30 seconds during business hours
  const businessTask = Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis
    console.log(`Business task executed at ${new Date(now)}`)
  })
  
  const businessSchedule = pipe(
    TimeScheduler.businessHours(TimeScheduler.every(Duration.seconds(30)))
  )
  
  // Task with exponential backoff on failure
  const retryableTask = Effect.gen(function* () {
    const random = Math.random()
    if (random < 0.3) {
      return yield* Effect.fail(new Error("Task failed"))
    }
    
    const now = yield* Clock.currentTimeMillis
    console.log(`Retryable task succeeded at ${new Date(now)}`)
  })
  
  const retrySchedule = TimeScheduler.exponentialBackoff(
    Duration.seconds(1),
    Duration.minutes(5)
  )
  
  // Start both tasks
  const businessFiber = yield* Effect.fork(
    Effect.repeat(businessTask, businessSchedule)
  )
  
  const retryFiber = yield* Effect.fork(
    Effect.retry(retryableTask, retrySchedule)
  )
  
  // Let them run for a while
  yield* Effect.sleep(Duration.minutes(2))
  
  // Clean shutdown
  yield* Effect.all([
    Fiber.interrupt(businessFiber),
    Fiber.interrupt(retryFiber)
  ])
})
```

### Performance Profiling with Clock

Building performance profiling tools using Clock:

```typescript
import { Effect, Clock, Duration, Ref, HashMap, Option, pipe } from "effect"

interface ProfileData {
  readonly name: string
  readonly startTime: number
  readonly endTime: number
  readonly duration: Duration.Duration
  readonly metadata?: Record<string, unknown>
}

interface ProfileSummary {
  readonly totalCalls: number
  readonly totalTime: Duration.Duration
  readonly averageTime: Duration.Duration
  readonly minTime: Duration.Duration
  readonly maxTime: Duration.Duration
  readonly p50: Duration.Duration
  readonly p95: Duration.Duration
  readonly p99: Duration.Duration
}

class Profiler {
  constructor(
    private readonly profiles: Ref.Ref<ProfileData[]>,
    private readonly activeProfiles: Ref.Ref<HashMap.HashMap<string, number>>
  ) {}
  
  static make = () =>
    Effect.gen(function* () {
      const profiles = yield* Ref.make<ProfileData[]>([])
      const activeProfiles = yield* Ref.make(HashMap.empty<string, number>())
      
      return new Profiler(profiles, activeProfiles)
    })
  
  // Start profiling an operation
  start = (name: string): Effect.Effect<string> =>
    Effect.gen(function* () {
      const id = `${name}-${Date.now()}-${Math.random()}`
      const startTime = yield* Clock.currentTimeNanos
      
      yield* Ref.update(this.activeProfiles, (profiles) =>
        HashMap.set(profiles, id, Number(startTime))
      )
      
      return id
    })
  
  // End profiling an operation
  end = (id: string, metadata?: Record<string, unknown>): Effect.Effect<void> =>
    Effect.gen(function* () {
      const endTime = yield* Clock.currentTimeNanos
      const activeProfiles = yield* Ref.get(this.activeProfiles)
      const startTime = HashMap.get(activeProfiles, id)
      
      if (Option.isSome(startTime)) {
        const duration = Duration.nanos(endTime - BigInt(startTime.value))
        const [name] = id.split('-')
        
        const profile: ProfileData = {
          name,
          startTime: startTime.value,
          endTime: Number(endTime),
          duration,
          metadata
        }
        
        yield* Ref.update(this.profiles, (profiles) => [...profiles, profile])
        yield* Ref.update(this.activeProfiles, (profiles) =>
          HashMap.remove(profiles, id)
        )
      }
    })
  
  // Profile a single operation
  profile = <A, E, R>(
    name: string,
    operation: Effect.Effect<A, E, R>,
    metadata?: Record<string, unknown>
  ): Effect.Effect<A, E, R> =>
    Effect.gen(function* () {
      const id = yield* this.start(name)
      
      try {
        const result = yield* operation
        yield* this.end(id, metadata)
        return result
      } catch (error) {
        yield* this.end(id, { ...metadata, error: String(error) })
        throw error
      }
    })
  
  // Get performance summary for a specific operation
  getSummary = (name: string): Effect.Effect<Option.Option<ProfileSummary>> =>
    Effect.gen(function* () {
      const allProfiles = yield* Ref.get(this.profiles)
      const filtered = allProfiles.filter(p => p.name === name)
      
      if (filtered.length === 0) {
        return Option.none()
      }
      
      const durations = filtered.map(p => p.duration).sort((a, b) =>
        Number(Duration.toNanos(a) - Duration.toNanos(b))
      )
      
      const totalTime = durations.reduce(
        (sum, d) => Duration.add(sum, d),
        Duration.zero
      )
      
      const averageTime = Duration.divide(totalTime, durations.length)
      const minTime = durations[0]
      const maxTime = durations[durations.length - 1]
      
      const p50 = durations[Math.floor(durations.length * 0.5)]
      const p95 = durations[Math.floor(durations.length * 0.95)]
      const p99 = durations[Math.floor(durations.length * 0.99)]
      
      return Option.some({
        totalCalls: filtered.length,
        totalTime,
        averageTime,
        minTime,
        maxTime,
        p50,
        p95,
        p99
      })
    })
  
  // Get all summaries
  getAllSummaries = (): Effect.Effect<Record<string, ProfileSummary>> =>
    Effect.gen(function* () {
      const allProfiles = yield* Ref.get(this.profiles)
      const names = [...new Set(allProfiles.map(p => p.name))]
      
      const summaries: Record<string, ProfileSummary> = {}
      
      for (const name of names) {
        const summary = yield* this.getSummary(name)
        if (Option.isSome(summary)) {
          summaries[name] = summary.value
        }
      }
      
      return summaries
    })
  
  // Export profiles for analysis
  export = (): Effect.Effect<ProfileData[]> =>
    Ref.get(this.profiles)
  
  // Clear all profiles
  clear = (): Effect.Effect<void> =>
    Effect.all([
      Ref.set(this.profiles, []),
      Ref.set(this.activeProfiles, HashMap.empty())
    ], { discard: true })
}

// Usage example
const profilerExample = Effect.gen(function* () {
  const profiler = yield* Profiler.make()
  
  // Define some operations to profile
  const fastOperation = Effect.gen(function* () {
    yield* Effect.sleep(Duration.millis(Math.random() * 10))
    return "fast result"
  })
  
  const slowOperation = Effect.gen(function* () {
    yield* Effect.sleep(Duration.millis(50 + Math.random() * 100))
    return "slow result"
  })
  
  const varyingOperation = Effect.gen(function* () {
    const delay = Math.random() < 0.2 ? 200 : 20 // 20% slow
    yield* Effect.sleep(Duration.millis(delay))
    return "varying result"
  })
  
  // Run operations multiple times
  yield* Effect.all(
    Array.from({ length: 50 }, (_, i) =>
      Effect.all([
        profiler.profile("fast-op", fastOperation, { iteration: i }),
        profiler.profile("slow-op", slowOperation, { iteration: i }),
        profiler.profile("varying-op", varyingOperation, { iteration: i })
      ])
    ),
    { concurrency: 10 }
  )
  
  // Get performance summaries
  const summaries = yield* profiler.getAllSummaries()
  
  console.log("Performance Summary:")
  Object.entries(summaries).forEach(([name, summary]) => {
    console.log(`\n${name}:`)
    console.log(`  Total calls: ${summary.totalCalls}`)
    console.log(`  Average time: ${Duration.format(summary.averageTime)}`)
    console.log(`  Min time: ${Duration.format(summary.minTime)}`)
    console.log(`  Max time: ${Duration.format(summary.maxTime)}`)
    console.log(`  P50: ${Duration.format(summary.p50)}`)
    console.log(`  P95: ${Duration.format(summary.p95)}`)
    console.log(`  P99: ${Duration.format(summary.p99)}`)
  })
})
```

### Clock-based Metrics Collection

```typescript
import { Effect, Clock, Duration, Ref, HashMap, Schedule, pipe } from "effect"

interface MetricPoint {
  readonly timestamp: number
  readonly value: number
  readonly tags?: Record<string, string>
}

interface MetricSeries {
  readonly name: string
  readonly points: MetricPoint[]
  readonly type: "counter" | "gauge" | "histogram"
}

class MetricsCollector {
  constructor(
    private readonly metrics: Ref.Ref<HashMap.HashMap<string, MetricSeries>>,
    private readonly retentionPeriod: Duration.Duration
  ) {}
  
  static make = (retentionPeriod = Duration.hours(24)) =>
    Effect.gen(function* () {
      const metrics = yield* Ref.make(HashMap.empty<string, MetricSeries>())
      
      return new MetricsCollector(metrics, retentionPeriod)
    })
  
  // Record a counter metric
  counter = (
    name: string,
    value = 1,
    tags?: Record<string, string>
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const timestamp = yield* Clock.currentTimeMillis
      yield* this.recordPoint(name, "counter", { timestamp, value, tags })
    })
  
  // Record a gauge metric
  gauge = (
    name: string,
    value: number,
    tags?: Record<string, string>
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const timestamp = yield* Clock.currentTimeMillis
      yield* this.recordPoint(name, "gauge", { timestamp, value, tags })
    })
  
  // Record a histogram metric (typically for timing)
  histogram = (
    name: string,
    value: number,
    tags?: Record<string, string>
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      const timestamp = yield* Clock.currentTimeMillis
      yield* this.recordPoint(name, "histogram", { timestamp, value, tags })
    })
  
  // Time an operation and record histogram
  time = <A, E, R>(
    name: string,
    operation: Effect.Effect<A, E, R>,
    tags?: Record<string, string>
  ): Effect.Effect<A, E, R> =>
    Effect.gen(function* () {
      const start = yield* Clock.currentTimeNanos
      const result = yield* operation
      const end = yield* Clock.currentTimeNanos
      
      const durationMs = Number(end - start) / 1000000
      yield* this.histogram(name, durationMs, tags)
      
      return result
    })
  
  private recordPoint = (
    name: string,
    type: "counter" | "gauge" | "histogram",
    point: MetricPoint
  ): Effect.Effect<void> =>
    Ref.update(this.metrics, (metrics) => {
      const existing = HashMap.get(metrics, name)
      
      if (Option.isSome(existing)) {
        const series = existing.value
        return HashMap.set(metrics, name, {
          ...series,
          points: [...series.points, point]
        })
      } else {
        return HashMap.set(metrics, name, {
          name,
          type,
          points: [point]
        })
      }
    })
  
  // Get metric series
  getSeries = (name: string): Effect.Effect<Option.Option<MetricSeries>> =>
    Effect.gen(function* () {
      const metrics = yield* Ref.get(this.metrics)
      return HashMap.get(metrics, name)
    })
  
  // Query metrics within time range
  query = (
    name: string,
    start: number,
    end: number
  ): Effect.Effect<MetricPoint[]> =>
    Effect.gen(function* () {
      const series = yield* this.getSeries(name)
      
      if (Option.isNone(series)) {
        return []
      }
      
      return series.value.points.filter(
        point => point.timestamp >= start && point.timestamp <= end
      )
    })
  
  // Aggregate metrics
  aggregate = (
    name: string,
    windowSize: Duration.Duration,
    aggregation: "sum" | "avg" | "min" | "max" | "count"
  ): Effect.Effect<MetricPoint[]> =>
    Effect.gen(function* () {
      const series = yield* this.getSeries(name)
      
      if (Option.isNone(series)) {
        return []
      }
      
      const windowMs = Number(Duration.toMillis(windowSize))
      const points = series.value.points
      const aggregated: MetricPoint[] = []
      
      // Group points by time window
      const windows = new Map<number, MetricPoint[]>()
      
      for (const point of points) {
        const windowStart = Math.floor(point.timestamp / windowMs) * windowMs
        const windowPoints = windows.get(windowStart) || []
        windowPoints.push(point)
        windows.set(windowStart, windowPoints)
      }
      
      // Aggregate each window
      for (const [windowStart, windowPoints] of windows) {
        let value: number
        
        switch (aggregation) {
          case "sum":
            value = windowPoints.reduce((sum, p) => sum + p.value, 0)
            break
          case "avg":
            value = windowPoints.reduce((sum, p) => sum + p.value, 0) / windowPoints.length
            break
          case "min":
            value = Math.min(...windowPoints.map(p => p.value))
            break
          case "max":
            value = Math.max(...windowPoints.map(p => p.value))
            break
          case "count":
            value = windowPoints.length
            break
        }
        
        aggregated.push({ timestamp: windowStart, value })
      }
      
      return aggregated.sort((a, b) => a.timestamp - b.timestamp)
    })
  
  // Cleanup old metrics
  cleanup = (): Effect.Effect<number> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const cutoff = now - Number(Duration.toMillis(this.retentionPeriod))
      
      const currentMetrics = yield* Ref.get(this.metrics)
      let removedPoints = 0
      
      const cleanedMetrics = HashMap.map(currentMetrics, (series) => {
        const filteredPoints = series.points.filter(
          point => point.timestamp > cutoff
        )
        
        removedPoints += series.points.length - filteredPoints.length
        
        return {
          ...series,
          points: filteredPoints
        }
      })
      
      // Remove empty series
      const nonEmptyMetrics = HashMap.filter(
        cleanedMetrics,
        series => series.points.length > 0
      )
      
      yield* Ref.set(this.metrics, nonEmptyMetrics)
      return removedPoints
    })
  
  // Export metrics in Prometheus format
  exportPrometheus = (): Effect.Effect<string> =>
    Effect.gen(function* () {
      const currentMetrics = yield* Ref.get(this.metrics)
      const lines: string[] = []
      
      for (const series of HashMap.values(currentMetrics)) {
        const latestPoint = series.points[series.points.length - 1]
        if (latestPoint) {
          let line = `${series.name} ${latestPoint.value}`
          
          if (latestPoint.tags) {
            const tagStr = Object.entries(latestPoint.tags)
              .map(([key, value]) => `${key}="${value}"`)
              .join(',')
            line = `${series.name}{${tagStr}} ${latestPoint.value}`
          }
          
          lines.push(line)
        }
      }
      
      return lines.join('\n')
    })
}

// Usage example
const metricsExample = Effect.gen(function* () {
  const metrics = yield* MetricsCollector.make()
  
  // Set up automatic cleanup
  const cleanupFiber = yield* Effect.fork(
    Effect.repeat(
      Effect.gen(function* () {
        const removed = yield* metrics.cleanup()
        console.log(`Cleaned up ${removed} old metric points`)
      }),
      Schedule.fixed(Duration.minutes(10))
    )
  )
  
  // Simulate application metrics
  const simulateLoad = Effect.gen(function* () {
    // Request counter
    yield* metrics.counter("http_requests_total", 1, {
      method: "GET",
      status: "200"
    })
    
    // Response time histogram
    const responseTime = 50 + Math.random() * 200
    yield* metrics.histogram("http_request_duration_ms", responseTime, {
      method: "GET"
    })
    
    // Memory usage gauge
    const memoryUsage = 100 + Math.random() * 50
    yield* metrics.gauge("memory_usage_mb", memoryUsage)
    
    // Timed operation
    yield* metrics.time(
      "database_query_duration_ms",
      Effect.sleep(Duration.millis(Math.random() * 100)),
      { table: "users" }
    )
  })
  
  // Generate metrics for 5 minutes
  for (let i = 0; i < 300; i++) {
    yield* simulateLoad
    yield* Effect.sleep(Duration.seconds(1))
  }
  
  // Analyze metrics
  const requestCount = yield* metrics.aggregate(
    "http_requests_total",
    Duration.minutes(1),
    "sum"
  )
  
  const avgResponseTime = yield* metrics.aggregate(
    "http_request_duration_ms",
    Duration.minutes(1),
    "avg"
  )
  
  console.log("Request count per minute:", requestCount.slice(-5))
  console.log("Average response time per minute:", avgResponseTime.slice(-5))
  
  // Export current metrics
  const prometheusFormat = yield* metrics.exportPrometheus()
  console.log("Prometheus format:")
  console.log(prometheusFormat)
  
  yield* Fiber.interrupt(cleanupFiber)
})
```

## Practical Patterns & Best Practices

### Pattern 1: Clock Service Abstraction

```typescript
import { Effect, Context, Layer, Clock, Duration, TestClock } from "effect"

// Define a higher-level time service
interface TimeService {
  readonly now: Effect.Effect<Date>
  readonly timestamp: Effect.Effect<number>
  readonly sleep: (duration: Duration.Duration) => Effect.Effect<void>
  readonly timeout: <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    duration: Duration.Duration
  ) => Effect.Effect<A, E | TimeoutError, R>
  readonly schedule: <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    delay: Duration.Duration
  ) => Effect.Effect<A, E, R>
}

const TimeService = Context.GenericTag<TimeService>("TimeService")

class TimeoutError {
  readonly _tag = "TimeoutError"
  constructor(readonly duration: Duration.Duration) {}
}

// Live implementation
const TimeServiceLive = Layer.succeed(
  TimeService,
  {
    now: Effect.gen(function* () {
      const millis = yield* Clock.currentTimeMillis
      return new Date(millis)
    }),
    
    timestamp: Clock.currentTimeMillis,
    
    sleep: Effect.sleep,
    
    timeout: <A, E, R>(
      effect: Effect.Effect<A, E, R>,
      duration: Duration.Duration
    ) =>
      pipe(
        Effect.timeout(effect, duration),
        Effect.catchTag("TimeoutException", () =>
          Effect.fail(new TimeoutError(duration))
        )
      ),
    
    schedule: <A, E, R>(
      effect: Effect.Effect<A, E, R>,
      delay: Duration.Duration
    ) =>
      Effect.gen(function* () {
        yield* Effect.sleep(delay)
        return yield* effect
      })
  }
)

// Test implementation with controllable time
const makeTestTimeService = (initialTime: Date) => {
  let currentTime = initialTime.getTime()
  
  return Layer.succeed(
    TimeService,
    {
      now: Effect.succeed(new Date(currentTime)),
      
      timestamp: Effect.succeed(currentTime),
      
      sleep: (duration) =>
        Effect.sync(() => {
          currentTime += Number(Duration.toMillis(duration))
        }),
      
      timeout: <A, E, R>(
        effect: Effect.Effect<A, E, R>,
        duration: Duration.Duration
      ) =>
        Effect.gen(function* () {
          // In test, we can control whether timeout occurs
          const start = currentTime
          const result = yield* effect
          const elapsed = currentTime - start
          
          if (elapsed > Number(Duration.toMillis(duration))) {
            return yield* Effect.fail(new TimeoutError(duration))
          }
          
          return result
        }),
      
      schedule: <A, E, R>(
        effect: Effect.Effect<A, E, R>,
        delay: Duration.Duration
      ) =>
        Effect.gen(function* () {
          currentTime += Number(Duration.toMillis(delay))
          return yield* effect
        })
    }
  )
}

// Usage in business logic
const sessionManager = Effect.gen(function* () {
  const timeService = yield* TimeService
  
  const createSession = (userId: string) =>
    Effect.gen(function* () {
      const now = yield* timeService.now
      const sessionId = `session_${userId}_${now.getTime()}`
      
      console.log(`Created session ${sessionId} at ${now}`)
      
      // Session expires in 1 hour
      yield* Effect.fork(
        timeService.schedule(
          Effect.gen(function* () {
            console.log(`Session ${sessionId} expired`)
          }),
          Duration.hours(1)
        )
      )
      
      return sessionId
    })
  
  const withTimeout = <A, E, R>(
    operation: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E | TimeoutError, R> =>
    timeService.timeout(operation, Duration.seconds(30))
  
  return { createSession, withTimeout }
})

// Testing
const testSessionManager = Effect.gen(function* () {
  const manager = yield* sessionManager
  
  // Create a session
  const sessionId = yield* manager.createSession("user123")
  expect(sessionId).toContain("user123")
  
  // Test timeout
  const slowOperation = Effect.sleep(Duration.seconds(60))
  const result = yield* Effect.either(manager.withTimeout(slowOperation))
  
  expect(result._tag).toBe("Left")
  expect(result.left).toBeInstanceOf(TimeoutError)
}).pipe(
  Effect.provide(makeTestTimeService(new Date("2024-01-01T00:00:00Z")))
)
```

### Pattern 2: Time-based State Machines

```typescript
import { Effect, Ref, Clock, Duration, pipe } from "effect"

// State machine with time-based transitions
type OrderState =
  | { _tag: "Created"; createdAt: number }
  | { _tag: "Paid"; paidAt: number }
  | { _tag: "Shipped"; shippedAt: number }
  | { _tag: "Delivered"; deliveredAt: number }
  | { _tag: "Cancelled"; cancelledAt: number }
  | { _tag: "Expired"; expiredAt: number }

interface OrderStateMachine {
  readonly getState: Effect.Effect<OrderState>
  readonly transition: (newState: Exclude<OrderState["_tag"], "Created" | "Expired">) => Effect.Effect<boolean>
  readonly checkExpiration: Effect.Effect<boolean>
  readonly getHistory: Effect.Effect<OrderState[]>
}

const makeOrderStateMachine = (
  orderId: string,
  expirationTime = Duration.hours(24)
): Effect.Effect<OrderStateMachine> =>
  Effect.gen(function* () {
    const createdAt = yield* Clock.currentTimeMillis
    const initialState: OrderState = { _tag: "Created", createdAt }
    
    const currentState = yield* Ref.make(initialState)
    const history = yield* Ref.make<OrderState[]>([initialState])
    
    const getState = Ref.get(currentState)
    
    const transition = (newStateTag: Exclude<OrderState["_tag"], "Created" | "Expired">) =>
      Effect.gen(function* () {
        const state = yield* Ref.get(currentState)
        const now = yield* Clock.currentTimeMillis
        
        // Check if transition is valid
        const isValidTransition = validateTransition(state._tag, newStateTag)
        
        if (!isValidTransition) {
          console.log(`Invalid transition from ${state._tag} to ${newStateTag}`)
          return false
        }
        
        // Check if order has expired
        const hasExpired = yield* checkExpiration()
        if (hasExpired) {
          console.log(`Cannot transition expired order ${orderId}`)
          return false
        }
        
        // Create new state
        let newState: OrderState
        switch (newStateTag) {
          case "Paid":
            newState = { _tag: "Paid", paidAt: now }
            break
          case "Shipped":
            newState = { _tag: "Shipped", shippedAt: now }
            break
          case "Delivered":
            newState = { _tag: "Delivered", deliveredAt: now }
            break
          case "Cancelled":
            newState = { _tag: "Cancelled", cancelledAt: now }
            break
        }
        
        yield* Ref.set(currentState, newState)
        yield* Ref.update(history, (h) => [...h, newState])
        
        console.log(`Order ${orderId} transitioned to ${newStateTag}`)
        return true
      })
    
    const checkExpiration = Effect.gen(function* () {
      const state = yield* Ref.get(currentState)
      const now = yield* Clock.currentTimeMillis
      
      // Only check expiration for non-terminal states
      if (state._tag === "Delivered" || state._tag === "Cancelled" || state._tag === "Expired") {
        return false
      }
      
      const age = now - state.createdAt
      const hasExpired = age > Number(Duration.toMillis(expirationTime))
      
      if (hasExpired && state._tag !== "Expired") {
        const expiredState: OrderState = { _tag: "Expired", expiredAt: now }
        yield* Ref.set(currentState, expiredState)
        yield* Ref.update(history, (h) => [...h, expiredState])
        console.log(`Order ${orderId} expired`)
      }
      
      return hasExpired
    })
    
    const getHistory = Ref.get(history)
    
    return {
      getState,
      transition,
      checkExpiration,
      getHistory
    }
  })

const validateTransition = (from: OrderState["_tag"], to: OrderState["_tag"]): boolean => {
  const validTransitions: Record<OrderState["_tag"], OrderState["_tag"][]> = {
    Created: ["Paid", "Cancelled"],
    Paid: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: [],
    Expired: []
  }
  
  return validTransitions[from].includes(to)
}

// Usage example
const orderProcessingExample = Effect.gen(function* () {
  const orderSM = yield* makeOrderStateMachine("order-123", Duration.minutes(5))
  
  // Process order through states
  console.log("Initial state:", yield* orderSM.getState())
  
  // Simulate payment after 1 minute
  yield* Effect.sleep(Duration.minutes(1))
  yield* orderSM.transition("Paid")
  
  // Simulate shipping after 2 more minutes
  yield* Effect.sleep(Duration.minutes(2))
  yield* orderSM.transition("Shipped")
  
  // Check expiration
  yield* Effect.sleep(Duration.minutes(3))
  const expired = yield* orderSM.checkExpiration()
  console.log("Order expired:", expired)
  
  // Try to deliver expired order
  const delivered = yield* orderSM.transition("Delivered")
  console.log("Delivery successful:", delivered)
  
  // Show final history
  const history = yield* orderSM.getHistory()
  console.log("Order history:", history)
})
```

### Pattern 3: Clock-based Resource Management

```typescript
import { Effect, Ref, Clock, Duration, Schedule, Fiber, pipe } from "effect"

// Resource pool with time-based cleanup
interface PooledResource<T> {
  readonly resource: T
  readonly createdAt: number
  readonly lastUsedAt: number
  readonly useCount: number
}

interface ResourcePool<T> {
  readonly acquire: Effect.Effect<T>
  readonly release: (resource: T) => Effect.Effect<void>
  readonly getStats: Effect.Effect<{
    total: number
    active: number
    idle: number
    maxAge: Duration.Duration
  }>
}

const makeResourcePool = <T>(
  factory: Effect.Effect<T>,
  destroyer: (resource: T) => Effect.Effect<void>,
  config: {
    maxSize: number
    maxAge: Duration.Duration
    idleTimeout: Duration.Duration
    cleanupInterval: Duration.Duration
  }
): Effect.Effect<ResourcePool<T>> =>
  Effect.gen(function* () {
    const pool = yield* Ref.make<PooledResource<T>[]>([])
    const active = yield* Ref.make(new Set<T>())
    
    // Start cleanup fiber
    const cleanupFiber = yield* Effect.fork(
      Effect.repeat(
        Effect.gen(function* () {
          const now = yield* Clock.currentTimeMillis
          const currentPool = yield* Ref.get(pool)
          
          const { keep, remove } = currentPool.reduce(
            (acc, pooled) => {
              const age = now - pooled.createdAt
              const idle = now - pooled.lastUsedAt
              const activeSet = yield* Ref.get(active)
              
              if (
                age > Number(Duration.toMillis(config.maxAge)) ||
                (idle > Number(Duration.toMillis(config.idleTimeout)) && 
                 !activeSet.has(pooled.resource))
              ) {
                acc.remove.push(pooled)
              } else {
                acc.keep.push(pooled)
              }
              
              return acc
            },
            { keep: [] as PooledResource<T>[], remove: [] as PooledResource<T>[] }
          )
          
          // Update pool
          yield* Ref.set(pool, keep)
          
          // Destroy removed resources
          yield* Effect.all(
            remove.map(pooled => destroyer(pooled.resource)),
            { discard: true }
          )
          
          if (remove.length > 0) {
            console.log(`Cleaned up ${remove.length} resources`)
          }
        }),
        Schedule.fixed(config.cleanupInterval)
      )
    )
    
    const acquire = Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentPool = yield* Ref.get(pool)
      
      // Find available resource
      const available = currentPool.find(pooled => {
        const activeSet = yield* Ref.get(active)
        return !activeSet.has(pooled.resource)
      })
      
      if (available) {
        // Update usage stats
        const updated: PooledResource<T> = {
          ...available,
          lastUsedAt: now,
          useCount: available.useCount + 1
        }
        
        yield* Ref.update(pool, (p) =>
          p.map(pooled => 
            pooled.resource === available.resource ? updated : pooled
          )
        )
        
        yield* Ref.update(active, (set) => set.add(available.resource))
        
        return available.resource
      }
      
      // Create new resource if under limit
      if (currentPool.length < config.maxSize) {
        const resource = yield* factory
        const pooled: PooledResource<T> = {
          resource,
          createdAt: now,
          lastUsedAt: now,
          useCount: 1
        }
        
        yield* Ref.update(pool, (p) => [...p, pooled])
        yield* Ref.update(active, (set) => set.add(resource))
        
        return resource
      }
      
      // Pool is full, wait and retry
      yield* Effect.sleep(Duration.millis(100))
      return yield* acquire
    })
    
    const release = (resource: T) =>
      Effect.gen(function* () {
        yield* Ref.update(active, (set) => {
          const newSet = new Set(set)
          newSet.delete(resource)
          return newSet
        })
      })
    
    const getStats = Effect.gen(function* () {
      const currentPool = yield* Ref.get(pool)
      const activeSet = yield* Ref.get(active)
      const now = yield* Clock.currentTimeMillis
      
      const ages = currentPool.map(pooled => now - pooled.createdAt)
      const maxAge = ages.length > 0 
        ? Duration.millis(Math.max(...ages))
        : Duration.zero
      
      return {
        total: currentPool.length,
        active: activeSet.size,
        idle: currentPool.length - activeSet.size,
        maxAge
      }
    })
    
    // Cleanup on shutdown
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        yield* Fiber.interrupt(cleanupFiber)
        
        const currentPool = yield* Ref.get(pool)
        yield* Effect.all(
          currentPool.map(pooled => destroyer(pooled.resource)),
          { discard: true }
        )
      })
    )
    
    return { acquire, release, getStats }
  })

// Usage example with database connections
const databaseConnectionExample = Effect.gen(function* () {
  // Mock database connection
  interface Connection {
    id: string
    query: (sql: string) => Effect.Effect<string>
  }
  
  const createConnection = Effect.gen(function* () {
    const id = Math.random().toString(36)
    console.log(`Creating connection ${id}`)
    
    return {
      id,
      query: (sql: string) =>
        Effect.gen(function* () {
          yield* Effect.sleep(Duration.millis(Math.random() * 100))
          return `Result for: ${sql}`
        })
    }
  })
  
  const destroyConnection = (conn: Connection) =>
    Effect.gen(function* () {
      console.log(`Destroying connection ${conn.id}`)
    })
  
  const pool = yield* makeResourcePool(
    createConnection,
    destroyConnection,
    {
      maxSize: 5,
      maxAge: Duration.minutes(30),
      idleTimeout: Duration.minutes(5),
      cleanupInterval: Duration.minutes(1)
    }
  )
  
  // Simulate database usage
  const performQueries = Effect.gen(function* () {
    for (let i = 0; i < 10; i++) {
      const conn = yield* pool.acquire
      
      try {
        const result = yield* conn.query(`SELECT * FROM users WHERE id = ${i}`)
        console.log(`Query ${i}: ${result}`)
      } finally {
        yield* pool.release(conn)
      }
      
      yield* Effect.sleep(Duration.seconds(1))
    }
  })
  
  yield* performQueries
  
  // Show pool stats
  const stats = yield* pool.getStats()
  console.log("Pool stats:", stats)
})
```

## Integration Examples

### Integration with Testing Frameworks

```typescript
import { Effect, Clock, Duration, TestClock, TestContext, Layer } from "effect"
import { describe, test, expect, beforeEach } from "@effect/vitest"

describe("Clock Integration Tests", () => {
  test("time-based cache expiration", () =>
    Effect.gen(function* () {
      const cache = new Map<string, { value: string; expiry: number }>()
      
      const set = (key: string, value: string, ttl: Duration.Duration) =>
        Effect.gen(function* () {
          const now = yield* Clock.currentTimeMillis
          const expiry = now + Number(Duration.toMillis(ttl))
          cache.set(key, { value, expiry })
        })
      
      const get = (key: string) =>
        Effect.gen(function* () {
          const now = yield* Clock.currentTimeMillis
          const entry = cache.get(key)
          
          if (!entry) return Option.none()
          
          if (now > entry.expiry) {
            cache.delete(key)
            return Option.none()
          }
          
          return Option.some(entry.value)
        })
      
      // Set value with 5-second TTL
      yield* set("key1", "value1", Duration.seconds(5))
      
      // Should be available initially
      let result = yield* get("key1")
      expect(Option.isSome(result)).toBe(true)
      
      // Advance time by 3 seconds
      yield* TestClock.adjust(Duration.seconds(3))
      
      // Should still be available
      result = yield* get("key1")
      expect(Option.isSome(result)).toBe(true)
      
      // Advance time by 3 more seconds (total 6)
      yield* TestClock.adjust(Duration.seconds(3))
      
      // Should be expired
      result = yield* get("key1")
      expect(Option.isNone(result)).toBe(true)
    }).pipe(Effect.provide(TestContext.TestContext))
  )
  
  test("retry with exponential backoff", () =>
    Effect.gen(function* () {
      let attempts = 0
      
      const operation = Effect.gen(function* () {
        attempts++
        if (attempts < 3) {
          return yield* Effect.fail(new Error("Not ready"))
        }
        return "Success"
      })
      
      const startTime = yield* Clock.currentTimeMillis
      
      const result = yield* pipe(
        Effect.retry(
          operation,
          Schedule.exponential(Duration.seconds(1), 2).pipe(
            Schedule.intersect(Schedule.recurs(3))
          )
        )
      )
      
      const endTime = yield* Clock.currentTimeMillis
      
      expect(result).toBe("Success")
      expect(attempts).toBe(3)
      
      // Should have waited 1 + 2 = 3 seconds total
      expect(endTime - startTime).toBe(3000)
    }).pipe(Effect.provide(TestContext.TestContext))
  )
  
  test("scheduled task execution", () =>
    Effect.gen(function* () {
      const executions: number[] = []
      
      const task = Effect.gen(function* () {
        const now = yield* Clock.currentTimeMillis
        executions.push(now)
      })
      
      const startTime = yield* Clock.currentTimeMillis
      
      // Start task that runs every 2 seconds
      const scheduledTask = Effect.repeat(
        task,
        Schedule.fixed(Duration.seconds(2))
      )
      
      const fiber = yield* Effect.fork(scheduledTask)
      
      // Let it run for 10 seconds
      yield* TestClock.adjust(Duration.seconds(10))
      
      yield* Fiber.interrupt(fiber)
      
      // Should have executed at 0, 2, 4, 6, 8, 10 seconds
      expect(executions).toHaveLength(6)
      expect(executions).toEqual([
        startTime,
        startTime + 2000,
        startTime + 4000,
        startTime + 6000,
        startTime + 8000,
        startTime + 10000
      ])
    }).pipe(Effect.provide(TestContext.TestContext))
  )
})

// Property-based testing with time
import * as fc from "fast-check"

test("time-based operations properties", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000 }),
      fc.integer({ min: 1, max: 10 }),
      (delayMs, iterations) => {
        return Effect.gen(function* () {
          const executions: number[] = []
          
          const task = Effect.gen(function* () {
            const now = yield* Clock.currentTimeMillis
            executions.push(now)
          })
          
          const startTime = yield* Clock.currentTimeMillis
          
          // Execute task multiple times with delay
          for (let i = 0; i < iterations; i++) {
            yield* task
            if (i < iterations - 1) {
              yield* Effect.sleep(Duration.millis(delayMs))
            }
          }
          
          const endTime = yield* Clock.currentTimeMillis
          
          // Verify timing properties
          expect(executions).toHaveLength(iterations)
          expect(endTime - startTime).toBe((iterations - 1) * delayMs)
          
          // Verify intervals
          for (let i = 1; i < executions.length; i++) {
            expect(executions[i] - executions[i - 1]).toBe(delayMs)
          }
        }).pipe(Effect.provide(TestContext.TestContext))
      }
    )
  )
})
```

### Integration with Observability

```typescript
import { Effect, Clock, Duration, Layer, Context } from "effect"

// Observability service
interface ObservabilityService {
  readonly recordMetric: (
    name: string,
    value: number,
    tags?: Record<string, string>
  ) => Effect.Effect<void>
  readonly startTimer: (name: string) => Effect.Effect<() => Effect.Effect<void>>
  readonly recordEvent: (
    name: string,
    properties?: Record<string, unknown>
  ) => Effect.Effect<void>
}

const ObservabilityService = Context.GenericTag<ObservabilityService>("ObservabilityService")

// Implementation with Clock integration
const ObservabilityServiceLive = Layer.succeed(
  ObservabilityService,
  {
    recordMetric: (name, value, tags) =>
      Effect.gen(function* () {
        const timestamp = yield* Clock.currentTimeMillis
        console.log(`METRIC [${new Date(timestamp)}] ${name}=${value}`, tags)
      }),
    
    startTimer: (name) =>
      Effect.gen(function* () {
        const start = yield* Clock.currentTimeNanos
        
        return () =>
          Effect.gen(function* () {
            const end = yield* Clock.currentTimeNanos
            const duration = Number(end - start) / 1000000 // Convert to milliseconds
            
            yield* Effect.serviceWithEffect(ObservabilityService, (service) =>
              service.recordMetric(`${name}_duration_ms`, duration)
            )
          })
      }),
    
    recordEvent: (name, properties) =>
      Effect.gen(function* () {
        const timestamp = yield* Clock.currentTimeMillis
        console.log(`EVENT [${new Date(timestamp)}] ${name}`, properties)
      })
  }
)

// Instrumented operations
const instrumentedOperation = <A, E, R>(
  name: string,
  operation: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  Effect.gen(function* () {
    const observability = yield* ObservabilityService
    
    // Record start event
    yield* observability.recordEvent(`${name}_started`)
    
    // Start timer
    const stopTimer = yield* observability.startTimer(name)
    
    try {
      const result = yield* operation
      
      // Record success
      yield* observability.recordEvent(`${name}_completed`, { success: true })
      yield* observability.recordMetric(`${name}_success_count`, 1)
      
      return result
    } catch (error) {
      // Record failure
      yield* observability.recordEvent(`${name}_completed`, { 
        success: false, 
        error: String(error) 
      })
      yield* observability.recordMetric(`${name}_error_count`, 1)
      
      throw error
    } finally {
      // Stop timer
      yield* stopTimer()
    }
  })

// Usage example
const observabilityExample = Effect.gen(function* () {
  const businessOperation = Effect.gen(function* () {
    yield* Effect.sleep(Duration.millis(Math.random() * 100))
    
    if (Math.random() < 0.2) {
      return yield* Effect.fail(new Error("Random failure"))
    }
    
    return "Success"
  })
  
  // Run instrumented operations
  for (let i = 0; i < 10; i++) {
    const result = yield* Effect.either(
      instrumentedOperation("business_operation", businessOperation)
    )
    
    console.log(`Operation ${i + 1}: ${result._tag}`)
    
    yield* Effect.sleep(Duration.seconds(1))
  }
}).pipe(Effect.provide(ObservabilityServiceLive))
```

## Conclusion

Clock provides a powerful abstraction for time-based operations, enabling testable, predictable, and composable time-dependent code in Effect applications.

Key benefits:
- **Testability**: Virtual time allows testing time-based logic without waiting
- **Composability**: Integrates seamlessly with Effect's scheduling and timeout systems  
- **Determinism**: Controlled time progression enables reproducible behavior in tests

Clock is essential for building reliable systems with time-based business logic, performance monitoring, and complex scheduling requirements while maintaining comprehensive test coverage.