# Chunk: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Chunk Solves

Working with large datasets in JavaScript often leads to memory issues and performance bottlenecks. Traditional arrays create new copies for every operation, leading to excessive memory allocation and garbage collection pressure:

```typescript
// Traditional approach - inefficient array operations
const processLargeDataset = (data: number[]): number[] => {
  return data
    .filter(x => x > 0)           // Creates new array
    .map(x => x * 2)              // Creates another new array
    .slice(0, 1000)               // Creates yet another new array
    .sort((a, b) => a - b)        // Mutates or creates new array
}

// Memory usage explodes with large datasets
const millionNumbers = Array.from({ length: 1_000_000 }, (_, i) => i - 500_000)
const result = processLargeDataset(millionNumbers) // Multiple 1M element arrays in memory

// Performance issues with nested operations
const nestedOperations = (datasets: number[][]): number[] => {
  return datasets
    .flatMap(dataset => dataset.map(x => x * 2))  // Creates intermediate arrays
    .filter(x => x > 100)                         // Another intermediate array
    .slice(0, 500)                               // Final copy
}
```

This approach leads to:
- **Memory inefficiency** - Multiple intermediate arrays consume excessive memory
- **Poor performance** - Constant allocation/deallocation causes GC pressure
- **Limited composability** - Hard to optimize chains of operations
- **Mutation concerns** - Array methods sometimes mutate, sometimes don't

### The Chunk Solution

Chunk provides a high-performance immutable sequence that uses structural sharing and lazy evaluation to minimize memory allocation:

```typescript
import { Chunk } from "effect"
import { pipe } from "effect"

// Efficient chunk operations with structural sharing
const processLargeDataset = (data: Chunk.Chunk<number>): Chunk.Chunk<number> =>
  data.pipe(
    Chunk.filter(x => x > 0),
    Chunk.map(x => x * 2),
    Chunk.take(1000),
    Chunk.sort((a, b) => a - b)
  )

// Memory-efficient with large datasets
const millionNumbers = Chunk.range(0, 1_000_000).pipe(
  Chunk.map(i => i - 500_000)
)
const result = processLargeDataset(millionNumbers) // Minimal memory overhead

// Efficient nested operations
const nestedOperations = (datasets: Chunk.Chunk<Chunk.Chunk<number>>): Chunk.Chunk<number> =>
  datasets.pipe(
    Chunk.flatMap(dataset => Chunk.map(dataset, x => x * 2)),
    Chunk.filter(x => x > 100),
    Chunk.take(500)
  )
```

### Key Concepts

**Structural Sharing**: Chunks share common structure between versions, minimizing memory usage when creating "modified" versions.

**Lazy Evaluation**: Operations like `take` and `drop` don't immediately process all elements, only what's needed.

**Immutability**: All operations return new chunks without modifying the original, ensuring safety in concurrent environments.

## Basic Usage Patterns

### Pattern 1: Creating Chunks

```typescript
import { Chunk } from "effect"

// From arrays
const fromArray = Chunk.fromIterable([1, 2, 3, 4, 5])

// Empty chunks
const empty = Chunk.empty<number>()

// Single elements
const single = Chunk.of(42)

// Ranges
const range = Chunk.range(1, 100) // 1 to 100 inclusive

// Repeated values
const repeated = Chunk.make(1, 1, 1, 1, 1) // Multiple elements
const filled = Chunk.replicate(5, "hello")  // Repeat single value

// From generators
const generated = Chunk.fromIterable(function* () {
  for (let i = 0; i < 1000; i++) {
    yield Math.random()
  }
}())
```

### Pattern 2: Basic Transformations

```typescript
import { Chunk, pipe } from "effect"

const numbers = Chunk.range(1, 10)

// Map transformations
const doubled = Chunk.map(numbers, x => x * 2)

// Filtering
const evens = Chunk.filter(numbers, x => x % 2 === 0)

// Taking and dropping
const firstThree = Chunk.take(numbers, 3)
const skipTwo = Chunk.drop(numbers, 2)
const middleThree = Chunk.drop(numbers, 2).pipe(Chunk.take(3))

// Combining operations
const processed = numbers.pipe(
  Chunk.filter(x => x > 3),
  Chunk.map(x => x * x), 
  Chunk.take(3)
)

console.log(Chunk.toReadonlyArray(processed)) // [16, 25, 36]
```

### Pattern 3: Accessing Elements

```typescript
import { Chunk, Option } from "effect"

const fruits = Chunk.make("apple", "banana", "cherry", "date")

// Safe access with Option
const first = Chunk.head(fruits)     // Option.some("apple")
const last = Chunk.last(fruits)      // Option.some("date")
const third = Chunk.get(fruits, 2)   // Option.some("cherry")
const missing = Chunk.get(fruits, 10) // Option.none()

// Unsafe access (throws on missing)
const firstUnsafe = Chunk.unsafeHead(fruits) // "apple"
const lastUnsafe = Chunk.unsafeLast(fruits)   // "date"

// Length and emptiness
const length = Chunk.size(fruits)     // 4
const isEmpty = Chunk.isEmpty(fruits) // false

// Converting to arrays when needed
const asArray = Chunk.toReadonlyArray(fruits)
```

## Real-World Examples

### Example 1: Processing Log Files

Processing large log files efficiently without loading everything into memory:

```typescript
import { Chunk, pipe, Option, Effect } from "effect"
import * as fs from "fs"

interface LogEntry {
  timestamp: Date
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
  source: string
}

// Parse log line to structured entry
const parseLogLine = (line: string): Option.Option<LogEntry> => {
  const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z) \[(\w+)\] (.+?) - (.+)$/)
  
  if (!match) return Option.none()
  
  const [, timestamp, level, source, message] = match
  
  if (level !== 'INFO' && level !== 'WARN' && level !== 'ERROR') {
    return Option.none()
  }
  
  return Option.some({
    timestamp: new Date(timestamp),
    level: level as LogEntry['level'],
    source,
    message
  })
}

// Process logs efficiently with chunks
const processLogFile = (lines: string[]): Effect.Effect<LogEntry[]> =>
  Effect.sync(() => {
    const logChunk = Chunk.fromIterable(lines)
    
    return logChunk.pipe(
      // Parse all lines, keeping only valid entries
      Chunk.filterMap(parseLogLine),
      // Filter for errors from last 24 hours
      Chunk.filter(entry => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return entry.level === 'ERROR' && entry.timestamp > oneDayAgo
      }),
      // Sort by timestamp (most recent first)
      Chunk.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      // Take only the first 100 errors
      Chunk.take(100),
      // Convert to array for consumption
      Chunk.toReadonlyArray
    )
  })

// Usage with large log files
const analyzeLogFile = (filename: string) =>
  Effect.gen(function* () {
    const content = yield* Effect.promise(() => 
      fs.promises.readFile(filename, 'utf-8')
    )
    
    const lines = content.split('\n')
    console.log(`Processing ${lines.length} log lines...`)
    
    const errors = yield* processLogFile(lines)
    
    console.log(`Found ${errors.length} recent errors:`)
    errors.forEach(error => {
      console.log(`[${error.timestamp.toISOString()}] ${error.source}: ${error.message}`)
    })
    
    return errors
  })
```

### Example 2: Batch Processing with Pagination

Efficiently processing paginated API data with chunks:

```typescript
import { Chunk, pipe, Effect, Schedule } from "effect"

interface Product {
  id: string
  name: string
  price: number
  category: string
  inStock: boolean
}

interface ApiPage<T> {
  data: T[]
  hasMore: boolean
  nextCursor?: string
}

// Simulate API call with retry logic
const fetchProductPage = (cursor?: string): Effect.Effect<ApiPage<Product>> =>
  Effect.gen(function* () {
    // Simulate network delay and potential failures
    yield* Effect.sleep("100 millis")
    
    if (Math.random() < 0.1) {
      yield* Effect.fail(new Error("Network timeout"))
    }
    
    // Mock data generation
    const pageSize = 50
    const startId = cursor ? parseInt(cursor) : 0
    const products = Array.from({ length: pageSize }, (_, i) => ({
      id: `prod-${startId + i}`,
      name: `Product ${startId + i}`,
      price: Math.round(Math.random() * 1000 + 10),
      category: ['electronics', 'clothing', 'books', 'home'][Math.floor(Math.random() * 4)],
      inStock: Math.random() > 0.2
    }))
    
    return {
      data: products,
      hasMore: startId + pageSize < 1000, // Stop at 1000 products
      nextCursor: startId + pageSize < 1000 ? String(startId + pageSize) : undefined
    }
  }).pipe(
    Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.compose(Schedule.recurs(3))))
  )

// Fetch all pages and process with chunks
const processAllProducts = Effect.gen(function* () {
  let allProducts = Chunk.empty<Product>()
  let cursor: string | undefined = undefined
  let hasMore = true
  
  while (hasMore) {
    console.log(`Fetching page with cursor: ${cursor || 'initial'}`)
    
    const page = yield* fetchProductPage(cursor)
    
    // Add new products to chunk efficiently
    allProducts = allProducts.pipe(
      Chunk.appendAll(Chunk.fromIterable(page.data))
    )
    
    cursor = page.nextCursor
    hasMore = page.hasMore
  }
  
  console.log(`Fetched ${Chunk.size(allProducts)} total products`)
  
  // Process all products efficiently
  const analysis = allProducts.pipe(
    // Group by category and analyze
    products => {
      const electronics = Chunk.filter(products, p => p.category === 'electronics')
      const clothing = Chunk.filter(products, p => p.category === 'clothing')
      const books = Chunk.filter(products, p => p.category === 'books')
      const home = Chunk.filter(products, p => p.category === 'home')
      
      return {
        totalProducts: Chunk.size(products),
        inStockCount: Chunk.size(Chunk.filter(products, p => p.inStock)),
        averagePrice: Chunk.map(products, p => p.price).pipe(
          prices => Chunk.reduce(prices, 0, (sum, price) => sum + price) / Chunk.size(prices)
        ),
        categoryBreakdown: {
          electronics: Chunk.size(electronics),
          clothing: Chunk.size(clothing),
          books: Chunk.size(books),
          home: Chunk.size(home)
        },
        topExpensive: Chunk.sort(products, (a, b) => b.price - a.price).pipe(
          Chunk.take(10),
          Chunk.toReadonlyArray
        )
      }
    }
  )
  
  return analysis
})

// Usage
const runProductAnalysis = () =>
  Effect.runPromise(processAllProducts).then(analysis => {
    console.log('Product Analysis:', JSON.stringify(analysis, null, 2))
  })
```

### Example 3: Stream Processing with Windowing

Processing streaming data with time-based windows using chunks:

```typescript
import { Chunk, pipe, Effect, Queue, Fiber } from "effect"

interface SensorReading {
  sensorId: string
  timestamp: number
  temperature: number
  humidity: number
}

interface WindowStats {
  windowStart: number
  windowEnd: number
  sensorId: string
  avgTemperature: number
  avgHumidity: number
  readingCount: number
  minTemp: number
  maxTemp: number
}

// Time window processor using chunks
class SensorWindowProcessor {
  private windowSize: number
  private windows: Map<string, Chunk.Chunk<SensorReading>> = new Map()

  constructor(windowSizeMs: number) {
    this.windowSize = windowSizeMs
  }

  processReading(reading: SensorReading): WindowStats[] {
    const sensorId = reading.sensorId
    const currentWindow = this.windows.get(sensorId) || Chunk.empty<SensorReading>()
    
    // Add new reading
    const updatedWindow = Chunk.append(currentWindow, reading)
    
    // Remove readings outside window
    const windowStart = reading.timestamp - this.windowSize
    const filteredWindow = Chunk.filter(updatedWindow, r => r.timestamp >= windowStart)
    
    this.windows.set(sensorId, filteredWindow)
    
    // Calculate stats if we have enough data
    if (Chunk.size(filteredWindow) < 5) return []
    
    const stats = this.calculateWindowStats(filteredWindow, sensorId)
    return [stats]
  }

  private calculateWindowStats(
    readings: Chunk.Chunk<SensorReading>,
    sensorId: string
  ): WindowStats {
    const readingsArray = Chunk.toReadonlyArray(readings)
    const temperatures = Chunk.map(readings, r => r.temperature)
    const humidities = Chunk.map(readings, r => r.humidity)
    
    return {
      windowStart: Math.min(...readingsArray.map(r => r.timestamp)),
      windowEnd: Math.max(...readingsArray.map(r => r.timestamp)),
      sensorId,
      avgTemperature: temperatures.pipe(
        temps => Chunk.reduce(temps, 0, (sum, temp) => sum + temp) / Chunk.size(temps)
      ),
      avgHumidity: humidities.pipe(
        hums => Chunk.reduce(hums, 0, (sum, hum) => sum + hum) / Chunk.size(hums)
      ),
      readingCount: Chunk.size(readings),
      minTemp: Chunk.reduce(temperatures, Infinity, Math.min),
      maxTemp: Chunk.reduce(temperatures, -Infinity, Math.max)
    }
  }
}

// Simulate sensor data stream
const generateSensorData = function* (sensorId: string, count: number) {
  const baseTemp = 20 + Math.random() * 10
  const baseHumidity = 40 + Math.random() * 20
  
  for (let i = 0; i < count; i++) {
    yield {
      sensorId,
      timestamp: Date.now() + i * 1000, // One reading per second
      temperature: baseTemp + (Math.random() - 0.5) * 4,
      humidity: baseHumidity + (Math.random() - 0.5) * 10
    }
  }
}

// Process streaming sensor data
const processSensorStream = Effect.gen(function* () {
  const processor = new SensorWindowProcessor(30000) // 30-second windows
  const queue = yield* Queue.bounded<SensorReading>(1000)
  
  // Producer: Generate sensor data
  const producer = Effect.gen(function* () {
    const sensors = ['sensor-1', 'sensor-2', 'sensor-3', 'sensor-4']
    
    for (let i = 0; i < 100; i++) {
      for (const sensorId of sensors) {
        const reading = {
          sensorId,
          timestamp: Date.now(),
          temperature: 20 + Math.random() * 10,
          humidity: 50 + Math.random() * 20
        }
        
        yield* Queue.offer(queue, reading)
        yield* Effect.sleep("500 millis") // Simulate real-time data
      }
    }
    
    yield* Queue.shutdown(queue)
  })
  
  // Consumer: Process readings and generate stats
  const consumer = Effect.gen(function* () {
    const allStats = Chunk.empty<WindowStats>()
    
    while (true) {
      const reading = yield* Queue.take(queue)
      const stats = processor.processReading(reading)
      
      for (const stat of stats) {
        console.log(`Window Stats for ${stat.sensorId}:`, {
          period: `${new Date(stat.windowStart).toISOString()} - ${new Date(stat.windowEnd).toISOString()}`,
          avgTemp: stat.avgTemperature.toFixed(2),
          avgHumidity: stat.avgHumidity.toFixed(2),
          readingCount: stat.readingCount,
          tempRange: `${stat.minTemp.toFixed(2)} - ${stat.maxTemp.toFixed(2)}`
        })
      }
    }
  }).pipe(Effect.catchAll(() => Effect.void))
  
  // Run producer and consumer concurrently
  const producerFiber = yield* Effect.fork(producer)
  const consumerFiber = yield* Effect.fork(consumer)
  
  yield* Fiber.join(producerFiber)
  yield* Fiber.interrupt(consumerFiber)
})

// Usage
const runSensorProcessing = () =>
  Effect.runPromise(processSensorStream)
```

## Advanced Features Deep Dive

### Feature 1: Structural Sharing and Memory Efficiency

Chunk's structural sharing allows efficient operations on large datasets by reusing common structure:

#### Basic Structural Sharing

```typescript
import { Chunk, pipe } from "effect"

// Create a large chunk
const largeChunk = Chunk.range(1, 100_000)

// Operations create new chunks but share structure
const filtered = Chunk.filter(largeChunk, x => x % 2 === 0)
const mapped = Chunk.map(filtered, x => x * 2)
const taken = Chunk.take(mapped, 1000)

// Memory usage is much lower than copying arrays
// Each operation reuses parts of the previous chunk
console.log(`Original size: ${Chunk.size(largeChunk)}`)      // 100,000
console.log(`Filtered size: ${Chunk.size(filtered)}`)        // ~50,000
console.log(`Final size: ${Chunk.size(taken)}`)              // 1,000
```

#### Advanced Memory Management

```typescript
import { Chunk, pipe, Effect } from "effect"

// Helper to measure memory usage patterns
const measureChunkOperations = () => {
  const initial = Chunk.range(1, 50_000)
  
  // Chain multiple operations
  const result = initial.pipe(
    Chunk.map(x => ({ id: x, value: x * 2, category: x % 10 })),
    Chunk.filter(item => item.category < 5),
    Chunk.map(item => ({ ...item, processed: true })),
    Chunk.take(1000)
  )
  
  return {
    originalSize: Chunk.size(initial),
    resultSize: Chunk.size(result),
    // In real apps, structural sharing prevents intermediate allocation
    memoryEfficient: true
  }
}

// Compare with array operations (for illustration)
const compareWithArrays = () => {
  const initial = Array.from({ length: 50_000 }, (_, i) => i + 1)
  
  // Each operation creates a new array
  const step1 = initial.map(x => ({ id: x, value: x * 2, category: x % 10 }))        // 50k objects
  const step2 = step1.filter(item => item.category < 5)                              // ~25k objects  
  const step3 = step2.map(item => ({ ...item, processed: true }))                    // ~25k objects
  const result = step3.slice(0, 1000)                                                // 1k objects
  
  // Multiple intermediate arrays exist simultaneously
  return { memoryInefficient: true, intermediateArrays: 4 }
}
```

### Feature 2: Lazy Evaluation and Performance

Chunk operations can be lazily evaluated, processing only what's needed:

#### Lazy Operations

```typescript
import { Chunk, pipe, Effect } from "effect"

// Expensive computation that we want to avoid when possible
const expensiveTransform = (x: number): number => {
  // Simulate expensive operation
  for (let i = 0; i < 10000; i++) {
    Math.sqrt(x + i)
  }
  return x * x
}

// Lazy evaluation - computation only happens for taken elements
const efficientProcessing = (data: Chunk.Chunk<number>) =>
  data.pipe(
    Chunk.map(expensiveTransform),  // This is lazy!
    Chunk.filter(x => x > 1000),    // This is lazy!
    Chunk.take(5)                   // Only 5 elements computed
  )

// Example usage
const processLargeDataset = () => {
  const largeDataset = Chunk.range(1, 100_000)
  
  console.time('Chunk processing (lazy)')
  const chunkResult = efficientProcessing(largeDataset)
  const chunkArray = Chunk.toReadonlyArray(chunkResult)
  console.timeEnd('Chunk processing (lazy)')
  
  // Compare with eager array processing
  console.time('Array processing (eager)')
  const arrayResult = Array.from({ length: 100_000 }, (_, i) => i + 1)
    .map(expensiveTransform)        // Processes ALL elements
    .filter(x => x > 1000)          // After all are processed
    .slice(0, 5)                    // Takes only 5 at the end
  console.timeEnd('Array processing (eager)')
  
  return { chunkResult: chunkArray, arrayResult }
}
```

#### Advanced Lazy Patterns

```typescript
import { Chunk, pipe, Option } from "effect"

// Lazy search that stops at first match
const findFirst = <A>(
  chunk: Chunk.Chunk<A>, 
  predicate: (a: A) => boolean
): Option.Option<A> => {
  // This would be implemented internally with lazy evaluation
  // Here's the conceptual approach
  return chunk.pipe(
    Chunk.filter(predicate),
    Chunk.head  // Stops at first match due to lazy evaluation
  )
}

// Early termination patterns
const processUntilCondition = <A, B>(
  chunk: Chunk.Chunk<A>,
  transform: (a: A) => B,
  stopCondition: (b: B) => boolean
): Chunk.Chunk<B> => {
  let result = Chunk.empty<B>()
  const iterator = chunk[Symbol.iterator]()
  
  for (const item of iterator) {
    const transformed = transform(item)
    result = Chunk.append(result, transformed)
    
    if (stopCondition(transformed)) {
      break  // Early termination
    }
  }
  
  return result
}

// Usage example
const findFirstExpensiveResult = () => {
  const data = Chunk.range(1, 1_000_000)
  
  const result = processUntilCondition(
    data,
    x => x * x,                    // Expensive operation
    x => x > 10_000               // Stop condition
  )
  
  console.log(`Processed ${Chunk.size(result)} items before stopping`)
  return result
}
```

### Feature 3: Advanced Composition Patterns

Complex chunk operations can be composed for powerful data processing pipelines:

#### Custom Chunk Operations

```typescript
import { Chunk, pipe, Option } from "effect"

// Custom sliding window operation
const slidingWindow = <A>(
  chunk: Chunk.Chunk<A>, 
  windowSize: number
): Chunk.Chunk<Chunk.Chunk<A>> => {
  if (windowSize <= 0 || Chunk.isEmpty(chunk)) {
    return Chunk.empty()
  }
  
  const size = Chunk.size(chunk)
  const windows = Chunk.empty<Chunk.Chunk<A>>()
  
  return Chunk.range(0, size - windowSize).pipe(
    Chunk.map(i => Chunk.drop(chunk, i).pipe(Chunk.take(windowSize))),
    Chunk.reduce(windows, (acc, window) => Chunk.append(acc, window))
  )
}

// Partition into chunks of specific size
const chunksOf = <A>(
  chunk: Chunk.Chunk<A>, 
  size: number
): Chunk.Chunk<Chunk.Chunk<A>> => {
  if (size <= 0) return Chunk.empty()
  
  const totalSize = Chunk.size(chunk)
  const numChunks = Math.ceil(totalSize / size)
  
  return Chunk.range(0, numChunks - 1).pipe(
    Chunk.map(i => chunk.pipe(
      Chunk.drop(i * size), 
      Chunk.take(size)
    ))
  )
}

// Advanced grouping with custom key function
const groupBy = <A, K>(
  chunk: Chunk.Chunk<A>,
  keyFn: (a: A) => K
): Map<K, Chunk.Chunk<A>> => {
  const groups = new Map<K, Chunk.Chunk<A>>()
  
  Chunk.forEach(chunk, item => {
    const key = keyFn(item)
    const existing = groups.get(key) || Chunk.empty<A>()
    groups.set(key, Chunk.append(existing, item))
  })
  
  return groups
}

// Usage examples
const demonstrateAdvancedPatterns = () => {
  const numbers = Chunk.range(1, 20)
  
  // Sliding windows of size 3
  const windows = slidingWindow(numbers, 3)
  console.log('Sliding windows:', Chunk.toReadonlyArray(windows).map(w => Chunk.toReadonlyArray(w)))
  
  // Partition into chunks of 5
  const partitions = chunksOf(numbers, 5)
  console.log('Partitions:', Chunk.toReadonlyArray(partitions).map(p => Chunk.toReadonlyArray(p)))
  
  // Group by even/odd
  const evenOdd = groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd')
  console.log('Even numbers:', Chunk.toReadonlyArray(evenOdd.get('even')!))
  console.log('Odd numbers:', Chunk.toReadonlyArray(evenOdd.get('odd')!))
}
```

## Practical Patterns & Best Practices

### Pattern 1: Memory-Efficient Data Processing

```typescript
import { Chunk, pipe, Effect } from "effect"

// Helper for processing large datasets in memory-efficient chunks
const processInBatches = <A, B>(
  data: Chunk.Chunk<A>,
  batchSize: number,
  processor: (batch: Chunk.Chunk<A>) => Effect.Effect<Chunk.Chunk<B>>
): Effect.Effect<Chunk.Chunk<B>> =>
  Effect.gen(function* () {
    let result = Chunk.empty<B>()
    let remaining = data
    
    while (!Chunk.isEmpty(remaining)) {
      const batch = Chunk.take(remaining, batchSize)
      const processed = yield* processor(batch)
      
      result = Chunk.appendAll(result, processed)
      remaining = Chunk.drop(remaining, batchSize)
    }
    
    return result
  })

// Async processing with backpressure control
const processWithBackpressure = <A, B>(
  data: Chunk.Chunk<A>,
  processor: (item: A) => Effect.Effect<B>,
  concurrency: number = 10
): Effect.Effect<Chunk.Chunk<B>> =>
  Effect.gen(function* () {
    const results = Chunk.empty<B>()
    
    // Process in concurrent batches
    const batches = data.pipe(
      chunk => {
        const size = Chunk.size(chunk)
        const batchCount = Math.ceil(size / concurrency)
        return Chunk.range(0, batchCount - 1).pipe(
          Chunk.map(i => chunk.pipe(
            Chunk.drop(i * concurrency),
            Chunk.take(concurrency)
          ))
        )
      }
    )
    
    for (const batch of Chunk.toReadonlyArray(batches)) {
      const batchResults = yield* Effect.all(
          Chunk.toReadonlyArray(batch).map(processor),
          { concurrency }
        )
      
      results = results.pipe(Chunk.appendAll(Chunk.fromIterable(batchResults)))
    }
    
    return results
  })

// Usage example
const efficientFileProcessing = () =>
  Effect.gen(function* () {
    const fileList = Chunk.range(1, 10000).pipe(
      Chunk.map(i => ({ id: i, filename: `file-${i}.txt`, size: Math.random() * 1024 }))
    )
    
    const processFile = (file: { id: number; filename: string; size: number }) =>
      Effect.gen(function* () {
        // Simulate file processing
        yield* Effect.sleep(`${file.size}ms`)
        return {
          ...file,
          processed: true,
          hash: `hash-${file.id}`
        }
      })
    
    console.log(`Processing ${Chunk.size(fileList)} files...`)
    
    const results = yield* processWithBackpressure(fileList, processFile, 50)
    
    console.log(`Processed ${Chunk.size(results)} files successfully`)
    return results
  })
```

### Pattern 2: Functional Data Transformations

```typescript
import { Chunk, pipe, Option, Either } from "effect"

// Functional pipeline pattern
const createDataPipeline = <A, B>(
  transformations: Array<(chunk: Chunk.Chunk<A>) => Chunk.Chunk<A>>
) => (data: Chunk.Chunk<A>): Chunk.Chunk<A> =>
  transformations.reduce((acc, transform) => transform(acc), data)

// Safe transformation with error handling
const safeTransform = <A, B>(
  chunk: Chunk.Chunk<A>,
  transform: (a: A) => Either.Either<B, Error>
): { successes: Chunk.Chunk<B>; errors: Chunk.Chunk<Error> } => {
  let successes = Chunk.empty<B>()
  let errors = Chunk.empty<Error>()
  
  Chunk.forEach(chunk, item => {
    const result = transform(item)
    if (Either.isRight(result)) {
      successes = Chunk.append(successes, result.right)
    } else {
      errors = Chunk.append(errors, result.left)
    }
  })
  
  return { successes, errors }
}

// Validation pipeline
const validateAndTransform = <A>(
  data: Chunk.Chunk<A>,
  validators: Array<(a: A) => boolean>,
  transformer: (a: A) => A
): Chunk.Chunk<A> =>
  data.pipe(
    Chunk.filter(item => validators.every(validate => validate(item))),
    Chunk.map(transformer)
  )

// Example usage
const dataTransformationExample = () => {
  interface RawUserData {
    id: string
    email: string
    age: string  // String from form input
    role?: string
  }
  
  interface ValidatedUser {
    id: string
    email: string
    age: number
    role: 'user' | 'admin'
  }
  
  const rawData = Chunk.make<RawUserData>(
    { id: '1', email: 'user1@example.com', age: '25', role: 'user' },
    { id: '2', email: 'invalid-email', age: '30', role: 'admin' },
    { id: '3', email: 'user3@example.com', age: 'invalid', role: 'user' },
    { id: '4', email: 'user4@example.com', age: '35' }, // Missing role
  )
  
  // Validation functions
  const validators = [
    (data: RawUserData) => data.email.includes('@'),
    (data: RawUserData) => !Number.isNaN(Number(data.age)),
    (data: RawUserData) => data.role === 'user' || data.role === 'admin'
  ]
  
  // Transform function
  const transformer = (data: RawUserData): ValidatedUser => ({
    id: data.id,
    email: data.email.toLowerCase(),
    age: Number(data.age),
    role: (data.role as 'user' | 'admin') || 'user'
  })
  
  const validatedUsers = validateAndTransform(rawData, validators, transformer)
  
  console.log('Valid users:', Chunk.toReadonlyArray(validatedUsers))
  console.log(`Validated ${Chunk.size(validatedUsers)} out of ${Chunk.size(rawData)} users`)
  
  return validatedUsers
}
```

### Pattern 3: Performance Optimization Strategies

```typescript
import { Chunk, pipe } from "effect"

// Benchmark helper for performance testing
const benchmark = <T>(
  name: string,
  operation: () => T
): T => {
  const start = performance.now()
  const result = operation()
  const end = performance.now()
  console.log(`${name}: ${end - start}ms`)
  return result
}

// Performance comparison patterns
const performanceComparisons = () => {
  const largeDataset = Chunk.range(1, 100_000)
  
  // Compare different approaches
  const chunkApproach = () =>
    largeDataset.pipe(
      Chunk.filter(x => x % 2 === 0),
      Chunk.map(x => x * x),
      Chunk.take(1000),
      Chunk.reduce(0, (sum, x) => sum + x)
    )
  
  const arrayApproach = () =>
    Array.from({ length: 100_000 }, (_, i) => i + 1)
      .filter(x => x % 2 === 0)
      .map(x => x * x)
      .slice(0, 1000)
      .reduce((sum, x) => sum + x, 0)
  
  const chunkResult = benchmark('Chunk approach', chunkApproach)
  const arrayResult = benchmark('Array approach', arrayApproach)
  
  console.log('Results equal:', chunkResult === arrayResult)
  
  return { chunkResult, arrayResult }
}

// Memory usage patterns
const memoryEfficientPatterns = () => {
  // Pattern 1: Avoid converting to arrays until necessary
  const processLargeChunk = (data: Chunk.Chunk<number>) => {
    // Keep as chunk throughout pipeline
    const processed = data.pipe(
      Chunk.filter(x => x > 50),
      Chunk.map(x => ({ value: x, squared: x * x })),
      Chunk.take(100)
    )
    
    // Only convert to array at the very end
    return Chunk.toReadonlyArray(processed)
  }
  
  // Pattern 2: Use chunk operations for bulk operations
  const bulkOperations = (chunks: Chunk.Chunk<Chunk.Chunk<number>>) =>
    chunks.pipe(
      Chunk.flatMap(chunk => chunk),  // Flatten efficiently
      Chunk.dedupe,                   // Remove duplicates
      Chunk.sort((a, b) => a - b)     // Sort once at the end
    )
  
  // Pattern 3: Lazy evaluation for early termination
  const findFirstMatch = <A>(
    data: Chunk.Chunk<A>,
    predicate: (a: A) => boolean
  ): Option.Option<A> =>
    data.pipe(
      Chunk.filter(predicate),
      Chunk.head  // Terminates early due to lazy evaluation
    )
  
  return {
    processLargeChunk,
    bulkOperations,
    findFirstMatch
  }
}
```

## Integration Examples

### Integration with Effect Ecosystem

```typescript
import { Chunk, Effect, Stream, Queue, pipe } from "effect"

// Integration with Effect streams
const chunkToStream = <A>(chunk: Chunk.Chunk<A>): Stream.Stream<A> =>
  Stream.fromIterable(chunk)

const streamToChunk = <A>(stream: Stream.Stream<A>): Effect.Effect<Chunk.Chunk<A>> =>
  Stream.runCollect(stream)

// Integration with queues for producer-consumer patterns
const chunkProcessingQueue = <A, B>(
  processor: (chunk: Chunk.Chunk<A>) => Effect.Effect<Chunk.Chunk<B>>,
  batchSize: number = 100
) =>
  Effect.gen(function* () {
    const inputQueue = yield* Queue.bounded<A>(1000)
    const outputQueue = yield* Queue.bounded<B>(1000)
    
    // Processor fiber that batches items from input queue
    const processorFiber = Effect.gen(function* () {
      let batch = Chunk.empty<A>()
      
      while (true) {
        const item = yield* Queue.take(inputQueue)
        batch = Chunk.append(batch, item)
        
        if (Chunk.size(batch) >= batchSize) {
          const processed = yield* processor(batch)
          yield* Effect.forEach(Chunk.toReadonlyArray(processed), item =>
            Queue.offer(outputQueue, item)
          )
          batch = Chunk.empty<A>()
        }
      }
    }).pipe(
      Effect.catchAll(() => Effect.void),
      Effect.fork
    )
    
    return { inputQueue, outputQueue, processorFiber }
  })

// Usage example
const demonstrateEffectIntegration = () =>
  Effect.gen(function* () {
    const data = Chunk.range(1, 1000)
    
    // Convert chunk to stream for processing
    const stream = chunkToStream(data)
    
    const processedStream = pipe(
      stream,
      Stream.map(x => x * 2),
      Stream.filter(x => x > 100),
      Stream.take(50)
    )
    
    // Collect back to chunk
    const result = yield* streamToChunk(processedStream)
    
    console.log(`Processed ${Chunk.size(result)} items`)
    return result
  })
```

### Integration with Popular Libraries

```typescript
import { Chunk, pipe, Effect } from "effect"

// Integration with RxJS-style reactive programming
interface Observable<T> {
  subscribe(observer: (value: T) => void): () => void
}

const chunkToObservable = <A>(chunk: Chunk.Chunk<A>): Observable<A> => ({
  subscribe: (observer) => {
    Chunk.forEach(chunk, observer)
    return () => {} // Cleanup function
  }
})

// Integration with async iterators
const chunkToAsyncIterable = <A>(
  chunk: Chunk.Chunk<A>,
  delayMs: number = 0
): AsyncIterable<A> => ({
  async *[Symbol.asyncIterator]() {
    for (const item of Chunk.toReadonlyArray(chunk)) {
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
      yield item
    }
  }
})

// Integration with Node.js streams
const chunkToNodeStream = <A>(chunk: Chunk.Chunk<A>) => {
  const { Readable } = require('stream')
  
  return new Readable({
    objectMode: true,
    read() {
      const items = Chunk.toReadonlyArray(chunk)
      for (const item of items) {
        this.push(item)
      }
      this.push(null) // End stream
    }
  })
}

// Integration with database operations
const batchDatabaseInsert = <T>(
  records: Chunk.Chunk<T>,
  insertFn: (batch: T[]) => Promise<void>,
  batchSize: number = 1000
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const batches = records.pipe(
      chunk => {
        const size = Chunk.size(chunk)
        const numBatches = Math.ceil(size / batchSize)
        return Chunk.range(0, numBatches - 1).pipe(
          Chunk.map(i => Chunk.drop(chunk, i * batchSize).pipe(
            Chunk.take(batchSize),
            Chunk.toReadonlyArray
          ))
        )
      }
    )
    
    yield* Effect.forEach(
      Chunk.toReadonlyArray(batches),
      batch => Effect.promise(() => insertFn(batch)),
      { concurrency: 5 }
    )
  })

// Usage examples
const demonstrateLibraryIntegrations = () => {
  const sampleData = Chunk.range(1, 100)
  
  // RxJS-style usage
  const observable = chunkToObservable(sampleData)
  observable.subscribe(value => {
    if (value % 10 === 0) {
      console.log(`Processed: ${value}`)
    }
  })
  
  // Async iterator usage
  const processAsyncIterable = async () => {
    const asyncIterable = chunkToAsyncIterable(
      Chunk.take(sampleData, 10),
      100 // 100ms delay
    )
    
    for await (const item of asyncIterable) {
      console.log(`Async item: ${item}`)
    }
  }
  
  return { processAsyncIterable }
}
```

### Testing Strategies

```typescript
import { Chunk, pipe, Effect } from "effect"

// Property-based testing helpers
const generateRandomChunk = (size: number, generator: () => number): Chunk.Chunk<number> =>
  Chunk.fromIterable(Array.from({ length: size }, generator))

// Test utilities for chunk operations
const chunkTestUtils = {
  // Verify chunk invariants
  verifyChunkInvariants: <A>(chunk: Chunk.Chunk<A>) => ({
    sizeIsNonNegative: Chunk.size(chunk) >= 0,
    emptyChunkHasSizeZero: Chunk.isEmpty(chunk) ? Chunk.size(chunk) === 0 : true,
    nonEmptyChunkHasPositiveSize: !Chunk.isEmpty(chunk) ? Chunk.size(chunk) > 0 : true
  }),
  
  // Test structural sharing (conceptual)
  testStructuralSharing: <A>(chunk: Chunk.Chunk<A>) => {
    const filtered = Chunk.filter(chunk, () => true) // Identity filter
    const mapped = Chunk.map(chunk, x => x) // Identity map
    
    // In a real implementation, these would share structure
    return {
      originalSize: Chunk.size(chunk),
      filteredSize: Chunk.size(filtered),
      mappedSize: Chunk.size(mapped),
      sizesEqual: Chunk.size(chunk) === Chunk.size(filtered) && 
                  Chunk.size(filtered) === Chunk.size(mapped)
    }
  },
  
  // Performance testing
  benchmarkChunkOperations: <A>(
    chunk: Chunk.Chunk<A>,
    operations: Array<{ name: string; op: (c: Chunk.Chunk<A>) => any }>
  ) => {
    return operations.map(({ name, op }) => {
      const start = performance.now()
      const result = op(chunk)
      const end = performance.now()
      
      return {
        name,
        duration: end - start,
        resultSize: Chunk.isChunk(result) ? Chunk.size(result) : 'N/A'
      }
    })
  }
}

// Example test suite
const chunkTestSuite = () => {
  const testChunk = Chunk.range(1, 1000)
  
  // Test basic operations
  console.log('=== Chunk Test Suite ===')
  
  // Invariant tests
  const invariants = chunkTestUtils.verifyChunkInvariants(testChunk)
  console.log('Invariants:', invariants)
  
  // Structural sharing tests
  const sharingTest = chunkTestUtils.testStructuralSharing(testChunk)
  console.log('Structural sharing:', sharingTest)
  
  // Performance benchmarks
  const benchmarks = chunkTestUtils.benchmarkChunkOperations(testChunk, [
    { name: 'map', op: c => Chunk.map(c, x => x * 2) },
    { name: 'filter', op: c => Chunk.filter(c, x => x % 2 === 0) },
    { name: 'take', op: c => Chunk.take(c, 100) },
    { name: 'sort', op: c => Chunk.sort(c, (a, b) => b - a) }
  ])
  
  console.log('Performance benchmarks:')
  benchmarks.forEach(b => 
    console.log(`  ${b.name}: ${b.duration.toFixed(2)}ms (size: ${b.resultSize})`)
  )
  
  // Property-based tests
  console.log('=== Property-Based Tests ===')
  
  const randomChunk = generateRandomChunk(100, () => Math.floor(Math.random() * 100))
  
  // Test: map preserves size
  const mapped = Chunk.map(randomChunk, x => x * 2)
  console.log('Map preserves size:', Chunk.size(randomChunk) === Chunk.size(mapped))
  
  // Test: filter reduces or maintains size
  const filtered = Chunk.filter(randomChunk, x => x > 50)
  console.log('Filter reduces size:', Chunk.size(filtered) <= Chunk.size(randomChunk))
  
  // Test: take never exceeds original size
  const taken = Chunk.take(randomChunk, 150)
  console.log('Take respects bounds:', Chunk.size(taken) <= Chunk.size(randomChunk))
  
  return {
    invariants,
    sharingTest,
    benchmarks,
    propertyTests: {
      mapPreservesSize: Chunk.size(randomChunk) === Chunk.size(mapped),
      filterReducesSize: Chunk.size(filtered) <= Chunk.size(randomChunk),
      takeRespectsBounds: Chunk.size(taken) <= Chunk.size(randomChunk)
    }
  }
}

// Mock testing for chunk-based operations
const mockChunkOperations = () => {
  // Mock a chunk-based service
  const mockDataService = {
    fetchBatch: (batchSize: number) => 
      Effect.succeed(generateRandomChunk(batchSize, () => Math.floor(Math.random() * 1000))),
    
    processBatch: (batch: Chunk.Chunk<number>) =>
      Effect.succeed(batch.pipe(
        Chunk.map(x => ({ original: x, processed: x * 2 + 1 }))
      ))
  }
  
  // Test the service
  const testDataService = Effect.gen(function* () {
    const batch = yield* mockDataService.fetchBatch(50)
    const processed = yield* mockDataService.processBatch(batch)
    
    return {
      batchSize: Chunk.size(batch),
      processedSize: Chunk.size(processed),
      sample: Chunk.toReadonlyArray(Chunk.take(processed, 3))
    }
  })
  
  return Effect.runSync(testDataService)
}

// Run tests
const runChunkTests = () => {
  const testResults = chunkTestSuite()
  const mockResults = mockChunkOperations()
  
  console.log('=== Mock Service Tests ===')
  console.log('Mock results:', mockResults)
  
  return { testResults, mockResults }
}
```

## Conclusion

Chunk provides high-performance immutable sequences with structural sharing and lazy evaluation for Effect applications.

Key benefits:
- **Memory Efficiency**: Structural sharing prevents unnecessary copying and reduces memory usage
- **Performance**: Lazy evaluation and optimized operations provide better performance than traditional arrays
- **Immutability**: Safe concurrent access without defensive copying or mutation concerns
- **Composability**: Rich API that integrates seamlessly with other Effect modules

Chunk is ideal for applications that process large datasets, require high-performance data transformations, or need memory-efficient collection operations while maintaining functional programming principles.