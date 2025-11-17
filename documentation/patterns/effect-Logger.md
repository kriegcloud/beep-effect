# Logger: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Logger Solves

Traditional logging approaches in TypeScript applications suffer from several critical issues that make debugging and monitoring challenging in production environments.

```typescript
// Traditional approach - problematic and inflexible
console.log('User login attempt:', { userId: 123, timestamp: new Date() })
console.error('Database connection failed:', error.message)
console.debug('Cache hit rate:', calculateCacheHitRate()) // Always executes calculation

// Problems with this approach:
if (process.env.NODE_ENV === 'production') {
  // Debug logs still execute expensive operations
  // No centralized log level control
  // Inconsistent log formatting
  // No structured metadata
  // Missing tracing context
}
```

This approach leads to:
- **Performance Issues** - Debug operations execute even when logs are disabled
- **Inconsistent Formatting** - Each log statement has different structure and metadata
- **Missing Context** - No automatic fiber IDs, spans, or structured annotations
- **Limited Control** - Cannot dynamically adjust log levels or redirect output
- **Poor Observability** - Difficult to integrate with monitoring and alerting systems

### The Logger Solution

Effect's Logger module provides a declarative, type-safe approach to structured logging with built-in performance optimization, contextual enrichment, and flexible output formatting.

```typescript
import { Effect, Logger, LogLevel } from "effect"

// Declarative logging with automatic context
const authenticateUser = (userId: string) => Effect.gen(function* () {
  yield* Effect.log("Authentication attempt started")
  const user = yield* getUserFromDatabase(userId)
  yield* Effect.logInfo("User retrieved from database", { userId, email: user.email })
  const isValid = yield* validateUserCredentials(user)
  return isValid
}).pipe(
  Effect.annotateLogs({ service: "auth", operation: "login" }),
  Effect.withLogSpan("authenticate_user")
)
```

### Key Concepts

**Logger<Message, Output>**: A type-safe logger that transforms log messages of type `Message` into outputs of type `Output`, with automatic context enrichment.

**Log Levels**: Hierarchical severity levels (Trace, Debug, Info, Warning, Error, Fatal) with dynamic filtering and performance optimization.

**Structured Logging**: Automatic inclusion of fiber IDs, timestamps, spans, annotations, and cause information for comprehensive observability.

## Basic Usage Patterns

### Pattern 1: Simple Logging

```typescript
import { Effect } from "effect"

// Basic logging at different levels
const basicLogging = Effect.gen(function* () {
  yield* Effect.log("Application started") // INFO level
  yield* Effect.logDebug("Debug information")
  yield* Effect.logWarning("Warning message")
  yield* Effect.logError("Error occurred")
  yield* Effect.logFatal("Fatal error")
})
```

### Pattern 2: Conditional Log Levels

```typescript
import { Effect, Logger, LogLevel } from "effect"

// Enable debug logging for specific operations
const debuggableOperation = Effect.gen(function* () {
  yield* Effect.logDebug("Starting complex calculation")
  const result = yield* performComplexCalculation()
  yield* Effect.logDebug("Calculation completed", { result })
  return result
}).pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug) // Enable debug logs for this operation
)
```

### Pattern 3: Structured Annotations

```typescript
import { Effect } from "effect"

// Add structured metadata to all logs
const processOrder = (orderId: string) => Effect.gen(function* () {
  yield* Effect.log("Processing order")
  const order = yield* fetchOrder(orderId)
  yield* Effect.log("Order validated")
  const result = yield* processPayment(order)
  yield* Effect.log("Order completed")
  return result
}).pipe(
  Effect.annotateLogs({ 
    service: "order-processing", 
    orderId,
    traceId: generateTraceId() 
  })
)
```

## Real-World Examples

### Example 1: E-commerce Order Processing Service

A complete order processing service with comprehensive logging for debugging and monitoring.

```typescript
import { Effect, Logger, LogLevel } from "effect"

interface Order {
  id: string
  customerId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  totalAmount: number
}

interface PaymentResult {
  transactionId: string
  status: "success" | "failed"
  failureReason?: string
}

class OrderProcessingError extends Error {
  constructor(message: string, public orderId: string, public stage: string) {
    super(message)
  }
}

const processOrder = (orderId: string) => Effect.gen(function* () {
  yield* Effect.log("Starting order processing")
  
  // Fetch order with detailed logging
  const order = yield* Effect.gen(function* () {
    yield* Effect.logDebug("Fetching order from database")
    const result = yield* fetchOrderFromDb(orderId)
    yield* Effect.logInfo("Order retrieved", { 
      itemCount: result.items.length,
      totalAmount: result.totalAmount 
    })
    return result
  }).pipe(
    Effect.catchAll((error) => Effect.gen(function* () {
      yield* Effect.logError("Failed to fetch order", error)
      return yield* Effect.fail(new OrderProcessingError(
        "Order not found", orderId, "fetch"
      ))
    }))
  )
  
  // Validate inventory
  yield* Effect.logDebug("Validating inventory")
  const inventoryCheck = yield* validateInventory(order.items)
  if (!inventoryCheck.isValid) {
    yield* Effect.logWarning("Insufficient inventory", {
      unavailableItems: inventoryCheck.unavailableItems
    })
    return yield* Effect.fail(new OrderProcessingError(
      "Insufficient inventory", orderId, "inventory"
    ))
  }
  
  // Process payment with span tracking
  const paymentResult = yield* Effect.gen(function* () {
    yield* Effect.logInfo("Processing payment", { amount: order.totalAmount })
    return yield* processPayment(order)
  }).pipe(
    Effect.withLogSpan("payment_processing"),
    Effect.catchAll((error) => Effect.gen(function* () {
      yield* Effect.logError("Payment processing failed", { 
        orderId,
        error: error.message,
        amount: order.totalAmount
      })
      return yield* Effect.fail(new OrderProcessingError(
        "Payment failed", orderId, "payment"
      ))
    }))
  )
  
  if (paymentResult.status === "failed") {
    yield* Effect.logError("Payment declined", {
      transactionId: paymentResult.transactionId,
      reason: paymentResult.failureReason
    })
    return yield* Effect.fail(new OrderProcessingError(
      "Payment declined", orderId, "payment"
    ))
  }
  
  // Update inventory and fulfill order
  yield* Effect.logInfo("Payment successful, fulfilling order", {
    transactionId: paymentResult.transactionId
  })
  
  yield* updateInventory(order.items)
  yield* createFulfillmentRequest(order)
  
  yield* Effect.logInfo("Order processing completed successfully")
  
  return {
    orderId,
    transactionId: paymentResult.transactionId,
    status: "completed" as const
  }
}).pipe(
  Effect.annotateLogs({ 
    service: "order-processing",
    orderId,
    customerId: "will-be-added-dynamically" // Would be populated from order
  }),
  Effect.withLogSpan("process_order")
)

// Usage with custom logger for production monitoring
const productionLogger = Logger.make(({ logLevel, message, annotations, spans, timestamp }) => {
  const logEntry = {
    timestamp: timestamp.toISOString(),
    level: logLevel.label,
    message,
    service: annotations.get("service"),
    orderId: annotations.get("orderId"),
    customerId: annotations.get("customerId"),
    span: spans.pipe(
      List.head,
      Option.map(span => ({ name: span.label, duration: span.duration }))
    )
  }
  
  // Send to centralized logging service
  sendToLoggingService(logEntry)
})

const orderProcessingLayer = Logger.replace(Logger.defaultLogger, productionLogger)

// Declare external functions for completeness
declare function fetchOrderFromDb(orderId: string): Effect.Effect<Order, Error>
declare function validateInventory(items: Order["items"]): Effect.Effect<{ isValid: boolean; unavailableItems: string[] }, Error>
declare function processPayment(order: Order): Effect.Effect<PaymentResult, Error>
declare function updateInventory(items: Order["items"]): Effect.Effect<void, Error>
declare function createFulfillmentRequest(order: Order): Effect.Effect<void, Error>
declare function sendToLoggingService(entry: any): void
```

### Example 2: API Request Tracing and Monitoring

HTTP API service with comprehensive request/response logging for debugging and performance monitoring.

```typescript
import { Effect, Logger, LogLevel } from "effect"

interface HttpRequest {
  method: string
  url: string
  headers: Record<string, string>
  body?: unknown
}

interface HttpResponse {
  status: number
  headers: Record<string, string>
  body: unknown
}

const createRequestLogger = () => Logger.make(({ logLevel, message, annotations, spans, timestamp, fiberId }) => {
  const baseLog = {
    timestamp: timestamp.toISOString(),
    level: logLevel.label,
    message,
    fiberId
  }
  
  // Extract HTTP-specific annotations
  const requestId = annotations.get("requestId")
  const method = annotations.get("method")
  const path = annotations.get("path")
  const userId = annotations.get("userId")
  const statusCode = annotations.get("statusCode")
  
  // Add span information for timing
  const spanInfo = spans.pipe(
    List.toArray,
    Arr.map(span => ({ [span.label]: span.duration })),
    Arr.reduce({}, (acc, span) => ({ ...acc, ...span }))
  )
  
  const enhancedLog = {
    ...baseLog,
    request: {
      id: requestId,
      method,
      path,
      userId
    },
    response: statusCode ? { statusCode } : undefined,
    performance: Object.keys(spanInfo).length > 0 ? spanInfo : undefined
  }
  
  // Route to appropriate destination based on log level
  if (logLevel.ordinal >= LogLevel.Error.ordinal) {
    sendToErrorTracking(enhancedLog)
  }
  
  sendToObservabilityPlatform(enhancedLog)
})

const handleHttpRequest = (request: HttpRequest) => Effect.gen(function* () {
  const requestId = generateRequestId()
  
  yield* Effect.logInfo("HTTP request received", {
    method: request.method,
    url: request.url,
    userAgent: request.headers["user-agent"] || "unknown"
  })
  
  // Parse and validate request
  const validatedRequest = yield* Effect.gen(function* () {
    yield* Effect.logDebug("Validating request")
    return yield* validateRequest(request)
  }).pipe(
    Effect.catchAll((error) => Effect.gen(function* () {
      yield* Effect.logWarning("Request validation failed", {
        error: error.message,
        validationErrors: error.details
      })
      return yield* Effect.fail(new HttpError(400, "Invalid request"))
    }))
  )
  
  // Authenticate user
  const user = yield* Effect.gen(function* () {
    yield* Effect.logDebug("Authenticating user")
    const authHeader = request.headers["authorization"]
    if (!authHeader) {
      yield* Effect.logWarning("Missing authorization header")
      return yield* Effect.fail(new HttpError(401, "Unauthorized"))
    }
    
    const user = yield* authenticateUser(authHeader)
    yield* Effect.logDebug("User authenticated", { userId: user.id })
    return user
  }).pipe(
    Effect.withLogSpan("authentication")
  )
  
  // Process business logic
  const result = yield* Effect.gen(function* () {
    yield* Effect.logInfo("Processing business logic")
    return yield* processBusinessLogic(validatedRequest, user)
  }).pipe(
    Effect.withLogSpan("business_logic"),
    Effect.catchAll((error) => Effect.gen(function* () {
      yield* Effect.logError("Business logic error", {
        error: error.message,
        stack: error.stack
      })
      return yield* Effect.fail(new HttpError(500, "Internal server error"))
    }))
  )
  
  // Create response
  const response: HttpResponse = {
    status: 200,
    headers: { "content-type": "application/json" },
    body: result
  }
  
  yield* Effect.logInfo("HTTP request completed", {
    statusCode: response.status,
    responseSize: JSON.stringify(response.body).length
  })
  
  return response
}).pipe(
  Effect.annotateLogs({
    service: "api-gateway",
    requestId,
    method: request.method,
    path: new URL(request.url).pathname
  }),
  Effect.withLogSpan("http_request"),
  // Add user context once authenticated
  Effect.tapError((error) => Effect.gen(function* () {
    yield* Effect.logError("Request failed", {
      error: error.message,
      statusCode: error instanceof HttpError ? error.status : 500
    })
  }))
)

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// Declare external functions
declare function generateRequestId(): string
declare function validateRequest(request: HttpRequest): Effect.Effect<HttpRequest, { message: string; details: string[] }>
declare function authenticateUser(authHeader: string): Effect.Effect<{ id: string; email: string }, Error>
declare function processBusinessLogic(request: HttpRequest, user: { id: string }): Effect.Effect<unknown, Error>
declare function sendToErrorTracking(log: any): void
declare function sendToObservabilityPlatform(log: any): void
```

### Example 3: Database Operations with Performance Monitoring

Database service with detailed query logging, performance tracking, and connection monitoring.

```typescript
import { Effect, Logger, LogLevel, Ref } from "effect"

interface DatabaseConfig {
  host: string
  port: number
  database: string
  maxConnections: number
}

interface QueryResult<T = unknown> {
  rows: T[]
  rowCount: number
  executionTime: number
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public query: string,
    public parameters: unknown[],
    public cause?: Error
  ) {
    super(message)
  }
}

const createDatabaseLogger = () => Logger.make(({ logLevel, message, annotations, spans, timestamp }) => {
  const dbLog = {
    timestamp: timestamp.toISOString(),
    level: logLevel.label,
    message,
    database: {
      query: annotations.get("query"),
      parameters: annotations.get("parameters"),
      rowCount: annotations.get("rowCount"),
      executionTime: annotations.get("executionTime"),
      connectionId: annotations.get("connectionId")
    },
    performance: spans.pipe(
      List.toArray,
      Arr.reduce({}, (acc, span) => ({
        ...acc,
        [span.label]: `${span.duration}ms`
      }))
    )
  }
  
  // Log slow queries to performance monitoring
  if (annotations.get("executionTime") > 1000) {
    sendToSlowQueryLog(dbLog)
  }
  
  // Send all database logs to structured logging
  sendToDatabaseMonitoring(dbLog)
})

const createDatabaseService = (config: DatabaseConfig) => Effect.gen(function* () {
  const connectionPool = yield* Ref.make<number>(0)
  const activeConnections = yield* Ref.make<Set<string>>(new Set())
  
  yield* Effect.logInfo("Database service initialized", {
    host: config.host,
    port: config.port,
    database: config.database,
    maxConnections: config.maxConnections
  })
  
  const executeQuery = <T>(query: string, parameters: unknown[] = []) => Effect.gen(function* () {
    const connectionId = generateConnectionId()
    
    yield* Effect.logDebug("Acquiring database connection", {
      connectionId,
      query: truncateQuery(query)
    })
    
    // Check connection pool
    const currentConnections = yield* Ref.get(connectionPool)
    if (currentConnections >= config.maxConnections) {
      yield* Effect.logWarning("Connection pool exhausted", {
        currentConnections,
        maxConnections: config.maxConnections
      })
      return yield* Effect.fail(new DatabaseError(
        "Connection pool exhausted", query, parameters
      ))
    }
    
    // Acquire connection
    yield* Ref.update(connectionPool, n => n + 1)
    yield* Ref.update(activeConnections, set => set.add(connectionId))
    
    yield* Effect.logDebug("Connection acquired", { connectionId })
    
    // Execute query with performance tracking
    const result = yield* Effect.gen(function* () {
      yield* Effect.logDebug("Executing query", {
        query: truncateQuery(query, 200),
        parameterCount: parameters.length
      })
      
      const startTime = Date.now()
      const queryResult = yield* executeRawQuery<T>(query, parameters)
      const executionTime = Date.now() - startTime
      
      yield* Effect.logInfo("Query executed successfully", {
        rowCount: queryResult.rowCount,
        executionTime
      })
      
      // Log slow queries
      if (executionTime > 500) {
        yield* Effect.logWarning("Slow query detected", {
          query: truncateQuery(query, 500),
          executionTime,
          threshold: 500
        })
      }
      
      return { ...queryResult, executionTime }
    }).pipe(
      Effect.withLogSpan("query_execution"),
      Effect.catchAll((error) => Effect.gen(function* () {
        yield* Effect.logError("Query execution failed", {
          query: truncateQuery(query, 200),
          parameters: JSON.stringify(parameters),
          error: error.message
        })
        return yield* Effect.fail(new DatabaseError(
          "Query execution failed", query, parameters, error
        ))
      })),
      Effect.ensuring(Effect.gen(function* () {
        // Release connection
        yield* Ref.update(connectionPool, n => n - 1)
        yield* Ref.update(activeConnections, set => {
          set.delete(connectionId)
          return set
        })
        yield* Effect.logDebug("Connection released", { connectionId })
      }))
    )
    
    return result
  }).pipe(
    Effect.annotateLogs({
      service: "database",
      connectionId,
      query: truncateQuery(query, 100),
      parameters: JSON.stringify(parameters)
    }),
    Effect.withLogSpan("database_operation")
  )
  
  const getConnectionStats = () => Effect.gen(function* () {
    const active = yield* Ref.get(connectionPool)
    const connections = yield* Ref.get(activeConnections)
    
    yield* Effect.logInfo("Connection pool status", {
      activeConnections: active,
      maxConnections: config.maxConnections,
      utilization: `${Math.round((active / config.maxConnections) * 100)}%`,
      connectionIds: Array.from(connections)
    })
    
    return {
      active,
      max: config.maxConnections,
      available: config.maxConnections - active,
      connections: Array.from(connections)
    }
  }).pipe(
    Effect.annotateLogs({ service: "database", operation: "stats" })
  )
  
  return { executeQuery, getConnectionStats } as const
}).pipe(
  Effect.annotateLogs({ service: "database", operation: "initialization" })
)

// Helper functions
const truncateQuery = (query: string, maxLength: number = 100): string => {
  const cleaned = query.replace(/\s+/g, ' ').trim()
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned
}

const generateConnectionId = (): string => 
  `conn_${Math.random().toString(36).substring(2, 15)}`

// Usage example
const userRepository = Effect.gen(function* () {
  const db = yield* createDatabaseService({
    host: "localhost",
    port: 5432,
    database: "myapp",
    maxConnections: 10
  })
  
  const findUserById = (id: string) => Effect.gen(function* () {
    yield* Effect.logDebug("Finding user by ID", { userId: id })
    const result = yield* db.executeQuery<{ id: string; email: string; name: string }>(
      "SELECT id, email, name FROM users WHERE id = $1",
      [id]
    )
    
    if (result.rowCount === 0) {
      yield* Effect.logWarning("User not found", { userId: id })
      return null
    }
    
    yield* Effect.logDebug("User found", { userId: id, email: result.rows[0].email })
    return result.rows[0]
  }).pipe(
    Effect.annotateLogs({ repository: "user", operation: "findById" })
  )
  
  return { findUserById, getStats: db.getConnectionStats } as const
})

// Declare external functions
declare function executeRawQuery<T>(query: string, parameters: unknown[]): Effect.Effect<QueryResult<T>, Error>
declare function sendToSlowQueryLog(log: any): void
declare function sendToDatabaseMonitoring(log: any): void
```

## Advanced Features Deep Dive

### Feature 1: Custom Logger Creation

Effect allows you to create completely custom loggers that can route logs to different destinations, transform log formats, or integrate with external services.

#### Basic Custom Logger

```typescript
import { Logger } from "effect"

// Simple custom logger
const consoleLogger = Logger.make(({ logLevel, message, timestamp }) => {
  const formattedTime = timestamp.toISOString()
  console.log(`[${formattedTime}] ${logLevel.label}: ${message}`)
})
```

#### Advanced Custom Logger with External Integration

```typescript
import { Logger, HashMap, List } from "effect"

interface LogEntry {
  timestamp: string
  level: string
  message: string
  service?: string
  traceId?: string
  userId?: string
  metadata: Record<string, unknown>
}

const createStructuredLogger = (serviceName: string) => Logger.make(({ 
  logLevel, 
  message, 
  timestamp, 
  annotations, 
  spans, 
  fiberId, 
  cause 
}) => {
  // Extract common annotations
  const metadata: Record<string, unknown> = {}
  
  annotations.pipe(
    HashMap.forEachEffect(([key, value]) => Effect.sync(() => {
      metadata[key] = value
    }))
  )
  
  // Process spans for timing information
  const spanMetrics = spans.pipe(
    List.toArray,
    Arr.reduce({}, (acc, span) => ({
      ...acc,
      [`span_${span.label}_duration`]: span.duration
    }))
  )
  
  const logEntry: LogEntry = {
    timestamp: timestamp.toISOString(),
    level: logLevel.label,
    message: Array.isArray(message) ? message.join(' ') : String(message),
    service: serviceName,
    traceId: metadata.traceId as string,
    userId: metadata.userId as string,
    metadata: {
      ...metadata,
      ...spanMetrics,
      fiberId,
      ...(cause && { cause: cause.toString() })
    }
  }
  
  // Route based on log level
  if (logLevel.ordinal >= LogLevel.Error.ordinal) {
    sendToAlertingSystem(logEntry)
  }
  
  if (logLevel.ordinal >= LogLevel.Warning.ordinal) {
    sendToErrorTracking(logEntry)
  }
  
  // Always send to centralized logging
  sendToLoggingPlatform(logEntry)
})

// Multi-destination logger
const createMultiLogger = () => {
  const fileLogger = Logger.make(({ logLevel, message, timestamp }) => {
    const logLine = `${timestamp.toISOString()} [${logLevel.label}] ${message}\n`
    appendToLogFile(logLine)
  })
  
  const metricsLogger = Logger.make(({ logLevel, annotations }) => {
    // Extract metrics from annotations
    const duration = annotations.get("duration")
    const operation = annotations.get("operation")
    
    if (duration && operation) {
      recordMetric(`operation_duration`, duration, { operation, level: logLevel.label })
    }
  })
  
  const structuredLogger = createStructuredLogger("my-service")
  
  // Combine all loggers
  return fileLogger.pipe(
    Logger.zip(metricsLogger),
    Logger.zipRight(structuredLogger)
  )
}

// Declare external functions
declare function sendToAlertingSystem(entry: LogEntry): void
declare function sendToErrorTracking(entry: LogEntry): void
declare function sendToLoggingPlatform(entry: LogEntry): void
declare function appendToLogFile(line: string): void
declare function recordMetric(name: string, value: number, tags: Record<string, string>): void
```

### Feature 2: Batched Logging for Performance

For high-throughput applications, Effect provides batched logging to improve performance by collecting and processing logs in groups.

```typescript
import { Logger, Effect, Console } from "effect"

// Create a batched logger that processes logs every 500ms
const createBatchedLogger = () => Effect.gen(function* () {
  const batchedLogger = yield* Logger.logfmtLogger.pipe(
    Logger.batched("500 millis", (messages) => Effect.gen(function* () {
      // Process batch of log messages
      yield* Console.log(`=== BATCH OF ${messages.length} LOGS ===`)
      
      for (const message of messages) {
        yield* Console.log(message)
      }
      
      yield* Console.log("=== END BATCH ===")
      
      // Could also send batch to external service
      yield* sendBatchToLoggingService(messages)
    }))
  )
  
  return batchedLogger
})

// High-throughput service using batched logging
const processHighVolumeEvents = (events: Array<{ id: string; type: string; data: unknown }>) => Effect.gen(function* () {
  const batchedLogger = yield* createBatchedLogger()
  
  yield* Effect.forEach(events, (event) => Effect.gen(function* () {
    yield* Effect.log("Processing event", { eventId: event.id, type: event.type })
    yield* processEvent(event)
    yield* Effect.log("Event processed successfully")
  }).pipe(
    Effect.annotateLogs({ eventId: event.id, eventType: event.type })
  ), { concurrency: 10 })
}).pipe(
  Effect.provide(Logger.replace(Logger.defaultLogger, batchedLogger)),
  Effect.scoped // Ensure proper cleanup of batched logger
)

declare function sendBatchToLoggingService(messages: string[]): Effect.Effect<void>
declare function processEvent(event: { id: string; type: string; data: unknown }): Effect.Effect<void>
```

### Feature 3: Log Filtering and Transformation

Effect loggers support powerful filtering and transformation capabilities.

```typescript
import { Logger, LogLevel, Option } from "effect"

// Filter logs based on conditions
const createFilteredLogger = () => {
  const baseLogger = Logger.prettyLogger()
  
  // Only log errors and warnings in production
  const productionFilter = Logger.filterLogLevel(
    baseLogger,
    (level) => level.ordinal >= LogLevel.Warning.ordinal
  )
  
  // Transform log messages
  const transformedLogger = Logger.mapInput(
    productionFilter,
    (message: string) => `[TRANSFORMED] ${message}`
  )
  
  // Transform entire log options
  const enhancedLogger = Logger.mapInputOptions(
    transformedLogger,
    (options) => ({
      ...options,
      annotations: options.annotations.pipe(
        HashMap.set("environment", process.env.NODE_ENV || "development"),
        HashMap.set("version", process.env.APP_VERSION || "unknown")
      )
    })
  )
  
  return enhancedLogger
}

// Conditional logging based on feature flags
const createFeatureFlagLogger = () => Logger.make(({ logLevel, message, annotations }) => {
  const feature = annotations.get("feature")
  const userId = annotations.get("userId")
  
  // Only log debug messages for specific features or users
  if (logLevel === LogLevel.Debug) {
    const shouldLog = feature === "new-checkout-flow" || 
                     userId === "debug-user-123" ||
                     isFeatureFlagEnabled(feature as string, userId as string)
    
    if (!shouldLog) {
      return // Skip this log
    }
  }
  
  // Process the log normally
  console.log(`[${logLevel.label}] ${message}`)
})

declare function isFeatureFlagEnabled(feature: string, userId: string): boolean
```

## Practical Patterns & Best Practices

### Pattern 1: Service-Specific Logger Factory

Create consistent logging patterns across different services with standardized metadata and formatting.

```typescript
import { Effect, Logger, Context } from "effect"

// Logger configuration service
interface LoggerConfig {
  serviceName: string
  version: string
  environment: string
  logLevel: LogLevel.LogLevel
}

const LoggerConfig = Context.GenericTag<LoggerConfig>("LoggerConfig")

// Create service-specific logger with consistent metadata
const createServiceLogger = (config: LoggerConfig) => Logger.make(({ 
  logLevel, 
  message, 
  timestamp, 
  annotations, 
  spans, 
  fiberId 
}) => {
  const baseMetadata = {
    service: config.serviceName,
    version: config.version,
    environment: config.environment,
    timestamp: timestamp.toISOString(),
    level: logLevel.label,
    fiberId
  }
  
  // Extract custom annotations
  const customMetadata: Record<string, unknown> = {}
  annotations.forEach(([key, value]) => {
    customMetadata[key] = value
  })
  
  // Process spans for performance metrics
  const spanMetrics: Record<string, number> = {}
  spans.forEach(span => {
    spanMetrics[`${span.label}_duration_ms`] = span.duration
  })
  
  const fullLogEntry = {
    ...baseMetadata,
    message: Array.isArray(message) ? message.join(' ') : String(message),
    metadata: customMetadata,
    performance: spanMetrics
  }
  
  // Route to appropriate destination based on environment
  if (config.environment === "production") {
    sendToProductionLogs(fullLogEntry)
  } else {
    console.log(JSON.stringify(fullLogEntry, null, 2))
  }
})

// Service logger layer factory
const createServiceLoggerLayer = (config: LoggerConfig) => Effect.gen(function* () {
  const serviceLogger = createServiceLogger(config)
  return serviceLogger
}).pipe(
  Effect.map(logger => Logger.replace(Logger.defaultLogger, logger)),
  Layer.unwrapEffect
)

// Usage in different services
const userServiceLogger = createServiceLoggerLayer({
  serviceName: "user-service",
  version: "1.2.3",
  environment: process.env.NODE_ENV || "development",
  logLevel: LogLevel.Info
})

const orderServiceLogger = createServiceLoggerLayer({
  serviceName: "order-service", 
  version: "2.1.0",
  environment: process.env.NODE_ENV || "development",
  logLevel: LogLevel.Debug
})

declare function sendToProductionLogs(entry: any): void
```

### Pattern 2: Error Logging with Context Preservation

Comprehensive error logging that preserves full context and call stacks for debugging.

```typescript
import { Effect, Logger, Cause } from "effect"

// Enhanced error logging utility
const logErrorWithContext = <E>(
  error: E,
  context: Record<string, unknown>,
  operation: string
) => Effect.gen(function* () {
  // Create rich error context
  const errorContext = {
    operation,
    error: {
      name: error instanceof Error ? error.constructor.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    },
    context,
    timestamp: new Date().toISOString()
  }
  
  // Log with different levels based on error type
  if (error instanceof BusinessLogicError) {
    yield* Effect.logWarning("Business logic error occurred", errorContext)
  } else if (error instanceof ValidationError) {
    yield* Effect.logWarning("Validation error", errorContext)
  } else if (error instanceof ExternalServiceError) {
    yield* Effect.logError("External service error", {
      ...errorContext,
      shouldRetry: error.retryable,
      serviceEndpoint: error.endpoint
    })
  } else {
    yield* Effect.logFatal("Unexpected error", errorContext)
  }
})

// Comprehensive error handling wrapper
const withErrorLogging = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  operation: string,
  context: Record<string, unknown> = {}
) => Effect.gen(function* () {
  return yield* effect
}).pipe(
  Effect.tapError(error => logErrorWithContext(error, context, operation)),
  Effect.tapDefect(defect => Effect.gen(function* () {
    yield* Effect.logFatal("Defect occurred", {
      operation,
      defect: {
        message: String(defect),
        stack: defect instanceof Error ? defect.stack : undefined
      },
      context
    })
  }))
)

// Custom error types
class BusinessLogicError extends Error {
  constructor(message: string, public code: string) {
    super(message)
  }
}

class ValidationError extends Error {
  constructor(message: string, public field: string, public value: unknown) {
    super(message)
  }
}

class ExternalServiceError extends Error {
  constructor(
    message: string, 
    public endpoint: string, 
    public retryable: boolean = true
  ) {
    super(message)
  }
}

// Usage example
const processUserRegistration = (userData: {
  email: string
  password: string
  name: string
}) => Effect.gen(function* () {
  // Validate input
  yield* validateUserData(userData).pipe(
    withErrorLogging("user_validation", { email: userData.email })
  )
  
  // Check if user exists
  const existingUser = yield* findUserByEmail(userData.email).pipe(
    withErrorLogging("user_lookup", { email: userData.email })
  )
  
  if (existingUser) {
    return yield* Effect.fail(new BusinessLogicError("User already exists", "USER_EXISTS"))
  }
  
  // Create user
  const user = yield* createUser(userData).pipe(
    withErrorLogging("user_creation", { email: userData.email })
  )
  
  // Send welcome email
  yield* sendWelcomeEmail(user).pipe(
    withErrorLogging("welcome_email", { userId: user.id, email: user.email })
  )
  
  return user
}).pipe(
  withErrorLogging("user_registration", { email: userData.email })
)

declare function validateUserData(data: any): Effect.Effect<void, ValidationError>
declare function findUserByEmail(email: string): Effect.Effect<any, ExternalServiceError>
declare function createUser(data: any): Effect.Effect<{ id: string; email: string }, ExternalServiceError>
declare function sendWelcomeEmail(user: any): Effect.Effect<void, ExternalServiceError>
```

### Pattern 3: Performance Monitoring and Alerting

Automated performance monitoring through logging with threshold-based alerting.

```typescript
import { Effect, Logger, Ref, Schedule } from "effect"

interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: Date
  success: boolean
  metadata?: Record<string, unknown>
}

// Performance monitoring service
const createPerformanceMonitor = () => Effect.gen(function* () {
  const metrics = yield* Ref.make<PerformanceMetrics[]>([])
  const thresholds = new Map([
    ["database_query", 1000],
    ["api_call", 2000], 
    ["file_operation", 500],
    ["user_authentication", 3000]
  ])
  
  const recordMetric = (metric: PerformanceMetrics) => Effect.gen(function* () {
    yield* Ref.update(metrics, m => [...m.slice(-99), metric]) // Keep last 100 metrics
    
    const threshold = thresholds.get(metric.operation) || 5000
    
    if (metric.duration > threshold) {
      yield* Effect.logWarning("Performance threshold exceeded", {
        operation: metric.operation,
        duration: metric.duration,
        threshold,
        exceedBy: metric.duration - threshold,
        metadata: metric.metadata
      })
      
      // Trigger alert for significant threshold breaches
      if (metric.duration > threshold * 2) {
        yield* triggerPerformanceAlert(metric, threshold)
      }
    }
    
    // Log performance data for aggregation
    yield* Effect.logInfo("Performance metric recorded", {
      operation: metric.operation,
      duration: metric.duration,
      success: metric.success,
      metadata: metric.metadata
    })
  })
  
  const getAveragePerformance = (operation: string, timeWindow: number = 300000) => Effect.gen(function* () {
    const allMetrics = yield* Ref.get(metrics)
    const cutoff = Date.now() - timeWindow
    
    const relevantMetrics = allMetrics.filter(m => 
      m.operation === operation && m.timestamp.getTime() > cutoff
    )
    
    if (relevantMetrics.length === 0) {
      return null
    }
    
    const avgDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length
    const successRate = relevantMetrics.filter(m => m.success).length / relevantMetrics.length
    
    yield* Effect.logDebug("Performance statistics calculated", {
      operation,
      averageDuration: avgDuration,
      successRate,
      sampleSize: relevantMetrics.length,
      timeWindowMinutes: timeWindow / 60000
    })
    
    return { avgDuration, successRate, sampleSize: relevantMetrics.length }
  })
  
  return { recordMetric, getAveragePerformance } as const
})

// Performance tracking wrapper
const withPerformanceTracking = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  operation: string,
  metadata: Record<string, unknown> = {}
) => Effect.gen(function* () {
  const monitor = yield* createPerformanceMonitor()
  const startTime = Date.now()
  
  const result = yield* effect.pipe(
    Effect.tapBoth({
      onFailure: (error) => Effect.gen(function* () {
        const duration = Date.now() - startTime
        yield* monitor.recordMetric({
          operation,
          duration,
          timestamp: new Date(),
          success: false,
          metadata: { ...metadata, error: String(error) }
        })
      }),
      onSuccess: (value) => Effect.gen(function* () {
        const duration = Date.now() - startTime
        yield* monitor.recordMetric({
          operation,
          duration,
          timestamp: new Date(),
          success: true,
          metadata
        })
      })
    })
  )
  
  return result
})

// Scheduled performance reporting
const startPerformanceReporting = () => Effect.gen(function* () {
  const monitor = yield* createPerformanceMonitor()
  
  const reportPerformance = Effect.gen(function* () {
    const operations = ["database_query", "api_call", "file_operation", "user_authentication"]
    
    for (const operation of operations) {
      const stats = yield* monitor.getAveragePerformance(operation)
      if (stats) {
        yield* Effect.logInfo("Performance report", {
          operation,
          averageDuration: stats.avgDuration,
          successRate: `${(stats.successRate * 100).toFixed(2)}%`,
          sampleSize: stats.sampleSize
        })
      }
    }
  }).pipe(
    Effect.catchAll(error => Effect.logError("Performance reporting failed", { error }))
  )
  
  // Schedule reports every 5 minutes
  yield* reportPerformance.pipe(
    Effect.repeat(Schedule.fixed("5 minutes")),
    Effect.fork
  )
}).pipe(
  Effect.annotateLogs({ service: "performance-monitor" })
)

const triggerPerformanceAlert = (metric: PerformanceMetrics, threshold: number) => Effect.gen(function* () {
  yield* Effect.logError("PERFORMANCE ALERT", {
    operation: metric.operation,
    duration: metric.duration,
    threshold,
    severity: "HIGH",
    action: "immediate_investigation_required"
  })
  
  // Send to alerting system
  yield* sendAlert({
    type: "performance",
    severity: "high",
    operation: metric.operation,
    duration: metric.duration,
    threshold
  })
})

declare function sendAlert(alert: any): Effect.Effect<void>
```

## Integration Examples

### Integration with OpenTelemetry

Seamlessly integrate Effect Logger with OpenTelemetry for comprehensive observability.

```typescript
import { Logger, Effect } from "effect"
import { trace, context, SpanStatusCode } from "@opentelemetry/api"

// OpenTelemetry-aware logger
const createOtelLogger = (serviceName: string) => Logger.make(({ 
  logLevel, 
  message, 
  timestamp, 
  annotations, 
  spans, 
  fiberId 
}) => {
  const activeSpan = trace.getActiveSpan()
  const traceId = activeSpan?.spanContext().traceId
  const spanId = activeSpan?.spanContext().spanId
  
  const logEntry = {
    timestamp: timestamp.toISOString(),
    level: logLevel.label,
    message: Array.isArray(message) ? message.join(' ') : String(message),
    service: serviceName,
    traceId,
    spanId,
    fiberId,
    annotations: annotations.pipe(
      HashMap.toEntries,
      Arr.reduce({}, (acc, [key, value]) => ({ ...acc, [key]: value }))
    )
  }
  
  // Add log as span event if span is active
  if (activeSpan) {
    activeSpan.addEvent('log', {
      level: logLevel.label,
      message: logEntry.message,
      ...logEntry.annotations
    })
    
    // Set span status for errors
    if (logLevel.ordinal >= LogLevel.Error.ordinal) {
      activeSpan.setStatus({ code: SpanStatusCode.ERROR, message: logEntry.message })
    }
  }
  
  // Send to structured logging
  console.log(JSON.stringify(logEntry))
})

// Trace-aware Effect wrapper
const withTracing = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  operationName: string,
  attributes: Record<string, string | number | boolean> = {}
) => Effect.gen(function* () {
  const tracer = trace.getTracer('effect-service')
  
  return yield* Effect.async<A, E>((resume) => {
    const span = tracer.startSpan(operationName, { attributes })
    
    context.with(trace.setSpan(context.active(), span), () => {
      Effect.runPromise(effect.pipe(
        Effect.tapBoth({
          onFailure: (error) => Effect.sync(() => {
            span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) })
            span.recordException(error instanceof Error ? error : new Error(String(error)))
          }),
          onSuccess: () => Effect.sync(() => {
            span.setStatus({ code: SpanStatusCode.OK })
          })
        })
      )).then(
        result => {
          span.end()
          resume(Effect.succeed(result))
        },
        error => {
          span.end()
          resume(Effect.fail(error))
        }
      )
    })
  })
})

// Usage with distributed tracing
const distributedService = Effect.gen(function* () {
  yield* Effect.log("Service operation started")
  
  const data = yield* fetchDataFromRemoteService().pipe(
    withTracing("fetch_remote_data", { service: "remote-api" })
  )
  
  const processed = yield* processData(data).pipe(
    withTracing("process_data", { dataSize: data.length })
  )
  
  yield* Effect.log("Service operation completed", { 
    recordsProcessed: processed.length 
  })
  
  return processed
}).pipe(
  Effect.provide(Logger.replace(Logger.defaultLogger, createOtelLogger("my-service")))
)

declare function fetchDataFromRemoteService(): Effect.Effect<any[]>
declare function processData(data: any[]): Effect.Effect<any[]>
```

### Integration with Winston Logger

Bridge Effect Logger with existing Winston logging infrastructure.

```typescript
import { Logger, Effect } from "effect"
import winston from "winston"

// Create Winston-compatible logger
const createWinstonBridge = (winstonLogger: winston.Logger) => Logger.make(({ 
  logLevel, 
  message, 
  timestamp, 
  annotations, 
  spans, 
  fiberId,
  cause 
}) => {
  // Convert Effect log level to Winston level
  const winstonLevel = {
    [LogLevel.Trace.label]: 'silly',
    [LogLevel.Debug.label]: 'debug', 
    [LogLevel.Info.label]: 'info',
    [LogLevel.Warning.label]: 'warn',
    [LogLevel.Error.label]: 'error',
    [LogLevel.Fatal.label]: 'error'
  }[logLevel.label] || 'info'
  
  // Prepare metadata
  const metadata = {
    fiberId,
    timestamp: timestamp.toISOString(),
    annotations: annotations.pipe(
      HashMap.toEntries,
      Arr.reduce({}, (acc, [key, value]) => ({ ...acc, [key]: value }))
    ),
    spans: spans.pipe(
      List.toArray,
      Arr.reduce({}, (acc, span) => ({ ...acc, [span.label]: `${span.duration}ms` }))
    ),
    ...(cause && { cause: cause.toString() })
  }
  
  // Log through Winston
  winstonLogger.log(winstonLevel, Array.isArray(message) ? message.join(' ') : String(message), metadata)
})

// Winston configuration
const winstonLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Create the bridge layer
const winstonLoggerLayer = Logger.replace(
  Logger.defaultLogger, 
  createWinstonBridge(winstonLogger)
)

// Service using Winston bridge
const serviceWithWinston = Effect.gen(function* () {
  yield* Effect.logInfo("Service started with Winston logging")
  
  const result = yield* performBusinessOperation().pipe(
    Effect.tapError(error => Effect.logError("Business operation failed", { error: error.message })),
    Effect.tap(result => Effect.logInfo("Business operation completed", { recordCount: result.length }))
  )
  
  return result
}).pipe(
  Effect.provide(winstonLoggerLayer),
  Effect.annotateLogs({ service: "winston-integrated-service" })
)

declare function performBusinessOperation(): Effect.Effect<any[]>
```

### Integration with Pino Logger

High-performance logging integration with Pino for production environments.

```typescript
import { Logger, Effect } from "effect"
import pino from "pino"

// Pino-compatible logger bridge
const createPinoBridge = (pinoLogger: pino.Logger) => Logger.make(({ 
  logLevel, 
  message, 
  timestamp, 
  annotations, 
  spans, 
  fiberId,
  cause 
}) => {
  // Convert to Pino level
  const pinoLevel = {
    [LogLevel.Trace.label]: 'trace',
    [LogLevel.Debug.label]: 'debug',
    [LogLevel.Info.label]: 'info', 
    [LogLevel.Warning.label]: 'warn',
    [LogLevel.Error.label]: 'error',
    [LogLevel.Fatal.label]: 'fatal'
  }[logLevel.label] || 'info'
  
  // Prepare structured data for Pino
  const logData = {
    fiberId,
    timestamp: timestamp.getTime(),
    annotations: annotations.pipe(
      HashMap.toEntries,
      Arr.reduce({}, (acc, [key, value]) => ({ ...acc, [key]: value }))
    ),
    performance: spans.pipe(
      List.toArray,
      Arr.reduce({}, (acc, span) => ({ ...acc, [`${span.label}_ms`]: span.duration }))
    ),
    ...(cause && { cause: cause.toString() })
  }
  
  const logMessage = Array.isArray(message) ? message.join(' ') : String(message)
  
  // Use Pino's level-specific methods
  pinoLogger[pinoLevel](logData, logMessage)
})

// High-performance Pino configuration
const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({ 
      pid: bindings.pid, 
      hostname: bindings.hostname,
      service: process.env.SERVICE_NAME || 'unknown'
    })
  },
  redact: ['password', 'token', 'authorization'], // Redact sensitive data
  serializers: {
    error: pino.stdSerializers.err,
    request: pino.stdSerializers.req,
    response: pino.stdSerializers.res
  },
  ...(process.env.NODE_ENV === 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: false,
        translateTime: 'SYS:standard'
      }
    }
  })
})

// Create the Pino bridge layer
const pinoLoggerLayer = Logger.replace(
  Logger.defaultLogger,
  createPinoBridge(pinoLogger)
)

// High-performance service with Pino
const highPerformanceService = Effect.gen(function* () {
  yield* Effect.logInfo("High-performance service starting")
  
  // Process large batch of operations
  const results = yield* Effect.forEach(
    Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item-${i}` })),
    (item) => Effect.gen(function* () {
      yield* Effect.logDebug("Processing item", { itemId: item.id })
      const result = yield* processItem(item)
      yield* Effect.logTrace("Item processed", { 
        itemId: item.id, 
        resultSize: JSON.stringify(result).length 
      })
      return result
    }).pipe(
      Effect.annotateLogs({ itemId: item.id }),
      Effect.withLogSpan(`process_item_${item.id}`)
    ),
    { concurrency: 50 }
  )
  
  yield* Effect.logInfo("Batch processing completed", { 
    totalItems: results.length,
    successCount: results.filter(r => r !== null).length
  })
  
  return results
}).pipe(
  Effect.provide(pinoLoggerLayer),
  Effect.annotateLogs({ service: "high-performance-batch-processor" }),
  Effect.withLogSpan("batch_processing")
)

declare function processItem(item: { id: number; data: string }): Effect.Effect<any>
```

## Conclusion

Effect's Logger module provides **comprehensive structured logging**, **dynamic performance optimization**, and **flexible integration capabilities** for building observable, maintainable applications.

Key benefits:
- **Type Safety**: Compile-time guarantees about log message types and logger configurations
- **Performance**: Automatic optimization with conditional execution and batching capabilities  
- **Structured Context**: Automatic fiber IDs, spans, annotations, and cause tracking for comprehensive observability
- **Flexible Integration**: Seamless compatibility with existing logging infrastructure and observability platforms

The Logger module is essential when you need production-grade logging with structured metadata, performance monitoring, distributed tracing integration, and dynamic log level control across different application components.