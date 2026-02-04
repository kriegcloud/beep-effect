# Implementation Plan: Distributed Extraction Architecture

> **⚠️ SUPERSEDED**: This document has been superseded by [implementation-plan-v2.md](./implementation-plan-v2.md) which provides refined phases with completed items marked.

## Overview

This plan outlines the phased implementation of distributed knowledge extraction using Effect Cluster, Workflow, RPC, and Persistence patterns. Each phase builds on the previous, allowing incremental validation.

---

## Phase 1: RPC Layer Foundation

**Goal**: Replace ad-hoc HTTP handlers with schema-validated RPC endpoints.

### Tasks

#### 1.1 Add RPC Dependencies

```bash
bun add @effect/rpc
```

#### 1.2 Define RPC Schemas

**File**: `src/Rpc/Schemas.ts`

```typescript
import { Schema } from "effect"
import { KnowledgeGraph } from "../Domain/Model/KnowledgeGraph.js"

// Extraction request/response schemas
export const ExtractionPayload = Schema.Struct({
  text: Schema.String,
  ontologyId: Schema.String,
  options: Schema.optional(Schema.Struct({
    maxTokens: Schema.optional(Schema.Number),
    temperature: Schema.optional(Schema.Number)
  }))
})

export const ExtractionEvent = Schema.Union(
  Schema.Struct({ type: Schema.Literal("started"), requestId: Schema.String }),
  Schema.Struct({ type: Schema.Literal("progress"), stage: Schema.String, percent: Schema.Number }),
  Schema.Struct({ type: Schema.Literal("complete"), result: KnowledgeGraph })
)

export const ExtractionError = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal("LlmError"), message: Schema.String }),
  Schema.Struct({ _tag: Schema.Literal("OntologyError"), message: Schema.String }),
  Schema.Struct({ _tag: Schema.Literal("TimeoutError"), message: Schema.String })
)
```

#### 1.3 Define RPC Procedures

**File**: `src/Rpc/ExtractionApi.ts`

```typescript
import { Rpc, RpcGroup } from "@effect/rpc"
import * as Schemas from "./Schemas.js"

export const ExtractRpc = Rpc.make("extract", {
  payload: Schemas.ExtractionPayload,
  success: Schemas.KnowledgeGraph,
  error: Schemas.ExtractionError,
  primaryKey: ({ text, ontologyId }) => `${hash(text)}-${ontologyId}`
})

export const StreamExtractRpc = Rpc.make("streamExtract", {
  payload: Schemas.ExtractionPayload,
  success: Schemas.ExtractionEvent,
  error: Schemas.ExtractionError,
  stream: true
})

export const GetStatusRpc = Rpc.make("getStatus", {
  payload: Schema.Struct({ requestId: Schema.String }),
  success: Schemas.ExtractionStatus,
  error: Schema.Never
})

export const ExtractionApi = RpcGroup.make(
  ExtractRpc,
  StreamExtractRpc,
  GetStatusRpc
).prefix("extraction.")
```

#### 1.4 Implement RPC Handlers

**File**: `src/Rpc/ExtractionHandlers.ts`

```typescript
import { Effect, Stream } from "effect"
import { ExtractionApi } from "./ExtractionApi.js"
import { EntityExtractor, MentionExtractor, RelationExtractor } from "../Service/Extraction.js"

export const ExtractionHandlersLive = ExtractionApi.toLayer({
  extract: (payload) => Effect.gen(function*() {
    const entityExtractor = yield* EntityExtractor
    const mentionExtractor = yield* MentionExtractor
    const relationExtractor = yield* RelationExtractor

    // Use existing extraction logic
    const entities = yield* entityExtractor.extract(payload.text)
    const mentions = yield* mentionExtractor.extract(payload.text, entities)
    const relations = yield* relationExtractor.extract(payload.text, mentions)

    return { entities, relations }
  }),

  streamExtract: (payload) => Stream.gen(function*() {
    yield* { type: "started", requestId: payload.requestId }

    const entityExtractor = yield* EntityExtractor
    yield* { type: "progress", stage: "entities", percent: 0 }
    const entities = yield* entityExtractor.extract(payload.text)
    yield* { type: "progress", stage: "entities", percent: 100 }

    // Continue with other stages...

    yield* { type: "complete", result: { entities, relations } }
  }),

  getStatus: (payload) => Effect.succeed({ status: "pending" })
})
```

#### 1.5 Wire RPC Server to HTTP

**File**: `src/Runtime/HttpServer.ts` (update)

```typescript
import { RpcServer } from "@effect/rpc"
import { ExtractionApi, ExtractionHandlersLive } from "../Rpc/index.js"

// Add RPC router alongside existing health endpoints
export const HttpServerLive = Layer.effect(
  HttpServer,
  Effect.gen(function*() {
    // Existing health routes...

    // RPC endpoint
    const rpcRouter = yield* RpcServer.toHttpRouter(ExtractionApi, "/api/rpc")

    return HttpRouter.concat(healthRouter, rpcRouter)
  })
).pipe(
  Layer.provideMerge(ExtractionHandlersLive)
)
```

### Validation

```bash
# Type check
bun run check

# Test RPC with curl
curl -X POST http://localhost:8080/api/rpc \
  -H "Content-Type: application/json" \
  -d '{"_tag":"extraction.extract","payload":{"text":"test","ontologyId":"foaf"}}'
```

---

## Phase 2: Persistence Layer

**Goal**: Add result caching and audit logging with SQL backing.

### Tasks

#### 2.1 Add SQL Dependencies

```bash
bun add @effect/sql @effect/sql-sqlite-bun
```

#### 2.2 Define Database Schema

**File**: `src/Persistence/Schema.sql`

```sql
-- Extraction results cache
CREATE TABLE IF NOT EXISTS extraction_results (
  id TEXT PRIMARY KEY,
  text_hash TEXT NOT NULL,
  ontology_id TEXT NOT NULL,
  result_json TEXT,
  error_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,
  UNIQUE(text_hash, ontology_id)
);

-- Event journal for audit trail
CREATE TABLE IF NOT EXISTS extraction_events (
  id TEXT PRIMARY KEY,  -- UUID v7
  request_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  INDEX idx_request_id (request_id),
  INDEX idx_created_at (created_at)
);

-- Workflow state (for durable execution)
CREATE TABLE IF NOT EXISTS workflow_state (
  execution_id TEXT PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  state_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'suspended', 'complete', 'failed')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

#### 2.3 Create SQL Client Layer

**File**: `src/Persistence/SqlClient.ts`

```typescript
import { SqlClient } from "@effect/sql"
import { SqliteBun } from "@effect/sql-sqlite-bun"
import { Config, Effect, Layer } from "effect"

export const SqlClientLive = SqliteBun.layer({
  filename: Config.string("DATABASE_PATH").pipe(
    Config.withDefault("./data/extraction.db")
  )
})

// Run migrations on startup
export const MigrationsLive = Layer.effectDiscard(
  Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient
    yield* sql.execute(migrationSql)
    yield* Effect.logInfo("Database migrations complete")
  })
).pipe(Layer.provideMerge(SqlClientLive))
```

#### 2.4 Implement PersistedCache

**File**: `src/Persistence/ExtractionCache.ts`

```typescript
import { PersistedCache } from "@effect/experimental"
import { Duration, Effect, Exit, Layer, Schema } from "effect"
import { KnowledgeGraph } from "../Domain/Model/KnowledgeGraph.js"

// Cache key schema
const ExtractionKey = Schema.Struct({
  textHash: Schema.String,
  ontologyId: Schema.String
})

// Create persisted cache with hybrid L1/L2
export class ExtractionCacheService extends Effect.Service<ExtractionCacheService>()(
  "ExtractionCacheService",
  {
    effect: Effect.gen(function*() {
      const cache = yield* PersistedCache.make({
        storeId: "extraction-results",
        keySchema: ExtractionKey,
        valueSchema: KnowledgeGraph,

        // Lookup performs extraction on cache miss
        lookup: (key) => Effect.gen(function*() {
          // This will be replaced with workflow execution in Phase 3
          const extractor = yield* EntityExtractor
          return yield* extractor.extractFull(key.textHash, key.ontologyId)
        }),

        // Different TTL for success vs failure
        timeToLive: (key, exit) => Exit.isSuccess(exit)
          ? Duration.days(7)      // Cache successful results for 7 days
          : Duration.minutes(5),  // Retry failures after 5 minutes

        // In-memory L1 cache configuration
        inMemoryCapacity: 16,
        inMemoryTTL: Duration.minutes(2)
      })

      return {
        get: (text: string, ontologyId: string) =>
          cache.get({ textHash: md5(text), ontologyId }),

        invalidate: (text: string, ontologyId: string) =>
          cache.invalidate({ textHash: md5(text), ontologyId })
      }
    }),
    dependencies: []
  }
) {
  static Test = Layer.succeed(ExtractionCacheService, {
    get: () => Effect.succeed(mockKnowledgeGraph),
    invalidate: () => Effect.void
  })
}
```

#### 2.5 Implement EventJournal

**File**: `src/Persistence/EventJournal.ts`

```typescript
import { Effect, Schema, Stream, Layer } from "effect"
import { SqlClient } from "@effect/sql"

const ExtractionEvent = Schema.Union(
  Schema.Struct({ type: Schema.Literal("started"), requestId: Schema.String }),
  Schema.Struct({ type: Schema.Literal("entities_extracted"), count: Schema.Number }),
  Schema.Struct({ type: Schema.Literal("relations_extracted"), count: Schema.Number }),
  Schema.Struct({ type: Schema.Literal("completed"), resultId: Schema.String }),
  Schema.Struct({ type: Schema.Literal("failed"), error: Schema.String })
)

export class EventJournalService extends Effect.Service<EventJournalService>()(
  "EventJournalService",
  {
    effect: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      return {
        append: (requestId: string, event: typeof ExtractionEvent.Type) =>
          sql.execute`
            INSERT INTO extraction_events (id, request_id, event_type, event_data)
            VALUES (${uuidv7()}, ${requestId}, ${event.type}, ${JSON.stringify(event)})
          `,

        getEvents: (requestId: string) =>
          sql.execute`
            SELECT * FROM extraction_events
            WHERE request_id = ${requestId}
            ORDER BY created_at ASC
          `.pipe(
            Effect.map(rows => rows.map(r => JSON.parse(r.event_data)))
          ),

        streamEvents: (requestId: string) =>
          Stream.fromEffect(
            sql.execute`
              SELECT * FROM extraction_events
              WHERE request_id = ${requestId}
              ORDER BY created_at ASC
            `
          ).pipe(
            Stream.flatMap(rows => Stream.fromIterable(rows)),
            Stream.map(r => JSON.parse(r.event_data))
          )
      }
    }),
    dependencies: [SqlClient.SqlClient]
  }
) {}
```

### Validation

```bash
# Check database file created
ls -la data/extraction.db

# Test cache hit/miss
bun run test:cache

# Verify event journal
sqlite3 data/extraction.db "SELECT * FROM extraction_events LIMIT 10"
```

---

## Phase 3: Workflow Layer

**Goal**: Add durable execution with activities for fault tolerance.

### Tasks

#### 3.1 Add Workflow Dependencies

```bash
bun add @effect/workflow
```

#### 3.2 Define Activities

**File**: `src/Workflow/Activities.ts`

```typescript
import { Activity } from "@effect/workflow"
import { Effect, Schema, Schedule } from "effect"
import { EntityExtractor, MentionExtractor, RelationExtractor } from "../Service/Extraction.js"

// Activity: Preprocess text with NLP
export const PreprocessTextActivity = Activity.make({
  name: "PreprocessText",
  execute: (text: string) => Effect.gen(function*() {
    // NLP preprocessing (tokenization, etc.)
    const nlp = yield* NlpService
    return yield* nlp.preprocess(text)
  }),
  success: Schema.Array(Schema.String),
  error: Schema.String,
  interruptRetryPolicy: Schedule.exponential("100 millis", 1.5).pipe(
    Schedule.compose(Schedule.recurs(5))
  )
})

// Activity: Extract entities via LLM (durable, retryable)
export const ExtractEntitiesActivity = Activity.make({
  name: "ExtractEntities",
  execute: (text: string, tokens: string[]) => Effect.gen(function*() {
    const extractor = yield* EntityExtractor
    return yield* extractor.extract(text)
  }),
  success: Schema.Array(EntitySchema),
  error: Schema.String,
  interruptRetryPolicy: Schedule.exponential("500 millis", 1.5).pipe(
    Schedule.compose(Schedule.recurs(10)),
    Schedule.union(Schedule.spaced("30 seconds"))
  )
})

// Activity: Resolve entity references
export const ResolveEntitiesActivity = Activity.make({
  name: "ResolveEntities",
  execute: (entities: Entity[], ontologyId: string) => Effect.gen(function*() {
    const grounder = yield* Grounder
    return yield* grounder.resolve(entities, ontologyId)
  }),
  success: Schema.Array(ResolvedEntitySchema),
  error: Schema.String
})

// Activity: Extract relations
export const ExtractRelationsActivity = Activity.make({
  name: "ExtractRelations",
  execute: (text: string, entities: ResolvedEntity[]) => Effect.gen(function*() {
    const extractor = yield* RelationExtractor
    return yield* extractor.extract(text, entities)
  }),
  success: Schema.Array(RelationSchema),
  error: Schema.String
})

// Activity: Persist result
export const PersistResultActivity = Activity.make({
  name: "PersistResult",
  execute: (result: KnowledgeGraph, requestId: string) => Effect.gen(function*() {
    const cache = yield* ExtractionCacheService
    yield* cache.set(requestId, result)

    const journal = yield* EventJournalService
    yield* journal.append(requestId, { type: "completed", resultId: requestId })
  }),
  success: Schema.Void,
  error: Schema.String
})
```

#### 3.3 Define Workflow

**File**: `src/Workflow/EntityExtractionWorkflow.ts`

```typescript
import { Workflow, DurableClock } from "@effect/workflow"
import { Context, Duration, Effect, Schema, Schedule } from "effect"
import * as Activities from "./Activities.js"

// Workflow annotations
const SuspendOnFailure = Context.GenericTag<boolean>("SuspendOnFailure")
const CaptureDefects = Context.GenericTag<boolean>("CaptureDefects")

export const EntityExtractionWorkflow = Workflow.make({
  name: "EntityExtraction",

  payload: Schema.Struct({
    text: Schema.String,
    ontologyId: Schema.String,
    requestId: Schema.String,
    options: Schema.optional(Schema.Struct({
      maxTokens: Schema.optional(Schema.Number),
      timeout: Schema.optional(Schema.Number)
    }))
  }),

  success: KnowledgeGraphSchema,
  error: ExtractionErrorSchema,

  // Deterministic execution ID for idempotency
  idempotencyKey: ({ text, ontologyId }) =>
    `extract-${md5(text).slice(0, 16)}-${ontologyId}`,

  // Retry suspended workflows
  suspendedRetrySchedule: Schedule.exponential("500 millis", 1.5).pipe(
    Schedule.union(Schedule.spaced("60 seconds"))
  ),

  // Enable fault tolerance annotations
  annotations: Context.empty().pipe(
    Context.add(SuspendOnFailure, true),
    Context.add(CaptureDefects, true)
  )
})

// Workflow implementation
export const EntityExtractionWorkflowLive = EntityExtractionWorkflow.toLayer(
  (payload, executionId) => Effect.gen(function*() {
    const journal = yield* EventJournalService
    yield* journal.append(payload.requestId, { type: "started", requestId: payload.requestId })

    // Stage 1: Preprocess
    const tokens = yield* Activities.PreprocessTextActivity.execute(payload.text)

    // Stage 2: Extract entities with timeout
    const timeoutDuration = Duration.minutes(payload.options?.timeout ?? 5)
    const entities = yield* DurableClock.sleep({
      name: "llm-timeout",
      duration: timeoutDuration
    }).pipe(
      Effect.race(
        Activities.ExtractEntitiesActivity.execute(payload.text, tokens)
      ),
      Effect.catchTag("TimeoutError", () =>
        Effect.fail({ _tag: "TimeoutError", message: "LLM extraction timed out" })
      )
    )

    yield* journal.append(payload.requestId, {
      type: "entities_extracted",
      count: entities.length
    })

    // Stage 3: Resolve entities
    const resolved = yield* Activities.ResolveEntitiesActivity.execute(
      entities,
      payload.ontologyId
    )

    // Stage 4: Extract relations
    const relations = yield* Activities.ExtractRelationsActivity.execute(
      payload.text,
      resolved
    )

    yield* journal.append(payload.requestId, {
      type: "relations_extracted",
      count: relations.length
    })

    // Stage 5: Persist result
    const result = { entities: resolved, relations }
    yield* Activities.PersistResultActivity.execute(result, payload.requestId)

    return result
  }).pipe(
    // Compensation on failure
    EntityExtractionWorkflow.withCompensation((result, cause) =>
      Effect.gen(function*() {
        const journal = yield* EventJournalService
        yield* journal.append(payload.requestId, {
          type: "failed",
          error: String(cause)
        })
        yield* Effect.logError("Extraction workflow failed", { cause, executionId })
      })
    )
  )
)
```

#### 3.4 Update RPC Handlers to Use Workflow

**File**: `src/Rpc/ExtractionHandlers.ts` (update)

```typescript
import { WorkflowEngine } from "@effect/workflow"
import { EntityExtractionWorkflow } from "../Workflow/EntityExtractionWorkflow.js"

export const ExtractionHandlersLive = ExtractionApi.toLayer({
  extract: (payload) => Effect.gen(function*() {
    const engine = yield* WorkflowEngine
    const requestId = uuidv7()

    // Execute workflow (idempotent - same input returns cached result)
    const result = yield* engine.execute(EntityExtractionWorkflow, {
      text: payload.text,
      ontologyId: payload.ontologyId,
      requestId,
      options: payload.options
    })

    return result
  }),

  streamExtract: (payload) => Stream.gen(function*() {
    const engine = yield* WorkflowEngine
    const journal = yield* EventJournalService
    const requestId = uuidv7()

    // Start workflow in background using scoped fork for cleanup
    const fiber = yield* Effect.forkScoped(
      engine.execute(EntityExtractionWorkflow, {
        text: payload.text,
        ontologyId: payload.ontologyId,
        requestId,
        options: payload.options
      })
    )

    // Stream events from journal
    yield* journal.streamEvents(requestId).pipe(
      Stream.takeUntil(e => e.type === "completed" || e.type === "failed")
    )
  }),

  getStatus: (payload) => Effect.gen(function*() {
    const engine = yield* WorkflowEngine
    const result = yield* engine.poll(
      EntityExtractionWorkflow,
      `extract-${md5(payload.text).slice(0, 16)}-${payload.ontologyId}`
    )

    if (result === undefined) return { status: "not_found" }
    if (result._tag === "Suspended") return { status: "suspended" }
    if (Exit.isSuccess(result.exit)) return { status: "complete", result: result.exit.value }
    return { status: "failed", error: result.exit.cause }
  })
})
```

### Validation

```bash
# Test workflow execution
bun run test:workflow

# Verify idempotency (same input returns cached result)
curl -X POST http://localhost:8080/api/rpc \
  -d '{"_tag":"extraction.extract","payload":{"text":"same text","ontologyId":"foaf"}}'
# Second call should return immediately from cache

# Test failure recovery
# 1. Start extraction
# 2. Kill server mid-extraction
# 3. Restart server
# 4. Workflow should resume from last checkpoint
```

---

## Phase 4: Cluster Layer (Optional)

**Goal**: Enable horizontal scaling with distributed entities.

### Tasks

#### 4.1 Add Cluster Dependencies

```bash
bun add @effect/cluster
```

#### 4.2 Define Cluster Entity

**File**: `src/Cluster/ExtractionEntity.ts`

```typescript
import { Entity, ClusterSchema, Sharding } from "@effect/cluster"
import { Rpc } from "@effect/rpc"

export const KnowledgeGraphExtractor = Entity.make(
  "KGExtractor",
  [
    Rpc.make("ExtractFromText", {
      payload: Schema.Struct({
        text: Schema.String,
        ontologyId: Schema.String,
        requestId: Schema.String
      }),
      primaryKey: ({ requestId }) => requestId,
      success: KnowledgeGraphSchema,
      error: ExtractionErrorSchema,
      stream: true
    }).annotate(ClusterSchema.Persisted, true),

    Rpc.make("GetCachedResult", {
      payload: Schema.Struct({ requestId: Schema.String }),
      success: Schema.Option(KnowledgeGraphSchema),
      error: Schema.Never
    })
  ]
)

// Entity implementation
export const KnowledgeGraphExtractorLive = KnowledgeGraphExtractor.toLayer(
  (envelope) => Effect.gen(function*() {
    return {
      ExtractFromText: (env) => Stream.gen(function*() {
        yield* { type: "started", requestId: env.payload.requestId }

        // Execute workflow for this entity
        const engine = yield* WorkflowEngine
        const result = yield* engine.execute(EntityExtractionWorkflow, {
          text: env.payload.text,
          ontologyId: env.payload.ontologyId,
          requestId: env.payload.requestId
        })

        yield* { type: "complete", result }
      }),

      GetCachedResult: (env) => Effect.gen(function*() {
        const cache = yield* ExtractionCacheService
        return yield* cache.get(env.payload.requestId)
      })
    }
  }),
  {
    maxIdleTime: Duration.minutes(5),
    concurrency: 1  // One extraction per entity at a time
  }
)
```

#### 4.3 Configure Sharding

**File**: `src/Cluster/ShardingConfig.ts`

```typescript
import { Sharding, MessageStorage, RunnerStorage } from "@effect/cluster"
import { SqlClient } from "@effect/sql"
import { Duration, Layer } from "effect"

// Sharding configuration
export const ShardingLive = Sharding.layer({
  numberOfShards: 8,
  rebalanceInterval: Duration.seconds(5),
  lockTtl: Duration.seconds(10)
})

// Message storage for durable delivery
export const MessageStorageLive = MessageStorage.layer.pipe(
  Layer.provideMerge(SqlClient.layer)
)

// Runner storage for shard coordination
export const RunnerStorageLive = RunnerStorage.layer.pipe(
  Layer.provideMerge(SqlClient.layer)
)

// Full cluster layer
export const ClusterLive = Layer.mergeAll(
  ShardingLive,
  KnowledgeGraphExtractorLive,
  MessageStorageLive,
  RunnerStorageLive
)
```

#### 4.4 Update RPC to Use Cluster

**File**: `src/Rpc/ExtractionHandlers.ts` (update for cluster)

```typescript
import { KnowledgeGraphExtractor } from "../Cluster/ExtractionEntity.js"

export const ExtractionHandlersLive = ExtractionApi.toLayer({
  extract: (payload) => Effect.gen(function*() {
    // Get client for entity
    const client = yield* KnowledgeGraphExtractor.client
    const requestId = uuidv7()

    // Route to entity (automatically sharded)
    const extractor = client(requestId)

    // Collect stream result
    const result = yield* extractor.ExtractFromText({
      text: payload.text,
      ontologyId: payload.ontologyId,
      requestId
    }).pipe(
      Stream.runLast,
      Effect.flatMap(Option.match({
        onNone: () => Effect.fail({ _tag: "NoResult", message: "No result from extractor" }),
        onSome: (event) => event.type === "complete"
          ? Effect.succeed(event.result)
          : Effect.fail({ _tag: "IncompleteResult", message: "Extraction incomplete" })
      }))
    )

    return result
  }),

  // ... rest of handlers
})
```

### Validation

```bash
# Start multiple runners
RUNNER_ID=0 bun run serve &
RUNNER_ID=1 bun run serve &
RUNNER_ID=2 bun run serve &

# Verify shard distribution
sqlite3 data/extraction.db "SELECT * FROM runner_shards"

# Test failover
# 1. Send extraction request
# 2. Kill one runner
# 3. Request should be rebalanced to another runner
```

---

## Phase 5: Production Hardening

### Tasks

#### 5.1 Add Metrics

```typescript
// Prometheus metrics for cluster health
const metrics = Metrics.make({
  extractionDuration: Metrics.timer("extraction_duration_seconds"),
  extractionCount: Metrics.counter("extraction_total"),
  cacheHitRate: Metrics.gauge("cache_hit_rate"),
  activeShards: Metrics.gauge("active_shards"),
  pendingMessages: Metrics.gauge("pending_messages")
})
```

#### 5.2 Add Health Checks

```typescript
// Deep health check including cluster
const deepHealthCheck = Effect.gen(function*() {
  const sql = yield* SqlClient.SqlClient
  const sharding = yield* Sharding.Sharding

  // Check SQL connectivity
  yield* sql.execute`SELECT 1`

  // Check shard health
  const shards = yield* sharding.getAssignedShards
  if (shards.length === 0) {
    return Effect.fail("No shards assigned")
  }

  return { status: "healthy", shards: shards.length }
})
```

#### 5.3 Add Circuit Breaker for LLM

```typescript
// Circuit breaker for LLM failures
const llmCircuitBreaker = CircuitBreaker.make({
  maxFailures: 5,
  resetTimeout: Duration.seconds(30),
  halfOpenRequests: 3
})

const safeLlmCall = <A>(effect: Effect<A>) =>
  llmCircuitBreaker.protect(effect).pipe(
    Effect.catchTag("CircuitOpen", () =>
      Effect.fail({ _tag: "ServiceUnavailable", message: "LLM temporarily unavailable" })
    )
  )
```

---

## Summary

| Phase | Complexity | Dependencies |
|-------|------------|--------------|
| 1. RPC Layer | Low | @effect/rpc |
| 2. Persistence | Medium | @effect/sql, @effect/experimental |
| 3. Workflow | Medium | @effect/workflow |
| 4. Cluster | High | @effect/cluster |
| 5. Production | Medium | Metrics, health checks |

**Recommended approach**: Implement phases 1-3 first for single-node durability, then add phase 4 when horizontal scaling is needed.
