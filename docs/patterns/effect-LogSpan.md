# LogSpan: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem LogSpan Solves

When building applications, especially in distributed systems or complex service architectures, debugging and monitoring become challenging without proper context in logs. Traditional logging approaches often lead to fragmented, hard-to-trace logs:

```typescript
// Traditional approach - fragmented logs without context
console.log("Starting user authentication")
// ... complex authentication logic ...
console.log("User authentication completed")

// Later when debugging:
// - Which authentication process took how long?
// - Was this part of the same user request?
// - How do I trace related operations?
```

This approach leads to:
- **Lost Context** - Individual log entries don't show relationships or duration
- **Difficult Debugging** - Hard to trace operations across complex flows
- **Poor Observability** - No structured way to measure operation timing
- **Fragmented Traces** - Related operations appear disconnected in logs

### The LogSpan Solution

LogSpan provides structured, contextual logging that automatically tracks operation duration and maintains context across your Effect program:

```typescript
import { Effect } from "effect"

const authenticateUser = (credentials: UserCredentials) =>
  Effect.gen(function* () {
    const user = yield* validateCredentials(credentials)
    const session = yield* createSession(user)
    return session
  }).pipe(
    Effect.withLogSpan("user.authenticate")
  )

// Automatic output includes timing:
// timestamp=... level=INFO message="..." user.authenticate=245ms
```

### Key Concepts

**LogSpan**: A structured logging annotation that tracks the start time and label of an operation, automatically calculating duration when logged.

**Hierarchical Context**: LogSpans compose naturally - nested operations create layered context in your logs.

**Zero-overhead Tracking**: LogSpans use Effect's FiberRef system for efficient, fiber-local state management without performance penalties.

## Basic Usage Patterns

### Pattern 1: Basic Operation Timing

```typescript
import { Effect } from "effect"

// Simple operation with timing
const processOrder = (order: Order) =>
  Effect.gen(function* () {
    yield* Effect.log("Processing order", order.id)
    const validated = yield* validateOrder(order)
    const processed = yield* calculateTotals(validated)
    yield* Effect.log("Order processed successfully")
    return processed
  }).pipe(
    Effect.withLogSpan("order.process")
  )

// Output includes automatic timing:
// timestamp=... level=INFO message="Processing order 12345" order.process=0ms
// timestamp=... level=INFO message="Order processed successfully" order.process=156ms
```

### Pattern 2: Nested Operation Context

```typescript
import { Effect } from "effect"

const createUser = (userData: UserData) =>
  Effect.gen(function* () {
    const validated = yield* validateUserData(userData).pipe(
      Effect.withLogSpan("user.validate")
    )
    const hashed = yield* hashPassword(validated.password).pipe(
      Effect.withLogSpan("user.hash_password")
    )
    const saved = yield* saveToDatabase({ ...validated, password: hashed }).pipe(
      Effect.withLogSpan("user.save")
    )
    return saved
  }).pipe(
    Effect.withLogSpan("user.create")
  )

// Output shows nested context:
// timestamp=... level=INFO message="..." user.create=0ms user.validate=0ms
// timestamp=... level=INFO message="..." user.create=45ms user.hash_password=0ms  
// timestamp=... level=INFO message="..." user.create=189ms user.save=0ms
// timestamp=... level=INFO message="..." user.create=245ms
```

### Pattern 3: Conditional Span Context

```typescript
import { Effect } from "effect"

const processPayment = (payment: PaymentRequest) =>
  Effect.gen(function* () {
    if (payment.method === "credit_card") {
      return yield* processCreditCard(payment).pipe(
        Effect.withLogSpan("payment.credit_card")
      )
    }
    if (payment.method === "paypal") {
      return yield* processPayPal(payment).pipe(
        Effect.withLogSpan("payment.paypal")
      )
    }
    return yield* processBankTransfer(payment).pipe(
      Effect.withLogSpan("payment.bank_transfer")
    )
  }).pipe(
    Effect.withLogSpan("payment.process")
  )
```

## Real-World Examples

### Example 1: HTTP Request Tracing

```typescript
import { Effect, pipe } from "effect"

interface UserService {
  readonly getUser: (id: string) => Effect.Effect<User, DatabaseError>
  readonly updateUser: (id: string, data: UserUpdate) => Effect.Effect<User, DatabaseError>
}

const handleUserUpdate = (userId: string, updateData: UserUpdate) =>
  Effect.gen(function* () {
    const userService = yield* UserService
    
    const existingUser = yield* userService.getUser(userId).pipe(
      Effect.withLogSpan("user.fetch")
    )
    
    const validatedData = yield* validateUserUpdate(updateData).pipe(
      Effect.withLogSpan("user.validate_update")
    )
    
    const updatedUser = yield* userService.updateUser(userId, validatedData).pipe(
      Effect.withLogSpan("user.save_update")
    )
    
    yield* publishUserUpdatedEvent(updatedUser).pipe(
      Effect.withLogSpan("user.publish_event")
    )
    
    return updatedUser
  }).pipe(
    Effect.withLogSpan("api.user.update"),
    Effect.catchTag("ValidationError", (error) =>
      Effect.fail(new BadRequestError({ cause: error, message: "Invalid user data" }))
    ),
    Effect.catchTag("DatabaseError", (error) =>
      Effect.fail(new InternalServerError({ cause: error, message: "Database operation failed" }))
    )
  )

// Log output provides complete request trace:
// timestamp=... level=INFO message="..." api.user.update=0ms user.fetch=0ms
// timestamp=... level=INFO message="..." api.user.update=23ms user.validate_update=0ms
// timestamp=... level=INFO message="..." api.user.update=45ms user.save_update=0ms
// timestamp=... level=INFO message="..." api.user.update=167ms user.publish_event=0ms
// timestamp=... level=INFO message="..." api.user.update=189ms
```

### Example 2: Background Job Processing

```typescript
import { Effect, Schedule } from "effect"

interface JobProcessor {
  readonly processJob: (job: Job) => Effect.Effect<JobResult, JobError>
}

const processJobBatch = (jobs: readonly Job[]) =>
  Effect.gen(function* () {
    yield* Effect.log(`Processing batch of ${jobs.length} jobs`)
    
    const results = yield* Effect.forEach(
      jobs,
      (job) =>
        Effect.gen(function* () {
          const processor = yield* JobProcessor
          const result = yield* processor.processJob(job).pipe(
            Effect.withLogSpan(`job.process.${job.type}`)
          )
          yield* Effect.log(`Job ${job.id} completed successfully`)
          return result
        }).pipe(
          Effect.withLogSpan(`job.${job.id}`)
        ),
      { concurrency: 5 }
    ).pipe(
      Effect.withLogSpan("job.batch.parallel_processing")
    )
    
    yield* Effect.log(`Batch processing completed: ${results.length} jobs processed`)
    return results
  }).pipe(
    Effect.withLogSpan("job.batch.process"),
    Effect.retry(Schedule.exponential("1 second").pipe(Schedule.maxAttempts(3))),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Batch processing failed after retries", error)
        return []
      })
    )
  )

// Provides detailed timing for batch processing:
// timestamp=... level=INFO message="Processing batch of 10 jobs" job.batch.process=0ms
// timestamp=... level=INFO message="..." job.batch.process=15ms job.batch.parallel_processing=0ms job.1=0ms job.process.email=0ms
// timestamp=... level=INFO message="Job 1 completed successfully" job.batch.process=67ms job.1=52ms
// timestamp=... level=INFO message="Batch processing completed: 10 jobs processed" job.batch.process=2341ms
```

### Example 3: Distributed Service Integration

```typescript
import { Effect, pipe } from "effect"

interface PaymentGateway {
  readonly processPayment: (request: PaymentRequest) => Effect.Effect<PaymentResult, PaymentError>
}

interface NotificationService {
  readonly sendNotification: (notification: Notification) => Effect.Effect<void, NotificationError>
}

interface AuditService {
  readonly recordTransaction: (transaction: Transaction) => Effect.Effect<void, AuditError>
}

const processOrderPayment = (order: Order) =>
  Effect.gen(function* () {
    const paymentGateway = yield* PaymentGateway
    const notificationService = yield* NotificationService
    const auditService = yield* AuditService
    
    // Process payment with external service
    const paymentResult = yield* paymentGateway.processPayment({
      amount: order.total,
      currency: order.currency,
      source: order.paymentSource
    }).pipe(
      Effect.withLogSpan("external.payment_gateway"),
      Effect.retry(Schedule.exponential("500 millis").pipe(Schedule.maxAttempts(3)))
    )
    
    // Update order status in parallel with notifications
    const [updatedOrder] = yield* Effect.all([
      updateOrderStatus(order.id, "paid").pipe(
        Effect.withLogSpan("database.update_order")
      ),
      // Send customer notification
      notificationService.sendNotification({
        type: "payment_success",
        recipient: order.customer.email,
        data: { orderId: order.id, amount: order.total }
      }).pipe(
        Effect.withLogSpan("external.notification_service")
      ),
      // Record audit trail
      auditService.recordTransaction({
        orderId: order.id,
        paymentId: paymentResult.id,
        amount: order.total,
        timestamp: new Date()
      }).pipe(
        Effect.withLogSpan("external.audit_service")
      )
    ], { concurrency: 3 }).pipe(
      Effect.withLogSpan("order.parallel_updates")
    )
    
    return updatedOrder
  }).pipe(
    Effect.withLogSpan("order.payment.process"),
    Effect.annotateLogs({
      "order.id": order.id,
      "order.total": order.total,
      "order.currency": order.currency
    })
  )

// Complete distributed operation trace:
// timestamp=... level=INFO message="..." order.payment.process=0ms external.payment_gateway=0ms order.id=12345 order.total=99.99
// timestamp=... level=INFO message="..." order.payment.process=456ms order.parallel_updates=0ms database.update_order=0ms
// timestamp=... level=INFO message="..." order.payment.process=456ms order.parallel_updates=89ms external.notification_service=23ms
// timestamp=... level=INFO message="..." order.payment.process=789ms
```

## Advanced Features Deep Dive

### Feature 1: Manual LogSpan Creation and Rendering

While `Effect.withLogSpan` handles most use cases, you can create and manage LogSpans manually for advanced scenarios:

#### Basic LogSpan Creation

```typescript
import { LogSpan, Effect, Clock } from "effect"

// Create a LogSpan manually
const createCustomSpan = (label: string) =>
  Effect.gen(function* () {
    const startTime = yield* Clock.currentTimeMillis
    const span = LogSpan.make(label, startTime)
    return span
  })

// Render duration manually
const renderSpanDuration = (span: LogSpan.LogSpan) =>
  Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis
    const rendered = LogSpan.render(now)(span)
    yield* Effect.log(`Manual span: ${rendered}`)
  })
```

#### Real-World Manual Span Example

```typescript
import { LogSpan, Effect, Clock, FiberRef } from "effect"

// Custom span manager for complex operations
const withCustomSpanManager = <A, E, R>(
  operations: Array<{ label: string; effect: Effect.Effect<A, E, R> }>
) =>
  Effect.gen(function* () {
    const results: Array<A> = []
    const spans: Array<{ label: string; span: LogSpan.LogSpan }> = []
    
    for (const operation of operations) {
      const startTime = yield* Clock.currentTimeMillis
      const span = LogSpan.make(operation.label, startTime)
      spans.push({ label: operation.label, span })
      
      const result = yield* operation.effect
      results.push(result)
      
      const now = yield* Clock.currentTimeMillis
      const duration = LogSpan.render(now)(span)
      yield* Effect.log(`Operation completed: ${duration}`)
    }
    
    // Generate summary
    const totalTime = spans.reduce((acc, { span }) => {
      const now = Date.now()
      return acc + (now - span.startTime)
    }, 0)
    
    yield* Effect.log(`All operations completed in ${totalTime}ms`)
    return results
  })
```

### Feature 2: LogSpan Integration with FiberRef

LogSpans use Effect's FiberRef system, allowing for advanced fiber-local state management:

#### Accessing Current LogSpan Context

```typescript
import { FiberRef, Effect, List } from "effect"

// Access current log spans
const getCurrentSpanContext = Effect.gen(function* () {
  const currentSpans = yield* FiberRef.get(FiberRef.currentLogSpan)
  const spanLabels = List.map(currentSpans, (span) => span.label)
  yield* Effect.log("Current span context", { spans: spanLabels })
  return spanLabels
})

// Custom span context manipulation
const withTemporarySpanContext = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  additionalSpans: Array<string>
) =>
  Effect.gen(function* () {
    const currentTime = yield* Clock.currentTimeMillis
    const newSpans = additionalSpans.map(label => LogSpan.make(label, currentTime))
    
    return yield* FiberRef.locally(
      FiberRef.currentLogSpan,
      (current) => List.prependAll(current, newSpans)
    )(effect)
  })
```

### Feature 3: Advanced LogSpan Composition Patterns

#### Conditional Span Application

```typescript
import { Effect, pipe } from "effect"

// Helper for conditional span application
const maybeWithSpan = <A, E, R>(
  condition: boolean,
  spanLabel: string
) => (effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  condition ? effect.pipe(Effect.withLogSpan(spanLabel)) : effect

// Usage in complex business logic
const processUserAction = (user: User, action: UserAction, options: ProcessingOptions) =>
  Effect.gen(function* () {
    const validatedAction = yield* validateUserAction(user, action).pipe(
      maybeWithSpan(options.enableDetailedLogging, "user.validate_action")
    )
    
    const result = yield* executeUserAction(validatedAction).pipe(
      maybeWithSpan(options.enablePerformanceLogging, "user.execute_action")
    )
    
    return result
  }).pipe(
    Effect.withLogSpan("user.process_action")
  )
```

#### Dynamic Span Labels

```typescript
import { Effect, pipe } from "effect"

// Helper for dynamic span labels
const withDynamicSpan = <A, E, R>(
  labelFn: () => string
) => (effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  effect.pipe(Effect.withLogSpan(labelFn()))

// Usage with context-dependent labels
const processDocument = (document: Document, user: User) =>
  Effect.gen(function* () {
    const processed = yield* parseDocument(document).pipe(
      withDynamicSpan(() => `document.parse.${document.type}`)
    )
    
    const validated = yield* validateDocument(processed, user).pipe(
      withDynamicSpan(() => `document.validate.${user.role}`)
    )
    
    return validated
  }).pipe(
    withDynamicSpan(() => `document.process.${document.id}`)
  )
```

## Practical Patterns & Best Practices

### Pattern 1: Hierarchical Operation Naming

```typescript
// Consistent naming hierarchy for better log analysis
const processOrderWorkflow = (order: Order) =>
  Effect.gen(function* () {
    // Top-level workflow
    const validated = yield* validateOrder(order).pipe(
      Effect.withLogSpan("order.workflow.validate")
    )
    
    const priced = yield* calculatePricing(validated).pipe(
      Effect.withLogSpan("order.workflow.price")
    )
    
    const processed = yield* processPayment(priced).pipe(
      Effect.withLogSpan("order.workflow.payment")
    )
    
    const fulfilled = yield* fulfillOrder(processed).pipe(
      Effect.withLogSpan("order.workflow.fulfill")
    )
    
    return fulfilled
  }).pipe(
    Effect.withLogSpan("order.workflow.complete")
  )

// Helper for consistent naming
const withOrderSpan = (operation: string) => (label: string) =>
  `order.${operation}.${label}`

const orderOperations = withOrderSpan("workflow")

// Usage with helper
const processOrderWithHelper = (order: Order) =>
  Effect.gen(function* () {
    const validated = yield* validateOrder(order).pipe(
      Effect.withLogSpan(orderOperations("validate"))
    )
    // ... rest of operations
  }).pipe(
    Effect.withLogSpan(orderOperations("complete"))
  )
```

### Pattern 2: Error-Aware Span Context

```typescript
import { Effect, pipe } from "effect"

// Helper that preserves span context during error handling
const withSpanAndErrorContext = <A, E, R>(
  spanLabel: string
) => (effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.withLogSpan(spanLabel),
    Effect.tapError((error) =>
      Effect.log(`Operation failed in span: ${spanLabel}`, { error })
    )
  )

// Usage in complex error-prone operations
const complexDatabaseOperation = (query: DatabaseQuery) =>
  Effect.gen(function* () {
    const connection = yield* acquireConnection().pipe(
      withSpanAndErrorContext("database.acquire_connection")
    )
    
    const prepared = yield* prepareStatement(connection, query).pipe(
      withSpanAndErrorContext("database.prepare_statement")
    )
    
    const result = yield* executeQuery(prepared).pipe(
      withSpanAndErrorContext("database.execute_query")
    )
    
    yield* releaseConnection(connection).pipe(
      withSpanAndErrorContext("database.release_connection")
    )
    
    return result
  }).pipe(
    withSpanAndErrorContext("database.complex_operation")
  )
```

### Pattern 3: Performance Monitoring Integration

```typescript
import { Effect, Metric, pipe } from "effect"

// Combine LogSpan with metrics for comprehensive monitoring
const withSpanAndMetrics = <A, E, R>(
  spanLabel: string,
  successMetric: Metric.Metric.Counter<number>,
  errorMetric: Metric.Metric.Counter<number>,
  durationMetric: Metric.Metric.Histogram<number>
) => (effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.gen(function* () {
    const startTime = yield* Clock.currentTimeMillis
    
    const result = yield* effect.pipe(
      Effect.withLogSpan(spanLabel),
      Effect.tap(() => Metric.increment(successMetric)),
      Effect.tapError(() => Metric.increment(errorMetric))
    )
    
    const endTime = yield* Clock.currentTimeMillis
    const duration = endTime - startTime
    yield* Metric.update(durationMetric, duration)
    
    return result
  })

// Define metrics
const orderProcessingMetrics = {
  success: Metric.counter("order_processing_success"),
  errors: Metric.counter("order_processing_errors"), 
  duration: Metric.histogram("order_processing_duration")
}

// Usage with metrics
const processOrderWithMetrics = (order: Order) =>
  processOrder(order).pipe(
    withSpanAndMetrics(
      "order.process.monitored",
      orderProcessingMetrics.success,
      orderProcessingMetrics.errors,
      orderProcessingMetrics.duration
    )
  )
```

## Integration Examples

### Integration with HTTP Server Middleware

```typescript
import { HttpApp, HttpMiddleware, HttpServerRequest } from "@effect/platform"
import { Effect, pipe } from "effect"

// Custom middleware that adds request-specific log spans
const withRequestSpan = <E, R>(
  getSpanLabel: (request: HttpServerRequest.HttpServerRequest) => string
): HttpMiddleware.HttpMiddleware<E, R> =>
  HttpMiddleware.make((httpApp) => (request) =>
    httpApp(request).pipe(
      Effect.withLogSpan(getSpanLabel(request)),
      Effect.annotateLogs({
        "http.method": request.method,
        "http.path": request.url,
        "http.user_agent": request.headers["user-agent"] ?? "unknown"
      })
    ))

// Request-specific span labeling
const requestSpanLabeler = (request: HttpServerRequest.HttpServerRequest): string => {
  const method = request.method.toLowerCase()
  const path = request.url.split('?')[0].replace(/\/\d+/g, '/:id')
  return `http.${method}${path}`.replace(/\//g, '.')
}

// Usage with HTTP server
const httpServer = HttpApp.empty.pipe(
  HttpApp.get("/users/:id", (request) =>
    Effect.gen(function* () {
      const userId = request.params.id
      const user = yield* getUserById(userId).pipe(
        Effect.withLogSpan("user.fetch")
      )
      return HttpServerResponse.json(user)
    })
  ),
  withRequestSpan(requestSpanLabeler)
)

// Log output shows complete request trace:
// timestamp=... level=INFO message="..." http.get.users.:id=0ms user.fetch=0ms
// timestamp=... level=INFO message="..." http.get.users.:id=245ms
```

### Integration with Testing Framework

```typescript
import { Effect, TestClock, TestServices } from "effect"

// Test helper that captures span information
const captureSpanMetrics = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<{ result: A; spans: Array<string> }, E, R> =>
  Effect.gen(function* () {
    const spanCapture: Array<string> = []
    
    const result = yield* effect.pipe(
      Effect.tapSink(Effect.tap(Effect.log, (message) => {
        // Extract span information from log messages
        const spanMatch = message.toString().match(/(\w+\.\w+(?:\.\w+)*)=(\d+)ms/)
        if (spanMatch) {
          spanCapture.push(`${spanMatch[1]}:${spanMatch[2]}ms`)
        }
      }))
    )
    
    return { result, spans: spanCapture }
  })

// Test example
const testOrderProcessingTiming = Effect.gen(function* () {
  const testOrder: Order = {
    id: "test-123",
    items: [{ id: "item-1", price: 10.00 }],
    total: 10.00
  }
  
  const { result, spans } = yield* captureSpanMetrics(
    processOrder(testOrder)
  ).pipe(
    Effect.provide(TestServices.layer)
  )
  
  // Assert spans were captured
  const hasOrderSpan = spans.some(span => span.startsWith("order.process:"))
  const hasValidationSpan = spans.some(span => span.startsWith("order.validate:"))
  
  return {
    result,
    spans,
    assertions: {
      hasOrderSpan,
      hasValidationSpan
    }
  }
})
```

### Integration with OpenTelemetry

```typescript
import { Effect, Layer, pipe } from "effect"
import { NodeTracerProvider } from "@opentelemetry/sdk-node"

// Custom logger that bridges LogSpan to OpenTelemetry
const createOtelBridgeLogger = (tracer: Tracer) =>
  Logger.make((options) => {
    const spans = List.toArray(options.spans)
    
    // Create OpenTelemetry spans from LogSpans
    spans.forEach((logSpan) => {
      const otelSpan = tracer.startSpan(logSpan.label, {
        startTime: logSpan.startTime
      })
      
      // Add span attributes from log annotations
      const attributes = HashMap.toRecord(options.annotations)
      otelSpan.setAttributes(attributes)
      
      // End span with current time
      otelSpan.end()
    })
    
    // Also log to console
    console.log(Logger.stringLogger.log(options))
  })

// Layer that provides OpenTelemetry integration
const OtelLayer = Layer.effect(
  "OpenTelemetryLogger",
  Effect.gen(function* () {
    const tracer = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: "effect-app"
      })
    }).getTracer("effect-logspan")
    
    return createOtelBridgeLogger(tracer)
  })
)

// Usage with OpenTelemetry integration
const application = Effect.gen(function* () {
  const result = yield* processComplexWorkflow().pipe(
    Effect.withLogSpan("application.main")
  )
  return result
}).pipe(
  Effect.provide(OtelLayer)
)

// Now LogSpans automatically create OpenTelemetry traces
```

## Conclusion

LogSpan provides **structured timing context**, **hierarchical operation tracking**, and **zero-overhead performance monitoring** for Effect applications.

Key benefits:
- **Contextual Tracing**: Automatically maintains operation context across complex workflows
- **Performance Insights**: Built-in timing measurement without manual instrumentation  
- **Hierarchical Structure**: Natural composition creates detailed operation trees in logs

LogSpan is essential when you need detailed operation timing, distributed system tracing, or structured debugging context in your Effect applications.