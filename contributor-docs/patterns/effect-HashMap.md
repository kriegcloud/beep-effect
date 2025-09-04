# HashMap: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem HashMap Solves

JavaScript's native Map and Object collections have limitations when building functional, immutable applications. Traditional approaches require manual copying for immutability, lack structural sharing, and don't integrate well with Effect's type system:

```typescript
// Traditional approach - mutable Map with manual immutability
class UserCache {
  private cache = new Map<string, User>()
  
  addUser(user: User): UserCache {
    // Manual copying for immutability
    const newCache = new Map(this.cache)
    newCache.set(user.id, user)
    return new UserCache(newCache)
  }
  
  updateUser(id: string, updates: Partial<User>): UserCache {
    const existing = this.cache.get(id)
    if (!existing) {
      throw new Error(`User ${id} not found`)
    }
    
    // More manual copying
    const newCache = new Map(this.cache)
    newCache.set(id, { ...existing, ...updates })
    return new UserCache(newCache)
  }
  
  removeUser(id: string): UserCache {
    // Even deletion requires full copy
    const newCache = new Map(this.cache)
    newCache.delete(id)
    return new UserCache(newCache)
  }
  
  private constructor(cache?: Map<string, User>) {
    if (cache) this.cache = cache
  }
}

// Memory inefficient - every operation copies entire map
const cache1 = new UserCache()
const cache2 = cache1.addUser({ id: '1', name: 'Alice', email: 'alice@example.com' })
const cache3 = cache2.addUser({ id: '2', name: 'Bob', email: 'bob@example.com' })
// Three separate full copies of the map in memory

// Object approach has similar issues
const updateUserRecord = (users: Record<string, User>, id: string, updates: Partial<User>) => {
  const existing = users[id]
  if (!existing) {
    throw new Error(`User ${id} not found`)
  }
  
  // Spread operator creates new object, but doesn't prevent mutations
  return {
    ...users,
    [id]: { ...existing, ...updates }
  }
}
```

This approach leads to:
- **Memory waste** - Full copying for every change, no structural sharing
- **Performance degradation** - O(n) copying operations for every modification
- **Type safety issues** - No built-in validation or transformation capabilities
- **Poor composability** - Difficult to chain operations or integrate with functional patterns

### The HashMap Solution

HashMap provides a persistent, immutable hash map with structural sharing, optimized for functional programming patterns:

```typescript
import { HashMap } from "effect"
import { pipe } from "effect"

// Immutable HashMap with structural sharing
const createUserCache = () => {
  const empty = HashMap.empty<string, User>()
  
  const withUsers = empty.pipe(
    HashMap.set('1', { id: '1', name: 'Alice', email: 'alice@example.com' }),
    HashMap.set('2', { id: '2', name: 'Bob', email: 'bob@example.com' }),
    HashMap.set('3', { id: '3', name: 'Charlie', email: 'charlie@example.com' })
  )
  
  // Structural sharing - minimal memory overhead
  const updated = withUsers.pipe(
    HashMap.modify('1', user => ({ ...user, name: 'Alice Smith' }))
  )
  
  const removed = HashMap.remove(updated, '2')
  
  return { original: withUsers, updated, removed }
}

// Efficient bulk operations
const processBatchUpdates = (
  users: HashMap.HashMap<string, User>,
  updates: Array<{ id: string; changes: Partial<User> }>
): HashMap.HashMap<string, User> =>
  updates.reduce(
    (acc, { id, changes }) => acc.pipe(
      HashMap.modifyOption(id, user => ({ ...user, ...changes }))
    ),
    users
  )
```

### Key Concepts

**Structural Sharing**: HashMap shares common structure between versions, making "copies" very memory efficient.

**Persistent Data Structure**: Operations return new HashMaps without modifying the original, enabling safe sharing across contexts.

**Hash-based Lookup**: O(1) average-case performance for get, set, and delete operations using efficient hashing.

## Basic Usage Patterns

### Pattern 1: Creating and Initializing HashMaps

```typescript
import { HashMap } from "effect"

// Empty HashMap
const empty = HashMap.empty<string, number>()

// From key-value pairs
const fromEntries = HashMap.fromIterable([
  ['apple', 1],
  ['banana', 2],
  ['cherry', 3]
])

// Using make for small maps
const small = HashMap.make(
  ['x', 10],
  ['y', 20],
  ['z', 30]
)

// From Record
const fromRecord = HashMap.fromRecord({
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF'
})

// From Map
const nativeMap = new Map([['a', 1], ['b', 2]])
const fromMap = HashMap.fromIterable(nativeMap)
```

### Pattern 2: Basic Operations

```typescript
import { HashMap, pipe, Option } from "effect"

const colors = HashMap.make(
  ['red', '#FF0000'],
  ['green', '#00FF00'],
  ['blue', '#0000FF']
)

// Getting values (safe)
const red = HashMap.get(colors, 'red')        // Option.some('#FF0000')
const purple = HashMap.get(colors, 'purple')  // Option.none()

// Getting values (unsafe - throws if missing)
const redUnsafe = HashMap.unsafeGet(colors, 'red') // '#FF0000'

// Checking existence
const hasRed = HashMap.has(colors, 'red')     // true
const hasYellow = HashMap.has(colors, 'yellow') // false

// Setting values
const withYellow = colors.pipe(
  HashMap.set('yellow', '#FFFF00')
)

// Modifying existing values
const brighterRed = colors.pipe(
  HashMap.modify('red', color => color.toUpperCase())
)

// Safe modification (only if key exists)
const maybeModified = colors.pipe(
  HashMap.modifyOption('purple', color => color.toUpperCase()) // No change
)

// Removing values
const withoutBlue = HashMap.remove(colors, 'blue')

// Size and emptiness
const size = HashMap.size(colors)        // 3
const isEmpty = HashMap.isEmpty(colors)  // false
```

### Pattern 3: Iteration and Transformation

```typescript
import { HashMap, pipe } from "effect"

const numbers = HashMap.make(
  ['one', 1],
  ['two', 2],
  ['three', 3],
  ['four', 4]
)

// Map over values
const doubled = numbers.pipe(
  HashMap.map(n => n * 2)
)

// Map over both keys and values
const keyValuePairs = numbers.pipe(
  HashMap.mapWithIndex((value, key) => `${key}: ${value}`)
)

// Filter by predicate
const evens = numbers.pipe(
  HashMap.filter(n => n % 2 === 0)
)

// Filter by key and value
const longKeys = numbers.pipe(
  HashMap.filterWithIndex((value, key) => key.length > 3)
)

// Reduce to single value
const sum = numbers.pipe(
  HashMap.reduce(0, (acc, value) => acc + value)
)

// Convert to arrays
const keys = HashMap.keys(numbers)           // ['one', 'two', 'three', 'four']
const values = HashMap.values(numbers)       // [1, 2, 3, 4]
const entries = HashMap.entries(numbers)     // [['one', 1], ['two', 2], ...]
```

## Real-World Examples

### Example 1: Configuration Management System

Building a type-safe configuration management system with nested settings:

```typescript
import { HashMap, pipe, Option, Either, Effect } from "effect"

interface DatabaseConfig {
  host: string
  port: number
  database: string
  maxConnections: number
}

interface RedisConfig {
  host: string
  port: number
  ttl: number
}

interface AppConfig {
  database: DatabaseConfig
  redis: RedisConfig
  debug: boolean
  apiKey: string
}

type ConfigKey = keyof AppConfig
type ConfigValue = AppConfig[ConfigKey]

// Configuration manager using HashMap
class ConfigManager {
  private config: HashMap.HashMap<string, unknown>
  private defaults: HashMap.HashMap<string, unknown>
  private schema: HashMap.HashMap<string, (value: unknown) => Either.Either<unknown, Error>>

  constructor() {
    this.defaults = HashMap.make(
      ['database.host', 'localhost'],
      ['database.port', 5432],
      ['database.database', 'myapp'],
      ['database.maxConnections', 10],
      ['redis.host', 'localhost'],
      ['redis.port', 6379],
      ['redis.ttl', 3600],
      ['debug', false],
      ['apiKey', '']
    )

    this.schema = HashMap.make(
      ['database.host', this.validateString],
      ['database.port', this.validatePort],
      ['database.database', this.validateString],
      ['database.maxConnections', this.validatePositiveNumber],
      ['redis.host', this.validateString],
      ['redis.port', this.validatePort],
      ['redis.ttl', this.validatePositiveNumber],
      ['debug', this.validateBoolean],
      ['apiKey', this.validateString]
    )

    this.config = this.defaults
  }

  // Validation helpers
  private validateString = (value: unknown): Either.Either<string, Error> =>
    typeof value === 'string' && value.length > 0
      ? Either.right(value)
      : Either.left(new Error('Must be a non-empty string'))

  private validatePort = (value: unknown): Either.Either<number, Error> =>
    typeof value === 'number' && value > 0 && value <= 65535
      ? Either.right(value)
      : Either.left(new Error('Must be a valid port number (1-65535)'))

  private validatePositiveNumber = (value: unknown): Either.Either<number, Error> =>
    typeof value === 'number' && value > 0
      ? Either.right(value)
      : Either.left(new Error('Must be a positive number'))

  private validateBoolean = (value: unknown): Either.Either<boolean, Error> =>
    typeof value === 'boolean'
      ? Either.right(value)
      : Either.left(new Error('Must be a boolean'))

  // Set configuration value with validation
  set(key: string, value: unknown): Effect.Effect<ConfigManager, Error> {
    return Effect.gen(function* () {
      const validator = HashMap.get(this.schema, key)
      
      if (Option.isNone(validator)) {
        yield* Effect.fail(new Error(`Unknown configuration key: ${key}`)))
      }

      const validationResult = validator.value(value)
      
      if (Either.isLeft(validationResult)) {
        yield* Effect.fail(validationResult.left))
      }

      const newConfig = HashMap.set(this.config, key, validationResult.right)
      
      return new ConfigManager().withConfig(newConfig)
    }.bind(this))
  }

  // Get configuration value with type safety
  get<T>(key: string): Option.Option<T> {
    return pipe(
      HashMap.get(this.config, key),
      Option.map(value => value as T)
    )
  }

  // Get with fallback to default
  getOrDefault<T>(key: string): T {
    return pipe(
      this.get<T>(key),
      Option.getOrElse(() => {
        const defaultValue = HashMap.get(this.defaults, key)
        return Option.getOrElse(defaultValue, () => undefined as T)
      })
    )
  }

  // Bulk configuration update
  setMany(updates: Record<string, unknown>): Effect.Effect<ConfigManager, Error> {
    return Effect.gen(function* () {
      let result = this
      
      for (const [key, value] of Object.entries(updates)) {
        result = yield* result.set(key, value))
      }
      
      return result
    })
  }

  // Build typed configuration object
  buildConfig(): Effect.Effect<AppConfig, Error> {
    return Effect.gen(function* () {
      const config: AppConfig = {
        database: {
          host: this.getOrDefault('database.host'),
          port: this.getOrDefault('database.port'),
          database: this.getOrDefault('database.database'),
          maxConnections: this.getOrDefault('database.maxConnections')
        },
        redis: {
          host: this.getOrDefault('redis.host'),
          port: this.getOrDefault('redis.port'),
          ttl: this.getOrDefault('redis.ttl')
        },
        debug: this.getOrDefault('debug'),
        apiKey: this.getOrDefault('apiKey')
      }

      // Validate required fields
      if (!config.apiKey) {
        yield* Effect.fail(new Error('API key is required')))
      }

      return config
    })
  }

  private withConfig(config: HashMap.HashMap<string, unknown>): ConfigManager {
    const manager = new ConfigManager()
    manager.config = config
    return manager
  }

  // Environment-specific configuration loading
  static fromEnvironment(): Effect.Effect<ConfigManager, Error> {
    return Effect.gen(function* () {
      const manager = new ConfigManager()
      
      const envMappings = HashMap.make(
        ['DATABASE_HOST', 'database.host'],
        ['DATABASE_PORT', 'database.port'],
        ['DATABASE_NAME', 'database.database'],
        ['REDIS_HOST', 'redis.host'],
        ['REDIS_PORT', 'redis.port'],
        ['DEBUG', 'debug'],
        ['API_KEY', 'apiKey']
      )

      let result = manager

      for (const [envKey, configKey] of HashMap.entries(envMappings)) {
        const envValue = process.env[envKey]
        if (envValue !== undefined) {
          const typedValue = envKey.includes('PORT') ? parseInt(envValue) :
                           envKey === 'DEBUG' ? envValue === 'true' :
                           envValue
          
          result = yield* result.set(configKey, typedValue))
        }
      }

      return result
    })
  }
}

// Usage example
const demonstrateConfigManager = () =>
  Effect.gen(function* () {
    // Load from environment
    const configManager = yield* ConfigManager.fromEnvironment())
    
    // Apply additional configuration
    const updatedManager = yield* configManager.setMany({
      'database.maxConnections': 20,
      'redis.ttl': 7200,
      'debug': true
    }))
    
    // Build final config
    const config = yield* updatedManager.buildConfig())
    
    console.log('Final configuration:', config)
    return config
  })
```

### Example 2: Caching System with TTL

Implementing a sophisticated caching system with time-to-live functionality:

```typescript
import { HashMap, pipe, Option, Effect, Schedule, Ref } from "effect"

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  totalEntries: number
  hits: number
  misses: number
  evictions: number
  hitRate: number
}

class TTLCache<K, V> {
  private data: Ref.Ref<HashMap.HashMap<K, CacheEntry<V>>>
  private stats: Ref.Ref<CacheStats>
  private defaultTTL: number
  private maxSize: number

  constructor(defaultTTL: number = 300000, maxSize: number = 1000) {
    this.defaultTTL = defaultTTL
    this.maxSize = maxSize
    this.data = Ref.unsafeMake(HashMap.empty())
    this.stats = Ref.unsafeMake({
      totalEntries: 0,
      hits: 0,
      misses: 0,
      evictions: 0,
      hitRate: 0
    })
  }

  // Get value with TTL check
  get(key: K): Effect.Effect<Option.Option<V>> {
    return Effect.gen(function* () {
      const now = Date.now()
      const cache = yield* Ref.get(this.data))
      const entry = HashMap.get(cache, key)

      if (Option.isNone(entry)) {
        yield* this.incrementMisses())
        return Option.none()
      }

      const cacheEntry = entry.value

      // Check if expired
      if (now > cacheEntry.timestamp + cacheEntry.ttl) {
        // Remove expired entry
        yield* Ref.update(this.data, cache => HashMap.remove(cache, key)))
        yield* this.incrementMisses())
        return Option.none()
      }

      // Update access statistics
      const updatedEntry = {
        ...cacheEntry,
        accessCount: cacheEntry.accessCount + 1,
        lastAccessed: now
      }

      yield* Ref.update(this.data, cache => HashMap.set(cache, key, updatedEntry)))
      yield* this.incrementHits())

      return Option.some(cacheEntry.value)
    }.bind(this))
  }

  // Set value with optional custom TTL
  set(key: K, value: V, ttl?: number): Effect.Effect<void> {
    return Effect.gen(function* () {
      const now = Date.now()
      const effectiveTTL = ttl ?? this.defaultTTL
      
      const entry: CacheEntry<V> = {
        value,
        timestamp: now,
        ttl: effectiveTTL,
        accessCount: 0,
        lastAccessed: now
      }

      const cache = yield* Ref.get(this.data))
      const currentSize = HashMap.size(cache)

      // Evict if at max capacity and key doesn't exist
      if (currentSize >= this.maxSize && !HashMap.has(cache, key)) {
        yield* this.evictLeastRecentlyUsed())
      }

      yield* Ref.update(this.data, cache => HashMap.set(cache, key, entry)))
    }.bind(this))
  }

  // Get or compute value
  getOrCompute(
    key: K,
    compute: () => Effect.Effect<V>,
    ttl?: number
  ): Effect.Effect<V> {
    return Effect.gen(function* () {
      const cached = yield* this.get(key))

      if (Option.isSome(cached)) {
        return cached.value
      }

      const computed = yield* compute())
      yield* this.set(key, computed, ttl))
      return computed
    }.bind(this))
  }

  // Bulk operations
  setMany(entries: Array<[K, V, number?]>): Effect.Effect<void> {
    return Effect.gen(function* () {
      for (const [key, value, ttl] of entries) {
        yield* this.set(key, value, ttl))
      }
    }.bind(this))
  }

  getMany(keys: K[]): Effect.Effect<HashMap.HashMap<K, V>> {
    return Effect.gen(function* () {
      let result = HashMap.empty<K, V>()

      for (const key of keys) {
        const value = yield* this.get(key))
        if (Option.isSome(value)) {
          result = HashMap.set(result, key, value.value)
        }
      }

      return result
    }.bind(this))
  }

  // Remove entry
  remove(key: K): Effect.Effect<boolean> {
    return Effect.gen(function* () {
      const cache = yield* Ref.get(this.data))
      const existed = HashMap.has(cache, key)
      
      yield* Ref.update(this.data, cache => HashMap.remove(cache, key)))
      
      return existed
    }.bind(this))
  }

  // Clear all entries
  clear(): Effect.Effect<void> {
    return Effect.gen(function* () {
      yield* Ref.set(this.data, HashMap.empty()))
      yield* Ref.update(this.stats, stats => ({
        ...stats,
        totalEntries: 0,
        evictions: stats.evictions + stats.totalEntries
      })))
    }.bind(this))
  }

  // Clean up expired entries
  cleanup(): Effect.Effect<number> {
    return Effect.gen(function* () {
      const now = Date.now()
      const cache = yield* Ref.get(this.data))
      let removedCount = 0

      const cleaned = cache.pipe(
        HashMap.filter(entry => {
          const isExpired = now > entry.timestamp + entry.ttl
          if (isExpired) removedCount++
          return !isExpired
        })
      )

      yield* Ref.set(this.data, cleaned))
      
      if (removedCount > 0) {
        yield* Ref.update(this.stats, stats => ({
          ...stats,
          totalEntries: stats.totalEntries - removedCount,
          evictions: stats.evictions + removedCount
        })))
      }

      return removedCount
    }.bind(this))
  }

  // Get cache statistics
  getStats(): Effect.Effect<CacheStats> {
    return Effect.gen(function* () {
      const cache = yield* Ref.get(this.data))
      const stats = yield* Ref.get(this.stats))
      
      const totalRequests = stats.hits + stats.misses
      const hitRate = totalRequests > 0 ? stats.hits / totalRequests : 0

      return {
        ...stats,
        totalEntries: HashMap.size(cache),
        hitRate
      }
    }.bind(this))
  }

  // Private helper methods
  private incrementHits(): Effect.Effect<void> {
    return Ref.update(this.stats, stats => ({ ...stats, hits: stats.hits + 1 }))
  }

  private incrementMisses(): Effect.Effect<void> {
    return Ref.update(this.stats, stats => ({ ...stats, misses: stats.misses + 1 }))
  }

  private evictLeastRecentlyUsed(): Effect.Effect<void> {
    return Effect.gen(function* () {
      const cache = yield* Ref.get(this.data))
      
      if (HashMap.isEmpty(cache)) return

      // Find LRU entry
      const entries = HashMap.entries(cache)
      let lruKey: K | null = null
      let oldestAccess = Infinity

      for (const [key, entry] of entries) {
        if (entry.lastAccessed < oldestAccess) {
          oldestAccess = entry.lastAccessed
          lruKey = key
        }
      }

      if (lruKey !== null) {
        yield* Ref.update(this.data, cache => HashMap.remove(cache, lruKey!)))
        yield* Ref.update(this.stats, stats => ({
          ...stats,
          evictions: stats.evictions + 1
        })))
      }
    }.bind(this))
  }

  // Start background cleanup process
  startCleanupSchedule(): Effect.Effect<void> {
    const cleanupTask = pipe(
      this.cleanup(),
      Effect.tap(removed => 
        Effect.sync(() => {
          if (removed > 0) {
            console.log(`Cleaned up ${removed} expired cache entries`)
          }
        })
      )
    )

    return pipe(
      cleanupTask,
      Effect.repeat(Schedule.fixed("30 seconds")),
      Effect.fork,
      Effect.asVoid
    )
  }
}

// Usage example
const demonstrateTTLCache = () =>
  Effect.gen(function* () {
    const cache = new TTLCache<string, any>(5000, 100) // 5 second TTL, max 100 entries
    
    // Start background cleanup
    yield* cache.startCleanupSchedule())
    
    // Cache some API responses
    yield* cache.set('user:123', { id: '123', name: 'Alice' }))
    yield* cache.set('user:456', { id: '456', name: 'Bob' }, 10000)) // Custom TTL
    
    // Get cached values
    const alice = yield* cache.get('user:123'))
    console.log('Cached user:', alice)
    
    // Use getOrCompute for expensive operations
    const expensiveData = yield* cache.getOrCompute(
      'expensive:calculation',
      () => Effect.gen(function* () {
        console.log('Performing expensive calculation...')
        yield* Effect.sleep('2 seconds'))
        return { result: Math.random() * 1000 }
      }),
      30000 // 30 second TTL
    ))
    
    console.log('Expensive result:', expensiveData)
    
    // Check cache statistics
    const stats = yield* cache.getStats())
    console.log('Cache stats:', stats)
    
    return { cache, stats }
  })
```

### Example 3: Graph Data Structure with Adjacency Lists

Building a graph data structure using HashMap for efficient adjacency list representation:

```typescript
import { HashMap, HashSet, pipe, Option, Effect, Array as Arr } from "effect"

interface Edge<T> {
  from: T
  to: T
  weight?: number
}

interface GraphStats {
  nodeCount: number
  edgeCount: number
  averageDegree: number
  maxDegree: number
  isConnected: boolean
}

class Graph<T> {
  private adjacencyList: HashMap.HashMap<T, HashSet.HashSet<T>>
  private edgeWeights: HashMap.HashMap<string, number>
  private nodeSet: HashSet.HashSet<T>

  constructor() {
    this.adjacencyList = HashMap.empty()
    this.edgeWeights = HashMap.empty()
    this.nodeSet = HashSet.empty()
  }

  // Add a node to the graph
  addNode(node: T): Graph<T> {
    const newGraph = new Graph<T>()
    newGraph.adjacencyList = this.adjacencyList.pipe(
      HashMap.set(node, HashSet.empty())
    )
    newGraph.edgeWeights = this.edgeWeights
    newGraph.nodeSet = HashSet.add(this.nodeSet, node)
    return newGraph
  }

  // Add an edge between two nodes
  addEdge(from: T, to: T, weight?: number): Graph<T> {
    const newGraph = new Graph<T>()
    
    // Ensure both nodes exist
    let adjacencyList = this.adjacencyList
    let nodeSet = this.nodeSet
    
    if (!HashMap.has(adjacencyList, from)) {
      adjacencyList = HashMap.set(adjacencyList, from, HashSet.empty())
      nodeSet = HashSet.add(nodeSet, from)
    }
    
    if (!HashMap.has(adjacencyList, to)) {
      adjacencyList = HashMap.set(adjacencyList, to, HashSet.empty())
      nodeSet = HashSet.add(nodeSet, to)
    }
    
    // Add edge to adjacency list
    const fromNeighbors = HashMap.get(adjacencyList, from).pipe(
      Option.getOrElse(() => HashSet.empty<T>()),
      HashSet.add(to)
    )
    
    adjacencyList = HashMap.set(adjacencyList, from, fromNeighbors)
    
    // Store edge weight if provided
    let edgeWeights = this.edgeWeights
    if (weight !== undefined) {
      const edgeKey = `${String(from)}->${String(to)}`
      edgeWeights = HashMap.set(edgeWeights, edgeKey, weight)
    }
    
    newGraph.adjacencyList = adjacencyList
    newGraph.edgeWeights = edgeWeights
    newGraph.nodeSet = nodeSet
    
    return newGraph
  }

  // Add undirected edge
  addUndirectedEdge(node1: T, node2: T, weight?: number): Graph<T> {
    return pipe(
      this.addEdge(node1, node2, weight),
      graph => graph.addEdge(node2, node1, weight)
    )
  }

  // Get neighbors of a node
  getNeighbors(node: T): HashSet.HashSet<T> {
    return pipe(
      HashMap.get(this.adjacencyList, node),
      Option.getOrElse(() => HashSet.empty<T>())
    )
  }

  // Get edge weight
  getEdgeWeight(from: T, to: T): Option.Option<number> {
    const edgeKey = `${String(from)}->${String(to)}`
    return HashMap.get(this.edgeWeights, edgeKey)
  }

  // Check if edge exists
  hasEdge(from: T, to: T): boolean {
    const neighbors = this.getNeighbors(from)
    return HashSet.has(neighbors, to)
  }

  // Get all nodes
  getNodes(): HashSet.HashSet<T> {
    return this.nodeSet
  }

  // Get node degree
  getDegree(node: T): number {
    const neighbors = this.getNeighbors(node)
    return HashSet.size(neighbors)
  }

  // Remove node and all its edges
  removeNode(node: T): Graph<T> {
    const newGraph = new Graph<T>()
    
    // Remove from node set
    newGraph.nodeSet = HashSet.remove(this.nodeSet, node)
    
    // Remove from adjacency list and clean up references
    let adjacencyList = HashMap.remove(this.adjacencyList, node)
    let edgeWeights = this.edgeWeights
    
    // Remove edges pointing to this node
    for (const [fromNode, neighbors] of HashMap.entries(adjacencyList)) {
      if (HashSet.has(neighbors, node)) {
        const updatedNeighbors = HashSet.remove(neighbors, node)
        adjacencyList = HashMap.set(adjacencyList, fromNode, updatedNeighbors)
        
        // Remove edge weights
        const edgeKey = `${String(fromNode)}->${String(node)}`
        edgeWeights = HashMap.remove(edgeWeights, edgeKey)
      }
    }
    
    // Remove edge weights from the removed node
    for (const edgeKey of HashMap.keys(edgeWeights)) {
      if (edgeKey.startsWith(`${String(node)}->`)) {
        edgeWeights = HashMap.remove(edgeWeights, edgeKey)
      }
    }
    
    newGraph.adjacencyList = adjacencyList
    newGraph.edgeWeights = edgeWeights
    
    return newGraph
  }

  // Depth-first search
  dfs(startNode: T, visitFn: (node: T) => void): void {
    const visited = new Set<T>()
    const stack = [startNode]
    
    while (stack.length > 0) {
      const current = stack.pop()!
      
      if (!visited.has(current)) {
        visited.add(current)
        visitFn(current)
        
        const neighbors = this.getNeighbors(current)
        for (const neighbor of HashSet.values(neighbors)) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor)
          }
        }
      }
    }
  }

  // Breadth-first search
  bfs(startNode: T, visitFn: (node: T) => void): void {
    const visited = new Set<T>()
    const queue = [startNode]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      
      if (!visited.has(current)) {
        visited.add(current)
        visitFn(current)
        
        const neighbors = this.getNeighbors(current)
        for (const neighbor of HashSet.values(neighbors)) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
    }
  }

  // Find shortest path using Dijkstra's algorithm
  shortestPath(start: T, end: T): Option.Option<{ path: T[]; distance: number }> {
    const distances = new Map<T, number>()
    const previous = new Map<T, T | null>()
    const unvisited = new Set<T>()
    
    // Initialize distances
    for (const node of HashSet.values(this.nodeSet)) {
      distances.set(node, node === start ? 0 : Infinity)
      previous.set(node, null)
      unvisited.add(node)
    }
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current: T | null = null
      let minDistance = Infinity
      
      for (const node of unvisited) {
        const distance = distances.get(node)!
        if (distance < minDistance) {
          minDistance = distance
          current = node
        }
      }
      
      if (current === null || minDistance === Infinity) break
      
      unvisited.delete(current)
      
      if (current === end) {
        // Reconstruct path
        const path: T[] = []
        let curr: T | null = end
        
        while (curr !== null) {
          path.unshift(curr)
          curr = previous.get(curr)!
        }
        
        return Option.some({ path, distance: distances.get(end)! })
      }
      
      // Update distances to neighbors
      const neighbors = this.getNeighbors(current)
      for (const neighbor of HashSet.values(neighbors)) {
        if (!unvisited.has(neighbor)) continue
        
        const edgeWeight = this.getEdgeWeight(current, neighbor).pipe(
          Option.getOrElse(() => 1)
        )
        
        const newDistance = distances.get(current)! + edgeWeight
        
        if (newDistance < distances.get(neighbor)!) {
          distances.set(neighbor, newDistance)
          previous.set(neighbor, current)
        }
      }
    }
    
    return Option.none()
  }

  // Get graph statistics
  getStats(): GraphStats {
    const nodeCount = HashSet.size(this.nodeSet)
    const edgeCount = this.adjacencyList.pipe(
      HashMap.values,
      values => values.reduce((sum, neighbors) => sum + HashSet.size(neighbors), 0)
    )
    
    const degrees = pipe(
      this.nodeSet,
      HashSet.values,
      nodes => Array.from(nodes).map(node => this.getDegree(node))
    )
    
    const averageDegree = degrees.length > 0 ? degrees.reduce((sum, d) => sum + d, 0) / degrees.length : 0
    const maxDegree = degrees.length > 0 ? Math.max(...degrees) : 0
    
    // Check connectivity using DFS from first node
    let isConnected = false
    if (nodeCount > 0) {
      const firstNode = HashSet.values(this.nodeSet)[0]
      const visitedCount = new Set<T>()
      
      this.dfs(firstNode, node => visitedCount.add(node))
      isConnected = visitedCount.size === nodeCount
    }
    
    return {
      nodeCount,
      edgeCount,
      averageDegree,
      maxDegree,
      isConnected
    }
  }

  // Create subgraph with specific nodes
  subgraph(nodes: HashSet.HashSet<T>): Graph<T> {
    const newGraph = new Graph<T>()
    
    let adjacencyList = HashMap.empty<T, HashSet.HashSet<T>>()
    let edgeWeights = HashMap.empty<string, number>()
    
    for (const node of HashSet.values(nodes)) {
      const neighbors = this.getNeighbors(node)
      const filteredNeighbors = neighbors.pipe(
        HashSet.filter(neighbor => HashSet.has(nodes, neighbor))
      )
      
      adjacencyList = HashMap.set(adjacencyList, node, filteredNeighbors)
      
      // Copy relevant edge weights
      for (const neighbor of HashSet.values(filteredNeighbors)) {
        const edgeKey = `${String(node)}->${String(neighbor)}`
        const weight = HashMap.get(this.edgeWeights, edgeKey)
        
        if (Option.isSome(weight)) {
          edgeWeights = HashMap.set(edgeWeights, edgeKey, weight.value)
        }
      }
    }
    
    newGraph.adjacencyList = adjacencyList
    newGraph.edgeWeights = edgeWeights
    newGraph.nodeSet = nodes
    
    return newGraph
  }
}

// Usage example
const demonstrateGraph = () => {
  // Create a social network graph
  const socialNetwork = new Graph<string>()
    .addNode('Alice')
    .addNode('Bob')
    .addNode('Charlie')
    .addNode('Diana')
    .addNode('Eve')
    .addUndirectedEdge('Alice', 'Bob', 5)     // Friendship strength
    .addUndirectedEdge('Bob', 'Charlie', 3)
    .addUndirectedEdge('Charlie', 'Diana', 4)
    .addUndirectedEdge('Diana', 'Eve', 2)
    .addUndirectedEdge('Alice', 'Charlie', 1) // Weak connection
    .addUndirectedEdge('Bob', 'Eve', 6)       // Strong connection
  
  console.log('Social Network Stats:', socialNetwork.getStats())
  
  // Find shortest path between Alice and Eve
  const path = socialNetwork.shortestPath('Alice', 'Eve')
  if (Option.isSome(path)) {
    console.log('Shortest path from Alice to Eve:', path.value.path)
    console.log('Total distance:', path.value.distance)
  }
  
  // Traverse the network
  console.log('BFS from Alice:')
  socialNetwork.bfs('Alice', node => console.log(`  Visited: ${node}`))
  
  // Create a subgraph with only Alice's immediate connections
  const aliceNeighbors = socialNetwork.getNeighbors('Alice')
  const aliceSubgraph = socialNetwork.subgraph(
    HashSet.add(aliceNeighbors, 'Alice')
  )
  
  console.log('Alice subgraph stats:', aliceSubgraph.getStats())
  
  return { socialNetwork, aliceSubgraph }
}
```

## Advanced Features Deep Dive

### Feature 1: Structural Sharing and Performance

HashMap's structural sharing makes it highly efficient for functional programming patterns:

#### Understanding Structural Sharing

```typescript
import { HashMap, pipe } from "effect"

// Demonstrate structural sharing benefits
const demonstrateStructuralSharing = () => {
  // Create initial HashMap
  const initial = HashMap.make(
    ['a', 1], ['b', 2], ['c', 3], ['d', 4], ['e', 5]
  )
  
  // Multiple "copies" with modifications
  const version1 = HashMap.set(initial, 'f', 6)
  const version2 = HashMap.set(initial, 'g', 7)
  const version3 = HashMap.remove(version1, 'b')
  
  // All versions share structure where possible
  // Only modified parts are duplicated
  
  return {
    initial: HashMap.size(initial),    // 5
    version1: HashMap.size(version1),  // 6
    version2: HashMap.size(version2),  // 6
    version3: HashMap.size(version3),  // 5
    // In memory, shared structure is not duplicated
    memoryEfficient: true
  }
}

// Performance comparison with native Map
const performanceComparison = () => {
  const iterations = 10000
  
  // HashMap approach
  console.time('HashMap operations')
  let hashMap = HashMap.empty<number, string>()
  
  for (let i = 0; i < iterations; i++) {
    hashMap = HashMap.set(hashMap, i, `value-${i}`)
    
    if (i % 100 === 0) {
      hashMap = HashMap.remove(hashMap, i - 50)
    }
  }
  console.timeEnd('HashMap operations')
  
  // Native Map with manual copying for immutability
  console.time('Native Map with copying')
  let nativeMap = new Map<number, string>()
  
  for (let i = 0; i < iterations; i++) {
    nativeMap = new Map(nativeMap)  // Full copy for immutability
    nativeMap.set(i, `value-${i}`)
    
    if (i % 100 === 0) {
      nativeMap = new Map(nativeMap)
      nativeMap.delete(i - 50)
    }
  }
  console.timeEnd('Native Map with copying')
  
  return {
    hashMapSize: HashMap.size(hashMap),
    nativeMapSize: nativeMap.size
  }
}
```

#### Advanced Performance Patterns

```typescript
import { HashMap, pipe, Effect } from "effect"

// Batch operations for maximum efficiency
const batchOperations = <K, V>(
  map: HashMap.HashMap<K, V>,
  operations: Array<
    | { type: 'set'; key: K; value: V }
    | { type: 'remove'; key: K }
    | { type: 'modify'; key: K; fn: (v: V) => V }
  >
): HashMap.HashMap<K, V> => {
  return operations.reduce((acc, op) => {
    switch (op.type) {
      case 'set':
        return HashMap.set(acc, op.key, op.value)
      case 'remove':
        return HashMap.remove(acc, op.key)
      case 'modify':
        return HashMap.modify(acc, op.key, op.fn)
      default:
        return acc
    }
  }, map)
}

// Efficient map transformations
const efficientTransformations = <K, V1, V2>(
  map: HashMap.HashMap<K, V1>,
  transform: (value: V1, key: K) => V2
): HashMap.HashMap<K, V2> => {
  // HashMap.map is already optimized for structural sharing
  return HashMap.mapWithIndex(map, transform)
}

// Memory-efficient large dataset processing
const processLargeDataset = (
  data: Array<{ id: string; value: number }>,
  batchSize: number = 1000
): Effect.Effect<HashMap.HashMap<string, number>> =>
  Effect.gen(function* () {
    let result = HashMap.empty<string, number>()
    
    // Process in batches to avoid memory spikes
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      const batchMap = HashMap.fromIterable(
        batch.map(item => [item.id, item.value] as const)
      )
      
      // Merge batches efficiently
      result = result.pipe(
        HashMap.union(batchMap)
      )
      
      // Yield control to prevent blocking
      yield* Effect.sleep('1 millis'))
    }
    
    return result
  })
```

### Feature 2: Advanced HashMap Operations

HashMap provides sophisticated operations for complex data manipulation:

#### Union, Intersection, and Difference Operations

```typescript
import { HashMap, pipe, Option } from "effect"

// Set-like operations on HashMaps
const setOperations = () => {
  const map1 = HashMap.make(
    ['a', 1], ['b', 2], ['c', 3]
  )
  
  const map2 = HashMap.make(
    ['b', 20], ['c', 30], ['d', 40]
  )
  
  // Union - combine maps, second map wins on conflicts
  const union = HashMap.union(map1, map2)
  // Result: { a: 1, b: 20, c: 30, d: 40 }
  
  // Custom union with value combining
  const customUnion = HashMap.entries(map1).pipe(
    entries => entries.reduce((acc, [key, value]) => {
      const existing = HashMap.get(map2, key)
      const newValue = Option.isSome(existing) 
        ? value + existing.value  // Combine values
        : value
      return HashMap.set(acc, key, newValue)
    }, map2)
  )
  // Result: { a: 1, b: 22, c: 33, d: 40 }
  
  // Intersection - only keys present in both
  const intersection = map1.pipe(
    HashMap.filter((_, key) => HashMap.has(map2, key))
  )
  // Result: { b: 2, c: 3 }
  
  // Difference - keys in map1 but not in map2
  const difference = map1.pipe(
    HashMap.filter((_, key) => !HashMap.has(map2, key))
  )
  // Result: { a: 1 }
  
  return { union, customUnion, intersection, difference }
}

// Advanced filtering and grouping
const advancedFiltering = () => {
  const products = HashMap.make(
    ['laptop', { category: 'electronics', price: 1200, inStock: true }],
    ['book', { category: 'media', price: 25, inStock: true }],
    ['phone', { category: 'electronics', price: 800, inStock: false }],
    ['desk', { category: 'furniture', price: 350, inStock: true }],
    ['tablet', { category: 'electronics', price: 600, inStock: true }]
  )
  
  // Filter by multiple conditions
  const availableElectronics = products.pipe(
    HashMap.filter(product => 
      product.category === 'electronics' && 
      product.inStock && 
      product.price < 1000
    )
  )
  
  // Group by category
  const groupByCategory = (
    products: HashMap.HashMap<string, { category: string; price: number; inStock: boolean }>
  ): HashMap.HashMap<string, Array<string>> => {
    return HashMap.entries(products).pipe(
      entries => entries.reduce((acc, [name, product]) => {
        const existing = HashMap.get(acc, product.category).pipe(
          Option.getOrElse(() => [] as string[])
        )
        return HashMap.set(acc, product.category, [...existing, name])
      }, HashMap.empty<string, Array<string>>())
    )
  }
  
  const grouped = groupByCategory(products)
  
  // Calculate statistics per category
  const categoryStats = grouped.pipe(
    HashMap.mapWithIndex((productNames, category) => {
      const categoryProducts = productNames
        .map(name => HashMap.unsafeGet(products, name))
        .filter(p => p.category === category)
      
      return {
        count: categoryProducts.length,
        averagePrice: categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length,
        inStockCount: categoryProducts.filter(p => p.inStock).length
      }
    })
  )
  
  return { availableElectronics, grouped, categoryStats }
}
```

#### Complex Data Transformations

```typescript
import { HashMap, pipe, Option, Array as Arr } from "effect"

// Nested HashMap operations
const nestedHashMapOperations = () => {
  // Nested structure: HashMap<Department, HashMap<Role, Employee[]>>
  type Employee = { id: string; name: string; salary: number }
  type DepartmentData = HashMap.HashMap<string, Employee[]>
  type OrganizationData = HashMap.HashMap<string, DepartmentData>
  
  const buildOrganization = (): OrganizationData => {
    const engineering = HashMap.make(
      ['senior', [
        { id: '1', name: 'Alice', salary: 120000 },
        { id: '2', name: 'Bob', salary: 125000 }
      ]],
      ['junior', [
        { id: '3', name: 'Charlie', salary: 80000 },
        { id: '4', name: 'Diana', salary: 75000 }
      ]]
    )
    
    const marketing = HashMap.make(
      ['manager', [
        { id: '5', name: 'Eve', salary: 110000 }
      ]],
      ['specialist', [
        { id: '6', name: 'Frank', salary: 65000 },
        { id: '7', name: 'Grace', salary: 70000 }
      ]]
    )
    
    return HashMap.make(
      ['engineering', engineering],
      ['marketing', marketing]
    )
  }
  
  const organization = buildOrganization()
  
  // Add employee to specific department/role
  const addEmployee = (
    org: OrganizationData,
    department: string,
    role: string,
    employee: Employee
  ): OrganizationData => {
    return org.pipe(
      HashMap.modify(department, departmentData => {
        return departmentData.pipe(
          HashMap.modify(role, employees => [...employees, employee])
        )
      })
    )
  }
  
  // Calculate total salary by department
  const departmentSalaries = organization.pipe(
    HashMap.map(departmentData => {
      return departmentData.pipe(
        HashMap.values,
        roles => roles.flat(),
        employees => employees.reduce((sum, emp) => sum + emp.salary, 0)
      )
    })
  )
  
  // Find highest paid employee across organization
  const findHighestPaid = (org: OrganizationData): Option.Option<Employee & { department: string; role: string }> => {
    let highest: (Employee & { department: string; role: string }) | null = null
    
    for (const [deptName, dept] of HashMap.entries(org)) {
      for (const [roleName, employees] of HashMap.entries(dept)) {
        for (const employee of employees) {
          if (!highest || employee.salary > highest.salary) {
            highest = { ...employee, department: deptName, role: roleName }
          }
        }
      }
    }
    
    return highest ? Option.some(highest) : Option.none()
  }
  
  const highestPaid = findHighestPaid(organization)
  
  // Flatten organization structure
  const flattenOrganization = (org: OrganizationData): HashMap.HashMap<string, Employee & { department: string; role: string }> => {
    let result = HashMap.empty<string, Employee & { department: string; role: string }>()
    
    for (const [deptName, dept] of HashMap.entries(org)) {
      for (const [roleName, employees] of HashMap.entries(dept)) {
        for (const employee of employees) {
          result = result.pipe(
            HashMap.set(employee.id, { ...employee, department: deptName, role: roleName })
          )
        }
      }
    }
    
    return result
  }
  
  const flatOrganization = flattenOrganization(organization)
  
  return {
    organization,
    departmentSalaries,
    highestPaid,
    flatOrganization,
    addEmployee: (emp: Employee) => addEmployee(organization, 'engineering', 'junior', emp)
  }
}

// Advanced merge and aggregation patterns
const mergeAndAggregation = () => {
  // Multiple data sources to merge
  const salesQ1 = HashMap.make(
    ['Alice', 15000],
    ['Bob', 12000],
    ['Charlie', 18000]
  )
  
  const salesQ2 = HashMap.make(
    ['Alice', 16000],
    ['Bob', 14000],
    ['Diana', 20000]
  )
  
  const salesQ3 = HashMap.make(
    ['Alice', 17000],
    ['Charlie', 15000],
    ['Diana', 22000],
    ['Eve', 19000]
  )
  
  // Merge with custom aggregation
  const mergeWithSum = (
    maps: HashMap.HashMap<string, number>[]
  ): HashMap.HashMap<string, number> => {
    return maps.reduce((acc, current) => {
      return HashMap.entries(current).pipe(
        entries => entries.reduce((result, [key, value]) => {
          const existing = HashMap.get(result, key).pipe(
            Option.getOrElse(() => 0)
          )
          return HashMap.set(result, key, existing + value)
        }, acc)
      )
    }, HashMap.empty<string, number>())
  }
  
  const totalSales = mergeWithSum([salesQ1, salesQ2, salesQ3])
  
  // Calculate quarterly performance
  const quarterlyPerformance = HashMap.keys(totalSales).pipe(
    keys => keys.map(salesperson => {
      const q1 = Option.getOrElse(HashMap.get(salesQ1, salesperson), () => 0)
      const q2 = Option.getOrElse(HashMap.get(salesQ2, salesperson), () => 0)
      const q3 = Option.getOrElse(HashMap.get(salesQ3, salesperson), () => 0)
      const total = HashMap.unsafeGet(totalSales, salesperson)
      
      return {
        salesperson,
        quarters: { q1, q2, q3 },
        total,
        average: total / 3,
        growth: q1 > 0 ? ((q3 - q1) / q1) * 100 : 0
      }
    }),
    performers => HashMap.fromIterable(
      performers.map(p => [p.salesperson, p] as const)
    )
  )
  
  return { totalSales, quarterlyPerformance }
}
```

### Feature 3: Integration with Effect Type System

HashMap integrates seamlessly with Effect's type system for safe, composable operations:

#### Effect-aware HashMap Operations

```typescript
import { HashMap, pipe, Effect, Option, Either } from "effect"

// Safe HashMap operations that integrate with Effect
const safeHashMapOperations = {
  // Safe get that returns Effect
  safeGet: <K, V>(map: HashMap.HashMap<K, V>, key: K) =>
    Effect.gen(function* () {
      const value = HashMap.get(map, key)
      if (Option.isNone(value)) {
        yield* Effect.fail(new Error(`Key not found: ${String(key)}`)))
      }
      return value.value
    }),
  
  // Validate and set
  validateAndSet: <K, V>(
    map: HashMap.HashMap<K, V>,
    key: K,
    value: V,
    validator: (v: V) => Either.Either<V, Error>
  ) =>
    Effect.gen(function* () {
      const validationResult = validator(value)
      if (Either.isLeft(validationResult)) {
        yield* Effect.fail(validationResult.left))
      }
      return HashMap.set(map, key, validationResult.right)
    }),
  
  // Bulk operations with validation
  setBulkWithValidation: <K, V>(
    map: HashMap.HashMap<K, V>,
    entries: Array<[K, V]>,
    validator: (v: V) => Either.Either<V, Error>
  ) =>
    Effect.gen(function* () {
      let result = map
      
      for (const [key, value] of entries) {
        result = yield* 
          safeHashMapOperations.validateAndSet(result, key, value, validator)
        )
      }
      
      return result
    })
}

// Example usage with validation
const userRegistrationExample = () =>
  Effect.gen(function* () {
    interface User {
      id: string
      email: string
      age: number
    }
    
    const validateUser = (user: User): Either.Either<User, Error> => {
      if (!user.email.includes('@')) {
        return Either.left(new Error('Invalid email'))
      }
      if (user.age < 18) {
        return Either.left(new Error('User must be 18 or older'))
      }
      return Either.right(user)
    }
    
    let userMap = HashMap.empty<string, User>()
    
    const newUsers: Array<[string, User]> = [
      ['1', { id: '1', email: 'alice@example.com', age: 25 }],
      ['2', { id: '2', email: 'invalid-email', age: 30 }],
      ['3', { id: '3', email: 'bob@example.com', age: 16 }],
      ['4', { id: '4', email: 'charlie@example.com', age: 35 }]
    ]
    
    try {
      userMap = yield* 
        safeHashMapOperations.setBulkWithValidation(userMap, newUsers, validateUser)
      )
      console.log(`Successfully registered ${HashMap.size(userMap)} users`)
    } catch (error) {
      console.error('Registration failed:', error)
      
      // Register valid users one by one
      for (const [id, user] of newUsers) {
        try {
          userMap = yield* 
            safeHashMapOperations.validateAndSet(userMap, id, user, validateUser)
          )
          console.log(`Registered user: ${user.email}`)
        } catch (userError) {
          console.error(`Failed to register ${user.email}:`, userError)
        }
      }
    }
    
    return userMap
  })

// Concurrent HashMap operations
const concurrentOperations = () =>
  Effect.gen(function* () {
    const initialMap = HashMap.make(
      ['counter1', 0],
      ['counter2', 0],
      ['counter3', 0]
    )
    
    // Simulate concurrent increments
    const incrementCounter = (
      map: HashMap.HashMap<string, number>,
      counterId: string,
      amount: number
    ) =>
      Effect.gen(function* () {
        yield* Effect.sleep(`${Math.random() * 100}ms`)) // Simulate work
        
        const current = yield* safeHashMapOperations.safeGet(map, counterId))
        return HashMap.set(map, counterId, current + amount)
      })
    
    // Run concurrent operations
    const operations = [
      incrementCounter(initialMap, 'counter1', 5),
      incrementCounter(initialMap, 'counter2', 10),
      incrementCounter(initialMap, 'counter3', 15),
      incrementCounter(initialMap, 'counter1', 3),
      incrementCounter(initialMap, 'counter2', 7)
    ]
    
    const results = yield* Effect.all(operations, { concurrency: 3 }))
    
    // Note: This example shows the pattern, but each operation
    // works on the initial map. For true concurrent state,
    // you'd need Ref or other concurrency primitives
    
    return results
  })
```

## Practical Patterns & Best Practices

### Pattern 1: Immutable State Management

```typescript
import { HashMap, pipe, Effect, Ref } from "effect"

// Immutable application state using HashMap
interface AppState {
  users: HashMap.HashMap<string, User>
  sessions: HashMap.HashMap<string, Session>
  cache: HashMap.HashMap<string, CacheEntry>
}

interface User {
  id: string
  name: string
  email: string
  preferences: HashMap.HashMap<string, any>
}

interface Session {
  id: string
  userId: string
  createdAt: number
  expiresAt: number
}

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class StateManager {
  private state: Ref.Ref<AppState>

  constructor() {
    this.state = Ref.unsafeMake({
      users: HashMap.empty(),
      sessions: HashMap.empty(),
      cache: HashMap.empty()
    })
  }

  // Update user with immutable state
  updateUser(userId: string, updates: Partial<User>): Effect.Effect<void> {
    return Ref.update(this.state, currentState => ({
      ...currentState,
      users: pipe(
        currentState.users,
        HashMap.modify(userId, user => ({ ...user, ...updates }))
      )
    }))
  }

  // Add user preference
  setUserPreference(userId: string, key: string, value: any): Effect.Effect<void> {
    return Ref.update(this.state, currentState => ({
      ...currentState,
      users: pipe(
        currentState.users,
        HashMap.modify(userId, user => ({
          ...user,
          preferences: HashMap.set(user.preferences, key, value)
        }))
      )
    }))
  }

  // Batch state updates
  batchUpdate(updates: Array<() => AppState>): Effect.Effect<void> {
    return Ref.update(this.state, currentState => {
      return updates.reduce((state, update) => update(), currentState)
    })
  }

  // Get current state snapshot
  getState(): Effect.Effect<AppState> {
    return Ref.get(this.state)
  }

  // Clean expired sessions
  cleanExpiredSessions(): Effect.Effect<number> {
    return Effect.gen(function* () {
      const now = Date.now()
      let removedCount = 0

      yield* Ref.update(this.state, currentState => {
        const validSessions = currentState.sessions.pipe(
          HashMap.filter(session => {
            const isValid = session.expiresAt > now
            if (!isValid) removedCount++
            return isValid
          })
        )

        return {
          ...currentState,
          sessions: validSessions
        }
      }))

      return removedCount
    }.bind(this))
  }
}
```

### Pattern 2: Caching and Memoization

```typescript
import { HashMap, pipe, Effect, Ref } from "effect"

// Advanced memoization using HashMap
class MemoizationCache<K, V> {
  private cache: Ref.Ref<HashMap.HashMap<K, { value: V; computedAt: number; hitCount: number }>>
  private maxSize: number
  private ttl: number

  constructor(maxSize: number = 1000, ttl: number = 300000) {
    this.cache = Ref.unsafeMake(HashMap.empty())
    this.maxSize = maxSize
    this.ttl = ttl
  }

  // Memoized computation
  memoize<Args extends readonly unknown[]>(
    fn: (...args: Args) => Effect.Effect<V>,
    keyFn: (...args: Args) => K
  ) {
    return (...args: Args): Effect.Effect<V> =>
      Effect.gen(function* () {
        const key = keyFn(...args)
        const now = Date.now()
        const cached = yield* this.get(key))

        if (cached && (now - cached.computedAt) < this.ttl) {
          // Update hit count
          yield* this.updateHitCount(key))
          return cached.value
        }

        // Compute new value
        const value = yield* fn(...args))
        yield* this.set(key, value))
        
        return value
      }.bind(this))
  }

  private get(key: K): Effect.Effect<{ value: V; computedAt: number; hitCount: number } | null> {
    return Effect.gen(function* () {
      const cache = yield* Ref.get(this.cache))
      const entry = HashMap.get(cache, key)
      return entry ? entry.value : null
    }.bind(this))
  }

  private set(key: K, value: V): Effect.Effect<void> {
    return Effect.gen(function* () {
      const now = Date.now()
      
      yield* Ref.update(this.cache, cache => {
        let updated = cache.pipe(
          HashMap.set(key, { value, computedAt: now, hitCount: 0 })
        )

        // Evict if over max size
        if (HashMap.size(updated) > this.maxSize) {
          updated = this.evictLeastUsed(updated)
        }

        return updated
      }))
    }.bind(this))
  }

  private updateHitCount(key: K): Effect.Effect<void> {
    return Ref.update(this.cache, cache =>
      pipe(
        cache,
        HashMap.modify(key, entry => ({
          ...entry,
          hitCount: entry.hitCount + 1
        }))
      )
    )
  }

  private evictLeastUsed(cache: HashMap.HashMap<K, { value: V; computedAt: number; hitCount: number }>): HashMap.HashMap<K, { value: V; computedAt: number; hitCount: number }> {
    const entries = HashMap.entries(cache)
    
    if (entries.length === 0) return cache

    // Find least used entry
    let leastUsedKey = entries[0][0]
    let leastHitCount = entries[0][1].hitCount

    for (const [key, entry] of entries) {
      if (entry.hitCount < leastHitCount) {
        leastHitCount = entry.hitCount
        leastUsedKey = key
      }
    }

    return HashMap.remove(cache, leastUsedKey)
  }

  // Get cache statistics
  getStats(): Effect.Effect<{ size: number; hitRate: number; entries: Array<{ key: K; hitCount: number }> }> {
    return Effect.gen(function* () {
      const cache = yield* Ref.get(this.cache))
      const entries = HashMap.entries(cache)
      
      const totalHits = entries.reduce((sum, [, entry]) => sum + entry.hitCount, 0)
      const totalRequests = entries.length + totalHits
      const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0

      return {
        size: HashMap.size(cache),
        hitRate,
        entries: entries.map(([key, entry]) => ({ key, hitCount: entry.hitCount }))
      }
    }.bind(this))
  }
}

// Usage example with expensive computation
const expensiveComputationExample = () => {
  const cache = new MemoizationCache<string, number>(100, 60000) // 1 minute TTL

  // Expensive Fibonacci calculation
  const fibonacci = cache.memoize(
    (n: number): Effect.Effect<number> =>
      Effect.gen(function* () {
        if (n <= 1) return n
        
        // Simulate expensive computation
        yield* Effect.sleep('10 millis'))
        
        const a = yield* fibonacci(n - 1))
        const b = yield* fibonacci(n - 2))
        
        return a + b
      }),
    (n: number) => `fib-${n}`
  )

  return Effect.gen(function* () {
    console.time('First calculation')
    const result1 = yield* fibonacci(20))
    console.timeEnd('First calculation')

    console.time('Cached calculation')
    const result2 = yield* fibonacci(20))
    console.timeEnd('Cached calculation')

    const stats = yield* cache.getStats())
    console.log('Cache stats:', stats)

    return { result1, result2, stats }
  })
}
```

### Pattern 3: Data Transformation Pipelines

```typescript
import { HashMap, pipe, Effect, Array as Arr } from "effect"

// Advanced data transformation using HashMap
interface RawData {
  id: string
  timestamp: string
  value: number
  tags: string[]
  metadata: Record<string, any>
}

interface ProcessedData {
  id: string
  timestamp: Date
  normalizedValue: number
  tagSet: Set<string>
  computedFields: HashMap.HashMap<string, any>
}

interface AggregatedData {
  period: string
  totalValue: number
  averageValue: number
  uniqueTags: Set<string>
  recordCount: number
  topTags: Array<{ tag: string; count: number }>
}

class DataProcessor {
  private processors: HashMap.HashMap<string, (data: any) => Effect.Effect<any>>
  private aggregators: HashMap.HashMap<string, (data: any[]) => any>

  constructor() {
    this.processors = HashMap.make(
      ['timestamp', this.parseTimestamp],
      ['normalize', this.normalizeValue],
      ['tags', this.processTags],
      ['compute', this.computeFields]
    )

    this.aggregators = HashMap.make(
      ['sum', this.sumValues],
      ['average', this.averageValues],
      ['count', this.countValues],
      ['unique_tags', this.aggregateUniqueTags]
    )
  }

  // Process single record
  processRecord(raw: RawData): Effect.Effect<ProcessedData> {
    return Effect.gen(function* () {
      const timestamp = yield* this.parseTimestamp(raw.timestamp))
      const normalizedValue = yield* this.normalizeValue(raw.value))
      const tagSet = yield* this.processTags(raw.tags))
      const computedFields = yield* this.computeFields(raw))

      return {
        id: raw.id,
        timestamp,
        normalizedValue,
        tagSet,
        computedFields
      }
    })
  }

  // Batch processing with configurable pipeline
  processBatch(
    rawData: RawData[],
    pipeline: string[]
  ): Effect.Effect<ProcessedData[]> {
    return Effect.gen(function* () {
      const results: ProcessedData[] = []

      for (const raw of rawData) {
        try {
          const processed = yield* this.processRecord(raw))
          results.push(processed)
        } catch (error) {
          console.error(`Failed to process record ${raw.id}:`, error)
        }
      }

      return results
    })
  }

  // Aggregate processed data by time periods
  aggregateByPeriod(
    data: ProcessedData[],
    periodSize: number // milliseconds
  ): Effect.Effect<HashMap.HashMap<string, AggregatedData>> {
    return Effect.gen(function* () {
      // Group by time periods
      const periods = data.reduce((acc, record) => {
        const periodStart = Math.floor(record.timestamp.getTime() / periodSize) * periodSize
        const periodKey = new Date(periodStart).toISOString()
        
        const existing = acc.get(periodKey) || []
        acc.set(periodKey, [...existing, record])
        
        return acc
      }, new Map<string, ProcessedData[]>())

      // Convert to HashMap and aggregate each period
      let result = HashMap.empty<string, AggregatedData>()

      for (const [periodKey, periodData] of periods.entries()) {
        const aggregated = yield* this.aggregatePeriod(periodKey, periodData))
        result = HashMap.set(result, periodKey, aggregated)
      }

      return result
    })
  }

  private aggregatePeriod(period: string, data: ProcessedData[]): Effect.Effect<AggregatedData> {
    return Effect.gen(function* () {
      const totalValue = data.reduce((sum, record) => sum + record.normalizedValue, 0)
      const averageValue = totalValue / data.length

      // Aggregate unique tags
      const allTags = data.flatMap(record => Array.from(record.tagSet))
      const uniqueTags = new Set(allTags)

      // Count tag occurrences
      const tagCounts = allTags.reduce((acc, tag) => {
        acc.set(tag, (acc.get(tag) || 0) + 1)
        return acc
      }, new Map<string, number>())

      const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }))

      return {
        period,
        totalValue,
        averageValue,
        uniqueTags,
        recordCount: data.length,
        topTags
      }
    })
  }

  // Custom transformation pipeline
  createCustomPipeline<T>(
    transformers: HashMap.HashMap<string, (data: T) => Effect.Effect<T>>
  ) {
    return (data: T, steps: string[]): Effect.Effect<T> =>
      Effect.gen(function* () {
        let result = data

        for (const step of steps) {
          const transformer = HashMap.get(transformers, step)
          if (transformer) {
            result = yield* transformer.value(result))
          } else {
            console.warn(`Unknown transformation step: ${step}`)
          }
        }

        return result
      })
  }

  // Processor implementations
  private parseTimestamp = (timestamp: string): Effect.Effect<Date> =>
    Effect.gen(function* () {
      const parsed = new Date(timestamp)
      if (isNaN(parsed.getTime())) {
        yield* Effect.fail(new Error(`Invalid timestamp: ${timestamp}`)))
      }
      return parsed
    })

  private normalizeValue = (value: number): Effect.Effect<number> =>
    Effect.succeed(Math.max(0, Math.min(100, value))) // Normalize to 0-100 range

  private processTags = (tags: string[]): Effect.Effect<Set<string>> =>
    Effect.succeed(new Set(tags.map(tag => tag.toLowerCase().trim())))

  private computeFields = (raw: RawData): Effect.Effect<HashMap.HashMap<string, any>> =>
    Effect.succeed(
      HashMap.make(
        ['hour', new Date(raw.timestamp).getHours()],
        ['dayOfWeek', new Date(raw.timestamp).getDay()],
        ['hasMetadata', Object.keys(raw.metadata).length > 0],
        ['tagCount', raw.tags.length]
      )
    )

  // Aggregator implementations
  private sumValues = (values: number[]): number =>
    values.reduce((sum, v) => sum + v, 0)

  private averageValues = (values: number[]): number =>
    values.length > 0 ? this.sumValues(values) / values.length : 0

  private countValues = (values: any[]): number => values.length

  private aggregateUniqueTags = (tagSets: Set<string>[]): Set<string> =>
    new Set(tagSets.flatMap(set => Array.from(set)))
}

// Usage example
const dataProcessingExample = () =>
  Effect.gen(function* () {
    const processor = new DataProcessor()

    // Sample raw data
    const rawData: RawData[] = [
      {
        id: '1',
        timestamp: '2023-01-01T10:00:00Z',
        value: 75,
        tags: ['sensor', 'temperature'],
        metadata: { location: 'room1' }
      },
      {
        id: '2',
        timestamp: '2023-01-01T10:05:00Z',
        value: 82,
        tags: ['sensor', 'humidity'],
        metadata: { location: 'room1' }
      },
      {
        id: '3',
        timestamp: '2023-01-01T10:10:00Z',
        value: 68,
        tags: ['sensor', 'temperature'],
        metadata: { location: 'room2' }
      }
    ]

    // Process batch
    const processed = yield* processor.processBatch(rawData, ['timestamp', 'normalize', 'tags', 'compute']))
    console.log('Processed records:', processed.length)

    // Aggregate by 10-minute periods
    const aggregated = yield* processor.aggregateByPeriod(processed, 10 * 60 * 1000))
    
    console.log('Aggregated periods:', HashMap.size(aggregated))
    for (const [period, data] of HashMap.entries(aggregated)) {
      console.log(`Period ${period}:`, data)
    }

    return { processed, aggregated }
  })
```

## Integration Examples

### Integration with Effect Ecosystem

```typescript
import { HashMap, Effect, Stream, Queue, Schedule, pipe } from "effect"

// HashMap with Effect Stream processing
const streamProcessingWithHashMap = () =>
  Effect.gen(function* () {
    // Create a stream of events
    const events = Stream.fromIterable([
      { type: 'user_login', userId: 'user1', timestamp: Date.now() },
      { type: 'page_view', userId: 'user1', page: '/home', timestamp: Date.now() + 1000 },
      { type: 'user_login', userId: 'user2', timestamp: Date.now() + 2000 },
      { type: 'page_view', userId: 'user2', page: '/profile', timestamp: Date.now() + 3000 },
      { type: 'user_logout', userId: 'user1', timestamp: Date.now() + 4000 }
    ])

    // Aggregate events by user using HashMap
    const userEventCounts = yield* 
      events.pipe(
        Stream.scan(HashMap.empty<string, number>(), (acc, event) => {
          const currentCount = HashMap.get(acc, event.userId).pipe(
            Option.getOrElse(() => 0)
          )
          return HashMap.set(acc, event.userId, currentCount + 1)
        }),
        Stream.runLast
      )
    )

    return userEventCounts
  })

// HashMap with Queue-based processing
const queueBasedProcessing = () =>
  Effect.gen(function* () {
    const queue = yield* Queue.bounded<{ key: string; value: number }>(100))
    let hashMap = HashMap.empty<string, number>()

    // Producer
    const producer = Effect.gen(function* () {
      for (let i = 0; i < 50; i++) {
        yield* Queue.offer(queue, { key: `key-${i % 10}`, value: i }))
        yield* Effect.sleep('100 millis'))
      }
      yield* Queue.shutdown(queue))
    })

    // Consumer that builds HashMap
    const consumer = Effect.gen(function* () {
      while (true) {
        const item = yield* Queue.take(queue))
        const existing = HashMap.get(hashMap, item.key).pipe(
          Option.getOrElse(() => 0)
        )
        hashMap = HashMap.set(hashMap, item.key, existing + item.value)
      }
    }).pipe(
      Effect.catchAll(() => Effect.succeed(hashMap))
    )

    // Run producer and consumer concurrently
    const [, result] = yield* Effect.all([producer, consumer], { concurrency: 2 }))

    return result
  })

// Integration with Schedule for periodic HashMap operations
const scheduledHashMapOperations = () =>
  Effect.gen(function* () {
    let cache = HashMap.empty<string, { value: any; timestamp: number }>()

    // Add items to cache
    const addToCache = (key: string, value: any) =>
      Effect.gen(function* () {
        cache = HashMap.set(cache, key, { value, timestamp: Date.now() })
        console.log(`Added ${key} to cache`)
      })

    // Clean expired items
    const cleanExpired = (maxAge: number) =>
      Effect.gen(function* () {
        const now = Date.now()
        const initialSize = HashMap.size(cache)
        
        cache = cache.pipe(
          HashMap.filter(entry => (now - entry.timestamp) < maxAge)
        )
        
        const removed = initialSize - HashMap.size(cache)
        if (removed > 0) {
          console.log(`Removed ${removed} expired items from cache`)
        }
      })

    // Schedule cache cleanup every 5 seconds
    const cleanupSchedule = pipe(
      cleanExpired(10000), // 10 second max age
      Effect.repeat(Schedule.fixed('5 seconds')),
      Effect.fork
    )

    // Add some test data
    yield* addToCache('item1', 'value1'))
    yield* addToCache('item2', 'value2'))
    yield* addToCache('item3', 'value3'))

    // Start cleanup schedule
    const cleanupFiber = yield* cleanupSchedule)

    // Wait a bit and add more data
    yield* Effect.sleep('7 seconds'))
    yield* addToCache('item4', 'value4'))

    // Wait for cleanup to run
    yield* Effect.sleep('8 seconds'))

    // Stop cleanup
    yield* Effect.interrupt(cleanupFiber))

    return cache
  })
```

### Integration with Popular Libraries

```typescript
import { HashMap, pipe, Effect } from "effect"

// Integration with HTTP client libraries
const httpClientIntegration = () => {
  interface CachedResponse {
    data: any
    headers: Record<string, string>
    timestamp: number
    etag?: string
  }

  class HttpCache {
    private cache: HashMap.HashMap<string, CachedResponse> = HashMap.empty()

    // Cached HTTP GET with ETags
    cachedGet(url: string, headers: Record<string, string> = {}): Effect.Effect<any> {
      return Effect.gen(function* () {
        const cached = HashMap.get(this.cache, url)
        
        // Add If-None-Match header if we have cached ETag
        const requestHeaders = { ...headers }
        if (cached && cached.value.etag) {
          requestHeaders['If-None-Match'] = cached.value.etag
        }

        // Simulate HTTP request
        const response = yield* this.makeRequest(url, requestHeaders))

        if (response.status === 304 && cached) {
          // Not modified, return cached response
          return cached.value.data
        }

        // Cache new response
        const cacheEntry: CachedResponse = {
          data: response.data,
          headers: response.headers,
          timestamp: Date.now(),
          etag: response.headers.etag
        }

        this.cache = HashMap.set(this.cache, url, cacheEntry)
        return response.data
      }.bind(this))
    }

    private makeRequest(url: string, headers: Record<string, string>): Effect.Effect<{
      status: number
      data: any
      headers: Record<string, string>
    }> {
      // Simulate HTTP request
      return Effect.gen(function* () {
        yield* Effect.sleep('100 millis'))
        
        return {
          status: 200,
          data: { message: `Data from ${url}`, timestamp: Date.now() },
          headers: { etag: `"${Math.random().toString(36)}"` }
        }
      })
    }

    getCacheStats() {
      const entries = HashMap.entries(this.cache)
      return {
        size: HashMap.size(this.cache),
        oldestEntry: entries.length > 0 ? Math.min(...entries.map(([, entry]) => entry.timestamp)) : null,
        newestEntry: entries.length > 0 ? Math.max(...entries.map(([, entry]) => entry.timestamp)) : null
      }
    }
  }

  return Effect.gen(function* () {
    const httpCache = new HttpCache()

    // Make cached requests
    const response1 = yield* httpCache.cachedGet('https://api.example.com/users'))
    const response2 = yield* httpCache.cachedGet('https://api.example.com/posts'))
    const response3 = yield* httpCache.cachedGet('https://api.example.com/users')) // Should use cache

    const stats = httpCache.getCacheStats()
    console.log('HTTP Cache stats:', stats)

    return { response1, response2, response3, stats }
  })
}

// Integration with database ORM patterns
const databaseIntegration = () => {
  interface User {
    id: string
    name: string
    email: string
    createdAt: Date
    updatedAt: Date
  }

  class UserRepository {
    private cache: HashMap.HashMap<string, User> = HashMap.empty()
    private indexes: {
      byEmail: HashMap.HashMap<string, string> // email -> id
      byName: HashMap.HashMap<string, string[]> // name -> ids
    } = {
      byEmail: HashMap.empty(),
      byName: HashMap.empty()
    }

    // Create user with automatic indexing
    create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Effect.Effect<User> {
      return Effect.gen(function* () {
        const user: User = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Check for duplicate email
        const existingEmail = HashMap.get(this.indexes.byEmail, user.email)
        if (existingEmail) {
          yield* Effect.fail(new Error(`User with email ${user.email} already exists`)))
        }

        // Add to cache
        this.cache = HashMap.set(this.cache, user.id, user)

        // Update indexes
        this.indexes.byEmail = HashMap.set(this.indexes.byEmail, user.email, user.id)
        
        const nameIds = HashMap.get(this.indexes.byName, user.name).pipe(
          Option.getOrElse(() => [] as string[])
        )
        this.indexes.byName = this.indexes.byName.pipe(
          HashMap.set(user.name, [...nameIds, user.id])
        )

        return user
      }.bind(this))
    }

    // Find by ID
    findById(id: string): Effect.Effect<Option.Option<User>> {
      return Effect.succeed(HashMap.get(this.cache, id))
    }

    // Find by email using index
    findByEmail(email: string): Effect.Effect<Option.Option<User>> {
      return Effect.gen(function* () {
        const userId = HashMap.get(this.indexes.byEmail, email)
        if (Option.isNone(userId)) {
          return Option.none()
        }
        
        return yield* this.findById(userId.value))
      }.bind(this))
    }

    // Find by name using index
    findByName(name: string): Effect.Effect<User[]> {
      return Effect.gen(function* () {
        const userIds = HashMap.get(this.indexes.byName, name).pipe(
          Option.getOrElse(() => [] as string[])
        )

        const users: User[] = []
        for (const id of userIds) {
          const user = yield* this.findById(id))
          if (Option.isSome(user)) {
            users.push(user.value)
          }
        }

        return users
      }.bind(this))
    }

    // Update user with index maintenance
    update(id: string, updates: Partial<User>): Effect.Effect<Option.Option<User>> {
      return Effect.gen(function* () {
        const existingUser = HashMap.get(this.cache, id)
        if (Option.isNone(existingUser)) {
          return Option.none()
        }

        const oldUser = existingUser.value
        const updatedUser = {
          ...oldUser,
          ...updates,
          updatedAt: new Date()
        }

        // Update cache
        this.cache = HashMap.set(this.cache, id, updatedUser)

        // Update indexes if email or name changed
        if (updates.email && updates.email !== oldUser.email) {
          this.indexes.byEmail = HashMap.remove(this.indexes.byEmail, oldUser.email)
          this.indexes.byEmail = HashMap.set(this.indexes.byEmail, updates.email, id)
        }

        if (updates.name && updates.name !== oldUser.name) {
          // Remove from old name index
          const oldNameIds = HashMap.get(this.indexes.byName, oldUser.name).pipe(
            Option.getOrElse(() => [] as string[])
          ).filter(userId => userId !== id)
          
          if (oldNameIds.length === 0) {
            this.indexes.byName = HashMap.remove(this.indexes.byName, oldUser.name)
          } else {
            this.indexes.byName = HashMap.set(this.indexes.byName, oldUser.name, oldNameIds)
          }

          // Add to new name index
          const newNameIds = HashMap.get(this.indexes.byName, updates.name).pipe(
            Option.getOrElse(() => [] as string[])
          )
          this.indexes.byName = this.indexes.byName.pipe(
            HashMap.set(updates.name, [...newNameIds, id])
          )
        }

        return Option.some(updatedUser)
      }.bind(this))
    }

    // Get repository statistics
    getStats() {
      return {
        totalUsers: HashMap.size(this.cache),
        uniqueEmails: HashMap.size(this.indexes.byEmail),
        uniqueNames: HashMap.size(this.indexes.byName),
        indexConsistency: HashMap.size(this.cache) === HashMap.size(this.indexes.byEmail)
      }
    }
  }

  return Effect.gen(function* () {
    const repo = new UserRepository()

    // Create users
    const alice = yield* repo.create({ name: 'Alice', email: 'alice@example.com' }))
    const bob = yield* repo.create({ name: 'Bob', email: 'bob@example.com' }))
    const charlie = yield* repo.create({ name: 'Charlie', email: 'charlie@example.com' }))

    // Test queries
    const foundByEmail = yield* repo.findByEmail('alice@example.com'))
    const foundByName = yield* repo.findByName('Bob'))

    // Update user
    const updatedAlice = yield* repo.update(alice.id, { name: 'Alice Smith' }))

    const stats = repo.getStats()
    console.log('Repository stats:', stats)

    return { alice, bob, charlie, foundByEmail, foundByName, updatedAlice, stats }
  })
}
```

### Testing Strategies

```typescript
import { HashMap, pipe, Effect } from "effect"

// Property-based testing for HashMap operations
const hashMapPropertyTests = () => {
  // Test helper functions
  const generateRandomHashMap = (size: number): HashMap.HashMap<string, number> => {
    let map = HashMap.empty<string, number>()
    for (let i = 0; i < size; i++) {
      map = HashMap.set(map, `key-${i}`, Math.floor(Math.random() * 1000))
    }
    return map
  }

  const runPropertyTest = <T>(
    name: string,
    generator: () => T,
    property: (value: T) => boolean,
    iterations: number = 100
  ): { passed: number; failed: number; errors: string[] } => {
    let passed = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < iterations; i++) {
      try {
        const value = generator()
        if (property(value)) {
          passed++
        } else {
          failed++
          errors.push(`Property failed for iteration ${i}`)
        }
      } catch (error) {
        failed++
        errors.push(`Error in iteration ${i}: ${error}`)
      }
    }

    console.log(`${name}: ${passed} passed, ${failed} failed`)
    if (errors.length > 0) {
      console.log('Errors:', errors.slice(0, 5)) // Show first 5 errors
    }

    return { passed, failed, errors }
  }

  // Property tests
  const tests = [
    // Property: Size is consistent
    runPropertyTest(
      'Size consistency',
      () => generateRandomHashMap(Math.floor(Math.random() * 100)),
      map => {
        const entries = HashMap.entries(map)
        return HashMap.size(map) === entries.length
      }
    ),

    // Property: Set then get returns the value
    runPropertyTest(
      'Set-Get consistency',
      () => ({
        map: generateRandomHashMap(50),
        key: `test-key-${Math.random()}`,
        value: Math.floor(Math.random() * 1000)
      }),
      ({ map, key, value }) => {
        const updated = HashMap.set(map, key, value)
        const retrieved = HashMap.get(updated, key)
        return retrieved && retrieved.value === value
      }
    ),

    // Property: Remove after set removes the key
    runPropertyTest(
      'Set-Remove consistency',
      () => ({
        map: generateRandomHashMap(50),
        key: `test-key-${Math.random()}`
      }),
      ({ map, key }) => {
        const withKey = HashMap.set(map, key, 42)
        const withoutKey = HashMap.remove(withKey, key)
        return !HashMap.has(withoutKey, key)
      }
    ),

    // Property: Filter preserves order and reduces size
    runPropertyTest(
      'Filter properties',
      () => generateRandomHashMap(100),
      map => {
        const filtered = HashMap.filter(map, value => value > 500)
        const originalSize = HashMap.size(map)
        const filteredSize = HashMap.size(filtered)
        
        // Size should be reduced or same
        const sizeProperty = filteredSize <= originalSize
        
        // All values in filtered map should satisfy predicate
        const valueProperty = HashMap.values(filtered).every(value => value > 500)
        
        return sizeProperty && valueProperty
      }
    ),

    // Property: Union is commutative for non-overlapping keys
    runPropertyTest(
      'Union commutativity (non-overlapping)',
      () => {
        const map1 = generateRandomHashMap(20)
        const map2 = HashMap.fromIterable(
          Array.from({ length: 20 }, (_, i) => [`other-${i}`, Math.random() * 1000] as const)
        )
        return { map1, map2 }
      },
      ({ map1, map2 }) => {
        const union1 = HashMap.union(map1, map2)
        const union2 = HashMap.union(map2, map1)
        
        // Should have same size
        const sizeEqual = HashMap.size(union1) === HashMap.size(union2)
        
        // Should contain all keys from both maps
        const allKeys1 = new Set([...HashMap.keys(map1), ...HashMap.keys(map2)])
        const allKeys2 = new Set([...HashMap.keys(union1)])
        const keysEqual = allKeys1.size === allKeys2.size
        
        return sizeEqual && keysEqual
      }
    )
  ]

  return tests
}

// Unit testing utilities
const hashMapTestUtils = {
  // Create test HashMap with known data
  createTestMap: () => HashMap.make(
    ['user1', { name: 'Alice', age: 30 }],
    ['user2', { name: 'Bob', age: 25 }],
    ['user3', { name: 'Charlie', age: 35 }]
  ),

  // Assert HashMap equality
  assertHashMapEqual: <K, V>(
    actual: HashMap.HashMap<K, V>,
    expected: HashMap.HashMap<K, V>
  ): boolean => {
    if (HashMap.size(actual) !== HashMap.size(expected)) {
      return false
    }

    for (const [key, value] of HashMap.entries(expected)) {
      const actualValue = HashMap.get(actual, key)
      if (!actualValue || actualValue.value !== value) {
        return false
      }
    }

    return true
  },

  // Test Effect-based HashMap operations
  testEffectHashMapOperations: () =>
    Effect.gen(function* () {
      const testMap = hashMapTestUtils.createTestMap()
      
      // Test safe operations
      const user1 = yield* 
        Effect.gen(function* () {
          const user = HashMap.get(testMap, 'user1')
          if (!user) {
            yield* Effect.fail(new Error('User not found')))
          }
          return user.value
        })
      )

      // Test batch operations
      const batchUpdates = yield* 
        Effect.gen(function* () {
          let result = testMap
          
          const updates = [
            { key: 'user1', value: { name: 'Alice Smith', age: 31 } },
            { key: 'user4', value: { name: 'Diana', age: 28 } }
          ]

          for (const update of updates) {
            result = HashMap.set(result, update.key, update.value)
          }

          return result
        })
      )

      return {
        originalSize: HashMap.size(testMap),
        user1,
        updatedSize: HashMap.size(batchUpdates),
        hasNewUser: HashMap.has(batchUpdates, 'user4')
      }
    }),

  // Performance testing
  performanceTest: (name: string, operation: () => any, iterations: number = 1000) => {
    const start = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      operation()
    }
    
    const end = performance.now()
    const avgTime = (end - start) / iterations
    
    console.log(`${name}: ${avgTime.toFixed(4)}ms per operation (${iterations} iterations)`)
    
    return { totalTime: end - start, averageTime: avgTime, iterations }
  },

  // Memory usage estimation (conceptual)
  estimateMemoryUsage: <K, V>(map: HashMap.HashMap<K, V>) => {
    const entryCount = HashMap.size(map)
    
    // Rough estimation - actual implementation would be more sophisticated
    const estimatedBytesPerEntry = 64 // Rough estimate for key + value + overhead
    const estimatedTotalBytes = entryCount * estimatedBytesPerEntry
    
    return {
      entryCount,
      estimatedBytes: estimatedTotalBytes,
      estimatedKB: Math.round(estimatedTotalBytes / 1024 * 100) / 100
    }
  }
}

// Example test suite
const runHashMapTestSuite = () => {
  console.log('=== HashMap Test Suite ===')
  
  // Property tests
  console.log('\n--- Property Tests ---')
  hashMapPropertyTests()
  
  // Unit tests
  console.log('\n--- Unit Tests ---')
  const testMap = hashMapTestUtils.createTestMap()
  console.log('Test map created with size:', HashMap.size(testMap))
  
  const expectedMap = HashMap.make(
    ['user1', { name: 'Alice', age: 30 }],
    ['user2', { name: 'Bob', age: 25 }]
  )
  
  const filteredMap = testMap.pipe(
    HashMap.filter(user => user.age < 35)
  )
  
  console.log('Filter test passed:', HashMap.size(filteredMap) === 2)
  
  // Effect tests
  console.log('\n--- Effect Tests ---')
  Effect.runPromise(hashMapTestUtils.testEffectHashMapOperations()).then(result => {
    console.log('Effect test results:', result)
  })
  
  // Performance tests
  console.log('\n--- Performance Tests ---')
  const largeMap = HashMap.empty<number, string>().pipe(
    map => {
      let result = map
      for (let i = 0; i < 10000; i++) {
        result = HashMap.set(result, i, `value-${i}`)
      }
      return result
    }
  )
  
  hashMapTestUtils.performanceTest(
    'HashMap.get',
    () => HashMap.get(largeMap, Math.floor(Math.random() * 10000)),
    10000
  )
  
  hashMapTestUtils.performanceTest(
    'HashMap.set',
    () => HashMap.set(largeMap, Math.floor(Math.random() * 10000), 'new-value'),
    1000
  )
  
  // Memory estimation
  console.log('\n--- Memory Estimation ---')
  const memoryEstimate = hashMapTestUtils.estimateMemoryUsage(largeMap)
  console.log('Memory estimate for large HashMap:', memoryEstimate)
  
  return {
    testMap,
    filteredMap,
    largeMap,
    memoryEstimate
  }
}
```

## Conclusion

HashMap provides persistent, immutable hash maps with structural sharing and high performance for Effect applications.

Key benefits:
- **Structural Sharing**: Memory-efficient immutable updates through shared structure
- **High Performance**: O(1) average-case operations with optimized hash table implementation
- **Type Safety**: Full TypeScript integration with Effect's type system
- **Functional Programming**: Immutable operations that compose naturally with Effect patterns
- **Rich API**: Comprehensive set of operations for filtering, mapping, reducing, and transforming data

HashMap is ideal for applications requiring efficient key-value storage, caching systems, state management, and any scenario where immutable maps with high performance are needed while maintaining functional programming principles.