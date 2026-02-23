# ManagedRuntime: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem ManagedRuntime Solves

Managing application lifecycle, service initialization, and resource cleanup is one of the most challenging aspects of building robust applications. Traditional approaches often result in scattered initialization code, memory leaks, and difficult-to-test applications:

```typescript
// Traditional approach - scattered initialization and cleanup
class DatabaseService {
  private pool: ConnectionPool;
  private isInitialized = false;
  
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.pool = await createConnectionPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        ssl: process.env.NODE_ENV === 'production'
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  
  async cleanup() {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
    }
  }
  
  async query(sql: string) {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.pool.query(sql);
  }
}

class Logger {
  private transports: any[] = [];
  
  initialize() {
    this.transports.push(
      new ConsoleTransport({ level: process.env.LOG_LEVEL || 'info' }),
      new FileTransport({ filename: 'app.log' })
    );
  }
  
  cleanup() {
    this.transports.forEach(transport => transport.close?.());
    this.transports = [];
  }
  
  info(message: string) {
    this.transports.forEach(transport => transport.write(message));
  }
}

// Manual application lifecycle management
class Application {
  private services: Array<{ initialize(): Promise<void>; cleanup(): Promise<void> }> = [];
  private isRunning = false;
  
  async start() {
    try {
      // Initialize services in order
      const db = new DatabaseService();
      const logger = new Logger();
      
      await db.initialize();
      logger.initialize();
      
      this.services.push(db, logger);
      this.isRunning = true;
      
      // Handle shutdown
      process.on('SIGINT', this.shutdown.bind(this));
      process.on('SIGTERM', this.shutdown.bind(this));
      
    } catch (error) {
      console.error('Failed to start application:', error);
      await this.shutdown();
      throw error;
    }
  }
  
  async shutdown() {
    if (!this.isRunning) return;
    
    console.log('Shutting down application...');
    
    // Cleanup in reverse order
    for (const service of this.services.reverse()) {
      try {
        await service.cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
    
    this.isRunning = false;
    process.exit(0);
  }
}

// Usage - error-prone and hard to test
const app = new Application();
app.start().catch(console.error);
```

This approach leads to:
- **Manual lifecycle management** - Services must be initialized and cleaned up in the correct order
- **Resource leaks** - Forgotten cleanup code leads to memory and connection leaks  
- **Race conditions** - No guarantees about initialization order or dependency readiness
- **Testing difficulties** - Hard to mock services and test different initialization scenarios
- **Error handling complexity** - Manual error propagation and partial cleanup scenarios
- **Global state issues** - Services often depend on global configuration and singletons

### The ManagedRuntime Solution

Effect's ManagedRuntime provides a controlled execution environment that manages the complete lifecycle of your application services. It combines Layer-based dependency injection with automatic resource management:

```typescript
import { Effect, Layer, ManagedRuntime, Context } from "effect"

// Define service interfaces with automatic cleanup
class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  {
    readonly query: (sql: string) => Effect.Effect<any[], Error>
    readonly close: Effect.Effect<void>  
  }
>() {}

class Logger extends Context.Tag("Logger")<
  Logger,
  {
    readonly info: (message: string) => Effect.Effect<void>
    readonly error: (message: string, error?: any) => Effect.Effect<void>
  }
>() {}

// Create layers with automatic resource management
const DatabaseLive = Layer.scoped(
  DatabaseService,
  Effect.gen(function* () {
    const pool = yield* Effect.acquireRelease(
      Effect.tryPromise(() => createConnectionPool({ /* config */ })),
      (pool) => Effect.promise(() => pool.end())
    )
    
    return {
      query: (sql: string) => Effect.tryPromise(() => pool.query(sql)),
      close: Effect.tryPromise(() => pool.end())
    }
  })
)

const LoggerLive = Layer.scoped(
  Logger,
  Effect.gen(function* () {
    const transports = yield* Effect.acquireRelease(
      Effect.sync(() => [
        new ConsoleTransport(),
        new FileTransport({ filename: 'app.log' })
      ]),
      (transports) => Effect.sync(() => transports.forEach(t => t.close?.()))
    )
    
    return {
      info: (message: string) => Effect.sync(() => 
        transports.forEach(t => t.write(`[INFO] ${message}`))
      ),
      error: (message: string, error?: any) => Effect.sync(() => 
        transports.forEach(t => t.write(`[ERROR] ${message}`, error))
      )
    }
  })
)

// Compose application layer
const ApplicationLayer = Layer.mergeAll(DatabaseLive, LoggerLive)

// Create managed runtime - automatic lifecycle management
const runtime = ManagedRuntime.make(ApplicationLayer)

// Use the runtime - services are guaranteed to be available
const program = Effect.gen(function* () {
  const db = yield* DatabaseService
  const logger = yield* Logger
  
  yield* logger.info("Application started")
  const results = yield* db.query("SELECT * FROM users")
  yield* logger.info(`Found ${results.length} users`)
  
  return results
})

// Automatic cleanup on completion or error
runtime.runPromise(program)
  .then(results => console.log("Success:", results))
  .catch(error => console.error("Error:", error))
  .finally(() => runtime.dispose()) // Automatic resource cleanup
```

### Key Concepts

**ManagedRuntime**: A runtime environment that manages the lifecycle of services defined in layers, providing automatic initialization, dependency injection, and cleanup.

**Controlled Execution**: ManagedRuntime provides a sandbox for running effects with a specific set of services, isolating different parts of your application.

**Resource Management**: Automatic acquisition and release of resources (connections, files, etc.) using Effect's resource management primitives.

**Service Memoization**: Services are initialized once and shared across all effects running in the same runtime, preventing duplicate initialization.

## Basic Usage Patterns

### Pattern 1: Creating a ManagedRuntime

```typescript
import { Effect, Layer, ManagedRuntime, Context } from "effect"

// Define a simple service
class ConfigService extends Context.Tag("ConfigService")<
  ConfigService,
  {
    readonly get: (key: string) => Effect.Effect<string, Error>
    readonly port: number
    readonly dbUrl: string
  }
>() {}

// Create service layer
const ConfigLive = Layer.succeed(ConfigService, {
  get: (key: string) => 
    Effect.fromNullable(process.env[key], () => new Error(`Missing config: ${key}`)),
  port: parseInt(process.env.PORT || '3000'),
  dbUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp'
})

// Create managed runtime
const runtime = ManagedRuntime.make(ConfigLive)

// Use the runtime
const program = Effect.gen(function* () {
  const config = yield* ConfigService
  const apiKey = yield* config.get("API_KEY")
  
  return { port: config.port, apiKey }
})

// Execute and cleanup
runtime.runPromise(program)
  .then(result => console.log("Config loaded:", result))
  .finally(() => runtime.dispose())
```

### Pattern 2: Service Dependencies

```typescript
// Service with dependencies
class HttpClientService extends Context.Tag("HttpClientService")<
  HttpClientService,
  {
    readonly get: (url: string) => Effect.Effect<any, Error>
    readonly post: (url: string, data: any) => Effect.Effect<any, Error>
  }
>() {}

// Layer that depends on ConfigService
const HttpClientLive = Layer.effect(
  HttpClientService,
  Effect.gen(function* () {
    const config = yield* ConfigService
    const baseUrl = yield* config.get("API_BASE_URL")
    
    return {
      get: (url: string) => Effect.tryPromise(() => 
        fetch(`${baseUrl}${url}`).then(r => r.json())
      ),
      post: (url: string, data: any) => Effect.tryPromise(() =>
        fetch(`${baseUrl}${url}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json())
      )
    }
  })
)

// Compose layers - dependencies resolved automatically
const AppLayer = Layer.mergeAll(ConfigLive, HttpClientLive)
const runtime = ManagedRuntime.make(AppLayer)
```

### Pattern 3: Resource Management with Cleanup

```typescript
// Service with resource cleanup
class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  {
    readonly query: <T>(sql: string, params?: any[]) => Effect.Effect<T[], Error>
    readonly transaction: <T>(
      fn: (tx: any) => Effect.Effect<T, Error>
    ) => Effect.Effect<T, Error>
  }
>() {}

const DatabaseLive = Layer.scoped(
  DatabaseService,
  Effect.gen(function* () {
    const config = yield* ConfigService
    
    // Acquire connection pool with automatic cleanup
    const pool = yield* Effect.acquireRelease(
      Effect.tryPromise(() => createPool({
        connectionString: config.dbUrl,
        max: 20,
        idleTimeoutMillis: 30000
      })),
      (pool) => Effect.tryPromise(() => pool.end())
    )
    
    return {
      query: <T>(sql: string, params?: any[]) =>
        Effect.tryPromise(() => pool.query(sql, params).then(r => r.rows)),
        
      transaction: <T>(fn: (tx: any) => Effect.Effect<T, Error>) =>
        Effect.gen(function* () {
          const client = yield* Effect.acquireRelease(
            Effect.tryPromise(() => pool.connect()),
            (client) => Effect.sync(() => client.release())
          )
          
          yield* Effect.tryPromise(() => client.query('BEGIN'))
          
          const result = yield* fn(client).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                yield* Effect.tryPromise(() => client.query('ROLLBACK'))
                return yield* Effect.fail(error)
              })
            )
          )
          
          yield* Effect.tryPromise(() => client.query('COMMIT'))
          return result
        })
    }
  })
)
```

## Real-World Examples

### Example 1: Web Application with Database and Authentication

```typescript
import { Effect, Layer, ManagedRuntime, Context } from "effect"

// Authentication service
class AuthService extends Context.Tag("AuthService")<
  AuthService,
  {
    readonly validateToken: (token: string) => Effect.Effect<{ id: string; email: string }, Error>
    readonly generateToken: (user: { id: string; email: string }) => Effect.Effect<string>
  }
>() {}

// User service
class UserService extends Context.Tag("UserService")<
  UserService,
  {
    readonly findById: (id: string) => Effect.Effect<User | null, Error>
    readonly create: (userData: CreateUserData) => Effect.Effect<User, Error>
    readonly update: (id: string, updates: Partial<User>) => Effect.Effect<User, Error>
  }
>() {}

interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

interface CreateUserData {
  email: string
  name: string
  password: string
}

// Implementation layers
const AuthLive = Layer.effect(
  AuthService,
  Effect.gen(function* () {
    const config = yield* ConfigService
    const jwtSecret = yield* config.get("JWT_SECRET")
    
    return {
      validateToken: (token: string) =>
        Effect.tryPromise(() => jwt.verify(token, jwtSecret) as any),
        
      generateToken: (user: { id: string; email: string }) =>
        Effect.sync(() => jwt.sign(user, jwtSecret, { expiresIn: '24h' }))
    }
  })
)

const UserLive = Layer.effect(
  UserService,
  Effect.gen(function* () {
    const db = yield* DatabaseService
    
    return {
      findById: (id: string) =>
        db.query<User>("SELECT * FROM users WHERE id = $1", [id]).pipe(
          Effect.map(rows => rows[0] || null)
        ),
        
      create: (userData: CreateUserData) =>
        Effect.gen(function* () {
          const hashedPassword = yield* Effect.tryPromise(() => 
            bcrypt.hash(userData.password, 10)
          )
          
          const [user] = yield* db.query<User>(
            "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [userData.email, userData.name, hashedPassword]
          )
          
          return user
        }),
        
      update: (id: string, updates: Partial<User>) =>
        Effect.gen(function* () {
          const fields = Object.keys(updates)
          const values = Object.values(updates)
          const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ')
          
          const [user] = yield* db.query<User>(
            `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
          )
          
          if (!user) {
            return yield* Effect.fail(new Error("User not found"))
          }
          
          return user
        })
    }
  })
)

// Application layer combining all services
const WebAppLayer = Layer.mergeAll(
  ConfigLive,
  DatabaseLive,
  AuthLive,
  UserLive
)

// Create managed runtime for the web application
const webAppRuntime = ManagedRuntime.make(WebAppLayer)

// API endpoint implementations
const createUserEndpoint = (userData: CreateUserData) =>
  Effect.gen(function* () {
    const userService = yield* UserService
    const authService = yield* AuthService
    
    const user = yield* userService.create(userData)
    const token = yield* authService.generateToken({ id: user.id, email: user.email })
    
    return { user, token }
  })

const getUserEndpoint = (token: string, userId: string) =>
  Effect.gen(function* () {
    const authService = yield* AuthService
    const userService = yield* UserService
    
    const authUser = yield* authService.validateToken(token)
    
    if (authUser.id !== userId) {
      return yield* Effect.fail(new Error("Unauthorized"))
    }
    
    const user = yield* userService.findById(userId)
    
    if (!user) {
      return yield* Effect.fail(new Error("User not found"))
    }
    
    return user
  })

// Application startup and handling
async function startWebApplication() {
  try {
    // Create user
    const newUser = await webAppRuntime.runPromise(
      createUserEndpoint({
        email: "user@example.com",
        name: "John Doe",
        password: "securepassword"
      })
    )
    
    console.log("User created:", newUser)
    
    // Get user with authentication
    const user = await webAppRuntime.runPromise(
      getUserEndpoint(newUser.token, newUser.user.id)
    )
    
    console.log("User retrieved:", user)
    
  } catch (error) {
    console.error("Application error:", error)
  } finally {
    // Cleanup all resources
    await webAppRuntime.dispose()
  }
}
```

### Example 2: Microservice with Message Queue and Caching

```typescript
// Message queue service
class MessageQueueService extends Context.Tag("MessageQueueService")<
  MessageQueueService,
  {
    readonly publish: (topic: string, message: any) => Effect.Effect<void, Error>
    readonly subscribe: <T>(
      topic: string,
      handler: (message: T) => Effect.Effect<void, Error>
    ) => Effect.Effect<void, Error>
  }
>() {}

// Cache service
class CacheService extends Context.Tag("CacheService")<
  CacheService,
  {
    readonly get: <T>(key: string) => Effect.Effect<T | null, Error>
    readonly set: <T>(key: string, value: T, ttlSeconds?: number) => Effect.Effect<void, Error>
    readonly delete: (key: string) => Effect.Effect<void, Error>
  }
>() {}

// Order processing service
class OrderService extends Context.Tag("OrderService")<
  OrderService,
  {
    readonly processOrder: (order: Order) => Effect.Effect<ProcessedOrder, Error>
    readonly getOrderStatus: (orderId: string) => Effect.Effect<OrderStatus, Error>
  }
>() {}

interface Order {
  id: string
  userId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  total: number
}

interface ProcessedOrder extends Order {
  status: 'processed' | 'failed'
  processedAt: Date
  paymentId?: string
}

type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed'

// Service implementations
const MessageQueueLive = Layer.scoped(
  MessageQueueService,
  Effect.gen(function* () {
    const config = yield* ConfigService
    const rabbitUrl = yield* config.get("RABBITMQ_URL")
    
    const connection = yield* Effect.acquireRelease(
      Effect.tryPromise(() => amqp.connect(rabbitUrl)),
      (conn) => Effect.tryPromise(() => conn.close())
    )
    
    const channel = yield* Effect.acquireRelease(
      Effect.tryPromise(() => connection.createChannel()),
      (ch) => Effect.tryPromise(() => ch.close())
    )
    
    return {
      publish: (topic: string, message: any) =>
        Effect.tryPromise(() => 
          channel.publish('orders', topic, Buffer.from(JSON.stringify(message)))
        ),
        
      subscribe: <T>(topic: string, handler: (message: T) => Effect.Effect<void, Error>) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise(() => channel.assertQueue(topic))
          
          yield* Effect.tryPromise(() =>
            channel.consume(topic, async (msg) => {
              if (msg) {
                try {
                  const message = JSON.parse(msg.content.toString())
                  await Effect.runPromise(handler(message))
                  channel.ack(msg)
                } catch (error) {
                  console.error('Message processing error:', error)
                  channel.nack(msg, false, false)
                }
              }
            })
          )
        })
    }
  })
)

const CacheLive = Layer.scoped(
  CacheService,
  Effect.gen(function* () {
    const config = yield* ConfigService
    const redisUrl = yield* config.get("REDIS_URL")
    
    const client = yield* Effect.acquireRelease(
      Effect.tryPromise(() => redis.createClient({ url: redisUrl })),
      (client) => Effect.tryPromise(() => client.quit())
    )
    
    yield* Effect.tryPromise(() => client.connect())
    
    return {
      get: <T>(key: string) =>
        Effect.tryPromise(() => client.get(key)).pipe(
          Effect.map(value => value ? JSON.parse(value) : null)
        ),
        
      set: <T>(key: string, value: T, ttlSeconds = 3600) =>
        Effect.tryPromise(() => 
          client.setEx(key, ttlSeconds, JSON.stringify(value))
        ),
        
      delete: (key: string) =>
        Effect.tryPromise(() => client.del(key)).pipe(Effect.asVoid)
    }
  })
)

const OrderLive = Layer.effect(
  OrderService,
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const cache = yield* CacheService
    const mq = yield* MessageQueueService
    
    return {
      processOrder: (order: Order) =>
        Effect.gen(function* () {
          // Set processing status
          yield* cache.set(`order:${order.id}:status`, 'processing')
          
          // Process payment
          const paymentResult = yield* Effect.tryPromise(() =>
            processPayment({ amount: order.total, userId: order.userId })
          )
          
          // Update order in database
          const processedOrder: ProcessedOrder = {
            ...order,
            status: 'processed',
            processedAt: new Date(),
            paymentId: paymentResult.id
          }
          
          yield* db.query(
            "INSERT INTO processed_orders (id, user_id, items, total, status, processed_at, payment_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [
              processedOrder.id,
              processedOrder.userId,
              JSON.stringify(processedOrder.items),
              processedOrder.total,
              processedOrder.status,
              processedOrder.processedAt,
              processedOrder.paymentId
            ]
          )
          
          // Update cache and publish completion event
          yield* cache.set(`order:${order.id}:status`, 'completed')
          yield* mq.publish('order.completed', processedOrder)
          
          return processedOrder
        }),
        
      getOrderStatus: (orderId: string) =>
        Effect.gen(function* () {
          // Try cache first
          const cachedStatus = yield* cache.get<OrderStatus>(`order:${orderId}:status`)
          
          if (cachedStatus) {
            return cachedStatus
          }
          
          // Fallback to database
          const result = yield* db.query<{ status: OrderStatus }>(
            "SELECT status FROM processed_orders WHERE id = $1",
            [orderId]
          )
          
          const status = result[0]?.status || 'pending'
          yield* cache.set(`order:${orderId}:status`, status, 300) // 5 min cache
          
          return status
        })
    }
  })
)

// Microservice layer
const MicroserviceLayer = Layer.mergeAll(
  ConfigLive,
  DatabaseLive,
  MessageQueueLive,
  CacheLive,
  OrderLive
)

// Create runtime for microservice
const microserviceRuntime = ManagedRuntime.make(MicroserviceLayer)

// Order processing workflow
const orderProcessingWorkflow = (order: Order) =>
  Effect.gen(function* () {
    const orderService = yield* OrderService
    const logger = yield* Logger
    
    yield* logger.info(`Processing order ${order.id}`)
    
    const processedOrder = yield* orderService.processOrder(order).pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* logger.error(`Failed to process order ${order.id}`, error)
          return yield* Effect.fail(error)
        })
      )
    )
    
    yield* logger.info(`Order ${order.id} processed successfully`)
    return processedOrder
  })

// Start microservice with message queue consumer
async function startMicroservice() {
  const mq = await microserviceRuntime.runtime().then(rt => rt.context.get(MessageQueueService))
  
  // Start order processing consumer
  await microserviceRuntime.runPromise(
    mq.subscribe<Order>('order.created', (order) => 
      orderProcessingWorkflow(order)
    )
  )
  
  console.log("Microservice started and listening for orders")
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log("Shutting down microservice...")
    await microserviceRuntime.dispose()
    process.exit(0)
  })
}
```

### Example 3: Multi-Tenant Application with Request Context

```typescript
// Tenant context for multi-tenant applications
class TenantContext extends Context.Tag("TenantContext")<
  TenantContext,
  {
    readonly tenantId: string
    readonly tenantConfig: TenantConfig
  }
>() {}

interface TenantConfig {
  id: string
  name: string
  databaseSchema: string
  features: string[]
  limits: {
    maxUsers: number
    maxRequests: number
  }
}

// Tenant-aware database service
class TenantDatabaseService extends Context.Tag("TenantDatabaseService")<
  TenantDatabaseService,
  {
    readonly query: <T>(sql: string, params?: any[]) => Effect.Effect<T[], Error>
    readonly queryWithSchema: <T>(sql: string, params?: any[]) => Effect.Effect<T[], Error>
  }
>() {}

// Tenant management service
class TenantService extends Context.Tag("TenantService")<
  TenantService,
  {
    readonly getTenantConfig: (tenantId: string) => Effect.Effect<TenantConfig, Error>
    readonly validateTenantAccess: (tenantId: string, feature: string) => Effect.Effect<void, Error>
  }
>() {}

// Implementation layers
const TenantServiceLive = Layer.effect(
  TenantService,
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const cache = yield* CacheService
    
    return {
      getTenantConfig: (tenantId: string) =>
        Effect.gen(function* () {
          // Try cache first
          const cached = yield* cache.get<TenantConfig>(`tenant:${tenantId}:config`)
          
          if (cached) {
            return cached
          }
          
          // Load from database
          const result = yield* db.query<TenantConfig>(
            "SELECT * FROM tenant_configs WHERE id = $1",
            [tenantId]
          )
          
          if (result.length === 0) {
            return yield* Effect.fail(new Error(`Tenant ${tenantId} not found`))
          }
          
          const config = result[0]
          yield* cache.set(`tenant:${tenantId}:config`, config, 1800) // 30 min cache
          
          return config
        }),
        
      validateTenantAccess: (tenantId: string, feature: string) =>
        Effect.gen(function* () {
          const config = yield* getTenantConfig(tenantId)
          
          if (!config.features.includes(feature)) {
            return yield* Effect.fail(new Error(`Feature ${feature} not available for tenant ${tenantId}`))
          }
        })
    }
  })
)

const TenantDatabaseLive = Layer.effect(
  TenantDatabaseService,
  Effect.gen(function* () {
    const db = yield* DatabaseService
    
    return {
      query: <T>(sql: string, params?: any[]) => db.query<T>(sql, params),
      
      queryWithSchema: <T>(sql: string, params?: any[]) =>
        Effect.gen(function* () {
          const tenantCtx = yield* TenantContext
          const schemaName = tenantCtx.tenantConfig.databaseSchema
          
          // Prefix query with schema
          const schemaQuery = sql.replace(/FROM\s+(\w+)/gi, `FROM ${schemaName}.$1`)
          
          return yield* db.query<T>(schemaQuery, params)
        })
    }
  })
)

// Request handler with tenant context
const createTenantRuntime = (tenantId: string) =>
  Effect.gen(function* () {
    const tenantService = yield* TenantService
    const tenantConfig = yield* tenantService.getTenantConfig(tenantId)
    
    const tenantCtx = { tenantId, tenantConfig }
    
    // Create tenant-specific runtime
    const TenantContextLayer = Layer.succeed(TenantContext, tenantCtx)
    const TenantAppLayer = Layer.mergeAll(
      ConfigLive,
      DatabaseLive,
      CacheLive,
      TenantServiceLive,
      TenantDatabaseLive,
      TenantContextLayer
    )
    
    return ManagedRuntime.make(TenantAppLayer)
  })

// Multi-tenant application layer
const MultiTenantAppLayer = Layer.mergeAll(
  ConfigLive,
  DatabaseLive,
  CacheLive,
  TenantServiceLive
)

const baseRuntime = ManagedRuntime.make(MultiTenantAppLayer)

// Tenant-specific business logic
const getTenantUsers = (page: number, limit: number) =>
  Effect.gen(function* () {
    const tenantDb = yield* TenantDatabaseService
    const tenantCtx = yield* TenantContext
    
    // Query tenant-specific users
    const users = yield* tenantDb.queryWithSchema<User>(
      "SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, page * limit]
    )
    
    return {
      users,
      tenantId: tenantCtx.tenantId,
      page,
      limit
    }
  })

const createTenantUser = (userData: CreateUserData) =>
  Effect.gen(function* () {
    const tenantService = yield* TenantService
    const tenantDb = yield* TenantDatabaseService
    const tenantCtx = yield* TenantContext
    
    // Validate tenant limits
    yield* tenantService.validateTenantAccess(tenantCtx.tenantId, 'user_management')
    
    const userCount = yield* tenantDb.queryWithSchema<{ count: number }>(
      "SELECT COUNT(*) as count FROM users"
    ).pipe(Effect.map(result => result[0].count))
    
    if (userCount >= tenantCtx.tenantConfig.limits.maxUsers) {
      return yield* Effect.fail(new Error("User limit reached for tenant"))
    }
    
    // Create user in tenant schema
    const [user] = yield* tenantDb.queryWithSchema<User>(
      "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
      [userData.email, userData.name]
    )
    
    return user
  })

// Request handler
async function handleTenantRequest(tenantId: string, request: any) {
  // Create tenant-specific runtime
  const tenantRuntime = await baseRuntime.runPromise(
    createTenantRuntime(tenantId)
  )
  
  try {
    switch (request.action) {
      case 'getUsers':
        return await tenantRuntime.runPromise(
          getTenantUsers(request.page || 0, request.limit || 20)
        )
        
      case 'createUser':
        return await tenantRuntime.runPromise(
          createTenantUser(request.userData)
        )
        
      default:
        throw new Error(`Unknown action: ${request.action}`)
    }
  } finally {
    // Cleanup tenant runtime
    await tenantRuntime.dispose()
  }
}

// Example usage
async function runMultiTenantApp() {
  try {
    // Handle requests for different tenants
    const tenant1Result = await handleTenantRequest('tenant-1', {
      action: 'getUsers',
      page: 0,
      limit: 10
    })
    
    const tenant2Result = await handleTenantRequest('tenant-2', {
      action: 'createUser',
      userData: { email: 'user@tenant2.com', name: 'Tenant 2 User' }
    })
    
    console.log('Tenant 1 users:', tenant1Result)
    console.log('Tenant 2 new user:', tenant2Result)
    
  } finally {
    await baseRuntime.dispose()
  }
}
```

## Advanced Features Deep Dive

### Feature 1: Runtime Caching and Memoization

ManagedRuntime automatically caches the constructed runtime, ensuring services are initialized only once and shared across all effect executions.

#### Basic Runtime Caching

```typescript
const runtime = ManagedRuntime.make(ApplicationLayer)

// First call - runtime is built and cached
const result1 = await runtime.runPromise(someEffect)

// Subsequent calls - uses cached runtime
const result2 = await runtime.runPromise(anotherEffect)
const result3 = await runtime.runPromise(yetAnotherEffect)

// All effects share the same service instances
```

#### Shared MemoMap for Cross-Runtime Caching

```typescript
// Create multiple runtimes with shared memoization
const baseLayer = Layer.mergeAll(ConfigLive, DatabaseLive)

const runtime1 = ManagedRuntime.make(
  Layer.merge(baseLayer, WebServerLayer)
)

const runtime2 = ManagedRuntime.make(
  Layer.merge(baseLayer, BackgroundJobLayer),
  runtime1.memoMap // Share the same memo map
)

// DatabaseService and ConfigService are built only once
// and shared between both runtimes
```

#### Advanced Memoization: Custom Service Scoping

```typescript
// Create services with different scopes
const RequestScopedService = Layer.fresh(
  Layer.effect(SomeService, /* implementation */)
)

const ApplicationScopedService = Layer.effect(
  AnotherService, /* implementation */
)

const runtime = ManagedRuntime.make(
  Layer.mergeAll(
    ApplicationScopedService, // Shared across requests
    RequestScopedService      // Fresh instance per request
  )
)

// Helper for request-specific runtime
const handleRequest = (requestData: any) =>
  Effect.gen(function* () {
    // Each request gets fresh RequestScopedService
    // but shares ApplicationScopedService
    const appService = yield* AnotherService    // Shared
    const reqService = yield* SomeService       // Fresh
    
    return yield* processRequest(requestData, appService, reqService)
  })
```

### Feature 2: Execution Methods and Error Handling

ManagedRuntime provides multiple execution methods for different scenarios, each with specific error handling characteristics.

#### Synchronous Execution

```typescript
// runSync - throws on error or async boundaries
try {
  const result = runtime.runSync(Effect.succeed(42))
  console.log(result) // 42
} catch (error) {
  console.error("Sync execution failed:", error)
}

// runSyncExit - returns Exit for error handling
const exit = runtime.runSyncExit(Effect.fail(new Error("Something went wrong")))

if (exit._tag === "Success") {
  console.log("Result:", exit.value)
} else {
  console.error("Error:", exit.cause)
}
```

#### Asynchronous Execution with Signals

```typescript
// runPromise with cancellation support
const controller = new AbortController()

// Start long-running operation
const promise = runtime.runPromise(
  longRunningEffect,
  { signal: controller.signal }
)

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000)

try {
  const result = await promise
  console.log("Completed:", result)
} catch (error) {
  if (error.name === 'AbortError') {
    console.log("Operation was cancelled")
  } else {
    console.error("Operation failed:", error)
  }
}
```

#### Fiber-Based Execution

```typescript
// runFork - returns a fiber for advanced control
const fiber = runtime.runFork(
  Effect.gen(function* () {
    yield* Effect.sleep(1000)
    return "Delayed result"
  })
)

// Check fiber status
const status = await fiber.status()
console.log("Fiber status:", status)

// Interrupt if needed
if (shouldCancel) {
  await fiber.interrupt()
  console.log("Fiber interrupted")
} else {
  const result = await fiber.await()
  console.log("Fiber result:", result)
}
```

#### Callback-Based Execution

```typescript
// runCallback - for integration with callback-based APIs
const cancel = runtime.runCallback(
  someAsyncEffect,
  {
    onSuccess: (result) => console.log("Success:", result),
    onFailure: (error) => console.error("Error:", error),
    onDefect: (defect) => console.error("Defect:", defect)
  }
)

// Cancel if needed
setTimeout(() => {
  cancel()
  console.log("Execution cancelled")
}, 10000)
```

### Feature 3: Resource Disposal and Cleanup

ManagedRuntime provides comprehensive resource management with automatic cleanup and graceful shutdown.

#### Automatic Resource Cleanup

```typescript
const DatabasePoolService = Layer.scoped(
  DatabaseService,
  Effect.gen(function* () {
    // Resource acquisition
    const pool = yield* Effect.acquireRelease(
      Effect.tryPromise(() => createPool({ max: 10 })),
      (pool) => Effect.tryPromise(() => pool.end())
    )
    
    // Service implementation
    return { query: (sql) => Effect.tryPromise(() => pool.query(sql)) }
  })
)

const runtime = ManagedRuntime.make(DatabasePoolService)

// Use the runtime
await runtime.runPromise(someEffect)

// Automatic cleanup - pool.end() is called
await runtime.dispose()
```

#### Graceful Shutdown Patterns

```typescript
// Application with graceful shutdown
class ApplicationShutdown {
  private runtime: ManagedRuntime<any, any>
  private shutdownSignal = Promise.withResolvers<void>()
  
  constructor(layer: Layer.Layer<any, any>) {
    this.runtime = ManagedRuntime.make(layer)
    this.setupShutdownHandlers()
  }
  
  private setupShutdownHandlers() {
    const shutdown = async () => {
      console.log("Received shutdown signal...")
      
      // Signal shutdown to running effects
      this.shutdownSignal.resolve()
      
      // Wait for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Dispose runtime and cleanup resources
      await this.runtime.dispose()
      
      console.log("Application shutdown complete")
      process.exit(0)
    }
    
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }
  
  async runWithShutdown<A, E>(effect: Effect.Effect<A, E>) {
    return this.runtime.runPromise(
      Effect.race(
        effect,
        Effect.fromPromise(() => this.shutdownSignal.promise).pipe(
          Effect.flatMap(() => Effect.fail(new Error("Shutdown requested")))
        )
      )
    )
  }
}

const app = new ApplicationShutdown(ApplicationLayer)

// Run effects that respect shutdown signals
await app.runWithShutdown(longRunningService)
```

#### Custom Cleanup Logic

```typescript
// Service with custom cleanup procedures
const CustomCleanupService = Layer.scoped(
  SomeService,
  Effect.gen(function* () {
    const resources = new Map<string, any>()
    
    // Register cleanup for each resource
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        console.log("Starting custom cleanup...")
        
        // Cleanup resources in reverse order
        const resourceEntries = Array.from(resources.entries()).reverse()
        
        for (const [key, resource] of resourceEntries) {
          yield* Effect.tryPromise(() => resource.cleanup()).pipe(
            Effect.catchAll((error) => 
              Effect.sync(() => console.error(`Failed to cleanup ${key}:`, error))
            )
          )
        }
        
        console.log("Custom cleanup complete")
      })
    )
    
    return {
      addResource: (key: string, resource: any) =>
        Effect.sync(() => resources.set(key, resource)),
      
      removeResource: (key: string) =>
        Effect.sync(() => resources.delete(key))
    }
  })
)
```

## Practical Patterns & Best Practices

### Pattern 1: Application Bootstrap with Health Checks

```typescript
// Health check service
class HealthCheckService extends Context.Tag("HealthCheckService")<
  HealthCheckService,
  {
    readonly checkHealth: () => Effect.Effect<HealthStatus, Error>
    readonly isReady: () => Effect.Effect<boolean>
  }
>() {}

interface HealthStatus {
  database: 'healthy' | 'unhealthy'
  cache: 'healthy' | 'unhealthy'
  messageQueue: 'healthy' | 'unhealthy'
  overall: 'healthy' | 'unhealthy'
}

const HealthCheckLive = Layer.effect(
  HealthCheckService,
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const cache = yield* CacheService
    const mq = yield* MessageQueueService
    
    const checkDatabase = () =>
      db.query("SELECT 1").pipe(
        Effect.map(() => 'healthy' as const),
        Effect.catchAll(() => Effect.succeed('unhealthy' as const)),
        Effect.timeout(5000)
      )
    
    const checkCache = () =>
      cache.get("health-check").pipe(
        Effect.map(() => 'healthy' as const),
        Effect.catchAll(() => Effect.succeed('unhealthy' as const)),
        Effect.timeout(2000)
      )
    
    const checkMessageQueue = () =>
      mq.publish("health-check", { timestamp: Date.now() }).pipe(
        Effect.map(() => 'healthy' as const),
        Effect.catchAll(() => Effect.succeed('unhealthy' as const)),
        Effect.timeout(3000)
      )
    
    return {
      checkHealth: () =>
        Effect.gen(function* () {
          const [database, cacheStatus, messageQueue] = yield* Effect.all([
            checkDatabase(),
            checkCache(),
            checkMessageQueue()
          ])
          
          const overall = database === 'healthy' && 
                         cacheStatus === 'healthy' && 
                         messageQueue === 'healthy'
                         ? 'healthy' : 'unhealthy'
          
          return { database, cache: cacheStatus, messageQueue, overall }
        }),
      
      isReady: () =>
        Effect.gen(function* () {
          const health = yield* checkHealth()
          return health.overall === 'healthy'
        })
    }
  })
)

// Bootstrap helper
const createBootstrappedRuntime = (layer: Layer.Layer<any, any>) =>
  Effect.gen(function* () {
    const bootstrapLayer = Layer.merge(layer, HealthCheckLive)
    const runtime = ManagedRuntime.make(bootstrapLayer)
    
    // Wait for services to be ready
    const healthService = yield* runtime.runtimeEffect.pipe(
      Effect.map(rt => Context.get(rt.context, HealthCheckService))
    )
    
    yield* Effect.retry(
      healthService.isReady().pipe(
        Effect.flatMap(ready => 
          ready ? Effect.void : Effect.fail(new Error("Services not ready"))
        )
      ),
      Schedule.exponential(1000).pipe(Schedule.intersect(Schedule.recurs(10)))
    )
    
    return runtime
  })

// Usage
const bootstrappedApp = Effect.gen(function* () {
  const runtime = yield* createBootstrappedRuntime(ApplicationLayer)
  
  // Services are guaranteed to be healthy
  return yield* Effect.scoped(
    Effect.gen(function* () {
      yield* Effect.addFinalizer(() => 
        Effect.promise(() => runtime.dispose())
      )
      
      // Run application logic
      return yield* runApplicationLogic()
    })
  )
})
```

### Pattern 2: Configuration-Driven Service Selection

```typescript
// Dynamic service selection based on configuration
const createDynamicLayer = <T>(
  tag: Context.Tag<any, T>,
  implementations: Record<string, Layer.Layer<T, any>>,
  configKey: string
) =>
  Layer.effect(
    tag,
    Effect.gen(function* () {
      const config = yield* ConfigService
      const implType = yield* config.get(configKey)
      
      const selectedLayer = implementations[implType]
      if (!selectedLayer) {
        return yield* Effect.fail(new Error(`Unknown implementation: ${implType}`))
      }
      
      const runtime = ManagedRuntime.make(selectedLayer)
      const service = yield* runtime.runtimeEffect.pipe(
        Effect.map(rt => Context.get(rt.context, tag))
      )
      
      return service
    })
  )

// Different cache implementations
const cacheImplementations = {
  memory: Layer.succeed(CacheService, {
    get: (key) => Effect.succeed(memoryCache.get(key) || null),
    set: (key, value, ttl) => Effect.sync(() => memoryCache.set(key, value, ttl)),
    delete: (key) => Effect.sync(() => memoryCache.delete(key))
  }),
  
  redis: Layer.scoped(CacheService, redisServiceImplementation),
  
  memcached: Layer.scoped(CacheService, memcachedServiceImplementation)
}

// Select cache implementation based on config
const DynamicCacheLayer = createDynamicLayer(
  CacheService,
  cacheImplementations,
  "CACHE_TYPE"
)

// Different database implementations
const databaseImplementations = {
  postgres: Layer.scoped(DatabaseService, postgresImplementation),
  mysql: Layer.scoped(DatabaseService, mysqlImplementation),
  sqlite: Layer.scoped(DatabaseService, sqliteImplementation)
}

const DynamicDatabaseLayer = createDynamicLayer(
  DatabaseService,
  databaseImplementations,
  "DATABASE_TYPE"
)

// Compose dynamic layers
const DynamicApplicationLayer = Layer.mergeAll(
  ConfigLive,
  DynamicCacheLayer,
  DynamicDatabaseLayer
)
```

### Pattern 3: Runtime Context Switching

```typescript
// Context switching for different execution environments
class ExecutionEnvironment extends Context.Tag("ExecutionEnvironment")<
  ExecutionEnvironment,
  {
    readonly name: string
    readonly features: string[]
    readonly limits: Record<string, number>
  }
>() {}

const createEnvironmentSpecificRuntime = (envName: string) =>
  Effect.gen(function* () {
    const environments = {
      development: {
        name: 'development',
        features: ['debug', 'hot-reload', 'test-data'],
        limits: { requestsPerSecond: 1000, maxConnections: 100 }
      },
      staging: {
        name: 'staging',
        features: ['monitoring', 'test-data'],
        limits: { requestsPerSecond: 5000, maxConnections: 500 }
      },
      production: {
        name: 'production',
        features: ['monitoring', 'analytics', 'caching'],
        limits: { requestsPerSecond: 10000, maxConnections: 1000 }
      }
    }
    
    const env = environments[envName]
    if (!env) {
      return yield* Effect.fail(new Error(`Unknown environment: ${envName}`))
    }
    
    const EnvironmentLayer = Layer.succeed(ExecutionEnvironment, env)
    
    // Environment-specific service configurations
    const envSpecificLayers = env.features.includes('caching') 
      ? Layer.merge(ApplicationLayer, CachingLayer)
      : ApplicationLayer
    
    const finalLayer = Layer.merge(envSpecificLayers, EnvironmentLayer)
    
    return ManagedRuntime.make(finalLayer)
  })

// Runtime pool for different environments
class RuntimePool {
  private runtimes = new Map<string, ManagedRuntime<any, any>>()
  
  async getRuntime(environment: string): Promise<ManagedRuntime<any, any>> {
    if (!this.runtimes.has(environment)) {
      const runtime = await Effect.runPromise(
        createEnvironmentSpecificRuntime(environment)
      )
      this.runtimes.set(environment, runtime)
      
      // Setup cleanup
      process.on('exit', () => this.cleanup())
    }
    
    return this.runtimes.get(environment)!
  }
  
  async cleanup() {
    await Promise.all(
      Array.from(this.runtimes.values()).map(runtime => runtime.dispose())
    )
    this.runtimes.clear()
  }
}

const runtimePool = new RuntimePool()

// Usage with environment switching
const executeInEnvironment = async (environment: string, effect: Effect.Effect<any, any>) => {
  const runtime = await runtimePool.getRuntime(environment)
  return runtime.runPromise(effect)
}

// Test different environments
await executeInEnvironment('development', testEffect)
await executeInEnvironment('production', prodEffect)
```

## Integration Examples

### Integration with Express.js Web Framework

```typescript
import express from 'express'
import { Effect, Layer, ManagedRuntime, Context } from 'effect'

// Request context for Express integration
class RequestContext extends Context.Tag("RequestContext")<
  RequestContext,
  {
    readonly req: express.Request
    readonly res: express.Response
    readonly user?: { id: string; email: string }
  }
>() {}

// Express middleware factory
const createEffectMiddleware = (runtime: ManagedRuntime<any, any>) => {
  return (handler: (ctx: RequestContext) => Effect.Effect<any, Error>) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const requestCtx = { req, res }
      const RequestLayer = Layer.succeed(RequestContext, requestCtx)
      
      // Create request-scoped runtime
      const requestRuntime = ManagedRuntime.make(
        Layer.merge(ApplicationLayer, RequestLayer),
        runtime.memoMap // Share base services
      )
      
      try {
        const result = await requestRuntime.runPromise(handler(requestCtx))
        
        if (!res.headersSent) {
          res.json(result)
        }
      } catch (error) {
        console.error('Request error:', error)
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' })
        }
      } finally {
        await requestRuntime.dispose()
      }
    }
  }
}

// Express application setup
const setupExpressApp = (runtime: ManagedRuntime<any, any>) => {
  const app = express()
  const effectMiddleware = createEffectMiddleware(runtime)
  
  app.use(express.json())
  
  // Route handlers using Effect
  app.get('/users/:id', effectMiddleware((ctx) =>
    Effect.gen(function* () {
      const userService = yield* UserService
      const { id } = ctx.req.params
      
      const user = yield* userService.findById(id)
      
      if (!user) {
        ctx.res.status(404)
        return { error: 'User not found' }
      }
      
      return { user }
    })
  ))
  
  app.post('/users', effectMiddleware((ctx) =>
    Effect.gen(function* () {
      const userService = yield* UserService
      const userData = ctx.req.body
      
      const user = yield* userService.create(userData)
      ctx.res.status(201)
      
      return { user }
    })
  ))
  
  return app
}

// Start Express server with ManagedRuntime
async function startExpressServer() {
  const runtime = ManagedRuntime.make(WebApplicationLayer)
  
  try {
    const app = setupExpressApp(runtime)
    const port = 3000
    
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
    
    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...')
      server.close()
      await runtime.dispose()
      process.exit(0)
    }
    
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    
  } catch (error) {
    console.error('Failed to start server:', error)
    await runtime.dispose()
    process.exit(1)
  }
}
```

### Integration with Next.js API Routes

```typescript
// Next.js API route integration
import { NextApiRequest, NextApiResponse } from 'next'
import { Effect, Layer, ManagedRuntime } from 'effect'

// Global runtime for Next.js API routes
let globalRuntime: ManagedRuntime<any, any> | null = null

const getGlobalRuntime = async () => {
  if (!globalRuntime) {
    globalRuntime = ManagedRuntime.make(ApplicationLayer)
    
    // Cleanup on process exit
    process.on('beforeExit', async () => {
      if (globalRuntime) {
        await globalRuntime.dispose()
        globalRuntime = null
      }
    })
  }
  
  return globalRuntime
}

// Next.js API route wrapper
const withEffect = <T>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Effect.Effect<T, Error>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const runtime = await getGlobalRuntime()
    
    // Create request context
    const RequestLayer = Layer.succeed(RequestContext, { req, res })
    const requestRuntime = ManagedRuntime.make(
      Layer.merge(ApplicationLayer, RequestLayer),
      runtime.memoMap
    )
    
    try {
      const result = await requestRuntime.runPromise(handler(req, res))
      
      if (!res.headersSent) {
        res.json(result)
      }
    } catch (error) {
      console.error('API route error:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' })
      }
    } finally {
      await requestRuntime.dispose()
    }
  }
}

// API route implementations
export default withEffect((req, res) =>
  Effect.gen(function* () {
    if (req.method === 'GET') {
      const userService = yield* UserService
      const users = yield* userService.getAllUsers()
      return { users }
    }
    
    if (req.method === 'POST') {
      const userService = yield* UserService
      const user = yield* userService.create(req.body)
      res.status(201)
      return { user }
    }
    
    res.status(405)
    return { error: 'Method not allowed' }
  })
)
```

### Integration with AWS Lambda

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context as LambdaContext } from 'aws-lambda'
import { Effect, Layer, ManagedRuntime } from 'effect'

// Lambda context
class LambdaRequestContext extends Context.Tag("LambdaRequestContext")<
  LambdaRequestContext,
  {
    readonly event: APIGatewayProxyEvent
    readonly context: LambdaContext
    readonly requestId: string
  }
>() {}

// Lambda-specific services
const AWSServicesLayer = Layer.mergeAll(
  ConfigLive,
  // AWS services would be defined here
  Layer.succeed(DatabaseService, {
    // DynamoDB implementation
    query: (sql: string) => Effect.tryPromise(() => /* DynamoDB query */)
  })
)

// Lambda runtime (created once per container)
let lambdaRuntime: ManagedRuntime<any, any> | null = null

const getLambdaRuntime = () => {
  if (!lambdaRuntime) {
    lambdaRuntime = ManagedRuntime.make(AWSServicesLayer)
  }
  return lambdaRuntime
}

// Lambda handler wrapper
const createLambdaHandler = <T>(
  handler: (event: APIGatewayProxyEvent, context: LambdaContext) => Effect.Effect<T, Error>
) => {
  return async (
    event: APIGatewayProxyEvent,
    context: LambdaContext
  ): Promise<APIGatewayProxyResult> => {
    const runtime = getLambdaRuntime()
    
    const requestCtx = {
      event,
      context,
      requestId: context.awsRequestId
    }
    
    const RequestLayer = Layer.succeed(LambdaRequestContext, requestCtx)
    const requestRuntime = ManagedRuntime.make(
      Layer.merge(AWSServicesLayer, RequestLayer),
      runtime.memoMap
    )
    
    try {
      const result = await requestRuntime.runPromise(handler(event, context))
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      }
    } catch (error) {
      console.error('Lambda error:', error)
      
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error' })
      }
    } finally {
      await requestRuntime.dispose()
    }
  }
}

// Lambda function implementation
export const handler = createLambdaHandler((event, context) =>
  Effect.gen(function* () {
    const userService = yield* UserService
    const lambdaCtx = yield* LambdaRequestContext
    
    console.log(`Processing request ${lambdaCtx.requestId}`)
    
    if (event.httpMethod === 'GET') {
      const userId = event.pathParameters?.id
      if (!userId) {
        return yield* Effect.fail(new Error('User ID required'))
      }
      
      const user = yield* userService.findById(userId)
      return { user }
    }
    
    return yield* Effect.fail(new Error('Method not supported'))
  })
)
```

### Testing Strategies

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Effect, Layer, ManagedRuntime, Context } from 'effect'

// Test doubles
const MockDatabaseService = Layer.succeed(DatabaseService, {
  query: <T>(sql: string, params?: any[]) => 
    Effect.succeed([{ id: '1', name: 'Test User' }] as T[]),
})

const MockCacheService = Layer.succeed(CacheService, {
  get: <T>(key: string) => Effect.succeed(null as T | null),
  set: <T>(key: string, value: T) => Effect.void,
  delete: (key: string) => Effect.void
})

// Test runtime factory
const createTestRuntime = (overrides?: Layer.Layer<any, any>) => {
  const TestLayer = Layer.mergeAll(
    MockDatabaseService,
    MockCacheService,
    overrides || Layer.empty
  )
  
  return ManagedRuntime.make(TestLayer)
}

// Test suite
describe('User Service', () => {
  let runtime: ManagedRuntime<any, any>
  
  beforeEach(() => {
    runtime = createTestRuntime()
  })
  
  afterEach(async () => {
    await runtime.dispose()
  })
  
  it('should find user by id', async () => {
    const result = await runtime.runPromise(
      Effect.gen(function* () {
        const userService = yield* UserService
        return yield* userService.findById('1')
      })
    )
    
    expect(result).toEqual({ id: '1', name: 'Test User' })
  })
  
  it('should handle database errors', async () => {
    const errorRuntime = createTestRuntime(
      Layer.succeed(DatabaseService, {
        query: () => Effect.fail(new Error('Database connection failed'))
      })
    )
    
    await expect(
      errorRuntime.runPromise(
        Effect.gen(function* () {
          const userService = yield* UserService
          return yield* userService.findById('1')
        })
      )
    ).rejects.toThrow('Database connection failed')
    
    await errorRuntime.dispose()
  })
  
  it('should use cached results when available', async () => {
    let cacheHits = 0
    
    const CacheSpyLayer = Layer.succeed(CacheService, {
      get: <T>(key: string) => Effect.sync(() => {
        cacheHits++
        return key === 'user:1' ? { id: '1', name: 'Cached User' } as T : null
      }),
      set: <T>(key: string, value: T) => Effect.void,
      delete: (key: string) => Effect.void
    })
    
    const spyRuntime = createTestRuntime(CacheSpyLayer)
    
    const result = await spyRuntime.runPromise(
      Effect.gen(function* () {
        const userService = yield* UserService
        return yield* userService.findById('1') // Assuming this checks cache first
      })
    )
    
    expect(cacheHits).toBe(1)
    expect(result).toEqual({ id: '1', name: 'Cached User' })
    
    await spyRuntime.dispose()
  })
})

// Integration test with real services
describe('Integration Tests', () => {
  let runtime: ManagedRuntime<any, any>
  
  beforeEach(async () => {
    // Use real services for integration tests
    const IntegrationLayer = Layer.mergeAll(
      ConfigLive,
      DatabaseLive, // Real database connection
      CacheLive     // Real cache connection
    )
    
    runtime = ManagedRuntime.make(IntegrationLayer)
    
    // Setup test data
    await runtime.runPromise(setupTestData())
  })
  
  afterEach(async () => {
    // Cleanup test data
    await runtime.runPromise(cleanupTestData())
    await runtime.dispose()
  })
  
  it('should perform end-to-end user creation', async () => {
    const userData = {
      email: 'integration@test.com',
      name: 'Integration Test User'
    }
    
    const result = await runtime.runPromise(
      Effect.gen(function* () {
        const userService = yield* UserService
        const authService = yield* AuthService
        
        const user = yield* userService.create(userData)
        const token = yield* authService.generateToken({ 
          id: user.id, 
          email: user.email 
        })
        
        return { user, token }
      })
    )
    
    expect(result.user.email).toBe(userData.email)
    expect(result.token).toBeDefined()
  })
})
```

## Conclusion

ManagedRuntime provides controlled execution environments with automatic resource management, making it the ideal solution for managing application lifecycle in Effect-based applications.

Key benefits:
- **Automatic Resource Management**: Services are initialized once and cleaned up automatically
- **Dependency Injection**: Type-safe service composition with guaranteed availability
- **Controlled Execution**: Isolated execution environments with predictable service lifecycles
- **Testing Support**: Easy mocking and service replacement for comprehensive testing
- **Integration Friendly**: Seamless integration with existing frameworks and platforms

ManagedRuntime is essential when building applications that need reliable service management, graceful shutdown, and proper resource cleanup across different execution contexts.