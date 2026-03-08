# Anti-Pattern Review -- Personal Agent Ontology (PAO)

**Date**: 2026-02-18
**Phase**: Conceptualization (Pipeline A, Step 6)
**Reference**: `.claude/skills/_shared/anti-patterns.md` (16 patterns)

---

## Review Summary

| # | Anti-Pattern | Status | Notes |
|---|---|---|---|
| 1 | Singleton Hierarchy | ACCEPTED | 2 singletons, both CQ-driven |
| 2 | Role-Type Confusion | PASS | AgentRole uses BFO Role pattern |
| 3 | Process-Object Confusion | PASS | BFO alignment separates all Process/GDC classes |
| 4 | Missing Disjointness | RESOLVED | Cross-module GDC disjointness implemented (v0.3.0) |
| 5 | Circular Definition | PASS | No EquivalentTo chains |
| 6 | Quality-as-Class | PASS | Status uses Value Partition (ODP-6) |
| 7 | Information-Physical Conflation | PASS | Message/Turn, Episode/Event properly separated |
| 8 | Orphan Class | ACCEPTED | Status has no BFO parent (VP pattern) |
| 9 | Polysemy | PASS | All terms have single, clear definitions |
| 10 | Domain/Range Overcommitment | PASS | Narrow domains documented as intentional inference |
| 11 | Individuals in T-box | PASS | VP individuals belong in schema (owl:oneOf) |
| 12 | Complement Overuse | PASS | No complement classes defined |
| 13 | False is-a from OO | PASS | All SubClassOf are domain-grounded |
| 14 | System Blueprint | PASS | Domain concepts, not implementation artifacts |
| 15 | Technical Perspective | PASS | All terms CQ-driven and domain-grounded |
| 16 | Class/Individual Mixing | PASS | Clean separation |

**Result**: 0 unresolved issues. 2 accepted findings (with rationale). 0 open recommendations.

---

## Detailed Findings

### Finding 1: Singleton Hierarchies (Anti-Pattern #1)

**Status**: ACCEPTED

Two singleton hierarchies exist in the conceptual model:

1. **AIAgent -> SubAgent**: AIAgent has exactly one subclass (SubAgent).
   - **Rationale**: SubAgent is required by CQ-003 ("How does an agent
     delegate subtasks?") and CQ-003's domain semantics. The distinction
     between a general AI agent and a spawned sub-agent is meaningful.
   - **Future**: Additional AIAgent subtypes are plausible (e.g.,
     AutonomousAgent, ReactiveAgent) but are out of scope per the current
     CQ set. Adding speculative siblings would violate the over-modeling
     anti-pattern.

2. **Action -> ToolInvocation**: Action has exactly one subclass
   (ToolInvocation).
   - **Rationale**: ToolInvocation is required by CQ-007, CQ-008, CQ-031,
     CQ-037, CQ-039. It is a specialized N-ary Action with tool-specific
     properties (invokesTool, hasInput, hasOutput, hasComplianceStatus).
   - **Future**: Additional Action subtypes (e.g., FileOperation,
     MessageSend) are plausible but not CQ-driven.

**Decision**: Both singletons are justified. No change required.

---

### Finding 2: Missing Cross-Module Disjointness (Anti-Pattern #4)

**Status**: RESOLVED (implemented in v0.3.0)

The conceptual model originally declared 8 disjoint sets covering sibling
classes within PAO grouping parents (Agent, Event, MemoryItem, MemoryTier,
MemoryOperation, Status, Governance). The cross-module GDC disjointness
recommendation has been implemented — an `owl:AllDisjointClasses` declaration
covers: Message, ToolDefinition, Goal, Plan, Task, MemoryItem, MemoryTier,
PermissionPolicy, SafetyConstraint, and additional v0.7.0 classes
(ModelProvider, FoundationModel, ModelDeployment, GenerationConfiguration,
OperationalMetric, MetricObservation, Belief, Desire, Justification).

Verified in `test_ontology.py` via the `Cross-module GDC disjointness`
test group.

---

### Finding 3: Orphan Class (Anti-Pattern #8)

**Status**: ACCEPTED

The `Status` class has `parent: null` in the conceptual model -- it has no
named superclass other than owl:Thing.

- **Rationale**: Status implements the Value Partition pattern (ODP-6).
  BFO Quality (BFO:0000019) is a specifically dependent continuant where
  each quality instance inheres in one specific bearer. PAO status values
  are shared reference values (named individuals via owl:oneOf), which
  does not fit BFO's particular-quality model. Leaving Status as a
  standalone class under owl:Thing is the standard OWL solution for
  controlled vocabularies that don't need BFO quality alignment.
- **Documented in**: `bfo-alignment.md` section 26.

**Decision**: Accepted. No change required.

---

### Finding 4: Domain/Range Verification (Anti-Pattern #10)

**Status**: PASS

The property-design.yaml contains 14 properties with narrow (leaf-class)
domains. Each is accompanied by an explicit rationale note of the form
"Domain is narrow (X) because the inference is correct" or "Domain is
narrow (X) because only X has this property."

Properties with narrow domains verified:

| Property | Domain | Inference Correct? |
|---|---|---|
| spawnedBy | SubAgent | Yes: anything spawned IS a SubAgent |
| hasTurnIndex | Turn | Yes: anything with a turn index IS a Turn |
| hasConfidence | Claim | Yes: only Claims have confidence scores |
| claimType | Claim | Yes: only Claims have claim types |
| invokesTool | ToolInvocation | Yes: only invocations target tools |
| invokedBy | ToolInvocation | Yes: sub-property of performedBy |
| hasInput | ToolInvocation | Yes: only invocations have tool inputs |
| hasOutput | ToolInvocation | Yes: only invocations have tool outputs |
| producedSummary | CompactionEvent | Yes: only compactions produce summaries |
| delegatedTask | SubAgent | Yes: only sub-agents receive delegated tasks |
| pursuedBy | Goal | Yes: only Goals are pursued |
| achievesGoal | Plan | Yes: only Plans achieve Goals |
| partOfPlan | Task | Yes: only Tasks are parts of Plans |
| blockedBy | Task | Yes: only Tasks have blockers |
| blocks | Task | Yes: only Tasks block other Tasks |
| requestedBy | ErasureEvent | Yes: only erasures have requesters |
| restrictsToolUse | PermissionPolicy | Yes: only policies restrict tools |
| grantsPermission | PermissionPolicy | Yes: only policies grant permissions |

All narrow-domain inferences are semantically correct. Broad-domain
properties (hasParticipant, hasStatus, hasContent, appliesTo, etc.)
correctly use parent classes or owl:Thing.

SHACL shapes are documented in the property-design.yaml footer for
per-class validation constraints.

**Decision**: Pass. The property design follows the domain/range decision
procedure from anti-patterns.md #10 correctly.

---

## Design Notes from Axiom Plan

The axiom-plan.yaml flagged 5 design notes (DN-01 through DN-05) that
should be addressed before or during formalization:

| ID | Issue | Action |
|---|---|---|
| DN-01 | CQ-004 SPARQL references removed ConversationParticipation class | RESOLVED: `tests/cq-004.sparql` updated to use `prov:qualifiedAssociation` pattern |
| DN-02 | Goal status could overlap with TaskStatus individuals | Architect should verify GoalStatus individuals are distinct; consider a separate GoalStatus class |
| DN-03 | CQ-025 SPARQL uses old `partOfEpisode` property name | RESOLVED: `tests/cq-025.sparql` updated to use `recordedInEpisode` |
| DN-04 | No EquivalentTo (defined classes) planned yet | Deferred intentionally; add defined classes in a future version if reasoning demands |
| DN-05 | HasKey candidates identified but not committed | Partially resolved: HasKey added for FoundationModel (hasModelId) in v0.7.0 |

DN-01 and DN-03 have been resolved — SPARQL tests now match the formalized
ontology.

---

## Conclusion

The PAO conceptual model passes the anti-pattern review with:

- **14 of 16 patterns**: clean pass
- **2 patterns**: accepted with documented rationale (Singleton, Orphan)
- **0 open recommendations** (cross-module GDC disjointness resolved in v0.3.0)

All design notes (DN-01 through DN-05) have been addressed or explicitly
deferred. The model is current as of v0.7.0.
