# LogLevel: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem LogLevel Solves

Managing logging in applications is a constant challenge. Too much logging clutters output and hurts performance. Too little logging makes debugging impossible. Traditional approaches lead to several problems:

```typescript
// Traditional approach - scattered logging with hardcoded levels
class UserService {
  async createUser(userData: any) {
    console.log("Creating user:", userData) // Always logs
    
    try {
      const user = await this.validateUser(userData)
      console.log("User validated") // Always logs
      
      const saved = await this.saveUser(user)
      console.log("User saved:", saved.id) // Always logs
      
      return saved
    } catch (error) {
      console.error("Failed to create user:", error) // Always logs
      throw error
    }
  }
}
```

This approach leads to:
- **No Level Control** - All logs appear regardless of environment or needs
- **Performance Impact** - Expensive logging operations run in production
- **Debugging Nightmare** - Can't adjust verbosity without changing code
- **Maintenance Burden** - Scattered logging logic throughout the codebase

### The LogLevel Solution

LogLevel provides a structured approach to logging with built-in level hierarchy and filtering capabilities:

```typescript
import { Effect, LogLevel, Logger } from "effect"

const createUser = (userData: any) => Effect.gen(function* () {
  yield* Effect.logDebug("Creating user with data:", userData)
  
  const user = yield* validateUser(userData)
  yield* Effect.logInfo("User validation successful")
  
  const saved = yield* saveUser(user)
  yield* Effect.logInfo("User created successfully", { userId: saved.id })
  
  return saved
}).pipe(
  Effect.catchAll((error) => Effect.gen(function* () {
    yield* Effect.logError("Failed to create user:", error)
    return yield* Effect.fail(error)
  }))
)

// Control logging levels without changing business logic
const program = createUser(userData).pipe(
  Logger.withMinimumLogLevel(LogLevel.Info) // Only Info and above
)
```

### Key Concepts

**Log Level Hierarchy**: LogLevel provides a structured hierarchy from most verbose (All) to least verbose (None), with each level including all higher-priority levels.

**Ordinal-Based Filtering**: Each level has a numeric ordinal value that enables efficient comparison and filtering operations.

**Environment-Aware Logging**: Easily adjust logging verbosity based on deployment environment without code changes.

**Performance Optimization**: Log messages below the minimum level are filtered out before expensive operations occur.

## Basic Usage Patterns

### Pattern 1: Setting Minimum Log Levels

```typescript
import { Effect, LogLevel, Logger } from "effect"

// Development environment - verbose logging
const developmentProgram = someEffect.pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug)
)

// Production environment - essential logs only
const productionProgram = someEffect.pipe(
  Logger.withMinimumLogLevel(LogLevel.Warning)
)

// Silent mode - no logging
const silentProgram = someEffect.pipe(
  Logger.withMinimumLogLevel(LogLevel.None)
)
```

### Pattern 2: Temporary Level Changes

```typescript
import { Effect, LogLevel } from "effect"

const debugSpecificOperation = Effect.gen(function* () {
  yield* Effect.logInfo("Starting operation")
  
  // Temporarily enable debug logging for this section
  yield* Effect.gen(function* () {
    yield* Effect.logDebug("Detailed step 1")
    yield* Effect.logDebug("Detailed step 2")
    yield* Effect.logDebug("Detailed step 3")
  }).pipe(LogLevel.locally(LogLevel.Debug))
  
  yield* Effect.logInfo("Operation completed")
})
```

### Pattern 3: Level-Based Conditional Logic

```typescript
import { Effect, LogLevel } from "effect"

const conditionalLogging = (level: LogLevel.LogLevel) => Effect.gen(function* () {
  // Only perform expensive logging operations when needed
  if (LogLevel.lessThanEqual(LogLevel.Debug, level)) {
    const debugInfo = yield* collectDebugInformation()
    yield* Effect.logDebug("Debug info:", debugInfo)
  }
  
  if (LogLevel.lessThanEqual(LogLevel.Info, level)) {
    yield* Effect.logInfo("Operation summary")
  }
})
```

## Real-World Examples

### Example 1: Environment-Specific API Service

Here's how to implement adaptive logging for different deployment environments:

```typescript
import { Effect, LogLevel, Logger, Config } from "effect"

interface ApiService {
  fetchUser: (id: string) => Effect.Effect<User, ApiError>
  createUser: (data: CreateUserData) => Effect.Effect<User, ApiError>
}

const makeApiService = Effect.gen(function* () {
  const baseUrl = yield* Config.string("API_BASE_URL")
  const httpClient = yield* HttpClient.HttpClient
  
  const fetchUser = (id: string) => Effect.gen(function* () {
    yield* Effect.logDebug("Fetching user", { userId: id, url: `${baseUrl}/users/${id}` })
    
    const startTime = yield* Clock.currentTimeMillis
    const response = yield* HttpClient.get(`${baseUrl}/users/${id}`).pipe(
      HttpClient.withClient(httpClient),
      Effect.catchTag("HttpError", (error) => Effect.gen(function* () {
        yield* Effect.logError("HTTP request failed", { error, userId: id })
        return yield* Effect.fail(new ApiError("Failed to fetch user"))
      }))
    )
    
    const endTime = yield* Clock.currentTimeMillis
    yield* Effect.logInfo("User fetched successfully", { 
      userId: id, 
      duration: endTime - startTime 
    })
    
    return yield* Effect.succeed(response as User)
  })
  
  const createUser = (data: CreateUserData) => Effect.gen(function* () {
    // Detailed logging for debugging
    yield* Effect.logDebug("Creating user", { 
      email: data.email, 
      metadata: data.metadata 
    })
    
    // Validation step with trace-level logging
    yield* Effect.logTrace("Validating user data", { schema: "UserCreateSchema" })
    const validatedData = yield* validateUserData(data)
    
    // API call with performance monitoring
    const startTime = yield* Clock.currentTimeMillis
    const response = yield* HttpClient.post(`${baseUrl}/users`, validatedData).pipe(
      HttpClient.withClient(httpClient),
      Effect.tap(() => Effect.logTrace("User creation request sent")),
      Effect.catchTag("HttpError", (error) => Effect.gen(function* () {
        yield* Effect.logError("User creation failed", { error, email: data.email })
        return yield* Effect.fail(new ApiError("Failed to create user"))
      }))
    )
    
    const endTime = yield* Clock.currentTimeMillis
    yield* Effect.logInfo("User created successfully", { 
      userId: response.id, 
      email: data.email,
      duration: endTime - startTime 
    })
    
    return response as User
  })
  
  return { fetchUser, createUser } as const satisfies ApiService
})

// Environment-specific configuration
const developmentLayer = Layer.succeed(ApiService, makeApiService).pipe(
  Layer.provide(Logger.replace(
    Logger.defaultLogger,
    Logger.make(({ logLevel, message }) => {
      console.log(`[${logLevel.label}] ${message}`)
    })
  )),
  Logger.withMinimumLogLevel(LogLevel.Debug) // Verbose logging in development
)

const productionLayer = Layer.succeed(ApiService, makeApiService).pipe(
  Layer.provide(Logger.replace(
    Logger.defaultLogger,
    Logger.make(({ logLevel, message, date }) => {
      // Structured logging for production
      console.log(JSON.stringify({
        timestamp: date.toISOString(),
        level: logLevel.label,
        message,
        service: "api-service"
      }))
    })
  )),
  Logger.withMinimumLogLevel(LogLevel.Info) // Essential logs only in production
)
```

### Example 2: Performance-Sensitive Data Processing

This example shows how to use LogLevel for performance-sensitive operations:

```typescript
import { Effect, LogLevel, Logger, Stream } from "effect"

interface ProcessingMetrics {
  recordsProcessed: number
  errors: number
  duration: number
}

const processLargeDataset = (data: ReadonlyArray<DataRecord>) => Effect.gen(function* () {
  const startTime = yield* Clock.currentTimeMillis
  let recordsProcessed = 0
  let errors = 0
  
  yield* Effect.logInfo("Starting data processing", { 
    totalRecords: data.length 
  })
  
  // Process data in batches with selective logging
  yield* Stream.fromIterable(data).pipe(
    Stream.mapChunks((chunk) => Effect.gen(function* () {
      const currentLevel = yield* FiberRef.get(Logger.currentLogLevel)
      
      // Only log batch details if debug level is enabled
      if (LogLevel.lessThanEqual(LogLevel.Debug, currentLevel)) {
        yield* Effect.logDebug("Processing batch", { 
          batchSize: chunk.length,
          processed: recordsProcessed 
        })
      }
      
      return yield* Effect.forEach(chunk, (record) => Effect.gen(function* () {
        // Trace-level logging for individual records (very verbose)
        yield* Effect.logTrace("Processing record", { recordId: record.id })
        
        const result = yield* processRecord(record).pipe(
          Effect.catchAll((error) => Effect.gen(function* () {
            errors++
            yield* Effect.logWarning("Record processing failed", { 
              recordId: record.id, 
              error: error.message 
            })
            return yield* Effect.succeed(null) // Continue processing
          }))
        )
        
        if (result !== null) {
          recordsProcessed++
          
          // Periodic progress logging
          if (recordsProcessed % 1000 === 0) {
            yield* Effect.logInfo("Processing progress", { 
              processed: recordsProcessed,
              total: data.length,
              percentage: Math.round((recordsProcessed / data.length) * 100)
            })
          }
        }
        
        return result
      }))
    })),
    Stream.runCollect
  )
  
  const endTime = yield* Clock.currentTimeMillis
  const metrics: ProcessingMetrics = {
    recordsProcessed,
    errors,
    duration: endTime - startTime
  }
  
  yield* Effect.logInfo("Data processing completed", metrics)
  
  return metrics
})

// Configure for different performance requirements
const developmentProcessing = processLargeDataset(data).pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug) // Full visibility for debugging
)

const productionProcessing = processLargeDataset(data).pipe(
  Logger.withMinimumLogLevel(LogLevel.Info) // Progress updates only
)

const performanceCritical = processLargeDataset(data).pipe(
  Logger.withMinimumLogLevel(LogLevel.Error) // Errors only
)
```

### Example 3: Structured Logging with Service Dependencies

A complete example showing how LogLevel integrates with service architecture:

```typescript
import { Effect, LogLevel, Logger, Layer, Context } from "effect"

interface DatabaseService {
  query: <T>(sql: string, params: unknown[]) => Effect.Effect<T[], DatabaseError>
  transaction: <T>(fn: Effect.Effect<T, DatabaseError>) => Effect.Effect<T, DatabaseError>
}

interface CacheService {
  get: <T>(key: string) => Effect.Effect<Option.Option<T>, CacheError>
  set: <T>(key: string, value: T, ttl?: number) => Effect.Effect<void, CacheError>
}

interface UserRepository {
  findById: (id: string) => Effect.Effect<Option.Option<User>, RepositoryError>
  create: (user: CreateUserData) => Effect.Effect<User, RepositoryError>
}

const makeUserRepository = Effect.gen(function* () {
  const db = yield* DatabaseService
  const cache = yield* CacheService
  
  const findById = (id: string) => Effect.gen(function* () {
    yield* Effect.logDebug("Looking up user", { userId: id, source: "cache" })
    
    // Try cache first
    const cached = yield* cache.get<User>(`user:${id}`).pipe(
      Effect.tap((result) => {
        if (Option.isSome(result)) {
          return Effect.logDebug("User found in cache", { userId: id })
        } else {
          return Effect.logDebug("User not found in cache", { userId: id })
        }
      }),
      Effect.catchAll((error) => Effect.gen(function* () {
        yield* Effect.logWarning("Cache lookup failed", { userId: id, error })
        return yield* Effect.succeed(Option.none())
      }))
    )
    
    if (Option.isSome(cached)) {
      return cached
    }
    
    // Fallback to database
    yield* Effect.logDebug("Looking up user", { userId: id, source: "database" })
    
    const users = yield* db.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    ).pipe(
      Effect.tap((results) => 
        Effect.logTrace("Database query completed", { 
          userId: id, 
          resultCount: results.length 
        })
      ),
      Effect.catchTag("DatabaseError", (error) => Effect.gen(function* () {
        yield* Effect.logError("Database query failed", { userId: id, error })
        return yield* Effect.fail(new RepositoryError("Database query failed"))
      }))
    )
    
    const user = users.length > 0 ? Option.some(users[0]) : Option.none()
    
    // Cache the result
    if (Option.isSome(user)) {
      yield* cache.set(`user:${id}`, user.value, 300).pipe(
        Effect.tap(() => Effect.logDebug("User cached", { userId: id })),
        Effect.catchAll((error) => 
          Effect.logWarning("Failed to cache user", { userId: id, error })
        )
      )
    }
    
    return user
  })
  
  const create = (userData: CreateUserData) => Effect.gen(function* () {
    yield* Effect.logInfo("Creating new user", { email: userData.email })
    
    const user = yield* db.transaction(Effect.gen(function* () {
      yield* Effect.logDebug("Starting user creation transaction")
      
      // Check if user already exists
      const existing = yield* db.query<User>(
        "SELECT id FROM users WHERE email = $1",
        [userData.email]
      ).pipe(
        Effect.tap((results) => 
          Effect.logTrace("Duplicate check completed", { 
            email: userData.email, 
            found: results.length > 0 
          })
        )
      )
      
      if (existing.length > 0) {
        yield* Effect.logWarning("User already exists", { email: userData.email })
        return yield* Effect.fail(new RepositoryError("User already exists"))
      }
      
      // Insert new user
      const newUsers = yield* db.query<User>(
        "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
        [userData.email, userData.name]
      ).pipe(
        Effect.tap(() => Effect.logDebug("User inserted successfully"))
      )
      
      return newUsers[0]
    })).pipe(
      Effect.tap((user) => 
        Effect.logInfo("User created successfully", { 
          userId: user.id, 
          email: user.email 
        })
      ),
      Effect.catchTag("DatabaseError", (error) => Effect.gen(function* () {
        yield* Effect.logError("User creation failed", { 
          email: userData.email, 
          error 
        })
        return yield* Effect.fail(new RepositoryError("Failed to create user"))
      }))
    )
    
    return user
  })
  
  return { findById, create } as const satisfies UserRepository
})

// Layer composition with different logging levels
const developmentUserService = Layer.effect(UserRepository, makeUserRepository).pipe(
  Layer.provide(DatabaseService.Live),
  Layer.provide(CacheService.Live),
  Logger.withMinimumLogLevel(LogLevel.Debug)
)

const productionUserService = Layer.effect(UserRepository, makeUserRepository).pipe(
  Layer.provide(DatabaseService.Live),
  Layer.provide(CacheService.Live),
  Logger.withMinimumLogLevel(LogLevel.Info)
)

const testingUserService = Layer.effect(UserRepository, makeUserRepository).pipe(
  Layer.provide(DatabaseService.Test),
  Layer.provide(CacheService.Test),
  Logger.withMinimumLogLevel(LogLevel.Warning)
)
```

## Advanced Features Deep Dive

### Feature 1: Level Comparison and Ordering

LogLevel provides a complete ordering system for programmatic level comparison:

#### Basic Level Comparison

```typescript
import { LogLevel } from "effect"

// Check if one level is less verbose than another
const isLessVerbose = LogLevel.lessThan(LogLevel.Info, LogLevel.Debug) // true
const isMoreVerbose = LogLevel.greaterThan(LogLevel.Debug, LogLevel.Info) // true

// Check if level meets minimum threshold
const meetsThreshold = LogLevel.greaterThanEqual(LogLevel.Error, LogLevel.Warning) // true
```

#### Real-World Level Comparison Example

```typescript
import { Effect, LogLevel, FiberRef } from "effect"

const adaptiveLogging = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  expensiveLogData: () => unknown
) => Effect.gen(function* () {
  const currentLevel = yield* FiberRef.get(Logger.currentLogLevel)
  
  // Only compute expensive log data if it will be used
  if (LogLevel.lessThanEqual(LogLevel.Debug, currentLevel)) {
    const debugData = expensiveLogData()
    yield* Effect.logDebug("Expensive debug info", debugData)
  }
  
  return yield* effect
})

// Usage
const result = adaptiveLogging(
  complexComputation(),
  () => ({
    memoryUsage: process.memoryUsage(),
    performanceMetrics: collectMetrics(),
    systemStats: getSystemStats()
  })
)
```

### Feature 2: Custom Level Filtering

Create sophisticated filtering logic for different scenarios:

```typescript
import { Effect, LogLevel, Logger, Option } from "effect"

// Custom logger that filters based on multiple criteria
const makeConditionalLogger = (
  shouldLog: (level: LogLevel.LogLevel, message: string) => boolean
) => Logger.make<string, Option.Option<void>>(({ logLevel, message }) => {
  if (shouldLog(logLevel, message)) {
    console.log(`[${logLevel.label}] ${message}`)
    return Option.some(undefined)
  }
  return Option.none()
})

// Example: Only log errors for specific modules
const moduleAwareLogger = makeConditionalLogger((level, message) => {
  // Always log errors and warnings
  if (LogLevel.greaterThanEqual(level, LogLevel.Warning)) {
    return true
  }
  
  // Only log debug info for specific modules
  if (LogLevel.equal(level, LogLevel.Debug)) {
    return message.includes("[UserService]") || message.includes("[PaymentService]")
  }
  
  // Default to info level and above
  return LogLevel.greaterThanEqual(level, LogLevel.Info)
})

// Use the custom logger
const program = userServiceOperation.pipe(
  Effect.provide(Logger.replace(Logger.defaultLogger, moduleAwareLogger))
)
```

### Feature 3: Dynamic Level Adjustment

Implement runtime level adjustment for monitoring and debugging:

```typescript
import { Effect, LogLevel, Ref, Schedule } from "effect"

interface LoggingConfig {
  currentLevel: LogLevel.LogLevel
  autoAdjust: boolean
  errorThreshold: number
}

const makeDynamicLogger = Effect.gen(function* () {
  const config = yield* Ref.make<LoggingConfig>({
    currentLevel: LogLevel.Info,
    autoAdjust: true,
    errorThreshold: 10
  })
  
  const errorCount = yield* Ref.make(0)
  
  // Background task to adjust logging level based on error rate
  const adjustmentTask = Effect.gen(function* () {
    const currentConfig = yield* Ref.get(config)
    const errors = yield* Ref.get(errorCount)
    
    if (currentConfig.autoAdjust && errors > currentConfig.errorThreshold) {
      // Increase logging verbosity when errors are high
      yield* Ref.set(config, {
        ...currentConfig,
        currentLevel: LogLevel.Debug
      })
      yield* Effect.logInfo("Increased logging verbosity due to high error rate")
      yield* Ref.set(errorCount, 0) // Reset counter
    } else if (currentConfig.autoAdjust && errors === 0) {
      // Reduce logging verbosity when system is stable
      yield* Ref.set(config, {
        ...currentConfig,
        currentLevel: LogLevel.Info
      })
    }
  }).pipe(
    Effect.repeat(Schedule.fixed("30 seconds")),
    Effect.fork
  )
  
  const logger = Logger.make(({ logLevel, message }) => {
    // Count errors for auto-adjustment
    if (LogLevel.greaterThanEqual(logLevel, LogLevel.Error)) {
      Ref.update(errorCount, (count) => count + 1)
    }
    
    console.log(`[${logLevel.label}] ${message}`)
  })
  
  return { logger, adjustmentTask, config }
})

// Usage with dynamic adjustment
const applicationWithDynamicLogging = Effect.gen(function* () {
  const { logger, adjustmentTask, config } = yield* makeDynamicLogger
  
  // Run the application with dynamic logging
  return yield* mainApplication.pipe(
    Effect.provide(Logger.replace(Logger.defaultLogger, logger)),
    Effect.race(adjustmentTask)
  )
})
```

## Practical Patterns & Best Practices

### Pattern 1: Environment-Based Configuration

Create a flexible configuration system for different environments:

```typescript
import { Effect, LogLevel, Config, Logger } from "effect"

// Configuration schema
const LoggingConfig = Config.all({
  level: Config.logLevel("LOG_LEVEL").pipe(Config.withDefault(LogLevel.Info)),
  format: Config.string("LOG_FORMAT").pipe(Config.withDefault("json")),
  enableConsole: Config.boolean("ENABLE_CONSOLE_LOGGING").pipe(Config.withDefault(true)),
  enableFile: Config.boolean("ENABLE_FILE_LOGGING").pipe(Config.withDefault(false))
})

const makeEnvironmentLogger = Effect.gen(function* () {
  const config = yield* LoggingConfig
  
  const formatMessage = (options: Logger.Options<string>) => {
    if (config.format === "json") {
      return JSON.stringify({
        timestamp: options.date.toISOString(),
        level: options.logLevel.label,
        message: options.message,
        fiberId: options.fiberId,
        ...(options.cause._tag !== "Empty" && { error: options.cause })
      })
    } else {
      return `${options.date.toISOString()} [${options.logLevel.label}] ${options.message}`
    }
  }
  
  const logger = Logger.make<string, void>((options) => {
    const formatted = formatMessage(options)
    
    if (config.enableConsole) {
      console.log(formatted)
    }
    
    if (config.enableFile) {
      // File logging implementation would go here
      // writeToFile(formatted)
    }
  })
  
  return Logger.replace(Logger.defaultLogger, logger).pipe(
    Logger.withMinimumLogLevel(config.level)
  )
})

// Usage in different environments
const productionApp = app.pipe(
  Effect.provide(makeEnvironmentLogger)
)

// Override for testing
const testApp = app.pipe(
  Effect.provide(makeEnvironmentLogger),
  Logger.withMinimumLogLevel(LogLevel.Error) // Override for tests
)
```

### Pattern 2: Structured Logging with Context

Implement contextual logging that carries information through the Effect chain:

```typescript
import { Effect, LogLevel, Logger, Context } from "effect"

// Define context for logging
interface LogContext {
  requestId: string
  userId?: string
  operation: string
}

const LogContext = Context.GenericTag<LogContext>("LogContext")

// Helper to create enriched loggers
const withLogContext = (context: LogContext) => 
  Logger.mapInputOptions<string, string>((options) => ({
    ...options,
    message: `[${context.requestId}] [${context.operation}] ${options.message}`,
    annotations: options.annotations.pipe(
      HashMap.set("requestId", context.requestId),
      HashMap.set("operation", context.operation),
      context.userId ? HashMap.set("userId", context.userId) : identity
    )
  }))

// Business logic with contextual logging
const processUserRequest = (requestId: string, userId: string, operation: string) => 
  Effect.gen(function* () {
    const context = { requestId, userId, operation }
    
    yield* Effect.logInfo("Processing request")
    
    const user = yield* fetchUser(userId).pipe(
      Effect.tap((user) => Effect.logDebug("User fetched", { email: user.email })),
      Effect.catchAll((error) => Effect.gen(function* () {
        yield* Effect.logError("Failed to fetch user", { error })
        return yield* Effect.fail(error)
      }))
    )
    
    const result = yield* performOperation(operation, user).pipe(
      Effect.tap(() => Effect.logInfo("Operation completed successfully")),
      Effect.catchAll((error) => Effect.gen(function* () {
        yield* Effect.logError("Operation failed", { error })
        return yield* Effect.fail(error)
      }))
    )
    
    return result
  }).pipe(
    Effect.provide(Logger.add(withLogContext(context)))
  )
```

### Pattern 3: Performance-Aware Logging

Implement logging that adapts to performance requirements:

```typescript
import { Effect, LogLevel, Logger, Duration, Schedule } from "effect"

// Performance monitoring wrapper
const withPerformanceLogging = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  operationName: string,
  slowThreshold: Duration.DurationInput = "1 second"
) => Effect.gen(function* () {
  const startTime = yield* Clock.currentTimeMillis
  
  yield* Effect.logDebug("Starting operation", { operation: operationName })
  
  const result = yield* effect.pipe(
    Effect.tap(() => Effect.gen(function* () {
      const endTime = yield* Clock.currentTimeMillis
      const duration = endTime - startTime
      const durationMs = Duration.toMillis(Duration.millis(duration))
      const slowMs = Duration.toMillis(Duration.decode(slowThreshold))
      
      if (durationMs > slowMs) {
        yield* Effect.logWarning("Slow operation detected", {
          operation: operationName,
          duration: durationMs,
          threshold: slowMs
        })
      } else {
        yield* Effect.logDebug("Operation completed", {
          operation: operationName,
          duration: durationMs
        })
      }
    })),
    Effect.catchAll((error) => Effect.gen(function* () {
      const endTime = yield* Clock.currentTimeMillis
      const duration = endTime - startTime
      
      yield* Effect.logError("Operation failed", {
        operation: operationName,
        duration: Duration.toMillis(Duration.millis(duration)),
        error
      })
      
      return yield* Effect.fail(error)
    }))
  )
  
  return result
})

// Usage
const optimizedDatabaseQuery = withPerformanceLogging(
  db.query("SELECT * FROM large_table WHERE complex_condition = ?", [param]),
  "complex_database_query",
  Duration.seconds(2)
)
```

## Integration Examples

### Integration with Express.js and HTTP Logging

```typescript
import { Effect, LogLevel, Logger } from "effect"
import express from "express"

// Express middleware for Effect-based logging
const effectLoggingMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = Math.random().toString(36).substr(2, 9)
  const startTime = Date.now()
  
  // Create request-scoped logger
  const requestLogger = Logger.make<string, void>(({ logLevel, message }) => {
    console.log(`[${requestId}] [${logLevel.label}] ${message}`)
  })
  
  // Add request logging
  const logRequest = Effect.gen(function* () {
    yield* Effect.logInfo("Incoming request", {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    })
  })
  
  // Add response logging  
  const originalSend = res.send
  res.send = function(data) {
    const duration = Date.now() - startTime
    
    const logResponse = Effect.gen(function* () {
      const level = res.statusCode >= 400 ? LogLevel.Error : 
                    res.statusCode >= 300 ? LogLevel.Warning : LogLevel.Info
      
      yield* Effect.logInfo("Request completed", {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        responseSize: data ? data.length : 0
      })
    })
    
    Effect.runSync(logResponse.pipe(
      Effect.provide(Logger.replace(Logger.defaultLogger, requestLogger))
    ))
    
    return originalSend.call(this, data)
  }
  
  // Run request logging
  Effect.runSync(logRequest.pipe(
    Effect.provide(Logger.replace(Logger.defaultLogger, requestLogger))
  ))
  
  next()
}

// Usage with Express
const app = express()
app.use(effectLoggingMiddleware)

app.get('/users/:id', (req, res) => {
  const userId = req.params.id
  
  const program = Effect.gen(function* () {
    yield* Effect.logDebug("Fetching user", { userId })
    const user = yield* fetchUser(userId)
    yield* Effect.logInfo("User fetched successfully", { userId })
    return user
  })
  
  Effect.runPromise(program.pipe(
    Logger.withMinimumLogLevel(LogLevel.Debug)
  ))
  .then(user => res.json(user))
  .catch(error => {
    Effect.runSync(Effect.logError("Request failed", { error, userId }))
    res.status(500).json({ error: "Internal server error" })
  })
})
```

### Integration with Winston Logger

```typescript
import { Effect, LogLevel, Logger } from "effect"
import winston from "winston"

// Create Winston-compatible Effect logger
const createWinstonLogger = (winstonInstance: winston.Logger) => 
  Logger.make<string, void>(({ logLevel, message, date, annotations }) => {
    const level = logLevel.label.toLowerCase()
    const metadata = Object.fromEntries(annotations)
    
    winstonInstance.log({
      level,
      message,
      timestamp: date.toISOString(),
      ...metadata
    })
  })

// Configure Winston
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Application with Winston integration
const applicationWithWinston = Effect.gen(function* () {
  yield* Effect.logInfo("Application starting")
  
  const result = yield* mainBusinessLogic.pipe(
    Effect.catchAll((error) => Effect.gen(function* () {
      yield* Effect.logError("Application error", { error })
      return yield* Effect.fail(error)
    }))
  )
  
  yield* Effect.logInfo("Application completed successfully")
  return result
}).pipe(
  Effect.provide(Logger.replace(
    Logger.defaultLogger, 
    createWinstonLogger(winstonLogger)
  )),
  Logger.withMinimumLogLevel(LogLevel.Info)
)
```

### Testing Strategies

```typescript
import { Effect, LogLevel, Logger, TestContext } from "effect"

// Test logger that captures log messages
const createTestLogger = () => {
  const messages: Array<{ level: LogLevel.LogLevel; message: string }> = []
  
  const logger = Logger.make<string, void>(({ logLevel, message }) => {
    messages.push({ level: logLevel, message })
  })
  
  return {
    logger,
    getMessages: () => messages,
    getMessagesByLevel: (level: LogLevel.LogLevel) => 
      messages.filter(m => LogLevel.equal(m.level, level)),
    hasMessage: (message: string) => 
      messages.some(m => m.message.includes(message)),
    hasErrorMessage: (message: string) =>
      messages.some(m => 
        LogLevel.equal(m.level, LogLevel.Error) && m.message.includes(message)
      ),
    clear: () => messages.splice(0, messages.length)
  }
}

// Test example
const testUserService = Effect.gen(function* () {
  const testLogger = createTestLogger()
  
  // Test the user service with captured logging
  const result = yield* createUser({ email: "test@example.com", name: "Test User" }).pipe(
    Effect.provide(Logger.replace(Logger.defaultLogger, testLogger.logger)),
    Logger.withMinimumLogLevel(LogLevel.Debug)
  )
  
  // Assert logging behavior
  expect(testLogger.hasMessage("Creating new user")).toBe(true)
  expect(testLogger.hasMessage("User created successfully")).toBe(true)
  expect(testLogger.getMessagesByLevel(LogLevel.Error)).toHaveLength(0)
  
  return result
})

// Property-based testing with different log levels
const testWithAllLogLevels = Effect.gen(function* () {
  const allLevels = [
    LogLevel.All,
    LogLevel.Trace, 
    LogLevel.Debug,
    LogLevel.Info,
    LogLevel.Warning,
    LogLevel.Error,
    LogLevel.Fatal,
    LogLevel.None
  ]
  
  yield* Effect.forEach(allLevels, (level) => Effect.gen(function* () {
    const testLogger = createTestLogger()
    
    yield* someLoggingOperation.pipe(
      Effect.provide(Logger.replace(Logger.defaultLogger, testLogger.logger)),
      Logger.withMinimumLogLevel(level)
    )
    
    // Verify that only appropriate messages are logged
    const messages = testLogger.getMessages()
    const shouldLog = (msgLevel: LogLevel.LogLevel) => 
      LogLevel.greaterThanEqual(msgLevel, level)
    
    messages.forEach(({ level: msgLevel }) => {
      expect(shouldLog(msgLevel)).toBe(true)
    })
  }))
})
```

## Conclusion

LogLevel provides structured, performant, and flexible logging control for Effect applications. It enables environment-specific logging configuration, performance-sensitive logging operations, and sophisticated filtering capabilities.

Key benefits:
- **Structured Hierarchy**: Clear level hierarchy from All to None with predictable filtering behavior
- **Performance Optimization**: Efficient filtering prevents expensive logging operations when not needed
- **Environment Adaptability**: Easy configuration for different deployment environments without code changes
- **Integration Friendly**: Seamless integration with existing logging infrastructure and frameworks

LogLevel is essential when you need precise control over application logging, whether for debugging complex systems, optimizing performance-critical applications, or maintaining clean production logs.