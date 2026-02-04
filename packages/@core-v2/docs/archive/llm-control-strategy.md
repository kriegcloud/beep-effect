# Comprehensive LLM Control Strategy with Budgeting and Stage Timeouts

## Executive Summary

This document defines a production-grade LLM control strategy for the knowledge graph extraction pipeline. The strategy moves beyond the current coarse-grained controls (single 5-minute timeout, service-level semaphore) to implement:

1. **Per-stage timeout configuration** - Different timeout budgets for preprocessing, entity extraction, relation extraction
2. **Per-request token budget** - Track cumulative token usage across pipeline stages
3. **Central rate limiter** - Respect provider API limits while allowing concurrent requests
4. **Partial result policy** - Define graceful degradation when stages timeout or fail
5. **Cancellation semantics** - Clean resource cleanup and cascade behavior

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│ Extraction Request (text + ontology)                             │
└───────────────────────────────┬──────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Request Supervisor      │
                    │ - Budget allocation     │
                    │ - Stage coordination    │
                    │ - Partial result mgmt   │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
    ┌────────────┐      ┌────────────────┐      ┌──────────────┐
    │ Stage 1:   │      │ Stage 2:       │      │ Stage 3:     │
    │ Chunking   │      │ Entity Extract │      │ Relation     │
    │ (sync)     │      │ (LLM, budgeted)│      │ Extract      │
    │ Timeout: 5s│      │ Timeout: 60s   │      │ (LLM, budget)│
    │ No tokens  │      │ Budget: 25%    │      │ Timeout: 60s │
    │            │      │                │      │ Budget: 25%  │
    └──────┬─────┘      └────────┬───────┘      └──────┬───────┘
           │                     │                     │
           │   ┌─────────────────┴─────────────────┐   │
           │   │ Central Rate Limiter               │   │
           │   │ - Token bucket (100k/min)          │   │
           │   │ - Request bucket (50/min)          │   │
           │   │ - Circuit breaker on API errors    │   │
           │   └──────────────┬──────────────────┬─┘   │
           │                  │                  │      │
           │   ┌──────────────▼───────────────┐  │      │
           │   │ Concurrency Semaphore        │  │      │
           │   │ Max 5 concurrent LLM calls   │  │      │
           │   └──────────────┬───────────────┘  │      │
           │                  │                  │      │
           └────────────┬──────┴────────────────┬┘
                        │                       │
                   ┌────▼────┐            ┌────▼──────┐
                   │ LLM API  │            │ Grounder  │
                   │          │            │ (verify)  │
                   └──────────┘            └───────────┘
```

---

## 1. Stage Timeout Configuration

### 1.1 Stage Definitions and Timeouts

```typescript
/**
 * Extraction pipeline stages with timeout budgets
 */
export interface StageTimeoutConfig {
  // Stage 1: Text preprocessing (synchronous, no LLM)
  readonly chunking: {
    readonly name: "chunking"
    readonly timeoutMs: number      // 5s default
    readonly budgetPercentage: 2    // 2% of request budget
    readonly isLlmStage: false
  }

  // Stage 2: Entity extraction (first LLM call)
  readonly entityExtraction: {
    readonly name: "entityExtraction"
    readonly timeoutMs: number      // 60s default
    readonly budgetPercentage: 35   // 35% of request budget
    readonly isLlmStage: true
    readonly maxRetries: number     // 3 retries on timeout
  }

  // Stage 3: Entity-to-class grounding (no LLM, similarity search)
  readonly propertyScoping: {
    readonly name: "propertyScoping"
    readonly timeoutMs: number      // 15s default
    readonly budgetPercentage: 8    // 8% of request budget
    readonly isLlmStage: false
  }

  // Stage 4: Relation extraction (second LLM call)
  readonly relationExtraction: {
    readonly name: "relationExtraction"
    readonly timeoutMs: number      // 60s default
    readonly budgetPercentage: 35   // 35% of request budget
    readonly isLlmStage: true
    readonly maxRetries: number     // 2 retries on timeout
  }

  // Stage 5: Relation verification/grounding (batched LLM call)
  readonly grounding: {
    readonly name: "grounding"
    readonly timeoutMs: number      // 30s default
    readonly budgetPercentage: 15   // 15% of request budget
    readonly isLlmStage: true
    readonly maxRetries: number     // 1 retry on timeout
  }

  // Stage 6: Graph merge and serialization (synchronous)
  readonly serialization: {
    readonly name: "serialization"
    readonly timeoutMs: number      // 10s default
    readonly budgetPercentage: 5    // 5% of request budget
    readonly isLlmStage: false
  }
}
```

### 1.2 Timeout Escalation Levels

Timeouts should trigger specific behaviors, not immediate failure:

```typescript
/**
 * Timeout response escalation
 */
export enum TimeoutEscalation {
  // Level 1: Soft timeout - log warning, continue with degraded quality
  WARN_CONTINUE = "warn_continue",

  // Level 2: Reduce scope and retry - skip some features, try again
  REDUCE_SCOPE_RETRY = "reduce_scope_retry",

  // Level 3: Use cached/default results - fallback to previous state
  FALLBACK_CACHE = "fallback_cache",

  // Level 4: Skip stage entirely - continue without this stage's output
  SKIP_STAGE = "skip_stage",

  // Level 5: Abort pipeline - stop all processing
  ABORT_PIPELINE = "abort_pipeline"
}

/**
 * Timeout configuration for each stage
 */
export interface StageTimeout {
  readonly stageName: string
  readonly hardTimeoutMs: number          // Absolute timeout (abort at this point)
  readonly softTimeoutMs: number          // Warning timeout (may continue)
  readonly escalation: TimeoutEscalation
  readonly allowPartialResults: boolean   // Can continue with incomplete results
}
```

### 1.3 Default Stage Timeouts

```typescript
export const DEFAULT_STAGE_TIMEOUTS: Record<string, StageTimeout> = {
  chunking: {
    stageName: "chunking",
    softTimeoutMs: 3_000,      // Warn if > 3s
    hardTimeoutMs: 5_000,      // Abort if > 5s
    escalation: TimeoutEscalation.SKIP_STAGE,
    allowPartialResults: false // Chunks are fundamental
  },

  entityExtraction: {
    stageName: "entityExtraction",
    softTimeoutMs: 45_000,     // Warn if > 45s
    hardTimeoutMs: 60_000,     // Abort if > 60s
    escalation: TimeoutEscalation.REDUCE_SCOPE_RETRY,
    allowPartialResults: true  // Use entities extracted so far
  },

  propertyScoping: {
    stageName: "propertyScoping",
    softTimeoutMs: 10_000,     // Warn if > 10s
    hardTimeoutMs: 15_000,     // Abort if > 15s
    escalation: TimeoutEscalation.SKIP_STAGE,
    allowPartialResults: true  // Use available properties
  },

  relationExtraction: {
    stageName: "relationExtraction",
    softTimeoutMs: 45_000,     // Warn if > 45s
    hardTimeoutMs: 60_000,     // Abort if > 60s
    escalation: TimeoutEscalation.REDUCE_SCOPE_RETRY,
    allowPartialResults: true  // Use relations found so far
  },

  grounding: {
    stageName: "grounding",
    softTimeoutMs: 20_000,     // Warn if > 20s
    hardTimeoutMs: 30_000,     // Abort if > 30s
    escalation: TimeoutEscalation.FALLBACK_CACHE,
    allowPartialResults: true  // Keep unverified relations
  },

  serialization: {
    stageName: "serialization",
    softTimeoutMs: 5_000,      // Warn if > 5s
    hardTimeoutMs: 10_000,     // Abort if > 10s
    escalation: TimeoutEscalation.ABORT_PIPELINE,
    allowPartialResults: false // Serialization is final
  }
}
```

---

## 2. Per-Request Token Budget

### 2.1 Token Budget Model

```typescript
/**
 * Token budget for a single extraction request
 */
export interface TokenBudget {
  // Absolute limits (provider-enforced)
  readonly maxTokensPerRequest: number      // 4096 max (Haiku limit)
  readonly maxTokensPerMinute: number       // 100k (Anthropic rate limit)

  // Request-scoped budget (how much this request can use)
  readonly requestAllocation: number        // Usually maxTokensPerRequest
  readonly remainingTokens: number          // Decremented with each LLM call
  readonly usedTokens: number               // Cumulative usage

  // Per-stage token allowances (soft limits, not enforced)
  readonly allocations: Record<string, {
    readonly stage: string
    readonly maxTokens: number              // Soft max for this stage
    readonly usedTokens: number
    readonly allowOverflow: boolean         // Can borrow from other stages?
  }>
}

/**
 * Token tracking data structure
 */
export interface TokenUsage {
  readonly callId: string
  readonly stage: string
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
  readonly timestamp: Date
}
```

### 2.2 Token Budget Allocation Strategy

```typescript
/**
 * Allocate token budget across stages
 */
export function allocateTokenBudget(
  totalBudget: number,
  stageWeights: Record<string, number>
): TokenBudget {
  const allocations: Record<string, any> = {}
  let allocated = 0

  // Allocate proportionally to stage weights
  for (const [stage, weight] of Object.entries(stageWeights)) {
    const allocation = Math.floor((totalBudget * weight) / 100)
    allocations[stage] = {
      stage,
      maxTokens: allocation,
      usedTokens: 0,
      allowOverflow: stage === "entityExtraction" // Only entity extraction can overflow
    }
    allocated += allocation
  }

  return {
    maxTokensPerRequest: totalBudget,
    maxTokensPerMinute: 100_000,
    requestAllocation: totalBudget,
    remainingTokens: totalBudget,
    usedTokens: 0,
    allocations
  }
}

/**
 * Check if a stage can accommodate a call
 */
export function canAffordCall(
  budget: TokenBudget,
  stage: string,
  estimatedTokens: number
): boolean {
  const stageAllocation = budget.allocations[stage]
  if (!stageAllocation) return true // Unknown stage - allow

  // Check stage allocation (with overflow allowance)
  const stageUsed = stageAllocation.usedTokens
  const stageRemaining = stageAllocation.maxTokens - stageUsed

  if (stageRemaining >= estimatedTokens) {
    return true // Plenty of room in stage budget
  }

  if (stageAllocation.allowOverflow && budget.remainingTokens >= estimatedTokens) {
    return true // Can overflow from request budget
  }

  return false // Cannot afford the call
}

/**
 * Record token usage from LLM call
 */
export function recordTokenUsage(
  budget: TokenBudget,
  usage: TokenUsage
): TokenBudget {
  const stageAllocation = budget.allocations[usage.stage]
  if (!stageAllocation) return budget

  return {
    ...budget,
    remainingTokens: budget.remainingTokens - usage.totalTokens,
    usedTokens: budget.usedTokens + usage.totalTokens,
    allocations: {
      ...budget.allocations,
      [usage.stage]: {
        ...stageAllocation,
        usedTokens: stageAllocation.usedTokens + usage.totalTokens
      }
    }
  }
}
```

### 2.3 Default Token Allocation (4096 budget)

```
Entity Extraction:    1440 tokens (35%)  - Largest LLM call, extract all entities
Relation Extraction:  1440 tokens (35%)  - Complex reasoning, many relations
Grounding:            615 tokens (15%)   - Batch verification (reduced)
Property Scoping:     328 tokens (8%)    - Lightweight search
Other stages:         273 tokens (7%)    - Reserve/buffer

Total: 4096 tokens / request
```

---

## 3. Central Rate Limiter Design

### 3.1 Dual Rate Limit Model

```typescript
/**
 * Rate limiter state for the entire system
 */
export interface RateLimiterState {
  // Request rate limiting
  readonly requestBucket: {
    readonly maxRequests: number         // 50/min for Anthropic
    readonly windowMs: number            // 60000 (1 minute)
    readonly currentTokens: number       // Current permits available
    readonly lastRefillMs: number        // When bucket was last refilled
  }

  // Token rate limiting
  readonly tokenBucket: {
    readonly maxTokensPerWindow: number  // 100k/min
    readonly windowMs: number
    readonly currentTokens: number
    readonly lastRefillMs: number
  }

  // Circuit breaker state
  readonly circuitBreaker: {
    readonly state: "closed" | "open" | "half-open"
    readonly failureCount: number
    readonly successCount: number
    readonly lastStateChange: Date
  }

  // Concurrency state
  readonly concurrency: {
    readonly maxConcurrent: number       // 5 concurrent
    readonly currentCount: number
    readonly queue: PendingRequest[]
  }
}

/**
 * Pending request in rate limit queue
 */
export interface PendingRequest {
  readonly requestId: string
  readonly queuedAt: Date
  readonly estimatedTokens: number
  readonly stage: string
  readonly callback: () => Effect<any>
}
```

### 3.2 Rate Limiter Algorithm

```typescript
/**
 * Check if request can proceed immediately
 */
export function canProceed(state: RateLimiterState): {
  proceed: boolean
  reason?: string
  waitMs?: number
} {
  const now = Date.now()

  // 1. Check concurrency limit (highest priority)
  if (state.concurrency.currentCount >= state.concurrency.maxConcurrent) {
    return {
      proceed: false,
      reason: "At concurrency limit",
      waitMs: 100 // Poll every 100ms
    }
  }

  // 2. Check request rate limit (tokens per window)
  const requestsAllowed = refillBucket(state.requestBucket, now).currentTokens >= 1
  if (!requestsAllowed) {
    const nextRefillMs = state.requestBucket.lastRefillMs + state.requestBucket.windowMs - now
    return {
      proceed: false,
      reason: "Request rate limit exceeded",
      waitMs: Math.max(nextRefillMs, 100)
    }
  }

  // 3. Check token rate limit (rough estimate for this request)
  const tokensAvailable = refillBucket(state.tokenBucket, now).currentTokens >= 100
  if (!tokensAvailable) {
    const nextRefillMs = state.tokenBucket.lastRefillMs + state.tokenBucket.windowMs - now
    return {
      proceed: false,
      reason: "Token rate limit exceeded",
      waitMs: Math.max(nextRefillMs, 1000)
    }
  }

  // 4. Check circuit breaker
  if (state.circuitBreaker.state === "open") {
    return {
      proceed: false,
      reason: "Circuit breaker open (API failing)",
      waitMs: 5000
    }
  }

  return { proceed: true }
}

/**
 * Refill bucket (token bucket algorithm)
 */
function refillBucket(
  bucket: { maxTokens: number; windowMs: number; currentTokens: number; lastRefillMs: number },
  now: number
): typeof bucket {
  const elapsed = now - bucket.lastRefillMs
  const windowsPassed = Math.floor(elapsed / bucket.windowMs)

  if (windowsPassed > 0) {
    // Window(s) have passed, refill bucket
    return {
      ...bucket,
      currentTokens: bucket.maxTokens,
      lastRefillMs: now
    }
  }

  return bucket
}
```

### 3.3 Provider-Specific Rate Limits

```typescript
export const PROVIDER_RATE_LIMITS = {
  anthropic: {
    requestsPerMinute: 50,
    tokensPerMinute: 100_000,
    maxConcurrentConnections: 5,
    burstLimit: 2,              // Max 2 requests/second burst
  },
  openai: {
    requestsPerMinute: 60,
    tokensPerMinute: 150_000,
    maxConcurrentConnections: 5,
    burstLimit: 3,
  },
  google: {
    requestsPerMinute: 30,
    tokensPerMinute: 50_000,
    maxConcurrentConnections: 3,
    burstLimit: 2,
  }
} as const
```

---

## 4. Partial Result Handling Policy

### 4.1 Partial Result Types

```typescript
/**
 * Result completeness levels
 */
export enum ResultCompleteness {
  COMPLETE = "complete",           // All stages succeeded
  PARTIAL_ENTITY_ONLY = "partial_entity_only", // No relations
  PARTIAL_EARLY_EXIT = "partial_early_exit",   // Mid-pipeline timeout
  FALLBACK_CACHE = "fallback_cache",           // Used previous results
  EMPTY = "empty"                  // No results at all
}

/**
 * Partial extraction result with metadata
 */
export interface PartialExtractionResult {
  readonly completeness: ResultCompleteness
  readonly entities: ReadonlyArray<Entity>
  readonly relations: ReadonlyArray<Relation>
  readonly failedStages: ReadonlyArray<{
    readonly stage: string
    readonly reason: string
    readonly error?: Error
  }>
  readonly tokenUsage: {
    readonly allocated: number
    readonly used: number
    readonly remaining: number
  }
  readonly executionTimeMs: number
  readonly warnings: ReadonlyArray<string>
}
```

### 4.2 Partial Result Policy Decision Tree

```
┌─ Entity Extraction Timeout?
│  ├─ YES: Use entities extracted so far
│  │      (LLM may have streamed partial response)
│  │      Skip relation extraction
│  │      Return PARTIAL_ENTITY_ONLY
│  └─ NO: Continue ▼

├─ Property Scoping Timeout?
│  ├─ YES: Use available properties from cache
│  │      Fall back to broad relation extraction
│  │      Return PARTIAL_EARLY_EXIT
│  └─ NO: Continue ▼

├─ Relation Extraction Timeout?
│  ├─ YES: Use relations extracted so far
│  │      Skip grounding (too expensive at this point)
│  │      Return PARTIAL_ENTITY_ONLY
│  └─ NO: Continue ▼

├─ Grounding Timeout?
│  ├─ YES: Keep all relations (no verification)
│  │      Mark as unverified in result metadata
│  │      Return COMPLETE (technically)
│  └─ NO: Continue ▼

└─ Serialization Success?
   ├─ YES: Return COMPLETE
   └─ NO: Return error (serialization is final)
```

### 4.3 Graceful Degradation Examples

```typescript
/**
 * Example 1: Entity extraction timeout after 30s of 60s budget
 * - Entities extracted so far: 15
 * - Action: Return with PARTIAL_ENTITY_ONLY
 * - Skip: Relation extraction, grounding
 * - Result: 15 entities, 0 relations
 */

/**
 * Example 2: Relation extraction times out after 45s of 60s
 * - Entities: 20 (complete)
 * - Relations extracted: 8 of estimated 15
 * - Action: Return PARTIAL_EARLY_EXIT
 * - Skip: Grounding verification
 * - Result: 20 entities, 8 unverified relations
 */

/**
 * Example 3: Property scoping fails (ontology service down)
 * - Action: Use cached properties from last successful run
 * - Continue: Relation extraction with fallback properties
 * - Result: FALLBACK_CACHE (complete pipeline, cached data)
 */

/**
 * Example 4: Budget exhausted mid-relation-extraction
 * - Action: Stop immediately, don't queue grounding
 * - Return: All entities + relations extracted so far
 * - Result: PARTIAL_EARLY_EXIT with budget metadata
 */
```

---

## 5. Cancellation Semantics

### 5.1 Cancellation Scope Hierarchy

```
Request Scope
├─ Stage Scope (can be cancelled independently)
│  ├─ LLM Call Scope (streaming or object)
│  │  ├─ HTTP Connection (abortable)
│  │  └─ Stream (drainable)
│  └─ Retry Scope (max retries)
├─ Rate Limiter Scope (queued requests)
└─ Resource Cleanup Scope (file handles, connections)
```

### 5.2 Cancellation Strategies

```typescript
/**
 * Cancellation modes for different stages
 */
export enum CancellationMode {
  // Immediate cancellation - stop now, partial results okay
  IMMEDIATE = "immediate",

  // Graceful cancellation - finish current operation, then stop
  GRACEFUL = "graceful",

  // Drain cancellation - process queue, then stop
  DRAIN = "drain",

  // Abort - stop everything, cleanup emergency style
  ABORT = "abort"
}

/**
 * Request cancellation signal
 */
export interface CancellationSignal {
  readonly requestId: string
  readonly mode: CancellationMode
  readonly reason: string
  readonly cascadeToChildren: boolean  // Cancel child stages?
  readonly timeoutMs?: number          // Max time to wait for graceful exit
}

/**
 * Example: User cancels long-running extraction
 */
export function cancelExtractionRequest(
  requestId: string,
  reason: "user_request" | "timeout" | "resource_exhaustion"
): CancellationSignal {
  return {
    requestId,
    mode: reason === "timeout" ? CancellationMode.IMMEDIATE : CancellationMode.GRACEFUL,
    reason,
    cascadeToChildren: true,
    timeoutMs: reason === "timeout" ? 5000 : 30000
  }
}
```

### 5.3 Cascade Behavior

```typescript
/**
 * Cancellation cascade rules
 */
export const CANCELLATION_CASCADE: Record<string, CancellationBehavior> = {
  chunking: {
    cancelsSiblings: ["entityExtraction", "propertyScoping"],
    dependents: ["entityExtraction"],
    gracefulExitMs: 1000
  },

  entityExtraction: {
    cancelsSiblings: ["relationExtraction", "grounding"],
    dependents: ["propertyScoping", "relationExtraction"],
    gracefulExitMs: 5000,
    cleanupActions: [
      "abort_llm_call",
      "drain_stream",
      "release_semaphore"
    ]
  },

  propertyScoping: {
    cancelsSiblings: ["relationExtraction"],
    dependents: ["relationExtraction"],
    gracefulExitMs: 2000
  },

  relationExtraction: {
    cancelsSiblings: ["grounding"],
    dependents: ["grounding"],
    gracefulExitMs: 5000,
    cleanupActions: ["abort_llm_call", "release_semaphore"]
  },

  grounding: {
    cancelsSiblings: ["serialization"],
    dependents: ["serialization"],
    gracefulExitMs: 3000,
    cleanupActions: ["abort_llm_call"]
  },

  serialization: {
    cancelsSiblings: [],
    dependents: [],
    gracefulExitMs: 2000
  }
}

interface CancellationBehavior {
  readonly cancelsSiblings: string[]
  readonly dependents: string[]
  readonly gracefulExitMs: number
  readonly cleanupActions?: string[]
}
```

### 5.4 Resource Cleanup Order

```typescript
/**
 * Cleanup order for cancellation (reverse dependency order)
 */
export async function cleanupOnCancellation(
  requestId: string,
  failedStage: string
): Promise<void> {
  // 1. Stop new work
  await terminateStagePipeline(requestId, failedStage)

  // 2. Cancel in-flight LLM calls
  await abortLlmCalls(requestId)

  // 3. Release semaphore permits
  await releaseAllPermits(requestId)

  // 4. Close file handles
  await closeRunFolders(requestId)

  // 5. Update metrics
  recordCancellation(requestId, failedStage)
}
```

---

## 6. Integration with Existing Architecture

### 6.1 New Services to Add

```typescript
/**
 * TokenBudgetService - Per-request token tracking
 */
export class TokenBudgetService extends Effect.Service<TokenBudgetService>()(
  "TokenBudgetService",
  {
    // Implementation: Track tokens per request, enforce limits
  }
) {}

/**
 * StageTimeoutService - Stage-level timeout coordination
 */
export class StageTimeoutService extends Effect.Service<StageTimeoutService>()(
  "StageTimeoutService",
  {
    // Implementation: Apply stage timeouts, track escalation
  }
) {}

/**
 * CentralRateLimiterService - Request and token rate limiting
 */
export class CentralRateLimiterService extends Effect.Service<CentralRateLimiterService>()(
  "CentralRateLimiterService",
  {
    // Implementation: Token bucket algorithm, circuit breaker
  }
) {}

/**
 * RequestSupervisorService - Coordinate all stages, manage cancellation
 */
export class RequestSupervisorService extends Effect.Service<RequestSupervisorService>()(
  "RequestSupervisorService",
  {
    // Implementation: Coordinate stages, manage partial results
  }
) {}
```

### 6.2 Integration Points

```typescript
// Current: RateLimitedLanguageModel wraps individual calls
// New: Add CentralRateLimiter above all services

// Current: LlmSemaphore limits concurrency at service level
// New: Merge with CentralRateLimiter for unified control

// Current: No per-stage timeouts
// New: StageTimeoutService wraps each major stage

// Current: RequestSupervisor doesn't exist
// New: Add to coordinate all stages and manage partial results
```

### 6.3 Layer Composition

```typescript
/**
 * Enhanced production infrastructure
 */
export const EnhancedProductionInfrastructure = Layer.mergeAll(
  ExtractionLayersLive,
  HealthCheckService.Default,
  TokenBudgetService.Default,
  StageTimeoutService.Default,
  CentralRateLimiterService.Default,
  RequestSupervisorService.Default,
  TracingLive
)
```

---

## 7. Configuration Example

```typescript
/**
 * Configuration structure for LLM control
 */
export interface LlmControlConfig {
  // Stage timeouts
  readonly stageTimeouts: Record<string, StageTimeout>

  // Token budget
  readonly tokenBudget: {
    readonly requestMaxTokens: number
    readonly allocations: Record<string, number>
  }

  // Rate limiting
  readonly rateLimiting: {
    readonly maxConcurrent: number
    readonly requestsPerMinute: number
    readonly tokensPerMinute: number
  }

  // Partial result handling
  readonly partialResults: {
    readonly allowEntityOnly: boolean
    readonly allowUnverifiedRelations: boolean
    readonly cacheSize: number
  }

  // Cancellation
  readonly cancellation: {
    readonly gracefulExitTimeoutMs: number
    readonly enableCascade: boolean
  }
}

/**
 * Default configuration
 */
export const DEFAULT_LLM_CONTROL_CONFIG: LlmControlConfig = {
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
    requestsPerMinute: 50,        // Anthropic limit
    tokensPerMinute: 100_000      // Anthropic limit
  },

  partialResults: {
    allowEntityOnly: true,
    allowUnverifiedRelations: true,
    cacheSize: 100
  },

  cancellation: {
    gracefulExitTimeoutMs: 30_000,
    enableCascade: true
  }
}
```

---

## 8. Observability and Monitoring

### 8.1 Metrics to Track

```typescript
export interface LlmControlMetrics {
  // Timeout metrics
  readonly stageTimeouts: Map<string, number>       // Count by stage
  readonly timeoutRecoveries: number               // Graceful degradation
  readonly abortedRequests: number

  // Token metrics
  readonly tokensAllocated: number
  readonly tokensUsed: number
  readonly tokenBudgetExceeded: number

  // Rate limiting metrics
  readonly rateLimitWaits: number
  readonly rateLimitDenials: number
  readonly circuitBreakerTrips: number

  // Concurrency metrics
  readonly maxConcurrentObserved: number
  readonly avgConcurrency: number
  readonly queueDepth: number

  // Partial result metrics
  readonly completeResults: number
  readonly partialResults: number
  readonly emptyResults: number
}
```

### 8.2 Logging Strategy

```typescript
// Stage entry
Effect.logInfo("Stage started", {
  stage: "entityExtraction",
  requestId,
  budgetMs: stageTimeout.hardTimeoutMs,
  budgetTokens: tokenBudget.allocations.entityExtraction.maxTokens
})

// Timeout warning
Effect.logWarning("Stage soft timeout exceeded", {
  stage: "entityExtraction",
  elapsedMs: 45000,
  softLimitMs: 45000,
  action: "continuing with timeout escalation"
})

// Timeout hard limit
Effect.logError("Stage hard timeout hit", {
  stage: "entityExtraction",
  elapsedMs: 60000,
  hardLimitMs: 60000,
  action: "cancelling stage",
  partialResults: { entities: 12 }
})

// Token budget
Effect.logInfo("Token usage recorded", {
  stage: "entityExtraction",
  promptTokens: 850,
  completionTokens: 290,
  totalTokens: 1140,
  budgetRemaining: 2956,
  budgetPercent: "72%"
})
```

---

## 9. Migration Path

### Phase 1: Foundation (Week 1)
- Add `TokenBudgetService` to Config
- Add `StageTimeoutService` with basic timeout wrapping
- Update error types to include timeout escalation levels

### Phase 2: Rate Limiter (Week 2)
- Create `CentralRateLimiterService` with token bucket
- Integrate with existing `RateLimitedLanguageModel`
- Add circuit breaker state machine

### Phase 3: Coordination (Week 3)
- Create `RequestSupervisorService`
- Implement partial result handling
- Add cancellation signal handling

### Phase 4: Testing (Week 4)
- Test timeout escalations with mock LLM
- Test partial result scenarios
- Load test rate limiter with concurrent requests

### Phase 5: Observability (Week 5)
- Add metrics collection
- Add distributed tracing for stage timeouts
- Dashboard for token budget usage

---

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// Test timeout escalation
it("entityExtraction timeout escalates gracefully", () =>
  Effect.gen(function*() {
    const result = yield* extractWithTimeout(60000) // Hard limit
    expect(result.completeness).toBe(ResultCompleteness.PARTIAL_ENTITY_ONLY)
    expect(result.entities.length).toBeGreaterThan(0)
    expect(result.relations.length).toBe(0)
  })
)

// Test token budget enforcement
it("prevents LLM call if budget insufficient", () =>
  Effect.gen(function*() {
    const budget = allocateTokenBudget(100, { entityExtraction: 100 })
    const canAfford = canAffordCall(budget, "entityExtraction", 150)
    expect(canAfford).toBe(false)
  })
)

// Test rate limiter
it("respects request rate limit", () =>
  Effect.gen(function*() {
    const state = initialRateLimiterState()
    // Simulate 50 rapid requests
    for (let i = 0; i < 50; i++) {
      const result = canProceed(state)
      expect(result.proceed).toBe(true)
    }
    // Next request should fail
    const result = canProceed(state)
    expect(result.proceed).toBe(false)
    expect(result.waitMs).toBeGreaterThan(0)
  })
)
```

### 10.2 Integration Tests

```typescript
// Test full pipeline with timeouts
it("extracts knowledge graph with staged timeouts", () =>
  Effect.gen(function*() {
    const config = makeRunConfig("/path/to/ontology.ttl")
    const result = yield* streamingExtractionWithTimeouts(
      "text",
      config,
      DEFAULT_STAGE_TIMEOUTS
    )
    expect(result.completeness).not.toBe(ResultCompleteness.EMPTY)
  })
)

// Test cancellation cascade
it("cascades cancellation from entity extraction to relations", () =>
  Effect.gen(function*() {
    let relationCalled = false
    const result = yield* testPipelineWithCancellation(
      "entityExtraction",
      {
        onRelationStageStart: () => { relationCalled = true }
      }
    )
    expect(relationCalled).toBe(false) // Relation stage never started
  })
)
```

### 10.3 Load Tests

```bash
# Simulate 5 concurrent extractions
ab -n 50 -c 5 http://localhost:8080/extract

# Monitor:
# - Rate limiter queue depth
# - Token bucket depletion
# - Circuit breaker state
# - Partial result rates
```

---

## 11. Decision Log

### Why Per-Stage Timeouts Instead of Global?

Global 5-minute timeout (current approach):
- ❌ Not granular enough
- ❌ Slow stages block timeout detection of fast stages
- ❌ Can't distinguish "which stage is slow?"

Per-stage timeouts:
- ✅ Early detection of failures
- ✅ Allows graceful degradation
- ✅ Enables stage-specific escalation
- ✅ Better observability

### Why Token Budget Not Just Rate Limit?

Rate limiting alone:
- ❌ Doesn't prevent budget overrun mid-request
- ❌ Token costs unpredictable until completion
- ❌ Can't make informed decisions about stage continuation

Token budget:
- ✅ Predictable resource usage
- ✅ Can skip/defer expensive stages
- ✅ Enables token-aware batching

### Why Central Rate Limiter Not Just Semaphore?

Service-level semaphore (current):
- ❌ Doesn't respect API rate limits (requests/min)
- ❌ Doesn't track token usage
- ❌ Crude binary permit model

Central rate limiter:
- ✅ Enforces both request and token limits
- ✅ Implements token bucket algorithm
- ✅ Includes circuit breaker for API resilience

---

## 12. References

- [Effect.io Timeout Documentation](https://effect.website/docs/guides/error-handling/timeout)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Graceful Degradation Design](https://en.wikipedia.org/wiki/Fault_tolerance)
- Anthropic Rate Limits: 50 req/min, 100k tokens/min
- Current Architecture: `packages/@core-v2/src/Runtime/`

