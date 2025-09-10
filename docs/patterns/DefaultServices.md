# DefaultServices: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem DefaultServices Solves

When building applications with Effect, you frequently need access to fundamental services like time, randomness, console output, configuration, and tracing. Without DefaultServices, you'd need to manually provide these services everywhere:

```typescript
// Traditional approach - manual service provision everywhere
import { Effect, Clock, Random, Console, ConfigProvider, Tracer, Context, Layer } from "effect"

const businessLogic = Effect.gen(function* () {
  const clock = yield* Clock
  const random = yield* Random
  const console = yield* Console
  
  const start = yield* clock.currentTimeMillis
  const randomValue = yield* random.nextInt
  yield* console.log(`Started at ${start}, random: ${randomValue}`)
  
  // Your business logic here...
})

// Must provide all services manually
const program = businessLogic.pipe(
  Effect.provide(
    Layer.mergeAll(
      Clock.layer,
      Random.layer,
      Console.layer,
      ConfigProvider.layer,
      Tracer.layer
    )
  )
)
```

This approach leads to:
- **Boilerplate Everywhere** - Every Effect needs explicit service provision
- **Service Coupling** - Business logic tightly coupled to service setup
- **Testing Complexity** - Must mock every service for every test
- **Inconsistent Defaults** - Different parts of app might use different service implementations

### The DefaultServices Solution

DefaultServices provides a pre-configured context with sensible defaults for the most commonly needed services, automatically available without explicit provision:

```typescript
import { Effect, DefaultServices } from "effect"

const businessLogic = Effect.gen(function* () {
  // These services are automatically available!
  const start = yield* Effect.currentTimeMillis
  const randomValue = yield* Effect.nextInt
  yield* Effect.log(`Started at ${start}, random: ${randomValue}`)
  
  // Your business logic here...
})

// No explicit service provision needed
const program = businessLogic
```

### Key Concepts

**DefaultServices Context**: A pre-built Context containing Clock, Console, Random, ConfigProvider, and Tracer services with production-ready defaults

**FiberRef Access**: Services are accessed through FiberRef, allowing scoped service replacement without affecting other parts of your application

**Automatic Provision**: Effect runtime automatically provides DefaultServices to all effects, eliminating boilerplate

## Basic Usage Patterns

### Pattern 1: Direct Service Access

```typescript
import { Effect } from "effect"

// Access time services directly
const getCurrentTime = Effect.gen(function* () {
  const millis = yield* Effect.currentTimeMillis
  const nanos = yield* Effect.currentTimeNanos
  return { millis, nanos }
})

// Access random services directly
const generateRandomData = Effect.gen(function* () {
  const number = yield* Effect.nextInt
  const boolean = yield* Effect.nextBoolean
  const range = yield* Effect.nextRange(1, 100)
  return { number, boolean, range }
})
```

### Pattern 2: Service Composition

```typescript
// Combine multiple default services
const createSessionId = Effect.gen(function* () {
  const timestamp = yield* Effect.currentTimeMillis
  const randomPart = yield* Effect.nextIntBetween(1000, 9999)
  return `session_${timestamp}_${randomPart}`
})

// Sleep and timing operations
const withRetryDelay = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  delayMs: number
): Effect.Effect<A, E, R> => Effect.gen(function* () {
  const result = yield* Effect.either(effect)
  if (result._tag === "Left") {
    yield* Effect.sleep(`${delayMs} millis`)
    return yield* effect
  }
  return result.right
})
```

### Pattern 3: Configuration Access

```typescript
import { Config, Effect } from "effect"

// Access configuration through default ConfigProvider
const loadAppConfig = Effect.gen(function* () {
  const port = yield* Effect.config(Config.integer("PORT").pipe(Config.withDefault(3000)))
  const host = yield* Effect.config(Config.string("HOST").pipe(Config.withDefault("localhost")))
  const debug = yield* Effect.config(Config.boolean("DEBUG").pipe(Config.withDefault(false)))
  
  return { port, host, debug }
})
```

## Real-World Examples

### Example 1: Request Processing with Timing & Logging

```typescript
import { Effect, Schema } from "effect"

const User = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String
})

type User = Schema.Schema.Type<typeof User>

interface UserNotFoundError {
  readonly _tag: "UserNotFoundError"
  readonly userId: string
}

const UserNotFoundError = (userId: string): UserNotFoundError => ({
  _tag: "UserNotFoundError",
  userId
})

const processUserRequest = (userId: string) => Effect.gen(function* () {
  const startTime = yield* Effect.currentTimeMillis
  
  yield* Effect.log(`Processing user request for ID: ${userId}`)
  
  // Simulate database lookup with random delay
  const delay = yield* Effect.nextIntBetween(100, 500)
  yield* Effect.sleep(`${delay} millis`)
  
  // Simulate random failure
  const shouldFail = yield* Effect.nextBoolean
  if (shouldFail && Math.random() > 0.7) {
    return yield* Effect.fail(UserNotFoundError(userId))
  }
  
  const user: User = {
    id: userId,
    email: `user${userId}@example.com`,
    name: `User ${userId}`
  }
  
  const endTime = yield* Effect.currentTimeMillis
  const duration = endTime - startTime
  
  yield* Effect.log(`Successfully processed user ${userId} in ${duration}ms`)
  
  return user
}).pipe(
  Effect.catchTag("UserNotFoundError", (error) => 
    Effect.gen(function* () {
      yield* Effect.log(`User not found: ${error.userId}`)
      return yield* Effect.fail(error)
    })
  )
)
```

### Example 2: Configuration-Driven Service with Environment Detection

```typescript
import { Config, Effect, Layer } from "effect"

interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly ssl: boolean
}

const loadDatabaseConfig = Effect.gen(function* () {
  const host = yield* Effect.config(Config.string("DB_HOST"))
  const port = yield* Effect.config(Config.integer("DB_PORT"))
  const database = yield* Effect.config(Config.string("DB_NAME"))
  const ssl = yield* Effect.config(Config.boolean("DB_SSL").pipe(Config.withDefault(true)))
  
  return { host, port, database, ssl } satisfies DatabaseConfig
})

interface DatabaseService {
  readonly connect: Effect.Effect<void>
  readonly query: <T>(sql: string) => Effect.Effect<T[]>
  readonly close: Effect.Effect<void>
}

const DatabaseService = Context.GenericTag<DatabaseService>("DatabaseService")

const makeDatabaseService = Effect.gen(function* () {
  const config = yield* loadDatabaseConfig
  
  yield* Effect.log(`Connecting to database ${config.database} at ${config.host}:${config.port}`)
  
  // Simulate connection with random delay
  const connectionDelay = yield* Effect.nextIntBetween(1000, 3000)
  yield* Effect.sleep(`${connectionDelay} millis`)
  
  const connectionId = yield* Effect.nextIntBetween(1000, 9999)
  yield* Effect.log(`Database connected with ID: ${connectionId}`)
  
  return DatabaseService.of({
    connect: Effect.gen(function* () {
      yield* Effect.log("Database connection established")
    }),
    
    query: <T>(sql: string) => Effect.gen(function* () {
      const queryStart = yield* Effect.currentTimeMillis
      yield* Effect.log(`Executing query: ${sql}`)
      
      // Simulate query time
      const queryTime = yield* Effect.nextIntBetween(10, 200)
      yield* Effect.sleep(`${queryTime} millis`)
      
      const queryEnd = yield* Effect.currentTimeMillis
      yield* Effect.log(`Query completed in ${queryEnd - queryStart}ms`)
      
      return [] as T[]
    }),
    
    close: Effect.gen(function* () {
      yield* Effect.log(`Closing database connection ${connectionId}`)
    })
  })
})

const DatabaseServiceLive = Layer.effect(DatabaseService, makeDatabaseService)
```

### Example 3: Distributed System with Request Tracing

```typescript
import { Context, Effect, Tracer } from "effect"

interface RequestContext {
  readonly requestId: string
  readonly userId?: string
  readonly startTime: number
}

const RequestContextTag = Context.GenericTag<RequestContext>("RequestContext")

const createRequestContext = (userId?: string) => Effect.gen(function* () {
  const requestId = yield* generateRequestId()
  const startTime = yield* Effect.currentTimeMillis
  
  const context: RequestContext = { requestId, userId, startTime }
  
  yield* Effect.log(`Request started: ${requestId}${userId ? ` for user ${userId}` : ""}`)
  
  return context
})

const generateRequestId = () => Effect.gen(function* () {
  const timestamp = yield* Effect.currentTimeMillis
  const random1 = yield* Effect.nextIntBetween(100, 999)
  const random2 = yield* Effect.nextIntBetween(100, 999)
  return `req_${timestamp}_${random1}_${random2}`
})

const withRequestContext = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  userId?: string
): Effect.Effect<A, E, RequestContext | R> => Effect.gen(function* () {
  const context = yield* createRequestContext(userId)
  
  return yield* effect.pipe(
    Effect.provideService(RequestContextTag, context),
    Effect.tap(() => Effect.gen(function* () {
      const endTime = yield* Effect.currentTimeMillis
      const duration = endTime - context.startTime
      yield* Effect.log(`Request completed: ${context.requestId} in ${duration}ms`)
    }))
  )
})

// Usage in a service
const processBusinessLogic = Effect.gen(function* () {
  const context = yield* RequestContextTag
  
  yield* Effect.log(`Processing business logic for request: ${context.requestId}`)
  
  // Simulate some work
  const workTime = yield* Effect.nextIntBetween(500, 2000)
  yield* Effect.sleep(`${workTime} millis`)
  
  const shouldSucceed = yield* Effect.nextBoolean
  if (!shouldSucceed && Math.random() > 0.8) {
    return yield* Effect.fail(new Error("Random business logic failure"))
  }
  
  return "Business logic completed successfully"
})

const handleRequest = (userId: string) => withRequestContext(
  processBusinessLogic,
  userId
)
```

## Advanced Features Deep Dive

### Feature 1: Service Replacement and Scoping

Effect's DefaultServices can be replaced or augmented for specific scopes without affecting the global application state.

#### Basic Service Replacement

```typescript
import { Effect, Clock, Random, Console } from "effect"

// Create custom implementations
const customClock = Clock.make(() => ({
  currentTimeMillis: Effect.succeed(1234567890),
  currentTimeNanos: Effect.succeed(1234567890000000n),
  sleep: () => Effect.void
}))

const testableRandom = Random.make(() => 0.5) // Always returns 0.5

// Replace services for specific operations
const testableOperation = Effect.gen(function* () {
  const time = yield* Effect.currentTimeMillis  // Returns 1234567890
  const random = yield* Effect.next            // Returns 0.5
  
  return { time, random }
}).pipe(
  Effect.provideService(Clock.Clock, customClock),
  Effect.provideService(Random.Random, testableRandom)
)
```

#### Scoped Service Management

```typescript
const withCustomServices = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, Scope.Scope | R> => Effect.gen(function* () {
  // Services are automatically restored when scope closes
  yield* Effect.withClockScoped(customClock)
  yield* Effect.withRandomScoped(testableRandom)
  
  return yield* effect
})
```

### Feature 2: Configuration Provider Customization

#### Environment-Specific Configuration

```typescript
import { ConfigProvider, Effect, Layer } from "effect"

const createEnvironmentConfig = (env: "development" | "production" | "test") => {
  const baseConfig = new Map([
    ["APP_NAME", "MyApp"],
    ["LOG_LEVEL", env === "production" ? "info" : "debug"],
    ["CACHE_TTL", env === "test" ? "0" : "3600"],
    ["API_TIMEOUT", "30000"]
  ])
  
  return ConfigProvider.fromMap(baseConfig)
}

const withEnvironmentConfig = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  env: "development" | "production" | "test"
): Effect.Effect<A, E, R> => effect.pipe(
  Effect.withConfigProvider(createEnvironmentConfig(env))
)

// Usage
const loadConfiguration = Effect.gen(function* () {
  const appName = yield* Effect.config(Config.string("APP_NAME"))
  const logLevel = yield* Effect.config(Config.string("LOG_LEVEL"))
  const cacheTtl = yield* Effect.config(Config.integer("CACHE_TTL"))
  
  return { appName, logLevel, cacheTtl }
})

const developmentConfig = withEnvironmentConfig(loadConfiguration, "development")
const productionConfig = withEnvironmentConfig(loadConfiguration, "production")
```

#### Advanced Configuration with Validation

```typescript
const createValidatedConfig = <A>(
  key: string,
  schema: Schema.Schema<A, string>
) => Effect.gen(function* () {
  const rawValue = yield* Effect.config(Config.string(key))
  return yield* Schema.decodeUnknown(schema)(rawValue)
})

const ServerConfig = Schema.Struct({
  host: Schema.String.pipe(Schema.nonEmpty()),
  port: Schema.Number.pipe(Schema.int(), Schema.between(1, 65535)),
  ssl: Schema.Boolean
})

const loadServerConfig = Effect.gen(function* () {
  const host = yield* createValidatedConfig("SERVER_HOST", Schema.String)
  const port = yield* createValidatedConfig("SERVER_PORT", Schema.NumberFromString)
  const ssl = yield* createValidatedConfig("SERVER_SSL", Schema.BooleanFromString)
  
  return yield* Schema.decodeUnknown(ServerConfig)({ host, port, ssl })
})
```

### Feature 3: Advanced Tracing Integration

#### Custom Span Creation with Default Tracer

```typescript
const withBusinessSpan = <A, E, R>(
  name: string,
  effect: Effect.Effect<A, E, R>,
  attributes?: Record<string, string | number | boolean>
): Effect.Effect<A, E, R> => effect.pipe(
  Effect.withSpan(name, { attributes }),
  Effect.annotateSpans({ "service.name": "business-logic" })
)

const complexBusinessOperation = (userId: string, operationType: string) => 
  withBusinessSpan(
    "complex-business-operation",
    Effect.gen(function* () {
      yield* Effect.sleep("100 millis")
      
      const subOperation1 = yield* withBusinessSpan(
        "sub-operation-1",
        Effect.gen(function* () {
          const random = yield* Effect.nextInt
          yield* Effect.sleep("50 millis")
          return random
        }),
        { "operation.step": "1" }
      )
      
      const subOperation2 = yield* withBusinessSpan(
        "sub-operation-2", 
        Effect.gen(function* () {
          yield* Effect.sleep("75 millis")
          return subOperation1 * 2
        }),
        { "operation.step": "2" }
      )
      
      return { userId, operationType, result: subOperation2 }
    }),
    { 
      "user.id": userId,
      "operation.type": operationType
    }
  )
```

## Practical Patterns & Best Practices

### Pattern 1: Service Composition Helper

```typescript
// Helper for creating service-dependent effects
const withServices = <A, E, R>(
  f: (services: {
    time: () => Effect.Effect<number>
    random: () => Effect.Effect<number>
    sleep: (ms: number) => Effect.Effect<void>
    log: (message: string) => Effect.Effect<void>
  }) => Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> => f({
  time: () => Effect.currentTimeMillis,
  random: () => Effect.nextInt,
  sleep: (ms) => Effect.sleep(`${ms} millis`),
  log: (message) => Effect.log(message)
})

// Usage
const businessLogicWithServices = withServices(({ time, random, sleep, log }) => 
  Effect.gen(function* () {
    const start = yield* time()
    yield* log(`Operation started at ${start}`)
    
    const delay = yield* random()
    yield* sleep(delay % 1000)
    
    const end = yield* time()
    yield* log(`Operation completed in ${end - start}ms`)
    
    return "success"
  })
)
```

### Pattern 2: Testable Service Factory

```typescript
interface ServiceTestConfig {
  readonly fixedTime?: number
  readonly fixedRandom?: number
  readonly mockLogs?: boolean
  readonly noSleep?: boolean
}

const createTestableServices = (config: ServiceTestConfig = {}) => {
  const services: Array<Layer.Layer<any, never, never>> = []
  
  if (config.fixedTime !== undefined) {
    const testClock = Clock.make(() => ({
      currentTimeMillis: Effect.succeed(config.fixedTime),
      currentTimeNanos: Effect.succeed(BigInt(config.fixedTime * 1000000)),
      sleep: config.noSleep ? () => Effect.void : undefined
    }))
    services.push(Layer.succeed(Clock.Clock, testClock))
  }
  
  if (config.fixedRandom !== undefined) {
    const testRandom = Random.make(() => config.fixedRandom)
    services.push(Layer.succeed(Random.Random, testRandom))
  }
  
  if (config.mockLogs) {
    const mockConsole = Console.make({
      assert: () => Effect.void,
      clear: () => Effect.void,
      count: () => Effect.void,
      countReset: () => Effect.void,
      debug: () => Effect.void,
      dir: () => Effect.void,
      dirxml: () => Effect.void,
      error: () => Effect.void,
      group: () => Effect.void,
      groupCollapsed: () => Effect.void,
      groupEnd: () => Effect.void,
      info: () => Effect.void,
      log: () => Effect.void,
      table: () => Effect.void,
      time: () => Effect.void,
      timeEnd: () => Effect.void,
      timeLog: () => Effect.void,
      trace: () => Effect.void,
      warn: () => Effect.void
    })
    services.push(Layer.succeed(Console.Console, mockConsole))
  }
  
  return services.length > 0 ? Layer.mergeAll(...services) : Layer.empty
}

// Usage in tests
const testEffect = businessLogicWithServices.pipe(
  Effect.provide(createTestableServices({
    fixedTime: 1234567890,
    fixedRandom: 0.5,
    mockLogs: true,
    noSleep: true
  }))
)
```

### Pattern 3: Configuration-Driven Service Builder

```typescript
const createApplicationServices = Effect.gen(function* () {
  // Load configuration
  const logLevel = yield* Effect.config(
    Config.string("LOG_LEVEL").pipe(Config.withDefault("info"))
  )
  const enableTracing = yield* Effect.config(
    Config.boolean("ENABLE_TRACING").pipe(Config.withDefault(true))
  )
  const randomSeed = yield* Effect.config(
    Config.optional(Config.number("RANDOM_SEED"))
  )
  
  // Create services based on configuration
  const services: Array<Layer.Layer<any, never, never>> = []
  
  // Custom console based on log level
  if (logLevel === "silent") {
    const silentConsole = Console.make({
      assert: () => Effect.void,
      clear: () => Effect.void,
      count: () => Effect.void,
      countReset: () => Effect.void,
      debug: () => Effect.void,
      dir: () => Effect.void,
      dirxml: () => Effect.void,
      error: () => Effect.void,
      group: () => Effect.void,
      groupCollapsed: () => Effect.void,
      groupEnd: () => Effect.void,
      info: () => Effect.void,
      log: () => Effect.void,
      table: () => Effect.void,
      time: () => Effect.void,
      timeEnd: () => Effect.void,
      timeLog: () => Effect.void,
      trace: () => Effect.void,
      warn: () => Effect.void
    })
    services.push(Layer.succeed(Console.Console, silentConsole))
  }
  
  // Custom random with seed
  if (randomSeed !== undefined) {
    const seededRandom = Random.make(() => randomSeed)
    services.push(Layer.succeed(Random.Random, seededRandom))
  }
  
  return services.length > 0 ? Layer.mergeAll(...services) : Layer.empty
})

const ApplicationServiceLayer = Layer.fromEffect(
  Context.GenericTag("ApplicationServices"), 
  createApplicationServices
)
```

## Integration Examples

### Integration with Express.js Server

```typescript
import express from "express"
import { Effect, Context, Layer } from "effect"

interface ExpressContext {
  readonly request: express.Request
  readonly response: express.Response
}

const ExpressContextTag = Context.GenericTag<ExpressContext>("ExpressContext")

const createExpressHandler = <E>(
  effect: Effect.Effect<unknown, E, ExpressContext>
) => (req: express.Request, res: express.Response) => {
  const context: ExpressContext = { request: req, response: res }
  
  const program = effect.pipe(
    Effect.provideService(ExpressContextTag, context),
    Effect.catchAll((error) => Effect.gen(function* () {
      yield* Effect.log(`Request failed: ${String(error)}`)
      res.status(500).json({ error: "Internal server error" })
      return undefined
    }))
  )
  
  Effect.runPromise(program)
}

const healthCheckHandler = createExpressHandler(
  Effect.gen(function* () {
    const { response } = yield* ExpressContextTag
    const timestamp = yield* Effect.currentTimeMillis
    const requestId = yield* Effect.gen(function* () {
      const random = yield* Effect.nextIntBetween(1000, 9999)
      return `health_${timestamp}_${random}`
    })
    
    yield* Effect.log(`Health check request: ${requestId}`)
    
    response.json({
      status: "healthy",
      timestamp,
      requestId
    })
  })
)

// Express app setup
const app = express()
app.get("/health", healthCheckHandler)
```

### Integration with Node.js File System Operations

```typescript
import * as fs from "fs/promises"
import * as path from "path"

const readFileWithMetrics = (filePath: string) => Effect.gen(function* () {
  const startTime = yield* Effect.currentTimeMillis
  const operationId = yield* Effect.gen(function* () {
    const random = yield* Effect.nextIntBetween(1000, 9999)
    return `read_${random}`
  })
  
  yield* Effect.log(`Starting file read operation ${operationId}: ${filePath}`)
  
  const content = yield* Effect.tryPromise({
    try: () => fs.readFile(filePath, "utf-8"),
    catch: (error) => new Error(`Failed to read file: ${String(error)}`)
  })
  
  const endTime = yield* Effect.currentTimeMillis
  const duration = endTime - startTime
  
  yield* Effect.log(`File read completed ${operationId} in ${duration}ms`)
  
  return {
    content,
    metadata: {
      filePath,
      operationId,
      duration,
      size: content.length
    }
  }
})

const writeFileWithBackup = (filePath: string, content: string) => Effect.gen(function* () {
  const timestamp = yield* Effect.currentTimeMillis
  const backupPath = `${filePath}.backup.${timestamp}`
  
  yield* Effect.log(`Creating backup: ${backupPath}`)
  
  // Check if original file exists
  const exists = yield* Effect.tryPromise({
    try: () => fs.access(filePath).then(() => true),
    catch: () => false
  })
  
  // Create backup if file exists
  if (exists) {
    yield* Effect.tryPromise({
      try: () => fs.copyFile(filePath, backupPath),
      catch: (error) => new Error(`Failed to create backup: ${String(error)}`)
    })
    yield* Effect.log(`Backup created: ${backupPath}`)
  }
  
  // Write new content
  yield* Effect.tryPromise({
    try: () => fs.writeFile(filePath, content, "utf-8"),
    catch: (error) => new Error(`Failed to write file: ${String(error)}`)
  })
  
  yield* Effect.log(`File written successfully: ${filePath}`)
  
  return { filePath, backupPath: exists ? backupPath : undefined }
})
```

### Testing Strategies

```typescript
import { Effect, TestClock, TestRandom, TestConsole } from "effect/Test"

// Test helper for deterministic effects
const runTestEffect = <A, E>(
  effect: Effect.Effect<A, E>,
  config: {
    fixedTime?: number
    fixedRandom?: number
    captureLogs?: boolean
  } = {}
) => Effect.gen(function* () {
  const testLayer = Layer.mergeAll(
    config.fixedTime !== undefined ? TestClock.layer(config.fixedTime) : Layer.empty,
    config.fixedRandom !== undefined ? TestRandom.layer(config.fixedRandom) : Layer.empty,
    config.captureLogs ? TestConsole.layer : Layer.empty
  )
  
  return yield* effect.pipe(Effect.provide(testLayer))
})

// Example test
const testBusinessLogic = Effect.gen(function* () {
  const result = yield* runTestEffect(
    processUserRequest("test-user"),
    {
      fixedTime: 1234567890,
      fixedRandom: 0.5,
      captureLogs: true
    }
  )
  
  // Verify result
  console.assert(result.id === "test-user")
  console.assert(result.email === "usertest-user@example.com")
  
  // Access captured logs if needed
  const logs = yield* TestConsole.output
  console.assert(logs.length > 0)
  
  return "test passed"
})
```

## Conclusion

DefaultServices provides seamless access to fundamental runtime services, eliminating boilerplate while maintaining full composability and testability for Effect applications.

Key benefits:
- **Zero Configuration** - Services work out of the box with sensible defaults
- **Full Composability** - Services can be replaced or customized for any scope
- **Testing Friendly** - Easy to mock and control for deterministic tests
- **Production Ready** - Built-in implementations suitable for real applications
- **Type Safe** - Full TypeScript support with proper error handling

DefaultServices is essential for any Effect application that needs time, randomness, configuration, logging, or tracing capabilities without the overhead of manual service management.