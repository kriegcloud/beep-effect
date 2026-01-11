# Code Observability Writer Research Findings

## Effect Observability Modules

### Cause Module
**Key APIs**:
- `Cause.squash` — Extracts the most "important" defect from a `Cause` (prioritizes: failures > defects > interruptions)
- `Cause.failures` — Extracts all recoverable errors of type `E` as a `Chunk<E>`
- `Cause.defects` — Extracts all unrecoverable defects as `Chunk<unknown>`
- `Cause.pretty` — Formats a Cause as a human-readable string

**Usage Patterns**:
```typescript
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"

yield* Effect.catchAllCause(program, (cause) =>
  Effect.logError("Operation failed", {
    cause: Cause.pretty(cause),
    failures: Cause.failures(cause),
    defects: Cause.defects(cause)
  })
)
```

### Logger Module
**Key APIs**:
- `Effect.log` — General log at default level
- `Effect.logInfo` — Informational logs
- `Effect.logDebug` — Debug-level logs
- `Effect.logWarning` — Warning logs
- `Effect.logError` — Error logs
- `Effect.annotateLogs` — Add structured context to all logs within scope
- `Logger.prettyLogger` — Human-readable console output
- `Logger.jsonLogger` — JSON-structured output for production
- `Logger.structuredLogger` — Structured logging format

**Structured Logging Format**:
```typescript
import * as Effect from "effect/Effect"

// Basic structured logging
yield* Effect.logInfo("User created", { userId, email })

// Annotate all logs in scope
yield* Effect.annotateLogs(
  Effect.gen(function* () {
    yield* Effect.logInfo("Starting operation")
    yield* Effect.logInfo("Operation complete")
  }),
  { requestId, userId, service: "auth" }
)
```

### Metric Module
**Key APIs**:
- `Metric.counter` — Counting events (monotonically increasing)
- `Metric.gauge` — Current value measurements
- `Metric.histogram` — Distribution of values with buckets
- `Metric.summary` — Statistical summaries (percentiles)
- `Metric.increment` — Increment a counter by 1
- `Metric.incrementBy` — Increment by specific amount
- `Metric.timer` — Measure durations automatically
- `Metric.trackDuration` — Track operation duration

**Collection Patterns**:
```typescript
import * as Metric from "effect/Metric"
import * as Effect from "effect/Effect"

// Define metrics
const requestCounter = Metric.counter("http.requests.total")
const requestLatency = Metric.histogram("http.request.duration.ms")

// Usage
yield* Metric.increment(requestCounter)
yield* Metric.trackDuration(requestLatency)(operation)
```

### Tracer Module
**Key APIs**:
- `Effect.withSpan` — Wrap an effect in a tracing span
- `Effect.annotateCurrentSpan` — Add attributes to current span
- `Tracer.make` — Create custom tracer
- `Tracer.ParentSpan` — Access parent span context
- `Tracer.externalSpan` — Create span from external context

**Context Propagation**:
```typescript
import * as Effect from "effect/Effect"

const tracedOperation = Effect.gen(function* () {
  yield* Effect.annotateCurrentSpan("userId", userId)
  yield* Effect.annotateCurrentSpan("operation", "createUser")
  // ... operation logic
}).pipe(Effect.withSpan("user.create"))
```

### Schema.TaggedError
**Definition Pattern**:
```typescript
import * as S from "effect/Schema"

export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String, resource: S.String }
) {}
```

**With HTTP Annotations** (from codebase):
```typescript
import * as HttpApiSchema from "@effect/platform/HttpApiSchema"
import * as S from "effect/Schema"

export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String, resource: S.String },
  HttpApiSchema.annotations({ status: 404 })
) {}
```

**Context Properties Pattern** (from codebase):
```typescript
export class IamAuthError extends S.TaggedError<IamAuthError>()("IamAuthError", {
  message: S.String,
  cause: S.optional(S.Defect),
  context: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {}
```

---

## Existing Patterns in Codebase

### Error Definitions Found

**1. Simple Tagged Errors** (`packages/common/errors/src/errors.ts`):
```typescript
export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String, resource: S.String },
  HttpApiSchema.annotations({ status: 404 })
) {}
```

**2. Errors with Rich Context** (`packages/iam/domain/src/api/common/errors.ts`):
```typescript
export class IamAuthError extends S.TaggedError<IamAuthError>()($I`IamAuthError`, {
  message: S.String,
  cause: S.optional(S.Defect),
  context: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {
  static readonly flowMap = (operation: string) =>
    <I, A, E, R>(effect: Effect.Effect<A, E, R>, n: I) =>
      effect.pipe(
        this.mapError({ operation, payload: n }),
        Effect.annotateLogs({ arguments: n }),
        Effect.withSpan(operation, { attributes: { payload: n } }),
        Effect.tapError(Effect.logError)
      )
}
```

**3. Database Errors with Formatting** (`packages/shared/domain/src/errors/db-error/db-error.ts`):
```typescript
export class DatabaseError extends S.TaggedError<DatabaseError>($I`DatabaseError`)(
  "DatabaseError",
  {
    type: S.optional(PgErrorCodeFromKey.From),
    pgError: S.optional(S.NullOr(RawPgError)),
    cause: S.Defect,
  }
) {
  static readonly format = (error: unknown, query?: string, params?: unknown[]): string => {
    // Rich error formatting with source location, query, params
  }
}
```

**4. Domain-Specific Errors** (`packages/documents/domain/src/errors.ts`):
```typescript
export class MetadataParseError extends Data.TaggedError("MetadataParseError")<{
  readonly message: string;
  readonly cause: unknown;
  readonly fileName?: string | undefined;
  readonly phase?: "read" | "parse" | "decode" | undefined;
}> {}
```

### Logging Patterns Found

**1. HTTP Middleware Logging** (`packages/runtime/server/src/Logger.layer.ts`):
```typescript
return Effect.zipRight(
  Effect.annotateLogs(Effect.log("Sent HTTP response"), {
    "http.method": request.method,
    "http.url": request.url,
    "http.status": exit.value.status,
  }),
  exit
);
```

**2. Span + Logging Combined** (`packages/iam/domain/src/api/common/errors.ts`):
```typescript
Effect.annotateLogs({ arguments: n }),
Effect.withSpan(operation, { attributes: { payload: n } }),
Effect.tapError(Effect.logError)
```

**3. Repository Span Patterns** (`packages/shared/domain/src/factories/db-repo.ts`):
```typescript
Effect.withSpan(`${spanPrefix}.insert`, {
  attributes: { entityId: String(entity.id) }
})
```

**4. Scoped Annotations** (`packages/common/schema/src/integrations/files/metadata/Metadata.service.ts`):
```typescript
yield* Effect.annotateCurrentSpan("exif.fileName", file.name);
```

---

## Key Effect Imports for Observability

```typescript
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
import * as S from "effect/Schema"
import * as Metric from "effect/Metric"
import * as Logger from "effect/Logger"
import * as DateTime from "effect/DateTime"
import * as F from "effect/Function"
import * as A from "effect/Array"
import * as Str from "effect/String"
import * as HttpApiSchema from "@effect/platform/HttpApiSchema"
```

---

## Patterns Summary

### Error Naming Conventions
- Use `<Domain><Context>Error` format (e.g., `IamAuthError`, `DatabaseError`, `MetadataParseError`)
- Tag matches class name (e.g., `"UserNotFoundError"`)
- Include relevant context fields (`userId`, `operation`, `cause`)

### Structured Logging Principles
- ALWAYS use object notation: `Effect.logInfo("message", { key: value })`
- NEVER use string concatenation
- Use `Effect.annotateLogs` for scoped context
- Include `timestamp` via `DateTime.unsafeNow()` when not auto-provided

### Tracing Best Practices
- Wrap operations with `Effect.withSpan("service.operation")`
- Use `Effect.annotateCurrentSpan` for dynamic attributes
- Follow `domain.operation` naming convention for spans
- Include entity IDs in span attributes

### Cause Tracking Strategy
- Use `Effect.catchAllCause` for comprehensive error handling
- Extract details via `Cause.pretty`, `Cause.failures`, `Cause.defects`
- Log cause information in structured format
