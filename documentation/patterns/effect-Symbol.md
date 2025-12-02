# Symbol: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Symbol Solves

Building type-safe, scalable applications requires unique identifiers that guarantee no collisions across modules, services, and runtime instances. Traditional string-based identifiers lead to fragile code that breaks silently when names collide:

```typescript
// Traditional approach - string-based identifiers prone to collisions
interface DatabaseService {
  query(sql: string): Promise<unknown[]>
}

interface UserService {
  getUser(id: string): Promise<User>
}

// Using string keys - collision-prone and not type-safe
const services = {
  "database": new DatabaseImpl(),
  "user": new UserServiceImpl(),
  "database-v2": new NewDatabaseImpl() // Name collision workaround
}

// Runtime errors when keys collide
function getService(key: string) {
  return services[key] // No type safety, silent failures
}

// Module A defines a service
const DATABASE_KEY = "database"

// Module B accidentally uses the same key
const DATABASE_KEY = "database" // Silent collision!

// Services overwrite each other at runtime
services[DATABASE_KEY] = new MyDatabase() // Overwrites existing service
```

This approach leads to:
- **Runtime Collisions** - Services overwrite each other silently
- **Type Safety Loss** - No compile-time guarantees about service existence
- **Namespace Pollution** - String keys compete in global namespace
- **Testing Complexity** - Hard to mock services consistently
- **Refactoring Brittleness** - String changes break dependent code

### The Symbol Solution

JavaScript Symbols provide guaranteed unique identifiers that solve all these problems. Effect's Symbol module leverages this primitive to create collision-free service tokens and type-level identifiers:

```typescript
import { Context, Effect, Layer, Symbol } from "effect"

// Symbols are guaranteed unique - no collisions possible
const DatabaseSymbol = Symbol.for("MyApp/Database")
const UserServiceSymbol = Symbol.for("MyApp/UserService")

// Type-safe service definitions using symbols
interface DatabaseService {
  readonly [DatabaseSymbol]: DatabaseService
  query(sql: string): Effect.Effect<unknown[], DatabaseError>
}

interface UserService {
  readonly [UserServiceSymbol]: UserService  
  getUser(id: string): Effect.Effect<User, UserNotFoundError, DatabaseService>
}

// Context tags use symbols for guaranteed uniqueness
class Database extends Context.Tag("Database")<Database, DatabaseService>() {}
class UserService extends Context.Tag("UserService")<UserService, UserService>() {}

// Type-safe service access with compile-time guarantees
const getUser = (id: string) => Effect.gen(function* () {
  const userService = yield* UserService
  return yield* userService.getUser(id)
})
```

### Key Concepts

**Symbol Uniqueness**: Every symbol is guaranteed unique, preventing accidental collisions across modules and packages.

**Symbol.for() Registry**: Creates globally registered symbols that can be retrieved consistently across module boundaries.

**Type-Level Identity**: Symbols serve as unique type identifiers enabling advanced type-level programming and service discrimination.

## Basic Usage Patterns

### Pattern 1: Symbol Validation and Type Guards

```typescript
import { Predicate, Symbol } from "effect"

// Create various symbol types
const serviceSymbol = Symbol.for("MyService")
const configSymbol = Symbol("AppConfig") // Local symbol
const globalSymbol = Symbol.for("Global/Counter")

// Symbol type checking
const checkValue = (value: unknown) => {
  if (Symbol.isSymbol(value)) {
    console.log("Found symbol:", value.toString())
    return value
  }
  throw new Error("Expected symbol")
}

// Using the predicate
const values = [serviceSymbol, "string", 42, configSymbol]
const symbols = values.filter(Symbol.isSymbol)
// Result: [Symbol(MyService), Symbol(AppConfig)]
```

### Pattern 2: Symbol Equivalence and Comparison

```typescript
import { Equal, Symbol } from "effect"

// Symbols for service identification
const DatabaseTag = Symbol.for("services/Database")
const UserServiceTag = Symbol.for("services/UserService")
const AnotherDatabaseTag = Symbol.for("services/Database") // Same key

// Symbol equivalence using Effect's equality system
const compareSymbols = () => {
  // Same symbol key - equivalent
  console.log(Equal.equals(DatabaseTag, AnotherDatabaseTag)) // true
  
  // Different symbol keys - not equivalent  
  console.log(Equal.equals(DatabaseTag, UserServiceTag)) // false
  
  // Local symbols - never equivalent even with same description
  const local1 = Symbol("local")
  const local2 = Symbol("local")
  console.log(Equal.equals(local1, local2)) // false
}

// Using Symbol.Equivalence for comparisons
const symbolSet = new Set([DatabaseTag, UserServiceTag, AnotherDatabaseTag])
console.log(symbolSet.size) // 2 - AnotherDatabaseTag equals DatabaseTag
```

### Pattern 3: Unique Symbol Creation for Type Safety

```typescript
import { Schema, Symbol } from "effect"

// Create unique symbols for schema identification
const UserSchemaId = Symbol.for("schemas/User")
const ProductSchemaId = Symbol.for("schemas/Product")
const OrderSchemaId = Symbol.for("schemas/Order")

// Using symbols in schema definitions for unique identification
const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String
}).pipe(
  Schema.identifier(UserSchemaId.toString())
)

const ProductSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number
}).pipe(
  Schema.identifier(ProductSchemaId.toString())
)

// Symbols guarantee unique schema identification
const getSchemaId = (schema: Schema.Schema<any>) => {
  // Type-safe schema identification using symbols
  if (schema.ast.identifier === UserSchemaId.toString()) {
    return "User schema detected"
  }
  if (schema.ast.identifier === ProductSchemaId.toString()) {
    return "Product schema detected"
  }
  return "Unknown schema"
}
```

## Real-World Examples

### Example 1: Service Container with Symbol-Based Dependency Injection

A type-safe service container using symbols to prevent service key collisions in a microservices architecture:

```typescript
import { Context, Effect, Layer, Symbol } from "effect"

// Service symbols for guaranteed uniqueness
const DatabaseSymbol = Symbol.for("MyApp/Services/Database")
const CacheSymbol = Symbol.for("MyApp/Services/Cache")
const LoggerSymbol = Symbol.for("MyApp/Services/Logger")
const EmailSymbol = Symbol.for("MyApp/Services/Email")

// Service interfaces with symbol-based identification
interface DatabaseService {
  readonly [DatabaseSymbol]: DatabaseService
  query<T>(sql: string, params?: unknown[]): Effect.Effect<T[], DatabaseError>
  transaction<A, E>(
    operation: Effect.Effect<A, E, DatabaseService>
  ): Effect.Effect<A, E | DatabaseError, never>
}

interface CacheService {
  readonly [CacheSymbol]: CacheService
  get<T>(key: string): Effect.Effect<T | null, CacheError>
  set<T>(key: string, value: T, ttl?: number): Effect.Effect<void, CacheError>
  invalidate(pattern: string): Effect.Effect<void, CacheError>
}

interface LoggerService {
  readonly [LoggerSymbol]: LoggerService
  info(message: string, meta?: Record<string, unknown>): Effect.Effect<void>
  error(message: string, error?: Error, meta?: Record<string, unknown>): Effect.Effect<void>
  warn(message: string, meta?: Record<string, unknown>): Effect.Effect<void>
}

interface EmailService {
  readonly [EmailSymbol]: EmailService
  send(to: string, subject: string, body: string): Effect.Effect<void, EmailError>
  sendTemplate(to: string, template: string, data: Record<string, unknown>): Effect.Effect<void, EmailError>
}

// Context tags using symbols for service identification
class Database extends Context.Tag("Database")<Database, DatabaseService>() {}
class Cache extends Context.Tag("Cache")<Cache, CacheService>() {}
class Logger extends Context.Tag("Logger")<Logger, LoggerService>() {}
class Email extends Context.Tag("Email")<Email, EmailService>() {}

// Type-safe business logic using symbol-identified services
const createUser = (userData: {
  name: string
  email: string
  preferences: UserPreferences
}) => Effect.gen(function* () {
  const db = yield* Database
  const cache = yield* Cache
  const logger = yield* Logger
  const email = yield* Email

  // Log user creation attempt
  yield* logger.info("Creating new user", { email: userData.email })

  // Check if user already exists
  const existingUser = yield* db.query<User>(
    "SELECT * FROM users WHERE email = ?",
    [userData.email]
  ).pipe(
    Effect.catchTag("DatabaseError", () => Effect.succeed([]))
  )

  if (existingUser.length > 0) {
    yield* logger.warn("User creation failed - email exists", { email: userData.email })
    return yield* Effect.fail(new UserAlreadyExistsError(userData.email))
  }

  // Create user in transaction
  const newUser = yield* db.transaction(
    Effect.gen(function* () {
      const user = yield* db.query<User>(
        "INSERT INTO users (name, email, preferences) VALUES (?, ?, ?) RETURNING *",
        [userData.name, userData.email, JSON.stringify(userData.preferences)]
      ).pipe(
        Effect.map(results => results[0])
      )

      // Cache the new user
      yield* cache.set(`user:${user.id}`, user, 3600)

      return user
    })
  )

  // Send welcome email
  yield* email.sendTemplate(newUser.email, "welcome", {
    name: newUser.name,
    preferences: newUser.preferences
  })

  yield* logger.info("User created successfully", { 
    userId: newUser.id, 
    email: newUser.email 
  })

  return newUser
})

// Service implementations with symbol identification
const DatabaseLive: DatabaseService = {
  [DatabaseSymbol]: {} as DatabaseService,
  query: <T>(sql: string, params?: unknown[]) => 
    Effect.tryPromise({
      try: async () => {
        // PostgreSQL implementation
        const result = await pg.query(sql, params)
        return result.rows as T[]
      },
      catch: (error) => new DatabaseError(String(error))
    }),
  transaction: <A, E>(operation: Effect.Effect<A, E, DatabaseService>) =>
    Effect.scoped(
      Effect.gen(function* () {
        const client = yield* Effect.acquireRelease(
          Effect.tryPromise({
            try: () => pg.connect(),
            catch: (error) => new DatabaseError(String(error))
          }),
          (client) => Effect.sync(() => client.release())
        )
        
        yield* Effect.tryPromise({
          try: () => client.query("BEGIN"),
          catch: (error) => new DatabaseError(String(error))
        })

        const result = yield* operation.pipe(
          Effect.provideService(Database, {
            ...DatabaseLive,
            query: <T>(sql: string, params?: unknown[]) =>
              Effect.tryPromise({
                try: async () => {
                  const result = await client.query(sql, params)
                  return result.rows as T[]
                },
                catch: (error) => new DatabaseError(String(error))
              })
          })
        )

        yield* Effect.tryPromise({
          try: () => client.query("COMMIT"),
          catch: (error) => new DatabaseError(String(error))
        })

        return result
      })
    )
}

// Layer construction with symbol-identified services
const DatabaseLayer = Layer.succeed(Database, DatabaseLive)
const CacheLayer = Layer.succeed(Cache, RedisCacheLive)
const LoggerLayer = Layer.succeed(Logger, ConsoleLoggerLive)
const EmailLayer = Layer.succeed(Email, SendGridEmailLive)

// Application layer composition
const AppLayer = Layer.empty.pipe(
  Layer.provideMerge(DatabaseLayer),
  Layer.provideMerge(CacheLayer),
  Layer.provideMerge(LoggerLayer),
  Layer.provideMerge(EmailLayer)
)

// Usage - symbols ensure no service collisions
const program = createUser({
  name: "John Doe",
  email: "john@example.com",
  preferences: { theme: "dark", notifications: true }
}).pipe(
  Effect.provide(AppLayer)
)
```

### Example 2: Event System with Symbol-Based Event Types

A type-safe event system using symbols to ensure event type uniqueness across different modules:

```typescript
import { Context, Effect, Queue, Ref, Symbol } from "effect"

// Event type symbols for guaranteed uniqueness
const UserCreatedSymbol = Symbol.for("Events/UserCreated")
const UserUpdatedSymbol = Symbol.for("Events/UserUpdated")
const UserDeletedSymbol = Symbol.for("Events/UserDeleted")
const OrderPlacedSymbol = Symbol.for("Events/OrderPlaced")
const PaymentProcessedSymbol = Symbol.for("Events/PaymentProcessed")

// Base event interface with symbol identification
interface BaseEvent<TSymbol extends symbol, TPayload> {
  readonly type: TSymbol
  readonly payload: TPayload
  readonly timestamp: Date
  readonly correlationId: string
  readonly version: number
}

// Specific event types using symbols
interface UserCreatedEvent extends BaseEvent<typeof UserCreatedSymbol, {
  userId: string
  email: string
  name: string
  preferences: UserPreferences
}> {}

interface UserUpdatedEvent extends BaseEvent<typeof UserUpdatedSymbol, {
  userId: string
  changes: Partial<User>
  previousValues: Partial<User>
}> {}

interface UserDeletedEvent extends BaseEvent<typeof UserDeletedSymbol, {
  userId: string
  deletedAt: Date
  reason: string
}> {}

interface OrderPlacedEvent extends BaseEvent<typeof OrderPlacedSymbol, {
  orderId: string
  userId: string
  items: OrderItem[]
  total: number
}> {}

interface PaymentProcessedEvent extends BaseEvent<typeof PaymentProcessedSymbol, {
  paymentId: string
  orderId: string
  amount: number
  status: "success" | "failed"
  provider: string
}> {}

// Union type of all events
type DomainEvent = 
  | UserCreatedEvent 
  | UserUpdatedEvent 
  | UserDeletedEvent
  | OrderPlacedEvent
  | PaymentProcessedEvent

// Event bus service with symbol-based routing
interface EventBusService {
  publish<T extends DomainEvent>(event: T): Effect.Effect<void, EventBusError>
  subscribe<T extends symbol>(
    eventType: T,
    handler: (event: Extract<DomainEvent, { type: T }>) => Effect.Effect<void, unknown>
  ): Effect.Effect<void, EventBusError>
  unsubscribe(eventType: symbol, handlerId: string): Effect.Effect<void, EventBusError>
}

class EventBus extends Context.Tag("EventBus")<EventBus, EventBusService>() {}

// Event factory functions with symbol identification
const createUserCreatedEvent = (payload: UserCreatedEvent['payload']): UserCreatedEvent => ({
  type: UserCreatedSymbol,
  payload,
  timestamp: new Date(),
  correlationId: crypto.randomUUID(),
  version: 1
})

const createOrderPlacedEvent = (payload: OrderPlacedEvent['payload']): OrderPlacedEvent => ({
  type: OrderPlacedSymbol,
  payload,
  timestamp: new Date(),
  correlationId: crypto.randomUUID(),
  version: 1
})

// Type-safe event handlers using symbol pattern matching
const handleUserCreated = (event: UserCreatedEvent) => Effect.gen(function* () {
  const logger = yield* Logger
  const email = yield* Email
  
  yield* logger.info("User created", { 
    userId: event.payload.userId,
    email: event.payload.email 
  })
  
  // Send welcome email
  yield* email.sendTemplate(event.payload.email, "welcome", {
    name: event.payload.name,
    preferences: event.payload.preferences
  })
  
  // Update analytics
  yield* Effect.sync(() => {
    analytics.track("User Created", {
      userId: event.payload.userId,
      timestamp: event.timestamp
    })
  })
})

const handleOrderPlaced = (event: OrderPlacedEvent) => Effect.gen(function* () {
  const logger = yield* Logger
  const inventory = yield* Inventory
  
  yield* logger.info("Order placed", { 
    orderId: event.payload.orderId,
    userId: event.payload.userId,
    total: event.payload.total
  })
  
  // Reserve inventory
  for (const item of event.payload.items) {
    yield* inventory.reserve(item.productId, item.quantity)
  }
  
  // Process payment asynchronously
  yield* Effect.fork(processPayment(event.payload.orderId, event.payload.total))
})

// Event bus implementation with symbol-based routing
const EventBusLive: EventBusService = {
  publish: <T extends DomainEvent>(event: T) => Effect.gen(function* () {
    const subscribers = yield* Ref.get(subscribersRef)
    const handlers = subscribers.get(event.type) ?? []
    
    // Execute all handlers for this event type
    yield* Effect.forEach(handlers, (handler) => 
      Effect.fork(handler(event as any)).pipe(
        Effect.catchAll((error) => 
          Effect.sync(() => console.error("Event handler failed:", error))
        )
      )
    )
  }),
  
  subscribe: <T extends symbol>(
    eventType: T,
    handler: (event: Extract<DomainEvent, { type: T }>) => Effect.Effect<void, unknown>
  ) => Effect.gen(function* () {
    const subscribers = yield* Ref.get(subscribersRef)
    const currentHandlers = subscribers.get(eventType) ?? []
    const newHandlers = [...currentHandlers, handler]
    
    yield* Ref.update(subscribersRef, (subs) => 
      new Map(subs).set(eventType, newHandlers)
    )
  }),
  
  unsubscribe: (eventType: symbol, handlerId: string) => Effect.gen(function* () {
    // Implementation for unsubscribing handlers
    yield* Effect.unit
  })
}

// Application setup with symbol-based event routing
const setupEventHandlers = Effect.gen(function* () {
  const eventBus = yield* EventBus
  
  // Subscribe to events using symbols - no collision possible
  yield* eventBus.subscribe(UserCreatedSymbol, handleUserCreated)
  yield* eventBus.subscribe(OrderPlacedSymbol, handleOrderPlaced)
  
  // Additional event handlers
  yield* eventBus.subscribe(UserUpdatedSymbol, (event) => Effect.gen(function* () {
    const logger = yield* Logger
    yield* logger.info("User updated", { 
      userId: event.payload.userId,
      changes: event.payload.changes 
    })
  }))
})

// Business logic that publishes events
const createUserWithEvents = (userData: CreateUserRequest) => Effect.gen(function* () {
  const db = yield* Database
  const eventBus = yield* EventBus
  
  // Create user
  const user = yield* db.query<User>(
    "INSERT INTO users (name, email, preferences) VALUES (?, ?, ?) RETURNING *",
    [userData.name, userData.email, JSON.stringify(userData.preferences)]
  ).pipe(
    Effect.map(results => results[0])
  )
  
  // Publish event using symbol identification
  const event = createUserCreatedEvent({
    userId: user.id,
    email: user.email,
    name: user.name,
    preferences: user.preferences
  })
  
  yield* eventBus.publish(event)
  
  return user
})

// Event processing with type-safe pattern matching
const processEvent = (event: DomainEvent) => {
  switch (event.type) {
    case UserCreatedSymbol:
      return handleUserCreated(event) // TypeScript knows this is UserCreatedEvent
    
    case OrderPlacedSymbol:
      return handleOrderPlaced(event) // TypeScript knows this is OrderPlacedEvent
    
    case PaymentProcessedSymbol:
      return Effect.gen(function* () {
        const logger = yield* Logger
        yield* logger.info("Payment processed", { 
          paymentId: event.payload.paymentId,
          status: event.payload.status
        })
      })
    
    default:
      return Effect.sync(() => console.warn("Unknown event type:", event))
  }
}
```

### Example 3: Plugin Architecture with Symbol-Based Registration

A plugin system using symbols to ensure unique plugin identifiers and prevent naming conflicts:

```typescript
import { Context, Effect, Layer, Ref, Symbol } from "effect"

// Plugin type symbols for guaranteed uniqueness
const AuthPluginSymbol = Symbol.for("Plugins/Auth")
const ValidationPluginSymbol = Symbol.for("Plugins/Validation")
const CachePluginSymbol = Symbol.for("Plugins/Cache")
const MetricsPluginSymbol = Symbol.for("Plugins/Metrics")
const LoggingPluginSymbol = Symbol.for("Plugins/Logging")

// Base plugin interface with symbol identification
interface Plugin<TSymbol extends symbol, TConfig, TApi> {
  readonly id: TSymbol
  readonly name: string
  readonly version: string
  readonly dependencies: symbol[]
  configure(config: TConfig): Effect.Effect<void, PluginError>
  initialize(): Effect.Effect<TApi, PluginError>
  shutdown(): Effect.Effect<void, PluginError>
}

// Specific plugin interfaces
interface AuthPlugin extends Plugin<typeof AuthPluginSymbol, AuthConfig, {
  authenticate(token: string): Effect.Effect<User, AuthError>
  authorize(user: User, resource: string, action: string): Effect.Effect<boolean, AuthError>
  generateToken(user: User): Effect.Effect<string, AuthError>
}> {}

interface ValidationPlugin extends Plugin<typeof ValidationPluginSymbol, ValidationConfig, {
  validate<T>(schema: Schema<T>, data: unknown): Effect.Effect<T, ValidationError>
  createSchema<T>(definition: SchemaDefinition<T>): Schema<T>
}> {}

interface CachePlugin extends Plugin<typeof CachePluginSymbol, CacheConfig, {
  get<T>(key: string): Effect.Effect<T | null, CacheError>
  set<T>(key: string, value: T, ttl?: number): Effect.Effect<void, CacheError>
  invalidate(pattern: string): Effect.Effect<void, CacheError>
}> {}

// Plugin registry service
interface PluginRegistryService {
  register<T extends symbol>(plugin: Plugin<T, any, any>): Effect.Effect<void, PluginError>
  get<T extends symbol>(pluginId: T): Effect.Effect<Plugin<T, any, any>, PluginNotFoundError>
  getApi<T extends symbol>(pluginId: T): Effect.Effect<any, PluginNotFoundError>
  initialize(): Effect.Effect<void, PluginError>
  shutdown(): Effect.Effect<void, PluginError>
  list(): Effect.Effect<Plugin<any, any, any>[]>
}

class PluginRegistry extends Context.Tag("PluginRegistry")<PluginRegistry, PluginRegistryService>() {}

// Concrete plugin implementations
const JWTAuthPlugin: AuthPlugin = {
  id: AuthPluginSymbol,
  name: "JWT Authentication",
  version: "1.0.0",
  dependencies: [],
  
  configure: (config: AuthConfig) => Effect.gen(function* () {
    // Validate JWT configuration
    if (!config.secretKey || config.secretKey.length < 32) {
      return yield* Effect.fail(new PluginError("JWT secret key must be at least 32 characters"))
    }
    
    yield* Effect.sync(() => {
      jwtConfig = config
    })
  }),
  
  initialize: () => Effect.gen(function* () {
    const logger = yield* Logger
    yield* logger.info("JWT Auth plugin initialized")
    
    return {
      authenticate: (token: string) => Effect.gen(function* () {
        try {
          const decoded = jwt.verify(token, jwtConfig.secretKey) as JWTPayload
          const user = yield* getUserById(decoded.userId)
          return user
        } catch (error) {
          return yield* Effect.fail(new AuthError("Invalid token"))
        }
      }),
      
      authorize: (user: User, resource: string, action: string) => Effect.gen(function* () {
        // Check user permissions
        return user.permissions.some(p => 
          p.resource === resource && p.actions.includes(action)
        )
      }),
      
      generateToken: (user: User) => Effect.gen(function* () {
        const payload: JWTPayload = {
          userId: user.id,
          email: user.email,
          roles: user.roles,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
        }
        
        return jwt.sign(payload, jwtConfig.secretKey)
      })
    }
  }),
  
  shutdown: () => Effect.gen(function* () {
    const logger = yield* Logger
    yield* logger.info("JWT Auth plugin shutting down")
  })
}

const RedisPlugin: CachePlugin = {
  id: CachePluginSymbol,
  name: "Redis Cache",
  version: "2.1.0",
  dependencies: [],
  
  configure: (config: CacheConfig) => Effect.gen(function* () {
    yield* Effect.sync(() => {
      redisClient.config(config)
    })
  }),
  
  initialize: () => Effect.gen(function* () {
    const client = yield* Effect.tryPromise({
      try: () => redis.createClient(redisConfig).connect(),
      catch: (error) => new PluginError(`Redis connection failed: ${error}`)
    })
    
    return {
      get: <T>(key: string) => Effect.tryPromise({
        try: async () => {
          const value = await client.get(key)
          return value ? JSON.parse(value) as T : null
        },
        catch: (error) => new CacheError(String(error))
      }),
      
      set: <T>(key: string, value: T, ttl?: number) => Effect.tryPromise({
        try: async () => {
          const serialized = JSON.stringify(value)
          if (ttl) {
            await client.setEx(key, ttl, serialized)
          } else {
            await client.set(key, serialized)
          }
        },
        catch: (error) => new CacheError(String(error))
      }),
      
      invalidate: (pattern: string) => Effect.tryPromise({
        try: async () => {
          const keys = await client.keys(pattern)
          if (keys.length > 0) {
            await client.del(keys)
          }
        },
        catch: (error) => new CacheError(String(error))
      })
    }
  }),
  
  shutdown: () => Effect.gen(function* () {
    yield* Effect.tryPromise({
      try: () => redisClient.disconnect(),
      catch: (error) => new PluginError(String(error))
    })
  })
}

// Plugin registry implementation
const PluginRegistryLive: PluginRegistryService = {
  register: <T extends symbol>(plugin: Plugin<T, any, any>) => Effect.gen(function* () {
    const plugins = yield* Ref.get(pluginsRef)
    
    // Check for conflicts using symbol comparison
    if (plugins.has(plugin.id)) {
      return yield* Effect.fail(new PluginError(`Plugin ${plugin.name} already registered`))
    }
    
    yield* Ref.update(pluginsRef, (plugins) => 
      new Map(plugins).set(plugin.id, plugin)
    )
    
    const logger = yield* Logger
    yield* logger.info(`Plugin registered: ${plugin.name} v${plugin.version}`)
  }),
  
  get: <T extends symbol>(pluginId: T) => Effect.gen(function* () {
    const plugins = yield* Ref.get(pluginsRef)
    const plugin = plugins.get(pluginId)
    
    if (!plugin) {
      return yield* Effect.fail(new PluginNotFoundError(pluginId.toString()))
    }
    
    return plugin as Plugin<T, any, any>
  }),
  
  getApi: <T extends symbol>(pluginId: T) => Effect.gen(function* () {
    const apis = yield* Ref.get(pluginApisRef)
    const api = apis.get(pluginId)
    
    if (!api) {
      return yield* Effect.fail(new PluginNotFoundError(pluginId.toString()))
    }
    
    return api
  }),
  
  initialize: () => Effect.gen(function* () {
    const plugins = yield* Ref.get(pluginsRef)
    const logger = yield* Logger
    
    // Sort plugins by dependencies
    const sortedPlugins = yield* sortPluginsByDependencies(Array.from(plugins.values()))
    
    // Initialize plugins in dependency order
    for (const plugin of sortedPlugins) {
      yield* logger.info(`Initializing plugin: ${plugin.name}`)
      
      const api = yield* plugin.initialize()
      yield* Ref.update(pluginApisRef, (apis) => 
        new Map(apis).set(plugin.id, api)
      )
    }
    
    yield* logger.info("All plugins initialized successfully")
  }),
  
  shutdown: () => Effect.gen(function* () {
    const plugins = yield* Ref.get(pluginsRef)
    const logger = yield* Logger
    
    // Shutdown plugins in reverse dependency order
    const pluginArray = Array.from(plugins.values()).reverse()
    
    for (const plugin of pluginArray) {
      yield* logger.info(`Shutting down plugin: ${plugin.name}`)
      yield* plugin.shutdown()
    }
    
    // Clear registries
    yield* Ref.set(pluginsRef, new Map())
    yield* Ref.set(pluginApisRef, new Map())
  }),
  
  list: () => Effect.gen(function* () {
    const plugins = yield* Ref.get(pluginsRef)
    return Array.from(plugins.values())
  })
}

// Application plugin system setup
const setupPlugins = Effect.gen(function* () {
  const registry = yield* PluginRegistry
  
  // Register plugins using symbols - guaranteed no conflicts
  yield* registry.register(JWTAuthPlugin)
  yield* registry.register(RedisPlugin)
  yield* registry.register(ValidationPlugin)
  yield* registry.register(MetricsPlugin)
  
  // Initialize all plugins
  yield* registry.initialize()
})

// Using plugins with type-safe symbol-based access
const authenticateUser = (token: string) => Effect.gen(function* () {
  const registry = yield* PluginRegistry
  
  // Access auth plugin API using its symbol
  const authApi = yield* registry.getApi(AuthPluginSymbol)
  const user = yield* authApi.authenticate(token)
  
  // Cache user data using cache plugin
  const cacheApi = yield* registry.getApi(CachePluginSymbol)
  yield* cacheApi.set(`user:${user.id}`, user, 300) // 5 minute TTL
  
  return user
})

// Plugin-aware middleware
const withPlugins = <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.gen(function* () {
  const registry = yield* PluginRegistry
  
  // Get available plugins
  const plugins = yield* registry.list()
  const pluginNames = plugins.map(p => p.name).join(", ")
  
  const logger = yield* Logger
  yield* logger.info(`Executing with plugins: ${pluginNames}`)
  
  return yield* effect
})
```

## Advanced Features Deep Dive

### Symbol-Based Type-Level Programming

Symbols enable advanced type-level programming patterns in Effect applications:

#### Branded Types with Symbol Identifiers

```typescript
import { Brand, Symbol } from "effect"

// Create unique symbols for type branding
const UserIdSymbol = Symbol.for("Brand/UserId")
const ProductIdSymbol = Symbol.for("Brand/ProductId")
const OrderIdSymbol = Symbol.for("Brand/OrderId")

// Branded types using symbols
type UserId = string & Brand.Brand<typeof UserIdSymbol>
type ProductId = string & Brand.Brand<typeof ProductIdSymbol>
type OrderId = string & Brand.Brand<typeof OrderIdSymbol>

// Type-safe constructors
const UserId = Brand.nominal<UserId>()
const ProductId = Brand.nominal<ProductId>()
const OrderId = Brand.nominal<OrderId>()

// Symbol-based type guards
const isUserId = (value: unknown): value is UserId => 
  typeof value === "string" && Brand.isBrand(value, UserIdSymbol)

const isProductId = (value: unknown): value is ProductId =>
  typeof value === "string" && Brand.isBrand(value, ProductIdSymbol)

// Usage with compile-time safety
const createOrder = (userId: UserId, productId: ProductId, quantity: number) => {
  // TypeScript prevents mixing up ID types
  const orderId = OrderId(crypto.randomUUID())
  
  return {
    id: orderId,
    userId,    // Must be UserId, not string
    productId, // Must be ProductId, not string
    quantity,
    createdAt: new Date()
  }
}

// This would cause a compile error:
// createOrder("user123", "product456", 1) // Error: string not assignable to UserId
```

#### Symbol-Based Phantom Types

```typescript
import { Symbol } from "effect"

// Phantom type symbols
const ValidatedSymbol = Symbol.for("State/Validated")
const SanitizedSymbol = Symbol.for("State/Sanitized")
const EncryptedSymbol = Symbol.for("State/Encrypted")

// Phantom types using symbols
type Validated<T> = T & { readonly [ValidatedSymbol]: true }
type Sanitized<T> = T & { readonly [SanitizedSymbol]: true }
type Encrypted<T> = T & { readonly [EncryptedSymbol]: true }

// Type-safe state transitions
const validate = <T>(data: T): Effect.Effect<Validated<T>, ValidationError> => 
  Effect.gen(function* () {
    // Validation logic
    yield* Effect.sync(() => {
      if (typeof data !== "object" || data === null) {
        throw new ValidationError("Invalid data structure")
      }
    })
    
    return data as Validated<T>
  })

const sanitize = <T>(data: Validated<T>): Effect.Effect<Sanitized<Validated<T>>, SanitizationError> =>
  Effect.gen(function* () {
    // Sanitization logic
    const sanitized = yield* Effect.sync(() => {
      // Remove dangerous content
      return JSON.parse(JSON.stringify(data)) // Deep clone
    })
    
    return sanitized as Sanitized<Validated<T>>
  })

const encrypt = <T>(data: Sanitized<T>): Effect.Effect<Encrypted<Sanitized<T>>, EncryptionError> =>
  Effect.gen(function* () {
    const encrypted = yield* Effect.tryPromise({
      try: async () => {
        const serialized = JSON.stringify(data)
        return await crypto.subtle.encrypt(algorithm, key, encoder.encode(serialized))
      },
      catch: (error) => new EncryptionError(String(error))
    })
    
    return encrypted as Encrypted<Sanitized<T>>
  })

// Compile-time enforced processing pipeline
const processUserData = (rawData: unknown) => Effect.gen(function* () {
  const validated = yield* validate(rawData)
  const sanitized = yield* sanitize(validated) // Must be validated first
  const encrypted = yield* encrypt(sanitized)  // Must be sanitized first
  
  return encrypted
})
```

### Advanced Symbol Patterns

#### Symbol-Based State Machines

```typescript
import { Ref, Symbol } from "effect"

// State symbols
const IdleSymbol = Symbol.for("State/Idle")
const LoadingSymbol = Symbol.for("State/Loading")
const SuccessSymbol = Symbol.for("State/Success")
const ErrorSymbol = Symbol.for("State/Error")

// State types
type IdleState = { readonly type: typeof IdleSymbol }
type LoadingState = { readonly type: typeof LoadingSymbol; startTime: Date }
type SuccessState<T> = { readonly type: typeof SuccessSymbol; data: T; loadTime: number }
type ErrorState = { readonly type: typeof ErrorSymbol; error: Error; retryCount: number }

type State<T> = IdleState | LoadingState | SuccessState<T> | ErrorState

// State machine with symbol-based transitions
const createStateMachine = <T>() => {
  const stateRef = Ref.unsafeMake<State<T>>({ type: IdleSymbol })
  
  const transition = {
    toLoading: () => Effect.gen(function* () {
      const currentState = yield* Ref.get(stateRef)
      
      if (currentState.type === LoadingSymbol) {
        return // Already loading
      }
      
      yield* Ref.set(stateRef, { 
        type: LoadingSymbol, 
        startTime: new Date() 
      })
    }),
    
    toSuccess: (data: T) => Effect.gen(function* () {
      const currentState = yield* Ref.get(stateRef)
      
      if (currentState.type !== LoadingSymbol) {
        return yield* Effect.fail(new StateTransitionError("Must be loading to transition to success"))
      }
      
      const loadTime = Date.now() - currentState.startTime.getTime()
      yield* Ref.set(stateRef, { 
        type: SuccessSymbol, 
        data, 
        loadTime 
      })
    }),
    
    toError: (error: Error) => Effect.gen(function* () {
      const currentState = yield* Ref.get(stateRef)
      const retryCount = currentState.type === ErrorSymbol ? currentState.retryCount + 1 : 0
      
      yield* Ref.set(stateRef, { 
        type: ErrorSymbol, 
        error, 
        retryCount 
      })
    }),
    
    toIdle: () => Ref.set(stateRef, { type: IdleSymbol })
  }
  
  const getState = () => Ref.get(stateRef)
  
  const match = <R>(handlers: {
    [IdleSymbol]: () => R
    [LoadingSymbol]: (state: LoadingState) => R
    [SuccessSymbol]: (state: SuccessState<T>) => R
    [ErrorSymbol]: (state: ErrorState) => R
  }) => Effect.gen(function* () {
    const state = yield* getState()
    
    switch (state.type) {
      case IdleSymbol:
        return handlers[IdleSymbol]()
      case LoadingSymbol:
        return handlers[LoadingSymbol](state)
      case SuccessSymbol:
        return handlers[SuccessSymbol](state)
      case ErrorSymbol:
        return handlers[ErrorSymbol](state)
    }
  })
  
  return { transition, getState, match }
}

// Usage
const userStateMachine = createStateMachine<User>()

const loadUser = (id: string) => Effect.gen(function* () {
  yield* userStateMachine.transition.toLoading()
  
  const result = yield* fetchUser(id).pipe(
    Effect.matchEffect({
      onSuccess: (user) => userStateMachine.transition.toSuccess(user),
      onFailure: (error) => userStateMachine.transition.toError(error)
    })
  )
  
  return result
})

// Pattern matching with symbols
const renderUserState = userStateMachine.match({
  [IdleSymbol]: () => "Ready to load user",
  [LoadingSymbol]: (state) => `Loading user... (${Date.now() - state.startTime.getTime()}ms)`,
  [SuccessSymbol]: (state) => `User loaded: ${state.data.name} (took ${state.loadTime}ms)`,
  [ErrorSymbol]: (state) => `Error loading user: ${state.error.message} (retry #${state.retryCount})`
})
```

## Practical Patterns & Best Practices

### Pattern 1: Symbol Namespacing Strategy

```typescript
import { Symbol } from "effect"

// Hierarchical symbol naming for organization
const createSymbolNamespace = (namespace: string) => ({
  // Service symbols
  services: {
    database: Symbol.for(`${namespace}/Services/Database`),
    cache: Symbol.for(`${namespace}/Services/Cache`),
    logger: Symbol.for(`${namespace}/Services/Logger`),
    auth: Symbol.for(`${namespace}/Services/Auth`)
  },
  
  // Event symbols
  events: {
    userCreated: Symbol.for(`${namespace}/Events/UserCreated`),
    userUpdated: Symbol.for(`${namespace}/Events/UserUpdated`),
    orderPlaced: Symbol.for(`${namespace}/Events/OrderPlaced`)
  },
  
  // State symbols
  states: {
    idle: Symbol.for(`${namespace}/States/Idle`),
    loading: Symbol.for(`${namespace}/States/Loading`),
    success: Symbol.for(`${namespace}/States/Success`),
    error: Symbol.for(`${namespace}/States/Error`)
  },
  
  // Brand symbols
  brands: {
    userId: Symbol.for(`${namespace}/Brands/UserId`),
    productId: Symbol.for(`${namespace}/Brands/ProductId`),
    orderId: Symbol.for(`${namespace}/Brands/OrderId`)
  }
})

// Application-specific symbols
const AppSymbols = createSymbolNamespace("MyApp")
const UserModuleSymbols = createSymbolNamespace("MyApp/UserModule")
const OrderModuleSymbols = createSymbolNamespace("MyApp/OrderModule")

// Symbol registry for debugging and introspection
const SymbolRegistry = new Map<symbol, { namespace: string; category: string; name: string }>()

const registerSymbol = (symbol: symbol, namespace: string, category: string, name: string) => {
  SymbolRegistry.set(symbol, { namespace, category, name })
  return symbol
}

const getSymbolInfo = (symbol: symbol) => SymbolRegistry.get(symbol)

// Enhanced symbol creation with registration
const createRegisteredSymbol = (namespace: string, category: string, name: string) => {
  const symbol = Symbol.for(`${namespace}/${category}/${name}`)
  registerSymbol(symbol, namespace, category, name)
  return symbol
}

// Usage
const DatabaseService = createRegisteredSymbol("MyApp", "Services", "Database")
const UserCreatedEvent = createRegisteredSymbol("MyApp", "Events", "UserCreated")
```

### Pattern 2: Symbol-Based Feature Flags

```typescript
import { Context, Effect, Ref, Symbol } from "effect"

// Feature flag symbols
const FeatureFlags = {
  newUserInterface: Symbol.for("Features/NewUserInterface"),
  advancedSearch: Symbol.for("Features/AdvancedSearch"),
  realTimeNotifications: Symbol.for("Features/RealTimeNotifications"),
  betaCheckout: Symbol.for("Features/BetaCheckout"),
  aiRecommendations: Symbol.for("Features/AIRecommendations")
} as const

type FeatureFlag = typeof FeatureFlags[keyof typeof FeatureFlags]

// Feature flag service
interface FeatureFlagService {
  isEnabled(flag: FeatureFlag): Effect.Effect<boolean>
  isEnabled(flag: FeatureFlag, userId: string): Effect.Effect<boolean>
  enable(flag: FeatureFlag): Effect.Effect<void>
  disable(flag: FeatureFlag): Effect.Effect<void>
  enableForUser(flag: FeatureFlag, userId: string): Effect.Effect<void>
  disableForUser(flag: FeatureFlag, userId: string): Effect.Effect<void>
  getAllFlags(): Effect.Effect<Map<FeatureFlag, boolean>>
}

class FeatureFlags extends Context.Tag("FeatureFlags")<FeatureFlags, FeatureFlagService>() {}

// Feature flag implementation
const FeatureFlagLive: FeatureFlagService = {
  isEnabled: (flag: FeatureFlag, userId?: string) => Effect.gen(function* () {
    const globalFlags = yield* Ref.get(globalFlagsRef)
    const userFlags = userId ? yield* Ref.get(userFlagsRef) : new Map()
    
    // User-specific flags override global flags
    if (userId && userFlags.has(userId)) {
      const userFlagMap = userFlags.get(userId)!
      if (userFlagMap.has(flag)) {
        return userFlagMap.get(flag)!
      }
    }
    
    return globalFlags.get(flag) ?? false
  }),
  
  enable: (flag: FeatureFlag) => Effect.gen(function* () {
    yield* Ref.update(globalFlagsRef, (flags) => 
      new Map(flags).set(flag, true)
    )
    
    const logger = yield* Logger
    yield* logger.info(`Feature flag enabled globally: ${flag.toString()}`)
  }),
  
  disable: (flag: FeatureFlag) => Effect.gen(function* () {
    yield* Ref.update(globalFlagsRef, (flags) => 
      new Map(flags).set(flag, false)
    )
    
    const logger = yield* Logger
    yield* logger.info(`Feature flag disabled globally: ${flag.toString()}`)
  }),
  
  enableForUser: (flag: FeatureFlag, userId: string) => Effect.gen(function* () {
    yield* Ref.update(userFlagsRef, (userFlags) => {
      const newUserFlags = new Map(userFlags)
      const userFlagMap = newUserFlags.get(userId) ?? new Map()
      userFlagMap.set(flag, true)
      newUserFlags.set(userId, userFlagMap)
      return newUserFlags
    })
    
    const logger = yield* Logger
    yield* logger.info(`Feature flag enabled for user: ${flag.toString()}, userId: ${userId}`)
  }),
  
  disableForUser: (flag: FeatureFlag, userId: string) => Effect.gen(function* () {
    yield* Ref.update(userFlagsRef, (userFlags) => {
      const newUserFlags = new Map(userFlags)
      const userFlagMap = newUserFlags.get(userId) ?? new Map()
      userFlagMap.set(flag, false)
      newUserFlags.set(userId, userFlagMap)
      return newUserFlags
    })
  }),
  
  getAllFlags: () => Ref.get(globalFlagsRef)
}

// Feature-aware components
const withFeatureFlag = <A, E, R>(
  flag: FeatureFlag,
  enabled: Effect.Effect<A, E, R>,
  disabled: Effect.Effect<A, E, R>
) => Effect.gen(function* () {
  const featureFlags = yield* FeatureFlags
  const isEnabled = yield* featureFlags.isEnabled(flag)
  
  return yield* (isEnabled ? enabled : disabled)
})

// Usage in application code
const renderUserInterface = (userId: string) => Effect.gen(function* () {
  const featureFlags = yield* FeatureFlags
  
  const useNewUI = yield* featureFlags.isEnabled(FeatureFlags.newUserInterface, userId)
  const hasAdvancedSearch = yield* featureFlags.isEnabled(FeatureFlags.advancedSearch, userId)
  
  return {
    layout: useNewUI ? "new" : "classic",
    searchType: hasAdvancedSearch ? "advanced" : "basic",
    features: {
      realTimeNotifications: yield* featureFlags.isEnabled(FeatureFlags.realTimeNotifications, userId),
      aiRecommendations: yield* featureFlags.isEnabled(FeatureFlags.aiRecommendations, userId)
    }
  }
})

// A/B testing with feature flags
const checkoutFlow = (userId: string) => withFeatureFlag(
  FeatureFlags.betaCheckout,
  // Beta checkout flow
  Effect.gen(function* () {
    const logger = yield* Logger
    yield* logger.info("Using beta checkout flow", { userId })
    return yield* betaCheckoutProcess(userId)
  }),
  // Standard checkout flow
  Effect.gen(function* () {
    return yield* standardCheckoutProcess(userId)
  })
)
```

### Pattern 3: Symbol-Based Configuration Management

```typescript
import { Config, Context, Effect, Symbol } from "effect"

// Configuration symbols for type safety
const ConfigSymbols = {
  database: {
    host: Symbol.for("Config/Database/Host"),
    port: Symbol.for("Config/Database/Port"),
    username: Symbol.for("Config/Database/Username"),
    password: Symbol.for("Config/Database/Password"),
    database: Symbol.for("Config/Database/Database"),
    ssl: Symbol.for("Config/Database/SSL")
  },
  redis: {
    url: Symbol.for("Config/Redis/URL"),
    password: Symbol.for("Config/Redis/Password"),
    db: Symbol.for("Config/Redis/DB")
  },
  auth: {
    jwtSecret: Symbol.for("Config/Auth/JWTSecret"),
    tokenExpiry: Symbol.for("Config/Auth/TokenExpiry"),
    refreshExpiry: Symbol.for("Config/Auth/RefreshExpiry")
  },
  app: {
    port: Symbol.for("Config/App/Port"),
    env: Symbol.for("Config/App/Environment"),
    logLevel: Symbol.for("Config/App/LogLevel")
  }
} as const

// Configuration schema with symbol-based keys
interface AppConfig {
  readonly [ConfigSymbols.database.host]: string
  readonly [ConfigSymbols.database.port]: number
  readonly [ConfigSymbols.database.username]: string
  readonly [ConfigSymbols.database.password]: string
  readonly [ConfigSymbols.database.database]: string
  readonly [ConfigSymbols.database.ssl]: boolean
  readonly [ConfigSymbols.redis.url]: string
  readonly [ConfigSymbols.redis.password]: string
  readonly [ConfigSymbols.redis.db]: number
  readonly [ConfigSymbols.auth.jwtSecret]: string
  readonly [ConfigSymbols.auth.tokenExpiry]: number
  readonly [ConfigSymbols.auth.refreshExpiry]: number
  readonly [ConfigSymbols.app.port]: number
  readonly [ConfigSymbols.app.env]: "development" | "staging" | "production"
  readonly [ConfigSymbols.app.logLevel]: "debug" | "info" | "warn" | "error"
}

// Type-safe configuration loading
const loadConfig = Effect.gen(function* () {
  const config: AppConfig = {
    // Database configuration
    [ConfigSymbols.database.host]: yield* Config.string("DB_HOST").pipe(
      Config.withDefault("localhost")
    ),
    [ConfigSymbols.database.port]: yield* Config.integer("DB_PORT").pipe(
      Config.withDefault(5432)
    ),
    [ConfigSymbols.database.username]: yield* Config.string("DB_USERNAME"),
    [ConfigSymbols.database.password]: yield* Config.secret("DB_PASSWORD"),
    [ConfigSymbols.database.database]: yield* Config.string("DB_NAME"),
    [ConfigSymbols.database.ssl]: yield* Config.boolean("DB_SSL").pipe(
      Config.withDefault(false)
    ),
    
    // Redis configuration
    [ConfigSymbols.redis.url]: yield* Config.string("REDIS_URL").pipe(
      Config.withDefault("redis://localhost:6379")
    ),
    [ConfigSymbols.redis.password]: yield* Config.secret("REDIS_PASSWORD").pipe(
      Config.optional,
      Effect.map(Option.getOrElse(() => ""))
    ),
    [ConfigSymbols.redis.db]: yield* Config.integer("REDIS_DB").pipe(
      Config.withDefault(0)
    ),
    
    // Auth configuration
    [ConfigSymbols.auth.jwtSecret]: yield* Config.secret("JWT_SECRET"),
    [ConfigSymbols.auth.tokenExpiry]: yield* Config.integer("JWT_EXPIRY").pipe(
      Config.withDefault(3600) // 1 hour
    ),
    [ConfigSymbols.auth.refreshExpiry]: yield* Config.integer("JWT_REFRESH_EXPIRY").pipe(
      Config.withDefault(604800) // 1 week
    ),
    
    // App configuration
    [ConfigSymbols.app.port]: yield* Config.integer("PORT").pipe(
      Config.withDefault(3000)
    ),
    [ConfigSymbols.app.env]: yield* Config.literal("NODE_ENV")("development", "staging", "production").pipe(
      Config.withDefault("development" as const)
    ),
    [ConfigSymbols.app.logLevel]: yield* Config.literal("LOG_LEVEL")("debug", "info", "warn", "error").pipe(
      Config.withDefault("info" as const)
    )
  }
  
  return config
})

// Configuration service with symbol-based access
interface ConfigService {
  get<K extends keyof AppConfig>(key: K): Effect.Effect<AppConfig[K]>
  getAll(): Effect.Effect<AppConfig>
  reload(): Effect.Effect<void>
  watch<K extends keyof AppConfig>(
    key: K, 
    callback: (value: AppConfig[K]) => Effect.Effect<void>
  ): Effect.Effect<void>
}

class AppConfigService extends Context.Tag("AppConfig")<AppConfigService, ConfigService>() {}

// Configuration validation with symbols
const validateConfig = (config: AppConfig) => Effect.gen(function* () {
  const errors: string[] = []
  
  // Validate database configuration
  if (!config[ConfigSymbols.database.host]) {
    errors.push("Database host is required")
  }
  
  if (config[ConfigSymbols.database.port] < 1 || config[ConfigSymbols.database.port] > 65535) {
    errors.push("Database port must be between 1 and 65535")
  }
  
  if (!config[ConfigSymbols.database.username]) {
    errors.push("Database username is required")
  }
  
  if (!config[ConfigSymbols.database.password]) {
    errors.push("Database password is required")
  }
  
  // Validate auth configuration
  if (config[ConfigSymbols.auth.jwtSecret].length < 32) {
    errors.push("JWT secret must be at least 32 characters")
  }
  
  if (config[ConfigSymbols.auth.tokenExpiry] < 60) {
    errors.push("Token expiry must be at least 60 seconds")
  }
  
  // Validate app configuration
  if (config[ConfigSymbols.app.port] < 1 || config[ConfigSymbols.app.port] > 65535) {
    errors.push("Application port must be between 1 and 65535")
  }
  
  if (errors.length > 0) {
    return yield* Effect.fail(new ConfigValidationError(errors))
  }
  
  return config
})

// Usage in application services
const createDatabaseConnection = Effect.gen(function* () {
  const config = yield* AppConfigService
  
  const host = yield* config.get(ConfigSymbols.database.host)
  const port = yield* config.get(ConfigSymbols.database.port)
  const username = yield* config.get(ConfigSymbols.database.username)
  const password = yield* config.get(ConfigSymbols.database.password)
  const database = yield* config.get(ConfigSymbols.database.database)
  const ssl = yield* config.get(ConfigSymbols.database.ssl)
  
  return yield* Effect.tryPromise({
    try: () => new Pool({
      host,
      port,
      user: username,
      password,
      database,
      ssl
    }),
    catch: (error) => new DatabaseConnectionError(String(error))
  })
})
```

## Integration Examples

### Integration with Popular Frameworks

#### Express.js Integration with Symbol-Based Middleware

```typescript
import { Context, Effect, Layer, Symbol } from "effect"
import express from "express"

// Middleware symbols for unique identification
const AuthMiddlewareSymbol = Symbol.for("Middleware/Auth")
const LoggingMiddlewareSymbol = Symbol.for("Middleware/Logging")
const ValidationMiddlewareSymbol = Symbol.for("Middleware/Validation")
const RateLimitMiddlewareSymbol = Symbol.for("Middleware/RateLimit")

// Middleware registry with symbol-based routing
interface MiddlewareService {
  register<T extends symbol>(
    id: T,
    middleware: express.RequestHandler
  ): Effect.Effect<void>
  get<T extends symbol>(id: T): Effect.Effect<express.RequestHandler>
  apply(app: express.Application): Effect.Effect<void>
}

class Middleware extends Context.Tag("Middleware")<Middleware, MiddlewareService>() {}

// Express application with Effect integration
const createExpressApp = Effect.gen(function* () {
  const middleware = yield* Middleware
  const logger = yield* Logger
  
  const app = express()
  
  // Register symbol-based middleware
  yield* middleware.register(LoggingMiddlewareSymbol, (req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
    })
    next()
  })
  
  yield* middleware.register(AuthMiddlewareSymbol, (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    // Effect-based token validation
    Effect.runPromise(
      Effect.gen(function* () {
        const authService = yield* AuthService
        const user = yield* authService.validateToken(token)
        req.user = user
        next()
      }).pipe(
        Effect.catchAll((error) => 
          Effect.sync(() => res.status(401).json({ error: error.message }))
        )
      )
    )
  })
  
  // Apply middleware using symbols
  yield* middleware.apply(app)
  
  return app
})

// Route handlers with Effect integration
const createUserRoutes = (app: express.Application) => Effect.gen(function* () {
  const userService = yield* UserService
  const middleware = yield* Middleware
  
  // Get auth middleware by symbol
  const authMiddleware = yield* middleware.get(AuthMiddlewareSymbol)
  
  app.get('/users/:id', authMiddleware, (req, res) => {
    const userId = UserId(req.params.id)
    
    Effect.runPromise(
      userService.getUser(userId).pipe(
        Effect.match({
          onSuccess: (user) => res.json(user),
          onFailure: (error) => {
            if (error._tag === 'UserNotFound') {
              res.status(404).json({ error: 'User not found' })
            } else {
              res.status(500).json({ error: 'Internal server error' })
            }
          }
        })
      )
    )
  })
  
  app.post('/users', authMiddleware, (req, res) => {
    Effect.runPromise(
      userService.createUser(req.body).pipe(
        Effect.match({
          onSuccess: (user) => res.status(201).json(user),
          onFailure: (error) => {
            if (error._tag === 'ValidationError') {
              res.status(400).json({ error: error.message })
            } else {
              res.status(500).json({ error: 'Internal server error' })
            }
          }
        })
      )
    )
  })
})
```

#### Testing Strategies with Symbol-Based Mocks

```typescript
import { Context, Effect, Layer, Ref, Symbol } from "effect"
import { describe, it, expect } from "bun:test"

// Test symbols for mock identification
const MockDatabaseSymbol = Symbol.for("Test/MockDatabase")
const MockEmailSymbol = Symbol.for("Test/MockEmail")
const MockLoggerSymbol = Symbol.for("Test/MockLogger")

// Mock service implementations
const createMockDatabase = Effect.gen(function* () {
  const users = yield* Ref.make<Map<string, User>>(new Map())
  const queries = yield* Ref.make<string[]>([])
  
  const mockDb: DatabaseService = {
    [DatabaseSymbol]: {} as DatabaseService,
    query: <T>(sql: string, params?: unknown[]) => Effect.gen(function* () {
      // Track queries for testing
      yield* Ref.update(queries, (qs) => [...qs, sql])
      
      if (sql.includes("SELECT")) {
        const userMap = yield* Ref.get(users)
        return Array.from(userMap.values()) as T[]
      }
      
      if (sql.includes("INSERT")) {
        const [name, email] = params as [string, string]
        const user: User = {
          id: UserId(crypto.randomUUID()),
          name,
          email,
          createdAt: new Date()
        }
        
        yield* Ref.update(users, (userMap) => 
          new Map(userMap).set(user.id, user)
        )
        
        return [user] as T[]
      }
      
      return [] as T[]
    }),
    
    transaction: <A, E>(operation: Effect.Effect<A, E, DatabaseService>) =>
      operation.pipe(Effect.provideService(Database, mockDb))
  }
  
  return {
    service: mockDb,
    getQueries: () => Ref.get(queries),
    getUsers: () => Ref.get(users),
    addUser: (user: User) => Ref.update(users, (userMap) => 
      new Map(userMap).set(user.id, user)
    )
  }
})

const createMockEmail = Effect.gen(function* () {
  const sentEmails = yield* Ref.make<Array<{
    to: string
    subject: string
    body: string
    template?: string
    data?: Record<string, unknown>
  }>>([])
  
  const mockEmail: EmailService = {
    [EmailSymbol]: {} as EmailService,
    send: (to: string, subject: string, body: string) => Effect.gen(function* () {
      yield* Ref.update(sentEmails, (emails) => [...emails, { to, subject, body }])
    }),
    
    sendTemplate: (to: string, template: string, data: Record<string, unknown>) => Effect.gen(function* () {
      yield* Ref.update(sentEmails, (emails) => [...emails, { 
        to, 
        subject: `Template: ${template}`, 
        body: JSON.stringify(data),
        template,
        data
      }])
    })
  }
  
  return {
    service: mockEmail,
    getSentEmails: () => Ref.get(sentEmails),
    clearEmails: () => Ref.set(sentEmails, [])
  }
})

// Test layer with mocked services
const TestLayer = Effect.gen(function* () {
  const mockDb = yield* createMockDatabase
  const mockEmail = yield* createMockEmail
  
  return Layer.empty.pipe(
    Layer.provideService(Database, mockDb.service),
    Layer.provideService(Email, mockEmail.service),
    Layer.provideService(Logger, ConsoleLoggerLive)
  )
}).pipe(Layer.unwrapEffect)

// Test cases using symbol-based mocks
describe("User Service", () => {
  it("should create user and send welcome email", async () => {
    const program = Effect.gen(function* () {
      const mockDb = yield* createMockDatabase
      const mockEmail = yield* createMockEmail
      
      // Create user
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        preferences: { theme: "dark", notifications: true }
      }
      
      const user = yield* createUser(userData).pipe(
        Effect.provideService(Database, mockDb.service),
        Effect.provideService(Email, mockEmail.service),
        Effect.provideService(Logger, ConsoleLoggerLive)
      )
      
      // Verify user was created
      const users = yield* mockDb.getUsers()
      expect(users.size).toBe(1)
      expect(user.name).toBe("John Doe")
      
      // Verify welcome email was sent
      const emails = yield* mockEmail.getSentEmails()
      expect(emails).toHaveLength(1)
      expect(emails[0].to).toBe("john@example.com")
      expect(emails[0].template).toBe("welcome")
      
      // Verify database queries
      const queries = yield* mockDb.getQueries()
      expect(queries.some(q => q.includes("INSERT"))).toBe(true)
      
      return { user, emails, queries }
    })
    
    const result = await Effect.runPromise(program)
    
    expect(result.user.id).toBeDefined()
    expect(result.emails[0].data).toMatchObject({
      name: "John Doe",
      preferences: { theme: "dark", notifications: true }
    })
  })
  
  it("should fail when user already exists", async () => {
    const program = Effect.gen(function* () {
      const mockDb = yield* createMockDatabase
      const mockEmail = yield* createMockEmail
      
      // Pre-populate with existing user
      const existingUser: User = {
        id: UserId("existing-id"),
        name: "Existing User",
        email: "john@example.com",
        createdAt: new Date()
      }
      
      yield* mockDb.addUser(existingUser)
      
      // Attempt to create user with same email
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        preferences: { theme: "light", notifications: false }
      }
      
      const result = yield* createUser(userData).pipe(
        Effect.provideService(Database, mockDb.service),
        Effect.provideService(Email, mockEmail.service),
        Effect.provideService(Logger, ConsoleLoggerLive),
        Effect.either
      )
      
      return result
    })
    
    const result = await Effect.runPromise(program)
    
    expect(Either.isLeft(result)).toBe(true)
    if (Either.isLeft(result)) {
      expect(result.left._tag).toBe("UserAlreadyExists")
    }
  })
})

// Property-based testing with symbols
describe("Symbol Properties", () => {
  it("should maintain symbol uniqueness", () => {
    const symbols = [
      Symbol.for("Test/A"),
      Symbol.for("Test/B"),
      Symbol.for("Test/A"), // Same as first
      Symbol.for("Test/C")
    ]
    
    const uniqueSymbols = new Set(symbols)
    expect(uniqueSymbols.size).toBe(3) // A, B, C (first and third A are same)
    
    // Test symbol equality
    expect(Symbol.for("Test/A") === Symbol.for("Test/A")).toBe(true)
    expect(Symbol.for("Test/A") === Symbol.for("Test/B")).toBe(false)
  })
  
  it("should work with Symbol.isSymbol predicate", () => {
    const values = [
      Symbol.for("Test"),
      "string",
      42,
      {},
      Symbol("local"),
      null,
      undefined
    ]
    
    const symbols = values.filter(Symbol.isSymbol)
    expect(symbols).toHaveLength(2)
    expect(symbols.every(Symbol.isSymbol)).toBe(true)
  })
})
```

## Conclusion

Symbol provides collision-free identifiers, type-safe service tokens, and unique type identifiers for building robust Effect applications.

Key benefits:
- **Guaranteed Uniqueness**: Symbols prevent naming collisions across modules and packages
- **Type Safety**: Symbol-based service identification provides compile-time guarantees
- **Runtime Security**: Services cannot be accidentally overwritten or confused

Use Symbol when you need unique identifiers for services, events, feature flags, or any scenario where collision-free identification is critical to application correctness and maintainability.