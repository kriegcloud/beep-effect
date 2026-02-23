# Order: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Order Solves

JavaScript's native sorting and comparison operations are limited, error-prone, and lack composability. Traditional approaches to sorting complex data structures require verbose, imperative code that's difficult to maintain and reuse:

```typescript
// Traditional approach - sorting complex data with manual comparisons
interface Product {
  name: string
  category: string
  price: number
  rating: number
  inStock: boolean
}

function sortProducts(products: Product[]): Product[] {
  return products.sort((a, b) => {
    // Complex multi-field sorting logic
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    if (a.inStock !== b.inStock) {
      return a.inStock ? -1 : 1 // In stock items first
    }
    if (a.rating !== b.rating) {
      return b.rating - a.rating // Higher ratings first
    }
    if (a.price !== b.price) {
      return a.price - b.price // Lower prices first
    }
    return a.name.localeCompare(b.name)
  })
}

// Inconsistent comparison functions across codebase
function compareUsersByName(a: User, b: User): number {
  return a.name.localeCompare(b.name)
}

function isUserOlderThan(user: User, age: number): boolean {
  return user.age > age // No reusable comparison logic
}
```

This approach leads to:
- **Code Duplication** - Similar comparison logic scattered throughout the codebase
- **Inconsistent Sorting** - Different developers implement sorting differently
- **Hard to Compose** - Cannot easily combine or reuse comparison logic
- **Error-Prone** - Manual implementation of complex sorting rules
- **Type Unsafe** - No compile-time guarantees about comparison consistency

### The Order Solution

Effect's Order module provides a composable, type-safe way to define comparison and sorting operations:

```typescript
import { Order, Array as Arr } from "effect"

// Define reusable, composable comparators
const byCategory = Order.mapInput(Order.string, (p: Product) => p.category)
const byStockStatus = Order.mapInput(Order.boolean, (p: Product) => p.inStock)
const byRating = Order.mapInput(Order.reverse(Order.number), (p: Product) => p.rating)
const byPrice = Order.mapInput(Order.number, (p: Product) => p.price)
const byName = Order.mapInput(Order.string, (p: Product) => p.name)

// Compose them into a complex sorting strategy
const productOrder = Order.combine(
  byCategory,
  Order.combine(
    Order.reverse(byStockStatus), // In stock first
    Order.combine(byRating, Order.combine(byPrice, byName))
  )
)

// Clean, reusable sorting
const sortedProducts = Arr.sort(products, productOrder)
```

### Key Concepts

**Order<A>**: A type-safe comparison function that returns `-1` (less than), `0` (equal), or `1` (greater than) when comparing two values of type `A`.

**Composability**: Orders can be combined, reversed, and transformed to create complex sorting strategies from simple building blocks.

**Type Safety**: The compiler ensures that comparisons are only performed between compatible types, preventing runtime errors.

## Basic Usage Patterns

### Pattern 1: Using Built-in Orders

```typescript
import { Order } from "effect"

// Basic comparison with built-in orders
console.log(Order.string("apple", "banana")) // -1 (apple < banana)
console.log(Order.number(42, 24)) // 1 (42 > 24)
console.log(Order.Date(new Date("2024-01-01"), new Date("2024-01-02"))) // -1
```

### Pattern 2: Creating Custom Orders

```typescript
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

// Create custom orders using mapInput
const byUserId = Order.mapInput(Order.number, (user: User) => user.id)
const byUserName = Order.mapInput(Order.string, (user: User) => user.name)
const byCreatedDate = Order.mapInput(Order.Date, (user: User) => user.createdAt)
```

### Pattern 3: Combining Orders

```typescript
// Combine multiple orders for complex sorting
const userOrder = Order.combine(
  byUserName,        // Primary: sort by name
  byCreatedDate      // Secondary: sort by creation date for same names
)

// Multi-level sorting
const complexUserOrder = Order.combineMany(byUserName, [
  byCreatedDate,
  byUserId
])
```

## Real-World Examples

### Example 1: E-commerce Product Catalog Sorting

Implementing a flexible product sorting system for an e-commerce platform:

```typescript
import { Order, Array as Arr, Effect } from "effect"

interface Product {
  id: string
  name: string
  category: string
  price: number
  rating: number
  reviewCount: number
  inStock: boolean
  featured: boolean
  createdAt: Date
}

// Define atomic comparators
const ProductOrder = {
  byName: Order.mapInput(Order.string, (p: Product) => p.name),
  byCategory: Order.mapInput(Order.string, (p: Product) => p.category),
  byPrice: Order.mapInput(Order.number, (p: Product) => p.price),
  byRating: Order.mapInput(Order.number, (p: Product) => p.rating),
  byReviewCount: Order.mapInput(Order.number, (p: Product) => p.reviewCount),
  byCreatedDate: Order.mapInput(Order.Date, (p: Product) => p.createdAt),
  byStockStatus: Order.mapInput(Order.boolean, (p: Product) => p.inStock),
  byFeaturedStatus: Order.mapInput(Order.boolean, (p: Product) => p.featured)
}

// Create sorting strategies for different use cases
const SortingStrategies = {
  // Default: Featured first, then by rating and review count
  default: Order.combine(
    Order.reverse(ProductOrder.byFeaturedStatus),
    Order.combine(
      Order.reverse(ProductOrder.byStockStatus),
      Order.combine(
        Order.reverse(ProductOrder.byRating),
        Order.reverse(ProductOrder.byReviewCount)
      )
    )
  ),

  // Price-focused: Stock status, then price ascending
  priceAscending: Order.combine(
    Order.reverse(ProductOrder.byStockStatus),
    ProductOrder.byPrice
  ),

  // Newest first
  newest: Order.combine(
    Order.reverse(ProductOrder.byStockStatus),
    Order.reverse(ProductOrder.byCreatedDate)
  ),

  // Category browsing
  byCategory: Order.combine(
    ProductOrder.byCategory,
    Order.combine(
      Order.reverse(ProductOrder.byStockStatus),
      Order.reverse(ProductOrder.byRating)
    )
  )
}

// Product catalog service
const makeProductCatalogService = Effect.gen(function* () {
  const sortProducts = (products: Product[], strategy: keyof typeof SortingStrategies = 'default') => {
    return Arr.sort(products, SortingStrategies[strategy])
  }

  const searchAndSort = (
    products: Product[],
    query: string,
    sortBy: keyof typeof SortingStrategies = 'default'
  ) => Effect.gen(function* () {
    // Filter products by search query
    const filtered = Arr.filter(products, (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    )
    
    // Sort filtered results
    return sortProducts(filtered, sortBy)
  })

  return { sortProducts, searchAndSort } as const
})
```

### Example 2: Task Management System with Priority Sorting

Building a task management system with complex priority-based sorting:

```typescript
import { Order, Array as Arr, Effect, Option } from "effect"

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  assigneeId: Option.Option<string>
  dueDate: Option.Option<Date>
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

// Priority mapping for consistent ordering
const priorityValue = (priority: Task['priority']): number => {
  switch (priority) {
    case 'urgent': return 4
    case 'high': return 3
    case 'medium': return 2
    case 'low': return 1
  }
}

// Status ordering (in_progress > todo > done)
const statusValue = (status: Task['status']): number => {
  switch (status) {
    case 'in_progress': return 3
    case 'todo': return 2
    case 'done': return 1
  }
}

// Define task comparators
const TaskOrder = {
  byPriority: Order.mapInput(Order.number, (task: Task) => priorityValue(task.priority)),
  byStatus: Order.mapInput(Order.number, (task: Task) => statusValue(task.status)),
  byTitle: Order.mapInput(Order.string, (task: Task) => task.title),
  byCreatedDate: Order.mapInput(Order.Date, (task: Task) => task.createdAt),
  byUpdatedDate: Order.mapInput(Order.Date, (task: Task) => task.updatedAt),
  
  // Handle optional due dates (None sorts to end)
  byDueDate: Order.mapInput(
    Order.make<Option.Option<Date>>((a, b) => {
      if (Option.isNone(a) && Option.isNone(b)) return 0
      if (Option.isNone(a)) return 1  // None sorts after Some
      if (Option.isNone(b)) return -1 // Some sorts before None
      return Order.Date(a.value, b.value)
    }),
    (task: Task) => task.dueDate
  ),
  
  // Handle optional assignees
  byAssignee: Order.mapInput(
    Order.make<Option.Option<string>>((a, b) => {
      if (Option.isNone(a) && Option.isNone(b)) return 0
      if (Option.isNone(a)) return 1
      if (Option.isNone(b)) return -1
      return Order.string(a.value, b.value)
    }),
    (task: Task) => task.assigneeId
  )
}

// Task sorting strategies
const TaskSortingStrategies = {
  // Kanban board: Status first, then priority, then due date
  kanban: Order.combine(
    Order.reverse(TaskOrder.byStatus),
    Order.combine(
      Order.reverse(TaskOrder.byPriority),
      TaskOrder.byDueDate
    )
  ),

  // Priority dashboard: Urgent tasks first, then by due date
  priority: Order.combine(
    Order.reverse(TaskOrder.byPriority),
    Order.combine(
      TaskOrder.byDueDate,
      TaskOrder.byCreatedDate
    )
  ),

  // Personal view: My tasks first, then by due date
  personal: (userId: string) => Order.combine(
    Order.mapInput(
      Order.make<boolean>((a, b) => a === b ? 0 : (a ? -1 : 1)),
      (task: Task) => Option.exists(task.assigneeId, id => id === userId)
    ),
    Order.combine(TaskOrder.byDueDate, TaskOrder.byPriority)
  ),

  // Recently updated
  recent: Order.reverse(TaskOrder.byUpdatedDate)
}

// Task management service
const makeTaskService = Effect.gen(function* () {
  const sortTasks = (
    tasks: Task[],
    strategy: keyof typeof TaskSortingStrategies | 'personal' = 'kanban',
    userId?: string
  ) => {
    const order = strategy === 'personal' && userId
      ? TaskSortingStrategies.personal(userId)
      : TaskSortingStrategies[strategy as keyof typeof TaskSortingStrategies]
    
    return Arr.sort(tasks, order)
  }

  const getTasksByPriority = (tasks: Task[], minPriority: Task['priority'] = 'low') => {
    return tasks.pipe(
      Arr.filter(task => priorityValue(task.priority) >= priorityValue(minPriority)),
      Arr.sort(TaskSortingStrategies.priority)
    )
  }

  const getOverdueTasks = (tasks: Task[]) => Effect.gen(function* () {
    const now = new Date()
    const overdue = Arr.filter(tasks, task =>
      Option.exists(task.dueDate, date => date < now) && task.status !== 'done'
    )
    
    return Arr.sort(overdue, TaskOrder.byDueDate)
  })

  return { sortTasks, getTasksByPriority, getOverdueTasks } as const
})
```

### Example 3: Financial Data Analysis with Custom Comparators

Building a financial analysis system that sorts and ranks financial instruments:

```typescript
import { Order, Array as Arr, Effect, Option } from "effect"

interface FinancialInstrument {
  symbol: string
  name: string
  type: 'stock' | 'bond' | 'etf' | 'option'
  currentPrice: number
  previousClose: number
  volume: number
  marketCap: Option.Option<number>
  peRatio: Option.Option<number>
  dividendYield: Option.Option<number>
  beta: Option.Option<number>
  sector: Option.Option<string>
  lastUpdated: Date
}

// Helper to calculate percentage change
const percentageChange = (current: number, previous: number): number =>
  ((current - previous) / previous) * 100

// Financial instrument comparators
const FinancialOrder = {
  bySymbol: Order.mapInput(Order.string, (f: FinancialInstrument) => f.symbol),
  byPrice: Order.mapInput(Order.number, (f: FinancialInstrument) => f.currentPrice),
  byVolume: Order.mapInput(Order.number, (f: FinancialInstrument) => f.volume),
  
  // Sort by price change percentage
  byPriceChange: Order.mapInput(
    Order.number,
    (f: FinancialInstrument) => percentageChange(f.currentPrice, f.previousClose)
  ),
  
  // Handle optional market cap (None sorts to end)
  byMarketCap: Order.mapInput(
    Order.make<Option.Option<number>>((a, b) => {
      if (Option.isNone(a) && Option.isNone(b)) return 0
      if (Option.isNone(a)) return 1
      if (Option.isNone(b)) return -1
      return Order.number(a.value, b.value)
    }),
    (f: FinancialInstrument) => f.marketCap
  ),
  
  // P/E ratio comparison (lower P/E might be better value)
  byPERatio: Order.mapInput(
    Order.make<Option.Option<number>>((a, b) => {
      if (Option.isNone(a) && Option.isNone(b)) return 0
      if (Option.isNone(a)) return 1
      if (Option.isNone(b)) return -1
      return Order.number(a.value, b.value)
    }),
    (f: FinancialInstrument) => f.peRatio
  ),
  
  // Dividend yield (higher is generally better)
  byDividendYield: Order.mapInput(
    Order.make<Option.Option<number>>((a, b) => {
      if (Option.isNone(a) && Option.isNone(b)) return 0
      if (Option.isNone(a)) return 1
      if (Option.isNone(b)) return -1
      return Order.number(a.value, b.value)
    }),
    (f: FinancialInstrument) => f.dividendYield
  ),
  
  bySector: Order.mapInput(
    Order.make<Option.Option<string>>((a, b) => {
      if (Option.isNone(a) && Option.isNone(b)) return 0
      if (Option.isNone(a)) return 1
      if (Option.isNone(b)) return -1
      return Order.string(a.value, b.value)
    }),
    (f: FinancialInstrument) => f.sector
  ),
  
  byLastUpdated: Order.mapInput(Order.Date, (f: FinancialInstrument) => f.lastUpdated)
}

// Financial screening strategies
const ScreeningStrategies = {
  // Top gainers: Highest price change first
  topGainers: Order.reverse(FinancialOrder.byPriceChange),
  
  // Top losers: Lowest price change first
  topLosers: FinancialOrder.byPriceChange,
  
  // Most active: Highest volume first
  mostActive: Order.reverse(FinancialOrder.byVolume),
  
  // Value stocks: Low P/E, high dividend yield
  valueStocks: Order.combine(
    FinancialOrder.byPERatio,           // Lower P/E first
    Order.reverse(FinancialOrder.byDividendYield)  // Higher dividend yield first
  ),
  
  // Large cap growth: High market cap, high price change
  largeCap: Order.combine(
    Order.reverse(FinancialOrder.byMarketCap),
    Order.reverse(FinancialOrder.byPriceChange)
  ),
  
  // Sector analysis: Group by sector, then by market cap
  bySector: Order.combine(
    FinancialOrder.bySector,
    Order.reverse(FinancialOrder.byMarketCap)
  )
}

// Financial analysis service
const makeFinancialAnalysisService = Effect.gen(function* () {
  const screenInstruments = (
    instruments: FinancialInstrument[],
    strategy: keyof typeof ScreeningStrategies
  ) => {
    return Arr.sort(instruments, ScreeningStrategies[strategy])
  }

  const findTopPerformers = (instruments: FinancialInstrument[], count: number = 10) => {
    return instruments.pipe(
      Arr.sort(ScreeningStrategies.topGainers),
      Arr.take(count)
    )
  }

  const analyzeByMinChange = (instruments: FinancialInstrument[], minChange: number) => Effect.gen(function* () {
    const filtered = Arr.filter(instruments, f => 
      percentageChange(f.currentPrice, f.previousClose) >= minChange
    )
    
    return Arr.sort(filtered, ScreeningStrategies.topGainers)
  })

  const clampPrice = Order.clamp(Order.number)
  const isPriceInRange = Order.between(Order.number)
  
  const filterByPriceRange = (
    instruments: FinancialInstrument[],
    minPrice: number,
    maxPrice: number
  ) => {
    return Arr.filter(instruments, f => 
      isPriceInRange(f.currentPrice, { minimum: minPrice, maximum: maxPrice })
    )
  }

  return {
    screenInstruments,
    findTopPerformers,
    analyzeByMinChange,
    filterByPriceRange,
    clampPrice
  } as const
})
```

## Advanced Features Deep Dive

### Feature 1: Struct and Tuple Orders

Struct and tuple orders allow you to create comparators for complex data structures by combining multiple field comparisons:

#### Basic Struct Usage

```typescript
import { Order } from "effect"

interface Person {
  firstName: string
  lastName: string
  age: number
}

// Create a struct order that compares multiple fields
const personOrder = Order.struct({
  lastName: Order.string,
  firstName: Order.string,
  age: Order.number
})

const people = [
  { firstName: "John", lastName: "Doe", age: 30 },
  { firstName: "Jane", lastName: "Doe", age: 28 },
  { firstName: "Bob", lastName: "Smith", age: 35 }
]

// Sort by last name, then first name, then age
const sorted = Arr.sort(people, personOrder)
```

#### Advanced Struct with Custom Logic

```typescript
interface Employee {
  department: string
  level: 'junior' | 'mid' | 'senior' | 'lead'
  salary: number
  yearsExperience: number
  performanceRating: number
}

const levelValue = (level: Employee['level']): number => {
  switch (level) {
    case 'junior': return 1
    case 'mid': return 2
    case 'senior': return 3
    case 'lead': return 4
  }
}

// Complex employee ordering with custom level mapping
const employeeOrder = Order.struct({
  department: Order.string,
  level: Order.mapInput(Order.number, levelValue),
  performanceRating: Order.reverse(Order.number), // Higher rating first
  yearsExperience: Order.reverse(Order.number),   // More experience first
  salary: Order.reverse(Order.number)             // Higher salary first
})
```

#### Tuple Orders for Paired Data

```typescript
type PricePoint = readonly [Date, number] // [timestamp, price]
type Coordinate = readonly [number, number] // [x, y]

// Order price points by timestamp
const pricePointOrder = Order.tuple(Order.Date, Order.number)

// Order coordinates by distance from origin
const coordinateOrder = Order.mapInput(
  Order.number,
  ([x, y]: Coordinate) => Math.sqrt(x * x + y * y)
)

const priceHistory: PricePoint[] = [
  [new Date('2024-01-01'), 100],
  [new Date('2024-01-02'), 105],
  [new Date('2024-01-03'), 95]
]

const sortedPrices = Arr.sort(priceHistory, pricePointOrder)
```

### Feature 2: Array and Collection Ordering

Order provides sophisticated tools for ordering arrays and collections of data:

#### Array Ordering with Element Comparison

```typescript
// Order arrays by comparing each element
const numberArrayOrder = Order.array(Order.number)

const arrays = [
  [1, 3, 5],
  [1, 2, 6],
  [1, 3, 4],
  [2, 1, 1]
]

// Arrays are compared element by element, then by length
const sortedArrays = Arr.sort(arrays, numberArrayOrder)
// Result: [[1, 2, 6], [1, 3, 4], [1, 3, 5], [2, 1, 1]]
```

#### Product and ProductMany for Combining Orders

```typescript
// Product combines exactly two orders
const nameAgeOrder = Order.product(
  Order.mapInput(Order.string, (p: Person) => p.firstName),
  Order.mapInput(Order.number, (p: Person) => p.age)
)

// ProductMany combines multiple orders
const multiFieldOrder = Order.productMany(
  Order.mapInput(Order.string, (p: Person) => p.lastName),
  [
    Order.mapInput(Order.string, (p: Person) => p.firstName),
    Order.mapInput(Order.number, (p: Person) => p.age)
  ]
)
```

### Feature 3: Advanced Combining Strategies

Complex combining strategies for sophisticated sorting requirements:

#### Combine vs CombineMany vs CombineAll

```typescript
// Combine: Exactly two orders
const basicCombine = Order.combine(firstOrder, secondOrder)

// CombineMany: One primary + array of additional orders
const manyCombine = Order.combineMany(primaryOrder, [order1, order2, order3])

// CombineAll: Array of orders with no primary
const allCombine = Order.combineAll([order1, order2, order3])

// Real-world usage pattern
const createSortingPipeline = <T>(
  primaryOrder: Order.Order<T>,
  secondaryOrders: Array<Order.Order<T>> = []
) => {
  return secondaryOrders.length > 0
    ? Order.combineMany(primaryOrder, secondaryOrders)
    : primaryOrder
}
```

#### Conditional Order Selection

```typescript
interface SortableItem {
  id: string
  category: string
  priority: number
  timestamp: Date
}

// Helper to create conditional orders
const createConditionalOrder = <T>(
  condition: (item: T) => boolean,
  trueOrder: Order.Order<T>,
  falseOrder: Order.Order<T>
): Order.Order<T> => {
  return Order.make((a, b) => {
    const aCondition = condition(a)
    const bCondition = condition(b)
    
    if (aCondition && !bCondition) return -1
    if (!aCondition && bCondition) return 1
    
    return aCondition ? trueOrder(a, b) : falseOrder(a, b)
  })
}

// Usage: High priority items get different sorting
const priorityBasedOrder = createConditionalOrder(
  (item: SortableItem) => item.priority > 5,
  Order.mapInput(Order.Date, (item: SortableItem) => item.timestamp), // High priority by time
  Order.mapInput(Order.string, (item: SortableItem) => item.category)  // Low priority by category
)
```

## Practical Patterns & Best Practices

### Pattern 1: Reusable Order Factories

Create factory functions for commonly used ordering patterns:

```typescript
// Generic factory for optional field ordering
const optionalFieldOrder = <T, U>(
  baseOrder: Order.Order<U>,
  extractor: (item: T) => Option.Option<U>,
  nullsLast: boolean = true
): Order.Order<T> => {
  return Order.mapInput(
    Order.make<Option.Option<U>>((a, b) => {
      if (Option.isNone(a) && Option.isNone(b)) return 0
      if (Option.isNone(a)) return nullsLast ? 1 : -1
      if (Option.isNone(b)) return nullsLast ? -1 : 1
      return baseOrder(a.value, b.value)
    }),
    extractor
  )
}

// Factory for enum-based ordering
const enumOrder = <T extends string>(
  enumValues: readonly T[],
  getValue: <U>(item: U) => T
): Order.Order<{ [K in keyof any]: any }> => {
  const valueMap = new Map(enumValues.map((value, index) => [value, index]))
  return Order.mapInput(
    Order.number,
    (item) => valueMap.get(getValue(item)) ?? enumValues.length
  )
}

// Usage examples
interface Task {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: Option.Option<string>
  dueDate: Option.Option<Date>
}

const priorityOrder = enumOrder(
  ['low', 'medium', 'high', 'urgent'] as const,
  (task: Task) => task.priority
)

const dueDateOrder = optionalFieldOrder(
  Order.Date,
  (task: Task) => task.dueDate,
  false // Due dates first
)
```

### Pattern 2: Caching and Performance Optimization

For expensive comparisons, implement caching strategies:

```typescript
// Memoized order for expensive computations
const memoizedOrder = <T, U>(
  baseOrder: Order.Order<U>,
  extractor: (item: T) => U,
  keyExtractor: (item: T) => string = (item) => JSON.stringify(item)
): Order.Order<T> => {
  const cache = new Map<string, U>()
  
  const cachedExtractor = (item: T): U => {
    const key = keyExtractor(item)
    if (!cache.has(key)) {
      cache.set(key, extractor(item))
    }
    return cache.get(key)!
  }
  
  return Order.mapInput(baseOrder, cachedExtractor)
}

// Performance-optimized complex calculation
interface PerformanceMetric {
  id: string
  values: number[]
  metadata: Record<string, any>
}

const expensiveCalculation = (metric: PerformanceMetric): number => {
  // Simulate expensive computation
  return metric.values.reduce((sum, val, idx) => 
    sum + Math.pow(val, 2) * Math.log(idx + 1), 0
  )
}

const optimizedOrder = memoizedOrder(
  Order.number,
  expensiveCalculation,
  (metric) => metric.id // Use ID as cache key
)
```

### Pattern 3: Dynamic Order Configuration

Build systems that allow runtime order configuration:

```typescript
interface OrderConfig<T> {
  field: keyof T
  direction: 'asc' | 'desc'
  type: 'string' | 'number' | 'date' | 'boolean'
}

// Dynamic order builder
const buildDynamicOrder = <T extends Record<string, any>>(
  configs: OrderConfig<T>[]
): Order.Order<T> => {
  const orders = configs.map(config => {
    let baseOrder: Order.Order<any>
    
    switch (config.type) {
      case 'string':
        baseOrder = Order.string
        break
      case 'number':
        baseOrder = Order.number
        break
      case 'date':
        baseOrder = Order.Date
        break
      case 'boolean':
        baseOrder = Order.boolean
        break
      default:
        baseOrder = Order.string
    }
    
    const fieldOrder = Order.mapInput(baseOrder, (item: T) => item[config.field])
    
    return config.direction === 'desc' ? Order.reverse(fieldOrder) : fieldOrder
  })
  
  return Order.combineAll(orders)
}

// Usage with user-defined sorting preferences
interface UserPreferences {
  defaultSort: OrderConfig<Product>[]
}

const createUserSortedCatalog = (
  products: Product[],
  preferences: UserPreferences
) => Effect.gen(function* () {
  const userOrder = buildDynamicOrder(preferences.defaultSort)
  return Arr.sort(products, userOrder)
})
```

### Pattern 4: Order Validation and Testing

Ensure your orders work correctly with validation helpers:

```typescript
// Test if an order is consistent
const validateOrder = <T>(
  order: Order.Order<T>,
  items: T[]
): Effect.Effect<boolean, never> => Effect.gen(function* () {
  // Test transitivity: if a <= b and b <= c, then a <= c
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      for (let k = j + 1; k < items.length; k++) {
        const ab = order(items[i], items[j])
        const bc = order(items[j], items[k])
        const ac = order(items[i], items[k])
        
        if (ab <= 0 && bc <= 0 && ac > 0) {
          return false // Transitivity violation
        }
      }
    }
  }
  
  return true
})

// Verify order stability
const isStableSort = <T>(
  order: Order.Order<T>,
  items: T[],
  keyFn: (item: T) => string
): boolean => {
  const sorted = Arr.sort(items, order)
  
  // Check if equal items maintain relative order
  for (let i = 0; i < sorted.length - 1; i++) {
    if (order(sorted[i], sorted[i + 1]) === 0) {
      const originalIndexA = items.findIndex(item => keyFn(item) === keyFn(sorted[i]))
      const originalIndexB = items.findIndex(item => keyFn(item) === keyFn(sorted[i + 1]))
      
      if (originalIndexA > originalIndexB) {
        return false // Stability violation
      }
    }
  }
  
  return true
}
```

## Integration Examples

### Integration with React for Dynamic Table Sorting

```typescript
import { Order, Array as Arr } from "effect"
import { useState, useMemo } from "react"

interface TableColumn<T> {
  key: keyof T
  label: string
  sortable: boolean
  orderType: 'string' | 'number' | 'date'
}

interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
}

const useSortableTable = <T extends Record<string, any>>(
  data: T[],
  columns: TableColumn<T>[]
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null)
  
  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    
    const column = columns.find(col => col.key === sortConfig.key)
    if (!column) return data
    
    let baseOrder: Order.Order<any>
    switch (column.orderType) {
      case 'number':
        baseOrder = Order.number
        break
      case 'date':
        baseOrder = Order.Date
        break
      default:
        baseOrder = Order.string
    }
    
    const fieldOrder = Order.mapInput(baseOrder, (item: T) => item[sortConfig.key])
    const order = sortConfig.direction === 'desc' ? Order.reverse(fieldOrder) : fieldOrder
    
    return Arr.sort(data, order)
  }, [data, sortConfig, columns])
  
  const handleSort = (key: keyof T) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }
  
  return { sortedData, sortConfig, handleSort }
}

// Usage in a React component
const DataTable = <T extends Record<string, any>>({
  data,
  columns
}: {
  data: T[]
  columns: TableColumn<T>[]
}) => {
  const { sortedData, sortConfig, handleSort } = useSortableTable(data, columns)
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th
              key={String(column.key)}
              onClick={() => column.sortable && handleSort(column.key)}
              style={{ cursor: column.sortable ? 'pointer' : 'default' }}
            >
              {column.label}
              {sortConfig?.key === column.key && (
                <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={index}>
            {columns.map(column => (
              <td key={String(column.key)}>
                {String(row[column.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Integration with Database Queries

```typescript
import { Order, Effect, Array as Arr } from "effect"
import { Database } from "./database" // Hypothetical database service

interface QueryBuilder<T> {
  table: string
  where?: Record<string, any>
  order?: Order.Order<T>
  limit?: number
  offset?: number
}

const makeQueryService = Effect.gen(function* () {
  const db = yield* Database
  
  // Convert Order to SQL ORDER BY clause
  const orderToSQL = <T>(order: Order.Order<T>, sampleData: T[]): string => {
    if (sampleData.length < 2) return ""
    
    // Analyze the order by comparing sample data
    const sorted = Arr.sort(sampleData, order)
    
    // This is a simplified example - real implementation would be more sophisticated
    const fields = Object.keys(sampleData[0])
    const orderClauses: string[] = []
    
    for (const field of fields) {
      const originalValues = sampleData.map(item => (item as any)[field])
      const sortedValues = sorted.map(item => (item as any)[field])
      
      if (JSON.stringify(originalValues) !== JSON.stringify(sortedValues)) {
        // Field affects ordering
        const ascending = sortedValues[0] <= sortedValues[sortedValues.length - 1]
        orderClauses.push(`${field} ${ascending ? 'ASC' : 'DESC'}`)
      }
    }
    
    return orderClauses.length > 0 ? `ORDER BY ${orderClauses.join(', ')}` : ""
  }
  
  const executeQuery = <T>(builder: QueryBuilder<T>) => Effect.gen(function* () {
    let sql = `SELECT * FROM ${builder.table}`
    
    if (builder.where) {
      const whereClause = Object.entries(builder.where)
        .map(([key, value]) => `${key} = ?`)
        .join(' AND ')
      sql += ` WHERE ${whereClause}`
    }
    
    if (builder.order) {
      // Get sample data to analyze order
      const sampleResult = yield* db.query<T>(`${sql} LIMIT 100`)
      const orderSQL = orderToSQL(builder.order, sampleResult)
      if (orderSQL) {
        sql += ` ${orderSQL}`
      }
    }
    
    if (builder.limit) {
      sql += ` LIMIT ${builder.limit}`
    }
    
    if (builder.offset) {
      sql += ` OFFSET ${builder.offset}`
    }
    
    return yield* db.query<T>(sql)
  })
  
  return { executeQuery } as const
})

// Usage with type-safe queries
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

const getUsersSorted = (sortBy: 'name' | 'email' | 'createdAt') => Effect.gen(function* () {
  const queryService = yield* makeQueryService
  
  const userOrder = (() => {
    switch (sortBy) {
      case 'name':
        return Order.mapInput(Order.string, (u: User) => u.name)
      case 'email':
        return Order.mapInput(Order.string, (u: User) => u.email)
      case 'createdAt':
        return Order.mapInput(Order.Date, (u: User) => u.createdAt)
    }
  })()
  
  return yield* queryService.executeQuery<User>({
    table: 'users',
    order: userOrder,
    limit: 50
  })
})
```

### Testing Strategies

```typescript
import { describe, it, expect } from "bun:test"
import { Order, Array as Arr, fc } from "effect"

// Property-based testing for Order laws
describe("Order Properties", () => {
  const arbitraryUser = fc.record({
    name: fc.string(),
    age: fc.integer({ min: 0, max: 100 }),
    email: fc.string()
  })
  
  const userOrder = Order.struct({
    name: Order.string,
    age: Order.number,
    email: Order.string
  })
  
  it("should satisfy reflexivity", () => {
    fc.assert(fc.property(arbitraryUser, (user) => {
      expect(userOrder(user, user)).toBe(0)
    }))
  })
  
  it("should satisfy antisymmetry", () => {
    fc.assert(fc.property(arbitraryUser, arbitraryUser, (userA, userB) => {
      const ab = userOrder(userA, userB)
      const ba = userOrder(userB, userA)
      
      if (ab === 0) {
        expect(ba).toBe(0)
      } else {
        expect(ab).toBe(-ba)
      }
    }))
  })
  
  it("should satisfy transitivity", () => {
    fc.assert(fc.property(
      arbitraryUser,
      arbitraryUser,
      arbitraryUser,
      (userA, userB, userC) => {
        const ab = userOrder(userA, userB)
        const bc = userOrder(userB, userC)
        const ac = userOrder(userA, userC)
        
        if (ab <= 0 && bc <= 0) {
          expect(ac).toBeLessThanOrEqual(0)
        }
        if (ab >= 0 && bc >= 0) {
          expect(ac).toBeGreaterThanOrEqual(0)
        }
      }
    ))
  })
  
  it("should produce stable sorts", () => {
    const users = [
      { name: "Alice", age: 25, email: "alice@example.com" },
      { name: "Bob", age: 25, email: "bob@example.com" },
      { name: "Alice", age: 30, email: "alice2@example.com" }
    ]
    
    const ageOrder = Order.mapInput(Order.number, (u: typeof users[0]) => u.age)
    const sorted = Arr.sort(users, ageOrder)
    
    // Equal age items should maintain relative order
    const age25Users = sorted.filter(u => u.age === 25)
    expect(age25Users[0].email).toBe("alice@example.com")
    expect(age25Users[1].email).toBe("bob@example.com")
  })
})

// Integration testing patterns
describe("Order Integration", () => {
  it("should work with complex data transformations", () => {
    interface Sale {
      id: string
      amount: number
      date: Date
      customerId: string
    }
    
    const sales: Sale[] = [
      { id: "1", amount: 100, date: new Date("2024-01-01"), customerId: "A" },
      { id: "2", amount: 200, date: new Date("2024-01-02"), customerId: "B" },
      { id: "3", amount: 150, date: new Date("2024-01-01"), customerId: "A" }
    ]
    
    // Complex multi-field sort
    const salesOrder = Order.combine(
      Order.mapInput(Order.Date, (s: Sale) => s.date),
      Order.combine(
        Order.mapInput(Order.string, (s: Sale) => s.customerId),
        Order.mapInput(Order.reverse(Order.number), (s: Sale) => s.amount)
      )
    )
    
    const sorted = Arr.sort(sales, salesOrder)
    
    // Verify correct ordering
    expect(sorted[0].id).toBe("3") // 2024-01-01, Customer A, $150
    expect(sorted[1].id).toBe("1") // 2024-01-01, Customer A, $100
    expect(sorted[2].id).toBe("2") // 2024-01-02, Customer B, $200
  })
})
```

## Conclusion

Order provides composable, type-safe comparison operations for Effect applications. It enables complex sorting logic through simple, reusable building blocks that can be combined and transformed as needed.

Key benefits:
- **Composability**: Build complex sorting strategies from simple comparators
- **Type Safety**: Compile-time guarantees prevent comparison errors
- **Reusability**: Define once, use everywhere approach to sorting logic
- **Performance**: Efficient comparison operations with built-in optimizations

Order is essential when you need flexible, maintainable sorting and comparison operations that scale with your application's complexity while maintaining type safety and code clarity.