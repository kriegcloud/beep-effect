# Personal Agent Architecture Specification

**Version**: 0.3.0-draft
**Date**: 2026-02-24
**Status**: v4-aligned audit pass + distributed agent OS capability gap closure (2026-02-24)
**Ontology Version**: PAO v0.8.0
**Runtime**: Effect TypeScript v4 (4.0.0-beta.11, `effect-smol`)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Domain Model Overview](#2-domain-model-overview)
3. [Effect Ecosystem Mapping](#3-effect-ecosystem-mapping)
4. [Core Computational Model](#4-core-computational-model)
5. [Entity Definitions](#5-entity-definitions)
6. [Workflow Definitions](#6-workflow-definitions)
7. [Persistence Strategy](#7-persistence-strategy)
8. [Memory Architecture](#8-memory-architecture)
9. [AI Integration](#9-ai-integration)
10. [Governance & Safety](#10-governance--safety)
11. [Networking & Gateway](#11-networking--gateway)
12. [Error Handling & Recovery](#12-error-handling--recovery)
13. [Observability](#13-observability)
14. [Module-by-Module Ontology Mapping](#14-module-by-module-ontology-mapping)
15. [Package Structure](#15-package-structure)
16. [Deployment Topology](#16-deployment-topology)
17. [Open Questions](#17-open-questions)
18. [Architecture Refinement Addendum (2026-02-20)](#18-architecture-refinement-addendum-2026-02-20)

---

## 1. Executive Summary

This document specifies the architecture for a personal AI agent system implemented in pure Effect TypeScript. The architecture is derived from the Personal Agent Ontology (PAO v0.8.0), a formal OWL 2 DL vocabulary defining 115 classes across 9 semantic modules.

The system uses **Effect Cluster** as its computational backbone — modeling agents, sessions, and memory as **durable entities** (stateful, addressable actors), and modeling reasoning, planning, and recovery as **durable workflows** with retriable **activities**. This is not a traditional layered service architecture; it is an **event-driven, actor-based system with durable execution guarantees**.

The system targets local-first deployment (single runner, SQLite persistence) with a clear path to cloud deployment (multi-runner, SQL coordination, HTTP gateway).

### Design Principles

1. **Ontology-driven**: Every type, relationship, and constraint traces back to PAO
2. **Durable by default**: Agent state, conversations, and workflows survive crashes
3. **Type-safe end-to-end**: Effect Schema as single source of truth for validation, serialization, and API contracts
4. **Local-first, cloud-ready**: Same code runs locally (single process) or distributed (multi-node)
5. **Secure and auditable**: Governance, permissions, and audit are first-class, not afterthoughts
6. **Composable**: Every component is a Layer, every operation is an Effect

---

## 2. Domain Model Overview

The PAO defines 9 semantic modules. Each module maps to specific architectural components:

| Ontology Module | Classes | Architectural Role |
|---|---|---|
| **Identity & Actors** | Agent, AIAgent, HumanUser, SubAgent, Persona, FoundationModel, ModelDeployment | Entity definitions, identity management |
| **Conversation & Interaction** | Conversation, Session, Turn, Message, ToolInvocation, ContentBlock | Session entity protocol, turn processing |
| **Memory Architecture** | MemoryTier (4), MemoryOperation (5), MemoryItem, Episode, Claim, MemoryBlock | Memory entity, persistence strategy |
| **Goals, Plans, Tasks** | Goal, Plan, Task, Belief, Desire, Intention, Deliberation, Justification | Workflow definitions, BDI reasoning |
| **Error Recovery** | ErrorRecoveryEvent, RetryAttempt, ReplanEvent, RollbackEvent, FailureType | Workflow retry/recovery semantics |
| **Governance & Safety** | PermissionPolicy, SafetyConstraint, Hook, AuditEntry, SandboxPolicy, ConsentRecord | Middleware, policy enforcement |
| **Dialog Pragmatics** | DialogAct, CommunicativeFunction, CommonGround, GroundingAct | Turn classification, grounding logic |
| **External Services** | ExternalService, Integration, ServiceCapability, ServiceConnection | Integration entity, capability discovery |
| **Scheduling & Automation** | Schedule, RecurrencePattern, Trigger, ScheduledExecution, ScheduleStatus, ExecutionOutcome, ConcurrencyPolicy | Scheduler entity/workflow, recurring and event-driven automation |

### Key Metrics

- **115 OWL classes** to be represented as Effect Schema types
- **68 object properties** defining relationships (many become entity message protocols)
- **35 data properties** defining attributes (become Schema fields)
- **75 named individuals** defining value partitions (become `Schema.Literal` unions)
- **20 disjoint value partition types** (become discriminated unions)
- **4 identity keys** (Agent, Session, Conversation, FoundationModel — become branded ID types)

---

## 3. Effect Ecosystem Mapping

### Package Dependencies

> **Note (v4 consolidation)**: In Effect v4, most formerly-separate `@effect/*` packages have been consolidated into the core `effect` package under `effect/unstable/*` subpaths. Platform-specific packages (`@effect/platform-bun`, `@effect/platform-node`) and SQL driver packages (`@effect/sql-sqlite-bun`) remain separate.

| Effect Package / Module | Role in Architecture | Ontology Alignment |
|---|---|---|
| `effect` | Core runtime, Schema, Context, Layer, Ref, Stream, Schedule, ServiceMap | Foundation for everything |
| `effect/unstable/cluster` | Durable entities, sharding, workflows, activities, message storage | Agent/Session/Memory entities, Plan workflows |
| `effect/unstable/ai` | LanguageModel service, Tool/Toolkit, Chat, streaming, MCP | ModelInvocation, ToolInvocation, Turn generation |
| `effect/unstable/http` | HttpClient, HttpServer, HttpRouter, Middleware | Gateway HTTP infrastructure |
| `effect/unstable/httpapi` | HttpApi, HttpApiBuilder, HttpApiClient, OpenApi, Security | Gateway API, typed endpoint contracts |
| `effect/unstable/sql` | Abstract SqlClient, SqlModel, Migrator, transactions | Domain state persistence |
| `effect/unstable/workflow` | Workflow, Activity, DurableClock, DurableDeferred | Durable multi-step processes |
| `effect/unstable/rpc` | Rpc, RpcGroup, RpcClient, RpcServer | Entity message schemas |
| `effect/unstable/persistence` | KeyValueStore, PersistedCache, RateLimiter | Procedural memory, file-based KV |
| `effect/unstable/eventlog` | EventLog, EventJournal, SqlEventLogServer, encryption | Episodic memory event persistence |
| `effect/unstable/reactivity` | Atom, AtomRegistry, AtomRpc, AtomHttpApi | Real-time entity state subscriptions |
| `effect/unstable/observability` | Otlp, OtlpTracer, OtlpMetrics, OtlpLogger, PrometheusMetrics | Metrics, tracing, logging export |
| `effect/unstable/encoding` | Ndjson, Sse, Msgpack | Streaming response encoding |
| `effect/unstable/cli` | Command, Argument, Flag, Prompt | CLI interface to agent |
| `effect/unstable/socket` | Socket, SocketServer | WebSocket support |
| `effect/unstable/devtools` | DevTools, DevToolsServer | Development tooling |
| `@effect/platform-bun` | BunHttpServer, BunHttpClient, BunRuntime, BunServices | Bun runtime bindings |
| `@effect/sql-sqlite-bun` | SQLite driver via Bun | Local persistence backend |

### Construct Mapping

| OWL Construct | Effect Construct | Example |
|---|---|---|
| `owl:Class` | `Schema.Class` or `Schema.TaggedClass` | `class Turn extends Schema.Class<Turn>("Turn")({...})` |
| `owl:oneOf` (value partition) | `Schema.Literal` union | `const TaskStatus = Schema.Literal("Pending", "InProgress", "Completed", "Blocked")` |
| `owl:DatatypeProperty` | Schema field | `id: Schema.String.pipe(Schema.brand("AgentId"))` |
| `owl:ObjectProperty` | Typed reference or entity message | `sessionId: SessionId` (reference) or RPC call (message) |
| `owl:hasKey` | Branded ID type | `const AgentId = Schema.String.pipe(Schema.brand("AgentId"))` |
| `owl:disjointUnionOf` | `Schema.Union` with discriminator | `const MemoryTier = Schema.Union(WorkingMemory, EpisodicMemory, ...)` |
| `owl:FunctionalProperty` | Required single-value field | `hasStatus: TaskStatus` (not an array) |
| `owl:someValuesFrom` | Required field (non-optional) | `hasPersona: Persona` (mandatory on AIAgent) |
| `owl:minQualifiedCardinality` | Branded collection with min constraint | `sharedAcrossAgents: Schema.Array(AgentId).check(Schema.minLength(2))` |
| `rdfs:subClassOf` | Schema `extend` or class hierarchy | `class AIAgent extends Agent.extend<AIAgent>("AIAgent")({...})` |
| `owl:TransitiveProperty` | Graph traversal in query layer | `blocks/blockedBy` resolved transitively |
| `owl:inverseOf` | Bidirectional references in storage | Both sides maintained by repository |
| `prov:wasGeneratedBy` | Provenance metadata fields | `generatedBy: EventId, attributedTo: AgentId` |

---

## 4. Core Computational Model

### The Three Pillars

The architecture rests on three Effect Cluster primitives:

#### 4.1 Entities (Stateful Durable Actors)

An **Entity** is a long-lived, addressable, stateful unit that processes typed RPC messages. Entities are the primary organizational unit of the system.

**Properties:**
- **Addressable**: Every entity has a unique address (`EntityAddress` — a `Schema.Class` with three typed fields: `shardId: ShardId`, `entityType: EntityType`, `entityId: EntityId`)
- **Stateful**: Maintains internal state across messages (via Ref or external storage)
- **Durable**: Messages marked `Persisted` survive runner crashes and are replayed on recovery
- **Sharded**: Entities are distributed across runners via consistent hashing on entityId
- **Lifecycle-managed**: Idle entities are reaped; active entities stay in memory

**Entity types in this system:**

| Entity Type | Ontology Class | State | Key Messages |
|---|---|---|---|
| `AgentEntity` | AIAgent | Persona, config, active tools, permissions | Configure, GetStatus, UpdatePersona |
| `SessionEntity` | Session | Turn history, context window, working memory | ProcessTurn, GetHistory, Compact, End |
| `ConversationEntity` | Conversation | Session chain, common ground | StartSession, ContinueSession, GetGround |
| `MemoryEntity` | MemoryTier(s) | Memory items per tier | Encode, Retrieve, Consolidate, Forget |
| `IntegrationEntity` | Integration | Connection state, capabilities | Connect, Disconnect, DiscoverCapabilities |
| `SchedulerEntity` | Schedule | Schedule definitions, trigger bindings, status, last/next execution metadata | CreateSchedule, Pause, Resume, Cancel, ListDue, RecordExecution |

**Entity Definition Pattern (Effect v4)**:

Entities are defined using `Entity` from `effect/unstable/cluster` with typed RPC protocols defined via `Rpc.make()` from `effect/unstable/rpc`:

```typescript
import { Entity, ClusterSchema } from "effect/unstable/cluster"
import { Rpc, RpcGroup, RpcSchema } from "effect/unstable/rpc"
import { Schema } from "effect"

// Define typed RPC messages
class GetStatus extends Rpc.make("GetStatus", {
  success: AgentStatus
}) {}

class Configure extends Rpc.make("Configure", {
  success: Schema.Void,
  payload: { config: AgentConfig }
}).annotate(ClusterSchema.Persisted, true) {}

// For streaming responses:
class ProcessTurn extends Rpc.make("ProcessTurn", {
  success: RpcSchema.Stream(TurnOutput, TurnError),
  payload: { input: TurnInput },
  stream: true
}).annotate(ClusterSchema.Persisted, true) {}

// Group into entity protocol
const AgentRpcs = RpcGroup.make(
  GetStatus,
  Configure
)

// Define entity with shard group
const AgentEntity = Entity.make("Agent", AgentRpcs)
  .annotateRpcs(ClusterSchema.ShardGroup, () => "agent")
```

**Shard Groups**: Each entity type is assigned to a shard group via `.annotateRpcs(ClusterSchema.ShardGroup, (entityId) => groupName)`. The default group is `"default"`. Shard groups control how entities are distributed across runners.

#### 4.2 Workflows (Durable Multi-Step Processes)

A **Workflow** is a durable, multi-step computation that survives crashes. Workflows are checkpointed — on recovery, they resume from the last completed activity, not from the beginning.

**Properties:**
- **Durable**: Execution state is persisted; workflows resume after crashes
- **Composed of Activities**: Each step is an individually retriable activity
- **Checkpointed**: Progress is saved after each activity completes
- **Cancellable**: Can be interrupted via `workflow.interrupt()` and resumed via `workflow.resume()`
- **Pollable**: Execution status can be checked via `workflow.poll(executionId)`
- **Triggered by entities**: An entity can spawn a workflow by calling `workflow.execute(payload)` inside an RPC handler

**Workflow Definition Pattern (Effect v4)**:

```typescript
import { Workflow, Activity } from "effect/unstable/workflow"
import { Effect, Schema } from "effect"

// Define activities as retriable units
const ClassifyDialogAct = Activity.make("ClassifyDialogAct", {
  successSchema: DialogAct,
  errorSchema: AiError,
  execute: (message: Message) => Effect.gen(function*() {
    // LLM classification call
    return yield* languageModel.generateObject({ ... })
  })
})

// Define workflow composing activities
const TurnProcessingWorkflow = Workflow.make("TurnProcessing", {
  payloadSchema: TurnInput,
  successSchema: Turn,
  errorSchema: TurnError,
  execute: (payload, executionId) => Effect.gen(function*() {
    const dialogAct = yield* ClassifyDialogAct(payload.message)
    const memories = yield* RetrieveMemory(payload)
    const response = yield* InvokeModel(payload, memories)
    yield* EncodeMemory(response)
    return new Turn({ ... })
  })
})
```

**Workflow types in this system:**

| Workflow | Ontology Concept | Activities | Trigger |
|---|---|---|---|
| `DeliberationWorkflow` | Deliberation (BDI) | ConsiderBeliefs, ConsiderDesires, ProduceIntention, CreatePlan | Goal created or updated |
| `PlanExecutionWorkflow` | Plan + Task[] | ExecuteTask (per task, respecting dependencies) | Intention committed |
| `TurnProcessingWorkflow` | Turn + ModelInvocation | ClassifyIntent, RetrieveMemory, InvokeModel, ExecuteTools, EncodeMem | Session receives new turn |
| `ErrorRecoveryWorkflow` | ErrorRecoveryEvent | Retry, Replan, Rollback (strategy selection) | Activity failure in any workflow |
| `CompactionWorkflow` | CompactionEvent | SelectItems, Summarize, UpdateTiers, RecordDispositions | Context window approaching capacity |
| `CapabilityDiscoveryWorkflow` | CapabilityDiscoveryEvent | QueryService, ParseCapabilities, RegisterTools | Integration connected |
| `ConsolidationWorkflow` | Consolidation (MemoryOp) | SelectEpisodes, ExtractFacts, StoreSemantic, DecayEpisodic | Periodic or triggered |
| `ScheduleExecutionWorkflow` | Schedule + ScheduledExecution | EvaluateDueSchedules, EnforceConcurrencyPolicy, ExecuteScheduledAction, RecordExecutionOutcome | Scheduler tick or EventTrigger |

#### 4.3 Activities (Retriable Units of Work)

An **Activity** is a single unit of work within a workflow. Activities are the boundary of retry — if an activity fails, it can be retried without re-executing previous activities.

**Properties:**
- **Retriable**: Failed activities can be retried with configurable `interruptRetryPolicy` (a `Schedule`). Default: exponential backoff with 10 max retries.
- **Idempotent** (ideally): Activities should produce the same result on replay
- **Side-effecting**: Activities are where real work happens (LLM calls, DB writes, tool execution)
- **Typed**: Input and output schemas are defined via `successSchema` and `errorSchema`, enabling durable serialization
- **Yieldable**: Activities implement `Effect.Yieldable` and can be yielded directly inside workflow generators

**Key activities:**

| Activity | Ontology Concept | Side Effects | Retry Strategy |
|---|---|---|---|
| `InvokeModel` | ModelInvocation | LLM API call | Exponential backoff, 3 attempts |
| `ExecuteTool` | ToolInvocation | Tool-specific | Configurable per tool |
| `EncodeMemory` | Encoding (MemoryOp) | SQLite write | Immediate retry, 2 attempts |
| `RetrieveMemory` | Retrieval (MemoryOp) | SQLite read | Immediate retry, 2 attempts |
| `EvaluatePolicy` | PermissionPolicy check | Read policies | No retry (deterministic) |
| `CheckTokenBudget` | AgentQuota check | Read agent quota | No retry (deterministic) |
| `WriteAuditEntry` | AuditEntry | SQLite append | Retry until success |
| `SendMessage` | Message via Channel | Network I/O | Exponential backoff |
| `ClassifyDialogAct` | DialogAct | LLM call (fast) | Exponential backoff, 2 attempts |
| `EvaluateDueSchedules` | Schedule + Trigger | SQLite read + trigger evaluation | Immediate retry, 2 attempts |
| `RecordScheduledExecution` | ScheduledExecution | SQLite write | Retry until success |

### How They Compose

```
User sends message
    │
    ▼
SessionEntity receives ProcessTurn message
    │
    ├─ Spawns TurnProcessingWorkflow
    │       │
    │       ├─ Activity: ClassifyDialogAct
    │       │     └─ Determines CommunicativeFunction (Inform/Request/Clarify/...)
    │       │
    │       ├─ Activity: EvaluatePolicy
    │       │     └─ Checks PermissionPolicy, SafetyConstraint
    │       │     └─ Writes AuditEntry
    │       │
    │       ├─ Activity: CheckTokenBudget
    │       │     └─ Reads AgentEntity quota state
    │       │     └─ Fails with TokenBudgetExceeded if over budget
    │       │
    │       ├─ Activity: RetrieveMemory
    │       │     └─ Queries relevant memories across tiers
    │       │     └─ Assembles context for LLM
    │       │
    │       ├─ Activity: InvokeModel
    │       │     └─ Calls LanguageModel.generateText/streamText
    │       │     └─ Includes tool definitions from AgentEntity
    │       │     └─ Returns response with possible tool calls
    │       │
    │       ├─ Activity: ExecuteTool (0..N, parallel)
    │       │     └─ For each ToolCallPart in response
    │       │     └─ Validates against PermissionPolicy
    │       │     └─ Executes tool handler
    │       │     └─ Records ToolResult, ComplianceStatus
    │       │
    │       ├─ Activity: EncodeMemory
    │       │     └─ Stores new Episode in EpisodicMemory
    │       │     └─ Updates Claims in SemanticMemory if new facts
    │       │     └─ Updates MemoryBlocks if preferences changed
    │       │
    │       ├─ Activity: UpdateCommonGround
    │       │     └─ Records GroundingAct with AcceptanceEvidence
    │       │
    │       └─ Returns Turn with ContentBlocks
    │
    ├─ Updates context window token tracking
    ├─ Updates agent token budget (tokensConsumed += actual usage)
    │
    ├─ If context window near capacity:
    │     └─ Spawns CompactionWorkflow
    │
    └─ Sends response back to client
```

### Failure Recovery Flow

```
Activity fails (e.g., InvokeModel returns RateLimited)
    │
    ├─ Workflow engine checks retry schedule
    │     ├─ If retries remaining: RetryAttempt (increment hasAttemptCount)
    │     └─ If retries exhausted: Spawn ErrorRecoveryWorkflow
    │
    ▼
ErrorRecoveryWorkflow
    │
    ├─ Activity: ClassifyFailure
    │     └─ Determines FailureType (Timeout, AuthenticationFailure, RateLimited, etc.)
    │
    ├─ Activity: SelectStrategy (based on FailureType)
    │     ├─ Timeout/RateLimited → RetryAttempt with backoff
    │     ├─ AuthenticationFailure → Escalate to user
    │     ├─ DependencyFailure → ReplanEvent (find alternative)
    │     └─ ConfigurationError → RollbackEvent (restore last good state)
    │
    ├─ Activity: ExecuteStrategy
    │     └─ Performs selected recovery action
    │
    └─ Records hasRecoveryOutcome: "resolved" | "escalated" | "abandoned"
```

---

## 5. Entity Definitions

### 5.1 AgentEntity

**Ontology source**: `pao:AIAgent`

**Identity**: `AgentId` (branded string, `owl:hasKey`)

**State**:
```
- persona: Persona                          # pao:hasPersona
- permissionMode: PermissionMode            # pao:operatesInMode
- availableTools: Map<ToolName, ToolDef>    # pao:hasAvailableTool
- integrations: Set<IntegrationId>          # pao:hasIntegration
- model: FoundationModelConfig              # pao:usesModel
- hooks: Array<HookDefinition>              # pao:hasHook
- externalServices: Set<ServiceId>          # pao:hasExternalService
- beliefs: Map<ClaimId, Belief>             # pao:heldBelief (BDI)
- desires: Set<DesireId>                    # pao:holdsDesire (BDI)
- activeGoals: Set<GoalId>                  # pao:pursuesGoal
- sandboxPolicy: SandboxPolicy              # pao:enforcedBySandboxPolicy
- quota: AgentQuota                          # pao:hasQuota (resource limits)
  - tokenBudget: number                     # pao:hasTokenBudget (total tokens per period)
  - budgetPeriod: QuotaPeriod               # pao:hasQuotaPeriod (Daily|Monthly|Yearly|Lifetime)
  - budgetResetAt: Option<DateTime>         # Next budget reset timestamp
  - tokensConsumed: number                  # Running counter for current period
  - memoryByteLimit: Option<number>         # pao:hasMemoryByteLimit (max bytes across all tiers)
  - toolInvocationLimits: Map<ToolName, ToolQuota>  # Per-tool invocation caps
```

**RPC Protocol** (messages this entity accepts):
```
- Configure(config: AgentConfig) → void
- GetStatus() → AgentStatus
- UpdatePersona(persona: Persona) → void
- RegisterTool(tool: ToolDefinition) → void
- RemoveTool(toolName: string) → void
- AddBelief(belief: Belief) → void
- SetDesire(desire: Desire) → void
- PursueGoal(goal: Goal) → GoalId          # Triggers DeliberationWorkflow
- GetBeliefs() → Array<Belief>
- GetActiveGoals() → Array<Goal>
- SpawnSubAgent(config: SubAgentConfig) → AgentId
```

**Persistence**: State persisted to SQLite on mutation. Restored on entity activation.

**Shard group**: `"agent"` — agents are long-lived, low-count entities.

### 5.2 SessionEntity

**Ontology source**: `pao:Session`

**Identity**: `SessionId` (branded string, `owl:hasKey`)

**State**:
```
- conversationId: ConversationId            # pao:partOfConversation
- status: SessionStatus                     # pao:hasStatus (Active|Ended|Interrupted)
- participants: Set<AgentId>                # pao:hasParticipant
- turns: Array<TurnRecord>                  # ordered by hasTurnIndex
- contextWindow: ContextWindowState         # pao:hasContextWindow
  - tokenCapacity: number                   # pao:hasTokenCapacity
  - tokensUsed: number                      # pao:hasTokensUsed
- workingMemory: Array<MemoryItem>          # current context items
- continuedFrom: Option<SessionId>          # pao:continuedFrom
- temporalExtent: TemporalInterval          # pao:hasTemporalExtent
- channel: ChannelType                      # pao:sentViaChannel
```

**RPC Protocol**:
```
- ProcessTurn(input: TurnInput) → Stream<TurnOutput>   # Main interaction loop
- GetHistory(options?: HistoryOptions) → Array<Turn>
- GetContextWindow() → ContextWindowState
- Compact() → CompactionResult                          # Triggers CompactionWorkflow
- End() → SessionSummary                                # Status → Ended
- Interrupt() → void                                    # Status → Interrupted
- Continue() → SessionId                                # Creates new session, links via continuedFrom
```

**Persistence**: Turn history in SQLite. Working memory reconstructed from turns + memory tiers.

**Crash-safe Working Memory reconstruction**: Working memory is volatile (in-memory during a session) and must be recoverable after a runner crash. The reconstruction protocol:

1. **On entity activation**: Load last N turns from SQLite (`turns` table, ordered by `turn_index`)
2. **Replay context**: Re-assemble the context window from persisted turns' `content_blocks` + model invocation metadata
3. **Restore scratchpad**: The `EncodeMemory` activity (step 8 in TurnProcessingWorkflow) persists all memory items durably before the turn completes. Any scratchpad content not yet persisted belongs to the in-flight workflow, which resumes from its last checkpoint.
4. **In-flight turn recovery**: If a crash occurs mid-turn, the durable workflow resumes from the last completed activity. Activities before `EncodeMemory` are replayed; activities after are executed fresh. The `AssemblePrompt` activity is pure (no side effects) and deterministically reconstructs working memory from persisted state.
5. **Token counter recovery**: `tokensUsed` and `tokenCapacity` are persisted in the `sessions` table and restored on activation. The `InvokeModel` activity records actual token usage, so counters are crash-consistent.

**Shard group**: `"session"` — sessions are medium-lived, higher-count.

**Key behavior**: The `ProcessTurn` message is the heart of the system. It spawns a `TurnProcessingWorkflow` and streams the response back to the caller. The workflow is durable — if the runner crashes mid-turn, the workflow resumes from the last completed activity.

### 5.3 ConversationEntity

**Ontology source**: `pao:Conversation`

**Identity**: `ConversationId` (branded string, `owl:hasKey`)

**State**:
```
- sessions: Array<SessionId>                # ordered, linked via continuedFrom/continuedBy
- commonGround: CommonGroundState           # pao:CommonGround
- participants: Set<AgentId>                # all agents across sessions
- temporalExtent: TemporalInterval          # pao:hasTemporalExtent
```

**RPC Protocol**:
```
- StartSession(config: SessionConfig) → SessionId
- ContinueSession(fromSessionId: SessionId) → SessionId
- GetCommonGround() → CommonGroundState
- UpdateCommonGround(act: GroundingAct) → void
- GetSessions() → Array<SessionSummary>
```

**Shard group**: `"conversation"` — long-lived, lower-count.

### 5.4 MemoryEntity

**Ontology source**: `pao:MemoryTier` (all 4 tiers managed by one entity per agent)

**Identity**: `AgentId` (one memory entity per agent)

**State**:
```
- episodic: EpisodicStore                   # pao:EpisodicMemory
  - episodes: indexed by time, topic        # pao:Episode instances
- semantic: SemanticStore                   # pao:SemanticMemory
  - claims: Map<ClaimId, Claim>             # with confidence, evidence
  - facts: indexed by topic                 # general knowledge
- procedural: ProceduralStore               # pao:ProceduralMemory
  - systemPrompts: Map<string, string>      # via KeyValueStore
  - learnedPolicies: Array<Policy>
- retentionPolicies: Map<TierId, RetentionPolicy>
```

**RPC Protocol**:
```
- Encode(item: MemoryItem, tier: MemoryTierType) → MemoryItemId
- Retrieve(query: MemoryQuery) → Array<MemoryItem>      # Cross-tier search
- Consolidate(options?: ConsolidationOptions) → ConsolidationResult
- Forget(itemId: MemoryItemId) → void
- Rehearse(itemId: MemoryItemId) → void                  # Updates lastAccessTime
- GetBlock(key: string) → Option<MemoryBlock>            # Letta-style core memory
- SetBlock(key: string, value: string) → void
- Erase(request: ErasureRequest) → ErasureEvent          # Privacy-driven deletion
```

**Persistence**:
- Episodic + Semantic → SQLite (structured, queryable, time-indexed)
- Procedural → KeyValueStore (file-based, fast reads)
- Memory blocks → KeyValueStore (simple key-value)

**Shard group**: `"memory"` — one per agent, long-lived.

### 5.5 IntegrationEntity

**Ontology source**: `pao:Integration`, `pao:ExternalService`

**Identity**: `IntegrationId` (branded string)

**State**:
```
- service: ExternalServiceConfig            # pao:ExternalService
  - endpoint: URI                           # pao:hasEndpoint
  - transport: ServiceTransport             # pao:hasServiceTransport (stdio|sse|http)
  - identifier: string                      # pao:hasServiceIdentifier
- status: IntegrationStatus                 # pao:hasIntegrationStatus
- connection: Option<ConnectionState>       # pao:ServiceConnection
- capabilities: Array<ServiceCapability>    # pao:exposesCapability
- providedTools: Array<ToolDefinition>      # pao:providesTool
```

**RPC Protocol**:
```
- Connect() → ConnectionStatus
- Disconnect() → void
- DiscoverCapabilities() → Array<ServiceCapability>     # Triggers CapabilityDiscoveryWorkflow
- GetStatus() → IntegrationStatus
- InvokeTool(name: string, input: unknown) → ToolResult
```

**Shard group**: `"integration"` — medium-lived, tied to agent lifecycle.

### 5.6 SchedulerEntity

**Ontology source**: `pao:Schedule`, `pao:RecurrencePattern`, `pao:Trigger`, `pao:ScheduledExecution`

**Identity**: `ScheduleId` (branded string)

**State**:
```
- ownerAgentId: AgentId                      # pao:ownedByAgent (functional)
- recurrencePattern: RecurrencePattern       # pao:hasRecurrencePattern (functional)
  - label: string                            # rdfs:label (required by SHACL)
  - cronExpression?: string                  # pao:hasCronExpression
  - intervalSeconds?: number                 # pao:hasIntervalSeconds
- trigger: Trigger                           # pao:activatedBy (functional)
  - type: CronTrigger | IntervalTrigger | EventTrigger
  - note: ontology trigger subclasses are marker types in PAO v0.8.0 (no additional required fields)
- actionRef: string                          # Stable reference to pao:schedulesAction individual
- scheduleStatus: ScheduleStatus             # pao:hasScheduleStatus (functional)
- concurrencyPolicy: ConcurrencyPolicy       # pao:hasConcurrencyPolicy (functional)
- allowsCatchUp: boolean                     # pao:allowsCatchUp (functional)
- autoDisableAfterRun: boolean               # Implementation metadata for one-shot behavior
- catchUpWindowSeconds: number               # Max age of due windows eligible for catch-up
- maxCatchUpRunsPerTick: number              # Backfill throttle to prevent catch-up storms
- lastExecutionAt: Option<DateTime>
- nextExecutionAt: Option<DateTime>
```

**Domain Port Contract (Phase 1, implemented)**:
```
- upsertSchedule(schedule: ScheduleRecord) → void
- listDue(now: DateTime) → Array<DueScheduleRecord>
  - DueScheduleRecord = { schedule, dueAt, triggerSource }
- recordExecution(event: ScheduledExecutionRecord) → void
  - ScheduledExecutionRecord includes dueAt + triggerSource metadata in addition to temporal extent + outcome
```

**Entity Command Surface (Phase 2 target)**:
```
- CreateSchedule(input: CreateScheduleInput) → ScheduleId
- UpdateSchedule(scheduleId: ScheduleId, patch: SchedulePatch) → void
- PauseSchedule(scheduleId: ScheduleId) → void
- ResumeSchedule(scheduleId: ScheduleId) → void
- DisableSchedule(scheduleId: ScheduleId) → void
- TriggerNow(scheduleId: ScheduleId) → ScheduledExecutionId
- ListDue(now: DateTime) → Array<DueScheduleRecord>
- RecordExecution(event: ScheduledExecutionRecord) → void
```

**Validation constraints (from SHACL)**:
- `Schedule` must include exactly one owner, trigger, recurrence pattern, action, schedule status, and concurrency policy.
- `RecurrencePattern` must include at least one of `hasCronExpression` or `hasIntervalSeconds`.
- `ScheduledExecution` must include `executionOf`, `hasTemporalExtent`, and `hasExecutionOutcome`.
- MVP normalization rule: exactly one of `cronExpression` or `intervalSeconds` should be set per schedule to keep recurrence evaluation deterministic.

**Lifecycle + execution contract (resolved on 2026-02-24)**:
- Initial status is `ScheduleActive` unless explicitly created as paused.
- Allowed status transitions:
  - `ScheduleActive` -> `SchedulePaused` | `ScheduleDisabled` | `ScheduleExpired`
  - `SchedulePaused` -> `ScheduleActive` | `ScheduleDisabled`
  - `ScheduleExpired` -> `ScheduleDisabled`
  - `ScheduleDisabled` is terminal.
- One-shot schedules are represented as interval schedules (`hasIntervalSeconds`) with `autoDisableAfterRun = true`.
- For one-shot schedules, after the first terminal execution record (`ExecutionSucceeded` | `ExecutionFailed` | `ExecutionSkipped`), the schedule transitions to `ScheduleDisabled` and clears `nextExecutionAt`.
- Every scheduler decision (run, skip, replace, disable-after-run) must produce a durable `ScheduledExecution` record.

**Shard group**: `"schedule"` — medium-lived, high-read, low-write.

> **Implementation note (API-verified for `effect@4.0.0-beta.11`)**: The `SchedulerEntity` should build on `ClusterCron.make` from `effect/unstable/cluster/ClusterCron` and `DeliverAt.symbol` from `effect/unstable/cluster/DeliverAt`, rather than implementing parallel scheduling infrastructure. `ClusterCron` provides cluster-aware, leader-elected cron execution; `DeliverAt` provides deferred delivery metadata.
>
> **Phasing rule**:
> - **Phase 1 (current)**: Port-backed due-window evaluation and execution recording (`upsertSchedule` / `listDue` / `recordExecution`) with in-memory and SQL adapters.
> - **Phase 2**: Wrap the same port contract with `ClusterCron` + `DeliverAt` + `ClusterWorkflowEngine` orchestration for distributed, replay-safe runtime scheduling.

---

## 6. Workflow Definitions

### 6.1 TurnProcessingWorkflow

**Ontology source**: `pao:Turn`, `pao:ModelInvocation`, `pao:ToolInvocation`

**Trigger**: `SessionEntity.ProcessTurn` message

**Input**:
```
- agentId: AgentId
- sessionId: SessionId
- userMessage: Message (with ContentBlocks)
- conversationContext: ConversationContext
```

**Activities (in order)**:

1. **ClassifyDialogAct**
   - Input: userMessage
   - Output: `DialogAct` with `CommunicativeFunction`
   - Side effects: Fast LLM classification call
   - Retry: 2 attempts, exponential backoff
   - Ontology: `pao:DialogAct`, `pao:hasCommunicativeFunction`

2. **EvaluatePolicy**
   - Input: agentId, intended actions (from message classification)
   - Output: `AuthorizationDecision` (Allow | Deny | RequireApproval)
   - Side effects: Reads PermissionPolicy, writes AuditEntry
   - Retry: No retry (deterministic)
   - Ontology: `pao:PermissionPolicy`, `pao:AuditEntry`, `pao:AuthorizationDecision`

3. **CheckTokenBudget**
   - Input: agentId, estimated input tokens (from prompt assembly)
   - Output: `BudgetCheckResult` (Allowed | ExceededWithRemaining)
   - Side effects: Reads AgentEntity quota state
   - Retry: No retry (deterministic)
   - On exceeded: Fail with `TokenBudgetExceeded` error, write `AuditEntry` with quota-specific reason
   - Ontology: `pao:AgentQuota`, `pao:hasTokenBudget`

4. **RetrieveMemory**
   - Input: userMessage, conversationContext, agentId
   - Output: `Array<MemoryItem>` (relevant items from all tiers)
   - Side effects: SQLite reads, KeyValueStore reads, updates `hasLastAccessTime`
   - Retry: 2 attempts, immediate
   - Ontology: `pao:Retrieval`, `pao:MemoryItem`

5. **AssemblePrompt**
   - Input: system prompt (from ProceduralMemory), retrieved memories, turn history, user message
   - Output: Complete `Prompt` for LLM
   - Side effects: None (pure computation)
   - Retry: Not needed
   - Note: This is where WorkingMemory is constructed — the LLM context window

6. **InvokeModel**
   - Input: assembled Prompt, GenerationConfiguration, ToolDefinitions
   - Output: `GenerateTextResponse` (text + tool calls + reasoning + usage)
   - Side effects: LLM API call via `effect/unstable/ai` LanguageModel service
   - Retry: 3 attempts, exponential backoff (respects FailureType)
   - Ontology: `pao:ModelInvocation`, `pao:GenerationConfiguration`, `pao:FoundationModel`

7. **ExecuteTools** (0..N, parallel with concurrency limit)
   - Input: `Array<ToolCallPart>` from model response
   - Output: `Array<ToolResult>` with ComplianceStatus
   - Side effects: Tool-specific (file I/O, HTTP calls, DB queries, etc.)
   - Retry: Configurable per tool definition
   - Policy: Each tool invocation checked against PermissionPolicy
   - Audit: Each invocation creates AuditEntry with AuthorizationDecision
   - Ontology: `pao:ToolInvocation`, `pao:ToolResult`, `pao:ComplianceStatus`

8. **EncodeMemory**
   - Input: Turn content, tool results, model reasoning
   - Output: `Array<MemoryItemId>` (items stored)
   - Side effects: SQLite writes (episodic), KeyValueStore writes (if preferences detected)
   - Retry: 2 attempts, immediate
   - Ontology: `pao:Encoding`, `pao:Episode`, `pao:Claim`

9. **UpdateCommonGround**
   - Input: Turn results, dialog act classification
   - Output: `GroundingAct` with `AcceptanceEvidence`
   - Side effects: Updates ConversationEntity's CommonGround
   - Retry: 1 attempt
   - Ontology: `pao:GroundingAct`, `pao:CommonGround`, `pao:AcceptanceEvidence`

**Output**: `Turn` with `ContentBlocks`, `DialogAct`, token usage, and metadata.

**Streaming**: The `ProcessTurn` RPC must be defined with `RpcSchema.Stream(TurnOutput, TurnError)` to support streaming. The entity's reply uses `Reply.Chunk` (with sequence numbers) rather than `Reply.WithExit`. The `InvokeModel` activity streams `TextDeltaPart` chunks back through the workflow to the SessionEntity, which streams them to the client via the RPC chunked reply protocol. Tool executions and memory encoding happen after the model response completes.

### 6.2 DeliberationWorkflow

**Ontology source**: `pao:Deliberation` (BDI model)

**Trigger**: `AgentEntity.PursueGoal` message

**Input**:
```
- agentId: AgentId
- goal: Goal
```

**Activities**:

1. **ConsiderBeliefs**
   - Input: agentId, goal
   - Output: `Array<Belief>` (relevant beliefs)
   - Side effects: Reads from MemoryEntity (semantic tier)
   - Ontology: `pao:considersBelief`

2. **ConsiderDesires**
   - Input: agentId, goal, relevant beliefs
   - Output: `Array<Desire>` (compatible desires)
   - Side effects: Reads agent desires
   - Ontology: `pao:considersDesire`

3. **ProduceIntention**
   - Input: beliefs, desires, goal
   - Output: `Intention` with `Justification`
   - Side effects: LLM reasoning call to formulate intention
   - Ontology: `pao:producesIntention`, `pao:Intention`, `pao:Justification`

4. **CreatePlan**
   - Input: intention, available tools, agent capabilities
   - Output: `Plan` with ordered `Array<Task>` and dependency graph
   - Side effects: LLM planning call, persists Plan to storage
   - Ontology: `pao:Plan`, `pao:hasTask`, `pao:achievesGoal`

**Output**: `Plan` ready for execution. Triggers `PlanExecutionWorkflow`.

### 6.3 PlanExecutionWorkflow

**Ontology source**: `pao:Plan`, `pao:Task`

**Trigger**: `DeliberationWorkflow` completion

**Input**:
```
- plan: Plan
- tasks: Array<Task> (with dependency graph via blockedBy/blocks)
```

**Activities** (dynamic, based on task graph):

For each task in topological order (respecting `blockedBy` dependencies):

1. **CheckTaskPreconditions**
   - Verifies all `blockedBy` tasks are Completed
   - Checks for `Checkpoint` requirements (`CheckpointDecision`: Approved | Rejected | Deferred)

2. **ExecuteTask**
   - Task status: Pending → InProgress
   - Executes task-specific logic (may involve ToolInvocations, sub-agent spawning, etc.)
   - Task status: InProgress → Completed (or Blocked on failure)

3. **RecordTaskOutcome**
   - Persists task result and status transition
   - Updates plan progress

**Parallelism**: Independent tasks (no `blockedBy` relationship) execute concurrently.

**Failure handling**: If a task fails, the workflow spawns an `ErrorRecoveryWorkflow`. Based on the recovery outcome:
- `resolved` → retry the task
- `escalated` → pause the plan, notify user
- `abandoned` → mark task as Blocked, attempt to continue with non-dependent tasks

### 6.4 CompactionWorkflow

**Ontology source**: `pao:CompactionEvent`, `pao:CompactionDisposition`

**Trigger**: SessionEntity context window approaching capacity (`tokensUsed / tokenCapacity > threshold`)

**Activities**:

1. **SelectItemsForCompaction**
   - Analyzes turns and memory items in working memory
   - Scores by recency, relevance, sensitivity
   - Output: items with proposed `ItemFate` (Preserved | Dropped | Summarized | Archived)

2. **SummarizeItems**
   - For items with fate `Summarized`: LLM summarization call
   - Produces summary MemoryItem stored in SemanticMemory
   - Ontology: `pao:producedSummary`

3. **UpdateMemoryTiers**
   - Items with fate `Archived`: move from WorkingMemory to EpisodicMemory
   - Items with fate `Dropped`: remove from WorkingMemory
   - Items with fate `Preserved`: keep in WorkingMemory

4. **RecordDispositions**
   - Creates `CompactionDisposition` for each item with `fateReason`
   - Links to `CompactionEvent` via `pao:compactedItem`

### 6.5 ErrorRecoveryWorkflow

**Ontology source**: `pao:ErrorRecoveryEvent`, `pao:FailureType`

**Trigger**: Manually spawned from workflow code when activity retries are exhausted. The workflow engine does not automatically spawn recovery workflows — the parent workflow must explicitly call `ErrorRecoveryWorkflow.execute(...)` in its error handling path.

**Input**:
```
- failedActivity: ActivityDescriptor
- error: Cause<E>
- context: WorkflowContext
```

**Activities**:

1. **ClassifyFailure**
   - Maps error to `FailureType`: Timeout | AuthenticationFailure | RateLimited | DependencyFailure | ConfigurationError | NetworkError

2. **SelectStrategy**
   - Based on FailureType and attempt count:
     - Timeout → RetryAttempt (with increasing delay)
     - RateLimited → RetryAttempt (respect rate limit headers)
     - AuthenticationFailure → Escalate to user
     - DependencyFailure → ReplanEvent (find alternative approach)
     - ConfigurationError → RollbackEvent (restore last known good)
     - NetworkError → RetryAttempt (with jitter)

3. **ExecuteStrategy**
   - Performs the selected recovery action
   - Records `hasAttemptCount`, `hasRecoveryOutcome`

### 6.6 ConsolidationWorkflow

**Ontology source**: `pao:Consolidation` (MemoryOperation)

**Trigger**: Periodic (e.g., end of session) or explicit request

**Activities**:

1. **SelectEpisodes**
   - Queries EpisodicMemory for episodes eligible for consolidation
   - Considers `hasLastAccessTime`, `isEvictionCandidate`, `retentionPeriodDays`

2. **ExtractFacts**
   - LLM call to extract generalizable facts from episodes
   - Produces `Claim` objects with `hasConfidence` and `hasEvidence`

3. **StoreSemanticMemory**
   - Writes extracted Claims to SemanticMemory tier
   - Deduplicates against existing claims

4. **DecayEpisodic**
   - Marks consolidated episodes for eventual `Forgetting`
   - Respects `RetentionPolicy` constraints

### 6.7 ScheduleExecutionWorkflow

**Ontology source**: `pao:Schedule`, `pao:ScheduledExecution`, `pao:ExecutionOutcome`

**Trigger**: periodic scheduler tick, explicit `TriggerNow`, or `EventTrigger` arrival

**Input**:
```
- now: DateTime
- candidateSchedules: Array<ScheduleId>
```

**Activities**:

1. **EvaluateDueSchedules**
   - Reads active schedules and evaluates recurrence pattern + trigger
   - Supports cron and interval recurrence patterns
   - Computes due windows from `lastExecutionAt` to `now`
   - Applies `allowsCatchUp` policy for missed windows after downtime
   - Catch-up policy:
     - If `allowsCatchUp = false`: skip backfill runs and advance `nextExecutionAt` to the next future window
     - If `allowsCatchUp = true`: execute at most `maxCatchUpRunsPerTick` windows, bounded by `catchUpWindowSeconds`
   - Phase split:
     - **Phase 1**: interval due windows are computed in `SchedulePort`; cron/event/manual triggers are expressed as `nextExecutionAt` + `triggerSource` by the caller/runtime.
     - **Phase 2**: `ClusterCron` + `DeliverAt` become the primary trigger source for cron/event dispatch and due-window materialization.

2. **EnforceConcurrencyPolicy**
   - Applies `ConcurrencyAllow` | `ConcurrencyForbid` | `ConcurrencyReplace`
   - Decides run/skip/replace for overlapping executions
   - Policy semantics:
     - `ConcurrencyAllow`: run a new execution even if one is in flight
     - `ConcurrencyForbid`: write `ExecutionSkipped` with reason `ConcurrencyForbid` when overlap exists
     - `ConcurrencyReplace`: mark overlapping in-flight execution as replaced (`ExecutionSkipped`), then start the new execution

3. **ExecuteScheduledAction**
   - Executes target action (e.g., plan execution, compaction, memory consolidation, or custom automation action)
   - Optionally initiates a session (`pao:initiatedSession`) when action starts a conversation flow

4. **RecordExecutionOutcome**
   - Persists `ScheduledExecution` with:
     - `dueAt` (the scheduled window evaluated by the scheduler)
     - `triggerSource` (`CronTick` | `IntervalTick` | `Event` | `Manual`) — implementation metadata, not yet in PAO SHACL constraints
     - `executionOf` (schedule link)
     - `hasTemporalExtent` (start/end interval)
     - `hasExecutionOutcome` (`ExecutionSucceeded` | `ExecutionFailed` | `ExecutionSkipped`)
     - optional skip/concurrency reason when outcome is `ExecutionSkipped`

**Output**: `Array<ScheduledExecutionSummary>` for observability and audit surfaces.

**Resolved scheduling decisions (2026-02-24)**:
- One-shot semantics are implemented as interval recurrence + `autoDisableAfterRun`.
- Catch-up is bounded by `catchUpWindowSeconds` and `maxCatchUpRunsPerTick`.
- Concurrency decisions are explicitly materialized as execution outcomes (run/skip/replace).
- `dueAt` and `triggerSource` are required execution metadata in runtime records for deterministic replay and audit joins.
- In MVP, concurrency policy evaluation lives in workflow logic; persistence-layer ports only store outcomes and schedule checkpoints.

---

## 7. Persistence Strategy

### 7.1 Storage Backend Selection

| Storage | Backend | Use Case | Why |
|---|---|---|---|
| **Cluster MessageStorage** | SQLite | Durable message delivery, workflow checkpoints | Required for crash recovery |
| **Cluster RunnerStorage** | SQLite | Shard coordination, runner health | Required for cluster operation |
| **Domain State** | SQLite | Entity state, turn history, memory items, audit log | Structured, queryable, transactional |
| **Scheduler State** | SQLite | Schedules, triggers, recurrence patterns, execution outcomes | Required for durable automation and replay-safe scheduling |
| **Procedural Memory** | KeyValueStore (file) | System prompts, learned behaviors, config | Fast reads, simple key-value |
| **Memory Blocks** | KeyValueStore (file) | Letta-style core memory blocks | Fast key-value access |

### 7.2 SQLite Schema (Core Tables)

```sql
-- Agent state (with quota tracking)
agents (agent_id PK, persona JSON, permission_mode, model_config JSON,
        token_budget INT, budget_period CHECK(budget_period IN ('Daily','Monthly','Yearly','Lifetime')),
        budget_reset_at DATETIME, tokens_consumed INT NOT NULL DEFAULT 0,
        memory_byte_limit INT, created_at, updated_at)
agent_tools (agent_id FK, tool_name, tool_definition JSON)
agent_beliefs (agent_id FK, claim_id FK, belief JSON)
agent_desires (agent_id FK, desire_id PK, desire JSON)

-- Conversations and sessions
conversations (conversation_id PK, created_at, common_ground JSON)
sessions (session_id PK, conversation_id FK, status, channel_type,
          continued_from FK, token_capacity, tokens_used, started_at, ended_at)

-- Turns and messages
turns (turn_id PK, session_id FK, conversation_id FK, turn_index,
       participant_agent_id FK, content_blocks JSON, dialog_act JSON,
       model_invocation_id FK, created_at)

-- Tool invocations
tool_invocations (invocation_id PK, turn_id FK, session_id FK, agent_id FK,
                  tool_name, input JSON, output JSON, compliance_status,
                  policy_id FK, invocation_group_id, created_at)

-- Tool invocation quotas (per-agent, per-tool limits)
tool_quotas (agent_id FK, tool_name, max_per_session INT, max_per_day INT,
             invocations_today INT NOT NULL DEFAULT 0, quota_reset_at DATETIME,
             PRIMARY KEY (agent_id, tool_name))

-- Memory items
memory_items (item_id PK, agent_id FK, tier, content JSON, topic,
              sensitivity_level, memory_scope, memory_source,
              retention_policy_id FK, last_access_time, is_eviction_candidate,
              attributed_to FK, generated_by FK, created_at)

-- Episodes (subtype of memory_item)
episodes (item_id FK PK, temporal_start, temporal_end, events JSON)

-- Claims (subtype of memory_item)
claims (item_id FK PK, claim_type, confidence REAL, evidence JSON, about_agent_id FK)

-- Goals, plans, tasks
goals (goal_id PK, agent_id FK, status, description, created_at)
plans (plan_id PK, goal_id FK, created_at)
tasks (task_id PK, plan_id FK, status, description, created_at)
task_dependencies (task_id FK, blocked_by_task_id FK)

-- Scheduling and automation
schedules (schedule_id PK, agent_id FK, recurrence_pattern_id FK, trigger_type,
           action_definition JSON,
           schedule_status CHECK(schedule_status IN ('ScheduleActive','SchedulePaused','ScheduleExpired','ScheduleDisabled')),
           concurrency_policy CHECK(concurrency_policy IN ('ConcurrencyAllow','ConcurrencyForbid','ConcurrencyReplace')),
           allows_catch_up BOOLEAN NOT NULL DEFAULT FALSE,
           auto_disable_after_run BOOLEAN NOT NULL DEFAULT FALSE,
           catch_up_window_seconds INTEGER NOT NULL DEFAULT 86400 CHECK(catch_up_window_seconds > 0),
           max_catch_up_runs_per_tick INTEGER NOT NULL DEFAULT 1 CHECK(max_catch_up_runs_per_tick > 0),
           last_execution_at, next_execution_at,
           created_at, updated_at)
recurrence_patterns (pattern_id PK, label NOT NULL,
                     cron_expression, interval_seconds,
                     CHECK((cron_expression IS NOT NULL) OR (interval_seconds IS NOT NULL AND interval_seconds > 0)))
scheduled_executions (execution_id PK, schedule_id FK,
                      due_at, trigger_source CHECK(trigger_source IN ('CronTick','IntervalTick','Event','Manual')),
                      outcome CHECK(outcome IN ('ExecutionSucceeded','ExecutionFailed','ExecutionSkipped')),
                      skip_reason,
                      concurrency_decision CHECK(concurrency_decision IN ('Allow','ForbidSkipped','ReplaceExisting') OR concurrency_decision IS NULL),
                      started_at, ended_at, initiated_session_id FK, created_at)

-- Governance
permission_policies (policy_id PK, agent_id FK, grants JSON, restricts JSON)
audit_entries (entry_id PK, invocation_id FK, decision, reason, log_id FK, created_at)
consent_records (consent_id PK, subject_agent_id FK, purpose, created_at)
retention_policies (policy_id PK, retention_period_days)

-- External services
external_services (service_id PK, endpoint URI, transport, identifier, name)
integrations (integration_id PK, service_id FK, agent_id FK, status, created_at)
service_capabilities (capability_id PK, service_id FK, type, definition JSON)

-- Observability
operational_metrics (metric_id PK, metric_name, entity_id, entity_type)
metric_observations (observation_id PK, metric_id FK, value REAL, recorded_at)
reliability_incidents (incident_id PK, entity_id, entity_type, recovery_id FK, created_at)
```

### 7.3 KeyValueStore Layout

All KeyValueStore paths are **namespace-scoped per agent**. Each agent's storage is rooted at `{agentId}/` and agents cannot access paths outside their namespace. This is enforced by the `SandboxPolicy` filesystem guard (Section 10.5).

```
{agentId}/                             # Agent namespace root (isolation boundary)
  procedural-memory/
    system-prompt                      # Main system prompt
    persona-prompt                     # Persona-specific instructions
    policies/
      {policyName}                     # Learned behavioral policies
    skills/
      {skillName}                      # Learned skill descriptions
  memory-blocks/
    {blockKey}                         # Letta-style core memory blocks
                                       # e.g., "human", "persona", "preferences"
  config/
    config                             # Agent configuration
    model-deployment                   # Current model deployment config
    generation-config                  # Generation parameters
  workspace/                           # Agent-scoped scratch files
    {filename}                         # Files created by tool executions
```

**Namespace enforcement**: The `KeyValueStore` Layer provided to each agent is constructed with a prefix scope of `{agentId}/`. All key operations (`get`, `set`, `remove`) are transparently prefixed, making cross-agent access impossible at the API level. This is independent of `SandboxPolicy` — even without a policy, the scoped KV Layer prevents namespace violations.

**Sub-agent namespaces**: Sub-agents spawned via `SpawnSubAgent` receive their own namespace (`{subAgentId}/`). They do not inherit the parent's namespace. Shared data between parent and sub-agent must go through the `SharedMemoryArtifact` mechanism (Section 8.4).

### 7.4 Migration to Cloud

The persistence layer is designed for easy migration:

| Local | Cloud | Migration Path |
|---|---|---|
| SQLite (bun:sqlite) | PostgreSQL | Swap the `Connection.Acquirer` (connection pool) and `Compiler` (SQL dialect) at Layer construction. The `SqlClient` interface from `effect/unstable/sql` remains unchanged. |
| KeyValueStore (file) | Redis or S3 | Change Layer providing KeyValueStore. Same KV interface from `effect/unstable/persistence`. |
| Single runner | Multi-runner | Replace `SingleRunner.layer` with `HttpRunner` or `SocketRunner`. Use `SqlRunnerStorage` for shard coordination. |

The key insight is that **all persistence goes through Effect abstractions** (`SqlClient`, `KeyValueStore`, `MessageStorage`, `RunnerStorage`). The concrete implementations are provided via Layers and can be swapped without changing any business logic. In v4, the SQL abstraction layer lives in `effect/unstable/sql` with driver-specific packages like `@effect/sql-sqlite-bun` providing the concrete `Connection.Acquirer`.

---

## 8. Memory Architecture

### 8.1 Four-Tier Model

The ontology defines a precise 4-tier memory model (`owl:disjointUnionOf`). Each tier has distinct characteristics:

| Tier | Ontology Class | Volatility | Storage | Access Pattern |
|---|---|---|---|---|
| **Working** | `pao:WorkingMemory` | Highest | In-memory (session state) | Read on every turn, rebuilt from context |
| **Episodic** | `pao:EpisodicMemory` | Medium | SQLite (time-indexed) | Write per turn, read on retrieval |
| **Semantic** | `pao:SemanticMemory` | Low | SQLite (topic-indexed) | Write on consolidation, read on retrieval |
| **Procedural** | `pao:ProceduralMemory` | Lowest | KeyValueStore (file) | Write rarely, read on session start |

> **Implementation note**: The `effect/unstable/eventlog` module (`EventLog`, `EventJournal`, `SqlEventLogServer`) is a strong candidate for episodic memory persistence. `EventJournal.write()` can persist per-turn episode events, `EventJournal.entries` supports historical retrieval, and `EventJournal.changes` provides a `PubSub.Subscription` for streaming memory changes. The module also includes `EventLogEncryption` for AES-GCM encryption of sensitive memory items.

### 8.2 Memory Operations

Five operations (`owl:disjointUnionOf`), mapped to MemoryEntity RPC methods:

| Operation | Ontology | When | From → To |
|---|---|---|---|
| **Encoding** | `pao:Encoding` | After each turn | New items → Episodic (or Semantic for facts) |
| **Retrieval** | `pao:Retrieval` | During turn processing | Query across all tiers → Working Memory |
| **Consolidation** | `pao:Consolidation` | End of session or periodic | Episodic → Semantic (extract generalizable facts) |
| **Forgetting** | `pao:Forgetting` | Retention policy expiry or compaction | Remove items respecting RetentionPolicy |
| **Rehearsal** | `pao:Rehearsal` | On repeated access | Updates `hasLastAccessTime`, strengthens item |

### 8.3 Memory Item Metadata

Every memory item carries provenance and governance metadata (from ontology restrictions):

```
MemoryItem:
  id: MemoryItemId
  tier: MemoryTierType                    # Which tier it's stored in
  content: string                         # pao:hasContent
  topic: Option<SKOSConcept>              # pao:hasTopic
  sensitivityLevel: SensitivityLevel      # pao:hasSensitivityLevel
  memoryScope: MemoryScope                # pao:hasMemoryScope (Session|Project|Global)
  memorySource: MemorySource              # pao:hasMemorySource (User|System|Agent)
  retentionPolicy: RetentionPolicyId      # pao:governedByRetention
  lastAccessTime: DateTime                # pao:hasLastAccessTime
  isEvictionCandidate: boolean            # pao:isEvictionCandidate
  attributedTo: AgentId                   # prov:wasAttributedTo
  generatedBy: EventId                    # prov:wasGeneratedBy
```

### 8.4 Multi-Agent Memory

The ontology supports shared memory (`pao:SharedMemoryArtifact`):

- Shared artifacts must be accessible to at least 2 agents (`minQualifiedCardinality 2`)
- Write conflicts (`pao:MemoryWriteConflict`) resolved by `PermissionPolicy`
- This maps to Cluster entities — agents on different shards accessing the same memory entity

---

## 9. AI Integration

### 9.1 Language Model Service

The `effect/unstable/ai` module provides a `LanguageModel` service with `generateText`, `generateObject`, and `streamText` methods. The architecture wraps this with ontology-aligned abstractions:

**FoundationModel** (ontology: `pao:FoundationModel`):
```
- modelId: ModelId (branded string, owl:hasKey)
- modelVersion: string
- provider: ModelProvider
```

**ModelDeployment** (ontology: `pao:ModelDeployment`):
```
- model: FoundationModel
- endpoint: URI (or provider-specific config)
- generationConfig: GenerationConfiguration
```

**GenerationConfiguration** (ontology: `pao:GenerationConfiguration`):
```
- temperature: number                     # pao:hasTemperature
- topP: number                            # pao:hasTopP
- maxOutputTokens: number                 # pao:hasMaxOutputTokens
- seed: Option<number>                    # pao:hasSeed
- promptVersion: string                   # pao:hasPromptVersion
```

### 9.2 Tool System

Tools are defined using `Tool.make()` from `effect/unstable/ai` and composed via `Toolkit`:

```
OntologyToolDefinition (pao:ToolDefinition)
  → `effect/unstable/ai` Tool<Name, Config, Requirements>
    - parametersSchema: Schema (validated input)
    - successSchema: Schema (typed result)
    - failureSchema: Schema (typed error)
```

**Tool invocation quotas**: Each tool can carry per-agent invocation limits defined in `AgentQuota.toolInvocationLimits`:

```
ToolQuota:
  maxPerSession: Option<number>            # Max invocations per session (resets on session end)
  maxPerDay: Option<number>                # Max invocations per 24h rolling window
  currentSessionCount: number              # Tracked in memory
  currentDayCount: number                  # Tracked in tool_quotas SQL table
```

The `ExecuteTool` activity checks quotas before execution. If exceeded, it fails with `ToolQuotaExceeded` error and writes an `AuditEntry` with reason `"tool_quota_exceeded:{toolName}"`.

Each tool invocation creates an audit trail:
1. PermissionPolicy evaluated → AuthorizationDecision
2. **Tool quota checked → QuotaCheckResult** (if quotas defined)
3. AuditEntry written with decision + reason
4. Tool handler executed (if allowed and within quota)
5. ToolResult recorded with ComplianceStatus
6. Tool quota counters incremented
7. All wrapped in ToolInvocation entity with full provenance

### 9.3 Model Invocation Tracking

Every LLM call is automatically tracked via **OpenTelemetry spans** using the `Telemetry` module from `effect/unstable/ai`. The `LanguageModel.generateText()` and `streamText()` methods emit spans with GenAI semantic convention attributes (model name, provider, token usage, finish reason). For persistent domain-level audit trails, the application layer creates explicit `ModelInvocation` records from the span data:

> **Note**: Model invocation tracking is automatic at the observability layer. Domain-level `ModelInvocation` entities should be created by the application if persistent audit trails beyond OpenTelemetry are required.

```
ModelInvocation:
  deployment: ModelDeploymentId
  turn: TurnId                            # pao:modelInvocationForTurn
  generationConfig: GenerationConfiguration
  inputTokens: number
  outputTokens: number
  reasoning: Option<string>               # Extended thinking content
  finishReason: FinishReason
  temporalExtent: TemporalInterval        # Start/end time
```

### 9.4 MCP Integration

The `effect/unstable/ai` module includes `McpServer` for serving tools and resources via the Model Context Protocol. This directly addresses the integration protocol question (Open Question #7):

- **`McpServer.addTool()`** — Register tools accessible via MCP
- **`McpServer.addResource()` / `addResourceTemplate()`** — Expose resources to MCP clients
- **`McpServer.callTool()`** — Invoke registered tools

MCP is the recommended primary integration protocol for external services (`pao:ExternalService`). The `IntegrationEntity` should use MCP where the external service supports it, falling back to direct HTTP/RPC for services that don't.

> **Note**: The `McpServer` module provides the server side (exposing agent capabilities to external clients). MCP client support for consuming external MCP servers may be available in provider-specific packages (e.g., `@effect/ai-anthropic`).

---

## 10. Governance & Safety

### 10.1 Policy Enforcement

The ontology defines a comprehensive governance model. In the architecture, this maps to **middleware and activities**:

**PermissionPolicy** (ontology: `pao:PermissionPolicy`, aligned with `odrl:Policy`):
- Evaluated as an Activity in every TurnProcessingWorkflow
- Checked before every ToolInvocation
- Stored in SQLite, cached in AgentEntity state

**Decision flow**:
```
Action requested
  → Load applicable PermissionPolicies for agent
  → Evaluate against SafetyConstraints
  → Produce AuthorizationDecision (Allow | Deny | RequireApproval)
  → Write AuditEntry with decision + reason
  → If RequireApproval: pause workflow, notify user via Checkpoint
  → If Deny: reject action, record in audit log
  → If Allow: proceed
```

### 10.2 Hook System

> **Implementation note**: The `effect/unstable/ai` module does not provide a built-in middleware/interceptor pattern for tool invocations. The hook system described below is an **application-level concern** that must be implemented as a wrapper around the `Toolkit` tool execution path. This can be done by wrapping `Tool.make()` handlers or by inserting hook evaluation logic in the `ExecuteTool` activity.

Hooks (ontology: `pao:Hook`) intercept tool invocations:

```
ToolInvocation requested
  → Check agent's hooks
  → For each matching hook:
    → HookExecution event created
    → Hook logic runs (may modify, block, or log the invocation)
  → If not blocked: proceed with invocation
```

### 10.3 Audit Trail

Every significant action produces an `AuditEntry`:

```
AuditEntry:
  invocationId: ToolInvocationId          # pao:auditForInvocation
  decision: AuthorizationDecision         # pao:recordsDecision
  reason: string                          # pao:hasDecisionReason
  logId: AuditLogId                       # pao:writtenToAuditLog
  timestamp: DateTime
```

Audit entries are append-only in SQLite. They are never deleted (except via ErasureEvent with explicit consent).

### 10.4 Privacy

- **SensitivityLevel**: Every MemoryItem tagged (Public | Internal | Confidential | Restricted)
- **ConsentRecord**: Tracks data subject consent for specific purposes
- **RetentionPolicy**: Automatic expiry of memory items after `retentionPeriodDays`
- **ErasureEvent**: User-requested deletion, recorded with `requestedBy` provenance
- **SandboxPolicy**: Filesystem/network restrictions enforced per agent

### 10.5 SandboxPolicy Enforcement

The `SandboxPolicy` (ontology: `pao:SandboxPolicy`) defines per-agent isolation boundaries. Unlike `PermissionPolicy` (which governs what an agent _may_ do), `SandboxPolicy` governs what an agent _can access_ at the infrastructure level.

**Policy dimensions**:
```
SandboxPolicy:
  agentId: AgentId                           # pao:enforcedBySandboxPolicy (inverse)
  filesystemScope: FilesystemScope           # Allowed paths (read/write/execute)
    - allowedPaths: Array<GlobPattern>       # e.g., ["/agents/{agentId}/**"]
    - deniedPaths: Array<GlobPattern>        # e.g., ["/agents/other-agent/**"]
  networkScope: NetworkScope                 # Allowed network targets
    - allowedHosts: Array<HostPattern>       # e.g., ["api.openai.com", "*.internal"]
    - deniedHosts: Array<HostPattern>        # e.g., ["*.competitor.com"]
  resourceLimits: ResourceLimits             # Compute/memory bounds
    - maxConcurrentTools: number             # Parallel tool execution cap
    - maxToolExecutionMs: number             # Per-tool timeout
```

**Enforcement mechanism**: SandboxPolicy is enforced as an **Effect Layer** that wraps the `ExecuteTool` activity's execution environment. This is implemented by:

1. **FileSystem guard**: A scoped `FileSystem` Layer that intercepts all file operations and validates paths against `filesystemScope` before delegation. Unauthorized access produces `SandboxViolation` error.
2. **Network guard**: A scoped `HttpClient` Layer that validates outbound request hosts against `networkScope` before sending. Unauthorized requests produce `SandboxViolation` error.
3. **Resource guard**: Wraps tool execution in `Effect.timeout` and concurrency `Semaphore` per `resourceLimits`.
4. **Audit**: Every `SandboxViolation` produces an `AuditEntry` with decision `Deny` and reason citing the specific policy constraint violated.

The sandbox Layer is constructed per-agent at entity activation time and provided to all tool executions within that agent's scope. Sub-agents inherit the parent's sandbox policy by default, with optional further restriction (never relaxation).

---

## 11. Networking & Gateway

### 11.1 Local Mode

In local mode, the CLI communicates directly with entities through the Cluster's in-process routing:

```
CLI Command
  → Effect program
  → Sharding.sendLocal()
  → Entity processes message
  → Response returned directly
```

No HTTP server needed. Single process, single runner.

### 11.2 Gateway Mode (HTTP API)

For network access (web clients, other services, future cloud deployment), the system exposes an HTTP API gateway using `HttpApi` from `effect/unstable/httpapi`:

**Gateway API structure**:
```
POST   /conversations                     # Start new conversation
GET    /conversations/:id                 # Get conversation state
POST   /conversations/:id/sessions        # Start session in conversation
POST   /sessions/:id/turns               # Process a turn (streaming response)
GET    /sessions/:id/history              # Get turn history
POST   /sessions/:id/compact             # Trigger compaction
DELETE /sessions/:id                      # End session

GET    /agents/:id                        # Get agent status
PATCH  /agents/:id                        # Update agent config
POST   /agents/:id/goals                 # Set a goal (triggers deliberation)
GET    /agents/:id/memory                # Query memory
POST   /agents/:id/memory/consolidate    # Trigger consolidation

GET    /agents/:id/tools                 # List available tools
POST   /agents/:id/integrations          # Add integration
DELETE /agents/:id/integrations/:iid     # Remove integration

GET    /audit                             # Query audit log
```

**Implementation**: The gateway uses `EntityProxy` from `effect/unstable/cluster` to bridge entity RPC protocols to HTTP endpoints via `EntityProxy.toRpcGroup()`, which derives HTTP-compatible RPC schemas from entity protocols. `EntityProxyServer.layerHttpApi()` then mounts these as HTTP API endpoints. This means the HTTP API is **derived from the entity protocols**, not hand-coded — the entity RPC schemas become the API contract automatically.

**Middleware stack**:
```
Request
  → Authentication (who is calling)
  → Rate limiting (per-client, infrastructure-level)
  → Agent quota check (per-agent token/tool budget)
  → Request validation (Schema-driven)
  → Policy check (is caller authorized for this entity)
  → Entity routing (Sharding resolves entity address)
  → Entity processes message
  → Response serialization
  → Audit logging
```

**Rate limiting implementation**: Uses `RateLimiter` from `effect/unstable/persistence` with the following configuration:

```
RateLimiter configuration:
  - Algorithm: fixed-window (default) or token-bucket (for burst-tolerant endpoints)
  - Key strategy:
    - Per-client: "client:{clientId}:api" — limits total API calls per client
    - Per-agent: "agent:{agentId}:turns" — limits turn processing rate per agent
    - Per-tool: "agent:{agentId}:tool:{toolName}" — limits tool invocation rate
  - Default limits:
    - API calls: 100/minute per client
    - Turn processing: 20/minute per agent
    - Tool invocations: 60/minute per agent per tool
  - On exceeded: "fail" for API calls (return 429), "delay" for internal rate limits (backpressure)
```

The `RateLimiter` Layer is provided in the gateway middleware stack via `Layer.provide(RateLimiter.layer)`. Each middleware step calls `RateLimiter.consume({ limit, window, key, onExceeded })` before proceeding.

**Agent quota check**: A separate middleware step (after rate limiting, before request validation) reads the target agent's `AgentQuota` from `AgentEntity` and rejects requests that would exceed the agent's token budget. This is a fast path check — the detailed budget enforcement happens in `CheckTokenBudget` activity during turn processing.

### 11.3 Streaming

The `ProcessTurn` endpoint supports streaming via Server-Sent Events (SSE) or WebSocket. Effect v4 provides `Sse` from `effect/unstable/encoding` for SSE encoding/decoding, and `Socket`/`SocketServer` from `effect/unstable/socket` for WebSocket support:

```
POST /sessions/:id/turns
Accept: text/event-stream

event: text-start
data: {}

event: text-delta
data: {"delta": "Hello, "}

event: text-delta
data: {"delta": "how can I help?"}

event: tool-call
data: {"name": "search", "input": {...}}

event: tool-result
data: {"name": "search", "output": {...}}

event: text-end
data: {"usage": {"inputTokens": 150, "outputTokens": 42}}

event: finish
data: {"turnId": "...", "turnIndex": 3}
```

### 11.4 Multi-Node (Future Cloud)

```
                    ┌─────────────────┐
                    │   Load Balancer  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │  Runner 1  │ │  Runner 2  │ │  Runner 3  │
        │ (Gateway + │ │ (Gateway + │ │ (Gateway + │
        │  Entities) │ │  Entities) │ │  Entities) │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL     │
                    │ (RunnerStorage + │
                    │  MessageStorage +│
                    │  Domain State)   │
                    └─────────────────┘
```

Each runner runs the same code. Sharding distributes entities across runners. The gateway on each runner can accept any request — if the target entity is on a different runner, the request is forwarded via RPC.

---

## 12. Error Handling & Recovery

### 12.1 Error Taxonomy

The ontology defines a `FailureType` value partition. This maps to Effect's tagged error system:

```
FailureType (owl:oneOf):
  - Timeout              → Schedule.exponential backoff
  - AuthenticationFailure → Escalate immediately
  - RateLimited          → Schedule.spaced (respect retry-after)
  - DependencyFailure    → Replan (find alternative)
  - ConfigurationError   → Rollback to last good config
  - NetworkError         → Schedule.exponential with jitter
```

### 12.2 Error Propagation

```
Activity failure
  │
  ├─ Activity-level retry (Schedule-based, configured per activity)
  │     └─ If success: continue workflow
  │
  ├─ Retries exhausted → ErrorRecoveryWorkflow
  │     ├─ RetryAttempt (with different strategy)
  │     ├─ ReplanEvent (revise the plan)
  │     └─ RollbackEvent (restore previous state)
  │
  ├─ Recovery outcome:
  │     ├─ resolved → resume original workflow
  │     ├─ escalated → notify user, pause workflow
  │     └─ abandoned → mark task as Blocked
  │
  └─ Unrecoverable → Cause<E> propagated to caller with full trace
```

### 12.3 Cluster-Level Recovery

Effect Cluster handles infrastructure-level failures automatically:

- **Runner crash**: Shard locks expire → other runners acquire → unprocessed messages replayed
- **Message loss**: Persisted messages re-delivered from MessageStorage
- **Entity crash**: Entity re-instantiated on next message, state restored from storage
- **Network partition**: Messages stored in MessageStorage, delivered when connectivity restored

---

## 13. Observability

### 13.1 Metrics (Ontology: `pao:OperationalMetric`, `pao:MetricObservation`)

```
Metrics to track:
  - turns_processed (counter, per agent)
  - model_invocations (counter, per model/deployment)
  - tool_invocations (counter, per tool)
  - token_usage (histogram, input/output)
  - memory_items_stored (gauge, per tier)
  - active_sessions (gauge)
  - context_window_utilization (gauge, per session)
  - compaction_events (counter)
  - error_recovery_events (counter, per failure type)
  - audit_decisions (counter, per decision type)
```

### 13.2 Cluster Metrics

Effect Cluster provides built-in metrics:
- Active shards, runners, healthy runners, singletons
- Message processing latency
- Entity activation/deactivation rates

### 13.3 Reliability Incidents (Ontology: `pao:ReliabilityIncident`)

Tracked when services degrade:
```
ReliabilityIncident:
  entity: EntityAddress
  failureType: FailureType
  linkedToRecovery: Option<ErrorRecoveryEventId>
  duration: TemporalInterval
  impact: string
```

### 13.4 Telemetry

The `Telemetry` module from `effect/unstable/ai` supports OpenTelemetry GenAI semantic conventions. All LLM calls automatically produce spans with:
- Model name, provider, operation type
- Request parameters (temperature, max_tokens, etc.)
- Response metadata (finish reason, token usage)
- Latency and error information

---

## 14. Module-by-Module Ontology Mapping

This section provides a detailed mapping of every ontology module to specific Effect constructs.

### Module 1: Identity & Actors

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:Agent` | `Schema.TaggedClass("Agent")` | Abstract base, not instantiated directly |
| `pao:AIAgent` | `AgentEntity` (Cluster Entity) | Primary entity type |
| `pao:HumanUser` | `Schema.TaggedClass("HumanUser")` | Data type, not an entity (represented externally) |
| `pao:SubAgent` | `AgentEntity` with `spawnedBy` field | Same entity type, linked to parent |
| `pao:Organization` | `Schema.TaggedClass("Organization")` | Data type with `hasMember` relation |
| `pao:Persona` | `Schema.Class("Persona")` | Value object in AgentEntity state |
| `pao:ToolDefinition` | `Tool<Name, Config, Requirements>` from `effect/unstable/ai` | Direct mapping; Config = `{ parameters, success, failure, failureMode }` |
| `pao:AgentRole` | `Schema.Literal("AssistantRole", "UserRole")` | Value partition |
| `pao:FoundationModel` | `Schema.Class("FoundationModel")` | Config type with `ModelId` branded key |
| `pao:ModelProvider` | `Schema.Class("ModelProvider")` | Identifies provider (OpenAI, Anthropic, etc.) |
| `pao:ModelDeployment` | `Schema.Class("ModelDeployment")` | Runtime config for model endpoint |
| `pao:GenerationConfiguration` | `Schema.Class("GenerationConfiguration")` | temperature, topP, maxOutputTokens, seed |

**Branded ID types**:
- `AgentId = Schema.String.pipe(Schema.brand("AgentId"))` (`owl:hasKey pao:hasAgentId`)
- `ModelId = Schema.String.pipe(Schema.brand("ModelId"))` (`owl:hasKey pao:hasModelId`)

### Module 2: Conversation & Interaction

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:Conversation` | `ConversationEntity` | Durable entity, manages session chain |
| `pao:Session` | `SessionEntity` | Durable entity, manages turn sequence |
| `pao:Turn` | `Schema.Class("Turn")` | Data type stored in session state + SQLite |
| `pao:Message` | `Schema.Class("Message")` | Value object within Turn |
| `pao:ContentBlock` | `Schema.TaggedClass` union | TextBlock, ToolUseBlock, ToolResultBlock, ImageBlock |
| `pao:ContentBlockType` | `Schema.Literal(...)` | Discriminator for ContentBlock union |
| `pao:ToolInvocation` | Activity within TurnProcessingWorkflow | Durable, retriable, audited |
| `pao:ToolResult` | `Schema.Class("ToolResult")` | Output of tool activity |
| `pao:ToolInvocationGroup` | Concurrency group | Parallel tool execution within a turn |
| `pao:ModelInvocation` | Activity within TurnProcessingWorkflow | The LLM call itself |
| `pao:CommunicationChannel` | `Schema.Class("CommunicationChannel")` | Config type |
| `pao:ChannelType` | `Schema.Literal("CLI", "Messaging", "WebChat", "APIChannel", "VoiceChannel", "EmailChannel")` | Value partition |
| `pao:ContextWindow` | State within SessionEntity | Tracks token capacity/usage |

**Branded ID types**:
- `SessionId = Schema.String.pipe(Schema.brand("SessionId"))` (`owl:hasKey pao:hasSessionId`)
- `ConversationId = Schema.String.pipe(Schema.brand("ConversationId"))` (`owl:hasKey pao:hasConversationId`)
- `TurnId = Schema.String.pipe(Schema.brand("TurnId"))`

### Module 3: Memory Architecture

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:MemoryTier` | Abstract type, 4-way union | Discriminated by tier type |
| `pao:WorkingMemory` | Session state (in-memory) | Rebuilt each turn from context |
| `pao:EpisodicMemory` | SQLite table + MemoryEntity | Time-indexed episodes |
| `pao:SemanticMemory` | SQLite table + MemoryEntity | Topic-indexed claims/facts |
| `pao:ProceduralMemory` | KeyValueStore + MemoryEntity | System prompts, behaviors |
| `pao:MemoryItem` | `Schema.TaggedClass("MemoryItem")` | Base type with metadata |
| `pao:Episode` | `Schema.TaggedClass("Episode")` extends MemoryItem | Time-bounded event cluster |
| `pao:Claim` | `Schema.TaggedClass("Claim")` extends MemoryItem | Proposition with confidence |
| `pao:MemoryBlock` | `Schema.Class("MemoryBlock")` | Key-value pair (Letta pattern) |
| `pao:MemoryOperation` | 5-way union | Encoding, Retrieval, Consolidation, Forgetting, Rehearsal |
| `pao:SharedMemoryArtifact` | MemoryItem with `sharedAcrossAgents` constraint | Multi-agent access |
| `pao:MemoryWriteConflict` | Cluster entity conflict resolution | Policy-resolved |
| `pao:MemorySource` | `Schema.Literal("UserSource", "SystemSource", "AgentSource")` | Provenance |
| `pao:MemoryScope` | `Schema.Literal("SessionScope", "ProjectScope", "GlobalScope")` | Visibility |
| `pao:SensitivityLevel` | `Schema.Literal("Public", "Internal", "Confidential", "Restricted")` | Privacy |
| `pao:RetentionPolicy` | `Schema.Class("RetentionPolicy")` | Days-based retention |

### Module 4: Goals, Plans, Tasks (BDI)

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:Goal` | `Schema.Class("Goal")` | Triggers DeliberationWorkflow |
| `pao:Plan` | Workflow definition | Durable plan execution |
| `pao:Task` | Activity within PlanExecutionWorkflow | Individual work unit |
| `pao:Belief` | `Schema.Class("Belief")` | Proposition in agent state |
| `pao:Desire` | `Schema.Class("Desire")` | Outcome in agent state |
| `pao:Intention` | `Schema.Class("Intention")` | Commitment, links goal to plan |
| `pao:Deliberation` | `DeliberationWorkflow` | BDI reasoning process |
| `pao:Justification` | `Schema.Class("Justification")` | Evidence for intention |
| `pao:Checkpoint` | Workflow checkpoint | Requires CheckpointDecision |
| `pao:CheckpointDecision` | `Schema.Literal("Approved", "Rejected", "Deferred")` | Gate control |
| `pao:TaskStatus` | `Schema.Literal("Pending", "InProgress", "Completed", "Blocked")` | Task lifecycle |
| `pao:StatusTransition` | Event record | From/to status with trigger |

### Module 5: Error Recovery

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:ErrorRecoveryEvent` | `ErrorRecoveryWorkflow` | Durable recovery process |
| `pao:RetryAttempt` | `Schedule`-based retry | Within activity or workflow |
| `pao:ReplanEvent` | Workflow activity | Revise plan on failure |
| `pao:RollbackEvent` | Workflow activity | Restore previous state |
| `pao:FailureType` | `Schema.Literal("Timeout", "AuthenticationFailure", ...)` | Error classification |
| `pao:ReliabilityIncident` | Metric + event record | Tracked for observability |

### Module 6: Governance & Safety

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:PermissionPolicy` | `Schema.Class("PermissionPolicy")` + middleware | Evaluated in EvaluatePolicy activity |
| `pao:SafetyConstraint` | Hard-coded policy rules | Non-negotiable limits |
| `pao:Hook` | `Schema.Class("Hook")` + interceptor | Pre/post tool invocation |
| `pao:HookExecution` | Event record | Logged execution of hook |
| `pao:AuditEntry` | SQLite append-only table | Every decision recorded |
| `pao:AuditLog` | SQLite table container | Queryable audit trail |
| `pao:SandboxPolicy` | Runtime constraint | File/network restrictions |
| `pao:ConsentRecord` | SQLite table | Data subject consent tracking |
| `pao:PermissionMode` | `Schema.Literal("Permissive", "Standard", "Restrictive")` | Agent operating mode |
| `pao:AuthorizationDecision` | `Schema.Literal("Allow", "Deny", "RequireApproval")` | Policy output |

### Module 7: Dialog Pragmatics

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:DialogAct` | `Schema.Class("DialogAct")` | Classified in TurnProcessing activity |
| `pao:CommunicativeFunction` | `Schema.Literal("Inform", "Request", "Confirm", "Clarify", "Accept", "Reject")` | Intent type |
| `pao:CommonGround` | State in ConversationEntity | Shared knowledge accumulator |
| `pao:GroundingAct` | Activity in TurnProcessingWorkflow | Updates common ground |
| `pao:AcceptanceEvidence` | `Schema.Class("AcceptanceEvidence")` | Proof of understanding |
| `pao:ClarificationRequest` | `Schema.Class("ClarificationRequest")` | References ambiguous turn |

### Module 8: External Services

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:ExternalService` | `Schema.Class("ExternalService")` | Config type |
| `pao:Integration` | `IntegrationEntity` | Durable entity managing connection |
| `pao:ServiceConnection` | State within IntegrationEntity | Runtime connection state |
| `pao:ServiceCapability` | `Schema.Union(Tool, Resource, Prompt)` | 3-way capability union |
| `pao:CapabilityDiscoveryEvent` | `CapabilityDiscoveryWorkflow` | Discovers what service offers |
| `pao:IntegrationStatus` | `Schema.Literal("Connected", "Disconnected", "Error", "Initializing")` | Connection state |
| `pao:ConnectionStatus` | `Schema.Literal("Open", "Closed", "Reconnecting", "Failed")` | Transport state |

### Module 9: Scheduling & Automation

| Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:Schedule` | `SchedulerEntity` state record | Owns trigger + recurrence + action + lifecycle |
| `pao:RecurrencePattern` | `Schema.Class("RecurrencePattern")` | Cron or interval recurrence specification |
| `pao:Trigger` | `Schema.Union(CronTrigger, IntervalTrigger, EventTrigger)` | Disjoint trigger taxonomy |
| `pao:CronTrigger` | Trigger subtype | Cron-driven activation |
| `pao:IntervalTrigger` | Trigger subtype | Fixed-interval activation |
| `pao:EventTrigger` | Trigger subtype | External event activation |
| `pao:ScheduledExecution` | `Schema.Class("ScheduledExecution")` + table | Per-run execution record |
| `pao:ScheduleStatus` | `Schema.Literal("ScheduleActive", "SchedulePaused", "ScheduleExpired", "ScheduleDisabled")` | Schedule lifecycle |
| `pao:ExecutionOutcome` | `Schema.Literal("ExecutionSucceeded", "ExecutionFailed", "ExecutionSkipped")` | Execution result |
| `pao:ConcurrencyPolicy` | `Schema.Literal("ConcurrencyAllow", "ConcurrencyForbid", "ConcurrencyReplace")` | Overlap behavior |

### Module 10: Distribution & Quotas (Ontology Extension)

> **Note**: These classes are not yet in PAO v0.8.0. They are **proposed ontology extensions** required to formalize distribution and resource quota semantics. They should be added to the ontology before Phase 5 implementation.

**Distribution classes** (required for multi-runner deployment):

| Proposed Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:Shard` | Cluster shard assignment | Partition of entities assigned to a single runner |
| `pao:Runner` | `RunnerAddress` from `effect/unstable/cluster` | Computation unit executing entities and workflows |
| `pao:ClusterNode` | Deployment unit (1+ runners) | Physical/virtual host running runner processes |
| `pao:belongsToShard` | Entity → Shard assignment | Derived from `ClusterSchema.ShardGroup` annotation |
| `pao:hostedBy` | Runner → ClusterNode | Which node hosts which runner |
| `pao:hasReplicationFactor` | Shard group config | Number of replicas per shard (future) |

**Quota classes** (required for per-agent resource management):

| Proposed Ontology Class | Effect Construct | Notes |
|---|---|---|
| `pao:AgentQuota` | `Schema.Class("AgentQuota")` in AgentEntity state | Resource limits per agent |
| `pao:hasTokenBudget` | `Schema.Number` field | Total token allowance per quota period |
| `pao:hasQuotaPeriod` | `Schema.Literal("Daily", "Monthly", "Yearly", "Lifetime")` | Budget reset frequency |
| `pao:hasMemoryByteLimit` | `Schema.Number` field | Max storage bytes across all memory tiers |
| `pao:hasToolInvocationLimit` | `Schema.Class("ToolQuota")` | Per-tool invocation caps |
| `pao:QuotaPeriod` | Value partition | `owl:oneOf` (Daily, Monthly, Yearly, Lifetime) |
| `pao:TokenBudgetExceeded` | Tagged error extending `FailureType` | Quota violation error |
| `pao:ToolQuotaExceeded` | Tagged error extending `FailureType` | Tool quota violation error |
| `pao:SandboxViolation` | Tagged error extending `FailureType` | Sandbox policy violation error |

**SHACL shape constraints** (proposed):

```
pao:AgentQuotaShape a sh:NodeShape ;
  sh:targetClass pao:AgentQuota ;
  sh:property [
    sh:path pao:hasTokenBudget ;
    sh:datatype xsd:nonNegativeInteger ;
    sh:maxCount 1
  ] ;
  sh:property [
    sh:path pao:hasQuotaPeriod ;
    sh:in (pao:Daily pao:Monthly pao:Yearly pao:Lifetime) ;
    sh:maxCount 1
  ] .

pao:AIAgentQuotaShape a sh:NodeShape ;
  sh:targetClass pao:AIAgent ;
  sh:property [
    sh:path pao:hasQuota ;
    sh:class pao:AgentQuota ;
    sh:maxCount 1
  ] .
```

---

## 15. Package Structure

The monorepo packages should be restructured to support this architecture:

```
packages/
├── domain/                    # Pure types, schemas, branded IDs
│   └── src/
│       ├── ids.ts             # All branded ID types
│       ├── status.ts          # All value partition types
│       ├── agent.ts           # Agent, Persona, FoundationModel schemas
│       ├── conversation.ts    # Conversation, Session, Turn, Message schemas
│       ├── memory.ts          # MemoryItem, Episode, Claim, MemoryBlock schemas
│       ├── planning.ts        # Goal, Plan, Task, BDI schemas
│       ├── governance.ts      # Policy, Audit, Consent schemas
│       ├── dialog.ts          # DialogAct, CommonGround schemas
│       ├── services.ts        # ExternalService, Integration schemas
│       ├── scheduling.ts      # Schedule, Trigger, Recurrence, ScheduledExecution schemas
│       ├── errors.ts          # All tagged error types
│       └── index.ts           # Re-exports
│
├── entities/                  # Cluster entity definitions + protocols
│   └── src/
│       ├── AgentEntity.ts
│       ├── SessionEntity.ts
│       ├── ConversationEntity.ts
│       ├── MemoryEntity.ts
│       ├── IntegrationEntity.ts
│       ├── SchedulerEntity.ts
│       └── index.ts
│
├── workflows/                 # Durable workflow definitions
│   └── src/
│       ├── TurnProcessingWorkflow.ts
│       ├── DeliberationWorkflow.ts
│       ├── PlanExecutionWorkflow.ts
│       ├── CompactionWorkflow.ts
│       ├── ErrorRecoveryWorkflow.ts
│       ├── ConsolidationWorkflow.ts
│       ├── CapabilityDiscoveryWorkflow.ts
│       ├── ScheduleExecutionWorkflow.ts
│       ├── activities/        # Shared activities
│       │   ├── InvokeModel.ts
│       │   ├── ExecuteTool.ts
│       │   ├── EncodeMemory.ts
│       │   ├── RetrieveMemory.ts
│       │   ├── EvaluatePolicy.ts
│       │   ├── WriteAuditEntry.ts
│       │   ├── EvaluateDueSchedules.ts
│       │   └── RecordScheduledExecution.ts
│       └── index.ts
│
├── persistence/               # Storage implementations
│   └── src/
│       ├── SqlRepository.ts   # SQLite domain state repository
│       ├── migrations/        # SQL migrations
│       ├── KeyValueMemory.ts  # File-based KV for procedural memory
│       └── index.ts
│
├── gateway/                   # HTTP API gateway
│   └── src/
│       ├── Api.ts             # HttpApi definition
│       ├── Middleware.ts       # Auth, rate limiting, audit
│       ├── Streaming.ts       # SSE/WebSocket turn streaming
│       └── index.ts
│
├── cli/                       # CLI interface
│   └── src/
│       ├── bin.ts
│       ├── Cli.ts             # Command definitions
│       └── index.ts
│
└── server/                    # Application assembly
    └── src/
        ├── server.ts          # Wires everything together
        ├── ClusterSetup.ts    # Sharding, runners, storage config
        └── index.ts

**ClusterSetup.ts responsibilities**: This module must configure:
1. **Runner type**: `SingleRunner.layer` (local, in-process) or `HttpRunner`/`SocketRunner` (distributed)
2. **MessageStorage**: `SqlMessageStorage.layer` (durable) or `MessageStorage.layerMemory` (testing)
3. **RunnerStorage**: `SqlRunnerStorage.layer` (durable) or `RunnerStorage.layerMemory` (testing)
4. **ShardingConfig**: Via `ShardingConfig.layerFromEnv()` or explicit configuration
5. **WorkflowEngine**: `ClusterWorkflowEngine` for durable workflow execution

For local deployment, `SingleRunner.layer` bundles all of these with sensible defaults (SQL-backed message/runner storage, noop runners).
```

---

## 16. Deployment Topology

### Local (Initial Target)

```
Single process:
  ┌──────────────────────────────────┐
  │  CLI or HTTP Gateway             │
  │  ┌────────────────────────────┐  │
  │  │  Cluster (single runner)   │  │
  │  │  ┌──────┐ ┌──────┐ ┌────┐│  │
  │  │  │Agent │ │Session│ │Mem ││  │
  │  │  │Entity│ │Entity │ │Ent ││  │
  │  │  └──────┘ └──────┘ └────┘│  │
  │  └────────────────────────────┘  │
  │  ┌──────────┐ ┌────────────────┐ │
  │  │ SQLite   │ │ KeyValueStore  │ │
  │  │ (file)   │ │ (file)         │ │
  │  └──────────┘ └────────────────┘ │
  └──────────────────────────────────┘
```

- All in one process
- SQLite for persistence (bun:sqlite, zero setup)
- KeyValueStore backed by local filesystem
- CLI commands execute directly against local cluster
- Optional HTTP gateway for web/mobile clients

### Cloud (Future)

```
Multiple processes across nodes:
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │  Runner 1   │  │  Runner 2   │  │  Runner 3   │
  │  + Gateway   │  │  + Gateway   │  │  + Gateway   │
  │  (shards 1-100)│  (shards 101-200) (shards 201-300)
  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                 ┌────────▼────────┐
                 │   PostgreSQL     │
                 │   + Redis (KV)   │
                 └─────────────────┘
```

- Same code, different Layer configuration
- SQLite → PostgreSQL (swap sql package)
- File KV → Redis (swap KV Layer)
- Single runner → multi-runner (add RunnerAddress config)
- Load balancer routes HTTP to any runner

### Runner Lifecycle & Shard Rebalancing

In multi-runner mode, runners must be dynamically discoverable and shards must rebalance when runners join or leave.

**Runner discovery**: Runners register themselves in `SqlRunnerStorage` on startup. The `RunnerHealth` service monitors liveness:

- **Heartbeat interval**: Each runner writes a heartbeat to `RunnerStorage` every 5 seconds
- **Failure detection**: If 3 consecutive heartbeats are missed (15s), the runner is marked dead
- **Clock skew tolerance**: Heartbeat timestamps allow ±2s drift between nodes
- **Discovery mechanism**: New runners register via `RunnerStorage.register()` and are immediately visible to the shard assignment algorithm. For Kubernetes deployments, `RunnerHealth.layerK8s()` uses the K8s API for liveness checks.

**Shard rebalancing**: When runners join or leave:

1. **Shard lock expiry**: Dead runner's shard locks expire after failure detection timeout (15s)
2. **Rebalancing algorithm**: Remaining runners acquire orphaned shards via atomic `RunnerStorage.acquire(address, shardIds)` (compare-and-swap on shard lock)
3. **New runner joins**: Shard assignment is rebalanced across all healthy runners. Shards migrate from overloaded runners to the new runner via lock release + re-acquisition.
4. **Hot-spot mitigation**: If a shard group exceeds a configurable message throughput threshold, the shard count for that group can be increased (requires entity re-sharding, which is a manual operation).

**Multi-runner failure scenarios**:

- **Single runner failure**: Shards rebalance to surviving runners within 15s. Unprocessed messages replayed from `MessageStorage`.
- **Multiple simultaneous failures**: Each surviving runner independently acquires available shards. No quorum required — PostgreSQL's row-level locks prevent double-assignment.
- **Network partition**: Runners on the minority side lose their shard locks (heartbeats fail to reach PostgreSQL). Runners on the majority side acquire those shards. When the partition heals, minority-side runners re-register and receive rebalanced shard assignments. Messages sent during partition are stored in `MessageStorage` and delivered upon reconnection.
- **Split-brain prevention**: PostgreSQL row-level locking on shard assignments prevents two runners from owning the same shard simultaneously. A runner must hold the lock to process messages for a shard.

### PostgreSQL High Availability (Cloud)

PostgreSQL is the single coordination point for multi-runner deployments. Its availability is critical.

**Requirements**:

1. **Replication**: Primary-replica with synchronous replication for `runner_storage` and `message_storage` tables (coordination data). Asynchronous replication acceptable for domain state tables.
2. **Automatic failover**: Use managed PostgreSQL (AWS RDS Multi-AZ, GCP Cloud SQL HA, or similar) or a proxy like PgBouncer + Patroni for self-hosted deployments.
3. **Connection pooling**: All runners connect through a connection pool (PgBouncer or built-in Effect SQL pool) to prevent connection exhaustion.
4. **WAL archiving**: Continuous WAL archiving for point-in-time recovery of domain state.

**Behavior when PostgreSQL is unavailable**:

- **Shard coordination**: Runners cannot acquire or release shards. Existing shard assignments remain stable (runners continue processing messages for shards they already own).
- **Message storage**: New persisted messages cannot be stored. Runners buffer messages in memory up to `mailboxCapacity`, then reject with `MailboxFull` error.
- **Domain state**: Entity state mutations are held in memory and flushed when PostgreSQL recovers. The `SqlClient` retry policy applies (`Effect.retry` with exponential backoff, max 30s).
- **Recovery**: When PostgreSQL becomes available, runners re-register, flush buffered state, and resume normal operation. No message loss if mailbox capacity was not exceeded.

---

## 17. Open Questions

1. **Embedding/Vector search for memory retrieval**: The ontology doesn't model vector embeddings. Should we add embedding-based semantic search for memory retrieval, or rely on structured queries (topic, time, scope)?
   > **Partially answered**: The `effect/unstable/ai` module supports embedding generation via `LanguageModel` calls, but no built-in vector database integration exists. **Recommendation**: Use an external vector database (e.g., Pinecone, Weaviate, or SQLite with vector extensions) wrapped in an Effect Layer abstraction.

2. **Sub-agent lifecycle**: When a SubAgent is spawned, does it get its own MemoryEntity, or does it share the parent's? The ontology has `spawnedBy` but doesn't constrain memory sharing.

3. **Real-time subscriptions**: Should the gateway support WebSocket subscriptions for entity state changes (e.g., agent status, session updates)?
   > **Answered**: YES. The `effect/unstable/reactivity` module provides `Atom`, `AtomRegistry`, `AtomRpc`, and `AtomHttpApi`. These support reactive state subscriptions via RPC streaming (`RpcSchema.Stream`). Use `AtomRpc` for entity state change notifications and `AtomHttpApi` for HTTP-based reactive subscriptions.

4. **Multi-model orchestration**: The ontology supports multiple FoundationModels per agent. Should different activities use different models (e.g., fast model for DialogAct classification, powerful model for main generation)?

5. **Workflow versioning**: As the system evolves, how do we handle in-flight workflows when workflow definitions change?
   > **Partially answered**: The workflow module does not provide built-in versioning. **Recommendation**: Add `workflowType` + `workflowVersion` metadata to workflow payloads and implement checkpoint migration logic manually (see Section 18.7.4).

6. **Context window strategy**: The compaction workflow is defined, but the specific strategy for what to keep/drop/summarize needs detailed specification. Should this be configurable per agent via ProceduralMemory?

7. **Integration protocol**: The ontology models external services generically. Should we specifically model MCP (Model Context Protocol) as the primary integration protocol, given its adoption?
   > **Answered**: YES. The `effect/unstable/ai` module includes `McpServer` for serving tools and resources via MCP. See Section 9.4 for details.

8. **Testing strategy**: How do we test durable workflows? Effect Cluster's `sendLocal` with serialization simulation is relevant here.
   > **Answered**: Use `TestRunner.layer` from `effect/unstable/cluster`, which provides an in-memory cluster with `Sharding`, `Runners` (noop), `MessageStorage` (memory), and `RunnerStorage` (memory). Combined with `@effect/vitest` and `Effect.provide`, this enables deterministic testing of entity protocols and workflow execution without SQL or disk I/O.

9. **Schema evolution**: As the ontology evolves (currently v0.8.0), how do we handle SQLite schema migrations for stored entity state?
   > **Partially answered**: The `Migrator` module from `effect/unstable/sql` provides migration management with a loader interface and schema directory support. However, Migrator handles **database schema** migrations, not **durable entity state** schema versioning — these are separate concerns requiring distinct strategies.

10. **Shared memory consistency**: The ontology defines `MemoryWriteConflict` resolved by policy. What specific conflict resolution strategies do we implement (last-write-wins, merge, manual)?

11. **One-shot scheduling semantics**: Scope examples include one-time reminders, but current recurrence validation is cron-or-interval. Do we model one-shot schedules as interval + auto-disable, event-triggered single-run, or add an explicit one-shot recurrence construct?
   > **Answered (2026-02-24)**: Model one-shot schedules as interval recurrence (`hasIntervalSeconds`) with `autoDisableAfterRun = true`. After the first terminal execution record (`ExecutionSucceeded` | `ExecutionFailed` | `ExecutionSkipped`), transition the schedule to `ScheduleDisabled` and clear `nextExecutionAt`. Do not model one-shot behavior via `Schedule.recurs(1)`.

---

## 18. Architecture Refinement Addendum (2026-02-20)

This addendum captures a full architecture deep-dive review against:
- `docs/architecture/00-architecture-spec.md`
- `.reference/ontology/personal_agent_ontology.ttl`
- `.reference/ontology/shapes/pao-shapes.ttl`
- Current Effect package and implementation reality in this repository

This section refines the base spec with explicit constraints, sequencing contracts, and a phased delivery plan that prioritizes ontology fidelity and avoids premature complexity.

### 18.1 Deep-Dive Findings Summary

1. The ontology has stricter required constraints than several current architecture descriptions imply. `pao:AIAgent`, `pao:Session`, `pao:MemoryItem`, and `pao:ToolInvocation` are all constrained by `someValuesFrom` plus SHACL shapes that must be represented as hard runtime invariants.
2. The current repository is a strong Effect v4 baseline (Layer + Schema + HttpApi + CLI) but does not yet include the runtime dependencies required by the target design (`effect/unstable/cluster`, `effect/unstable/ai`, `effect/unstable/rpc`, `@effect/sql-sqlite-bun`).
3. Compaction, recovery, and governance behavior requires stricter activity ordering/idempotency contracts to avoid duplicate audit entries and memory inconsistencies during retries.
4. Scheduling and automation are now first-class ontology concepts (`Schedule`, `RecurrencePattern`, `Trigger`, `ScheduledExecution`) and must be modeled explicitly in entities, workflows, and persistence.
5. Shared memory and workflow evolution are currently underspecified and represent architecture-level risks if not resolved before implementation.

### 18.2 Critical Gaps and Required Corrections

| Priority | Gap | Why It Matters | Required Correction |
|---|---|---|---|
| P0 | `AIAgent` cardinality + key constraints not explicitly enforced as runtime invariants | Agents can be created in ontology-invalid states | In `AgentEntity` and domain schemas, enforce required persona, mode, tool, integration, model, hook, external service, and key (`AgentId`) |
| P0 | `MemoryItem` required fields are under-specified | Memory writes can become non-compliant and unauditable | Require tier, retention policy, sensitivity, provenance generation event, and attributed agent at write time |
| P0 | `ContextWindow` invariant (`tokensUsed <= tokenCapacity`) not codified as a guard | Session state may become invalid before compaction can run | Enforce invariant in session update path and reject invalid writes |
| P0 | Tool invocation policy/compliance references are not guaranteed in all paths | Governance/audit trace can be incomplete | Require each `ToolInvocation` to persist governing policy, compliance status, input/output, invoking agent, and session link |
| P1 | Retry + audit/hook sequencing lacks idempotency contract | Recovery may duplicate side effects | Add idempotency envelope and dedupe keys for side-effecting activities |
| P1 | Compaction trigger has no formal ordering with memory encoding | Freshly encoded facts may be compacted incorrectly | Add explicit turn processing state machine and compaction preconditions |
| P1 | Scheduler lifecycle/execution model was previously missing (now specified in this spec) | Cron/interval/event automations must be represented and audited durably | Implement Sections 5.6, 6.7, and 7.2 as written (one-shot interval+auto-disable, bounded catch-up, explicit concurrency outcome recording) |
| P1 | Shared memory vs per-agent memory persistence is ambiguous | Cross-agent consistency and conflict resolution undefined | Define shared-memory storage contract and conflict strategy before implementation |
| P1 | Workflow versioning for in-flight durable workflows is undefined | Deployments can break in-flight executions | Add `workflowType` + `workflowVersion` metadata and migration policy |
| P0 | No per-agent token budget enforcement | Agents can consume unlimited tokens with no guardrails | Added `AgentQuota` to AgentEntity state (Section 5.1), `CheckTokenBudget` activity to TurnProcessingWorkflow (Section 6.1), budget columns to SQL schema (Section 7.2). **RESOLVED in v0.3.0.** |
| P0 | SandboxPolicy enforcement undefined at runtime | File/network isolation is aspirational, not enforced | Added Section 10.5 with scoped FileSystem/HttpClient Layers, resource guards, and audit trail. **RESOLVED in v0.3.0.** |
| P0 | PostgreSQL single point of failure | Multi-runner deployment has no HA strategy | Added PostgreSQL HA subsection to Section 16 with replication, failover, and unavailability behavior. **RESOLVED in v0.3.0.** |
| P0 | Working Memory crash reconstruction unspecified | Volatile session state lost on runner crash | Added crash-safe reconstruction protocol to Section 5.2 with 5-step recovery process. **RESOLVED in v0.3.0.** |
| P0 | Runner lifecycle and shard rebalancing undefined | Cannot add/remove runners dynamically | Added Runner Lifecycle subsection to Section 16 with heartbeat, failure detection, and rebalancing. **RESOLVED in v0.3.0.** |
| P1 | No per-agent file system namespace isolation | Agents can access each other's files and KV data | Added namespace-scoped KV layout to Section 7.3 with prefix-scoped Layer enforcement. **RESOLVED in v0.3.0.** |
| P1 | No end-to-end workflow transaction boundary | Turn side effects can be partially committed | Added Section 18.7.5 with saga pattern, commit phases, and compensation semantics. **RESOLVED in v0.3.0.** |
| P1 | Tool invocation quotas not enforced | No per-tool per-agent invocation limits | Added ToolQuota to Section 9.2, `tool_quotas` table to SQL schema. **RESOLVED in v0.3.0.** |
| P1 | RateLimiter not wired into gateway | Rate limiting listed but not implemented | Added RateLimiter configuration and key strategy to Section 11.2 middleware. **RESOLVED in v0.3.0.** |
| P1 | No ontology classes for distribution or quotas | Distribution and resource management invisible to domain model | Added Module 10 to Section 14 with proposed `pao:Shard`, `pao:Runner`, `pao:AgentQuota`, `pao:QuotaPeriod` classes. **SPECIFIED in v0.3.0; pending ontology merge into PAO.** |

### 18.3 Non-Negotiable Ontology Constraints (Encode Early)

These constraints must be represented in Effect Schema/domain contracts before building higher-level workflows.

1. `pao:AIAgent` constraints:
   - Required: `hasPersona`, `operatesInMode`, `hasAvailableTool`, `hasIntegration`, `usesModel`, `hasHook`, `hasExternalService`
   - Key: `hasAgentId`
2. `pao:Session` constraints:
   - Required: `hasParticipant`, `partOfConversation`, `hasStatus`, `hasTemporalExtent`
   - Key: `hasSessionId`
3. `pao:MemoryItem` constraints:
   - Required: `storedIn`, `governedByRetention`, `hasSensitivityLevel`, `prov:wasGeneratedBy`, `prov:wasAttributedTo`
   - Cardinality: exactly one `storedIn` memory tier
4. `pao:ToolInvocation` constraints:
   - Required: `invokesTool`, `hasInput`, `hasOutput`, `inSession`, `invokedBy`, `producedToolResult`, `governedByPolicy`, `hasComplianceStatus`
5. `pao:Schedule` constraints:
   - Required: `ownedByAgent`, `hasRecurrencePattern`, `activatedBy`, `hasConcurrencyPolicy`, `schedulesAction`, `hasScheduleStatus`
   - Optional but functional: `allowsCatchUp`
6. `pao:ScheduledExecution` constraints:
   - Required: `executionOf`, `hasTemporalExtent`, `hasExecutionOutcome`
7. `pao:RecurrencePattern` constraints:
   - Must satisfy SHACL `or`: at least one of `hasCronExpression` or `hasIntervalSeconds`
8. SHACL invariants:
   - `ContextWindow`: `hasTokensUsed <= hasTokenCapacity`
   - `Claim`: confidence bounds in `[0, 1]` when present
   - `RecurrencePattern`: cron-or-interval requirement
9. Disjointness/value partitions:
   - Preserve disjoint class families and disjoint unions in Schema unions to prevent invalid mixed states.

### 18.4 Refined Core Abstractions (MVP-Safe)

The initial implementation should stabilize these abstractions and defer non-essential distribution complexity:

1. `Domain` package:
   - Ontology-aligned Schema classes, branded IDs, and literals/value partitions
   - Tagged error model for deterministic failures
2. `Persistence` package:
   - SQLite-first storage for core metadata and durable state
   - KV/file store only where necessary (procedural content, large blobs)
3. `Entity` protocols:
   - `AgentEntity`, `SessionEntity`, `MemoryEntity` with explicit message contracts and invariant guards
4. `Workflow` contracts:
   - `TurnProcessingWorkflow` and `ErrorRecoveryWorkflow` first
   - Activities as explicit retry boundaries with idempotency metadata
5. `Scheduler` core:
   - `SchedulerEntity` for durable schedule lifecycle and due-run coordination
   - `ScheduleExecutionWorkflow` for trigger evaluation, concurrency enforcement, and execution recording
6. `Governance` core:
   - `EvaluatePolicy` and `WriteAuditEntry` on all tool execution paths

Deferred until later phases:
- Multi-runner distribution
- Broad external integration discovery matrix
- Advanced multi-model orchestration
- Shared-memory conflict optimization beyond baseline policy

### 18.5 Minimum Viable Vertical Slice

Deliver one end-to-end slice before expanding breadth:

1. Create/configure `AgentEntity` with ontology-valid defaults
2. Start `SessionEntity` in a `Conversation`
3. Process one turn via `TurnProcessingWorkflow`:
   - classify dialog act (simple implementation)
   - evaluate policy
   - retrieve memory
   - invoke model (single model deployment)
   - optionally execute tool
   - encode memory
   - write audit trail
4. Create one schedule and execute it through `ScheduleExecutionWorkflow` (cron or interval)
5. Stream response back to CLI or HTTP client
6. Persist and replay entity/workflow state after restart

This slice is the correctness baseline for all subsequent features.

### 18.6 Phased Implementation Plan

| Phase | Goal | Entry Criteria | Exit Criteria |
|---|---|---|---|
| 0 | Ontology projection baseline | Spec accepted | Mapping matrix from ontology + SHACL to Schema/domain complete |
| 1 | Identity + interaction core | Phase 0 done | Agent/session/turn creation persists and reloads with invariant enforcement |
| 2 | Memory correctness core | Phase 1 done | Memory writes/retrieval enforce `MemoryItem` + `Claim` constraints; context window guard active |
| 3 | Durable turn workflow + recovery skeleton | Phase 2 done | Turn processing + retry/recovery run with idempotency envelope and deterministic replay |
| 4 | AI + tool + governance + scheduler completion | Phase 3 done | Tool invocations and scheduled executions persist full policy/compliance/outcome links and pass conformance checks |
| 5 | Observability + gateway + distribution | Phase 4 done | HTTP/SSE, metrics, and multi-runner configuration validated in integration tests |

### 18.7 Required Sequencing Contracts

#### 18.7.1 Activity Idempotency Envelope

Every side-effecting activity must carry:
- `workflowExecutionId`
- `activityName`
- `activityAttempt`
- `idempotencyKey`
- `causationId`/`correlationId`

`WriteAuditEntry`, integration/tool execution, and memory writes must dedupe on `idempotencyKey`.

#### 18.7.2 Turn Processing and Compaction Ordering

Compaction must not run until memory encoding is committed for the current turn.

Required order:
1. `InvokeModel` completed
2. Tool execution group completed
3. `EncodeMemory` committed
4. Context window counters updated
5. Compaction eligibility evaluated
6. `CompactionWorkflow` may start

#### 18.7.3 Shared Memory Contract

If shared artifacts are enabled:
1. Shared items use a canonical shared store record
2. Agent-local references point to shared IDs
3. Conflicts produce explicit `MemoryWriteConflict` records
4. Conflict resolution policy must be selected and auditable

#### 18.7.4 Workflow Evolution Contract

Persist `workflowType`, `workflowVersion`, and checkpoint schema version.
Deployments must define one of:
1. continue old versions until completion
2. migrate checkpoints with tested migration functions
3. terminate with compensating recovery flow

#### 18.7.5 Turn Processing Transaction Boundary

The `TurnProcessingWorkflow` uses a **saga pattern** to achieve consistency across its activities. This is not a database transaction — external tool calls are irreversible, so full rollback is impossible. Instead, the saga guarantees: (1) internal state changes (memory, audit, counters) are atomic at the commit point, and (2) partial failures are explicitly recorded with compensation metadata so the system never enters a silently inconsistent state.

**Transaction envelope**:

1. **Pre-commit phase** (activities 1-7): All activities execute normally. Failures trigger activity-level retries, then `ErrorRecoveryWorkflow` if retries exhaust.
2. **Commit phase** (activities 8-9): `EncodeMemory` and `UpdateCommonGround` persist the turn's results. These two activities form the "commit point" — once both complete, the turn is committed.
3. **Post-commit phase**: Context window counters updated, token budget updated, compaction eligibility evaluated.

**Compensation on failure**:

- If `EncodeMemory` fails after `ExecuteTools` succeeded: Tool results are lost from memory but the tool side effects (e.g., file writes) cannot be reversed. The workflow records a `PartialTurnFailure` event and the turn is marked as failed. The user is notified that tool actions were taken but not recorded.
- If `InvokeModel` fails: No side effects have occurred yet (tools haven't run). The workflow can safely retry or abort.
- If an external tool call fails mid-batch: Completed tool results are preserved; the failed tool produces a `ToolResult` with error status. The model is re-invoked with partial results if configured for tool retry.

**Exactly-once semantics for external calls**: External tool invocations are inherently at-most-once (network calls cannot be atomically rolled back). The `idempotencyKey` from Section 18.7.1 must be passed to external services that support it. For services that don't, the architecture accepts at-most-once delivery with explicit failure recording rather than risking duplicate side effects.

### 18.8 Ontology Conformance and Test Gates

The implementation is not complete unless these gates pass:

1. Schema validation tests:
   - reject invalid `AIAgent` instances missing required relations
   - reject invalid sessions/context windows
   - reject invalid memory/tool invocation records
   - reject invalid schedule/recurrence/scheduled execution records
2. Persistence conformance tests:
   - round-trip all required ontology fields through storage
   - preserve cardinality and key constraints
3. Recovery/idempotency tests:
   - replay workflows without duplicate audit/tool side effects
4. SHACL-aligned invariants:
   - `tokensUsed <= tokenCapacity`
   - claim confidence bounds
   - recurrence pattern cron-or-interval requirement
5. Integration tests:
   - end-to-end turn lifecycle produces complete provenance/audit chain
   - scheduler tick produces valid `ScheduledExecution` records with correct outcomes
6. Quota enforcement tests:
   - `CheckTokenBudget` rejects turns when agent token budget exceeded
   - `ExecuteTool` rejects invocations when tool quota exceeded
   - Budget counters reset correctly on period boundaries
7. Sandbox enforcement tests:
   - Scoped FileSystem Layer blocks cross-agent path access
   - Scoped HttpClient Layer blocks unauthorized host access
   - `SandboxViolation` produces `AuditEntry` with deny decision
8. Namespace isolation tests:
   - Agent A's KeyValueStore cannot read Agent B's keys
   - Sub-agent namespace is independent from parent

### 18.9 Decision Backlog (MVP Status: Closed)

Resolved on 2026-02-24 (MVP defaults approved):

1. Embedding strategy: implementation metadata (separate index/table), no PAO core extension in MVP.
2. Sub-agent memory model: isolated by default; sharing only via explicit shared artifacts.
3. Shared memory conflict policy: deterministic LWW + required `MemoryWriteConflict` record + audit entry.
4. Workflow version migration policy: continue old versions until completion; no checkpoint migration in MVP.
5. Hook/audit ordering on denied tool actions: `EvaluatePolicy` -> `WriteAuditEntry(Deny)` -> optional deny hooks -> no tool execution.
6. Realtime subscription/delegation scope: caller-owned agent/session scope only; no cross-agent delegation in MVP.
7. Sub-agent quota inheritance: child agents draw from parent quota pool by default; optional stricter child caps allowed.
8. Memory size quota enforcement: hard limit at write time (reject + audit); async eviction remains explicit `Forgetting` workflow.
9. Quota violation audit model: extend `AuditEntry` with structured quota reason codes; defer separate `QuotaViolationEvent` class.

Resolved on 2026-02-24: one-shot schedule modeling and catch-up/backfill policy (Sections 5.6, 6.7, and 7.2).

Resolved on 2026-02-24 (v0.3.0): distributed agent OS capability gaps — per-agent token budget, SandboxPolicy enforcement, PostgreSQL HA, working memory crash reconstruction, runner lifecycle/shard rebalancing, per-agent FS namespace, workflow transaction boundary, tool invocation quotas, RateLimiter wiring, ontology distribution/quota classes.

These decisions are required defaults for Phase 1-4 implementation.

### 18.10 MVP Abstraction Lock List (5 Interfaces)

The MVP should lock exactly five domain-facing interfaces. Everything else should use Effect primitives directly (`Entity`, `Workflow`, `Activity`, `Sharding`, `SqlClient`, `RateLimiter`, `ClusterCron`, `DeliverAt`) to avoid unnecessary wrappers.

These are the only interfaces that must be stable before broad implementation:

1. `AgentStatePort` (ontology anchors: `pao:AIAgent`, `pao:PermissionMode`, `pao:SandboxPolicy`)
   - Responsibilities:
     - Load/update ontology-valid agent state
     - Apply quota consumption and resets
     - Expose immutable runtime config needed by workflows
   - Minimal operations:
     - `get(agentId)`
     - `upsert(agentState)`
     - `consumeTokenBudget(agentId, tokens, now)`

2. `SessionTurnPort` (ontology anchors: `pao:Session`, `pao:Turn`, `pao:ContextWindow`)
   - Responsibilities:
     - Create/transition session state
     - Persist turn records and context-window counters
     - Enforce `tokensUsed <= tokenCapacity`
   - Minimal operations:
     - `startSession(input)`
     - `appendTurn(turnRecord)`
     - `updateContextWindow(sessionId, deltaTokens)`

3. `MemoryPort` (ontology anchors: `pao:MemoryItem`, `pao:Episode`, `pao:Claim`, `pao:MemoryWriteConflict`)
   - Responsibilities:
     - Retrieve candidate memories for turn execution
     - Encode memories with provenance and retention metadata
     - Perform forgetting/eviction operations explicitly
   - Minimal operations:
     - `retrieve(query)`
     - `encode(items, provenance)`
     - `forget(criteria)`

4. `GovernancePort` (ontology anchors: `pao:PermissionPolicy`, `pao:AuditEntry`, `pao:AuthorizationDecision`)
   - Responsibilities:
     - Evaluate tool/action policy decisions
     - Enforce tool quota checks and sandbox constraints
     - Write canonical audit records for allow/deny/failure paths
   - Minimal operations:
     - `evaluatePolicy(input)`
     - `checkToolQuota(agentId, toolName, now)`
     - `writeAudit(entry)`

5. `SchedulePort` (ontology anchors: `pao:Schedule`, `pao:RecurrencePattern`, `pao:ScheduledExecution`)
   - Responsibilities:
     - Own schedule lifecycle and recurrence metadata
     - Evaluate due windows and concurrency outcomes
     - Persist execution records durably
   - Minimal operations:
     - `upsertSchedule(input)`
     - `listDue(now)` returning due-window records (`schedule`, `dueAt`, `triggerSource`)
     - `recordExecution(result)`
   - Implementation constraint:
     - Phase 1: adapters may use port-backed due-window evaluation directly.
     - Phase 2: runtime scheduler must be implemented on top of `ClusterCron` + `DeliverAt` (Section 5.6 note), not as parallel scheduler infrastructure.

**Anti-overengineering guardrail**: No additional interface is allowed in MVP unless it reduces ontology mismatch risk or removes duplicated cross-cutting logic across at least two workflows.

### 18.11 Backlog Decision Review (MVP Defaults, Approved)

The following decisions are approved to unblock implementation while preserving ontology fidelity and Effect-native simplicity.

| Backlog Item | MVP Default (Approved) | Why |
|---|---|---|
| 1. Embedding strategy | Keep embeddings as implementation metadata (separate index/table) and keep PAO core unchanged in MVP | Avoid ontology churn before retrieval quality is proven |
| 2. Sub-agent memory model | Isolated by default (`subAgentId` has its own `MemoryEntity` + namespace); sharing only via explicit shared artifacts | Prevent accidental cross-agent coupling and leakage |
| 3. Shared memory conflict policy | Deterministic LWW with required `MemoryWriteConflict` record + audit entry on collisions | Minimal operational complexity with explicit traceability |
| 4. Workflow version migration | Continue old workflow versions until completion; no checkpoint migration in MVP | Lowest-risk deployment posture for durable workflows |
| 5. Hook/audit ordering on denied tools | `EvaluatePolicy` -> `WriteAuditEntry(Deny)` -> optional deny hooks -> no tool execution | Guarantees denial is auditable before any follow-up behavior |
| 6. Realtime subscription + delegation scope | Subscriptions limited to caller-owned agent/session scope; no cross-agent delegation in MVP | Constrains auth surface and reduces abuse paths |
| 7. Sub-agent quota inheritance | Sub-agents draw from parent quota pool by default; optional stricter child caps allowed | Prevents quota bypass via agent fan-out |
| 8. Memory size quota enforcement | Enforce hard limit at write time (reject + audit) in MVP; async eviction remains explicit `Forgetting` workflow | Deterministic behavior and simpler failure modes |
| 9. Quota violation audit model | Extend `AuditEntry` with structured quota reason codes in MVP; defer separate `QuotaViolationEvent` class | Reuse existing governance surface and avoid schema proliferation |
| 10. Scheduler runtime wiring | Keep `SchedulePort` as the stable MVP contract (`upsertSchedule`, `listDue`, `recordExecution`); defer `ClusterCron` + `DeliverAt` orchestration wiring to Phase 2 while preserving the same port semantics | Avoids overengineering now while preserving the Effect-native distributed path |

These defaults are now moved from "Decision Backlog" to "Resolved" and are required inputs for Phase 1-4 implementation.

---

## Appendix A: Ontology Reference

- **Main ontology**: `.reference/ontology/personal_agent_ontology.ttl`
- **Reference individuals**: `.reference/ontology/pao-reference-individuals.ttl`
- **Instance data**: `.reference/ontology/pao-data.ttl`
- **SHACL shapes**: `.reference/ontology/shapes/`
- **Documentation**: `.reference/ontology/docs/`
- **Changelog**: `.reference/ontology/CHANGELOG.md`

## Appendix B: Effect Source Reference

> **Note (v4)**: In Effect v4, most modules are consolidated into the core `effect` package under `effect/unstable/*` subpaths. The `.reference/effect/` directory is a shallow clone of the `effect-smol` repository.

- **Core**: `.reference/effect/packages/effect/src/`
- **Cluster**: `.reference/effect/packages/effect/src/unstable/cluster/`
- **AI**: `.reference/effect/packages/effect/src/unstable/ai/`
- **Workflow**: `.reference/effect/packages/effect/src/unstable/workflow/`
- **HTTP**: `.reference/effect/packages/effect/src/unstable/http/`
- **HttpApi**: `.reference/effect/packages/effect/src/unstable/httpapi/`
- **SQL**: `.reference/effect/packages/effect/src/unstable/sql/`
- **CLI**: `.reference/effect/packages/effect/src/unstable/cli/`
- **RPC**: `.reference/effect/packages/effect/src/unstable/rpc/`
- **Persistence**: `.reference/effect/packages/effect/src/unstable/persistence/`
- **EventLog**: `.reference/effect/packages/effect/src/unstable/eventlog/`
- **Reactivity**: `.reference/effect/packages/effect/src/unstable/reactivity/`
- **Observability**: `.reference/effect/packages/effect/src/unstable/observability/`
- **Encoding**: `.reference/effect/packages/effect/src/unstable/encoding/`
- **Socket**: `.reference/effect/packages/effect/src/unstable/socket/`
- **DevTools**: `.reference/effect/packages/effect/src/unstable/devtools/`
- **Platform-Bun**: `.reference/effect/packages/platform-bun/`
- **SQL Drivers**: `.reference/effect/packages/sql/` (sqlite-bun, sqlite-node, etc.)

## Appendix C: Effect Solutions Guides

Run `effect-solutions show <topic>` for:
- `quick-start`, `project-setup`, `tsconfig`, `basics`
- `services-and-layers`, `data-modeling`, `error-handling`
- `config`, `testing`, `cli`
