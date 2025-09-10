# Data: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Data Solves

JavaScript and TypeScript objects have unpredictable equality semantics, no built-in immutability guarantees, and lack proper value-based comparisons. This creates numerous issues when building reliable applications:

```typescript
// Traditional approach - reference equality and mutation issues
interface User {
  id: string
  name: string
  preferences: {
    theme: string
    notifications: boolean
  }
}

const user1 = { 
  id: "123", 
  name: "Alice", 
  preferences: { theme: "dark", notifications: true } 
}

const user2 = { 
  id: "123", 
  name: "Alice", 
  preferences: { theme: "dark", notifications: true } 
}

// Broken equality - same values, different results
console.log(user1 === user2) // false - different object references
console.log(user1.preferences === user2.preferences) // false - nested objects

// No immutability guarantees - mutations can happen anywhere
user1.preferences.theme = "light" // Accidental mutation
console.log(user1.preferences.theme) // "light" - state changed unexpectedly

// Manual deep cloning is error-prone and expensive
const clonedUser = JSON.parse(JSON.stringify(user1)) // Loses prototype, breaks dates/functions
```

This approach leads to:
- **Unpredictable equality** - identical values compare as unequal due to reference semantics
- **Accidental mutations** - objects can be modified anywhere, breaking immutability assumptions
- **Complex state management** - manual deep cloning, equality checks, and defensive copying
- **Hash inconsistencies** - objects with same values produce different hash codes

### The Data Solution

Data provides immutable data structures with proper value equality, structural hashing, and composable constructors:

```typescript
import { Data, Equal } from "effect"

// Type-safe immutable data with value equality
const user1 = Data.struct({
  id: "123",
  name: "Alice",
  preferences: Data.struct({
    theme: "dark",
    notifications: true
  })
})

const user2 = Data.struct({
  id: "123", 
  name: "Alice",
  preferences: Data.struct({
    theme: "dark",
    notifications: true
  })
})

// Value-based equality - same values, same result
console.log(Equal.equals(user1, user2)) // true - structural equality

// Immutable by design - cannot be mutated
// user1.preferences.theme = "light" // TypeScript error - readonly properties

// Efficient comparison and hashing
const userSet = new Set([user1, user2]) // Properly deduplicated based on value
```

### Key Concepts

**Value Equality**: Objects are equal if they have the same structure and values, not reference identity

**Immutability**: Data structures are immutable by default, preventing accidental mutations

**Structural Hashing**: Hash codes are computed based on values, enabling efficient collections and comparisons

**Tagged Unions**: Type-safe discriminated unions with built-in pattern matching support

**Case Classes**: Constructors that automatically provide equality, hashing, and serialization

## Basic Usage Patterns

### Pattern 1: Creating Immutable Structs

```typescript
import { Data, Equal } from "effect"

// Simple struct creation
const point = Data.struct({ x: 10, y: 20 })
const samePoint = Data.struct({ x: 10, y: 20 })

console.log(Equal.equals(point, samePoint)) // true

// Nested structs for complex data
const user = Data.struct({
  id: "user123",
  profile: Data.struct({
    name: "Alice",
    email: "alice@example.com"
  }),
  settings: Data.struct({
    theme: "dark",
    language: "en"
  })
})
```

### Pattern 2: Working with Arrays and Tuples

```typescript
import { Data, Equal } from "effect"

// Immutable arrays with value equality
const numbers = Data.array([1, 2, 3, 4, 5])
const sameNumbers = Data.array([1, 2, 3, 4, 5])

console.log(Equal.equals(numbers, sameNumbers)) // true

// Tuples for fixed-length heterogeneous data
const coordinate = Data.tuple("point", 10, 20)
const sameCoordinate = Data.tuple("point", 10, 20)

console.log(Equal.equals(coordinate, sameCoordinate)) // true
```

### Pattern 3: Tagged Types and Unions

```typescript
import { Data } from "effect"

// Simple tagged type
interface Person {
  readonly _tag: "Person"
  readonly name: string
  readonly age: number
}

const Person = Data.tagged<Person>("Person")

const alice = Person({ name: "Alice", age: 30 })
console.log(alice._tag) // "Person"

// Tagged union for state management
type LoadingState = Data.TaggedEnum<{
  Loading: {}
  Success: { data: string }
  Error: { message: string }
}>

const { Loading, Success, Error } = Data.taggedEnum<LoadingState>()

const loading = Loading()
const success = Success({ data: "Hello World" })
const error = Error({ message: "Network error" })
```

## Real-World Examples

### Example 1: E-commerce Product Catalog

Manage product data with immutable structures, variant handling, and proper equality for caching and state management.

```typescript
import { Data, Equal, Array as Arr } from "effect"

// Product variant data structure
interface ProductVariant {
  readonly _tag: "ProductVariant"
  readonly sku: string
  readonly size: string
  readonly color: string
  readonly price: number
  readonly inventory: number
}

const ProductVariant = Data.tagged<ProductVariant>("ProductVariant")

// Main product with variants
interface Product {
  readonly _tag: "Product"
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: string
  readonly variants: readonly ProductVariant[]
  readonly metadata: {
    readonly brand: string
    readonly tags: readonly string[]
    readonly createdAt: Date
  }
}

const Product = Data.tagged<Product>("Product")

// Create product instances
const createProduct = (
  id: string,
  name: string,
  description: string,
  category: string,
  brand: string,
  tags: readonly string[]
) => Product({
  id,
  name,
  description,
  category,
  variants: [],
  metadata: Data.struct({
    brand,
    tags: Data.array(tags),
    createdAt: new Date()
  })
})

const addVariant = (product: Product, variant: ProductVariant): Product =>
  Data.struct({
    ...product,
    variants: Data.array([...product.variants, variant])
  })

// Usage example
const tshirt = createProduct(
  "tshirt-001",
  "Classic T-Shirt",
  "Comfortable cotton t-shirt",
  "apparel",
  "BrandX",
  ["cotton", "casual", "comfortable"]
)

const smallBlue = ProductVariant({
  sku: "tshirt-001-s-blue",
  size: "S",
  color: "blue",
  price: 19.99,
  inventory: 50
})

const mediumBlue = ProductVariant({
  sku: "tshirt-001-m-blue", 
  size: "M",
  color: "blue",
  price: 19.99,
  inventory: 30
})

const updatedTshirt = addVariant(addVariant(tshirt, smallBlue), mediumBlue)

// Efficient equality checking for caching
const cachedProducts = new Map<string, Product>()

const cacheProduct = (product: Product) => {
  const existing = cachedProducts.get(product.id)
  if (!existing || !Equal.equals(existing, product)) {
    cachedProducts.set(product.id, product)
    console.log(`Cached updated product: ${product.name}`)
  }
}

cacheProduct(updatedTshirt)
cacheProduct(updatedTshirt) // Won't log again - same value
```

### Example 2: User Profile Management System

Handle user data with nested structures, optional fields, and state transitions using immutable data patterns.

```typescript
import { Data, Equal, Option } from "effect"

// Address information
interface Address {
  readonly _tag: "Address"
  readonly street: string
  readonly city: string
  readonly state: string
  readonly zipCode: string
  readonly country: string
}

const Address = Data.tagged<Address>("Address")

// User profile with optional fields
interface UserProfile {
  readonly _tag: "UserProfile"
  readonly userId: string
  readonly email: string
  readonly displayName: string
  readonly avatar: Option.Option<string>
  readonly addresses: readonly Address[]
  readonly preferences: {
    readonly emailNotifications: boolean
    readonly theme: "light" | "dark"
    readonly language: string
  }
  readonly lastLoginAt: Option.Option<Date>
}

const UserProfile = Data.tagged<UserProfile>("UserProfile")

// Profile update operations
const createUserProfile = (
  userId: string,
  email: string,
  displayName: string
): UserProfile => UserProfile({
  userId,
  email,
  displayName,
  avatar: Option.none(),
  addresses: [],
  preferences: Data.struct({
    emailNotifications: true,
    theme: "light",
    language: "en"
  }),
  lastLoginAt: Option.none()
})

const updateDisplayName = (profile: UserProfile, displayName: string): UserProfile =>
  Data.struct({
    ...profile,
    displayName
  })

const addAddress = (profile: UserProfile, address: Address): UserProfile =>
  Data.struct({
    ...profile,
    addresses: Data.array([...profile.addresses, address])
  })

const updatePreferences = (
  profile: UserProfile,
  updates: Partial<UserProfile["preferences"]>
): UserProfile =>
  Data.struct({
    ...profile,
    preferences: Data.struct({
      ...profile.preferences,
      ...updates
    })
  })

const setLastLogin = (profile: UserProfile, loginTime: Date): UserProfile =>
  Data.struct({
    ...profile,
    lastLoginAt: Option.some(loginTime)
  })

// Usage with state management
const initialProfile = createUserProfile(
  "user123",
  "alice@example.com",
  "Alice"
)

const homeAddress = Address({
  street: "123 Main St",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  country: "USA"
})

const updatedProfile = initialProfile.pipe(
  profile => updateDisplayName(profile, "Alice Smith"),
  profile => addAddress(profile, homeAddress),
  profile => updatePreferences(profile, { theme: "dark" }),
  profile => setLastLogin(profile, new Date())
)

// Profile comparison for change detection
const profileHasChanged = (oldProfile: UserProfile, newProfile: UserProfile): boolean =>
  !Equal.equals(oldProfile, newProfile)

console.log(profileHasChanged(initialProfile, updatedProfile)) // true
```

### Example 3: Event Sourcing and State Machine

Model domain events and state transitions using tagged unions with pattern matching for complex business logic.

```typescript
import { Data, Match } from "effect"

// Order states as tagged union
type OrderStatus = Data.TaggedEnum<{
  Pending: { orderId: string; customerId: string; items: readonly string[] }
  Processing: { orderId: string; customerId: string; items: readonly string[]; startedAt: Date }
  Shipped: { orderId: string; customerId: string; items: readonly string[]; trackingNumber: string; shippedAt: Date }
  Delivered: { orderId: string; customerId: string; items: readonly string[]; deliveredAt: Date }
  Cancelled: { orderId: string; customerId: string; reason: string; cancelledAt: Date }
}>

const { Pending, Processing, Shipped, Delivered, Cancelled, $match } = Data.taggedEnum<OrderStatus>()

// Order events
type OrderEvent = Data.TaggedEnum<{
  OrderCreated: { orderId: string; customerId: string; items: readonly string[] }
  OrderStartedProcessing: { orderId: string; startedAt: Date }
  OrderShipped: { orderId: string; trackingNumber: string; shippedAt: Date }
  OrderDelivered: { orderId: string; deliveredAt: Date }
  OrderCancelled: { orderId: string; reason: string; cancelledAt: Date }
}>

const { 
  OrderCreated, 
  OrderStartedProcessing, 
  OrderShipped, 
  OrderDelivered, 
  OrderCancelled 
} = Data.taggedEnum<OrderEvent>()

// State machine transition logic
const applyEvent = (currentState: OrderStatus | null, event: OrderEvent): OrderStatus =>
  Match.value(event).pipe(
    Match.when({ _tag: "OrderCreated" }, ({ orderId, customerId, items }) =>
      Pending({ orderId, customerId, items })
    ),
    Match.when({ _tag: "OrderStartedProcessing" }, ({ orderId, startedAt }) =>
      currentState && currentState._tag === "Pending"
        ? Processing({ ...currentState, startedAt })
        : currentState!
    ),
    Match.when({ _tag: "OrderShipped" }, ({ orderId, trackingNumber, shippedAt }) =>
      currentState && currentState._tag === "Processing"
        ? Shipped({ ...currentState, trackingNumber, shippedAt })
        : currentState!
    ),
    Match.when({ _tag: "OrderDelivered" }, ({ orderId, deliveredAt }) =>
      currentState && currentState._tag === "Shipped"
        ? Delivered({ ...currentState, deliveredAt })
        : currentState!
    ),
    Match.when({ _tag: "OrderCancelled" }, ({ orderId, reason, cancelledAt }) =>
      currentState && (currentState._tag === "Pending" || currentState._tag === "Processing")
        ? Cancelled({ ...currentState, reason, cancelledAt })
        : currentState!
    ),
    Match.exhaustive
  )

// Event processing pipeline
const processEvents = (events: readonly OrderEvent[]): OrderStatus | null =>
  events.reduce((state, event) => applyEvent(state, event), null as OrderStatus | null)

// Order status display
const formatOrderStatus = (status: OrderStatus): string =>
  $match(status, {
    Pending: ({ orderId, items }) => 
      `Order ${orderId} is pending with ${items.length} items`,
    Processing: ({ orderId, startedAt }) => 
      `Order ${orderId} started processing at ${startedAt.toISOString()}`,
    Shipped: ({ orderId, trackingNumber, shippedAt }) => 
      `Order ${orderId} shipped on ${shippedAt.toDateString()} (tracking: ${trackingNumber})`,
    Delivered: ({ orderId, deliveredAt }) => 
      `Order ${orderId} delivered on ${deliveredAt.toDateString()}`,
    Cancelled: ({ orderId, reason, cancelledAt }) => 
      `Order ${orderId} cancelled on ${cancelledAt.toDateString()}: ${reason}`
  })

// Example usage
const events = [
  OrderCreated({ orderId: "order-123", customerId: "customer-456", items: ["item1", "item2"] }),
  OrderStartedProcessing({ orderId: "order-123", startedAt: new Date("2024-01-15T10:00:00Z") }),
  OrderShipped({ 
    orderId: "order-123", 
    trackingNumber: "TRACK123", 
    shippedAt: new Date("2024-01-16T14:30:00Z") 
  }),
  OrderDelivered({ orderId: "order-123", deliveredAt: new Date("2024-01-18T16:45:00Z") })
]

const finalState = processEvents(events)
if (finalState) {
  console.log(formatOrderStatus(finalState))
  // Output: "Order order-123 delivered on Thu Jan 18 2024"
}
```

## Advanced Features Deep Dive

### Feature 1: Tagged Enums with Pattern Matching

Tagged enums provide type-safe union types with built-in pattern matching capabilities for complex state management.

#### Basic Tagged Enum Usage

```typescript
import { Data, Match } from "effect"

type Result<T, E> = Data.TaggedEnum<{
  Success: { value: T }
  Failure: { error: E }
}>

interface ResultDefinition extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: Result<this["A"], this["B"]>
}

const { Success, Failure, $match, $is } = Data.taggedEnum<ResultDefinition>()

const divide = (a: number, b: number): Result<number, string> =>
  b === 0 
    ? Failure({ error: "Division by zero" })
    : Success({ value: a / b })
```

#### Real-World Tagged Enum Example

```typescript
import { Data, Effect } from "effect"

// API response states
type ApiResponse<T> = Data.TaggedEnum<{
  Loading: {}
  Success: { data: T; timestamp: Date }
  Error: { message: string; code: number; retryable: boolean }
  NotStarted: {}
}>

interface ApiResponseDefinition extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: ApiResponse<this["A"]>
}

const { Loading, Success, Error, NotStarted, $match } = Data.taggedEnum<ApiResponseDefinition>()

// Response handler with exhaustive pattern matching
const handleApiResponse = <T>(response: ApiResponse<T>) => Effect.gen(function* () {
  return yield* $match(response, {
    NotStarted: () => Effect.succeed("Request not initiated"),
    Loading: () => Effect.succeed("Request in progress..."),
    Success: ({ data, timestamp }) => 
      Effect.succeed(`Data received at ${timestamp.toISOString()}: ${JSON.stringify(data)}`),
    Error: ({ message, code, retryable }) => 
      retryable 
        ? Effect.succeed(`Retryable error ${code}: ${message}`)
        : Effect.fail(`Fatal error ${code}: ${message}`)
  })
})

// Usage with different response types
const userResponse = Success({ data: { id: "123", name: "Alice" }, timestamp: new Date() })
const errorResponse = Error({ message: "User not found", code: 404, retryable: true })

Effect.runSync(handleApiResponse(userResponse)) // "Data received at ..."
```

#### Advanced Tagged Enum: Finite State Machine

```typescript
import { Data, Effect, Schedule } from "effect"

// Connection states for network handling
type ConnectionState = Data.TaggedEnum<{
  Disconnected: { reason?: string }
  Connecting: { attempt: number; startedAt: Date }
  Connected: { connectedAt: Date; lastPingAt: Date }
  Reconnecting: { attempt: number; lastError: string }
  Failed: { error: string; attempts: number }
}>

const { 
  Disconnected, 
  Connecting, 
  Connected, 
  Reconnecting, 
  Failed, 
  $match 
} = Data.taggedEnum<ConnectionState>()

const maxRetries = 3

// State transition logic
const transitionState = (
  currentState: ConnectionState,
  event: "connect" | "success" | "failure" | "ping" | "disconnect",
  error?: string
): ConnectionState =>
  $match(currentState, {
    Disconnected: () => {
      switch (event) {
        case "connect":
          return Connecting({ attempt: 1, startedAt: new Date() })
        default:
          return currentState
      }
    },
    Connecting: ({ attempt }) => {
      switch (event) {
        case "success":
          return Connected({ connectedAt: new Date(), lastPingAt: new Date() })
        case "failure":
          return attempt >= maxRetries
            ? Failed({ error: error || "Connection failed", attempts: attempt })
            : Reconnecting({ attempt: attempt + 1, lastError: error || "Unknown error" })
        default:
          return currentState
      }
    },
    Connected: ({ connectedAt }) => {
      switch (event) {
        case "ping":
          return Connected({ connectedAt, lastPingAt: new Date() })
        case "disconnect":
          return Disconnected({ reason: "User initiated" })
        case "failure":
          return Reconnecting({ attempt: 1, lastError: error || "Connection lost" })
        default:
          return currentState
      }
    },
    Reconnecting: ({ attempt, lastError }) => {
      switch (event) {
        case "success":
          return Connected({ connectedAt: new Date(), lastPingAt: new Date() })
        case "failure":
          return attempt >= maxRetries
            ? Failed({ error: lastError, attempts: attempt })
            : Reconnecting({ attempt: attempt + 1, lastError: error || lastError })
        default:
          return currentState
      }
    },
    Failed: () => {
      switch (event) {
        case "connect":
          return Connecting({ attempt: 1, startedAt: new Date() })
        default:
          return currentState
      }
    }
  })

// Connection management service
const connectionService = Effect.gen(function* () {
  let state: ConnectionState = Disconnected({})
  
  const getState = () => state
  
  const connect = () => Effect.gen(function* () {
    state = transitionState(state, "connect")
    // Simulate connection attempt
    const success = Math.random() > 0.3
    if (success) {
      state = transitionState(state, "success")
    } else {
      state = transitionState(state, "failure", "Network timeout")
    }
    return state
  })
  
  const ping = () => Effect.gen(function* () {
    if (state._tag === "Connected") {
      state = transitionState(state, "ping")
    }
    return state
  })
  
  return { getState, connect, ping } as const
})
```

### Feature 2: Class-Based Data Structures

Class-based data structures provide familiar OOP patterns while maintaining immutability and value equality.

#### Basic Class Usage

```typescript
import { Data, Equal } from "effect"

class Point extends Data.Class<{
  readonly x: number
  readonly y: number
}> {
  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }
  
  distanceTo(other: Point): number {
    const dx = this.x - other.x
    const dy = this.y - other.y
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  translate(dx: number, dy: number): Point {
    return new Point({ x: this.x + dx, y: this.y + dy })
  }
}

const origin = new Point({ x: 0, y: 0 })
const point = new Point({ x: 3, y: 4 })

console.log(point.magnitude) // 5
console.log(origin.distanceTo(point)) // 5
console.log(Equal.equals(origin, new Point({ x: 0, y: 0 }))) // true
```

#### Real-World Class: Money Handling

```typescript
import { Data, Equal } from "effect"

class Money extends Data.Class<{
  readonly amount: number
  readonly currency: string
}> {
  static USD = (amount: number) => new Money({ amount, currency: "USD" })
  static EUR = (amount: number) => new Money({ amount, currency: "EUR" })
  static GBP = (amount: number) => new Money({ amount, currency: "GBP" })
  
  get cents(): number {
    return Math.round(this.amount * 100)
  }
  
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add different currencies: ${this.currency} and ${other.currency}`)
    }
    return new Money({ amount: this.amount + other.amount, currency: this.currency })
  }
  
  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot subtract different currencies: ${this.currency} and ${other.currency}`)
    }
    return new Money({ amount: this.amount - other.amount, currency: this.currency })
  }
  
  multiply(factor: number): Money {
    return new Money({ amount: this.amount * factor, currency: this.currency })
  }
  
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error("Cannot divide by zero")
    }
    return new Money({ amount: this.amount / divisor, currency: this.currency })
  }
  
  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`
  }
  
  toJSON() {
    return { amount: this.amount, currency: this.currency }
  }
}

// Usage examples
const price = Money.USD(19.99)
const tax = Money.USD(1.60)
const total = price.add(tax)

console.log(total.toString()) // "21.59 USD"
console.log(Equal.equals(total, Money.USD(21.59))) // true

// Collections work properly with value equality
const prices = [Money.USD(10), Money.USD(20), Money.USD(10)]
const uniquePrices = [...new Set(prices)] // Properly deduplicated
```

#### Advanced Class: Immutable List

```typescript
import { Data, Equal, Option, Array as Arr } from "effect"

class ImmutableList<T> extends Data.Class<{
  readonly items: readonly T[]
}> {
  static empty<T>(): ImmutableList<T> {
    return new ImmutableList({ items: [] })
  }
  
  static of<T>(...items: T[]): ImmutableList<T> {
    return new ImmutableList({ items: Data.array(items) })
  }
  
  get length(): number {
    return this.items.length
  }
  
  get isEmpty(): boolean {
    return this.items.length === 0
  }
  
  head(): Option.Option<T> {
    return Arr.head(this.items)
  }
  
  tail(): ImmutableList<T> {
    return new ImmutableList({ items: Arr.tail(this.items) })
  }
  
  prepend(item: T): ImmutableList<T> {
    return new ImmutableList({ items: [item, ...this.items] })
  }
  
  append(item: T): ImmutableList<T> {
    return new ImmutableList({ items: [...this.items, item] })
  }
  
  map<U>(f: (item: T) => U): ImmutableList<U> {
    return new ImmutableList({ items: Arr.map(this.items, f) })
  }
  
  filter(predicate: (item: T) => boolean): ImmutableList<T> {
    return new ImmutableList({ items: Arr.filter(this.items, predicate) })
  }
  
  fold<U>(initial: U, f: (acc: U, item: T) => U): U {
    return Arr.reduce(this.items, initial, f)
  }
  
  toArray(): readonly T[] {
    return this.items
  }
}

// Usage
const numbers = ImmutableList.of(1, 2, 3, 4, 5)
const doubled = numbers.map(x => x * 2)
const evens = doubled.filter(x => x % 2 === 0)

console.log(evens.toArray()) // [2, 4, 6, 8, 10]
console.log(Equal.equals(evens, ImmutableList.of(2, 4, 6, 8, 10))) // true
```

### Feature 3: Error Handling with Data

Effect's Data module provides specialized error types that integrate seamlessly with Effect's error handling system.

#### Basic Error Types

```typescript
import { Data, Effect, Console } from "effect"

// Custom error with additional context
class ValidationError extends Data.Error<{
  readonly field: string
  readonly value: unknown
  readonly message: string
}> {}

class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly url: string
  readonly status: number
  readonly message: string
}> {}

// Usage in Effect workflows
const validateEmail = (email: string) => Effect.gen(function* () {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    yield* new ValidationError({
      field: "email",
      value: email,
      message: "Invalid email format"
    })
  }
  return email
})

const fetchUser = (userId: string) => Effect.gen(function* () {
  // Simulate API call
  if (userId === "404") {
    yield* new NetworkError({
      url: `/api/users/${userId}`,
      status: 404,
      message: "User not found"
    })
  }
  return { id: userId, email: "user@example.com" }
})
```

#### Real-World Error Handling: User Registration

```typescript
import { Data, Effect, Console } from "effect"

// Domain errors
class UserAlreadyExistsError extends Data.TaggedError("UserAlreadyExists")<{
  readonly email: string
}> {}

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly operation: string
  readonly cause: string
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string
  readonly value: unknown
  readonly message: string
}> {}

// User registration service
interface UserRegistrationRequest {
  readonly email: string
  readonly password: string
  readonly name: string
}

interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly createdAt: Date
}

const validateRegistrationRequest = (request: UserRegistrationRequest) => Effect.gen(function* () {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(request.email)) {
    return yield* new ValidationError({
      field: "email",
      value: request.email,
      message: "Invalid email format"
    })
  }
  
  // Password validation
  if (request.password.length < 8) {
    return yield* new ValidationError({
      field: "password",
      value: request.password,
      message: "Password must be at least 8 characters long"
    })
  }
  
  // Name validation
  if (request.name.trim().length === 0) {
    return yield* new ValidationError({
      field: "name",
      value: request.name,
      message: "Name cannot be empty"
    })
  }
  
  return request
})

const checkUserExists = (email: string) => Effect.gen(function* () {
  // Simulate database check
  if (email === "existing@example.com") {
    return yield* new UserAlreadyExistsError({ email })
  }
  return false
})

const createUser = (request: UserRegistrationRequest) => Effect.gen(function* () {
  // Simulate database operation
  if (Math.random() < 0.1) { // 10% chance of database error
    return yield* new DatabaseError({
      operation: "createUser",
      cause: "Connection timeout"
    })
  }
  
  const user: User = {
    id: `user_${Date.now()}`,
    email: request.email,
    name: request.name,
    createdAt: new Date()
  }
  
  return user
})

const registerUser = (request: UserRegistrationRequest) => Effect.gen(function* () {
  const validatedRequest = yield* validateRegistrationRequest(request)
  yield* checkUserExists(validatedRequest.email)
  const user = yield* createUser(validatedRequest)
  return user
}).pipe(
  Effect.catchTag("ValidationError", (error) =>
    Console.error(`Validation failed for ${error.field}: ${error.message}`)
  ),
  Effect.catchTag("UserAlreadyExists", (error) =>
    Console.error(`User with email ${error.email} already exists`)
  ),
  Effect.catchTag("DatabaseError", (error) =>
    Console.error(`Database error during ${error.operation}: ${error.cause}`)
  )
)

// Usage
const registrationRequest = {
  email: "alice@example.com",
  password: "securepassword123",
  name: "Alice Smith"
}

Effect.runPromise(registerUser(registrationRequest))
  .then(user => console.log("User registered:", user))
  .catch(error => console.error("Registration failed:", error))
```

## Practical Patterns & Best Practices

### Pattern 1: Immutable Update Helpers

Create reusable helpers for common update patterns while maintaining immutability:

```typescript
import { Data } from "effect"

// Generic update helper for nested structures
const updateField = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  field: K,
  value: T[K]
): T => Data.struct({ ...obj, [field]: value })

const updateNested = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  field: K,
  updates: Partial<T[K] extends Record<string, any> ? T[K] : never>
): T => Data.struct({
  ...obj,
  [field]: Data.struct({
    ...(obj[field] as any),
    ...updates
  })
})

// Array update helpers
const appendToArray = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  field: K,
  item: T[K] extends readonly any[] ? T[K][number] : never
): T => Data.struct({
  ...obj,
  [field]: [...(obj[field] as any[]), item]
})

const removeFromArray = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  field: K,
  predicate: (item: T[K] extends readonly any[] ? T[K][number] : never) => boolean
): T => Data.struct({
  ...obj,
  [field]: (obj[field] as any[]).filter(item => !predicate(item))
})

// Usage example
interface UserProfile {
  readonly name: string
  readonly settings: {
    readonly theme: string
    readonly notifications: boolean
  }
  readonly tags: readonly string[]
}

const profile = Data.struct({
  name: "Alice",
  settings: Data.struct({
    theme: "light",
    notifications: true
  }),
  tags: Data.array(["developer", "typescript"])
})

const updatedProfile = profile.pipe(
  p => updateField(p, "name", "Alice Smith"),
  p => updateNested(p, "settings", { theme: "dark" }),
  p => appendToArray(p, "tags", "effect")
)
```

### Pattern 2: Builder Pattern with Data

Implement fluent builders for complex data structures:

```typescript
import { Data, Option } from "effect"

interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly username: string
  readonly password: Option.Option<string>
  readonly ssl: boolean
  readonly connectionTimeout: number
  readonly maxConnections: number
  readonly retryAttempts: number
}

class DatabaseConfigBuilder {
  private config: Partial<DatabaseConfig> = {}
  
  host(host: string): this {
    this.config.host = host
    return this
  }
  
  port(port: number): this {
    this.config.port = port
    return this
  }
  
  database(database: string): this {
    this.config.database = database
    return this
  }
  
  credentials(username: string, password?: string): this {
    this.config.username = username
    this.config.password = password ? Option.some(password) : Option.none()
    return this
  }
  
  ssl(enabled: boolean = true): this {
    this.config.ssl = enabled
    return this
  }
  
  connectionTimeout(timeout: number): this {
    this.config.connectionTimeout = timeout
    return this
  }
  
  maxConnections(max: number): this {
    this.config.maxConnections = max
    return this
  }
  
  retryAttempts(attempts: number): this {
    this.config.retryAttempts = attempts
    return this
  }
  
  build(): DatabaseConfig {
    const defaults = {
      host: "localhost",
      port: 5432,
      ssl: false,
      connectionTimeout: 30000,
      maxConnections: 10,
      retryAttempts: 3,
      password: Option.none<string>()
    }
    
    if (!this.config.database || !this.config.username) {
      throw new Error("Database and username are required")
    }
    
    return Data.struct({
      ...defaults,
      ...this.config
    } as DatabaseConfig)
  }
}

// Usage
const config = new DatabaseConfigBuilder()
  .host("production-db.example.com")
  .port(5432)
  .database("myapp")
  .credentials("appuser", "secretpassword")
  .ssl(true)
  .maxConnections(50)
  .build()
```

### Pattern 3: Validation Pipeline with Data

Combine validation functions with immutable data structures:

```typescript
import { Data, Effect, Array as Arr, Either } from "effect"

// Validation result type
type ValidationResult<T> = Either.Either<readonly string[], T>

// Validation functions
const required = (value: unknown, fieldName: string): ValidationResult<unknown> =>
  value !== null && value !== undefined && value !== ""
    ? Either.right(value)
    : Either.left([`${fieldName} is required`])

const minLength = (value: string, min: number, fieldName: string): ValidationResult<string> =>
  value.length >= min
    ? Either.right(value)
    : Either.left([`${fieldName} must be at least ${min} characters`])

const maxLength = (value: string, max: number, fieldName: string): ValidationResult<string> =>
  value.length <= max
    ? Either.right(value)
    : Either.left([`${fieldName} must be at most ${max} characters`])

const email = (value: string, fieldName: string): ValidationResult<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
    ? Either.right(value)
    : Either.left([`${fieldName} must be a valid email address`])
}

// Validation pipeline
const validateField = <T>(
  value: unknown,
  fieldName: string,
  ...validators: ((value: any, fieldName: string) => ValidationResult<any>)[]
): ValidationResult<T> => {
  const results = validators.reduce(
    (acc, validator) => 
      Either.match(acc, {
        onLeft: errors => Either.left(errors),
        onRight: value => validator(value, fieldName)
      }),
    required(value, fieldName)
  )
  
  return results as ValidationResult<T>
}

const combineValidations = <T extends Record<string, any>>(
  validations: { [K in keyof T]: ValidationResult<T[K]> }
): ValidationResult<T> => {
  const entries = Object.entries(validations) as Array<[keyof T, ValidationResult<T[keyof T]>]>
  const errors: string[] = []
  const values: Partial<T> = {}
  
  for (const [key, result] of entries) {
    Either.match(result, {
      onLeft: errs => errors.push(...errs),
      onRight: value => { values[key] = value }
    })
  }
  
  return errors.length > 0 
    ? Either.left(errors)
    : Either.right(Data.struct(values) as T)
}

// Usage example
interface UserRegistration {
  readonly name: string
  readonly email: string
  readonly password: string
}

const validateUserRegistration = (data: {
  name?: string
  email?: string
  password?: string
}): ValidationResult<UserRegistration> => {
  const validations = {
    name: validateField<string>(
      data.name,
      "name",
      (value, field) => minLength(value, 2, field),
      (value, field) => maxLength(value, 50, field)
    ),
    email: validateField<string>(
      data.email,
      "email",
      (value, field) => email(value, field)
    ),
    password: validateField<string>(
      data.password,
      "password",
      (value, field) => minLength(value, 8, field)
    )
  }
  
  return combineValidations(validations)
}

// Test the validation
const validData = validateUserRegistration({
  name: "Alice Smith",
  email: "alice@example.com",
  password: "secretpassword123"
})

const invalidData = validateUserRegistration({
  name: "A",
  email: "invalid-email",
  password: "short"
})

console.log(Either.isRight(validData)) // true
console.log(Either.isLeft(invalidData)) // true
if (Either.isLeft(invalidData)) {
  console.log(invalidData.left) // Array of validation errors
}
```

## Integration Examples

### Integration with React State Management

Leverage Data's immutability and equality for efficient React state updates:

```typescript
import { Data, Equal } from "effect"
import { useState, useCallback, useMemo } from "react"

// Application state with nested data
interface AppState {
  readonly user: {
    readonly id: string
    readonly name: string
    readonly email: string
  } | null
  readonly todos: readonly {
    readonly id: string
    readonly text: string
    readonly completed: boolean
    readonly createdAt: Date
  }[]
  readonly ui: {
    readonly loading: boolean
    readonly filter: "all" | "active" | "completed"
    readonly theme: "light" | "dark"
  }
}

const initialState: AppState = Data.struct({
  user: null,
  todos: Data.array([]),
  ui: Data.struct({
    loading: false,
    filter: "all",
    theme: "light"
  })
})

// Custom hook for immutable state management
function useImmutableState<T>(initialValue: T) {
  const [state, setState] = useState(initialValue)
  
  // Only update if the new state is actually different
  const updateState = useCallback((newState: T) => {
    setState(prevState => 
      Equal.equals(prevState, newState) ? prevState : newState
    )
  }, [])
  
  return [state, updateState] as const
}

// React component using immutable state
function TodoApp() {
  const [appState, setAppState] = useImmutableState(initialState)
  
  const addTodo = useCallback((text: string) => {
    const newTodo = Data.struct({
      id: `todo-${Date.now()}`,
      text,
      completed: false,
      createdAt: new Date()
    })
    
    setAppState(Data.struct({
      ...appState,
      todos: Data.array([...appState.todos, newTodo])
    }))
  }, [appState, setAppState])
  
  const toggleTodo = useCallback((id: string) => {
    setAppState(Data.struct({
      ...appState,
      todos: Data.array(
        appState.todos.map(todo =>
          todo.id === id 
            ? Data.struct({ ...todo, completed: !todo.completed })
            : todo
        )
      )
    }))
  }, [appState, setAppState])
  
  const setFilter = useCallback((filter: AppState["ui"]["filter"]) => {
    setAppState(Data.struct({
      ...appState,
      ui: Data.struct({
        ...appState.ui,
        filter
      })
    }))
  }, [appState, setAppState])
  
  // Memoized computed values using structural equality
  const filteredTodos = useMemo(() => {
    switch (appState.ui.filter) {
      case "active":
        return appState.todos.filter(todo => !todo.completed)
      case "completed":
        return appState.todos.filter(todo => todo.completed)
      default:
        return appState.todos
    }
  }, [appState.todos, appState.ui.filter])
  
  const todoStats = useMemo(() => ({
    total: appState.todos.length,
    completed: appState.todos.filter(todo => todo.completed).length,
    active: appState.todos.filter(todo => !todo.completed).length
  }), [appState.todos])
  
  // Component renders...
  return null // React JSX would go here
}
```

### Integration with Node.js Configuration

Use Data structures for type-safe configuration management:

```typescript
import { Data, Effect, Config } from "effect"

// Application configuration schema
interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly username: string
  readonly password: string
  readonly ssl: boolean
  readonly poolSize: number
}

interface RedisConfig {
  readonly host: string
  readonly port: number
  readonly password?: string
  readonly db: number
}

interface AppConfig {
  readonly server: {
    readonly port: number
    readonly host: string
    readonly corsOrigins: readonly string[]
  }
  readonly database: DatabaseConfig
  readonly redis: RedisConfig
  readonly logging: {
    readonly level: "debug" | "info" | "warn" | "error"
    readonly format: "json" | "text"
  }
  readonly features: {
    readonly authentication: boolean
    readonly rateLimit: boolean
    readonly caching: boolean
  }
}

// Configuration loading with validation
const loadDatabaseConfig = Effect.gen(function* () {
  const host = yield* Config.string("DB_HOST").pipe(Config.withDefault("localhost"))
  const port = yield* Config.integer("DB_PORT").pipe(Config.withDefault(5432))
  const database = yield* Config.string("DB_NAME")
  const username = yield* Config.string("DB_USER")
  const password = yield* Config.string("DB_PASSWORD")
  const ssl = yield* Config.boolean("DB_SSL").pipe(Config.withDefault(false))
  const poolSize = yield* Config.integer("DB_POOL_SIZE").pipe(Config.withDefault(10))
  
  return Data.struct({
    host,
    port,
    database,
    username,
    password,
    ssl,
    poolSize
  }) as DatabaseConfig
})

const loadRedisConfig = Effect.gen(function* () {
  const host = yield* Config.string("REDIS_HOST").pipe(Config.withDefault("localhost"))
  const port = yield* Config.integer("REDIS_PORT").pipe(Config.withDefault(6379))
  const password = yield* Config.string("REDIS_PASSWORD").pipe(Config.optional)
  const db = yield* Config.integer("REDIS_DB").pipe(Config.withDefault(0))
  
  return Data.struct({
    host,
    port,
    password,
    db
  }) as RedisConfig
})

const loadAppConfig = Effect.gen(function* () {
  const serverPort = yield* Config.integer("PORT").pipe(Config.withDefault(3000))
  const serverHost = yield* Config.string("HOST").pipe(Config.withDefault("0.0.0.0"))
  const corsOrigins = yield* Config.string("CORS_ORIGINS")
    .pipe(
      Config.withDefault("http://localhost:3000"),
      Config.map(origins => Data.array(origins.split(",")))
    )
  
  const database = yield* loadDatabaseConfig
  const redis = yield* loadRedisConfig
  
  const logLevel = yield* Config.string("LOG_LEVEL")
    .pipe(Config.withDefault("info"))
    .pipe(Config.validate(level => 
      ["debug", "info", "warn", "error"].includes(level) 
        ? Effect.succeed(level as AppConfig["logging"]["level"])
        : Effect.fail(Config.Error.InvalidData([], `Invalid log level: ${level}`))
    ))
  
  const logFormat = yield* Config.string("LOG_FORMAT")
    .pipe(Config.withDefault("json"))
    .pipe(Config.validate(format =>
      ["json", "text"].includes(format)
        ? Effect.succeed(format as AppConfig["logging"]["format"])
        : Effect.fail(Config.Error.InvalidData([], `Invalid log format: ${format}`))
    ))
  
  const enableAuth = yield* Config.boolean("ENABLE_AUTH").pipe(Config.withDefault(true))
  const enableRateLimit = yield* Config.boolean("ENABLE_RATE_LIMIT").pipe(Config.withDefault(true))
  const enableCaching = yield* Config.boolean("ENABLE_CACHING").pipe(Config.withDefault(true))
  
  return Data.struct({
    server: Data.struct({
      port: serverPort,
      host: serverHost,
      corsOrigins
    }),
    database,
    redis,
    logging: Data.struct({
      level: logLevel,
      format: logFormat
    }),
    features: Data.struct({
      authentication: enableAuth,
      rateLimit: enableRateLimit,
      caching: enableCaching
    })
  }) as AppConfig
})

// Usage in application startup
const startApplication = Effect.gen(function* () {
  const config = yield* loadAppConfig
  
  console.log("Starting application with config:", {
    server: config.server,
    database: { ...config.database, password: "[REDACTED]" },
    redis: { ...config.redis, password: config.redis.password ? "[REDACTED]" : undefined },
    logging: config.logging,
    features: config.features
  })
  
  // Application initialization logic here...
  return config
})

// Configuration hot-reloading
const createConfigWatcher = (initialConfig: AppConfig) => Effect.gen(function* () {
  let currentConfig = initialConfig
  
  const reloadConfig = () => Effect.gen(function* () {
    const newConfig = yield* loadAppConfig
    
    if (!Equal.equals(currentConfig, newConfig)) {
      console.log("Configuration changed, reloading...")
      currentConfig = newConfig
      // Emit configuration change events
      return newConfig
    }
    
    return currentConfig
  })
  
  return { getCurrentConfig: () => currentConfig, reloadConfig }
})
```

### Integration with Testing

Use Data structures for test data generation and assertion:

```typescript
import { Data, Equal, Effect, Array as Arr } from "effect"
import { describe, it, expect } from "vitest"

// Test data models
interface TestUser {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly age: number
  readonly preferences: {
    readonly theme: "light" | "dark"
    readonly notifications: boolean
  }
}

interface TestOrder {
  readonly id: string
  readonly userId: string
  readonly items: readonly {
    readonly productId: string
    readonly quantity: number
    readonly price: number
  }[]
  readonly status: "pending" | "processing" | "shipped" | "delivered"
  readonly total: number
}

// Test data factories
const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => {
  const defaults = {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name: "Test User",
    email: "test@example.com",
    age: 25,
    preferences: Data.struct({
      theme: "light" as const,
      notifications: true
    })
  }
  
  return Data.struct({
    ...defaults,
    ...overrides,
    preferences: Data.struct({
      ...defaults.preferences,
      ...(overrides.preferences || {})
    })
  })
}

const createTestOrder = (userId: string, overrides: Partial<TestOrder> = {}): TestOrder => {
  const defaults = {
    id: `order-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    items: Data.array([
      Data.struct({
        productId: "prod-1",
        quantity: 1,
        price: 19.99
      })
    ]),
    status: "pending" as const,
    total: 19.99
  }
  
  return Data.struct({
    ...defaults,
    ...overrides
  })
}

// Test data builders for complex scenarios
class TestDataBuilder {
  private users: TestUser[] = []
  private orders: TestOrder[] = []
  
  addUser(user: Partial<TestUser> = {}): this {
    this.users.push(createTestUser(user))
    return this
  }
  
  addUsers(count: number, userTemplate: Partial<TestUser> = {}): this {
    for (let i = 0; i < count; i++) {
      this.addUser({
        ...userTemplate,
        name: `${userTemplate.name || "User"} ${i + 1}`,
        email: `user${i + 1}@example.com`
      })
    }
    return this
  }
  
  addOrderForUser(userId: string, order: Partial<TestOrder> = {}): this {
    this.orders.push(createTestOrder(userId, order))
    return this
  }
  
  build() {
    return Data.struct({
      users: Data.array(this.users),
      orders: Data.array(this.orders)
    })
  }
}

// Test utilities
const expectDataEqual = <T>(actual: T, expected: T) => {
  expect(Equal.equals(actual, expected)).toBe(true)
}

const expectDataNotEqual = <T>(actual: T, expected: T) => {
  expect(Equal.equals(actual, expected)).toBe(false)
}

// Example tests
describe("User Management", () => {
  it("should create user with correct defaults", () => {
    const user = createTestUser()
    expect(user.name).toBe("Test User")
    expect(user.email).toBe("test@example.com")
    expect(user.preferences.theme).toBe("light")
    expect(user.preferences.notifications).toBe(true)
  })
  
  it("should override defaults correctly", () => {
    const user = createTestUser({
      name: "Alice",
      age: 30,
      preferences: { theme: "dark", notifications: false }
    })
    
    expect(user.name).toBe("Alice")
    expect(user.age).toBe(30)
    expect(user.preferences.theme).toBe("dark")
    expect(user.preferences.notifications).toBe(false)
  })
  
  it("should compare users by value", () => {
    const user1 = createTestUser({ name: "Alice", age: 30 })
    const user2 = createTestUser({ name: "Alice", age: 30 })
    const user3 = createTestUser({ name: "Bob", age: 30 })
    
    // Same values should be equal
    expectDataEqual(user1, user2)
    expectDataNotEqual(user1, user3)
  })
  
  it("should build complex test scenarios", () => {
    const testData = new TestDataBuilder()
      .addUsers(3, { age: 25 })
      .addUser({ name: "Admin", email: "admin@example.com", age: 35 })
      .build()
    
    expect(testData.users).toHaveLength(4)
    expect(testData.users[0].age).toBe(25)
    expect(testData.users[3].name).toBe("Admin")
  })
})

describe("Order Processing", () => {
  it("should calculate order total correctly", () => {
    const user = createTestUser()
    const order = createTestOrder(user.id, {
      items: Data.array([
        Data.struct({ productId: "prod-1", quantity: 2, price: 10.00 }),
        Data.struct({ productId: "prod-2", quantity: 1, price: 15.00 })
      ])
    })
    
    const expectedTotal = 2 * 10.00 + 1 * 15.00
    const actualTotal = Arr.reduce(
      order.items,
      0,
      (sum, item) => sum + item.quantity * item.price
    )
    
    expect(actualTotal).toBe(expectedTotal)
  })
  
  it("should handle order state transitions", () => {
    const user = createTestUser()
    const initialOrder = createTestOrder(user.id, { status: "pending" })
    
    const processingOrder = Data.struct({
      ...initialOrder,
      status: "processing" as const
    })
    
    const shippedOrder = Data.struct({
      ...processingOrder,
      status: "shipped" as const
    })
    
    expect(initialOrder.status).toBe("pending")
    expect(processingOrder.status).toBe("processing")
    expect(shippedOrder.status).toBe("shipped")
    
    // Orders should be different due to status change
    expectDataNotEqual(initialOrder, processingOrder)
    expectDataNotEqual(processingOrder, shippedOrder)
  })
})
```

## Conclusion

Data provides a robust foundation for building reliable TypeScript applications through immutable data structures, value-based equality, and type-safe patterns. By eliminating common pitfalls around object identity and mutation, Data enables predictable state management and efficient data handling.

Key benefits:
- **Value Equality**: Compare objects by content, not reference, eliminating equality bugs
- **Immutability**: Prevent accidental mutations with readonly data structures
- **Type Safety**: Leverage TypeScript's type system with tagged unions and pattern matching
- **Performance**: Efficient structural hashing and equality checking for collections
- **Composability**: Build complex data types from simple, reusable patterns

Data is essential for applications requiring reliable state management, complex domain modeling, or integration with Effect's ecosystem of functional programming tools.