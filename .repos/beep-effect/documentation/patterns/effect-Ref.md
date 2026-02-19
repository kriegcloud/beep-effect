# Ref: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Ref Solves

Managing mutable state in concurrent applications is fraught with challenges. Traditional approaches using global variables or shared objects lead to race conditions, inconsistent state, and unpredictable behavior:

```typescript
// Traditional approach - shared mutable state
let requestCount = 0;
let activeConnections = new Set<string>();
let cacheMap = new Map<string, any>();

async function handleRequest(connectionId: string) {
  // Race condition: multiple requests can increment simultaneously
  requestCount++;
  
  // Not atomic: another request might modify between check and add
  if (!activeConnections.has(connectionId)) {
    activeConnections.add(connectionId);
  }
  
  // Cache updates are not thread-safe
  const cached = cacheMap.get('user-data');
  if (!cached) {
    const data = await fetchUserData();
    cacheMap.set('user-data', data); // Another request might have set this
  }
  
  // Cleanup has same race condition
  activeConnections.delete(connectionId);
  requestCount--;
}

// Concurrent requests lead to:
Promise.all([
  handleRequest('conn-1'),
  handleRequest('conn-2'),
  handleRequest('conn-3')
]);
// requestCount might be wrong, activeConnections might be inconsistent
```

This approach leads to:
- **Race Conditions** - Multiple operations modify shared state simultaneously
- **Inconsistent State** - State changes are not atomic, leading to partial updates
- **Hard to Debug** - Non-deterministic behavior makes issues difficult to reproduce
- **No Concurrency Safety** - Manual synchronization is error-prone and complex

### The Ref Solution

Ref provides thread-safe, atomic mutable references that ensure consistent state across concurrent operations:

```typescript
import { Effect, Ref } from "effect";

const makeRequestHandler = Effect.gen(function* () {
  const requestCountRef = yield* Ref.make(0);
  const activeConnectionsRef = yield* Ref.make(new Set<string>());
  const cacheRef = yield* Ref.make(new Map<string, any>());
  
  const handleRequest = (connectionId: string) => Effect.gen(function* () {
    // Atomic increment
    yield* Ref.update(requestCountRef, count => count + 1);
    
    // Atomic set operations
    yield* Ref.update(activeConnectionsRef, connections => {
      const newConnections = new Set(connections);
      newConnections.add(connectionId);
      return newConnections;
    });
    
    // Atomic cache check and update
    const data = yield* Ref.modify(cacheRef, cache => {
      const cached = cache.get('user-data');
      if (cached) {
        return [cached, cache]; // Return cached data, no state change
      }
      // Cache miss - we'll fetch and update atomically later
      return [null, cache];
    }).pipe(
      Effect.flatMap(cached => 
        cached 
          ? Effect.succeed(cached)
          : Effect.gen(function* () {
              const freshData = yield* fetchUserDataEffect();
              yield* Ref.update(cacheRef, cache => {
                const newCache = new Map(cache);
                newCache.set('user-data', freshData);
                return newCache;
              });
              return freshData;
            })
      )
    );
    
    // Cleanup is atomic
    yield* Ref.update(activeConnectionsRef, connections => {
      const newConnections = new Set(connections);
      newConnections.delete(connectionId);
      return newConnections;
    });
    
    yield* Ref.update(requestCountRef, count => count - 1);
    
    return data;
  });
  
  return { handleRequest, requestCountRef, activeConnectionsRef };
});
```

### Key Concepts

**Atomic Operations**: All Ref operations are atomic - they complete entirely or not at all, preventing partial state updates.

**Concurrency Safety**: Multiple concurrent operations on the same Ref are automatically serialized, ensuring consistency.

**Functional Updates**: State changes use pure functions, making updates predictable and testable.

## Basic Usage Patterns

### Creating and Reading Refs

```typescript
import { Effect, Ref } from "effect";

// Create a Ref with an initial value
const program = Effect.gen(function* () {
  const counterRef = yield* Ref.make(0);
  const nameRef = yield* Ref.make("Initial");
  const listRef = yield* Ref.make<string[]>([]);
  
  // Read current values
  const count = yield* Ref.get(counterRef);
  const name = yield* counterRef; // Ref implements Readable
  
  console.log(`Count: ${count}, Name: ${name}`);
});
```

### Basic Updates

```typescript
const basicUpdates = Effect.gen(function* () {
  const ref = yield* Ref.make(10);
  
  // Set a new value
  yield* Ref.set(ref, 20);
  
  // Update with a function
  yield* Ref.update(ref, n => n * 2);
  
  // Get the updated value
  const result = yield* Ref.get(ref);
  console.log(result); // 40
});
```

### Atomic Get-and-Update Operations

```typescript
const atomicOperations = Effect.gen(function* () {
  const ref = yield* Ref.make(5);
  
  // Get old value and set new one atomically
  const oldValue = yield* Ref.getAndSet(ref, 15);
  
  // Get old value and update atomically
  const previousValue = yield* Ref.getAndUpdate(ref, n => n + 5);
  
  // Update and get new value atomically
  const newValue = yield* Ref.updateAndGet(ref, n => n * 2);
  
  console.log({ oldValue, previousValue, newValue }); // { 5, 15, 40 }
});
```

## Real-World Examples

### Example 1: Request Rate Limiter

A practical rate limiter that tracks requests per time window:

```typescript
import { Effect, Ref, Clock, Duration } from "effect";

interface RateLimiterState {
  readonly requests: Array<{ timestamp: number; clientId: string }>;
  readonly windowStart: number;
}

const makeRateLimiter = (maxRequests: number, windowMs: number) => Effect.gen(function* () {
  const stateRef = yield* Ref.make<RateLimiterState>({
    requests: [],
    windowStart: Date.now()
  });
  
  const checkRate = (clientId: string) => Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    
    const allowed = yield* Ref.modify(stateRef, state => {
      const windowStart = now - windowMs;
      
      // Clean old requests outside current window
      const currentRequests = state.requests.filter(req => req.timestamp >= windowStart);
      
      // Count requests for this client in current window
      const clientRequests = currentRequests.filter(req => req.clientId === clientId);
      
      if (clientRequests.length >= maxRequests) {
        // Rate limit exceeded - return current state unchanged
        return [false, { ...state, requests: currentRequests }];
      }
      
      // Allow request - add to tracking
      const newRequest = { timestamp: now, clientId };
      return [true, {
        requests: [...currentRequests, newRequest],
        windowStart: windowStart
      }];
    });
    
    return allowed;
  });
  
  const getStats = Effect.gen(function* () {
    const state = yield* Ref.get(stateRef);
    const now = yield* Clock.currentTimeMillis;
    const windowStart = now - windowMs;
    const activeRequests = state.requests.filter(req => req.timestamp >= windowStart);
    
    return {
      totalRequests: activeRequests.length,
      uniqueClients: new Set(activeRequests.map(r => r.clientId)).size,
      remainingCapacity: maxRequests - activeRequests.length
    };
  });
  
  return { checkRate, getStats };
});

// Usage
const rateLimiterProgram = Effect.gen(function* () {
  const limiter = yield* makeRateLimiter(100, 60000); // 100 requests per minute
  
  // Check if client can make request
  const allowed = yield* limiter.checkRate("client-123");
  
  if (allowed) {
    console.log("Request allowed");
    // Process the request
  } else {
    console.log("Rate limit exceeded");
  }
  
  const stats = yield* limiter.getStats();
  console.log("Rate limiter stats:", stats);
});
```

### Example 2: Connection Pool Manager

A robust connection pool that manages database connections safely:

```typescript
import { Effect, Ref, Queue, Duration } from "effect";

interface Connection {
  readonly id: string;
  readonly createdAt: number;
  readonly lastUsed: number;
  close(): Effect.Effect<void>;
}

interface PoolState {
  readonly available: Connection[];
  readonly inUse: Set<string>;
  readonly totalConnections: number;
}

const makeConnectionPool = (maxConnections: number, maxIdleTime: number) => Effect.gen(function* () {
  const stateRef = yield* Ref.make<PoolState>({
    available: [],
    inUse: new Set(),
    totalConnections: 0
  });
  
  const createConnection = Effect.gen(function* () {
    const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = yield* Clock.currentTimeMillis;
    
    // Simulate connection creation
    yield* Effect.sleep(Duration.millis(100));
    
    return {
      id,
      createdAt: now,
      lastUsed: now,
      close: () => Effect.gen(function* () {
        console.log(`Closing connection ${id}`);
        yield* Effect.sleep(Duration.millis(50));
      })
    };
  });
  
  const acquire = Effect.gen(function* () {
    const connection = yield* Ref.modify(stateRef, state => {
      // Try to reuse available connection
      if (state.available.length > 0) {
        const [conn, ...rest] = state.available;
        const newInUse = new Set(state.inUse).add(conn.id);
        
        return [conn, {
          available: rest,
          inUse: newInUse,
          totalConnections: state.totalConnections
        }];
      }
      
      // No available connections - need to create new one
      return [null, state];
    });
    
    if (connection) {
      return connection;
    }
    
    // Check if we can create new connection
    const canCreate = yield* Ref.modify(stateRef, state => {
      if (state.totalConnections >= maxConnections) {
        return [false, state]; // Pool exhausted
      }
      
      return [true, {
        ...state,
        totalConnections: state.totalConnections + 1
      }];
    });
    
    if (!canCreate) {
      return yield* Effect.fail(new Error("Connection pool exhausted"));
    }
    
    // Create new connection
    const newConnection = yield* createConnection;
    
    // Add to in-use set
    yield* Ref.update(stateRef, state => ({
      ...state,
      inUse: new Set(state.inUse).add(newConnection.id)
    }));
    
    return newConnection;
  });
  
  const release = (connection: Connection) => Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    const updatedConnection = { ...connection, lastUsed: now };
    
    yield* Ref.update(stateRef, state => {
      const newInUse = new Set(state.inUse);
      newInUse.delete(connection.id);
      
      return {
        available: [...state.available, updatedConnection],
        inUse: newInUse,
        totalConnections: state.totalConnections
      };
    });
  });
  
  const cleanup = Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    
    const toClose = yield* Ref.modify(stateRef, state => {
      const cutoff = now - maxIdleTime;
      const active = state.available.filter(conn => conn.lastUsed >= cutoff);
      const idle = state.available.filter(conn => conn.lastUsed < cutoff);
      
      return [idle, {
        available: active,
        inUse: state.inUse,
        totalConnections: state.totalConnections - idle.length
      }];
    });
    
    // Close idle connections
    yield* Effect.all(toClose.map(conn => conn.close()), { concurrency: "unbounded" });
    
    return toClose.length;
  });
  
  const getStats = Ref.get(stateRef).pipe(
    Effect.map(state => ({
      available: state.available.length,
      inUse: state.inUse.size,
      total: state.totalConnections
    }))
  );
  
  return { acquire, release, cleanup, getStats };
});

// Usage with automatic resource management
const poolProgram = Effect.gen(function* () {
  const pool = yield* makeConnectionPool(10, 300000); // 10 max, 5min idle timeout
  
  // Use connection with automatic cleanup
  yield* Effect.acquireUseRelease(
    pool.acquire,
    (connection) => Effect.gen(function* () {
      console.log(`Using connection ${connection.id}`);
      // Simulate database work
      yield* Effect.sleep(Duration.millis(1000));
      return "query result";
    }),
    pool.release
  );
  
  const stats = yield* pool.getStats;
  console.log("Pool stats:", stats);
});
```

### Example 3: Application Metrics Collector

A metrics system that safely aggregates application performance data:

```typescript
import { Effect, Ref, Duration, Clock } from "effect";

interface MetricData {
  readonly count: number;
  readonly sum: number;
  readonly min: number;
  readonly max: number;
  readonly histogram: Map<string, number>; // bucket -> count
}

interface MetricsStore {
  readonly counters: Map<string, number>;
  readonly gauges: Map<string, number>;
  readonly histograms: Map<string, MetricData>;
  readonly lastReset: number;
}

const makeMetricsCollector = Effect.gen(function* () {
  const storeRef = yield* Ref.make<MetricsStore>({
    counters: new Map(),
    gauges: new Map(),
    histograms: new Map(),
    lastReset: Date.now()
  });
  
  const incrementCounter = (name: string, value: number = 1) =>
    Ref.update(storeRef, store => ({
      ...store,
      counters: new Map(store.counters).set(name, (store.counters.get(name) || 0) + value)
    }));
  
  const setGauge = (name: string, value: number) =>
    Ref.update(storeRef, store => ({
      ...store,
      gauges: new Map(store.gauges).set(name, value)
    }));
  
  const recordHistogram = (name: string, value: number) => Effect.gen(function* () {
    // Define histogram buckets (e.g., for response times)
    const buckets = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    const bucket = buckets.find(b => value <= b)?.toString() || "inf";
    
    yield* Ref.update(storeRef, store => {
      const current = store.histograms.get(name) || {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        histogram: new Map()
      };
      
      const newHistogram = new Map(current.histogram);
      newHistogram.set(bucket, (newHistogram.get(bucket) || 0) + 1);
      
      const updated: MetricData = {
        count: current.count + 1,
        sum: current.sum + value,
        min: Math.min(current.min, value),
        max: Math.max(current.max, value),
        histogram: newHistogram
      };
      
      return {
        ...store,
        histograms: new Map(store.histograms).set(name, updated)
      };
    });
  });
  
  const getSnapshot = Effect.gen(function* () {
    const store = yield* Ref.get(storeRef);
    const now = yield* Clock.currentTimeMillis;
    
    return {
      timestamp: now,
      uptime: now - store.lastReset,
      counters: Object.fromEntries(store.counters.entries()),
      gauges: Object.fromEntries(store.gauges.entries()),
      histograms: Object.fromEntries(
        Array.from(store.histograms.entries()).map(([name, data]) => [
          name,
          {
            count: data.count,
            sum: data.sum,
            min: data.min === Infinity ? 0 : data.min,
            max: data.max === -Infinity ? 0 : data.max,
            avg: data.count > 0 ? data.sum / data.count : 0,
            histogram: Object.fromEntries(data.histogram.entries())
          }
        ])
      )
    };
  });
  
  const reset = Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    yield* Ref.set(storeRef, {
      counters: new Map(),
      gauges: new Map(),
      histograms: new Map(),
      lastReset: now
    });
  });
  
  // Helper for timing operations
  const timeOperation = <A, E, R>(name: string, operation: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const start = yield* Clock.currentTimeMillis;
      
      const result = yield* operation.pipe(
        Effect.tap(() => incrementCounter(`${name}.success`)),
        Effect.tapError(() => incrementCounter(`${name}.error`))
      );
      
      const end = yield* Clock.currentTimeMillis;
      yield* recordHistogram(`${name}.duration`, end - start);
      
      return result;
    });
  
  return {
    incrementCounter,
    setGauge,
    recordHistogram,
    getSnapshot,
    reset,
    timeOperation
  };
});

// Usage in application
const metricsProgram = Effect.gen(function* () {
  const metrics = yield* makeMetricsCollector;
  
  // Track application metrics
  yield* metrics.incrementCounter("requests.total");
  yield* metrics.setGauge("memory.usage", 85.5);
  
  // Time an operation
  const result = yield* metrics.timeOperation("database.query", 
    Effect.gen(function* () {
      yield* Effect.sleep(Duration.millis(150));
      return "query result";
    })
  );
  
  // Get current metrics
  const snapshot = yield* metrics.getSnapshot;
  console.log("Metrics snapshot:", JSON.stringify(snapshot, null, 2));
  
  return result;
});
```

## Advanced Features Deep Dive

### Conditional Updates with updateSome

The `updateSome` family of functions allows you to update Refs only when certain conditions are met:

```typescript
import { Effect, Ref, Option } from "effect";

interface ApplicationState {
  readonly status: "starting" | "running" | "stopping" | "stopped";
  readonly connections: number;
  readonly lastHealthCheck: number;
}

const conditionalUpdates = Effect.gen(function* () {
  const appStateRef = yield* Ref.make<ApplicationState>({
    status: "starting",
    connections: 0,
    lastHealthCheck: Date.now()
  });
  
  // Only update if in valid transition state
  const tryStartApplication = Ref.updateSome(appStateRef, state => 
    state.status === "starting" 
      ? Option.some({ ...state, status: "running" as const })
      : Option.none()
  );
  
  // Only increment connections if app is running
  const tryAddConnection = Ref.getAndUpdateSome(appStateRef, state =>
    state.status === "running"
      ? Option.some({ ...state, connections: state.connections + 1 })
      : Option.none()
  );
  
  // Conditional state transitions with return values
  const transitionToStopping = Ref.modifySome(
    appStateRef,
    "invalid-transition", // fallback value
    state => {
      if (state.status === "running" || state.status === "starting") {
        return Option.some([state.connections, { ...state, status: "stopping" as const }]);
      }
      return Option.none();
    }
  );
  
  yield* tryStartApplication;
  const previousConnections = yield* tryAddConnection;
  const connectionsAtStop = yield* transitionToStopping;
  
  console.log({ previousConnections, connectionsAtStop });
});
```

### Advanced Atomic Operations with modify

The `modify` function is the most powerful Ref operation, allowing you to atomically compute a return value while updating state:

```typescript
interface Cache<K, V> {
  readonly data: Map<K, V>;
  readonly hits: number;
  readonly misses: number;
  readonly maxSize: number;
}

const makeLRUCache = <K, V>(maxSize: number) => Effect.gen(function* () {
  const cacheRef = yield* Ref.make<Cache<K, V>>({
    data: new Map(),
    hits: 0,
    misses: 0,
    maxSize
  });
  
  // Atomic get with statistics tracking
  const get = (key: K) => Ref.modify(cacheRef, cache => {
    const value = cache.data.get(key);
    
    if (value !== undefined) {
      // Cache hit - move to end (LRU)
      const newData = new Map(cache.data);
      newData.delete(key);
      newData.set(key, value);
      
      return [Option.some(value), {
        ...cache,
        data: newData,
        hits: cache.hits + 1
      }];
    }
    
    // Cache miss
    return [Option.none(), {
      ...cache,
      misses: cache.misses + 1
    }];
  });
  
  // Atomic put with LRU eviction
  const put = (key: K, value: V) => Ref.modify(cacheRef, cache => {
    const newData = new Map(cache.data);
    
    // Remove if already exists (will re-add at end)
    if (newData.has(key)) {
      newData.delete(key);
    }
    
    // Add new entry
    newData.set(key, value);
    
    // Evict oldest if over capacity
    let evicted: Option.Option<[K, V]> = Option.none();
    if (newData.size > cache.maxSize) {
      const firstEntry = newData.entries().next().value;
      if (firstEntry) {
        newData.delete(firstEntry[0]);
        evicted = Option.some(firstEntry);
      }
    }
    
    return [evicted, {
      ...cache,
      data: newData
    }];
  });
  
  // Atomic statistics retrieval
  const getStats = Ref.get(cacheRef).pipe(
    Effect.map(cache => ({
      size: cache.data.size,
      hits: cache.hits,
      misses: cache.misses,
      hitRate: cache.hits + cache.misses > 0 
        ? cache.hits / (cache.hits + cache.misses) 
        : 0
    }))
  );
  
  return { get, put, getStats };
});
```

### Composition and State Machines

Refs excel at implementing complex state machines with atomic transitions:

```typescript
interface WorkflowState {
  readonly stage: "created" | "validated" | "processing" | "completed" | "failed";
  readonly data: any;
  readonly errors: string[];
  readonly attempts: number;
  readonly maxRetries: number;
}

const makeWorkflowManager = Effect.gen(function* () {
  const workflowRef = yield* Ref.make<WorkflowState>({
    stage: "created",
    data: null,
    errors: [],
    attempts: 0,
    maxRetries: 3
  });
  
  // Complex state transition with validation
  const processWorkflow = (inputData: any) => Effect.gen(function* () {
    // Attempt to start processing
    const canProcess = yield* Ref.modify(workflowRef, state => {
      if (state.stage !== "created" && state.stage !== "failed") {
        return [false, state]; // Already processing or completed
      }
      
      if (state.attempts >= state.maxRetries) {
        return [false, state]; // Max retries exceeded
      }
      
      return [true, {
        ...state,
        stage: "processing" as const,
        data: inputData,
        attempts: state.attempts + 1
      }];
    });
    
    if (!canProcess) {
      return yield* Effect.fail(new Error("Cannot process workflow"));
    }
    
    // Simulate processing
    const result = yield* Effect.gen(function* () {
      yield* Effect.sleep(Duration.millis(1000));
      
      // Simulate random failure
      if (Math.random() < 0.3) {
        return yield* Effect.fail(new Error("Processing failed"));
      }
      
      return { processedData: inputData, timestamp: Date.now() };
    }).pipe(
      Effect.catchAll(error => 
        Ref.update(workflowRef, state => ({
          ...state,
          stage: "failed" as const,
          errors: [...state.errors, error.message]
        })).pipe(
          Effect.andThen(Effect.fail(error))
        )
      )
    );
    
    // Mark as completed
    yield* Ref.update(workflowRef, state => ({
      ...state,
      stage: "completed" as const,
      data: result
    }));
    
    return result;
  });
  
  const getWorkflowStatus = Ref.get(workflowRef);
  
  const resetWorkflow = Ref.set(workflowRef, {
    stage: "created",
    data: null,
    errors: [],
    attempts: 0,
    maxRetries: 3
  });
  
  return { processWorkflow, getWorkflowStatus, resetWorkflow };
});
```

## Practical Patterns & Best Practices

### Pattern 1: Safe Resource Counters

When tracking limited resources, use atomic operations to prevent over-allocation:

```typescript
const makeSemaphore = (permits: number) => Effect.gen(function* () {
  const permitRef = yield* Ref.make(permits);
  
  const acquire = Ref.modify(permitRef, current => 
    current > 0 
      ? [true, current - 1]
      : [false, current]
  );
  
  const release = Ref.update(permitRef, current => 
    Math.min(current + 1, permits)
  );
  
  const withPermit = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const acquired = yield* acquire;
      if (!acquired) {
        return yield* Effect.fail(new Error("No permits available"));
      }
      
      const result = yield* Effect.ensuring(effect, release);
      return result;
    });
  
  return { acquire, release, withPermit };
});
```

### Pattern 2: Event Sourcing with Refs

Use Refs to implement event sourcing patterns with atomic event processing:

```typescript
interface Event {
  readonly id: string;
  readonly type: string;
  readonly payload: any;
  readonly timestamp: number;
}

interface EventStore {
  readonly events: Event[];
  readonly snapshots: Map<string, any>;
  readonly version: number;
}

const makeEventStore = Effect.gen(function* () {
  const storeRef = yield* Ref.make<EventStore>({
    events: [],
    snapshots: new Map(),
    version: 0
  });
  
  const appendEvent = (event: Omit<Event, 'id' | 'timestamp'>) => 
    Ref.modify(storeRef, store => {
      const newEvent: Event = {
        ...event,
        id: `event_${store.version + 1}`,
        timestamp: Date.now()
      };
      
      return [newEvent, {
        events: [...store.events, newEvent],
        snapshots: store.snapshots,
        version: store.version + 1
      }];
    });
  
  const createSnapshot = (aggregateId: string, state: any) =>
    Ref.update(storeRef, store => ({
      ...store,
      snapshots: new Map(store.snapshots).set(aggregateId, {
        state,
        version: store.version,
        timestamp: Date.now()
      })
    }));
  
  return { appendEvent, createSnapshot, storeRef };
});
```

### Pattern 3: Circuit Breaker Implementation

Implement circuit breaker patterns using Refs for failure tracking:

```typescript
interface CircuitState {
  readonly status: "closed" | "open" | "half-open";
  readonly failures: number;
  readonly lastFailureTime: number;
  readonly successCount: number;
}

const makeCircuitBreaker = (
  failureThreshold: number,
  recoveryTimeoutMs: number,
  successThreshold: number = 1
) => Effect.gen(function* () {
  const stateRef = yield* Ref.make<CircuitState>({
    status: "closed",
    failures: 0,
    lastFailureTime: 0,
    successCount: 0
  });
  
  const execute = <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.gen(function* () {
    // Check current state and decide if we can execute
    const canExecute = yield* Ref.modify(stateRef, state => {
      const now = Date.now();
      
      switch (state.status) {
        case "closed":
          return [true, state];
          
        case "open":
          if (now - state.lastFailureTime >= recoveryTimeoutMs) {
            // Transition to half-open
            return [true, { ...state, status: "half-open", successCount: 0 }];
          }
          return [false, state];
          
        case "half-open":
          return [true, state];
      }
    });
    
    if (!canExecute) {
      return yield* Effect.fail(new Error("Circuit breaker is open"));
    }
    
    // Execute the effect and handle result
    const result = yield* effect.pipe(
      Effect.tap(() => 
        // Success - update state
        Ref.update(stateRef, state => {
          if (state.status === "half-open") {
            const newSuccessCount = state.successCount + 1;
            if (newSuccessCount >= successThreshold) {
              // Fully recovered - transition to closed
              return {
                status: "closed",
                failures: 0,
                lastFailureTime: 0,
                successCount: 0
              };
            }
            return { ...state, successCount: newSuccessCount };
          }
          
          // Reset failure count on success in closed state
          return state.status === "closed" 
            ? { ...state, failures: 0 }
            : state;
        })
      ),
      Effect.tapError(() => 
        // Failure - update state
        Ref.update(stateRef, state => {
          const newFailures = state.failures + 1;
          const now = Date.now();
          
          if (newFailures >= failureThreshold) {
            // Trip the circuit breaker
            return {
              status: "open",
              failures: newFailures,
              lastFailureTime: now,
              successCount: 0
            };
          }
          
          return {
            ...state,
            failures: newFailures,
            lastFailureTime: now,
            successCount: 0
          };
        })
      )
    );
    
    return result;
  });
  
  const getState = Ref.get(stateRef);
  
  return { execute, getState };
});
```

## Integration Examples

### Integration with HTTP Services

Using Ref to maintain service state in HTTP applications:

```typescript
import { Effect, Ref, Layer } from "effect";

interface ServiceHealth {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly lastCheck: number;
  readonly errors: string[];
  readonly uptime: number;
}

const makeHealthService = Effect.gen(function* () {
  const healthRef = yield* Ref.make<ServiceHealth>({
    status: "healthy",
    lastCheck: Date.now(),
    errors: [],
    uptime: Date.now()
  });
  
  const updateHealth = (status: ServiceHealth['status'], error?: string) =>
    Ref.update(healthRef, health => ({
      status,
      lastCheck: Date.now(),
      errors: error ? [error, ...health.errors.slice(0, 9)] : health.errors,
      uptime: health.uptime
    }));
  
  const getHealth = Ref.get(healthRef).pipe(
    Effect.map(health => ({
      ...health,
      uptimeSeconds: Math.floor((Date.now() - health.uptime) / 1000)
    }))
  );
  
  return { updateHealth, getHealth, healthRef };
});

// Create a Layer for dependency injection
const HealthServiceLive = Layer.effect(
  class HealthService extends Effect.Tag("HealthService")<
    HealthService,
    { updateHealth: (status: ServiceHealth['status'], error?: string) => Effect.Effect<void>; getHealth: Effect.Effect<ServiceHealth & { uptimeSeconds: number }> }
  >() {},
  makeHealthService
);
```

### Testing Strategies

Effective testing patterns for Ref-based code:

```typescript
import { Effect, Ref, TestContext } from "effect";

// Test utilities for Ref-based systems
const makeTestCounter = Effect.gen(function* () {
  const counterRef = yield* Ref.make(0);
  
  const increment = Ref.update(counterRef, n => n + 1);
  const decrement = Ref.update(counterRef, n => Math.max(0, n - 1));
  const get = Ref.get(counterRef);
  const set = (value: number) => Ref.set(counterRef, value);
  
  return { increment, decrement, get, set };
});

// Property-based testing
const testCounterProperties = Effect.gen(function* () {
  const counter = yield* makeTestCounter;
  
  // Test: increment then decrement should return to original
  yield* counter.set(5);
  yield* counter.increment;
  yield* counter.decrement;
  const result = yield* counter.get;
  
  console.assert(result === 5, "Increment/decrement should be symmetric");
  
  // Test: multiple concurrent operations
  yield* counter.set(0);
  yield* Effect.all([
    counter.increment,
    counter.increment,
    counter.decrement,
    counter.increment
  ], { concurrency: "unbounded" });
  
  const finalResult = yield* counter.get;
  console.assert(finalResult === 2, "Concurrent operations should be atomic");
});

// Mock implementations using Refs
const makeMockDatabase = Effect.gen(function* () {
  const dataRef = yield* Ref.make(new Map<string, any>());
  const callsRef = yield* Ref.make<string[]>([]);
  
  const save = <T>(id: string, data: T) => Effect.gen(function* () {
    yield* Ref.update(callsRef, calls => [...calls, `save:${id}`]);
    yield* Ref.update(dataRef, map => new Map(map).set(id, data));
    return data;
  });
  
  const load = <T>(id: string) => Effect.gen(function* () {
    yield* Ref.update(callsRef, calls => [...calls, `load:${id}`]);
    const data = yield* Ref.get(dataRef);
    return data.get(id) as T | undefined;
  });
  
  const getCalls = Ref.get(callsRef);
  const clear = Effect.all([
    Ref.set(dataRef, new Map()),
    Ref.set(callsRef, [])
  ], { concurrency: "unbounded" });
  
  return { save, load, getCalls, clear };
});
```

### Integration with Streams

Using Refs to maintain state across stream processing:

```typescript
import { Effect, Ref, Stream, Chunk } from "effect";

// Stream processor with stateful aggregation
const makeStreamAggregator = <T, S>(
  initialState: S,
  folder: (state: S, value: T) => S
) => Effect.gen(function* () {
  const stateRef = yield* Ref.make(initialState);
  
  const process = (stream: Stream.Stream<T>) =>
    stream.pipe(
      Stream.tap(value => 
        Ref.update(stateRef, state => folder(state, value))
      ),
      Stream.drain
    );
  
  const getState = Ref.get(stateRef);
  const reset = Ref.set(stateRef, initialState);
  
  return { process, getState, reset };
});

// Usage example: counting stream elements by type
const streamProcessingExample = Effect.gen(function* () {
  interface EventCount {
    [eventType: string]: number;
  }
  
  const aggregator = yield* makeStreamAggregator<{ type: string }, EventCount>(
    {},
    (counts, event) => ({
      ...counts,
      [event.type]: (counts[event.type] || 0) + 1
    })
  );
  
  const eventStream = Stream.fromIterable([
    { type: "user_login" },
    { type: "user_logout" },
    { type: "user_login" },
    { type: "purchase" },
    { type: "user_login" }
  ]);
  
  yield* aggregator.process(eventStream);
  const counts = yield* aggregator.getState;
  
  console.log("Event counts:", counts);
  // Expected: { user_login: 3, user_logout: 1, purchase: 1 }
});
```

## Conclusion

Ref provides **thread-safe mutable state management**, **atomic operations**, and **composable state transitions** for Effect applications.

Key benefits:
- **Concurrency Safety**: All operations are atomic and thread-safe by default
- **Functional Updates**: State changes use pure functions, making them predictable and testable
- **Rich API**: Comprehensive set of operations for different use cases, from simple updates to complex state machines

Ref is essential when you need mutable state that must remain consistent across concurrent operations, making it perfect for counters, caches, connection pools, metrics collection, and any scenario where shared mutable state is required in a concurrent environment.