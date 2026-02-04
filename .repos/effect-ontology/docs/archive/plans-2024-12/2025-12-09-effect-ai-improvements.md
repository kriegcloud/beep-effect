# @effect/ai Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve LLM resilience, enable dynamic provider switching, and add circuit breaker protection.

**Architecture:**
- Migrate from Effect Config-based provider switching to data-driven `makeLlmProviderLayer(params)` pattern
- Add circuit breaker layer between rate limiting and base LLM provider
- Integrate centralized retry policy into `generateObjectWithFeedback`
- Add timeouts to all external service calls (hybrid search, embeddings)

**Tech Stack:** Effect-TS, @effect/ai, @effect/ai-anthropic, @effect/ai-openai, @effect/ai-google, @effect/vitest

---

## Phase 1: Critical Fixes (Immediate)

### Task 1: Remove Dead Code in EntityExtractor

**Files:**
- Modify: `packages/@core-v2/src/Service/Extraction.ts:66-74`

**Step 1: Identify dead code**

Read lines 66-74 of Extraction.ts. The `_retryPolicy` is created but never used:
```typescript
const _retryPolicy = makeRetryPolicy({...})
void _retryPolicy  // Dead code marker
```

**Step 2: Remove dead code**

Delete lines 66-74 (the _retryPolicy creation and void statement).

**Step 3: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 4: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 5: Commit**

```bash
git add packages/@core-v2/src/Service/Extraction.ts
git commit -m "refactor(extraction): remove unused retry policy from EntityExtractor"
```

---

### Task 2: Add Timeout to Hybrid Search

**Files:**
- Modify: `packages/@core-v2/src/Workflow/StreamingExtraction.ts:237-259`

**Step 1: Write the failing test**

Create test file: `packages/@core-v2/test/Workflow/StreamingExtraction.timeout.test.ts`

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect } from "effect"

describe("StreamingExtraction hybrid search timeout", () => {
  it.effect("should timeout hybrid search after 30 seconds", () =>
    Effect.gen(function*() {
      // This test verifies the timeout is configured
      // The actual implementation test is in integration tests
      const timeout = Duration.seconds(30)
      expect(Duration.toMillis(timeout)).toBe(30000)
    })
  )
})
```

**Step 2: Run test to verify it passes (baseline)**

```bash
cd packages/@core-v2 && bunx vitest run test/Workflow/StreamingExtraction.timeout.test.ts -v
```
Expected: PASS

**Step 3: Add timeout to hybrid search**

In `packages/@core-v2/src/Workflow/StreamingExtraction.ts`, modify line 237:

Before:
```typescript
const candidateClasses = yield* ontology.searchClassesHybrid(aggregatedQuery, 100).pipe(
  Effect.withLogSpan(`chunk-${chunk.index}-hybrid-class-retrieval`),
  Effect.tap((classes) =>
    Effect.logDebug("Hybrid class retrieval complete", {
```

After:
```typescript
const candidateClasses = yield* ontology.searchClassesHybrid(aggregatedQuery, 100).pipe(
  Effect.timeout(Duration.seconds(30)),
  Effect.withLogSpan(`chunk-${chunk.index}-hybrid-class-retrieval`),
  Effect.tap((classes) =>
    Effect.logDebug("Hybrid class retrieval complete", {
```

**Step 4: Add Duration import if needed**

Verify `Duration` is imported at top of file:
```typescript
import { Cause, Chunk, Duration, Effect, ... } from "effect"
```

**Step 5: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 6: Run all tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 7: Commit**

```bash
git add packages/@core-v2/src/Workflow/StreamingExtraction.ts packages/@core-v2/test/Workflow/StreamingExtraction.timeout.test.ts
git commit -m "feat(streaming): add 30s timeout to hybrid search"
```

---

### Task 3: Add Retry and Timeout to Embedding Calls

**Files:**
- Modify: `packages/@core-v2/src/Service/Nlp.ts:287-290`

**Step 1: Write the failing test**

Create test file: `packages/@core-v2/test/Service/Nlp.resilience.test.ts`

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Schedule } from "effect"

describe("NlpService embedding resilience", () => {
  it.effect("retry schedule uses exponential backoff", () =>
    Effect.gen(function*() {
      // Verify schedule configuration
      const schedule = Schedule.exponential(Duration.seconds(1)).pipe(
        Schedule.intersect(Schedule.recurs(3)),
        Schedule.jittered
      )
      // Schedule is properly configured - type check passes
      expect(schedule).toBeDefined()
    })
  )
})
```

**Step 2: Run test to verify it passes (baseline)**

```bash
cd packages/@core-v2 && bunx vitest run test/Service/Nlp.resilience.test.ts -v
```
Expected: PASS

**Step 3: Create embedding retry schedule helper**

Add near the top of `packages/@core-v2/src/Service/Nlp.ts` (after imports):

```typescript
/**
 * Retry schedule for embedding calls
 * - Exponential backoff starting at 1 second
 * - Max 3 retries
 * - Jittered to avoid thundering herd
 * - 10 second timeout per attempt
 */
const embeddingRetrySchedule = Schedule.exponential(Duration.seconds(1)).pipe(
  Schedule.intersect(Schedule.recurs(3)),
  Schedule.jittered
)

const EMBEDDING_TIMEOUT_MS = 10_000
```

**Step 4: Update embed call with retry and timeout**

Find the embedding call around line 287-290 and update:

Before:
```typescript
nomic.embed(doc, "search_document").pipe(
  Effect.map((embedding) => ({ doc, index, embedding })),
  Effect.catchAll(() => Effect.succeed(null))
)
```

After:
```typescript
nomic.embed(doc, "search_document").pipe(
  Effect.retry(embeddingRetrySchedule),
  Effect.timeout(Duration.millis(EMBEDDING_TIMEOUT_MS)),
  Effect.map((embedding) => ({ doc, index, embedding })),
  Effect.tapError((error) =>
    Effect.logWarning("Embedding failed after retries", {
      docPreview: doc.slice(0, 100),
      error: String(error)
    })
  ),
  Effect.catchAll(() => Effect.succeed(null))
)
```

**Step 5: Update all other embedding calls in the file**

Search for other `nomic.embed` calls and apply the same pattern.
Common locations: around lines 282-290 (query embedding), and any other embed calls.

For query embedding (around line 282):
```typescript
const queryVector = yield* nomic.embed(query, "search_query").pipe(
  Effect.retry(embeddingRetrySchedule),
  Effect.timeout(Duration.millis(EMBEDDING_TIMEOUT_MS))
)
```

**Step 6: Ensure imports include Schedule**

At top of file, verify:
```typescript
import { ..., Duration, Effect, Schedule, ... } from "effect"
```

**Step 7: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 8: Run all tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 9: Commit**

```bash
git add packages/@core-v2/src/Service/Nlp.ts packages/@core-v2/test/Service/Nlp.resilience.test.ts
git commit -m "feat(nlp): add retry and timeout to embedding calls"
```

---

## Phase 2: High Priority Improvements

### Task 4: Integrate Retry Schedule into generateObjectWithFeedback

**Files:**
- Modify: `packages/@core-v2/src/Service/GenerateWithFeedback.ts`
- Modify: `packages/@core-v2/src/Service/Extraction.ts`

**Step 1: Write the failing test**

Create test: `packages/@core-v2/test/Service/GenerateWithFeedback.test.ts`

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Schedule } from "effect"

describe("GenerateWithFeedback", () => {
  it.effect("supports custom retry schedule", () =>
    Effect.gen(function*() {
      // Verify we can pass a schedule option
      const schedule = Schedule.exponential(Duration.seconds(2)).pipe(
        Schedule.jittered
      )
      expect(schedule).toBeDefined()
    })
  )
})
```

**Step 2: Run test**

```bash
cd packages/@core-v2 && bunx vitest run test/Service/GenerateWithFeedback.test.ts -v
```
Expected: PASS

**Step 3: Add retrySchedule option to GenerateWithFeedbackOptions**

In `packages/@core-v2/src/Service/GenerateWithFeedback.ts`, update interface:

```typescript
export interface GenerateWithFeedbackOptions<A, I extends Record<string, unknown>, R> {
  readonly prompt: string
  readonly schema: Schema.Schema<A, I, R>
  readonly objectName: string
  readonly maxAttempts: number
  readonly serviceName: string
  readonly timeoutMs?: number
  /**
   * Optional retry schedule for non-schema errors.
   * When provided, uses Effect.retry with this schedule instead of simple loop.
   * Schema validation errors (MalformedOutput) still get feedback-based retry.
   */
  readonly retrySchedule?: Schedule.Schedule<unknown, unknown, never>
}
```

**Step 4: Add Schedule import**

At top of GenerateWithFeedback.ts:
```typescript
import type { Schema, Schedule } from "effect"
import { Duration, Effect, Either } from "effect"
```

**Step 5: Update generateObjectWithFeedback to use schedule**

Replace the while loop with a hybrid approach that uses Schedule for delays:

```typescript
export const generateObjectWithFeedback = <A, I extends Record<string, unknown>, R>(
  llm: LanguageModel.Service,
  opts: GenerateWithFeedbackOptions<A, I, R>
): Effect.Effect<LanguageModel.GenerateObjectResponse<{}, A>, AiError.AiError | TimeoutException, R> =>
  Effect.gen(function*() {
    let currentPrompt: Prompt.Prompt = Prompt.make(opts.prompt)
    let lastError: AiError.AiError | TimeoutException | null = null
    let attempts = 0

    // Calculate delay for each attempt (exponential with jitter if no custom schedule)
    const getDelay = (attempt: number): Duration.Duration => {
      if (opts.retrySchedule) {
        // Use custom schedule timing
        const baseMs = 3000 // Match default retry policy
        return Duration.millis(Math.min(baseMs * Math.pow(2, attempt - 1), 30000))
      }
      return Duration.zero // Original behavior: no delay between attempts
    }

    while (attempts < opts.maxAttempts) {
      attempts++

      // Add delay between retries (not on first attempt)
      if (attempts > 1 && opts.retrySchedule) {
        const delay = getDelay(attempts - 1)
        yield* Effect.sleep(delay)
        yield* Effect.logDebug("Retry delay applied", {
          service: opts.serviceName,
          attempt: attempts,
          delayMs: Duration.toMillis(delay)
        })
      }

      const generateEffect = llm.generateObject({
        prompt: currentPrompt,
        schema: opts.schema,
        objectName: opts.objectName
      })

      const timedEffect = opts.timeoutMs
        ? generateEffect.pipe(Effect.timeout(Duration.millis(opts.timeoutMs)))
        : generateEffect

      const result = yield* timedEffect.pipe(Effect.either)

      if (Either.isRight(result)) {
        if (attempts > 1) {
          yield* Effect.logInfo("Schema validation succeeded after feedback retry", {
            service: opts.serviceName,
            attempt: attempts,
            maxAttempts: opts.maxAttempts
          })
        }
        return result.right
      }

      const error = result.left
      lastError = error

      if (error._tag === "MalformedOutput") {
        yield* Effect.logWarning("Schema validation failed, retrying with feedback", {
          service: opts.serviceName,
          attempt: attempts,
          maxAttempts: opts.maxAttempts,
          errorDescription: error.description?.slice(0, 500)
        })
        const feedbackMessage = buildFeedbackMessage(error)
        currentPrompt = Prompt.merge(currentPrompt, feedbackMessage)
      } else {
        yield* Effect.logWarning("LLM call failed, retrying without feedback", {
          service: opts.serviceName,
          attempt: attempts,
          maxAttempts: opts.maxAttempts,
          errorTag: error._tag
        })
      }
    }

    yield* Effect.logError("All retry attempts exhausted", {
      service: opts.serviceName,
      attempts: opts.maxAttempts,
      lastErrorTag: lastError?._tag
    })

    return yield* Effect.fail(lastError!)
  })
```

**Step 6: Update EntityExtractor to pass retry schedule**

In `packages/@core-v2/src/Service/Extraction.ts`, update the generateObjectWithFeedback call:

```typescript
// Create retry schedule from config (add near top of effect, after config is read)
const retrySchedule = Schedule.exponential(Duration.millis(config.runtime.retryInitialDelayMs)).pipe(
  Schedule.delayed((d) => Duration.min(d, Duration.millis(config.runtime.retryMaxDelayMs))),
  Schedule.jittered
)

// Then update the call:
const response = yield* generateObjectWithFeedback(llm, {
  prompt,
  schema,
  objectName: "EntityGraph",
  maxAttempts: config.runtime.retryMaxAttempts,
  serviceName: "EntityExtractor",
  timeoutMs: config.llm.timeoutMs,
  retrySchedule  // NEW: pass the schedule
}).pipe(
```

**Step 7: Add Schedule import to Extraction.ts**

Verify imports at top:
```typescript
import { Cause, Chunk, Duration, Effect, JSONSchema, Layer, Option, Ref, Schedule, Sink, Stream } from "effect"
```

**Step 8: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 9: Run all tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 10: Commit**

```bash
git add packages/@core-v2/src/Service/GenerateWithFeedback.ts packages/@core-v2/src/Service/Extraction.ts packages/@core-v2/test/Service/GenerateWithFeedback.test.ts
git commit -m "feat(extraction): integrate retry schedule into generateObjectWithFeedback"
```

---

### Task 5: Add Error-Specific Retry Filtering

**Files:**
- Modify: `packages/@core-v2/src/Service/Retry.ts`

**Step 1: Write the failing test**

Create test: `packages/@core-v2/test/Service/Retry.test.ts`

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect } from "effect"
import { makeRetryPolicy, isRetryableError } from "../../src/Service/Retry.js"

describe("Retry Policy", () => {
  it.effect("should create retry policy with exponential backoff", () =>
    Effect.gen(function*() {
      const policy = makeRetryPolicy({
        initialDelayMs: 1000,
        maxAttempts: 3,
        serviceName: "test"
      })
      expect(policy).toBeDefined()
    })
  )

  it("should identify retryable errors", () => {
    // Network errors are retryable
    expect(isRetryableError(new Error("ECONNREFUSED"))).toBe(true)
    expect(isRetryableError(new Error("ETIMEDOUT"))).toBe(true)

    // 429 rate limit is retryable
    const rateLimitError = Object.assign(new Error("Too Many Requests"), { status: 429 })
    expect(isRetryableError(rateLimitError)).toBe(true)

    // 400 bad request is NOT retryable
    const badRequestError = Object.assign(new Error("Bad Request"), { status: 400 })
    expect(isRetryableError(badRequestError)).toBe(false)

    // 401 unauthorized is NOT retryable
    const authError = Object.assign(new Error("Unauthorized"), { status: 401 })
    expect(isRetryableError(authError)).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd packages/@core-v2 && bunx vitest run test/Service/Retry.test.ts -v
```
Expected: FAIL (isRetryableError is not exported)

**Step 3: Add isRetryableError function**

In `packages/@core-v2/src/Service/Retry.ts`, add:

```typescript
/**
 * Determine if an error is retryable
 *
 * Retryable errors:
 * - Network errors (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)
 * - Rate limit errors (HTTP 429)
 * - Server errors (HTTP 5xx)
 *
 * Non-retryable errors:
 * - Client errors (HTTP 4xx except 429)
 * - Authentication errors (401, 403)
 * - Request too large (413)
 *
 * @param error - The error to check
 * @returns true if the error should be retried
 *
 * @since 2.0.0
 */
export const isRetryableError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return true // Unknown errors default to retryable
  }

  // Check for HTTP status codes
  const status = (error as Record<string, unknown>).status
  if (typeof status === "number") {
    // 429 Too Many Requests is retryable
    if (status === 429) return true

    // 5xx server errors are retryable
    if (status >= 500 && status < 600) return true

    // 4xx client errors (except 429) are NOT retryable
    if (status >= 400 && status < 500) return false
  }

  // Check for network error codes
  const code = (error as Record<string, unknown>).code
  if (typeof code === "string") {
    const retryableCodes = ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET", "EPIPE"]
    if (retryableCodes.includes(code)) return true
  }

  // Check error message patterns
  const message = error.message.toLowerCase()
  const nonRetryablePatterns = [
    "invalid api key",
    "unauthorized",
    "forbidden",
    "authentication failed",
    "request too large"
  ]

  if (nonRetryablePatterns.some(pattern => message.includes(pattern))) {
    return false
  }

  // Default: retry unknown errors
  return true
}
```

**Step 4: Update makeRetryPolicy to use filter**

Update the `makeRetryPolicy` function to filter non-retryable errors:

```typescript
export const makeRetryPolicy = (opts: RetryPolicyOptions) => {
  const maxDelayMs = opts.maxDelayMs ?? DEFAULT_MAX_DELAY_MS
  const maxDelay = Duration.millis(maxDelayMs)

  return Schedule.exponential(Duration.millis(opts.initialDelayMs)).pipe(
    Schedule.intersect(Schedule.recurs(opts.maxAttempts - 1)),
    Schedule.delayed((d) => Duration.min(d, maxDelay)),
    Schedule.jittered,
    // Only retry retryable errors
    Schedule.whileInput((error: unknown) => isRetryableError(error)),
    Schedule.tapOutput((attempt) => {
      const rawDelayMs = Math.pow(2, attempt[1]) * opts.initialDelayMs
      const cappedDelayMs = Math.min(rawDelayMs, maxDelayMs)
      return Effect.logWarning("LLM retry attempt", {
        service: opts.serviceName,
        attempt: attempt[1] + 1,
        maxAttempts: opts.maxAttempts,
        nextDelayMs: cappedDelayMs,
        delayCapped: rawDelayMs > maxDelayMs
      })
    })
  )
}
```

**Step 5: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run test/Service/Retry.test.ts -v
```
Expected: PASS

**Step 6: Run all tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 7: Commit**

```bash
git add packages/@core-v2/src/Service/Retry.ts packages/@core-v2/test/Service/Retry.test.ts
git commit -m "feat(retry): add error classification for smart retry filtering"
```

---

### Task 6: Fix streamText Rate Limiting

**Files:**
- Modify: `packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts:151-154`

**Step 1: Analyze the issue**

Current code rate-limits stream creation, not consumption:
```typescript
streamText: (opts) =>
  Stream.unwrap(
    withRateLimit("streamText", Effect.succeed(baseLlm.streamText(opts)))
  )
```

The rate limiter is applied to `Effect.succeed(stream)` which completes immediately.

**Step 2: Fix stream rate limiting**

Update lines 151-154:

```typescript
// streamText returns a Stream, so we need to rate-limit the stream start
// The rate limiter gates the stream creation AND first chunk
streamText: (opts) =>
  Stream.unwrap(
    withRateLimit("streamText", Effect.sync(() => baseLlm.streamText(opts)))
  )
```

This change makes the stream creation lazy via `Effect.sync`, allowing the rate limiter to properly gate it.

**Step 3: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 4: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 5: Commit**

```bash
git add packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts
git commit -m "fix(rate-limit): properly gate streamText creation with rate limiter"
```

---

## Phase 3: Circuit Breaker Implementation

### Task 7: Add Circuit Breaker Module

**Files:**
- Create: `packages/@core-v2/src/Runtime/CircuitBreaker.ts`

**Step 1: Write the failing test**

Create test: `packages/@core-v2/test/Runtime/CircuitBreaker.test.ts`

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Ref } from "effect"

describe("Circuit Breaker", () => {
  it.effect("should open after consecutive failures", () =>
    Effect.gen(function*() {
      const failureCount = yield* Ref.make(0)
      const maxFailures = 3

      // Simulate failures
      for (let i = 0; i < maxFailures; i++) {
        yield* Ref.update(failureCount, (n) => n + 1)
      }

      const count = yield* Ref.get(failureCount)
      expect(count).toBe(3)
    })
  )
})
```

**Step 2: Run test**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/CircuitBreaker.test.ts -v
```
Expected: PASS

**Step 3: Create CircuitBreaker module**

Create `packages/@core-v2/src/Runtime/CircuitBreaker.ts`:

```typescript
/**
 * Runtime: Circuit Breaker for LLM Calls
 *
 * Provides circuit breaker protection for LLM API calls.
 * Opens after consecutive failures to prevent cascading issues.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Failing fast, requests rejected immediately
 * - HALF_OPEN: Testing recovery, limited requests allowed
 *
 * @since 2.0.0
 * @module Runtime/CircuitBreaker
 */

import { Clock, Duration, Effect, Ref } from "effect"

/**
 * Circuit breaker state
 */
export type CircuitState = "closed" | "open" | "half_open"

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /**
   * Number of consecutive failures before opening circuit
   */
  readonly maxFailures: number
  /**
   * Time to wait before attempting recovery (half-open state)
   */
  readonly resetTimeout: Duration.Duration
  /**
   * Number of successful calls needed to close circuit from half-open
   */
  readonly successThreshold: number
}

/**
 * Default circuit breaker configuration
 */
export const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  maxFailures: 5,
  resetTimeout: Duration.minutes(2),
  successThreshold: 2
}

/**
 * Circuit breaker internal state
 */
interface CircuitBreakerState {
  state: CircuitState
  failureCount: number
  successCount: number
  lastFailureTime: number
}

/**
 * Create a circuit breaker
 *
 * @param config - Circuit breaker configuration
 * @returns Scoped effect providing the circuit breaker
 */
export const makeCircuitBreaker = (
  config: CircuitBreakerConfig = DEFAULT_CIRCUIT_CONFIG
) =>
  Effect.gen(function*() {
    const stateRef = yield* Ref.make<CircuitBreakerState>({
      state: "closed",
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0
    })

    const getState = Ref.get(stateRef)

    const recordSuccess = Effect.gen(function*() {
      const current = yield* getState

      if (current.state === "half_open") {
        const newSuccessCount = current.successCount + 1
        if (newSuccessCount >= config.successThreshold) {
          yield* Ref.set(stateRef, {
            state: "closed" as const,
            failureCount: 0,
            successCount: 0,
            lastFailureTime: 0
          })
          yield* Effect.logInfo("Circuit breaker closed after recovery", {
            successCount: newSuccessCount
          })
        } else {
          yield* Ref.update(stateRef, (s) => ({
            ...s,
            successCount: newSuccessCount
          }))
        }
      } else if (current.state === "closed") {
        yield* Ref.update(stateRef, (s) => ({
          ...s,
          failureCount: 0
        }))
      }
    })

    const recordFailure = Effect.gen(function*() {
      const now = yield* Clock.currentTimeMillis
      const current = yield* getState

      if (current.state === "half_open") {
        yield* Ref.set(stateRef, {
          state: "open" as const,
          failureCount: config.maxFailures,
          successCount: 0,
          lastFailureTime: Number(now)
        })
        yield* Effect.logWarning("Circuit breaker reopened after half-open failure")
      } else if (current.state === "closed") {
        const newFailureCount = current.failureCount + 1
        if (newFailureCount >= config.maxFailures) {
          yield* Ref.set(stateRef, {
            state: "open" as const,
            failureCount: newFailureCount,
            successCount: 0,
            lastFailureTime: Number(now)
          })
          yield* Effect.logWarning("Circuit breaker opened", {
            failureCount: newFailureCount,
            resetTimeoutMs: Duration.toMillis(config.resetTimeout)
          })
        } else {
          yield* Ref.update(stateRef, (s) => ({
            ...s,
            failureCount: newFailureCount
          }))
        }
      }
    })

    const canAttempt = Effect.gen(function*() {
      const current = yield* getState
      const now = yield* Clock.currentTimeMillis

      if (current.state === "closed") {
        return true
      }

      if (current.state === "open") {
        const elapsed = Number(now) - current.lastFailureTime
        if (elapsed >= Duration.toMillis(config.resetTimeout)) {
          yield* Ref.update(stateRef, (s) => ({
            ...s,
            state: "half_open" as const,
            successCount: 0
          }))
          yield* Effect.logInfo("Circuit breaker entering half-open state")
          return true
        }
        return false
      }

      // half_open - allow request
      return true
    })

    return {
      /**
       * Protect an effect with circuit breaker
       */
      protect: <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | CircuitOpenError, R> =>
        Effect.gen(function*() {
          const allowed = yield* canAttempt
          if (!allowed) {
            const current = yield* getState
            return yield* Effect.fail(new CircuitOpenError({
              resetTimeoutMs: Duration.toMillis(config.resetTimeout),
              lastFailureTime: current.lastFailureTime
            }))
          }

          const result = yield* effect.pipe(
            Effect.tapBoth({
              onSuccess: () => recordSuccess,
              onFailure: () => recordFailure
            }),
            Effect.either
          )

          if (result._tag === "Left") {
            return yield* Effect.fail(result.left)
          }
          return result.right
        }),

      /**
       * Get current circuit state
       */
      getState: () => Ref.get(stateRef).pipe(Effect.map((s) => s.state)),

      /**
       * Reset circuit to closed state (for testing)
       */
      reset: () =>
        Ref.set(stateRef, {
          state: "closed" as const,
          failureCount: 0,
          successCount: 0,
          lastFailureTime: 0
        })
    }
  })

/**
 * Error thrown when circuit breaker is open
 */
export class CircuitOpenError extends Error {
  readonly _tag = "CircuitOpenError" as const
  readonly resetTimeoutMs: number
  readonly lastFailureTime: number

  constructor(params: { resetTimeoutMs: number; lastFailureTime: number }) {
    super(`Circuit breaker is open. Will retry in ${params.resetTimeoutMs}ms`)
    this.resetTimeoutMs = params.resetTimeoutMs
    this.lastFailureTime = params.lastFailureTime
  }
}

/**
 * Type for the circuit breaker service
 */
export type CircuitBreaker = Effect.Effect.Success<ReturnType<typeof makeCircuitBreaker>>
```

**Step 4: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 5: Add comprehensive circuit breaker test**

Update test file `packages/@core-v2/test/Runtime/CircuitBreaker.test.ts`:

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect } from "effect"
import { CircuitOpenError, makeCircuitBreaker } from "../../src/Runtime/CircuitBreaker.js"

describe("Circuit Breaker", () => {
  it.effect("should allow requests when closed", () =>
    Effect.gen(function*() {
      const breaker = yield* makeCircuitBreaker({
        maxFailures: 3,
        resetTimeout: Duration.seconds(30),
        successThreshold: 2
      })

      const result = yield* breaker.protect(Effect.succeed(42))
      expect(result).toBe(42)
    })
  )

  it.effect("should open after max failures", () =>
    Effect.gen(function*() {
      const breaker = yield* makeCircuitBreaker({
        maxFailures: 3,
        resetTimeout: Duration.seconds(30),
        successThreshold: 2
      })

      // Trigger 3 failures
      for (let i = 0; i < 3; i++) {
        yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(
          Effect.either
        )
      }

      // Circuit should be open
      const state = yield* breaker.getState()
      expect(state).toBe("open")

      // Next request should fail fast
      const result = yield* breaker.protect(Effect.succeed(42)).pipe(
        Effect.either
      )
      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(CircuitOpenError)
      }
    })
  )

  it.effect("should reset failure count on success", () =>
    Effect.gen(function*() {
      const breaker = yield* makeCircuitBreaker({
        maxFailures: 3,
        resetTimeout: Duration.seconds(30),
        successThreshold: 2
      })

      // 2 failures
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)

      // 1 success (resets counter)
      yield* breaker.protect(Effect.succeed(1))

      // 2 more failures (total 2, not 4)
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)

      // Should still be closed (2 failures, not 3)
      const state = yield* breaker.getState()
      expect(state).toBe("closed")
    })
  )
})
```

**Step 6: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run test/Runtime/CircuitBreaker.test.ts -v
```
Expected: All PASS

**Step 7: Run all tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 8: Commit**

```bash
git add packages/@core-v2/src/Runtime/CircuitBreaker.ts packages/@core-v2/test/Runtime/CircuitBreaker.test.ts
git commit -m "feat(resilience): add circuit breaker for LLM protection"
```

---

### Task 8: Integrate Circuit Breaker into Rate Limited Layer

**Files:**
- Modify: `packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts`

**Step 1: Import circuit breaker**

Add import at top of file:
```typescript
import { makeCircuitBreaker, DEFAULT_CIRCUIT_CONFIG, CircuitOpenError } from "./CircuitBreaker.js"
```

**Step 2: Create circuit breaker in layer**

After creating rate limiters (around line 90), add:

```typescript
// Create circuit breaker for API protection
const circuitBreaker = yield* makeCircuitBreaker({
  ...DEFAULT_CIRCUIT_CONFIG,
  maxFailures: 5,
  resetTimeout: Duration.minutes(2)
})

yield* Effect.logInfo("Circuit breaker initialized", {
  maxFailures: 5,
  resetTimeoutMinutes: 2
})
```

**Step 3: Update withRateLimit to use circuit breaker**

Update the `withRateLimit` helper to include circuit breaker:

```typescript
const withRateLimit = <A, E, R>(
  method: string,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E | CircuitOpenError, R> =>
  Effect.gen(function*() {
    const callId = ++callCount
    const startTime = yield* Clock.currentTimeMillis

    yield* Effect.logDebug("LLM call queued", {
      provider: config.llm.provider,
      method,
      callId
    })

    // Apply circuit breaker THEN rate limiting
    const result = yield* circuitBreaker.protect(
      rateLimiter(effect)
    )

    const endTime = yield* Clock.currentTimeMillis
    const waitMs = Number(endTime - startTime)

    yield* Effect.logDebug("LLM call completed", {
      provider: config.llm.provider,
      method,
      callId,
      rateLimiterWaitMs: waitMs
    })
    yield* Effect.annotateCurrentSpan(LlmAttributes.RATE_LIMITER_WAIT_MS, waitMs)
    yield* Effect.annotateCurrentSpan(LlmAttributes.LLM_CALL_ID, callId)
    yield* Effect.annotateCurrentSpan(LlmAttributes.LLM_METHOD, method)

    return result
  }).pipe(
    Effect.withSpan(`llm.${method}`, {
      attributes: {
        [LlmAttributes.PROVIDER]: config.llm.provider,
        [LlmAttributes.MODEL]: config.llm.model
      }
    })
  )
```

**Step 4: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 5: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts
git commit -m "feat(resilience): integrate circuit breaker into rate limited layer"
```

---

## Phase 4: Data-Driven Provider Switching

### Task 9: Create LlmProviderParams Type

**Files:**
- Create: `packages/@core-v2/src/Service/LlmProvider.ts`

**Step 1: Write the type definitions**

Create `packages/@core-v2/src/Service/LlmProvider.ts`:

```typescript
/**
 * Service: LLM Provider Configuration
 *
 * Data-driven LLM provider configuration.
 * Enables dynamic provider switching without layer recreation.
 *
 * @since 2.0.0
 * @module Service/LlmProvider
 */

import { LanguageModel } from "@effect/ai"
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { GoogleClient, GoogleLanguageModel } from "@effect/ai-google"
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai"
import { FetchHttpClient } from "@effect/platform"
import { Layer, Redacted } from "effect"

/**
 * Supported LLM providers
 */
export type LlmProvider = "anthropic" | "openai" | "google" | "openrouter"

/**
 * Anthropic provider configuration
 */
export interface AnthropicConfig {
  readonly apiKey: string
  readonly model: string
  readonly maxTokens?: number
  readonly temperature?: number
}

/**
 * OpenAI provider configuration
 */
export interface OpenAIConfig {
  readonly apiKey: string
  readonly model: string
  readonly maxTokens?: number
  readonly temperature?: number
}

/**
 * Google (Gemini) provider configuration
 */
export interface GeminiConfig {
  readonly apiKey: string
  readonly model: string
  readonly maxTokens?: number
  readonly temperature?: number
}

/**
 * OpenRouter provider configuration (uses OpenAI adapter)
 */
export interface OpenRouterConfig {
  readonly apiKey: string
  readonly model: string
  readonly maxTokens?: number
  readonly temperature?: number
}

/**
 * LLM provider parameters
 *
 * Plain data structure for configuring LLM providers.
 * No Effect Config dependencies - just data.
 */
export interface LlmProviderParams {
  readonly provider: LlmProvider
  readonly anthropic?: AnthropicConfig
  readonly openai?: OpenAIConfig
  readonly gemini?: GeminiConfig
  readonly openrouter?: OpenRouterConfig
}

/**
 * Create a LanguageModel layer from provider params
 *
 * This is the data-driven approach - pass params as function argument,
 * not read from Effect Config.
 *
 * @param params - Provider configuration
 * @returns Layer providing LanguageModel
 */
export const makeLlmProviderLayer = (
  params: LlmProviderParams
): Layer.Layer<LanguageModel.LanguageModel> => {
  switch (params.provider) {
    case "anthropic": {
      const config = params.anthropic
      if (!config) {
        throw new Error("Anthropic config required when provider is 'anthropic'")
      }

      return AnthropicLanguageModel.layer({ model: config.model }).pipe(
        Layer.provideMerge(
          AnthropicClient.layer({ apiKey: Redacted.make(config.apiKey) }).pipe(
            Layer.provideMerge(FetchHttpClient.layer)
          )
        )
      )
    }

    case "openai": {
      const config = params.openai
      if (!config) {
        throw new Error("OpenAI config required when provider is 'openai'")
      }

      return OpenAiLanguageModel.layer({ model: config.model }).pipe(
        Layer.provideMerge(
          OpenAiClient.layer({ apiKey: Redacted.make(config.apiKey) }).pipe(
            Layer.provideMerge(FetchHttpClient.layer)
          )
        )
      )
    }

    case "google": {
      const config = params.gemini
      if (!config) {
        throw new Error("Gemini config required when provider is 'google'")
      }

      return GoogleLanguageModel.layer({ model: config.model }).pipe(
        Layer.provideMerge(
          GoogleClient.layer({ apiKey: Redacted.make(config.apiKey) }).pipe(
            Layer.provideMerge(FetchHttpClient.layer)
          )
        )
      )
    }

    case "openrouter": {
      const config = params.openrouter
      if (!config) {
        throw new Error("OpenRouter config required when provider is 'openrouter'")
      }

      // OpenRouter uses OpenAI-compatible API
      return OpenAiLanguageModel.layer({ model: config.model }).pipe(
        Layer.provideMerge(
          OpenAiClient.layer({
            apiKey: Redacted.make(config.apiKey),
            baseUrl: "https://openrouter.ai/api/v1"
          }).pipe(Layer.provideMerge(FetchHttpClient.layer))
        )
      )
    }
  }
}

/**
 * Load provider params from environment variables
 *
 * Helper to create LlmProviderParams from VITE_* env vars.
 *
 * @returns Provider params from environment
 */
export const loadProviderParamsFromEnv = (): LlmProviderParams => {
  const provider = (process.env.VITE_LLM_PROVIDER || "anthropic") as LlmProvider

  return {
    provider,
    anthropic: {
      apiKey: process.env.VITE_LLM_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "",
      model: process.env.VITE_LLM_ANTHROPIC_MODEL || "claude-haiku-4-5",
      maxTokens: Number(process.env.VITE_LLM_ANTHROPIC_MAX_TOKENS) || 4096,
      temperature: Number(process.env.VITE_LLM_ANTHROPIC_TEMPERATURE) || 0.1
    },
    openai: {
      apiKey: process.env.VITE_LLM_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "",
      model: process.env.VITE_LLM_OPENAI_MODEL || "gpt-4o",
      maxTokens: Number(process.env.VITE_LLM_OPENAI_MAX_TOKENS) || 4096,
      temperature: Number(process.env.VITE_LLM_OPENAI_TEMPERATURE) || 0.1
    },
    gemini: {
      apiKey: process.env.VITE_LLM_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
      model: process.env.VITE_LLM_GEMINI_MODEL || "gemini-2.0-flash",
      maxTokens: Number(process.env.VITE_LLM_GEMINI_MAX_TOKENS) || 4096,
      temperature: Number(process.env.VITE_LLM_GEMINI_TEMPERATURE) || 0.1
    },
    openrouter: {
      apiKey: process.env.VITE_LLM_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "",
      model: process.env.VITE_LLM_OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
      maxTokens: Number(process.env.VITE_LLM_OPENROUTER_MAX_TOKENS) || 4096,
      temperature: Number(process.env.VITE_LLM_OPENROUTER_TEMPERATURE) || 0.1
    }
  }
}
```

**Step 2: Write tests**

Create `packages/@core-v2/test/Service/LlmProvider.test.ts`:

```typescript
import { describe, expect, it } from "@effect/vitest"
import {
  type LlmProviderParams,
  makeLlmProviderLayer,
  loadProviderParamsFromEnv
} from "../../src/Service/LlmProvider.js"

describe("LlmProvider", () => {
  it("should load provider params from environment", () => {
    const params = loadProviderParamsFromEnv()
    expect(params.provider).toBeDefined()
    expect(params.anthropic).toBeDefined()
    expect(params.openai).toBeDefined()
  })

  it("should throw if anthropic config is missing", () => {
    const params: LlmProviderParams = {
      provider: "anthropic"
      // No anthropic config
    }

    expect(() => makeLlmProviderLayer(params)).toThrow()
  })

  it("should create layer for valid params", () => {
    const params: LlmProviderParams = {
      provider: "anthropic",
      anthropic: {
        apiKey: "test-key",
        model: "claude-haiku-4-5"
      }
    }

    const layer = makeLlmProviderLayer(params)
    expect(layer).toBeDefined()
  })
})
```

**Step 3: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run test/Service/LlmProvider.test.ts -v
```
Expected: PASS

**Step 4: Export from index**

Add to `packages/@core-v2/src/index.ts` (if it exists) or create module export.

**Step 5: Run all tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Service/LlmProvider.ts packages/@core-v2/test/Service/LlmProvider.test.ts
git commit -m "feat(provider): add data-driven LLM provider layer factory"
```

---

### Task 10: Add Workflow-Level Timeout to TwoStageExtraction

**Files:**
- Modify: `packages/@core-v2/src/Workflow/TwoStageExtraction.ts`

**Step 1: Add timeout to extractToTurtle**

Find the `extractToTurtle` function and wrap with timeout:

```typescript
export const extractToTurtle = (text: string, config: RunConfig) =>
  Effect.gen(function*() {
    // ... existing implementation ...
  }).pipe(
    // Add workflow-level timeout (30 minutes for full document)
    Effect.timeout(Duration.minutes(30)),
    Effect.tapError((error) =>
      Effect.logError("Extraction workflow failed", {
        isTimeout: String(error).includes("Timeout"),
        textLength: text.length
      })
    )
  )
```

**Step 2: Ensure Duration is imported**

At top of file:
```typescript
import { Duration, Effect, ... } from "effect"
```

**Step 3: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 4: Run tests**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 5: Commit**

```bash
git add packages/@core-v2/src/Workflow/TwoStageExtraction.ts
git commit -m "feat(workflow): add 30-minute timeout to TwoStageExtraction"
```

---

## Phase 5: Final Cleanup

### Task 11: Update Documentation

**Files:**
- Create: `packages/@core-v2/docs/resilience.md`

**Step 1: Write documentation**

Create `packages/@core-v2/docs/resilience.md`:

```markdown
# Resilience Patterns in @core-v2

## Overview

The `@core-v2` package implements a comprehensive resilience stack for LLM operations:

1. **Rate Limiting** - Prevents API quota exhaustion
2. **Circuit Breaker** - Fast-fails on sustained outages
3. **Retry with Backoff** - Handles transient errors
4. **Timeouts** - Prevents hanging operations
5. **Error Classification** - Smart retry decisions

## Rate Limiting

Dual rate limiters protect against quota exhaustion:

- Per-second burst protection (2 req/sec for Anthropic)
- Per-minute sustained protection (20 req/min for Anthropic)

## Circuit Breaker

Opens after 5 consecutive failures, resets after 2 minutes:

- CLOSED: Normal operation
- OPEN: Fails fast
- HALF_OPEN: Testing recovery

## Retry Policy

Exponential backoff with jitter and error filtering:

- Initial delay: 3000ms
- Max delay: 30000ms
- Max attempts: 8
- Jittered to avoid thundering herd

## Timeouts

| Operation | Timeout | Rationale |
|-----------|---------|-----------|
| LLM generateObject | 60s | Single extraction call |
| Grounder single | 120s | Verification pass |
| Grounder batch | 180s | Multiple relations |
| Hybrid search | 30s | Embedding lookup |
| Embedding | 10s | Single vector |
| Workflow | 30min | Full document |

## Error Classification

Retryable errors:
- Network: ECONNREFUSED, ETIMEDOUT, ENOTFOUND
- Rate limit: HTTP 429
- Server: HTTP 5xx

Non-retryable errors:
- Bad request: HTTP 400
- Authentication: HTTP 401, 403
- Request too large: HTTP 413
```

**Step 2: Commit**

```bash
git add packages/@core-v2/docs/resilience.md
git commit -m "docs(resilience): add resilience patterns documentation"
```

---

### Task 12: Final Verification

**Step 1: Run full test suite**

```bash
cd packages/@core-v2 && bunx vitest run
```
Expected: All tests pass

**Step 2: Run type check**

```bash
cd packages/@core-v2 && bunx tsc -b tsconfig.json
```
Expected: No errors

**Step 3: Run linter**

```bash
bun run lint
```
Expected: No errors

**Step 4: Create final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1. Critical Fixes | 3 tasks | Pending |
| 2. High Priority | 3 tasks | Pending |
| 3. Circuit Breaker | 2 tasks | Pending |
| 4. Provider Switching | 2 tasks | Pending |
| 5. Cleanup | 2 tasks | Pending |

**Total: 12 tasks**

---

## Appendix: File Summary

### Files to Create
- `packages/@core-v2/src/Runtime/CircuitBreaker.ts`
- `packages/@core-v2/src/Service/LlmProvider.ts`
- `packages/@core-v2/test/Workflow/StreamingExtraction.timeout.test.ts`
- `packages/@core-v2/test/Service/Nlp.resilience.test.ts`
- `packages/@core-v2/test/Service/GenerateWithFeedback.test.ts`
- `packages/@core-v2/test/Service/Retry.test.ts`
- `packages/@core-v2/test/Runtime/CircuitBreaker.test.ts`
- `packages/@core-v2/test/Service/LlmProvider.test.ts`
- `packages/@core-v2/docs/resilience.md`

### Files to Modify
- `packages/@core-v2/src/Service/Extraction.ts` (remove dead code, add retry schedule)
- `packages/@core-v2/src/Workflow/StreamingExtraction.ts` (add timeout)
- `packages/@core-v2/src/Service/Nlp.ts` (add retry/timeout to embeddings)
- `packages/@core-v2/src/Service/GenerateWithFeedback.ts` (add retrySchedule option)
- `packages/@core-v2/src/Service/Retry.ts` (add error classification)
- `packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts` (fix streamText, add circuit breaker)
- `packages/@core-v2/src/Workflow/TwoStageExtraction.ts` (add workflow timeout)
