# Utils: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Utils Solves

When building complex Effect applications, developers often need utility functions for debugging, development helpers, random number generation, and low-level operations. Without centralized utilities, teams end up duplicating code or importing multiple external libraries:

```typescript
// Traditional approach - scattered utilities across different libraries
import { v4 as uuid } from 'uuid'
import seedrandom from 'seedrandom'
import debug from 'debug'

// Manual generator type checking
function isGenerator(fn: unknown): fn is GeneratorFunction {
  return typeof fn === 'function' && fn.constructor?.name === 'GeneratorFunction'
}

// Custom debugging utilities
const debugApp = debug('app')
const debugDb = debug('db')

// Inconsistent random number generation
const rng = seedrandom('my-seed')
const randomId = () => Math.random().toString(36).substring(7)

// Manual tracing and development helpers
const withTiming = <T>(name: string, fn: () => T): T => {
  const start = Date.now()
  try {
    return fn()
  } finally {
    console.log(`${name} took ${Date.now() - start}ms`)
  }
}
```

This approach leads to:
- **Inconsistent APIs** - Different utility libraries have different patterns
- **Bundle Bloat** - Multiple small dependencies for simple utilities
- **Poor Integration** - Utilities don't work well with Effect's type system
- **Development Friction** - No standardized debugging and development helpers

### The Utils Solution

Effect's Utils module provides essential utilities designed specifically for Effect applications, offering type-safe generator helpers, deterministic random number generation, and debugging utilities:

```typescript
import { Utils, Effect } from "effect"

// Type-safe generator utilities
const myGenerator = function* () {
  yield* Effect.succeed(1)
  yield* Effect.succeed(2)
  return 3
}

// Check if function is a generator
if (Utils.isGeneratorFunction(myGenerator)) {
  // TypeScript knows this is a generator function
  const gen = myGenerator()
}

// Deterministic random number generation
const rng = new Utils.PCGRandom(12345) // seeded for reproducibility
const randomFloat = rng.number()
const randomInt = rng.integer(100)

// Development and debugging utilities
const result = Utils.internalCall(() => {
  // Code that should be optimized away in production
  return performExpensiveDebugging()
})
```

### Key Concepts

**Generator Utilities**: Type-safe helpers for working with generator functions and Effect.gen patterns

**Deterministic Random**: PCGRandom provides reproducible random number generation for testing and simulations

**Development Helpers**: Tools for debugging, profiling, and development-time utilities that can be optimized away

## Basic Usage Patterns

### Pattern 1: Generator Type Checking

```typescript
import { Utils, Effect } from "effect"

// Check if a function is a generator
const checkGeneratorType = (fn: unknown) => {
  if (Utils.isGeneratorFunction(fn)) {
    // TypeScript knows fn is a generator function
    console.log("This is a generator function")
    return true
  }
  return false
}

// Usage with Effect.gen
const myEffect = Effect.gen(function* () {
  const value = yield* Effect.succeed(42)
  return value * 2
})

console.log(checkGeneratorType(myEffect)) // false - Effect.gen returns an Effect
console.log(checkGeneratorType(function* () {})) // true
```

### Pattern 2: Seeded Random Generation

```typescript
import { Utils } from "effect"

// Create a seeded random number generator
const createSeededRng = (seed: number) => {
  const rng = new Utils.PCGRandom(seed)
  
  return {
    float: () => rng.number(),
    integer: (max: number) => rng.integer(max),
    boolean: () => rng.number() > 0.5,
    pick: <T>(items: T[]): T => items[rng.integer(items.length)]!
  }
}

// Usage
const rng = createSeededRng(12345)
console.log(rng.float()) // Always the same value for seed 12345
console.log(rng.integer(100)) // Deterministic integer 0-99
console.log(rng.pick(['red', 'green', 'blue'])) // Deterministic selection
```

### Pattern 3: Development Utilities

```typescript
import { Utils, Effect } from "effect"

// Development-time profiling that can be optimized away
const withProfiling = <A>(name: string, effect: Effect.Effect<A>) =>
  Effect.gen(function* () {
    const start = Date.now()
    const result = yield* effect
    
    // This call can be optimized away in production
    Utils.internalCall(() => {
      console.log(`${name} took ${Date.now() - start}ms`)
    })
    
    return result
  })

// Usage
const expensiveOperation = Effect.gen(function* () {
  yield* Effect.sleep("100 millis")
  return "completed"
})

const profiledOperation = withProfiling("database-query", expensiveOperation)
```

## Real-World Examples

### Example 1: Testing with Deterministic Random Data

When writing tests that need random data, deterministic generation ensures reproducible results:

```typescript
import { Utils, Effect, Array as Arr } from "effect"

// Test data generator with deterministic randomness
class TestDataGenerator {
  private rng: Utils.PCGRandom

  constructor(seed: number = 12345) {
    this.rng = new Utils.PCGRandom(seed)
  }

  generateUser() {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones']
    const domains = ['example.com', 'test.org', 'demo.net']

    const firstName = firstNames[this.rng.integer(firstNames.length)]!
    const lastName = lastNames[this.rng.integer(lastNames.length)]!
    const domain = domains[this.rng.integer(domains.length)]!
    
    return {
      id: this.rng.integer(100000),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      age: 18 + this.rng.integer(50),
      isActive: this.rng.number() > 0.3
    }
  }

  generateUsers(count: number) {
    return Array.from({ length: count }, () => this.generateUser())
  }

  // Reset generator state for consistent test runs
  reset(seed: number = 12345) {
    this.rng = new Utils.PCGRandom(seed)
  }
}

// Usage in tests
const generator = new TestDataGenerator(42) // Fixed seed for reproducible tests

const testUsers = generator.generateUsers(10)
console.log(testUsers[0]) // Always the same user for seed 42

// In different test suites, reset with different seeds
generator.reset(100)
const differentUsers = generator.generateUsers(5)
```

### Example 2: Game Development with Procedural Generation

Deterministic random generation is crucial for games that need reproducible worlds:

```typescript
import { Utils, Effect } from "effect"

interface GameWorld {
  seed: number
  terrain: TerrainTile[][]
  npcs: NPC[]
  items: Item[]
}

interface TerrainTile {
  type: 'grass' | 'water' | 'mountain' | 'forest'
  elevation: number
}

interface NPC {
  id: string
  name: string
  position: { x: number; y: number }
  level: number
}

interface Item {
  type: 'sword' | 'potion' | 'gold' | 'armor'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  position: { x: number; y: number }
}

class WorldGenerator {
  private rng: Utils.PCGRandom

  constructor(seed: number) {
    this.rng = new Utils.PCGRandom(seed)
  }

  generateWorld(width: number, height: number): Effect.Effect<GameWorld> {
    return Effect.gen(function* () {
      const terrain = yield* Effect.sync(() => this.generateTerrain(width, height))
      const npcs = yield* Effect.sync(() => this.generateNPCs(10))
      const items = yield* Effect.sync(() => this.generateItems(50, width, height))

      return {
        seed: this.rng.getState()[0]!,
        terrain,
        npcs,
        items
      }
    }.bind(this))
  }

  private generateTerrain(width: number, height: number): TerrainTile[][] {
    const terrain: TerrainTile[][] = []
    
    for (let y = 0; y < height; y++) {
      terrain[y] = []
      for (let x = 0; x < width; x++) {
        const terrainTypes: TerrainTile['type'][] = ['grass', 'water', 'mountain', 'forest']
        const type = terrainTypes[this.rng.integer(terrainTypes.length)]!
        const elevation = this.rng.number() * 100
        
        terrain[y]![x] = { type, elevation }
      }
    }
    
    return terrain
  }

  private generateNPCs(count: number): NPC[] {
    const names = ['Gandalf', 'Aragorn', 'Legolas', 'Gimli', 'Frodo', 'Sam', 'Meriadoc', 'Peregrin']
    
    return Array.from({ length: count }, (_, i) => ({
      id: `npc-${i}`,
      name: names[this.rng.integer(names.length)]!,
      position: {
        x: this.rng.integer(1000),
        y: this.rng.integer(1000)
      },
      level: 1 + this.rng.integer(50)
    }))
  }

  private generateItems(count: number, worldWidth: number, worldHeight: number): Item[] {
    const itemTypes: Item['type'][] = ['sword', 'potion', 'gold', 'armor']
    const rarities: Item['rarity'][] = ['common', 'rare', 'epic', 'legendary']
    
    return Array.from({ length: count }, () => {
      const rarityRoll = this.rng.number()
      let rarity: Item['rarity']
      
      if (rarityRoll < 0.6) rarity = 'common'
      else if (rarityRoll < 0.85) rarity = 'rare'
      else if (rarityRoll < 0.97) rarity = 'epic'
      else rarity = 'legendary'
      
      return {
        type: itemTypes[this.rng.integer(itemTypes.length)]!,
        rarity,
        position: {
          x: this.rng.integer(worldWidth),
          y: this.rng.integer(worldHeight)
        }
      }
    })
  }
}

// Usage - same seed always generates the same world
const generator = new WorldGenerator(12345)
const worldProgram = generator.generateWorld(100, 100)

Effect.runPromise(worldProgram).then(world => {
  console.log(`Generated world with ${world.terrain.length}x${world.terrain[0]!.length} terrain`)
  console.log(`Found ${world.npcs.length} NPCs and ${world.items.length} items`)
  
  // Count legendary items
  const legendaryItems = world.items.filter(item => item.rarity === 'legendary')
  console.log(`Legendary items: ${legendaryItems.length}`)
})
```

### Example 3: Development Debugging and Performance Monitoring

Using Utils for development-time debugging that can be optimized away in production:

```typescript
import { Utils, Effect, Logger } from "effect"

// Development-time performance monitoring
class DevProfiler {
  private static timers = new Map<string, number>()
  
  static startTimer(name: string): Effect.Effect<void> {
    return Effect.sync(() => {
      Utils.internalCall(() => {
        DevProfiler.timers.set(name, Date.now())
        console.log(`🔄 Started timer: ${name}`)
      })
    })
  }
  
  static endTimer(name: string): Effect.Effect<number> {
    return Effect.sync(() => {
      return Utils.internalCall(() => {
        const start = DevProfiler.timers.get(name)
        if (!start) {
          console.warn(`⚠️  Timer '${name}' was not started`)
          return 0
        }
        
        const duration = Date.now() - start
        DevProfiler.timers.delete(name)
        console.log(`✅ Timer '${name}': ${duration}ms`)
        return duration
      })
    })
  }
}

// Database service with development profiling
class DatabaseService {
  findUser(id: string): Effect.Effect<User | null> {
    return Effect.gen(function* () {
      yield* DevProfiler.startTimer(`findUser-${id}`)
      
      // Simulate database query
      yield* Effect.sleep("50 millis")
      const user = yield* Effect.succeed({ id, name: `User ${id}` })
      
      const duration = yield* DevProfiler.endTimer(`findUser-${id}`)
      
      // Log slow queries in development
      Utils.internalCall(() => {
        if (duration > 100) {
          console.warn(`🐌 Slow query detected: findUser(${id}) took ${duration}ms`)
        }
      })
      
      return user
    })
  }
  
  findUsers(ids: string[]): Effect.Effect<User[]> {
    return Effect.gen(function* () {
      yield* DevProfiler.startTimer(`findUsers-batch-${ids.length}`)
      
      // Process in parallel with individual timing
      const users = yield* Effect.all(
        ids.map(id => this.findUser(id)),
        { concurrency: 5 }
      )
      
      yield* DevProfiler.endTimer(`findUsers-batch-${ids.length}`)
      return users.filter(user => user !== null)
    })
  }
}

interface User {
  id: string
  name: string
}

// Usage with automatic profiling
const dbService = new DatabaseService()

const program = Effect.gen(function* () {
  const userIds = ['1', '2', '3', '4', '5']
  const users = yield* dbService.findUsers(userIds)
  
  Utils.internalCall(() => {
    console.log(`Found ${users.length} users`)
  })
  
  return users
})

Effect.runPromise(program)
```

## Advanced Features Deep Dive

### Advanced Random Number Generation

The PCGRandom class provides sophisticated random number generation with state management:

#### PCG State Management

```typescript
import { Utils } from "effect"

// Advanced random number generator with state persistence
class StatefulRandom {
  private rng: Utils.PCGRandom
  
  constructor(seed?: number) {
    this.rng = new Utils.PCGRandom(seed)
  }
  
  // Save current state for later restoration
  saveState(): Utils.PCGRandomState {
    return this.rng.getState()
  }
  
  // Restore a previously saved state
  restoreState(state: Utils.PCGRandomState): void {
    this.rng.setState(state)
  }
  
  // Generate random numbers with specific distributions
  normal(mean: number = 0, stdDev: number = 1): number {
    // Box-Muller transformation for normal distribution
    let u = 0, v = 0
    while (u === 0) u = this.rng.number() // Converting [0,1) to (0,1)
    while (v === 0) v = this.rng.number()
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return z * stdDev + mean
  }
  
  // Generate random numbers with exponential distribution
  exponential(lambda: number = 1): number {
    return -Math.log(1 - this.rng.number()) / lambda
  }
  
  // Weighted random selection
  weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error("Items and weights arrays must have the same length")
    }
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = this.rng.number() * totalWeight
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i]!
      if (random <= 0) {
        return items[i]!
      }
    }
    
    return items[items.length - 1]!
  }
}

// Usage example
const rng = new StatefulRandom(42)

// Save state before generating numbers
const savedState = rng.saveState()

// Generate some random numbers
console.log("Normal distribution:", rng.normal(100, 15))
console.log("Exponential distribution:", rng.exponential(0.5))

const choices = ['red', 'green', 'blue']
const weights = [0.5, 0.3, 0.2] // 50% red, 30% green, 20% blue
console.log("Weighted choice:", rng.weightedChoice(choices, weights))

// Restore state to generate the same sequence again
rng.restoreState(savedState)
console.log("Same normal distribution:", rng.normal(100, 15))
```

#### Advanced Generator Utilities

Working with generator functions and Effect patterns:

```typescript
import { Utils, Effect } from "effect"

// Advanced generator detection and manipulation
class GeneratorUtils {
  // Check if a value is a generator function and execute it safely
  static executeIfGenerator<T>(
    fn: unknown,
    ...args: unknown[]
  ): Effect.Effect<T | null> {
    return Effect.gen(function* () {
      if (!Utils.isGeneratorFunction(fn)) {
        return null
      }
      
      try {
        // TypeScript now knows fn is a generator function
        const generator = fn(...args)
        let result = generator.next()
        
        while (!result.done) {
          // Handle yielded values (simplified for example)
          result = generator.next()
        }
        
        return result.value as T
      } catch (error) {
        return yield* Effect.fail(new Error(`Generator execution failed: ${error}`))
      }
    })
  }
  
  // Create an adapter for custom generator types
  static createAdapter<F extends Utils.TypeLambda>() {
    return Utils.adapter<F>()
  }
  
  // Check if a value has GenKind characteristics
  static isGenKindLike(value: unknown): boolean {
    return Utils.isGenKind(value)
  }
}

// Example usage with dynamic function execution
const dynamicFunction = function* (x: number) {
  yield x * 2
  yield x * 3
  return x * 4
}

const program = Effect.gen(function* () {
  const result = yield* GeneratorUtils.executeIfGenerator<number>(dynamicFunction, 5)
  
  if (result !== null) {
    console.log(`Generator result: ${result}`) // 20
  } else {
    console.log("Not a generator function")
  }
})

Effect.runPromise(program)
```

### Advanced Development Utilities

#### Structural Region Testing

Using experimental structural region features for advanced testing scenarios:

```typescript
import { Utils, Effect, Equal } from "effect"

// Advanced testing utilities using structural regions
class TestingUtils {
  // Custom equality testing in structural regions
  static withCustomEquality<A>(
    customTester: (a: unknown, b: unknown) => boolean,
    body: () => A
  ): A {
    return Utils.structuralRegion(body, customTester)
  }
  
  // Test effects with custom equality semantics
  static testEffectEquality<A>(
    effect1: Effect.Effect<A>,
    effect2: Effect.Effect<A>,
    customTester?: (a: unknown, b: unknown) => boolean
  ): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const [result1, result2] = yield* Effect.all([effect1, effect2])
      
      return Utils.structuralRegion(() => {
        return Equal.equals(result1, result2)
      }, customTester)
    })
  }
}

// Example: Testing with approximate floating-point equality
const approximateEqual = (a: unknown, b: unknown): boolean => {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.0001
  }
  return a === b
}

const testProgram = Effect.gen(function* () {
  const effect1 = Effect.succeed(0.1 + 0.2)
  const effect2 = Effect.succeed(0.3)
  
  const areEqual = yield* TestingUtils.testEffectEquality(
    effect1,
    effect2,
    approximateEqual
  )
  
  console.log(`Effects are equal: ${areEqual}`) // true with custom tester
  
  // Without custom tester, floating point precision would make this false
  const strictEqual = yield* TestingUtils.testEffectEquality(effect1, effect2)
  console.log(`Effects are strictly equal: ${strictEqual}`) // false
})

Effect.runPromise(testProgram)
```

## Practical Patterns & Best Practices

### Pattern 1: Deterministic Testing Infrastructure

```typescript
import { Utils, Effect } from "effect"

// Comprehensive testing infrastructure with deterministic randomness
class TestInfrastructure {
  private rng: Utils.PCGRandom
  private testId: string
  
  constructor(seed: number, testId: string) {
    this.rng = new Utils.PCGRandom(seed)
    this.testId = testId
  }
  
  // Generate test data that's consistent across test runs
  generateTestData<T>(factory: (rng: Utils.PCGRandom) => T): T {
    return Utils.internalCall(() => {
      console.log(`Generating test data for ${this.testId}`)
      return factory(this.rng)
    })
  }
  
  // Create mock services with deterministic behavior
  createMockService<T>(
    serviceFactory: (rng: Utils.PCGRandom) => T
  ): Effect.Effect<T> {
    return Effect.sync(() => this.generateTestData(serviceFactory))
  }
  
  // Verify deterministic behavior across multiple runs
  verifyDeterministic<A>(
    operation: (rng: Utils.PCGRandom) => A,
    iterations: number = 3
  ): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const results: A[] = []
      
      for (let i = 0; i < iterations; i++) {
        // Reset RNG to same state for each iteration
        const tempRng = new Utils.PCGRandom(this.rng.getState()[0])
        results.push(operation(tempRng))
      }
      
      // Check if all results are identical
      const firstResult = results[0]
      return results.every(result => 
        Utils.structuralRegion(() => Equal.equals(result, firstResult))
      )
    }.bind(this))
  }
}

// Usage in test suites
const createTestSuite = (testName: string, seed: number = 12345) => {
  const infrastructure = new TestInfrastructure(seed, testName)
  
  return {
    infrastructure,
    
    // Generate consistent test users
    generateUser: () => infrastructure.generateTestData(rng => ({
      id: rng.integer(10000),
      name: `User${rng.integer(1000)}`,
      email: `user${rng.integer(1000)}@test.com`,
      age: 18 + rng.integer(50)
    })),
    
    // Create mock external services
    createMockExternalService: () => infrastructure.createMockService(rng => ({
      apiCall: (endpoint: string) => Effect.succeed({
        status: rng.number() > 0.1 ? 200 : 500,
        data: `Mock response for ${endpoint}`,
        latency: 50 + rng.integer(200)
      })
    }))
  }
}
```

### Pattern 2: Performance Monitoring Helpers

```typescript
import { Utils, Effect, Ref } from "effect"

// Performance monitoring that's optimized away in production
class PerformanceMonitor {
  private static metrics = new Map<string, number[]>()
  
  // Time an operation and collect metrics
  static time<A>(
    operationName: string,
    effect: Effect.Effect<A>
  ): Effect.Effect<A> {
    return Effect.gen(function* () {
      const start = yield* Effect.sync(() => Date.now())
      const result = yield* effect
      const duration = yield* Effect.sync(() => Date.now() - start)
      
      // Collect metrics only in development
      yield* Effect.sync(() => {
        Utils.internalCall(() => {
          const existing = PerformanceMonitor.metrics.get(operationName) || []
          existing.push(duration)
          PerformanceMonitor.metrics.set(operationName, existing)
          
          // Log if operation is slow
          if (duration > 1000) {
            console.warn(`🐌 Slow operation: ${operationName} took ${duration}ms`)
          }
        })
      })
      
      return result
    })
  }
  
  // Get performance statistics
  static getStats(): Effect.Effect<Record<string, {
    count: number
    average: number
    min: number
    max: number
    total: number
  }>> {
    return Effect.sync(() => {
      return Utils.internalCall(() => {
        const stats: Record<string, any> = {}
        
        for (const [operation, times] of PerformanceMonitor.metrics) {
          const count = times.length
          const total = times.reduce((sum, time) => sum + time, 0)
          const average = total / count
          const min = Math.min(...times)
          const max = Math.max(...times)
          
          stats[operation] = { count, average, min, max, total }
        }
        
        return stats
      })
    })
  }
  
  // Clear metrics
  static clearMetrics(): Effect.Effect<void> {
    return Effect.sync(() => {
      Utils.internalCall(() => {
        PerformanceMonitor.metrics.clear()
      })
    })
  }
}

// Helper for monitoring function performance
const withPerformanceMonitoring = <Args extends readonly unknown[], A>(
  name: string,
  fn: (...args: Args) => Effect.Effect<A>
) => {
  return (...args: Args): Effect.Effect<A> => {
    return PerformanceMonitor.time(name, fn(...args))
  }
}

// Usage example
const expensiveCalculation = withPerformanceMonitoring(
  "fibonacci-calculation",
  (n: number) => Effect.gen(function* () {
    // Simulate expensive calculation
    yield* Effect.sleep(`${n * 10} millis`)
    return n * n
  })
)

const program = Effect.gen(function* () {
  // Perform multiple operations
  yield* expensiveCalculation(5)
  yield* expensiveCalculation(10)
  yield* expensiveCalculation(3)
  
  // Get performance stats
  const stats = yield* PerformanceMonitor.getStats()
  console.log("Performance Stats:", stats)
})

Effect.runPromise(program)
```

### Pattern 3: Debugging and Development Helpers

```typescript
import { Utils, Effect, Logger } from "effect"

// Comprehensive debugging utilities
class DebugUtils {
  // Create debug-only effects that are optimized away
  static debug(message: string, data?: unknown): Effect.Effect<void> {
    return Effect.sync(() => {
      Utils.internalCall(() => {
        console.log(`🐛 [DEBUG] ${message}`, data || '')
      })
    })
  }
  
  // Conditional debugging based on environment
  static debugIf(
    condition: boolean,
    message: string,
    data?: unknown
  ): Effect.Effect<void> {
    return condition ? DebugUtils.debug(message, data) : Effect.void
  }
  
  // Trace effect execution with detailed logging
  static trace<A>(
    name: string,
    effect: Effect.Effect<A>
  ): Effect.Effect<A> {
    return Effect.gen(function* () {
      yield* DebugUtils.debug(`Entering ${name}`)
      
      try {
        const result = yield* effect
        yield* DebugUtils.debug(`Exiting ${name}`, result)
        return result
      } catch (error) {
        yield* DebugUtils.debug(`Error in ${name}`, error)
        throw error
      }
    })
  }
  
  // Memory usage debugging
  static memoryUsage(label: string): Effect.Effect<void> {
    return Effect.sync(() => {
      Utils.internalCall(() => {
        if (typeof process !== 'undefined' && process.memoryUsage) {
          const usage = process.memoryUsage()
          console.log(`📊 [MEMORY] ${label}:`, {
            rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`
          })
        }
      })
    })
  }
}

// Development-only effect combinators
const withDebugInfo = <A>(
  name: string,
  effect: Effect.Effect<A>
): Effect.Effect<A> => {
  return Effect.gen(function* () {
    yield* DebugUtils.memoryUsage(`Before ${name}`)
    const result = yield* DebugUtils.trace(name, effect)
    yield* DebugUtils.memoryUsage(`After ${name}`)
    return result
  })
}

// Usage in development
const developmentProgram = Effect.gen(function* () {
  yield* DebugUtils.debug("Starting application")
  
  const result = yield* withDebugInfo("user-processing", Effect.gen(function* () {
    const users = yield* Effect.succeed(['Alice', 'Bob', 'Charlie'])
    yield* DebugUtils.debug("Processing users", users)
    
    return users.map(user => `Hello, ${user}!`)
  }))
  
  yield* DebugUtils.debugIf(result.length > 2, "Many users processed", result.length)
  yield* DebugUtils.debug("Application completed")
  
  return result
})

Effect.runPromise(developmentProgram)
```

## Integration Examples

### Integration with Effect Testing Framework

```typescript
import { Utils, Effect, TestContext, TestServices } from "effect"

// Deterministic test utilities integrated with Effect's testing framework
class EffectTestUtils {
  // Create test environment with seeded randomness
  static createTestEnvironment(seed: number = 12345) {
    const rng = new Utils.PCGRandom(seed)
    
    return {
      rng,
      
      // Generate test data with Effect integration
      generateTestData: <T>(factory: (rng: Utils.PCGRandom) => T): Effect.Effect<T> =>
        Effect.sync(() => factory(rng)),
      
      // Create deterministic delays for testing
      createDeterministicDelay: (): Effect.Effect<number> =>
        Effect.sync(() => rng.integer(100) + 10), // 10-110ms
      
      // Test with controlled randomness
      withControlledRandom: <A>(effect: Effect.Effect<A>): Effect.Effect<A> =>
        Effect.provideService(effect, TestContext.TestContext, TestContext.make({
          random: {
            next: () => rng.number(),
            nextInt: (max: number) => rng.integer(max)
          }
        }))
    }
  }
  
  // Property-based testing with deterministic random data
  static property<A>(
    name: string,
    generator: (rng: Utils.PCGRandom) => A,
    predicate: (value: A) => Effect.Effect<boolean>,
    iterations: number = 100,
    seed: number = 12345
  ): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const rng = new Utils.PCGRandom(seed)
      
      for (let i = 0; i < iterations; i++) {
        const testValue = generator(rng)
        const result = yield* predicate(testValue)
        
        if (!result) {
          yield* DebugUtils.debug(`Property failed for value:`, testValue)
          return false
        }
      }
      
      yield* DebugUtils.debug(`Property ${name} passed ${iterations} tests`)
      return true
    })
  }
}

// Example: Testing a sorting function with property-based testing
const testSortFunction = EffectTestUtils.property(
  "sort maintains all elements",
  (rng) => {
    // Generate random array
    const length = rng.integer(20) + 1
    return Array.from({ length }, () => rng.integer(100))
  },
  (array) => Effect.gen(function* () {
    const sorted = [...array].sort((a, b) => a - b)
    
    // Property: sorted array has same length
    if (sorted.length !== array.length) return false
    
    // Property: sorted array is actually sorted
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]! < sorted[i - 1]!) return false
    }
    
    // Property: sorted array contains same elements
    const originalCounts = new Map<number, number>()
    const sortedCounts = new Map<number, number>()
    
    for (const num of array) {
      originalCounts.set(num, (originalCounts.get(num) || 0) + 1)
    }
    
    for (const num of sorted) {
      sortedCounts.set(num, (sortedCounts.get(num) || 0) + 1)
    }
    
    for (const [num, count] of originalCounts) {
      if (sortedCounts.get(num) !== count) return false
    }
    
    return true
  })
)

// Run property-based test
Effect.runPromise(testSortFunction).then(passed => {
  console.log(`Sort function test ${passed ? 'PASSED' : 'FAILED'}`)
})
```

### Integration with Custom Logging Systems

```typescript
import { Utils, Effect, Logger, LogLevel } from "effect"

// Custom logging system that integrates with Utils debugging
class CustomLogger {
  private logId: number = 0
  
  // Enhanced logging with development utilities
  createLogger(namespace: string) {
    return {
      info: (message: string, data?: unknown) => this.log('INFO', namespace, message, data),
      warn: (message: string, data?: unknown) => this.log('WARN', namespace, message, data),
      error: (message: string, data?: unknown) => this.log('ERROR', namespace, message, data),
      debug: (message: string, data?: unknown) => this.debugLog(namespace, message, data)
    }
  }
  
  private log(
    level: string,
    namespace: string,
    message: string,
    data?: unknown
  ): Effect.Effect<void> {
    return Effect.gen(function* () {
      const timestamp = new Date().toISOString()
      const id = ++this.logId
      
      yield* Effect.sync(() => {
        console.log(`[${timestamp}] ${level} [${namespace}] (#${id}) ${message}`, data || '')
      })
      
      // Development-only detailed logging
      yield* Effect.sync(() => {
        Utils.internalCall(() => {
          if (level === 'ERROR') {
            console.trace(`Error trace for log #${id}`)
          }
        })
      })
    }.bind(this))
  }
  
  private debugLog(
    namespace: string,
    message: string,
    data?: unknown
  ): Effect.Effect<void> {
    return Effect.sync(() => {
      Utils.internalCall(() => {
        const timestamp = new Date().toISOString()
        console.log(`[${timestamp}] DEBUG [${namespace}] ${message}`, data || '')
      })
    })
  }
}

// Service that uses enhanced logging
class UserService {
  private logger = new CustomLogger().createLogger('UserService')
  private rng = new Utils.PCGRandom(Date.now())
  
  processUser(userId: string): Effect.Effect<string> {
    return Effect.gen(function* () {
      yield* this.logger.info(`Processing user ${userId}`)
      
      // Simulate some processing with random delays
      const delay = this.rng.integer(100) + 50
      yield* Effect.sleep(`${delay} millis`)
      
      // Random success/failure for demonstration
      if (this.rng.number() > 0.8) {
        yield* this.logger.error(`Failed to process user ${userId}`, { delay })
        return yield* Effect.fail(new Error(`Processing failed for user ${userId}`))
      }
      
      yield* this.logger.debug(`User processing details`, { userId, delay })
      yield* this.logger.info(`Successfully processed user ${userId}`)
      
      return `User ${userId} processed successfully`
    }.bind(this))
  }
}

// Usage with error handling and logging
const program = Effect.gen(function* () {
  const userService = new UserService()
  const userIds = ['user1', 'user2', 'user3', 'user4', 'user5']
  
  const results = yield* Effect.all(
    userIds.map(id => 
      userService.processUser(id).pipe(
        Effect.orElse(() => Effect.succeed(`Failed: ${id}`))
      )
    ),
    { concurrency: 2 }
  )
  
  return results
})

Effect.runPromise(program).then(results => {
  console.log('Final results:', results)
})
```

## Conclusion

Utils provides essential utilities for productive Effect development, offering type-safe generator helpers, deterministic random number generation, and debugging utilities that integrate seamlessly with Effect's ecosystem.

Key benefits:
- **Type Safety**: All utilities work with Effect's type system and provide compile-time guarantees
- **Performance**: Development utilities can be optimized away in production builds
- **Determinism**: PCGRandom enables reproducible testing and simulation scenarios
- **Integration**: Designed specifically for Effect applications with consistent APIs

Utils is particularly valuable for testing infrastructure, game development, simulation applications, and any scenario requiring deterministic behavior or sophisticated development tooling.