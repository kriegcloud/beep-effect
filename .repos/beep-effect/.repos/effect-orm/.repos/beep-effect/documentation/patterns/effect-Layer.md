# Layer: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Layer Solves

Building modular applications with proper dependency injection has always been challenging. Consider a typical web application that needs database connections, HTTP clients, logging, and configuration:

```typescript
// Traditional approach - manual dependency wiring
class DatabaseService {
  constructor(private config: Config) {}
  async query(sql: string) { /* ... */ }
}

class UserRepository {
  constructor(private db: DatabaseService, private logger: Logger) {}
  async findById(id: string) {
    this.logger.info(`Finding user ${id}`)
    return this.db.query(`SELECT * FROM users WHERE id = ?`, [id])
  }
}

class UserService {
  constructor(
    private repo: UserRepository,
    private httpClient: HttpClient,
    private logger: Logger
  ) {}
  async enrichUser(id: string) {
    const user = await this.repo.findById(id)
    const enrichmentData = await this.httpClient.get(`/api/enrich/${id}`)
    return { ...user, ...enrichmentData }
  }
}

// Manual wiring - error-prone and hard to test
const config = loadConfig()
const logger = new Logger(config.logLevel)
const db = new DatabaseService(config)
const httpClient = new HttpClient(config.apiUrl, logger)
const userRepo = new UserRepository(db, logger)
const userService = new UserService(userRepo, httpClient, logger)

// Testing requires manual mocking
const mockDb = { query: jest.fn() }
const mockLogger = { info: jest.fn(), error: jest.fn() }
const testRepo = new UserRepository(mockDb as any, mockLogger as any)
```

This approach leads to:
- **Manual wiring complexity** - Dependencies must be instantiated in the correct order
- **Testing difficulties** - Mocking requires type casting and manual setup
- **No compile-time guarantees** - Missing dependencies only fail at runtime
- **Shared mutable state** - Services often share stateful connections
- **Resource management** - No automatic cleanup of connections/resources

### The Layer Solution

Effect's Layer system provides a composable, type-safe approach to dependency injection that solves all these problems:

```typescript
import { Effect, Layer, Context } from "effect"

// Define service interfaces
class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  {
    readonly query: (sql: string) => Effect.Effect<any, Error>
  }
>() {}

class Logger extends Context.Tag("Logger")<
  Logger,
  {
    readonly info: (message: string) => Effect.Effect<void>
    readonly error: (message: string) => Effect.Effect<void>
  }
>() {}

// Create layers - composable units of construction
const DatabaseLive = Layer.effect(
  DatabaseService,
  Effect.gen(function* () {
    const config = yield* Config
    // Automatic resource management
    return {
      query: (sql: string) => Effect.try(() => /* db query */)
    }
  })
)

// Layers compose automatically
const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const logger = yield* Logger
    
    return {
      findById: (id: string) =>
        Effect.gen(function* () {
          yield* logger.info(`Finding user ${id}`)
          return yield* db.query(`SELECT * FROM users WHERE id = ?`)
        })
    }
  })
)

// Type-safe dependency graph
const AppLayer = Layer.mergeAll(
  ConfigLive,
  LoggerLive,
  DatabaseLive,
  HttpClientLive,
  UserRepositoryLive,
  UserServiceLive
)

// Easy testing with test layers
const TestLayer = Layer.mergeAll(
  Layer.succeed(DatabaseService, {
    query: () => Effect.succeed({ id: "123", name: "Test User" })
  }),
  Layer.succeed(Logger, {
    info: () => Effect.void,
    error: () => Effect.void
  })
)
```

### Key Concepts

**Service**: A type-safe interface defined using Context.Tag, representing a capability your application needs.

**Layer**: A blueprint for constructing services, handling dependencies and lifecycle automatically.

**Composition**: Layers can be combined using operators like `Layer.merge` and `Layer.provide`, creating a dependency graph.

**Resource Management**: Layers handle acquisition and release of resources (connections, file handles, etc.) automatically.

## Basic Usage Patterns

### Pattern 1: Defining Services

```typescript
import { Context, Effect, Layer } from "effect"

// Step 1: Define service interface using Context.Tag
class EmailService extends Context.Tag("EmailService")<
  EmailService,
  {
    readonly send: (to: string, subject: string, body: string) => 
      Effect.Effect<void, Error>
  }
>() {}

// Step 2: Implement the service as a Layer
const EmailServiceLive = Layer.succeed(
  EmailService,
  {
    send: (to, subject, body) =>
      Effect.try({
        try: () => {
          console.log(`Sending email to ${to}: ${subject}`)
          // Actual email sending logic
        },
        catch: (error) => new Error(`Failed to send email: ${error}`)
      })
  }
)

// Step 3: Use the service
const program = Effect.gen(function* () {
  const email = yield* EmailService
  yield* email.send("user@example.com", "Welcome!", "Thanks for signing up")
})

// Step 4: Provide the layer and run
const runnable = Effect.provide(program, EmailServiceLive)
Effect.runPromise(runnable)
```

### Pattern 2: Services with Dependencies

```typescript
// Configuration service
class Config extends Context.Tag("Config")<
  Config,
  {
    readonly database: {
      host: string
      port: number
      username: string
      password: string
    }
    readonly smtp: {
      host: string
      port: number
    }
  }
>() {}

// Database service that depends on Config
class Database extends Context.Tag("Database")<
  Database,
  {
    readonly execute: <T>(query: string) => Effect.Effect<T, Error>
    readonly transaction: <A>(
      effect: Effect.Effect<A, Error>
    ) => Effect.Effect<A, Error>
  }
>() {}

// Create database layer with dependencies
const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* Config
    const { host, port, username, password } = config.database
    
    // Connect to database
    const connection = yield* Effect.try(() => 
      createConnection({ host, port, username, password })
    )
    
    return {
      execute: <T>(query: string) =>
        Effect.try(() => connection.query<T>(query)),
      
      transaction: <A>(effect: Effect.Effect<A, Error>) =>
        Effect.acquireUseRelease(
          Effect.try(() => connection.beginTransaction()),
          () => effect,
          (_, exit) =>
            exit._tag === "Success"
              ? Effect.try(() => connection.commit())
              : Effect.try(() => connection.rollback())
        )
    }
  })
).pipe(
  // Handle connection lifecycle
  Layer.scoped
)
```

### Pattern 3: Layer Composition

```typescript
// Repository layer depending on Database and Logger
const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database
    const logger = yield* Logger
    
    return {
      create: (user: UserData) =>
        Effect.gen(function* () {
          yield* logger.info(`Creating user: ${user.email}`)
          const result = yield* db.execute<{ id: string }>(
            `INSERT INTO users (email, name) VALUES (?, ?) RETURNING id`
          )
          return { id: result.id, ...user }
        }),
        
      findById: (id: string) =>
        Effect.gen(function* () {
          yield* logger.info(`Finding user: ${id}`)
          return yield* db.execute<User>(
            `SELECT * FROM users WHERE id = ?`
          )
        })
    }
  })
)

// Compose all layers
const AppLive = Layer.mergeAll(
  ConfigLive,
  LoggerLive,
  DatabaseLive,
  UserRepositoryLive
)

// Or compose with explicit dependencies
const RepositoryWithDeps = UserRepositoryLive.pipe(
  Layer.provide(DatabaseLive),
  Layer.provide(LoggerLive),
  Layer.provide(ConfigLive)
)
```

## Real-World Examples

### Example 1: HTTP API with Database

Building a REST API with proper separation of concerns:

```typescript
import { Effect, Layer, Context, pipe } from "effect"
import * as Http from "@effect/platform/HttpServer"

// Domain models
interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

interface CreateUserRequest {
  email: string
  name: string
}

// Service definitions
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly create: (data: CreateUserRequest) => Effect.Effect<User, Error>
    readonly findById: (id: string) => Effect.Effect<User, Error>
    readonly findByEmail: (email: string) => Effect.Effect<User | null, Error>
    readonly list: (limit: number, offset: number) => Effect.Effect<User[], Error>
  }
>() {}

class PasswordHasher extends Context.Tag("PasswordHasher")<
  PasswordHasher,
  {
    readonly hash: (password: string) => Effect.Effect<string, Error>
    readonly verify: (password: string, hash: string) => Effect.Effect<boolean, Error>
  }
>() {}

class EmailValidator extends Context.Tag("EmailValidator")<
  EmailValidator,
  {
    readonly validate: (email: string) => Effect.Effect<void, ValidationError>
  }
>() {}

// Layer implementations
const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database
    const logger = yield* Logger
    
    return {
      create: (data) =>
        Effect.gen(function* () {
          const id = yield* Effect.sync(() => generateId())
          const now = yield* Effect.sync(() => new Date())
          const user = yield* db.execute<User>(
            `INSERT INTO users (id, email, name, created_at) 
             VALUES (?, ?, ?, ?) 
             RETURNING *`,
            [id, data.email, data.name, now]
          )
          yield* logger.info(`User created: ${user.id}`)
          return user
        }),
        
      findById: (id) =>
        db.execute<User>(
          `SELECT * FROM users WHERE id = ?`,
          [id]
        ),
        
      findByEmail: (email) =>
        db.execute<User | null>(
          `SELECT * FROM users WHERE email = ? LIMIT 1`,
          [email]
        ).pipe(
          Effect.map((result) => result || null)
        ),
        
      list: (limit, offset) =>
        db.execute<User[]>(
          `SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [limit, offset]
        )
    }
  })
)

const PasswordHasherLive = Layer.succeed(
  PasswordHasher,
  {
    hash: (password) =>
      Effect.tryPromise({
        try: () => bcrypt.hash(password, 10),
        catch: () => new Error("Failed to hash password")
      }),
      
    verify: (password, hash) =>
      Effect.tryPromise({
        try: () => bcrypt.compare(password, hash),
        catch: () => new Error("Failed to verify password")
      })
  }
)

// HTTP routes using services
const userRoutes = Http.router.empty.pipe(
  Http.router.post(
    "/users",
    Effect.gen(function* () {
      const body = yield* Http.request.bodyJson
      const validator = yield* EmailValidator
      const repository = yield* UserRepository
      
      // Validate email
      yield* validator.validate(body.email)
      
      // Check if user exists
      const existing = yield* repository.findByEmail(body.email)
      if (existing) {
        return yield* Http.response.badRequest("User already exists")
      }
      
      // Create user
      const user = yield* repository.create(body)
      return yield* Http.response.json(user, { status: 201 })
    })
  ),
  
  Http.router.get(
    "/users/:id",
    Effect.gen(function* () {
      const params = yield* Http.router.params
      const repository = yield* UserRepository
      
      const user = yield* repository.findById(params.id)
      return yield* Http.response.json(user)
    })
  )
)

// Complete application layer
const HttpApiLive = Layer.mergeAll(
  ConfigLive,
  LoggerLive,
  DatabaseLive,
  UserRepositoryLive,
  PasswordHasherLive,
  EmailValidatorLive,
  Layer.provide(
    Http.server.serve(userRoutes),
    Http.server.layer({ port: 3000 })
  )
)
```

### Example 2: Multi-tenant SaaS Application

Managing tenant-specific resources and isolation:

```typescript
// Tenant context
class TenantContext extends Context.Tag("TenantContext")<
  TenantContext,
  {
    readonly tenantId: string
    readonly plan: "free" | "pro" | "enterprise"
  }
>() {}

// Tenant-aware database service
class TenantDatabase extends Context.Tag("TenantDatabase")<
  TenantDatabase,
  {
    readonly query: <T>(sql: string, params?: any[]) => Effect.Effect<T, Error>
    readonly withTransaction: <A>(
      effect: Effect.Effect<A, Error>
    ) => Effect.Effect<A, Error>
  }
>() {}

// Rate limiter service
class RateLimiter extends Context.Tag("RateLimiter")<
  RateLimiter,
  {
    readonly check: (key: string, limit: number) => Effect.Effect<void, RateLimitError>
    readonly consume: (key: string) => Effect.Effect<void>
  }
>() {}

// Tenant database layer with connection pooling
const TenantDatabaseLive = Layer.effect(
  TenantDatabase,
  Effect.gen(function* () {
    const config = yield* Config
    const tenant = yield* TenantContext
    const logger = yield* Logger
    
    // Get tenant-specific connection pool
    const pool = yield* Effect.acquireRelease(
      Effect.try(() => 
        createPool({
          ...config.database,
          database: `tenant_${tenant.tenantId}`
        })
      ),
      (pool) => Effect.try(() => pool.end())
    )
    
    return {
      query: <T>(sql: string, params?: any[]) =>
        Effect.gen(function* () {
          yield* logger.info(`[Tenant ${tenant.tenantId}] Executing query`)
          const connection = yield* Effect.try(() => pool.getConnection())
          
          return yield* Effect.acquireUseRelease(
            Effect.succeed(connection),
            () => Effect.try(() => connection.query<T>(sql, params)),
            () => Effect.try(() => connection.release())
          )
        }),
        
      withTransaction: <A>(effect: Effect.Effect<A, Error>) =>
        Effect.gen(function* () {
          const connection = yield* Effect.try(() => pool.getConnection())
          
          return yield* Effect.acquireUseRelease(
            Effect.try(() => connection.beginTransaction()),
            () => effect,
            (_, exit) =>
              exit._tag === "Success"
                ? Effect.try(() => connection.commit())
                : Effect.try(() => connection.rollback())
          ).pipe(
            Effect.ensuring(Effect.try(() => connection.release()))
          )
        })
    }
  })
).pipe(Layer.scoped)

// Rate limiter with tenant-aware limits
const RateLimiterLive = Layer.effect(
  RateLimiter,
  Effect.gen(function* () {
    const redis = yield* RedisClient
    const tenant = yield* TenantContext
    
    // Different limits per plan
    const limits = {
      free: { requests: 100, window: 3600 },
      pro: { requests: 1000, window: 3600 },
      enterprise: { requests: 10000, window: 3600 }
    }
    
    const planLimits = limits[tenant.plan]
    
    return {
      check: (key, limit) =>
        Effect.gen(function* () {
          const count = yield* redis.incr(`rate:${tenant.tenantId}:${key}`)
          
          if (count === 1) {
            yield* redis.expire(`rate:${tenant.tenantId}:${key}`, planLimits.window)
          }
          
          if (count > (limit || planLimits.requests)) {
            return yield* Effect.fail(new RateLimitError("Rate limit exceeded"))
          }
        }),
        
      consume: (key) =>
        Effect.gen(function* () {
          yield* redis.incr(`rate:${tenant.tenantId}:${key}`)
        })
    }
  })
)

// Tenant-aware API endpoint
const tenantApiHandler = Effect.gen(function* () {
  const rateLimiter = yield* RateLimiter
  const db = yield* TenantDatabase
  
  // Check rate limit
  yield* rateLimiter.check("api_calls", 100)
  
  // Query tenant-specific data
  const data = yield* db.query("SELECT * FROM products WHERE active = true")
  
  return { data }
})

// Create tenant-specific layer
const createTenantLayer = (tenantId: string, plan: "free" | "pro" | "enterprise") =>
  Layer.merge(
    Layer.succeed(TenantContext, { tenantId, plan }),
    TenantDatabaseLive
  ).pipe(
    Layer.provide(RateLimiterLive),
    Layer.provide(RedisClientLive),
    Layer.provide(ConfigLive)
  )
```

### Example 3: Microservice with External Integrations

Building a payment processing service with multiple providers:

```typescript
// Payment provider interface
class PaymentProvider extends Context.Tag("PaymentProvider")<
  PaymentProvider,
  {
    readonly charge: (
      amount: number,
      currency: string,
      source: string
    ) => Effect.Effect<PaymentResult, PaymentError>
    
    readonly refund: (
      chargeId: string,
      amount?: number
    ) => Effect.Effect<RefundResult, PaymentError>
    
    readonly getBalance: () => Effect.Effect<Balance, Error>
  }
>() {}

// Notification service
class NotificationService extends Context.Tag("NotificationService")<
  NotificationService,
  {
    readonly sendEmail: (to: string, template: string, data: any) => 
      Effect.Effect<void, Error>
    readonly sendSMS: (to: string, message: string) => 
      Effect.Effect<void, Error>
    readonly sendWebhook: (url: string, data: any) => 
      Effect.Effect<void, Error>
  }
>() {}

// Audit log service
class AuditLog extends Context.Tag("AuditLog")<
  AuditLog,
  {
    readonly log: (event: AuditEvent) => Effect.Effect<void, Error>
  }
>() {}

// Stripe payment provider implementation
const StripeProviderLive = Layer.effect(
  PaymentProvider,
  Effect.gen(function* () {
    const config = yield* Config
    const logger = yield* Logger
    const metrics = yield* Metrics
    
    const stripe = new Stripe(config.stripe.secretKey)
    
    return {
      charge: (amount, currency, source) =>
        Effect.tryPromise({
          try: () => 
            stripe.charges.create({
              amount: Math.round(amount * 100), // Convert to cents
              currency,
              source
            }),
          catch: (error) => new PaymentError("Charge failed", error)
        }).pipe(
          Effect.tap(() => metrics.increment("payments.charges.total")),
          Effect.tapError(() => metrics.increment("payments.charges.failed")),
          Effect.map((charge) => ({
            id: charge.id,
            amount: charge.amount / 100,
            currency: charge.currency,
            status: charge.status
          }))
        ),
        
      refund: (chargeId, amount) =>
        Effect.tryPromise({
          try: () =>
            stripe.refunds.create({
              charge: chargeId,
              amount: amount ? Math.round(amount * 100) : undefined
            }),
          catch: (error) => new PaymentError("Refund failed", error)
        }).pipe(
          Effect.map((refund) => ({
            id: refund.id,
            amount: refund.amount / 100,
            status: refund.status
          }))
        ),
        
      getBalance: () =>
        Effect.tryPromise({
          try: () => stripe.balance.retrieve(),
          catch: (error) => new Error("Failed to get balance")
        }).pipe(
          Effect.map((balance) => ({
            available: balance.available.map(b => ({
              amount: b.amount / 100,
              currency: b.currency
            })),
            pending: balance.pending.map(b => ({
              amount: b.amount / 100,
              currency: b.currency
            }))
          }))
        )
    }
  })
)

// Payment processing service with retries and fallbacks
class PaymentService extends Context.Tag("PaymentService")<
  PaymentService,
  {
    readonly processPayment: (
      order: Order
    ) => Effect.Effect<PaymentResult, PaymentError>
  }
>() {}

const PaymentServiceLive = Layer.effect(
  PaymentService,
  Effect.gen(function* () {
    const provider = yield* PaymentProvider
    const notifications = yield* NotificationService
    const auditLog = yield* AuditLog
    const db = yield* Database
    
    return {
      processPayment: (order) =>
        auditLog.log({
          type: "payment.attempt",
          orderId: order.id,
          amount: order.total,
          timestamp: new Date()
        }).pipe(
          // Process payment with retries
          Effect.flatMap(() =>
            provider.charge(order.total, order.currency, order.paymentSource).pipe(
              Effect.retry({
                times: 3,
                delay: "exponential",
                factor: 2,
                base: "1 second"
              })
            )
          ),
          
          // Save payment record
          Effect.tap((result) =>
            db.execute(
              `INSERT INTO payments (order_id, charge_id, amount, status) 
               VALUES (?, ?, ?, ?)`,
              [order.id, result.id, result.amount, result.status]
            )
          ),
          
          // Send notifications
          Effect.tap((result) =>
            Effect.all([
              notifications.sendEmail(
                order.customerEmail,
                "payment_success",
                { order, payment: result }
              ),
              notifications.sendWebhook(
                order.webhookUrl,
                { event: "payment.success", order, payment: result }
              )
            ], { concurrency: "unbounded" })
          ),
          
          // Log success
          Effect.tap((result) =>
            auditLog.log({
              type: "payment.success",
              orderId: order.id,
              chargeId: result.id,
              timestamp: new Date()
            })
          ),
          
          // Handle failures
          Effect.tapError((error) =>
            Effect.all([
              auditLog.log({
                type: "payment.failed",
                orderId: order.id,
                error: error.message,
                timestamp: new Date()
              }),
              notifications.sendEmail(
                order.customerEmail,
                "payment_failed",
                { order, error: error.message }
              )
            ])
          )
        )
    }
  })
)

// Compose payment processing system
const PaymentSystemLive = Layer.mergeAll(
  ConfigLive,
  LoggerLive,
  MetricsLive,
  DatabaseLive,
  StripeProviderLive,
  NotificationServiceLive,
  AuditLogLive,
  PaymentServiceLive
)
```

## Advanced Features Deep Dive

### Layer Scoping and Resource Management

Effect's Layer system provides powerful resource management through scoped layers:

```typescript
// Connection pool with automatic cleanup
const ConnectionPoolLive = Layer.scoped(
  ConnectionPool,
  Effect.gen(function* () {
    const config = yield* Config
    const logger = yield* Logger
    
    // Acquire resource
    const pool = yield* Effect.acquireRelease(
      Effect.gen(function* () {
        yield* logger.info("Creating connection pool")
        return yield* Effect.try(() =>
          createPool({
            host: config.database.host,
            port: config.database.port,
            max: 20,
            idleTimeoutMillis: 30000
          })
        )
      }),
      // Release function - automatically called on shutdown
      (pool) =>
        Effect.gen(function* () {
          yield* logger.info("Closing connection pool")
          yield* Effect.try(() => pool.end())
        })
    )
    
    return {
      getConnection: () =>
        Effect.acquireUseRelease(
          Effect.try(() => pool.connect()),
          (client) => Effect.succeed(client),
          (client) => Effect.try(() => client.release())
        )
    }
  })
)

// File watcher with cleanup
const FileWatcherLive = Layer.scoped(
  FileWatcher,
  Effect.gen(function* () {
    const logger = yield* Logger
    
    const watcher = yield* Effect.acquireRelease(
      Effect.try(() => {
        const watcher = chokidar.watch("./src", {
          persistent: true,
          ignoreInitial: true
        })
        return watcher
      }),
      (watcher) =>
        Effect.try(() => {
          logger.info("Stopping file watcher")
          return watcher.close()
        })
    )
    
    return {
      onChange: (callback: (path: string) => void) => {
        watcher.on("change", callback)
        return Effect.void
      }
    }
  })
)
```

### Layer Retry and Circuit Breaking

Building resilient services with retry logic and circuit breakers:

```typescript
// Circuit breaker service
class CircuitBreaker extends Context.Tag("CircuitBreaker")<
  CircuitBreaker,
  {
    readonly protect: <A, E>(
      key: string,
      effect: Effect.Effect<A, E>
    ) => Effect.Effect<A, E | CircuitOpenError>
  }
>() {}

const CircuitBreakerLive = Layer.effect(
  CircuitBreaker,
  Effect.gen(function* () {
    const states = new Map<string, CircuitState>()
    
    return {
      protect: <A, E>(key: string, effect: Effect.Effect<A, E>) => {
        const state = states.get(key) || {
          failures: 0,
          lastFailure: null,
          status: "closed"
        }
        
        if (state.status === "open") {
          const now = Date.now()
          const timeSinceLastFailure = now - (state.lastFailure || 0)
          
          if (timeSinceLastFailure < 60000) { // 1 minute timeout
            return Effect.fail(new CircuitOpenError(key))
          }
          
          // Try half-open
          state.status = "half-open"
        }
        
        return effect.pipe(
          Effect.tapError(() =>
            Effect.sync(() => {
              state.failures++
              state.lastFailure = Date.now()
              
              if (state.failures >= 5) {
                state.status = "open"
              }
              
              states.set(key, state)
            })
          ),
          Effect.tap(() =>
            Effect.sync(() => {
              if (state.status === "half-open") {
                state.status = "closed"
                state.failures = 0
                states.set(key, state)
              }
            })
          )
        )
      }
    }
  })
)

// External API client with circuit breaker
const ResilientApiClientLive = Layer.effect(
  ApiClient,
  Effect.gen(function* () {
    const http = yield* HttpClient
    const circuitBreaker = yield* CircuitBreaker
    const logger = yield* Logger
    
    const makeRequest = <T>(
      method: string,
      path: string,
      options?: RequestOptions
    ) =>
      http.request(method, path, options).pipe(
        Effect.retry({
          times: 3,
          delay: Schedule.exponential("100 millis", 2)
        }),
        Effect.tapError((error) =>
          logger.error(`API request failed: ${error.message}`)
        )
      )
    
    return {
      get: <T>(path: string) =>
        circuitBreaker.protect(
          `api:${path}`,
          makeRequest<T>("GET", path)
        ),
        
      post: <T>(path: string, data: any) =>
        circuitBreaker.protect(
          `api:${path}`,
          makeRequest<T>("POST", path, { body: data })
        )
    }
  })
)
```

### Dynamic Layer Composition

Creating layers dynamically based on configuration:

```typescript
// Provider registry
type ProviderType = "stripe" | "paypal" | "square"

const createPaymentProviderLayer = (type: ProviderType) => {
  switch (type) {
    case "stripe":
      return StripeProviderLive
    case "paypal":
      return PayPalProviderLive
    case "square":
      return SquareProviderLive
  }
}

// Feature flags service
class FeatureFlags extends Context.Tag("FeatureFlags")<
  FeatureFlags,
  {
    readonly isEnabled: (feature: string) => Effect.Effect<boolean>
    readonly getConfig: <T>(feature: string) => Effect.Effect<T>
  }
>() {}

// Dynamic service composition based on features
const createApplicationLayer = Effect.gen(function* () {
  const config = yield* Config
  const features = yield* FeatureFlags
  
  // Base layers always included
  let layers = Layer.mergeAll(
    ConfigLive,
    LoggerLive,
    DatabaseLive
  )
  
  // Add payment provider based on config
  const paymentProvider = createPaymentProviderLayer(config.paymentProvider)
  layers = Layer.merge(layers, paymentProvider)
  
  // Conditionally add services based on feature flags
  const cacheEnabled = yield* features.isEnabled("distributed-cache")
  if (cacheEnabled) {
    layers = Layer.merge(layers, RedisLive)
    layers = Layer.merge(layers, CacheServiceLive)
  }
  
  const analyticsEnabled = yield* features.isEnabled("analytics")
  if (analyticsEnabled) {
    layers = Layer.merge(layers, AnalyticsServiceLive)
  }
  
  return layers
})
```

## Practical Patterns & Best Practices

### Pattern 1: Service Factory Pattern

Create reusable service factories for common patterns:

```typescript
// Generic repository factory
const createRepositoryLayer = <T extends { id: string }>(
  tableName: string,
  tagName: string
) => {
  class Repository extends Context.Tag(tagName)<
    Repository,
    {
      readonly create: (data: Omit<T, "id">) => Effect.Effect<T, Error>
      readonly findById: (id: string) => Effect.Effect<T | null, Error>
      readonly update: (id: string, data: Partial<T>) => Effect.Effect<T, Error>
      readonly delete: (id: string) => Effect.Effect<void, Error>
      readonly findMany: (
        filter?: Partial<T>,
        options?: { limit?: number; offset?: number }
      ) => Effect.Effect<T[], Error>
    }
  >() {}
  
  const RepositoryLive = Layer.effect(
    Repository,
    Effect.gen(function* () {
      const db = yield* Database
      const logger = yield* Logger
      
      return {
        create: (data) =>
          Effect.gen(function* () {
            const id = generateId()
            const record = { ...data, id } as T
            
            yield* logger.info(`Creating ${tableName} record: ${id}`)
            yield* db.execute(
              `INSERT INTO ${tableName} (${Object.keys(record).join(", ")}) 
               VALUES (${Object.keys(record).map(() => "?").join(", ")})`,
              Object.values(record)
            )
            
            return record
          }),
          
        findById: (id) =>
          db.execute<T | null>(
            `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
            [id]
          ),
          
        update: (id, data) =>
          Effect.gen(function* () {
            const sets = Object.keys(data).map(k => `${k} = ?`).join(", ")
            yield* db.execute(
              `UPDATE ${tableName} SET ${sets} WHERE id = ?`,
              [...Object.values(data), id]
            )
            return yield* this.findById(id)
          }),
          
        delete: (id) =>
          db.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]),
          
        findMany: (filter = {}, options = {}) => {
          const where = Object.keys(filter).length > 0
            ? `WHERE ${Object.keys(filter).map(k => `${k} = ?`).join(" AND ")}`
            : ""
          const limit = options.limit ? `LIMIT ${options.limit}` : ""
          const offset = options.offset ? `OFFSET ${options.offset}` : ""
          
          return db.execute<T[]>(
            `SELECT * FROM ${tableName} ${where} ${limit} ${offset}`,
            Object.values(filter)
          )
        }
      }
    })
  )
  
  return { Repository, RepositoryLive }
}

// Usage
const { Repository: UserRepository, RepositoryLive: UserRepositoryLive } = 
  createRepositoryLayer<User>("users", "UserRepository")

const { Repository: ProductRepository, RepositoryLive: ProductRepositoryLive } = 
  createRepositoryLayer<Product>("products", "ProductRepository")
```

### Pattern 2: Middleware Layer Pattern

Create composable middleware layers for cross-cutting concerns:

```typescript
// Authentication middleware
const createAuthMiddleware = <R, E, A>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E | AuthError, R | AuthService> =>
  Effect.gen(function* () {
    const auth = yield* AuthService
    const token = yield* HttpRequest.header("authorization")
    
    if (!token) {
      return yield* Effect.fail(new AuthError("No token provided"))
    }
    
    const user = yield* auth.verifyToken(token)
    return yield* Effect.provideService(effect, CurrentUser, user)
  })

// Logging middleware
const createLoggingMiddleware = <R, E, A>(
  operation: string,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | Logger> =>
  Effect.gen(function* () {
    const logger = yield* Logger
    const startTime = Date.now()
    
    yield* logger.info(`Starting ${operation}`)
    
    return yield* effect.pipe(
      Effect.tap(() => {
        const duration = Date.now() - startTime
        return logger.info(`Completed ${operation} in ${duration}ms`)
      }),
      Effect.tapError((error) =>
        logger.error(`Failed ${operation}: ${error}`)
      )
    )
  })

// Compose middlewares
const protectedEndpoint = <A>(
  operation: string,
  handler: Effect.Effect<A, Error, AuthService | Logger>
) =>
  createLoggingMiddleware(operation, handler).pipe(
    createAuthMiddleware
  )
```

### Pattern 3: Health Check Pattern

Implement health checks for all services:

```typescript
// Health check service
class HealthCheck extends Context.Tag("HealthCheck")<
  HealthCheck,
  {
    readonly check: () => Effect.Effect<HealthStatus, never>
  }
>() {}

interface HealthStatus {
  status: "healthy" | "unhealthy"
  services: Record<string, {
    status: "up" | "down"
    latency?: number
    error?: string
  }>
}

// Create health check layer factory
const createHealthCheckLayer = (
  services: Array<{
    name: string
    check: Effect.Effect<void, Error>
  }>
) =>
  Layer.effect(
    HealthCheck,
    Effect.succeed({
      check: () =>
        Effect.gen(function* () {
          const results = yield* Effect.all(
            services.map(({ name, check }) =>
              Effect.timed(check).pipe(
                Effect.map(([duration]) => ({
                  name,
                  status: "up" as const,
                  latency: Number(duration) / 1_000_000 // Convert to ms
                })),
                Effect.catchAll((error) =>
                  Effect.succeed({
                    name,
                    status: "down" as const,
                    error: error.message
                  })
                )
              )
            ),
            { concurrency: "unbounded" }
          )
          
          const serviceStatus = results.reduce(
            (acc, result) => ({
              ...acc,
              [result.name]: result
            }),
            {} as Record<string, any>
          )
          
          const overallStatus = results.every(r => r.status === "up")
            ? "healthy"
            : "unhealthy"
          
          return {
            status: overallStatus,
            services: serviceStatus
          }
        })
    })
  )

// Application health checks
const HealthCheckLive = createHealthCheckLayer([
  {
    name: "database",
    check: Effect.gen(function* () {
      const db = yield* Database
      yield* db.execute("SELECT 1")
    })
  },
  {
    name: "redis",
    check: Effect.gen(function* () {
      const redis = yield* RedisClient
      yield* redis.ping()
    })
  },
  {
    name: "payment-provider",
    check: Effect.gen(function* () {
      const provider = yield* PaymentProvider
      yield* provider.getBalance()
    })
  }
])
```

## Integration Examples

### Integration with Express.js

```typescript
import express from "express"
import { Effect, Layer, Runtime } from "effect"

// Create Express middleware from Effect layers
const createEffectMiddleware = <R>(runtime: Runtime.Runtime<R>) =>
  <E, A>(
    effect: Effect.Effect<A, E, R>
  ): express.RequestHandler =>
  async (req, res, next) => {
    const result = await Runtime.runPromiseExit(runtime)(
      effect.pipe(
        Effect.provideService(HttpRequest, {
          headers: req.headers,
          body: req.body,
          params: req.params,
          query: req.query
        })
      )
    )
    
    if (result._tag === "Success") {
      res.json(result.value)
    } else {
      const error = Cause.failureOption(result.cause)
      if (error._tag === "Some") {
        res.status(500).json({ error: error.value })
      } else {
        res.status(500).json({ error: "Internal server error" })
      }
    }
  }

// Setup Express app with Effect
const setupApp = Effect.gen(function* () {
  const logger = yield* Logger
  
  // Create runtime with all services
  const runtime = yield* Effect.runtime<
    Logger | Database | UserRepository | AuthService
  >()
  
  const app = express()
  const effectMiddleware = createEffectMiddleware(runtime)
  
  // Routes using Effect
  app.get("/users/:id", effectMiddleware(
    Effect.gen(function* () {
      const { id } = yield* HttpRequest
      const repo = yield* UserRepository
      const user = yield* repo.findById(id)
      
      if (!user) {
        return yield* Effect.fail({ status: 404, message: "User not found" })
      }
      
      return user
    })
  ))
  
  app.post("/users", effectMiddleware(
    Effect.gen(function* () {
      const body = yield* HttpRequest.map(r => r.body)
      const repo = yield* UserRepository
      const user = yield* repo.create(body)
      return user
    })
  ))
  
  return app
})

// Run the application
const program = Effect.gen(function* () {
  const app = yield* setupApp
  const server = yield* Effect.acquireRelease(
    Effect.sync(() => app.listen(3000)),
    (server) => Effect.sync(() => server.close())
  )
  
  yield* Logger.info("Server started on port 3000")
  yield* Effect.never // Keep running
})

const AppLive = Layer.mergeAll(
  ConfigLive,
  LoggerLive,
  DatabaseLive,
  UserRepositoryLive,
  AuthServiceLive
)

Effect.runPromise(Effect.provide(program, AppLive))
```

### Testing Strategies

```typescript
import { describe, it, expect } from "bun:test"
import { Effect, Layer, TestContext } from "effect"

// Test utilities
const createTestLayer = <Services extends Record<string, any>>(
  mocks: Services
) => {
  const layers = Object.entries(mocks).map(([key, implementation]) => {
    const tag = Context.Tag(key)
    return Layer.succeed(tag, implementation)
  })
  
  return Layer.mergeAll(...layers)
}

// Testing a service with dependencies
describe("UserService", () => {
  // Create test doubles
  const TestDatabase = Layer.succeed(Database, {
    execute: (query: string) => {
      if (query.includes("INSERT")) {
        return Effect.succeed({ id: "test-id" })
      }
      if (query.includes("SELECT")) {
        return Effect.succeed({
          id: "test-id",
          email: "test@example.com",
          name: "Test User"
        })
      }
      return Effect.fail(new Error("Unknown query"))
    },
    transaction: (effect) => effect
  })
  
  const TestLogger = Layer.succeed(Logger, {
    info: () => Effect.void,
    error: () => Effect.void,
    warn: () => Effect.void
  })
  
  const TestEmailService = Layer.succeed(EmailService, {
    send: () => Effect.succeed({ messageId: "test-message" })
  })
  
  // Compose test layers
  const TestLayers = Layer.mergeAll(
    TestDatabase,
    TestLogger,
    TestEmailService,
    UserRepositoryLive,
    UserServiceLive
  )
  
  it("should create a user and send welcome email", async () => {
    const program = Effect.gen(function* () {
      const service = yield* UserService
      const result = yield* service.createUser({
        email: "new@example.com",
        name: "New User"
      })
      
      return result
    })
    
    const result = await Effect.runPromise(
      Effect.provide(program, TestLayers)
    )
    
    expect(result).toEqual({
      id: "test-id",
      email: "new@example.com",
      name: "New User",
      welcomeEmailSent: true
    })
  })
  
  it("should handle database errors", async () => {
    const ErrorDatabase = Layer.succeed(Database, {
      execute: () => Effect.fail(new Error("Database connection failed")),
      transaction: () => Effect.fail(new Error("Database connection failed"))
    })
    
    const ErrorTestLayers = Layer.merge(
      Layer.mergeAll(TestLogger, TestEmailService, UserRepositoryLive, UserServiceLive),
      ErrorDatabase
    )
    
    const program = Effect.gen(function* () {
      const service = yield* UserService
      return yield* service.createUser({
        email: "test@example.com",
        name: "Test"
      })
    })
    
    const result = await Effect.runPromiseExit(
      Effect.provide(program, ErrorTestLayers)
    )
    
    expect(result._tag).toBe("Failure")
  })
})

// Property-based testing with fast-check
import * as fc from "fast-check"

describe("Repository Laws", () => {
  const testRepositoryLaws = <T>(
    repository: any,
    generator: fc.Arbitrary<T>
  ) => {
    it("should retrieve what was created", async () =>
      fc.assert(
        fc.asyncProperty(generator, async (data) => {
          const program = Effect.gen(function* () {
            const created = yield* repository.create(data)
            const retrieved = yield* repository.findById(created.id)
            return { created, retrieved }
          })
          
          const result = await Effect.runPromise(
            Effect.provide(program, TestLayers)
          )
          
          expect(result.retrieved).toEqual(result.created)
        })
      )
    )
    
    it("should return null for non-existent ids", async () => {
      const program = Effect.gen(function* () {
        return yield* repository.findById("non-existent-id")
      })
      
      const result = await Effect.runPromise(
        Effect.provide(program, TestLayers)
      )
      
      expect(result).toBeNull()
    })
  }
  
  // Test specific repository
  testRepositoryLaws(
    UserRepository,
    fc.record({
      email: fc.emailAddress(),
      name: fc.string({ minLength: 1, maxLength: 100 })
    })
  )
})
```

## Conclusion

Layer provides a powerful, type-safe approach to dependency injection that solves real-world problems in building modular applications. By using Layer, you gain:

Key benefits:
- **Type-safe dependency graphs**: The compiler ensures all dependencies are satisfied
- **Automatic resource management**: Resources are acquired and released properly
- **Testability**: Easy to create test doubles and compose test scenarios
- **Modularity**: Services can be developed and tested independently
- **Composability**: Layers combine naturally to build complex systems

Layer is ideal for applications that need proper separation of concerns, testable architectures, and robust resource management. Whether building microservices, web applications, or complex systems with multiple integrations, Layer provides the foundation for maintainable, scalable code.