# Runtime: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Runtime Solves

In complex JavaScript applications, managing execution environments, dependency injection, and resource lifecycle becomes challenging. Traditional approaches mix concerns and make testing difficult:

```typescript
// Traditional approach - hardcoded dependencies and global state
class DatabaseService {
  private static instance: DatabaseService;
  private connection: DatabaseConnection;
  
  private constructor() {
    // Hardcoded configuration
    this.connection = new DatabaseConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'myapp'
    });
  }
  
  static getInstance(): DatabaseService {
    if (!this.instance) {
      this.instance = new DatabaseService();
    }
    return this.instance;
  }
  
  async query(sql: string): Promise<any> {
    try {
      return await this.connection.query(sql);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
}

// Logger with global configuration
class Logger {
  private static level = process.env.LOG_LEVEL || 'info';
  
  static info(message: string, context?: any) {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${new Date().toISOString()} ${message}`, context);
    }
  }
  
  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error);
  }
  
  private static shouldLog(level: string): boolean {
    // Simplified level checking
    return true;
  }
}

// Business logic tightly coupled to infrastructure
async function processOrder(orderId: string): Promise<void> {
  const db = DatabaseService.getInstance(); // Global singleton
  Logger.info('Processing order', { orderId }); // Direct global access
  
  try {
    const order = await db.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Process payment with hardcoded service
    const paymentResult = await fetch('https://payment.api/charge', {
      method: 'POST',
      body: JSON.stringify({ amount: order.amount }),
      headers: { 'API-Key': process.env.PAYMENT_API_KEY } // Environment coupling
    });
    
    if (!paymentResult.ok) {
      throw new Error('Payment failed');
    }
    
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', orderId]);
    Logger.info('Order processed successfully', { orderId });
    
  } catch (error) {
    Logger.error('Failed to process order', error);
    throw error;
  }
}

// Testing is difficult - need to mock globals, environment, etc.
describe('processOrder', () => {
  beforeEach(() => {
    // Complex setup to mock singletons
    jest.spyOn(DatabaseService, 'getInstance').mockReturnValue({
      query: jest.fn()
    });
    
    // Mock environment variables
    process.env.PAYMENT_API_KEY = 'test-key';
    
    // Mock fetch globally
    global.fetch = jest.fn();
  });
  
  // Tests are fragile and coupled to implementation
});
```

This approach leads to:
- **Testing complexity** - Need to mock global state, singletons, and environment variables
- **Tight coupling** - Business logic depends directly on infrastructure details
- **Configuration rigidity** - Hard to run with different configurations or environments

### The Runtime Solution

Effect's Runtime provides a clean separation between effect definition and execution, enabling proper dependency injection and testability:

```typescript
import { Effect, Runtime, Layer, Config, Logger } from "effect"

// Define services as interfaces
interface Database {
  readonly query: (sql: string, params?: any[]) => Effect.Effect<any>
}

interface PaymentService {
  readonly charge: (amount: number) => Effect.Effect<{ id: string }>
}

// Create service tags
const Database = Context.GenericTag<Database>("Database")
const PaymentService = Context.GenericTag<PaymentService>("PaymentService")

// Business logic is pure and testable
const processOrder = (orderId: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo(`Processing order ${orderId}`)
    
    const db = yield* Database
    const payment = yield* PaymentService
    
    const order = yield* db.query("SELECT * FROM orders WHERE id = $1", [orderId])
    
    if (!order) {
      return yield* Effect.fail(new Error("Order not found"))
    }
    
    const paymentResult = yield* payment.charge(order.amount)
    
    yield* db.query(
      "UPDATE orders SET status = $1, payment_id = $2 WHERE id = $3",
      ["paid", paymentResult.id, orderId]
    )
    
    yield* Effect.logInfo(`Order ${orderId} processed successfully`)
  })

// Create runtime with real implementations
const ProductionRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideLayer(
    Layer.mergeAll(
      DatabaseLive,
      PaymentServiceLive,
      Logger.pretty
    )
  )
)

// Execute with runtime
Runtime.runPromise(ProductionRuntime)(processOrder("order-123"))

// Testing is clean and simple
const TestRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideLayer(
    Layer.mergeAll(
      DatabaseTest,    // Mock implementation
      PaymentServiceTest,
      Logger.test      // Test logger
    )
  )
)

test("processOrder", async () => {
  const result = await Runtime.runPromise(TestRuntime)(
    processOrder("test-order")
  )
  // Assertions...
})
```

### Key Concepts

**Runtime**: The execution environment that provides all required services and configuration for running Effects.

**Layer**: A composable unit that provides services to the runtime, enabling modular dependency injection.

**Service**: An interface representing a capability that can be provided by different implementations.

## Basic Usage Patterns

### Creating and Using Runtimes

```typescript
import { Effect, Runtime, Layer, Context } from "effect"

// Basic runtime usage
const program = Effect.gen(function* () {
  yield* Effect.log("Starting program")
  const result = yield* Effect.succeed(42)
  yield* Effect.log(`Result: ${result}`)
  return result
})

// Using default runtime
const result1 = await Effect.runPromise(program)

// Creating custom runtime
const customRuntime = Runtime.defaultRuntime.pipe(
  Runtime.withLogger(Logger.withMinimumLogLevel(Logger.LogLevel.Debug))
)

// Run with custom runtime
const result2 = await Runtime.runPromise(customRuntime)(program)

// Runtime with context
interface AppConfig {
  readonly apiUrl: string
  readonly timeout: number
}

const AppConfig = Context.GenericTag<AppConfig>("AppConfig")

const programWithConfig = Effect.gen(function* () {
  const config = yield* AppConfig
  yield* Effect.log(`Using API: ${config.apiUrl}`)
  
  // Use config in program
  return `Configured with timeout: ${config.timeout}ms`
})

const configRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideService(AppConfig, {
    apiUrl: "https://api.example.com",
    timeout: 5000
  })
)

const result3 = await Runtime.runPromise(configRuntime)(programWithConfig)
```

### Runtime Layers

```typescript
import { Effect, Runtime, Layer, Context, Config } from "effect"

// Define service interfaces
interface Cache {
  readonly get: (key: string) => Effect.Effect<string | null>
  readonly set: (key: string, value: string) => Effect.Effect<void>
}

const Cache = Context.GenericTag<Cache>("Cache")

// Create layer implementations
const CacheMemory = Layer.succeed(
  Cache,
  Cache.of({
    store: new Map<string, string>(),
    get(key) {
      return Effect.sync(() => this.store.get(key) ?? null)
    },
    set(key, value) {
      return Effect.sync(() => {
        this.store.set(key, value)
      })
    }
  })
)

const CacheRedis = Layer.effect(
  Cache,
  Effect.gen(function* () {
    const redisUrl = yield* Config.string("REDIS_URL")
    
    // Simulated Redis client
    const client = {
      get: (key: string) => Promise.resolve(`redis:${key}`),
      set: (key: string, value: string) => Promise.resolve()
    }
    
    return Cache.of({
      get: (key) => Effect.promise(() => client.get(key)),
      set: (key, value) => Effect.promise(() => client.set(key, value))
    })
  })
)

// Compose layers
const AppLayer = Layer.mergeAll(
  Logger.pretty,
  Config.live({
    REDIS_URL: "redis://localhost:6379"
  }),
  CacheRedis
)

// Create runtime with layers
const appRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideLayer(AppLayer)
)

// Use in program
const cachedOperation = Effect.gen(function* () {
  const cache = yield* Cache
  
  const cached = yield* cache.get("user:123")
  if (cached) {
    yield* Effect.log("Cache hit")
    return cached
  }
  
  yield* Effect.log("Cache miss")
  const value = "User data"
  yield* cache.set("user:123", value)
  return value
})

Runtime.runPromise(appRuntime)(cachedOperation)
```

### Runtime Configuration

```typescript
import { Effect, Runtime, Config, Layer } from "effect"

// Define configuration schema
interface ServerConfig {
  readonly host: string
  readonly port: number
  readonly ssl: boolean
}

interface DatabaseConfig {
  readonly url: string
  readonly poolSize: number
  readonly timeout: number
}

// Load configuration from environment
const serverConfig = Config.all({
  host: Config.string("HOST").pipe(Config.withDefault("localhost")),
  port: Config.number("PORT").pipe(Config.withDefault(3000)),
  ssl: Config.boolean("SSL").pipe(Config.withDefault(false))
})

const databaseConfig = Config.all({
  url: Config.string("DATABASE_URL"),
  poolSize: Config.number("DB_POOL_SIZE").pipe(Config.withDefault(10)),
  timeout: Config.number("DB_TIMEOUT").pipe(Config.withDefault(30000))
})

// Create configuration layer
const ConfigLayer = Layer.effect(
  Context.GenericTag<ServerConfig>("ServerConfig"),
  serverConfig
).pipe(
  Layer.merge(
    Layer.effect(
      Context.GenericTag<DatabaseConfig>("DatabaseConfig"),
      databaseConfig
    )
  )
)

// Runtime with configuration
const configuredRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideLayer(
    Layer.mergeAll(
      Config.live({
        HOST: "0.0.0.0",
        PORT: "8080",
        DATABASE_URL: "postgresql://localhost/mydb"
      }),
      ConfigLayer
    )
  )
)
```

## Real-World Examples

### Example 1: Microservice Runtime

Building a complete microservice runtime with HTTP server, database, and monitoring:

```typescript
import { Effect, Runtime, Layer, Context, Config, Schedule, Metric } from "effect"
import { HttpServer, HttpClient } from "@effect/platform"

// Service definitions
interface HealthCheck {
  readonly check: Effect.Effect<{ status: "healthy" | "unhealthy"; services: Record<string, boolean> }>
}

interface MetricsCollector {
  readonly recordRequest: (method: string, path: string, status: number, duration: number) => Effect.Effect<void>
  readonly getMetrics: Effect.Effect<Record<string, any>>
}

interface ServiceRegistry {
  readonly register: (name: string, url: string) => Effect.Effect<void>
  readonly discover: (name: string) => Effect.Effect<string | null>
}

// Create service tags
const HealthCheck = Context.GenericTag<HealthCheck>("HealthCheck")
const MetricsCollector = Context.GenericTag<MetricsCollector>("MetricsCollector")
const ServiceRegistry = Context.GenericTag<ServiceRegistry>("ServiceRegistry")

// Implement health check layer
const HealthCheckLive = Layer.effect(
  HealthCheck,
  Effect.gen(function* () {
    const db = yield* Database
    const cache = yield* Cache
    
    return HealthCheck.of({
      check: Effect.gen(function* () {
        const checks = yield* Effect.all({
          database: db.query("SELECT 1").pipe(
            Effect.map(() => true),
            Effect.catchAll(() => Effect.succeed(false))
          ),
          cache: cache.get("health").pipe(
            Effect.map(() => true),
            Effect.catchAll(() => Effect.succeed(false))
          ),
          memory: Effect.sync(() => {
            const usage = process.memoryUsage()
            return usage.heapUsed / usage.heapTotal < 0.9
          })
        })
        
        const allHealthy = Object.values(checks).every(Boolean)
        
        return {
          status: allHealthy ? "healthy" : "unhealthy",
          services: checks
        }
      })
    })
  })
)

// Metrics implementation
const MetricsCollectorLive = Layer.sync(MetricsCollector, () => {
  const requestCount = Metric.counter("http_requests_total", {
    description: "Total HTTP requests"
  })
  
  const requestDuration = Metric.histogram("http_request_duration_ms", {
    description: "HTTP request duration in milliseconds",
    boundaries: [10, 50, 100, 500, 1000, 5000]
  })
  
  return MetricsCollector.of({
    recordRequest: (method, path, status, duration) =>
      Effect.all([
        Metric.increment(requestCount, { method, path, status: status.toString() }),
        Metric.update(requestDuration, duration, { method, path })
      ]),
      
    getMetrics: Effect.sync(() => ({
      // In production, would export Prometheus format
      requests: "http_requests_total{} 12345",
      duration: "http_request_duration_ms{} 234"
    }))
  })
})

// Service registry with Consul/etcd
const ServiceRegistryLive = Layer.effect(
  ServiceRegistry,
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient
    const config = yield* Config.all({
      consulUrl: Config.string("CONSUL_URL").pipe(
        Config.withDefault("http://localhost:8500")
      ),
      serviceName: Config.string("SERVICE_NAME"),
      servicePort: Config.number("PORT")
    })
    
    // Service registration with health check
    const register = (name: string, url: string) =>
      httpClient.put(`${config.consulUrl}/v1/agent/service/register`, {
        body: HttpClient.body.json({
          ID: `${name}-${config.servicePort}`,
          Name: name,
          Port: config.servicePort,
          Check: {
            HTTP: `${url}/health`,
            Interval: "10s"
          }
        })
      })
    
    const discover = (name: string) =>
      httpClient.get(`${config.consulUrl}/v1/health/service/${name}`).pipe(
        Effect.map(response => response.json),
        Effect.map((services: any[]) => {
          const healthy = services.filter(s => 
            s.Checks.every((c: any) => c.Status === "passing")
          )
          return healthy.length > 0 
            ? `http://${healthy[0].Service.Address}:${healthy[0].Service.Port}`
            : null
        }),
        Effect.catchAll(() => Effect.succeed(null))
      )
    
    // Register self on startup
    yield* register(config.serviceName, `http://localhost:${config.servicePort}`).pipe(
      Effect.retry(Schedule.exponential("1 second").pipe(Schedule.limit(5))),
      Effect.tapError(error => Effect.logError("Failed to register service", error))
    )
    
    // Deregister on shutdown
    yield* Effect.addFinalizer(() =>
      Effect.orDie(httpClient.put(
        `${config.consulUrl}/v1/agent/service/deregister/${config.serviceName}-${config.servicePort}`
      ))
    )
    
    return ServiceRegistry.of({ register, discover })
  })
)

// HTTP server layer with middleware
const HttpServerLive = Layer.effect(
  HttpServer.HttpServer,
  Effect.gen(function* () {
    const metrics = yield* MetricsCollector
    const health = yield* HealthCheck
    
    const middleware = HttpServer.middleware.make((app) =>
      app.pipe(
        // Request timing
        HttpServer.middleware.withTiming((duration, request, response) =>
          metrics.recordRequest(
            request.method,
            request.url.pathname,
            response.status,
            duration
          )
        ),
        
        // Request ID
        HttpServer.middleware.withHeader("X-Request-ID", () => 
          Effect.sync(() => crypto.randomUUID())
        ),
        
        // Error handling
        HttpServer.middleware.catchErrors((error) =>
          HttpServer.response.json(
            { error: error.message },
            { status: 500 }
          )
        )
      )
    )
    
    return HttpServer.router.empty.pipe(
      HttpServer.router.get("/health", 
        Effect.gen(function* () {
          const result = yield* health.check
          return HttpServer.response.json(result, {
            status: result.status === "healthy" ? 200 : 503
          })
        })
      ),
      HttpServer.router.get("/metrics",
        Effect.gen(function* () {
          const metrics = yield* metrics.getMetrics
          return HttpServer.response.text(metrics, {
            headers: { "Content-Type": "text/plain" }
          })
        })
      ),
      middleware,
      HttpServer.server.make({ port: 3000 })
    )
  })
)

// Compose all layers
const MicroserviceRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideLayer(
    Layer.mergeAll(
      // Infrastructure
      DatabaseLive,
      CacheLive,
      HttpClient.layer,
      
      // Service layers
      HealthCheckLive,
      MetricsCollectorLive,
      ServiceRegistryLive,
      HttpServerLive,
      
      // Logging and configuration
      Logger.pretty,
      Config.live(process.env)
    )
  )
)

// Main program
const main = Effect.gen(function* () {
  const server = yield* HttpServer.HttpServer
  yield* Effect.logInfo("Microservice started")
  
  // Keep running
  yield* Effect.never
})

// Run the microservice
Runtime.runPromise(MicroserviceRuntime)(main)
```

### Example 2: Testing Runtime

Creating specialized testing runtimes with different configurations:

```typescript
import { Effect, Runtime, Layer, TestClock, TestRandom, Fiber } from "effect"

// Test utilities layer
interface TestUtils {
  readonly runConcurrent: <A>(effects: Effect.Effect<A>[]) => Effect.Effect<A[]>
  readonly expectFailure: <E, A>(effect: Effect.Effect<A, E>) => Effect.Effect<E>
  readonly withTimeout: <A, E, R>(effect: Effect.Effect<A, E, R>, ms: number) => Effect.Effect<A, E | "timeout", R>
}

const TestUtils = Context.GenericTag<TestUtils>("TestUtils")

const TestUtilsLive = Layer.sync(TestUtils, () =>
  TestUtils.of({
    runConcurrent: (effects) =>
      Effect.all(effects, { concurrency: "unbounded" }),
      
    expectFailure: (effect) =>
      effect.pipe(
        Effect.flip,
        Effect.orElseSucceed(() => {
          throw new Error("Expected failure but got success")
        })
      ),
      
    withTimeout: (effect, ms) =>
      Effect.gen(function* () {
        const option = yield* effect.pipe(Effect.timeout(ms))
        if (option._tag === "Some") {
          return option.value
        } else {
          return yield* Effect.fail("timeout" as const)
        }
      })
  })
)

// Mock service implementations
const createMockDatabase = (data: Map<string, any> = new Map()) =>
  Layer.succeed(Database, Database.of({
    query: (sql: string, params?: any[]) =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Mock DB: ${sql}`, { params })
        
        // Simple mock query handling
        if (sql.includes("SELECT")) {
          const key = params?.[0] || "default"
          return data.get(key) || null
        }
        
        if (sql.includes("INSERT") || sql.includes("UPDATE")) {
          const key = params?.[params.length - 1]
          const value = { id: key, ...params }
          data.set(key, value)
          return { rowCount: 1 }
        }
        
        return null
      }),
      
    transaction: <A>(effect: Effect.Effect<A>) =>
      Effect.gen(function* () {
        const snapshot = new Map(data)
        return yield* effect.pipe(
          Effect.catchAll(error => {
            // Rollback
            data.clear()
            snapshot.forEach((v, k) => data.set(k, v))
            return Effect.fail(error)
          })
        )
      })
  }))

// Test scenarios layer
interface TestScenarios {
  readonly networkFailure: Effect.Effect<void>
  readonly slowResponse: (delay: number) => Effect.Effect<void>
  readonly rateLimit: (requests: number) => Effect.Effect<void>
}

const TestScenarios = Context.GenericTag<TestScenarios>("TestScenarios")

const TestScenariosLive = Layer.effect(
  TestScenarios,
  Effect.gen(function* () {
    const state = yield* Ref.make({
      networkFailing: false,
      responseDelay: 0,
      requestCount: 0,
      rateLimit: Infinity
    })
    
    // Intercept HTTP client
    yield* Effect.provideService(
      HttpClient.HttpClient,
      HttpClient.HttpClient.of({
        get: (url) =>
          Effect.gen(function* () {
            const s = yield* Ref.get(state)
            
            if (s.networkFailing) {
              return yield* Effect.fail(new Error("Network failure"))
            }
            
            if (s.requestCount >= s.rateLimit) {
              return yield* Effect.fail(new Error("Rate limited"))
            }
            
            yield* Ref.update(state, s => ({ ...s, requestCount: s.requestCount + 1 }))
            yield* TestClock.sleep(s.responseDelay)
            
            return { status: 200, json: () => ({ data: "test" }) }
          })
      })
    )
    
    return TestScenarios.of({
      networkFailure: Ref.update(state, s => ({ ...s, networkFailing: true })),
      slowResponse: (delay) => Ref.update(state, s => ({ ...s, responseDelay: delay })),
      rateLimit: (requests) => Ref.update(state, s => ({ ...s, rateLimit: requests }))
    })
  })
)

// Create different test runtimes
const TestRuntimes = {
  // Unit test runtime - fast, deterministic
  unit: Runtime.defaultRuntime.pipe(
    Runtime.provideLayer(
      Layer.mergeAll(
        TestClock.layer,
        TestRandom.deterministic("test-seed"),
        createMockDatabase(),
        TestUtilsLive,
        Logger.test
      )
    )
  ),
  
  // Integration test runtime - real services but isolated
  integration: Runtime.defaultRuntime.pipe(
    Runtime.provideLayer(
      Layer.mergeAll(
        DatabaseTestContainer, // Real DB in container
        CacheMemory,
        TestUtilsLive,
        Logger.pretty
      )
    )
  ),
  
  // Stress test runtime - with chaos engineering
  stress: Runtime.defaultRuntime.pipe(
    Runtime.provideLayer(
      Layer.mergeAll(
        DatabaseLive,
        CacheLive,
        TestScenariosLive,
        TestUtilsLive,
        Logger.withMinimumLogLevel(Logger.LogLevel.Warning)
      )
    )
  )
}

// Example test using runtime
const orderProcessingTest = Effect.gen(function* () {
  const utils = yield* TestUtils
  const db = yield* Database
  
  // Setup test data
  yield* db.query("INSERT INTO users VALUES ($1, $2)", ["user-1", "Test User"])
  yield* db.query("INSERT INTO products VALUES ($1, $2, $3)", ["prod-1", "Widget", 99.99])
  
  // Test concurrent order processing
  const orders = Array.from({ length: 10 }, (_, i) => ({
    userId: "user-1",
    productId: "prod-1",
    quantity: i + 1
  }))
  
  const results = yield* utils.runConcurrent(
    orders.map(order => processOrder(order))
  )
  
  // Verify all succeeded
  expect(results).toHaveLength(10)
  
  // Test failure scenario
  const invalidOrder = { userId: "invalid", productId: "prod-1", quantity: 1 }
  const error = yield* utils.expectFailure(processOrder(invalidOrder))
  expect(error.message).toContain("User not found")
})

// Run with appropriate runtime
test("order processing - unit", async () => {
  await Runtime.runPromise(TestRuntimes.unit)(orderProcessingTest)
})

test("order processing - integration", async () => {
  await Runtime.runPromise(TestRuntimes.integration)(orderProcessingTest)
})
```

### Example 3: Multi-Environment Runtime

Managing different runtime configurations for development, staging, and production:

```typescript
import { Effect, Runtime, Layer, Config, Secret } from "effect"

// Environment-specific configuration
interface EnvironmentConfig {
  readonly name: "development" | "staging" | "production"
  readonly debug: boolean
  readonly features: Set<string>
}

const EnvironmentConfig = Context.GenericTag<EnvironmentConfig>("EnvironmentConfig")

// Feature flags service
interface FeatureFlags {
  readonly isEnabled: (feature: string) => Effect.Effect<boolean>
  readonly getVariant: <T>(feature: string, variants: Record<string, T>) => Effect.Effect<T | null>
}

const FeatureFlags = Context.GenericTag<FeatureFlags>("FeatureFlags")

// Create environment-specific layers
const EnvironmentLayers = {
  development: Layer.succeed(EnvironmentConfig, {
    name: "development",
    debug: true,
    features: new Set(["debug-panel", "verbose-logging", "test-endpoints"])
  }),
  
  staging: Layer.succeed(EnvironmentConfig, {
    name: "staging", 
    debug: false,
    features: new Set(["beta-features", "performance-monitoring"])
  }),
  
  production: Layer.succeed(EnvironmentConfig, {
    name: "production",
    debug: false,
    features: new Set(["stable-features", "analytics"])
  })
}

// Feature flags implementation
const FeatureFlagsLive = Layer.effect(
  FeatureFlags,
  Effect.gen(function* () {
    const env = yield* EnvironmentConfig
    const httpClient = yield* HttpClient.HttpClient
    
    // In-memory cache for flags
    const cache = yield* Ref.make<Map<string, any>>(new Map())
    
    // Fetch flags from service
    const fetchFlags = Effect.gen(function* () {
      if (env.name === "development") {
        // Use local flags in development
        return env.features
      }
      
      const response = yield* httpClient.get(
        `https://flags.service/api/environments/${env.name}/flags`
      )
      
      return yield* Effect.promise(() => response.json())
    }).pipe(
      Effect.retry(Schedule.exponential("1 second", 2).pipe(
        Schedule.compose(Schedule.recurs(3))
      )),
      Effect.catchAll(() => Effect.succeed(env.features))
    )
    
    // Refresh flags periodically
    yield* fetchFlags.pipe(
      Effect.flatMap(flags => Ref.set(cache, new Map(flags))),
      Effect.repeat(Schedule.fixed("5 minutes")),
      Effect.forkDaemon
    )
    
    return FeatureFlags.of({
      isEnabled: (feature) =>
        Effect.gen(function* () {
          const flags = yield* Ref.get(cache)
          return flags.has(feature) || env.features.has(feature)
        }),
        
      getVariant: (feature, variants) =>
        Effect.gen(function* () {
          const flags = yield* Ref.get(cache)
          const variant = flags.get(feature)
          return variants[variant] || null
        })
    })
  })
)

// Secrets management layer
interface SecretsManager {
  readonly get: (key: string) => Effect.Effect<Secret.Secret>
  readonly rotate: (key: string) => Effect.Effect<void>
}

const SecretsManager = Context.GenericTag<SecretsManager>("SecretsManager")

const SecretsManagerLive = Layer.effect(
  SecretsManager,
  Effect.gen(function* () {
    const env = yield* EnvironmentConfig
    
    const provider = yield* Effect.switch(env.name, {
      development: () => Effect.succeed({
        get: (key: string) => Effect.succeed(Secret.fromString(`dev-${key}`)),
        rotate: () => Effect.unit
      }),
      
      staging: () => Effect.gen(function* () {
        // Use AWS Secrets Manager for staging
        const client = yield* AwsSecretsClient
        return {
          get: (key: string) => 
            client.getSecretValue(`staging/${key}`).pipe(
              Effect.map(Secret.fromString)
            ),
          rotate: (key: string) =>
            client.rotateSecret(`staging/${key}`)
        }
      }),
      
      production: () => Effect.gen(function* () {
        // Use HashiCorp Vault for production
        const vault = yield* VaultClient
        return {
          get: (key: string) =>
            vault.read(`secret/production/${key}`).pipe(
              Effect.map(data => Secret.fromString(data.value)),
              Effect.tap(() => 
                Effect.logInfo(`Secret accessed: ${key}`, {
                  environment: env.name,
                  timestamp: new Date().toISOString()
                })
              )
            ),
          rotate: (key: string) =>
            vault.rotate(`secret/production/${key}`)
        }
      })
    })
    
    return SecretsManager.of(provider)
  })
)

// Observability layer with environment-specific configuration
const ObservabilityLayer = Layer.effect(
  Context.GenericTag<{
    readonly trace: (name: string, fn: () => Effect.Effect<any>) => Effect.Effect<any>
  }>("Observability"),
  Effect.gen(function* () {
    const env = yield* EnvironmentConfig
    
    if (env.name === "development") {
      // Simple console tracing in development
      return {
        trace: (name: string, fn: () => Effect.Effect<any>) =>
          Effect.gen(function* () {
            const start = Date.now()
            yield* Effect.logDebug(`[TRACE] Starting: ${name}`)
            
            const result = yield* fn().pipe(
              Effect.tapBoth({
                onFailure: (error) => 
                  Effect.logError(`[TRACE] Failed: ${name}`, { error, duration: Date.now() - start }),
                onSuccess: () =>
                  Effect.logDebug(`[TRACE] Completed: ${name}`, { duration: Date.now() - start })
              })
            )
            
            return result
          })
      }
    }
    
    // Production tracing with OpenTelemetry
    const tracer = yield* OpenTelemetryTracer
    
    return {
      trace: (name: string, fn: () => Effect.Effect<any>) =>
        tracer.startActiveSpan(name, span =>
          fn().pipe(
            Effect.tapBoth({
              onFailure: (error) => Effect.sync(() => {
                span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
                span.end()
              }),
              onSuccess: () => Effect.sync(() => {
                span.setStatus({ code: SpanStatusCode.OK })
                span.end()
              })
            })
          )
        )
    }
  })
)

// Create environment-specific runtimes
const createRuntime = (environment: "development" | "staging" | "production") =>
  Runtime.defaultRuntime.pipe(
    Runtime.provideLayer(
      Layer.mergeAll(
        // Environment configuration
        EnvironmentLayers[environment],
        
        // Common services
        DatabaseLive,
        CacheLive,
        HttpClient.layer,
        
        // Environment-aware services
        FeatureFlagsLive,
        SecretsManagerLive,
        ObservabilityLayer,
        
        // Logging configuration
        environment === "development" 
          ? Logger.pretty
          : Logger.json.pipe(
              Logger.withMinimumLogLevel(
                environment === "production" 
                  ? Logger.LogLevel.Info 
                  : Logger.LogLevel.Debug
              )
            )
      )
    )
  )

// Usage
const application = Effect.gen(function* () {
  const env = yield* EnvironmentConfig
  const features = yield* FeatureFlags
  const secrets = yield* SecretsManager
  const { trace } = yield* Observability
  
  yield* Effect.logInfo(`Starting application in ${env.name} mode`)
  
  // Check feature flags
  const betaEnabled = yield* features.isEnabled("beta-features")
  if (betaEnabled) {
    yield* Effect.logInfo("Beta features enabled")
  }
  
  // Get secrets
  const apiKey = yield* secrets.get("api-key")
  
  // Traced operation
  const result = yield* trace("process-request", () =>
    Effect.gen(function* () {
      // Application logic
      return "processed"
    })
  )
  
  return result
})

// Run with different environments
const runDevelopment = () => 
  Runtime.runPromise(createRuntime("development"))(application)

const runProduction = () =>
  Runtime.runPromise(createRuntime("production"))(application)
```

## Advanced Features Deep Dive

### Custom Runtime Services

Creating and managing custom runtime services:

```typescript
import { Effect, Runtime, Layer, Context, Scope } from "effect"

// Advanced service with lifecycle management
interface ResourcePool<T> {
  readonly acquire: Effect.Effect<T>
  readonly release: (resource: T) => Effect.Effect<void>
  readonly withResource: <A>(use: (resource: T) => Effect.Effect<A>) => Effect.Effect<A>
  readonly stats: Effect.Effect<{ total: number; available: number; inUse: number }>
}

class ResourcePoolImpl<T> implements ResourcePool<T> {
  private readonly pool: T[] = []
  private readonly inUse = new Set<T>()
  
  constructor(
    private readonly create: Effect.Effect<T>,
    private readonly destroy: (resource: T) => Effect.Effect<void>,
    private readonly maxSize: number
  ) {}
  
  acquire = Effect.gen(function* (this: ResourcePoolImpl<T>) {
    // Try to get from pool
    const available = this.pool.pop()
    if (available) {
      this.inUse.add(available)
      return available
    }
    
    // Create new if under limit
    if (this.pool.length + this.inUse.size < this.maxSize) {
      const resource = yield* this.create
      this.inUse.add(resource)
      return resource
    }
    
    // Wait for available resource
    yield* Effect.retry(
      Effect.gen(function* () {
        const available = this.pool.pop()
        if (!available) {
          return yield* Effect.fail("No resources available")
        }
        this.inUse.add(available)
        return available
      }),
      Schedule.fixed("100 millis")
    )
  }).bind(this)
  
  release = (resource: T) =>
    Effect.sync(() => {
      this.inUse.delete(resource)
      this.pool.push(resource)
    })
    
  withResource = <A>(use: (resource: T) => Effect.Effect<A>) =>
    Effect.acquireUseRelease(
      this.acquire,
      use,
      this.release
    )
    
  stats = Effect.sync(() => ({
    total: this.pool.length + this.inUse.size,
    available: this.pool.length,
    inUse: this.inUse.size
  }))
}

// Create resource pool layer
const createResourcePool = <T>(
  tag: Context.Tag<ResourcePool<T>, ResourcePool<T>>,
  create: Effect.Effect<T>,
  destroy: (resource: T) => Effect.Effect<void>,
  maxSize: number
) =>
  Layer.scoped(
    tag,
    Effect.gen(function* () {
      const pool = new ResourcePoolImpl(create, destroy, maxSize)
      
      // Cleanup on shutdown
      yield* Effect.addFinalizer(() =>
        Effect.orDie(Effect.all([
          ...pool.pool.map(destroy),
          ...Array.from(pool.inUse).map(destroy)
        ]))
      )
      
      return pool
    })
  )

// Runtime service orchestration
interface ServiceOrchestrator {
  readonly startService: (name: string, service: Effect.Effect<void>) => Effect.Effect<Fiber.Fiber<void>>
  readonly stopService: (name: string) => Effect.Effect<void>
  readonly restartService: (name: string) => Effect.Effect<void>
  readonly getStatus: Effect.Effect<Record<string, "running" | "stopped" | "failed">>
}

const ServiceOrchestrator = Context.GenericTag<ServiceOrchestrator>("ServiceOrchestrator")

const ServiceOrchestratorLive = Layer.effect(
  ServiceOrchestrator,
  Effect.gen(function* () {
    const services = yield* Ref.make<Map<string, Fiber.Fiber<void>>>(new Map())
    
    return ServiceOrchestrator.of({
      startService: (name, service) =>
        Effect.gen(function* () {
          // Stop existing if running
          yield* Effect.ignore(stopService(name))
          
          // Start new fiber
          const fiber = yield* service.pipe(
            Effect.tapError(error =>
              Effect.logError(`Service ${name} failed`, { error })
            ),
            Effect.forkDaemon
          )
          
          yield* Ref.update(services, map => 
            new Map(map).set(name, fiber)
          )
          
          return fiber
        }),
        
      stopService: (name) =>
        Effect.gen(function* () {
          const map = yield* Ref.get(services)
          const fiber = map.get(name)
          
          if (fiber) {
            yield* Fiber.interrupt(fiber)
            yield* Ref.update(services, map => {
              const next = new Map(map)
              next.delete(name)
              return next
            })
          }
        }),
        
      restartService: (name) =>
        Effect.gen(function* () {
          const map = yield* Ref.get(services)
          const fiber = map.get(name)
          
          if (fiber) {
            // Implement restart logic
            yield* Effect.logInfo(`Restarting service: ${name}`)
          }
        }),
        
      getStatus: Effect.gen(function* () {
        const map = yield* Ref.get(services)
        
        const statusEntries = yield* Effect.all(
          Array.from(map.entries()).map(([name, fiber]) =>
            Effect.gen(function* () {
              const status = yield* fiber.status
              const serviceStatus = status._tag === "Done" && status.value._tag === "Failure" 
                ? "failed" 
                : status._tag === "Done" 
                ? "stopped" 
                : "running"
              return [name, serviceStatus] as const
            })
          )
        )
        
        return Object.fromEntries(statusEntries)
      })
    })
  })
)
```

### Runtime Composition

Advanced runtime composition patterns:

```typescript
import { Effect, Runtime, Layer, Context } from "effect"

// Runtime module system
interface RuntimeModule {
  readonly name: string
  readonly layer: Layer.Layer<any, any, any>
  readonly dependencies: string[]
}

class RuntimeBuilder {
  private modules = new Map<string, RuntimeModule>()
  
  register(module: RuntimeModule): this {
    this.modules.set(module.name, module)
    return this
  }
  
  build(moduleNames: string[]): Runtime.Runtime<any> {
    const resolved = this.resolveModules(moduleNames)
    const layer = resolved.reduce(
      (acc, module) => Layer.merge(acc, module.layer),
      Layer.empty
    )
    
    return Runtime.defaultRuntime.pipe(
      Runtime.provideLayer(layer)
    )
  }
  
  private resolveModules(names: string[]): RuntimeModule[] {
    const resolved = new Set<RuntimeModule>()
    const visiting = new Set<string>()
    
    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`)
      }
      
      const module = this.modules.get(name)
      if (!module) {
        throw new Error(`Module not found: ${name}`)
      }
      
      if (resolved.has(module)) return
      
      visiting.add(name)
      module.dependencies.forEach(visit)
      visiting.delete(name)
      resolved.add(module)
    }
    
    names.forEach(visit)
    return Array.from(resolved)
  }
}

// Usage
const builder = new RuntimeBuilder()
  .register({
    name: "database",
    layer: DatabaseLive,
    dependencies: ["config"]
  })
  .register({
    name: "cache", 
    layer: CacheLive,
    dependencies: ["config"]
  })
  .register({
    name: "api",
    layer: ApiServiceLive,
    dependencies: ["database", "cache"]
  })
  .register({
    name: "config",
    layer: ConfigLive,
    dependencies: []
  })

const apiRuntime = builder.build(["api"])

// Runtime inheritance
const createChildRuntime = <R>(
  parent: Runtime.Runtime<R>,
  additionalLayer: Layer.Layer<any, any, R>
): Runtime.Runtime<any> =>
  parent.pipe(
    Runtime.provideLayer(additionalLayer)
  )

// Dynamic runtime modification
const withDynamicService = <S, R>(
  runtime: Runtime.Runtime<R>,
  tag: Context.Tag<S, S>,
  serviceFactory: () => S
): Runtime.Runtime<R | S> =>
  runtime.pipe(
    Runtime.provideService(tag, serviceFactory())
  )
```

### Performance Optimization

Optimizing runtime performance:

```typescript
import { Effect, Runtime, Layer, FiberRef, MetricBoundaries } from "effect"

// Performance monitoring layer
const PerformanceLayer = Layer.effect(
  Context.GenericTag<{
    readonly measure: <A>(name: string, effect: Effect.Effect<A>) => Effect.Effect<A>
    readonly getMetrics: Effect.Effect<Record<string, any>>
  }>("Performance"),
  Effect.gen(function* () {
    const metrics = yield* Ref.make<Map<string, number[]>>(new Map())
    
    return {
      measure: <A>(name: string, effect: Effect.Effect<A>) =>
        Effect.gen(function* () {
          const start = performance.now()
          
          try {
            const result = yield* effect
            const duration = performance.now() - start
            
            yield* Ref.update(metrics, map => {
              const current = map.get(name) || []
              current.push(duration)
              return new Map(map).set(name, current)
            })
            
            return result
          } catch (error) {
            const duration = performance.now() - start
            
            yield* Ref.update(metrics, map => {
              const current = map.get(name) || []
              current.push(-duration) // Negative for errors
              return new Map(map).set(name, current)
            })
            
            throw error
          }
        }),
        
      getMetrics: Ref.get(metrics).pipe(
        Effect.map(map => {
          const result: Record<string, any> = {}
          
          for (const [name, durations] of map) {
            const successful = durations.filter(d => d > 0)
            const failed = durations.filter(d => d < 0).length
            
            result[name] = {
              count: durations.length,
              failed,
              min: Math.min(...successful),
              max: Math.max(...successful),
              avg: successful.reduce((a, b) => a + b, 0) / successful.length,
              p50: percentile(successful, 0.5),
              p95: percentile(successful, 0.95),
              p99: percentile(successful, 0.99)
            }
          }
          
          return result
        })
      )
    }
  })
)

// Caching layer for expensive computations
interface ComputeCache {
  readonly memoize: <A>(key: string, compute: Effect.Effect<A>) => Effect.Effect<A>
  readonly invalidate: (key: string) => Effect.Effect<void>
  readonly invalidateAll: Effect.Effect<void>
}

const ComputeCache = Context.GenericTag<ComputeCache>("ComputeCache")

const ComputeCacheLive = Layer.effect(
  ComputeCache,
  Effect.gen(function* () {
    const cache = yield* Ref.make<Map<string, any>>(new Map())
    
    return ComputeCache.of({
      memoize: (key, compute) =>
        Effect.gen(function* () {
          const cached = yield* Ref.get(cache).pipe(
            Effect.map(map => map.get(key))
          )
          
          if (cached !== undefined) {
            yield* Effect.logDebug(`Cache hit: ${key}`)
            return cached
          }
          
          yield* Effect.logDebug(`Cache miss: ${key}`)
          const result = yield* compute
          
          yield* Ref.update(cache, map =>
            new Map(map).set(key, result)
          )
          
          return result
        }),
        
      invalidate: (key) =>
        Ref.update(cache, map => {
          const next = new Map(map)
          next.delete(key)
          return next
        }),
        
      invalidateAll: Ref.set(cache, new Map())
    })
  })
)

// Runtime with performance optimizations
const OptimizedRuntime = Runtime.defaultRuntime.pipe(
  Runtime.withFiberRefs([
    [FiberRef.currentMaxFiberOps, 10000],
    [FiberRef.currentTracerEnabled, false] // Disable tracing in production
  ]),
  Runtime.provideLayer(
    Layer.mergeAll(
      PerformanceLayer,
      ComputeCacheLive,
      // Use bounded queues for backpressure
      Layer.succeed(QueueConfig, {
        defaultCapacity: 1000,
        defaultStrategy: "dropping" // Drop new items when full
      })
    )
  )
)

// Helper function
function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil(sorted.length * p) - 1
  return sorted[idx] || 0
}
```

## Practical Patterns & Best Practices

### Pattern 1: Runtime Testing Utilities

Creating utilities for testing with different runtime configurations:

```typescript
import { Effect, Runtime, Layer, Context, Exit } from "effect"

// Test runtime builder
class TestRuntimeBuilder<R> {
  constructor(private baseRuntime: Runtime.Runtime<R>) {}
  
  withMock<S>(
    tag: Context.Tag<S, S>,
    implementation: Partial<S>
  ): TestRuntimeBuilder<R | S> {
    const layer = Layer.succeed(tag, implementation as S)
    return new TestRuntimeBuilder(
      this.baseRuntime.pipe(Runtime.provideLayer(layer))
    )
  }
  
  withSpy<S>(
    tag: Context.Tag<S, S>,
    implementation: S,
    onCall?: (method: keyof S, args: any[]) => void
  ): TestRuntimeBuilder<R | S> {
    const spy = new Proxy(implementation, {
      get(target, prop) {
        const value = target[prop as keyof S]
        if (typeof value === 'function') {
          return (...args: any[]) => {
            onCall?.(prop as keyof S, args)
            return value.apply(target, args)
          }
        }
        return value
      }
    })
    
    return new TestRuntimeBuilder(
      this.baseRuntime.pipe(Runtime.provideService(tag, spy))
    )
  }
  
  withStub<S>(
    tag: Context.Tag<S, S>,
    stubs: { [K in keyof S]?: S[K] | ((...args: any[]) => any) }
  ): TestRuntimeBuilder<R | S> {
    const implementation = Object.keys(stubs).reduce((acc, key) => {
      const value = stubs[key as keyof S]
      acc[key as keyof S] = typeof value === 'function'
        ? (...args: any[]) => Effect.sync(() => value(...args))
        : value
      return acc
    }, {} as S)
    
    return this.withMock(tag, implementation)
  }
  
  build(): Runtime.Runtime<R> {
    return this.baseRuntime
  }
  
  run<A, E>(effect: Effect.Effect<A, E, R>): Promise<A> {
    return Runtime.runPromise(this.baseRuntime)(effect)
  }
  
  runExit<A, E>(effect: Effect.Effect<A, E, R>): Promise<Exit.Exit<A, E>> {
    return Runtime.runPromiseExit(this.baseRuntime)(effect)
  }
}

// Usage in tests
describe('UserService', () => {
  let runtime: TestRuntimeBuilder<any>
  
  beforeEach(() => {
    runtime = new TestRuntimeBuilder(Runtime.defaultRuntime)
      .withMock(Database, {
        query: jest.fn().mockResolvedValue([{ id: 1, name: 'Test' }])
      })
      .withSpy(Logger, console, (method, args) => {
        console.log(`Logger.${String(method)} called with:`, args)
      })
      .withStub(EmailService, {
        send: (to: string) => ({ sent: true, to })
      })
  })
  
  test('should fetch user', async () => {
    const user = await runtime.run(
      Effect.gen(function* () {
        const db = yield* Database
        return yield* db.query('SELECT * FROM users WHERE id = ?', [1])
      })
    )
    
    expect(user).toEqual([{ id: 1, name: 'Test' }])
  })
})

// Snapshot testing for runtime behavior
const runtimeSnapshot = <R>(
  name: string,
  runtime: Runtime.Runtime<R>
): {
  expectEffect: <A, E>(effect: Effect.Effect<A, E, R>) => Promise<void>
  expectLog: (effect: Effect.Effect<any, any, R>) => Promise<void>
} => {
  const logs: any[] = []
  
  const snapshotRuntime = runtime.pipe(
    Runtime.withLogger((message) => {
      logs.push(message)
      return Effect.unit
    })
  )
  
  return {
    expectEffect: async (effect) => {
      const exit = await Runtime.runPromiseExit(snapshotRuntime)(effect)
      expect({ name, exit, logs }).toMatchSnapshot()
    },
    
    expectLog: async (effect) => {
      await Runtime.runPromise(snapshotRuntime)(effect)
      expect({ name, logs }).toMatchSnapshot()
    }
  }
}
```

### Pattern 2: Runtime Lifecycle Management

Managing runtime lifecycle and graceful shutdown:

```typescript
import { Effect, Runtime, Layer, Scope, Exit, Fiber } from "effect"

// Application lifecycle manager
interface LifecycleManager {
  readonly onStart: (task: Effect.Effect<void>) => Effect.Effect<void>
  readonly onStop: (task: Effect.Effect<void>) => Effect.Effect<void>
  readonly start: Effect.Effect<void>
  readonly stop: Effect.Effect<void>
}

const LifecycleManager = Context.GenericTag<LifecycleManager>("LifecycleManager")

const LifecycleManagerLive = Layer.scoped(
  LifecycleManager,
  Effect.gen(function* () {
    const startTasks = yield* Ref.make<Array<Effect.Effect<void>>>([])
    const stopTasks = yield* Ref.make<Array<Effect.Effect<void>>>([])
    const state = yield* Ref.make<"stopped" | "starting" | "running" | "stopping">("stopped")
    
    const manager = LifecycleManager.of({
      onStart: (task) => Ref.update(startTasks, tasks => [...tasks, task]),
      onStop: (task) => Ref.update(stopTasks, tasks => [...tasks, task]),
      
      start: Effect.gen(function* () {
        const currentState = yield* Ref.get(state)
        if (currentState !== "stopped") {
          return yield* Effect.logWarning(`Cannot start from state: ${currentState}`)
        }
        
        yield* Ref.set(state, "starting")
        yield* Effect.logInfo("Starting application...")
        
        const tasks = yield* Ref.get(startTasks)
        yield* Effect.all(tasks, { concurrency: "unbounded" }).pipe(
          Effect.tapError(error => 
            Effect.logError("Startup task failed", { error })
          ),
          Effect.catchAll(() => Effect.unit)
        )
        
        yield* Ref.set(state, "running")
        yield* Effect.logInfo("Application started successfully")
      }),
      
      stop: Effect.gen(function* () {
        const currentState = yield* Ref.get(state)
        if (currentState !== "running") {
          return yield* Effect.logWarning(`Cannot stop from state: ${currentState}`)
        }
        
        yield* Ref.set(state, "stopping")
        yield* Effect.logInfo("Stopping application...")
        
        const tasks = yield* Ref.get(stopTasks)
        yield* Effect.all(tasks.reverse(), { concurrency: 1 }).pipe(
          Effect.tapError(error =>
            Effect.logError("Shutdown task failed", { error })
          ),
          Effect.catchAll(() => Effect.unit)
        )
        
        yield* Ref.set(state, "stopped")
        yield* Effect.logInfo("Application stopped successfully")
      })
    })
    
    // Register signal handlers
    yield* Effect.sync(() => {
      const shutdown = () => {
        console.log("\nReceived shutdown signal")
        Runtime.runSync(Runtime.defaultRuntime)(manager.stop)
        process.exit(0)
      }
      
      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    })
    
    // Auto-start
    yield* manager.start
    
    // Register cleanup
    yield* Effect.addFinalizer(() => manager.stop)
    
    return manager
  })
)

// Graceful shutdown with timeout
const gracefulShutdown = (
  timeout: Duration = Duration.seconds(30)
) => 
  Effect.gen(function* () {
    const lifecycle = yield* LifecycleManager
    
    yield* lifecycle.stop.pipe(
      Effect.timeout(timeout),
      Effect.tapBoth({
        onFailure: () => Effect.logError("Graceful shutdown timed out"),
        onSuccess: () => Effect.logInfo("Graceful shutdown completed")
      })
    )
  })

// Application with lifecycle
const createApp = () => {
  const AppRuntime = Runtime.defaultRuntime.pipe(
    Runtime.provideLayer(
      Layer.mergeAll(
        LifecycleManagerLive,
        DatabaseLive,
        HttpServerLive,
        Logger.pretty
      )
    )
  )
  
  const main = Effect.gen(function* () {
    const lifecycle = yield* LifecycleManager
    const server = yield* HttpServer.HttpServer
    
    // Register startup tasks
    yield* lifecycle.onStart(
      Effect.gen(function* () {
        yield* Effect.logInfo("Initializing database...")
        yield* initializeDatabase()
      })
    )
    
    yield* lifecycle.onStart(
      Effect.gen(function* () {
        yield* Effect.logInfo("Starting HTTP server...")
        yield* server.listen()
      })
    )
    
    // Register shutdown tasks
    yield* lifecycle.onStop(
      Effect.gen(function* () {
        yield* Effect.logInfo("Closing HTTP connections...")
        yield* server.close()
      })
    )
    
    yield* lifecycle.onStop(
      Effect.gen(function* () {
        yield* Effect.logInfo("Closing database connections...")
        yield* closeDatabase()
      })
    )
    
    // Keep running
    yield* Effect.never
  })
  
  return { runtime: AppRuntime, main }
}

// Health check runtime
const HealthCheckRuntime = Runtime.defaultRuntime.pipe(
  Runtime.provideLayer(
    Layer.effect(
      Context.GenericTag<{
        readonly check: Effect.Effect<boolean>
        readonly ready: Effect.Effect<boolean>
      }>("HealthCheck"),
      Effect.gen(function* () {
        const lifecycle = yield* LifecycleManager
        
        return {
          check: Effect.succeed(true), // Always healthy if running
          
          ready: Ref.get(lifecycle.state).pipe(
            Effect.map(state => state === "running")
          )
        }
      })
    )
  )
)
```

## Integration Examples

### Integration with Express/Fastify

Using Runtime with popular Node.js frameworks:

```typescript
import { Effect, Runtime, Layer, Context } from "effect"
import express from "express"
import { FastifyInstance } from "fastify"

// Express integration
const createExpressApp = <R>(runtime: Runtime.Runtime<R>) => {
  const app = express()
  
  // Runtime middleware
  const effectMiddleware = (
    handler: (req: express.Request) => Effect.Effect<any, any, R>
  ) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const result = await Runtime.runPromise(runtime)(
          handler(req).pipe(
            Effect.tapError(error =>
              Effect.logError("Request failed", { 
                method: req.method,
                path: req.path,
                error 
              })
            )
          )
        )
        
        res.json(result)
      } catch (error) {
        next(error)
      }
    }
  }
  
  // Route helper
  const route = (
    method: "get" | "post" | "put" | "delete",
    path: string,
    handler: (req: express.Request) => Effect.Effect<any, any, R>
  ) => {
    app[method](path, effectMiddleware(handler))
  }
  
  // Example routes
  route("get", "/users/:id", (req) =>
    Effect.gen(function* () {
      const db = yield* Database
      const user = yield* db.query(
        "SELECT * FROM users WHERE id = ?",
        [req.params.id]
      )
      
      if (!user) {
        return yield* Effect.fail({ 
          status: 404, 
          message: "User not found" 
        })
      }
      
      return user
    })
  )
  
  route("post", "/users", (req) =>
    Effect.gen(function* () {
      const validator = yield* Validator
      const data = yield* validator.validate(UserSchema, req.body)
      
      const db = yield* Database
      const result = yield* db.query(
        "INSERT INTO users (name, email) VALUES (?, ?) RETURNING *",
        [data.name, data.email]
      )
      
      yield* Effect.logInfo("User created", { userId: result.id })
      
      return result
    })
  )
  
  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const status = err.status || 500
    res.status(status).json({
      error: err.message || "Internal server error",
      status
    })
  })
  
  return app
}

// Fastify integration
const fastifyPlugin = <R>(runtime: Runtime.Runtime<R>) => {
  return async (fastify: FastifyInstance) => {
    // Add runtime to request context
    fastify.decorateRequest('runtime', runtime)
    
    // Effect route handler
    fastify.decorate('effect', function(
      handler: (request: any) => Effect.Effect<any, any, R>
    ) {
      return async (request: any, reply: any) => {
        const exit = await Runtime.runPromiseExit(runtime)(handler(request))
        
        if (Exit.isFailure(exit)) {
          const error = exit.cause
          // Handle different error types
          reply.code(500).send({ error: "Internal server error" })
        } else {
          reply.send(exit.value)
        }
      }
    })
    
    // Register routes
    fastify.get('/health', fastify.effect(() =>
      Effect.gen(function* () {
        const health = yield* HealthCheck
        return yield* health.check
      })
    ))
  }
}

// Usage
const runtime = createRuntime()
const app = createExpressApp(runtime)

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### Testing Strategies

Comprehensive testing strategies using Runtime:

```typescript
import { Effect, Runtime, Layer, TestClock, TestRandom } from "effect"

// Test helpers
const createTestRuntime = <R>(
  layer: Layer.Layer<R, never, any>
) => {
  return Runtime.defaultRuntime.pipe(
    Runtime.provideLayer(
      Layer.mergeAll(
        layer,
        TestClock.layer,
        TestRandom.layer,
        Logger.test
      )
    )
  )
}

// Property-based testing with runtime
const propertyTest = <R, A>(
  runtime: Runtime.Runtime<R>,
  property: {
    generator: Effect.Effect<A, never, R>
    predicate: (value: A) => boolean
    samples?: number
  }
) => {
  const { generator, predicate, samples = 100 } = property
  
  return Effect.gen(function* () {
    for (let i = 0; i < samples; i++) {
      const value = yield* generator
      
      if (!predicate(value)) {
        return yield* Effect.fail({
          message: "Property failed",
          sample: value,
          index: i
        })
      }
    }
    
    return { passed: samples }
  }).pipe(
    Runtime.runPromise(runtime)
  )
}

// Integration test helpers
class IntegrationTestContext<R> {
  constructor(private runtime: Runtime.Runtime<R>) {}
  
  scenario(name: string) {
    return new ScenarioBuilder(name, this.runtime)
  }
  
  async cleanup() {
    // Cleanup logic
  }
}

class ScenarioBuilder<R> {
  private steps: Array<{
    name: string
    effect: Effect.Effect<any, any, R>
    assertion?: (result: any) => void
  }> = []
  
  constructor(
    private name: string,
    private runtime: Runtime.Runtime<R>
  ) {}
  
  given(name: string, effect: Effect.Effect<any, any, R>) {
    this.steps.push({ name: `Given ${name}`, effect })
    return this
  }
  
  when(name: string, effect: Effect.Effect<any, any, R>) {
    this.steps.push({ name: `When ${name}`, effect })
    return this
  }
  
  then(name: string, effect: Effect.Effect<any, any, R>, assertion?: (result: any) => void) {
    this.steps.push({ name: `Then ${name}`, effect, assertion })
    return this
  }
  
  async run() {
    console.log(`Running scenario: ${this.name}`)
    
    for (const step of this.steps) {
      console.log(`  ${step.name}`)
      
      try {
        const result = await Runtime.runPromise(this.runtime)(step.effect)
        
        if (step.assertion) {
          step.assertion(result)
        }
      } catch (error) {
        throw new Error(`Step failed: ${step.name}\n${error}`)
      }
    }
    
    console.log(`✓ Scenario passed: ${this.name}`)
  }
}

// Usage
describe('Order Processing', () => {
  let context: IntegrationTestContext<any>
  
  beforeAll(() => {
    const runtime = createTestRuntime(
      Layer.mergeAll(
        DatabaseTest,
        PaymentServiceTest,
        EmailServiceTest
      )
    )
    
    context = new IntegrationTestContext(runtime)
  })
  
  afterAll(() => context.cleanup())
  
  test('successful order', async () => {
    await context
      .scenario('Process valid order')
      .given('a user exists', createUser({ id: 'user-1', balance: 1000 }))
      .given('products are in stock', setStock({ 'product-1': 10 }))
      .when('order is placed', placeOrder({
        userId: 'user-1',
        items: [{ productId: 'product-1', quantity: 2 }]
      }))
      .then('order is created', getOrder('order-1'), (order) => {
        expect(order.status).toBe('completed')
        expect(order.total).toBe(200)
      })
      .then('stock is updated', getStock('product-1'), (stock) => {
        expect(stock).toBe(8)
      })
      .then('email is sent', getEmails('user-1'), (emails) => {
        expect(emails).toHaveLength(1)
        expect(emails[0].subject).toContain('Order Confirmation')
      })
      .run()
  })
})
```

## Conclusion

Runtime provides the execution environment and dependency injection system for building modular, testable, and maintainable Effect applications.

Key benefits:
- **Dependency Injection**: Clean separation between effect definition and implementation via services and layers
- **Environment Management**: Easy switching between development, testing, and production configurations
- **Lifecycle Control**: Proper startup/shutdown sequences and resource management

Runtime is essential for structuring Effect applications with proper separation of concerns, enabling testability, and managing complex dependency graphs in production systems.