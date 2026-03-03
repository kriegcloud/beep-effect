# Effect Distributed Architecture for @core-v2 (Revised)

## Revision Summary

This document addresses architectural gaps identified in v1 review:

| Issue | Resolution |
|-------|------------|
| Parallel reliability stacks (Workflow + Cluster) | **Cluster only for MVP**; Workflow deferred to Phase 2 |
| Inconsistent identity across layers | **Unified idempotency key** with ontology version |
| Progress streaming undefined | **17-event schema** with backpressure policy |
| Overbuilt persistence | **2 surfaces only**: FileSystem results + embedded audit |
| No LLM budgeting | **4 services**: TokenBudget, StageTimeout, RateLimiter, Supervisor |

---

## Architecture Principles (MVP)

1. **One orchestration primitive**: Cluster entities (not Workflow)
2. **One identity**: `sha256(text + ontologyId + ontologyVersion + paramsHash)`
3. **One result store**: FileSystem-based ExtractionRun
4. **One audit trail**: Events embedded in metadata.json
5. **Explicit LLM control**: Per-stage timeouts, per-request budgets

---

## High-Level Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ WebSocket RpcClient                                                          │   │
│  │ Receives: Stream<ExtractionProgressEvent>                                    │   │
│  │ Sends: extraction.streamExtract { text, ontologyId }                         │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ RpcServer (WebSocket Protocol)                                               │   │
│  │                                                                              │   │
│  │ ExtractionApi.prefix("extraction.")                                          │   │
│  │ ├─ streamExtract → Stream<ExtractionProgressEvent>                           │   │
│  │ ├─ getResult     → Effect<KnowledgeGraph | null>                             │   │
│  │ └─ cancel        → Effect<void>                                              │   │
│  │                                                                              │   │
│  │ Backpressure: drop_oldest after 1000 events, 10% sampling when slow          │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CLUSTER LAYER (Single Orchestrator)                        │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ Entity: KnowledgeGraphExtractor                                              │   │
│  │                                                                              │   │
│  │ EntityId = idempotencyKey (unified across all layers)                        │   │
│  │                                                                              │   │
│  │ Rpcs:                                                                        │   │
│  │ ├─ ExtractFromText (stream: true, persisted: true)                           │   │
│  │ │   Returns: Stream<ExtractionProgressEvent>                                 │   │
│  │ └─ GetCachedResult                                                           │   │
│  │     Returns: Effect<Option<KnowledgeGraph>>                                  │   │
│  │                                                                              │   │
│  │ State:                                                                       │   │
│  │ ├─ status: "pending" | "running" | "complete" | "failed"                     │   │
│  │ ├─ lastResult: KnowledgeGraph | null                                         │   │
│  │ └─ lastError: ExtractionError | null                                         │   │
│  │                                                                              │   │
│  │ Options: maxIdleTime=5min, concurrency=1 (per entity)                        │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  Sharding: numberOfShards=8                                                         │
│  Recovery: MessageStorage for at-least-once delivery                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           LLM CONTROL LAYER (New)                                    │
│                                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │ RequestSuper-   │  │ TokenBudget     │  │ StageTimeout    │  │ CentralRate    │ │
│  │ visor           │  │ Service         │  │ Service         │  │ Limiter        │ │
│  │                 │  │                 │  │                 │  │                │ │
│  │ Coordinates all │  │ 4096 tokens/req │  │ Per-stage:      │  │ 50 req/min     │ │
│  │ 4 services      │  │ Entity: 35%     │  │ - Chunk: 5s     │  │ 100k tokens/m  │ │
│  │                 │  │ Relation: 35%   │  │ - Entity: 60s   │  │ 5 concurrent   │ │
│  │ Returns partial │  │ Ground: 15%     │  │ - Relation: 60s │  │                │ │
│  │ results on fail │  │ Scope: 8%       │  │ - Ground: 30s   │  │ Circuit break  │ │
│  │                 │  │ Buffer: 7%      │  │ - Serialize: 10s│  │ after 5 fails  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ EntityExtractor│  │ RelationExtract│  │ Grounder       │  │ NlpService     │    │
│  │ (LLM Stage 1)  │  │ (LLM Stage 2)  │  │ (LLM Stage 3)  │  │ (Local)        │    │
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                                      │
│  All LLM calls go through: TokenBudget → RateLimiter → StageTimeout                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PERSISTENCE LAYER (Minimal)                                │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ ExtractionRunService (FileSystem-based)                                      │   │
│  │                                                                              │   │
│  │ Directory: ./runs/{idempotencyKey}/                                          │   │
│  │ ├─ metadata.json     (status, config, audit events, timing)                  │   │
│  │ ├─ entities.json     (extracted entities)                                    │   │
│  │ ├─ relations.json    (extracted relations)                                   │   │
│  │ └─ graph.ttl         (RDF serialization)                                     │   │
│  │                                                                              │   │
│  │ Audit events embedded in metadata.json (no separate EventJournal)            │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌────────────────────────────────────────┐                                         │
│  │ In-Memory Cache (L1 only for MVP)      │                                         │
│  │ capacity: 16, ttl: 2min                │                                         │
│  │ Invalidation: on ontology version change                                         │   │
│  └────────────────────────────────────────┘                                         │
│                                                                                      │
│  DEFERRED to Phase 2:                                                               │
│  - SQL database                                                                     │
│  - PersistedCache L2                                                                │
│  - EventJournal                                                                     │
│  - Cross-document queries                                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Unified Idempotency Key

### The Problem (v1)

```
RPC primaryKey:       hash(text + ontologyId)
Workflow idempotency: hash(text + ontologyId)
Cluster entity key:   requestId (UUID)
                      ↑ DIFFERENT!
```

Client resubmission with new `requestId` bypassed cache and double-ran extraction.

### The Solution (v2)

**One key formula used everywhere:**

```typescript
type IdempotencyKey = string  // sha256 hash

const computeIdempotencyKey = (
  text: string,
  ontologyId: string,
  ontologyVersion: string,  // Content-based hash of ontology
  params: ExtractionParams
): IdempotencyKey => {
  const normalized = normalizeText(text)  // Trim, lowercase, collapse whitespace
  const paramsHash = hashParams(params)   // Sort keys, stable stringify

  return sha256(`${normalized}|${ontologyId}|${ontologyVersion}|${paramsHash}`)
}

// Ontology version = hash of ontology content (not URL)
const computeOntologyVersion = (ontology: Ontology): string => {
  const content = serializeOntology(ontology)  // Deterministic serialization
  return sha256(content).slice(0, 16)          // 16-char hash
}
```

### Key Flow

```
CLIENT                    RPC                      ENTITY                   CACHE
   │                       │                         │                        │
   │ { text, ontologyId }  │                         │                        │
   ├──────────────────────>│                         │                        │
   │                       │ compute idempotencyKey  │                        │
   │                       │ (includes ontologyVer)  │                        │
   │                       ├────────────────────────>│                        │
   │                       │                         │ check cache            │
   │                       │                         ├───────────────────────>│
   │                       │                         │<───────────────────────┤
   │                       │                         │                        │
   │                       │                         │ if miss: extract       │
   │                       │                         │ if hit: return cached  │
```

### Cache Invalidation

```typescript
// When ontology changes:
const onOntologyUpdate = (ontologyId: string) => Effect.gen(function*() {
  // Compute new ontology version
  const newVersion = yield* computeOntologyVersion(ontology)

  // New idempotency keys will automatically differ
  // Old cache entries naturally expire (7d TTL)
  // No explicit invalidation needed

  // Optional: Log for observability
  yield* Effect.logInfo("Ontology updated", { ontologyId, newVersion })
})
```

---

## 2. Progress Streaming Contract

### Event Schema (17 Types)

```typescript
import { Schema } from "effect"

// Base event structure
const ProgressEventBase = Schema.Struct({
  eventId: Schema.String,           // UUID v7
  requestId: Schema.String,         // Idempotency key
  timestamp: Schema.DateFromNumber,
  sequenceNumber: Schema.Number     // For ordering
})

// Event types (discriminated union)
export const ExtractionProgressEvent = Schema.Union(
  // Lifecycle events
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("extraction_started"),
    totalChunks: Schema.optional(Schema.Number)
  }),
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("extraction_completed"),
    summary: Schema.Struct({
      entityCount: Schema.Number,
      relationCount: Schema.Number,
      durationMs: Schema.Number
    })
  }),
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("extraction_failed"),
    error: Schema.Struct({
      code: Schema.String,
      message: Schema.String,
      recoverable: Schema.Boolean,
      retryAfterMs: Schema.optional(Schema.Number)
    }),
    partialResult: Schema.optional(KnowledgeGraphSchema)
  }),
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("extraction_cancelled"),
    reason: Schema.String,
    partialResult: Schema.optional(KnowledgeGraphSchema)
  }),

  // Stage progress events
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("stage_started"),
    stage: Schema.Literal("chunking", "entity_extraction", "relation_extraction", "grounding", "serialization"),
    estimatedDurationMs: Schema.optional(Schema.Number)
  }),
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("stage_progress"),
    stage: Schema.String,
    percent: Schema.Number,  // 0-100
    itemsProcessed: Schema.Number,
    itemsTotal: Schema.Number
  }),
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("stage_completed"),
    stage: Schema.String,
    durationMs: Schema.Number,
    itemCount: Schema.Number
  }),

  // Discovery events (incremental results)
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("entity_found"),
    entity: EntitySchema,
    confidence: Schema.Number
  }),
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("relation_found"),
    relation: RelationSchema,
    confidence: Schema.Number
  }),

  // LLM control events
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("rate_limited"),
    waitMs: Schema.Number,
    reason: Schema.Literal("tokens", "requests", "concurrent")
  }),
  Schema.Struct({
    ...ProgressEventBase.fields,
    type: Schema.Literal("budget_warning"),
    tokensUsed: Schema.Number,
    tokensRemaining: Schema.Number,
    stage: Schema.String
  })
)
```

### Backpressure Policy

```typescript
const BackpressureConfig = {
  // Queue limits
  maxQueuedEvents: 1000,

  // When queue exceeds 80% capacity
  samplingThreshold: 0.8,
  samplingRate: 0.1,  // Keep 10% of discovery events

  // Events that are NEVER sampled (always delivered)
  criticalEvents: [
    "extraction_started",
    "extraction_completed",
    "extraction_failed",
    "extraction_cancelled",
    "stage_started",
    "stage_completed"
  ],

  // Strategy when queue is full
  overflowStrategy: "drop_oldest" as const,  // vs "drop_newest" | "block" | "close"

  // Client slow detection
  slowClientThresholdMs: 5000,  // If ack takes > 5s
  slowClientAction: "sample" as const  // vs "disconnect" | "buffer"
}
```

### Client-Side Handling

```typescript
// Browser client example
const handleExtractionStream = async (text: string, ontologyId: string) => {
  const client = await RpcClient.connect("ws://api.example.com/rpc")

  let lastSequence = -1
  const partialEntities: Entity[] = []
  const partialRelations: Relation[] = []

  await client.streamExtract({ text, ontologyId }).pipe(
    Stream.tap(event => {
      // Detect missed events
      if (event.sequenceNumber !== lastSequence + 1) {
        console.warn(`Missed events: ${lastSequence + 1} to ${event.sequenceNumber - 1}`)
      }
      lastSequence = event.sequenceNumber

      // Handle by type
      switch (event.type) {
        case "entity_found":
          partialEntities.push(event.entity)
          updateUI({ entities: partialEntities })
          break

        case "extraction_failed":
          if (event.partialResult) {
            // Use partial result
            updateUI(event.partialResult)
          }
          showError(event.error)
          break

        case "extraction_completed":
          showSuccess(event.summary)
          break
      }
    }),
    Stream.runDrain
  )
}
```

---

## 3. LLM Control Strategy

### Stage Timeout Configuration

| Stage | Timeout | Soft Warning | Escalation |
|-------|---------|--------------|------------|
| Chunking | 5s | 3s | Skip large chunks |
| Entity Extraction | 60s | 45s | Reduce scope, retry |
| Relation Extraction | 60s | 45s | Skip low-confidence |
| Grounding | 30s | 20s | Accept unverified |
| Serialization | 10s | 7s | Use simplified format |

### Token Budget Allocation

```
Total per request: 4096 tokens

┌─────────────────────────────────────────────┐
│ Entity Extraction     │ 1440 (35%)          │
├─────────────────────────────────────────────┤
│ Relation Extraction   │ 1440 (35%)          │
├─────────────────────────────────────────────┤
│ Grounding             │  615 (15%)          │
├─────────────────────────────────────────────┤
│ Property Scoping      │  328 (8%)           │
├─────────────────────────────────────────────┤
│ Buffer/Other          │  273 (7%)           │
└─────────────────────────────────────────────┘

Overflow policy: Entity extraction can borrow from buffer
```

### Central Rate Limiter

```typescript
const RateLimiterConfig = {
  // Anthropic limits
  requestsPerMinute: 50,
  tokensPerMinute: 100_000,

  // Our limits (conservative)
  maxConcurrent: 5,

  // Circuit breaker
  failureThreshold: 5,         // Open after 5 failures
  recoveryTimeout: "2 minutes", // Try half-open after 2min
  successThreshold: 2          // Close after 2 successes in half-open
}
```

### Partial Result Policy

```
Timeout/Failure Escalation:

1. Entity Extraction fails
   └─> Return PARTIAL_ENTITY_ONLY (entities extracted so far)

2. Relation Extraction fails
   └─> Return PARTIAL_EARLY_EXIT (entities complete, partial relations)

3. Grounding fails
   └─> Return COMPLETE with unverified flag (all data, unverified)

4. Full pipeline timeout
   └─> Return best partial result + error details

Result types:
- COMPLETE: All stages succeeded
- PARTIAL_ENTITY_ONLY: Entities only, no relations
- PARTIAL_EARLY_EXIT: Entities + some relations
- FALLBACK_CACHE: Used cached result due to repeated failures
- EMPTY: No usable data extracted
```

---

## 4. Minimal Persistence Surface

### MVP Schema (2 Surfaces Only)

**Surface 1: ExtractionRun (FileSystem)**

```
./runs/{idempotencyKey}/
├─ metadata.json      # Status, config, timing, audit events
├─ entities.json      # Extracted entities
├─ relations.json     # Extracted relations
└─ graph.ttl          # RDF output
```

**Surface 2: Audit Events (Embedded in metadata.json)**

```typescript
interface ExtractionMetadata {
  // Identity
  idempotencyKey: string
  requestId: string

  // Status
  status: "pending" | "running" | "complete" | "failed" | "partial"

  // Config
  ontologyId: string
  ontologyVersion: string
  params: ExtractionParams

  // Results summary
  entityCount: number
  relationCount: number

  // Timing
  startedAt: string
  completedAt: string | null
  durationMs: number | null

  // Audit trail (embedded, not separate store)
  events: AuditEvent[]
  errors: AuditError[]
}

interface AuditEvent {
  timestamp: string
  type: "started" | "stage_began" | "stage_completed" | "entity_extracted" | "completed"
  data?: Record<string, unknown>
}

interface AuditError {
  timestamp: string
  type: "timeout" | "llm_error" | "validation_error" | "cancelled"
  message: string
  context?: Record<string, unknown>
}
```

### What's Deferred

| Component | Deferred To | Reason |
|-----------|-------------|--------|
| SQL database | Phase 2 | Not needed for single-document queries |
| PersistedCache L2 | Phase 2 | FileSystem sufficient for MVP |
| EventJournal | Phase 2 | Embedded events in metadata.json |
| MessageStorage | Phase 2 | Only needed for multi-node cluster |
| RunnerStorage | Phase 2 | Only needed for multi-node cluster |
| Cross-document queries | Phase 2 | MVP is single-document focused |

---

## 5. Layer Composition (Simplified)

```typescript
// MVP Layer Stack - Bottom up

// 1. Platform layer
const PlatformLive = BunContext.layer

// 2. LLM provider (one at a time)
const LlmProviderLive = makeLanguageModelLayer.pipe(
  Layer.provideMerge(ConfigService.Default)
)

// 3. LLM control services
const LlmControlLive = Layer.mergeAll(
  TokenBudgetService.Default,
  StageTimeoutService.Default,
  CentralRateLimiterService.Default,
  RequestSupervisorService.Default
).pipe(Layer.provideMerge(LlmProviderLive))

// 4. Extraction services (use LLM control)
const ExtractionServicesLive = Layer.mergeAll(
  EntityExtractor.Default,
  RelationExtractor.Default,
  Grounder.Default,
  NlpService.Default
).pipe(Layer.provideMerge(LlmControlLive))

// 5. Persistence (FileSystem only for MVP)
const PersistenceLive = ExtractionRunService.Default

// 6. Cluster entity (single orchestrator)
const ClusterLive = Layer.mergeAll(
  KnowledgeGraphExtractor.layer,
  Sharding.local()  // Single-node for MVP
).pipe(
  Layer.provideMerge(ExtractionServicesLive),
  Layer.provideMerge(PersistenceLive)
)

// 7. RPC server
const RpcServerLive = RpcServer.layerWebSocket({
  group: ExtractionApi,
  path: "/api/rpc"
}).pipe(Layer.provideMerge(ClusterLive))

// 8. HTTP server with health checks
const HttpServerLive = Layer.mergeAll(
  HttpServer.layer({ port: 8080 }),
  HealthCheckService.Default,
  RpcServerLive
).pipe(Layer.provideMerge(PlatformLive))

// Start
BunRuntime.runMain(Layer.launch(HttpServerLive))
```

---

## 6. Data Flow (Revised)

```
1. Client sends WebSocket RPC
   └─ { tag: "extraction.streamExtract", payload: { text, ontologyId } }

2. RpcServer computes idempotencyKey
   └─ key = sha256(normalize(text) + ontologyId + ontologyVersion + paramsHash)

3. RpcServer routes to Cluster Entity
   └─ EntityId = idempotencyKey (same key everywhere)

4. Entity checks state
   └─ If complete: return cached Stream of [completed event]
   └─ If running: attach to existing stream
   └─ If pending: start extraction

5. Entity runs extraction through RequestSupervisor
   └─ Supervisor coordinates: TokenBudget → RateLimiter → StageTimeout

6. Each stage emits progress events
   └─ EntityExtractor → "entity_found" events
   └─ RelationExtractor → "relation_found" events
   └─ All stages → "stage_started", "stage_completed"

7. Events flow through backpressure handler
   └─ Critical events: always delivered
   └─ Discovery events: sampled at 10% if client slow
   └─ Queue full: drop_oldest strategy

8. Results persisted to FileSystem
   └─ ./runs/{idempotencyKey}/metadata.json (with embedded audit)
   └─ ./runs/{idempotencyKey}/entities.json
   └─ ./runs/{idempotencyKey}/relations.json

9. Client receives stream of events
   └─ Last event: extraction_completed or extraction_failed
   └─ Partial results included in failure events
```

---

## 7. Failure Scenarios (Revised)

### LLM Rate Limit (429)

```
1. CentralRateLimiter detects 429 response
2. Increment failure count in circuit breaker
3. Emit "rate_limited" event to client stream
4. Wait backoff period (exponential)
5. Retry within stage timeout
6. If stage timeout exceeded:
   └─ Emit "stage_completed" with partial results
   └─ Continue to next stage with what we have
7. If circuit breaker opens (5 failures):
   └─ Emit "extraction_failed" with FALLBACK_CACHE
   └─ Return last successful result for this key if available
```

### Stage Timeout

```
1. StageTimeoutService wraps stage execution
2. Soft timeout (45s for entity extraction):
   └─ Emit "budget_warning" event
   └─ Reduce scope (fewer chunks, simpler prompts)
   └─ Continue
3. Hard timeout (60s):
   └─ Emit "stage_completed" with items extracted so far
   └─ Move to next stage
4. All results persist even on timeout
```

### Client Disconnect

```
1. RpcServer detects WebSocket close
2. Entity continues extraction (fire-and-forget)
3. Results persist to FileSystem
4. Client reconnects:
   └─ Call getResult with same text/ontologyId
   └─ Same idempotencyKey → find completed run
   └─ Return cached result
```

---

## 8. Implementation Phases (Revised)

### Phase 1: MVP (2 weeks)

**Week 1: Core Infrastructure**
- [ ] Unified idempotency key implementation
- [ ] ExtractionRunService (FileSystem persistence)
- [ ] TokenBudgetService + StageTimeoutService
- [ ] CentralRateLimiterService

**Week 2: Integration**
- [ ] KnowledgeGraphExtractor entity
- [ ] Progress event streaming
- [ ] Backpressure handling
- [ ] RPC WebSocket endpoint
- [ ] Basic health checks

**Deliverable**: Single-node extraction service with progress streaming

### Phase 2: Resilience (2 weeks)

- [ ] Circuit breaker refinement
- [ ] Partial result handling
- [ ] RequestSupervisorService
- [ ] SQL persistence for cross-document queries
- [ ] PersistedCache L2

### Phase 3: Scale (2 weeks)

- [ ] Multi-node cluster (MessageStorage, RunnerStorage)
- [ ] Shard rebalancing
- [ ] Distributed rate limiting
- [ ] Metrics and alerting

### Phase 4: Advanced (Deferred)

- [ ] Workflow layer for multi-stage orchestration
- [ ] Human-in-the-loop approvals
- [ ] Compensation/rollback logic

---

## 9. Package Dependencies (Minimal MVP)

```json
{
  "dependencies": {
    // Core
    "effect": "^3.19.6",

    // RPC (one package)
    "@effect/rpc": "^0.x.x",

    // Cluster (local mode only for MVP)
    "@effect/cluster": "^0.x.x",

    // Platform (FileSystem, HTTP)
    "@effect/platform": "^0.93.3",
    "@effect/platform-bun": "^0.84.0",

    // AI (one provider initially)
    "@effect/ai": "^0.32.1",
    "@effect/ai-anthropic": "^0.22.0",

    // Observability
    "@effect/opentelemetry": "^0.59.1"
  }
}
```

**Deferred dependencies:**
- `@effect/workflow` → Phase 4
- `@effect/sql`, `@effect/sql-sqlite-bun` → Phase 2
- `@effect/ai-openai`, `@effect/ai-google` → As needed

---

## 10. Success Criteria

### MVP (Phase 1)

- [ ] Single extraction completes in < 5 minutes
- [ ] Progress events stream to client in real-time
- [ ] Same text+ontology returns cached result (idempotent)
- [ ] Partial results returned on stage timeout
- [ ] 5 concurrent extractions supported
- [ ] < 2% timeout rate under normal load

### Production (Phase 2+)

- [ ] 99%+ request success rate
- [ ] < 0.1% hard timeout rate
- [ ] 0 circuit breaker trips per week
- [ ] 300+ documents/hour throughput
- [ ] Cross-document queries supported

---

## References

- Idempotency design: `docs/idempotency-design.md`
- Progress streaming: `docs/progress-streaming-contract.md`
- LLM control: `docs/llm-control-strategy.md`
- MVP persistence: `docs/mvp-persistence-surface.md`
