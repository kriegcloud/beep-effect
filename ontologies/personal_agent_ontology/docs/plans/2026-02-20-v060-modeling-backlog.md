# PAO v0.6.0 Modeling Backlog for Implementation Architecture

Status: Draft
Date: 2026-02-20
Scope baseline: PAO v0.5.0 (through CQ-078)
Purpose: Convert remaining research-to-model gaps into an implementation-ready ontology backlog.

## 1. Objective

This document defines the next modeling tranche required to make the Personal Agent Ontology (PAO) a stronger architectural blueprint for implementation.

It focuses on concept gaps that are still under-modeled or not modeled, despite being identified in PAO research documents.

## 2. Inputs and Traceability

Primary research and requirements sources:

- `ontologies/personal_agent_ontology/docs/research-agent-patterns.md`
- `ontologies/personal_agent_ontology/docs/research-existing-ontologies.md`
- `ontologies/personal_agent_ontology/docs/research-academic-foundations.md`
- `ontologies/personal_agent_ontology/docs/research-letta-memory.md`
- `ontologies/personal_agent_ontology/docs/research-memory-architectures.md`
- `ontologies/personal_agent_ontology/docs/orsd.md`

Current modeled baseline:

- `ontologies/personal_agent_ontology/personal_agent_ontology.ttl`
- `ontologies/personal_agent_ontology/shapes/pao-shapes.ttl`
- `ontologies/personal_agent_ontology/docs/competency-questions.yaml`
- `ontologies/personal_agent_ontology/docs/property-design.yaml`
- `ontologies/personal_agent_ontology/docs/conceptual-model.yaml`
- `ontologies/personal_agent_ontology/tests/`

## 3. Current Gap Summary

Priority legend:

- P0: Needed before architecture handoff / implementation spec freeze
- P1: Important for production behavior and governance completeness
- P2: High-value extensions after core architecture stabilizes

| Gap Domain | Priority | Current State | Primary Deficiency |
|---|---|---|---|
| External service capability model (MCP-grade) | P0 | Integration is modeled, but capability graph is thin | Missing explicit service/capability/discovery/connection lifecycle |
| Runtime safety control plane | P0 | Policy exists at tool invocation level | Missing permission mode, sandbox policy, hooks, and audit surface |
| Recovery and resilience process model | P0 | Error state exists; little recovery semantics | Missing retry/replan/rollback/checkpoint entities and flows |
| Tool and message trace richness | P1 | ToolInvocation with input/output exists | Missing grouped invocations, typed result artifacts, content blocks |
| Memory control plane and sharing | P1 | Tier + item + operations exist | Missing memory source/scope/file/shared ownership and concurrency semantics |
| Dialog pragmatics and grounding | P1 | Conversation/session/turn/message exists | Missing dialog acts, communicative functions, common ground, grounding evidence |
| BDI completion | P2 | Goal/Plan/Intention exists | Missing Belief, Desire, Justification, Deliberation |
| Operational observability metrics | P2 | Status queries exist | Missing modeled metrics/events for reliability and performance trends |

## 4. Backlog by Domain

## 4.1 P0: External Service Capability Model

### Rationale

Current `Integration` modeling captures tool provision and status, but not full service capability topology. This limits implementation choices for discovery, routing, and capability governance.

### Proposed classes

- `ExternalService`
- `ServiceConnection`
- `ServiceCapability` (abstract)
- `ServiceToolCapability` (subclass)
- `ServiceResourceCapability` (subclass)
- `ServicePromptCapability` (subclass)
- `CapabilityDiscoveryEvent`
- `ConnectionStatus` (value partition)

### Proposed properties

- `hasExternalService` (Agent -> ExternalService)
- `hasServiceConnection` (Agent -> ServiceConnection)
- `connectsToService` (ServiceConnection -> ExternalService)
- `exposesCapability` (ExternalService -> ServiceCapability)
- `discoveredCapability` (CapabilityDiscoveryEvent -> ServiceCapability)
- `discoveryAgainstService` (CapabilityDiscoveryEvent -> ExternalService)
- `hasConnectionStatus` (ServiceConnection -> ConnectionStatus)
- `hasServiceTransport` (ExternalService -> xsd:string)
- `hasServiceIdentifier` (ExternalService -> xsd:string)

### SHACL additions

- `ExternalServiceShape`
- `ServiceConnectionShape`
- `CapabilityDiscoveryEventShape`

### CQ additions (proposed)

- CQ-079: What external services are configured for each agent?
- CQ-080: What capabilities does a given external service expose?
- CQ-081: Which capabilities were discovered in the latest discovery event?
- CQ-082: Which services provide resources versus tools versus prompts?

### Test additions

- `tests/cq-079.sparql` through `tests/cq-082.sparql`
- manifest entries + pytest lists
- ABox sample for at least one service exposing all capability types

### Acceptance criteria

- Can query service capability surfaces independently of Integration
- Discovery events are queryable with timestamps and resulting capabilities
- SHACL enforces minimum viable service metadata

## 4.2 P0: Runtime Safety Control Plane

### Rationale

`PermissionPolicy` is present, but runtime safety architecture needs explicit modeling for operational mode, sandboxing, hooks, and full decision audit.

### Proposed classes

- `PermissionMode`
- `SandboxPolicy`
- `Hook`
- `HookExecution`
- `AuditLog`
- `AuditEntry`
- `AuthorizationDecision` (value partition: Allow, Deny, RequireApproval)

### Proposed properties

- `operatesInMode` (Agent -> PermissionMode)
- `enforcedBySandboxPolicy` (Agent -> SandboxPolicy)
- `hasHook` (Agent -> Hook)
- `hookTriggeredExecution` (Hook -> HookExecution)
- `interceptsInvocation` (HookExecution -> ToolInvocation)
- `recordsDecision` (AuditEntry -> AuthorizationDecision)
- `auditForInvocation` (AuditEntry -> ToolInvocation)
- `writtenToAuditLog` (AuditEntry -> AuditLog)
- `hasDecisionReason` (AuditEntry -> xsd:string)

### SHACL additions

- `PermissionModeShape`
- `SandboxPolicyShape`
- `HookShape`
- `AuditEntryShape`

### CQ additions (proposed)

- CQ-083: What permission mode is active for each agent?
- CQ-084: Which sandbox policy constrains a given agent?
- CQ-085: Which hooks intercepted a specific tool invocation?
- CQ-086: What authorization decisions were recorded for denied operations?

### Acceptance criteria

- Every governed invocation can be traced to a decision and rationale
- Hook interception history is queryable
- Safety mode and sandbox posture are explicit ontology objects, not implicit config

## 4.3 P0: Recovery and Resilience Process Model

### Rationale

Error states are modeled, but there is no process-level representation for recovery trajectories (retry/replan/rollback/checkpoint), which are core to resilient agent architecture.

### Proposed classes

- `ErrorRecoveryEvent`
- `RetryAttempt`
- `ReplanEvent`
- `RollbackEvent`
- `Checkpoint`
- `CheckpointDecision`

### Proposed properties

- `recoveringFrom` (ErrorRecoveryEvent -> ToolInvocation or Integration or Session)
- `attemptedRetry` (ErrorRecoveryEvent -> RetryAttempt)
- `triggeredReplan` (ErrorRecoveryEvent -> ReplanEvent)
- `triggeredRollback` (ErrorRecoveryEvent -> RollbackEvent)
- `checkpointForTask` (Checkpoint -> Task)
- `checkpointDecision` (Checkpoint -> CheckpointDecision)
- `hasAttemptCount` (RetryAttempt -> xsd:nonNegativeInteger)
- `hasRecoveryOutcome` (ErrorRecoveryEvent -> xsd:string)

### CQ additions (proposed)

- CQ-087: What recovery events occurred after failed invocations?
- CQ-088: How many retries were attempted before success or abandonment?
- CQ-089: Which tasks required human checkpoint decisions?

### Acceptance criteria

- Failure-to-recovery chain can be queried end-to-end
- Retry and rollback semantics are visible in event history
- Checkpoint decisions are part of auditable task lifecycle

## 4.4 P1: Tool and Message Trace Richness

### Rationale

Current model captures invocation mechanics but does not represent grouped parallel invocations or typed content structures, both critical for modern agent traces.

### Proposed classes

- `ToolResult` (explicit artifact class)
- `ToolInvocationGroup`
- `ContentBlock`
- `ContentBlockType` (value partition)

### Proposed properties

- `producedToolResult` (ToolInvocation -> ToolResult)
- `partOfInvocationGroup` (ToolInvocation -> ToolInvocationGroup)
- `groupedInTurn` (ToolInvocationGroup -> Turn)
- `hasContentBlock` (Message -> ContentBlock)
- `hasContentBlockType` (ContentBlock -> ContentBlockType)
- `blockSequenceIndex` (ContentBlock -> xsd:nonNegativeInteger)

### CQ additions (proposed)

- CQ-090: Which tool invocations were executed in parallel in a turn?
- CQ-091: What result artifact was produced by each invocation?
- CQ-092: Which message content blocks were tool-use blocks versus text blocks?

### Acceptance criteria

- Parallel tool use can be reconstructed from ontology data
- Tool results are first-class entities with provenance and status
- Mixed-content messages are representable without flattening to one string

## 4.5 P1: Memory Control Plane and Shared Memory

### Rationale

Memory tiering is solid, but implementation architecture needs memory provenance/scope/source/file-level control and shared-memory coordination semantics.

### Proposed classes

- `MemoryFile`
- `MemorySource`
- `MemoryScope`
- `SharedMemoryArtifact`
- `MemoryWriteConflict`

### Proposed properties

- `storedInFile` (MemoryItem -> MemoryFile)
- `hasMemorySource` (MemoryItem -> MemorySource)
- `hasMemoryScope` (MemoryItem -> MemoryScope)
- `sharedAcrossAgents` (SharedMemoryArtifact -> Agent)
- `writesByAgent` (MemoryWriteConflict -> Agent)
- `conflictOnArtifact` (MemoryWriteConflict -> SharedMemoryArtifact)
- `resolvedByPolicy` (MemoryWriteConflict -> PermissionPolicy or SafetyConstraint)

### CQ additions (proposed)

- CQ-093: What is the scope and source of each memory item?
- CQ-094: Which memory artifacts are shared across multiple agents?
- CQ-095: What memory write conflicts occurred and how were they resolved?

### Acceptance criteria

- Memory items can be filtered by source and scope
- Shared memory and concurrent writes are traceable
- Memory governance integrates with policy model

## 4.6 P1: Dialog Pragmatics and Grounding

### Rationale

Conversation structure exists, but pragmatic interpretation and grounding state are absent. This weakens implementation guidance for clarification, acceptance, and mutual understanding flows.

### Proposed classes

- `DialogAct`
- `CommunicativeFunction`
- `CommonGround`
- `GroundingAct`
- `ClarificationRequest`
- `AcceptanceEvidence`

### Proposed properties

- `hasDialogAct` (Turn or Message -> DialogAct)
- `hasCommunicativeFunction` (DialogAct -> CommunicativeFunction)
- `contributesToCommonGround` (GroundingAct -> CommonGround)
- `providesAcceptanceEvidence` (GroundingAct -> AcceptanceEvidence)
- `clarifiesTurn` (ClarificationRequest -> Turn)

### CQ additions (proposed)

- CQ-096: What communicative function does each turn perform?
- CQ-097: Which turns updated common ground with acceptance evidence?
- CQ-098: Which clarifications were issued before commitment was established?

### Acceptance criteria

- Dialog turns can be classified beyond raw content
- Grounded versus ungrounded commitments can be queried
- Clarification and acceptance mechanics are model-visible

## 4.7 P2: BDI Completion

### Rationale

Current BDI coverage is partial. Full design support for deliberative agents requires explicit belief/desire/justification artifacts.

### Proposed classes

- `Belief`
- `Desire`
- `Justification`
- `Deliberation`

### Proposed properties

- `heldBelief` (Agent -> Belief)
- `holdsDesire` (Agent -> Desire)
- `justifiesIntention` (Justification -> Intention)
- `producesIntention` (Deliberation -> Intention)
- `considersBelief` (Deliberation -> Belief)
- `considersDesire` (Deliberation -> Desire)

### CQ additions (proposed)

- CQ-099: Which beliefs and desires led to a specific intention?
- CQ-100: What justification evidence supports an agent intention?

### Acceptance criteria

- Intention provenance can be traced through deliberation artifacts
- Planning rationale is queryable, not implicit

## 4.8 P2: Operational Observability Metrics

### Rationale

Status checks exist, but there is no ontology surface for tracking performance and reliability trends used in production operations.

### Proposed classes

- `OperationalMetric`
- `MetricObservation`
- `ReliabilityIncident`

### Proposed properties

- `observesEntity` (MetricObservation -> Integration or Session or ToolInvocation)
- `hasMetricName` (OperationalMetric -> xsd:string)
- `hasMetricValue` (MetricObservation -> xsd:decimal)
- `hasMetricTimestamp` (MetricObservation -> xsd:dateTime)
- `incidentForEntity` (ReliabilityIncident -> Integration or ExternalService)

### CQ additions (proposed)

- CQ-101: What reliability incidents occurred per integration over time?
- CQ-102: What are latency and failure trends for a service capability?

### Acceptance criteria

- Reliability trend queries are supported by explicit metric entities
- Incident chains can be linked to recovery events

## 5. Cross-Cutting Constraints

Apply to all new modules:

- Preserve OWL 2 DL profile
- Maintain BFO and PROV alignment conventions already used
- Add SHACL node shapes for all classes with required properties
- Ensure closed vocabularies are modeled as value partitions where appropriate
- Keep CQ traceability complete: use case -> CQ -> axiom-plan -> query -> tests

## 6. Proposed Phased Delivery

## Phase A (P0)

- Service capability model
- Runtime safety control plane
- Recovery and resilience model

Exit criteria:

- New classes/properties in TBox
- Corresponding SHACL shapes
- CQ-079 through CQ-089 passing
- Updated conceptual model and property design docs

## Phase B (P1)

- Tool/message trace richness
- Memory control plane and sharing
- Dialog pragmatics and grounding

Exit criteria:

- CQ-090 through CQ-098 passing
- Reference individuals for new taxonomies
- ABox scenarios that demonstrate multi-agent shared memory and grounding

## Phase C (P2)

- BDI completion
- Observability metrics

Exit criteria:

- CQ-099 through CQ-102 passing
- Integrated scenario coverage from intention -> execution -> failure -> recovery -> metric trend

## 7. File Change Plan

Core ontology:

- `ontologies/personal_agent_ontology/personal_agent_ontology.ttl`
- `ontologies/personal_agent_ontology/pao-reference-individuals.ttl`
- `ontologies/personal_agent_ontology/pao-data.ttl`

Constraints:

- `ontologies/personal_agent_ontology/shapes/pao-shapes.ttl`

Design docs:

- `ontologies/personal_agent_ontology/docs/conceptual-model.yaml`
- `ontologies/personal_agent_ontology/docs/property-design.yaml`
- `ontologies/personal_agent_ontology/docs/axiom-plan.yaml`
- `ontologies/personal_agent_ontology/docs/use-cases.yaml`
- `ontologies/personal_agent_ontology/docs/competency-questions.yaml`

Tests:

- `ontologies/personal_agent_ontology/tests/cq-test-manifest.yaml`
- `ontologies/personal_agent_ontology/tests/cq-079.sparql` through `cq-102.sparql`
- `ontologies/personal_agent_ontology/tests/test_ontology.py`

## 8. Definition of Done for v0.6.0 Modeling

- All P0 domains complete with SHACL and CQ coverage
- No contradiction between CQ expected results, manifest metadata, and pytest classification
- Each new class has at least one ABox individual in sample data when query-driven
- All ontology tests pass
- Validation report updated with explicit v0.6.0 delta

## 9. Open Decisions Requiring Explicit Call

- Should `Integration` remain under `Agent` generally, or be constrained to software agents only?
- Should channel links be mandatory for all sessions/messages or conditionally required?
- Should dialog-act taxonomy be full DIT++/FIPA breadth or a curated core subset first?
- Should observability metrics be in core ontology or a separate extension module?

## 10. Recommended Next Action

Start Phase A with a strict vertical slice:

- Implement `ExternalService` + `ServiceCapability` + `CapabilityDiscoveryEvent`
- Add CQ-079 to CQ-082 and tests
- Add shapes and sample data
- Re-run full test suite before extending to safety/recovery slices
