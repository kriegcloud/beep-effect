# Pretty: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Pretty Solves

When building applications with complex data structures, developers often struggle with readable output for debugging, logging, and user interfaces. Traditional approaches lead to unreadable object representations and inconsistent formatting:

```typescript
// Traditional approach - unreadable output
const user = {
  id: "user123",
  name: "Alice",
  preferences: {
    theme: "dark",
    notifications: true
  },
  metadata: {
    createdAt: new Date("2024-01-15T10:00:00Z"),
    tags: ["premium", "verified"]
  }
}

console.log(user)
// Output: [object Object] - completely useless

console.log(JSON.stringify(user))
// Output: {"id":"user123","name":"Alice","preferences":{"theme":"dark","notifications":true},"metadata":{"createdAt":"2024-01-15T10:00:00.000Z","tags":["premium","verified"]}}
// Hard to read, dates as strings, no control over formatting

// Complex nested structures become unmanageable
const complexData = {
  users: [user],
  config: new Map([["timeout", 5000]]),
  buffer: new Uint8Array([1, 2, 3])
}

console.log(complexData)
// Output: Mixed representations, no consistency
```

This approach leads to:
- **Unreadable debugging output** - `[object Object]` tells you nothing about the data
- **Inconsistent formatting** - different types display differently across environments
- **No control over presentation** - can't customize how values appear in logs or UIs
- **Poor developer experience** - debugging complex data structures becomes painful

### The Pretty Solution

Pretty provides schema-driven, customizable formatting that produces human-readable representations of complex data structures:

```typescript
import { Pretty, Schema } from "effect"

// Schema-driven pretty printing with automatic formatting
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  preferences: Schema.Struct({
    theme: Schema.Literal("light", "dark"),
    notifications: Schema.Boolean
  }),
  metadata: Schema.Struct({
    createdAt: Schema.Date,
    tags: Schema.Array(Schema.String)
  })
})

const prettyUser = Pretty.make(UserSchema)

const user = {
  id: "user123",
  name: "Alice",
  preferences: {
    theme: "dark" as const,
    notifications: true
  },
  metadata: {
    createdAt: new Date("2024-01-15T10:00:00Z"),
    tags: ["premium", "verified"]
  }
}

console.log(prettyUser(user))
// Output: { "id": "user123", "name": "Alice", "preferences": { "theme": "dark", "notifications": true }, "metadata": { "createdAt": new Date("2024-01-15T10:00:00.000Z"), "tags": ["premium", "verified"] } }
// Structured, readable, consistent formatting
```

### Key Concepts

**Schema Integration**: Pretty works seamlessly with Effect Schema, automatically generating formatters based on your type definitions

**Customizable Formatting**: Override default formatting for specific types with custom pretty annotations

**Structural Matching**: Uses AST pattern matching to handle complex nested structures consistently

**Type Safety**: Generated pretty functions are fully type-safe and match your schema definitions

**Composable**: Pretty formatters compose naturally for complex data structures

## Basic Usage Patterns

### Pattern 1: Basic Schema Pretty Printing

```typescript
import { Pretty, Schema } from "effect"

// Simple primitive types
const StringPretty = Pretty.make(Schema.String)
console.log(StringPretty("hello")) // "hello"

const NumberPretty = Pretty.make(Schema.Number)
console.log(NumberPretty(42)) // 42
console.log(NumberPretty(NaN)) // NaN
console.log(NumberPretty(Infinity)) // Infinity

const BooleanPretty = Pretty.make(Schema.Boolean)
console.log(BooleanPretty(true)) // true

// Special values
const VoidPretty = Pretty.make(Schema.Void)
console.log(VoidPretty(undefined)) // void(0)

const BigIntPretty = Pretty.make(Schema.BigIntFromSelf)
console.log(BigIntPretty(123n)) // 123n
```

### Pattern 2: Complex Data Structures

```typescript
import { Pretty, Schema } from "effect"

// Object structures
const PersonSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  email: Schema.optional(Schema.String)
})

const prettyPerson = Pretty.make(PersonSchema)

console.log(prettyPerson({
  name: "Alice",
  age: 30,
  email: "alice@example.com"
}))
// { "name": "Alice", "age": 30, "email": "alice@example.com" }

console.log(prettyPerson({
  name: "Bob",
  age: 25
}))
// { "name": "Bob", "age": 25 }

// Array structures
const NumberArraySchema = Schema.Array(Schema.Number)
const prettyNumbers = Pretty.make(NumberArraySchema)

console.log(prettyNumbers([1, 2, 3, 4, 5]))
// [1, 2, 3, 4, 5]

console.log(prettyNumbers([]))
// []
```

### Pattern 3: Union Types and Enums

```typescript
import { Pretty, Schema } from "effect"

// Union types
const StatusSchema = Schema.Union(
  Schema.Literal("pending"),
  Schema.Literal("completed"),
  Schema.Literal("failed")
)

const prettyStatus = Pretty.make(StatusSchema)
console.log(prettyStatus("pending")) // "pending"
console.log(prettyStatus("completed")) // "completed"

// Enum handling
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue"
}

const ColorSchema = Schema.Enums(Color)
const prettyColor = Pretty.make(ColorSchema)

console.log(prettyColor(Color.Red)) // "red"
console.log(prettyColor(Color.Blue)) // "blue"

// Discriminated unions
const EventSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("click"),
    element: Schema.String,
    coordinates: Schema.Struct({
      x: Schema.Number,
      y: Schema.Number
    })
  }),
  Schema.Struct({
    type: Schema.Literal("keydown"),
    key: Schema.String,
    modifiers: Schema.Array(Schema.String)
  })
)

const prettyEvent = Pretty.make(EventSchema)

console.log(prettyEvent({
  type: "click",
  element: "button",
  coordinates: { x: 100, y: 200 }
}))
// { "type": "click", "element": "button", "coordinates": { "x": 100, "y": 200 } }
```

## Real-World Examples

### Example 1: API Response Debugging

Debug complex API responses with structured pretty printing for better development experience.

```typescript
import { Pretty, Schema, Effect, Console } from "effect"

// API response schemas
const UserSchema = Schema.Struct({
  id: Schema.String,
  username: Schema.String,
  email: Schema.String,
  profile: Schema.Struct({
    firstName: Schema.String,
    lastName: Schema.String,
    avatar: Schema.optional(Schema.String),
    bio: Schema.optional(Schema.String)
  }),
  preferences: Schema.Struct({
    theme: Schema.Union(Schema.Literal("light"), Schema.Literal("dark")),
    language: Schema.String,
    notifications: Schema.Struct({
      email: Schema.Boolean,
      push: Schema.Boolean,
      sms: Schema.Boolean
    })
  }),
  metadata: Schema.Struct({
    createdAt: Schema.Date,
    lastLoginAt: Schema.optional(Schema.Date),
    loginCount: Schema.Number,
    roles: Schema.Array(Schema.String)
  })
})

const ApiResponseSchema = Schema.Struct({
  success: Schema.Boolean,
  data: Schema.optional(UserSchema),
  error: Schema.optional(Schema.Struct({
    code: Schema.String,
    message: Schema.String,
    details: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
  })),
  meta: Schema.Struct({
    requestId: Schema.String,
    timestamp: Schema.Date,
    processingTime: Schema.Number
  })
})

// Pretty printers for debugging
const prettyUser = Pretty.make(UserSchema)
const prettyApiResponse = Pretty.make(ApiResponseSchema)

// API service with debugging
const fetchUser = (userId: string) => Effect.gen(function* () {
  // Simulate API call
  const response = {
    success: true,
    data: {
      id: userId,
      username: "alice_dev",
      email: "alice@example.com",
      profile: {
        firstName: "Alice",
        lastName: "Smith",
        avatar: "https://example.com/avatar.jpg",
        bio: "Full-stack developer"
      },
      preferences: {
        theme: "dark" as const,
        language: "en-US",
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      metadata: {
        createdAt: new Date("2023-01-15T10:00:00Z"),
        lastLoginAt: new Date("2024-01-20T14:30:00Z"),
        loginCount: 127,
        roles: ["user", "developer"]
      }
    },
    meta: {
      requestId: "req_abc123",
      timestamp: new Date(),
      processingTime: 45
    }
  }
  
  // Debug log with pretty printing
  yield* Console.debug("API Response:", prettyApiResponse(response))
  
  return response.data!
})

// Error response debugging
const fetchUserWithError = (userId: string) => Effect.gen(function* () {
  const errorResponse = {
    success: false,
    error: {
      code: "USER_NOT_FOUND",
      message: "User with specified ID does not exist",
      details: {
        userId,
        searchedAt: new Date().toISOString(),
        suggestion: "Check if the user ID is correct"
      }
    },
    meta: {
      requestId: "req_def456",
      timestamp: new Date(),
      processingTime: 12
    }
  }
  
  yield* Console.error("API Error:", prettyApiResponse(errorResponse))
  
  return Effect.fail(errorResponse.error)
})

// Usage with debugging
const debugUserFetch = Effect.gen(function* () {
  // Successful request
  const user = yield* fetchUser("user123")
  yield* Console.info("Retrieved user:", prettyUser(user))
  
  // Error request  
  yield* fetchUserWithError("nonexistent").pipe(
    Effect.catchAll(error => 
      Console.error("Failed to fetch user:", JSON.stringify(error, null, 2))
    )
  )
})
```

### Example 2: Configuration Management and Validation

Use Pretty for readable configuration debugging and validation error reporting.

```typescript
import { Pretty, Schema, Effect, Config, Console } from "effect"

// Database configuration schema
const DatabaseConfigSchema = Schema.Struct({
  host: Schema.String,
  port: Schema.Number.pipe(Schema.int(), Schema.between(1, 65535)),
  database: Schema.String,
  username: Schema.String,
  password: Schema.String,
  ssl: Schema.Boolean,
  poolConfig: Schema.Struct({
    min: Schema.Number.pipe(Schema.int(), Schema.nonnegative()),
    max: Schema.Number.pipe(Schema.int(), Schema.positive()),
    idleTimeoutMillis: Schema.Number.pipe(Schema.int(), Schema.positive()),
    connectionTimeoutMillis: Schema.Number.pipe(Schema.int(), Schema.positive())
  })
})

// Server configuration schema
const ServerConfigSchema = Schema.Struct({
  port: Schema.Number.pipe(Schema.int(), Schema.between(1, 65535)),
  host: Schema.String,
  cors: Schema.Struct({
    origin: Schema.Union(Schema.String, Schema.Array(Schema.String)),
    credentials: Schema.Boolean,
    methods: Schema.Array(Schema.String)
  }),
  rateLimit: Schema.Struct({
    windowMs: Schema.Number.pipe(Schema.int(), Schema.positive()),
    maxRequests: Schema.Number.pipe(Schema.int(), Schema.positive())
  })
})

// Application configuration schema
const AppConfigSchema = Schema.Struct({
  environment: Schema.Union(
    Schema.Literal("development"),
    Schema.Literal("staging"), 
    Schema.Literal("production")
  ),
  database: DatabaseConfigSchema,
  server: ServerConfigSchema,
  logging: Schema.Struct({
    level: Schema.Union(
      Schema.Literal("debug"),
      Schema.Literal("info"),
      Schema.Literal("warn"),
      Schema.Literal("error")
    ),
    format: Schema.Union(Schema.Literal("json"), Schema.Literal("text")),
    destinations: Schema.Array(Schema.Union(
      Schema.Literal("console"),
      Schema.Literal("file"),
      Schema.Literal("syslog")
    ))
  }),
  features: Schema.Struct({
    authentication: Schema.Boolean,
    analytics: Schema.Boolean,
    caching: Schema.Boolean,
    experimental: Schema.Record({ key: Schema.String, value: Schema.Boolean })
  })
})

// Pretty printers for configuration debugging
const prettyDatabaseConfig = Pretty.make(DatabaseConfigSchema)
const prettyServerConfig = Pretty.make(ServerConfigSchema)
const prettyAppConfig = Pretty.make(AppConfigSchema)

// Configuration loader with validation and pretty printing
const loadConfiguration = Effect.gen(function* () {
  const rawConfig = {
    environment: "development" as const,
    database: {
      host: "localhost",
      port: 5432,
      database: "myapp_dev",
      username: "developer",
      password: "dev_password",
      ssl: false,
      poolConfig: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      }
    },
    server: {
      port: 3000,
      host: "127.0.0.1",
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"]
      },
      rateLimit: {
        windowMs: 900000, // 15 minutes
        maxRequests: 100
      }
    },
    logging: {
      level: "debug" as const,
      format: "text" as const,
      destinations: ["console", "file"] as const
    },
    features: {
      authentication: true,
      analytics: false,
      caching: true,
      experimental: {
        "new_ui": true,
        "beta_api": false
      }
    }
  }
  
  // Validate and parse configuration
  const config = yield* Schema.decodeUnknown(AppConfigSchema)(rawConfig)
  
  // Debug output with pretty printing
  yield* Console.info("Loaded configuration:")
  yield* Console.info("Environment:", config.environment)
  yield* Console.info("Database:", prettyDatabaseConfig(config.database))
  yield* Console.info("Server:", prettyServerConfig(config.server))
  yield* Console.info("Full config:", prettyAppConfig(config))
  
  return config
})

// Configuration validation with pretty error reporting
const validateConfigurationChanges = (newConfig: unknown) => Effect.gen(function* () {
  const result = yield* Schema.decodeUnknown(AppConfigSchema)(newConfig).pipe(
    Effect.either
  )
  
  if (result._tag === "Left") {
    yield* Console.error("Configuration validation failed:")
    yield* Console.error("Error details:", result.left.message)
    return Effect.fail("Invalid configuration")
  }
  
  yield* Console.info("Configuration validation successful:")
  yield* Console.info(prettyAppConfig(result.right))
  
  return result.right
})

// Configuration comparison utility
const compareConfigurations = (oldConfig: any, newConfig: any) => Effect.gen(function* () {
  yield* Console.info("=== Configuration Comparison ===")
  yield* Console.info("Previous configuration:")
  yield* Console.info(prettyAppConfig(oldConfig))
  yield* Console.info("\nNew configuration:")
  yield* Console.info(prettyAppConfig(newConfig))
  
  // Highlight specific differences for critical sections
  if (oldConfig.database.host !== newConfig.database.host || 
      oldConfig.database.port !== newConfig.database.port) {
    yield* Console.warn("⚠️  Database connection settings changed:")
    yield* Console.warn("Old:", prettyDatabaseConfig(oldConfig.database))
    yield* Console.warn("New:", prettyDatabaseConfig(newConfig.database))
  }
  
  if (oldConfig.environment !== newConfig.environment) {
    yield* Console.warn("🔄 Environment changed:", `${oldConfig.environment} → ${newConfig.environment}`)
  }
})
```

### Example 3: Event Sourcing and Audit Logging

Implement readable event logging and audit trails using Pretty for complex domain events.

```typescript
import { Pretty, Schema, Effect, Console, Data } from "effect"

// Domain event schemas
const UserEventSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("UserRegistered"),
    userId: Schema.String,
    email: Schema.String,
    timestamp: Schema.Date,
    metadata: Schema.Struct({
      source: Schema.String,
      userAgent: Schema.optional(Schema.String),
      ipAddress: Schema.String
    })
  }),
  Schema.Struct({
    type: Schema.Literal("ProfileUpdated"),
    userId: Schema.String,
    changes: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
    timestamp: Schema.Date,
    metadata: Schema.Struct({
      updatedBy: Schema.String,
      reason: Schema.optional(Schema.String)
    })
  }),
  Schema.Struct({
    type: Schema.Literal("PasswordChanged"),
    userId: Schema.String,
    timestamp: Schema.Date,
    metadata: Schema.Struct({
      method: Schema.Union(
        Schema.Literal("self-service"),
        Schema.Literal("admin-reset"),
        Schema.Literal("forgot-password")
      ),
      initiatedBy: Schema.String,
      securityLevel: Schema.Union(
        Schema.Literal("low"),
        Schema.Literal("medium"),
        Schema.Literal("high")
      )
    })
  })
)

const OrderEventSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("OrderCreated"),
    orderId: Schema.String,
    customerId: Schema.String,
    items: Schema.Array(Schema.Struct({
      productId: Schema.String,
      quantity: Schema.Number.pipe(Schema.int(), Schema.positive()),
      unitPrice: Schema.Number.pipe(Schema.positive()),
      totalPrice: Schema.Number.pipe(Schema.positive())
    })),
    totalAmount: Schema.Number.pipe(Schema.positive()),
    timestamp: Schema.Date,
    metadata: Schema.Struct({
      channel: Schema.Union(
        Schema.Literal("web"),
        Schema.Literal("mobile"),
        Schema.Literal("api")
      ),
      promocode: Schema.optional(Schema.String),
      referrer: Schema.optional(Schema.String)
    })
  }),
  Schema.Struct({
    type: Schema.Literal("OrderShipped"),
    orderId: Schema.String,
    trackingNumber: Schema.String,
    carrier: Schema.String,
    estimatedDelivery: Schema.Date,
    timestamp: Schema.Date,
    metadata: Schema.Struct({
      warehouse: Schema.String,
      shippingMethod: Schema.String,
      cost: Schema.Number.pipe(Schema.nonnegative())
    })
  }),
  Schema.Struct({
    type: Schema.Literal("OrderCancelled"),
    orderId: Schema.String,
    reason: Schema.String,
    refundAmount: Schema.Number.pipe(Schema.nonnegative()),
    timestamp: Schema.Date,
    metadata: Schema.Struct({
      cancelledBy: Schema.String,
      automaticRefund: Schema.Boolean,
      customerNotified: Schema.Boolean
    })
  })
)

// Event store schema
const EventLogEntrySchema = Schema.Struct({
  eventId: Schema.String,
  aggregateId: Schema.String,
  aggregateType: Schema.Union(Schema.Literal("User"), Schema.Literal("Order")),
  eventType: Schema.String,
  eventData: Schema.Union(UserEventSchema, OrderEventSchema),
  version: Schema.Number.pipe(Schema.int(), Schema.positive()),
  timestamp: Schema.Date,
  correlation: Schema.optional(Schema.Struct({
    correlationId: Schema.String,
    causationId: Schema.optional(Schema.String),
    sessionId: Schema.optional(Schema.String)
  }))
})

// Pretty printers for event logging
const prettyUserEvent = Pretty.make(UserEventSchema)
const prettyOrderEvent = Pretty.make(OrderEventSchema)
const prettyEventLogEntry = Pretty.make(EventLogEntrySchema)

// Event sourcing service with pretty logging
const EventStore = Effect.gen(function* () {
  const events: Array<typeof EventLogEntrySchema.Type> = []
  
  const appendEvent = (event: typeof EventLogEntrySchema.Type) => Effect.gen(function* () {
    events.push(event)
    
    // Log event with pretty formatting
    yield* Console.info("📝 Event stored:")
    yield* Console.info(prettyEventLogEntry(event))
    
    // Specific formatting for different event types
    if (event.eventData.type === "UserRegistered") {
      yield* Console.info(`🎉 New user registered: ${event.eventData.email}`)
    } else if (event.eventData.type === "OrderCreated") {
      yield* Console.info(`💰 New order: $${event.eventData.totalAmount} (${event.eventData.items.length} items)`)
    } else if (event.eventData.type === "OrderShipped") {
      yield* Console.info(`📦 Order shipped: ${event.eventData.trackingNumber} via ${event.eventData.carrier}`)
    }
    
    return event
  })
  
  const getEvents = (aggregateId: string) => Effect.gen(function* () {
    const aggregateEvents = events.filter(e => e.aggregateId === aggregateId)
    
    yield* Console.info(`📚 Event history for ${aggregateId}:`)
    for (const event of aggregateEvents) {
      yield* Console.info(`  ${event.version}: ${event.eventType}`)
      yield* Console.info(`    ${prettyEventLogEntry(event)}`)
    }
    
    return aggregateEvents
  })
  
  const getEventsByType = (eventType: string) => Effect.gen(function* () {
    const typeEvents = events.filter(e => e.eventType === eventType)
    
    yield* Console.info(`🔍 Events of type ${eventType}:`)
    for (const event of typeEvents) {
      yield* Console.info(prettyEventLogEntry(event))
    }
    
    return typeEvents
  })
  
  return { appendEvent, getEvents, getEventsByType } as const
})

// Business logic with event sourcing
const UserService = Effect.gen(function* () {
  const eventStore = yield* EventStore
  
  const registerUser = (email: string, source: string, ipAddress: string) => Effect.gen(function* () {
    const userId = `user_${Date.now()}`
    const userRegisteredEvent = {
      type: "UserRegistered" as const,
      userId,
      email,
      timestamp: new Date(),
      metadata: {
        source,
        ipAddress
      }
    }
    
    const eventLogEntry = {
      eventId: `evt_${Date.now()}`,
      aggregateId: userId,
      aggregateType: "User" as const,
      eventType: "UserRegistered",
      eventData: userRegisteredEvent,
      version: 1,
      timestamp: new Date()
    }
    
    yield* eventStore.appendEvent(eventLogEntry)
    
    return { userId, email }
  })
  
  const updateProfile = (userId: string, changes: Record<string, unknown>, updatedBy: string) => Effect.gen(function* () {
    const profileUpdatedEvent = {
      type: "ProfileUpdated" as const,
      userId,
      changes,
      timestamp: new Date(),
      metadata: {
        updatedBy,
        reason: "Profile update requested"
      }
    }
    
    const eventLogEntry = {
      eventId: `evt_${Date.now()}`,
      aggregateId: userId,
      aggregateType: "User" as const,
      eventType: "ProfileUpdated",
      eventData: profileUpdatedEvent,
      version: 2,
      timestamp: new Date()
    }
    
    yield* eventStore.appendEvent(eventLogEntry)
  })
  
  return { registerUser, updateProfile } as const
})

// Usage with comprehensive logging
const runEventSourcingExample = Effect.gen(function* () {
  const userService = yield* UserService
  const eventStore = yield* EventStore
  
  // Register a user
  const user = yield* userService.registerUser(
    "alice@example.com",
    "web_signup",
    "192.168.1.100"
  )
  
  // Update user profile
  yield* userService.updateProfile(
    user.userId,
    { firstName: "Alice", lastName: "Smith", theme: "dark" },
    "self"
  )
  
  // View event history
  yield* eventStore.getEvents(user.userId)
  
  // View events by type
  yield* eventStore.getEventsByType("UserRegistered")
})
```

## Advanced Features Deep Dive

### Feature 1: Custom Pretty Annotations

Override default formatting behavior with custom pretty annotations for specialized display requirements.

#### Basic Custom Pretty Usage

```typescript
import { Pretty, Schema, AST } from "effect"

// Custom pretty for specific types
const TimestampSchema = Schema.Date.annotations({
  pretty: () => (date: Date) => `[${date.toISOString()}]`
})

const prettyTimestamp = Pretty.make(TimestampSchema)
console.log(prettyTimestamp(new Date("2024-01-15T10:00:00Z")))
// Output: [2024-01-15T10:00:00.000Z]

// Custom pretty for user-defined types
const UserIdSchema = Schema.String.pipe(
  Schema.brand("UserId")
).annotations({
  pretty: () => (id: string) => `👤 ${id}`
})

const prettyUserId = Pretty.make(UserIdSchema)
console.log(prettyUserId("user123" as any))
// Output: 👤 user123
```

#### Real-World Custom Pretty: Money Formatting

```typescript
import { Pretty, Schema, Data } from "effect"

// Money type with custom formatting
class Money extends Data.Class<{
  readonly amount: number
  readonly currency: string
}> {
  static USD = (amount: number) => new Money({ amount, currency: "USD" })
  static EUR = (amount: number) => new Money({ amount, currency: "EUR" })
  
  toString() {
    return `${this.amount.toFixed(2)} ${this.currency}`
  }
}

const MoneySchema = Schema.instanceOf(Money).annotations({
  pretty: () => (money: Money) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: 2
    }).format(money.amount)
    return `💰 ${formatted}`
  }
})

// Product with custom money formatting
const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: MoneySchema,
  discountPrice: Schema.optional(MoneySchema),
  category: Schema.String
})

const prettyProduct = Pretty.make(ProductSchema)

const product = {
  id: "prod_123",
  name: "Wireless Headphones",
  price: Money.USD(199.99),
  discountPrice: Money.USD(149.99),
  category: "Electronics"
}

console.log(prettyProduct(product))
// Output: { "id": "prod_123", "name": "Wireless Headphones", "price": 💰 $199.99, "discountPrice": 💰 $149.99, "category": "Electronics" }
```

#### Advanced Custom Pretty: Complex Data Visualization

```typescript
import { Pretty, Schema, Array as Arr } from "effect"

// Custom table-like formatting for arrays
const createTablePretty = <T extends Record<string, any>>(
  schema: Schema.Schema<T>,
  columns: (keyof T)[]
) => {
  return schema.annotations({
    pretty: () => (items: T[]) => {
      if (items.length === 0) return "📊 Empty dataset"
      
      const headers = columns.map(col => String(col))
      const rows = items.map(item => 
        columns.map(col => String(item[col] ?? 'N/A'))
      )
      
      const maxWidths = headers.map((header, i) => 
        Math.max(
          header.length,
          ...rows.map(row => row[i].length)
        )
      )
      
      const headerRow = headers
        .map((header, i) => header.padEnd(maxWidths[i]))
        .join(' | ')
      
      const separator = maxWidths
        .map(width => '-'.repeat(width))
        .join('-+-')
      
      const dataRows = rows
        .map(row => 
          row.map((cell, i) => cell.padEnd(maxWidths[i]))
             .join(' | ')
        )
        .join('\n')
      
      return `📊 Dataset (${items.length} rows):\n${headerRow}\n${separator}\n${dataRows}`
    }
  })
}

// Usage with employee data
const EmployeeSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  department: Schema.String,
  salary: Schema.Number,
  startDate: Schema.Date
})

const EmployeeTableSchema = Schema.Array(EmployeeSchema).pipe(
  schema => createTablePretty(schema, ['id', 'name', 'department', 'salary'])
)

const prettyEmployeeTable = Pretty.make(EmployeeTableSchema)

const employees = [
  {
    id: "emp001",
    name: "Alice Johnson",
    department: "Engineering",
    salary: 95000,
    startDate: new Date("2022-03-15")
  },
  {
    id: "emp002", 
    name: "Bob Smith",
    department: "Marketing",
    salary: 72000,
    startDate: new Date("2023-01-10")
  },
  {
    id: "emp003",
    name: "Carol Williams",
    department: "Engineering", 
    salary: 88000,
    startDate: new Date("2021-11-20")
  }
]

console.log(prettyEmployeeTable(employees))
// Output:
// 📊 Dataset (3 rows):
// id     | name           | department  | salary
// -------+----------------+-------------+-------
// emp001 | Alice Johnson  | Engineering | 95000
// emp002 | Bob Smith      | Marketing   | 72000
// emp003 | Carol Williams | Engineering | 88000
```

### Feature 2: AST Pattern Matching for Custom Compilers

Create custom pretty compilers that handle specific AST patterns for specialized formatting needs.

#### Basic Custom Compiler

```typescript
import { Pretty, Schema, AST } from "effect"

// Custom compiler with specialized boolean formatting
const customMatch: Pretty.Pretty.Match = {
  ...Pretty.match,
  "BooleanKeyword": () => (b: boolean) => b ? "✅ Yes" : "❌ No"
}

const customCompiler = AST.getCompiler(customMatch)
const makePretty = <A>(schema: Schema.Schema<A>) => (a: A): string => 
  customCompiler(schema.ast, [])(a)

// Usage
const SettingsSchema = Schema.Struct({
  notifications: Schema.Boolean,
  darkMode: Schema.Boolean,
  analytics: Schema.Boolean
})

const prettySettings = makePretty(SettingsSchema)

console.log(prettySettings({
  notifications: true,
  darkMode: false,
  analytics: true
}))
// Output: { "notifications": ✅ Yes, "darkMode": ❌ No, "analytics": ✅ Yes }
```

#### Real-World Custom Compiler: Development Tool Integration

```typescript
import { Pretty, Schema, AST, Effect } from "effect"

// Custom compiler for development debugging
const debugMatch: Pretty.Pretty.Match = {
  ...Pretty.match,
  
  // Enhanced string formatting with length info
  "StringKeyword": () => (s: string) => 
    `"${s}" (${s.length} chars)`,
    
  // Number formatting with type info
  "NumberKeyword": () => (n: number) => {
    if (Number.isInteger(n)) return `${n} (int)`
    if (Number.isNaN(n)) return `NaN (invalid)`
    if (!Number.isFinite(n)) return `${n} (infinite)`
    return `${n} (float)`
  },
  
  // Array formatting with size info
  "TupleType": (ast, go, path) => {
    const originalPretty = Pretty.match["TupleType"](ast, go, path)
    return (input: ReadonlyArray<unknown>) => {
      const formatted = originalPretty(input)
      return `${formatted} (${input.length} items)`
    }
  },
  
  // Object formatting with property count
  "TypeLiteral": (ast, go, path) => {
    const originalPretty = Pretty.match["TypeLiteral"](ast, go, path)
    return (input: { readonly [x: PropertyKey]: unknown }) => {
      const formatted = originalPretty(input)
      const propCount = Object.keys(input).length
      return `${formatted} (${propCount} props)`
    }
  }
}

const debugCompiler = AST.getCompiler(debugMatch)
const makeDebugPretty = <A>(schema: Schema.Schema<A>) => (a: A): string =>
  debugCompiler(schema.ast, [])(a)

// Development data structures
const ApiMetricsSchema = Schema.Struct({
  endpoint: Schema.String,
  requestCount: Schema.Number,
  averageResponseTime: Schema.Number,
  errorRate: Schema.Number,
  lastAccessed: Schema.Date,
  methods: Schema.Array(Schema.String),
  statusCodes: Schema.Record({ key: Schema.String, value: Schema.Number })
})

const debugApiMetrics = makeDebugPretty(ApiMetricsSchema)

const metrics = {
  endpoint: "/api/users",
  requestCount: 1250,
  averageResponseTime: 45.7,
  errorRate: 0.02,
  lastAccessed: new Date("2024-01-15T14:30:00Z"),
  methods: ["GET", "POST", "PUT"],
  statusCodes: {
    "200": 1200,
    "400": 15,
    "404": 20,
    "500": 15
  }
}

console.log(debugApiMetrics(metrics))
// Output with enhanced debugging info:
// { "endpoint": "/api/users" (10 chars), "requestCount": 1250 (int), "averageResponseTime": 45.7 (float), "errorRate": 0.02 (float), "lastAccessed": new Date("2024-01-15T14:30:00.000Z"), "methods": ["GET" (3 chars), "POST" (4 chars), "PUT" (3 chars)] (3 items), "statusCodes": { "200": 1200 (int), "400": 15 (int), "404": 20 (int), "500": 15 (int) } (4 props) } (7 props)
```

### Feature 3: Error Handling and Debugging

Use Pretty for enhanced error reporting and debugging workflows with schema validation failures.

#### Schema Validation Error Pretty Printing

```typescript
import { Pretty, Schema, Effect, Console, ParseResult } from "effect"

// Complex validation schema
const UserRegistrationSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => "Must be a valid email address"
    })
  ),
  password: Schema.String.pipe(
    Schema.minLength(8, { message: () => "Must be at least 8 characters" }),
    Schema.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: () => "Must contain lowercase, uppercase, and number"
    })
  ),
  profile: Schema.Struct({
    firstName: Schema.String.pipe(
      Schema.minLength(1, { message: () => "First name is required" })
    ),
    lastName: Schema.String.pipe(
      Schema.minLength(1, { message: () => "Last name is required" })  
    ),
    age: Schema.Number.pipe(
      Schema.int({ message: () => "Age must be a whole number" }),
      Schema.between(13, 120, { message: () => "Age must be between 13 and 120" })
    )
  }),
  preferences: Schema.Struct({
    newsletter: Schema.Boolean,
    theme: Schema.Union(Schema.Literal("light"), Schema.Literal("dark")),
    notifications: Schema.Struct({
      email: Schema.Boolean,
      push: Schema.Boolean
    })
  })
})

// Pretty printer for valid data
const prettyUserRegistration = Pretty.make(UserRegistrationSchema)

// Validation service with enhanced error reporting
const validateUserRegistration = (data: unknown) => Effect.gen(function* () {
  const result = yield* Schema.decodeUnknown(UserRegistrationSchema)(data).pipe(
    Effect.either
  )
  
  if (result._tag === "Left") {
    // Extract and pretty print the invalid data
    yield* Console.error("❌ Validation failed for user registration:")
    yield* Console.error("Input data structure:")
    
    // Try to show what we can parse
    try {
      const partialPretty = Pretty.make(Schema.Unknown)
      yield* Console.error(partialPretty(data))
    } catch {
      yield* Console.error("Unable to format input data")
    }
    
    yield* Console.error("\nValidation errors:")
    yield* Console.error(result.left.message)
    
    return Effect.fail(result.left)
  }
  
  yield* Console.info("✅ Validation successful:")
  yield* Console.info(prettyUserRegistration(result.right))
  
  return result.right
})

// Test validation with various inputs
const testValidation = Effect.gen(function* () {
  // Valid input
  const validData = {
    email: "alice@example.com",
    password: "SecureP@ss123",
    profile: {
      firstName: "Alice",
      lastName: "Smith", 
      age: 28
    },
    preferences: {
      newsletter: true,
      theme: "dark" as const,
      notifications: {
        email: true,
        push: false
      }
    }
  }
  
  yield* Console.info("Testing valid data:")
  yield* validateUserRegistration(validData).pipe(
    Effect.catchAll(() => Effect.void)
  )
  
  // Invalid input - multiple errors
  const invalidData = {
    email: "invalid-email",
    password: "weak",
    profile: {
      firstName: "",
      lastName: "Smith",
      age: 12.5
    },
    preferences: {
      newsletter: "yes", // wrong type
      theme: "purple", // invalid literal
      notifications: {
        email: true
        // missing push
      }
    }
  }
  
  yield* Console.info("\nTesting invalid data:")
  yield* validateUserRegistration(invalidData).pipe(
    Effect.catchAll(() => Effect.void)
  )
})
```

## Practical Patterns & Best Practices

### Pattern 1: Conditional Pretty Formatting

Create pretty formatters that adapt their output based on context or data properties:

```typescript
import { Pretty, Schema, Effect } from "effect"

// Context-aware pretty formatting
const createContextualPretty = <T>(
  schema: Schema.Schema<T>,
  contexts: {
    [key: string]: (value: T) => string
  },
  defaultKey: string
) => {
  return (context: string = defaultKey) => {
    const formatter = contexts[context] || contexts[defaultKey]
    return (value: T) => formatter(value)
  }
}

// User schema with multiple display contexts
const UserSchema = Schema.Struct({
  id: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.String,
  role: Schema.Union(Schema.Literal("admin"), Schema.Literal("user"), Schema.Literal("guest")),
  createdAt: Schema.Date,
  lastLoginAt: Schema.optional(Schema.Date)
})

const userPrettyContexts = {
  // Detailed view for admin interfaces
  admin: (user: typeof UserSchema.Type) => 
    `👤 ${user.firstName} ${user.lastName} (${user.id})\n` +
    `   📧 ${user.email}\n` +
    `   🔑 Role: ${user.role}\n` +
    `   📅 Created: ${user.createdAt.toLocaleDateString()}\n` +
    `   🔓 Last login: ${user.lastLoginAt?.toLocaleDateString() || 'Never'}`,
    
  // Compact view for lists
  list: (user: typeof UserSchema.Type) =>
    `${user.firstName} ${user.lastName} <${user.email}> [${user.role}]`,
    
  // Display name only for UI
  display: (user: typeof UserSchema.Type) =>
    `${user.firstName} ${user.lastName}`,
    
  // Audit log format
  audit: (user: typeof UserSchema.Type) =>
    `User(id=${user.id}, email=${user.email}, role=${user.role})`
}

const prettyUser = createContextualPretty(UserSchema, userPrettyContexts, 'list')

// Usage in different contexts
const user = {
  id: "usr_123",
  firstName: "Alice",
  lastName: "Johnson",
  email: "alice@example.com",
  role: "admin" as const,
  createdAt: new Date("2023-01-15"),
  lastLoginAt: new Date("2024-01-20")
}

console.log("Admin view:")
console.log(prettyUser('admin')(user))

console.log("\nList view:")
console.log(prettyUser('list')(user))

console.log("\nDisplay view:")
console.log(prettyUser('display')(user))
```

### Pattern 2: Hierarchical Pretty Printing

Build formatters that handle nested structures with proper indentation and hierarchy:

```typescript
import { Pretty, Schema } from "effect"

// Tree-like data structure
const FileSystemNodeSchema: Schema.Schema<FileSystemNode> = Schema.suspend(() => 
  Schema.Union(
    Schema.Struct({
      type: Schema.Literal("file"),
      name: Schema.String,
      size: Schema.Number,
      lastModified: Schema.Date
    }),
    Schema.Struct({
      type: Schema.Literal("directory"),
      name: Schema.String,
      children: Schema.Array(FileSystemNodeSchema)
    })
  )
)

type FileSystemNode = 
  | {
      type: "file"
      name: string
      size: number
      lastModified: Date
    }
  | {
      type: "directory"
      name: string
      children: readonly FileSystemNode[]
    }

// Custom hierarchical pretty printer
const createHierarchicalPretty = (indentSize: number = 2) => {
  const formatNode = (node: FileSystemNode, depth: number = 0): string => {
    const indent = ' '.repeat(depth * indentSize)
    
    if (node.type === "file") {
      const sizeKB = (node.size / 1024).toFixed(1)
      return `${indent}📄 ${node.name} (${sizeKB} KB)`
    }
    
    const childrenFormatted = node.children.length > 0
      ? '\n' + node.children.map(child => formatNode(child, depth + 1)).join('\n')
      : ' (empty)'
    
    return `${indent}📁 ${node.name}${childrenFormatted}`
  }
  
  return formatNode
}

const FileSystemSchema = Schema.Struct({
  root: FileSystemNodeSchema
}).annotations({
  pretty: () => (fs: { root: FileSystemNode }) => {
    const formatter = createHierarchicalPretty(2)
    return `🗂️  File System:\n${formatter(fs.root)}`
  }
})

const prettyFileSystem = Pretty.make(FileSystemSchema)

// Example file system
const fileSystem = {
  root: {
    type: "directory" as const,
    name: "project",
    children: [
      {
        type: "directory" as const,
        name: "src",
        children: [
          {
            type: "file" as const,
            name: "index.ts",
            size: 2048,
            lastModified: new Date("2024-01-15T10:00:00Z")
          },
          {
            type: "file" as const,
            name: "utils.ts", 
            size: 1536,
            lastModified: new Date("2024-01-14T15:30:00Z")
          },
          {
            type: "directory" as const,
            name: "components",
            children: [
              {
                type: "file" as const,
                name: "Button.tsx",
                size: 3072,
                lastModified: new Date("2024-01-13T09:15:00Z")
              }
            ]
          }
        ]
      },
      {
        type: "file" as const,
        name: "package.json",
        size: 1024,
        lastModified: new Date("2024-01-12T14:20:00Z")
      },
      {
        type: "directory" as const,
        name: "dist",
        children: []
      }
    ]
  }
}

console.log(prettyFileSystem(fileSystem))
// Output:
// 🗂️  File System:
//   📁 project
//     📁 src
//       📄 index.ts (2.0 KB)
//       📄 utils.ts (1.5 KB)
//       📁 components
//         📄 Button.tsx (3.0 KB)
//     📄 package.json (1.0 KB)
//     📁 dist (empty)
```

### Pattern 3: Performance-Optimized Pretty Printing

Create efficient pretty printers for large datasets with lazy evaluation and sampling:

```typescript
import { Pretty, Schema, Array as Arr } from "effect"

// Large dataset pretty printing with sampling
const createSampledArrayPretty = <T>(
  itemSchema: Schema.Schema<T>,
  maxItems: number = 10,
  sampleFromMiddle: boolean = true
) => {
  const itemPretty = Pretty.make(itemSchema)
  
  return Schema.Array(itemSchema).annotations({
    pretty: () => (items: readonly T[]) => {
      if (items.length === 0) return "[]"
      if (items.length <= maxItems) {
        return `[${items.map(itemPretty).join(", ")}]`
      }
      
      const half = Math.floor(maxItems / 2)
      let sampled: T[]
      
      if (sampleFromMiddle) {
        const start = Math.max(0, Math.floor((items.length - maxItems) / 2))
        sampled = items.slice(start, start + maxItems)
      } else {
        sampled = [
          ...items.slice(0, half),
          ...items.slice(-half)
        ]
      }
      
      const sampledFormatted = sampled.map(itemPretty).join(", ")
      const omittedCount = items.length - maxItems
      
      return `[${sampledFormatted}... (${omittedCount} more items, ${items.length} total)]`
    }
  })
}

// Performance monitoring schema
const MetricDataPointSchema = Schema.Struct({
  timestamp: Schema.Date,
  value: Schema.Number,
  tags: Schema.Record({ key: Schema.String, value: Schema.String })
})

const PerformanceMetricsSchema = Schema.Struct({
  metricName: Schema.String,
  dataPoints: createSampledArrayPretty(MetricDataPointSchema, 5, false),
  aggregates: Schema.Struct({
    min: Schema.Number,
    max: Schema.Number,
    avg: Schema.Number,
    count: Schema.Number
  })
})

const prettyPerformanceMetrics = Pretty.make(PerformanceMetricsSchema)

// Generate large dataset
const generateDataPoints = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i) * 60000), // 1 minute intervals
    value: Math.random() * 100,
    tags: {
      region: i % 3 === 0 ? "us-east" : i % 3 === 1 ? "us-west" : "eu-west",
      instance: `server-${String(i % 10).padStart(2, '0')}`
    }
  }))
}

const largeMetrics = {
  metricName: "cpu_utilization",
  dataPoints: generateDataPoints(1000), // 1000 data points
  aggregates: {
    min: 15.2,
    max: 87.4,
    avg: 52.8,
    count: 1000
  }
}

console.log(prettyPerformanceMetrics(largeMetrics))
// Output shows only first 2 and last 2 data points with summary
```

## Integration Examples

### Integration with Logging Systems

Integrate Pretty with Effect's logging system for structured, readable log output:

```typescript
import { Pretty, Schema, Effect, Logger, LogLevel, Console } from "effect"

// Application event schemas
const HttpRequestSchema = Schema.Struct({
  method: Schema.String,
  url: Schema.String,
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
  body: Schema.optional(Schema.Unknown),
  timestamp: Schema.Date,
  requestId: Schema.String
})

const HttpResponseSchema = Schema.Struct({
  statusCode: Schema.Number,
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
  body: Schema.optional(Schema.Unknown),
  duration: Schema.Number,
  timestamp: Schema.Date,
  requestId: Schema.String
})

const DatabaseQuerySchema = Schema.Struct({
  query: Schema.String,
  parameters: Schema.Array(Schema.Unknown),
  duration: Schema.Number,
  rowCount: Schema.optional(Schema.Number),
  timestamp: Schema.Date,
  correlationId: Schema.String
})

// Custom pretty formatters for logging
const prettyHttpRequest = Pretty.make(HttpRequestSchema.annotations({
  pretty: () => (req: typeof HttpRequestSchema.Type) => 
    `🌐 ${req.method} ${req.url} [${req.requestId}] at ${req.timestamp.toISOString()}`
}))

const prettyHttpResponse = Pretty.make(HttpResponseSchema.annotations({
  pretty: () => (res: typeof HttpResponseSchema.Type) => 
    `📤 ${res.statusCode} [${res.requestId}] ${res.duration}ms at ${res.timestamp.toISOString()}`
}))

const prettyDatabaseQuery = Pretty.make(DatabaseQuerySchema.annotations({
  pretty: () => (query: typeof DatabaseQuerySchema.Type) => {
    const shortQuery = query.query.length > 50 
      ? query.query.substring(0, 50) + "..." 
      : query.query
    return `🗄️  ${shortQuery} (${query.duration}ms, ${query.rowCount || 0} rows) [${query.correlationId}]`
  }
}))

// Custom logger with pretty formatting
const createPrettyLogger = Logger.replace(
  Logger.defaultLogger,
  Logger.make(({ logLevel, message, spans }) => {
    const level = logLevel._tag
    const timestamp = new Date().toISOString()
    const spanInfo = spans.length > 0 ? ` [${spans.map(s => s.label).join(' > ')}]` : ''
    
    console.log(`${timestamp} [${level}]${spanInfo} ${message}`)
  })
)

// HTTP service with structured logging
const HttpService = Effect.gen(function* () {
  const logRequest = (request: typeof HttpRequestSchema.Type) => Effect.gen(function* () {
    yield* Effect.logInfo(`Request: ${prettyHttpRequest(request)}`)
    yield* Effect.logDebug("Full request details:", JSON.stringify(request, null, 2))
  })
  
  const logResponse = (response: typeof HttpResponseSchema.Type) => Effect.gen(function* () {
    const level = response.statusCode >= 400 ? LogLevel.Warning : LogLevel.Info
    yield* Effect.log(level, `Response: ${prettyHttpResponse(response)}`)
    
    if (response.statusCode >= 500) {
      yield* Effect.logError("Server error response body:", JSON.stringify(response.body))
    }
  })
  
  const handleRequest = (req: typeof HttpRequestSchema.Type) => Effect.gen(function* () {
    yield* logRequest(req)
    
    // Simulate request processing
    const startTime = Date.now()
    
    // Simulate database query
    const query = {
      query: "SELECT * FROM users WHERE active = ? AND created_at > ?",
      parameters: [true, new Date("2024-01-01")],
      duration: 25,
      rowCount: 150,
      timestamp: new Date(),
      correlationId: req.requestId
    }
    
    yield* Effect.logInfo(`Query: ${prettyDatabaseQuery(query)}`)
    
    const response = {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: { users: "..." },
      duration: Date.now() - startTime,
      timestamp: new Date(),
      requestId: req.requestId
    }
    
    yield* logResponse(response)
    
    return response
  }).pipe(
    Effect.withSpan("http.request", {
      attributes: {
        "http.method": req.method,
        "http.url": req.url,
        "request.id": req.requestId
      }
    })
  )
  
  return { handleRequest } as const
})

// Usage with pretty logging
const runHttpServiceExample = Effect.gen(function* () {
  const httpService = yield* HttpService
  
  const sampleRequest = {
    method: "GET",
    url: "/api/users?page=1&limit=50",
    headers: {
      "authorization": "Bearer ...",
      "user-agent": "Mozilla/5.0...",
      "accept": "application/json"
    },
    timestamp: new Date(),
    requestId: "req_abc123def456"
  }
  
  yield* httpService.handleRequest(sampleRequest)
}).pipe(
  Effect.provide(createPrettyLogger)
)
```

### Integration with Testing Frameworks

Use Pretty for enhanced test assertions and debugging in test suites:

```typescript
import { Pretty, Schema, Effect, Equal } from "effect"
import { describe, it, expect } from "vitest"

// Test data schemas
const TestUserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  preferences: Schema.Struct({
    theme: Schema.Union(Schema.Literal("light"), Schema.Literal("dark")),
    notifications: Schema.Boolean
  }),
  metadata: Schema.Struct({
    createdAt: Schema.Date,
    lastLogin: Schema.optional(Schema.Date)
  })
})

const TestApiResponseSchema = Schema.Struct({
  success: Schema.Boolean,
  data: Schema.optional(TestUserSchema),
  error: Schema.optional(Schema.Struct({
    code: Schema.String,
    message: Schema.String
  })),
  meta: Schema.Struct({
    timestamp: Schema.Date,
    requestId: Schema.String
  })
})

// Pretty printers for test output
const prettyTestUser = Pretty.make(TestUserSchema)
const prettyTestApiResponse = Pretty.make(TestApiResponseSchema)

// Enhanced assertion helpers
const expectPrettyEqual = <T>(
  actual: T,
  expected: T,
  pretty: (value: T) => string,
  message?: string
) => {
  try {
    expect(Equal.equals(actual, expected)).toBe(true)
  } catch (error) {
    const detailedMessage = [
      message && `${message}\n`,
      "Expected:",
      pretty(expected),
      "\nActual:",
      pretty(actual),
      "\nStructural equality check failed"
    ].filter(Boolean).join("\n")
    
    throw new Error(detailedMessage)
  }
}

const expectPrettyMatch = <T>(
  actual: T,
  schema: Schema.Schema<T>,
  predicate: (value: T) => boolean,
  message?: string
) => {
  const pretty = Pretty.make(schema)
  
  if (!predicate(actual)) {
    const detailedMessage = [
      message && `${message}\n`,
      "Value did not match predicate:",
      pretty(actual)
    ].filter(Boolean).join("\n")
    
    throw new Error(detailedMessage)
  }
}

// Test suite with pretty assertions
describe("User API", () => {
  it("should create user with correct structure", () => {
    const expectedUser = {
      id: "user_123",
      name: "Alice Smith",
      email: "alice@example.com",
      preferences: {
        theme: "dark" as const,
        notifications: true
      },
      metadata: {
        createdAt: new Date("2024-01-15T10:00:00Z"),
        lastLogin: new Date("2024-01-20T14:30:00Z")
      }
    }
    
    // Simulate API call result
    const actualUser = {
      id: "user_123",
      name: "Alice Smith", 
      email: "alice@example.com",
      preferences: {
        theme: "dark" as const,
        notifications: true
      },
      metadata: {
        createdAt: new Date("2024-01-15T10:00:00Z"),
        lastLogin: new Date("2024-01-20T14:30:00Z")
      }
    }
    
    expectPrettyEqual(
      actualUser,
      expectedUser,
      prettyTestUser,
      "User creation should return expected structure"
    )
  })
  
  it("should handle API response format correctly", () => {
    const apiResponse = {
      success: true,
      data: {
        id: "user_456",
        name: "Bob Johnson",
        email: "bob@example.com",
        preferences: {
          theme: "light" as const,
          notifications: false
        },
        metadata: {
          createdAt: new Date("2024-01-10T08:00:00Z")
        }
      },
      meta: {
        timestamp: new Date("2024-01-20T15:00:00Z"),
        requestId: "req_789"
      }
    }
    
    // Verify response structure
    expectPrettyMatch(
      apiResponse,
      TestApiResponseSchema,
      (response) => response.success === true && !!response.data,
      "API response should indicate success with user data"
    )
    
    // Verify user data within response
    if (apiResponse.data) {
      expectPrettyMatch(
        apiResponse.data,
        TestUserSchema,
        (user) => user.email.includes("@") && user.name.length > 0,
        "User data should have valid email and non-empty name"
      )
    }
  })
  
  it("should handle error responses with detailed output", () => {
    const errorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid email format provided"
      },
      meta: {
        timestamp: new Date("2024-01-20T15:05:00Z"),
        requestId: "req_error_123"
      }
    }
    
    console.log("Error response structure:")
    console.log(prettyTestApiResponse(errorResponse))
    
    expectPrettyMatch(
      errorResponse,
      TestApiResponseSchema,
      (response) => !response.success && !!response.error,
      "Error response should indicate failure with error details"
    )
  })
})

// Property-based testing with pretty output
const generateTestUser = () => ({
  id: `user_${Math.random().toString(36).substr(2, 9)}`,
  name: `Test User ${Math.floor(Math.random() * 1000)}`,
  email: `test${Math.floor(Math.random() * 1000)}@example.com`,
  preferences: {
    theme: Math.random() > 0.5 ? "light" as const : "dark" as const,
    notifications: Math.random() > 0.5
  },
  metadata: {
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastLogin: Math.random() > 0.3 
      ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      : undefined
  }
})

describe("Property-based testing with Pretty", () => {
  it("should validate user serialization round-trip", () => {
    for (let i = 0; i < 10; i++) {
      const originalUser = generateTestUser()
      
      // Simulate serialization/deserialization
      const serialized = JSON.stringify(originalUser)
      const deserialized = {
        ...JSON.parse(serialized),
        metadata: {
          ...JSON.parse(serialized).metadata,
          createdAt: new Date(JSON.parse(serialized).metadata.createdAt),
          lastLogin: JSON.parse(serialized).metadata.lastLogin 
            ? new Date(JSON.parse(serialized).metadata.lastLogin)
            : undefined
        }
      }
      
      try {
        expectPrettyEqual(
          deserialized,
          originalUser,
          prettyTestUser,
          `Round-trip serialization should preserve data (iteration ${i + 1})`
        )
      } catch (error) {
        console.log(`Failed on iteration ${i + 1}:`)
        console.log("Original:", prettyTestUser(originalUser))
        console.log("Deserialized:", prettyTestUser(deserialized))
        throw error
      }
    }
  })
})
```

### Integration with Development Tools

Build development utilities that leverage Pretty for code generation and documentation:

```typescript
import { Pretty, Schema, Effect, Console } from "effect"

// Schema documentation generator
const generateSchemaDocumentation = <A, I, R>(
  schema: Schema.Schema<A, I, R>,
  schemaName: string,
  examples: A[]
) => Effect.gen(function* () {
  const pretty = Pretty.make(schema)
  
  yield* Console.info(`## ${schemaName}`)
  yield* Console.info("")
  yield* Console.info("### Schema Structure")
  yield* Console.info("```typescript")
  yield* Console.info(`// Type: ${schemaName}`)
  yield* Console.info("```")
  yield* Console.info("")
  
  if (examples.length > 0) {
    yield* Console.info("### Examples")
    yield* Console.info("")
    
    for (const [index, example] of examples.entries()) {
      yield* Console.info(`#### Example ${index + 1}`)
      yield* Console.info("```typescript")
      yield* Console.info(pretty(example))
      yield* Console.info("```")
      yield* Console.info("")
    }
  }
})

// API endpoint documentation with example requests/responses
const generateApiDocumentation = Effect.gen(function* () {
  // User management endpoints
  yield* generateSchemaDocumentation(
    TestUserSchema,
    "User",
    [
      {
        id: "user_123",
        name: "Alice Smith",
        email: "alice@example.com",
        preferences: {
          theme: "dark" as const,
          notifications: true
        },
        metadata: {
          createdAt: new Date("2024-01-15T10:00:00Z"),
          lastLogin: new Date("2024-01-20T14:30:00Z")
        }
      },
      {
        id: "user_456",
        name: "Bob Johnson",
        email: "bob@example.com",
        preferences: {
          theme: "light" as const,
          notifications: false
        },
        metadata: {
          createdAt: new Date("2024-01-10T08:00:00Z")
        }
      }
    ]
  )
  
  yield* generateSchemaDocumentation(
    TestApiResponseSchema,
    "API Response",
    [
      {
        success: true,
        data: {
          id: "user_789",
          name: "Charlie Brown",
          email: "charlie@example.com",
          preferences: {
            theme: "dark" as const,
            notifications: true
          },
          metadata: {
            createdAt: new Date("2024-01-12T12:00:00Z")
          }
        },
        meta: {
          timestamp: new Date("2024-01-20T16:00:00Z"),
          requestId: "req_documentation_example"
        }
      },
      {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User with specified ID does not exist"
        },
        meta: {
          timestamp: new Date("2024-01-20T16:01:00Z"),
          requestId: "req_error_example"
        }
      }
    ]
  )
})

// Development fixture generator
const generateTestFixtures = Effect.gen(function* () {
  const users = [
    {
      id: "test_user_1",
      name: "Test User One",
      email: "test1@fixtures.com",
      preferences: { theme: "light" as const, notifications: true },
      metadata: { createdAt: new Date("2024-01-01T00:00:00Z") }
    },
    {
      id: "test_user_2", 
      name: "Test User Two",
      email: "test2@fixtures.com",
      preferences: { theme: "dark" as const, notifications: false },
      metadata: { 
        createdAt: new Date("2024-01-02T00:00:00Z"),
        lastLogin: new Date("2024-01-15T10:00:00Z")
      }
    }
  ]
  
  const prettyUser = Pretty.make(TestUserSchema)
  
  yield* Console.info("// Generated test fixtures")
  yield* Console.info("export const testUsers = [")
  
  for (const user of users) {
    yield* Console.info(`  ${prettyUser(user)},`)
  }
  
  yield* Console.info("];")
})

// Run all documentation generation
const runDocumentationGeneration = Effect.gen(function* () {
  yield* Console.info("# API Documentation")
  yield* Console.info("")
  yield* generateApiDocumentation
  
  yield* Console.info("\n# Test Fixtures")
  yield* generateTestFixtures
})
```

## Conclusion

Pretty provides a powerful foundation for readable, consistent data formatting across Effect applications. By integrating deeply with Schema definitions, it eliminates the need for manual formatting logic while providing extensive customization capabilities.

Key benefits:
- **Schema-Driven Formatting**: Automatically generate formatters from your type definitions
- **Customizable Output**: Override default formatting with custom pretty annotations for specialized display needs
- **Type-Safe**: Generated pretty functions are fully type-safe and match your schema definitions
- **Composable Architecture**: Pretty formatters compose naturally for complex nested data structures
- **Development Productivity**: Enhanced debugging, logging, and testing workflows through readable output

Pretty is essential for applications requiring high-quality developer experience, comprehensive logging, debugging utilities, or user-facing data display in Effect ecosystems.