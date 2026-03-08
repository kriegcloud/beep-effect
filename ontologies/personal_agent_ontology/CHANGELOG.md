# Changelog

All notable changes to the Personal Agent Ontology will be documented here.

This project uses [Semantic Versioning](https://semver.org/).

## [0.8.0] - 2026-02-21

### Added

**10 New Classes — Module 9: Scheduling & Automation**
- Schedule, RecurrencePattern, Trigger (with DisjointUnion subtypes:
  CronTrigger, IntervalTrigger, EventTrigger), ScheduledExecution,
  ScheduleStatus, ExecutionOutcome, ConcurrencyPolicy

**13 New Properties (10 object, 3 data)**
- Object: hasRecurrencePattern, schedulesAction, hasScheduleStatus,
  executionOf, hasExecutionOutcome, hasConcurrencyPolicy, activatedBy,
  servesGoal, ownedByAgent, initiatedSession
- Data: hasCronExpression, hasIntervalSeconds, allowsCatchUp

**15 New Competency Questions (CQ-114 through CQ-128)**
- Schedule definitions and trigger types (CQ-114 to CQ-116)
- Schedule lifecycle and status (CQ-117, CQ-118)
- Execution tracking and outcomes (CQ-119 to CQ-122)
- Concurrency control (CQ-123, CQ-124)
- Catch-up/backfill policies (CQ-125)
- Goal linkage and agent ownership (CQ-126 to CQ-128)

**6 New Use Cases (UC-048 through UC-053)**

**10 New Reference Individuals (3 VP groups)**
- ScheduleStatus: ScheduleActive, SchedulePaused, ScheduleExpired,
  ScheduleDisabled
- ExecutionOutcome: ExecutionSucceeded, ExecutionFailed, ExecutionSkipped
- ConcurrencyPolicy: ConcurrencyAllow, ConcurrencyForbid, ConcurrencyReplace

### Changed

- SHACL shapes expanded from 57 to 60 NodeShapes
- AllDisjointClasses: Event subtypes expanded to 21-way, Status subtypes
  to 20-way, cross-module GDC to 44-way
- New Trigger DisjointUnion (CronTrigger, IntervalTrigger, EventTrigger)
- Property hierarchy: hasScheduleStatus, hasExecutionOutcome,
  hasConcurrencyPolicy all subPropertyOf hasStatus
- Individual URIs use qualified names (ScheduleActive, ExecutionFailed,
  ConcurrencyAllow) to avoid collisions with existing Status individuals

### Metrics

| Metric | v0.7.0 | v0.8.0 |
|--------|--------|--------|
| Classes | 105 | 115 |
| Object properties | 128 | 138 |
| Data properties | 32 | 35 |
| SHACL shapes | 57 | 60 |
| Named individuals | 65 | 75 |
| CQ tests | 113 | 128 |
| Total tests | 1,212 | 1,332 |
| TBox triples | 2,354 | 2,564 |

## [0.7.0] - 2026-02-20

### Added

**13 New Classes across 4 domains**

Domain A — Model Identity & Execution Provenance:
- ModelProvider, FoundationModel, ModelDeployment, ModelInvocation,
  GenerationConfiguration

Domain B — Operational Observability:
- OperationalMetric, MetricObservation, ReliabilityIncident

Domain C — Failure Taxonomy Expansion:
- FailureType (value partition for failure classification)

Domain D — BDI Completion:
- Belief, Desire, Justification, Deliberation

**27 New Properties (18 object, 9 data)**
- Model identity: hasProvider, usesModel, deployedAs, invokedOnDeployment,
  hasGenerationConfig, modelInvocationForTurn, producedByModelInvocation
- Observability: observesMetric, observedOnEntity, incidentForEntity,
  linkedToRecovery
- Failure: hasFailureType
- BDI: heldBelief, holdsDesire, justifiesIntention, producesIntention,
  considersBelief, considersDesire
- Data: hasModelId, hasModelVersion, hasTemperature, hasTopP,
  hasMaxOutputTokens, hasPromptVersion, hasSeed, hasMetricName, hasMetricValue

**15 New Competency Questions (CQ-099 through CQ-113)**
- Model identity and execution provenance (CQ-099 to CQ-103)
- Operational observability and reliability (CQ-104 to CQ-107)
- Failure type classification (CQ-108, CQ-109)
- BDI beliefs, desires, deliberation, justification (CQ-110 to CQ-113)

**7 New Use Cases (UC-041 through UC-047)**

**6 New Reference Individuals**
- FailureType: Timeout, AuthenticationFailure, RateLimited,
  DependencyFailure, ConfigurationError, NetworkError

### Changed

- SHACL shapes expanded from 46 to 57 NodeShapes
- AllDisjointClasses: Event subtypes expanded to 20-way, Status subtypes
  to 17-way, cross-module GDC to 41-way
- HasKey axiom added for FoundationModel (hasModelId)
- owl:priorVersion added to all three ontology modules

### Metrics

| Metric | v0.6.0 | v0.7.0 |
|--------|--------|--------|
| Classes | 92 | 105 |
| Object properties | 110 | 128 |
| Data properties | 23 | 32 |
| SHACL shapes | 46 | 57 |
| Named individuals | 60 | 65 |
| CQ tests | 97 | 113 |
| Total tests | 1,035+ | 1,212 |
| TBox triples | 2,010 | 2,354 |

## [0.6.0] - 2026-02-20

### Added

**36 New Classes (Phase A: 21, Phase B: 15)**

Phase A — External Services, Runtime Safety, Recovery/Resilience:
- ExternalService, ServiceConnection, ConnectionStatus, ServiceCapability,
  ToolCapability, ResourceCapability, PromptCapability, ServiceFailureEvent
- Hook, HookExecution, SandboxPolicy, PermissionMode, AuditLog, AuditEntry,
  AuthorizationDecision
- ErrorRecoveryEvent, RetryAttempt, ReplanEvent, RollbackEvent, Checkpoint,
  CheckpointDecision

Phase B — Tool/Message Trace, Memory Control Plane, Dialog Pragmatics:
- ToolResult, ToolInvocationGroup, ContentBlock, ContentBlockType
- MemorySource, MemoryScope, SharedMemoryArtifact, MemoryWriteConflict
- DialogAct, CommunicativeFunction, CommonGround, GroundingAct,
  ClarificationRequest, AcceptanceEvidence
- ClaimType (value partition for controlled claim classification)

**42 New Properties (Phase A: 25, Phase B: 17)**
- 36 new object properties, 6 new data properties
- See validation report for full property list

**20 New Competency Questions (CQ-079 through CQ-098)**
- External service capabilities and connection status
- Runtime safety: hooks, audit, authorization
- Recovery: error recovery, retry, checkpoint
- Tool invocation grouping, typed results, content blocks
- Memory provenance by source/scope, shared memory conflicts
- Dialog acts, communicative functions, grounding, clarification

**13 New Use Cases (UC-033 through UC-045)**

**30 New Reference Individuals**
- ConnectionStatus (4), PermissionMode (3), AuthorizationDecision (3),
  CheckpointDecision (3), ContentBlockType (4), MemorySource (3),
  MemoryScope (3), CommunicativeFunction (5), ClaimType (2)

### Changed

- claimType migrated from DatatypeProperty(xsd:string) to
  ObjectProperty(ClaimType VP) with owl:oneOf enumeration
- SHACL shapes expanded from 26 to 46 NodeShapes
- AllDisjointClasses axioms expanded to 11 groups
- Event DisjointUnion expanded to 15 subtypes
- All 26 Event ABox instances now have hasTemporalExtent linked to
  time:Instant objects
- OWL minQualifiedCardinality 2 for SharedMemoryArtifact.sharedAcrossAgents
  and MemoryWriteConflict.writesByAgent
- SHACL shapes strengthened to mirror OWL existential restrictions
  (AIAgent, ToolInvocation, MemoryItem, Episode, Event, Session)

### Metrics

| Metric | v0.5.0 | v0.6.0 |
|--------|--------|--------|
| Classes | 57 | 92 |
| Object properties | 93 | 110 |
| Data properties | 17 | 23 |
| SHACL shapes | 31 | 46 |
| Named individuals | 30 | 60 |
| CQ tests | 78 | 97 |
| Total tests | ~820 | 1,035+ |
| TBox triples | ~1,500 | 2,010 |

## [0.5.0] - 2026-02-19

### Added

**6 New Classes**
- CommunicationChannel, ChannelType (channels module)
- Integration, IntegrationStatus (integrations module)
- CapabilityDiscoveryEvent, ContextWindow

**29 New Properties**
- Object properties for channel/integration modeling, context window
  management, capability discovery
- Data properties: hasEndpoint, hasServiceName, hasTokenCapacity,
  hasTokensUsed

**18 New Competency Questions (CQ-061 through CQ-078)**
- Communication channels and routing
- Integration lifecycle and status tracking
- Context window management and token tracking
- Capability discovery

**4 New Use Cases (UC-030 through UC-033)**

### Changed

- SHACL shapes expanded from 26 to 31 NodeShapes
- AllDisjointClasses expanded for new sibling groups
- Event DisjointUnion expanded to include CapabilityDiscoveryEvent

### Metrics

| Metric | v0.4.0 | v0.5.0 |
|--------|--------|--------|
| Classes | 51 | 57 |
| Object properties | 64 | 93 |
| Data properties | 14 | 17 |
| SHACL shapes | 26 | 31 |
| Named individuals | 21 | 30 |
| CQ tests | 59 | 78 |
| Total tests | 577 | ~820 |
| TBox triples | 1,194 | ~1,500 |

## [0.4.0] - 2026-02-19

### Added

**ContextWindow class** modeling token capacity and usage tracking for
AI agent sessions.

### Metrics

| Metric | v0.3.0 | v0.4.0 |
|--------|--------|--------|
| Classes | 51 | 51 |

## [0.3.0] - 2026-02-19

### Added

**5 New Classes**
- Events: StatusTransition, SessionStatusTransition, TaskStatusTransition (State Transition ODP)
- Memory: CompactionDisposition (n-ary reification for compaction trace)
- Governance: ItemFate (controlled vocabulary for compaction outcomes)

**18 New Properties**
- Object properties: compactedItem, continuedBy, continuedFrom, dispositionOf,
  fromStatus, hasCompactionDisposition, hasItemFate, nextTransition,
  previousTransition, toStatus, transitionSubject, triggeredBy
- Data properties: fateReason, hasAgentId, hasConversationId, hasLastAccessTime,
  hasSessionId, isEvictionCandidate

**4 New Reference Individuals**
- ItemFate enumeration: Preserved, Dropped, Summarized, Archived

**9 New Competency Questions (CQ-052 through CQ-060)**
- Compaction trace: dropped items (CQ-052), preservation fraction (CQ-053)
- Eviction: last access time (CQ-054), eviction eligibility (CQ-055)
- Session continuity: cross-session resume (CQ-056)
- Identity: unique identifiers (CQ-057)
- Lifecycle: status transitions (CQ-058), prior status (CQ-059), trigger events (CQ-060)

**3 New Use Cases (UC-027 through UC-029)**

### Changed

- owl:hasKey identity contracts on AIAgent, Session, Conversation
- compactedItem declared as subPropertyOf prov:used for PROV-O interop
- SHACL shapes expanded from 24 to 26 NodeShapes (StatusTransition, CompactionDisposition)
- MemoryItemShape updated with hasLastAccessTime constraint
- AIAgentShape, SessionShape, ConversationShape updated with ID field requirements
- AllDisjointClasses axioms expanded to 10 groups
- Event DisjointUnion expanded to 9 subtypes (added StatusTransition)
- Status subtypes expanded to 5 (added ItemFate)

### Metrics

| Metric | v0.2.0 | v0.3.0 |
|--------|--------|--------|
| Classes | 46 | 51 |
| Object properties | 52 | 64 |
| Data properties | 8 | 14 |
| SHACL shapes | 24 | 26 |
| Named individuals | 17 | 21 |
| CQ tests | 50 | 59 |
| Total tests | 480 | 577 |
| TBox triples | 999 | 1,194 |

## [0.2.0] - 2026-02-19

### Added

**9 New Classes**
- Identity: Organization, Persona
- Conversation: Observation
- Memory: Rehearsal, MemoryBlock
- Planning: Intention (BDI model)
- Governance: SensitivityLevel (controlled vocabulary), ConsentRecord, RetentionPolicy

**12 New Properties**
- Object properties: belongsTo, hasMember, hasPersona, intendedBy, derivedFromGoal,
  consentSubject, consentPurpose, governedByRetention
- Data properties: hasBlockKey, hasBlockValue, retentionPeriodDays

**11 New Competency Questions (CQ-041 through CQ-051)**
- Identity: organizational affiliation (CQ-041), persona assignment (CQ-042)
- Conversation: observations (CQ-043)
- Memory: rehearsal tracking (CQ-044), memory blocks (CQ-045)
- Planning: intentions (CQ-046, CQ-047)
- Governance: sensitivity levels (CQ-048), consent (CQ-049), retention (CQ-050, CQ-051)

**7 New Use Cases (UC-020 through UC-026)**

### Changed

- **hasSensitivityLevel migrated** from DatatypeProperty(xsd:string) to
  ObjectProperty(SensitivityLevel) with controlled vocabulary enum
  (Public, Internal, Confidential, Restricted)
- SHACL shapes expanded from 12 to 24 NodeShapes
- MemoryOperation DisjointUnion expanded to 5 subtypes (added Rehearsal)
- AllDisjointClasses axioms expanded to 9 groups
- Design notes DN-01, DN-02, DN-03 resolved

### Metrics

| Metric | v0.1.0 | v0.2.0 |
|--------|--------|--------|
| Classes | 37 | 46 |
| Object properties | 43 | 52 |
| Data properties | 6 | 8 |
| SHACL shapes | 12 | 24 |
| Named individuals | 13 | 17 |
| CQ tests | 39 | 50 |
| Total tests | 377 | 480 |
| TBox triples | 810 | 999 |

## [0.1.0] - 2026-02-18

### Added

**Ontology Core (37 classes, 48 properties)**
- Agent hierarchy: Agent, AIAgent, HumanUser, SubAgent
- Conversation model: Conversation, Session, Turn, Message, CompactionEvent
- Memory architecture: MemoryItem, MemoryTier, Episode, Claim, and 4 memory
  tiers (Working, Episodic, Semantic, Procedural)
- Memory operations: Encoding, Retrieval, Consolidation, Forgetting
- Planning: Goal, Plan, Task with status tracking and dependency management
- Governance: PermissionPolicy, SafetyConstraint, ErasureEvent
- Event hierarchy: Event, Action, ToolInvocation
- Status value partitions: SessionStatus, TaskStatus, ComplianceStatus
- Agent roles: AgentRole with AssistantRole and UserRole individuals

**External Alignments**
- BFO 2020 upper ontology alignment for all 37 classes
- PROV-O import for provenance (Agent, Activity, Entity, Plan, Role)
- OWL-Time import for temporal reasoning (Instant, Interval)
- FOAF import for person modeling
- ODRL 2.2 import for permission/policy modeling

**Axioms and Constraints**
- 42 object properties with domain/range, 6 datatype properties
- 37 existential restrictions linking classes to required relations
- 8 AllDisjointClasses axioms covering all sibling groups
- 2 DisjointUnion covering axioms (MemoryOperation, MemoryTier subtypes)
- Property hierarchy with 5 subPropertyOf relationships
- 9 inverse property pairs
- 20 functional properties, 2 transitive properties

**Quality Artifacts**
- 12 SHACL NodeShapes for structural validation
- 374 unit tests (100% pass rate)
- 40 competency questions, 39 formalized as SPARQL acceptance tests
- ROBOT quality report: 0 ERRORs, 29 WARNs (external terms only)

**SSSOM Mappings (44 total)**
- schema.org: 14 mappings (actions, conversations, messages)
- ActivityStreams 2.0: 12 mappings (activity/actor model)
- SIOC: 10 mappings (conversation threading)
- DPV: 8 mappings (privacy/governance compliance)

**Documentation**
- ORSD with scope document and use cases
- Glossary (50 terms), conceptual model, BFO alignment rationale
- Property design specification and axiom plan
- Anti-pattern review, ODP recommendations, reuse report
- Validation report with 6-level quality assessment

### Release Artifacts

| Format | File | Size |
|--------|------|------|
| Turtle | `personal_agent_ontology.ttl` | 62 KB |
| OWL/XML | `personal_agent_ontology.owl` | 88 KB |
| JSON-LD | `personal_agent_ontology.jsonld` | 123 KB |
| SHACL shapes | `pao-shapes.ttl` | 3.2 KB |
| Reference individuals | `pao-reference-individuals.ttl` | 3.7 KB |
