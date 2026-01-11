# Code Observability Writer Agent Design

## Overview

The agent adds observability instrumentation to Effect code following established patterns from the beep-effect codebase.

---

## Error Definition Patterns

### Pattern 1: Simple Tagged Error
```typescript
import * as S from "effect/Schema"

export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String }
) {}
```

### Pattern 2: HTTP-Annotated Error
```typescript
import * as HttpApiSchema from "@effect/platform/HttpApiSchema"
import * as S from "effect/Schema"

export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String, resource: S.String },
  HttpApiSchema.annotations({ status: 404 })
) {}
```

### Pattern 3: Error with Rich Context
```typescript
import * as S from "effect/Schema"

export class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  {
    field: S.String,
    message: S.String,
    value: S.Unknown,
    cause: S.optional(S.Defect),
    context: S.optional(S.Record({ key: S.String, value: S.Unknown }))
  }
) {}
```

### Pattern 4: Error with Static Helpers
```typescript
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

export class ServiceError extends S.TaggedError<ServiceError>()(
  "ServiceError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
    operation: S.String
  }
) {
  static readonly mapError = (operation: string) =>
    Effect.mapError((error: unknown) =>
      new ServiceError({
        message: error instanceof Error ? error.message : String(error),
        cause: error,
        operation
      })
    )

  static readonly withInstrumentation = (operation: string) =>
    <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      effect.pipe(
        ServiceError.mapError(operation),
        Effect.annotateLogs({ operation }),
        Effect.withSpan(operation),
        Effect.tapError(Effect.logError)
      )
}
```

---

## Logging Patterns

### Pattern 1: Basic Structured Logging
```typescript
import * as Effect from "effect/Effect"
import * as DateTime from "effect/DateTime"

yield* Effect.logInfo("User created", {
  userId: user.id,
  email: user.email,
  timestamp: DateTime.unsafeNow()
})
```

### Pattern 2: Scoped Logging Context
```typescript
import * as Effect from "effect/Effect"

yield* Effect.annotateLogs(
  Effect.gen(function* () {
    yield* Effect.logInfo("Starting operation")
    yield* doWork()
    yield* Effect.logInfo("Operation complete")
  }),
  { requestId, userId, service: "auth" }
)
```

### Pattern 3: Error Logging with Cause
```typescript
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
import * as F from "effect/Function"

yield* F.pipe(
  program,
  Effect.catchAllCause((cause) =>
    Effect.logError("Operation failed", {
      cause: Cause.pretty(cause),
      operation: "createUser"
    })
  )
)
```

### Pattern 4: Conditional Error Logging
```typescript
import * as Effect from "effect/Effect"

yield* effect.pipe(
  Effect.tapError((error) =>
    Effect.logError("Request failed", {
      error: error._tag,
      details: error
    })
  )
)
```

---

## Tracing Patterns

### Pattern 1: Basic Span Wrapping
```typescript
import * as Effect from "effect/Effect"

const tracedOperation = Effect.gen(function* () {
  // ... operation
}).pipe(Effect.withSpan("service.operation"))
```

### Pattern 2: Span with Attributes
```typescript
import * as Effect from "effect/Effect"

const tracedOperation = Effect.gen(function* () {
  yield* Effect.annotateCurrentSpan("userId", userId)
  yield* Effect.annotateCurrentSpan("entityId", entityId)
  // ... operation
}).pipe(
  Effect.withSpan("user.update", {
    attributes: { userId, operation: "update" }
  })
)
```

### Pattern 3: Nested Spans
```typescript
import * as Effect from "effect/Effect"

const parentOperation = Effect.gen(function* () {
  yield* Effect.logInfo("Starting parent operation")

  yield* Effect.gen(function* () {
    yield* Effect.logInfo("Child operation 1")
  }).pipe(Effect.withSpan("parent.child1"))

  yield* Effect.gen(function* () {
    yield* Effect.logInfo("Child operation 2")
  }).pipe(Effect.withSpan("parent.child2"))
}).pipe(Effect.withSpan("parent.operation"))
```

### Pattern 4: Repository Span Pattern
```typescript
import * as Effect from "effect/Effect"

const insert = <T extends { id: string }>(entity: T) =>
  Effect.gen(function* () {
    // ... insert logic
    return entity
  }).pipe(
    Effect.withSpan(`UserRepo.insert`, {
      attributes: { entityId: entity.id }
    })
  )
```

---

## Metrics Patterns

### Pattern 1: Counter for Events
```typescript
import * as Metric from "effect/Metric"
import * as Effect from "effect/Effect"

const userCreatedCounter = Metric.counter("users.created.total")

yield* Metric.increment(userCreatedCounter)
```

### Pattern 2: Histogram for Latency
```typescript
import * as Metric from "effect/Metric"
import * as Effect from "effect/Effect"

const requestLatency = Metric.histogram("request.latency.ms")

yield* Metric.trackDuration(requestLatency)(operation)
```

### Pattern 3: Gauge for Current Values
```typescript
import * as Metric from "effect/Metric"
import * as Effect from "effect/Effect"

const activeConnections = Metric.gauge("connections.active")

yield* Metric.set(activeConnections, currentCount)
```

### Pattern 4: Tagged Metrics
```typescript
import * as Metric from "effect/Metric"
import * as Effect from "effect/Effect"

const requestCounter = Metric.counter("http.requests.total").pipe(
  Metric.tagged("method", "GET"),
  Metric.tagged("path", "/api/users")
)

yield* Metric.increment(requestCounter)
```

---

## Combined Instrumentation Pattern

### Full Observability Wrapper
```typescript
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
import * as Metric from "effect/Metric"

const withObservability = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  options: {
    readonly operation: string
    readonly successCounter?: Metric.Metric.Counter<number>
    readonly errorCounter?: Metric.Metric.Counter<number>
    readonly latencyHistogram?: Metric.Metric<Metric.Metric.Type.Histogram, number, number>
    readonly attributes?: Record<string, unknown>
  }
) =>
  Effect.gen(function* () {
    const start = yield* Effect.sync(() => Date.now())

    return yield* effect.pipe(
      Effect.tap(() =>
        options.successCounter
          ? Metric.increment(options.successCounter)
          : Effect.void
      ),
      Effect.tapError((error) =>
        Effect.all([
          options.errorCounter
            ? Metric.increment(options.errorCounter)
            : Effect.void,
          Effect.logError(`${options.operation} failed`, {
            error: error instanceof Error ? error.message : String(error),
            operation: options.operation
          })
        ])
      ),
      Effect.ensuring(
        Effect.gen(function* () {
          const duration = Date.now() - start
          if (options.latencyHistogram) {
            yield* Metric.update(options.latencyHistogram, duration)
          }
        })
      ),
      Effect.withSpan(options.operation, { attributes: options.attributes })
    )
  })
```

---

## Agent Methodology

### Step 1: Identify Instrumentation Points
- Service entry points
- Repository methods
- External API calls
- Background jobs
- Error-prone operations

### Step 2: Define Error Types
1. Create tagged error class
2. Add context properties
3. Annotate with HTTP status if needed
4. Add static helper methods

### Step 3: Add Logging
1. Entry point logging
2. Success/completion logging
3. Error logging with cause
4. Use scoped annotations

### Step 4: Add Tracing
1. Wrap in span
2. Add relevant attributes
3. Maintain span hierarchy

### Step 5: Add Metrics
1. Success/error counters
2. Duration histograms
3. Resource gauges

---

## Output Format

The agent produces instrumented code with:
1. Error classes in separate error files
2. Logging at strategic points
3. Spans wrapping operations
4. Metrics tracking outcomes
