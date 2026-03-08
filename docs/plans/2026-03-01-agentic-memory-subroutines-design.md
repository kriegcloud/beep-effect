# Agentic Memory Subroutines Design

**Date**: 2026-03-01  
**Revised**: 2026-03-02  
**Status**: Draft (Architecture Revision)  
**Goal**: Replace automatic FTS5 prompt injection with agent-driven, Effect-native memory routines that are durable, observable, governance-aligned, and cleanly integrated with the current runtime.

---

## 0. Revision Scope

This revision upgrades the original draft to address integration and runtime correctness gaps:

1. Makes trigger execution concrete in existing runtime entry points (`TurnProcessingWorkflow`, `ChannelCore`/session lifecycle, `SchedulerActionExecutor`)
2. Adds a **ContextPressure** trigger for deterministic compaction under token pressure
3. Introduces **CompactionCheckpoint** persistence so future context reconstruction is deterministic
4. Reworks async orchestration to use a queue/worker control plane (instead of request-scoped fire-and-forget fibers)
5. Enforces subroutine tool scope via real toolkit composition
6. Adds schema and event contract changes required for compatibility
7. Defines an implementation and test sequence that can be executed without architectural churn

---

## 1. Problem Statement

The previous memory approach injected top-N FTS matches into every turn. That model was:

- indiscriminate (retrieval without curation intent)
- opaque (agent could not reason about memory selection)
- single-tier biased (primarily semantic facts)
- weak under context pressure (no deterministic compaction checkpoint)

The target system treats memory curation as first-class agent behavior, while preserving operational guarantees (governance, idempotency, event visibility, replay-safe scheduling).

---

## 2. Goals and Non-Goals

### 2.1 Goals

1. Agent-driven memory curation across all ontology tiers:
   - `WorkingMemory`
   - `EpisodicMemory`
   - `SemanticMemory`
   - `ProceduralMemory`
2. Multiple trigger modes with clear runtime ownership:
   - post-turn
   - post-session-idle
   - scheduled
   - context-pressure
3. Deterministic checkpointing for compaction-like flows
4. Effect-native service and concurrency model
5. Tool scope and governance consistency with existing tool runtime
6. Structured observability and audit trail

### 2.2 Non-Goals (Initial Slice)

- Building a second memory persistence backend (existing `MemoryPortSqlite` remains)
- Replacing existing governance policy engine
- Branch-aware summarization (can be added after branch model exists)

---

## 3. Core Concepts

## 3.1 MemorySubroutine

A `MemorySubroutine` is a configured routine that runs an LLM+tools loop for memory operations under a specific trigger.

It is defined by:

1. identity (`id`, `name`, `tier`)
2. trigger (`PostTurn`, `PostSession`, `Scheduled`, `ContextPressure`)
3. prompt contract (`promptFile`, template variables)
4. runtime limits (`maxIterations`, `toolConcurrency`, optional model override)
5. tool scope (`toolScope`)

## 3.2 CompactionCheckpoint (New)

Compaction-oriented routines persist a checkpoint record with a stable anchor, not only a trace file.

`CompactionCheckpoint` enables deterministic future context reconstruction.

Suggested persisted shape:

```typescript
CompactionCheckpoint {
  checkpointId: string
  agentId: AgentId
  sessionId: SessionId
  subroutineId: string
  createdAt: Instant
  summary: string
  firstKeptTurnId: TurnId | null
  firstKeptMessageId: MessageId | null
  tokensBefore: number | null
  tokensAfter: number | null
  detailsJson: string | null   // optional file-op provenance, diagnostics
}
```

---

## 4. Architecture Overview

```text
agent.yaml
  -> AgentConfig decode + defaults + prompt load + cron compile
  -> SubroutineCatalog (validated definitions)

SubroutineControlPlane (new)
  - bounded queue
  - dedupe window
  - per-session serialization
  - worker fibers

Trigger Producers
  - TurnProcessingWorkflow: PostTurn enqueue
  - Session idle monitor: PostSession enqueue
  - SchedulerActionExecutor: Scheduled enqueue/execute
  - Context pressure guard: synchronous compaction path

SubroutineRunner
  - resolve model + toolkit scope
  - run LLM tool loop (bounded)
  - write trace
  - persist CompactionCheckpoint (when applicable)
  - write governance audit entries
  - emit MemoryRoutineEvent stream events
```

---

## 5. Trigger Model

## 5.1 PostTurn

Runs after successful turn completion.

Integration point:

- `TurnProcessingWorkflow` after accepted completion and audit write

Behavior:

- enqueue dispatch request into `SubroutineControlPlane`
- non-blocking for user response path
- deduped by `(sessionId, subroutineId, turnId)`

## 5.2 PostSession (Idle)

Runs when a session crosses idle threshold.

Effect-native implementation:

- maintain last-activity state per session
- monitor using `SubscriptionRef` + scheduled checks
- enqueue once per idle-window crossing (no repeated churn)

## 5.3 Scheduled

Runs via scheduler action refs:

```text
action:memory_subroutine:<subroutineId>
```

`SchedulerActionExecutor` must:

1. parse and validate subroutine id
2. evaluate `ExecuteSchedule` governance (existing behavior)
3. delegate to subroutine execution path
4. map routine result to `ExecutionOutcome`

## 5.4 ContextPressure (New, Must-Have)

Runs when context budget nears exhaustion.

Two entry modes:

1. **proactive**: `contextTokens > contextWindow - reserveTokens`
2. **reactive**: provider/context-window overflow failure

Reactive path should support:

1. run compaction subroutine synchronously
2. rebuild prompt context from latest checkpoint
3. retry generation once

This aligns memory behavior with real runtime pressure instead of only clock/turn triggers.

---

## 6. Execution Model: SubroutineRunner

## 6.1 Service Interface

```typescript
SubroutineRunner {
  execute: (
    subroutine: MemorySubroutine,
    context: SubroutineContext
  ) => Effect<SubroutineResult, SubroutineExecutionError>
}

SubroutineContext {
  agentId: AgentId
  sessionId: SessionId
  conversationId: ConversationId
  turnId: TurnId | null
  triggerType: "PostTurn" | "PostSession" | "Scheduled" | "ContextPressure"
  triggerReason: string
  now: Instant
  syntheticRunId: string
}
```

## 6.2 Loop Semantics

For each run:

1. resolve effective model (override or agent default)
2. resolve allowed toolkit for scope
3. build prompt with runtime vars
4. execute bounded tool loop (`maxIterations`)
5. enforce tool call concurrency (`toolConcurrency`)
6. capture result stats
7. write trace + audit
8. persist checkpoint for compaction-style routines
9. emit completion/failure events

## 6.3 Background Identity for Tool Invocation

Because background runs may not have a natural user turn id, runner must generate stable synthetic IDs so existing tool invocation persistence remains consistent.

Example:

```text
turnId = turn:subroutine:<syntheticRunId>
channelId = channel:subroutine:<sessionId>
```

This avoids relaxing current invocation schema invariants.

---

## 7. Effect-Native Orchestration Patterns

## 7.1 Control Plane (Queue + Workers)

Use a bounded queue as the only async ingress for subroutine work.

Rationale:

- explicit backpressure strategy
- deterministic shutdown behavior
- no request-scope lifetime leaks

Queue strategy guidance:

- `dropping` for low-priority post-turn bursts, or
- `sliding` where latest state should win

## 7.2 Per-Session Serialization

Use a keyed semaphore/mutex model so concurrent triggers do not race for one session.

At-most-one in-flight subroutine per `(sessionId, subroutineId)` by default.

## 7.3 Idle Monitoring

Use `SubscriptionRef` for last-activity state and scheduled polling/checkpointing, not a resettable free-fiber timer per session.

## 7.4 Cron Validation

Compile and validate cron expressions at config load (fail-fast), not at dispatch time.

---

## 8. Tool Surface and Scope Enforcement

No new memory/file/shell tool definitions are required for baseline behavior, but scope enforcement must be concrete.

## 8.1 Scope Contract

```typescript
SubroutineToolScope = {
  fileRead: boolean
  fileWrite: boolean
  shell: boolean
  memoryRead: boolean
  memoryWrite: boolean
}
```

Default:

- `fileRead = true`
- `memoryRead = true`
- `memoryWrite = true`
- `fileWrite = false`
- `shell = false`

## 8.2 Enforcement Model

Scope is enforced by toolkit composition, not by soft policy messages.

Implementation rule:

- build a toolkit containing only allowed tools
- optionally set `toolChoice.oneOf` to same allow-list

This removes drift between declared scope and actual tool exposure.

## 8.3 store_memory Enhancement (Required)

`store_memory` must accept optional `tier`:

```typescript
parameters: Schema.Struct({
  content: Schema.String,
  tags: Schema.optionalKey(Schema.Array(Schema.String)),
  scope: Schema.optionalKey(Schema.Literals(["SessionScope", "GlobalScope"])),
  tier: Schema.optionalKey(MemoryTier) // default SemanticMemory
})
```

Backward compatible behavior remains intact when `tier` omitted.

---

## 9. Prompt and Output Contracts

## 9.1 Prompt Structure

Retain three-part structure:

1. role
2. context orientation
3. tier strategy

but add strict output expectations for consistency.

## 9.2 Structured End-of-Run Summary (New)

Each subroutine must finish with machine-readable summary (separate from tool calls):

```typescript
SubroutineDecisionSummary {
  stored: Array<{ content: string; tier: MemoryTier; scope: MemoryScope; reason: string }>
  forgotten: Array<{ memoryId: string; reason: string }>
  skipped: Array<{ reason: string }>
  checkpointSummary: string | null
}
```

This supports deterministic metrics and test assertions.

## 9.3 Iterative Update Mode

Compaction-style routines should support:

1. initial synthesis
2. update from previous checkpoint summary

to avoid full-history regeneration every time.

---

## 10. Transcript and Trace Architecture

## 10.1 Transcript Projector (Revised)

Avoid dual-write drift by projecting transcript files from canonical stored turn history.

Service:

```typescript
TranscriptProjector {
  projectSession: (sessionId: SessionId) => Effect<void>
  projectIncremental: (sessionId: SessionId, sinceTurnId?: TurnId) => Effect<void>
}
```

Can run:

- post-turn (incremental)
- scheduled maintenance (rebuild)

## 10.2 TraceWriter

Trace remains append-friendly text file for operator inspection, but built from structured run events.

Required sections:

1. header (subroutine, trigger, IDs)
2. rendered system prompt
3. loop events (assistant/tool call/tool result)
4. completion or failure summary

## 10.3 Retention

Trace cleanup remains scheduled; default retention 30 days.

---

## 11. Eventing and Observability

## 11.1 Event Contract Strategy

Do not overload existing `TurnStreamEvent` ad hoc.

Use a dedicated `MemoryRoutineEvent` schema union and route it through session stream transport or a parallel event channel.

```typescript
MemoryRoutineStarted
MemoryRoutineProgress
MemoryRoutineCompleted
MemoryRoutineFailed
MemoryRoutineSkipped
```

Common fields:

- `sequence`
- `sessionId`
- `subroutineId`
- `triggerType`
- `runId`
- `createdAt`

Completion/failure fields include:

- `memoriesStored`
- `memoriesForgotten`
- `iterationsUsed`
- `aborted`
- `retryPlanned`
- `errorCode` / `message`

## 11.2 Metrics

Minimum metrics:

- routine run count by trigger/tier
- success/failure/skip count
- queue depth and dequeue latency
- routine runtime and iterations
- memory ops per run

---

## 12. Governance and Audit

Subroutine runs must emit explicit audit records, not rely only on downstream tool invocation audit rows.

Suggested reason codes:

- `memory_subroutine_dispatched`
- `memory_subroutine_started`
- `memory_subroutine_completed`
- `memory_subroutine_failed`
- `memory_subroutine_skipped`
- `memory_subroutine_context_pressure_retry`

Each should include correlation identifiers:

- `subroutineId`
- `runId`
- `triggerType`
- `scheduleId` (when scheduled)

---

## 13. Schema Changes

## 13.1 Trigger Schema

```typescript
const SubroutineTrigger = Schema.Union([
  Schema.Struct({
    type: Schema.tag("PostTurn")
  }),
  Schema.Struct({
    type: Schema.tag("PostSession"),
    idleTimeoutSeconds: Schema.Number
  }),
  Schema.Struct({
    type: Schema.tag("Scheduled"),
    cronExpression: Schema.String,
    timezone: Schema.optionalKey(Schema.String)
  }),
  Schema.Struct({
    type: Schema.tag("ContextPressure"),
    reserveTokens: Schema.Number,
    retryOnOverflow: Schema.Boolean
  })
])
```

## 13.2 Subroutine Config

```typescript
const MemorySubroutineConfig = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  tier: MemoryTier,
  trigger: SubroutineTrigger,
  promptFile: Schema.String,
  maxIterations: Schema.Number,
  toolConcurrency: Schema.optionalKey(Schema.Union([Schema.Number, Schema.Literal("inherit")])),
  model: Schema.optionalKey(Schema.Struct({
    provider: Schema.String,
    modelId: Schema.String
  })),
  toolScope: Schema.optionalKey(SubroutineToolScope),
  dedupeWindowSeconds: Schema.optionalKey(Schema.Number),
  writesCheckpoint: Schema.optionalKey(Schema.Boolean)
})
```

## 13.3 Top-Level Agent Memory Config

Placed under each `agents.<id>.memory` block:

```typescript
const MemoryRoutinesConfig = Schema.Struct({
  subroutines: Schema.Array(MemorySubroutineConfig),
  transcripts: Schema.optionalKey(Schema.Struct({
    enabled: Schema.Boolean,
    directory: Schema.String
  })),
  traces: Schema.optionalKey(Schema.Struct({
    enabled: Schema.Boolean,
    directory: Schema.String,
    retentionDays: Schema.optionalKey(Schema.Number)
  }))
})
```

---

## 14. Defaults

New defaults in `system-defaults` should include:

```typescript
DEFAULT_SUBROUTINE_MAX_ITERATIONS = 5
DEFAULT_SUBROUTINE_TOOL_CONCURRENCY = "inherit"
DEFAULT_TRACE_RETENTION_DAYS = 30
DEFAULT_SESSION_IDLE_TIMEOUT_SECONDS = 1800
DEFAULT_CONTEXT_PRESSURE_RESERVE_TOKENS = 4000
DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS = 30
DEFAULT_TRANSCRIPT_DIRECTORY = "transcripts"
DEFAULT_TRACE_DIRECTORY = "traces/memory"
DEFAULT_SUBROUTINE_TOOL_SCOPE = {
  fileRead: true,
  fileWrite: false,
  shell: false,
  memoryRead: true,
  memoryWrite: true
}
```

---

## 15. Integration Points (Concrete)

## 15.1 TurnProcessingWorkflow

- after accepted completion: enqueue post-turn routines
- context-overflow handling: run context-pressure routine + one retry
- optional incremental transcript projection trigger

## 15.2 SchedulerActionExecutor

- parse `action:memory_subroutine:<id>`
- resolve subroutine from catalog
- execute via control plane/runner
- map to `ExecutionOutcome`

## 15.3 ChannelCore / Session Lifecycle

- update session activity timestamps
- idle monitor enqueues post-session routines exactly once per idle crossing

## 15.4 ToolRegistry

- `store_memory` gains optional `tier`
- `makeToolkit` accepts scope filter for subroutine runs

## 15.5 AgentConfig

- decode `agents.<id>.memory`
- load and cache prompt files
- validate cron/timezone for scheduled triggers at startup

---

## 16. Service Dependency Graph

### 16.1 New Services

| Service | Dependencies | Role |
|---|---|---|
| `SubroutineCatalog` | `AgentConfig` | Validated routine definitions + compiled triggers |
| `SubroutineControlPlane` | `Queue`, `SubroutineRunner`, `SubroutineCatalog` | Bounded dispatch + workers + dedupe/serialization |
| `SubroutineRunner` | `ModelRegistry`, `ToolRegistry`, `TraceWriter`, `GovernancePort`, `AgentConfig` | Execute one routine run |
| `SessionIdleMonitor` | `SubscriptionRef`, `Schedule`, `SubroutineControlPlane` | Idle-based trigger generation |
| `TranscriptProjector` | `SessionTurnPortTag`, `FileSystem` | Canonical transcript file projection |
| `TraceWriter` | `FileSystem` | Structured run trace files |
| `CompactionCheckpointStore` | persistence port/sql | Persist and query compaction anchors |

### 16.2 Layering Guidance

- instantiate parameterized layers once and reuse references
- avoid constructing identical heavy layers multiple times
- keep routine control plane in app lifetime scope

---

## 17. Reference Comparison (Feature Parity and Beyond)

To meet or exceed reference systems:

Must-have:

1. context-pressure trigger with overflow retry
2. persisted compaction checkpoint anchor
3. safe cut-point policy for compaction routines
4. per-session dedupe/serialization of routine execution
5. richer run events and audit reason codes

Nice-to-have:

1. branch-exit summarization trigger (future branch model)
2. cumulative file-op provenance in checkpoint `detailsJson`

Areas where this design already exceeds references:

1. first-class four-tier ontology memory model
2. explicit governance integration intent
3. unified trigger model across turn/session/schedule/context-pressure

---

## 18. Test Strategy

## 18.1 Unit Tests

1. schema decode defaults and invalid-config failures
2. cron validation failures at startup
3. tool scope allow-list composition
4. `store_memory` tier default/backward compatibility
5. dedupe key behavior and window logic

## 18.2 Property Tests

1. queue + dedupe idempotency under repeated identical events
2. per-session serialization invariants under concurrent enqueue
3. checkpoint anchor monotonicity and reconstruction invariants

## 18.3 Integration Tests

1. post-turn trigger path from successful turn completion
2. scheduled action dispatch path via `SchedulerActionExecutor`
3. post-session idle dispatch with simulated activity gaps
4. context-pressure compaction + single retry
5. event emission and audit record correctness

## 18.4 Failure Tests

1. model failure in routine run does not crash turn path
2. trace write failure surfaces as routine failure audit/event
3. checkpoint persistence failure and retry behavior

---

## 19. Implementation Order (Revised)

1. Domain schema additions (`MemoryRoutinesConfig`, trigger extensions, toolConcurrency)
2. `system-defaults` updates
3. `store_memory` optional `tier` enhancement
4. `ToolRegistry.makeToolkit` scope filtering support
5. `SubroutineCatalog` + config load/validation (including cron)
6. `CompactionCheckpointStore` persistence model
7. `TraceWriter` and `TranscriptProjector`
8. `SubroutineRunner`
9. `SubroutineControlPlane` (queue + worker + dedupe + serialization)
10. `SchedulerActionExecutor` support for memory routine action refs
11. `TurnProcessingWorkflow` post-turn + context-pressure integration
12. `SessionIdleMonitor` and post-session integration
13. `MemoryRoutineEvent` contracts and transport wiring
14. Audit reason code integration
15. Unit/property/integration/failure test suites

---

## 20. What Remains Unchanged

- `MemoryPortSqlite` storage backend
- `MemoryEntity` cluster entity
- `GovernancePort` policy semantics
- existing file/command runtime architecture
- FTS5 as retrieval mechanism (now used agentically rather than auto-injected)

---

## 21. Summary

This revised design keeps the original strategic direction (agentic memory routines) but adds the missing execution and correctness machinery required by the current architecture:

1. executable trigger wiring
2. Effect-native async control plane
3. deterministic compaction checkpointing
4. enforceable tool scope
5. schema/event/audit compatibility
6. production-grade testing plan

