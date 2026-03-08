# BFO Alignment -- Personal Agent Ontology (PAO)

**Date**: 2026-02-18
**Phase**: Conceptualization (Pipeline A, Step 3)
**Upper Ontology**: BFO 2020 (ISO 21838-2)

---

## Alignment Strategy

Every top-level PAO class is aligned to a BFO category using the decision
procedure from `_shared/bfo-categories.md`. Where a class cross-cuts BFO
categories, the alignment rationale is documented and a pragmatic resolution
is provided.

PAO imports PROV-O, which is not itself BFO-aligned. Where PROV-O classes
serve as PAO superclasses, we document the BFO alignment of the PAO class
independently and note the PROV-O relationship.

---

## Category Summary

| BFO Category | PAO Classes |
|---|---|
| Object (BFO:0000030) | HumanUser, Organization |
| Generically Dependent Continuant (BFO:0000031) | AIAgent, SubAgent, ToolDefinition, Message, MemoryItem, MemoryTier, WorkingMemory, EpisodicMemory, SemanticMemory, ProceduralMemory, Episode, Claim, MemoryBlock, Goal, Plan, Task, Persona, Intention, PermissionPolicy, SafetyConstraint, ConsentRecord, RetentionPolicy, CompactionDisposition, ContextWindow, CommunicationChannel, Integration, ExternalService, ServiceConnection, ServiceCapability, ServiceToolCapability, ServiceResourceCapability, ServicePromptCapability, SandboxPolicy, Hook, AuditLog, AuditEntry, Checkpoint, ToolResult, ToolInvocationGroup, ContentBlock, SharedMemoryArtifact, DialogAct, CommonGround, ClarificationRequest, AcceptanceEvidence, ModelProvider, FoundationModel, ModelDeployment, GenerationConfiguration, OperationalMetric, MetricObservation, Belief, Desire, Justification, Schedule, RecurrencePattern, Trigger, CronTrigger, IntervalTrigger, EventTrigger, Status, SessionStatus, TaskStatus, ComplianceStatus, SensitivityLevel, ItemFate, ChannelType, IntegrationStatus, ConnectionStatus, PermissionMode, AuthorizationDecision, CheckpointDecision, ContentBlockType, MemorySource, MemoryScope, CommunicativeFunction |
| Role (BFO:0000023) | AgentRole |
| Process (BFO:0000015) | Conversation, Session, Turn, ToolInvocation, CompactionEvent, ErasureEvent, Event, Action, MemoryOperation, Encoding, Retrieval, Consolidation, Forgetting, Observation, Rehearsal, StatusTransition, SessionStatusTransition, TaskStatusTransition, CapabilityDiscoveryEvent, HookExecution, ErrorRecoveryEvent, RetryAttempt, ReplanEvent, RollbackEvent, MemoryWriteConflict, GroundingAct, ModelInvocation, ReliabilityIncident, Deliberation, ScheduledExecution |
| Cross-cutting (documented) | Agent (umbrella for Object + GDC subtypes) |
| *(Status subtypes listed under GDC above — Value Partition ODP-6, incl. FailureType, ScheduleStatus, ExecutionOutcome, ConcurrencyPolicy)* | |
| Named Individuals | Active, Ended, Interrupted, Pending, InProgress, Completed, Blocked, Compliant, NonCompliant, AssistantRole, UserRole, UserPreference, Public, Internal, Confidential, Restricted, Preserved, Dropped, Summarized, Archived, CLI, Messaging, WebChat, APIChannel, VoiceChannel, EmailChannel, Connected, Disconnected, Error, Initializing, Open, Closed, Reconnecting, Failed, Permissive, Standard, Restrictive, Allow, Deny, RequireApproval, Approved, Rejected, Deferred, TextBlock, ToolUseBlock, ToolResultBlock, ImageBlock, UserSource, SystemSource, AgentSource, SessionScope, ProjectScope, GlobalScope, Inform, Request, Confirm, Clarify, Accept, Reject, Timeout, AuthenticationFailure, RateLimited, DependencyFailure, ConfigurationError, NetworkError, Paused, Expired, Disabled, Succeeded, Skipped, Forbid, Replace |

---

## Detailed Alignment Decisions

### 1. Agent (cross-cutting)

**Decision**: Agent is a domain-level umbrella class aligned with `prov:Agent`.
It cross-cuts BFO categories because its subclasses span both Material Entity
(humans) and GDC (software).

**Rationale**: BFO does not have a native "agent" category. The concept of
agency cross-cuts the continuant/occurrent divide. PROV-O defines `prov:Agent`
as "something that bears some form of responsibility for an activity taking
place," which is the semantics PAO needs.

**Resolution**:
- `pao:Agent rdfs:subClassOf prov:Agent`
- BFO alignment is provided at the subclass level (HumanUser, AIAgent)
- Agent itself is not directly subclassed under a single BFO leaf category
- This is a documented deviation from strict BFO single-inheritance,
  justified by the need for a unified agent concept in the domain

**Alternative considered**: Model Agent as a Role (BFO:0000023) borne by
material entities or GDCs. Rejected because it would require all CQs to
query through a role indirection, adding unnecessary complexity.

---

### 2. HumanUser -> Object (BFO:0000030)

**Decision**: Material Entity > Object

**Rationale**: A human user is a physical person -- a maximally self-connected
material entity that persists through time. Aligns with `prov:Person` and
`foaf:Person`.

**Decision path**: Continuant > Independent Continuant > Material Entity >
Object.

---

### 3. AIAgent -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC (information content entity)

**Rationale**: A software agent is an information artifact -- it can be
copied, transferred between hardware, and exists as pattern rather than
matter. Per the BFO known ambiguities table: "Software, algorithms: GDC
(information content entity pattern)."

**Decision path**: Continuant > Dependent Continuant > GDC.

**Note**: The AI agent depends on computational infrastructure (its bearer)
for execution, but its identity as an information entity is independent of
any specific hardware instance.

---

### 4. SubAgent -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC, same as AIAgent.

**Rationale**: A sub-agent is a specialized AI agent spawned for delegated
work. It inherits the GDC classification from AIAgent.

---

### 5. AgentRole -> Role (BFO:0000023)

**Decision**: Specifically Dependent Continuant > Realizable Entity > Role

**Rationale**: A role played by an agent in a conversation is a social/
contextual property. It exists because of the conversational context, not
because of the agent's physical or informational makeup. An agent can play
different roles in different conversations.

**Decision path**: Continuant > Dependent > SDC > Realizable > Role.

**Individuals**: `AssistantRole` and `UserRole` are named individuals of
type `AgentRole`, forming a closed set via `owl:oneOf`.

---

### 6. ToolDefinition -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A tool definition is an information artifact that specifies
the interface, capabilities, and constraints of an available tool. It can
be shared, copied, and versioned independently of the tool implementation.

---

### 7. Conversation -> Process (BFO:0000015)

**Decision**: Occurrent > Process

**Rationale**: A conversation unfolds over time, has temporal parts (sessions,
turns), and involves participants. It does not persist as a continuant --
it happens.

**Decision path**: Occurrent > Process.

**Note**: A conversation has participants (agents) who are continuants.
The `participates_in` relation (RO:0000056) links continuants to processes.

---

### 8. Session -> Process (BFO:0000015)

**Decision**: Process (temporal part of a Conversation)

**Rationale**: A session is a bounded period of agent-user interaction.
It unfolds in time, has beginning and end points, and is a temporal part
of a conversation.

---

### 9. Turn -> Process (BFO:0000015)

**Decision**: Process (temporal part of a Session)

**Rationale**: A turn is a single contribution by one participant. It is
an event with temporal extent (however brief) and is a proper temporal part
of a session.

---

### 10. Message -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A message is the information content of a turn. It can be
stored, copied, and transmitted. The message content (GDC) is distinct from
the turn (Process) that produced it. This follows the information-physical
distinction (anti-pattern #7).

---

### 11. ToolInvocation -> Process (BFO:0000015)

**Decision**: Process

**Rationale**: A tool invocation unfolds in time: request is issued,
execution occurs, response is returned. It has temporal parts and
participants (the invoking agent, the tool definition).

---

### 12. CompactionEvent -> Process (BFO:0000015)

**Decision**: Process

**Rationale**: Context compaction is something that happens -- the agent's
working memory is compressed, producing a summary. It has a start, duration,
and end.

---

### 13. MemoryItem -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: Memory items are information artifacts persisted in agent
memory. They can be stored, copied, consolidated, and deleted. This aligns
with the IAO pattern (ODP-4: Information Realization) and BFO's treatment
of information entities as GDCs.

**Note**: The `storedIn` property links MemoryItem (GDC) to MemoryTier
(GDC), modeling the realization/bearer relationship from ODP-4.

---

### 14. MemoryTier -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A memory tier is an information structure that defines
storage, access, and lifecycle characteristics for a layer of the agent's
memory architecture. It is a specification/schema, not a physical entity.

**Subclasses**: WorkingMemory, EpisodicMemory, SemanticMemory,
ProceduralMemory -- all GDCs, forming a disjoint covering of MemoryTier.

---

### 15. Episode -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC (subclass of MemoryItem)

**Rationale**: In PAO, an Episode is primarily a memory artifact that
records a temporally bounded cluster of related events. The pre-glossary
noted dual nature ("subclass of MemoryItem and Event"), but in BFO,
GDC (Continuant) and Process (Occurrent) are disjoint -- a class cannot
be both.

**Resolution**: Episode is a GDC (memory item). It records events but is
not itself an event. The temporal metadata (when the recorded events
occurred) is attached via `hasTemporalExtent` as descriptive metadata, not
as an ontological commitment to being a process.

**Consequence**: The property linking events to episodes is `recordedInEpisode`
(Event -> Episode), not mereological `partOf`. Events are processes that
the episode describes; the episode is the information record.

**Alternative considered**: Dual-nature (Process + GDC). Rejected because
it violates BFO disjointness between Continuant and Occurrent.

---

### 16. Claim -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC (subclass of MemoryItem)

**Rationale**: A claim is an agent-held proposition -- an information
artifact with metadata (confidence, evidence, provenance). It follows the
N-ary Relation pattern (ODP-1) and the Information Realization pattern
(ODP-4).

---

### 17. MemoryOperation -> Process (BFO:0000015)

**Decision**: Process

**Rationale**: Memory operations (encoding, retrieval, consolidation,
forgetting) are things that happen over time. They transform or access
memory items.

**Subclasses**: Encoding, Retrieval, Consolidation, Forgetting -- all
Processes, forming a disjoint covering of MemoryOperation.

---

### 18. Event -> Process (BFO:0000015)

**Decision**: Process

**Rationale**: BFO uses "Process" for what many domain vocabularies call
"Event." In PAO, Event is the top-level class for all things that happen
in the agent system. It aligns directly with BFO:Process.

**Note**: PAO uses the label "Event" rather than "Process" to match
domain vocabulary (agent developers think in terms of "events"). The
`rdfs:label` is "event" but the BFO alignment is to Process.

---

### 19. Action -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: An action is an intentional event caused by an agent. It
is a process with a designated agent participant. Aligns with schema:Action
via SSSOM mapping.

---

### 20. Goal -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: In PAO, a goal is an information content entity specifying a
desired state the agent works toward. It can be created, modified, shared,
and tracked.

**Alternative considered**: Realizable Entity (BFO:0000017), as suggested
in the ORSD. A goal-as-disposition would be an SDC that gets realized through
plan execution. However, BFO Realizable Entities inhere in Independent
Continuants, and software agents are GDCs -- SDCs cannot inhere in GDCs.
The GDC classification avoids this category mismatch while still capturing
the goal's information content nature.

**Note**: The intentional/motivational aspect of goals (BDI "desire") is
captured through the `pursuedBy` relation and `hasStatus` property, not
through the BFO categorization.

---

### 21. Plan -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A plan is an information artifact specifying an ordered
sequence of intended actions. Aligns with `prov:Plan` (which is a subclass
of `prov:Entity`). Plans are documents/specifications, not the execution of
those specifications.

---

### 22. Task -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A task is a concrete work item specification within a plan.
It has status, dependencies, and descriptive content. It is the specification
of work to be done, not the doing itself.

---

### 23. PermissionPolicy -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A permission policy is an information artifact (a rule
document) governing agent behavior. Aligns with ODRL `odrl:Policy`.

---

### 24. SafetyConstraint -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A safety constraint is an information artifact specifying
non-negotiable behavioral limits. Similar to PermissionPolicy but with
stronger enforcement semantics.

---

### 25. ErasureEvent -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: An erasure event is something that happens -- memory items
are identified and deleted. It has temporal extent and participants
(the requesting agent, the affected memory items).

---

### 26. Status (Value Partition) -> GDC (BFO:0000031)

**Decision**: Modeled using the Value Partition pattern (ODP-6) with
named individuals. Aligned to GDC (BFO:0000031) via prov:Entity.

**Rationale**: Status values (Active, Completed, etc.) are shared reference
values — information content entities that classify the state of other
entities. They are generically dependent continuants: they can be copied,
transferred, and concretized in multiple bearers simultaneously. This fits
GDC better than BFO Quality (BFO:0000019), which is a specifically dependent
continuant that inheres in one particular bearer. The Value Partition pattern
(ODP-6) provides the controlled vocabulary structure, while GDC alignment
gives Status a proper place in the BFO hierarchy.

**Note**: Status subtypes (SessionStatus, TaskStatus, etc.) inherit the
GDC alignment through Status. Each has an owl:oneOf enumeration closing
its individual space.

---

## ConversationParticipation (Removed)

The pre-glossary included `ConversationParticipation` as an n-ary relation
class (ODP-1). During conceptualization, this was replaced by PROV-O's
qualified association pattern (ODP-2):

- `prov:qualifiedAssociation` links activities to `prov:Association` nodes
- `prov:agent` links the association to the participating agent
- `prov:hadRole` links the association to the agent's role

This eliminates a custom reification class in favor of standard PROV-O
vocabulary. CQ-004 ("What role does each agent play?") is still answerable
via the PROV-O pattern.

---

### 27. Organization -> Object (BFO:0000030)

**Decision**: Material Entity > Object

**Rationale**: An organization is a group of people -- a social entity with
material participants. While organizations have abstract aspects, their primary
BFO alignment is as Objects (maximally self-connected entities) following
the same pattern as HumanUser. This is consistent with BFO's treatment of
organizations as material entities.

**Decision path**: Continuant > Independent Continuant > Material Entity > Object.

**Note**: Organization is also aligned with prov:Organization for provenance
tracking. It is a subclass of Agent (cross-cutting, like HumanUser).

---

### 28. Persona -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A persona is an information artifact specifying an agent's
configured identity, behavior, and system prompt. It can be shared, versioned,
and transferred between agents. This follows the same GDC pattern as other
configuration entities (ToolDefinition, Plan).

---

### 29. Observation -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: An observation is an event in which an agent receives
environmental feedback. It unfolds in time and is situated within a session.
Follows the same pattern as other Event subclasses.

---

### 30. Rehearsal -> Process (BFO:0000015)

**Decision**: Process (subclass of MemoryOperation)

**Rationale**: A rehearsal is a memory operation that strengthens a memory
item through repeated access. Like other memory operations (Encoding,
Retrieval, Consolidation, Forgetting), it is a process that acts on memory
items over time.

---

### 31. MemoryBlock -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC (subclass of MemoryItem)

**Rationale**: A memory block is a memory item that stores structured
key-value data (following the Letta core memory pattern). As an information
artifact stored in agent memory, it inherits the GDC classification from
MemoryItem.

---

### 32. Intention -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: In the BDI model, an intention is an agent's commitment to
execute a plan derived from a goal. In PAO, it is modeled as an information
content entity -- a record of the agent's committed course of action. Like
Goal and Plan, it is a GDC rather than a Realizable Entity (see DD-04 for
Goal rationale).

---

### 33. SensitivityLevel -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Sensitivity levels (Public, Internal, Confidential, Restricted)
are a controlled vocabulary for privacy classification. Like other Status
types (SessionStatus, TaskStatus, ComplianceStatus), they follow the Value
Partition pattern (ODP-6) with owl:oneOf enumeration.

---

### 34. ConsentRecord -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A consent record is an information artifact that documents
a data subject's consent for a specific processing purpose. It is a
record/document, not a process or physical entity. Similar to
PermissionPolicy in nature.

---

### 35. RetentionPolicy -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A retention policy is an information artifact specifying how
long memory items should be retained before deletion. Like PermissionPolicy
and SafetyConstraint, it is a governance rule document.

---

### 36. StatusTransition -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: A status transition is something that happens -- an entity's status
changes from one value to another. It is a reified event in the State Transition
ODP pattern, carrying fromStatus, toStatus, and transitionSubject. Like other
Event subclasses, it inherits the BFO:Process classification.

**Subclasses**: SessionStatusTransition, TaskStatusTransition -- both Processes,
pairwise disjoint under StatusTransition.

---

### 37. CompactionDisposition -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A compaction disposition is an information artifact that records
the fate of an individual item during a compaction event. It follows the N-ary
Relation pattern (ODP-1), reifying the relationship between compaction event,
item, and fate with optional rationale. As an information record, it is a GDC.

---

### 38. ItemFate -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Item fate values (Preserved, Dropped, Summarized, Archived) are a
controlled vocabulary for compaction outcomes. Like other Status types
(SessionStatus, TaskStatus, ComplianceStatus, SensitivityLevel), they follow the
Value Partition pattern (ODP-6) with owl:oneOf enumeration. ItemFate is a subclass
of Status.

---

### 39. ContextWindow -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A context window is an information resource representing the
finite attention buffer of an AI agent session. It has quantifiable properties
(token capacity, tokens used) and exists as a dependent continuant of the
session. Like MemoryItem, it is an information structure that can be described,
measured, and acted upon (compaction events respond to context window state).

**Decision path**: Continuant > Dependent Continuant > Generically Dependent
Continuant. The context window's content can be transferred between bearers
(e.g., session continuation), making it generically rather than specifically
dependent.

---

### 40. CommunicationChannel -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A communication channel is an information artifact that specifies
a configured communication endpoint (e.g., a WhatsApp thread, a CLI terminal,
a web chat widget). It can be described, shared, and referenced independently
of any specific dialogue. The channel is not the physical medium itself but
the configured access point through which dialogue occurs.

**Decision path**: Continuant > Dependent Continuant > Generically Dependent
Continuant. A channel configuration can be transferred between bearers (e.g.,
session handoff across devices), making it generically rather than specifically
dependent.

**Note**: Closest existing ontological match is SIOC's `tsioc:ChatChannel`.
Sessions are linked to channels via `viaChannel` (functional — one channel
per session). Conversations may span multiple channels through multiple sessions.

---

### 41. ChannelType -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Channel types (CLI, Messaging, WebChat, API, Voice, Email)
are a controlled vocabulary classifying communication mediums. Like other
Status types (SessionStatus, TaskStatus), they follow the Value Partition
pattern (ODP-6) with `owl:oneOf` enumeration.

**Note**: The set is extensible by adding new named individuals (e.g.,
VideoChannel in the future).

---

### 42. Integration -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: An integration is an information artifact representing a
configured connection to an external service (e.g., an MCP server, a GitHub
API connection, a Gmail connector). It specifies the connection parameters,
authentication, and the tools it provides. Like ToolDefinition and Persona,
it is a configuration entity that can be described, versioned, and shared.

**Decision path**: Continuant > Dependent Continuant > Generically Dependent
Continuant. An integration configuration can be transferred between agents or
environments, making it generically dependent.

**Note**: An integration groups related tools (via `providesTool`) and has
an operational status (via `hasIntegrationStatus`). This models the MCP
server pattern where a single server provides multiple tools.

---

### 43. IntegrationStatus -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Integration status values (Connected, Disconnected, Error,
Initializing) are a controlled vocabulary classifying the operational state
of an integration connection. Like other Status types, they follow the Value
Partition pattern (ODP-6) with `owl:oneOf` enumeration.

---

### 44. ExternalService -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: An external service is an information artifact that describes
a configured service endpoint with identity, transport, and capability metadata.
Richer than Integration, it models MCP-grade service topology including capability
discovery. It can be described, versioned, and transferred between environments.

**Decision path**: Continuant > Dependent Continuant > GDC.

---

### 45. ServiceConnection -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A service connection is an information entity representing the
runtime link between an agent and an external service. It carries connection
status and metadata. While connections have temporal aspects, the entity itself
is an information record of the connection state, not the process of connecting.

---

### 46. ServiceCapability -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A capability specification is an information artifact describing
what a service can do (provide tools, resources, or prompts). It is a
description that can be discovered, listed, and compared.

**Subclasses**: ServiceToolCapability, ServiceResourceCapability,
ServicePromptCapability — all GDCs, forming a DisjointUnion under
ServiceCapability (MCP capability types).

---

### 47-49. ServiceToolCapability, ServiceResourceCapability, ServicePromptCapability -> GDC (BFO:0000031)

**Decision**: GDC (inherit from ServiceCapability)

**Rationale**: Each is a specialized capability description. Tool capabilities
expose callable functions, resource capabilities expose readable data, prompt
capabilities expose templates. All are information specifications.

---

### 50. CapabilityDiscoveryEvent -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: Capability discovery is something that happens — an agent
queries a service, receives capability listings, and records them. It unfolds
in time and produces results.

**Decision path**: Occurrent > Process.

---

### 51. ConnectionStatus -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Connection status values (Open, Closed, Reconnecting, Failed)
are a controlled vocabulary for runtime service connection state. Follows
ODP-6 with `owl:oneOf` enumeration.

---

### 52. SandboxPolicy -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A sandbox policy is an information artifact specifying filesystem
and network restrictions imposed on an agent. It is a configuration entity
that can be described, versioned, and applied to multiple agents.

---

### 53. Hook -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A hook is a configured interceptor definition — it specifies
trigger conditions and actions for tool invocation interception. It is an
information entity distinct from the execution of the hook.

---

### 54. HookExecution -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: A hook execution is something that happens — a hook fires,
intercepts an invocation, and produces a result (allow/block/modify). It
unfolds in time and has temporal extent.

---

### 55. AuditLog -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: An audit log is a container for audit entries — an information
artifact that aggregates authorization decision records. It can be stored,
queried, and archived.

---

### 56. AuditEntry -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: An audit entry is an information record of an authorization
decision for a specific tool invocation. It carries the decision outcome,
rationale, and timestamp. It is a record, not the decision process itself.

---

### 57. PermissionMode -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Permission mode values (Permissive, Standard, Restrictive)
are a controlled vocabulary classifying how strictly an agent's tool
invocations are gated. Follows ODP-6.

---

### 58. AuthorizationDecision -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Authorization decision values (Allow, Deny, RequireApproval)
classify the outcome recorded in an audit entry. Follows ODP-6.

---

### 59. CheckpointDecision -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Checkpoint decision values (Approved, Rejected, Deferred)
classify human decisions at task checkpoints. Follows ODP-6.

---

### 60. ErrorRecoveryEvent -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: An error recovery event is something that happens — an agent
detects a failure and initiates a recovery sequence. It unfolds in time
and may trigger retry, replan, or rollback sub-events.

---

### 61. RetryAttempt -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: A retry attempt is a re-execution of a failed operation. It
unfolds in time and has a result (success or failure).

---

### 62. ReplanEvent -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: A replan event is the process by which an agent generates a
new plan after a failure. It produces a new Plan as output.

---

### 63. RollbackEvent -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: A rollback event is the process of reverting changes from a
failed operation. It undoes side effects and restores prior state.

---

### 64. Checkpoint -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A checkpoint is an information entity representing a decision
point in a task workflow where human approval may be required. It records the
task, the decision, and the rationale. It is a record/specification, not the
process of deciding.

---

## v0.6.0 Phase B Alignment Decisions

### 65. ToolResult -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A tool result is the typed output artifact produced by a tool
invocation. It is information content (text, JSON, error messages) that can
be stored, transmitted, and referenced. Distinct from the ToolInvocation
process that produced it.

---

### 66. ToolInvocationGroup -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A tool invocation group is an organizational entity that groups
parallel tool invocations within a single turn. It is a structural grouping
artifact, not a process itself. The invocations within it are processes; the
group is an information record of their co-occurrence.

---

### 67. ContentBlock -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A content block is a typed segment of a message's content
(text, tool use, tool result, image). It is an information artifact that
carries content and has a type classification and sequence position.

---

### 68. ContentBlockType -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Content block types (TextBlock, ToolUseBlock, ToolResultBlock,
ImageBlock) are a controlled vocabulary classifying message content segments.
Follows ODP-6 with `owl:oneOf` enumeration.

---

### 69. MemorySource -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Memory source values (UserSource, SystemSource, AgentSource)
classify the origin of a memory item. Follows ODP-6 with `owl:oneOf`
enumeration.

---

### 70. MemoryScope -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Memory scope values (SessionScope, ProjectScope, GlobalScope)
classify the visibility of a memory item. Follows ODP-6 with `owl:oneOf`
enumeration.

---

### 71. SharedMemoryArtifact -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A shared memory artifact is an information entity accessible
to multiple agents for collaborative read/write. It is not a subclass of
MemoryItem (which would create disjointness issues with Episode/Claim/MemoryBlock)
but a standalone GDC that links to agents via `sharedAcrossAgents`.

---

### 72. MemoryWriteConflict -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: A memory write conflict is something that happens — multiple
agents attempt concurrent writes to the same shared memory artifact. It
unfolds in time and has a resolution outcome. It is an event, not an
information record.

---

### 73. DialogAct -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A dialog act is an information entity representing the pragmatic
classification of a turn's communicative intent. Inspired by DIT++ and ISO
24617-2. It is a classification record, not the communicative process itself
(which is the Turn).

---

### 74. CommunicativeFunction -> Value Partition (no BFO parent)

**Decision**: Value Partition with named individuals

**Rationale**: Communicative function values (Inform, Request, Confirm, Clarify,
Accept, Reject) are a curated subset from DIT++/ISO 24617-2 classifying the
illocutionary force of dialog acts. Follows ODP-6 with `owl:oneOf` enumeration.

---

### 75. CommonGround -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: Common ground is an information entity representing the accumulated
shared knowledge state between conversation participants (Clark & Schaefer 1989).
It is a knowledge structure that grows through grounding acts, not a process
itself.

---

### 76. GroundingAct -> Process (BFO:0000015)

**Decision**: Process (subclass of Event)

**Rationale**: A grounding act is something that happens — a participant
contributes evidence to the common ground. It produces AcceptanceEvidence
and updates CommonGround. Like other Event subclasses, it has temporal
extent and participants.

---

### 77. ClarificationRequest -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A clarification request is an information entity recording a
request for additional information to resolve ambiguity. It references the
turn being clarified via `clarifiesTurn`. It is a record of the request,
not the act of requesting itself.

---

### 78. AcceptanceEvidence -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: Acceptance evidence is an information entity recording evidence
that a participant has accepted or understood a proposition. Produced by
GroundingActs and contributed to CommonGround. It is a record, not the
acceptance process.

---

## v0.7.0 Phase C Alignment Decisions

### 79. ModelProvider -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: An information artifact identifying an organization that hosts
foundation models. It is a specification of a hosting entity, not the entity
itself. Persists independently of any particular model deployment.

---

### 80. FoundationModel -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: An information artifact specifying a model family (name, version).
It describes the model's identity and capabilities as a document, not the
computational process itself. Has a HasKey axiom on hasModelId.

---

### 81. ModelDeployment -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A configuration artifact for a running model endpoint. It
describes deployment parameters and endpoint information as structured data,
not the running service itself.

---

### 82. ModelInvocation -> Process (BFO:0000015)

**Decision**: Process (via pao:Event)

**Rationale**: A temporal process in which a foundation model generates output.
It unfolds in time, has a beginning and end, and produces a result. Subclass
of Event, which is already aligned to BFO:Process.

---

### 83. GenerationConfiguration -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A parameter set document specifying temperature, top-p, max
tokens, seed, and prompt version for controlling model generation. It is an
information specification, not a process.

---

### 84. OperationalMetric -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A named metric type definition (e.g., latency_p99, error_rate).
It is an information artifact defining what is measured, not the measurement
itself.

---

### 85. MetricObservation -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A recorded measurement data point. While the act of measuring
is a process, the recorded observation is an information artifact with a value
and timestamp. Analogous to how Claim records a proposition.

---

### 86. ReliabilityIncident -> Process (BFO:0000015)

**Decision**: Process (via pao:Event)

**Rationale**: A failure or degradation event. It unfolds in time, has temporal
extent, and may trigger recovery processes. Subclass of Event.

---

### 87. FailureType -> Value Partition (GDC via Status)

**Decision**: Value Partition with named individuals

**Rationale**: A controlled vocabulary classifying failure categories. Follows
the same Value Partition pattern (ODP-6) used for SessionStatus, TaskStatus,
etc. Enumerated individuals with `owl:oneOf`.

**Individuals**: Timeout, AuthenticationFailure, RateLimited,
DependencyFailure, ConfigurationError, NetworkError.

---

### 88. Belief -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: An agent-held proposition about the world. It is information
content -- a statement the agent treats as true. Not a quality or disposition
of the agent, but a separate information entity the agent holds.

---

### 89. Desire -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: A desired state or outcome. Like Goal (which is already GDC),
a Desire is an information specification of what the agent wants. It describes
a target state, not the motivational process.

---

### 90. Justification -> Generically Dependent Continuant (BFO:0000031)

**Decision**: GDC

**Rationale**: Evidence supporting an intention. It is a record or document
providing rationale, not the reasoning process itself (which is Deliberation).

---

### 91. Deliberation -> Process (BFO:0000015)

**Decision**: Process (via pao:Event)

**Rationale**: A reasoning process in which an agent considers beliefs and
desires to produce intentions. It unfolds in time and has temporal extent.
Subclass of Event. Distinct from the information entities it considers
(Belief, Desire) and produces (Intention).

---

## v0.8.0 Phase D Alignment Decisions

### 92. Schedule -> Generically Dependent Continuant (BFO:0000031)

- **BFO Category**: Generically Dependent Continuant (GDC, BFO:0000031)
- **Parent**: prov:Entity
- **Rationale**: A schedule definition is an information artifact specifying when and what action to perform. It is a GDC because it can be copied across systems and exists independently of any particular execution. Analogous to how Plan is a GDC.

---

### 93. RecurrencePattern -> Generically Dependent Continuant (BFO:0000031)

- **BFO Category**: Generically Dependent Continuant (GDC, BFO:0000031)
- **Parent**: prov:Entity
- **Rationale**: A recurrence pattern is a temporal specification (cron expression, interval) that can be instantiated across multiple schedules. It is information content that describes when something should happen, not the happening itself.

---

### 94. Trigger -> Generically Dependent Continuant (BFO:0000031)

- **BFO Category**: Generically Dependent Continuant (GDC, BFO:0000031)
- **Parent**: prov:Entity
- **Rationale**: A trigger is a configured activation condition specification. It is a GDC because it describes a condition, not the event of being triggered. The actual firing produces a ScheduledExecution (Process).

---

### 95. CronTrigger -> Generically Dependent Continuant (BFO:0000031)

- **BFO Category**: Generically Dependent Continuant (GDC, BFO:0000031)
- **Parent**: Trigger
- **Rationale**: Inherits GDC from Trigger. Specializes to cron-expression-based time triggers.

---

### 96. IntervalTrigger -> Generically Dependent Continuant (BFO:0000031)

- **BFO Category**: Generically Dependent Continuant (GDC, BFO:0000031)
- **Parent**: Trigger
- **Rationale**: Inherits GDC from Trigger. Specializes to fixed-interval periodic triggers.

---

### 97. EventTrigger -> Generically Dependent Continuant (BFO:0000031)

- **BFO Category**: Generically Dependent Continuant (GDC, BFO:0000031)
- **Parent**: Trigger
- **Rationale**: Inherits GDC from Trigger. Specializes to event-driven reactive triggers (ECA pattern).

---

### 98. ScheduledExecution -> Process (BFO:0000015)

- **BFO Category**: Process (BFO:0000015)
- **Parent**: Event (via pao:Event)
- **Rationale**: A scheduled execution is a temporal process that unfolds in time — it has a beginning, duration, and end. It is the actualization of a schedule at a specific time, producing an outcome. Classified as Process via Event, consistent with other PAO events (ToolInvocation, Deliberation, etc.).

---

### 99. ScheduleStatus -> Value Partition (no BFO parent)

- **BFO Category**: Value Partition (no BFO parent)
- **Parent**: Status
- **Rationale**: Controlled vocabulary for schedule lifecycle states (Active, Paused, Expired, Disabled). Uses the Value Partition ODP consistent with existing PAO status classes (SessionStatus, TaskStatus, etc.).

---

### 100. ExecutionOutcome -> Value Partition (no BFO parent)

- **BFO Category**: Value Partition (no BFO parent)
- **Parent**: Status
- **Rationale**: Controlled vocabulary for execution results (Succeeded, Failed, Skipped). Uses the Value Partition ODP.

---

### 101. ConcurrencyPolicy -> Value Partition (no BFO parent)

- **BFO Category**: Value Partition (no BFO parent)
- **Parent**: Status
- **Rationale**: Controlled vocabulary for overlap handling (Allow, Forbid, Replace). Modeled as a VP rather than a class hierarchy because the values are a closed, exhaustive set of behavioral options. Inspired by Kubernetes CronJob concurrencyPolicy field.

---

## Cross-Cutting Concerns

### Information vs. Process Distinction

PAO consistently separates:
- **Information artifacts** (GDC): things that carry content (messages,
  memory items, plans, policies)
- **Processes**: things that happen (conversations, tool invocations,
  memory operations, erasure events)

This follows anti-pattern #7 (Information-Physical Conflation) and the
BFO Continuant/Occurrent disjointness.

### Episode Resolution

The pre-glossary listed Episode as dual-natured (MemoryItem + Event).
This was resolved by treating Episode as purely a GDC (memory item) that
records events. The relationship between events and episodes uses
`recordedInEpisode` rather than mereological `partOf`, respecting the
BFO category boundary.

### Agent Hierarchy

The Agent class cross-cuts BFO categories:
- HumanUser -> Object (Material Entity)
- AIAgent, SubAgent -> GDC

This is a pragmatic decision documented as a known trade-off. The
alternative (Agent-as-Role) was rejected for CQ usability reasons.
