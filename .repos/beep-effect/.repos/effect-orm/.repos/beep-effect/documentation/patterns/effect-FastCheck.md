# FastCheck: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem FastCheck Solves

Testing with manually crafted test data is limited, error-prone, and often misses edge cases:

```typescript
// Traditional approach - manually written test cases
describe("validateEmail", () => {
  it("should validate emails", () => {
    expect(validateEmail("user@example.com")).toBe(true)
    expect(validateEmail("invalid")).toBe(false)
    expect(validateEmail("")).toBe(false)
    // What about edge cases? Unicode? Very long strings? Special characters?
    // Hundreds of possible edge cases we might miss...
  })
})
```

This approach leads to:
- **Limited Coverage** - Only tests the cases developers think to write
- **Edge Case Blindness** - Misses boundary conditions and unusual inputs
- **Maintenance Overhead** - Each schema change requires updating multiple test cases
- **False Confidence** - Tests pass but bugs exist in untested scenarios

### The FastCheck Solution

FastCheck provides property-based testing that generates hundreds of test cases automatically:

```typescript
import { FastCheck, Schema, Arbitrary } from "effect"

// Define the schema
const EmailSchema = Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))

// Generate arbitrary test data
const emailArbitrary = Arbitrary.make(EmailSchema)

// Property-based test
FastCheck.assert(
  FastCheck.property(emailArbitrary, (email) => {
    // This property will be tested with 100+ generated emails
    const result = validateEmail(email)
    return typeof result === "boolean"
  })
)
```

### Key Concepts

**Arbitrary**: A generator that produces random values conforming to a schema

**Property**: A statement that should hold true for all valid inputs

**Shrinking**: When a test fails, FastCheck automatically finds the smallest failing example

## Basic Usage Patterns

### Pattern 1: Basic Arbitrary Generation

```typescript
import { FastCheck, Schema, Arbitrary } from "effect"

// Simple schema
const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  active: Schema.Boolean
})

// Generate arbitrary data
const userArbitrary = Arbitrary.make(UserSchema)

// Sample some values
console.log(FastCheck.sample(userArbitrary, 3))
// Example output:
// [
//   { id: 42, name: "abc", active: true },
//   { id: -17, name: "", active: false },
//   { id: 1.23, name: "xyz123", active: true }
// ]
```

### Pattern 2: Schema Constraints

```typescript
import { FastCheck, Schema, Arbitrary } from "effect"

// Schema with constraints
const ProductSchema = Schema.Struct({
  id: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(10)),
  price: Schema.Number.pipe(Schema.between(0, 10000)),
  categories: Schema.Array(Schema.String).pipe(Schema.minItems(1), Schema.maxItems(5))
})

const productArbitrary = Arbitrary.make(ProductSchema)

// Generated data respects all constraints
FastCheck.sample(productArbitrary, 2).forEach(product => {
  console.log(`Product ${product.id}: $${product.price}`)
  console.log(`Categories: ${product.categories.join(", ")}`)
})
```

### Pattern 3: Property-Based Testing

```typescript
import { FastCheck, Schema, Arbitrary } from "effect"

const NumberArraySchema = Schema.Array(Schema.Number)
const arrayArbitrary = Arbitrary.make(NumberArraySchema)

// Test that sorting is idempotent
FastCheck.assert(
  FastCheck.property(arrayArbitrary, (arr) => {
    const sorted1 = [...arr].sort((a, b) => a - b)
    const sorted2 = [...sorted1].sort((a, b) => a - b)
    return JSON.stringify(sorted1) === JSON.stringify(sorted2)
  })
)
```

## Real-World Examples

### Example 1: E-commerce Product Validation

Testing product data validation across different scenarios:

```typescript
import { Effect, FastCheck, Schema, Arbitrary } from "effect"

// Domain model
const ProductCategory = Schema.Literal("electronics", "clothing", "books", "home")

const ProductSchema = Schema.Struct({
  id: Schema.String.pipe(Schema.minLength(3), Schema.maxLength(20)),
  name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  description: Schema.String.pipe(Schema.maxLength(500)),
  price: Schema.Number.pipe(Schema.between(0.01, 99999.99)),
  category: ProductCategory,
  inStock: Schema.Boolean,
  tags: Schema.Array(Schema.String).pipe(Schema.maxItems(10)),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String })
})

// Business logic to test
const validateProduct = (product: unknown) => Effect.gen(function* () {
  const validated = yield* Schema.decodeUnknown(ProductSchema)(product)
  
  // Business rule: electronics over $1000 require warranty info
  if (validated.category === "electronics" && validated.price > 1000) {
    const hasWarrantyTag = validated.tags.some(tag => tag.includes("warranty"))
    if (!hasWarrantyTag) {
      return yield* Effect.fail(new Error("Expensive electronics need warranty info"))
    }
  }
  
  return validated
})

// Property-based test
const productArbitrary = Arbitrary.make(ProductSchema)

// Test 1: All valid products should decode successfully
FastCheck.assert(
  FastCheck.property(productArbitrary, (product) => {
    const result = Effect.runSync(Effect.either(validateProduct(product)))
    return result._tag === "Right"
  })
)

// Test 2: Price formatting is consistent
FastCheck.assert(
  FastCheck.property(productArbitrary, (product) => {
    const formatted = formatPrice(product.price)
    const parsed = parseFloat(formatted.replace("$", ""))
    return Math.abs(parsed - product.price) < 0.01
  })
)

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}
```

### Example 2: User Authentication System

Testing authentication logic with various user inputs:

```typescript
import { Effect, FastCheck, Schema, Arbitrary } from "effect"

const UserCredentialsSchema = Schema.Struct({
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  password: Schema.String.pipe(Schema.minLength(8), Schema.maxLength(128)),
  twoFactorCode: Schema.optional(Schema.String.pipe(Schema.pattern(/^\d{6}$/)))
})

const SessionSchema = Schema.Struct({
  userId: Schema.String,
  expiresAt: Schema.Date,
  permissions: Schema.Array(Schema.String)
})

// Authentication service
const authenticateUser = (credentials: unknown) => Effect.gen(function* () {
  const validated = yield* Schema.decodeUnknown(UserCredentialsSchema)(credentials)
  
  // Simulate database lookup
  const user = yield* findUserByEmail(validated.email)
  const isValidPassword = yield* verifyPassword(validated.password, user.hashedPassword)
  
  if (!isValidPassword) {
    return yield* Effect.fail(new Error("Invalid credentials"))
  }
  
  if (user.twoFactorEnabled && !validated.twoFactorCode) {
    return yield* Effect.fail(new Error("Two-factor code required"))
  }
  
  return yield* createSession(user.id)
})

// Property-based tests
const credentialsArbitrary = Arbitrary.make(UserCredentialsSchema)

FastCheck.assert(
  FastCheck.property(credentialsArbitrary, (credentials) => {
    // Property: Valid credentials structure should not cause crashes
    const result = Effect.runSync(Effect.either(authenticateUser(credentials)))
    // Even if authentication fails, it should be a controlled failure
    return result._tag === "Left" ? 
      result.left instanceof Error : 
      SessionSchema.is(result.right)
  })
)

// Helper functions (would be implemented elsewhere)
const findUserByEmail = (email: string) => Effect.succeed({
  id: "user-123",
  hashedPassword: "hashed-password",
  twoFactorEnabled: false
})

const verifyPassword = (password: string, hash: string) => Effect.succeed(true)

const createSession = (userId: string) => Effect.succeed({
  userId,
  expiresAt: new Date(Date.now() + 3600000),
  permissions: ["read", "write"]
})
```

### Example 3: Data Processing Pipeline

Testing data transformation pipelines with complex nested data:

```typescript
import { Effect, FastCheck, Schema, Arbitrary, Array as Arr } from "effect"

const RawEventSchema = Schema.Struct({
  timestamp: Schema.Date,
  userId: Schema.String,
  eventType: Schema.Literal("page_view", "click", "purchase", "signup"),
  properties: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  sessionId: Schema.String,
  deviceInfo: Schema.Struct({
    userAgent: Schema.String,
    ipAddress: Schema.String.pipe(Schema.pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)),
    screenResolution: Schema.String
  })
})

const ProcessedEventSchema = Schema.Struct({
  id: Schema.String,
  timestamp: Schema.Date,
  userId: Schema.String,
  eventType: Schema.String,
  normalizedProperties: Schema.Record({ key: Schema.String, value: Schema.String }),
  country: Schema.String,
  browser: Schema.String
})

// Event processing pipeline
const processEvents = (rawEvents: ReadonlyArray<unknown>) => Effect.gen(function* () {
  const validated = yield* Effect.forEach(rawEvents, event => 
    Schema.decodeUnknown(RawEventSchema)(event)
  )
  
  return yield* Effect.forEach(validated, processEvent)
})

const processEvent = (event: Schema.Schema.Type<typeof RawEventSchema>) => Effect.gen(function* () {
  const country = yield* geolocateIP(event.deviceInfo.ipAddress)
  const browser = extractBrowser(event.deviceInfo.userAgent)
  
  return {
    id: generateEventId(event),
    timestamp: event.timestamp,
    userId: event.userId,
    eventType: event.eventType,
    normalizedProperties: normalizeProperties(event.properties),
    country,
    browser
  } satisfies Schema.Schema.Type<typeof ProcessedEventSchema>
})

// Property-based tests
const rawEventArbitrary = Arbitrary.make(RawEventSchema)
const eventsArrayArbitrary = FastCheck.array(rawEventArbitrary, { minLength: 1, maxLength: 100 })

FastCheck.assert(
  FastCheck.property(eventsArrayArbitrary, (events) => {
    const result = Effect.runSync(Effect.either(processEvents(events)))
    
    if (result._tag === "Left") {
      return false // Processing should not fail for valid events
    }
    
    const processed = result.right
    
    // Properties to verify:
    // 1. Same number of events
    // 2. All timestamps preserved
    // 3. All events have valid structure
    return processed.length === events.length &&
           processed.every(event => ProcessedEventSchema.is(event)) &&
           processed.every((processed, i) => 
             processed.timestamp.getTime() === events[i]!.timestamp.getTime()
           )
  })
)

// Helper functions
const geolocateIP = (ip: string) => Effect.succeed("US")
const extractBrowser = (userAgent: string) => "Chrome"
const generateEventId = (event: any) => `evt_${Date.now()}_${Math.random()}`
const normalizeProperties = (props: Record<string, unknown>) => 
  Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, String(v)])
  )
```

## Advanced Features Deep Dive

### Custom Arbitrary Annotations

Customize data generation for realistic test scenarios:

```typescript
import { FastCheck, Schema, Arbitrary } from "effect"
import { faker } from "@faker-js/faker"

// Custom name generator using Faker
const RealisticNameSchema = Schema.String.annotations({
  arbitrary: () => (fc) => 
    fc.constant(null).map(() => faker.person.fullName())
})

// Custom email generator
const RealisticEmailSchema = Schema.String.annotations({
  arbitrary: () => (fc) => 
    fc.constant(null).map(() => faker.internet.email())
})

// Custom date range
const RecentDateSchema = Schema.Date.annotations({
  arbitrary: () => (fc) => 
    fc.constant(null).map(() => faker.date.recent({ days: 30 }))
})

const UserSchema = Schema.Struct({
  id: Schema.String,
  name: RealisticNameSchema,
  email: RealisticEmailSchema,
  registeredAt: RecentDateSchema,
  preferences: Schema.Struct({
    newsletter: Schema.Boolean,
    theme: Schema.Literal("light", "dark", "auto")
  })
})

const userArbitrary = Arbitrary.make(UserSchema)

console.log(FastCheck.sample(userArbitrary, 2))
// Output:
// [
//   {
//     id: "abc123",
//     name: "John Smith",
//     email: "john.smith@example.com",
//     registeredAt: 2024-01-15T10:30:00.000Z,
//     preferences: { newsletter: true, theme: "dark" }
//   },
//   ...
// ]
```

### Advanced Property Testing Strategies

#### Compositional Properties

```typescript
import { Effect, FastCheck, Schema, Arbitrary } from "effect"

const MoneySchema = Schema.Number.pipe(Schema.between(0, 1000000))
const moneyArbitrary = Arbitrary.make(MoneySchema)

// Test money operations maintain invariants
FastCheck.assert(
  FastCheck.property(
    moneyArbitrary,
    moneyArbitrary,
    moneyArbitrary,
    (a, b, c) => {
      // Associativity: (a + b) + c = a + (b + c)
      const left = addMoney(addMoney(a, b), c)
      const right = addMoney(a, addMoney(b, c))
      return Math.abs(left - right) < 0.01
    }
  )
)

// Test commutativity: a + b = b + a
FastCheck.assert(
  FastCheck.property(moneyArbitrary, moneyArbitrary, (a, b) => {
    const left = addMoney(a, b)
    const right = addMoney(b, a)
    return Math.abs(left - right) < 0.01
  })
)

function addMoney(a: number, b: number): number {
  return Math.round((a + b) * 100) / 100
}
```

#### Stateful Testing

```typescript
import { Effect, FastCheck, Schema, Arbitrary } from "effect"

// Model a shopping cart
interface CartState {
  items: Array<{ id: string; quantity: number; price: number }>
  total: number
}

const CartCommandSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("add"),
    itemId: Schema.String,
    quantity: Schema.Number.pipe(Schema.between(1, 10)),
    price: Schema.Number.pipe(Schema.between(0.01, 999.99))
  }),
  Schema.Struct({
    type: Schema.Literal("remove"),
    itemId: Schema.String
  }),
  Schema.Struct({
    type: Schema.Literal("clear")
  })
)

class CartModel {
  constructor(private state: CartState = { items: [], total: 0 }) {}

  execute(command: Schema.Schema.Type<typeof CartCommandSchema>): CartModel {
    switch (command.type) {
      case "add": {
        const existingIndex = this.state.items.findIndex(item => item.id === command.itemId)
        const newItems = existingIndex >= 0
          ? this.state.items.map((item, i) => 
              i === existingIndex 
                ? { ...item, quantity: item.quantity + command.quantity }
                : item
            )
          : [...this.state.items, { id: command.itemId, quantity: command.quantity, price: command.price }]
        
        const total = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        return new CartModel({ items: newItems, total })
      }
      case "remove": {
        const newItems = this.state.items.filter(item => item.id !== command.itemId)
        const total = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        return new CartModel({ items: newItems, total })
      }
      case "clear":
        return new CartModel({ items: [], total: 0 })
    }
  }

  getTotal(): number {
    return this.state.total
  }

  getItemCount(): number {
    return this.state.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  invariants(): boolean {
    // Total should match sum of item prices
    const calculatedTotal = this.state.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    )
    return Math.abs(this.state.total - calculatedTotal) < 0.01
  }
}

const commandArbitrary = Arbitrary.make(CartCommandSchema)
const commandsArbitrary = FastCheck.array(commandArbitrary, { maxLength: 20 })

// Test that cart invariants hold after any sequence of operations
FastCheck.assert(
  FastCheck.property(commandsArbitrary, (commands) => {
    const finalCart = commands.reduce(
      (cart, command) => cart.execute(command),
      new CartModel()
    )
    return finalCart.invariants()
  })
)
```

## Practical Patterns & Best Practices

### Pattern 1: Schema-First Test Generation

```typescript
import { Effect, FastCheck, Schema, Arbitrary } from "effect"

// Define your domain schema first
const OrderSchema = Schema.Struct({
  id: Schema.String,
  customerId: Schema.String,
  items: Schema.Array(Schema.Struct({
    productId: Schema.String,
    quantity: Schema.Number.pipe(Schema.between(1, 100)),
    price: Schema.Number.pipe(Schema.between(0.01, 9999.99))
  })).pipe(Schema.minItems(1)),
  status: Schema.Literal("pending", "processing", "shipped", "delivered", "cancelled"),
  createdAt: Schema.Date,
  shippingAddress: Schema.Struct({
    street: Schema.String,
    city: Schema.String,
    state: Schema.String,
    zipCode: Schema.String.pipe(Schema.pattern(/^\d{5}$/)),
    country: Schema.String
  })
})

// Helper to create property-based tests for any business logic
const createBusinessRuleTest = <T>(
  schema: Schema.Schema<T>,
  rule: (data: T) => boolean,
  description: string
) => {
  const arbitrary = Arbitrary.make(schema)
  
  return () => FastCheck.assert(
    FastCheck.property(arbitrary, rule),
    { verbose: true, numRuns: 200 }
  )
}

// Test business rules
const testOrderTotalCalculation = createBusinessRuleTest(
  OrderSchema,
  (order) => {
    const calculatedTotal = order.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    )
    const businessTotal = calculateOrderTotal(order)
    return Math.abs(calculatedTotal - businessTotal) < 0.01
  },
  "Order total should equal sum of item totals"
)

// Test status transitions
const testValidStatusTransitions = createBusinessRuleTest(
  OrderSchema,
  (order) => {
    // All orders should be valid regardless of status
    return isValidOrderStatus(order.status, order.createdAt)
  },
  "Order status should be valid for creation date"
)

// Run tests
testOrderTotalCalculation()
testValidStatusTransitions()

// Business logic functions
function calculateOrderTotal(order: Schema.Schema.Type<typeof OrderSchema>): number {
  return order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
}

function isValidOrderStatus(status: string, createdAt: Date): boolean {
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  
  // Business rule: orders can't be delivered within 1 day
  if (status === "delivered" && daysSinceCreation < 1) {
    return false
  }
  
  return true
}
```

### Pattern 2: Error Boundary Testing

```typescript
import { Effect, FastCheck, Schema, Arbitrary } from "effect"

// Test that functions handle edge cases gracefully
const SafeDivisionSchema = Schema.Struct({
  numerator: Schema.Number,
  denominator: Schema.Number
})

const safeDivide = (numerator: number, denominator: number) => Effect.gen(function* () {
  if (denominator === 0) {
    return yield* Effect.fail(new Error("Division by zero"))
  }
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return yield* Effect.fail(new Error("Invalid numbers"))
  }
  return numerator / denominator
})

const divisionArbitrary = Arbitrary.make(SafeDivisionSchema)

// Property: Function should never throw, only return Effect failures
FastCheck.assert(
  FastCheck.property(divisionArbitrary, ({ numerator, denominator }) => {
    try {
      const result = Effect.runSync(Effect.either(safeDivide(numerator, denominator)))
      return result._tag === "Left" || typeof result.right === "number"
    } catch {
      return false // Should never throw
    }
  })
)

// Property: Division by non-zero should succeed when inputs are finite
FastCheck.assert(
  FastCheck.property(
    FastCheck.float({ noNaN: true, noDefaultInfinity: true }),
    FastCheck.float({ noNaN: true, noDefaultInfinity: true }).filter(x => x !== 0),
    (numerator, denominator) => {
      const result = Effect.runSync(Effect.either(safeDivide(numerator, denominator)))
      return result._tag === "Right"
    }
  )
)
```

### Pattern 3: Integration Test Helpers

```typescript
import { Effect, FastCheck, Schema, Arbitrary, Layer } from "effect"

// Service interface
interface UserRepository {
  readonly save: (user: User) => Effect.Effect<User, RepositoryError>
  readonly findById: (id: string) => Effect.Effect<User, RepositoryError>
}

const UserRepository = Schema.Class<UserRepository>("UserRepository")({
  save: Schema.Function(Schema.Struct({ user: UserSchema }), Schema.Union(UserSchema, RepositoryErrorSchema)),
  findById: Schema.Function(Schema.Struct({ id: Schema.String }), Schema.Union(UserSchema, RepositoryErrorSchema))
})

interface RepositoryError {
  readonly _tag: "RepositoryError"
  readonly message: string
}

const RepositoryErrorSchema = Schema.Struct({
  _tag: Schema.Literal("RepositoryError"),
  message: Schema.String
})

// Create property-based integration tests
const createRepositoryTest = <T, E>(
  service: Effect.Effect<T, never, UserRepository>,
  operation: (svc: T, user: User) => Effect.Effect<any, E>,
  property: (user: User, result: any) => boolean,
  description: string
) => {
  const userArbitrary = Arbitrary.make(UserSchema)
  
  return () => FastCheck.assert(
    FastCheck.asyncProperty(userArbitrary, async (user) => {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const svc = yield* service
          return yield* Effect.either(operation(svc, user))
        })
      )
      
      return result._tag === "Right" ? property(user, result.right) : true
    })
  )
}

// Test repository operations
const UserSchema = Schema.Struct({
  id: Schema.String,
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  name: Schema.String.pipe(Schema.minLength(1)),
  age: Schema.Number.pipe(Schema.between(13, 120))
})

type User = Schema.Schema.Type<typeof UserSchema>

// Mock repository for testing
const mockUserRepository = Layer.succeed(UserRepository, {
  save: (user: User) => Effect.succeed(user),
  findById: (id: string) => Effect.succeed({
    id,
    email: "test@example.com",
    name: "Test User",
    age: 25
  })
})

const testUserSave = createRepositoryTest(
  Effect.service(UserRepository),
  (repo, user) => repo.save(user),
  (originalUser, savedUser) => savedUser.id === originalUser.id,
  "Saved user should retain original ID"
)

// Run with mock layer
const runTest = Effect.provide(testUserSave(), mockUserRepository)
```

## Integration Examples

### Integration with Vitest

```typescript
import { describe, it } from "@beep/testkit"
import { Effect, FastCheck, Schema, Arbitrary } from "effect"

describe("User Service", () => {
  const UserSchema = Schema.Struct({
    id: Schema.String,
    email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
    name: Schema.String.pipe(Schema.minLength(1))
  })

  const userArbitrary = Arbitrary.make(UserSchema)

  it.prop("should validate all generated users", [userArbitrary], (user) =>
    Effect.gen(function* () {
      const result = yield* Effect.either(validateUser(user))
      return result._tag === "Right"
    })
  )

  it.prop("should hash passwords consistently", 
    [FastCheck.string({ minLength: 8 })], 
    (password) => Effect.gen(function* () {
      const hash1 = yield* hashPassword(password)
      const hash2 = yield* hashPassword(password)
      const isValid1 = yield* verifyPassword(password, hash1)
      const isValid2 = yield* verifyPassword(password, hash2)
      return isValid1 && isValid2
    })
  )
})

const validateUser = (user: unknown) => Effect.succeed(user) // Simplified
const hashPassword = (password: string) => Effect.succeed(`hashed_${password}`)
const verifyPassword = (password: string, hash: string) => 
  Effect.succeed(hash === `hashed_${password}`)
```

### Integration with Express.js API Testing

```typescript
import { Effect, FastCheck, Schema, Arbitrary } from "effect"
import express from "express"
import request from "supertest"

const CreateUserRequestSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(100)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.between(13, 120))
})

const app = express()
app.use(express.json())

app.post("/users", (req, res) => {
  const result = Schema.decodeUnknownSync(CreateUserRequestSchema)(req.body)
  res.json({ id: "generated-id", ...result })
})

// Property-based API testing
const testUserCreationEndpoint = () => {
  const requestArbitrary = Arbitrary.make(CreateUserRequestSchema)
  
  return FastCheck.asyncProperty(requestArbitrary, async (userData) => {
    const response = await request(app)
      .post("/users")
      .send(userData)
      .expect(200)
    
    // Properties to verify:
    // 1. Response includes all input data
    // 2. Response includes generated ID
    // 3. Response structure is valid
    return response.body.name === userData.name &&
           response.body.email === userData.email &&
           response.body.age === userData.age &&
           typeof response.body.id === "string" &&
           response.body.id.length > 0
  })
}

// Run the test
FastCheck.assert(testUserCreationEndpoint())
```

### Integration with Database Testing

```typescript
import { Effect, FastCheck, Schema, Arbitrary, Layer } from "effect"

// Database layer for testing
interface Database {
  readonly query: <T>(sql: string, params: ReadonlyArray<unknown>) => Effect.Effect<T[], DatabaseError>
  readonly transaction: <T>(
    operation: Effect.Effect<T, DatabaseError, Database>
  ) => Effect.Effect<T, DatabaseError>
}

const Database = Schema.Class<Database>("Database")({} as any) // Simplified for example

interface DatabaseError {
  readonly _tag: "DatabaseError"
  readonly message: string
}

const UserRepository = {
  create: (user: User) => Effect.gen(function* () {
    const db = yield* Database
    const [created] = yield* db.query(
      "INSERT INTO users (name, email, age) VALUES (?, ?, ?) RETURNING *",
      [user.name, user.email, user.age]
    )
    return created
  }),

  findByEmail: (email: string) => Effect.gen(function* () {
    const db = yield* Database
    const [found] = yield* db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )
    return found
  })
}

// Property-based database tests
const UserSchema = Schema.Struct({
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: Schema.Number.pipe(Schema.between(13, 120))
})

type User = Schema.Schema.Type<typeof UserSchema>

const testUserRepository = () => {
  const userArbitrary = Arbitrary.make(UserSchema)
  
  return FastCheck.asyncProperty(userArbitrary, async (user) => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        // Create user
        const created = yield* UserRepository.create(user)
        
        // Find by email
        const found = yield* UserRepository.findByEmail(user.email)
        
        return { created, found }
      }).pipe(
        Effect.provide(mockDatabaseLayer)
      )
    )
    
    // Property: Created user should be findable by email
    return result.created.email === result.found.email &&
           result.created.name === result.found.name
  })
}

const mockDatabaseLayer = Layer.succeed(Database, {
  query: (sql, params) => Effect.succeed([{ 
    id: "mock-id", 
    name: params[0], 
    email: params[1], 
    age: params[2] 
  }]),
  transaction: (op) => op
})

FastCheck.assert(testUserRepository())
```

## Conclusion

FastCheck provides comprehensive property-based testing capabilities for Effect applications, enabling automatic generation of test cases that would be impossible to write manually.

Key benefits:
- **Comprehensive Coverage**: Automatically tests edge cases and boundary conditions
- **Schema Integration**: Generates valid test data directly from Effect schemas  
- **Shrinking Support**: Automatically finds minimal failing examples for debugging

FastCheck is invaluable when you need confidence that your code works correctly across the full range of possible inputs, not just the happy path cases you might think to test manually.