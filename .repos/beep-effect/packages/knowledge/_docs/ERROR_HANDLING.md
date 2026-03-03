# Error Handling Architecture

This document outlines the error handling strategy for the `@core-v2` package, leveraging Effect's `Exit` and `Cause` types to provide robust, recoverable, and observable failure management.

## Core Principles

1.  **No Exceptions**: We functionality do not throw exceptions. All errors are represented as values in the Error channel of the `Effect` type.
2.  **Granular Failure Modes**: We distinguish between *expected errors* (Client errors, upstream failures), *defects* (Code bugs, invariance violations), and *interruptions* (Timeouts, cancellations).
3.  **Preserve Cause**: We never lose error context. When wrapping errors, we include the original `Cause`.

## Failure Modes

Effect models three distinct types of failure:

### 1. Fail (Expected Errors)
Represents anticipated failures that are part of the domain logic (e.g., Validation Error, Rate Limit, Not Found).
*   **Handling**: Recoverable. Should be handled via `catch`, `retry`, or mapping to domain errors.
*   **Representation**: Typed errors in the `E` channel (e.g., `Effect<A, ExtractionError>`).

### 2. Die (Defects)
Represents unexpected failures indicating a bug or environmental catastrophe (e.g., Null defined, JSON parse error on "trusted" data).
*   **Handling**: fatal but sandboxed. Should generally bubble up to the global boundary or be caught strictly for logging/alerting before crash/restart.
*   **Representation**: `Cause.Die`.

### 3. Interrupt
Represents deliberate cancellation (e.g., Timeout, Signal).
*   **Handling**: Cleanup and exit. Should not be treated as a generic error.

## Patterns

### Graceful Shutdown (SIGTERM)
Use `Effect.runPromiseExit` instead of `Effect.runPromise` in shutdown handlers to ensure failures during shutdown are logged and the process exits with the correct code.

```typescript
// ✅ Good
process.on("SIGTERM", () => {
  Effect.runPromiseExit(shutdownEffect).then((exit) => {
    if (Exit.isFailure(exit)) {
      console.error(Cause.pretty(exit.cause))
      process.exit(1)
    }
    process.exit(0)
  })
})
```

### Stream Resilience
For streaming workflows (e.g., `StreamingExtraction`), processing a single chunk should not crash the entire stream if a *defect* occurs in that chunk, but *systemic* errors should halt the stream.

Use `Effect.exit` to inspect the result of inner stream processing:

```typescript
// ✅ Good
Stream.mapEffect((item) =>
  process(item).pipe(
    Effect.exit // Materialize successful/failed/defect result to value
  )
).pipe(
  Stream.mapEffect((exit) => Effect.gen(function*() {
    // 1. Success -> Unwrap and continue
    if (Exit.isSuccess(exit)) return Option.some(exit.value)

    const cause = exit.cause
    // 2. Defect -> Log and Ignore (Skip bad chunk)
    if (Cause.isDie(cause)) {
      yield* Effect.logError("Defect processing chunk", { cause })
      return Option.none()
    }

    // 3. Systemic/Expected Failure -> Stop Stream
    return yield* Effect.failCause(cause)
  })),
  Stream.filterMap((x) => x) // Filter out skipped items
)
```

### LLM Retries & Sandboxing
LLM calls should retry on transient errors (RateLimit, 5xx) but *fail fast* on defects (bugs in prompt code). Use `Effect.sandbox` to inspect external `Cause` during retry policies.

```typescript
Effect.retry({
  schedule: exponentialBackoff,
  // Only retry if it's a generic Failure (expected error), NOT a Defect (die)
  while: (cause) => Cause.isFailure(cause) && !Cause.isDie(cause)
})
```

### Global Error Handling (HTTP)
At the HTTP edge, use `HttpRouter.catchAllCause` to catch *all* failures (including Defects) and map them to appropriate status codes.

*   **Defect**: 500 Internal Server Error (Log stack trace).
*   **Interruption**: 503 Service Unavailable (or 499 Client Closed Request).
*   **Expected Error**: Map to domain status (400, 404, 429).
