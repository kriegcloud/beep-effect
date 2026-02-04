# Effect Distributed Architecture for @core-v2

> **⚠️ SUPERSEDED**: This document has been superseded by [effect-distributed-architecture-v2.md](./effect-distributed-architecture-v2.md) which provides an MVP-focused revision with simplified orchestration primitives.

## Executive Summary

This document synthesizes research from four Effect ecosystem areas to design an idiomatic distributed knowledge extraction architecture:

1. **Effect Cluster** - Actor-model entities with sharding
2. **Effect Persistence** - KeyValueStore, EventJournal, PersistedCache
3. **Effect Workflow** - Durable execution with activities
4. **Effect RPC** - Schema-based inter-service communication

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Browser/CLI)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                              │
│  │ WebSocket    │  │ HTTP Client  │  │ CLI Client   │                              │
│  │ RpcClient    │  │ RpcClient    │  │ RpcClient    │                              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                              │
└─────────┼─────────────────┼─────────────────┼───────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    RpcServer (HTTP + WebSocket Protocol)                     │   │
│  │  ExtractionApi.prefix("extraction.")                                         │   │
│  │  ├─ extract         → Effect<KnowledgeGraph, ExtractionError>                │   │
│  │  ├─ streamExtract   → Stream<ExtractionEvent, ExtractionError>               │   │
│  │  ├─ getStatus       → Effect<ExtractionStatus>                               │   │
│  │  └─ cancel          → Effect<void>                                           │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                             │
│                                        ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    Middleware Layer                                          │   │
│  │  AuthMiddleware → RateLimitMiddleware → TracingMiddleware                    │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATION LAYER (Workflow)                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    WorkflowEngine                                            │   │
│  │                                                                              │   │
│  │  EntityExtractionWorkflow                                                    │   │
│  │  ├─ idempotencyKey: hash(text, ontologyId)                                   │   │
│  │  ├─ suspendedRetrySchedule: exponential(500ms) ∪ spaced(60s)                 │   │
│  │  │                                                                           │   │
│  │  │  Activities:                                                              │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  │ Preprocess  │→│ ExtractLLM  │→│ Resolve     │→│ Persist     │      │   │
│  │  │  │ Activity    │  │ Activity    │  │ Activity    │  │ Activity    │      │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  │                                                                           │   │
│  │  └─ withCompensation: cleanup on failure                                     │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                             │
│  ┌─────────────────────────┐   ┌─────────────────────────┐                         │
│  │ DurableDeferred         │   │ DurableClock            │                         │
│  │ (external event await)  │   │ (long sleep > 60s)      │                         │
│  └─────────────────────────┘   └─────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           COMPUTE LAYER (Cluster)                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    Sharding Service                                          │   │
│  │  numberOfShards: 8 │ rebalanceInterval: 5s │ lockTtl: 10s                    │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                             │
│          ┌─────────────────────────────┼─────────────────────────────┐              │
│          ▼                             ▼                             ▼              │
│  ┌───────────────┐           ┌───────────────┐           ┌───────────────┐         │
│  │ Runner 0      │           │ Runner 1      │           │ Runner N      │         │
│  │ Shards: 0,1,2 │           │ Shards: 3,4,5 │           │ Shards: 6,7   │         │
│  │               │           │               │           │               │         │
│  │ ┌───────────┐ │           │ ┌───────────┐ │           │ ┌───────────┐ │         │
│  │ │Extractor  │ │           │ │Extractor  │ │           │ │Extractor  │ │         │
│  │ │Entity 001 │ │           │ │Entity 234 │ │           │ │Entity 567 │ │         │
│  │ ├───────────┤ │           │ ├───────────┤ │           │ ├───────────┤ │         │
│  │ │Extractor  │ │           │ │Extractor  │ │           │ │Extractor  │ │         │
│  │ │Entity 002 │ │           │ │Entity 235 │ │           │ │Entity 568 │ │         │
│  │ └───────────┘ │           │ └───────────┘ │           │ └───────────┘ │         │
│  └───────────────┘           └───────────────┘           └───────────────┘         │
│                                                                                      │
│  Entity: KnowledgeGraphExtractor                                                    │
│  ├─ Messages: ExtractFromText, GetCachedResult, StreamProgress                      │
│  ├─ State: extraction status, partial results, attempt count                        │
│  ├─ Options: maxIdleTime=5min, concurrency=1 (per entity)                           │
│  └─ Persistence: ClusterSchema.Persisted for durable delivery                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER (Business Logic)                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ EntityExtractor│  │ MentionExtract │  │ RelationExtract│  │ Grounder       │    │
│  │ Service        │  │ Service        │  │ Service        │  │ Service        │    │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘    │
│          │                   │                   │                   │              │
│          └───────────────────┴───────────────────┴───────────────────┘              │
│                                        │                                             │
│                                        ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    RateLimitedLanguageModel                                  │   │
│  │  LlmSemaphore: permits=5 │ Exponential backoff on 429                        │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                             │
│                    ┌───────────────────┼───────────────────┐                        │
│                    ▼                   ▼                   ▼                        │
│            ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│            │ Anthropic   │     │ OpenAI      │     │ Google      │                  │
│            │ LanguageModel│    │ LanguageModel│    │ LanguageModel│                 │
│            └─────────────┘     └─────────────┘     └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PERSISTENCE LAYER                                          │
│                                                                                      │
│  ┌────────────────────────────────────────────────┐                                 │
│  │           PersistedCache (Hybrid L1/L2)        │                                 │
│  │  ┌─────────────────────────────────────────┐   │                                 │
│  │  │ L1: In-Memory Cache                     │   │                                 │
│  │  │ capacity: 16 │ ttl: 2min                │   │                                 │
│  │  └─────────────────────────────────────────┘   │                                 │
│  │                      │                         │                                 │
│  │                      ▼                         │                                 │
│  │  ┌─────────────────────────────────────────┐   │                                 │
│  │  │ L2: Persistent Store                    │   │                                 │
│  │  │ success_ttl: 7d │ failure_ttl: 5min     │   │                                 │
│  │  └─────────────────────────────────────────┘   │                                 │
│  └────────────────────────────────────────────────┘                                 │
│                                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐            │
│  │ MessageStorage     │  │ RunnerStorage      │  │ EventJournal       │            │
│  │ (Cluster RPC msgs) │  │ (Shard locks)      │  │ (Audit trail)      │            │
│  │                    │  │                    │  │                    │            │
│  │ - Pending messages │  │ - Advisory locks   │  │ - UUID v7 ordering │            │
│  │ - Retry semantics  │  │ - Heartbeats       │  │ - Compaction       │            │
│  │ - Ack tracking     │  │ - Rebalancing      │  │ - Change streaming │            │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘            │
│                                        │                                             │
│                                        ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    SqlClient (Backing Store)                                 │   │
│  │  Transactions │ Nested Savepoints │ Connection Pool │ Retry on Conflict      │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                             │
│            ┌───────────────────────────┼───────────────────────────┐                │
│            ▼                           ▼                           ▼                │
│    ┌─────────────┐            ┌─────────────┐            ┌─────────────┐           │
│    │ SQLite      │            │ PostgreSQL  │            │ LibSQL      │           │
│    │ (Dev/Test)  │            │ (Production)│            │ (Edge)      │           │
│    └─────────────┘            └─────────────┘            └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           OBSERVABILITY LAYER                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                        │
│  │ TracingLive    │  │ MetricsLive    │  │ LoggingLive    │                        │
│  │ (OTLP→Jaeger)  │  │ (Prometheus)   │  │ (Structured)   │                        │
│  └────────────────┘  └────────────────┘  └────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. RPC Layer (API Gateway)

```typescript
// Schema-based RPC definitions
const ExtractRpc = Rpc.make("extract", {
  payload: {
    text: Schema.String,
    ontologyId: Schema.String,
    options: Schema.optional(ExtractionOptions)
  },
  success: KnowledgeGraphSchema,
  error: ExtractionErrorSchema,
  primaryKey: ({ text, ontologyId }) => `${hash(text)}-${ontologyId}`
})

const StreamExtractRpc = Rpc.make("streamExtract", {
  payload: { text: Schema.String, ontologyId: Schema.String },
  success: ExtractionEventSchema,
  error: ExtractionErrorSchema,
  stream: true  // Returns Stream<ExtractionEvent, Error>
})

// Group with namespace
const ExtractionApi = RpcGroup.make(
  ExtractRpc,
  StreamExtractRpc,
  GetStatusRpc,
  CancelRpc
).prefix("extraction.")

// Server with dual protocol
const rpcServerLayer = RpcServer.layerHttpRouter({
  group: ExtractionApi,
  path: "/api/rpc",
  protocols: ["http", "websocket"]  // HTTP for one-shot, WS for streaming
})
```

**Key Design Decisions:**
- **Schema-driven**: All payloads/responses validated via Effect Schema
- **Primary keys**: Enable deduplication and caching
- **Streaming**: Real-time progress via WebSocket
- **Middleware**: Auth, rate-limiting, tracing as composable layers

---

### 2. Workflow Layer (Orchestration)

```typescript
// Durable workflow with activity stages
const EntityExtractionWorkflow = Workflow.make({
  name: "EntityExtraction",
  payload: {
    text: Schema.String,
    ontologyId: Schema.String,
    requestId: Schema.String
  },
  success: KnowledgeGraphSchema,
  error: ExtractionErrorSchema,

  // Deterministic execution ID for idempotency
  idempotencyKey: ({ text, ontologyId }) =>
    `extract-${md5(text)}-${ontologyId}`,

  // Retry schedule for suspended workflows
  suspendedRetrySchedule: Schedule.exponential("500 millis", 1.5).pipe(
    Schedule.union(Schedule.spaced("60 seconds"))
  ),

  // Enable suspension on failure (saga pattern)
  annotations: Context.empty().pipe(
    Context.add(SuspendOnFailure, true),
    Context.add(CaptureDefects, true)
  )
})

// Implement with activities
const workflowLayer = EntityExtractionWorkflow.toLayer(
  (payload, executionId) => Effect.gen(function*() {
    // Stage 1: NLP Preprocessing (Activity - retryable)
    const tokens = yield* Activity.make({
      name: "PreprocessText",
      execute: preprocessText(payload.text),
      success: Schema.Array(Schema.String),
      interruptRetryPolicy: Schedule.exponential("100 millis", 1.5)
    }).execute

    // Stage 2: LLM Extraction with timeout (DurableClock)
    const extraction = yield* DurableClock.sleep({
      name: "llm-timeout",
      duration: Duration.minutes(5)
    }).pipe(
      Effect.race(
        Activity.make({
          name: "ExtractEntitiesLlm",
          execute: llmExtract(payload.text, tokens),
          success: ExtractionResultSchema
        }).execute
      )
    )

    // Stage 3: Entity Resolution (Activity)
    const resolved = yield* Activity.make({
      name: "ResolveEntities",
      execute: resolveEntities(extraction.entities, payload.ontologyId),
      success: Schema.Array(EntitySchema)
    }).execute

    // Stage 4: Persist to graph (Activity)
    yield* Activity.make({
      name: "PersistGraph",
      execute: persistGraph({
        entities: resolved,
        relations: extraction.relations
      }),
      success: Schema.Void
    }).execute

    return { entities: resolved, relations: extraction.relations }
  }).pipe(
    // Compensation: cleanup on failure
    EntityExtractionWorkflow.withCompensation(
      (result, cause) => Effect.logError(`Extraction failed: ${cause}`)
    )
  )
)
```

**Key Design Decisions:**
- **Activities**: Each stage is independently retryable and durable
- **DurableClock**: Handles long timeouts that survive process restarts
- **Idempotency**: Same input → same execution ID → cached result
- **Compensation**: Saga-pattern cleanup on failure

---

### 3. Cluster Layer (Distributed Compute)

```typescript
// Define entity with RPC protocol
const KnowledgeGraphExtractor = Entity.make(
  "KGExtractor",
  [
    Rpc.make("ExtractFromText", {
      payload: {
        text: Schema.String,
        ontologyId: Schema.String,
        requestId: Schema.String
      },
      primaryKey: ({ requestId }) => requestId,
      success: KnowledgeGraphSchema,
      error: ExtractionErrorSchema,
      stream: true  // Progress events
    }).annotate(ClusterSchema.Persisted, true),  // Durable delivery

    Rpc.make("GetCachedResult", {
      payload: { requestId: Schema.String },
      success: Schema.Option(KnowledgeGraphSchema),
      error: Schema.Never
    })
  ]
)

// Entity handler with state management
const extractorLayer = KnowledgeGraphExtractor.toLayer(
  (envelope) => Effect.gen(function*() {
    // Access entity state
    const state = yield* EntityState

    return {
      ExtractFromText: (env) => Stream.gen(function*() {
        yield* { type: "started", requestId: env.payload.requestId }

        const result = yield* extractKnowledgeGraph(
          env.payload.text,
          env.payload.ontologyId
        ).pipe(
          Effect.tap(partial =>
            Stream.emit({ type: "progress", ...partial })
          )
        )

        // Update entity state
        yield* state.set({ lastResult: result, status: "complete" })
        yield* { type: "complete", result }
      }),

      GetCachedResult: (env) => Effect.gen(function*() {
        const cached = yield* state.get
        return Option.fromNullable(cached?.lastResult)
      })
    }
  }),
  {
    maxIdleTime: Duration.minutes(5),  // Entity TTL
    concurrency: 1  // One extraction at a time per entity
  }
)

// Sharding configuration
const ShardingLive = Sharding.layer({
  numberOfShards: 8,
  rebalanceInterval: Duration.seconds(5),
  lockTtl: Duration.seconds(10)
})
```

**Key Design Decisions:**
- **Entity per extraction request**: Natural parallelism boundary
- **Stream responses**: Real-time progress to clients
- **Persisted messages**: At-least-once delivery for durability
- **Entity state**: Cache results for repeated queries
- **Sharding**: Automatic distribution across runners

---

### 4. Persistence Layer

```typescript
// Hybrid L1/L2 cache for extraction results
const extractionCache = yield* PersistedCache.make({
  storeId: "knowledge-graphs",

  // Lookup triggers extraction on miss
  lookup: (key: ExtractionKey) => extractKnowledgeGraph(key.text, key.ontologyId),

  // Different TTL based on success/failure
  timeToLive: (key, exit) => Exit.isSuccess(exit)
    ? Duration.days(7)     // Cache successful extractions for 7 days
    : Duration.minutes(5),  // Retry failures after 5 minutes

  // In-memory L1 cache
  inMemoryCapacity: 16,
  inMemoryTTL: Duration.minutes(2)
})

// Cluster message storage (for durable delivery)
const MessageStorageLive = MessageStorage.layer.pipe(
  Layer.provideMerge(SqlClient.layer)  // Postgres/SQLite backing
)

// Cluster runner storage (for shard locks)
const RunnerStorageLive = RunnerStorage.layer.pipe(
  Layer.provideMerge(SqlClient.layer)
)

// Event journal for audit trail
const eventJournal = yield* EventJournal.make({
  storeId: "extraction-events",
  idempotencyTtl: Duration.hours(1),
  compactionConfig: {
    maxEvents: 10000,
    compactAfter: Duration.hours(24)
  }
})

// SQL client with transactions
const SqlClientLive = SqlClient.layer({
  connectionString: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  statementTimeout: Duration.seconds(30)
})
```

**Key Design Decisions:**
- **PersistedCache**: Automatic L1/L2 with different TTLs for success/failure
- **MessageStorage**: Enables at-least-once delivery in Cluster
- **RunnerStorage**: Advisory locks for shard coordination
- **EventJournal**: Audit trail with UUID v7 ordering
- **SqlClient**: Transactional backing with connection pooling

---

## Layer Composition

```typescript
// Build layers bottom-up to preserve shared dependencies

// 1. Foundation: SQL backing store
const SqlClientLive = SqlClient.layer({
  connectionString: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 }
})

// 2. Persistence layers share SqlClient
const PersistenceLive = Layer.mergeAll(
  PersistedCache.layer,
  MessageStorage.layer,
  RunnerStorage.layer,
  EventJournal.layer
).pipe(Layer.provideMerge(SqlClientLive))

// 3. LLM providers (only one active based on config)
const LlmProviderLive = makeLanguageModelLayer.pipe(
  Layer.provideMerge(ConfigService.Default)
)

// 4. Services depend on LLM
const ServicesLive = Layer.mergeAll(
  EntityExtractor.Default,
  MentionExtractor.Default,
  RelationExtractor.Default,
  Grounder.Default,
  RateLimitedLanguageModel.layer
).pipe(Layer.provideMerge(LlmProviderLive))

// 5. Cluster depends on persistence
const ClusterLive = Layer.mergeAll(
  ShardingLive,
  KnowledgeGraphExtractor.layer
).pipe(
  Layer.provideMerge(PersistenceLive),
  Layer.provideMerge(ServicesLive)
)

// 6. Workflow depends on cluster and services
const WorkflowLive = Layer.mergeAll(
  WorkflowEngine.layer,
  EntityExtractionWorkflow.layer
).pipe(
  Layer.provideMerge(ClusterLive)
)

// 7. API gateway depends on workflow
const ApiGatewayLive = Layer.mergeAll(
  RpcServer.layerHttpRouter({ group: ExtractionApi, path: "/api/rpc" }),
  HttpServer.layer({ port: 8080 })
).pipe(
  Layer.provideMerge(WorkflowLive)
)

// 8. Observability is cross-cutting (merge, don't nest)
const ObservabilityLive = Layer.mergeAll(
  TracingLive,
  MetricsLive,
  LoggingLive
)

// Full production stack: merge top-level concerns
const ProductionStack = Layer.mergeAll(
  ApiGatewayLive,
  ObservabilityLive
).pipe(
  Layer.provideMerge(BunContext.layer)
)

// Start server
BunRuntime.runMain(
  Layer.launch(ProductionStack).pipe(
    Effect.catchAllCause(cause =>
      Effect.logError("Server failed", cause)
    )
  )
)
```

**Layer Composition Rules:**
1. Use `Layer.mergeAll` for sibling layers at same level
2. Use `Layer.provideMerge` when providing dependencies to preserve sharing
3. Build bottom-up: foundation → persistence → services → cluster → workflow → API
4. Observability is cross-cutting - merge at the top level

---

## Data Flow: Extraction Request

```
1. Client sends RPC request via WebSocket
   └─ { tag: "extraction.extract", payload: { text, ontologyId } }

2. RpcServer validates schema, applies middleware
   └─ Auth → RateLimit → Tracing → Route to handler

3. Handler submits to Workflow
   └─ WorkflowEngine.execute(EntityExtractionWorkflow, payload)

4. Workflow checks idempotency
   └─ hash(text, ontologyId) → lookup in WorkflowEngine.activityResults
   └─ If found: return cached Exit
   └─ If not: proceed with execution

5. Workflow executes Activities
   ├─ PreprocessText: NLP tokenization (local)
   ├─ ExtractEntitiesLlm: LLM call (rate-limited, retryable)
   ├─ ResolveEntities: Entity resolution (local)
   └─ PersistGraph: Store to PersistedCache

6. Each Activity persists result
   └─ Activity.wrapActivityResult() → WorkflowEngine.activityExecute()
   └─ Results stored in BackingPersistence

7. On completion, Workflow returns result
   └─ Exit.succeed(KnowledgeGraph) or Exit.fail(Error)

8. RpcServer streams response to client
   └─ If streaming: emit progress events
   └─ Final: emit Exit result

9. On failure, Workflow suspends
   └─ WorkflowEngine.scheduleSuspendedRetry()
   └─ Compensation handler runs cleanup
```

---

## Failure Scenarios

### LLM Rate Limit (429)

```
1. ExtractEntitiesLlm Activity receives 429
2. LlmSemaphore blocks further requests
3. Exponential backoff via Schedule.exponential
4. Activity retries automatically (interruptRetryPolicy)
5. After max retries, Activity fails
6. Workflow suspends with SuspendOnFailure
7. WorkflowEngine schedules retry after 60s
8. Client receives Suspended status
9. Client can poll for completion
```

### Node Crash (Runner Failure)

```
1. Runner crashes mid-extraction
2. Heartbeat to RunnerStorage stops
3. Lock TTL expires (10s)
4. Sharding service detects orphaned shard
5. Rebalancing assigns shard to healthy runner
6. MessageStorage.poll() retrieves pending messages
7. New runner processes message (at-least-once)
8. Workflow resumes from last checkpoint
9. Activities with cached results skip re-execution
```

### Network Partition

```
1. Client connection drops
2. RpcServer tracks clientId in disconnects Mailbox
3. Fiber continues execution on server
4. Result stored in PersistedCache
5. Client reconnects, calls GetCachedResult
6. Entity returns cached result from state
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test workflow logic with mocked activities
const TestWorkflow = EntityExtractionWorkflow.layer.pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      Activity.layer("PreprocessText", () => Effect.succeed(["token1"])),
      Activity.layer("ExtractEntitiesLlm", () => Effect.succeed(mockExtraction)),
      Activity.layer("ResolveEntities", () => Effect.succeed(mockEntities)),
      Activity.layer("PersistGraph", () => Effect.succeed(undefined))
    )
  ),
  Layer.provideMerge(WorkflowEngine.Test)  // In-memory workflow engine
)
```

### Integration Tests

```typescript
// Test cluster with local sharding
const TestCluster = KnowledgeGraphExtractor.layer.pipe(
  Layer.provideMerge(Sharding.local()),  // Single-node cluster
  Layer.provideMerge(MessageStorage.layerMemory),
  Layer.provideMerge(RunnerStorage.layerMemory)
)
```

### End-to-End Tests

```typescript
// Test RPC with real HTTP
const TestRpc = RpcTest.makeClient(ExtractionApi).pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      TestWorkflow,
      TestCluster,
      PersistedCache.Test,
      LlmService.Test
    )
  )
)
```

---

## Migration Path

### Phase 1: RPC Layer (Current)
- [x] HTTP server with health checks
- [x] Rate-limited LLM
- [ ] Add RpcServer with schema validation
- [ ] Add middleware (auth, tracing)

### Phase 2: Persistence Layer
- [ ] Add PersistedCache for extraction results
- [ ] Add EventJournal for audit trail
- [ ] Add SqlClient backing store

### Phase 3: Workflow Layer
- [ ] Define EntityExtractionWorkflow
- [ ] Implement activities for each stage
- [ ] Add idempotency and compensation

### Phase 4: Cluster Layer
- [ ] Define KnowledgeGraphExtractor entity
- [ ] Add MessageStorage and RunnerStorage
- [ ] Configure sharding for horizontal scaling

### Phase 5: Multi-Node Deployment
- [ ] Deploy multiple runners with shared database
- [ ] Configure shard rebalancing
- [ ] Add metrics for cluster health

---

## Package Dependencies

```json
{
  "dependencies": {
    // Core
    "effect": "^3.19.6",

    // RPC
    "@effect/rpc": "^0.x.x",

    // Workflow
    "@effect/workflow": "^0.x.x",

    // Cluster
    "@effect/cluster": "^0.x.x",

    // Persistence
    "@effect/experimental": "^0.57.4",
    "@effect/sql": "^0.x.x",
    "@effect/sql-sqlite-bun": "^0.x.x",
    "@effect/sql-pg": "^0.x.x",

    // Platform
    "@effect/platform": "^0.93.3",
    "@effect/platform-bun": "^0.84.0",

    // AI
    "@effect/ai": "^0.32.1",
    "@effect/ai-anthropic": "^0.22.0",
    "@effect/ai-openai": "^0.35.0",
    "@effect/ai-google": "^0.11.0",

    // Observability
    "@effect/opentelemetry": "^0.59.1"
  }
}
```

---

## References

- Effect Cluster: `docs/effect-source/cluster/src/`
- Effect Workflow: `docs/effect-source/workflow/src/`
- Effect RPC: `docs/effect-source/rpc/src/`
- Effect Experimental: `docs/effect-source/experimental/src/`
- Effect SQL: `docs/effect-source/sql/src/`
