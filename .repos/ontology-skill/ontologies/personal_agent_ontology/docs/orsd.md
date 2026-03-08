# Ontology Requirements Specification Document (ORSD)

## Personal Agent Ontology (PAO)

**Version**: 0.3.0
**Date**: 2026-02-19
**Status**: Draft (Specification Phase)
**Authors**: Ontology Engineering Workspace

---

## 1. Purpose

The Personal Agent Ontology (PAO) provides a formal, machine-readable
vocabulary for describing the architecture and behavior of personal AI
agents. It defines the entities, relationships, and constraints that govern:

- Agent identity, capabilities, and roles
- Conversational interaction structure
- Multi-tier persistent memory
- Actions, events, and temporal ordering
- Goal-directed planning and task execution
- Governance, safety, and privacy compliance

PAO is designed as an **architectural guide** that drives agent system
design by making implicit architectural assumptions explicit and queryable.

---

## 2. Scope

### 2.1 In Scope

See `scope.md` Section 3 for the full list of in-scope concepts across
6 modules:

1. **Identity & Actors**: Agent types, roles, capabilities
2. **Conversation & Interaction**: Sessions, turns, tool invocations
3. **Memory**: Tiers, items, claims, operations, provenance
4. **Actions, Events, Time**: Temporal ordering, episodes
5. **Goals, Plans, Tasks**: Goal decomposition, status tracking
6. **Governance & Safety**: Permissions, policies, privacy, erasure

### 2.2 Out of Scope

See `scope.md` Section 4. Key exclusions: domain-specific knowledge,
LLM internals, vector embeddings as data, multi-agent orchestration
protocols, probabilistic reasoning.

---

## 3. Stakeholders

| ID | Stakeholder | Role | Key Needs |
|----|------------|------|-----------|
| SH-01 | Agent Developer | Builds agents | Class hierarchy, SHACL shapes |
| SH-02 | System Architect | Designs infrastructure | Module boundaries, memory tiers |
| SH-03 | Ontology Engineer | Extends/maps ontology | BFO alignment, extension points |
| SH-04 | End User | Interacts with agent | (Implicit) conversation continuity, preference recall |
| SH-05 | Compliance/Governance | Audits behavior | Provenance chains, policy enforcement |

---

## 4. Use Cases

30 use cases are defined in `use-cases.yaml`, covering all 6 modules
and 7 motivating scenarios (S1-S7 from scope.md).

### Summary by Module

| Module | Use Cases | Must-Have |
|--------|-----------|-----------|
| Identity & Actors | UC-001, UC-002, UC-020, UC-021 | UC-001 |
| Conversation & Interaction | UC-003 to UC-006, UC-022, UC-027, UC-030 | UC-003, UC-004, UC-005 |
| Memory | UC-007 to UC-012, UC-023, UC-024 | UC-007, UC-008, UC-009, UC-010 |
| Actions, Events, Time | UC-013, UC-014, UC-028 | UC-013 |
| Goals, Plans, Tasks | UC-015, UC-016, UC-025 | UC-015 |
| Governance & Safety | UC-017 to UC-019, UC-026, UC-029 | UC-017, UC-018 |

---

## 5. Competency Questions

65 competency questions are defined in `competency-questions.yaml`.

### Priority Distribution (MoSCoW)

| Priority | Count | CQ IDs |
|----------|-------|--------|
| Must Have | 30 | CQ-001 to CQ-009, CQ-011 to CQ-016, CQ-018, CQ-020, CQ-023 to CQ-028, CQ-030 to CQ-032, CQ-034, CQ-036, CQ-038 to CQ-040, CQ-048 |
| Should Have | 31 | CQ-003, CQ-004, CQ-010, CQ-017, CQ-019, CQ-021, CQ-029, CQ-033, CQ-035, CQ-037, CQ-041 to CQ-043, CQ-045 to CQ-047, CQ-049 to CQ-059, CQ-061 to CQ-064 |
| Could Have | 4 | CQ-022, CQ-044, CQ-060, CQ-065 |
| Won't Have | 0 | (none) |

### CQ Type Distribution

| Type | Count | CQ IDs |
|------|-------|--------|
| Enumerative | 23 | CQ-001, CQ-005 to CQ-007, CQ-011 to CQ-013, CQ-015, CQ-019, CQ-020, CQ-023, CQ-024, CQ-026, CQ-029, CQ-034, CQ-035, CQ-037, CQ-043, CQ-045, CQ-046, CQ-052, CQ-055, CQ-058 |
| Relational | 25 | CQ-002 to CQ-004, CQ-008 to CQ-010, CQ-014, CQ-016 to CQ-018, CQ-022, CQ-025, CQ-028, CQ-032, CQ-033, CQ-036, CQ-041, CQ-042, CQ-047, CQ-048, CQ-050, CQ-054, CQ-056, CQ-057, CQ-059, CQ-060 |
| Boolean | 4 | CQ-021, CQ-031, CQ-038, CQ-049 |
| Quantitative | 3 | CQ-037, CQ-044, CQ-053 |
| Constraint | 3 | CQ-039, CQ-040, CQ-051 |

### Derivation Method Distribution

| Method | Count |
|--------|-------|
| direct_lookup | 40 |
| inference | 12 |
| aggregation | 8 |

---

## 6. Pre-Glossary Summary

The pre-glossary (`pre-glossary.csv`) contains:

| Category | Count | Examples |
|----------|-------|---------|
| Classes | 33 | Agent, AIAgent, Session, Turn, MemoryItem, Claim, Goal, Plan, Task, PermissionPolicy |
| Properties | 35 | hasAvailableTool, storedIn, hasConfidence, partOfPlan, hasComplianceStatus |
| Individuals | 8 | Active, Completed, Pending, Compliant, NonCompliant, UserPreference |

### Key Class Candidates by Module

**Module 1 (Identity)**: Agent, AIAgent, HumanUser, SubAgent, AgentRole,
ToolDefinition, ConversationParticipation

**Module 2 (Conversation)**: Conversation, Session, Turn, Message,
ToolInvocation, CompactionEvent

**Module 3 (Memory)**: MemoryItem, MemoryTier, WorkingMemory,
EpisodicMemory, SemanticMemory, ProceduralMemory, Episode, Claim,
MemoryOperation, Encoding, Retrieval, Consolidation, Forgetting

**Module 4 (Events/Time)**: Event, Action, Episode

**Module 5 (Goals)**: Goal, Plan, Task

**Module 6 (Governance)**: PermissionPolicy, SafetyConstraint, ErasureEvent

---

## 7. Reuse Strategy

### Direct Imports

| Ontology | Prefix | Classes/Properties Used |
|----------|--------|------------------------|
| PROV-O | `prov:` | Entity, Activity, Agent, SoftwareAgent, Person, Plan, Role; wasGeneratedBy, wasDerivedFrom, wasAttributedTo, wasAssociatedWith, used, wasRevisionOf |
| OWL-Time | `time:` | Instant, Interval, Duration; hasBeginning, hasEnd, inXSDDateTimeStamp, before, after |
| FOAF | `foaf:` | Person, Agent (core subset only) |
| ODRL 2.2 | `odrl:` | Policy, Permission, Prohibition, Obligation (for governance module) |

### Alignment Targets

| Ontology | Prefix | Alignment Strategy |
|----------|--------|-------------------|
| BFO 2020 | `BFO:` | rdfs:subClassOf for top-level classes |
| schema.org | `schema:` | SSSOM mappings for Action hierarchy |
| ActivityStreams 2.0 | `as:` | SSSOM mappings for Activity/Actor |
| SEM | `sem:` | SSSOM mappings for Event |
| SIOC | `sioc:` | SSSOM mappings for Forum/Post |

### Vocabulary Encoding

| Source | What We Encode |
|--------|---------------|
| DIT++ (ISO 24617-2) | Dialog act taxonomy as PAO individuals |
| CoALA memory types | Memory tier vocabulary |
| Letta memory tiers | Core/Recall/Archival tier vocabulary |

---

## 8. Constraints and Design Decisions

### OWL Profile
- OWL 2 DL for decidable reasoning
- Avoid nominals in class expressions where possible
- Use n-ary relation pattern for Claims (not RDF reification)

### Upper Ontology Alignment
- BFO 2020 as the structural backbone
- Key alignments:
  - Agent -> BFO:0000040 (material entity) [or independent continuant]
  - Event/Action -> BFO:0000015 (process)
  - MemoryItem -> BFO:0000031 (generically dependent continuant)
  - Plan/Goal -> BFO:0000017 (realizable entity)

### Naming Conventions
- Classes: CamelCase (`MemoryItem`, `ToolInvocation`)
- Properties: camelCase (`hasConfidence`, `storedIn`)
- Individuals: CamelCase (`Active`, `Completed`)
- See `_shared/naming-conventions.md` for full standard

### Serialization
- Primary: Turtle (.ttl)
- Secondary: JSON-LD for API use

---

## 9. Test Suite

59 SPARQL test queries are generated in `tests/cq-*.sparql` (CQ-022 skipped
as could-have priority). The test manifest is at `tests/cq-test-manifest.yaml`.

### Test Categories

| Category | Count | Expectations |
|----------|-------|-------------|
| SELECT (non-empty) | 53 | Result set must have >= 1 row |
| ASK (boolean) | 4 | Must return true |
| SELECT (zero rows) | 2 | Result set must be empty (constraint tests) |

---

## 10. Traceability

Full traceability from stakeholder needs through use cases to CQs to
ontology terms to SPARQL tests is maintained in `traceability-matrix.csv`.

---

## 11. Next Steps

1. **Ontology Scout** (`/ontology-scout`): Use pre-glossary and scope to
   search for reusable ontology modules, validate reuse strategy
2. **Ontology Conceptualizer** (`/ontology-conceptualizer`): Build glossary,
   design taxonomy, create BFO alignment, produce conceptual model
3. **Ontology Architect** (`/ontology-architect`): Formalize as OWL 2 axioms
   using ROBOT templates and KGCL
4. **Ontology Validator** (`/ontology-validator`): Run CQ test suite,
   reasoner, SHACL validation, quality report

---

## 12. Approval

- [ ] Scope document reviewed and approved
- [ ] Use case catalog covers all stakeholder needs
- [ ] Competency questions are complete and correctly prioritized
- [ ] Pre-glossary is comprehensive
- [ ] Test suite is generated and SPARQL syntax validated
- [ ] Traceability matrix links all artifacts
