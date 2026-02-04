# Spec Generator Prompt

> Use this prompt to spawn an agent that creates all necessary specs for knowledge slice feature parity.

---

## Prompt

```
You are a specification architect tasked with creating comprehensive specs for the beep-effect knowledge slice to achieve feature parity with the effect-ontology reference implementation.

## Context

The beep-effect monorepo contains a knowledge slice (`packages/knowledge/`) that implements:
- LLM-powered entity and relation extraction
- Entity clustering via embeddings
- GraphRAG hybrid retrieval
- RDF/SPARQL support
- RDFS forward-chaining reasoning

However, it **lacks critical infrastructure** present in the effect-ontology reference implementation:

### Missing Capabilities (Prioritized)

**P0 - Critical (Production Blockers)**:
1. Durable workflow execution (`@effect/workflow` + `@effect/cluster`)
2. Activity journaling for crash recovery
3. WorkflowOrchestrator API (execute/poll/interrupt/resume)
4. Cluster runtime composition

**P1 - High (Robustness)**:
5. Circuit breaker for LLM protection
6. Token budget service (per-stage allocation)
7. Stage timeout service
8. LLM rate limiting and semaphore
9. Progress streaming contract (20+ event types)
10. Extraction entity handler (distributed actor)

**P2 - Medium (Nice to Have)**:
11. Event infrastructure (EventBus, EventBridge, broadcast)
12. Backpressure handler for streams
13. Batch state machine
14. Cross-batch entity resolution

**P3 - Low (Future)**:
15. Full event sourcing (EventLogStorage, EventStreamRouter)
16. Cloud Pub/Sub integration

## Your Task

Create the following specs in order, following the spec guide at `specs/_guide/README.md`:

### Spec 1: knowledge-workflow-durability
**Priority**: P0
**Phases**: 4
**Reference**: `specs/knowledge-workflow-durability/README.md` (already drafted - refine and expand)

Key deliverables:
- PostgresLayer.ts (SqlMessageStorage + SqlRunnerStorage)
- ClusterRuntime.ts (SingleRunner composition)
- ExtractionWorkflow.ts (Workflow.make)
- DurableActivities.ts (Activity.make per stage)
- WorkflowOrchestrator.ts (high-level API)

Reference files in effect-ontology:
- `.repos/effect-ontology/packages/@core-v2/src/Runtime/Persistence/PostgresLayer.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Runtime/ClusterRuntime.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts`

### Spec 2: knowledge-resilience
**Priority**: P1
**Phases**: 2
**Dependencies**: None

Key deliverables:
- CircuitBreaker.ts (Closed/Open/Half-Open states)
- BackpressureHandler.ts (critical event preservation)
- Integration with LLM calls

Reference files:
- `.repos/effect-ontology/packages/@core-v2/src/Runtime/CircuitBreaker.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Cluster/BackpressureHandler.ts`

### Spec 3: knowledge-llm-control
**Priority**: P1
**Phases**: 2
**Dependencies**: None

Key deliverables:
- TokenBudgetService.ts
- StageTimeoutService.ts
- LlmSemaphore.ts / CentralRateLimiterService.ts

Reference files:
- `.repos/effect-ontology/packages/@core-v2/src/Service/LlmControl/*.ts`

### Spec 4: knowledge-progress-streaming
**Priority**: P1
**Phases**: 2
**Dependencies**: knowledge-workflow-durability

Key deliverables:
- ProgressEvent schema (20+ discriminated union)
- SSE endpoint
- Activity → event emission
- Backpressure config

Reference files:
- `.repos/effect-ontology/packages/@core-v2/src/Contract/ProgressStreaming.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Domain/Schema/EventSchema.ts`

### Spec 5: knowledge-entity-handler
**Priority**: P1
**Phases**: 3
**Dependencies**: knowledge-workflow-durability, knowledge-llm-control

Key deliverables:
- ExtractionEntity.ts (Entity.make with RPCs)
- ExtractionEntityHandler.ts (5-stage pipeline)
- Cancellation registry
- Cache lookup

Reference files:
- `.repos/effect-ontology/packages/@core-v2/src/Cluster/ExtractionEntity.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Cluster/ExtractionEntityHandler.ts`

### Spec 6: knowledge-events
**Priority**: P2
**Phases**: 3
**Dependencies**: None

Key deliverables:
- EventBusService.ts
- EventBridge.ts
- EventBroadcastRouter.ts
- EventSchema.ts (EventGroup definitions)

Reference files:
- `.repos/effect-ontology/packages/@core-v2/src/Service/EventBus.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Runtime/EventBridge.ts`
- `.repos/effect-ontology/packages/@core-v2/src/Runtime/EventBroadcastRouter.ts`

### Spec 7: knowledge-batch-orchestration
**Priority**: P2
**Phases**: 2
**Dependencies**: knowledge-workflow-durability

Key deliverables:
- BatchState.ts (state machine)
- BatchWorkflow.ts
- State transitions
- Batch retry logic

Reference files:
- `.repos/effect-ontology/packages/@core-v2/src/Domain/Model/BatchWorkflow.ts`

## Spec Creation Guidelines

For each spec:

1. **Follow the template** at `specs/_guide/SPEC_TEMPLATE.md`

2. **Include these sections**:
   - Status (PLANNED)
   - Purpose (why this spec exists)
   - Scope (what's included/excluded)
   - Dependencies (other specs required first)
   - Phases with deliverables
   - Success criteria
   - Anti-patterns to avoid
   - Reference files in effect-ontology

3. **Reference the right files**:
   - Always point to specific effect-ontology files
   - Include code snippets showing the pattern
   - Document the Effect packages used

4. **Define success criteria clearly**:
   - Testable conditions
   - Observable behaviors
   - Performance requirements if applicable

5. **Document anti-patterns**:
   - What the previous attempt did wrong (if applicable)
   - Common mistakes to avoid
   - Patterns from effect-ontology to follow

## Output Format

For each spec, create:
1. `specs/{spec-name}/README.md` - Main spec document
2. `specs/{spec-name}/REFLECTION_LOG.md` - Empty, for execution learnings

## Reference Documents

- Spec guide: `specs/_guide/README.md`
- Previous knowledge specs: `specs/knowledge-*/`
- Effect-ontology CLAUDE.md: `.repos/effect-ontology/CLAUDE.md`
- Effect-ontology architecture docs: `.repos/effect-ontology/packages/@core-v2/docs/architecture/`

## Execution Notes

- Create specs in dependency order (1 → 2,3 parallel → 4,5 → 6,7)
- Each spec should be self-contained with full context
- Include enough detail for an implementing agent to work autonomously
- Cross-reference effect-ontology files extensively
- Use the existing `knowledge-workflow-durability` spec as a model

Begin by reading the spec guide and effect-ontology CLAUDE.md for context.
```

---

## Usage Instructions

1. Copy the prompt above
2. Start a new Claude session with full context
3. Paste the prompt
4. Agent will create all specs in order

---

## Variables to Customize

Before running, update these based on audit findings:

| Variable | Current Value | Update If Needed |
|----------|---------------|------------------|
| Number of specs | 7 | Based on gap analysis |
| Spec names | As listed | Based on capability groupings |
| Priorities | P0-P3 | Based on business needs |
| Dependencies | As mapped | Based on technical analysis |
| Phase counts | As estimated | Based on scope refinement |

---

## Post-Generation Checklist

After running the prompt, verify:

- [ ] All specs follow `specs/_guide/SPEC_TEMPLATE.md` structure
- [ ] Each spec has clear success criteria
- [ ] Reference files in effect-ontology are accurate
- [ ] Dependencies between specs are correctly documented
- [ ] Anti-patterns section warns against previous mistakes
- [ ] Phase deliverables are specific and actionable
