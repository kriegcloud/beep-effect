# Capability Categories

> Functional groupings of effect-ontology capabilities with integration points.

---

## Category 1: Core Domain

**Description**: Foundational types, schemas, errors, and value objects that define the domain model.

**Why It Matters**: Provides type safety and consistency across all services.

### Files

| File | Purpose |
|------|---------|
| Domain/Error/*.ts | Typed error definitions |
| Domain/Model/*.ts | Domain entity models |
| Domain/Rdf/*.ts | RDF constants and IRI utilities |
| Domain/Schema/*.ts | API request/response schemas |

### Key Services/Classes

- Error types: RdfError, LlmError, OntologyError, ExtractionError, WorkflowError, ShaclError
- Models: Entity, Ontology, BatchWorkflow, EntityResolution
- Schemas: BatchRequest, BatchStatusResponse, Batch

### Integration Points

- Consumed by all other categories
- Errors used in service failure types
- Models used in persistence and RPC

---

## Category 2: Extraction Pipeline

**Description**: Text processing, LLM-powered extraction, and knowledge graph construction.

**Why It Matters**: Core value proposition - converting unstructured text to structured knowledge.

### Files

| File | Purpose |
|------|---------|
| Service/EntityExtractor.ts | LLM entity extraction |
| Service/RelationExtractor.ts | LLM relation extraction |
| Service/Grounder.ts | Entity grounding/linking |
| Workflow/StreamingExtraction.ts | Composable extraction workflow |

### Key Services/Classes

- EntityExtractor - Extract entities with types and confidence
- RelationExtractor - Extract relationships between entities
- Grounder - Verify and link entities to knowledge bases
- StreamingExtraction - Coordinated extraction pipeline

### Integration Points

- Uses: LlmControl services, NlpService, OntologyService
- Produces: Entities, Relations → RdfBuilder
- Consumed by: ExtractionEntityHandler, Workflows

---

## Category 3: Entity Resolution

**Description**: Clustering and deduplication of extracted entities.

**Why It Matters**: Prevents duplicate entities from polluting the knowledge graph.

### Files

| File | Purpose |
|------|---------|
| Service/SimilarityScorer.ts | Embedding-based similarity |
| Workflow/EntityResolution.ts | Clustering workflow |
| Domain/Model/EntityResolution.ts | Resolution domain model |

### Key Services/Classes

- SimilarityScorer - Compute entity similarity via embeddings
- EntityResolution workflow - Cluster similar entities

### Integration Points

- Uses: Embedding service, Entity models
- Produces: EntityClusters, SameAsLinks
- Consumed by: Cross-batch resolution, GraphRAG

---

## Category 4: RDF/Reasoning

**Description**: RDF storage, SPARQL querying, and RDFS inference.

**Why It Matters**: Enables semantic reasoning over extracted knowledge.

### Files

| File | Purpose |
|------|---------|
| Service/RdfBuilder.ts | RDF quad construction |
| Service/OntologyService.ts | Ontology parsing and hierarchy |
| Service/ShaclService.ts | SHACL validation |
| ??? | SPARQL support (if present) |

### Key Services/Classes

- RdfBuilder - Construct RDF quads from entities/relations
- OntologyService - Parse Turtle, resolve class hierarchies
- ShaclService - Validate graphs against SHACL shapes

### Integration Points

- Uses: N3 parser, Ontology files
- Produces: Validated RDF graphs
- Consumed by: Extraction pipeline, inference router

---

## Category 5: Durability

**Description**: Workflow execution, activity journaling, and crash recovery.

**Why It Matters**: Production systems must survive failures without losing progress.

### Files

| File | Purpose |
|------|---------|
| Runtime/Persistence/PostgresLayer.ts | SQL persistence for cluster |
| Runtime/ClusterRuntime.ts | SingleRunner composition |
| Service/WorkflowOrchestrator.ts | High-level workflow API |
| Workflow/DurableActivities.ts | Journaled activity definitions |

### Key Services/Classes

- PostgresLayer - SqlMessageStorage + SqlRunnerStorage
- ClusterRuntime - SingleRunner with SQL backend
- WorkflowOrchestrator - execute/poll/interrupt/resume
- Activities - Journaled versions of extraction stages

### Integration Points

- Uses: @effect/workflow, @effect/cluster, PostgreSQL
- Enables: Crash recovery, progress tracking
- Consumed by: All workflow executions

---

## Category 6: Events

**Description**: Internal event bus, broadcasting, and real-time streaming.

**Why It Matters**: Enables real-time updates and audit trails.

### Files

| File | Purpose |
|------|---------|
| Service/EventBus.ts | Event publication/subscription |
| Runtime/EventBridge.ts | EventBus → WebSocket bridge |
| Runtime/EventBroadcastRouter.ts | Multi-client WebSocket |
| Runtime/EventStreamRouter.ts | CQRS bidirectional sync |
| Runtime/Persistence/EventLogStorage.ts | Encrypted event persistence |
| Domain/Schema/EventSchema.ts | Typed event definitions |

### Key Services/Classes

- EventBusService - Internal pub/sub (memory or SQL)
- EventBridge - Forwards events to broadcast hub
- EventBroadcastHub - Per-ontology subscriptions
- EventStreamRouter - EventLogServer protocol
- EventLogStorage - PostgreSQL event persistence

### Integration Points

- Uses: PubSub, Stream, WebSocket
- Enables: Real-time updates, audit logs
- Consumed by: UI clients, monitoring systems

---

## Category 7: Resilience

**Description**: Failure protection, rate limiting, and backpressure handling.

**Why It Matters**: LLM APIs are unreliable; systems must degrade gracefully.

### Files

| File | Purpose |
|------|---------|
| Runtime/CircuitBreaker.ts | Failure protection |
| Service/LlmControl/TokenBudgetService.ts | Per-stage token limits |
| Service/LlmControl/StageTimeoutService.ts | Per-stage timeouts |
| Service/LlmSemaphore.ts | Concurrency control |
| Cluster/BackpressureHandler.ts | Stream flow control |

### Key Services/Classes

- CircuitBreaker - 3-state machine (Closed/Open/Half-Open)
- TokenBudgetService - Allocate tokens per stage
- StageTimeoutService - Enforce timeouts per stage
- LlmSemaphore - Limit concurrent LLM calls
- BackpressureHandler - Sample non-critical events under load

### Integration Points

- Used by: All LLM calls, progress streaming
- Protects: LLM APIs from overload
- Provides: Retry guidance (retryAfterMs)

---

## Category 8: Runtime Infrastructure

**Description**: Layer composition, cluster configuration, and activity dispatch.

**Why It Matters**: Proper layer ordering and composition is critical for Effect applications.

### Files

| File | Purpose |
|------|---------|
| Runtime/ClusterRuntime.ts | Pluggable cluster layers |
| Runtime/ActivityRunner.ts | Cloud job activity dispatch |
| Runtime/*.ts | Various runtime composition |

### Key Services/Classes

- ClusterSqliteLive - Dev-friendly SQLite backend
- ClusterAutoLiveFromEnv - Environment-based selection
- ActivityRunner - Route activities by name

### Integration Points

- Composes: All services into running application
- Configures: Storage backends, concurrency
- Enables: Multi-environment deployment

---

## Category 9: Contracts

**Description**: RPC definitions, progress streaming schemas, and API contracts.

**Why It Matters**: Type-safe client-server communication.

### Files

| File | Purpose |
|------|---------|
| Contract/ProgressStreaming.ts | Progress event contract |
| Cluster/ExtractionEntity.ts | Entity RPC definitions |
| ??? | Other RPC contracts |

### Key Services/Classes

- ProgressEvent union (20+ types)
- ExtractFromTextRpc, GetCachedResultRpc, CancelExtractionRpc
- BackpressureConfig schema

### Integration Points

- Used by: WebSocket handlers, RPC endpoints
- Defines: Wire protocol for extraction
- Consumed by: Client applications

---

## Category 10: Telemetry

**Description**: Tracing, metrics, and cost calculation.

**Why It Matters**: Observability for production operations.

### Files

| File | Purpose |
|------|---------|
| Telemetry/Attributes.ts | OpenTelemetry attributes |
| Telemetry/Metrics.ts | Custom metrics |
| Telemetry/CostCalculator.ts | LLM cost tracking |

### Key Services/Classes

- Attribute definitions for spans
- Metrics counters and histograms
- Cost calculator for token usage

### Integration Points

- Used by: All services (spans)
- Integrates with: @effect/opentelemetry
- Exports to: Grafana, Honeycomb, etc.

---

## Category 11: Utilities

**Description**: Common utilities, text processing, and similarity functions.

**Why It Matters**: Shared code reduces duplication and bugs.

### Files

| File | Purpose |
|------|---------|
| Utils/IRI.ts | IRI manipulation |
| Utils/Text.ts | Text utilities |
| Utils/Similarity.ts | Similarity scoring |
| Utils/IdempotencyKey.ts | Key generation |

### Key Exports

- IRI parsing and construction
- Text normalization
- Cosine similarity
- Content-based idempotency keys

### Integration Points

- Used by: Almost all services
- Stateless: No dependencies
- Pure: No side effects

---

## Category Summary

| Category | Files | Complexity | beep-effect Coverage |
|----------|-------|------------|---------------------|
| Core Domain | ~15 | Low | High |
| Extraction Pipeline | ~5 | High | High |
| Entity Resolution | ~3 | Medium | High |
| RDF/Reasoning | ~5 | High | High |
| Durability | ~5 | High | **Missing** |
| Events | ~6 | High | **Missing** |
| Resilience | ~5 | Medium | **Missing** |
| Runtime Infrastructure | ~4 | Medium | **Missing** |
| Contracts | ~3 | Medium | **Partial** |
| Telemetry | ~3 | Low | Partial |
| Utilities | ~4 | Low | Partial |

---

## Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         RUNTIME LAYER                            │
│  (ClusterRuntime, ActivityRunner, Layer composition)             │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   DURABILITY    │  │    EVENTS       │  │   CONTRACTS     │
│  (Workflows,    │  │ (EventBus,      │  │ (ProgressEvent, │
│   Activities)   │  │  Broadcasting)  │  │  RPCs)          │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                              │
│ (Extraction, Resolution, Reasoning, LLM Control, Telemetry)      │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   RESILIENCE    │  │  RDF/REASONING  │  │    UTILITIES    │
│  (Circuit       │  │ (RdfBuilder,    │  │ (IRI, Text,     │
│   Breaker,      │  │  Ontology,      │  │  Similarity)    │
│   Backpressure) │  │  SHACL)         │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                               │
│           (Errors, Models, Schemas, RDF Constants)               │
└─────────────────────────────────────────────────────────────────┘
```
