# Function: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Function Solves

JavaScript's function handling, while flexible, lacks the composability patterns and utilities found in functional programming languages. Common tasks like currying, partial application, and safe function composition require repetitive boilerplate:

```typescript
// Traditional approach - manual composition and currying
const add = (a: number, b: number) => a + b
const multiply = (a: number, b: number) => a * b
const subtract = (a: number, b: number) => a - b

// Manual currying
const addCurried = (a: number) => (b: number) => a + b
const add5 = addCurried(5)

// Manual composition - error-prone nesting
const calculate = (x: number) => {
  const added = add(x, 10)
  const multiplied = multiply(added, 2)
  const result = subtract(multiplied, 3)
  return result
}

// Alternative - hard to read
const calculateNested = (x: number) => 
  subtract(multiply(add(x, 10), 2), 3)

// Partial application requires manual binding
const logWithPrefix = (prefix: string, level: string, message: string) => {
  console.log(`[${prefix}] ${level}: ${message}`)
}

const appLogger = (level: string, message: string) => 
  logWithPrefix("APP", level, message)

const errorLogger = (message: string) => 
  appLogger("ERROR", message)

// Type safety is lost with manual composition
interface User { id: string; name: string; email: string }
interface Order { id: string; userId: string; total: number }

const getUser = (id: string): User | null => ({ id, name: "John", email: "john@example.com" })
const getOrders = (userId: string): Order[] => [{ id: "1", userId, total: 100 }]
const calculateTotal = (orders: Order[]): number => orders.reduce((sum, o) => sum + o.total, 0)

// Manual null checking and error handling
const getUserOrderTotal = (userId: string): number => {
  const user = getUser(userId)
  if (!user) {
    throw new Error("User not found")
  }
  
  const orders = getOrders(user.id)
  if (!orders) {
    throw new Error("Orders not found")
  }
  
  return calculateTotal(orders)
}

// Function utilities scattered across different libraries
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const throttle = (fn: Function, limit: number) => {
  let inThrottle: boolean
  return (...args: any[]) => {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
```

This approach leads to:
- **Verbose composition** - Manual nesting and intermediate variables clutter the code
- **Type safety loss** - Manual composition breaks TypeScript's type inference
- **Scattered utilities** - Function helpers spread across different libraries with inconsistent APIs

### The Function Solution

Effect's Function module provides a comprehensive toolkit for functional programming patterns with full type safety:

```typescript
import { Function as Fn, pipe, Effect } from "effect"

// Simple transformations with pipe
const calculate = (x: number) => 
  pipe(
    x + 10,
    (n) => n * 2,
    (n) => n - 3
  )

// Using flow for reusable transformation functions
const calculateFlow = Fn.flow(
  (x: number) => x + 10,
  (n) => n * 2,
  (n) => n - 3
)

// Automatic currying with full type safety
const add = Fn.curry((a: number, b: number) => a + b)
const add5 = add(5) // (b: number) => number
const result = add5(3) // 8

// Partial application
const logWithPrefix = Fn.curry((prefix: string, level: string, message: string) => {
  console.log(`[${prefix}] ${level}: ${message}`)
})

const appLogger = logWithPrefix("APP")
const errorLogger = appLogger("ERROR")
errorLogger("Something went wrong") // [APP] ERROR: Something went wrong

// Complex Effect composition with Effect.gen + yield*
const getUserOrderTotal = (userId: string) =>
  Effect.gen(function* () {
    const user = yield* getUser(userId).pipe(
      Effect.fromNullable,
      Effect.orElseFail(() => "User not found")
    )
    const orders = yield* getOrdersEffect(user.id)
    const total = yield* Effect.sync(() => calculateTotal(orders))
    return total
  }).pipe(
    Effect.catchAll(() => Effect.fail("Failed to calculate total"))
  )

// Built-in utilities with consistent API
const debouncedSave = Fn.debounce(saveData, 1000)
const throttledUpdate = Fn.throttle(updateUI, 100)
```

### Key Concepts

**Composition**: `flow` and `pipe` enable clean, left-to-right function composition with full type inference.

**Currying**: Automatic transformation of multi-argument functions into a sequence of single-argument functions.

**Utilities**: Consistent API for common function patterns like debouncing, throttling, and memoization.

## Basic Usage Patterns

### Function Composition

```typescript
import { Function as Fn, pipe } from "effect"

// Basic composition with flow
const processText = Fn.flow(
  (text: string) => text.trim(),
  (text) => text.toLowerCase(),
  (text) => text.replace(/\s+/g, "-"),
  (text) => text.slice(0, 50)
)

const slug = processText("  Hello World Example  ")
console.log(slug) // "hello-world-example"

// Simple transformation pipeline with pipe
const processNumber = (x: number) =>
  pipe(
    Math.abs(x),
    (n) => n * 2,
    (n) => Math.round(n),
    (n) => Math.min(n, 100)
  )

// Complex conditional processing with Effect.gen + yield*
const processUser = (user: { name: string; age: number; email?: string }) =>
  Effect.gen(function* () {
    // Always apply these transformations
    const processedUser = {
      ...user,
      name: user.name.trim(),
      age: Math.max(0, user.age)
    }
    
    // Conditionally apply email processing
    if (user.email) {
      return {
        ...processedUser,
        email: user.email.toLowerCase()
      }
    }
    
    return processedUser
  })

// Complex validation with Effect.gen + yield*
const validateAndProcess = (input: string) =>
  Effect.gen(function* () {
    const trimmed = input.trim()
    
    if (trimmed.length === 0) {
      return yield* Effect.fail("Input cannot be empty")
    }
    
    const lowercased = trimmed.toLowerCase()
    const sanitized = lowercased.replace(/[^a-z0-9]/g, "")
    
    return sanitized
  })
```

### Currying and Partial Application

```typescript
import { Function as Fn } from "effect"

// Basic currying
const add = Fn.curry((a: number, b: number, c: number) => a + b + c)

const add5 = add(5)           // (b: number, c: number) => number
const add5and3 = add5(3)      // (c: number) => number
const result = add5and3(2)    // 10

// Practical currying example
const formatCurrency = Fn.curry((
  locale: string,
  currency: string,
  amount: number
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
})

const formatUSD = formatCurrency("en-US", "USD")
const formatEUR = formatCurrency("de-DE", "EUR")

console.log(formatUSD(123.45))  // "$123.45"
console.log(formatEUR(123.45))  // "123,45 €"

// Database query builder using currying
const createQuery = Fn.curry((
  table: string,
  columns: string[],
  conditions: Record<string, any>
) => {
  const columnList = columns.join(", ")
  const whereClause = Object.entries(conditions)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(" AND ")
  
  return `SELECT ${columnList} FROM ${table} WHERE ${whereClause}`
})

const userQuery = createQuery("users")
const userNameQuery = userQuery(["name", "email"])
const activeUserQuery = userNameQuery({ active: true })

console.log(activeUserQuery) // SELECT name, email FROM users WHERE active = 'true'

// Event handler currying
const handleEvent = Fn.curry((
  eventType: string,
  element: HTMLElement,
  handler: (event: Event) => void
) => {
  element.addEventListener(eventType, handler)
  return () => element.removeEventListener(eventType, handler)
})

const onClick = handleEvent("click")
const onButtonClick = onClick(document.getElementById("myButton")!)

const removeListener = onButtonClick((event) => {
  console.log("Button clicked!")
})
```

### Function Utilities

```typescript
import { Function as Fn } from "effect"

// Identity and constant functions
const identity = Fn.identity  // <T>(x: T) => T
const always = Fn.constant    // <T>(value: T) => () => T

const getId = Fn.identity // Type-safe identity
const getTrue = Fn.constant(true) // () => boolean

// Function flipping (argument order reversal)
const divide = (a: number, b: number) => a / b
const flippedDivide = Fn.flip(divide) // (b: number, a: number) => number

console.log(divide(10, 2))        // 5
console.log(flippedDivide(2, 10)) // 5

// Practical flip usage
const contains = (haystack: string, needle: string) => haystack.includes(needle)
const isContainedIn = Fn.flip(contains)

const text = "Hello World"
console.log(contains(text, "World"))    // true
console.log(isContainedIn("World", text)) // true

// Argument tuple handling
const addThree = (a: number, b: number, c: number) => a + b + c
const addThreeTupled = Fn.tupled(addThree) // (args: [number, number, number]) => number
const addThreeUntupled = Fn.untupled(addThreeTupled) // (a: number, b: number, c: number) => number

console.log(addThreeTupled([1, 2, 3])) // 6

// Function contravariance
const compareLength = (a: string, b: string) => a.length - b.length
const compareByProperty = Fn.contramap(
  compareLength,
  (user: { name: string }) => user.name
)

const users = [
  { name: "Alice" },
  { name: "Bob" },
  { name: "Charlie" }
]

users.sort(compareByProperty) // Sorts by name length
```

## Real-World Examples

### Example 1: Data Pipeline Processing

Building complex data transformation pipelines using function composition:

```typescript
import { Function as Fn, pipe, Array as Arr, Option as O } from "effect"

// Raw data types
interface RawUser {
  id: string
  first_name: string
  last_name: string
  email_address: string
  birth_date: string
  is_active: boolean
  preferences?: {
    newsletter?: boolean
    notifications?: boolean
  }
}

interface ProcessedUser {
  id: string
  fullName: string
  email: string
  age: number
  isActive: boolean
  preferences: {
    newsletter: boolean
    notifications: boolean
  }
}

// Individual transformation functions
const normalizeEmail = (email: string): string =>
  email.toLowerCase().trim()

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())
    ? age - 1
    : age
}

const normalizePreferences = (prefs?: { newsletter?: boolean; notifications?: boolean }) => ({
  newsletter: prefs?.newsletter ?? false,
  notifications: prefs?.notifications ?? true
})

// Validation functions
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const isValidAge = (age: number): boolean =>
  age >= 0 && age <= 150

const isValidName = (name: string): boolean =>
  name.trim().length >= 2

// Curried validation
const validateField = Fn.curry(<T>(
  validator: (value: T) => boolean,
  errorMessage: string,
  value: T
): T => {
  if (!validator(value)) {
    throw new Error(errorMessage)
  }
  return value
})

const validateEmail = validateField(isValidEmail, "Invalid email address")
const validateAge = validateField(isValidAge, "Invalid age")
const validateName = validateField(isValidName, "Invalid name")

// Data transformation pipeline
const processUser = Fn.flow(
  // Extract and validate basic fields
  (raw: RawUser) => ({
    id: raw.id,
    firstName: validateName(raw.first_name.trim()),
    lastName: validateName(raw.last_name.trim()),
    email: validateEmail(normalizeEmail(raw.email_address)),
    birthDate: raw.birth_date,
    isActive: raw.is_active,
    preferences: raw.preferences
  }),
  
  // Transform to final shape
  (validated) => ({
    id: validated.id,
    fullName: `${validated.firstName} ${validated.lastName}`,
    email: validated.email,
    age: validateAge(calculateAge(validated.birthDate)),
    isActive: validated.isActive,
    preferences: normalizePreferences(validated.preferences)
  })
)

// Batch processing with error handling
const processUsers = (rawUsers: RawUser[]): {
  successful: ProcessedUser[]
  failed: Array<{ user: RawUser; error: string }>
} => {
  const results = rawUsers.map(user => {
    try {
      return { success: true as const, data: processUser(user) }
    } catch (error) {
      return { 
        success: false as const, 
        user, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }
    }
  })
  
  return {
    successful: results
      .filter(r => r.success)
      .map(r => r.data),
    failed: results
      .filter(r => !r.success)
      .map(r => ({ user: r.user, error: r.error }))
  }
}

// Advanced filtering and grouping
const analyzeUsers = Fn.flow(
  // Filter active users
  Arr.filter((user: ProcessedUser) => user.isActive),
  
  // Group by age ranges
  Arr.groupBy((user: ProcessedUser) => 
    user.age < 18 ? "minor" :
    user.age < 65 ? "adult" : "senior"
  ),
  
  // Calculate statistics for each group
  Object.entries,
  Arr.map(([ageGroup, users]) => ({
    ageGroup,
    count: users.length,
    avgAge: users.reduce((sum, u) => sum + u.age, 0) / users.length,
    newsletterSubscribers: users.filter(u => u.preferences.newsletter).length,
    notificationOptIns: users.filter(u => u.preferences.notifications).length
  }))
)

// Usage example
const rawData: RawUser[] = [
  {
    id: "1",
    first_name: "  John  ",
    last_name: "Doe",
    email_address: "JOHN.DOE@EXAMPLE.COM",
    birth_date: "1990-05-15",
    is_active: true,
    preferences: { newsletter: true }
  },
  {
    id: "2",
    first_name: "Jane",
    last_name: "Smith",
    email_address: "jane.smith@test.com",
    birth_date: "1985-12-03",
    is_active: true,
    preferences: { notifications: false }
  }
]

const { successful, failed } = processUsers(rawData)
const analysis = analyzeUsers(successful)

console.log("Processed users:", successful)
console.log("Failed users:", failed)
console.log("Analysis:", analysis)
```

### Example 2: Event-Driven Architecture

Building event handlers and processors using function composition:

```typescript
import { Function as Fn, pipe, Effect, Array as Arr } from "effect"

// Event types
interface BaseEvent {
  id: string
  timestamp: Date
  type: string
  source: string
}

interface UserCreatedEvent extends BaseEvent {
  type: "user.created"
  payload: {
    userId: string
    email: string
    name: string
  }
}

interface OrderPlacedEvent extends BaseEvent {
  type: "order.placed"
  payload: {
    orderId: string
    userId: string
    amount: number
    items: Array<{ productId: string; quantity: number }>
  }
}

interface PaymentProcessedEvent extends BaseEvent {
  type: "payment.processed"
  payload: {
    paymentId: string
    orderId: string
    amount: number
    status: "success" | "failed"
  }
}

type DomainEvent = UserCreatedEvent | OrderPlacedEvent | PaymentProcessedEvent

// Event handler type
type EventHandler<T extends DomainEvent> = (event: T) => Effect.Effect<void>

// Event filtering and routing
const isEventType = <T extends DomainEvent>(type: T["type"]) =>
  (event: DomainEvent): event is T => event.type === type

const isUserEvent = isEventType("user.created")
const isOrderEvent = isEventType("order.placed")
const isPaymentEvent = isEventType("payment.processed")

// Curried event handler creator
const createHandler = Fn.curry(<T extends DomainEvent>(
  predicate: (event: DomainEvent) => event is T,
  handler: EventHandler<T>
) => (event: DomainEvent): Effect.Effect<void> => {
  if (predicate(event)) {
    return handler(event)
  }
  return Effect.unit
})

// Individual event handlers
const handleUserCreated: EventHandler<UserCreatedEvent> = (event) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`New user created: ${event.payload.name}`)
    
    // Send welcome email
    yield* sendWelcomeEmail(event.payload.email, event.payload.name)
    
    // Initialize user preferences
    yield* initializeUserPreferences(event.payload.userId)
    
    // Track analytics
    yield* trackEvent("user_signup", {
      userId: event.payload.userId,
      timestamp: event.timestamp
    })
  })

const handleOrderPlaced: EventHandler<OrderPlacedEvent> = (event) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Order placed: ${event.payload.orderId}`)
    
    // Update inventory
    yield* Effect.all(
      event.payload.items.map(item =>
        updateInventory(item.productId, -item.quantity)
      )
    )
    
    // Send order confirmation
    yield* sendOrderConfirmation(event.payload.userId, event.payload.orderId)
    
    // Process payment
    yield* processPayment(event.payload.orderId, event.payload.amount)
  })

const handlePaymentProcessed: EventHandler<PaymentProcessedEvent> = (event) =>
  Effect.gen(function* () {
    if (event.payload.status === "success") {
      yield* Effect.logInfo(`Payment successful: ${event.payload.paymentId}`)
      yield* updateOrderStatus(event.payload.orderId, "confirmed")
      yield* scheduleShipment(event.payload.orderId)
    } else {
      yield* Effect.logError(`Payment failed: ${event.payload.paymentId}`)
      yield* updateOrderStatus(event.payload.orderId, "payment_failed")
      yield* sendPaymentFailureNotification(event.payload.orderId)
    }
  })

// Create specific handlers
const userHandler = createHandler(isUserEvent, handleUserCreated)
const orderHandler = createHandler(isOrderEvent, handleOrderPlaced)
const paymentHandler = createHandler(isPaymentEvent, handlePaymentProcessed)

// Event middleware
const withLogging = <T extends DomainEvent>(
  handler: EventHandler<T>
): EventHandler<T> =>
  (event) => pipe(
    handler(event),
    Effect.tap(() => Effect.logDebug(`Event processed: ${event.type}`)),
    Effect.tapError(error => 
      Effect.logError(`Event processing failed: ${event.type}`, { error })
    )
  )

const withRetry = <T extends DomainEvent>(
  handler: EventHandler<T>,
  maxRetries: number = 3
): EventHandler<T> =>
  (event) => pipe(
    handler(event),
    Effect.retry(Schedule.exponential("1 second").pipe(
      Schedule.compose(Schedule.recurs(maxRetries))
    ))
  )

const withDeadLetter = <T extends DomainEvent>(
  handler: EventHandler<T>,
  deadLetterQueue: (event: T, error: unknown) => Effect.Effect<void>
): EventHandler<T> =>
  (event) => pipe(
    handler(event),
    Effect.catchAll(error =>
      Effect.gen(function* () {
        yield* Effect.logError("Event sent to dead letter queue", { event, error })
        yield* deadLetterQueue(event, error)
      })
    )
  )

// Compose middleware
const enhancedUserHandler = Fn.flow(
  handleUserCreated,
  withLogging,
  withRetry,
  withDeadLetter((event, error) => 
    Effect.logError("User event failed permanently", { event, error })
  )
)

// Event dispatcher
const createEventDispatcher = (handlers: Array<(event: DomainEvent) => Effect.Effect<void>>) =>
  (event: DomainEvent): Effect.Effect<void> =>
    Effect.all(
      handlers.map(handler => handler(event)),
      { concurrency: "unbounded" }
    ).pipe(Effect.asUnit)

// Main event dispatcher
const eventDispatcher = createEventDispatcher([
  userHandler,
  orderHandler,
  paymentHandler
])

// Event processing pipeline
const processEventBatch = Fn.flow(
  // Validate events
  Arr.filter((event: DomainEvent) => event.id && event.timestamp && event.type),
  
  // Sort by timestamp
  Arr.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
  
  // Process events sequentially to maintain order
  (events) => Effect.all(
    events.map(eventDispatcher),
    { concurrency: 1 }
  )
)

// Usage
const events: DomainEvent[] = [
  {
    id: "1",
    timestamp: new Date(),
    type: "user.created",
    source: "user-service",
    payload: {
      userId: "user-123",
      email: "john@example.com",
      name: "John Doe"
    }
  },
  {
    id: "2", 
    timestamp: new Date(Date.now() + 1000),
    type: "order.placed",
    source: "order-service",
    payload: {
      orderId: "order-456",
      userId: "user-123",
      amount: 99.99,
      items: [{ productId: "product-789", quantity: 2 }]
    }
  }
]

// Process the events
Effect.runPromise(processEventBatch(events))
```

### Example 3: Configuration and Validation Pipeline

Building a configuration system with validation and transformation:

```typescript
import { Function as Fn, pipe, Effect, Option as O, Either as E } from "effect"

// Configuration types
interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean
  poolSize: number
  timeout: number
}

interface ServerConfig {
  host: string
  port: number
  cors: {
    enabled: boolean
    origins: string[]
  }
  compression: boolean
  rateLimiting: {
    enabled: boolean
    maxRequests: number
    windowMs: number
  }
}

interface AppConfig {
  environment: "development" | "staging" | "production"
  database: DatabaseConfig
  server: ServerConfig
  logging: {
    level: "debug" | "info" | "warn" | "error"
    format: "json" | "text"
  }
  features: {
    auth: boolean
    metrics: boolean
    documentation: boolean
  }
}

// Raw environment variables
interface EnvVars {
  NODE_ENV?: string
  DB_HOST?: string
  DB_PORT?: string
  DB_NAME?: string
  DB_USER?: string
  DB_PASS?: string
  DB_SSL?: string
  DB_POOL_SIZE?: string
  DB_TIMEOUT?: string
  SERVER_HOST?: string
  SERVER_PORT?: string
  CORS_ORIGINS?: string
  ENABLE_COMPRESSION?: string
  RATE_LIMIT_MAX?: string
  RATE_LIMIT_WINDOW?: string
  LOG_LEVEL?: string
  LOG_FORMAT?: string
  [key: string]: string | undefined
}

// Validation helpers
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

const parseStringArray = (value: string | undefined, defaultValue: string[]): string[] => {
  if (!value) return defaultValue
  return value.split(',').map(s => s.trim()).filter(Boolean)
}

// Curried validators
const validateRequired = Fn.curry((fieldName: string, value: string | undefined): string => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} is required`)
  }
  return value.trim()
})

const validateRange = Fn.curry((min: number, max: number, value: number): number => {
  if (value < min || value > max) {
    throw new Error(`Value must be between ${min} and ${max}`)
  }
  return value
})

const validateEnum = Fn.curry(<T extends string>(
  values: T[],
  defaultValue: T,
  value: string | undefined
): T => {
  if (!value) return defaultValue
  if (!values.includes(value as T)) {
    throw new Error(`Value must be one of: ${values.join(', ')}`)
  }
  return value as T
})

// Configuration parsers
const parseDatabaseConfig = (env: EnvVars): DatabaseConfig => ({
  host: validateRequired("DB_HOST", env.DB_HOST),
  port: validateRange(1024, 65535)(parseNumber(env.DB_PORT, 5432)),
  database: validateRequired("DB_NAME", env.DB_NAME),
  username: validateRequired("DB_USER", env.DB_USER),
  password: validateRequired("DB_PASS", env.DB_PASS),
  ssl: parseBoolean(env.DB_SSL, false),
  poolSize: validateRange(1, 100)(parseNumber(env.DB_POOL_SIZE, 10)),
  timeout: validateRange(1000, 300000)(parseNumber(env.DB_TIMEOUT, 30000))
})

const parseServerConfig = (env: EnvVars): ServerConfig => ({
  host: env.SERVER_HOST || "localhost",
  port: pipe(
    validateRange(1024, 65535)(parseNumber(env.SERVER_PORT, 3000))
  ),
  cors: {
    enabled: parseBoolean(env.CORS_ENABLED, true),
    origins: parseStringArray(env.CORS_ORIGINS, ["*"])
  },
  compression: parseBoolean(env.ENABLE_COMPRESSION, true),
  rateLimiting: {
    enabled: parseBoolean(env.RATE_LIMITING_ENABLED, true),
    maxRequests: validateRange(1, 10000)(parseNumber(env.RATE_LIMIT_MAX, 100)),
    windowMs: validateRange(1000, 3600000)(parseNumber(env.RATE_LIMIT_WINDOW, 60000))
    )
  }
})

const parseLoggingConfig = (env: EnvVars) => ({
  level: validateEnum(
    ["debug", "info", "warn", "error"] as const,
    "info",
    env.LOG_LEVEL
  ),
  format: validateEnum(
    ["json", "text"] as const,
    "text",
    env.LOG_FORMAT
  )
})

const parseFeatureConfig = (env: EnvVars, environment: AppConfig["environment"]) => ({
  auth: parseBoolean(env.FEATURE_AUTH, environment !== "development"),
  metrics: parseBoolean(env.FEATURE_METRICS, environment === "production"),
  documentation: parseBoolean(env.FEATURE_DOCS, environment !== "production")
})

// Main configuration parser
const parseConfig = Fn.flow(
  (env: EnvVars) => {
    const environment = validateEnum(
      ["development", "staging", "production"] as const,
      "development",
      env.NODE_ENV
    )
    
    return {
      environment,
      database: parseDatabaseConfig(env),
      server: parseServerConfig(env),
      logging: parseLoggingConfig(env),
      features: parseFeatureConfig(env, environment)
    }
  }
)

// Configuration validation
const validateConfig = (config: AppConfig): AppConfig => {
  // Cross-field validation
  if (config.environment === "production" && !config.database.ssl) {
    throw new Error("SSL must be enabled in production")
  }
  
  if (config.server.cors.enabled && config.server.cors.origins.includes("*") && config.environment === "production") {
    throw new Error("Wildcard CORS origins not allowed in production")
  }
  
  if (config.logging.level === "debug" && config.environment === "production") {
    console.warn("Debug logging enabled in production")
  }
  
  return config
}

// Configuration transformation for different environments
const transformForEnvironment = Fn.curry((environment: AppConfig["environment"], config: AppConfig): AppConfig => {
  switch (environment) {
    case "development":
      return {
        ...config,
        database: {
          ...config.database,
          ssl: false,
          poolSize: Math.min(config.database.poolSize, 5)
        },
        logging: {
          ...config.logging,
          level: "debug"
        }
      }
    
    case "production":
      return {
        ...config,
        database: {
          ...config.database,
          ssl: true
        },
        logging: {
          ...config.logging,
          format: "json",
          level: config.logging.level === "debug" ? "info" : config.logging.level
        },
        features: {
          ...config.features,
          documentation: false
        }
      }
    
    default:
      return config
  }
})

// Complete configuration pipeline
const loadConfiguration = Fn.flow(
  parseConfig,
  validateConfig,
  (config) => transformForEnvironment(config.environment, config),
  // Final validation after transformation
  validateConfig
)

// Usage with error handling
const safeLoadConfiguration = (env: EnvVars): Effect.Effect<AppConfig, string> =>
  Effect.try({
    try: () => loadConfiguration(env),
    catch: (error) => error instanceof Error ? error.message : "Configuration error"
  })

// Example usage
const envVars: EnvVars = {
  NODE_ENV: "production",
  DB_HOST: "localhost",
  DB_PORT: "5432",
  DB_NAME: "myapp",
  DB_USER: "admin",
  DB_PASS: "secret",
  DB_SSL: "true",
  SERVER_PORT: "8080",
  CORS_ORIGINS: "https://myapp.com,https://admin.myapp.com",
  LOG_LEVEL: "info",
  LOG_FORMAT: "json"
}

// Load and use configuration
Effect.gen(function* () {
  const config = yield* safeLoadConfiguration(envVars)
  console.log("Configuration loaded:", config)
  
  // Use configuration to initialize services
  yield* initializeDatabase(config.database)
  yield* startServer(config.server)
  yield* configureLogging(config.logging)
}).pipe(
  Effect.catchAll(error => 
    Effect.logError("Failed to load configuration", { error })
  )
)
```

## Advanced Features Deep Dive

### Advanced Composition Patterns

Exploring sophisticated function composition techniques:

```typescript
import { Function as Fn, pipe, Effect, Array as Arr, Option as O } from "effect"

// Applicative composition - combining multiple functions with context
const applicativeComposition = <A, B, C, D>(
  f1: (a: A) => B,
  f2: (a: A) => C,
  combiner: (b: B, c: C) => D
) => (a: A): D => {
  const b = f1(a)
  const c = f2(a)
  return combiner(b, c)
}

// Example: Processing user data with multiple validations
interface User {
  id: string
  name: string
  email: string
  age: number
}

const extractName = (user: User) => user.name
const extractEmail = (user: User) => user.email
const extractAge = (user: User) => user.age

const createUserSummary = applicativeComposition(
  extractName,
  extractEmail,
  (name, email) => `${name} <${email}>`
)

// Kleisli composition - composing functions that return Effects
const kleisliCompose = <A, B, C, E, R>(
  f: (a: A) => Effect.Effect<B, E, R>,
  g: (b: B) => Effect.Effect<C, E, R>
) => (a: A): Effect.Effect<C, E, R> =>
  pipe(
    f(a),
    Effect.flatMap(g)
  )

// Example: Database operations
const getUser = (id: string): Effect.Effect<User, "UserNotFound"> => 
  Effect.succeed({ id, name: "John", email: "john@example.com", age: 30 })

const getOrders = (user: User): Effect.Effect<Array<{ id: string; total: number }>, "OrdersNotFound"> =>
  Effect.succeed([{ id: "order-1", total: 100 }])

const getUserOrders = kleisliCompose(getUser, getOrders)

// Monadic composition with transformers
const optionToEffect = <A>(option: O.Option<A>): Effect.Effect<A, "None"> =>
  O.match(option, {
    onNone: () => Effect.fail("None" as const),
    onSome: (value) => Effect.succeed(value)
  })

const safeParseInt = (str: string): O.Option<number> => {
  const parsed = parseInt(str, 10)
  return isNaN(parsed) ? O.none() : O.some(parsed)
}

const parseAndValidateAge = Fn.flow(
  safeParseInt,
  optionToEffect,
  Effect.filterOrFail(
    (age) => age >= 0 && age <= 150,
    () => "Invalid age range" as const
  )
)

// Continuation-based composition
const withContinuation = <A, B, C>(
  computation: (a: A) => B,
  continuation: (b: B) => C
) => (a: A): C => continuation(computation(a))

// Example: Resource management with cleanup
const withResource = <R, A>(
  acquire: () => R,
  use: (resource: R) => A,
  release: (resource: R) => void
) => (): A => {
  const resource = acquire()
  try {
    return use(resource)
  } finally {
    release(resource)
  }
}

// Composable middleware pattern
type Middleware<A, B> = (next: (a: A) => B) => (a: A) => B

const composeMiddleware = <A, B>(
  middlewares: Array<Middleware<A, B>>
): Middleware<A, B> =>
  middlewares.reduceRight(
    (next, middleware) => middleware(next),
    (a: A) => a as any as B
  )

// Example middlewares
const loggingMiddleware: Middleware<string, string> = (next) => (input) => {
  console.log(`Processing: ${input}`)
  const result = next(input)
  console.log(`Result: ${result}`)
  return result
}

const timingMiddleware: Middleware<string, string> = (next) => (input) => {
  const start = Date.now()
  const result = next(input)
  console.log(`Time: ${Date.now() - start}ms`)
  return result
}

const composed = composeMiddleware([loggingMiddleware, timingMiddleware])
const processor = composed((input: string) => input.toUpperCase())
```

### Type-Safe Function Utilities

Advanced utilities maintaining full type safety:

```typescript
import { Function as Fn, pipe } from "effect"

// Type-safe function overloading
interface Overload {
  (x: string): string
  (x: number): number
  (x: boolean): boolean
}

const identity: Overload = (x: any) => x

// Generic function constraining
const constrainFunction = <T extends (...args: any[]) => any>(
  fn: T,
  constraint: (fn: T) => boolean
): T => {
  if (!constraint(fn)) {
    throw new Error("Function does not meet constraint")
  }
  return fn
}

// Example: Ensure function is pure (no side effects)
const isPure = (fn: Function): boolean => {
  // Simplified purity check
  const source = fn.toString()
  return !source.includes('console.') && !source.includes('Math.random')
}

const pureFn = constrainFunction(
  (x: number) => x * 2,
  isPure
)

// Dependent function types
type DependentFunction<T> = T extends string
  ? (s: string) => string
  : T extends number
  ? (n: number) => number
  : never

const createDependentFunction = <T>(type: T): DependentFunction<T> => {
  if (typeof type === 'string') {
    return ((s: string) => s.toUpperCase()) as DependentFunction<T>
  }
  if (typeof type === 'number') {
    return ((n: number) => n * 2) as DependentFunction<T>
  }
  throw new Error('Unsupported type')
}

// Function metadata and introspection
interface FunctionMetadata {
  name: string
  arity: number
  isPure: boolean
  memoized: boolean
}

const addMetadata = <T extends Function>(
  fn: T,
  metadata: Partial<FunctionMetadata>
): T & { metadata: FunctionMetadata } => {
  const enriched = fn as T & { metadata: FunctionMetadata }
  enriched.metadata = {
    name: fn.name || 'anonymous',
    arity: fn.length,
    isPure: false,
    memoized: false,
    ...metadata
  }
  return enriched
}

// Example usage
const add = addMetadata(
  (a: number, b: number) => a + b,
  { isPure: true }
)

console.log(add.metadata) // { name: 'add', arity: 2, isPure: true, memoized: false }

// Higher-order function factory
const createFactoryFunction = <T, U>(
  transform: (input: T) => U
) => ({
  create: (input: T) => transform(input),
  createMany: (inputs: T[]) => inputs.map(transform),
  createWith: <V>(modifier: (u: U) => V) => (input: T) => modifier(transform(input))
})

// Example: String processor factory
const stringProcessor = createFactoryFunction((str: string) => ({
  original: str,
  upper: str.toUpperCase(),
  lower: str.toLowerCase(),
  length: str.length
}))

const processed = stringProcessor.create("Hello")
const withHash = stringProcessor.createWith(
  (result) => ({ ...result, hash: result.original.length })
)("World")

// Generic memoization with type preservation
const memoize = <Args extends any[], Return>(
  fn: (...args: Args) => Return,
  keyFn?: (...args: Args) => string
): ((...args: Args) => Return) => {
  const cache = new Map<string, Return>()
  const getKey = keyFn || ((...args) => JSON.stringify(args))
  
  return (...args: Args): Return => {
    const key = getKey(...args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Memoized expensive computation
const expensiveComputation = memoize(
  (n: number, factor: number): number => {
    console.log(`Computing ${n} * ${factor}`)
    return n * factor
  }
)

console.log(expensiveComputation(5, 2)) // Computes and caches
console.log(expensiveComputation(5, 2)) // Returns from cache
```

### Performance Optimization

Function utilities for performance optimization:

```typescript
import { Function as Fn } from "effect"

// Lazy evaluation
const lazy = <T>(fn: () => T): (() => T) => {
  let computed = false
  let result: T
  
  return () => {
    if (!computed) {
      result = fn()
      computed = true
    }
    return result
  }
}

// Example: Expensive initialization
const expensiveData = lazy(() => {
  console.log("Computing expensive data...")
  return Array.from({ length: 1000000 }, (_, i) => i * i)
})

// Only computed when first accessed
const data = expensiveData() // Logs and computes
const data2 = expensiveData() // Returns cached result

// Function batching
const batch = <T, U>(
  fn: (items: T[]) => U[],
  maxBatchSize: number = 100,
  delay: number = 10
) => {
  let queue: Array<{ item: T; resolve: (result: U) => void; reject: (error: any) => void }> = []
  let timeoutId: NodeJS.Timeout | null = null
  
  const processBatch = () => {
    if (queue.length === 0) return
    
    const batch = queue.splice(0, maxBatchSize)
    const items = batch.map(entry => entry.item)
    
    try {
      const results = fn(items)
      batch.forEach((entry, index) => {
        entry.resolve(results[index])
      })
    } catch (error) {
      batch.forEach(entry => entry.reject(error))
    }
    
    if (queue.length > 0) {
      timeoutId = setTimeout(processBatch, delay)
    }
  }
  
  return (item: T): Promise<U> => {
    return new Promise((resolve, reject) => {
      queue.push({ item, resolve, reject })
      
      if (queue.length >= maxBatchSize) {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        processBatch()
      } else if (!timeoutId) {
        timeoutId = setTimeout(processBatch, delay)
      }
    })
  }
}

// Example: Database query batching
const fetchUsersBatch = (ids: string[]) => {
  console.log(`Fetching ${ids.length} users`)
  return ids.map(id => ({ id, name: `User ${id}` }))
}

const fetchUser = batch(fetchUsersBatch, 5, 50)

// These will be batched together
Promise.all([
  fetchUser("1"),
  fetchUser("2"),
  fetchUser("3"),
  fetchUser("4"),
  fetchUser("5")
]).then(users => console.log("Users:", users))

// Function pools for heavy computations
class FunctionPool<Args extends any[], Return> {
  private workers: Array<{
    fn: (...args: Args) => Return
    busy: boolean
  }> = []
  
  private queue: Array<{
    args: Args
    resolve: (result: Return) => void
    reject: (error: any) => void
  }> = []
  
  constructor(
    private factory: () => (...args: Args) => Return,
    private poolSize: number = 4
  ) {
    for (let i = 0; i < poolSize; i++) {
      this.workers.push({
        fn: factory(),
        busy: false
      })
    }
  }
  
  execute(...args: Args): Promise<Return> {
    return new Promise((resolve, reject) => {
      const worker = this.workers.find(w => !w.busy)
      
      if (worker) {
        worker.busy = true
        try {
          const result = worker.fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          worker.busy = false
          this.processQueue()
        }
      } else {
        this.queue.push({ args, resolve, reject })
      }
    })
  }
  
  private processQueue() {
    if (this.queue.length === 0) return
    
    const worker = this.workers.find(w => !w.busy)
    if (!worker) return
    
    const job = this.queue.shift()!
    worker.busy = true
    
    try {
      const result = worker.fn(...job.args)
      job.resolve(result)
    } catch (error) {
      job.reject(error)
    } finally {
      worker.busy = false
      this.processQueue()
    }
  }
}

// Example: CPU-intensive function pool
const heavyComputation = (n: number): number => {
  let result = 0
  for (let i = 0; i < n * 1000000; i++) {
    result += Math.sqrt(i)
  }
  return result
}

const computePool = new FunctionPool(
  () => heavyComputation,
  2 // 2 workers
)

// These will be distributed across workers
Promise.all([
  computePool.execute(100),
  computePool.execute(200),
  computePool.execute(300),
  computePool.execute(400)
]).then(results => console.log("Results:", results))
```

## Practical Patterns & Best Practices

### Pattern 1: Function Composition Utilities

Creating reusable utilities for common composition patterns:

```typescript
import { Function as Fn, pipe, Effect, Array as Arr } from "effect"

// Pipeline builder for complex data transformations
class Pipeline<T> {
  constructor(private value: T) {}
  
  static of<T>(value: T): Pipeline<T> {
    return new Pipeline(value)
  }
  
  map<U>(fn: (value: T) => U): Pipeline<U> {
    return new Pipeline(fn(this.value))
  }
  
  filter(predicate: (value: T) => boolean): Pipeline<T> {
    if (!predicate(this.value)) {
      throw new Error("Pipeline filter failed")
    }
    return this
  }
  
  tap(fn: (value: T) => void): Pipeline<T> {
    fn(this.value)
    return this
  }
  
  flatMap<U>(fn: (value: T) => Pipeline<U>): Pipeline<U> {
    return fn(this.value)
  }
  
  fold<U>(fn: (value: T) => U): U {
    return fn(this.value)
  }
  
  getValue(): T {
    return this.value
  }
}

// Usage example
const processText = (input: string) =>
  Pipeline.of(input)
    .tap(text => console.log(`Input: ${text}`))
    .map(text => text.trim())
    .filter(text => text.length > 0)
    .map(text => text.toLowerCase())
    .map(text => text.replace(/[^a-z0-9\s]/g, ''))
    .map(text => text.replace(/\s+/g, '-'))
    .tap(text => console.log(`Output: ${text}`))
    .getValue()

// Conditional composition
const conditionalCompose = <T>(
  condition: (value: T) => boolean,
  trueBranch: (value: T) => T,
  falseBranch: (value: T) => T = Fn.identity
) => (value: T): T => 
  condition(value) ? trueBranch(value) : falseBranch(value)

// Example: Data sanitization with conditions
const sanitizeUser = (user: { name: string; email: string; age?: number }) =>
  pipe(
    conditionalCompose(
      u => u.name.length > 50,
      u => ({ ...u, name: u.name.slice(0, 50) })
    )(user),
    conditionalCompose(
      u => !u.email.includes('@'),
      u => ({ ...u, email: `${u.email}@example.com` })
    ),
    conditionalCompose(
      u => u.age !== undefined && u.age < 0,
      u => ({ ...u, age: 0 })
    )
  )

// Function sequence with error handling
const sequence = <T>(
  functions: Array<(value: T) => T>
): (value: T) => T => {
  return (value: T) => {
    let result = value
    
    for (const fn of functions) {
      try {
        result = fn(result)
      } catch (error) {
        console.error(`Function failed in sequence:`, error)
        throw error
      }
    }
    
    return result
  }
}

// Safe sequence that collects errors
const safeSequence = <T>(
  functions: Array<(value: T) => T>
): (value: T) => { result: T; errors: Error[] } => {
  return (value: T) => {
    let result = value
    const errors: Error[] = []
    
    for (const fn of functions) {
      try {
        result = fn(result)
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
      }
    }
    
    return { result, errors }
  }
}

// Parallel function execution
const parallel = <T, U>(
  functions: Array<(value: T) => U>
) => (value: T): U[] => {
  return functions.map(fn => fn(value))
}

// Example: Multiple validation functions
const validateUser = parallel([
  (user: { name: string; email: string }) => {
    if (user.name.length < 2) throw new Error("Name too short")
    return true
  },
  (user: { name: string; email: string }) => {
    if (!user.email.includes('@')) throw new Error("Invalid email")
    return true
  },
  (user: { name: string; email: string }) => {
    if (user.name === user.email) throw new Error("Name and email cannot be the same")
    return true
  }
])

// Result: [true, true, true] if all validations pass
```

### Pattern 2: Domain-Specific Function Builders

Creating domain-specific languages using function composition:

```typescript
import { Function as Fn, pipe } from "effect"

// Query builder DSL
class QueryBuilder {
  private conditions: string[] = []
  private tableName: string = ""
  private selectColumns: string[] = ["*"]
  private orderByColumns: string[] = []
  private limitValue?: number
  
  from(table: string): QueryBuilder {
    this.tableName = table
    return this
  }
  
  select(...columns: string[]): QueryBuilder {
    this.selectColumns = columns
    return this
  }
  
  where(condition: string): QueryBuilder {
    this.conditions.push(condition)
    return this
  }
  
  orderBy(...columns: string[]): QueryBuilder {
    this.orderByColumns = columns
    return this
  }
  
  limit(count: number): QueryBuilder {
    this.limitValue = count
    return this
  }
  
  build(): string {
    let query = `SELECT ${this.selectColumns.join(', ')} FROM ${this.tableName}`
    
    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`
    }
    
    if (this.orderByColumns.length > 0) {
      query += ` ORDER BY ${this.orderByColumns.join(', ')}`
    }
    
    if (this.limitValue) {
      query += ` LIMIT ${this.limitValue}`
    }
    
    return query
  }
}

// Usage
const query = new QueryBuilder()
  .select("id", "name", "email")
  .from("users")
  .where("active = true")
  .where("age > 18")
  .orderBy("created_at DESC")
  .limit(10)
  .build()

// Validation DSL
type ValidationRule<T> = (value: T) => string | null

const createValidator = <T>() => {
  const rules: ValidationRule<T>[] = []
  
  const validator = {
    required: (message: string = "This field is required") => {
      rules.push((value: T) => {
        if (value === null || value === undefined || value === "") {
          return message
        }
        return null
      })
      return validator
    },
    
    minLength: (min: number, message?: string) => {
      rules.push((value: T) => {
        if (typeof value === "string" && value.length < min) {
          return message || `Must be at least ${min} characters`
        }
        return null
      })
      return validator
    },
    
    maxLength: (max: number, message?: string) => {
      rules.push((value: T) => {
        if (typeof value === "string" && value.length > max) {
          return message || `Must be no more than ${max} characters`
        }
        return null
      })
      return validator
    },
    
    pattern: (regex: RegExp, message: string = "Invalid format") => {
      rules.push((value: T) => {
        if (typeof value === "string" && !regex.test(value)) {
          return message
        }
        return null
      })
      return validator
    },
    
    custom: (rule: ValidationRule<T>) => {
      rules.push(rule)
      return validator
    },
    
    validate: (value: T): string[] => {
      return rules
        .map(rule => rule(value))
        .filter((error): error is string => error !== null)
    }
  }
  
  return validator
}

// Usage
const nameValidator = createValidator<string>()
  .required("Name is required")
  .minLength(2, "Name must be at least 2 characters")
  .maxLength(50, "Name must be no more than 50 characters")
  .pattern(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")

const emailValidator = createValidator<string>()
  .required("Email is required")
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address")

// Form validation
const validateForm = (data: { name: string; email: string }) => {
  const nameErrors = nameValidator.validate(data.name)
  const emailErrors = emailValidator.validate(data.email)
  
  return {
    isValid: nameErrors.length === 0 && emailErrors.length === 0,
    errors: {
      name: nameErrors,
      email: emailErrors
    }
  }
}

// State machine DSL
class StateMachine<State extends string, Event extends string> {
  private transitions: Map<State, Map<Event, State>> = new Map()
  private currentState: State
  
  constructor(initialState: State) {
    this.currentState = initialState
  }
  
  addTransition(from: State, event: Event, to: State): StateMachine<State, Event> {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map())
    }
    this.transitions.get(from)!.set(event, to)
    return this
  }
  
  transition(event: Event): State | null {
    const stateTransitions = this.transitions.get(this.currentState)
    if (!stateTransitions) return null
    
    const nextState = stateTransitions.get(event)
    if (!nextState) return null
    
    this.currentState = nextState
    return nextState
  }
  
  getCurrentState(): State {
    return this.currentState
  }
  
  canTransition(event: Event): boolean {
    const stateTransitions = this.transitions.get(this.currentState)
    return stateTransitions ? stateTransitions.has(event) : false
  }
}

// Usage: Order state machine
type OrderState = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
type OrderEvent = "confirm" | "ship" | "deliver" | "cancel"

const orderStateMachine = new StateMachine<OrderState, OrderEvent>("pending")
  .addTransition("pending", "confirm", "confirmed")
  .addTransition("pending", "cancel", "cancelled")
  .addTransition("confirmed", "ship", "shipped")
  .addTransition("confirmed", "cancel", "cancelled")
  .addTransition("shipped", "deliver", "delivered")

console.log(orderStateMachine.getCurrentState()) // "pending"
orderStateMachine.transition("confirm")
console.log(orderStateMachine.getCurrentState()) // "confirmed"
orderStateMachine.transition("ship")
console.log(orderStateMachine.getCurrentState()) // "shipped"
```

## Integration Examples

### Integration with React Hooks

Using Function utilities with React for better component composition:

```typescript
import { Function as Fn, pipe } from "effect"
import { useState, useEffect, useCallback, useMemo } from "react"

// Custom hook builder using function composition
const createAsyncHook = <T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>
) => {
  return (...args: Args) => {
    const [state, setState] = useState<{
      data: T | null
      loading: boolean
      error: Error | null
    }>({
      data: null,
      loading: false,
      error: null
    })
    
    const execute = useCallback(
      Fn.flow(
        () => setState(prev => ({ ...prev, loading: true, error: null })),
        () => asyncFn(...args),
        (promise) => promise
          .then(data => setState({ data, loading: false, error: null }))
          .catch(error => setState({ data: null, loading: false, error }))
      ),
      [asyncFn, ...args]
    )
    
    useEffect(() => {
      execute()
    }, [execute])
    
    return { ...state, refetch: execute }
  }
}

// Example usage
const fetchUser = (id: string) => 
  fetch(`/api/users/${id}`).then(res => res.json())

const useUser = createAsyncHook(fetchUser)

const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user, loading, error, refetch } = useUser(userId)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return <div>No user found</div>
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}

// Form validation hook with function composition
const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: { [K in keyof T]?: (value: T[K]) => string | null }
) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  
  const validateField = useCallback(
    Fn.curry((field: keyof T, value: T[keyof T]) => {
      const rule = validationRules[field]
      return rule ? rule(value) : null
    }),
    [validationRules]
  )
  
  const validateAllFields = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    
    Object.keys(values).forEach(key => {
      const field = key as keyof T
      const error = validateField(field, values[field])
      if (error) {
        newErrors[field] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validateField])
  
  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Validate field if it's been touched
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || undefined }))
    }
  }, [touched, validateField])
  
  const setTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Validate field when touched
    const error = validateField(field, values[field])
    setErrors(prev => ({ ...prev, [field]: error || undefined }))
  }, [values, validateField])
  
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])
  
  const isValid = useMemo(() => 
    Object.values(errors).every(error => !error), 
    [errors]
  )
  
  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    validateAllFields,
    reset
  }
}

// Usage
const ContactForm = () => {
  const form = useFormValidation(
    { name: "", email: "", message: "" },
    {
      name: (value) => value.length < 2 ? "Name must be at least 2 characters" : null,
      email: (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email" : null,
      message: (value) => value.length < 10 ? "Message must be at least 10 characters" : null
    }
  )
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.validateAllFields()) {
      console.log("Form submitted:", form.values)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.values.name}
        onChange={(e) => form.setValue("name", e.target.value)}
        onBlur={() => form.setTouched("name")}
        placeholder="Name"
      />
      {form.touched.name && form.errors.name && (
        <span className="error">{form.errors.name}</span>
      )}
      
      <input
        type="email"
        value={form.values.email}
        onChange={(e) => form.setValue("email", e.target.value)}
        onBlur={() => form.setTouched("email")}
        placeholder="Email"
      />
      {form.touched.email && form.errors.email && (
        <span className="error">{form.errors.email}</span>
      )}
      
      <textarea
        value={form.values.message}
        onChange={(e) => form.setValue("message", e.target.value)}
        onBlur={() => form.setTouched("message")}
        placeholder="Message"
      />
      {form.touched.message && form.errors.message && (
        <span className="error">{form.errors.message}</span>
      )}
      
      <button type="submit" disabled={!form.isValid}>
        Submit
      </button>
    </form>
  )
}

// Higher-order component using function composition
const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P & { loading?: boolean }) => {
    const { loading, ...componentProps } = props
    
    if (loading) {
      return <div className="loading">Loading...</div>
    }
    
    return <Component {...(componentProps as P)} />
  }
}

const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    const [hasError, setHasError] = useState(false)
    
    useEffect(() => {
      const handler = (event: ErrorEvent) => {
        setHasError(true)
      }
      
      window.addEventListener('error', handler)
      return () => window.removeEventListener('error', handler)
    }, [])
    
    if (hasError) {
      return <div className="error">Something went wrong</div>
    }
    
    return <Component {...props} />
  }
}

// Compose HOCs
const enhance = Fn.flow(
  withErrorBoundary,
  withLoading
)

const EnhancedUserProfile = enhance(UserProfile)
```

### Testing Strategies

Comprehensive testing strategies for function-based code:

```typescript
import { Function as Fn, pipe } from "effect"

// Property-based testing helpers
const generateTestData = <T>(generator: () => T, count: number = 100): T[] =>
  Array.from({ length: count }, generator)

const testProperty = <T>(
  name: string,
  generator: () => T,
  property: (value: T) => boolean,
  options: { samples?: number; timeout?: number } = {}
) => {
  const { samples = 100, timeout = 5000 } = options
  
  return {
    name,
    run: () => {
      const startTime = Date.now()
      
      for (let i = 0; i < samples; i++) {
        if (Date.now() - startTime > timeout) {
          throw new Error(`Property test timed out after ${timeout}ms`)
        }
        
        const value = generator()
        
        if (!property(value)) {
          throw new Error(`Property failed for value: ${JSON.stringify(value)} on sample ${i}`)
        }
      }
      
      return { passed: samples, samples }
    }
  }
}

// Example property tests
const additionProperties = [
  testProperty(
    "Addition is commutative",
    () => ({ a: Math.random() * 100, b: Math.random() * 100 }),
    ({ a, b }) => a + b === b + a
  ),
  
  testProperty(
    "Addition is associative",
    () => ({ 
      a: Math.random() * 100, 
      b: Math.random() * 100, 
      c: Math.random() * 100 
    }),
    ({ a, b, c }) => (a + b) + c === a + (b + c)
  ),
  
  testProperty(
    "Zero is additive identity",
    () => Math.random() * 100,
    (a) => a + 0 === a && 0 + a === a
  )
]

// Function composition testing
const testComposition = <A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C,
  generator: () => A,
  name: string = "Function composition"
) => {
  return testProperty(
    name,
    generator,
    (a) => {
      const directComposition = g(f(a))
      const flowComposition = Fn.flow(f, g)(a)
      return directComposition === flowComposition
    }
  )
}

// Example composition test
const double = (x: number) => x * 2
const addOne = (x: number) => x + 1

const compositionTest = testComposition(
  double,
  addOne,
  () => Math.random() * 100,
  "double then addOne composition"
)

// Mock and spy utilities
const createMock = <T extends Record<string, any>>(
  implementation: Partial<T> = {}
): T & { calls: Record<keyof T, any[][]> } => {
  const calls: Record<keyof T, any[][]> = {} as any
  
  const mock = new Proxy(implementation, {
    get(target, prop) {
      if (prop === 'calls') {
        return calls
      }
      
      if (typeof prop === 'string') {
        if (!calls[prop as keyof T]) {
          calls[prop as keyof T] = []
        }
        
        if (target[prop as keyof T]) {
          return (...args: any[]) => {
            calls[prop as keyof T].push(args)
            return target[prop as keyof T](...args)
          }
        } else {
          return (...args: any[]) => {
            calls[prop as keyof T].push(args)
            return undefined
          }
        }
      }
      
      return target[prop as keyof T]
    }
  }) as T & { calls: Record<keyof T, any[][]> }
  
  return mock
}

// Example usage
interface UserService {
  getUser(id: string): Promise<{ id: string; name: string }>
  updateUser(id: string, data: any): Promise<void>
}

const mockUserService = createMock<UserService>({
  getUser: async (id) => ({ id, name: `User ${id}` }),
  updateUser: async () => {}
})

// Function testing utilities
const testFunction = <Args extends any[], Return>(
  fn: (...args: Args) => Return,
  testCases: Array<{
    name: string
    args: Args
    expected: Return
    expectError?: boolean
  }>
) => {
  return {
    runAll: () => {
      const results = testCases.map(testCase => {
        try {
          const result = fn(...testCase.args)
          
          if (testCase.expectError) {
            return {
              ...testCase,
              passed: false,
              error: "Expected error but function succeeded"
            }
          }
          
          const passed = JSON.stringify(result) === JSON.stringify(testCase.expected)
          
          return {
            ...testCase,
            passed,
            actual: result,
            error: passed ? undefined : `Expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(result)}`
          }
        } catch (error) {
          if (testCase.expectError) {
            return {
              ...testCase,
              passed: true,
              error: undefined
            }
          }
          
          return {
            ...testCase,
            passed: false,
            error: error instanceof Error ? error.message : String(error)
          }
        }
      })
      
      return {
        results,
        passed: results.every(r => r.passed),
        summary: {
          total: results.length,
          passed: results.filter(r => r.passed).length,
          failed: results.filter(r => !r.passed).length
        }
      }
    }
  }
}

// Example function tests
const addTest = testFunction(
  (a: number, b: number) => a + b,
  [
    { name: "positive numbers", args: [2, 3], expected: 5 },
    { name: "negative numbers", args: [-2, -3], expected: -5 },
    { name: "zero", args: [0, 5], expected: 5 },
    { name: "mixed", args: [-2, 5], expected: 3 }
  ]
)

const divideTest = testFunction(
  (a: number, b: number) => {
    if (b === 0) throw new Error("Division by zero")
    return a / b
  },
  [
    { name: "normal division", args: [10, 2], expected: 5 },
    { name: "division by zero", args: [10, 0], expected: null, expectError: true }
  ]
)

// Run tests
console.log("Addition tests:", addTest.runAll())
console.log("Division tests:", divideTest.runAll())
console.log("Property tests:", additionProperties.map(p => p.run()))
console.log("Composition test:", compositionTest.run())
```

## Conclusion

Function provides essential utilities for functional programming patterns, enabling clean composition, type-safe currying, and powerful function manipulation in TypeScript.

Key benefits:
- **Composability**: `flow` and `pipe` enable elegant left-to-right function composition with full type inference
- **Currying Support**: Automatic transformation of multi-argument functions with perfect type safety
- **Utility Collection**: Comprehensive set of function utilities with consistent API design

Function is fundamental for building maintainable, composable code in the Effect ecosystem, especially when combined with Effect's other modules for comprehensive functional programming patterns.