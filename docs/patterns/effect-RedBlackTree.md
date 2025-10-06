# RedBlackTree: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem RedBlackTree Solves

Traditional JavaScript data structures fail to provide efficient sorted collections with guaranteed performance characteristics. When you need to maintain data in sorted order while supporting fast insertions, lookups, and range queries, you often resort to inefficient approaches:

```typescript
// Traditional approach - Array with manual sorting
class SortedProductIndex {
  private products: Array<{ id: string, price: number, category: string }> = []
  
  insert(product: { id: string, price: number, category: string }): void {
    // Remove existing if present - O(n)
    this.products = this.products.filter(p => p.id !== product.id)
    
    // Find insertion point - O(n)
    let insertIndex = 0
    for (let i = 0; i < this.products.length; i++) {
      if (product.price < this.products[i].price) {
        insertIndex = i
        break
      }
      insertIndex = i + 1
    }
    
    // Insert at position - O(n) due to array shift
    this.products.splice(insertIndex, 0, product)
  }
  
  findInPriceRange(min: number, max: number): Array<{ id: string, price: number, category: string }> {
    // Linear scan - O(n) even though data is sorted
    return this.products.filter(p => p.price >= min && p.price <= max)
  }
  
  remove(id: string): void {
    // Linear search and removal - O(n)
    this.products = this.products.filter(p => p.id !== id)
  }
}

// Using Map with periodic re-sorting
class LeaderboardManager {
  private scores = new Map<string, number>()
  private sortedCache: Array<[string, number]> | null = null
  
  updateScore(player: string, score: number): void {
    this.scores.set(player, score)
    this.sortedCache = null // Invalidate cache
  }
  
  getTopPlayers(count: number): Array<[string, number]> {
    if (!this.sortedCache) {
      // Re-sort entire dataset - O(n log n)
      this.sortedCache = Array.from(this.scores.entries())
        .sort(([, a], [, b]) => b - a)
    }
    return this.sortedCache.slice(0, count)
  }
  
  getRankedPlayer(rank: number): [string, number] | undefined {
    const sorted = this.getTopPlayers(this.scores.size)
    return sorted[rank - 1]
  }
}

// Binary search tree implementation without balancing
class UnbalancedBST<K, V> {
  private root: BSTNode<K, V> | null = null
  
  insert(key: K, value: V): void {
    // Can degrade to O(n) with sorted input
    this.root = this.insertNode(this.root, key, value)
  }
  
  private insertNode(node: BSTNode<K, V> | null, key: K, value: V): BSTNode<K, V> {
    if (!node) return new BSTNode(key, value)
    
    if (key < node.key) {
      node.left = this.insertNode(node.left, key, value)
    } else {
      node.right = this.insertNode(node.right, key, value)
    }
    
    return node // No balancing - tree can become very unbalanced
  }
}
```

This approach leads to:
- **Poor performance** - O(n) insertions, O(n log n) sorting operations, O(n) range queries
- **Memory waste** - Duplicate sorted caches, inefficient array operations
- **Inconsistent performance** - Unbalanced trees degrade to linear performance
- **Complex maintenance** - Manual balancing, cache invalidation, edge case handling
- **No performance guarantees** - Operations can unpredictably become slow

### The RedBlackTree Solution

RedBlackTree provides a self-balancing binary search tree with guaranteed O(log n) performance for all operations, maintaining sorted order automatically while supporting efficient range queries:

```typescript
import { RedBlackTree, Order, pipe } from "effect"

// Type-safe sorted collection with guaranteed O(log n) performance
const productIndex = RedBlackTree.empty<number, { id: string, category: string }>(Order.number)

const withProducts = productIndex.pipe(
  RedBlackTree.insert(29.99, { id: "mouse", category: "electronics" }),
  RedBlackTree.insert(999.99, { id: "laptop", category: "electronics" }),
  RedBlackTree.insert(79.99, { id: "keyboard", category: "electronics" }),
  RedBlackTree.insert(15.99, { id: "mousepad", category: "accessories" })
)

// Efficient range queries - O(log n + k) where k is result size
const budgetProducts = pipe(
  RedBlackTree.greaterThanEqual(withProducts, 20.00),
  (iter) => Array.from(iter),
  (arr) => arr.filter(([price]) => price <= 100.00)
)

// Self-balancing leaderboard with guaranteed performance
interface Player {
  readonly name: string
  readonly level: number
}

const scoreOrder = Order.reverse(Order.number) // Descending scores
const leaderboard = RedBlackTree.empty<number, Player>(scoreOrder)

const withScores = leaderboard.pipe(
  RedBlackTree.insert(9500, { name: "Alice", level: 45 }),
  RedBlackTree.insert(8750, { name: "Bob", level: 42 }),
  RedBlackTree.insert(9200, { name: "Charlie", level: 44 }),
  RedBlackTree.insert(9800, { name: "Diana", level: 46 })
)

// Get top 3 players - O(log n + 3)
const topPlayers = pipe(
  withScores,
  RedBlackTree.at(0),
  (iter) => Array.from(iter).slice(0, 3)
)

// Complex key ordering with automatic balancing
interface TimeSeriesEntry {
  timestamp: Date
  sensor: string
  value: number
}

const timeOrder = Order.mapInput(
  Order.Date,
  (entry: TimeSeriesEntry) => entry.timestamp
)

const timeSeries = RedBlackTree.empty<TimeSeriesEntry, number>(timeOrder)

const withMeasurements = timeSeries.pipe(
  RedBlackTree.insert(
    { timestamp: new Date('2024-01-15T10:30:00'), sensor: 'temp-01', value: 23.5 },
    23.5
  ),
  RedBlackTree.insert(
    { timestamp: new Date('2024-01-15T09:15:00'), sensor: 'temp-01', value: 22.8 },
    22.8
  ),
  RedBlackTree.insert(
    { timestamp: new Date('2024-01-15T11:45:00'), sensor: 'temp-01', value: 24.2 },
    24.2
  )
)

// Automatic chronological ordering with efficient range queries
const morningReadings = pipe(
  RedBlackTree.lessThan(withMeasurements, {
    timestamp: new Date('2024-01-15T12:00:00'),
    sensor: '',
    value: 0
  }),
  (iter) => Array.from(iter)
)
```

### Key Concepts

**Self-Balancing**: RedBlackTree automatically maintains balanced height, ensuring all operations remain O(log n) regardless of insertion order or data patterns.

**Red-Black Properties**: The tree maintains specific coloring rules that guarantee the longest path from root to leaf is no more than twice the shortest path, ensuring balanced performance.

**Persistent Structure**: All operations return new tree instances while sharing structure with the original, providing immutability without performance penalties.

**Type-Safe Ordering**: Custom Order instances define key comparison with full type safety, supporting complex sorting strategies.

## Basic Usage Patterns

### Pattern 1: Creating and Initializing RedBlackTrees

```typescript
import { RedBlackTree, Order, pipe } from "effect"

// Empty tree with number keys
const emptyNumbers = RedBlackTree.empty<number, string>(Order.number)

// From iterable with custom ordering
interface Product {
  readonly name: string
  readonly price: number
  readonly rating: number
}

const priceOrder = Order.mapInput(
  Order.number,
  (product: Product) => product.price
)

const productCatalog = RedBlackTree.fromIterable(
  [
    [{ name: "Laptop", price: 999.99, rating: 4.5 }, "High-end computing"],
    [{ name: "Mouse", price: 29.99, rating: 4.2 }, "Precision pointing device"],
    [{ name: "Monitor", price: 299.99, rating: 4.7 }, "4K display"]
  ],
  priceOrder
)

// Using make for direct construction
const scoreBoard = RedBlackTree.make(Order.reverse(Order.number))(
  [9500, "Alice"],
  [8750, "Bob"],
  [9200, "Charlie"]
)

// Complex multi-field ordering
interface Event {
  readonly priority: number
  readonly timestamp: Date
  readonly category: string
}

const eventOrder = Order.combine(
  Order.mapInput(Order.reverse(Order.number), (e: Event) => e.priority),
  Order.mapInput(Order.Date, (e: Event) => e.timestamp)
)

const eventQueue = RedBlackTree.empty<Event, string>(eventOrder)
```

### Pattern 2: Basic Operations

```typescript
import { RedBlackTree, Order, Option, pipe } from "effect"

const numbers = RedBlackTree.empty<number, string>(Order.number)

// Insertion maintains sorted order automatically
const withData = numbers.pipe(
  RedBlackTree.insert(5, "five"),
  RedBlackTree.insert(2, "two"),
  RedBlackTree.insert(8, "eight"),
  RedBlackTree.insert(1, "one"),
  RedBlackTree.insert(7, "seven")
)

// Tree automatically maintains sorted order: 1, 2, 5, 7, 8

// Lookups are O(log n)
const findFive = RedBlackTree.findFirst(withData, 5) // Option<string>
const hasSeven = RedBlackTree.has(withData, 7) // boolean

// Get first and last elements
const firstEntry = RedBlackTree.first(withData) // Option<[number, string]>
const lastEntry = RedBlackTree.last(withData) // Option<[number, string]>

// Size and iteration
const treeSize = RedBlackTree.size(withData) // number
const allKeys = Array.from(RedBlackTree.keys(withData)) // [1, 2, 5, 7, 8]
const allValues = Array.from(RedBlackTree.values(withData)) // ["one", "two", "five", "seven", "eight"]
const allEntries = Array.from(withData) // [[1, "one"], [2, "two"], ...]

// Removal maintains balance
const withoutFive = RedBlackTree.removeFirst(withData, 5)
```

### Pattern 3: Range Queries and Traversal

```typescript
import { RedBlackTree, Order, pipe } from "effect"

const numbers = RedBlackTree.make(Order.number)(
  [1, "one"], [3, "three"], [5, "five"], [7, "seven"], [9, "nine"],
  [2, "two"], [4, "four"], [6, "six"], [8, "eight"], [10, "ten"]
)

// Range queries - all O(log n + k) where k is result size
const greaterThanFive = Array.from(RedBlackTree.greaterThan(numbers, 5))
// [[6, "six"], [7, "seven"], [8, "eight"], [9, "nine"], [10, "ten"]]

const lessThanOrEqualSix = Array.from(RedBlackTree.lessThanEqual(numbers, 6))
// [[1, "one"], [2, "two"], [3, "three"], [4, "four"], [5, "five"], [6, "six"]]

const betweenThreeAndSeven = pipe(
  RedBlackTree.greaterThanEqual(numbers, 3),
  (iter) => Array.from(iter),
  (arr) => arr.filter(([key]) => key <= 7)
)
// [[3, "three"], [4, "four"], [5, "five"], [6, "six"], [7, "seven"]]

// Reverse iteration
const descendingOrder = Array.from(RedBlackTree.reversed(numbers))
// [[10, "ten"], [9, "nine"], [8, "eight"], ...]

// Indexed access - O(log n)
const thirdElement = RedBlackTree.getAt(numbers, 2) // Option<[number, string]>
const fromIndex = Array.from(RedBlackTree.at(numbers, 3)) // Starting from 4th element

// Custom traversal patterns
RedBlackTree.forEach(numbers, (key, value) => {
  console.log(`${key}: ${value}`)
})

RedBlackTree.forEachBetween(numbers, {
  min: 3,
  max: 7,
  body: (key, value) => console.log(`Range item: ${key} -> ${value}`)
})

// Reduction over tree elements
const sumOfKeys = RedBlackTree.reduce(numbers, 0, (acc, value, key) => acc + key)
```

## Real-World Examples

### Example 1: High-Performance Order Book for Trading

A real-time trading system needs to maintain buy and sell orders sorted by price with frequent updates and range queries.

```typescript
import { RedBlackTree, Order, Option, Effect, pipe } from "effect"

interface Order {
  readonly id: string
  readonly userId: string
  readonly quantity: number
  readonly timestamp: Date
}

interface OrderLevel {
  readonly price: number
  readonly orders: Array<Order>
  readonly totalQuantity: number
}

class OrderBook {
  private constructor(
    private readonly buyOrders: RedBlackTree.RedBlackTree<number, OrderLevel>,
    private readonly sellOrders: RedBlackTree.RedBlackTree<number, OrderLevel>
  ) {}

  static empty(): OrderBook {
    return new OrderBook(
      RedBlackTree.empty<number, OrderLevel>(Order.reverse(Order.number)), // Highest buy prices first
      RedBlackTree.empty<number, OrderLevel>(Order.number) // Lowest sell prices first
    )
  }

  addBuyOrder(price: number, order: Order): OrderBook {
    return Effect.gen(function* () {
      const existingLevel = RedBlackTree.findFirst(this.buyOrders, price)
      const updatedLevel = Option.match(existingLevel, {
        onNone: () => ({
          price,
          orders: [order],
          totalQuantity: order.quantity
        } as OrderLevel),
        onSome: (level) => ({
          price,
          orders: [...level.orders, order],
          totalQuantity: level.totalQuantity + order.quantity
        } as OrderLevel)
      })
      
      const newBuyOrders = RedBlackTree.insert(this.buyOrders, price, updatedLevel)
      return new OrderBook(newBuyOrders, this.sellOrders)
    }).pipe(Effect.runSync).bind(this)()
  }

  addSellOrder(price: number, order: Order): OrderBook {
    return Effect.gen(function* () {
      const existingLevel = RedBlackTree.findFirst(this.sellOrders, price)
      const updatedLevel = Option.match(existingLevel, {
        onNone: () => ({
          price,
          orders: [order],
          totalQuantity: order.quantity
        } as OrderLevel),
        onSome: (level) => ({
          price,
          orders: [...level.orders, order],
          totalQuantity: level.totalQuantity + order.quantity
        } as OrderLevel)
      })
      
      const newSellOrders = RedBlackTree.insert(this.sellOrders, price, updatedLevel)
      return new OrderBook(this.buyOrders, newSellOrders)
    }).pipe(Effect.runSync).bind(this)()
  }

  getBestBid(): Option.Option<OrderLevel> {
    return RedBlackTree.first(this.buyOrders).pipe(
      Option.map(([, level]) => level)
    )
  }

  getBestAsk(): Option.Option<OrderLevel> {
    return RedBlackTree.first(this.sellOrders).pipe(
      Option.map(([, level]) => level)
    )
  }

  getBidLevels(maxLevels: number): Array<OrderLevel> {
    return pipe(
      this.buyOrders,
      RedBlackTree.at(0),
      (iter) => Array.from(iter),
      (entries) => entries.slice(0, maxLevels),
      (entries) => entries.map(([, level]) => level)
    )
  }

  getSellLevelsInRange(minPrice: number, maxPrice: number): Array<OrderLevel> {
    return pipe(
      RedBlackTree.greaterThanEqual(this.sellOrders, minPrice),
      (iter) => Array.from(iter),
      (entries) => entries.filter(([price]) => price <= maxPrice),
      (entries) => entries.map(([, level]) => level)
    )
  }

  getMarketDepth(): { bidDepth: number, askDepth: number, spread: number } {
    return Effect.gen(function* () {
      const bestBid = yield* Effect.fromOption(this.getBestBid())
      const bestAsk = yield* Effect.fromOption(this.getBestAsk())
      
      return {
        bidDepth: bestBid.totalQuantity,
        askDepth: bestAsk.totalQuantity,
        spread: bestAsk.price - bestBid.price
      }
    }).pipe(
      Effect.catchAll(() => Effect.succeed({
        bidDepth: 0,
        askDepth: 0,
        spread: 0
      })),
      Effect.runSync
    )
  }
}

// Usage example
const makeOrderBookService = Effect.gen(function* () {
  let orderBook = OrderBook.empty()
  
  const addOrder = (side: 'buy' | 'sell', price: number, order: Order) => 
    Effect.sync(() => {
      orderBook = side === 'buy' 
        ? orderBook.addBuyOrder(price, order)
        : orderBook.addSellOrder(price, order)
    })
  
  const getSnapshot = () => Effect.sync(() => ({
    bestBid: orderBook.getBestBid(),
    bestAsk: orderBook.getBestAsk(),
    topBids: orderBook.getBidLevels(5),
    marketDepth: orderBook.getMarketDepth()
  }))
  
  return { addOrder, getSnapshot } as const
})
```

### Example 2: Time-Series Database with Efficient Range Queries

A monitoring system needs to store and query time-series data with efficient range operations for dashboards and alerts.

```typescript
import { RedBlackTree, Order, Option, Effect, Chunk, pipe } from "effect"

interface Measurement {
  readonly timestamp: Date
  readonly value: number
  readonly tags: Record<string, string>
}

interface TimeSeriesPoint {
  readonly time: Date
  readonly metric: string
  readonly value: number
}

const timeOrder = Order.mapInput(Order.Date, (point: TimeSeriesPoint) => point.time)

class TimeSeriesDB {
  private constructor(
    private readonly series: Map<string, RedBlackTree.RedBlackTree<TimeSeriesPoint, number>>
  ) {}

  static empty(): TimeSeriesDB {
    return new TimeSeriesDB(new Map())
  }

  writePoint(seriesName: string, point: TimeSeriesPoint): Effect.Effect<TimeSeriesDB, never, never> {
    return Effect.gen(function* () {
      const existingTree = this.series.get(seriesName) ?? 
        RedBlackTree.empty<TimeSeriesPoint, number>(timeOrder)
      
      const updatedTree = RedBlackTree.insert(existingTree, point, point.value)
      const newSeries = new Map(this.series)
      newSeries.set(seriesName, updatedTree)
      
      return new TimeSeriesDB(newSeries)
    }).bind(this)
  }

  writePoints(seriesName: string, points: Array<TimeSeriesPoint>): Effect.Effect<TimeSeriesDB, never, never> {
    return Effect.gen(function* () {
      let result = this as TimeSeriesDB
      for (const point of points) {
        result = yield* result.writePoint(seriesName, point)
      }
      return result
    })
  }

  queryRange(
    seriesName: string, 
    startTime: Date, 
    endTime: Date
  ): Effect.Effect<Array<TimeSeriesPoint>, string, never> {
    return Effect.gen(function* () {
      const tree = this.series.get(seriesName)
      if (!tree) {
        return yield* Effect.fail(`Series '${seriesName}' not found`)
      }

      const startPoint: TimeSeriesPoint = { time: startTime, metric: "", value: 0 }
      const endPoint: TimeSeriesPoint = { time: endTime, metric: "", value: 0 }
      
      return pipe(
        RedBlackTree.greaterThanEqual(tree, startPoint),
        (iter) => Array.from(iter),
        (entries) => entries.filter(([point]) => point.time <= endTime),
        (entries) => entries.map(([point]) => point)
      )
    }).bind(this)
  }

  getLatestValue(seriesName: string): Effect.Effect<Option.Option<TimeSeriesPoint>, string, never> {
    return Effect.gen(function* () {
      const tree = this.series.get(seriesName)
      if (!tree) {
        return yield* Effect.fail(`Series '${seriesName}' not found`)
      }

      return RedBlackTree.last(tree).pipe(
        Option.map(([point]) => point)
      )
    }).bind(this)
  }

  aggregateByWindow(
    seriesName: string,
    startTime: Date,
    endTime: Date,
    windowSizeMs: number
  ): Effect.Effect<Array<{ window: Date, avg: number, min: number, max: number, count: number }>, string, never> {
    return Effect.gen(function* () {
      const points = yield* this.queryRange(seriesName, startTime, endTime)
      
      const windows = new Map<number, Array<number>>()
      
      for (const point of points) {
        const windowStart = Math.floor(point.time.getTime() / windowSizeMs) * windowSizeMs
        const existing = windows.get(windowStart) ?? []
        windows.set(windowStart, [...existing, point.value])
      }
      
      return Array.from(windows.entries()).map(([windowStart, values]) => ({
        window: new Date(windowStart),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      })).sort((a, b) => a.window.getTime() - b.window.getTime())
    })
  }

  downsample(
    seriesName: string,
    startTime: Date,
    endTime: Date,
    maxPoints: number
  ): Effect.Effect<Array<TimeSeriesPoint>, string, never> {
    return Effect.gen(function* () {
      const points = yield* this.queryRange(seriesName, startTime, endTime)
      
      if (points.length <= maxPoints) {
        return points
      }
      
      const step = Math.ceil(points.length / maxPoints)
      return points.filter((_, index) => index % step === 0)
    })
  }
}

// Usage example with real-time data ingestion
const makeTimeSeriesService = Effect.gen(function* () {
  let db = TimeSeriesDB.empty()
  
  const ingestMetrics = (metrics: Array<{ series: string, point: TimeSeriesPoint }>) =>
    Effect.gen(function* () {
      for (const { series, point } of metrics) {
        db = yield* db.writePoint(series, point)
      }
    })
  
  const queryDashboard = (seriesName: string, hours: number) =>
    Effect.gen(function* () {
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000)
      
      const rawData = yield* db.queryRange(seriesName, startTime, endTime)
      const aggregated = yield* db.aggregateByWindow(seriesName, startTime, endTime, 5 * 60 * 1000) // 5-minute windows
      const downsampled = yield* db.downsample(seriesName, startTime, endTime, 100)
      
      return { rawData, aggregated, downsampled }
    })
  
  const getCurrentValue = (seriesName: string) => db.getLatestValue(seriesName)
  
  return { ingestMetrics, queryDashboard, getCurrentValue } as const
})
```

### Example 3: Content Management System with Hierarchical Indexing

A CMS needs to efficiently organize and search content by multiple criteria with complex sorting requirements.

```typescript
import { RedBlackTree, Order, Option, Effect, Array as Arr, pipe } from "effect"

interface Content {
  readonly id: string
  readonly title: string
  readonly author: string
  readonly publishDate: Date
  readonly category: string
  readonly tags: Array<string>
  readonly viewCount: number
  readonly rating: number
}

interface ContentIndex {
  readonly byDate: RedBlackTree.RedBlackTree<Date, Content>
  readonly byPopularity: RedBlackTree.RedBlackTree<number, Content>
  readonly byRating: RedBlackTree.RedBlackTree<number, Content>
  readonly byAuthor: RedBlackTree.RedBlackTree<string, Array<Content>>
}

class ContentManager {
  private constructor(private readonly indexes: ContentIndex) {}

  static empty(): ContentManager {
    return new ContentManager({
      byDate: RedBlackTree.empty<Date, Content>(Order.reverse(Order.Date)), // Newest first
      byPopularity: RedBlackTree.empty<number, Content>(Order.reverse(Order.number)), // Most popular first
      byRating: RedBlackTree.empty<number, Content>(Order.reverse(Order.number)), // Highest rated first
      byAuthor: RedBlackTree.empty<string, Array<Content>>(Order.string)
    })
  }

  addContent(content: Content): ContentManager {
    return Effect.gen(function* () {
      // Update date index
      const newByDate = RedBlackTree.insert(this.indexes.byDate, content.publishDate, content)
      
      // Update popularity index
      const newByPopularity = RedBlackTree.insert(this.indexes.byPopularity, content.viewCount, content)
      
      // Update rating index
      const newByRating = RedBlackTree.insert(this.indexes.byRating, content.rating, content)
      
      // Update author index
      const existingAuthorContent = RedBlackTree.findFirst(this.indexes.byAuthor, content.author)
      const authorContent = Option.match(existingAuthorContent, {
        onNone: () => [content],
        onSome: (existing) => [...existing, content]
      })
      const newByAuthor = RedBlackTree.insert(this.indexes.byAuthor, content.author, authorContent)

      const newIndexes: ContentIndex = {
        byDate: newByDate,
        byPopularity: newByPopularity,
        byRating: newByRating,
        byAuthor: newByAuthor
      }

      return new ContentManager(newIndexes)
    }).pipe(Effect.runSync).bind(this)()
  }

  getRecentContent(limit: number): Array<Content> {
    return pipe(
      this.indexes.byDate,
      RedBlackTree.at(0),
      (iter) => Array.from(iter),
      (entries) => entries.slice(0, limit),
      (entries) => entries.map(([, content]) => content)
    )
  }

  getPopularContent(limit: number): Array<Content> {
    return pipe(
      this.indexes.byPopularity,
      RedBlackTree.at(0),
      (iter) => Array.from(iter),
      (entries) => entries.slice(0, limit),
      (entries) => entries.map(([, content]) => content)
    )
  }

  getTopRatedContent(minRating: number, limit: number): Array<Content> {
    return pipe(
      RedBlackTree.greaterThanEqual(this.indexes.byRating, minRating),
      (iter) => Array.from(iter),
      (entries) => entries.slice(0, limit),
      (entries) => entries.map(([, content]) => content)
    )
  }

  getContentByAuthor(author: string): Option.Option<Array<Content>> {
    return RedBlackTree.findFirst(this.indexes.byAuthor, author)
  }

  getContentInDateRange(startDate: Date, endDate: Date): Array<Content> {
    return pipe(
      RedBlackTree.lessThanEqual(this.indexes.byDate, endDate),
      (iter) => Array.from(iter),
      (entries) => entries.filter(([date]) => date >= startDate),
      (entries) => entries.map(([, content]) => content)
    )
  }

  getTrendingContent(daysSincePublish: number, minViews: number): Array<Content> {
    return Effect.gen(function* () {
      const cutoffDate = new Date(Date.now() - daysSincePublish * 24 * 60 * 60 * 1000)
      const recentContent = this.getContentInDateRange(cutoffDate, new Date())
      
      return pipe(
        recentContent,
        Arr.filter(content => content.viewCount >= minViews),
        Arr.sort(Order.mapInput(Order.reverse(Order.number), (c: Content) => c.viewCount))
      )
    }).pipe(Effect.runSync)
  }

  searchByMultipleCriteria(criteria: {
    category?: string
    minRating?: number
    minViews?: number
    publishedAfter?: Date
    publishedBefore?: Date
    author?: string
    tags?: Array<string>
  }): Array<Content> {
    return Effect.gen(function* () {
      // Start with all content sorted by rating
      let candidates = pipe(
        this.indexes.byRating,
        RedBlackTree.at(0),
        (iter) => Array.from(iter),
        (entries) => entries.map(([, content]) => content)
      )

      if (criteria.category) {
        candidates = candidates.filter(c => c.category === criteria.category)
      }

      if (criteria.minRating !== undefined) {
        candidates = candidates.filter(c => c.rating >= criteria.minRating)
      }

      if (criteria.minViews !== undefined) {
        candidates = candidates.filter(c => c.viewCount >= criteria.minViews)
      }

      if (criteria.publishedAfter) {
        candidates = candidates.filter(c => c.publishDate >= criteria.publishedAfter!)
      }

      if (criteria.publishedBefore) {
        candidates = candidates.filter(c => c.publishDate <= criteria.publishedBefore!)
      }

      if (criteria.author) {
        candidates = candidates.filter(c => c.author === criteria.author)
      }

      if (criteria.tags && criteria.tags.length > 0) {
        candidates = candidates.filter(c => 
          criteria.tags!.some(tag => c.tags.includes(tag))
        )
      }

      return candidates
    }).pipe(Effect.runSync)
  }
}

// Usage example with content management operations
const makeContentService = Effect.gen(function* () {
  let manager = ContentManager.empty()
  
  const publishContent = (content: Content) => 
    Effect.sync(() => {
      manager = manager.addContent(content)
    })
  
  const getFeedContent = (feedType: 'recent' | 'popular' | 'trending', limit: number = 10) =>
    Effect.sync(() => {
      switch (feedType) {
        case 'recent':
          return manager.getRecentContent(limit)
        case 'popular':
          return manager.getPopularContent(limit)
        case 'trending':
          return manager.getTrendingContent(7, 100) // Last 7 days, min 100 views
        default:
          return []
      }
    })
  
  const searchContent = (criteria: Parameters<typeof manager.searchByMultipleCriteria>[0]) =>
    Effect.sync(() => manager.searchByMultipleCriteria(criteria))
  
  const getAuthorProfile = (author: string) =>
    Effect.sync(() => ({
      content: manager.getContentByAuthor(author),
      recentContent: manager.getContentByAuthor(author).pipe(
        Option.map(content => content.filter(c => 
          c.publishDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ))
      )
    }))
  
  return { publishContent, getFeedContent, searchContent, getAuthorProfile } as const
})
```

## Advanced Features Deep Dive

### Red-Black Tree Balancing Properties

RedBlackTree maintains five fundamental properties that guarantee logarithmic performance:

```typescript
import { RedBlackTree, Order, Effect, pipe } from "effect"

// Understanding tree balance through insertion patterns
const demonstrateBalancing = Effect.gen(function* () {
  let tree = RedBlackTree.empty<number, string>(Order.number)
  
  // Sequential insertion - would create unbalanced BST
  const sequentialData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  
  for (const num of sequentialData) {
    tree = RedBlackTree.insert(tree, num, `value-${num}`)
    
    // Tree remains balanced regardless of insertion order
    const size = RedBlackTree.size(tree)
    const maxDepth = calculateMaxDepth(tree) // Would be O(log n)
    
    console.log(`Size: ${size}, Max Depth: ${maxDepth}, Expected Max: ${Math.ceil(Math.log2(size + 1)) * 2}`)
  }
  
  return tree
})

// Performance comparison with unbalanced structures
const performanceComparison = Effect.gen(function* () {
  const tree = RedBlackTree.empty<number, number>(Order.number)
  const dataSize = 10000
  
  // Fill with sequential data
  let populatedTree = tree
  const startTime = performance.now()
  
  for (let i = 0; i < dataSize; i++) {
    populatedTree = RedBlackTree.insert(populatedTree, i, i * 2)
  }
  
  const insertTime = performance.now() - startTime
  
  // Perform lookups
  const lookupStart = performance.now()
  for (let i = 0; i < 1000; i++) {
    const randomKey = Math.floor(Math.random() * dataSize)
    RedBlackTree.findFirst(populatedTree, randomKey)
  }
  const lookupTime = performance.now() - lookupStart
  
  return {
    insertTime: `${insertTime.toFixed(2)}ms for ${dataSize} insertions`,
    lookupTime: `${lookupTime.toFixed(2)}ms for 1000 lookups`,
    avgInsertTime: `${(insertTime / dataSize).toFixed(4)}ms per insertion`,
    avgLookupTime: `${(lookupTime / 1000).toFixed(4)}ms per lookup`
  }
})

// Demonstrate structural sharing
const structuralSharingDemo = Effect.gen(function* () {
  const baseTree = RedBlackTree.make(Order.number)(
    [1, "one"], [2, "two"], [3, "three"], [4, "four"], [5, "five"]
  )
  
  // Creating variations shares structure
  const withSix = RedBlackTree.insert(baseTree, 6, "six")
  const withoutThree = RedBlackTree.removeFirst(baseTree, 3)
  const withZero = RedBlackTree.insert(baseTree, 0, "zero")
  
  // Each tree shares common structure with others
  // Memory usage is proportional to differences, not total size
  
  return {
    baseSize: RedBlackTree.size(baseTree),
    withSixSize: RedBlackTree.size(withSix),
    withoutThreeSize: RedBlackTree.size(withoutThree),
    withZeroSize: RedBlackTree.size(withZero)
  }
})

function calculateMaxDepth<K, V>(tree: RedBlackTree.RedBlackTree<K, V>): number {
  // Helper function - would need access to internal structure
  // This is conceptual - actual implementation would be internal
  return Math.ceil(Math.log2(RedBlackTree.size(tree) + 1)) * 2
}
```

### Custom Ordering Strategies

```typescript
import { RedBlackTree, Order, pipe } from "effect"

// Complex multi-field ordering
interface Task {
  readonly id: string
  readonly priority: 1 | 2 | 3 | 4 | 5 // 1 = highest
  readonly dueDate: Date
  readonly estimatedHours: number
  readonly assignee: string
}

// Primary sort by priority, secondary by due date, tertiary by estimated hours
const taskOrder = Order.combine(
  Order.mapInput(Order.number, (task: Task) => task.priority),
  Order.combine(
    Order.mapInput(Order.Date, (task: Task) => task.dueDate),
    Order.mapInput(Order.number, (task: Task) => task.estimatedHours)
  )
)

const taskQueue = RedBlackTree.empty<Task, string>(taskOrder)

// Geographic coordinate ordering
interface Location {
  readonly latitude: number
  readonly longitude: number
  readonly name: string
}

// Order by distance from origin (0, 0)
const locationOrder = Order.mapInput(
  Order.number,
  (loc: Location) => Math.sqrt(loc.latitude ** 2 + loc.longitude ** 2)
)

const locationIndex = RedBlackTree.empty<Location, string>(locationOrder)

// Version ordering (semantic versioning)
interface Version {
  readonly major: number
  readonly minor: number
  readonly patch: number
  readonly prerelease?: string
}

const versionOrder = Order.combine(
  Order.mapInput(Order.number, (v: Version) => v.major),
  Order.combine(
    Order.mapInput(Order.number, (v: Version) => v.minor),
    Order.combine(
      Order.mapInput(Order.number, (v: Version) => v.patch),
      Order.mapInput(
        Order.string,
        (v: Version) => v.prerelease ?? "zzz" // Stable versions after prereleases
      )
    )
  )
)

const versionHistory = RedBlackTree.empty<Version, string>(versionOrder)

// Dynamic ordering based on context
interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly rating: number
  readonly releaseDate: Date
}

const createProductOrder = (sortBy: 'price' | 'rating' | 'release' | 'name') => {
  switch (sortBy) {
    case 'price':
      return Order.mapInput(Order.number, (p: Product) => p.price)
    case 'rating':
      return Order.mapInput(Order.reverse(Order.number), (p: Product) => p.rating)
    case 'release':
      return Order.mapInput(Order.reverse(Order.Date), (p: Product) => p.releaseDate)
    case 'name':
      return Order.mapInput(Order.string, (p: Product) => p.name)
  }
}

const createProductCatalog = (sortBy: Parameters<typeof createProductOrder>[0]) =>
  RedBlackTree.empty<Product, number>(createProductOrder(sortBy))
```

### Iterator Patterns and Advanced Traversal

```typescript
import { RedBlackTree, Order, Option, Effect, Chunk, pipe } from "effect"

// Custom iterator patterns for specialized traversals
const advancedTraversalPatterns = Effect.gen(function* () {
  const numbers = RedBlackTree.make(Order.number)(
    [10, "ten"], [5, "five"], [15, "fifteen"], [3, "three"], [7, "seven"],
    [12, "twelve"], [18, "eighteen"], [1, "one"], [6, "six"], [8, "eight"],
    [11, "eleven"], [13, "thirteen"], [16, "sixteen"], [20, "twenty"]
  )

  // Windowed iteration - process elements in sliding windows
  const windowedTraversal = (windowSize: number) => {
    const allEntries = Array.from(numbers)
    const windows: Array<Array<[number, string]>> = []
    
    for (let i = 0; i <= allEntries.length - windowSize; i++) {
      windows.push(allEntries.slice(i, i + windowSize))
    }
    
    return windows
  }

  // Paginated access with efficient seeking
  const paginatedAccess = (pageSize: number, pageNumber: number) => {
    const startIndex = pageNumber * pageSize
    return pipe(
      RedBlackTree.at(numbers, startIndex),
      (iter) => Array.from(iter),
      (entries) => entries.slice(0, pageSize)
    )
  }

  // Filtered iteration with early termination
  const filteredIteration = (predicate: (key: number, value: string) => boolean, maxResults: number) => {
    const results: Array<[number, string]> = []
    let count = 0
    
    for (const [key, value] of numbers) {
      if (predicate(key, value)) {
        results.push([key, value])
        count++
        if (count >= maxResults) break
      }
    }
    
    return results
  }

  // Bidirectional traversal from a starting point
  const bidirectionalTraversal = (startKey: number, forwardCount: number, backwardCount: number) => {
    const forward = pipe(
      RedBlackTree.greaterThanEqual(numbers, startKey),
      (iter) => Array.from(iter),
      (entries) => entries.slice(0, forwardCount)
    )
    
    const backward = pipe(
      RedBlackTree.lessThan(numbers, startKey),
      (iter) => Array.from(iter),
      (entries) => entries.slice(-backwardCount).reverse()
    )
    
    return { forward, backward }
  }

  // Sample results
  const windows = windowedTraversal(3)
  const page1 = paginatedAccess(5, 0)
  const page2 = paginatedAccess(5, 1)
  const evenNumbers = filteredIteration((key) => key % 2 === 0, 5)
  const aroundTen = bidirectionalTraversal(10, 3, 3)

  return {
    windows: windows.slice(0, 3), // Show first 3 windows
    page1,
    page2,
    evenNumbers,
    aroundTen
  }
})

// Memory-efficient streaming over large trees
const streamingTraversal = <K, V>(
  tree: RedBlackTree.RedBlackTree<K, V>,
  processor: (key: K, value: V) => Effect.Effect<void, never, never>,
  batchSize: number = 100
): Effect.Effect<void, never, never> => {
  return Effect.gen(function* () {
    let processed = 0
    const totalSize = RedBlackTree.size(tree)
    
    while (processed < totalSize) {
      const batch = pipe(
        RedBlackTree.at(tree, processed),
        (iter) => Array.from(iter),
        (entries) => entries.slice(0, batchSize)
      )
      
      for (const [key, value] of batch) {
        yield* processor(key, value)
      }
      
      processed += batch.length
      
      // Yield control to prevent blocking
      yield* Effect.yieldNow()
    }
  })
}

// Range-based operations with custom predicates
const rangeOperations = Effect.gen(function* () {
  const scores = RedBlackTree.make(Order.number)(
    [95, "Alice"], [87, "Bob"], [92, "Charlie"], [78, "David"],
    [88, "Eve"], [94, "Frank"], [82, "Grace"], [90, "Henry"]
  )

  // Find percentile ranges
  const getPercentileRange = (lowerPercent: number, upperPercent: number) => {
    const allScores = pipe(
      scores,
      RedBlackTree.keys,
      (iter) => Array.from(iter),
      (keys) => keys.sort((a, b) => a - b)
    )
    
    const lowerIndex = Math.floor(allScores.length * lowerPercent / 100)
    const upperIndex = Math.floor(allScores.length * upperPercent / 100)
    
    const lowerBound = allScores[lowerIndex]
    const upperBound = allScores[upperIndex]
    
    return pipe(
      RedBlackTree.greaterThanEqual(scores, lowerBound),
      (iter) => Array.from(iter),
      (entries) => entries.filter(([score]) => score <= upperBound)
    )
  }

  // Get quartile statistics
  const quartileStats = () => {
    const q1 = getPercentileRange(0, 25)
    const q2 = getPercentileRange(25, 50) 
    const q3 = getPercentileRange(50, 75)
    const q4 = getPercentileRange(75, 100)
    
    return { q1, q2, q3, q4 }
  }

  return quartileStats()
})
```

## Practical Patterns & Best Practices

### Pattern 1: Efficient Caching with TTL

```typescript
import { RedBlackTree, Order, Option, Effect, Duration, Clock, pipe } from "effect"

interface CacheEntry<T> {
  readonly key: string
  readonly value: T
  readonly expiresAt: Date
  readonly accessCount: number
  readonly lastAccessed: Date
}

const expirationOrder = Order.mapInput(
  Order.Date,
  (entry: CacheEntry<unknown>) => entry.expiresAt
)

class TTLCache<T> {
  private constructor(
    private readonly byExpiration: RedBlackTree.RedBlackTree<CacheEntry<T>, T>,
    private readonly byKey: Map<string, CacheEntry<T>>,
    private readonly maxSize: number
  ) {}

  static create<T>(maxSize: number): TTLCache<T> {
    return new TTLCache(
      RedBlackTree.empty<CacheEntry<T>, T>(expirationOrder),
      new Map(),
      maxSize
    )
  }

  set(key: string, value: T, ttlMs: number): Effect.Effect<TTLCache<T>, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const expiresAt = new Date(now + ttlMs)
      
      const entry: CacheEntry<T> = {
        key,
        value,
        expiresAt,
        accessCount: 0,
        lastAccessed: new Date(now)
      }

      // Remove old entry if exists
      let newByExpiration = this.byExpiration
      const oldEntry = this.byKey.get(key)
      if (oldEntry) {
        newByExpiration = RedBlackTree.removeFirst(newByExpiration, oldEntry)
      }

      // Add new entry
      newByExpiration = RedBlackTree.insert(newByExpiration, entry, value)
      const newByKey = new Map(this.byKey)
      newByKey.set(key, entry)

      // Evict if over capacity
      const { finalByExpiration, finalByKey } = yield* this.evictIfNeeded(newByExpiration, newByKey)

      return new TTLCache(finalByExpiration, finalByKey, this.maxSize)
    }).bind(this)
  }

  get(key: string): Effect.Effect<Option.Option<T>, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const entry = this.byKey.get(key)
      
      if (!entry) {
        return Option.none()
      }
      
      if (entry.expiresAt.getTime() <= now) {
        // Entry expired, clean up and return none
        yield* this.delete(key)
        return Option.none()
      }
      
      // Update access statistics
      const updatedEntry: CacheEntry<T> = {
        ...entry,
        accessCount: entry.accessCount + 1,
        lastAccessed: new Date(now)
      }
      
      this.byKey.set(key, updatedEntry)
      
      return Option.some(entry.value)
    }).bind(this)
  }

  delete(key: string): Effect.Effect<TTLCache<T>, never, never> {
    return Effect.gen(function* () {
      const entry = this.byKey.get(key)
      if (!entry) {
        return this
      }

      const newByExpiration = RedBlackTree.removeFirst(this.byExpiration, entry)
      const newByKey = new Map(this.byKey)
      newByKey.delete(key)

      return new TTLCache(newByExpiration, newByKey, this.maxSize)
    }).bind(this)
  }

  cleanup(): Effect.Effect<TTLCache<T>, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const cutoff: CacheEntry<T> = {
        key: "",
        value: undefined as T,
        expiresAt: new Date(now),
        accessCount: 0,
        lastAccessed: new Date(0)
      }

      const expiredEntries = pipe(
        RedBlackTree.lessThanEqual(this.byExpiration, cutoff),
        (iter) => Array.from(iter),
        (entries) => entries.map(([entry]) => entry)
      )

      let result = this as TTLCache<T>
      for (const entry of expiredEntries) {
        result = yield* result.delete(entry.key)
      }

      return result
    })
  }

  private evictIfNeeded(
    byExpiration: RedBlackTree.RedBlackTree<CacheEntry<T>, T>,
    byKey: Map<string, CacheEntry<T>>
  ): Effect.Effect<{ finalByExpiration: RedBlackTree.RedBlackTree<CacheEntry<T>, T>, finalByKey: Map<string, CacheEntry<T>> }, never, never> {
    return Effect.gen(function* () {
      if (byKey.size <= this.maxSize) {
        return { finalByExpiration: byExpiration, finalByKey: byKey }
      }

      // Evict oldest entries first
      const entriesToEvict = byKey.size - this.maxSize
      const oldestEntries = pipe(
        byExpiration,
        RedBlackTree.at(0),
        (iter) => Array.from(iter),
        (entries) => entries.slice(0, entriesToEvict),
        (entries) => entries.map(([entry]) => entry)
      )

      let newByExpiration = byExpiration
      const newByKey = new Map(byKey)

      for (const entry of oldestEntries) {
        newByExpiration = RedBlackTree.removeFirst(newByExpiration, entry)
        newByKey.delete(entry.key)
      }

      return { finalByExpiration: newByExpiration, finalByKey: newByKey }
    })
  }

  getStats(): Effect.Effect<{
    size: number
    expiredCount: number
    avgAccessCount: number
    oldestEntry: Option.Option<Date>
    newestEntry: Option.Option<Date>
  }, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const entries = Array.from(this.byKey.values())
      
      const expiredCount = entries.filter(e => e.expiresAt.getTime() <= now).length
      const totalAccess = entries.reduce((sum, e) => sum + e.accessCount, 0)
      const avgAccessCount = entries.length > 0 ? totalAccess / entries.length : 0

      const oldestEntry = RedBlackTree.first(this.byExpiration).pipe(
        Option.map(([entry]) => entry.expiresAt)
      )
      
      const newestEntry = RedBlackTree.last(this.byExpiration).pipe(
        Option.map(([entry]) => entry.expiresAt)
      )

      return {
        size: this.byKey.size,
        expiredCount,
        avgAccessCount,
        oldestEntry,
        newestEntry
      }
    }).bind(this)
  }
}

// Usage example
const makeCacheService = <T>() => Effect.gen(function* () {
  let cache = TTLCache.create<T>(1000)
  
  const set = (key: string, value: T, ttlMs: number = 300000) => // 5 minutes default
    Effect.gen(function* () {
      cache = yield* cache.set(key, value, ttlMs)
    })
  
  const get = (key: string) => cache.get(key)
  
  const scheduleCleanup = Effect.gen(function* () {
    yield* Effect.repeat(
      Effect.gen(function* () {
        cache = yield* cache.cleanup()
      }),
      Schedule.fixed(Duration.minutes(1)) // Clean up every minute
    )
  }).pipe(Effect.fork)
  
  return { set, get, scheduleCleanup } as const
})
```

### Pattern 2: Event Sourcing with Efficient Querying

```typescript
import { RedBlackTree, Order, Effect, Chunk, Array as Arr, pipe } from "effect"

interface Event {
  readonly id: string
  readonly timestamp: Date
  readonly type: string
  readonly aggregateId: string
  readonly version: number
  readonly data: Record<string, unknown>
}

interface EventStoreIndexes {
  readonly byTimestamp: RedBlackTree.RedBlackTree<Date, Event>
  readonly byAggregate: RedBlackTree.RedBlackTree<string, Array<Event>>
  readonly byVersion: RedBlackTree.RedBlackTree<number, Event>
}

class EventStore {
  private constructor(
    private readonly events: Array<Event>,
    private readonly indexes: EventStoreIndexes
  ) {}

  static empty(): EventStore {
    return new EventStore([], {
      byTimestamp: RedBlackTree.empty<Date, Event>(Order.Date),
      byAggregate: RedBlackTree.empty<string, Array<Event>>(Order.string),
      byVersion: RedBlackTree.empty<number, Event>(Order.number)
    })
  }

  append(event: Event): Effect.Effect<EventStore, string, never> {
    return Effect.gen(function* () {
      // Validate event version for aggregate
      const existingEvents = RedBlackTree.findFirst(this.indexes.byAggregate, event.aggregateId)
      const expectedVersion = existingEvents.pipe(
        Option.map(events => Math.max(...events.map(e => e.version)) + 1),
        Option.getOrElse(() => 1)
      )

      if (event.version !== expectedVersion) {
        return yield* Effect.fail(`Version mismatch. Expected ${expectedVersion}, got ${event.version}`)
      }

      // Update all indexes
      const newByTimestamp = RedBlackTree.insert(this.indexes.byTimestamp, event.timestamp, event)
      const newByVersion = RedBlackTree.insert(this.indexes.byVersion, event.version, event)
      
      const aggregateEvents = existingEvents.pipe(
        Option.map(events => [...events, event]),
        Option.getOrElse(() => [event])
      )
      const newByAggregate = RedBlackTree.insert(this.indexes.byAggregate, event.aggregateId, aggregateEvents)

      const newIndexes: EventStoreIndexes = {
        byTimestamp: newByTimestamp,
        byAggregate: newByAggregate,
        byVersion: newByVersion
      }

      return new EventStore([...this.events, event], newIndexes)
    }).bind(this)
  }

  getEventsForAggregate(aggregateId: string, fromVersion?: number): Effect.Effect<Array<Event>, never, never> {
    return Effect.gen(function* () {
      const allEvents = RedBlackTree.findFirst(this.indexes.byAggregate, aggregateId).pipe(
        Option.getOrElse(() => [])
      )

      if (fromVersion === undefined) {
        return allEvents
      }

      return allEvents.filter(e => e.version >= fromVersion)
    }).bind(this)
  }

  getEventsByTimeRange(startTime: Date, endTime: Date): Effect.Effect<Array<Event>, never, never> {
    return Effect.gen(function* () {
      return pipe(
        RedBlackTree.greaterThanEqual(this.indexes.byTimestamp, startTime),
        (iter) => Array.from(iter),
        (entries) => entries.filter(([timestamp]) => timestamp <= endTime),
        (entries) => entries.map(([, event]) => event)
      )
    }).bind(this)
  }

  getEventsByType(eventType: string, limit?: number): Effect.Effect<Array<Event>, never, never> {
    return Effect.gen(function* () {
      const filtered = this.events.filter(e => e.type === eventType)
      return limit ? filtered.slice(0, limit) : filtered
    }).bind(this)
  }

  getSnapshot(aggregateId: string): Effect.Effect<Record<string, unknown>, never, never> {
    return Effect.gen(function* () {
      const events = yield* this.getEventsForAggregate(aggregateId)
      
      // Replay events to build current state
      return events.reduce((state, event) => {
        return this.applyEvent(state, event)
      }, {} as Record<string, unknown>)
    })
  }

  getProjection<T>(
    projectionFn: (events: Array<Event>) => T,
    filter?: {
      eventTypes?: Array<string>
      aggregateIds?: Array<string>
      timeRange?: { start: Date, end: Date }
    }
  ): Effect.Effect<T, never, never> {
    return Effect.gen(function* () {
      let filteredEvents = this.events

      if (filter?.eventTypes) {
        filteredEvents = filteredEvents.filter(e => filter.eventTypes!.includes(e.type))
      }

      if (filter?.aggregateIds) {
        filteredEvents = filteredEvents.filter(e => filter.aggregateIds!.includes(e.aggregateId))
      }

      if (filter?.timeRange) {
        filteredEvents = filteredEvents.filter(e => 
          e.timestamp >= filter.timeRange!.start && e.timestamp <= filter.timeRange!.end
        )
      }

      return projectionFn(filteredEvents)
    }).bind(this)
  }

  private applyEvent(state: Record<string, unknown>, event: Event): Record<string, unknown> {
    // Simple state application - would be more sophisticated in real implementation
    return { ...state, ...event.data, lastEventId: event.id, version: event.version }
  }

  getMetrics(): Effect.Effect<{
    totalEvents: number
    aggregateCount: number
    eventTypeCounts: Record<string, number>
    timeRange: { earliest: Date | null, latest: Date | null }
  }, never, never> {
    return Effect.gen(function* () {
      const eventTypeCounts = this.events.reduce((counts, event) => {
        counts[event.type] = (counts[event.type] || 0) + 1
        return counts
      }, {} as Record<string, number>)

      const earliest = RedBlackTree.first(this.indexes.byTimestamp).pipe(
        Option.map(([timestamp]) => timestamp),
        Option.getOrElse(() => null)
      )

      const latest = RedBlackTree.last(this.indexes.byTimestamp).pipe(
        Option.map(([timestamp]) => timestamp),
        Option.getOrElse(() => null)
      )

      return {
        totalEvents: this.events.length,
        aggregateCount: RedBlackTree.size(this.indexes.byAggregate),
        eventTypeCounts,
        timeRange: { earliest, latest }
      }
    }).bind(this)
  }
}

// Usage example
const makeEventSourcingService = Effect.gen(function* () {
  let eventStore = EventStore.empty()
  
  const appendEvent = (event: Event) =>
    Effect.gen(function* () {
      eventStore = yield* eventStore.append(event)
    })
  
  const getAggregateHistory = (aggregateId: string) =>
    eventStore.getEventsForAggregate(aggregateId)
  
  const getCurrentState = (aggregateId: string) =>
    eventStore.getSnapshot(aggregateId)
  
  const getRecentActivity = (hours: number) =>
    Effect.gen(function* () {
      const endTime = new Date()
      const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000)
      return yield* eventStore.getEventsByTimeRange(startTime, endTime)
    })
  
  const getAnalytics = () => eventStore.getMetrics()
  
  return { appendEvent, getAggregateHistory, getCurrentState, getRecentActivity, getAnalytics } as const
})
```

### Pattern 3: Priority Queue with Dynamic Priorities

```typescript
import { RedBlackTree, Order, Option, Effect, Clock, pipe } from "effect"

interface PriorityTask<T> {
  readonly id: string
  readonly priority: number
  readonly payload: T
  readonly enqueuedAt: Date
  readonly deadline?: Date
  readonly retryCount: number
}

const taskOrder = Order.combine(
  Order.mapInput(Order.reverse(Order.number), (task: PriorityTask<unknown>) => task.priority),
  Order.mapInput(Order.Date, (task: PriorityTask<unknown>) => task.enqueuedAt)
)

class PriorityQueue<T> {
  private constructor(
    private readonly tasks: RedBlackTree.RedBlackTree<PriorityTask<T>, T>,
    private readonly idIndex: Map<string, PriorityTask<T>>
  ) {}

  static empty<T>(): PriorityQueue<T> {
    return new PriorityQueue(
      RedBlackTree.empty<PriorityTask<T>, T>(taskOrder),
      new Map()
    )
  }

  enqueue(id: string, priority: number, payload: T, deadline?: Date): Effect.Effect<PriorityQueue<T>, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      
      const task: PriorityTask<T> = {
        id,
        priority,
        payload,
        enqueuedAt: new Date(now),
        deadline,
        retryCount: 0
      }

      // Remove existing task if present
      let newTasks = this.tasks
      const existingTask = this.idIndex.get(id)
      if (existingTask) {
        newTasks = RedBlackTree.removeFirst(newTasks, existingTask)
      }

      newTasks = RedBlackTree.insert(newTasks, task, payload)
      const newIdIndex = new Map(this.idIndex)
      newIdIndex.set(id, task)

      return new PriorityQueue(newTasks, newIdIndex)
    }).bind(this)
  }

  dequeue(): Effect.Effect<Option.Option<{ task: PriorityTask<T>, queue: PriorityQueue<T> }>, never, never> {
    return Effect.gen(function* () {
      const firstTask = RedBlackTree.first(this.tasks)
      
      return Option.match(firstTask, {
        onNone: () => Option.none(),
        onSome: ([task, payload]) => {
          const newTasks = RedBlackTree.removeFirst(this.tasks, task)
          const newIdIndex = new Map(this.idIndex)
          newIdIndex.delete(task.id)
          
          const newQueue = new PriorityQueue(newTasks, newIdIndex)
          return Option.some({ task, queue: newQueue })
        }
      })
    }).bind(this)
  }

  updatePriority(id: string, newPriority: number): Effect.Effect<PriorityQueue<T>, string, never> {
    return Effect.gen(function* () {
      const existingTask = this.idIndex.get(id)
      if (!existingTask) {
        return yield* Effect.fail(`Task with id ${id} not found`)
      }

      const updatedTask: PriorityTask<T> = {
        ...existingTask,
        priority: newPriority
      }

      const newTasks = pipe(
        RedBlackTree.removeFirst(this.tasks, existingTask),
        (tree) => RedBlackTree.insert(tree, updatedTask, existingTask.payload)
      )

      const newIdIndex = new Map(this.idIndex)
      newIdIndex.set(id, updatedTask)

      return new PriorityQueue(newTasks, newIdIndex)
    }).bind(this)
  }

  peek(): Option.Option<PriorityTask<T>> {
    return RedBlackTree.first(this.tasks).pipe(
      Option.map(([task]) => task)
    )
  }

  contains(id: string): boolean {
    return this.idIndex.has(id)
  }

  size(): number {
    return RedBlackTree.size(this.tasks)
  }

  getTasksByPriorityRange(minPriority: number, maxPriority: number): Array<PriorityTask<T>> {
    const minTask: PriorityTask<T> = {
      id: "",
      priority: minPriority,
      payload: undefined as T,
      enqueuedAt: new Date(0),
      retryCount: 0
    }

    const maxTask: PriorityTask<T> = {
      id: "",
      priority: maxPriority,
      payload: undefined as T,
      enqueuedAt: new Date(),
      retryCount: 0
    }

    return pipe(
      RedBlackTree.greaterThanEqual(this.tasks, minTask),
      (iter) => Array.from(iter),
      (entries) => entries.filter(([task]) => task.priority <= maxPriority),
      (entries) => entries.map(([task]) => task)
    )
  }

  getOverdueTasks(): Effect.Effect<Array<PriorityTask<T>>, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentTime = new Date(now)
      
      return Array.from(this.idIndex.values()).filter(task => 
        task.deadline && task.deadline < currentTime
      )
    }).bind(this)
  }

  removeExpiredTasks(): Effect.Effect<PriorityQueue<T>, never, never> {
    return Effect.gen(function* () {
      const overdueTasks = yield* this.getOverdueTasks()
      
      let result = this as PriorityQueue<T>
      for (const task of overdueTasks) {
        result = yield* result.remove(task.id)
      }
      
      return result
    })
  }

  private remove(id: string): Effect.Effect<PriorityQueue<T>, string, never> {
    return Effect.gen(function* () {
      const task = this.idIndex.get(id)
      if (!task) {
        return yield* Effect.fail(`Task with id ${id} not found`)
      }

      const newTasks = RedBlackTree.removeFirst(this.tasks, task)
      const newIdIndex = new Map(this.idIndex)
      newIdIndex.delete(id)

      return new PriorityQueue(newTasks, newIdIndex)
    }).bind(this)
  }

  retry(id: string, newPriority?: number): Effect.Effect<PriorityQueue<T>, string, never> {
    return Effect.gen(function* () {
      const task = this.idIndex.get(id)
      if (!task) {
        return yield* Effect.fail(`Task with id ${id} not found`)
      }

      const now = yield* Clock.currentTimeMillis
      const updatedTask: PriorityTask<T> = {
        ...task,
        priority: newPriority ?? task.priority,
        enqueuedAt: new Date(now),
        retryCount: task.retryCount + 1
      }

      const newTasks = pipe(
        RedBlackTree.removeFirst(this.tasks, task),
        (tree) => RedBlackTree.insert(tree, updatedTask, task.payload)
      )

      const newIdIndex = new Map(this.idIndex)
      newIdIndex.set(id, updatedTask)

      return new PriorityQueue(newTasks, newIdIndex)
    }).bind(this)
  }

  getStats(): Effect.Effect<{
    totalTasks: number
    priorityDistribution: Record<number, number>
    averageWaitTime: number
    overdueCount: number
  }, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const currentTime = new Date(now)
      
      const tasks = Array.from(this.idIndex.values())
      const priorityDistribution = tasks.reduce((dist, task) => {
        dist[task.priority] = (dist[task.priority] || 0) + 1
        return dist
      }, {} as Record<number, number>)

      const totalWaitTime = tasks.reduce((sum, task) => 
        sum + (currentTime.getTime() - task.enqueuedAt.getTime()), 0
      )
      const averageWaitTime = tasks.length > 0 ? totalWaitTime / tasks.length : 0

      const overdueCount = tasks.filter(task => 
        task.deadline && task.deadline < currentTime
      ).length

      return {
        totalTasks: tasks.length,
        priorityDistribution,
        averageWaitTime,
        overdueCount
      }
    }).bind(this)
  }
}

// Usage example
const makeTaskQueueService = <T>() => Effect.gen(function* () {
  let queue = PriorityQueue.empty<T>()
  
  const enqueue = (id: string, priority: number, payload: T, deadline?: Date) =>
    Effect.gen(function* () {
      queue = yield* queue.enqueue(id, priority, payload, deadline)
    })
  
  const dequeue = () =>
    Effect.gen(function* () {
      const result = yield* queue.dequeue()
      return Option.match(result, {
        onNone: () => Option.none(),
        onSome: ({ task, queue: newQueue }) => {
          queue = newQueue
          return Option.some(task)
        }
      })
    })
  
  const updatePriority = (id: string, priority: number) =>
    Effect.gen(function* () {
      queue = yield* queue.updatePriority(id, priority)
    })
  
  const processNext = <R>(
    processor: (task: PriorityTask<T>) => Effect.Effect<void, never, R>
  ) =>
    Effect.gen(function* () {
      const result = yield* dequeue()
      return yield* Option.match(result, {
        onNone: () => Effect.unit,
        onSome: (task) => processor(task)
      })
    })
  
  const getQueueStatus = () => queue.getStats()
  
  return { enqueue, dequeue, updatePriority, processNext, getQueueStatus } as const
})
```

## Integration Examples

### Integration with Effect Streams for Real-time Processing

```typescript
import { RedBlackTree, Order, Stream, Effect, Queue, Schedule, Duration, pipe } from "effect"

interface MetricEvent {
  readonly timestamp: Date
  readonly source: string
  readonly value: number
  readonly tags: Record<string, string>
}

const metricOrder = Order.mapInput(Order.Date, (event: MetricEvent) => event.timestamp)

class RealTimeAnalytics {
  private constructor(
    private readonly slidingWindow: RedBlackTree.RedBlackTree<MetricEvent, number>,
    private readonly windowSizeMs: number
  ) {}

  static create(windowSizeMs: number): RealTimeAnalytics {
    return new RealTimeAnalytics(
      RedBlackTree.empty<MetricEvent, number>(metricOrder),
      windowSizeMs
    )
  }

  addEvent(event: MetricEvent): Effect.Effect<RealTimeAnalytics, never, never> {
    return Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      const cutoffTime = new Date(now - this.windowSizeMs)
      
      // Remove old events outside the window
      const cutoffEvent: MetricEvent = {
        timestamp: cutoffTime,
        source: "",
        value: 0,
        tags: {}
      }
      
      const cleanedWindow = pipe(
        RedBlackTree.greaterThan(this.slidingWindow, cutoffEvent),
        (iter) => Array.from(iter),
        (entries) => entries.reduce((tree, [event, value]) => 
          RedBlackTree.insert(tree, event, value), 
          RedBlackTree.empty<MetricEvent, number>(metricOrder)
        )
      )
      
      // Add new event
      const updatedWindow = RedBlackTree.insert(cleanedWindow, event, event.value)
      
      return new RealTimeAnalytics(updatedWindow, this.windowSizeMs)
    }).bind(this)
  }

  getCurrentMetrics(): Effect.Effect<{
    count: number
    average: number
    min: number
    max: number
    percentiles: { p50: number, p90: number, p95: number, p99: number }
  }, never, never> {
    return Effect.gen(function* () {
      const events = pipe(
        this.slidingWindow,
        RedBlackTree.values,
        (iter) => Array.from(iter),
        (values) => values.sort((a, b) => a - b)
      )
      
      if (events.length === 0) {
        return {
          count: 0,
          average: 0,
          min: 0,
          max: 0,
          percentiles: { p50: 0, p90: 0, p95: 0, p99: 0 }
        }
      }
      
      const sum = events.reduce((acc, val) => acc + val, 0)
      const getPercentile = (p: number) => {
        const index = Math.floor(events.length * p / 100)
        return events[Math.min(index, events.length - 1)]
      }
      
      return {
        count: events.length,
        average: sum / events.length,
        min: events[0],
        max: events[events.length - 1],
        percentiles: {
          p50: getPercentile(50),
          p90: getPercentile(90),
          p95: getPercentile(95),
          p99: getPercentile(99)
        }
      }
    }).bind(this)
  }
}

// Stream processing integration
const createMetricsProcessor = Effect.gen(function* () {
  let analytics = RealTimeAnalytics.create(60000) // 1-minute sliding window
  const metricsQueue = yield* Queue.unbounded<MetricEvent>()
  
  // Stream that processes incoming metrics
  const metricsStream = Stream.fromQueue(metricsQueue).pipe(
    Stream.tap((event) => 
      Effect.gen(function* () {
        analytics = yield* analytics.addEvent(event)
      })
    ),
    Stream.schedule(Schedule.fixed(Duration.millis(100))) // Process every 100ms
  )
  
  // Stream that emits current metrics every second
  const metricsReporter = Stream.repeatEffect(
    Effect.gen(function* () {
      const metrics = yield* analytics.getCurrentMetrics()
      yield* Effect.logInfo(`Current metrics: ${JSON.stringify(metrics)}`)
      return metrics
    })
  ).pipe(
    Stream.schedule(Schedule.fixed(Duration.seconds(1)))
  )
  
  const ingestMetric = (event: MetricEvent) => Queue.offer(metricsQueue, event)
  
  const startProcessing = () => Effect.gen(function* () {
    const processingFiber = yield* Stream.runDrain(metricsStream).pipe(Effect.fork)
    const reportingFiber = yield* Stream.runDrain(metricsReporter).pipe(Effect.fork)
    
    return { processingFiber, reportingFiber }
  })
  
  return { ingestMetric, startProcessing } as const
})
```

### Integration with HTTP APIs using Effect Platform

```typescript
import { RedBlackTree, Order, Effect, HttpApi, HttpApiBuilder, HttpApiEndpoint, Schema, pipe } from "effect"

interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly category: string
  readonly inStock: boolean
  readonly createdAt: Date
}

const priceOrder = Order.mapInput(Order.number, (product: Product) => product.price)
const nameOrder = Order.mapInput(Order.string, (product: Product) => product.name)
const dateOrder = Order.mapInput(Order.reverse(Order.Date), (product: Product) => product.createdAt)

class ProductCatalog {
  private constructor(
    private readonly byPrice: RedBlackTree.RedBlackTree<Product, Product>,
    private readonly byName: RedBlackTree.RedBlackTree<Product, Product>,
    private readonly byDate: RedBlackTree.RedBlackTree<Product, Product>,
    private readonly byId: Map<string, Product>
  ) {}

  static empty(): ProductCatalog {
    return new ProductCatalog(
      RedBlackTree.empty<Product, Product>(priceOrder),
      RedBlackTree.empty<Product, Product>(nameOrder),
      RedBlackTree.empty<Product, Product>(dateOrder),
      new Map()
    )
  }

  addProduct(product: Product): ProductCatalog {
    const newByPrice = RedBlackTree.insert(this.byPrice, product, product)
    const newByName = RedBlackTree.insert(this.byName, product, product)
    const newByDate = RedBlackTree.insert(this.byDate, product, product)
    const newById = new Map(this.byId)
    newById.set(product.id, product)

    return new ProductCatalog(newByPrice, newByName, newByDate, newById)
  }

  findById(id: string): Option.Option<Product> {
    return Option.fromNullable(this.byId.get(id))
  }

  getProductsByPriceRange(min: number, max: number): Array<Product> {
    const minProduct: Product = { id: "", name: "", price: min, category: "", inStock: false, createdAt: new Date(0) }
    const maxProduct: Product = { id: "", name: "", price: max, category: "", inStock: false, createdAt: new Date() }

    return pipe(
      RedBlackTree.greaterThanEqual(this.byPrice, minProduct),
      (iter) => Array.from(iter),
      (entries) => entries.filter(([product]) => product.price <= max),
      (entries) => entries.map(([product]) => product)
    )
  }

  getRecentProducts(limit: number): Array<Product> {
    return pipe(
      this.byDate,
      RedBlackTree.at(0),
      (iter) => Array.from(iter),
      (entries) => entries.slice(0, limit),
      (entries) => entries.map(([product]) => product)
    )
  }

  searchByName(namePrefix: string, limit: number): Array<Product> {
    const searchProduct: Product = { 
      id: "", 
      name: namePrefix, 
      price: 0, 
      category: "", 
      inStock: false, 
      createdAt: new Date(0) 
    }

    return pipe(
      RedBlackTree.greaterThanEqual(this.byName, searchProduct),
      (iter) => Array.from(iter),
      (entries) => entries.filter(([product]) => product.name.toLowerCase().startsWith(namePrefix.toLowerCase())),
      (entries) => entries.slice(0, limit),
      (entries) => entries.map(([product]) => product)
    )
  }
}

// HTTP API Schema definitions
const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number,
  category: Schema.String,
  inStock: Schema.Boolean,
  createdAt: Schema.Date
})

const PriceRangeQuerySchema = Schema.Struct({
  min: Schema.Number,
  max: Schema.Number,
  limit: Schema.optional(Schema.Number)
})

const SearchQuerySchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  category: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number)
})

// HTTP API definition
const ProductAPI = HttpApi.make("ProductAPI").pipe(
  HttpApi.addGroup(
    "products",
    HttpApiBuilder.make().pipe(
      HttpApiBuilder.addEndpoint(
        HttpApiEndpoint.get("getProduct", "/products/:id").pipe(
          HttpApiEndpoint.addSuccess(ProductSchema)
        )
      ),
      HttpApiBuilder.addEndpoint(
        HttpApiEndpoint.get("getProductsByPrice", "/products/by-price").pipe(
          HttpApiEndpoint.addQuery(PriceRangeQuerySchema),
          HttpApiEndpoint.addSuccess(Schema.Array(ProductSchema))
        )
      ),
      HttpApiBuilder.addEndpoint(
        HttpApiEndpoint.get("getRecentProducts", "/products/recent").pipe(
          HttpApiEndpoint.addQuery(Schema.Struct({ limit: Schema.optional(Schema.Number) })),
          HttpApiEndpoint.addSuccess(Schema.Array(ProductSchema))
        )
      ),
      HttpApiBuilder.addEndpoint(
        HttpApiEndpoint.get("searchProducts", "/products/search").pipe(
          HttpApiEndpoint.addQuery(SearchQuerySchema),
          HttpApiEndpoint.addSuccess(Schema.Array(ProductSchema))
        )
      ),
      HttpApiBuilder.addEndpoint(
        HttpApiEndpoint.post("addProduct", "/products").pipe(
          HttpApiEndpoint.addPayload(Schema.Omit(ProductSchema, "id", "createdAt")),
          HttpApiEndpoint.addSuccess(ProductSchema)
        )
      )
    )
  )
)

// Service implementation
const makeProductService = Effect.gen(function* () {
  let catalog = ProductCatalog.empty()
  
  const getProduct = (id: string) =>
    Effect.gen(function* () {
      return catalog.findById(id).pipe(
        Option.match({
          onNone: () => Effect.fail(new Error(`Product ${id} not found`)),
          onSome: (product) => Effect.succeed(product)
        })
      )
    }).pipe(Effect.flatten)
  
  const getProductsByPrice = (query: { min: number, max: number, limit?: number }) =>
    Effect.gen(function* () {
      const products = catalog.getProductsByPriceRange(query.min, query.max)
      return query.limit ? products.slice(0, query.limit) : products
    })
  
  const getRecentProducts = (limit: number = 20) =>
    Effect.succeed(catalog.getRecentProducts(limit))
  
  const searchProducts = (query: { name?: string, category?: string, limit?: number }) =>
    Effect.gen(function* () {
      if (query.name) {
        return catalog.searchByName(query.name, query.limit ?? 20)
      }
      
      if (query.category) {
        const allProducts = catalog.getRecentProducts(1000)
        const filtered = allProducts.filter(p => p.category === query.category)
        return query.limit ? filtered.slice(0, query.limit) : filtered
      }
      
      return catalog.getRecentProducts(query.limit ?? 20)
    })
  
  const addProduct = (productData: Omit<Product, "id" | "createdAt">) =>
    Effect.gen(function* () {
      const product: Product = {
        ...productData,
        id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      }
      
      catalog = catalog.addProduct(product)
      return product
    })
  
  return {
    getProduct,
    getProductsByPrice,
    getRecentProducts,
    searchProducts,
    addProduct
  } as const
})

// Complete application setup
const ProductApp = Effect.gen(function* () {
  const productService = yield* makeProductService
  
  // Sample data
  const sampleProducts = [
    { name: "Laptop Pro", price: 1299.99, category: "Electronics", inStock: true },
    { name: "Wireless Mouse", price: 29.99, category: "Accessories", inStock: true },
    { name: "Mechanical Keyboard", price: 149.99, category: "Accessories", inStock: false },
    { name: "4K Monitor", price: 399.99, category: "Electronics", inStock: true },
    { name: "USB-C Hub", price: 79.99, category: "Accessories", inStock: true }
  ]
  
  for (const productData of sampleProducts) {
    yield* productService.addProduct(productData)
  }
  
  return productService
})
```

## Conclusion

RedBlackTree provides guaranteed O(log n) performance for sorted collections, self-balancing tree structure, and efficient range queries for TypeScript applications.

Key benefits:
- **Performance Guarantees**: All operations maintain O(log n) complexity regardless of data patterns
- **Memory Efficiency**: Structural sharing reduces memory usage while maintaining immutability
- **Type Safety**: Custom Order instances provide compile-time safety for complex sorting requirements
- **Rich Query Interface**: Comprehensive range query and traversal operations for complex data access patterns

RedBlackTree is ideal when you need predictable performance for sorted data operations, frequent range queries, or maintaining ordered collections with high update rates.