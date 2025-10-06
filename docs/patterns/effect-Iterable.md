# Iterable: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Iterable Solves

Processing large datasets often leads to memory exhaustion, blocking operations, and performance issues when using traditional array-based approaches. Imagine processing millions of records, streaming data, or handling infinite sequences:

```typescript
// Traditional approach - loads everything into memory
function processLargeDataset(data: User[]): ProcessedUser[] {
  // This loads ALL data into memory at once
  const results: ProcessedUser[] = []
  
  for (let i = 0; i < data.length; i++) {
    const user = data[i]
    
    // Blocking operations
    const enrichedUser = expensiveApiCall(user) // Blocks for each item
    const processedUser = {
      id: user.id,
      name: enrichedUser.fullName,
      score: calculateComplexScore(enrichedUser) // CPU intensive
    }
    
    if (processedUser.score > 100) {
      results.push(processedUser)
    }
  }
  
  // Memory usage grows linearly with dataset size
  // No way to process incrementally
  // All computations happen eagerly
  return results
}

// Processing infinite sequences requires manual state management
function fibonacci(n: number): number[] {
  const result = [0, 1]
  
  for (let i = 2; i < n; i++) {
    result.push(result[i - 1] + result[i - 2])
  }
  
  return result // Entire sequence in memory
}
```

This approach leads to:
- **Memory Issues** - All data loaded into memory simultaneously causing OOM errors
- **Blocking Operations** - Synchronous processing blocks the event loop
- **No Lazy Evaluation** - All computations happen immediately, wasting resources
- **Poor Composability** - Difficult to chain operations without intermediate arrays
- **Limited Reusability** - Hard to reuse processing logic across different data sources

### The Iterable Solution

Effect's Iterable module provides lazy, memory-efficient iteration patterns that compute values on-demand, enabling processing of large or infinite datasets with constant memory usage:

```typescript
import { Iterable, Effect, pipe } from "effect"

// The Effect solution - lazy, memory-efficient, composable
const processLargeDataset = (data: Iterable<User>) =>
  pipe(
    data,
    Iterable.map(user => enrichUser(user)), // Lazy transformation
    Iterable.filter(user => user.score > 100), // Lazy filtering
    Iterable.take(1000) // Only process first 1000 matches
  )

// Infinite sequences with constant memory usage
const fibonacci = Iterable.unfold(
  [0, 1],
  ([a, b]) => Option.some([[a, [b, a + b]]])
)

// Process only what you need
const first10Fibonacci = pipe(
  fibonacci,
  Iterable.take(10),
  Array.from
) // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Key Concepts

**Lazy Evaluation**: Values are computed only when needed, not when the iteration is defined. This enables processing infinite sequences and large datasets with constant memory usage.

**Pull-Based Processing**: Values are "pulled" from the source as needed, rather than "pushed" all at once. This allows consumers to control the pace of processing.

**Composable Operations**: Operations can be chained together without creating intermediate collections, improving both memory usage and performance.

## Basic Usage Patterns

### Pattern 1: Creating Iterables

```typescript
import { Iterable, Option } from "effect"

// From a range of numbers
const numbers = Iterable.range(1, 1000000) // Memory efficient even for large ranges

// Generate values with a function
const squares = Iterable.makeBy(i => i * i, { length: 1000 })

// Infinite sequences
const infiniteSequence = Iterable.makeBy(i => i * 2) // Never ends!

// From existing data structures
const fromRecord = Iterable.fromRecord({ a: 1, b: 2, c: 3 })
// Yields: ["a", 1], ["b", 2], ["c", 3]

// Unfold pattern for complex sequences
const countdown = Iterable.unfold(
  10,
  n => n > 0 ? Option.some([n, n - 1]) : Option.none()
)
// Yields: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
```

### Pattern 2: Basic Transformations

```typescript
import { Iterable, pipe } from "effect"

const data = Iterable.range(1, 100)

// Map transformations (lazy)
const doubled = pipe(
  data,
  Iterable.map(x => x * 2)
)

// Filter operations (lazy)
const evens = pipe(
  data,
  Iterable.filter(x => x % 2 === 0)
)

// Take only what you need
const first10Evens = pipe(
  data,
  Iterable.filter(x => x % 2 === 0),
  Iterable.take(10) // Stops after finding 10 items
)

// Chain operations efficiently
const processed = pipe(
  data,
  Iterable.map(x => x * 2),
  Iterable.filter(x => x > 50),
  Iterable.take(5)
)
```

### Pattern 3: Converting to Collections

```typescript
import { Iterable, Array as Arr } from "effect"

const iterable = pipe(
  Iterable.range(1, 10),
  Iterable.map(x => x * x)
)

// Convert to array when needed
const asArray = Array.from(iterable)

// Process with reduction
const sum = pipe(
  iterable,
  Iterable.reduce(0, (acc, x) => acc + x)
)

// Find specific elements
const firstMatch = pipe(
  iterable,
  Iterable.findFirst(x => x > 25)
) // Option<number>
```

## Real-World Examples

### Example 1: Processing Large Log Files

Processing server logs without loading the entire file into memory:

```typescript
import { Iterable, Effect, Option, pipe } from "effect"
import { NodeFileSystem } from "@effect/platform-node"

interface LogEntry {
  timestamp: string
  level: string
  message: string
  userId?: string
}

const parseLogLine = (line: string): Option<LogEntry> => {
  const parts = line.split(" - ")
  if (parts.length < 3) return Option.none()
  
  return Option.some({
    timestamp: parts[0],
    level: parts[1],
    message: parts[2],
    userId: parts[3]
  })
}

const processLogFile = (filePath: string) =>
  Effect.gen(function* () {
    // Read file line by line (lazy)
    const lines = yield* Effect.succeed(
      Iterable.makeBy(i => `Line ${i}: ERROR - Database connection failed - user123`)
    )
    
    const errorAnalysis = pipe(
      lines,
      Iterable.filterMap(parseLogLine),
      Iterable.filter(entry => entry.level === "ERROR"),
      Iterable.groupBy(entry => entry.userId || "anonymous"),
      // Process in chunks to avoid memory issues
      Iterable.take(1000) // Process first 1000 errors
    )
    
    return errorAnalysis
  })

// Usage - processes incrementally, never loads entire file
const analysisResult = processLogFile("/var/log/app.log")
```

### Example 2: API Data Pagination

Handling paginated API responses as a continuous stream:

```typescript
import { Iterable, Effect, Option, pipe } from "effect"

interface PaginatedResponse<T> {
  data: T[]
  nextPage?: string
  hasMore: boolean
}

interface User {
  id: string
  name: string
  email: string
  lastActive: Date
}

const fetchPage = (page: string): Effect.Effect<PaginatedResponse<User>, Error> =>
  Effect.succeed({
    data: Array.from({ length: 50 }, (_, i) => ({
      id: `user-${page}-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      lastActive: new Date()
    })),
    nextPage: page === "page-10" ? undefined : `page-${parseInt(page.split("-")[1]) + 1}`,
    hasMore: page !== "page-10"
  })

// Create an iterable that automatically handles pagination
const createPaginatedIterable = (startPage: string): Iterable<User> => {
  return Iterable.unfold(
    startPage,
    (currentPage) => 
      Effect.gen(function* () {
        const response = yield* fetchPage(currentPage)
        
        if (response.data.length === 0 || !response.hasMore) {
          return Option.none<[User[], string]>()
        }
        
        return Option.some([
          response.data,
          response.nextPage || ""
        ])
      }).pipe(
        Effect.runSync // For demo - in real app use proper execution
      )
  ).pipe(
    Iterable.flatten
  )
}

// Usage - process all users across all pages lazily
const processAllUsers = pipe(
  createPaginatedIterable("page-1"),
  Iterable.filter(user => user.name.includes("Admin")),
  Iterable.map(user => ({ ...user, processed: true })),
  Iterable.take(100) // Only process first 100 admin users
)
```

### Example 3: Real-time Data Processing

Processing streaming sensor data with windowing and aggregation:

```typescript
import { Iterable, Effect, Duration, pipe } from "effect"

interface SensorReading {
  sensorId: string
  value: number
  timestamp: Date
  location: string
}

interface WindowedData {
  timeWindow: string
  readings: SensorReading[]
  average: number
  max: number
  min: number
}

// Simulate real-time sensor data
const createSensorStream = (): Iterable<SensorReading> => 
  Iterable.makeBy(i => ({
    sensorId: `sensor-${i % 10}`,
    value: Math.random() * 100,
    timestamp: new Date(Date.now() + i * 1000),
    location: `location-${Math.floor(i / 10)}`
  }))

const processSensorData = (sensorStream: Iterable<SensorReading>) =>
  pipe(
    sensorStream,
    // Group readings into time windows
    Iterable.chunksOf(60), // 60-second windows
    Iterable.map(readings => {
      const values = readings.map(r => r.value)
      const sum = values.reduce((a, b) => a + b, 0)
      
      return {
        timeWindow: new Date(readings[0]?.timestamp || Date.now()).toISOString(),
        readings,
        average: sum / values.length,
        max: Math.max(...values),
        min: Math.min(...values)
      } satisfies WindowedData
    }),
    // Filter for anomalies
    Iterable.filter(window => window.max - window.min > 50),
    // Process only recent data
    Iterable.take(24) // Last 24 hours of anomaly windows
  )

// Usage - continuous processing without memory buildup
const sensorStream = createSensorStream()
const anomalies = processSensorData(sensorStream)

// Process alerts lazily
const processAlerts = pipe(
  anomalies,
  Iterable.forEach(window => {
    console.log(`Alert: High variance in ${window.timeWindow}`)
    console.log(`Range: ${window.min} - ${window.max}`)
  })
)
```

## Advanced Features Deep Dive

### Lazy Evaluation and Memory Efficiency

Unlike arrays that store all elements in memory, Iterables compute values on-demand:

```typescript
import { Iterable, pipe } from "effect"

// This creates NO values in memory - just the recipe to create them
const millionNumbers = Iterable.range(1, 1_000_000)

// Still no memory used - just chained recipes
const expensiveProcessing = pipe(
  millionNumbers,
  Iterable.map(x => x * x), // Not executed yet
  Iterable.filter(x => x % 1000 === 0), // Not executed yet
  Iterable.map(x => Math.sqrt(x)) // Not executed yet
)

// Only NOW do we compute values, and only the first 5
const firstFive = pipe(
  expensiveProcessing,
  Iterable.take(5),
  Array.from
) // Computes only what's needed: ~5 values instead of 1 million
```

### Infinite Sequences and Generators

Handle infinite data streams with finite memory:

```typescript
import { Iterable, Option, pipe } from "effect"

// Prime number generator (infinite)
const primes = Iterable.unfold(
  2,
  (n): Option<[number, number]> => {
    const isPrime = (num: number): boolean => {
      if (num < 2) return false
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false
      }
      return true
    }
    
    const nextPrime = (current: number): number => {
      let candidate = current + 1
      while (!isPrime(candidate)) {
        candidate++
      }
      return candidate
    }
    
    return Option.some([n, nextPrime(n)])
  }
)

// Use infinite sequence safely
const first10Primes = pipe(
  primes,
  Iterable.take(10),
  Array.from
) // [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]

// Complex infinite sequences
const collatzSequence = (start: number) =>
  Iterable.unfold(
    start,
    (n): Option<[number, number]> => {
      if (n === 1) return Option.none()
      const next = n % 2 === 0 ? n / 2 : 3 * n + 1
      return Option.some([n, next])
    }
  )

// Process until convergence
const collatz27 = pipe(
  collatzSequence(27),
  Array.from
) // [27, 82, 41, 124, 62, 31, 94, 47, 142, 71, 214, 107, 322, 161, 484, 242, 121, 364, 182, 91, 274, 137, 412, 206, 103, 310, 155, 466, 233, 700, 350, 175, 526, 263, 790, 395, 1186, 593, 1780, 890, 445, 1336, 668, 334, 167, 502, 251, 754, 377, 1132, 566, 283, 850, 425, 1276, 638, 319, 958, 479, 1438, 719, 2158, 1079, 3238, 1619, 4858, 2429, 7288, 3644, 1822, 911, 2734, 1367, 4102, 2051, 6154, 3077, 9232, 4616, 2308, 1154, 577, 1732, 866, 433, 1300, 650, 325, 976, 488, 244, 122, 61, 184, 92, 46, 23, 70, 35, 106, 53, 160, 80, 40, 20, 10, 5, 16, 8, 4, 2]
```

### Advanced Chunking and Grouping

Process data in manageable batches:

```typescript
import { Iterable, Equal, pipe } from "effect"

interface Transaction {
  id: string
  userId: string
  amount: number
  category: string
  date: Date
}

const transactions = Iterable.makeBy(i => ({
  id: `tx-${i}`,
  userId: `user-${i % 100}`,
  amount: Math.floor(Math.random() * 1000),
  category: ["food", "transport", "entertainment", "utilities"][i % 4],
  date: new Date(Date.now() - i * 86400000) // i days ago
}), { length: 10000 })

// Process in chunks for batch operations
const batchProcess = pipe(
  transactions,
  Iterable.chunksOf(100), // Process 100 transactions at a time
  Iterable.map(batch => ({
    batchId: `batch-${batch[0]?.id}`,
    totalAmount: batch.reduce((sum, tx) => sum + tx.amount, 0),
    transactionCount: batch.length,
    categories: [...new Set(batch.map(tx => tx.category))]
  })),
  Iterable.take(10) // Process only first 10 batches
)

// Group consecutive similar items
const groupedTransactions = pipe(
  transactions,
  Iterable.groupWith((a, b) => a.category === b.category),
  Iterable.map(group => ({
    category: group[0].category,
    count: group.length,
    totalAmount: group.reduce((sum, tx) => sum + tx.amount, 0)
  }))
)

// Custom grouping logic
const userTransactions = pipe(
  transactions,
  Iterable.groupBy(tx => tx.userId),
  Object.entries
)
```

## Practical Patterns & Best Practices

### Pattern 1: Memory-Efficient Data Processing

```typescript
import { Iterable, Effect, pipe } from "effect"

// Helper for processing large datasets efficiently
const processLargeDataset = <T, R>(
  source: Iterable<T>,
  processor: (item: T) => Effect.Effect<R, Error>,
  batchSize: number = 100
) =>
  Effect.gen(function* () {
    const results: R[] = []
    
    const batches = pipe(
      source,
      Iterable.chunksOf(batchSize)
    )
    
    for (const batch of batches) {
      // Process batch concurrently but control memory usage
      const batchResults = yield* Effect.all(
        batch.map(processor),
        { concurrency: 10 } // Limit concurrent operations
      )
      
      results.push(...batchResults)
      
      // Optional: Add backpressure or progress reporting
      if (results.length % 1000 === 0) {
        console.log(`Processed ${results.length} items`)
      }
    }
    
    return results
  })

// Usage
const processUsers = (users: Iterable<User>) =>
  processLargeDataset(
    users,
    user => Effect.succeed({ ...user, processed: true }),
    50 // Process 50 at a time
  )
```

### Pattern 2: Streaming Transformations

```typescript
import { Iterable, Option, pipe } from "effect"

// Helper for creating transformation pipelines
const createTransformPipeline = <T>() => ({
  from: (source: Iterable<T>) => ({
    map: <U>(fn: (item: T) => U) => 
      createTransformPipeline<U>().from(pipe(source, Iterable.map(fn))),
    
    filter: (predicate: (item: T) => boolean) =>
      createTransformPipeline<T>().from(pipe(source, Iterable.filter(predicate))),
    
    take: (count: number) =>
      createTransformPipeline<T>().from(pipe(source, Iterable.take(count))),
    
    chunk: (size: number) =>
      createTransformPipeline<T[]>().from(pipe(source, Iterable.chunksOf(size))),
    
    collect: () => Array.from(source),
    
    process: (fn: (item: T) => void) => {
      pipe(source, Iterable.forEach(fn))
    }
  })
})

// Usage - fluent transformation API
const pipeline = createTransformPipeline<number>()
  .from(Iterable.range(1, 1000))
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .take(10)
  .collect()
```

### Pattern 3: Error-Safe Processing

```typescript
import { Iterable, Effect, Either, Option, pipe } from "effect"

// Safe processing with error handling
const safeProcessIterable = <T, R, E>(
  source: Iterable<T>,
  processor: (item: T) => Effect.Effect<R, E>
) =>
  Effect.gen(function* () {
    const results: Either<E, R>[] = []
    
    for (const item of source) {
      const result = yield* pipe(
        processor(item),
        Effect.either
      )
      results.push(result)
    }
    
    return {
      successes: results.filter(Either.isRight).map(r => r.right),
      failures: results.filter(Either.isLeft).map(r => r.left),
      totalProcessed: results.length
    }
  })

// Usage with error recovery
const processWithErrorHandling = (data: Iterable<string>) =>
  safeProcessIterable(
    data,
    item => item.length > 0 
      ? Effect.succeed(item.toUpperCase())
      : Effect.fail("Empty string")
  )
```

## Integration Examples

### Integration with Streams

```typescript
import { Iterable, Stream, Effect, pipe } from "effect"

// Convert Iterable to Stream for advanced processing
const iterableToStream = <T>(iterable: Iterable<T>) =>
  Stream.fromIterable(iterable)

// Process with backpressure and resource management
const processWithStream = (data: Iterable<string>) =>
  pipe(
    iterableToStream(data),
    Stream.map(s => s.toUpperCase()),
    Stream.filter(s => s.length > 5),
    Stream.buffer({ capacity: 100 }), // Buffer for performance
    Stream.runCollect
  )

// Stream back to Iterable
const streamToIterable = <T>(stream: Stream.Stream<T, never, never>) =>
  Effect.gen(function* () {
    const chunk = yield* Stream.runCollect(stream)
    return chunk
  })
```

### Integration with Arrays

```typescript
import { Iterable, Array as Arr, pipe } from "effect"

// Efficient Array operations with Iterable
const hybridProcessing = <T>(arr: readonly T[]) => {
  // Use Iterable for memory-efficient processing
  const processed = pipe(
    arr, // Arrays are Iterable
    Iterable.filter(item => item != null),
    Iterable.map(item => ({ processed: true, data: item })),
    Iterable.take(1000), // Limit processing
    Array.from // Convert back to Array when needed
  )
  
  // Use Array module for operations that need random access
  return pipe(
    processed,
    Arr.sort((a, b) => a.data.toString().localeCompare(b.data.toString()))
  )
}
```

### Testing Strategies

```typescript
import { Iterable, Effect, pipe } from "effect"
import { describe, it, expect } from "vitest"

describe("Iterable Processing", () => {
  it("should process data lazily", () => {
    let computations = 0
    
    const data = pipe(
      Iterable.range(1, 100),
      Iterable.map(x => {
        computations++
        return x * 2
      })
    )
    
    // No computations yet - lazy evaluation
    expect(computations).toBe(0)
    
    // Only compute what we take
    const first5 = pipe(data, Iterable.take(5), Array.from)
    expect(computations).toBe(5)
    expect(first5).toEqual([2, 4, 6, 8, 10])
  })
  
  it("should handle infinite sequences", () => {
    const fibonacci = Iterable.unfold(
      [0, 1],
      ([a, b]) => Option.some([[a, [b, a + b]]])
    )
    
    const first10 = pipe(fibonacci, Iterable.take(10), Array.from)
    expect(first10).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34])
  })
  
  it("should process in chunks efficiently", () => {
    const data = Iterable.range(1, 100)
    const chunks = pipe(
      data,
      Iterable.chunksOf(10),
      Iterable.take(3), // Only first 3 chunks
      Array.from
    )
    
    expect(chunks).toHaveLength(3)
    expect(chunks[0]).toHaveLength(10)
    expect(chunks[0]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})
```

### Performance Monitoring

```typescript
import { Iterable, Effect, pipe } from "effect"

// Helper for measuring Iterable performance
const measureIterablePerformance = <T>(
  name: string,
  iterable: Iterable<T>,
  sampleSize: number = 1000
) =>
  Effect.gen(function* () {
    const startTime = performance.now()
    let processed = 0
    
    // Process sample to measure performance
    const sample = pipe(
      iterable,
      Iterable.take(sampleSize),
      Iterable.forEach(() => { processed++ })
    )
    
    const endTime = performance.now()
    const timePerItem = (endTime - startTime) / processed
    
    console.log(`${name}: Processed ${processed} items in ${endTime - startTime}ms`)
    console.log(`Average time per item: ${timePerItem}ms`)
    
    return {
      name,
      totalTime: endTime - startTime,
      itemsProcessed: processed,
      timePerItem
    }
  })

// Usage
const benchmarkProcessing = Effect.gen(function* () {
  const data = Iterable.range(1, 100000)
  
  const results = yield* Effect.all([
    measureIterablePerformance("Range iteration", data),
    measureIterablePerformance(
      "Mapped range", 
      pipe(data, Iterable.map(x => x * x))
    ),
    measureIterablePerformance(
      "Filtered range",
      pipe(data, Iterable.filter(x => x % 2 === 0))
    )
  ])
  
  return results
})
```

## Conclusion

Effect's Iterable module provides **lazy evaluation**, **memory efficiency**, and **composable operations** for processing data sequences of any size.

Key benefits:
- **Memory Efficiency**: Process infinite sequences and large datasets with constant memory usage
- **Lazy Evaluation**: Compute only what you need, when you need it
- **Composability**: Chain operations without creating intermediate collections

Use Iterable when you need to:
- Process large datasets without loading everything into memory
- Handle infinite or unbounded sequences
- Build efficient data processing pipelines
- Stream data transformations with minimal resource usage

Iterable shines in scenarios involving large-scale data processing, real-time streams, pagination handling, and any situation where memory efficiency and lazy evaluation provide significant benefits over traditional eager array operations.