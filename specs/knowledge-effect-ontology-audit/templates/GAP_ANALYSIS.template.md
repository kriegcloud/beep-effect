# Gap Analysis: effect-ontology vs beep-effect Knowledge Slice

> Comprehensive comparison of every capability with gap assessment and priority.

---

## Summary Statistics

| Gap Type | Count | Percentage |
|----------|-------|------------|
| None (Feature Parity) | ___ | ___% |
| Partial (Incomplete) | ___ | ___% |
| Missing (No Equivalent) | ___ | ___% |
| Different (Alternative Approach) | ___ | ___% |

| Priority | Count |
|----------|-------|
| P0 (Critical) | ___ |
| P1 (High) | ___ |
| P2 (Medium) | ___ |
| P3 (Low) | ___ |

---

## Category 1: Core Domain

### 1.1 Error Definitions

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `RdfError` | `@beep/knowledge-domain/errors` | ___ | ___ | ___ |
| `LlmError` | ___ | ___ | ___ | ___ |
| `OntologyError` | ___ | ___ | ___ | ___ |
| `ExtractionError` | ___ | ___ | ___ | ___ |
| `WorkflowError` | ___ | ___ | ___ | ___ |
| `ShaclError` | ___ | ___ | ___ | ___ |

### 1.2 Domain Models

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `Entity` | `@beep/knowledge-domain/entities/entity` | ___ | ___ | ___ |
| `Ontology` | ___ | ___ | ___ | ___ |
| `BatchWorkflow` | ___ | ___ | ___ | ___ |
| `EntityResolution` | ___ | ___ | ___ | ___ |

### 1.3 RDF Types

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `IRI` | ___ | ___ | ___ | ___ |
| `Quad` | ___ | ___ | ___ | ___ |
| `NamedNode` | ___ | ___ | ___ | ___ |

### 1.4 API Schemas

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `BatchRequest` | ___ | ___ | ___ | ___ |
| `BatchStatusResponse` | ___ | ___ | ___ | ___ |
| `Batch` | ___ | ___ | ___ | ___ |

---

## Category 2: Extraction Pipeline

### 2.1 Core Extraction

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `EntityExtractor` | `ExtractionPipeline` | ___ | ___ | ___ |
| `RelationExtractor` | ___ | ___ | ___ | ___ |
| `Grounder` | ___ | ___ | ___ | ___ |
| `StreamingExtraction` | ___ | ___ | ___ | ___ |

### 2.2 NLP Services

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `NlpService` (chunking) | `NlpService` | ___ | ___ | ___ |
| `NlpService` (tokenization) | ___ | ___ | ___ | ___ |
| `NlpService` (mention detection) | ___ | ___ | ___ | ___ |

### 2.3 Prompt Construction

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `PromptGenerator` | ___ | ___ | ___ | ___ |
| `RuleSet` | ___ | ___ | ___ | ___ |

---

## Category 3: Entity Resolution

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `EntityResolution` workflow | `EntityClusterer` | ___ | ___ | ___ |
| `SimilarityScorer` | ___ | ___ | ___ | ___ |
| Cross-batch resolution | ___ | ___ | ___ | ___ |

---

## Category 4: RDF/Reasoning

### 4.1 RDF Store

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `RdfBuilder` | `RdfBuilder` | ___ | ___ | ___ |
| N3 parsing | ___ | ___ | ___ | ___ |
| Quad storage | ___ | ___ | ___ | ___ |

### 4.2 Ontology Service

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `OntologyService` (parsing) | `OntologyService` | ___ | ___ | ___ |
| Class hierarchy | ___ | ___ | ___ | ___ |
| Property domains | ___ | ___ | ___ | ___ |
| External vocab support | ___ | ___ | ___ | ___ |

### 4.3 SHACL Validation

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `ShaclService` | ___ | ___ | ___ | ___ |
| Validation reports | ___ | ___ | ___ | ___ |

---

## Category 5: Durability (CRITICAL)

### 5.1 Workflow Infrastructure

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `Workflow.make` | ✗ None | **Missing** | **P0** | Required for crash recovery |
| `Activity.make` | ✗ None | **Missing** | **P0** | Journaled activities |
| `WorkflowEngine` | ✗ None | **Missing** | **P0** | Execute/poll/interrupt/resume |

### 5.2 Persistence

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `SqlMessageStorage` | ✗ None | **Missing** | **P0** | Auto-creates cluster tables |
| `SqlRunnerStorage` | ✗ None | **Missing** | **P0** | Runner registration |
| `SingleRunner` | ✗ None | **Missing** | **P0** | Single-node execution |

### 5.3 Orchestration

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `WorkflowOrchestrator` | ✗ None | **Missing** | **P0** | High-level API |
| Batch state machine | ✗ None | **Missing** | **P1** | State transitions |

---

## Category 6: Events (MISSING)

### 6.1 Event Bus

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `EventBusService` | ✗ None | **Missing** | **P2** | Internal event pub/sub |
| `EventJournal` (SQL) | ✗ None | **Missing** | **P2** | Durable event storage |

### 6.2 Broadcasting

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `EventBridge` | ✗ None | **Missing** | **P2** | Event bus → WebSocket |
| `EventBroadcastHub` | ✗ None | **Missing** | **P2** | Multi-client broadcast |
| `EventBroadcastRouter` | ✗ None | **Missing** | **P2** | WebSocket endpoint |

### 6.3 Event Streaming

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `EventStreamRouter` | ✗ None | **Missing** | **P3** | CQRS sync (advanced) |
| `EventLogStorage` | ✗ None | **Missing** | **P3** | Encrypted event log |

### 6.4 Event Schema

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `EventGroup` definitions | ✗ None | **Missing** | **P2** | 20+ typed events |
| Curation events | ✗ None | **Missing** | **P2** | ClaimCorrected, etc. |
| Extraction events | ✗ None | **Missing** | **P2** | ExtractionCompleted, etc. |

---

## Category 7: Resilience (MISSING)

### 7.1 Circuit Breaker

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `CircuitBreaker` | ✗ None | **Missing** | **P1** | LLM protection |
| 3-state machine | ✗ None | **Missing** | **P1** | Closed/Open/Half-Open |
| `retryAfterMs` | ✗ None | **Missing** | **P1** | Client retry guidance |

### 7.2 Rate Limiting

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `CentralRateLimiterService` | ✗ None | **Missing** | **P1** | LLM rate limiting |
| `LlmSemaphore` | ✗ None | **Missing** | **P1** | Concurrency control |

### 7.3 Backpressure

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `BackpressureHandler` | ✗ None | **Missing** | **P2** | Stream flow control |
| Critical event preservation | ✗ None | **Missing** | **P2** | Never drop lifecycle events |
| Load-factor sampling | ✗ None | **Missing** | **P2** | Progressive degradation |

---

## Category 8: Runtime Infrastructure

### 8.1 Cluster Runtime

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `ClusterRuntime` | ✗ None | **Missing** | **P0** | Layer composition |
| `ClusterSqliteLive` | ✗ None | **Missing** | **P2** | Dev-friendly SQLite |
| `ClusterAutoLiveFromEnv` | ✗ None | **Missing** | **P1** | Auto-detection |

### 8.2 Activity Runner

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `ActivityRunner` | ✗ None | **Missing** | **P2** | Cloud job dispatch |
| Activity name routing | ✗ None | **Missing** | **P2** | Match.value dispatch |

### 8.3 Entity Handler

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `ExtractionEntityHandler` | ✗ None | **Missing** | **P1** | Distributed actor |
| RPC methods (4) | ✗ None | **Missing** | **P1** | Extract/Cache/Cancel/Status |
| Cancellation registry | ✗ None | **Missing** | **P1** | Deferred-based |

---

## Category 9: Contracts

### 9.1 Progress Streaming

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `ProgressEvent` union (20 types) | ✗ None | **Missing** | **P1** | Real-time updates |
| `BaseProgressEvent` | ✗ None | **Missing** | **P1** | Common fields |
| Backpressure config schema | ✗ None | **Missing** | **P2** | Client-side control |

### 9.2 RPC Definitions

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `ExtractFromTextRpc` | Partial | **Partial** | **P1** | Missing progress stream |
| `GetCachedResultRpc` | ✗ None | **Missing** | **P2** | Cache lookup |
| `CancelExtractionRpc` | ✗ None | **Missing** | **P1** | Graceful shutdown |
| `GetExtractionStatusRpc` | ✗ None | **Missing** | **P1** | Progress query |

---

## Category 10: Telemetry

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| OpenTelemetry attributes | ___ | ___ | ___ | ___ |
| Cost calculator | ___ | ___ | ___ | ___ |
| Span tracing | ___ | ___ | ___ | ___ |
| Metrics | ___ | ___ | ___ | ___ |

---

## Category 11: LLM Control

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `TokenBudgetService` | ✗ None | **Missing** | **P1** | Per-stage allocation |
| `StageTimeoutService` | ✗ None | **Missing** | **P1** | Timeout enforcement |
| `LlmSemaphore` | ✗ None | **Missing** | **P1** | Concurrency control |

---

## Category 12: Storage

| effect-ontology | beep-effect | Gap | Priority | Notes |
|-----------------|-------------|-----|----------|-------|
| `StorageService` (GCS) | ___ | ___ | ___ | ___ |
| `StorageService` (Local) | ___ | ___ | ___ | ___ |
| `StorageService` (Memory) | ___ | ___ | ___ | ___ |

---

## Priority Summary

### P0 - Critical (Must Have for Production)

| Capability | Spec Required |
|------------|---------------|
| `@effect/workflow` integration | knowledge-workflow-durability |
| `@effect/cluster` integration | knowledge-workflow-durability |
| WorkflowOrchestrator | knowledge-workflow-durability |
| ClusterRuntime | knowledge-workflow-durability |

### P1 - High (Important for Robustness)

| Capability | Spec Required |
|------------|---------------|
| CircuitBreaker | knowledge-resilience |
| LLM rate limiting | knowledge-resilience |
| Token budget service | knowledge-llm-control |
| Stage timeout service | knowledge-llm-control |
| Progress streaming contract | knowledge-progress-streaming |
| ExtractionEntityHandler | knowledge-entity-handler |

### P2 - Medium (Nice to Have)

| Capability | Spec Required |
|------------|---------------|
| Event infrastructure | knowledge-events |
| Backpressure handler | knowledge-resilience |
| Batch state machine | knowledge-batch-orchestration |

### P3 - Low (Future Consideration)

| Capability | Spec Required |
|------------|---------------|
| Event sourcing (EventStreamRouter) | knowledge-event-sourcing |
| Cloud Pub/Sub integration | knowledge-cloud-events |
| Encrypted event log | knowledge-event-sourcing |

---

## Effort Estimates

| Spec | Size | Phases | Dependencies |
|------|------|--------|--------------|
| knowledge-workflow-durability | L | 4 | None |
| knowledge-resilience | M | 2 | None |
| knowledge-llm-control | M | 2 | None |
| knowledge-progress-streaming | M | 2 | knowledge-workflow-durability |
| knowledge-entity-handler | L | 3 | knowledge-workflow-durability, knowledge-llm-control |
| knowledge-events | L | 3 | None |
| knowledge-batch-orchestration | M | 2 | knowledge-workflow-durability |

---

## Notes

_Additional observations, architectural decisions, and implementation considerations go here._
