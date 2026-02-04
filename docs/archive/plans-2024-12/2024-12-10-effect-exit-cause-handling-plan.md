# Effect Exit/Cause Handling Implementation Plan

**Date:** 2024-12-10
**Scope:** `packages/@core-v2/src/`
**Goal:** Leverage Effect's Exit, Cause, and error handling utilities for predictable, clean success/failure paths

---

## Table of Contents

1. [Effect Error Model Deep Dive](#1-effect-error-model-deep-dive)
2. [Current State Analysis](#2-current-state-analysis)
3. [Critical Issues](#3-critical-issues)
4. [Quick Wins](#4-quick-wins)
5. [Implementation Order](#5-implementation-order)

---

## 1. Effect Error Model Deep Dive

### 1.1 The Three Failure Modes

Effect distinguishes between three fundamentally different kinds of failures:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Effect<A, E, R>                             │
│                                                                     │
│  Success: Returns value of type A                                   │
│                                                                     │
│  Failure: Wrapped in Cause<E> which can be:                        │
│    ├── Fail<E>     → Expected/typed error (your E type)            │
│    ├── Die         → Unexpected defect (thrown exception, bug)     │
│    ├── Interrupt   → Fiber was cancelled/interrupted               │
│    ├── Sequential  → Two causes in sequence (try + finally)        │
│    └── Parallel    → Two causes concurrent (parallel operations)   │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this matters for @core-v2:**

| Failure Type | Example in Our Code | How to Handle |
|--------------|---------------------|---------------|
| **Fail** | `LlmRateLimit`, `ExtractionError` | Retry, degrade gracefully, report to user |
| **Die** | `null.property`, JSON parse on invalid data | Log stack trace, alert ops, don't retry |
| **Interrupt** | SIGTERM during extraction, timeout | Clean up resources, mark job incomplete |

### 1.2 Exit<A, E> - The Final Result

`Exit` is what you get when an Effect completes. It's a simple discriminated union:

```typescript
type Exit<A, E> =
  | { _tag: "Success"; value: A }
  | { _tag: "Failure"; cause: Cause<E> }
```

**Key APIs:**

```typescript
import { Effect, Exit, Cause } from "effect"

// Run and get Exit (doesn't throw!)
const exit = await Effect.runPromiseExit(myEffect)

// Pattern match on Exit
Exit.match(exit, {
  onSuccess: (value) => console.log("Success:", value),
  onFailure: (cause) => console.log("Failure:", Cause.pretty(cause))
})

// Check Exit type
Exit.isSuccess(exit)  // true if succeeded
Exit.isFailure(exit)  // true if any failure
Exit.isInterrupted(exit)  // true if interrupted
```

### 1.3 Cause<E> - The Full Error Story

`Cause` preserves **all** error information, including:
- The typed error E
- Stack traces
- Multiple errors from parallel/sequential operations
- Interruption information

**Key APIs:**

```typescript
import { Cause } from "effect"

// Pattern match on Cause (comprehensive)
Cause.match(cause, {
  onEmpty: () => "no error",
  onFail: (error) => `Expected error: ${error}`,
  onDie: (defect) => `Bug/defect: ${defect}`,
  onInterrupt: (fiberId) => `Interrupted: ${fiberId}`,
  onSequential: (left, right) => `${left} then ${right}`,
  onParallel: (left, right) => `${left} and ${right}`
})

// Extract specific information
Cause.failures(cause)  // Chunk<E> - all typed errors
Cause.defects(cause)   // Chunk<unknown> - all defects
Cause.isFailure(cause) // Has typed errors?
Cause.isDie(cause)     // Has defects?
Cause.isInterrupted(cause)  // Was interrupted?

// Pretty print for logging
Cause.pretty(cause)  // Human-readable with stack traces

// AVOID: Loses structure!
Cause.squash(cause)  // Flattens to single error, loses info
```

### 1.4 catchAll vs catchAllCause

This is the **most important distinction** for production code:

```typescript
// catchAll - ONLY catches typed errors (Fail<E>)
// Defects and interrupts propagate!
effect.pipe(
  Effect.catchAll((error: E) => ...)
)

// catchAllCause - Catches EVERYTHING
// Use at boundaries (HTTP handlers, job runners, etc.)
effect.pipe(
  Effect.catchAllCause((cause: Cause<E>) => ...)
)
```

**Rule of thumb:**
- Use `catchAll` for business logic error handling
- Use `catchAllCause` at system boundaries where you must handle defects

### 1.5 Effect.sandbox - Exposing the Full Cause

`sandbox` transforms the error channel to expose the full Cause:

```typescript
// Before: Effect<A, E, R>
// After:  Effect<A, Cause<E>, R>

const sandboxed = Effect.sandbox(riskyEffect)

// Now you can use catchAll on the Cause
const handled = sandboxed.pipe(
  Effect.catchAll((cause) => {
    if (Cause.isFailure(cause)) {
      // Handle expected errors
    } else if (Cause.isDie(cause)) {
      // Handle defects
    }
    return fallback
  }),
  Effect.unsandbox  // Restore original error type
)
```

### 1.6 Effect.exit - Get Exit Without Running

`Effect.exit` wraps an effect to return its Exit:

```typescript
// Effect.exit: Effect<A, E, R> → Effect<Exit<A, E>, never, R>

const program = Effect.gen(function* () {
  const exit = yield* Effect.exit(riskyEffect)

  if (Exit.isFailure(exit)) {
    const cause = exit.cause
    if (Cause.isDie(cause)) {
      yield* Effect.logError("Defect detected", {
        defect: Cause.defects(cause)
      })
    }
  }

  return exit
})
```

---

## 2. Current State Analysis

### 2.1 What's Working Well ✅

| Pattern | Location | Assessment |
|---------|----------|------------|
| Tagged domain errors | `Domain/Error/*.ts` | Good use of `Data.TaggedError` |
| Error logging | Throughout | Consistent `Effect.logError` usage |
| Retry with schedule | `Extraction.ts` | Proper exponential backoff |
| Systemic error detection | `StreamingExtraction.ts:31-55` | Smart `isSystemicError` check |

### 2.2 Problems Found ⚠️

| Issue | Location | Impact |
|-------|----------|--------|
| `runPromise` in SIGTERM | `server.ts:84` | Throws on failure → crash |
| `Cause.squash` losing info | `JobManager.ts:206` | Can't distinguish defects from errors |
| `catchAll` at boundaries | Multiple | Misses defects |
| No Exit-based final handling | Everywhere | Results thrown instead of handled |

---

## 3. Critical Issues

### 3.1 SIGTERM Handler Uses `runPromise` (P0)

**Location:** `server.ts:82-92`

**Current Code:**
```typescript
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, initiating graceful shutdown")
  Effect.runPromise(  // ← THROWS ON FAILURE!
    Effect.gen(function*() {
      yield* shutdown.initiateShutdown()
      yield* shutdown.drain()
      console.log("Graceful shutdown complete")
      process.exit(0)
    })
  )
})
```

**Problem:**
- `Effect.runPromise` throws if the effect fails
- If `initiateShutdown()` or `drain()` fail, the process crashes ungracefully
- Cloud Run sees this as a crash, not a clean shutdown
- Metrics/logs may be lost

**Why It Matters:**
In production, SIGTERM is sent by Cloud Run before killing the container. If shutdown logic has any bug (defect) or unexpected condition, the current code will crash, losing in-flight request tracking and potentially corrupting state.

**Recommended Fix:**
```typescript
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, initiating graceful shutdown")
  Effect.runPromiseExit(
    Effect.gen(function*() {
      yield* shutdown.initiateShutdown()
      yield* shutdown.drain()
    })
  ).then((exit) => {
    Exit.match(exit, {
      onSuccess: () => {
        console.log("Graceful shutdown complete")
        process.exit(0)
      },
      onFailure: (cause) => {
        console.error("Shutdown failed:", Cause.pretty(cause))
        // Still exit, but with error code
        process.exit(1)
      }
    })
  })
})
```

**Effect API Used:**
- `Effect.runPromiseExit` - Never throws, returns `Promise<Exit<A, E>>`
- `Exit.match` - Pattern match on success/failure
- `Cause.pretty` - Human-readable error with stack traces

---

### 3.2 Cause.squash Destroys Error Structure (P0)

**Location:** `JobManager.ts:204-207`

**Current Code:**
```typescript
Effect.catchAllCause((cause) =>
  Effect.gen(function*() {
    const error = Cause.squash(cause)  // ← LOSES STRUCTURE!
    const message = (error as any) instanceof Error
      ? (error as any).message
      : String(error)
    yield* Effect.logError(`Extraction failed for job ${jobId}: ${message}`)
    // ...
  })
)
```

**Problem:**
- `Cause.squash` flattens the entire cause tree into a single error
- Loses distinction between:
  - Expected errors (e.g., LLM rate limit) → should retry
  - Defects (e.g., null pointer) → bug, don't retry
  - Interruptions (e.g., timeout) → may resume
  - Parallel failures → multiple root causes

**Why It Matters:**
Without proper cause inspection, we can't:
1. Decide whether to retry (only retry expected errors, not bugs)
2. Alert on defects (bugs in our code need immediate attention)
3. Track interruption vs failure for metrics
4. Provide accurate error messages to users

**Recommended Fix:**
```typescript
Effect.catchAllCause((cause) =>
  Effect.gen(function*() {
    // Classify the cause
    const isDefect = Cause.isDie(cause)
    const isInterrupted = Cause.isInterrupted(cause)
    const failures = Cause.failures(cause)
    const defects = Cause.defects(cause)

    // Build informative message
    let message: string
    let errorType: "expected" | "defect" | "interrupted"

    if (isDefect) {
      errorType = "defect"
      const defect = Chunk.head(defects).pipe(Option.getOrElse(() => "unknown"))
      message = `Unexpected defect: ${defect instanceof Error ? defect.stack : String(defect)}`
    } else if (isInterrupted) {
      errorType = "interrupted"
      message = "Extraction was interrupted (timeout or cancellation)"
    } else {
      errorType = "expected"
      const firstError = Chunk.head(failures).pipe(Option.getOrElse(() => "unknown"))
      message = firstError instanceof Error ? firstError.message : String(firstError)
    }

    // Log with full cause for debugging
    yield* Effect.logError(`Extraction failed for job ${jobId}`, {
      errorType,
      message,
      cause: Cause.pretty(cause)  // Full details in logs
    })

    // Store error type for job status
    yield* Effect.all([
      deduplicator.fail(key, new Error(message)),
      updateJobStatus(jobId, (job) => ({
        ...job,
        status: "failed",
        error: message,
        errorType  // NEW: Track error classification
      }))
    ], { concurrency: "unbounded" })
  })
)
```

**Effect APIs Used:**
- `Cause.isDie` - Check if cause contains defects
- `Cause.isInterrupted` - Check if cause was interruption
- `Cause.failures` - Extract all Fail<E> errors as Chunk
- `Cause.defects` - Extract all Die defects as Chunk
- `Cause.pretty` - Full human-readable representation

---

## 4. Quick Wins

### 4.1 Add catchAllCause to Streaming Extraction Chunk Processing

**Location:** `StreamingExtraction.ts` (around line 150, in the Stream pipeline)

**Current Pattern:**
```typescript
Stream.fromIterable(chunks).pipe(
  Stream.mapEffect((chunk) => processChunk(chunk)),
  // If processChunk throws (defect), stream dies
)
```

**Problem:**
If any chunk processor throws an unexpected exception (defect), the entire stream fails. We can't distinguish between:
- A single chunk having bad data (skip it, continue)
- A systemic issue (stop everything)

**Recommended Fix:**
```typescript
Stream.fromIterable(chunks).pipe(
  Stream.mapEffect((chunk) =>
    processChunk(chunk).pipe(
      Effect.exit,
      Effect.map((exit) => ({ chunkIndex: chunk.index, exit }))
    )
  ),
  Stream.tap(({ chunkIndex, exit }) =>
    Exit.match(exit, {
      onSuccess: () => Effect.void,
      onFailure: (cause) => {
        if (Cause.isDie(cause)) {
          // Log defect but continue (single chunk bug)
          return Effect.logWarning("Defect in chunk processing", {
            chunkIndex,
            defect: Cause.pretty(cause)
          })
        }
        // For expected errors, already handled
        return Effect.void
      }
    })
  ),
  Stream.filterMap(({ exit }) =>
    Exit.isSuccess(exit) ? Option.some(exit.value) : Option.none()
  )
)
```

**Effort:** 25 minutes

---

### 4.2 Exit-Based HTTP Error Responses

**Location:** `Runtime/HttpServer.ts` (POST /api/v1/extract handler)

**Current Pattern:**
```typescript
HttpRouter.post(
  "/api/v1/extract",
  Effect.gen(function*() {
    const manager = yield* JobManager
    const request = yield* HttpServerRequest.schemaBodyJson(SubmitJobRequest)
    const response = yield* manager.submit(request)  // Errors propagate up
    return yield* HttpServerResponse.json(response, { status: 202 })
  })
)
```

**Problem:**
All errors become 500 Internal Server Error. No distinction between:
- 400 Bad Request (schema validation failed)
- 429 Too Many Requests (rate limited)
- 503 Service Unavailable (system issue)
- 500 Internal Server Error (actual bug)

**Recommended Fix:**
```typescript
HttpRouter.post(
  "/api/v1/extract",
  Effect.gen(function*() {
    const manager = yield* JobManager
    const request = yield* HttpServerRequest.schemaBodyJson(SubmitJobRequest)

    const exit = yield* Effect.exit(manager.submit(request))

    return yield* Exit.match(exit, {
      onSuccess: (response) =>
        HttpServerResponse.json(response, { status: 202 }),

      onFailure: (cause) => {
        // Classify error for appropriate HTTP status
        if (Cause.isDie(cause)) {
          // Defect = bug in our code
          return HttpServerResponse.json(
            { error: "Internal server error", type: "defect" },
            { status: 500 }
          )
        }

        const failures = Cause.failures(cause)
        const firstError = Chunk.head(failures).pipe(Option.getOrNull)

        // Match on error type for status code
        if (firstError instanceof LlmRateLimit) {
          return HttpServerResponse.json(
            { error: "Rate limited, try again later", type: "rate_limit" },
            { status: 429 }
          )
        }

        if (firstError instanceof ExtractionError) {
          return HttpServerResponse.json(
            { error: firstError.message, type: "extraction_error" },
            { status: 422 }  // Unprocessable Entity
          )
        }

        // Default to 500
        return HttpServerResponse.json(
          { error: "Extraction failed", type: "unknown" },
          { status: 500 }
        )
      }
    })
  })
)
```

**Effort:** 20 minutes

---

### 4.3 Sandbox LLM Retry Layer

**Location:** `Service/Extraction.ts` (in retry logic)

**Current Pattern:**
```typescript
const withRetry = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.retry(retrySchedule),
    Effect.catchAll((error) => ...)
  )
```

**Problem:**
If a defect occurs inside the effect (e.g., JSON parsing throws on malformed LLM response), retry will attempt to retry it. Defects should not be retried - they're bugs.

**Recommended Fix:**
```typescript
const withRetry = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.sandbox,  // Expose full Cause
    Effect.retry({
      ...retrySchedule,
      // Only retry expected failures, not defects
      while: (cause) => Cause.isFailure(cause) && !Cause.isDie(cause)
    }),
    Effect.catchAll((cause) => {
      if (Cause.isDie(cause)) {
        // Don't retry defects - log and fail immediately
        return Effect.logError("Defect in LLM call, not retrying", {
          cause: Cause.pretty(cause)
        }).pipe(
          Effect.flatMap(() => Effect.failCause(cause))
        )
      }
      // Re-raise expected errors for outer handling
      return Effect.failCause(cause)
    }),
    Effect.unsandbox  // Restore original error type
  )
```

**Effort:** 15 minutes

---

### 4.4 Cause-Aware Timeout Handling

**Location:** `JobManager.ts:166-170`

**Current Pattern:**
```typescript
Effect.timeoutFail({
  duration: Duration.millis(CLOUD_RUN_TIMEOUT_MS),
  onTimeout: () => new Error(`Extraction exceeded timeout...`)
})
```

**Problem:**
Timeout creates a regular Error, indistinguishable from other failures. We lose the fact that it was specifically a timeout (which might need different handling - e.g., partial results might be available).

**Recommended Fix:**
```typescript
// Define a specific timeout error
class ExtractionTimeoutError extends Data.TaggedError("ExtractionTimeoutError")<{
  readonly jobId: string
  readonly timeoutMs: number
  readonly partialProgress?: {
    chunksProcessed: number
    chunksTotal: number
  }
}> {}

// Use in JobManager
yield* workflow.extract(text, config).pipe(
  Effect.timeoutFail({
    duration: Duration.millis(CLOUD_RUN_TIMEOUT_MS),
    onTimeout: () => new ExtractionTimeoutError({
      jobId,
      timeoutMs: CLOUD_RUN_TIMEOUT_MS,
      partialProgress: undefined  // Could track this with Ref
    })
  }),
  Effect.catchTag("ExtractionTimeoutError", (error) =>
    Effect.gen(function*() {
      yield* Effect.logWarning("Extraction timed out", {
        jobId: error.jobId,
        timeoutMs: error.timeoutMs,
        partialProgress: error.partialProgress
      })

      yield* updateJobStatus(error.jobId, (job) => ({
        ...job,
        status: "failed",
        error: `Timed out after ${error.timeoutMs / 1000}s`,
        errorType: "timeout"  // Specific classification
      }))

      return yield* Effect.fail(error)
    })
  )
)
```

**Effort:** 20 minutes

---

### 4.5 Add HttpRouter.catchAllCause for Global Error Handling

**Location:** `Runtime/HttpServer.ts`

**Current Pattern:**
```typescript
export const HttpServerLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const shutdownMiddleware = yield* makeShutdownMiddleware
    return ExtractionRouter.pipe(
      shutdownMiddleware,
      HttpServer.serve(),
      HttpServer.withLogAddress
    )
  })
)
```

**Problem:**
Unhandled errors in routes become generic 500s with no structure. @effect/platform provides `HttpRouter.catchAllCause` specifically for this.

**Recommended Fix:**
```typescript
import { HttpRouter } from "@effect/platform"

export const HttpServerLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const shutdownMiddleware = yield* makeShutdownMiddleware

    return ExtractionRouter.pipe(
      // Add global error handler
      HttpRouter.catchAllCause((cause) =>
        Effect.gen(function*() {
          const requestId = yield* Effect.sync(() => crypto.randomUUID())

          // Log full cause server-side
          yield* Effect.logError("Unhandled error in HTTP handler", {
            requestId,
            cause: Cause.pretty(cause)
          })

          // Return appropriate response
          if (Cause.isDie(cause)) {
            return HttpServerResponse.json({
              error: "Internal server error",
              requestId,
              type: "defect"
            }, { status: 500 })
          }

          if (Cause.isInterrupted(cause)) {
            return HttpServerResponse.json({
              error: "Request was cancelled",
              requestId,
              type: "interrupted"
            }, { status: 503 })
          }

          // Expected error - could extract message
          return HttpServerResponse.json({
            error: "Request failed",
            requestId,
            type: "error"
          }, { status: 500 })
        })
      ),
      shutdownMiddleware,
      HttpServer.serve(),
      HttpServer.withLogAddress
    )
  })
)
```

**Effort:** 15 minutes

---

### 4.6 Document Error Handling Patterns

**Location:** New file `docs/architecture/error-handling.md`

Create a reference document for the team on Effect error handling patterns specific to our codebase.

**Effort:** 30 minutes

---

## 5. Implementation Order

### Phase 1: Critical Fixes (1 hour)

| Order | Task | File | Effort |
|-------|------|------|--------|
| 1 | Fix SIGTERM handler | `server.ts` | 15 min |
| 2 | Replace Cause.squash with Cause.match | `JobManager.ts` | 25 min |
| 3 | Add HttpRouter.catchAllCause | `HttpServer.ts` | 15 min |

### Phase 2: Quick Wins (1.5 hours)

| Order | Task | File | Effort |
|-------|------|------|--------|
| 4 | Exit-based HTTP responses | `HttpServer.ts` | 20 min |
| 5 | Sandbox LLM retry | `Extraction.ts` | 15 min |
| 6 | Cause-aware timeout | `JobManager.ts` | 20 min |
| 7 | Stream chunk Exit handling | `StreamingExtraction.ts` | 25 min |

### Phase 3: Documentation (30 min)

| Order | Task | File | Effort |
|-------|------|------|--------|
| 8 | Error handling patterns doc | `docs/architecture/error-handling.md` | 30 min |

---

## Summary

### Effect APIs to Add to Our Codebase

| API | Purpose | Where to Use |
|-----|---------|--------------|
| `Effect.runPromiseExit` | Never-throwing runner | SIGTERM, any fire-and-forget |
| `Exit.match` | Pattern match result | Final result handling |
| `Cause.match` | Full cause inspection | Error classification |
| `Cause.pretty` | Readable error logs | All error logging |
| `Cause.isDie` | Detect defects | Retry decisions, alerting |
| `Cause.isInterrupted` | Detect interruption | Timeout handling |
| `Cause.failures` | Extract typed errors | Error message building |
| `Effect.sandbox` | Expose full cause | Retry logic, boundaries |
| `HttpRouter.catchAllCause` | Global HTTP errors | HTTP server layer |

### Anti-Patterns to Remove

| Pattern | Problem | Replacement |
|---------|---------|-------------|
| `Effect.runPromise` at boundaries | Throws | `Effect.runPromiseExit` |
| `Cause.squash` | Loses info | `Cause.match` or guards |
| `catchAll` at boundaries | Misses defects | `catchAllCause` |
| Generic `new Error()` | No classification | Tagged errors |

---

**Total Estimated Effort:** ~3 hours for all phases
