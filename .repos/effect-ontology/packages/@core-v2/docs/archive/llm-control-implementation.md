# LLM Control Strategy: Implementation Guide

This document provides concrete Effect TypeScript implementations for the LLM control strategy.

---

## 1. Token Budget Service Implementation

### 1.1 Data Structures

```typescript
/**
 * Service: Token Budget Tracking
 *
 * Tracks per-request token allocation and usage.
 * Enforces hard limits and provides soft warnings.
 *
 * @module Runtime/TokenBudgetService
 */

import { Effect, Ref, Context } from "effect"

export interface TokenAllocation {
  readonly stage: string
  readonly allocatedTokens: number
  readonly usedTokens: number
  readonly allowOverflow: boolean
}

export interface TokenBudgetState {
  readonly requestId: string
  readonly totalBudget: number
  readonly usedTokens: number
  readonly remainingTokens: number
  readonly allocations: Map<string, TokenAllocation>
  readonly createdAt: Date
  readonly lastUpdatedAt: Date
}

export interface TokenUsageRecord {
  readonly stage: string
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
  readonly timestamp: Date
}
```

### 1.2 Service Implementation

```typescript
export class TokenBudgetService extends Effect.Service<TokenBudgetService>()(
  "TokenBudgetService",
  {
    effect: Effect.gen(function*() {
      const config = yield* ConfigService
      const requestId = yield* generateRequestId() // UUID or hash-based

      // Initialize token budget with stage allocations
      const allocations = new Map<string, TokenAllocation>([
        ["entityExtraction", {
          stage: "entityExtraction",
          allocatedTokens: 1440,
          usedTokens: 0,
          allowOverflow: true
        }],
        ["relationExtraction", {
          stage: "relationExtraction",
          allocatedTokens: 1440,
          usedTokens: 0,
          allowOverflow: false
        }],
        ["grounding", {
          stage: "grounding",
          allocatedTokens: 615,
          usedTokens: 0,
          allowOverflow: false
        }],
        ["propertyScoping", {
          stage: "propertyScoping",
          allocatedTokens: 328,
          usedTokens: 0,
          allowOverflow: false
        }],
        ["other", {
          stage: "other",
          allocatedTokens: 273,
          usedTokens: 0,
          allowOverflow: false
        }]
      ])

      const budgetState = yield* Ref.make<TokenBudgetState>({
        requestId,
        totalBudget: config.llm.maxTokens,
        usedTokens: 0,
        remainingTokens: config.llm.maxTokens,
        allocations,
        createdAt: new Date(),
        lastUpdatedAt: new Date()
      })

      yield* Effect.logInfo("Token budget initialized", {
        requestId,
        totalBudget: config.llm.maxTokens,
        stage: "token-budget-service"
      })

      return {
        /**
         * Record token usage from an LLM call
         */
        recordUsage: (usage: TokenUsageRecord) =>
          Effect.gen(function*() {
            const state = yield* Ref.get(budgetState)
            const allocation = state.allocations.get(usage.stage)

            if (!allocation) {
              yield* Effect.logWarning("Unknown stage for token tracking", {
                stage: usage.stage
              })
              return
            }

            const updatedAllocation: TokenAllocation = {
              ...allocation,
              usedTokens: allocation.usedTokens + usage.totalTokens
            }

            const updatedState: TokenBudgetState = {
              ...state,
              usedTokens: state.usedTokens + usage.totalTokens,
              remainingTokens: state.remainingTokens - usage.totalTokens,
              allocations: new Map(state.allocations).set(usage.stage, updatedAllocation),
              lastUpdatedAt: new Date()
            }

            yield* Ref.set(budgetState, updatedState)

            // Emit warning if stage budget exceeded
            const percentUsed = Math.round(
              (updatedAllocation.usedTokens / allocation.allocatedTokens) * 100
            )
            if (percentUsed > 90) {
              yield* Effect.logWarning("Stage token budget near limit", {
                stage: usage.stage,
                usedTokens: updatedAllocation.usedTokens,
                allocatedTokens: allocation.allocatedTokens,
                percentUsed
              })
            }

            yield* Effect.logDebug("Tokens recorded", {
              stage: usage.stage,
              usedThisCall: usage.totalTokens,
              totalUsed: updatedState.usedTokens,
              remaining: updatedState.remainingTokens,
              percentUsed
            })
          }),

        /**
         * Check if stage can afford a call
         */
        canAfford: (stage: string, estimatedTokens: number) =>
          Effect.gen(function*() {
            const state = yield* Ref.get(budgetState)
            const allocation = state.allocations.get(stage)

            if (!allocation) {
              return true // Unknown stage, allow
            }

            const stageRemaining = allocation.allocatedTokens - allocation.usedTokens

            // Option 1: Sufficient in stage allocation
            if (stageRemaining >= estimatedTokens) {
              return true
            }

            // Option 2: Can overflow from request budget (if enabled)
            if (allocation.allowOverflow && state.remainingTokens >= estimatedTokens) {
              yield* Effect.logInfo("Borrowing from request budget", {
                stage,
                estimatedTokens,
                stageRemaining,
                requestRemaining: state.remainingTokens
              })
              return true
            }

            yield* Effect.logWarning("Insufficient token budget", {
              stage,
              estimatedTokens,
              stageRemaining,
              requestRemaining: state.remainingTokens
            })
            return false
          }),

        /**
         * Get current budget state
         */
        getState: () => Ref.get(budgetState),

        /**
         * Get budget usage percentage
         */
        getUsagePercent: () =>
          Effect.gen(function*() {
            const state = yield* Ref.get(budgetState)
            return Math.round((state.usedTokens / state.totalBudget) * 100)
          }),

        /**
         * Remaining tokens for request
         */
        getRemainingTokens: () =>
          Effect.gen(function*() {
            const state = yield* Ref.get(budgetState)
            return state.remainingTokens
          })
      }
    }),
    dependencies: [ConfigService.Default]
  }
) {}
```

---

## 2. Stage Timeout Service Implementation

### 2.1 Timeout Configuration

```typescript
/**
 * Service: Stage Timeout Coordination
 *
 * Applies per-stage timeouts with escalation levels.
 * Handles both hard and soft timeout limits.
 *
 * @module Runtime/StageTimeoutService
 */

import { Duration, Effect, Clock, Ref } from "effect"

export enum TimeoutEscalation {
  WARN_CONTINUE = "warn_continue",
  REDUCE_SCOPE_RETRY = "reduce_scope_retry",
  FALLBACK_CACHE = "fallback_cache",
  SKIP_STAGE = "skip_stage",
  ABORT_PIPELINE = "abort_pipeline"
}

export interface StageTimeoutConfig {
  readonly stageName: string
  readonly softTimeoutMs: number
  readonly hardTimeoutMs: number
  readonly escalation: TimeoutEscalation
  readonly allowPartialResults: boolean
  readonly maxRetries: number
}

export const DEFAULT_STAGE_TIMEOUTS: Record<string, StageTimeoutConfig> = {
  chunking: {
    stageName: "chunking",
    softTimeoutMs: 3_000,
    hardTimeoutMs: 5_000,
    escalation: TimeoutEscalation.SKIP_STAGE,
    allowPartialResults: false,
    maxRetries: 0
  },
  entityExtraction: {
    stageName: "entityExtraction",
    softTimeoutMs: 45_000,
    hardTimeoutMs: 60_000,
    escalation: TimeoutEscalation.REDUCE_SCOPE_RETRY,
    allowPartialResults: true,
    maxRetries: 3
  },
  propertyScoping: {
    stageName: "propertyScoping",
    softTimeoutMs: 10_000,
    hardTimeoutMs: 15_000,
    escalation: TimeoutEscalation.SKIP_STAGE,
    allowPartialResults: true,
    maxRetries: 1
  },
  relationExtraction: {
    stageName: "relationExtraction",
    softTimeoutMs: 45_000,
    hardTimeoutMs: 60_000,
    escalation: TimeoutEscalation.REDUCE_SCOPE_RETRY,
    allowPartialResults: true,
    maxRetries: 2
  },
  grounding: {
    stageName: "grounding",
    softTimeoutMs: 20_000,
    hardTimeoutMs: 30_000,
    escalation: TimeoutEscalation.FALLBACK_CACHE,
    allowPartialResults: true,
    maxRetries: 1
  },
  serialization: {
    stageName: "serialization",
    softTimeoutMs: 5_000,
    hardTimeoutMs: 10_000,
    escalation: TimeoutEscalation.ABORT_PIPELINE,
    allowPartialResults: false,
    maxRetries: 0
  }
}

export interface TimeoutMetrics {
  readonly stageName: string
  readonly softTimeoutCount: number
  readonly hardTimeoutCount: number
  readonly escalationCount: number
  readonly lastTimeoutAt?: Date
}

export interface TimeoutEventLog {
  readonly eventType: "soft" | "hard" | "escalation"
  readonly stage: string
  readonly elapsedMs: number
  readonly limitMs: number
  readonly action: string
  readonly timestamp: Date
}
```

### 2.2 Service Implementation

```typescript
export class StageTimeoutService extends Effect.Service<StageTimeoutService>()(
  "StageTimeoutService",
  {
    effect: Effect.gen(function*() {
      const metricsRef = yield* Ref.make<Map<string, TimeoutMetrics>>(
        new Map(
          Object.keys(DEFAULT_STAGE_TIMEOUTS).map((stage) => [
            stage,
            {
              stageName: stage,
              softTimeoutCount: 0,
              hardTimeoutCount: 0,
              escalationCount: 0
            }
          ])
        )
      )

      const eventLogRef = yield* Ref.make<TimeoutEventLog[]>([])

      return {
        /**
         * Execute effect with stage timeout wrapper
         *
         * Applies soft and hard timeouts with escalation behavior.
         */
        withTimeout: <A, E, R>(
          stage: string,
          effect: Effect.Effect<A, E, R>,
          config?: Partial<StageTimeoutConfig>
        ): Effect.Effect<A, E, R> => {
          const timeoutConfig = { ...DEFAULT_STAGE_TIMEOUTS[stage], ...config }

          return Effect.gen(function*() {
            const startTime = yield* Clock.currentTimeMillis
            const startNano = yield* Clock.currentTimeNanos

            yield* Effect.logInfo("Stage started with timeout", {
              stage,
              softTimeoutMs: timeoutConfig.softTimeoutMs,
              hardTimeoutMs: timeoutConfig.hardTimeoutMs
            })

            // Wrap effect with hard timeout (absolute limit)
            const timedEffect = effect.pipe(
              Effect.timeout(Duration.millis(timeoutConfig.hardTimeoutMs))
            )

            const resultEffect = Effect.gen(function*() {
              let softTimeoutTriggered = false
              let hardTimeoutTriggered = false

              // Monitor soft timeout in background
              const softTimeoutMonitor = Effect.gen(function*() {
                yield* Effect.sleep(Duration.millis(timeoutConfig.softTimeoutMs))
                softTimeoutTriggered = true
                yield* Effect.logWarning("Stage soft timeout exceeded", {
                  stage,
                  softTimeoutMs: timeoutConfig.softTimeoutMs,
                  escalation: timeoutConfig.escalation,
                  action: "continuing"
                })

                // Update metrics
                yield* Ref.modify(metricsRef, (metrics) => {
                  const current = metrics.get(stage) ?? {
                    stageName: stage,
                    softTimeoutCount: 0,
                    hardTimeoutCount: 0,
                    escalationCount: 0
                  }
                  return [
                    undefined,
                    metrics.set(stage, {
                      ...current,
                      softTimeoutCount: current.softTimeoutCount + 1,
                      lastTimeoutAt: new Date()
                    })
                  ]
                })

                // Log event
                yield* Ref.modify(eventLogRef, (log) => [
                  undefined,
                  [
                    ...log,
                    {
                      eventType: "soft" as const,
                      stage,
                      elapsedMs: timeoutConfig.softTimeoutMs,
                      limitMs: timeoutConfig.softTimeoutMs,
                      action: timeoutConfig.escalation,
                      timestamp: new Date()
                    }
                  ]
                ])
              }).pipe(Effect.fork)

              const result = yield* timedEffect.pipe(
                Effect.tapError((error) => {
                  if (error._tag === "TimeoutException") {
                    hardTimeoutTriggered = true
                    return Effect.gen(function*() {
                      yield* Effect.logError("Stage hard timeout exceeded", {
                        stage,
                        hardTimeoutMs: timeoutConfig.hardTimeoutMs,
                        elapsedMs: timeoutConfig.hardTimeoutMs,
                        escalation: timeoutConfig.escalation
                      })

                      // Update metrics
                      yield* Ref.modify(metricsRef, (metrics) => {
                        const current = metrics.get(stage) ?? {
                          stageName: stage,
                          softTimeoutCount: 0,
                          hardTimeoutCount: 0,
                          escalationCount: 0
                        }
                        return [
                          undefined,
                          metrics.set(stage, {
                            ...current,
                            hardTimeoutCount: current.hardTimeoutCount + 1,
                            escalationCount: current.escalationCount + 1,
                            lastTimeoutAt: new Date()
                          })
                        ]
                      })

                      // Log event
                      yield* Ref.modify(eventLogRef, (log) => [
                        undefined,
                        [
                          ...log,
                          {
                            eventType: "hard" as const,
                            stage,
                            elapsedMs: timeoutConfig.hardTimeoutMs,
                            limitMs: timeoutConfig.hardTimeoutMs,
                            action: timeoutConfig.escalation,
                            timestamp: new Date()
                          }
                        ]
                      ])
                    })
                  }
                  return Effect.void
                })
              )

              // Wait for soft timeout monitor to complete
              yield* Effect.getOrThrowFiber(
                yield* yield* softTimeoutMonitor
              ).pipe(Effect.catch((e) => Effect.logDebug("Soft timeout monitor interrupted", { error: String(e) })))

              const endTime = yield* Clock.currentTimeMillis
              const elapsedMs = Number(endTime - startTime)

              yield* Effect.logInfo("Stage completed", {
                stage,
                elapsedMs,
                softTimeoutTriggered,
                hardTimeoutTriggered
              })

              return result
            })

            return yield* resultEffect
          })
        },

        /**
         * Get timeout metrics for a stage
         */
        getMetrics: (stage: string) =>
          Effect.gen(function*() {
            const metrics = yield* Ref.get(metricsRef)
            return metrics.get(stage) ?? {
              stageName: stage,
              softTimeoutCount: 0,
              hardTimeoutCount: 0,
              escalationCount: 0
            }
          }),

        /**
         * Get all timeout events
         */
        getEventLog: () => Ref.get(eventLogRef),

        /**
         * Get timeout configuration for stage
         */
        getConfig: (stage: string) => {
          return DEFAULT_STAGE_TIMEOUTS[stage] ?? null
        }
      }
    }),
    dependencies: []
  }
) {}
```

---

## 3. Central Rate Limiter Implementation

### 3.1 Rate Limiter State Machine

```typescript
/**
 * Service: Central Rate Limiter
 *
 * Implements token bucket algorithm for request and token rate limiting.
 * Includes circuit breaker for API resilience.
 *
 * @module Runtime/CentralRateLimiter
 */

import { Duration, Effect, Ref, Clock, Queue } from "effect"

export interface TokenBucket {
  readonly maxTokens: number
  readonly currentTokens: number
  readonly windowMs: number
  readonly lastRefillMs: number
  readonly refillsCount: number
}

export enum CircuitState {
  CLOSED = "closed",      // Normal operation
  OPEN = "open",          // Failing, reject requests
  HALF_OPEN = "half-open" // Testing recovery
}

export interface CircuitBreakerState {
  readonly state: CircuitState
  readonly failureCount: number
  readonly successCount: number
  readonly lastFailureAt?: Date
  readonly lastSuccessAt?: Date
  readonly nextRetryAt?: Date
}

export interface RateLimiterConfig {
  readonly requestsPerMinute: number
  readonly tokensPerMinute: number
  readonly maxConcurrent: number
  readonly circuitBreakerMaxFailures: number
  readonly circuitBreakerResetMs: number
}

export const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  requestsPerMinute: 50,      // Anthropic limit
  tokensPerMinute: 100_000,   // Anthropic limit
  maxConcurrent: 5,
  circuitBreakerMaxFailures: 5,
  circuitBreakerResetMs: 120_000 // 2 minutes
}
```

### 3.2 Rate Limiter Service

```typescript
export class CentralRateLimiterService extends Effect.Service<CentralRateLimiterService>()(
  "CentralRateLimiterService",
  {
    effect: Effect.gen(function*() {
      const config = yield* ConfigService
      const rateLimitConfig = DEFAULT_RATE_LIMITER_CONFIG

      // Initialize token buckets
      const requestBucketRef = yield* Ref.make<TokenBucket>({
        maxTokens: rateLimitConfig.requestsPerMinute,
        currentTokens: rateLimitConfig.requestsPerMinute,
        windowMs: 60_000,
        lastRefillMs: Date.now(),
        refillsCount: 0
      })

      const tokenBucketRef = yield* Ref.make<TokenBucket>({
        maxTokens: rateLimitConfig.tokensPerMinute,
        currentTokens: rateLimitConfig.tokensPerMinute,
        windowMs: 60_000,
        lastRefillMs: Date.now(),
        refillsCount: 0
      })

      // Circuit breaker state
      const circuitBreakerRef = yield* Ref.make<CircuitBreakerState>({
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0
      })

      // Concurrency control
      const concurrencyRef = yield* Ref.make(0)
      const maxConcurrent = rateLimitConfig.maxConcurrent

      // Helper: Refill bucket if window has passed
      const refillBucketIfNeeded = (
        bucketRef: Ref.Ref<TokenBucket>,
        now: number
      ): Effect.Effect<void> =>
        Effect.gen(function*() {
          yield* Ref.modify(bucketRef, (bucket) => {
            const elapsed = now - bucket.lastRefillMs
            const windowsPassed = Math.floor(elapsed / bucket.windowMs)

            if (windowsPassed > 0) {
              return [
                undefined,
                {
                  ...bucket,
                  currentTokens: bucket.maxTokens,
                  lastRefillMs: now,
                  refillsCount: bucket.refillsCount + windowsPassed
                }
              ]
            }

            return [undefined, bucket]
          })
        })

      // Helper: Check if circuit should transition
      const updateCircuitBreaker = (): Effect.Effect<void> =>
        Effect.gen(function*() {
          yield* Ref.modify(circuitBreakerRef, (state) => {
            // If in half-open, test if we should close
            if (state.state === CircuitState.HALF_OPEN) {
              if (state.successCount >= 2) {
                return [
                  undefined,
                  {
                    ...state,
                    state: CircuitState.CLOSED,
                    failureCount: 0,
                    successCount: 0
                  }
                ]
              }
              if (state.failureCount >= 1) {
                return [
                  undefined,
                  {
                    ...state,
                    state: CircuitState.OPEN,
                    failureCount: 0,
                    successCount: 0,
                    nextRetryAt: new Date(Date.now() + rateLimitConfig.circuitBreakerResetMs)
                  }
                ]
              }
            }

            // If open and reset timeout passed, transition to half-open
            if (
              state.state === CircuitState.OPEN &&
              state.nextRetryAt &&
              Date.now() >= state.nextRetryAt.getTime()
            ) {
              return [
                undefined,
                {
                  ...state,
                  state: CircuitState.HALF_OPEN,
                  failureCount: 0,
                  successCount: 0,
                  nextRetryAt: undefined
                }
              ]
            }

            return [undefined, state]
          })
        })

      return {
        /**
         * Acquire permit to execute LLM call
         */
        acquire: (estimatedTokens: number) =>
          Effect.gen(function*() {
            const now = Date.now()

            // 1. Check circuit breaker
            yield* updateCircuitBreaker()
            const circuitState = yield* Ref.get(circuitBreakerRef)

            if (circuitState.state === CircuitState.OPEN) {
              yield* Effect.logWarning("Rate limiter: circuit breaker open", {
                nextRetryMs: circuitState.nextRetryAt
                  ? circuitState.nextRetryAt.getTime() - now
                  : "unknown"
              })
              return yield* Effect.fail(
                new Error("Circuit breaker open - LLM API unavailable")
              )
            }

            // 2. Check concurrency limit (hard limit)
            const concurrency = yield* Ref.get(concurrencyRef)
            if (concurrency >= maxConcurrent) {
              yield* Effect.logWarning("Rate limiter: concurrency limit reached", {
                current: concurrency,
                max: maxConcurrent
              })
              // Wait briefly and retry
              yield* Effect.sleep(Duration.millis(100))
              return yield* this.acquire(estimatedTokens) // Recursive retry
            }

            // 3. Refill buckets if needed
            yield* refillBucketIfNeeded(requestBucketRef, now)
            yield* refillBucketIfNeeded(tokenBucketRef, now)

            // 4. Check request bucket (1 permit per request)
            const requestBucket = yield* Ref.get(requestBucketRef)
            if (requestBucket.currentTokens < 1) {
              yield* Effect.logWarning("Rate limiter: request bucket exhausted", {
                nextRefillMs: requestBucket.lastRefillMs + requestBucket.windowMs - now
              })
              return yield* Effect.fail(
                new Error("Request rate limit exceeded")
              )
            }

            // 5. Check token bucket (estimate)
            const tokenBucket = yield* Ref.get(tokenBucketRef)
            if (tokenBucket.currentTokens < estimatedTokens) {
              yield* Effect.logWarning("Rate limiter: token bucket insufficient", {
                estimated: estimatedTokens,
                available: tokenBucket.currentTokens,
                nextRefillMs: tokenBucket.lastRefillMs + tokenBucket.windowMs - now
              })
              return yield* Effect.fail(
                new Error("Token rate limit exceeded")
              )
            }

            // 6. Grant permits
            yield* Ref.modify(requestBucketRef, (bucket) => [
              undefined,
              { ...bucket, currentTokens: bucket.currentTokens - 1 }
            ])

            yield* Ref.modify(tokenBucketRef, (bucket) => [
              undefined,
              { ...bucket, currentTokens: bucket.currentTokens - Math.floor(estimatedTokens / 10) } // Conservative estimate
            ])

            yield* Ref.modify(concurrencyRef, (c) => [undefined, c + 1])

            yield* Effect.logDebug("Rate limiter: permit acquired", {
              estimatedTokens,
              concurrency: concurrency + 1,
              requestsRemaining: requestBucket.currentTokens - 1,
              tokensRemaining: tokenBucket.currentTokens
            })
          }),

        /**
         * Release permit and record actual token usage
         */
        release: (actualTokensUsed: number, success: boolean) =>
          Effect.gen(function*() {
            yield* Ref.modify(concurrencyRef, (c) => [undefined, Math.max(0, c - 1)])

            // Adjust token bucket based on actual usage
            yield* Ref.modify(tokenBucketRef, (bucket) => {
              const adjustment = Math.ceil(actualTokensUsed / 10)
              return [
                undefined,
                {
                  ...bucket,
                  currentTokens: Math.min(
                    bucket.maxTokens,
                    bucket.currentTokens + adjustment // Return unused estimate
                  )
                }
              ]
            })

            // Update circuit breaker
            yield* Ref.modify(circuitBreakerRef, (state) => {
              if (success) {
                return [
                  undefined,
                  {
                    ...state,
                    successCount: state.successCount + 1,
                    lastSuccessAt: new Date()
                  }
                ]
              } else {
                return [
                  undefined,
                  {
                    ...state,
                    failureCount: state.failureCount + 1,
                    lastFailureAt: new Date(),
                    state:
                      state.failureCount + 1 >= rateLimitConfig.circuitBreakerMaxFailures
                        ? CircuitState.OPEN
                        : state.state,
                    nextRetryAt:
                      state.failureCount + 1 >= rateLimitConfig.circuitBreakerMaxFailures
                        ? new Date(Date.now() + rateLimitConfig.circuitBreakerResetMs)
                        : state.nextRetryAt
                  }
                ]
              }
            })

            yield* Effect.logDebug("Rate limiter: permit released", {
              actualTokensUsed,
              success
            })
          }),

        /**
         * Get rate limiter metrics
         */
        getMetrics: () =>
          Effect.gen(function*() {
            const requestBucket = yield* Ref.get(requestBucketRef)
            const tokenBucket = yield* Ref.get(tokenBucketRef)
            const circuitBreaker = yield* Ref.get(circuitBreakerRef)
            const concurrency = yield* Ref.get(concurrencyRef)

            return {
              requestBucket,
              tokenBucket,
              circuitBreaker,
              concurrency,
              maxConcurrent
            }
          })
      }
    }),
    dependencies: [ConfigService.Default]
  }
) {}
```

---

## 4. Request Supervisor Service

### 4.1 Partial Result Model

```typescript
/**
 * Service: Request Supervisor
 *
 * Coordinates all stages, manages partial results, and handles cancellation.
 *
 * @module Runtime/RequestSupervisor
 */

import { Effect, Ref, Fiber } from "effect"

export enum ResultCompleteness {
  COMPLETE = "complete",
  PARTIAL_ENTITY_ONLY = "partial_entity_only",
  PARTIAL_EARLY_EXIT = "partial_early_exit",
  FALLBACK_CACHE = "fallback_cache",
  EMPTY = "empty"
}

export interface FailedStage {
  readonly stage: string
  readonly reason: string
  readonly error?: Error
  readonly failedAt: Date
}

export interface ExtractionMetadata {
  readonly requestId: string
  readonly completeness: ResultCompleteness
  readonly failedStages: ReadonlyArray<FailedStage>
  readonly tokenUsage: {
    readonly allocated: number
    readonly used: number
    readonly remaining: number
  }
  readonly executionTimeMs: number
  readonly startedAt: Date
  readonly completedAt: Date
  readonly warnings: ReadonlyArray<string>
}

export interface PartialExtractionResult<E> {
  readonly data: E
  readonly metadata: ExtractionMetadata
}
```

### 4.2 Request Supervisor Implementation

```typescript
export class RequestSupervisorService extends Effect.Service<RequestSupervisorService>()(
  "RequestSupervisor",
  {
    effect: Effect.gen(function*() {
      const tokenBudget = yield* TokenBudgetService
      const stageTimeout = yield* StageTimeoutService
      const rateLimiter = yield* CentralRateLimiterService

      // Track active requests
      const requestsRef = yield* Ref.make<
        Map<
          string,
          {
            fiber: Fiber.Fiber<any>
            startedAt: Date
            failedStages: FailedStage[]
            warnings: string[]
          }
        >
      >(new Map())

      return {
        /**
         * Execute extraction with supervision
         *
         * Coordinates rate limiting, timeouts, and partial result handling.
         */
        executeExtraction: <A, E, R>(
          requestId: string,
          extraction: Effect.Effect<A, E, R>
        ): Effect.Effect<PartialExtractionResult<A>, E, R> => {
          return Effect.gen(function*() {
            const startedAt = new Date()
            const startTimeMs = Date.now()

            // Initialize request tracking
            const failedStages: FailedStage[] = []
            const warnings: string[] = []

            yield* Effect.logInfo("Extraction request started", {
              requestId,
              timestamp: startedAt.toISOString()
            })

            // Get initial state
            const initialBudget = yield* tokenBudget.getState()
            const metrics = yield* rateLimiter.getMetrics()

            yield* Effect.logInfo("Request supervisor initialized", {
              requestId,
              tokenBudget: initialBudget.totalBudget,
              concurrency: metrics.concurrency,
              circuitBreakerState: metrics.circuitBreaker.state
            })

            // Execute with timeout envelope
            const result = yield* extraction.pipe(
              Effect.tapError((error) => {
                failedStages.push({
                  stage: "extraction",
                  reason: String(error),
                  error: error instanceof Error ? error : undefined,
                  failedAt: new Date()
                })
                return Effect.void
              }),
              Effect.timeout(Duration.minutes(10)) // Global timeout
            )

            const completedAt = new Date()
            const executionTimeMs = Date.now() - startTimeMs

            // Get final budget state
            const finalBudget = yield* tokenBudget.getState()

            // Determine completeness
            let completeness = ResultCompleteness.COMPLETE
            if (failedStages.length > 0) {
              if (failedStages.length >= 3) {
                completeness = ResultCompleteness.EMPTY
              } else {
                completeness = ResultCompleteness.PARTIAL_EARLY_EXIT
              }
            }

            const metadata: ExtractionMetadata = {
              requestId,
              completeness,
              failedStages,
              tokenUsage: {
                allocated: initialBudget.totalBudget,
                used: finalBudget.usedTokens,
                remaining: finalBudget.remainingTokens
              },
              executionTimeMs,
              startedAt,
              completedAt,
              warnings
            }

            yield* Effect.logInfo("Extraction request completed", {
              requestId,
              completeness,
              executionTimeMs,
              tokenUsed: finalBudget.usedTokens,
              failedStages: failedStages.length
            })

            return { data: result, metadata }
          })
        }
      }
    }),
    dependencies: [
      TokenBudgetService.Default,
      StageTimeoutService.Default,
      CentralRateLimiterService.Default
    ]
  }
) {}
```

---

## 5. Integration with Existing Services

### 5.1 Wrapped LLM Call Pattern

```typescript
/**
 * Pattern: Wrap LLM calls with all controls
 */
export const makeRateLimitedAndTimedLlmCall = <A>(
  stage: string,
  estimatedTokens: number,
  llmCall: Effect.Effect<
    { data: A; promptTokens: number; completionTokens: number },
    Error
  >
): Effect.Effect<A> =>
  Effect.gen(function*() {
    const tokenBudget = yield* TokenBudgetService
    const stageTimeout = yield* StageTimeoutService
    const rateLimiter = yield* CentralRateLimiterService

    // Step 1: Check token budget before acquiring rate limit
    const canAfford = yield* tokenBudget.canAfford(stage, estimatedTokens)
    if (!canAfford) {
      yield* Effect.logError("Insufficient token budget", { stage, estimatedTokens })
      return yield* Effect.fail(
        new Error(`Token budget exhausted for stage ${stage}`)
      )
    }

    // Step 2: Acquire rate limit permit
    yield* rateLimiter.acquire(estimatedTokens)

    // Step 3: Execute LLM call with stage timeout
    const result = yield* stageTimeout
      .withTimeout(stage, llmCall)
      .pipe(
        Effect.tapBoth({
          onSuccess: (result) =>
            Effect.gen(function*() {
              // Record actual token usage
              yield* tokenBudget.recordUsage({
                stage,
                promptTokens: result.promptTokens,
                completionTokens: result.completionTokens,
                totalTokens: result.promptTokens + result.completionTokens,
                timestamp: new Date()
              })

              // Release permit with success
              yield* rateLimiter.release(
                result.promptTokens + result.completionTokens,
                true
              )
            }),
          onFailure: (error) =>
            Effect.gen(function*() {
              // Release permit with failure (updates circuit breaker)
              yield* rateLimiter.release(estimatedTokens, false)

              yield* Effect.logError("LLM call failed", {
                stage,
                error: String(error)
              })
            })
        })
      )

    return result.data
  })
```

### 5.2 Entity Extractor Integration

```typescript
/**
 * Example: Update EntityExtractor to use new controls
 */
// In EntityExtractor.extract method:
const result = yield* makeRateLimitedAndTimedLlmCall(
  "entityExtraction",
  1440, // Token budget for this call
  Effect.gen(function*() {
    const llm = yield* LanguageModel.LanguageModel
    const response = yield* llm.generateObject({
      schema: makeEntitySchema(candidates),
      prompt: generateEntityPrompt(text, candidates)
    })

    return {
      data: parseEntityResponse(response),
      promptTokens: response.usage?.promptTokens ?? 0,
      completionTokens: response.usage?.completionTokens ?? 0
    }
  })
)
```

---

## 6. Configuration Example

```typescript
/**
 * Configuration in ConfigService
 */
export interface Config {
  // ... existing config ...

  // New LLM control config
  readonly llmControl: {
    readonly stageTimeouts: Record<string, StageTimeoutConfig>
    readonly tokenBudget: {
      readonly requestMaxTokens: number
      readonly allocations: Record<string, number>
    }
    readonly rateLimiting: {
      readonly maxConcurrent: number
      readonly requestsPerMinute: number
      readonly tokensPerMinute: number
      readonly circuitBreakerMaxFailures: number
    }
  }
}

export const DEFAULT_CONFIG: Config = {
  // ... existing config ...

  llmControl: {
    stageTimeouts: DEFAULT_STAGE_TIMEOUTS,

    tokenBudget: {
      requestMaxTokens: 4096,
      allocations: {
        entityExtraction: 1440,
        relationExtraction: 1440,
        grounding: 615,
        propertyScoping: 328,
        other: 273
      }
    },

    rateLimiting: {
      maxConcurrent: 5,
      requestsPerMinute: 50,
      tokensPerMinute: 100_000,
      circuitBreakerMaxFailures: 5
    }
  }
}
```

---

## 7. Testing Patterns

### 7.1 Unit Test: Token Budget

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

describe("TokenBudgetService", () => {
  it.effect("records token usage and updates remaining", () =>
    Effect.gen(function*() {
      const service = yield* TokenBudgetService

      // Record 500 tokens
      yield* service.recordUsage({
        stage: "entityExtraction",
        promptTokens: 300,
        completionTokens: 200,
        totalTokens: 500,
        timestamp: new Date()
      })

      const remaining = yield* service.getRemainingTokens()
      expect(remaining).toBe(4096 - 500)
    }).pipe(
      Effect.provide(TokenBudgetService.Default)
    )
  )

  it.effect("prevents call when budget insufficient", () =>
    Effect.gen(function*() {
      const service = yield* TokenBudgetService

      // Use most of budget
      yield* service.recordUsage({
        stage: "entityExtraction",
        promptTokens: 3000,
        completionTokens: 1000,
        totalTokens: 4000,
        timestamp: new Date()
      })

      const canAfford = yield* service.canAfford("relationExtraction", 200)
      expect(canAfford).toBe(false)
    }).pipe(
      Effect.provide(TokenBudgetService.Default)
    )
  )
})
```

### 7.2 Integration Test: Rate Limiter

```typescript
describe("CentralRateLimiterService", () => {
  it.effect("enforces request rate limit", () =>
    Effect.gen(function*() {
      const service = yield* CentralRateLimiterService

      // Acquire 50 permits (at limit)
      for (let i = 0; i < 50; i++) {
        yield* service.acquire(100)
      }

      // Next should fail
      const result = yield* service.acquire(100).pipe(
        Effect.either
      )

      expect(result._tag).toBe("Left")
    }).pipe(
      Effect.provide(CentralRateLimiterService.Default)
    )
  )

  it.effect("transitions circuit breaker on failures", () =>
    Effect.gen(function*() {
      const service = yield* CentralRateLimiterService

      // Simulate 5 failures (should open circuit)
      for (let i = 0; i < 5; i++) {
        yield* service.release(100, false)
      }

      const metrics = yield* service.getMetrics()
      expect(metrics.circuitBreaker.state).toBe(CircuitState.OPEN)
    }).pipe(
      Effect.provide(CentralRateLimiterService.Default)
    )
  )
})
```

---

## 8. Migration Checklist

- [ ] Add `TokenBudgetService` to `src/Runtime/TokenBudgetService.ts`
- [ ] Add `StageTimeoutService` to `src/Runtime/StageTimeoutService.ts`
- [ ] Add `CentralRateLimiterService` to `src/Runtime/CentralRateLimiterService.ts`
- [ ] Add `RequestSupervisorService` to `src/Runtime/RequestSupervisorService.ts`
- [ ] Update `ConfigService` with `llmControl` config
- [ ] Update `ProductionRuntime.ts` to include new services
- [ ] Wrap `EntityExtractor.extract` with rate limiting + timeout
- [ ] Wrap `RelationExtractor.extract` with rate limiting + timeout
- [ ] Wrap `Grounder.verifyRelationBatch` with rate limiting + timeout
- [ ] Add tests for each service
- [ ] Add integration tests for full pipeline
- [ ] Add observability (metrics, traces)
- [ ] Update documentation

---

## References

- Effect Timeout docs: https://effect.website/docs/guides/error-handling/timeout
- Token Bucket Algorithm: https://en.wikipedia.org/wiki/Token_bucket
- Circuit Breaker Pattern: https://martinfowler.com/bliki/CircuitBreaker.html
- Local Effect source: `docs/effect-source/effect/src/`

