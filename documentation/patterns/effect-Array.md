# Array: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Array Solves

Working with arrays in JavaScript often leads to mutation bugs, null/undefined crashes, and verbose error-prone transformations. Traditional imperative array operations are scattered, not composable, and lack proper type safety:

```typescript
// Traditional approach - data processing pipeline with mutation and unsafe operations
function processUserData(users: User[]): ProcessedUser[] {
  const results: ProcessedUser[] = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    // Mutation-based filtering
    if (user.isActive && user.age >= 18) {
      // Null/undefined crashes waiting to happen
      const fullName = user.firstName + " " + user.lastName;
      
      // Manual error handling for each transformation
      try {
        const processedUser = {
          id: user.id,
          fullName,
          email: user.email.toLowerCase(),
          totalSpent: calculateTotalSpent(user.orders), // Might throw
          category: getCategoryFromAge(user.age) // Might return null
        };
        
        if (processedUser.category) {
          results.push(processedUser);
        }
      } catch (error) {
        console.error(`Failed to process user ${user.id}:`, error);
        // What do we do with failures? Skip? Throw? Log and continue?
      }
    }
  }
  
  // Sorting with potential null reference errors
  results.sort((a, b) => {
    if (!a.totalSpent || !b.totalSpent) return 0;
    return b.totalSpent - a.totalSpent;
  });
  
  return results;
}
```

This approach leads to:
- **Mutation Bugs** - Arrays modified in-place causing side effects
- **Unsafe Operations** - Array access without bounds checking, leading to undefined errors
- **Verbose Error Handling** - Manual try-catch blocks for each transformation
- **Poor Composability** - Operations scattered across imperative loops
- **Type Safety Issues** - No guarantee about array contents or structure

### The Array Solution

Effect's Array module provides a functional, type-safe, and composable approach to array operations, integrating seamlessly with Option and Either for safe transformations:

```typescript
import { Array as Arr, Option, pipe } from "effect"

// The Effect solution - functional, type-safe, composable
const processUserData = (users: readonly User[]) =>
  Effect.gen(function* () {
    const activeUsers = yield* Effect.succeed(
      users.filter(user => user.isActive && user.age >= 18)
    )
    
    const processedUsers = yield* Effect.all(
      activeUsers.map(user => Effect.gen(function* () {
        const fullName = `${user.firstName} ${user.lastName}`
        const totalSpent = yield* Effect.succeed(calculateTotalSpentSafe(user.orders))
        const category = yield* Effect.succeed(getCategoryFromAge(user.age))
        
        if (!totalSpent || !category) {
          return yield* Effect.fail("Missing required data")
        }
        
        return {
          id: user.id,
          fullName,
          email: user.email.toLowerCase(),
          totalSpent,
          category
        }
      }))
    ).pipe(
      Effect.map(results => results.filter(result => result !== null)),
      Effect.catchAll(() => Effect.succeed([]))
    )
    
    return processedUsers.sort((a, b) => b.totalSpent - a.totalSpent)
  })
```

### Key Concepts

**Immutability**: All operations return new arrays, preserving original data and preventing side effects.

**Type Safety**: Functions maintain type information throughout transformations, preventing runtime errors.

**Composability**: Operations chain together using `pipe`, creating readable transformation pipelines.

**Safe Operations**: Integration with Option and Either handles null/undefined and error cases gracefully.

## Basic Usage Patterns

### Pattern 1: Safe Array Creation and Access

```typescript
import { Array as Arr, Option } from "effect"

// Creating arrays safely
const numbers = Arr.range(1, 10) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const repeated = Arr.replicate(5, "hello") // ["hello", "hello", "hello", "hello", "hello"]
const generated = Arr.makeBy(3, i => i * 2) // [0, 2, 4]

// Safe array access - no index out of bounds errors
const items = ["apple", "banana", "cherry"]

// Traditional approach - can crash
// const first = items[0] // undefined if empty
// const tenth = items[10] // undefined, but we don't know

// Safe approach - explicit Option handling
const first = Arr.head(items) // Option.some("apple")
const last = Arr.last(items) // Option.some("cherry")
const tenth = Arr.get(items, 10) // Option.none()

// Safe extraction with defaults
const firstItem = Option.getOrElse(Arr.head(items), () => "No items")
const lastItem = Option.getOrElse(Arr.last(items), () => "No items")
```

### Pattern 2: Functional Transformations

```typescript
import { Array as Arr, pipe } from "effect"

// Chaining transformations functionally
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const result = pipe(
  Arr.filter(numbers, n => n % 2 === 0), // [2, 4, 6, 8, 10]
  Arr.map(n => n * n), // [4, 16, 36, 64, 100]  
  Arr.take(3) // [4, 16, 36]
)

// Functional approach vs imperative
// Traditional: multiple loops, mutation
const traditionalResult = []
for (const n of numbers) {
  if (n % 2 === 0) {
    const squared = n * n
    traditionalResult.push(squared)
    if (traditionalResult.length >= 3) break
  }
}

// Effect: single pipeline, immutable
const effectResult = pipe(
  Arr.filter(numbers, n => n % 2 === 0),
  Arr.map(n => n * n),
  Arr.take(3)
)
```

### Pattern 3: Safe Reductions and Aggregations

```typescript
import { Array as Arr, Option, pipe } from "effect"

// Safe reductions that handle empty arrays
const numbers = [1, 2, 3, 4, 5]
const emptyArray: number[] = []

// Traditional approach - can crash on empty arrays
// const sum = numbers.reduce((a, b) => a + b) // Works
// const sumEmpty = emptyArr.reduce((a, b) => a + b) // Throws!

// Safe reductions with initial values
const sum = Arr.reduce(numbers, 0, (acc, n) => acc + n) // 15
const sumEmpty = Arr.reduce(emptyArray, 0, (acc, n) => acc + n) // 0

// Finding min/max safely
const min = Arr.min(numbers) // Option.some(1)
const max = Arr.max(numbers) // Option.some(5)
const minEmpty = Arr.min(emptyArray) // Option.none()

// Complex aggregations
const products = [
  { name: "Laptop", price: 999, category: "electronics" },
  { name: "Book", price: 25, category: "books" },
  { name: "Phone", price: 599, category: "electronics" }
]

const totalValue = pipe(
  Arr.reduce(products, 0, (total, product) => total + product.price)
) // 1623

const expensiveItems = pipe(
  Arr.filter(products, p => p.price > 100),
  Arr.length
) // 2
```

## Real-World Examples

### Example 1: E-commerce Cart Operations

Managing shopping cart operations safely with proper error handling and type safety:

```typescript
import { Array as Arr, Option, Either, pipe } from "effect"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  inStock: boolean
}

interface CartSummary {
  items: CartItem[]
  totalItems: number
  subtotal: number
  tax: number
  total: number
  availableItems: CartItem[]
  unavailableItems: CartItem[]
}

// Safe cart operations
class ShoppingCart {
  // Add item to cart, handling duplicates
  static addItem = (cart: readonly CartItem[], newItem: CartItem): Effect.Effect<CartItem[]> =>
    Effect.gen(function* () {
      const existingIndex = cart.findIndex(item => item.productId === newItem.productId)
      
      if (existingIndex >= 0) {
        const existing = cart[existingIndex]
        const updated = {
          ...existing,
          quantity: existing.quantity + newItem.quantity
        }
        return [
          ...cart.slice(0, existingIndex),
          updated,
          ...cart.slice(existingIndex + 1)
        ]
      }
      
      return [...cart, newItem]
    })

  // Remove item safely
  static removeItem = (cart: readonly CartItem[], productId: string): CartItem[] =>
    Arr.filter(cart, item => item.productId !== productId)

  // Update quantity with validation
  static updateQuantity = (
    cart: readonly CartItem[], 
    productId: string, 
    newQuantity: number
  ): Option.Option<CartItem[]> => {
    if (newQuantity <= 0) return Option.none()
    
    const itemIndex = Arr.findFirstIndex(cart, item => item.productId === productId)
    
    return pipe(
      Option.flatMap(itemIndex, index =>
        Arr.modifyOption(cart, index, item => ({
          ...item,
          quantity: newQuantity
        }))
      )
    )
  }

  // Calculate cart summary with validation
  static calculateSummary = (cart: readonly CartItem[]): Effect.Effect<CartSummary, string> =>
    Effect.gen(function* () {
      const availableItems = cart.filter(item => item.inStock && item.quantity > 0)
      const unavailableItems = cart.filter(item => !item.inStock || item.quantity <= 0)
      
      if (availableItems.length === 0) {
        return yield* Effect.fail("Cart has no available items")
      }

      const subtotal = availableItems.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      )
      
      const totalItems = availableItems.reduce(
        (total, item) => total + item.quantity,
        0
      )
      
      const tax = subtotal * 0.08 // 8% tax
      const total = subtotal + tax

      return {
        items: availableItems,
        totalItems,
        subtotal,
        tax,
        total,
        availableItems,
        unavailableItems
      }
    })

  // Apply discount codes
  static applyDiscount = (
    items: readonly CartItem[],
    discountCode: string
  ): Either.Either<CartItem[], string> => {
    const discountRules: Record<string, (item: CartItem) => CartItem> = {
      "ELECTRONICS20": (item) => 
        item.name.toLowerCase().includes("electronics") 
          ? { ...item, price: item.price * 0.8 }
          : item,
      "BULK10": (item) => 
        item.quantity >= 5 
          ? { ...item, price: item.price * 0.9 }
          : item
    }

    const discountFn = discountRules[discountCode]
    if (!discountFn) {
      return Either.left(`Invalid discount code: ${discountCode}`)
    }

    return Either.right(Arr.map(discountFn)(items))
  }
}

// Usage example
const cart: CartItem[] = [
  { id: "1", productId: "laptop", name: "Gaming Laptop", price: 1200, quantity: 1, inStock: true },
  { id: "2", productId: "mouse", name: "Wireless Mouse", price: 50, quantity: 2, inStock: true },
  { id: "3", productId: "keyboard", name: "Mechanical Keyboard", price: 150, quantity: 1, inStock: false }
]

// Safe cart operations
const updatedCart = ShoppingCart.addItem(cart, {
  id: "4", 
  productId: "monitor", 
  name: "4K Monitor", 
  price: 400, 
  quantity: 1, 
  inStock: true
})

const summary = ShoppingCart.calculateSummary(updatedCart)
pipe(
  Either.map(summary, s => console.log(`Total: $${s.total.toFixed(2)}, Items: ${s.totalItems}`)),
  Either.mapLeft(error => console.error(`Cart error: ${error}`))
)
```

### Example 2: Data Processing Pipeline

Processing large datasets with validation, transformation, and error handling:

```typescript
import { Array as Arr, Option, Either, pipe } from "effect"

interface RawUserData {
  id: string
  name: string
  email: string
  age: string // Note: string from CSV
  registrationDate: string
  purchaseHistory: string // JSON string
  status: string
}

interface ProcessedUser {
  id: string
  name: string
  email: string
  age: number
  registrationDate: Date
  totalSpent: number
  purchaseCount: number
  category: "new" | "regular" | "vip"
  isActive: boolean
}

interface DataProcessingResult {
  processed: ProcessedUser[]
  errors: Array<{ id: string; error: string }>
  stats: {
    total: number
    processed: number
    failed: number
    categories: Record<string, number>
  }
}

// Validation functions
const validateEmail = (email: string): Either.Either<string, string> =>
  email.includes("@") && email.includes(".")
    ? Either.right(email)
    : Either.left("Invalid email format")

const parseAge = (ageStr: string): Either.Either<number, string> => {
  const age = parseInt(ageStr, 10)
  return isNaN(age) || age < 0 || age > 120
    ? Either.left("Invalid age")
    : Either.right(age)
}

const parsePurchaseHistory = (historyStr: string): Either.Either<number[], string> => {
  try {
    const purchases = JSON.parse(historyStr)
    return Arr.isArray(purchases) && Arr.every(purchases, (p): p is number => typeof p === "number")
      ? Either.right(purchases)
      : Either.left("Invalid purchase history format")
  } catch {
    return Either.left("Invalid JSON in purchase history")
  }
}

const categorizeUser = (totalSpent: number, purchaseCount: number): "new" | "regular" | "vip" => {
  if (purchaseCount === 0) return "new"
  if (totalSpent > 10000 || purchaseCount > 50) return "vip"
  return "regular"
}

// Data processing pipeline
const processUserData = (rawData: readonly RawUserData[]): DataProcessingResult => {
  const results = pipe(
    Arr.map(rawData, user => {
      const processed = pipe(
        validateEmail(user.email),
        Either.flatMap(email =>
          pipe(
            parseAge(user.age),
            Either.flatMap(age =>
              pipe(
                parsePurchaseHistory(user.purchaseHistory),
                Either.flatMap(purchaseHistory => {
                  const date = new Date(user.registrationDate)
                  const registrationDate = isNaN(date.getTime()) 
                    ? Either.left("Invalid registration date")
                    : Either.right(date)
                  
                  return pipe(
                    registrationDate,
                    Either.map(registrationDate => ({ email, age, purchaseHistory, registrationDate }))
                  )
                })
              )
            )
          )
        ),
        Either.map(({ email, age, purchaseHistory, registrationDate }) => {
          const totalSpent = Arr.reduce(purchaseHistory, 0, (sum, amount) => sum + amount)
          const purchaseCount = purchaseHistory.length
          
          return {
            id: user.id,
            name: user.name.trim(),
            email: email.toLowerCase(),
            age,
            registrationDate,
            totalSpent,
            purchaseCount,
            category: categorizeUser(totalSpent, purchaseCount),
            isActive: user.status.toLowerCase() === "active"
          } satisfies ProcessedUser
        })
      )

      return { id: user.id, result: processed }
    })
  )

  const processed = pipe(
    Arr.filterMap(results, ({ result }) => Either.getRight(result))
  )

  const errors = pipe(
    Arr.filterMap(results, ({ id, result }) => 
      pipe(
        Either.getLeft(result),
        Option.map(error => ({ id, error }))
      )
    )
  )

  const categoryStats = pipe(
    processed,
    Arr.groupBy(user => user.category),
    (groups) => Object.fromEntries(
      Object.entries(groups).map(([category, users]) => [category, users.length])
    )
  )

  return {
    processed,
    errors,
    stats: {
      total: rawData.length,
      processed: processed.length,
      failed: errors.length,
      categories: categoryStats
    }
  }
}

// Usage with sample data
const rawUsers: RawUserData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    age: "30",
    registrationDate: "2023-01-15",
    purchaseHistory: "[100, 250, 75]",
    status: "active"
  },
  {
    id: "2", 
    name: "Jane Smith",
    email: "invalid-email",
    age: "25",
    registrationDate: "2023-02-20",
    purchaseHistory: "[500, 1200]",
    status: "active"
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com", 
    age: "abc", // Invalid age
    registrationDate: "2023-03-10",
    purchaseHistory: "[50]",
    status: "inactive"
  }
]

const result = processUserData(rawUsers)
console.log(`Processed: ${result.stats.processed}/${result.stats.total}`)
console.log(`Errors: ${result.stats.failed}`)
console.log("Category distribution:", result.stats.categories)

// Display errors for debugging
Arr.forEach(result.errors, ({ id, error }) => 
  console.log(`User ${id}: ${error}`)
)
```

### Example 3: Analytics and Reporting

Creating comprehensive analytics reports with grouping, aggregation, and statistical calculations:

```typescript
import { Array, Option, pipe } from "effect"

interface SalesRecord {
  id: string
  date: Date
  product: string
  category: string
  revenue: number
  units: number
  region: string
  salesPerson: string
}

interface AnalyticsReport {
  totalRevenue: number
  totalUnits: number
  averageOrderValue: number
  topProducts: Array<{ product: string; revenue: number; units: number }>
  revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>
  revenueByRegion: Array<{ region: string; revenue: number; growth?: number }>
  salesPersonPerformance: Array<{ salesPerson: string; revenue: number; orders: number }>
  monthlyTrends: Array<{ month: string; revenue: number; units: number }>
}

// Helper functions for analytics
const groupByProperty = <T, K extends keyof T>(
  data: readonly T[], 
  key: K
): Record<string, T[]> => 
  pipe(
    data,
    Arr.groupBy(item => String(item[key]))
  )

const calculatePercentages = (
  items: Array<{ value: number }>, 
  total: number
): Array<{ value: number; percentage: number }> =>
  Arr.map(items, item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }))

const getTopN = <T>(
  items: readonly T[], 
  getValue: (item: T) => number, 
  n: number
): T[] =>
  pipe(
    items,
    Arr.sortBy(getValue),
    Arr.reverse,
    Arr.take(n)
  )

// Analytics calculation functions
class AnalyticsEngine {
  // Calculate basic metrics
  static calculateBasicMetrics = (sales: readonly SalesRecord[]) => {
    const totalRevenue = Arr.reduce(sales, 0, (sum, sale) => sum + sale.revenue)
    const totalUnits = Arr.reduce(sales, 0, (sum, sale) => sum + sale.units)
    const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0

    return { totalRevenue, totalUnits, averageOrderValue }
  }

  // Product performance analysis
  static analyzeProducts = (sales: readonly SalesRecord[]) => {
    const productSales = pipe(
      sales,
      Arr.groupBy(sale => sale.product),
      (groups) => Object.entries(groups).map(([product, sales]) => ({
        product,
        revenue: Arr.reduce(sales, 0, (sum, sale) => sum + sale.revenue),
        units: Arr.reduce(sales, 0, (sum, sale) => sum + sale.units)
      }))
    )

    return getTopN(productSales, p => p.revenue, 10)
  }

  // Category breakdown with percentages
  static analyzeCategoriesByRevenue = (sales: readonly SalesRecord[], totalRevenue: number) => {
    const categoryRevenue = pipe(
      sales,
      Arr.groupBy(sale => sale.category),
      (groups) => Object.entries(groups).map(([category, sales]) => ({
        category,
        revenue: Arr.reduce(sales, 0, (sum, sale) => sum + sale.revenue)
      })),
      Arr.sortBy(c => c.revenue),
      Arr.reverse
    )

    return calculatePercentages(categoryRevenue.map(c => ({ ...c, value: c.revenue })), totalRevenue)
      .map(({ category, revenue, percentage }) => ({ category, revenue, percentage }))
  }

  // Regional analysis with growth calculation
  static analyzeRegions = (
    currentSales: readonly SalesRecord[], 
    previousSales?: readonly SalesRecord[]
  ) => {
    const currentRegionRevenue = pipe(
      currentSales,
      Arr.groupBy(sale => sale.region),
      (groups) => Object.entries(groups).map(([region, sales]) => ({
        region,
        revenue: Arr.reduce(sales, 0, (sum, sale) => sum + sale.revenue)
      }))
    )

    if (!previousSales) {
      return currentRegionRevenue
    }

    const previousRegionRevenue = pipe(
      previousSales,
      Arr.groupBy(sale => sale.region),
      (groups) => Object.entries(groups).reduce((acc, [region, sales]) => ({
        ...acc,
        [region]: Arr.reduce(sales, 0, (sum, sale) => sum + sale.revenue)
      }), {} as Record<string, number>)
    )

    return Arr.map(currentRegionRevenue, current => {
      const previous = previousRegionRevenue[current.region] || 0
      const growth = previous > 0 ? ((current.revenue - previous) / previous) * 100 : 0
      
      return { ...current, growth }
    })
  }

  // Sales person performance
  static analyzeSalesPeople = (sales: readonly SalesRecord[]) =>
    pipe(
      sales,
      Arr.groupBy(sale => sale.salesPerson),
      (groups) => Object.entries(groups).map(([salesPerson, sales]) => ({
        salesPerson,
        revenue: Arr.reduce(sales, 0, (sum, sale) => sum + sale.revenue),
        orders: sales.length
      })),
      Arr.sortBy(sp => sp.revenue),
      Arr.reverse
    )

  // Monthly trends analysis
  static analyzeMonthlyTrends = (sales: readonly SalesRecord[]) => {
    const monthlyData = pipe(
      sales,
      Arr.groupBy(sale => {
        const date = sale.date
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }),
      (groups) => Object.entries(groups).map(([month, sales]) => ({
        month,
        revenue: Arr.reduce(sales, 0, (sum, sale) => sum + sale.revenue),
        units: Arr.reduce(sales, 0, (sum, sale) => sum + sale.units)
      })),
      Arr.sortBy(m => m.month)
    )

    return monthlyData
  }

  // Generate comprehensive report
  static generateReport = (
    currentSales: readonly SalesRecord[],
    previousSales?: readonly SalesRecord[]
  ): AnalyticsReport => {
    const basicMetrics = this.calculateBasicMetrics(currentSales)
    
    return {
      ...basicMetrics,
      topProducts: this.analyzeProducts(currentSales),
      revenueByCategory: this.analyzeCategoriesByRevenue(currentSales, basicMetrics.totalRevenue),
      revenueByRegion: this.analyzeRegions(currentSales, previousSales),
      salesPersonPerformance: this.analyzeSalesPeople(currentSales),
      monthlyTrends: this.analyzeMonthlyTrends(currentSales)
    }
  }
}

// Sample usage
const salesData: SalesRecord[] = [
  {
    id: "1", date: new Date("2024-01-15"), product: "Laptop Pro", category: "Electronics",
    revenue: 1200, units: 1, region: "North", salesPerson: "Alice Johnson"
  },
  {
    id: "2", date: new Date("2024-01-20"), product: "Wireless Mouse", category: "Electronics", 
    revenue: 50, units: 2, region: "South", salesPerson: "Bob Smith"
  },
  {
    id: "3", date: new Date("2024-02-10"), product: "Office Chair", category: "Furniture",
    revenue: 300, units: 1, region: "North", salesPerson: "Alice Johnson"
  },
  {
    id: "4", date: new Date("2024-02-15"), product: "Laptop Pro", category: "Electronics",
    revenue: 1200, units: 1, region: "West", salesPerson: "Carol Davis"
  }
]

const report = AnalyticsEngine.generateReport(salesData)

console.log("Analytics Report:")
console.log(`Total Revenue: $${report.totalRevenue}`)
console.log(`Average Order Value: $${report.averageOrderValue.toFixed(2)}`)
console.log("\nTop Products:")
Arr.forEach(report.topProducts, ({ product, revenue, units }) =>
  console.log(`  ${product}: $${revenue} (${units} units)`)
)

console.log("\nRevenue by Category:")
Arr.forEach(report.revenueByCategory, ({ category, revenue, percentage }) =>
  console.log(`  ${category}: $${revenue} (${percentage.toFixed(1)}%)`)
)
```

### Example 4: Advanced List Management with Filtering and Sorting

Complex list management operations for todo applications, task management, and content filtering:

```typescript
import { Array, Option, pipe, Order } from "effect"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "archived"
  dueDate: Date
  tags: string[]
  assignedTo: string
  createdAt: Date
  estimatedHours: number
  actualHours?: number
}

interface FilterCriteria {
  status?: Task["status"][]
  priority?: Task["priority"][]
  assignedTo?: string[]
  tags?: string[]
  dueDateRange?: { start: Date; end: Date }
  overdue?: boolean
}

interface SortOptions {
  field: keyof Task
  direction: "asc" | "desc"
}

// Advanced filtering utilities
class TaskManager {
  // Priority ordering for sorting
  private static priorityOrder: Record<Task["priority"], number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  }

  // Multi-criteria filtering
  static filterTasks = (tasks: readonly Task[], criteria: FilterCriteria): Effect.Effect<Task[]> =>
    Effect.gen(function* () {
      let filteredTasks = [...tasks]
      
      // Filter by status
      if (criteria.status) {
        filteredTasks = filteredTasks.filter(task => 
          criteria.status!.includes(task.status)
        )
      }
      
      // Filter by priority
      if (criteria.priority) {
        filteredTasks = filteredTasks.filter(task =>
          criteria.priority!.includes(task.priority)
        )
      }
      
      // Filter by assignee
      if (criteria.assignedTo) {
        filteredTasks = filteredTasks.filter(task =>
          criteria.assignedTo!.includes(task.assignedTo)
        )
      }
      
      // Filter by tags (task must have at least one matching tag)
      if (criteria.tags) {
        filteredTasks = filteredTasks.filter(task =>
          criteria.tags!.some(tag => task.tags.includes(tag))
        )
      }
      
      // Filter by due date range
      if (criteria.dueDateRange) {
        const { start, end } = criteria.dueDateRange
        filteredTasks = filteredTasks.filter(task =>
          task.dueDate >= start && task.dueDate <= end
        )
      }
      
      // Filter by overdue status
      if (criteria.overdue !== undefined) {
        const now = new Date()
        filteredTasks = filteredTasks.filter(task => {
          const isOverdue = task.dueDate < now && task.status !== "completed"
          return criteria.overdue ? isOverdue : !isOverdue
        })
      }
      
      return filteredTasks
    })

  // Advanced sorting with multiple criteria
  static sortTasks = (tasks: readonly Task[], sorts: SortOptions[]): Task[] => {
    if (Arr.isEmptyArray(sorts)) return Arr.fromIterable(tasks)

    return pipe(
      tasks,
      Arr.sort(
        Arr.reduce(sorts, Order.empty<Task>(), (currentOrder, sortOption) => {
          const fieldOrder = this.createFieldOrder(sortOption.field, sortOption.direction)
          return Order.combine(currentOrder, fieldOrder)
        })
      )
    )
  }

  private static createFieldOrder = (field: keyof Task, direction: "asc" | "desc"): Order.Order<Task> => {
    const baseOrder = (() => {
      switch (field) {
        case "priority":
          return Order.mapInput(Order.number, (task: Task) => this.priorityOrder[task.priority])
        case "dueDate":
        case "createdAt":
          return Order.mapInput(Order.Date, (task: Task) => task[field] as Date)
        case "estimatedHours":
        case "actualHours":
          return Order.mapInput(Order.number, (task: Task) => task[field] as number || 0)
        case "title":
        case "description":
        case "assignedTo":
          return Order.mapInput(Order.string, (task: Task) => task[field] as string)
        default:
          return Order.mapInput(Order.string, (task: Task) => String(task[field]))
      }
    })()

    return direction === "desc" ? Order.reverse(baseOrder) : baseOrder
  }

  // Smart grouping with multiple strategies
  static groupTasks = (tasks: readonly Task[], groupBy: keyof Task | "overdue" | "upcoming"): Record<string, Task[]> => {
    if (groupBy === "overdue") {
      return pipe(
        tasks,
        Arr.groupBy(task => {
          const isOverdue = task.dueDate < new Date() && task.status !== "completed"
          const isToday = this.isToday(task.dueDate)
          const isTomorrow = this.isTomorrow(task.dueDate)
          
          if (isOverdue) return "Overdue"
          if (isToday) return "Today"
          if (isTomorrow) return "Tomorrow"
          return "Future"
        })
      )
    }

    if (groupBy === "upcoming") {
      return pipe(
        tasks,
        Arr.groupBy(task => {
          const daysUntilDue = Math.ceil(
            (task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
          
          if (daysUntilDue < 0) return "Overdue"
          if (daysUntilDue === 0) return "Today"
          if (daysUntilDue <= 7) return "This Week"
          if (daysUntilDue <= 30) return "This Month"
          return "Later"
        })
      )
    }

    return Arr.groupBy(tasks, task => String(task[groupBy]))
  }

  // Batch operations with validation
  static batchUpdateStatus = (
    tasks: readonly Task[], 
    taskIds: string[], 
    newStatus: Task["status"]
  ): Either.Either<Task[], string> => {
    const tasksToUpdate = pipe(
      taskIds,
      Arr.filterMap(id => Arr.findFirst(tasks, task => task.id === id))
    )

    if (tasksToUpdate.length !== taskIds.length) {
      return Either.left("Some tasks not found")
    }

    // Validate status transitions
    const invalidTransitions = Arr.filter(tasksToUpdate, task => 
      !this.isValidStatusTransition(task.status, newStatus)
    )

    if (Arr.isNonEmptyArray(invalidTransitions)) {
      const invalidIds = Arr.map(invalidTransitions, t => t.id)
      return Either.left(`Invalid status transition for tasks: ${invalidIds.join(", ")}`)
    }

    const updatedTasks = Arr.map(tasks, task =>
      Arr.contains(taskIds, task.id) 
        ? { ...task, status: newStatus }
        : task
    )

    return Either.right(updatedTasks)
  }

  // Task analytics and insights
  static getTaskInsights = (tasks: readonly Task[]) => {
    const completedTasks = Arr.filter(tasks, task => task.status === "completed")
    const overdueTasks = Arr.filter(tasks, task => 
      task.dueDate < new Date() && task.status !== "completed"
    )

    const averageCompletionTime = pipe(
      completedTasks,
      Arr.filterMap(task => Option.fromNullable(task.actualHours)),
      Arr.reduce(0, (sum, hours) => sum + hours),
      total => completedTasks.length > 0 ? total / completedTasks.length : 0
    )

    const tasksByPriority = Arr.groupBy(tasks, task => task.priority)
    const tasksByAssignee = Arr.groupBy(tasks, task => task.assignedTo)

    return {
      total: tasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      averageCompletionTime,
      tasksByPriority: Object.fromEntries(
        Object.entries(tasksByPriority).map(([priority, tasks]) => [priority, tasks.length])
      ),
      tasksByAssignee: Object.fromEntries(
        Object.entries(tasksByAssignee).map(([assignee, tasks]) => [assignee, tasks.length])
      )
    }
  }

  // Utility methods
  private static isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  private static isTomorrow = (date: Date): boolean => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

  private static isValidStatusTransition = (from: Task["status"], to: Task["status"]): boolean => {
    const validTransitions: Record<Task["status"], Task["status"][]> = {
      pending: ["in-progress", "archived"],
      "in-progress": ["completed", "pending", "archived"],
      completed: ["archived"],
      archived: ["pending"]
    }
    return Arr.contains(validTransitions[from], to)
  }
}

// Usage example
const tasks: Task[] = [
  {
    id: "1",
    title: "Implement user authentication",
    description: "Add login/logout functionality",
    priority: "high",
    status: "in-progress",
    dueDate: new Date("2024-01-25"),
    tags: ["auth", "security"],
    assignedTo: "john.doe",
    createdAt: new Date("2024-01-20"),
    estimatedHours: 8,
    actualHours: 6
  },
  {
    id: "2",
    title: "Fix responsive design issues",
    description: "Mobile layout improvements",
    priority: "medium",
    status: "pending",
    dueDate: new Date("2024-01-30"),
    tags: ["ui", "responsive"],
    assignedTo: "jane.smith",
    createdAt: new Date("2024-01-22"),
    estimatedHours: 4
  },
  {
    id: "3",
    title: "Database optimization",
    description: "Improve query performance",
    priority: "urgent",
    status: "completed",
    dueDate: new Date("2024-01-20"),
    tags: ["database", "performance"],
    assignedTo: "bob.wilson",
    createdAt: new Date("2024-01-15"),
    estimatedHours: 12,
    actualHours: 10
  }
]

// Advanced filtering
const highPriorityTasks = TaskManager.filterTasks(tasks, {
  priority: ["high", "urgent"],
  status: ["pending", "in-progress"]
})

// Complex sorting
const sortedTasks = TaskManager.sortTasks(tasks, [
  { field: "priority", direction: "desc" },
  { field: "dueDate", direction: "asc" }
])

// Smart grouping
const groupedByUrgency = TaskManager.groupTasks(tasks, "upcoming")

// Get insights
const insights = TaskManager.getTaskInsights(tasks)
console.log(`Completion rate: ${insights.completionRate.toFixed(1)}%`)
console.log(`Average completion time: ${insights.averageCompletionTime.toFixed(1)} hours`)
```

## Advanced Features Deep Dive

### Safe Array Operations with Option Integration

Effect's Array module seamlessly integrates with Option to provide null-safe operations that eliminate runtime errors:

```typescript
import { Array, Option, pipe } from "effect"

// Safe head/tail operations
const safeArrayOperations = <T>(items: readonly T[]) => {
  // Getting first element safely
  const firstItem = Arr.head(items) // Option<T>
  const firstOrDefault = pipe(
    Arr.head(items),
    Option.getOrElse(() => "No items available")
  )

  // Safe array access by index
  const getItemAt = (index: number) => Arr.get(items, index) // Option<T>
  const getItemOrFallback = (index: number, fallback: T) => pipe(
    Arr.get(items, index),
    Option.getOrElse(() => fallback)
  )

  // Safe array modifications
  const safeUpdate = (index: number, newValue: T) => 
    Arr.modifyOption(items, index, () => newValue) // Option<T[]>

  const safeRemove = (index: number) =>
    Arr.removeOption(items, index) // Option<T[]>

  return {
    firstItem,
    firstOrDefault,
    getItemAt,
    getItemOrFallback,
    safeUpdate,
    safeRemove
  }
}

// Example usage with user data
interface User {
  id: string
  name: string
  email: string
}

const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" }
]

const operations = safeArrayOperations(users)

// Safe operations that won't crash
const firstUser = operations.firstOrDefault // User object or "No items available"
const userAtIndex = operations.getItemAt(5) // Option.none()
const safeUserAtIndex = operations.getItemOrFallback(5, { 
  id: "default", 
  name: "Unknown", 
  email: "unknown@example.com" 
})
```

### Advanced Filtering with Type Guards

Leverage TypeScript's type system for powerful filtering operations:

```typescript
import { Array, pipe } from "effect"

// Type guard functions
const isString = (value: unknown): value is string => typeof value === "string"
const isNumber = (value: unknown): value is number => typeof value === "number"
const isNonNull = <T>(value: T | null): value is T => value !== null

// Advanced filtering with type narrowing
const mixedData: (string | number | null)[] = ["hello", 42, null, "world", 123, null]

// Filter and narrow types simultaneously
const strings = pipe(
  mixedData,
  Arr.filter(isString) // TypeScript knows result is string[]
)

const numbers = pipe(
  mixedData,
  Arr.filter(isNumber) // TypeScript knows result is number[]
)

const nonNullValues = pipe(
  mixedData,
  Arr.filter(isNonNull) // TypeScript knows result is (string | number)[]
)

// Complex type guards for business objects
interface Product {
  id: string
  name: string
  price: number
  category: string
  inStock?: boolean
}

const isInStock = (product: Product): product is Product & { inStock: true } =>
  product.inStock === true

const isExpensive = (product: Product): product is Product & { price: number } =>
  product.price > 100

const products: Product[] = [
  { id: "1", name: "Laptop", price: 999, category: "electronics", inStock: true },
  { id: "2", name: "Book", price: 15, category: "books", inStock: false },
  { id: "3", name: "Phone", price: 699, category: "electronics", inStock: true }
]

// Combine type guards for complex filtering
const expensiveInStockProducts = pipe(
  products,
  Arr.filter(isInStock),
  Arr.filter(isExpensive)
) // Type: (Product & { inStock: true } & { price: number })[]
```

### High-Performance Array Operations

Optimize array operations for large datasets:

```typescript
import { Array, pipe } from "effect"

// Efficient chunking for batch processing
const processInBatches = <T, R>(
  items: readonly T[], 
  batchSize: number, 
  processor: (batch: readonly T[]) => R[]
): R[] => {
  return pipe(
    items,
    Arr.chunksOf(batchSize), // Split into chunks efficiently
    Arr.flatMap(processor) // Process each chunk and flatten results
  )
}

// Memory-efficient large array operations
const processLargeDataset = (data: readonly number[]) => {
  // Process in chunks to avoid memory pressure
  const batchProcessor = (batch: readonly number[]) => 
    pipe(
      batch,
      Arr.filter(n => n > 0),
      Arr.map(n => n * 2),
      Arr.reduce(0, (sum, n) => sum + n)
    )

  return processInBatches(data, 1000, batch => [batchProcessor(batch)])
}

// Efficient deduplication strategies
const efficientDedupe = <T>(items: readonly T[], keyExtractor: (item: T) => string): T[] => {
  const seen = new Set<string>()
  
  return pipe(
    items,
    Arr.filter(item => {
      const key = keyExtractor(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  )
}

// Smart sorting for different data types
const smartSort = <T>(items: readonly T[], selector: (item: T) => string | number | Date): T[] => {
  const firstValue = pipe(
    Arr.head(items),
    Option.map(selector)
  )

  return pipe(
    firstValue,
    Option.match({
      onNone: () => Arr.fromIterable(items),
      onSome: (value) => {
        if (typeof value === "string") {
          return Arr.sortBy(items, selector as (item: T) => string)
        } else if (typeof value === "number") {
          return Arr.sortBy(items, selector as (item: T) => number)
        } else if (value instanceof Date) {
          return Arr.sortBy(items, selector as (item: T) => Date)
        }
        return Arr.fromIterable(items)
      }
    })
  )
}

// Example: Processing large user dataset
interface UserActivity {
  userId: string
  action: string
  timestamp: Date
  value: number
}

const activities: UserActivity[] = Arr.makeBy(10000, i => ({
  userId: `user_${i % 100}`,
  action: ["login", "purchase", "logout"][i % 3],
  timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  value: Math.floor(Math.random() * 1000)
}))

// Efficient processing of large dataset
const processedActivities = pipe(
  activities,
  // Dedupe by composite key
  efficientDedupe(activity => `${activity.userId}-${activity.action}-${activity.timestamp.toISOString()}`),
  // Sort by timestamp efficiently
  smartSort(activity => activity.timestamp),
  // Process in batches for memory efficiency
  activities => processInBatches(activities, 500, batch =>
    pipe(
      batch,
      Arr.filter(activity => activity.value > 100),
      Arr.groupBy(activity => activity.userId),
      Object.entries,
      Arr.map(([userId, userActivities]) => ({
        userId,
        totalValue: Arr.reduce(userActivities, 0, (sum, activity) => sum + activity.value),
        activityCount: userActivities.length
      }))
    )
  )
)
```

## Practical Patterns & Best Practices

### Pattern 1: Safe Pipeline Transformations

Create reusable transformation pipelines that handle errors gracefully:

```typescript
import { Array as Arr, Option, Either, pipe } from "effect"

// Generic pipeline builder for safe transformations
const createSafePipeline = <T, R>(
  transformations: Array<(item: T) => Option.Option<T> | Either.Either<T, string>>
) => (items: readonly T[]): { success: R[], errors: Array<{ item: T; error: string }> } => {
  const results = Arr.map(items, item => {
    const result = Arr.reduce(
      transformations, 
      Either.right(item) as Either.Either<T, string>,
      (currentResult, transform) => 
        pipe(
          currentResult,
          Either.flatMap(value => {
            const transformed = transform(value)
            
            if (Option.isOption(transformed)) {
              return pipe(
                transformed,
                Option.match({
                  onNone: () => Either.left("Transformation failed"),
                  onSome: Either.right
                })
              )
            }
            
            return transformed
          })
        )
    )
    
    return { item, result }
  })

  return {
    success: pipe(
      results,
      Arr.filterMap(({ result }) => Either.getRight(result))
    ) as R[],
    errors: pipe(
      results,
      Arr.filterMap(({ item, result }) => 
        pipe(
          Either.getLeft(result),
          Option.map(error => ({ item, error }))
        )
      )
    )
  }
}

// Validation pipeline utilities
const validateEmail = (user: { email: string }) => 
  user.email.includes("@") 
    ? Option.some(user)
    : Option.none()

const validateAge = (user: { age: number }) =>
  user.age >= 18 && user.age <= 120
    ? Either.right(user)
    : Either.left("Invalid age")

const normalizeData = (user: { name: string; email: string }) =>
  Option.some({
    ...user,
    name: user.name.trim(),
    email: user.email.toLowerCase()
  })

// Usage
interface User {
  name: string
  email: string
  age: number
}

const users: User[] = [
  { name: "  Alice  ", email: "ALICE@EXAMPLE.COM", age: 25 },
  { name: "Bob", email: "invalid-email", age: 30 },
  { name: "Charlie", email: "charlie@example.com", age: 15 }
]

const pipeline = createSafePipeline<User, User>([
  validateEmail,
  validateAge,
  normalizeData
])

const result = pipeline(users)
console.log("Processed users:", result.success)
console.log("Errors:", result.errors)
```

### Pattern 2: Composable Data Aggregation

Build flexible aggregation functions that can be composed and reused:

```typescript
import { Array, pipe } from "effect"

// Generic aggregation builder
type Aggregator<T, R> = (items: readonly T[]) => R

const createAggregator = <T>() => ({
  count: (): Aggregator<T, number> => 
    items => items.length,
  
  sum: <K extends keyof T>(key: K): Aggregator<T, number> =>
    items => Arr.reduce(items, 0, (sum, item) => sum + (item[key] as number)),
  
  average: <K extends keyof T>(key: K): Aggregator<T, number> =>
    items => {
      const total = Arr.reduce(items, 0, (sum, item) => sum + (item[key] as number))
      return items.length > 0 ? total / items.length : 0
    },
  
  min: <K extends keyof T>(key: K): Aggregator<T, T[K] | undefined> =>
    items => {
      if (Arr.isEmptyArray(items)) return undefined
      return Arr.reduce(items.slice(1), items[0][key], (min, item) => 
        item[key] < min ? item[key] : min
      )
    },
  
  max: <K extends keyof T>(key: K): Aggregator<T, T[K] | undefined> =>
    items => {
      if (Arr.isEmptyArray(items)) return undefined
      return Arr.reduce(items.slice(1), items[0][key], (max, item) => 
        item[key] > max ? item[key] : max
      )
    },
  
  groupBy: <K extends keyof T, R>(
    key: K, 
    aggregator: Aggregator<T, R>
  ): Aggregator<T, Record<string, R>> =>
    items => {
      const grouped = Arr.groupBy(items, item => String(item[key]))
      return Object.fromEntries(
        Object.entries(grouped).map(([group, groupItems]) => 
          [group, aggregator(groupItems)]
        )
      )
    },
  
  compose: <R1, R2>(
    agg1: Aggregator<T, R1>,
    agg2: Aggregator<T, R2>
  ): Aggregator<T, [R1, R2]> =>
    items => [agg1(items), agg2(items)]
})

// Usage example
interface Sale {
  id: string
  amount: number
  region: string
  product: string
  date: Date
}

const sales: Sale[] = [
  { id: "1", amount: 100, region: "North", product: "Widget", date: new Date("2024-01-01") },
  { id: "2", amount: 250, region: "South", product: "Gadget", date: new Date("2024-01-02") },
  { id: "3", amount: 150, region: "North", product: "Widget", date: new Date("2024-01-03") }
]

const agg = createAggregator<Sale>()

// Compose multiple aggregations
const complexAggregation = agg.compose(
  agg.sum("amount"),
  agg.groupBy("region", agg.compose(
    agg.count(),
    agg.average("amount")
  ))
)

const result = complexAggregation(sales)
console.log("Total sales:", result[0])
console.log("By region:", result[1])
```

### Pattern 3: Functional Error Accumulation

Handle multiple validation errors without short-circuiting:

```typescript
import { Array, Either, pipe } from "effect"

// Error accumulation utilities
type ValidationError = {
  field: string
  message: string
}

type ValidationResult<T> = Either.Either<T, ValidationError[]>

const validate = <T>(
  value: T,
  validators: Array<(value: T) => Either.Either<T, ValidationError>>
): ValidationResult<T> => {
  const results = Arr.map(validators, validator => validator(value))
  const errors = pipe(
    results,
    Arr.filterMap(result => Either.getLeft(result)),
    Arr.flatten
  )
  
  return Arr.isEmptyArray(errors) 
    ? Either.right(value)
    : Either.left(errors)
}

// Validation functions
const validateRequired = (field: string) => (value: string): Either.Either<string, ValidationError> =>
  value.trim().length > 0
    ? Either.right(value)
    : Either.left([{ field, message: "Field is required" }])

const validateEmail = (field: string) => (value: string): Either.Either<string, ValidationError> =>
  value.includes("@") && value.includes(".")
    ? Either.right(value)
    : Either.left([{ field, message: "Invalid email format" }])

const validateMinLength = (field: string, minLength: number) => 
  (value: string): Either.Either<string, ValidationError> =>
    value.length >= minLength
      ? Either.right(value)
      : Either.left([{ field, message: `Minimum length is ${minLength}` }])

// Form validation example
interface UserForm {
  name: string
  email: string
  password: string
}

const validateUserForm = (form: UserForm): ValidationResult<UserForm> => {
  const nameValidation = validate(form.name, [
    validateRequired("name"),
    validateMinLength("name", 2)
  ])
  
  const emailValidation = validate(form.email, [
    validateRequired("email"),
    validateEmail("email")
  ])
  
  const passwordValidation = validate(form.password, [
    validateRequired("password"),
    validateMinLength("password", 8)
  ])
  
  // Accumulate all errors
  const allErrors = pipe(
    [nameValidation, emailValidation, passwordValidation],
    Arr.filterMap(result => Either.getLeft(result)),
    Arr.flatten
  )
  
  return Arr.isEmptyArray(allErrors)
    ? Either.right(form)
    : Either.left(allErrors)
}

// Usage
const formData: UserForm = {
  name: "",
  email: "invalid-email",
  password: "123"
}

const validationResult = validateUserForm(formData)
pipe(
  validationResult,
  Either.match({
    onLeft: errors => {
      console.log("Validation errors:")
      Arr.forEach(errors, error => 
        console.log(`- ${error.field}: ${error.message}`)
      )
    },
    onRight: validForm => console.log("Form is valid:", validForm)
  })
)
```

## Integration Examples

### Integration with Schema for Type-Safe Validation

Combine Array operations with Effect Schema for robust data validation:

```typescript
import { Array, Schema, pipe } from "effect"

// Define schemas for validation
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String.pipe(Schema.includes("@")),
  age: Schema.Number.pipe(Schema.between(0, 120)),
  roles: Schema.Array(Schema.String)
})

const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number.pipe(Schema.positive()),
  categories: Schema.Array(Schema.String)
})

// Safe parsing with Array operations
const parseAndValidateUsers = (rawData: unknown[]) => {
  const parseResults = Arr.map(rawData, data => 
    Schema.decodeUnknownEither(UserSchema)(data)
  )
  
  return {
    valid: Arr.filterMap(parseResults, result => Either.getRight(result)),
    invalid: Arr.filterMap(parseResults, result => Either.getLeft(result))
  }
}

// Batch processing with schema validation
const processBatchData = <A, I>(
  schema: Schema.Schema<A, I>, 
  rawData: unknown[]
) => {
  return pipe(
    rawData,
    Arr.map(item => Schema.decodeUnknownEither(schema)(item)),
    Arr.partition(Either.isRight),
    ([invalid, valid]) => ({
      processed: Arr.map(valid, result => result.right),
      errors: Arr.map(invalid, result => result.left)
    })
  )
}

// Usage with sample data
const rawUsers = [
  { id: "1", name: "Alice", email: "alice@example.com", age: 30, roles: ["user"] },
  { id: "2", name: "Bob", email: "invalid-email", age: 25, roles: ["admin"] },
  { id: "3", name: "Charlie", email: "charlie@example.com", age: -5, roles: ["user"] }
]

const result = processBatchData(UserSchema, rawUsers)
console.log(`Processed: ${result.processed.length}, Errors: ${result.errors.length}`)
```

### Testing Strategies for Array Operations

Comprehensive testing patterns for array operations:

```typescript
import { Array as Arr, Option, Either, pipe } from "effect"
import { test, expect, describe } from "bun:test"

// Property-based testing helpers
const generateRandomArray = <T>(generator: () => T, length: number): T[] =>
  Arr.makeBy(length, generator)

const isEqualArray = <T>(a: readonly T[], b: readonly T[]): boolean =>
  a.length === b.length && Arr.every(a, (item, index) => item === b[index])

describe("Array Operations", () => {
  // Test safe operations
  test("head returns None for empty array", () => {
    const result = Arr.head([])
    expect(Option.isNone(result)).toBe(true)
  })

  test("head returns Some for non-empty array", () => {
    const result = Arr.head([1, 2, 3])
    expect(Option.isSome(result)).toBe(true)
    expect(result.value).toBe(1)
  })

  // Test transformations
  test("map preserves array length", () => {
    const input = [1, 2, 3, 4, 5]
    const result = Arr.map(input, x => x * 2)
    expect(result.length).toBe(input.length)
  })

  test("filter reduces array length correctly", () => {
    const input = [1, 2, 3, 4, 5]
    const result = Arr.filter(input, x => x % 2 === 0)
    expect(result).toEqual([2, 4])
  })

  // Property-based tests
  test("flatMap followed by flatten is identity", () => {
    const input = [[1, 2], [3, 4], [5]]
    const result1 = Arr.flatMap(input, x => x)
    const result2 = Arr.flatten(input)
    expect(isEqualArray(result1, result2)).toBe(true)
  })

  test("sorting is idempotent", () => {
    const randomNumbers = generateRandomArray(() => Math.floor(Math.random() * 100), 20)
    const sorted1 = Arr.sort(randomNumbers, Order.number)
    const sorted2 = Arr.sort(sorted1, Order.number)
    expect(isEqualArray(sorted1, sorted2)).toBe(true)
  })

  // Error handling tests
  test("safe operations handle empty arrays", () => {
    const emptyArray: number[] = []
    expect(Option.isNone(Arr.head(emptyArray))).toBe(true)
    expect(Option.isNone(Arr.last(emptyArray))).toBe(true)
    expect(Option.isNone(Arr.get(emptyArray, 0))).toBe(true)
  })

  // Integration tests with real-world scenarios
  test("user processing pipeline handles mixed data", () => {
    interface User { id: string; name: string; age: number }
    
    const users: User[] = [
      { id: "1", name: "Alice", age: 25 },
      { id: "2", name: "Bob", age: 17 }, // Underage
      { id: "3", name: "Charlie", age: 30 }
    ]

    const processUsers = (users: User[]) => pipe(
      users,
      Arr.filter(user => user.age >= 18),
      Arr.map(user => ({ ...user, name: user.name.toUpperCase() })),
      Arr.sortBy(user => user.age)
    )

    const result = processUsers(users)
    expect(result).toEqual([
      { id: "1", name: "ALICE", age: 25 },
      { id: "3", name: "CHARLIE", age: 30 }
    ])
  })
})

// Mock data generators for testing
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: `user_${Math.random().toString(36).substring(7)}`,
  name: `User ${Math.floor(Math.random() * 1000)}`,
  email: `user${Math.floor(Math.random() * 1000)}@example.com`,
  age: Math.floor(Math.random() * 50) + 18,
  isActive: Math.random() > 0.5,
  ...overrides
})

const createMockUsers = (count: number): User[] =>
  Arr.makeBy(count, () => createMockUser())

// Performance testing utilities
const measureArrayOperation = <T, R>(
  operation: (arr: T[]) => R,
  data: T[]
): { result: R; duration: number } => {
  const start = performance.now()
  const result = operation(data)
  const end = performance.now()
  return { result, duration: end - start }
}

// Test array operations performance
test("large array operations performance", () => {
  const largeArray = Arr.range(1, 100000)
  
  const { duration: filterDuration } = measureArrayOperation(
    arr => Arr.filter(arr, n => n % 2 === 0),
    largeArray
  )
  
  const { duration: mapDuration } = measureArrayOperation(
    arr => Arr.map(arr, n => n * 2),
    largeArray
  )
  
  // Performance assertions
  expect(filterDuration).toBeLessThan(100) // Should complete in under 100ms
  expect(mapDuration).toBeLessThan(50) // Should complete in under 50ms
})
```

## Conclusion

Effect's Array module transforms array operations from error-prone imperative code into safe, functional, and composable transformations. By providing type-safe operations, seamless integration with Option and Either, and powerful composition patterns, it eliminates common runtime errors while improving code readability and maintainability.

Key benefits:
- **Type Safety**: Comprehensive type inference prevents runtime errors and improves developer experience
- **Functional Composition**: Chain operations using `pipe` for clear, readable transformation pipelines  
- **Safe Operations**: Integration with Option eliminates null/undefined crashes and bounds checking errors
- **Error Handling**: Either integration provides structured error handling without exceptions
- **Performance**: Optimized implementations handle large datasets efficiently
- **Testability**: Pure functions and predictable behavior make testing straightforward

Whether you're processing e-commerce data, building analytics pipelines, or managing complex application state, Effect's Array module provides the tools to write robust, maintainable code that handles edge cases gracefully and scales with your application's needs.