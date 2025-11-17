# Schedule: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Schedule Solves

Modern applications require sophisticated retry logic, repetition patterns, and time-based scheduling. Traditional approaches using setTimeout, setInterval, and manual retry logic quickly become complex and error-prone:

```typescript
// Traditional approach - manual retry with exponential backoff
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  let attempt = 0;
  let lastError: Error;
  
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      if (attempt >= maxRetries) {
        break;
      }
      
      // Manual exponential backoff calculation
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
      const jitter = Math.random() * 0.1 * delay;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  throw lastError!;
}

// Manual interval scheduling with error handling
let intervalId: NodeJS.Timeout;
let isRunning = false;

async function startPeriodicTask() {
  if (isRunning) return;
  
  isRunning = true;
  intervalId = setInterval(async () => {
    try {
      await performTask();
    } catch (error) {
      console.error('Task failed:', error);
      // How do we handle errors? Stop? Continue? Backoff?
      // What about graceful shutdown?
    }
  }, 5000);
}

function stopPeriodicTask() {
  if (intervalId) {
    clearInterval(intervalId);
    isRunning = false;
  }
}

// Complex retry logic with different strategies
async function complexRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries: number;
    strategy: 'fixed' | 'exponential' | 'linear';
    baseDelay: number;
    maxDelay?: number;
    jitter?: boolean;
    retryIf?: (error: Error) => boolean;
  }
): Promise<T> {
  let attempt = 0;
  
  while (attempt < options.maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (options.retryIf && !options.retryIf(error as Error)) {
        throw error;
      }
      
      attempt++;
      if (attempt >= options.maxRetries) {
        throw error;
      }
      
      let delay: number;
      switch (options.strategy) {
        case 'fixed':
          delay = options.baseDelay;
          break;
        case 'exponential':
          delay = options.baseDelay * Math.pow(2, attempt - 1);
          break;
        case 'linear':
          delay = options.baseDelay * attempt;
          break;
      }
      
      if (options.maxDelay) {
        delay = Math.min(delay, options.maxDelay);
      }
      
      if (options.jitter) {
        delay += Math.random() * delay * 0.1;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries reached');
}
```

This approach leads to:
- **Boilerplate explosion** - Manual delay calculations and retry logic
- **Non-composable patterns** - Can't easily combine retry strategies
- **Poor error handling** - Difficult to handle different failure scenarios
- **No built-in jitter** - Manual implementation of anti-thundering herd
- **Testing nightmares** - Time-dependent code is hard to test
- **Resource leaks** - Manual cleanup of timers and intervals

### The Schedule Solution

Schedule provides composable, declarative patterns for retrying, repeating, and time-based scheduling:

```typescript
import { Effect, Schedule, Duration } from "effect"

// Clean, composable retry logic
const retryPolicy = Schedule.exponential("100 millis").pipe(
  Schedule.compose(Schedule.recurs(3)),
  Schedule.jittered, // Built-in jitter
  Schedule.whileInput((error: Error) => error.message !== "PERMANENT_FAILURE")
)

const fetchWithSchedule = (url: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url),
      catch: (error) => new Error(`Fetch failed: ${error}`)
    })
    
    if (response.ok) {
      return response
    } else {
      return yield* Effect.fail(new Error(`HTTP ${response.status}`))
    }
  }).pipe(
    Effect.retry(retryPolicy)
  )

// Elegant periodic scheduling
const performTask = () => Effect.sync(() => console.log("Task performed"))

const periodicTask = Effect.repeat(
  performTask(),
  Schedule.whileOutput(Schedule.fixed("5 seconds"), () => Effect.succeed(true))
)

// Complex retry combinations made simple
const sophisticatedRetry = Schedule.union(
  Schedule.exponential("100 millis").pipe(Schedule.compose(Schedule.recurs(3))),
  Schedule.spaced("10 seconds").pipe(Schedule.compose(Schedule.recurs(2)))
)
```

### Key Concepts

**Schedule**: An immutable value describing a pattern for recurring operations with delays, repetitions, and conditions.

**Retry**: Using schedules to handle failures by re-executing effects with configurable delay strategies.

**Repeat**: Using schedules to execute successful effects multiple times with specific timing patterns.

**Composition**: Combining simple schedules into complex patterns using operators like `union`, `intersect`, and `andThen`.

**Jitter**: Adding randomness to delays to prevent thundering herd problems.

## Basic Usage Patterns

### Pattern 1: Simple Retry with Exponential Backoff

```typescript
import { Effect, Schedule, Data } from "effect"

// Define error types
class NetworkError extends Data.TaggedError("NetworkError")<{
  message: string
  retryable: boolean
}> {}

class ApiError extends Data.TaggedError("ApiError")<{
  status: number
  message: string
}> {}

// API call that might fail
const callApi = (endpoint: string): Effect.Effect<any, NetworkError | ApiError> =>
  Effect.gen(function* () {
    // Simulate API call that might fail
    const random = Math.random()
    
    if (random < 0.3) {
      yield* Effect.fail(new NetworkError({
        message: "Connection timeout",
        retryable: true
      }))
    } else if (random < 0.4) {
      yield* Effect.fail(new ApiError({
        status: 500,
        message: "Internal server error"
      }))
    }
    
    return { data: `Response from ${endpoint}`, timestamp: Date.now() }
  })

// Basic exponential backoff retry
const retrySchedule = Schedule.exponential("100 millis").pipe(
  Schedule.compose(Schedule.recurs(3))
)

// Apply retry policy
const reliableApiCall = (endpoint: string) =>
  callApi(endpoint).pipe(
    Effect.retry(retrySchedule),
    Effect.catchAll(error => 
      Effect.succeed({ 
        error: error._tag === "NetworkError" 
          ? `Network failed: ${error.message}`
          : `API failed: ${error.status}`
      })
    )
  )

// Run the effect
const example1 = Effect.gen(function* () {
  const result = yield* reliableApiCall("/api/users")
  console.log("API Result:", result)
})
```

### Pattern 2: Periodic Task Execution

```typescript
import { Effect, Schedule, Ref, Duration } from "effect"

interface TaskResult {
  success: boolean
  processedItems: number
  timestamp: number
}

// Task that processes data batches
const processDataBatch = (): Effect.Effect<TaskResult> =>
  Effect.gen(function* () {
    // Simulate batch processing
    yield* Effect.sleep("200 millis")
    const processed = Math.floor(Math.random() * 100)
    
    return {
      success: true,
      processedItems: processed,
      timestamp: Date.now()
    }
  })

// Create a periodic processor with dynamic control
const createPeriodicProcessor = Effect.gen(function* () {
  const shouldContinueRef = yield* Ref.make(true)
  const totalProcessedRef = yield* Ref.make(0)
  
  const processor = processDataBatch().pipe(
    Effect.tap(result => 
      Ref.update(totalProcessedRef, total => total + result.processedItems)
    ),
    Effect.tap(result => 
      Effect.sync(() => 
        console.log(`Processed ${result.processedItems} items at ${new Date(result.timestamp).toISOString()}`)
      )
    ),
    Effect.repeat(
      Schedule.whileOutput(Schedule.fixed("5 seconds"), () => Ref.get(shouldContinueRef))
    )
  )
  
  return {
    start: () => Effect.fork(processor),
    stop: () => Ref.set(shouldContinueRef, false),
    getTotal: () => Ref.get(totalProcessedRef)
  }
})

// Usage
const example2 = Effect.gen(function* () {
  const processor = yield* createPeriodicProcessor
  
  // Start processing
  const fiber = yield* processor.start()
  
  // Let it run for 20 seconds
  yield* Effect.sleep("20 seconds")
  
  // Stop processing
  yield* processor.stop()
  yield* Fiber.join(fiber)
  
  const total = yield* processor.getTotal()
  console.log(`Total processed: ${total} items`)
})
```

### Pattern 3: Conditional Retry Based on Error Type

```typescript
import { Effect, Schedule, Data } from "effect"

// Define specific error types
class TransientError extends Data.TaggedError("TransientError")<{
  message: string
}> {}

class RateLimitError extends Data.TaggedError("RateLimitError")<{
  retryAfter: number
}> {}

class PermanentError extends Data.TaggedError("PermanentError")<{
  reason: string
}> {}

type ProcessError = TransientError | RateLimitError | PermanentError

// Operation that can fail in different ways
const processRequest = (data: any): Effect.Effect<string, ProcessError> =>
  Effect.gen(function* () {
    const random = Math.random()
    
    if (random < 0.3) {
      yield* Effect.fail(new TransientError({ 
        message: "Temporary network issue" 
      }))
    } else if (random < 0.4) {
      yield* Effect.fail(new RateLimitError({ 
        retryAfter: 5000 
      }))
    } else if (random < 0.5) {
      yield* Effect.fail(new PermanentError({ 
        reason: "Invalid request data" 
      }))
    }
    
    return "Request processed successfully"
  })

// Create conditional retry schedules
const createRetryPolicy = () => {
  // For transient errors: exponential backoff
  const transientSchedule = Schedule.exponential("200 millis").pipe(
    Schedule.compose(Schedule.recurs(3)),
    Schedule.whileInput((error: ProcessError) => 
      error._tag === "TransientError"
    )
  )
  
  // For rate limit errors: respect retry-after header
  const rateLimitSchedule = Schedule.whileInput((error: ProcessError) => 
    error._tag === "RateLimitError"
  ).pipe(
    Schedule.andThen(() => 
      Schedule.fromDelays(Duration.millis(5000))
    )
  )
  
  // Combine schedules
  return Schedule.union(transientSchedule, rateLimitSchedule)
}

// Apply conditional retry
const robustRequestProcessor = (data: any) =>
  processRequest(data).pipe(
    Effect.retry(createRetryPolicy()),
    Effect.catchTag("TransientError", error => 
      Effect.succeed(`Failed after retries: ${error.message}`)
    ),
    Effect.catchTag("RateLimitError", error => 
      Effect.succeed(`Rate limited: retry after ${error.retryAfter}ms`)
    ),
    Effect.catchTag("PermanentError", error => 
      Effect.succeed(`Permanent failure: ${error.reason}`)
    )
  )
```

## Real-World Examples

### Example 1: API Client with Circuit Breaker

A production-ready API client that implements circuit breaker pattern with adaptive retry strategies.

```typescript
import { Effect, Schedule, Ref, Duration, Data, Queue } from "effect"

// Circuit breaker states
type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN"

interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeout: Duration.Duration
  resetTimeout: Duration.Duration
}

// Error types
class ServiceUnavailableError extends Data.TaggedError("ServiceUnavailableError")<{
  service: string
  message: string
}> {}

class CircuitOpenError extends Data.TaggedError("CircuitOpenError")<{
  service: string
  willRetryAt: number
}> {}

// Circuit breaker implementation
class CircuitBreaker {
  private constructor(
    private state: Ref.Ref<CircuitState>,
    private failureCount: Ref.Ref<number>,
    private successCount: Ref.Ref<number>,
    private lastFailureTime: Ref.Ref<number>,
    private config: CircuitBreakerConfig
  ) {}
  
  static make = (config: CircuitBreakerConfig) =>
    Effect.gen(function* () {
      const state = yield* Ref.make<CircuitState>("CLOSED")
      const failureCount = yield* Ref.make(0)
      const successCount = yield* Ref.make(0)
      const lastFailureTime = yield* Ref.make(0)
      
      return new CircuitBreaker(state, failureCount, successCount, lastFailureTime, config)
    })
  
  execute = <A, E>(
    operation: Effect.Effect<A, E>,
    serviceName: string
  ): Effect.Effect<A, E | CircuitOpenError | ServiceUnavailableError> =>
    Effect.gen(function* () {
      const currentState = yield* Ref.get(this.state)
      const now = Date.now()
      
      // Check if circuit should transition from OPEN to HALF_OPEN
      if (currentState === "OPEN") {
        const lastFailure = yield* Ref.get(this.lastFailureTime)
        const resetTimeoutMs = Duration.toMillis(this.config.resetTimeout)
        
        if (now - lastFailure >= resetTimeoutMs) {
          yield* Ref.set(this.state, "HALF_OPEN")
          yield* Ref.set(this.successCount, 0)
          yield* Ref.set(this.failureCount, 0)
        } else {
          yield* Effect.fail(new CircuitOpenError({
            service: serviceName,
            willRetryAt: lastFailure + resetTimeoutMs
          }))
        }
      }
      
      // Execute the operation with timeout
      return yield* operation.pipe(
        Effect.timeout(this.config.timeout),
        Effect.mapError(() => new ServiceUnavailableError({
          service: serviceName,
          message: "Operation timed out"
        })),
        Effect.tap(() => this.onSuccess()),
        Effect.catchAll((error) => 
          Effect.gen(function* () {
            yield* this.onFailure()
            yield* Effect.fail(error)
          }).bind(this)
        )
      )
    })
  
  private onSuccess = () =>
    Effect.gen(function* () {
      const state = yield* Ref.get(this.state)
      
      if (state === "HALF_OPEN") {
        const successCount = yield* Ref.updateAndGet(this.successCount, n => n + 1)
        
        if (successCount >= this.config.successThreshold) {
          yield* Ref.set(this.state, "CLOSED")
          yield* Ref.set(this.failureCount, 0)
        }
      } else if (state === "CLOSED") {
        yield* Ref.set(this.failureCount, 0)
      }
    })
  
  private onFailure = () =>
    Effect.gen(function* () {
      const failureCount = yield* Ref.updateAndGet(this.failureCount, n => n + 1)
      yield* Ref.set(this.lastFailureTime, Date.now())
      
      if (failureCount >= this.config.failureThreshold) {
        yield* Ref.set(this.state, "OPEN")
      }
    })
  
  getState = () => Ref.get(this.state)
}

// API client with circuit breaker and adaptive retry
class ResilientApiClient {
  private constructor(
    private circuitBreaker: CircuitBreaker,
    private baseUrl: string
  ) {}
  
  static make = (baseUrl: string) =>
    Effect.gen(function* () {
      const circuitBreaker = yield* CircuitBreaker.make({
        failureThreshold: 5,
        successThreshold: 2,
        timeout: Duration.seconds(10),
        resetTimeout: Duration.seconds(30)
      })
      
      return new ResilientApiClient(circuitBreaker, baseUrl)
    })
  
  private makeRequest = <T>(
    method: string,
    path: string,
    body?: any
  ): Effect.Effect<T, ServiceUnavailableError> =>
    Effect.gen(function* () {
      // Simulate network request
      yield* Effect.sleep("300 millis")
      
      // Simulate failure rate
      if (Math.random() < 0.2) {
        yield* Effect.fail(new ServiceUnavailableError({
          service: "api",
          message: "Service error"
        }))
      }
      
      return { 
        success: true, 
        data: `Response from ${method} ${path}` 
      } as T
    })
  
  // Create adaptive retry schedule based on circuit state
  private getRetrySchedule = () =>
    Effect.gen(function* () {
      const state = yield* this.circuitBreaker.getState()
      
      switch (state) {
        case "CLOSED":
          // Aggressive retry when circuit is closed
          return Schedule.exponential("100 millis").pipe(
            Schedule.compose(Schedule.recurs(3)),
            Schedule.jittered
          )
        
        case "HALF_OPEN":
          // Conservative retry when testing
          return Schedule.fixed("1 second").pipe(
            Schedule.compose(Schedule.recurs(1))
          )
        
        case "OPEN":
          // No retry when circuit is open
          return Schedule.stop
      }
    })
  
  get = <T>(path: string) =>
    Effect.gen(function* () {
      const retrySchedule = yield* this.getRetrySchedule()
      
      return yield* this.circuitBreaker.execute(
        this.makeRequest<T>("GET", path).pipe(
          Effect.retry(retrySchedule)
        ),
        "api-get"
      )
    })
  
  post = <T>(path: string, data: any) =>
    Effect.gen(function* () {
      const retrySchedule = yield* this.getRetrySchedule()
      
      return yield* this.circuitBreaker.execute(
        this.makeRequest<T>("POST", path, data).pipe(
          Effect.retry(retrySchedule)
        ),
        "api-post"
      )
    })
}

// Usage example
const apiExample = Effect.gen(function* () {
  const client = yield* ResilientApiClient.make("https://api.example.com")
  
  // Make multiple requests
  const requests = Array.from({ length: 20 }, (_, i) =>
    client.get(`/users/${i}`).pipe(
      Effect.catchAll(error => 
        Effect.succeed({ error: error._tag })
      )
    )
  )
  
  const results = yield* Effect.all(requests, { 
    concurrency: 5,
    batching: true 
  })
  
  console.log("Results:", results)
})
```

### Example 2: Rate-Limited Task Queue

A task queue system that processes jobs with rate limiting and backpressure handling.

```typescript
import { Effect, Schedule, Queue, Ref, Fiber, Duration } from "effect"

interface Task<A> {
  id: string
  execute: () => Effect.Effect<A>
  priority: number
  createdAt: number
}

interface QueueConfig {
  maxConcurrency: number
  rateLimit: {
    requests: number
    window: Duration.Duration
  }
  retryPolicy: Schedule.Schedule<number>
}

class RateLimitedQueue<A> {
  private constructor(
    private queue: Queue.Queue<Task<A>>,
    private runningTasks: Ref.Ref<Set<string>>,
    private rateLimiter: RateLimiter,
    private config: QueueConfig
  ) {}
  
  static make = <A>(config: QueueConfig) =>
    Effect.gen(function* () {
      const queue = yield* Queue.unbounded<Task<A>>()
      const runningTasks = yield* Ref.make(new Set<string>())
      const rateLimiter = yield* RateLimiter.make(
        config.rateLimit.requests,
        config.rateLimit.window
      )
      
      const instance = new RateLimitedQueue(
        queue,
        runningTasks,
        rateLimiter,
        config
      )
      
      // Start worker pool
      yield* instance.startWorkers()
      
      return instance
    })
  
  enqueue = (task: Task<A>) =>
    Queue.offer(this.queue, task)
  
  private startWorkers = () =>
    Effect.gen(function* () {
      const workers = Array.from(
        { length: this.config.maxConcurrency },
        (_, i) => this.worker(i)
      )
      
      yield* Effect.all(workers.map(Effect.fork))
    })
  
  private worker = (workerId: number) =>
    Effect.forever(
      Effect.gen(function* () {
        const task = yield* Queue.take(this.queue)
        
        // Wait for rate limit
        yield* this.rateLimiter.acquire()
        
        // Mark task as running
        yield* Ref.update(this.runningTasks, set => 
          new Set(set).add(task.id)
        )
        
        console.log(`Worker ${workerId} processing task ${task.id}`)
        
        // Execute task with retry
        const result = yield* task.execute().pipe(
          Effect.retry(this.config.retryPolicy),
          Effect.either
        )
        
        // Mark task as completed
        yield* Ref.update(this.runningTasks, set => {
          const newSet = new Set(set)
          newSet.delete(task.id)
          return newSet
        })
        
        if (result._tag === "Left") {
          console.error(`Task ${task.id} failed:`, result.left)
        } else {
          console.log(`Task ${task.id} completed successfully`)
        }
      })
    )
  
  getStatus = () =>
    Effect.gen(function* () {
      const queueSize = yield* Queue.size(this.queue)
      const running = yield* Ref.get(this.runningTasks)
      
      return {
        pending: queueSize,
        running: running.size,
        total: queueSize + running.size
      }
    })
}

// Token bucket rate limiter
class RateLimiter {
  private constructor(
    private tokens: Ref.Ref<number>,
    private lastRefill: Ref.Ref<number>,
    private maxTokens: number,
    private refillRate: number,
    private window: Duration.Duration
  ) {}
  
  static make = (requests: number, window: Duration.Duration) =>
    Effect.gen(function* () {
      const tokens = yield* Ref.make(requests)
      const lastRefill = yield* Ref.make(Date.now())
      
      return new RateLimiter(
        tokens,
        lastRefill,
        requests,
        requests / Duration.toMillis(window),
        window
      )
    })
  
  acquire = (): Effect.Effect<void> =>
    Effect.gen(function* () {
      // Refill tokens
      yield* this.refillTokens()
      
      // Try to acquire token
      const acquired = yield* Ref.modify(this.tokens, current => {
        if (current >= 1) {
          return [true, current - 1]
        }
        return [false, current]
      })
      
      if (!acquired) {
        // Wait and retry
        yield* Effect.sleep("100 millis")
        yield* this.acquire()
      }
    })
  
  private refillTokens = () =>
    Effect.gen(function* () {
      const now = Date.now()
      const lastRefill = yield* Ref.get(this.lastRefill)
      const elapsed = now - lastRefill
      
      const tokensToAdd = Math.floor(elapsed * this.refillRate)
      
      if (tokensToAdd > 0) {
        yield* Ref.update(this.tokens, current =>
          Math.min(current + tokensToAdd, this.maxTokens)
        )
        yield* Ref.set(this.lastRefill, now)
      }
    })
}

// Usage example
const queueExample = Effect.gen(function* () {
  const queue = yield* RateLimitedQueue.make<string>({
    maxConcurrency: 3,
    rateLimit: {
      requests: 10,
      window: Duration.seconds(1)
    },
    retryPolicy: Schedule.exponential("100 millis").pipe(
      Schedule.compose(Schedule.recurs(2))
    )
  })
  
  // Enqueue tasks
  const tasks: Task<string>[] = Array.from({ length: 30 }, (_, i) => ({
    id: `task-${i}`,
    execute: () => Effect.gen(function* () {
      yield* Effect.sleep(`${100 + Math.random() * 400} millis`)
      
      // Simulate failures
      if (Math.random() < 0.1) {
        yield* Effect.fail(new Error("Task failed"))
      }
      
      return `Result ${i}`
    }),
    priority: Math.floor(Math.random() * 3),
    createdAt: Date.now()
  }))
  
  // Add tasks to queue
  yield* Effect.all(tasks.map(task => queue.enqueue(task)))
  
  // Monitor queue status
  const monitor = Effect.repeat(
    Effect.gen(function* () {
      const status = yield* queue.getStatus()
      console.log("Queue status:", status)
    }),
    Schedule.fixed("1 second")
  )
  
  const monitorFiber = yield* Effect.fork(monitor)
  
  // Wait for processing
  yield* Effect.sleep("10 seconds")
  
  yield* Fiber.interrupt(monitorFiber)
})
```

### Example 3: Health Check Monitor

A comprehensive health check system that monitors multiple services with different schedules.

```typescript
import { Effect, Schedule, Ref, Duration, Data, HashMap } from "effect"

// Health check types
interface HealthCheckResult {
  service: string
  status: "healthy" | "unhealthy" | "degraded"
  latency: number
  lastCheck: number
  consecutiveFailures: number
  details?: any
}

class HealthCheckError extends Data.TaggedError("HealthCheckError")<{
  service: string
  reason: string
}> {}

interface ServiceConfig {
  name: string
  check: () => Effect.Effect<any, HealthCheckError>
  schedule: Schedule.Schedule<number>
  timeout: Duration.Duration
  degradedThreshold: number
  unhealthyThreshold: number
}

// Health monitor system
class HealthMonitor {
  private constructor(
    private services: HashMap.HashMap<string, ServiceConfig>,
    private results: Ref.Ref<HashMap.HashMap<string, HealthCheckResult>>,
    private subscribers: Ref.Ref<Array<(results: HealthCheckResult[]) => void>>
  ) {}
  
  static make = () =>
    Effect.gen(function* () {
      const services = HashMap.empty<string, ServiceConfig>()
      const results = yield* Ref.make(HashMap.empty<string, HealthCheckResult>())
      const subscribers = yield* Ref.make<Array<(results: HealthCheckResult[]) => void>>([])
      
      return new HealthMonitor(services, results, subscribers)
    })
  
  registerService = (config: ServiceConfig) =>
    Effect.gen(function* () {
      this.services = HashMap.set(this.services, config.name, config)
      
      // Initialize result
      yield* Ref.update(this.results, results =>
        HashMap.set(results, config.name, {
          service: config.name,
          status: "healthy",
          latency: 0,
          lastCheck: Date.now(),
          consecutiveFailures: 0
        })
      )
      
      // Start health check
      yield* Effect.fork(this.runHealthCheck(config))
    })
  
  private runHealthCheck = (config: ServiceConfig) =>
    Effect.gen(function* () {
      const check = Effect.gen(function* () {
        const start = Date.now()
        
        const result = yield* config.check().pipe(
          Effect.timeout(config.timeout),
          Effect.either
        )
        
        const latency = Date.now() - start
        
        yield* this.updateResult(config.name, result, latency)
      })
      
      yield* Effect.repeat(check, config.schedule)
    })
  
  private updateResult = (
    service: string,
    result: Either<HealthCheckError, any>,
    latency: number
  ) =>
    Effect.gen(function* () {
      const config = HashMap.get(this.services, service)
      if (!config) return
      
      yield* Ref.update(this.results, results => {
        const current = HashMap.get(results, service).pipe(
          Option.getOrElse(() => ({
            service,
            status: "healthy" as const,
            latency: 0,
            lastCheck: Date.now(),
            consecutiveFailures: 0
          }))
        )
        
        const updated: HealthCheckResult = {
          ...current,
          latency,
          lastCheck: Date.now()
        }
        
        if (result._tag === "Right") {
          updated.consecutiveFailures = 0
          updated.status = "healthy"
          updated.details = result.right
        } else {
          updated.consecutiveFailures++
          updated.details = { error: result.left.reason }
          
          if (updated.consecutiveFailures >= config.unhealthyThreshold) {
            updated.status = "unhealthy"
          } else if (updated.consecutiveFailures >= config.degradedThreshold) {
            updated.status = "degraded"
          }
        }
        
        return HashMap.set(results, service, updated)
      })
      
      // Notify subscribers
      yield* this.notifySubscribers()
    })
  
  private notifySubscribers = () =>
    Effect.gen(function* () {
      const results = yield* Ref.get(this.results)
      const subscribers = yield* Ref.get(this.subscribers)
      
      const allResults = Array.from(HashMap.values(results))
      
      subscribers.forEach(subscriber => {
        try {
          subscriber(allResults)
        } catch (error) {
          console.error("Subscriber error:", error)
        }
      })
    })
  
  subscribe = (callback: (results: HealthCheckResult[]) => void) =>
    Effect.gen(function* () {
      yield* Ref.update(this.subscribers, subs => [...subs, callback])
      
      // Send initial state
      const results = yield* Ref.get(this.results)
      callback(Array.from(HashMap.values(results)))
      
      // Return unsubscribe function
      return () =>
        Ref.update(this.subscribers, subs =>
          subs.filter(sub => sub !== callback)
        )
    })
  
  getHealth = () =>
    Effect.gen(function* () {
      const results = yield* Ref.get(this.results)
      const allResults = Array.from(HashMap.values(results))
      
      const healthy = allResults.filter(r => r.status === "healthy").length
      const degraded = allResults.filter(r => r.status === "degraded").length
      const unhealthy = allResults.filter(r => r.status === "unhealthy").length
      
      return {
        overall: unhealthy > 0 ? "unhealthy" : degraded > 0 ? "degraded" : "healthy",
        services: {
          total: allResults.length,
          healthy,
          degraded,
          unhealthy
        },
        details: allResults
      }
    })
}

// Usage example
const healthCheckExample = Effect.gen(function* () {
  const monitor = yield* HealthMonitor.make()
  
  // Register services with different check intervals
  yield* monitor.registerService({
    name: "database",
    check: () => Effect.gen(function* () {
      yield* Effect.sleep("50 millis")
      if (Math.random() < 0.1) {
        yield* Effect.fail(new HealthCheckError({
          service: "database",
          reason: "Connection timeout"
        }))
      }
      return { connections: 10, latency: 5 }
    }),
    schedule: Schedule.fixed("5 seconds"),
    timeout: Duration.seconds(2),
    degradedThreshold: 2,
    unhealthyThreshold: 5
  })
  
  yield* monitor.registerService({
    name: "cache",
    check: () => Effect.gen(function* () {
      yield* Effect.sleep("20 millis")
      if (Math.random() < 0.05) {
        yield* Effect.fail(new HealthCheckError({
          service: "cache",
          reason: "Memory pressure"
        }))
      }
      return { hitRate: 0.95, memory: "2GB" }
    }),
    schedule: Schedule.fixed("10 seconds"),
    timeout: Duration.seconds(1),
    degradedThreshold: 1,
    unhealthyThreshold: 3
  })
  
  yield* monitor.registerService({
    name: "api",
    check: () => Effect.gen(function* () {
      yield* Effect.sleep("100 millis")
      if (Math.random() < 0.2) {
        yield* Effect.fail(new HealthCheckError({
          service: "api",
          reason: "High response time"
        }))
      }
      return { avgResponseTime: 100, rpm: 1000 }
    }),
    schedule: Schedule.exponential("2 seconds").pipe(
      Schedule.compose(Schedule.recurs(10))
    ),
    timeout: Duration.seconds(3),
    degradedThreshold: 3,
    unhealthyThreshold: 7
  })
  
  // Subscribe to health updates
  const unsubscribe = yield* monitor.subscribe(results => {
    console.log("\nHealth Update:")
    results.forEach(result => {
      console.log(`  ${result.service}: ${result.status} (latency: ${result.latency}ms)`)
    })
  })
  
  // Run for a while
  yield* Effect.sleep("1 minute")
  
  // Get final health status
  const health = yield* monitor.getHealth()
  console.log("\nFinal Health Status:", health)
  
  // Cleanup
  yield* Effect.sync(unsubscribe)
})
```

## Advanced Features Deep Dive

### Feature 1: Schedule Composition and Combinators

Schedules can be composed in sophisticated ways to create complex retry and repetition patterns.

```typescript
import { Effect, Schedule, Duration } from "effect"

// Union: Use the output of whichever schedule is faster
const unionExample = () => {
  const fastRetry = Schedule.exponential("100 millis").pipe(
    Schedule.compose(Schedule.recurs(3))
  )
  
  const slowRetry = Schedule.spaced("5 seconds").pipe(
    Schedule.compose(Schedule.recurs(2))
  )
  
  // Will use the faster of the two schedules
  const combined = Schedule.union(fastRetry, slowRetry)
  
  return combined
}

// Intersection: Only proceed when both schedules allow
const intersectionExample = () => {
  const businessHours = Schedule.dayOfWeek(1, 5).pipe(
    Schedule.intersect(Schedule.hourOfDay(9, 17))
  )
  
  const rateLimited = Schedule.exponential("1 second")
  
  // Only retry during business hours with rate limiting
  const combined = Schedule.intersect(businessHours, rateLimited)
  
  return combined
}

// Sequential composition: Different phases of retry
const sequentialExample = () => {
  // Phase 1: Quick retries for transient errors
  const quickRetries = Schedule.exponential("50 millis").pipe(
    Schedule.compose(Schedule.recurs(3))
  )
  
  // Phase 2: Slower retries for persistent issues
  const slowRetries = Schedule.spaced("10 seconds").pipe(
    Schedule.compose(Schedule.recurs(2))
  )
  
  // Try quick retries first, then slow retries
  const phased = Schedule.andThen(quickRetries, () => slowRetries)
  
  return phased
}

// Complex composition with conditions
const complexComposition = <E>(isRetryable: (error: E) => boolean) => {
  const transientErrorSchedule = Schedule.exponential("100 millis").pipe(
    Schedule.compose(Schedule.recurs(3)),
    Schedule.jittered,
    Schedule.whileInput((error: E) => isRetryable(error))
  )
  
  const fallbackSchedule = Schedule.spaced("30 seconds").pipe(
    Schedule.compose(Schedule.recurs(2)),
    Schedule.whileInput((error: E) => !isRetryable(error))
  )
  
  return Schedule.union(transientErrorSchedule, fallbackSchedule)
}

// Schedule modifiers
const modifierExamples = () => {
  const base = Schedule.exponential("100 millis")
  
  // Add jitter to prevent thundering herd
  const withJitter = base.pipe(Schedule.jittered)
  
  // Limit total number of recurrences
  const limited = base.pipe(Schedule.compose(Schedule.recurs(5)))
  
  // Add delay between recurrences
  const delayed = base.pipe(Schedule.addDelay(() => Duration.seconds(1)))
  
  // Transform the output
  const mapped = base.pipe(
    Schedule.map((n, duration) => ({
      attempt: n,
      nextDelay: Duration.toMillis(duration)
    }))
  )
  
  // Add side effects
  const withLogging = base.pipe(
    Schedule.tapOutput((attempt, duration) =>
      Effect.sync(() => 
        console.log(`Attempt ${attempt}, next delay: ${Duration.toMillis(duration)}ms`)
      )
    )
  )
  
  return { withJitter, limited, delayed, mapped, withLogging }
}
```

### Feature 2: Custom Schedule Creation

Building custom schedules for specific business requirements.

```typescript
import { Effect, Schedule, Duration, Option } from "effect"

// Fibonacci backoff schedule
const fibonacciSchedule = () => {
  const fibonacci = (n: number): number => {
    if (n <= 1) return n
    return fibonacci(n - 1) + fibonacci(n - 2)
  }
  
  return Schedule.unfold([0, 1], ([prev, curr]) => {
    const next = prev + curr
    const delay = Duration.millis(curr * 100)
    return Option.some([[curr, next], delay])
  })
}

// Business hours schedule with timezone support
const businessHoursSchedule = (timezone: string) => {
  return Schedule.unfold(0, (attempt) => {
    const now = new Date()
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    
    const hour = localTime.getHours()
    const day = localTime.getDay()
    
    const isBusinessHours = hour >= 9 && hour < 17
    const isWeekday = day >= 1 && day <= 5
    
    if (isBusinessHours && isWeekday) {
      // During business hours: retry quickly
      return Option.some([attempt + 1, Duration.seconds(30)])
    } else {
      // Outside business hours: wait until next business day
      const tomorrow = new Date(localTime)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      
      // Skip to Monday if it's weekend
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1)
      }
      
      const waitTime = tomorrow.getTime() - now.getTime()
      return Option.some([attempt + 1, Duration.millis(waitTime)])
    }
  })
}

// Adaptive schedule based on system load
const createAdaptiveSchedule = () => {
  interface ScheduleState {
    attempt: number
    lastDelay: number
    consecutiveSuccesses: number
    consecutiveFailures: number
  }
  
  const getSystemLoad = (): Effect.Effect<number> =>
    Effect.sync(() => {
      // Simulate system load (0-1)
      return Math.random()
    })
  
  return Schedule.unfold<ScheduleState, Duration.Duration>(
    {
      attempt: 0,
      lastDelay: 1000,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0
    },
    (state) =>
      Effect.gen(function* () {
        const load = yield* getSystemLoad()
        
        let nextDelay: number
        
        if (load > 0.8) {
          // High load: back off aggressively
          nextDelay = Math.min(state.lastDelay * 2, 60000)
        } else if (load > 0.5) {
          // Medium load: maintain current delay
          nextDelay = state.lastDelay
        } else {
          // Low load: reduce delay
          nextDelay = Math.max(state.lastDelay * 0.8, 100)
        }
        
        const newState: ScheduleState = {
          attempt: state.attempt + 1,
          lastDelay: nextDelay,
          consecutiveSuccesses: load < 0.5 ? state.consecutiveSuccesses + 1 : 0,
          consecutiveFailures: load > 0.8 ? state.consecutiveFailures + 1 : 0
        }
        
        return Option.some([newState, Duration.millis(nextDelay)])
      }).pipe(Effect.runSync)
  )
}

// Schedule with backoff cap and reset
const createCappedBackoffSchedule = (
  baseDelay: Duration.Duration,
  maxDelay: Duration.Duration,
  resetAfter: Duration.Duration
) => {
  interface BackoffState {
    attempt: number
    lastAttemptTime: number
    currentDelay: number
  }
  
  return Schedule.unfold<BackoffState, Duration.Duration>(
    {
      attempt: 0,
      lastAttemptTime: Date.now(),
      currentDelay: Duration.toMillis(baseDelay)
    },
    (state) => {
      const now = Date.now()
      const timeSinceLastAttempt = now - state.lastAttemptTime
      
      // Reset delay if enough time has passed
      if (timeSinceLastAttempt > Duration.toMillis(resetAfter)) {
        return Option.some([
          {
            attempt: 1,
            lastAttemptTime: now,
            currentDelay: Duration.toMillis(baseDelay)
          },
          baseDelay
        ])
      }
      
      // Calculate next delay with exponential backoff
      const nextDelay = Math.min(
        state.currentDelay * 2,
        Duration.toMillis(maxDelay)
      )
      
      return Option.some([
        {
          attempt: state.attempt + 1,
          lastAttemptTime: now,
          currentDelay: nextDelay
        },
        Duration.millis(nextDelay)
      ])
    }
  )
}
```

### Feature 3: Schedule Monitoring and Telemetry

Adding observability to scheduled operations.

```typescript
import { Effect, Schedule, Ref, Metric, Duration } from "effect"

interface ScheduleMetrics {
  totalAttempts: number
  successCount: number
  failureCount: number
  totalDelayMs: number
  minDelayMs: number
  maxDelayMs: number
  averageDelayMs: number
  lastAttemptTime: number
}

// Create monitored schedule with metrics
const createMonitoredSchedule = <Env, In, Out>(
  baseSchedule: Schedule.Schedule<Env, In, Out>,
  name: string
) =>
  Effect.gen(function* () {
    const metricsRef = yield* Ref.make<ScheduleMetrics>({
      totalAttempts: 0,
      successCount: 0,
      failureCount: 0,
      totalDelayMs: 0,
      minDelayMs: Number.MAX_VALUE,
      maxDelayMs: 0,
      averageDelayMs: 0,
      lastAttemptTime: Date.now()
    })
    
    // Create metrics
    const attemptCounter = Metric.counter(`${name}_schedule_attempts_total`)
    const delayHistogram = Metric.histogram(
      `${name}_schedule_delay_milliseconds`,
      Metric.boundaries([10, 50, 100, 500, 1000, 5000, 10000, 30000])
    )
    
    const monitoredSchedule = baseSchedule.pipe(
      Schedule.tapInput((input: In) =>
        Effect.gen(function* () {
          yield* Metric.increment(attemptCounter)
          yield* Ref.update(metricsRef, m => ({
            ...m,
            totalAttempts: m.totalAttempts + 1,
            lastAttemptTime: Date.now()
          }))
        })
      ),
      Schedule.tapOutput((output: Out, duration: Duration.Duration) =>
        Effect.gen(function* () {
          const delayMs = Duration.toMillis(duration)
          
          yield* Metric.update(delayHistogram, delayMs)
          
          yield* Ref.update(metricsRef, m => ({
            ...m,
            totalDelayMs: m.totalDelayMs + delayMs,
            minDelayMs: Math.min(m.minDelayMs, delayMs),
            maxDelayMs: Math.max(m.maxDelayMs, delayMs),
            averageDelayMs: (m.totalDelayMs + delayMs) / (m.totalAttempts + 1)
          }))
        })
      )
    )
    
    return {
      schedule: monitoredSchedule,
      getMetrics: () => Ref.get(metricsRef),
      recordSuccess: () => 
        Ref.update(metricsRef, m => ({ ...m, successCount: m.successCount + 1 })),
      recordFailure: () =>
        Ref.update(metricsRef, m => ({ ...m, failureCount: m.failureCount + 1 }))
    }
  })

// Schedule with distributed tracing
const createTracedSchedule = <Env, In, Out>(
  baseSchedule: Schedule.Schedule<Env, In, Out>,
  serviceName: string
) => {
  return baseSchedule.pipe(
    Schedule.tapInput((input: In) =>
      Effect.gen(function* () {
        // Start span for retry attempt
        yield* Effect.annotateCurrentSpan("retry.attempt", true)
        yield* Effect.annotateCurrentSpan("retry.service", serviceName)
        yield* Effect.annotateCurrentSpan("retry.input", JSON.stringify(input))
      })
    ),
    Schedule.tapOutput((output: Out, duration: Duration.Duration) =>
      Effect.gen(function* () {
        // Record retry delay
        yield* Effect.annotateCurrentSpan("retry.delay_ms", Duration.toMillis(duration))
        yield* Effect.annotateCurrentSpan("retry.output", JSON.stringify(output))
      })
    )
  )
}

// Usage with monitoring
const monitoredOperation = <A, E>(
  operation: Effect.Effect<A, E>,
  operationName: string
) =>
  Effect.gen(function* () {
    const { schedule, getMetrics, recordSuccess, recordFailure } = 
      yield* createMonitoredSchedule(
        Schedule.exponential("100 millis").pipe(
          Schedule.compose(Schedule.recurs(5))
        ),
        operationName
      )
    
    const result = yield* operation.pipe(
      Effect.tap(() => recordSuccess()),
      Effect.retry(schedule),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* recordFailure()
          const metrics = yield* getMetrics()
          
          console.log(`Operation ${operationName} failed:`, {
            error,
            metrics
          })
          
          yield* Effect.fail(error)
        })
      )
    )
    
    const finalMetrics = yield* getMetrics()
    console.log(`Operation ${operationName} completed:`, finalMetrics)
    
    return result
  })
```

## Practical Patterns & Best Practices

### Pattern 1: Retry Strategies by Error Type

```typescript
import { Effect, Schedule, Data, Duration } from "effect"

// Error classification
abstract class ApiError extends Data.TaggedError("ApiError")<{
  code: string
  message: string
  retryable: boolean
  retryAfter?: number
}> {
  static isRetryable = (error: ApiError): boolean => error.retryable
  
  static getRetryDelay = (error: ApiError): Duration.Duration | null =>
    error.retryAfter ? Duration.millis(error.retryAfter) : null
}

class RateLimitError extends ApiError {
  readonly _tag = "RateLimitError"
  readonly retryable = true
}

class ServerError extends ApiError {
  readonly _tag = "ServerError"
  readonly retryable = true
}

class ClientError extends ApiError {
  readonly _tag = "ClientError"
  readonly retryable = false
}

// Smart retry strategy
const createSmartRetryStrategy = () => {
  const rateLimitSchedule = Schedule.whileInput((error: ApiError) =>
    error._tag === "RateLimitError"
  ).pipe(
    Schedule.andThen(() =>
      Schedule.fromFunction<ApiError, Duration.Duration>((error) => {
        const delay = ApiError.getRetryDelay(error)
        return delay || Duration.seconds(60)
      })
    )
  )
  
  const serverErrorSchedule = Schedule.whileInput((error: ApiError) =>
    error._tag === "ServerError"
  ).pipe(
    Schedule.andThen(() =>
      Schedule.exponential("1 second").pipe(
        Schedule.compose(Schedule.recurs(5)),
        Schedule.jittered
      )
    )
  )
  
  const clientErrorSchedule = Schedule.whileInput((error: ApiError) =>
    error._tag === "ClientError"
  ).pipe(
    Schedule.andThen(() => Schedule.stop)
  )
  
  return Schedule.union(
    rateLimitSchedule,
    Schedule.union(serverErrorSchedule, clientErrorSchedule)
  )
}
```

### Pattern 2: Coordinated Scheduling

```typescript
import { Effect, Schedule, Ref, Fiber, Deferred } from "effect"

class ScheduleCoordinator {
  private constructor(
    private activeSchedules: Ref.Ref<Map<string, Fiber.RuntimeFiber<any, any>>>
  ) {}
  
  static make = () =>
    Effect.gen(function* () {
      const activeSchedules = yield* Ref.make(new Map<string, Fiber.RuntimeFiber<any, any>>())
      return new ScheduleCoordinator(activeSchedules)
    })
  
  schedule = <A>(
    name: string,
    operation: Effect.Effect<A>,
    schedule: Schedule.Schedule<any>
  ) =>
    Effect.gen(function* () {
      // Cancel existing schedule with same name
      yield* this.cancel(name)
      
      const fiber = yield* Effect.fork(
        Effect.repeat(operation, schedule).pipe(
          Effect.ensuring(
            Ref.update(this.activeSchedules, map => {
              const newMap = new Map(map)
              newMap.delete(name)
              return newMap
            })
          )
        )
      )
      
      yield* Ref.update(this.activeSchedules, map =>
        new Map(map).set(name, fiber)
      )
      
      return fiber
    })
  
  cancel = (name: string) =>
    Effect.gen(function* () {
      const schedules = yield* Ref.get(this.activeSchedules)
      const fiber = schedules.get(name)
      
      if (fiber) {
        yield* Fiber.interrupt(fiber)
      }
    })
  
  cancelAll = () =>
    Effect.gen(function* () {
      const schedules = yield* Ref.get(this.activeSchedules)
      yield* Effect.all(
        Array.from(schedules.values()).map(Fiber.interrupt),
        { discard: true }
      )
      yield* Ref.set(this.activeSchedules, new Map())
    })
}
```

### Pattern 3: Testing Schedules

```typescript
import { Effect, Schedule, TestClock, TestContext, Duration } from "effect"
import { describe, it, expect } from "@effect/vitest"

describe("Schedule Testing", () => {
  it("should test exponential backoff", () =>
    Effect.gen(function* () {
      let attempts = 0
      const operation = Effect.gen(function* () {
        attempts++
        if (attempts < 3) {
          yield* Effect.fail(new Error("Retry me"))
        }
        return "success"
      })
      
      const schedule = Schedule.exponential("100 millis").pipe(
        Schedule.compose(Schedule.recurs(5))
      )
      
      const fiber = yield* Effect.fork(
        operation.pipe(Effect.retry(schedule))
      )
      
      // Advance time to trigger retries
      yield* TestClock.adjust("100 millis") // First retry
      yield* TestClock.adjust("200 millis") // Second retry
      
      const result = yield* Fiber.join(fiber)
      
      expect(result).toBe("success")
      expect(attempts).toBe(3)
    }).pipe(Effect.provide(TestContext.TestContext))
  )
  
  it("should test schedule composition", () =>
    Effect.gen(function* () {
      const schedule1 = Schedule.recurs(3)
      const schedule2 = Schedule.spaced("100 millis")
      const composed = Schedule.intersect(schedule1, schedule2)
      
      const delays: number[] = []
      const testSchedule = composed.pipe(
        Schedule.tapOutput((_, duration) =>
          Effect.sync(() => {
            delays.push(Duration.toMillis(duration))
          })
        )
      )
      
      yield* Effect.repeat(Effect.succeed("test"), testSchedule)
      
      expect(delays.length).toBe(3)
      expect(delays.every(d => d >= 100)).toBe(true)
    }).pipe(Effect.provide(TestContext.TestContext))
  )
})
```

## Integration Examples

### Integration with Node.js Timers

```typescript
import { Effect, Schedule, Duration, Fiber } from "effect"

// Convert Node.js interval to Effect Schedule
const fromNodeInterval = (intervalMs: number) =>
  Schedule.fixed(Duration.millis(intervalMs))

// Bridge existing timer-based code
const migrateFromSetInterval = (
  callback: () => void | Promise<void>,
  intervalMs: number
) => {
  const effect = Effect.gen(function* () {
    try {
      const result = callback()
      if (result instanceof Promise) {
        yield* Effect.promise(() => result)
      }
    } catch (error) {
      yield* Effect.fail(error)
    }
  })
  
  return Effect.repeat(
    effect.pipe(
      Effect.catchAll(error =>
        Effect.logError(`Timer callback failed: ${error}`)
      )
    ),
    Schedule.fixed(Duration.millis(intervalMs))
  )
}

// Graceful timer management
class TimerManager {
  private timers = new Map<string, Fiber.RuntimeFiber<any, any>>()
  
  setInterval = (
    name: string,
    effect: Effect.Effect<any>,
    schedule: Schedule.Schedule<any>
  ) =>
    Effect.gen(function* () {
      yield* this.clearInterval(name)
      
      const fiber = yield* Effect.fork(
        Effect.repeat(effect, schedule)
      )
      
      this.timers.set(name, fiber)
      return fiber
    })
  
  clearInterval = (name: string) =>
    Effect.gen(function* () {
      const fiber = this.timers.get(name)
      if (fiber) {
        yield* Fiber.interrupt(fiber)
        this.timers.delete(name)
      }
    })
  
  clearAll = () =>
    Effect.gen(function* () {
      yield* Effect.all(
        Array.from(this.timers.values()).map(Fiber.interrupt),
        { discard: true }
      )
      this.timers.clear()
    })
}
```

### Integration with External Schedulers

```typescript
import { Effect, Schedule, Duration } from "effect"
import * as cron from "node-cron"

// Convert cron expression to Effect Schedule
const fromCronExpression = (expression: string) => {
  const task = cron.schedule(expression, () => {}, { scheduled: false })
  
  return Schedule.unfold(0, (attempt) =>
    Effect.gen(function* () {
      const now = new Date()
      const nextRun = task.nextDates(1)[0]
      
      if (!nextRun) {
        return Option.none()
      }
      
      const delay = nextRun.getTime() - now.getTime()
      return Option.some([attempt + 1, Duration.millis(delay)])
    }).pipe(Effect.runSync)
  )
}

// Cron-like scheduling with Effect
const cronSchedule = (pattern: {
  minute?: number
  hour?: number
  dayOfMonth?: number
  month?: number
  dayOfWeek?: number
}) => {
  return Schedule.unfold(0, (attempt) => {
    const now = new Date()
    const next = new Date(now)
    
    // Calculate next run time based on pattern
    if (pattern.minute !== undefined) {
      next.setMinutes(pattern.minute)
      if (next <= now) next.setHours(next.getHours() + 1)
    }
    
    if (pattern.hour !== undefined) {
      next.setHours(pattern.hour)
      if (next <= now) next.setDate(next.getDate() + 1)
    }
    
    const delay = next.getTime() - now.getTime()
    return Option.some([attempt + 1, Duration.millis(delay)])
  })
}
```

Schedule provides powerful, composable patterns for handling retries, repetition, and time-based operations in Effect applications. By embracing declarative scheduling, you get testable, predictable, and maintainable timing logic that integrates seamlessly with the Effect ecosystem.

Key takeaways:
- **Composable Building Blocks**: Build complex retry logic from simple schedules
- **Type-Safe Integration**: Full TypeScript support with proper error handling
- **Testing Support**: Virtual time makes testing deterministic
- **Resource Efficiency**: Automatic cleanup and optimal performance
- **Real-World Ready**: Production patterns for common scenarios

Use Schedule when you need sophisticated retry logic, periodic task execution, rate limiting, or any time-based operation that goes beyond simple timeouts.