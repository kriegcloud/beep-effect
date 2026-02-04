# Spec Definitions

> Detailed scope and deliverables for each identified spec.

---

## Spec 1: knowledge-workflow-durability

### Overview

| Attribute | Value |
|-----------|-------|
| **Priority** | P0 (Critical) |
| **Effort** | Large (4 phases) |
| **Dependencies** | None |
| **Status** | Spec exists (refine) |

### Purpose

Integrate `@effect/workflow` and `@effect/cluster` to make extraction pipelines durable and resumable.

### Scope

**Included**:
- PostgreSQL persistence layer (SqlMessageStorage, SqlRunnerStorage)
- SingleRunner cluster runtime
- ExtractionWorkflow definition (Workflow.make)
- Durable activities for each pipeline stage
- WorkflowOrchestrator service (execute/poll/interrupt/resume)
- Batch state tracking

**Excluded**:
- Event infrastructure (separate spec)
- Progress streaming (separate spec)
- Cloud Pub/Sub (separate spec)

### Files to Create

| File | Purpose |
|------|---------|
| `server/src/Runtime/Persistence/PostgresLayer.ts` | SqlMessageStorage + SqlRunnerStorage |
| `server/src/Runtime/ClusterRuntime.ts` | SingleRunner layer composition |
| `server/src/Workflow/ExtractionWorkflow.ts` | Workflow.make definition |
| `server/src/Workflow/DurableActivities.ts` | Activity.make per stage |
| `server/src/Workflow/WorkflowOrchestrator.ts` | High-level workflow API |
| `server/src/Workflow/index.ts` | Public exports |

### Reference Files

| effect-ontology File | Mapping |
|----------------------|---------|
| `src/Runtime/Persistence/PostgresLayer.ts` | PostgresLayer.ts |
| `src/Runtime/ClusterRuntime.ts` | ClusterRuntime.ts |
| `src/Service/WorkflowOrchestrator.ts` | WorkflowOrchestrator.ts |
| `src/Workflow/DurableActivities.ts` | DurableActivities.ts |

### Success Criteria

- [ ] Server starts and `knowledge_cluster_*` tables auto-created
- [ ] Extraction workflow can be started via orchestrator
- [ ] Kill server mid-extraction → restart → extraction resumes
- [ ] Poll returns current progress/status
- [ ] Interrupt cancels running workflow
- [ ] Existing ExtractionPipeline continues working (backwards compatible)

### Anti-Patterns

- DO NOT create custom workflow tables
- DO NOT build custom persistence service
- DO use @effect/cluster's auto-table creation

---

## Spec 2: knowledge-resilience

### Overview

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 (High) |
| **Effort** | Medium (2 phases) |
| **Dependencies** | None |
| **Status** | New |

### Purpose

Add resilience patterns to protect LLM APIs from cascading failures.

### Scope

**Included**:
- Circuit breaker (3-state machine)
- Integration with LLM calls
- Backpressure handler for streams
- Configuration via environment

**Excluded**:
- Rate limiting service (separate spec: knowledge-llm-control)
- Event infrastructure
- Workflow integration (handled by durability spec)

### Files to Create

| File | Purpose |
|------|---------|
| `server/src/Resilience/CircuitBreaker.ts` | 3-state circuit breaker |
| `server/src/Resilience/BackpressureHandler.ts` | Stream flow control |
| `server/src/Resilience/index.ts` | Public exports |

### Reference Files

| effect-ontology File | Mapping |
|----------------------|---------|
| `src/Runtime/CircuitBreaker.ts` | CircuitBreaker.ts |
| `src/Cluster/BackpressureHandler.ts` | BackpressureHandler.ts |

### Success Criteria

- [ ] CircuitBreaker.protect wraps LLM calls
- [ ] 5 consecutive failures → circuit opens
- [ ] After timeout → half-open for testing
- [ ] 2 successes → circuit closes
- [ ] Backpressure preserves critical events
- [ ] Non-critical events sampled under load

---

## Spec 3: knowledge-llm-control

### Overview

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 (High) |
| **Effort** | Medium (2 phases) |
| **Dependencies** | None |
| **Status** | New |

### Purpose

Add LLM control services for token budgeting, timeouts, and concurrency limiting.

### Scope

**Included**:
- Token budget service (per-stage allocation)
- Stage timeout service (per-stage enforcement)
- LLM semaphore (concurrency control)
- Central rate limiter service
- Integration with extraction pipeline

**Excluded**:
- Circuit breaker (separate spec)
- Progress streaming

### Files to Create

| File | Purpose |
|------|---------|
| `server/src/LlmControl/TokenBudgetService.ts` | Per-stage token allocation |
| `server/src/LlmControl/StageTimeoutService.ts` | Per-stage timeout |
| `server/src/LlmControl/LlmSemaphore.ts` | Concurrency control |
| `server/src/LlmControl/CentralRateLimiterService.ts` | Rate limiting |
| `server/src/LlmControl/index.ts` | Public exports |

### Reference Files

| effect-ontology File | Mapping |
|----------------------|---------|
| `src/Service/LlmControl/TokenBudgetService.ts` | TokenBudgetService.ts |
| `src/Service/LlmControl/StageTimeoutService.ts` | StageTimeoutService.ts |
| `src/Service/LlmSemaphore.ts` | LlmSemaphore.ts |

### Success Criteria

- [ ] Extraction respects token budget per stage
- [ ] Stages timeout gracefully with partial results
- [ ] Concurrent LLM calls limited by semaphore
- [ ] Rate limiter prevents API overload
- [ ] All LLM calls integrate with control services

---

## Spec 4: knowledge-progress-streaming

### Overview

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 (High) |
| **Effort** | Medium (2 phases) |
| **Dependencies** | knowledge-workflow-durability |
| **Status** | New |

### Purpose

Implement SSE progress streaming for real-time extraction updates.

### Scope

**Included**:
- ProgressEvent schema (20+ event types)
- SSE endpoint in HTTP router
- Activity → event emission
- Backpressure integration
- Event serialization

**Excluded**:
- WebSocket broadcasting (separate spec: knowledge-events)
- Event persistence
- Multi-client broadcast

### Files to Create

| File | Purpose |
|------|---------|
| `domain/src/schemas/ProgressEvent.ts` | Event discriminated union |
| `server/src/Contract/ProgressStreaming.ts` | SSE contract |
| `server/src/Rpc/ProgressStreamHandler.ts` | SSE endpoint |

### Reference Files

| effect-ontology File | Mapping |
|----------------------|---------|
| `src/Contract/ProgressStreaming.ts` | ProgressStreaming.ts |
| `src/Domain/Schema/EventSchema.ts` | ProgressEvent.ts |

### Success Criteria

- [ ] Client connects to SSE endpoint
- [ ] Receives real-time progress events
- [ ] Events match typed schema
- [ ] Backpressure applies under load
- [ ] Stream ends on completion/failure/cancellation

---

## Spec 5: knowledge-entity-handler

### Overview

| Attribute | Value |
|-----------|-------|
| **Priority** | P1 (High) |
| **Effort** | Large (3 phases) |
| **Dependencies** | knowledge-workflow-durability, knowledge-llm-control |
| **Status** | New |

### Purpose

Implement distributed actor pattern for extraction with full LLM control.

### Scope

**Included**:
- ExtractionEntity definition (Entity.make)
- ExtractionEntityHandler (5-stage pipeline)
- RPC methods (Extract, Cache, Cancel, Status)
- Cancellation registry (Deferred-based)
- LLM control integration

**Excluded**:
- Persistence (handled by durability spec)
- Event broadcasting

### Files to Create

| File | Purpose |
|------|---------|
| `server/src/Cluster/ExtractionEntity.ts` | Entity.make with RPCs |
| `server/src/Cluster/ExtractionEntityHandler.ts` | Handler implementation |
| `server/src/Cluster/index.ts` | Public exports |

### Reference Files

| effect-ontology File | Mapping |
|----------------------|---------|
| `src/Cluster/ExtractionEntity.ts` | ExtractionEntity.ts |
| `src/Cluster/ExtractionEntityHandler.ts` | ExtractionEntityHandler.ts |

### Success Criteria

- [ ] Extractions routed by idempotency key
- [ ] 5-stage pipeline executes with LLM control
- [ ] Cancel request interrupts running extraction
- [ ] Status returns current progress
- [ ] Cached results returned without re-extraction

---

## Spec 6: knowledge-events

### Overview

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 (Medium) |
| **Effort** | Large (3 phases) |
| **Dependencies** | None |
| **Status** | New |

### Purpose

Implement event infrastructure for internal pub/sub and broadcasting.

### Scope

**Included**:
- EventBusService (memory and SQL modes)
- EventBridge (EventBus → broadcast)
- EventBroadcastHub (multi-client)
- EventBroadcastRouter (WebSocket endpoint)
- EventSchema (typed event definitions)

**Excluded**:
- Event sourcing (separate spec)
- Cloud Pub/Sub (separate spec)
- Event log persistence

### Files to Create

| File | Purpose |
|------|---------|
| `server/src/Event/EventBusService.ts` | Event publication |
| `server/src/Event/EventBridge.ts` | Bus → broadcast |
| `server/src/Event/EventBroadcastHub.ts` | Multi-client |
| `server/src/Event/EventBroadcastRouter.ts` | WebSocket |
| `domain/src/schemas/EventSchema.ts` | Event definitions |

### Reference Files

| effect-ontology File | Mapping |
|----------------------|---------|
| `src/Service/EventBus.ts` | EventBusService.ts |
| `src/Runtime/EventBridge.ts` | EventBridge.ts |
| `src/Runtime/EventBroadcastRouter.ts` | EventBroadcastRouter.ts |
| `src/Domain/Schema/EventSchema.ts` | EventSchema.ts |

### Success Criteria

- [ ] Events published to EventBus
- [ ] WebSocket clients receive broadcasts
- [ ] Multiple clients per ontology
- [ ] Memory mode works in dev
- [ ] SQL mode works in prod

---

## Spec 7: knowledge-batch-orchestration

### Overview

| Attribute | Value |
|-----------|-------|
| **Priority** | P2 (Medium) |
| **Effort** | Medium (2 phases) |
| **Dependencies** | knowledge-workflow-durability |
| **Status** | New |

### Purpose

Implement batch state machine for multi-document processing.

### Scope

**Included**:
- BatchState (state machine)
- BatchWorkflow (workflow for batches)
- State transitions
- Batch retry logic
- Progress aggregation

**Excluded**:
- Cross-batch resolution (separate spec)
- Event broadcasting

### Files to Create

| File | Purpose |
|------|---------|
| `domain/src/entities/BatchState.ts` | State machine |
| `server/src/Workflow/BatchWorkflow.ts` | Batch workflow |

### Reference Files

| effect-ontology File | Mapping |
|----------------------|---------|
| `src/Domain/Model/BatchWorkflow.ts` | BatchState.ts |

### Success Criteria

- [ ] Batch progresses through states
- [ ] Failed documents retried
- [ ] Batch completes even if some fail
- [ ] Progress aggregated across documents

---

## Spec Summary Table

| Spec | Priority | Effort | Dependencies | Phases |
|------|----------|--------|--------------|--------|
| knowledge-workflow-durability | P0 | L | None | 4 |
| knowledge-resilience | P1 | M | None | 2 |
| knowledge-llm-control | P1 | M | None | 2 |
| knowledge-progress-streaming | P1 | M | durability | 2 |
| knowledge-entity-handler | P1 | L | durability, llm-control | 3 |
| knowledge-events | P2 | L | None | 3 |
| knowledge-batch-orchestration | P2 | M | durability | 2 |

---

## Notes

_Additional spec details and considerations go here._
