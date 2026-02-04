# Implementation Plan v2: Simplified Extraction Architecture

## Overview

This plan addresses the architectural issues identified in v1 review:

| v1 Issue | v2 Resolution |
|----------|---------------|
| Workflow + Cluster collision | Cluster only (MVP) |
| Inconsistent identity | Unified idempotency key |
| Undefined progress streaming | 17-event schema with backpressure |
| Overbuilt persistence | FileSystem + embedded audit |
| No LLM control | 4 control services |

---

## Phase 1: Foundation (Week 1)

### 1.1 Unified Idempotency Key

**File**: `src/Utils/IdempotencyKey.ts`

```typescript
import { Effect, Schema } from "effect"
import { createHash } from "crypto"

// Idempotency key schema
export const IdempotencyKey = Schema.String.pipe(
  Schema.brand("IdempotencyKey")
)
export type IdempotencyKey = typeof IdempotencyKey.Type

// Extraction params that affect output
export const ExtractionParams = Schema.Struct({
  maxTokens: Schema.optional(Schema.Number),
  temperature: Schema.optional(Schema.Number),
  includeConfidence: Schema.optional(Schema.Boolean)
})

// Compute unified idempotency key
export const computeIdempotencyKey = (
  text: string,
  ontologyId: string,
  ontologyVersion: string,
  params: typeof ExtractionParams.Type = {}
): IdempotencyKey => {
  const normalized = normalizeText(text)
  const paramsHash = hashParams(params)

  const input = `${normalized}|${ontologyId}|${ontologyVersion}|${paramsHash}`
  const hash = createHash("sha256").update(input).digest("hex")

  return hash as IdempotencyKey
}

// Normalize text for consistent hashing
const normalizeText = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")  // Collapse whitespace

// Stable hash of params object
const hashParams = (params: Record<string, unknown>): string => {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}:${JSON.stringify(params[k])}`)
    .join("|")
  return createHash("sha256").update(sorted).digest("hex").slice(0, 16)
}

// Compute ontology version from content
export const computeOntologyVersion = (ontologyContent: string): string => {
  return createHash("sha256").update(ontologyContent).digest("hex").slice(0, 16)
}
```

### 1.2 Progress Event Schema

**File**: `src/Contract/ProgressEvent.ts`

```typescript
import { Schema } from "effect"

// Base event structure
const EventBase = Schema.Struct({
  eventId: Schema.String,
  requestId: Schema.String,  // Same as idempotencyKey
  timestamp: Schema.DateFromNumber,
  sequenceNumber: Schema.Number
})

// Lifecycle events
export const ExtractionStarted = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("extraction_started"),
  totalChunks: Schema.optional(Schema.Number)
})

export const ExtractionCompleted = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("extraction_completed"),
  summary: Schema.Struct({
    entityCount: Schema.Number,
    relationCount: Schema.Number,
    durationMs: Schema.Number
  })
})

export const ExtractionFailed = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("extraction_failed"),
  error: Schema.Struct({
    code: Schema.String,
    message: Schema.String,
    recoverable: Schema.Boolean,
    retryAfterMs: Schema.optional(Schema.Number)
  }),
  partialResult: Schema.optional(Schema.Any)  // KnowledgeGraph
})

// Stage events
export const StageStarted = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("stage_started"),
  stage: Schema.Literal(
    "chunking",
    "entity_extraction",
    "relation_extraction",
    "grounding",
    "serialization"
  )
})

export const StageProgress = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("stage_progress"),
  stage: Schema.String,
  percent: Schema.Number,
  itemsProcessed: Schema.Number,
  itemsTotal: Schema.Number
})

export const StageCompleted = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("stage_completed"),
  stage: Schema.String,
  durationMs: Schema.Number,
  itemCount: Schema.Number
})

// Discovery events
export const EntityFound = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("entity_found"),
  entity: Schema.Any,  // EntitySchema
  confidence: Schema.Number
})

export const RelationFound = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("relation_found"),
  relation: Schema.Any,  // RelationSchema
  confidence: Schema.Number
})

// LLM control events
export const RateLimited = Schema.Struct({
  ...EventBase.fields,
  type: Schema.Literal("rate_limited"),
  waitMs: Schema.Number,
  reason: Schema.Literal("tokens", "requests", "concurrent")
})

// Union of all events
export const ExtractionProgressEvent = Schema.Union(
  ExtractionStarted,
  ExtractionCompleted,
  ExtractionFailed,
  StageStarted,
  StageProgress,
  StageCompleted,
  EntityFound,
  RelationFound,
  RateLimited
)

export type ExtractionProgressEvent = typeof ExtractionProgressEvent.Type
```

### 1.3 LLM Control Services

**File**: `src/Service/LlmControl/TokenBudget.ts`

```typescript
import { Effect, Ref, Context } from "effect"

export interface TokenBudgetState {
  total: number
  used: number
  byStage: Record<string, number>
}

export class TokenBudgetService extends Effect.Service<TokenBudgetService>()(
  "TokenBudgetService",
  {
    effect: Effect.gen(function*() {
      const state = yield* Ref.make<TokenBudgetState>({
        total: 4096,
        used: 0,
        byStage: {}
      })

      return {
        // Check if stage can afford tokens
        canAfford: (stage: string, tokens: number) =>
          Ref.get(state).pipe(
            Effect.map(s => {
              const stageLimit = getStageBudget(stage, s.total)
              const stageUsed = s.byStage[stage] ?? 0
              return stageUsed + tokens <= stageLimit
            })
          ),

        // Record token usage
        recordUsage: (stage: string, tokens: number) =>
          Ref.update(state, s => ({
            ...s,
            used: s.used + tokens,
            byStage: {
              ...s.byStage,
              [stage]: (s.byStage[stage] ?? 0) + tokens
            }
          })),

        // Get remaining budget
        getRemaining: () =>
          Ref.get(state).pipe(
            Effect.map(s => s.total - s.used)
          ),

        // Reset for new request
        reset: (total: number = 4096) =>
          Ref.set(state, { total, used: 0, byStage: {} })
      }
    })
  }
) {}

// Budget allocation by stage
const getStageBudget = (stage: string, total: number): number => {
  const allocations: Record<string, number> = {
    entity_extraction: 0.35,
    relation_extraction: 0.35,
    grounding: 0.15,
    property_scoping: 0.08,
    other: 0.07
  }
  return Math.floor(total * (allocations[stage] ?? allocations.other))
}
```

**File**: `src/Service/LlmControl/StageTimeout.ts`

```typescript
import { Effect, Duration } from "effect"

// Stage timeout configuration
const STAGE_TIMEOUTS: Record<string, { soft: number; hard: number }> = {
  chunking: { soft: 3000, hard: 5000 },
  entity_extraction: { soft: 45000, hard: 60000 },
  relation_extraction: { soft: 45000, hard: 60000 },
  grounding: { soft: 20000, hard: 30000 },
  serialization: { soft: 7000, hard: 10000 }
}

export class StageTimeoutService extends Effect.Service<StageTimeoutService>()(
  "StageTimeoutService",
  {
    effect: Effect.succeed({
      // Wrap effect with timeout
      withTimeout: <A, E, R>(
        stage: string,
        effect: Effect.Effect<A, E, R>,
        onSoftTimeout?: () => Effect.Effect<void>
      ): Effect.Effect<A, E | TimeoutError, R> => {
        const config = STAGE_TIMEOUTS[stage] ?? STAGE_TIMEOUTS.chunking

        return effect.pipe(
          // Soft timeout - emit warning, continue
          Effect.tap(() =>
            Effect.sleep(Duration.millis(config.soft)).pipe(
              Effect.flatMap(() => onSoftTimeout?.() ?? Effect.void),
              Effect.forkScoped
            )
          ),
          // Hard timeout - fail
          Effect.timeout(Duration.millis(config.hard)),
          Effect.mapError(e =>
            e._tag === "TimeoutException"
              ? new TimeoutError({ stage, timeoutMs: config.hard })
              : e
          )
        )
      },

      getConfig: (stage: string) =>
        Effect.succeed(STAGE_TIMEOUTS[stage] ?? STAGE_TIMEOUTS.chunking)
    })
  }
) {}

export class TimeoutError extends Error {
  readonly _tag = "TimeoutError"
  constructor(readonly context: { stage: string; timeoutMs: number }) {
    super(`Stage ${context.stage} timed out after ${context.timeoutMs}ms`)
  }
}
```

**File**: `src/Service/LlmControl/RateLimiter.ts`

```typescript
import { Effect, Ref, Duration, Semaphore } from "effect"

interface RateLimiterState {
  requestsThisMinute: number
  tokensThisMinute: number
  lastReset: number
  circuitState: "closed" | "open" | "half_open"
  failureCount: number
  successCount: number
}

const CONFIG = {
  requestsPerMinute: 50,
  tokensPerMinute: 100_000,
  maxConcurrent: 5,
  failureThreshold: 5,
  recoveryTimeoutMs: 120_000,
  successThreshold: 2
}

export class CentralRateLimiterService extends Effect.Service<CentralRateLimiterService>()(
  "CentralRateLimiterService",
  {
    effect: Effect.gen(function*() {
      const state = yield* Ref.make<RateLimiterState>({
        requestsThisMinute: 0,
        tokensThisMinute: 0,
        lastReset: Date.now(),
        circuitState: "closed",
        failureCount: 0,
        successCount: 0
      })

      const semaphore = yield* Semaphore.make(CONFIG.maxConcurrent)

      return {
        // Acquire rate limit permit
        acquire: (estimatedTokens: number) =>
          Effect.gen(function*() {
            // Check circuit breaker
            const s = yield* Ref.get(state)
            if (s.circuitState === "open") {
              const elapsed = Date.now() - s.lastReset
              if (elapsed < CONFIG.recoveryTimeoutMs) {
                yield* Effect.fail(new CircuitOpenError())
              }
              // Move to half_open
              yield* Ref.update(state, st => ({ ...st, circuitState: "half_open" as const }))
            }

            // Reset counters if minute elapsed
            const now = Date.now()
            if (now - s.lastReset > 60_000) {
              yield* Ref.update(state, st => ({
                ...st,
                requestsThisMinute: 0,
                tokensThisMinute: 0,
                lastReset: now
              }))
            }

            // Check limits
            const current = yield* Ref.get(state)
            if (current.requestsThisMinute >= CONFIG.requestsPerMinute) {
              yield* Effect.fail(new RateLimitError("requests"))
            }
            if (current.tokensThisMinute + estimatedTokens > CONFIG.tokensPerMinute) {
              yield* Effect.fail(new RateLimitError("tokens"))
            }

            // Acquire semaphore permit
            yield* Semaphore.withPermits(semaphore, 1)(Effect.void)

            // Increment counters
            yield* Ref.update(state, st => ({
              ...st,
              requestsThisMinute: st.requestsThisMinute + 1,
              tokensThisMinute: st.tokensThisMinute + estimatedTokens
            }))
          }),

        // Release and update circuit breaker
        release: (actualTokens: number, success: boolean) =>
          Ref.update(state, s => {
            if (success) {
              const newSuccessCount = s.successCount + 1
              return {
                ...s,
                tokensThisMinute: s.tokensThisMinute - actualTokens + actualTokens,
                successCount: newSuccessCount,
                failureCount: 0,
                circuitState: s.circuitState === "half_open" && newSuccessCount >= CONFIG.successThreshold
                  ? "closed" as const
                  : s.circuitState
              }
            } else {
              const newFailureCount = s.failureCount + 1
              return {
                ...s,
                failureCount: newFailureCount,
                successCount: 0,
                circuitState: newFailureCount >= CONFIG.failureThreshold
                  ? "open" as const
                  : s.circuitState,
                lastReset: newFailureCount >= CONFIG.failureThreshold ? Date.now() : s.lastReset
              }
            }
          }),

        getMetrics: () => Ref.get(state)
      }
    })
  }
) {}

export class RateLimitError extends Error {
  readonly _tag = "RateLimitError"
  constructor(readonly reason: "tokens" | "requests" | "concurrent") {
    super(`Rate limit exceeded: ${reason}`)
  }
}

export class CircuitOpenError extends Error {
  readonly _tag = "CircuitOpenError"
  constructor() {
    super("Circuit breaker is open")
  }
}
```

### 1.4 Minimal Persistence

**File**: `src/Service/ExtractionRun.ts` (update existing)

```typescript
import { Effect, Schema } from "effect"
import { FileSystem } from "@effect/platform"
import { IdempotencyKey } from "../Utils/IdempotencyKey.js"

// Audit event embedded in metadata
const AuditEvent = Schema.Struct({
  timestamp: Schema.String,
  type: Schema.Literal(
    "started",
    "stage_began",
    "stage_completed",
    "entity_extracted",
    "relation_extracted",
    "completed",
    "failed"
  ),
  data: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
})

const AuditError = Schema.Struct({
  timestamp: Schema.String,
  type: Schema.Literal("timeout", "llm_error", "validation_error", "cancelled"),
  message: Schema.String,
  context: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
})

// Run metadata with embedded audit
const ExtractionMetadata = Schema.Struct({
  idempotencyKey: Schema.String,
  status: Schema.Literal("pending", "running", "complete", "failed", "partial"),
  ontologyId: Schema.String,
  ontologyVersion: Schema.String,
  entityCount: Schema.Number,
  relationCount: Schema.Number,
  startedAt: Schema.String,
  completedAt: Schema.NullOr(Schema.String),
  durationMs: Schema.NullOr(Schema.Number),
  events: Schema.Array(AuditEvent),
  errors: Schema.Array(AuditError)
})

export class ExtractionRunService extends Effect.Service<ExtractionRunService>()(
  "ExtractionRunService",
  {
    effect: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const baseDir = "./runs"

      return {
        // Get run directory path
        getRunPath: (key: IdempotencyKey) =>
          Effect.succeed(`${baseDir}/${key}`),

        // Check if run exists
        exists: (key: IdempotencyKey) =>
          fs.exists(`${baseDir}/${key}/metadata.json`),

        // Get run metadata
        getMetadata: (key: IdempotencyKey) =>
          fs.readFileString(`${baseDir}/${key}/metadata.json`).pipe(
            Effect.flatMap(json => Schema.decodeUnknown(ExtractionMetadata)(JSON.parse(json)))
          ),

        // Create new run
        create: (key: IdempotencyKey, ontologyId: string, ontologyVersion: string) =>
          Effect.gen(function*() {
            const dir = `${baseDir}/${key}`
            yield* fs.makeDirectory(dir, { recursive: true })

            const metadata = {
              idempotencyKey: key,
              status: "pending" as const,
              ontologyId,
              ontologyVersion,
              entityCount: 0,
              relationCount: 0,
              startedAt: new Date().toISOString(),
              completedAt: null,
              durationMs: null,
              events: [{ timestamp: new Date().toISOString(), type: "started" as const }],
              errors: []
            }

            yield* fs.writeFileString(
              `${dir}/metadata.json`,
              JSON.stringify(metadata, null, 2)
            )

            return metadata
          }),

        // Emit audit event
        emitEvent: (key: IdempotencyKey, event: typeof AuditEvent.Type) =>
          Effect.gen(function*() {
            const path = `${baseDir}/${key}/metadata.json`
            const current = yield* fs.readFileString(path).pipe(
              Effect.flatMap(json => Schema.decodeUnknown(ExtractionMetadata)(JSON.parse(json)))
            )

            const updated = {
              ...current,
              events: [...current.events, { ...event, timestamp: new Date().toISOString() }]
            }

            yield* fs.writeFileString(path, JSON.stringify(updated, null, 2))
          }),

        // Save entities
        saveEntities: (key: IdempotencyKey, entities: unknown[]) =>
          fs.writeFileString(
            `${baseDir}/${key}/entities.json`,
            JSON.stringify(entities, null, 2)
          ),

        // Save relations
        saveRelations: (key: IdempotencyKey, relations: unknown[]) =>
          fs.writeFileString(
            `${baseDir}/${key}/relations.json`,
            JSON.stringify(relations, null, 2)
          ),

        // Complete run
        complete: (key: IdempotencyKey, entityCount: number, relationCount: number) =>
          Effect.gen(function*() {
            const path = `${baseDir}/${key}/metadata.json`
            const current = yield* fs.readFileString(path).pipe(
              Effect.flatMap(json => Schema.decodeUnknown(ExtractionMetadata)(JSON.parse(json)))
            )

            const now = new Date()
            const updated = {
              ...current,
              status: "complete" as const,
              entityCount,
              relationCount,
              completedAt: now.toISOString(),
              durationMs: now.getTime() - new Date(current.startedAt).getTime(),
              events: [
                ...current.events,
                { timestamp: now.toISOString(), type: "completed" as const }
              ]
            }

            yield* fs.writeFileString(path, JSON.stringify(updated, null, 2))
          })
      }
    }),
    dependencies: [FileSystem.FileSystem]
  }
) {}
```

---

## Phase 2: Cluster Entity (Week 2)

### 2.1 Entity Definition

**File**: `src/Cluster/ExtractionEntity.ts`

```typescript
import { Entity, ClusterSchema } from "@effect/cluster"
import { Rpc } from "@effect/rpc"
import { Schema, Effect, Stream } from "effect"
import { ExtractionProgressEvent } from "../Contract/ProgressEvent.js"
import { IdempotencyKey } from "../Utils/IdempotencyKey.js"

// RPC definitions
const ExtractFromTextRpc = Rpc.make("ExtractFromText", {
  payload: Schema.Struct({
    text: Schema.String,
    ontologyId: Schema.String,
    ontologyVersion: Schema.String,
    params: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
  }),
  success: ExtractionProgressEvent,
  error: Schema.String,
  stream: true,
  primaryKey: ({ text, ontologyId, ontologyVersion, params }) =>
    computeIdempotencyKey(text, ontologyId, ontologyVersion, params ?? {})
}).annotate(ClusterSchema.Persisted, true)

const GetCachedResultRpc = Rpc.make("GetCachedResult", {
  payload: Schema.Struct({
    idempotencyKey: Schema.String
  }),
  success: Schema.Option(Schema.Any),  // KnowledgeGraph
  error: Schema.Never
})

// Entity definition
export const KnowledgeGraphExtractor = Entity.make(
  "KGExtractor",
  [ExtractFromTextRpc, GetCachedResultRpc]
)
```

### 2.2 Entity Implementation

**File**: `src/Cluster/ExtractionEntityHandler.ts`

```typescript
import { Effect, Stream, Ref } from "effect"
import { KnowledgeGraphExtractor } from "./ExtractionEntity.js"
import { ExtractionRunService } from "../Service/ExtractionRun.js"
import { TokenBudgetService } from "../Service/LlmControl/TokenBudget.js"
import { StageTimeoutService } from "../Service/LlmControl/StageTimeout.js"
import { CentralRateLimiterService } from "../Service/LlmControl/RateLimiter.js"
import { EntityExtractor, RelationExtractor } from "../Service/Extraction.js"
import { computeIdempotencyKey } from "../Utils/IdempotencyKey.js"

// Entity state
interface ExtractionState {
  status: "pending" | "running" | "complete" | "failed"
  lastResult: unknown | null
  lastError: Error | null
}

export const KnowledgeGraphExtractorLive = KnowledgeGraphExtractor.toLayer(
  (envelope) => Effect.gen(function*() {
    const state = yield* Ref.make<ExtractionState>({
      status: "pending",
      lastResult: null,
      lastError: null
    })

    // Services
    const runService = yield* ExtractionRunService
    const tokenBudget = yield* TokenBudgetService
    const stageTimeout = yield* StageTimeoutService
    const rateLimiter = yield* CentralRateLimiterService
    const entityExtractor = yield* EntityExtractor
    const relationExtractor = yield* RelationExtractor

    return {
      ExtractFromText: (env) => {
        const { text, ontologyId, ontologyVersion, params } = env.payload
        const key = computeIdempotencyKey(text, ontologyId, ontologyVersion, params ?? {})
        let sequenceNumber = 0

        const nextSeq = () => sequenceNumber++

        return Stream.gen(function*() {
          // Check for existing complete run
          const exists = yield* runService.exists(key)
          if (exists) {
            const metadata = yield* runService.getMetadata(key)
            if (metadata.status === "complete") {
              yield* {
                eventId: crypto.randomUUID(),
                requestId: key,
                timestamp: Date.now(),
                sequenceNumber: nextSeq(),
                type: "extraction_completed" as const,
                summary: {
                  entityCount: metadata.entityCount,
                  relationCount: metadata.relationCount,
                  durationMs: metadata.durationMs ?? 0
                }
              }
              return
            }
          }

          // Create new run
          yield* runService.create(key, ontologyId, ontologyVersion)
          yield* Ref.set(state, { status: "running", lastResult: null, lastError: null })

          // Emit started
          yield* {
            eventId: crypto.randomUUID(),
            requestId: key,
            timestamp: Date.now(),
            sequenceNumber: nextSeq(),
            type: "extraction_started" as const
          }

          // Reset token budget
          yield* tokenBudget.reset(4096)

          // Stage 1: Entity extraction
          yield* {
            eventId: crypto.randomUUID(),
            requestId: key,
            timestamp: Date.now(),
            sequenceNumber: nextSeq(),
            type: "stage_started" as const,
            stage: "entity_extraction" as const
          }

          const entityResult = yield* stageTimeout.withTimeout(
            "entity_extraction",
            Effect.gen(function*() {
              // Acquire rate limit
              yield* rateLimiter.acquire(1440)  // Estimated tokens

              const entities = yield* entityExtractor.extract(text)

              // Emit entity_found events
              for (const entity of entities) {
                yield* Stream.emit({
                  eventId: crypto.randomUUID(),
                  requestId: key,
                  timestamp: Date.now(),
                  sequenceNumber: nextSeq(),
                  type: "entity_found" as const,
                  entity,
                  confidence: 0.9
                })
              }

              // Release rate limit
              yield* rateLimiter.release(1440, true)
              yield* tokenBudget.recordUsage("entity_extraction", 1440)

              return entities
            }),
            () => Effect.logWarning("Entity extraction soft timeout")
          ).pipe(
            Effect.catchTag("TimeoutError", (e) =>
              Effect.gen(function*() {
                yield* runService.emitEvent(key, {
                  timestamp: new Date().toISOString(),
                  type: "stage_completed",
                  data: { stage: "entity_extraction", partial: true }
                })
                return []  // Return empty on timeout
              })
            )
          )

          yield* {
            eventId: crypto.randomUUID(),
            requestId: key,
            timestamp: Date.now(),
            sequenceNumber: nextSeq(),
            type: "stage_completed" as const,
            stage: "entity_extraction",
            durationMs: 0,  // TODO: track actual duration
            itemCount: entityResult.length
          }

          yield* runService.saveEntities(key, entityResult)

          // Stage 2: Relation extraction (similar pattern)
          // ... (omitted for brevity)

          // Complete
          yield* runService.complete(key, entityResult.length, 0)
          yield* Ref.set(state, { status: "complete", lastResult: { entities: entityResult, relations: [] }, lastError: null })

          yield* {
            eventId: crypto.randomUUID(),
            requestId: key,
            timestamp: Date.now(),
            sequenceNumber: nextSeq(),
            type: "extraction_completed" as const,
            summary: {
              entityCount: entityResult.length,
              relationCount: 0,
              durationMs: 0
            }
          }
        })
      },

      GetCachedResult: (env) => Effect.gen(function*() {
        const exists = yield* runService.exists(env.payload.idempotencyKey as IdempotencyKey)
        if (!exists) return Option.none()

        const metadata = yield* runService.getMetadata(env.payload.idempotencyKey as IdempotencyKey)
        if (metadata.status !== "complete") return Option.none()

        // Load full result
        // ... (load entities.json, relations.json)
        return Option.some({ entities: [], relations: [] })
      })
    }
  }),
  {
    maxIdleTime: Duration.minutes(5),
    concurrency: 1
  }
)
```

### 2.3 RPC Server Setup

**File**: `src/Rpc/ExtractionApi.ts`

```typescript
import { RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import { ExtractionProgressEvent } from "../Contract/ProgressEvent.js"

// Simplified RPC group that routes to Cluster entity
const StreamExtractRpc = Rpc.make("streamExtract", {
  payload: Schema.Struct({
    text: Schema.String,
    ontologyId: Schema.String
  }),
  success: ExtractionProgressEvent,
  error: Schema.String,
  stream: true
})

const GetResultRpc = Rpc.make("getResult", {
  payload: Schema.Struct({
    text: Schema.String,
    ontologyId: Schema.String
  }),
  success: Schema.Option(Schema.Any),
  error: Schema.Never
})

export const ExtractionApi = RpcGroup.make(
  StreamExtractRpc,
  GetResultRpc
).prefix("extraction.")
```

### 2.4 Backpressure Handler

**File**: `src/Rpc/BackpressureHandler.ts`

```typescript
import { Effect, Queue, Stream, Duration } from "effect"

const CRITICAL_EVENTS = new Set([
  "extraction_started",
  "extraction_completed",
  "extraction_failed",
  "stage_started",
  "stage_completed"
])

interface BackpressureConfig {
  maxQueuedEvents: number
  samplingThreshold: number  // 0.8 = 80%
  samplingRate: number       // 0.1 = keep 10%
}

const DEFAULT_CONFIG: BackpressureConfig = {
  maxQueuedEvents: 1000,
  samplingThreshold: 0.8,
  samplingRate: 0.1
}

export const withBackpressure = <E>(
  source: Stream.Stream<ExtractionProgressEvent, E>,
  config: BackpressureConfig = DEFAULT_CONFIG
): Stream.Stream<ExtractionProgressEvent, E> =>
  Stream.gen(function*() {
    const queue = yield* Queue.bounded<ExtractionProgressEvent>(config.maxQueuedEvents)
    let sampleCounter = 0

    // Producer fiber: read from source, apply sampling
    yield* source.pipe(
      Stream.tap(event => {
        return Queue.size(queue).pipe(
          Effect.flatMap(size => {
            const loadFactor = size / config.maxQueuedEvents

            // Always send critical events
            if (CRITICAL_EVENTS.has(event.type)) {
              return Queue.offer(queue, event)
            }

            // Apply sampling when queue is getting full
            if (loadFactor > config.samplingThreshold) {
              sampleCounter++
              if (sampleCounter % Math.floor(1 / config.samplingRate) !== 0) {
                return Effect.void  // Drop this event
              }
            }

            // Normal case: enqueue
            return Queue.offer(queue, event).pipe(
              Effect.catchAll(() => Effect.void)  // Drop if full
            )
          })
        )
      }),
      Stream.runDrain,
      Effect.forkScoped
    )

    // Consumer: yield from queue
    yield* Stream.fromQueue(queue)
  })
```

---

## Phase 3: Integration (Week 2 continued)

### 3.1 Layer Composition

**File**: `src/Runtime/ProductionRuntime.ts` (update)

```typescript
import { Layer } from "effect"
import { BunContext, BunHttpServer } from "@effect/platform-bun"
import { Sharding } from "@effect/cluster"

// Platform
const PlatformLive = BunContext.layer

// LLM provider
const LlmProviderLive = makeLanguageModelLayer.pipe(
  Layer.provideMerge(ConfigService.Default)
)

// LLM control
const LlmControlLive = Layer.mergeAll(
  TokenBudgetService.Default,
  StageTimeoutService.Default,
  CentralRateLimiterService.Default
).pipe(Layer.provideMerge(LlmProviderLive))

// Services
const ExtractionServicesLive = Layer.mergeAll(
  EntityExtractor.Default,
  RelationExtractor.Default,
  Grounder.Default
).pipe(Layer.provideMerge(LlmControlLive))

// Persistence
const PersistenceLive = ExtractionRunService.Default.pipe(
  Layer.provideMerge(FileSystem.layer)
)

// Cluster (local mode for MVP)
const ClusterLive = Layer.mergeAll(
  KnowledgeGraphExtractorLive,
  Sharding.local()
).pipe(
  Layer.provideMerge(ExtractionServicesLive),
  Layer.provideMerge(PersistenceLive)
)

// RPC with backpressure
const RpcLive = RpcServer.layerWebSocket({
  group: ExtractionApi,
  path: "/api/rpc"
}).pipe(Layer.provideMerge(ClusterLive))

// HTTP server
export const ProductionStack = Layer.mergeAll(
  BunHttpServer.layer({ port: 8080 }),
  HealthCheckService.Default,
  RpcLive
).pipe(Layer.provideMerge(PlatformLive))
```

---

## Validation Checklist

### Phase 1 Completion

- [ ] `computeIdempotencyKey()` produces consistent hashes
- [ ] Same text + ontology + version → same key
- [ ] Different text OR ontology OR version → different key
- [ ] TokenBudgetService tracks usage correctly
- [ ] StageTimeoutService applies soft/hard timeouts
- [ ] CentralRateLimiterService respects limits
- [ ] Circuit breaker opens after 5 failures
- [ ] ExtractionRunService creates ./runs/{key}/ directory
- [ ] Audit events appear in metadata.json

### Phase 2 Completion

- [ ] Entity routes requests by idempotency key
- [ ] Existing complete run returns cached result
- [ ] Progress events stream to client
- [ ] Backpressure sampling activates at 80% queue
- [ ] Critical events never sampled
- [ ] Partial results returned on stage timeout

### Integration Tests

```bash
# Test idempotency
curl -X POST http://localhost:8080/api/rpc -d '{"tag":"extraction.streamExtract","payload":{"text":"test","ontologyId":"foaf"}}'
# Second call with same params should return cached

# Test progress streaming
wscat -c ws://localhost:8080/api/rpc
> {"tag":"extraction.streamExtract","payload":{"text":"long text...","ontologyId":"foaf"}}
# Should receive multiple events

# Test timeout behavior
# Use very large text that exceeds stage timeout
# Should receive partial results
```

---

## Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1. Foundation | Week 1 | IdempotencyKey, ProgressEvents, LlmControl, Persistence |
| 2. Cluster | Week 2 | Entity, Handlers, RPC, Backpressure |
| 3. Integration | Week 2 | Layer composition, E2E tests |

**Total MVP effort**: ~2 weeks

**Deferred to later phases**:
- Workflow layer
- SQL persistence
- Multi-node cluster
- Compensation/rollback
