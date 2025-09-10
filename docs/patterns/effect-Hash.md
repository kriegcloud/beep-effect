# Hash: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Hash Solves

JavaScript's native equality checking and object comparison can be inefficient and problematic for functional programming patterns. Traditional approaches suffer from performance bottlenecks and lack of structural equality:

```typescript
// Traditional approach - inefficient object comparison
class UserCache {
  private users = new Map<string, User>()
  
  addUser(user: User): boolean {
    // Linear search for duplicates - O(n) complexity
    for (const [key, existingUser] of this.users) {
      if (
        existingUser.name === user.name &&
        existingUser.email === user.email &&
        existingUser.age === user.age &&
        existingUser.preferences.theme === user.preferences.theme
        // ... potentially many more comparisons
      ) {
        return false // Duplicate found
      }
    }
    
    this.users.set(user.id, user)
    return true
  }
  
  hasUser(user: User): boolean {
    // Another expensive linear search
    for (const existingUser of this.users.values()) {
      if (this.deepEquals(user, existingUser)) {
        return true
      }
    }
    return false
  }
  
  private deepEquals(a: any, b: any): boolean {
    // Expensive recursive comparison
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object') return a === b
    
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
      if (!this.deepEquals(a[key], b[key])) return false
    }
    
    return true
  }
}

// Set-based deduplication has similar issues
const deduplicateUsers = (users: User[]): User[] => {
  const unique: User[] = []
  
  for (const user of users) {
    let isDuplicate = false
    for (const existing of unique) {
      if (deepCompare(user, existing)) {
        isDuplicate = true
        break
      }
    }
    if (!isDuplicate) {
      unique.push(user)
    }
  }
  
  return unique
}
```

This approach leads to:
- **Performance degradation** - O(n²) complexity for duplicate detection
- **Memory waste** - No efficient deduplication mechanism
- **Type safety issues** - Deep equality checking without type guarantees
- **Poor scalability** - Performance degrades dramatically with data size

### The Hash Solution

Hash provides efficient hashing functions that enable fast equality checking and optimize data structure performance through structural sharing:

```typescript
import { Hash, HashMap, HashSet, Equal } from "effect"

// Fast hashing enables efficient collections
const userCache = HashMap.make(
  ['user1', { id: 'user1', name: 'Alice', email: 'alice@example.com' }],
  ['user2', { id: 'user2', name: 'Bob', email: 'bob@example.com' }]
)

// O(1) average lookup time instead of O(n)
const alice = HashMap.get(userCache, 'user1') // Fast hash-based lookup

// Efficient deduplication with HashSet
const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '1', name: 'Alice' }, // Duplicate
  { id: '3', name: 'Charlie' }
]

const uniqueUsers = HashSet.fromIterable(users) // Automatic deduplication via hashing
const uniqueArray = Array.from(uniqueUsers) // [Alice, Bob, Charlie]
```

### Key Concepts

**Hash Function**: Converts any value to a fixed-size integer that serves as a "fingerprint" for quick comparison

**Structural Hashing**: Computes hashes based on the content/structure of objects rather than reference identity

**Hash Collision Handling**: Manages cases where different values produce the same hash through secondary comparison

## Basic Usage Patterns

### Pattern 1: Basic Value Hashing

```typescript
import { Hash } from "effect"

// Hash primitive values
const stringHash = Hash.hash("hello world")     // 1794106052
const numberHash = Hash.hash(42)                // 42
const booleanHash = Hash.hash(true)             // 1544803905

// Hash complex objects
const user = { 
  id: 'user1', 
  name: 'Alice', 
  preferences: { theme: 'dark', notifications: true } 
}
const userHash = Hash.hash(user) // Generates hash from object structure

console.log('User hash:', userHash)
```

### Pattern 2: Custom Hash Implementation

```typescript
import { Hash, Equal } from "effect"

class Product implements Equal.Equal {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly price: number,
    readonly category: string
  ) {}

  // Efficient equality based on business logic
  [Equal.symbol](that: Equal.Equal): boolean {
    return (
      that instanceof Product &&
      this.id === that.id &&
      this.name === that.name &&
      this.price === that.price &&
      this.category === that.category
    )
  }

  // Hash based on unique identifier for performance
  [Hash.symbol](): number {
    return Hash.combine(Hash.hash(this.id))(Hash.hash(this.category))
  }
}

// Usage in collections
const products = [
  new Product('p1', 'Laptop', 999, 'electronics'),
  new Product('p2', 'Book', 29, 'books'),
  new Product('p1', 'Laptop', 999, 'electronics') // Duplicate
]

const uniqueProducts = HashSet.fromIterable(products)
console.log('Unique products:', HashSet.size(uniqueProducts)) // 2, not 3
```

### Pattern 3: Combining Hash Values

```typescript
import { Hash, pipe } from "effect"

// Combine multiple hash values for composite keys
const createCompositeHash = (userId: string, sessionId: string, timestamp: number) => {
  return pipe(
    Hash.hash(userId),
    Hash.combine(Hash.hash(sessionId)),
    Hash.combine(Hash.hash(timestamp))
  )
}

// Use for complex caching keys
const cacheKey = createCompositeHash('user123', 'session456', Date.now())

// Structure-based hashing for nested objects
const nestedData = {
  user: { id: 'u1', profile: { name: 'Alice', settings: { theme: 'dark' } } },
  session: { id: 's1', expires: new Date('2024-12-31') },
  metadata: { version: '1.0', features: ['auth', 'cache'] }
}

const structuralHash = Hash.structure(nestedData)
console.log('Structural hash:', structuralHash)
```

## Real-World Examples

### Example 1: High-Performance Entity Cache

A system that needs to cache and efficiently lookup entities with complex equality logic:

```typescript
import { Hash, HashMap, HashSet, Effect, Equal, Option } from "effect"

// Entity with business logic equality
class Customer implements Equal.Equal {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly name: string,
    readonly tier: 'bronze' | 'silver' | 'gold',
    readonly metadata: Record<string, unknown>
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    return (
      that instanceof Customer &&
      this.id === that.id &&
      this.email === that.email &&
      this.name === that.name &&
      this.tier === that.tier
      // Metadata not included in equality for business reasons
    )
  }

  [Hash.symbol](): number {
    // Hash based on unique identifier and business-critical fields
    return pipe(
      Hash.hash(this.id),
      Hash.combine(Hash.hash(this.email)),
      Hash.combine(Hash.hash(this.tier))
    )
  }
}

class CustomerRepository {
  private cache = HashMap.empty<string, Customer>()
  private emailIndex = HashMap.empty<string, string>() // email -> id mapping
  private tierGroups = HashMap.empty<string, HashSet.HashSet<string>>() // tier -> ids

  // Add customer with automatic indexing
  addCustomer(customer: Customer): Effect.Effect<void> {
    return Effect.gen(function* () {
      // Check for duplicate email
      const existingByEmail = HashMap.get(this.emailIndex, customer.email)
      if (Option.isSome(existingByEmail) && existingByEmail.value !== customer.id) {
        yield* Effect.fail(new Error(`Email ${customer.email} already exists`))
      }

      // Update main cache
      this.cache = HashMap.set(this.cache, customer.id, customer)
      
      // Update email index
      this.emailIndex = HashMap.set(this.emailIndex, customer.email, customer.id)
      
      // Update tier grouping
      const currentTierGroup = HashMap.get(this.tierGroups, customer.tier).pipe(
        Option.getOrElse(() => HashSet.empty<string>())
      )
      const updatedTierGroup = HashSet.add(currentTierGroup, customer.id)
      this.tierGroups = HashMap.set(this.tierGroups, customer.tier, updatedTierGroup)
      
      console.log(`Added customer ${customer.name} (${customer.tier} tier)`)
    }.bind(this))
  }

  // Fast lookups using hash-based structures
  findById(id: string): Effect.Effect<Option.Option<Customer>> {
    return Effect.gen(function* () {
      const customer = HashMap.get(this.cache, id)
      if (Option.isSome(customer)) {
        console.log(`Cache hit for customer ID: ${id}`)
      }
      return customer
    }.bind(this))
  }

  findByEmail(email: string): Effect.Effect<Option.Option<Customer>> {
    return Effect.gen(function* () {
      const customerId = HashMap.get(this.emailIndex, email)
      if (Option.isNone(customerId)) {
        return Option.none()
      }
      return yield* this.findById(customerId.value)
    }.bind(this))
  }

  findByTier(tier: string): Effect.Effect<Customer[]> {
    return Effect.gen(function* () {
      const customerIds = HashMap.get(this.tierGroups, tier).pipe(
        Option.getOrElse(() => HashSet.empty<string>())
      )
      
      const customers: Customer[] = []
      for (const id of customerIds) {
        const customer = yield* this.findById(id)
        if (Option.isSome(customer)) {
          customers.push(customer.value)
        }
      }
      
      return customers
    }.bind(this))
  }

  // Bulk operations with deduplication
  addCustomers(customers: Customer[]): Effect.Effect<{ added: number; duplicates: number }> {
    return Effect.gen(function* () {
      // Use HashSet to automatically deduplicate based on our custom equality/hash
      const uniqueCustomers = HashSet.fromIterable(customers)
      let addedCount = 0

      for (const customer of uniqueCustomers) {
        try {
          yield* this.addCustomer(customer)
          addedCount++
        } catch {
          // Customer already exists or other error
        }
      }

      return {
        added: addedCount,
        duplicates: customers.length - HashSet.size(uniqueCustomers)
      }
    }.bind(this))
  }

  getStats(): Effect.Effect<{
    totalCustomers: number
    tierDistribution: Record<string, number>
    cacheEfficiency: number
  }> {
    return Effect.gen(function* () {
      const totalCustomers = HashMap.size(this.cache)
      
      // Calculate tier distribution
      const tierDistribution: Record<string, number> = {}
      for (const [tier, customerSet] of this.tierGroups) {
        tierDistribution[tier] = HashSet.size(customerSet)
      }

      return {
        totalCustomers,
        tierDistribution,
        cacheEfficiency: totalCustomers > 0 ? 1.0 : 0 // Always 100% for in-memory cache
      }
    }.bind(this))
  }
}

// Usage example
const demonstrateCustomerRepository = () =>
  Effect.gen(function* () {
    const repo = new CustomerRepository()

    // Add customers with some duplicates
    const customers = [
      new Customer('c1', 'alice@company.com', 'Alice Smith', 'gold', { region: 'US' }),
      new Customer('c2', 'bob@company.com', 'Bob Jones', 'silver', { region: 'EU' }),
      new Customer('c3', 'charlie@company.com', 'Charlie Brown', 'bronze', { region: 'US' }),
      new Customer('c1', 'alice@company.com', 'Alice Smith', 'gold', { region: 'US' }), // Duplicate
      new Customer('c4', 'diana@company.com', 'Diana Prince', 'gold', { region: 'US' })
    ]

    const result = yield* repo.addCustomers(customers)
    console.log(`Added ${result.added} unique customers, ${result.duplicates} duplicates`)

    // Fast lookups
    const alice = yield* repo.findByEmail('alice@company.com')
    const goldCustomers = yield* repo.findByTier('gold')
    
    console.log('Alice:', alice)
    console.log('Gold customers:', goldCustomers.length)

    const stats = yield* repo.getStats()
    console.log('Repository stats:', stats)
  })
```

### Example 2: Content Deduplication System

A system that processes large amounts of content and needs to identify duplicates efficiently:

```typescript
import { Hash, HashMap, HashSet, Effect, Equal, pipe } from "effect"

interface ContentMetadata {
  title: string
  author: string
  publishedAt: Date
  tags: string[]
  contentHash: string
}

class ContentItem implements Equal.Equal {
  constructor(
    readonly id: string,
    readonly content: string,
    readonly metadata: ContentMetadata
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    return (
      that instanceof ContentItem &&
      this.metadata.contentHash === that.metadata.contentHash
      // Content is considered equal if hashes match, regardless of metadata
    )
  }

  [Hash.symbol](): number {
    // Hash based on content for deduplication
    return Hash.hash(this.metadata.contentHash)
  }
}

class ContentProcessor {
  private seenContent = HashSet.empty<ContentItem>()
  private contentByHash = HashMap.empty<string, ContentItem>()
  private tagIndex = HashMap.empty<string, HashSet.HashSet<string>>() // tag -> contentIds
  
  // Process content with automatic deduplication
  processContent(items: ContentItem[]): Effect.Effect<{
    processed: ContentItem[]
    duplicates: ContentItem[]
    stats: ProcessingStats
  }> {
    return Effect.gen(function* () {
      const processed: ContentItem[] = []
      const duplicates: ContentItem[] = []
      let hashCollisions = 0

      for (const item of items) {
        const contentHash = item.metadata.contentHash
        const existingItem = HashMap.get(this.contentByHash, contentHash)

        if (Option.isSome(existingItem)) {
          // Potential duplicate - verify with full content comparison
          if (Equal.equals(item, existingItem.value)) {
            duplicates.push(item)
            continue
          } else {
            // Hash collision - different content with same hash
            hashCollisions++
          }
        }

        // New unique content
        this.seenContent = HashSet.add(this.seenContent, item)
        this.contentByHash = HashMap.set(this.contentByHash, contentHash, item)
        
        // Update tag index
        for (const tag of item.metadata.tags) {
          const taggedContent = HashMap.get(this.tagIndex, tag).pipe(
            Option.getOrElse(() => HashSet.empty<string>())
          )
          this.tagIndex = HashMap.set(
            this.tagIndex, 
            tag, 
            HashSet.add(taggedContent, item.id)
          )
        }

        processed.push(item)
      }

      const stats: ProcessingStats = {
        totalProcessed: items.length,
        uniqueContent: processed.length,
        duplicatesFound: duplicates.length,
        hashCollisions,
        uniqueTags: HashMap.size(this.tagIndex),
        deduplicationRate: items.length > 0 
          ? duplicates.length / items.length 
          : 0
      }

      return { processed, duplicates, stats }
    }.bind(this))
  }

  // Find similar content by tag overlap
  findSimilarContent(item: ContentItem, minTagOverlap: number = 2): Effect.Effect<ContentItem[]> {
    return Effect.gen(function* () {
      const similar: ContentItem[] = []
      const itemTags = new Set(item.metadata.tags)

      for (const [contentId, content] of this.contentByHash) {
        if (content.id === item.id) continue

        const contentTags = new Set(content.metadata.tags)
        const overlap = Array.from(itemTags).filter(tag => contentTags.has(tag)).length

        if (overlap >= minTagOverlap) {
          similar.push(content)
        }
      }

      return similar.sort((a, b) => {
        const overlapA = Array.from(itemTags).filter(tag => 
          a.metadata.tags.includes(tag)
        ).length
        const overlapB = Array.from(itemTags).filter(tag => 
          b.metadata.tags.includes(tag)
        ).length
        return overlapB - overlapA // Sort by descending overlap
      })
    }.bind(this))
  }

  // Get content statistics
  getContentStats(): Effect.Effect<ContentStats> {
    return Effect.gen(function* () {
      const tagDistribution = HashMap.reduce(
        this.tagIndex,
        {} as Record<string, number>,
        (acc, contentSet, tag) => {
          acc[tag] = HashSet.size(contentSet)
          return acc
        }
      )

      const avgTagsPerContent = HashMap.size(this.tagIndex) > 0
        ? Object.values(tagDistribution).reduce((sum, count) => sum + count, 0) / 
          HashMap.size(this.contentByHash)
        : 0

      return {
        totalUniqueContent: HashMap.size(this.contentByHash),
        totalTags: HashMap.size(this.tagIndex),
        avgTagsPerContent,
        tagDistribution,
        memoryEfficiency: HashSet.size(this.seenContent) / 
          (HashMap.size(this.contentByHash) || 1)
      }
    }.bind(this))
  }
}

interface ProcessingStats {
  totalProcessed: number
  uniqueContent: number
  duplicatesFound: number
  hashCollisions: number
  uniqueTags: number
  deduplicationRate: number
}

interface ContentStats {
  totalUniqueContent: number
  totalTags: number
  avgTagsPerContent: number
  tagDistribution: Record<string, number>
  memoryEfficiency: number
}

// Helper to create content hash
const createContentHash = (content: string): string => {
  return Hash.string(content).toString(16)
}

// Usage example
const demonstrateContentProcessor = () =>
  Effect.gen(function* () {
    const processor = new ContentProcessor()

    // Sample content with duplicates
    const articles = [
      new ContentItem('a1', 'JavaScript fundamentals...', {
        title: 'JS Basics',
        author: 'Alice',
        publishedAt: new Date('2024-01-01'),
        tags: ['javascript', 'programming', 'basics'],
        contentHash: createContentHash('JavaScript fundamentals...')
      }),
      new ContentItem('a2', 'Advanced React patterns...', {
        title: 'React Advanced',
        author: 'Bob',
        publishedAt: new Date('2024-01-02'),
        tags: ['react', 'javascript', 'advanced'],
        contentHash: createContentHash('Advanced React patterns...')
      }),
      new ContentItem('a3', 'JavaScript fundamentals...', { // Duplicate content
        title: 'JS Fundamentals', // Different title
        author: 'Charlie', // Different author
        publishedAt: new Date('2024-01-03'),
        tags: ['javascript', 'programming', 'tutorial'],
        contentHash: createContentHash('JavaScript fundamentals...')
      }),
      new ContentItem('a4', 'TypeScript best practices...', {
        title: 'TS Best Practices',
        author: 'Diana',
        publishedAt: new Date('2024-01-04'),
        tags: ['typescript', 'javascript', 'best-practices'],
        contentHash: createContentHash('TypeScript best practices...')
      })
    ]

    // Process content
    const result = yield* processor.processContent(articles)
    
    console.log('Processing Results:')
    console.log(`- Processed: ${result.processed.length} unique articles`)
    console.log(`- Duplicates: ${result.duplicates.length}`)
    console.log(`- Deduplication rate: ${(result.stats.deduplicationRate * 100).toFixed(1)}%`)

    // Find similar content
    const jsArticle = result.processed.find(a => a.metadata.tags.includes('javascript'))
    if (jsArticle) {
      const similar = yield* processor.findSimilarContent(jsArticle)
      console.log(`Found ${similar.length} similar articles to "${jsArticle.metadata.title}"`)
    }

    // Get statistics
    const stats = yield* processor.getContentStats()
    console.log('Content Statistics:', stats)
  })
```

### Example 3: Performance Optimization with Custom Hash Strategies

A system that implements custom hashing strategies for different types of data to maximize performance:

```typescript
import { Hash, HashMap, HashSet, Effect, Equal, pipe } from "effect"

// Different hash strategies for different use cases
namespace HashStrategies {
  // Fast hash for frequently accessed data
  export const fastHash = <T>(value: T): number => {
    if (typeof value === 'string') {
      // Simple polynomial rolling hash for speed
      let hash = 0
      for (let i = 0; i < Math.min(value.length, 32); i++) { // Limit to first 32 chars
        hash = (hash * 31 + value.charCodeAt(i)) & 0x7fffffff
      }
      return hash
    }
    return Hash.hash(value)
  }

  // Collision-resistant hash for critical data
  export const secureHash = <T>(value: T): number => {
    if (typeof value === 'string') {
      // More thorough hashing to reduce collisions
      return Hash.string(value)
    }
    if (typeof value === 'object' && value !== null) {
      // Deep structural hash
      return Hash.structure(value)
    }
    return Hash.hash(value)
  }

  // Content-aware hash for specific data types
  export const contentAwareHash = (data: any): number => {
    if (Array.isArray(data)) {
      return Hash.array(data)
    }
    if (data && typeof data === 'object') {
      // Hash based on specific keys for domain objects
      if ('id' in data && 'version' in data) {
        return pipe(
          Hash.hash(data.id),
          Hash.combine(Hash.hash(data.version))
        )
      }
      return Hash.structure(data)
    }
    return Hash.hash(data)
  }
}

// Entity with pluggable hash strategy
class OptimizedEntity<T> implements Equal.Equal {
  constructor(
    readonly data: T,
    readonly hashStrategy: (value: T) => number = HashStrategies.secureHash
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    return (
      that instanceof OptimizedEntity &&
      Equal.equals(this.data, that.data)
    )
  }

  [Hash.symbol](): number {
    return Hash.cached(this, this.hashStrategy(this.data))
  }
}

// Performance-optimized cache with custom hash strategies
class MultiTierCache<K, V> {
  // Fast tier for frequently accessed items
  private hotCache = HashMap.empty<K, { value: V; accessCount: number; lastAccess: number }>()
  
  // Cold tier for less frequently accessed items
  private coldCache = HashMap.empty<K, { value: V; accessCount: number; lastAccess: number }>()
  
  // Hash strategy for keys
  private keyHashStrategy: (key: K) => number

  constructor(
    private maxHotSize: number = 1000,
    private maxColdSize: number = 10000,
    keyHashStrategy?: (key: K) => number
  ) {
    this.keyHashStrategy = keyHashStrategy || HashStrategies.fastHash
  }

  set(key: K, value: V): Effect.Effect<void> {
    return Effect.gen(function* () {
      const now = Date.now()
      const entry = { value, accessCount: 1, lastAccess: now }

      // Always add to hot cache initially
      this.hotCache = HashMap.set(this.hotCache, key, entry)

      // Manage cache sizes
      if (HashMap.size(this.hotCache) > this.maxHotSize) {
        yield* this.evictFromHotCache()
      }

      if (HashMap.size(this.coldCache) > this.maxColdSize) {
        yield* this.evictFromColdCache()
      }
    }.bind(this))
  }

  get(key: K): Effect.Effect<Option.Option<V>> {
    return Effect.gen(function* () {
      const now = Date.now()

      // Check hot cache first
      const hotEntry = HashMap.get(this.hotCache, key)
      if (Option.isSome(hotEntry)) {
        const updated = {
          ...hotEntry.value,
          accessCount: hotEntry.value.accessCount + 1,
          lastAccess: now
        }
        this.hotCache = HashMap.set(this.hotCache, key, updated)
        return Option.some(updated.value)
      }

      // Check cold cache
      const coldEntry = HashMap.get(this.coldCache, key)
      if (Option.isSome(coldEntry)) {
        const updated = {
          ...coldEntry.value,
          accessCount: coldEntry.value.accessCount + 1,
          lastAccess: now
        }

        // Promote to hot cache if frequently accessed
        if (updated.accessCount > 5) {
          this.hotCache = HashMap.set(this.hotCache, key, updated)
          this.coldCache = HashMap.remove(this.coldCache, key)
        } else {
          this.coldCache = HashMap.set(this.coldCache, key, updated)
        }

        return Option.some(updated.value)
      }

      return Option.none()
    }.bind(this))
  }

  private evictFromHotCache(): Effect.Effect<void> {
    return Effect.gen(function* () {
      // Move least recently used items to cold cache
      const entries = Array.from(this.hotCache).sort(
        ([, a], [, b]) => a.lastAccess - b.lastAccess
      )

      const toEvict = Math.floor(this.maxHotSize * 0.2) // Evict 20%
      
      for (let i = 0; i < toEvict && i < entries.length; i++) {
        const [key, entry] = entries[i]
        this.coldCache = HashMap.set(this.coldCache, key, entry)
        this.hotCache = HashMap.remove(this.hotCache, key)
      }
    }.bind(this))
  }

  private evictFromColdCache(): Effect.Effect<void> {
    return Effect.gen(function* () {
      // Remove least recently used items entirely
      const entries = Array.from(this.coldCache).sort(
        ([, a], [, b]) => a.lastAccess - b.lastAccess
      )

      const toEvict = Math.floor(this.maxColdSize * 0.1) // Evict 10%
      
      for (let i = 0; i < toEvict && i < entries.length; i++) {
        const [key] = entries[i]
        this.coldCache = HashMap.remove(this.coldCache, key)
      }
    }.bind(this))
  }

  getStats(): Effect.Effect<{
    hotCacheSize: number
    coldCacheSize: number
    totalSize: number
    hitRates: { hot: number; cold: number }
  }> {
    return Effect.gen(function* () {
      const hotSize = HashMap.size(this.hotCache)
      const coldSize = HashMap.size(this.coldCache)
      
      // Calculate hit rates based on access patterns
      const hotEntries = Array.from(this.hotCache)
      const coldEntries = Array.from(this.coldCache)
      
      const hotHits = hotEntries.reduce((sum, [, entry]) => sum + entry.accessCount, 0)
      const coldHits = coldEntries.reduce((sum, [, entry]) => sum + entry.accessCount, 0)
      
      const totalHits = hotHits + coldHits
      
      return {
        hotCacheSize: hotSize,
        coldCacheSize: coldSize,
        totalSize: hotSize + coldSize,
        hitRates: {
          hot: totalHits > 0 ? hotHits / totalHits : 0,
          cold: totalHits > 0 ? coldHits / totalHits : 0
        }
      }
    }.bind(this))
  }
}

// Usage example with performance monitoring
const demonstrateOptimizedHashing = () =>
  Effect.gen(function* () {
    // Test different hash strategies
    const fastEntity = new OptimizedEntity(
      { id: 'fast-123', data: 'quick access data' },
      HashStrategies.fastHash
    )

    const secureEntity = new OptimizedEntity(
      { id: 'secure-456', data: 'critical data that needs collision resistance' },
      HashStrategies.secureHash
    )

    // Create performance-optimized cache
    const cache = new MultiTierCache<string, any>(100, 1000, HashStrategies.fastHash)

    // Populate cache with test data
    const testData = Array.from({ length: 500 }, (_, i) => ({
      key: `item-${i}`,
      value: { id: i, data: `test data ${i}`, metadata: { type: 'test' } }
    }))

    console.time('Cache Population')
    for (const { key, value } of testData) {
      yield* cache.set(key, value)
    }
    console.timeEnd('Cache Population')

    // Test access patterns
    console.time('Cache Access Test')
    let hits = 0
    let misses = 0

    // Simulate realistic access patterns (80/20 rule)
    const hotKeys = testData.slice(0, 100).map(item => item.key) // Top 20%
    const coldKeys = testData.slice(100).map(item => item.key)   // Bottom 80%

    // Access hot keys more frequently
    for (let i = 0; i < 1000; i++) {
      const isHotAccess = Math.random() < 0.8
      const keys = isHotAccess ? hotKeys : coldKeys
      const key = keys[Math.floor(Math.random() * keys.length)]
      
      const result = yield* cache.get(key)
      if (Option.isSome(result)) {
        hits++
      } else {
        misses++
      }
    }
    console.timeEnd('Cache Access Test')

    const stats = yield* cache.getStats()
    console.log('Cache Performance:')
    console.log(`- Total cache size: ${stats.totalSize}`)
    console.log(`- Hot cache: ${stats.hotCacheSize} items (${(stats.hitRates.hot * 100).toFixed(1)}% of hits)`)
    console.log(`- Cold cache: ${stats.coldCacheSize} items (${(stats.hitRates.cold * 100).toFixed(1)}% of hits)`)
    console.log(`- Hit rate: ${((hits / (hits + misses)) * 100).toFixed(1)}%`)

    // Demonstrate hash collision detection
    const hashCollisionTest = (items: string[]) => {
      const hashes = new Map<number, string[]>()
      let collisions = 0

      for (const item of items) {
        const hash = HashStrategies.fastHash(item)
        if (!hashes.has(hash)) {
          hashes.set(hash, [])
        }
        const existing = hashes.get(hash)!
        if (existing.length > 0) {
          collisions++
        }
        existing.push(item)
      }

      return { totalHashes: hashes.size, collisions, items: items.length }
    }

    const collisionStats = hashCollisionTest(testData.map(item => item.key))
    console.log('Hash Collision Analysis:')
    console.log(`- Items: ${collisionStats.items}`)
    console.log(`- Unique hashes: ${collisionStats.totalHashes}`)
    console.log(`- Collisions: ${collisionStats.collisions}`)
    console.log(`- Collision rate: ${((collisionStats.collisions / collisionStats.items) * 100).toFixed(2)}%`)
  })
```

## Advanced Features Deep Dive

### Feature 1: Hash Optimization and Caching

Hash provides built-in optimization and caching mechanisms to improve performance in hash-intensive applications.

#### Basic Hash Optimization

```typescript
import { Hash } from "effect"

// Hash.optimize applies bit manipulation for better distribution
const rawHash = 1234567890
const optimizedHash = Hash.optimize(rawHash)

console.log('Raw hash:', rawHash)
console.log('Optimized hash:', optimizedHash)

// The optimize function reduces clustering and improves hash distribution
const testHashes = [1000, 1001, 1002, 1003, 1004]
const rawHashes = testHashes.map(n => n)
const optimizedHashes = testHashes.map(n => Hash.optimize(n))

console.log('Raw hashes:', rawHashes)
console.log('Optimized hashes:', optimizedHashes)
```

#### Hash Caching for Objects

```typescript
import { Hash, Equal } from "effect"

class ExpensiveToHash implements Equal.Equal {
  constructor(
    readonly largeData: Record<string, any>,
    readonly computedFields: any[]
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    return (
      that instanceof ExpensiveToHash &&
      Equal.equals(this.largeData, that.largeData) &&
      Equal.equals(this.computedFields, that.computedFields)
    )
  }

  [Hash.symbol](): number {
    // Expensive hash computation
    const dataHash = Hash.structure(this.largeData)
    const fieldsHash = Hash.array(this.computedFields)
    const combinedHash = Hash.combine(fieldsHash)(dataHash)
    
    // Cache the result to avoid recomputation
    return Hash.cached(this, combinedHash)
  }
}

// Usage demonstrates caching benefits
const createLargeObject = () => new ExpensiveToHash(
  { 
    users: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}` })),
    metadata: { version: '1.0', created: new Date() }
  },
  Array.from({ length: 100 }, (_, i) => ({ computation: i * i }))
)

const obj = createLargeObject()

console.time('First hash computation')
const hash1 = Hash.hash(obj)
console.timeEnd('First hash computation')

console.time('Second hash computation (cached)')
const hash2 = Hash.hash(obj)
console.timeEnd('Second hash computation (cached)')

console.log('Hashes equal:', hash1 === hash2)
```

### Feature 2: Structural Hashing for Complex Objects

Deep structural hashing that considers object content rather than reference identity.

#### Object Structure Hashing

```typescript
import { Hash } from "effect"

// Hash based on object structure
const user1 = {
  profile: {
    name: 'Alice',
    preferences: {
      theme: 'dark',
      notifications: { email: true, push: false }
    }
  },
  settings: {
    privacy: 'private',
    features: ['beta', 'advanced']
  }
}

const user2 = {
  profile: {
    name: 'Alice',
    preferences: {
      theme: 'dark',
      notifications: { email: true, push: false }
    }
  },
  settings: {
    privacy: 'private',
    features: ['beta', 'advanced']
  }
}

// These objects have the same structure and content
const hash1 = Hash.structure(user1)
const hash2 = Hash.structure(user2)

console.log('Structural hash 1:', hash1)
console.log('Structural hash 2:', hash2)
console.log('Hashes equal:', hash1 === hash2) // May not be equal due to random hashing

// Use specific key-based hashing for deterministic results
const keyBasedHash1 = Hash.structureKeys(user1, ['profile', 'settings'])
const keyBasedHash2 = Hash.structureKeys(user2, ['profile', 'settings'])

console.log('Key-based hash 1:', keyBasedHash1)
console.log('Key-based hash 2:', keyBasedHash2)
```

#### Custom Structure Hashing

```typescript
import { Hash, pipe } from "effect"

// Custom hashing for domain-specific objects
const hashBusinessEntity = <T extends Record<string, any>>(
  entity: T,
  businessKeys: (keyof T)[]
): number => {
  // Hash only business-critical fields
  return Hash.structureKeys(entity, businessKeys)
}

interface Order {
  id: string
  customerId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  metadata: {
    createdAt: Date
    updatedAt: Date
    internalNotes: string
  }
}

const order: Order = {
  id: 'order-123',
  customerId: 'customer-456',
  items: [
    { productId: 'prod-1', quantity: 2, price: 29.99 },
    { productId: 'prod-2', quantity: 1, price: 49.99 }
  ],
  status: 'confirmed',
  metadata: {
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    internalNotes: 'Rush delivery requested'
  }
}

// Hash based on business logic - exclude metadata for business equality
const businessHash = hashBusinessEntity(order, ['id', 'customerId', 'items', 'status'])

// Hash for full entity including metadata
const fullHash = Hash.structure(order)

console.log('Business hash:', businessHash)
console.log('Full hash:', fullHash)

// Create a modified order with different metadata but same business data
const orderWithDifferentMetadata: Order = {
  ...order,
  metadata: {
    ...order.metadata,
    updatedAt: new Date(), // Different timestamp
    internalNotes: 'Standard delivery' // Different notes
  }
}

const modifiedBusinessHash = hashBusinessEntity(orderWithDifferentMetadata, ['id', 'customerId', 'items', 'status'])
const modifiedFullHash = Hash.structure(orderWithDifferentMetadata)

console.log('Modified business hash:', modifiedBusinessHash)
console.log('Modified full hash:', modifiedFullHash)
console.log('Business hashes equal:', businessHash === modifiedBusinessHash)
console.log('Full hashes equal:', fullHash === modifiedFullHash)
```

### Feature 3: Hash Combination Strategies

Advanced techniques for combining multiple hash values into composite hashes.

#### Multi-Field Hash Combination

```typescript
import { Hash, pipe } from "effect"

// Combine hashes from multiple sources
const createCompositeKey = (
  userId: string,
  resourceType: string,
  resourceId: string,
  permissions: string[],
  timestamp?: number
) => {
  let compositeHash = pipe(
    Hash.hash(userId),
    Hash.combine(Hash.hash(resourceType)),
    Hash.combine(Hash.hash(resourceId))
  )

  // Add permissions hash
  compositeHash = Hash.combine(Hash.array(permissions))(compositeHash)

  // Optionally include timestamp for time-sensitive keys
  if (timestamp) {
    compositeHash = Hash.combine(Hash.hash(timestamp))(compositeHash)
  }

  return compositeHash
}

// Usage for permission caching
const permissionKey1 = createCompositeKey(
  'user123',
  'document',
  'doc456',
  ['read', 'write']
)

const permissionKey2 = createCompositeKey(
  'user123',
  'document',
  'doc456',
  ['read', 'write', 'share'] // Different permissions
)

console.log('Permission key 1:', permissionKey1)
console.log('Permission key 2:', permissionKey2)
console.log('Keys different:', permissionKey1 !== permissionKey2)
```

#### Hierarchical Hash Combination

```typescript
import { Hash, pipe } from "effect"

// Hierarchical hashing for nested structures
const hashHierarchy = (path: string[]): number => {
  return path.reduce((acc, segment, index) => {
    // Weight segments by depth to distinguish between different hierarchies
    const segmentHash = Hash.hash(segment)
    const weightedHash = Hash.combine(Hash.hash(index))(segmentHash)
    return Hash.combine(weightedHash)(acc)
  }, Hash.hash('hierarchy-root'))
}

// Test hierarchical paths
const paths = [
  ['organization', 'team', 'project', 'task'],
  ['organization', 'team', 'project'],
  ['organization', 'team'],
  ['organization'],
  ['organization', 'team', 'project', 'subtask'], // Different end
  ['organization', 'department', 'project', 'task'] // Different middle
]

const hierarchyHashes = paths.map(path => ({
  path: path.join(' > '),
  hash: hashHierarchy(path)
}))

console.log('Hierarchy hashes:')
hierarchyHashes.forEach(({ path, hash }) => {
  console.log(`${path}: ${hash}`)
})

// Verify that similar paths have different hashes
const orgTeamProject = hashHierarchy(['organization', 'team', 'project'])
const orgTeamProjectTask = hashHierarchy(['organization', 'team', 'project', 'task'])

console.log('Path hierarchy maintains uniqueness:', orgTeamProject !== orgTeamProjectTask)
```

## Practical Patterns & Best Practices

### Pattern 1: Hash-Based Caching Strategy

```typescript
import { Hash, HashMap, Effect, Ref, Option } from "effect"

// Comprehensive caching with hash-based keys
class SmartCache<K, V> {
  private cache = Ref.unsafeOf(HashMap.empty<number, { key: K; value: V; ttl: number; created: number }>())
  private keyHashes = Ref.unsafeOf(HashMap.empty<K, number>())

  constructor(
    private defaultTTL: number = 3600000, // 1 hour
    private keyHasher: (key: K) => number = Hash.hash
  ) {}

  set(key: K, value: V, ttl?: number): Effect.Effect<void> {
    return Effect.gen(function* () {
      const hash = this.keyHasher(key)
      const effectiveTTL = ttl ?? this.defaultTTL
      const now = Date.now()

      const entry = {
        key,
        value,
        ttl: effectiveTTL,
        created: now
      }

      yield* Ref.update(this.cache, cache => HashMap.set(cache, hash, entry))
      yield* Ref.update(this.keyHashes, hashes => HashMap.set(hashes, key, hash))
    }.bind(this))
  }

  get(key: K): Effect.Effect<Option.Option<V>> {
    return Effect.gen(function* () {
      const hash = this.keyHasher(key)
      const cache = yield* Ref.get(this.cache)
      const entry = HashMap.get(cache, hash)

      if (Option.isNone(entry)) {
        return Option.none()
      }

      const now = Date.now()
      const cacheEntry = entry.value

      // Check TTL
      if (now - cacheEntry.created > cacheEntry.ttl) {
        // Expired - remove from cache
        yield* Ref.update(this.cache, cache => HashMap.remove(cache, hash))
        yield* Ref.update(this.keyHashes, hashes => HashMap.remove(hashes, cacheEntry.key))
        return Option.none()
      }

      return Option.some(cacheEntry.value)
    }.bind(this))
  }

  // Batch operations using hash-based efficiency
  setMany(entries: Array<[K, V, number?]>): Effect.Effect<void> {
    return Effect.gen(function* () {
      const now = Date.now()
      
      yield* Ref.update(this.cache, cache => {
        let updatedCache = cache
        
        for (const [key, value, ttl] of entries) {
          const hash = this.keyHasher(key)
          const entry = {
            key,
            value,
            ttl: ttl ?? this.defaultTTL,
            created: now
          }
          updatedCache = HashMap.set(updatedCache, hash, entry)
        }
        
        return updatedCache
      })

      yield* Ref.update(this.keyHashes, hashes => {
        let updatedHashes = hashes
        
        for (const [key] of entries) {
          const hash = this.keyHasher(key)
          updatedHashes = HashMap.set(updatedHashes, key, hash)
        }
        
        return updatedHashes
      })
    }.bind(this))
  }

  getMany(keys: K[]): Effect.Effect<Array<[K, Option.Option<V>]>> {
    return Effect.gen(function* () {
      const results: Array<[K, Option.Option<V>]> = []
      
      for (const key of keys) {
        const value = yield* this.get(key)
        results.push([key, value])
      }
      
      return results
    }.bind(this))
  }

  // Clean expired entries
  cleanup(): Effect.Effect<number> {
    return Effect.gen(function* () {
      const now = Date.now()
      let removedCount = 0

      yield* Ref.update(this.cache, cache => {
        let cleanedCache = cache
        
        for (const [hash, entry] of cache) {
          if (now - entry.created > entry.ttl) {
            cleanedCache = HashMap.remove(cleanedCache, hash)
            removedCount++
          }
        }
        
        return cleanedCache
      })

      // Update key hashes accordingly
      yield* Ref.update(this.keyHashes, hashes => {
        let cleanedHashes = hashes
        
        for (const [key, hash] of hashes) {
          const cache = Ref.unsafeGet(this.cache)
          if (!HashMap.has(cache, hash)) {
            cleanedHashes = HashMap.remove(cleanedHashes, key)
          }
        }
        
        return cleanedHashes
      })

      return removedCount
    }.bind(this))
  }

  getStats(): Effect.Effect<{
    size: number
    keyHashCollisions: number
    avgTTL: number
    oldestEntry: number
  }> {
    return Effect.gen(function* () {
      const cache = yield* Ref.get(this.cache)
      const keyHashes = yield* Ref.get(this.keyHashes)
      
      const entries = Array.from(cache)
      const now = Date.now()
      
      let totalTTL = 0
      let oldestEntry = now
      
      for (const [, entry] of entries) {
        totalTTL += entry.ttl
        oldestEntry = Math.min(oldestEntry, entry.created)
      }

      // Detect potential hash collisions
      const uniqueHashes = new Set(Array.from(keyHashes.values()))
      const keyHashCollisions = HashMap.size(keyHashes) - uniqueHashes.size

      return {
        size: HashMap.size(cache),
        keyHashCollisions,
        avgTTL: entries.length > 0 ? totalTTL / entries.length : 0,
        oldestEntry: now - oldestEntry
      }
    }.bind(this))
  }
}

// Usage with custom hash strategies
const cacheUsageExample = () =>
  Effect.gen(function* () {
    // Create cache with custom key hasher for complex objects
    const complexKeyHasher = (key: { userId: string; resourceId: string; action: string }) => {
      return pipe(
        Hash.hash(key.userId),
        Hash.combine(Hash.hash(key.resourceId)),
        Hash.combine(Hash.hash(key.action))
      )
    }

    const permissionCache = new SmartCache<
      { userId: string; resourceId: string; action: string },
      boolean
    >(300000, complexKeyHasher) // 5 minute TTL

    // Set permissions
    yield* permissionCache.setMany([
      [{ userId: 'user1', resourceId: 'doc1', action: 'read' }, true],
      [{ userId: 'user1', resourceId: 'doc1', action: 'write' }, false],
      [{ userId: 'user2', resourceId: 'doc1', action: 'read' }, true],
      [{ userId: 'user2', resourceId: 'doc2', action: 'admin' }, true]
    ])

    // Get permissions
    const keys = [
      { userId: 'user1', resourceId: 'doc1', action: 'read' },
      { userId: 'user1', resourceId: 'doc1', action: 'write' },
      { userId: 'user3', resourceId: 'doc1', action: 'read' } // Not cached
    ]

    const results = yield* permissionCache.getMany(keys)
    
    console.log('Permission cache results:')
    results.forEach(([key, permission]) => {
      const hasPermission = Option.isSome(permission) ? permission.value : 'not cached'
      console.log(`${key.userId} ${key.action} ${key.resourceId}: ${hasPermission}`)
    })

    const stats = yield* permissionCache.getStats()
    console.log('Cache stats:', stats)
  })
```

### Pattern 2: Hash-Based Deduplication

```typescript
import { Hash, HashSet, HashMap, Effect, Equal } from "effect"

// Advanced deduplication with configurable hash strategies
class Deduplicator<T> {
  private seen = HashSet.empty<T>()
  private hashCounts = HashMap.empty<number, number>()
  
  constructor(
    private customHasher?: (item: T) => number,
    private customEquality?: (a: T, b: T) => boolean
  ) {}

  // Add item and return whether it was unique
  add(item: T): Effect.Effect<{ wasUnique: boolean; hash: number }> {
    return Effect.gen(function* () {
      const hash = this.customHasher ? this.customHasher(item) : Hash.hash(item)
      
      // Track hash frequency for collision detection
      const currentCount = HashMap.get(this.hashCounts, hash).pipe(
        Option.getOrElse(() => 0)
      )
      this.hashCounts = HashMap.set(this.hashCounts, hash, currentCount + 1)

      // Check for duplicates
      if (HashSet.has(this.seen, item)) {
        return { wasUnique: false, hash }
      }

      // Handle potential hash collisions with custom equality
      if (this.customEquality && currentCount > 0) {
        for (const existing of this.seen) {
          const existingHash = this.customHasher ? this.customHasher(existing) : Hash.hash(existing)
          if (existingHash === hash && this.customEquality(item, existing)) {
            return { wasUnique: false, hash }
          }
        }
      }

      this.seen = HashSet.add(this.seen, item)
      return { wasUnique: true, hash }
    }.bind(this))
  }

  // Process batch of items
  processBatch(items: T[]): Effect.Effect<{
    unique: T[]
    duplicates: T[]
    hashCollisions: number
    stats: DeduplicationStats
  }> {
    return Effect.gen(function* () {
      const unique: T[] = []
      const duplicates: T[] = []
      let hashCollisions = 0

      for (const item of items) {
        const result = yield* this.add(item)
        
        if (result.wasUnique) {
          unique.push(item)
        } else {
          duplicates.push(item)
        }

        // Count hash collisions
        const hashCount = HashMap.get(this.hashCounts, result.hash).pipe(
          Option.getOrElse(() => 0)
        )
        if (hashCount > 1) {
          hashCollisions++
        }
      }

      const stats: DeduplicationStats = {
        totalProcessed: items.length,
        uniqueItems: unique.length,
        duplicateItems: duplicates.length,
        deduplicationRate: items.length > 0 ? duplicates.length / items.length : 0,
        hashCollisions,
        uniqueHashes: HashMap.size(this.hashCounts)
      }

      return { unique, duplicates, hashCollisions, stats }
    }.bind(this))
  }

  // Get current state statistics
  getStats(): Effect.Effect<DeduplicationStats> {
    return Effect.gen(function* () {
      const totalItems = HashSet.size(this.seen)
      const hashCollisionCount = HashMap.reduce(
        this.hashCounts,
        0,
        (acc, count) => acc + (count > 1 ? count - 1 : 0)
      )

      return {
        totalProcessed: totalItems + hashCollisionCount,
        uniqueItems: totalItems,
        duplicateItems: hashCollisionCount,
        deduplicationRate: totalItems > 0 ? hashCollisionCount / (totalItems + hashCollisionCount) : 0,
        hashCollisions: hashCollisionCount,
        uniqueHashes: HashMap.size(this.hashCounts)
      }
    }.bind(this))
  }

  // Reset deduplicator state
  reset(): Effect.Effect<void> {
    return Effect.gen(function* () {
      this.seen = HashSet.empty<T>()
      this.hashCounts = HashMap.empty<number, number>()
    }.bind(this))
  }
}

interface DeduplicationStats {
  totalProcessed: number
  uniqueItems: number
  duplicateItems: number
  deduplicationRate: number
  hashCollisions: number
  uniqueHashes: number
}

// Email deduplication with custom business logic
interface EmailMessage {
  id: string
  subject: string
  body: string
  sender: string
  recipients: string[]
  timestamp: Date
}

const emailDeduplicationExample = () =>
  Effect.gen(function* () {
    // Custom hasher that ignores timestamp and ID for business deduplication
    const emailBusinessHasher = (email: EmailMessage): number => {
      return pipe(
        Hash.hash(email.subject.toLowerCase().trim()),
        Hash.combine(Hash.hash(email.body.replace(/\s+/g, ' ').trim())),
        Hash.combine(Hash.hash(email.sender)),
        Hash.combine(Hash.array(email.recipients.sort()))
      )
    }

    // Custom equality that considers emails equal if content matches (ignoring metadata)
    const emailBusinessEquality = (a: EmailMessage, b: EmailMessage): boolean => {
      return (
        a.subject.toLowerCase().trim() === b.subject.toLowerCase().trim() &&
        a.body.replace(/\s+/g, ' ').trim() === b.body.replace(/\s+/g, ' ').trim() &&
        a.sender === b.sender &&
        JSON.stringify(a.recipients.sort()) === JSON.stringify(b.recipients.sort())
      )
    }

    const emailDeduplicator = new Deduplicator<EmailMessage>(
      emailBusinessHasher,
      emailBusinessEquality
    )

    // Sample emails with duplicates
    const emails: EmailMessage[] = [
      {
        id: '1',
        subject: 'Meeting Tomorrow',
        body: 'Let\'s meet tomorrow at 10 AM in the conference room.',
        sender: 'alice@company.com',
        recipients: ['bob@company.com', 'charlie@company.com'],
        timestamp: new Date('2024-01-01T09:00:00Z')
      },
      {
        id: '2',
        subject: 'Project Update',
        body: 'The project is on track and will be completed by Friday.',
        sender: 'bob@company.com',
        recipients: ['alice@company.com'],
        timestamp: new Date('2024-01-01T10:00:00Z')
      },
      {
        id: '3', // Duplicate of email 1 (different ID and timestamp)
        subject: '  Meeting Tomorrow  ', // Extra whitespace
        body: 'Let\'s meet tomorrow at 10 AM in the conference room.',
        sender: 'alice@company.com',
        recipients: ['charlie@company.com', 'bob@company.com'], // Different order
        timestamp: new Date('2024-01-01T09:30:00Z')
      },
      {
        id: '4',
        subject: 'Lunch Plans',
        body: 'Want to grab lunch at the new restaurant?',
        sender: 'charlie@company.com',
        recipients: ['alice@company.com', 'bob@company.com'],
        timestamp: new Date('2024-01-01T11:00:00Z')
      },
      {
        id: '5', // Another duplicate of email 1
        subject: 'MEETING TOMORROW', // Different case
        body: 'Let\'s    meet tomorrow at 10 AM in the conference room.', // Extra spaces
        sender: 'alice@company.com',
        recipients: ['bob@company.com', 'charlie@company.com'],
        timestamp: new Date('2024-01-01T08:45:00Z')
      }
    ]

    console.log(`Processing ${emails.length} emails for deduplication...`)
    
    const result = yield* emailDeduplicator.processBatch(emails)
    
    console.log('Deduplication Results:')
    console.log(`- Unique emails: ${result.unique.length}`)
    console.log(`- Duplicate emails: ${result.duplicates.length}`)
    console.log(`- Deduplication rate: ${(result.stats.deduplicationRate * 100).toFixed(1)}%`)
    console.log(`- Hash collisions: ${result.hashCollisions}`)
    
    console.log('\nUnique emails:')
    result.unique.forEach((email, index) => {
      console.log(`${index + 1}. "${email.subject}" from ${email.sender}`)
    })
    
    console.log('\nDuplicate emails:')
    result.duplicates.forEach((email, index) => {
      console.log(`${index + 1}. "${email.subject}" (ID: ${email.id}) - duplicate detected`)
    })

    const finalStats = yield* emailDeduplicator.getStats()
    console.log('\nFinal Statistics:', finalStats)
  })
```

### Pattern 3: Performance Monitoring and Hash Analysis

```typescript
import { Hash, HashMap, HashSet, Effect, Ref } from "effect"

// Comprehensive hash performance monitoring
class HashPerformanceMonitor {
  private metrics = Ref.unsafeOf({
    hashComputations: 0,
    hashCollisions: 0,
    hashCacheHits: 0,
    hashCacheMisses: 0,
    avgHashTime: 0,
    hashDistribution: HashMap.empty<number, number>()
  })

  // Monitor hash computation with timing
  monitorHash<T>(value: T, hasher: (v: T) => number = Hash.hash): Effect.Effect<number> {
    return Effect.gen(function* () {
      const startTime = performance.now()
      const hash = hasher(value)
      const endTime = performance.now()
      const duration = endTime - startTime

      yield* Ref.update(this.metrics, metrics => {
        const newComputations = metrics.hashComputations + 1
        const newAvgTime = (metrics.avgHashTime * metrics.hashComputations + duration) / newComputations
        
        // Track hash distribution for collision analysis
        const currentCount = HashMap.get(metrics.hashDistribution, hash).pipe(
          Option.getOrElse(() => 0)
        )
        const newCollisions = currentCount > 0 ? metrics.hashCollisions + 1 : metrics.hashCollisions
        
        return {
          ...metrics,
          hashComputations: newComputations,
          hashCollisions: newCollisions,
          avgHashTime: newAvgTime,
          hashDistribution: HashMap.set(metrics.hashDistribution, hash, currentCount + 1)
        }
      })

      return hash
    }.bind(this))
  }

  // Benchmark different hash strategies
  benchmarkHashStrategies<T>(
    items: T[],
    strategies: Record<string, (item: T) => number>
  ): Effect.Effect<Record<string, BenchmarkResult>> {
    return Effect.gen(function* () {
      const results: Record<string, BenchmarkResult> = {}

      for (const [name, strategy] of Object.entries(strategies)) {
        const startTime = performance.now()
        const hashes: number[] = []
        const hashCounts = new Map<number, number>()

        for (const item of items) {
          const hash = strategy(item)
          hashes.push(hash)
          
          const count = hashCounts.get(hash) || 0
          hashCounts.set(hash, count + 1)
        }

        const endTime = performance.now()
        
        // Calculate statistics
        const totalTime = endTime - startTime
        const uniqueHashes = hashCounts.size
        const collisions = items.length - uniqueHashes
        const collisionRate = items.length > 0 ? collisions / items.length : 0
        
        // Calculate hash distribution quality (lower is better)
        const expectedPerBucket = items.length / uniqueHashes
        const distributionVariance = Array.from(hashCounts.values())
          .reduce((acc, count) => acc + Math.pow(count - expectedPerBucket, 2), 0) / uniqueHashes

        results[name] = {
          totalTime,
          avgTimePerHash: totalTime / items.length,
          uniqueHashes,
          collisions,
          collisionRate,
          distributionVariance,
          throughput: items.length / (totalTime / 1000) // items per second
        }
      }

      return results
    }.bind(this))
  }

  // Analyze hash quality for given data
  analyzeHashQuality<T>(
    data: T[],
    hasher: (item: T) => number = Hash.hash
  ): Effect.Effect<HashQualityAnalysis> {
    return Effect.gen(function* () {
      if (data.length === 0) {
        return {
          totalItems: 0,
          uniqueHashes: 0,
          collisionRate: 0,
          distributionScore: 0,
          entropy: 0,
          recommendation: 'No data to analyze'
        }
      }

      const hashCounts = new Map<number, number>()
      const hashes: number[] = []

      // Compute all hashes
      for (const item of data) {
        const hash = yield* this.monitorHash(item, hasher)
        hashes.push(hash)
        
        const count = hashCounts.get(hash) || 0
        hashCounts.set(hash, count + 1)
      }

      // Calculate metrics
      const uniqueHashes = hashCounts.size
      const collisions = data.length - uniqueHashes
      const collisionRate = collisions / data.length

      // Calculate distribution score (0 = perfect, higher = worse)
      const expectedPerBucket = data.length / uniqueHashes
      const distributionScore = Array.from(hashCounts.values())
        .reduce((acc, count) => acc + Math.abs(count - expectedPerBucket), 0) / data.length

      // Calculate entropy (information content)
      const entropy = Array.from(hashCounts.values())
        .reduce((acc, count) => {
          const probability = count / data.length
          return acc - (probability * Math.log2(probability))
        }, 0)

      // Generate recommendation
      let recommendation = 'Hash quality is '
      if (collisionRate < 0.01) {
        recommendation += 'excellent (< 1% collisions)'
      } else if (collisionRate < 0.05) {
        recommendation += 'good (< 5% collisions)'
      } else if (collisionRate < 0.1) {
        recommendation += 'fair (< 10% collisions)'
      } else {
        recommendation += 'poor (≥ 10% collisions) - consider a different hash strategy'
      }

      return {
        totalItems: data.length,
        uniqueHashes,
        collisionRate,
        distributionScore,
        entropy,
        recommendation
      }
    }.bind(this))
  }

  // Get performance metrics
  getMetrics(): Effect.Effect<PerformanceMetrics> {
    return Effect.gen(function* () {
      const metrics = yield* Ref.get(this.metrics)
      
      return {
        totalHashComputations: metrics.hashComputations,
        totalCollisions: metrics.hashCollisions,
        cacheHitRate: metrics.hashComputations > 0 
          ? metrics.hashCacheHits / (metrics.hashCacheHits + metrics.hashCacheMisses)
          : 0,
        avgHashComputationTime: metrics.avgHashTime,
        uniqueHashValues: HashMap.size(metrics.hashDistribution)
      }
    }.bind(this))
  }

  // Reset monitoring state
  reset(): Effect.Effect<void> {
    return Ref.set(this.metrics, {
      hashComputations: 0,
      hashCollisions: 0,
      hashCacheHits: 0,
      hashCacheMisses: 0,
      avgHashTime: 0,
      hashDistribution: HashMap.empty<number, number>()
    })
  }
}

interface BenchmarkResult {
  totalTime: number
  avgTimePerHash: number
  uniqueHashes: number
  collisions: number
  collisionRate: number
  distributionVariance: number
  throughput: number
}

interface HashQualityAnalysis {
  totalItems: number
  uniqueHashes: number
  collisionRate: number
  distributionScore: number
  entropy: number
  recommendation: string
}

interface PerformanceMetrics {
  totalHashComputations: number
  totalCollisions: number
  cacheHitRate: number
  avgHashComputationTime: number
  uniqueHashValues: number
}

// Usage example with performance analysis
const performanceAnalysisExample = () =>
  Effect.gen(function* () {
    const monitor = new HashPerformanceMonitor()

    // Generate test data
    const testData = {
      strings: Array.from({ length: 10000 }, (_, i) => `test-string-${i}`),
      numbers: Array.from({ length: 10000 }, (_, i) => i),
      objects: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Object ${i}`,
        data: Array.from({ length: 10 }, (_, j) => `value-${j}`)
      }))
    }

    // Define different hash strategies to benchmark
    const stringStrategies = {
      'Hash.string': Hash.string,
      'Hash.hash': Hash.hash,
      'simple': (s: string) => {
        let hash = 0
        for (let i = 0; i < s.length; i++) {
          hash = ((hash << 5) - hash + s.charCodeAt(i)) & 0xffffffff
        }
        return hash
      }
    }

    const objectStrategies = {
      'Hash.structure': Hash.structure,
      'Hash.hash': Hash.hash,
      'id-only': (obj: any) => Hash.hash(obj.id)
    }

    console.log('Benchmarking string hash strategies...')
    const stringResults = yield* monitor.benchmarkHashStrategies(testData.strings, stringStrategies)
    
    console.log('String Hash Strategy Results:')
    Object.entries(stringResults).forEach(([name, result]) => {
      console.log(`${name}:`)
      console.log(`  - Throughput: ${result.throughput.toFixed(0)} hashes/sec`)
      console.log(`  - Collision rate: ${(result.collisionRate * 100).toFixed(2)}%`)
      console.log(`  - Avg time: ${result.avgTimePerHash.toFixed(4)}ms`)
      console.log(`  - Distribution variance: ${result.distributionVariance.toFixed(2)}`)
    })

    console.log('\nBenchmarking object hash strategies...')
    const objectResults = yield* monitor.benchmarkHashStrategies(testData.objects, objectStrategies)
    
    console.log('Object Hash Strategy Results:')
    Object.entries(objectResults).forEach(([name, result]) => {
      console.log(`${name}:`)
      console.log(`  - Throughput: ${result.throughput.toFixed(0)} hashes/sec`)
      console.log(`  - Collision rate: ${(result.collisionRate * 100).toFixed(2)}%`)
      console.log(`  - Distribution variance: ${result.distributionVariance.toFixed(2)}`)
    })

    // Analyze hash quality for different data types
    console.log('\nAnalyzing hash quality...')
    
    const stringAnalysis = yield* monitor.analyzeHashQuality(testData.strings.slice(0, 1000))
    console.log('String hash quality:', stringAnalysis.recommendation)
    console.log(`  - Entropy: ${stringAnalysis.entropy.toFixed(2)} bits`)
    
    const numberAnalysis = yield* monitor.analyzeHashQuality(testData.numbers.slice(0, 1000))
    console.log('Number hash quality:', numberAnalysis.recommendation)
    console.log(`  - Entropy: ${numberAnalysis.entropy.toFixed(2)} bits`)

    const objectAnalysis = yield* monitor.analyzeHashQuality(testData.objects.slice(0, 500))
    console.log('Object hash quality:', objectAnalysis.recommendation)
    console.log(`  - Entropy: ${objectAnalysis.entropy.toFixed(2)} bits`)

    // Get overall performance metrics
    const metrics = yield* monitor.getMetrics()
    console.log('\nOverall Performance Metrics:', metrics)
  })
```

## Integration Examples

### Integration with HashMap and HashSet

```typescript
import { Hash, HashMap, HashSet, Effect, Equal, pipe } from "effect"

// Custom entity with optimized hashing for use in collections
class OptimizedUser implements Equal.Equal {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly profile: {
      name: string
      preferences: Record<string, any>
    }
  ) {}

  [Equal.symbol](that: Equal.Equal): boolean {
    return (
      that instanceof OptimizedUser &&
      this.id === that.id &&
      this.email === that.email
    )
  }

  [Hash.symbol](): number {
    // Optimized hash focusing on unique identifiers
    return Hash.cached(this, pipe(
      Hash.hash(this.id),
      Hash.combine(Hash.hash(this.email))
    ))
  }
}

// UserManager using hash-optimized collections
class UserManager {
  private users = HashMap.empty<string, OptimizedUser>()
  private emailIndex = HashMap.empty<string, OptimizedUser>()
  private userGroups = HashMap.empty<string, HashSet.HashSet<OptimizedUser>>()

  addUser(user: OptimizedUser): Effect.Effect<void> {
    return Effect.gen(function* () {
      // Check for existing email
      const existingByEmail = HashMap.get(this.emailIndex, user.email)
      if (Option.isSome(existingByEmail)) {
        yield* Effect.fail(new Error(`User with email ${user.email} already exists`))
      }

      // Add to primary collection
      this.users = HashMap.set(this.users, user.id, user)
      
      // Add to email index  
      this.emailIndex = HashMap.set(this.emailIndex, user.email, user)
      
      console.log(`Added user: ${user.profile.name}`)
    }.bind(this))
  }

  addUserToGroup(userId: string, groupName: string): Effect.Effect<void> {
    return Effect.gen(function* () {
      const user = HashMap.get(this.users, userId)
      if (Option.isNone(user)) {
        yield* Effect.fail(new Error(`User ${userId} not found`))
      }

      const currentGroup = HashMap.get(this.userGroups, groupName).pipe(
        Option.getOrElse(() => HashSet.empty<OptimizedUser>())
      )
      
      const updatedGroup = HashSet.add(currentGroup, user.value)
      this.userGroups = HashMap.set(this.userGroups, groupName, updatedGroup)
      
      console.log(`Added ${user.value.profile.name} to group ${groupName}`)
    }.bind(this))
  }

  getUsersByGroup(groupName: string): Effect.Effect<OptimizedUser[]> {
    return Effect.gen(function* () {
      const group = HashMap.get(this.userGroups, groupName).pipe(
        Option.getOrElse(() => HashSet.empty<OptimizedUser>())
      )
      
      return Array.from(group)
    }.bind(this))
  }

  // Efficient set operations using HashSet
  getCommonUsers(group1: string, group2: string): Effect.Effect<OptimizedUser[]> {
    return Effect.gen(function* () {
      const set1 = HashMap.get(this.userGroups, group1).pipe(
        Option.getOrElse(() => HashSet.empty<OptimizedUser>())
      )
      const set2 = HashMap.get(this.userGroups, group2).pipe(
        Option.getOrElse(() => HashSet.empty<OptimizedUser>())
      )
      
      const intersection = HashSet.intersection(set1, set2)
      return Array.from(intersection)
    }.bind(this))
  }
}

const userManagerExample = () =>
  Effect.gen(function* () {
    const manager = new UserManager()
    
    // Create users
    const users = [
      new OptimizedUser('u1', 'alice@example.com', { name: 'Alice', preferences: { theme: 'dark' } }),
      new OptimizedUser('u2', 'bob@example.com', { name: 'Bob', preferences: { theme: 'light' } }),
      new OptimizedUser('u3', 'charlie@example.com', { name: 'Charlie', preferences: { theme: 'dark' } })
    ]

    // Add users
    for (const user of users) {
      yield* manager.addUser(user)
    }

    // Create groups
    yield* manager.addUserToGroup('u1', 'developers')
    yield* manager.addUserToGroup('u2', 'developers')
    yield* manager.addUserToGroup('u1', 'admins')
    yield* manager.addUserToGroup('u3', 'admins')

    // Query groups
    const developers = yield* manager.getUsersByGroup('developers')
    const admins = yield* manager.getUsersByGroup('admins')
    const commonUsers = yield* manager.getCommonUsers('developers', 'admins')

    console.log(`Developers: ${developers.map(u => u.profile.name).join(', ')}`)
    console.log(`Admins: ${admins.map(u => u.profile.name).join(', ')}`)
    console.log(`Both developers and admins: ${commonUsers.map(u => u.profile.name).join(', ')}`)
  })
```

### Integration with Effect Streams

```typescript
import { Hash, HashMap, HashSet, Effect, Stream, Chunk } from "effect"

// Stream processing with hash-based deduplication and grouping
const streamHashIntegrationExample = () =>
  Effect.gen(function* () {
    // Create a stream of events
    const events = Stream.fromIterable([
      { type: 'user_login', userId: 'user1', timestamp: Date.now() },
      { type: 'page_view', userId: 'user1', page: '/home', timestamp: Date.now() + 1000 },
      { type: 'user_login', userId: 'user2', timestamp: Date.now() + 2000 },
      { type: 'page_view', userId: 'user1', page: '/home', timestamp: Date.now() + 3000 }, // Duplicate
      { type: 'user_logout', userId: 'user1', timestamp: Date.now() + 4000 },
      { type: 'page_view', userId: 'user2', page: '/profile', timestamp: Date.now() + 5000 }
    ])

    // Deduplicate events based on content hash
    const deduplicatedEvents = events.pipe(
      Stream.mapAccum(HashSet.empty<number>(), (seen, event) => {
        // Create content hash excluding timestamp
        const contentHash = pipe(
          Hash.hash(event.type),
          Hash.combine(Hash.hash(event.userId)),
          Hash.combine(Hash.hash('page' in event ? event.page : ''))
        )

        if (HashSet.has(seen, contentHash)) {
          return [seen, Option.none()] // Skip duplicate
        } else {
          return [HashSet.add(seen, contentHash), Option.some(event)]
        }
      }),
      Stream.mapEffect(Option.match({
        onNone: () => Effect.succeed(null),
        onSome: Effect.succeed
      })),
      Stream.filter(event => event !== null)
    )

    // Group events by user using HashMap
    const groupedByUser = deduplicatedEvents.pipe(
      Stream.mapAccum(HashMap.empty<string, any[]>(), (groups, event) => {
        const userId = event!.userId
        const userEvents = HashMap.get(groups, userId).pipe(
          Option.getOrElse(() => [])
        )
        const updatedGroups = HashMap.set(groups, userId, [...userEvents, event])
        return [updatedGroups, updatedGroups]
      }),
      Stream.takeRight(1) // Get final state
    )

    // Process the stream
    const result = yield* Stream.runCollect(groupedByUser)
    const finalGroups = Chunk.unsafeGet(result, 0)

    console.log('Grouped events by user:')
    for (const [userId, userEvents] of finalGroups) {
      console.log(`${userId}: ${userEvents.length} events`)
      userEvents.forEach((event: any) => {
        console.log(`  - ${event.type} ${event.page ? `(${event.page})` : ''}`)
      })
    }
  })
```

### Integration with Testing Frameworks

```typescript
import { Hash, HashMap, HashSet, Effect, Equal } from "effect"

// Test utilities for hash-based operations
const HashTestUtils = {
  // Create test data with known hash properties
  createTestEntities: <T extends { id: string }>(
    count: number,
    factory: (id: string) => T
  ): T[] => {
    return Array.from({ length: count }, (_, i) => factory(`test-${i}`))
  },

  // Verify hash consistency
  verifyHashConsistency: <T>(entity: T, iterations: number = 100): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      const firstHash = Hash.hash(entity)
      
      for (let i = 0; i < iterations; i++) {
        const currentHash = Hash.hash(entity)
        if (currentHash !== firstHash) {
          return false
        }
      }
      
      return true
    }),

  // Test hash distribution quality
  testHashDistribution: <T>(
    items: T[],
    hasher: (item: T) => number = Hash.hash
  ): Effect.Effect<{
    uniqueHashes: number
    collisionRate: number
    distributionScore: number
    passed: boolean
  }> =>
    Effect.gen(function* () {
      const hashCounts = new Map<number, number>()
      
      for (const item of items) {
        const hash = hasher(item)
        hashCounts.set(hash, (hashCounts.get(hash) || 0) + 1)
      }

      const uniqueHashes = hashCounts.size
      const collisions = items.length - uniqueHashes
      const collisionRate = items.length > 0 ? collisions / items.length : 0
      
      // Simple distribution score - lower is better
      const expectedPerBucket = items.length / uniqueHashes
      const distributionScore = Array.from(hashCounts.values())
        .reduce((acc, count) => acc + Math.abs(count - expectedPerBucket), 0) / items.length

      // Pass if collision rate is reasonable and distribution is decent
      const passed = collisionRate < 0.1 && distributionScore < 2

      return {
        uniqueHashes,
        collisionRate,
        distributionScore,
        passed
      }
    }),

  // Benchmark hash operations
  benchmarkHashOperations: <T>(
    items: T[],
    operations: Record<string, (item: T) => any>
  ): Effect.Effect<Record<string, { avgTime: number; opsPerSecond: number }>> =>
    Effect.gen(function* () {
      const results: Record<string, { avgTime: number; opsPerSecond: number }> = {}

      for (const [name, operation] of Object.entries(operations)) {
        const startTime = performance.now()
        
        for (const item of items) {
          operation(item)
        }
        
        const endTime = performance.now()
        const totalTime = endTime - startTime
        const avgTime = totalTime / items.length
        const opsPerSecond = 1000 / avgTime

        results[name] = { avgTime, opsPerSecond }
      }

      return results
    })
}

// Example test suite
const hashTestSuite = () =>
  Effect.gen(function* () {
    console.log('Running Hash Test Suite...\n')

    // Test 1: Hash Consistency
    console.log('Test 1: Hash Consistency')
    const testEntity = { id: 'test', data: 'some data', nested: { value: 42 } }
    const isConsistent = yield* HashTestUtils.verifyHashConsistency(testEntity, 1000)
    console.log(`Hash consistency: ${isConsistent ? 'PASS' : 'FAIL'}`)

    // Test 2: Hash Distribution
    console.log('\nTest 2: Hash Distribution')
    const testItems = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.random() * 1000,
      category: ['A', 'B', 'C', 'D'][i % 4]
    }))
    
    const distributionResult = yield* HashTestUtils.testHashDistribution(testItems)
    console.log(`Distribution test: ${distributionResult.passed ? 'PASS' : 'FAIL'}`)
    console.log(`  - Unique hashes: ${distributionResult.uniqueHashes}/${testItems.length}`)
    console.log(`  - Collision rate: ${(distributionResult.collisionRate * 100).toFixed(2)}%`)
    console.log(`  - Distribution score: ${distributionResult.distributionScore.toFixed(2)}`)

    // Test 3: Performance Benchmark
    console.log('\nTest 3: Performance Benchmark')
    const benchmarkItems = Array.from({ length: 10000 }, (_, i) => `benchmark-item-${i}`)
    
    const benchmarkResults = yield* HashTestUtils.benchmarkHashOperations(benchmarkItems, {
      'Hash.hash': Hash.hash,
      'Hash.string': Hash.string,
      'Native hashCode': (s: string) => {
        let hash = 0
        for (let i = 0; i < s.length; i++) {
          hash = ((hash << 5) - hash + s.charCodeAt(i)) & 0xffffffff
        }
        return hash
      }
    })

    console.log('Performance results:')
    Object.entries(benchmarkResults).forEach(([name, result]) => {
      console.log(`  - ${name}: ${result.avgTime.toFixed(4)}ms avg, ${result.opsPerSecond.toFixed(0)} ops/sec`)
    })

    // Test 4: Collection Integration
    console.log('\nTest 4: Collection Integration')
    const users = Array.from({ length: 100 }, (_, i) => ({
      id: `user-${i}`,
      email: `user${i}@example.com`,
      name: `User ${i}`
    }))

    // Test HashMap operations
    console.time('HashMap insertions')
    let userMap = HashMap.empty<string, any>()
    for (const user of users) {
      userMap = HashMap.set(userMap, user.id, user)
    }
    console.timeEnd('HashMap insertions')

    // Test HashSet operations
    console.time('HashSet insertions')
    let userSet = HashSet.empty<any>()
    for (const user of users) {
      userSet = HashSet.add(userSet, user)
    }
    console.timeEnd('HashSet insertions')

    console.log(`HashMap size: ${HashMap.size(userMap)}`)
    console.log(`HashSet size: ${HashSet.size(userSet)}`)

    console.log('\nAll tests completed!')
  })
```

## Conclusion

Hash provides efficient hashing capabilities that enable high-performance data structures and algorithms in Effect programs. It solves critical problems around object equality, deduplication, and collection performance.

Key benefits:
- **Performance Optimization**: O(1) average lookup times in hash-based collections instead of O(n) linear searches
- **Memory Efficiency**: Structural sharing and deduplication reduce memory usage significantly  
- **Type Safety**: Integration with Effect's type system ensures compile-time correctness
- **Flexibility**: Custom hash strategies for domain-specific optimization requirements

Hash is essential when building scalable applications that need efficient data lookup, deduplication, caching, or any scenario where fast equality checking is critical for performance.