# ODP Recommendations -- Personal Agent Ontology (PAO)

**Date**: 2026-02-18
**Phase**: Knowledge Acquisition (Pipeline A, Step 2)
**Source**: [ODP Catalog](http://ontologydesignpatterns.org/), [W3C N-ary Relations](https://www.w3.org/TR/swbp-n-aryRelations/)

---

## Overview

Six Ontology Design Patterns are recommended for the Personal Agent Ontology.
Each addresses a specific modeling challenge identified during requirements
specification.

---

## ODP-1: N-ary Relation Pattern

**Source**: [W3C SWBP Note: Defining N-ary Relations on the Semantic Web](https://www.w3.org/TR/swbp-n-aryRelations/)

**Problem**: PAO needs to attach metadata (confidence, evidence, provenance,
validity interval) to claims and beliefs. Binary RDF triples cannot express
"this claim has confidence 0.85 and was derived from Episode_003."

**Applies to**: `Claim`, `ToolInvocation`

**Pattern**: Create a reified class representing the relation, with properties
linking to each participant and to metadata.

**Instantiation for Claim**:

```turtle
pao:Claim a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    skos:definition "An agent-held proposition with associated confidence, "
        "evidence, and provenance metadata."@en .

# The claim links to its content, confidence, and sources
pao:hasContent a owl:DatatypeProperty ;
    rdfs:domain pao:Claim ;
    rdfs:range xsd:string .

pao:hasConfidence a owl:DatatypeProperty ;
    rdfs:domain pao:Claim ;
    rdfs:range xsd:decimal .

pao:aboutAgent a owl:ObjectProperty ;
    rdfs:domain pao:Claim ;
    rdfs:range pao:Agent .

pao:hasEvidence a owl:ObjectProperty ;
    rdfs:domain pao:Claim ;
    rdfs:range prov:Entity .
```

**Note on ConversationParticipation**: Originally planned as an N-ary
relation class, this was replaced during formalization by PROV-O's
`prov:qualifiedAssociation` pattern, which provides the same agent-role-
conversation linkage using a W3C standard vocabulary. See ODP-2 below.

**CQs served**: CQ-004, CQ-013, CQ-015, CQ-017

---

## ODP-2: Participation Pattern

**Source**: [ODP: N-ary Participation](http://ontologydesignpatterns.org/wiki/Submissions:Nary_Participation),
PROV-O qualified associations

**Problem**: Agents participate in events (conversations, sessions, actions)
with different roles. Simple binary `hasParticipant` loses role information.

**Applies to**: Agent participation in Conversations, Sessions, Actions

**Pattern**: Use PROV-O's qualified association mechanism. When an agent is
associated with an activity, create a `prov:Association` node that carries
the role and plan.

**Instantiation**:

```turtle
# Using PROV-O qualified association for activity participation
pao:Session_001 a pao:Session ;
    prov:qualifiedAssociation [
        a prov:Association ;
        prov:agent pao:ClaudeCodeAgent_01 ;
        prov:hadRole pao:AssistantRole ;
        prov:hadPlan pao:Plan_001
    ] ;
    prov:qualifiedAssociation [
        a prov:Association ;
        prov:agent pao:User_Alice ;
        prov:hadRole pao:UserRole
    ] .
```

**Advantage**: Leverages existing PROV-O infrastructure rather than inventing
new reification classes. Every participation has provenance for free.

**CQs served**: CQ-004, CQ-023, CQ-036

---

## ODP-3: Part-Whole (Compositional) Pattern

**Source**: BFO part-of relations, [ODP: Part-Whole](http://ontologydesignpatterns.org/wiki/Submissions:PartOf)

**Problem**: PAO has several part-whole relationships:
- Episodes contain Events
- Plans contain Tasks
- Conversations contain Sessions
- Sessions contain Turns

**Pattern**: Use a consistent `partOf` / `hasPart` property pair with
domain/range restrictions. For transitive part-of, declare transitivity.

**Instantiation**:

```turtle
# Episode-Event composition
pao:partOfEpisode a owl:ObjectProperty ;
    rdfs:domain pao:Event ;
    rdfs:range pao:Episode ;
    rdfs:subPropertyOf pao:partOf .

# Plan-Task composition
pao:partOfPlan a owl:ObjectProperty ;
    rdfs:domain pao:Task ;
    rdfs:range pao:Plan ;
    rdfs:subPropertyOf pao:partOf .

# Conversation-Session composition
pao:partOfConversation a owl:ObjectProperty ;
    rdfs:domain pao:Session ;
    rdfs:range pao:Conversation ;
    rdfs:subPropertyOf pao:partOf .

# Generic partOf (transitive)
pao:partOf a owl:ObjectProperty, owl:TransitiveProperty ;
    rdfs:label "part of"@en .

pao:hasPart a owl:ObjectProperty ;
    owl:inverseOf pao:partOf ;
    rdfs:label "has part"@en .
```

**CQs served**: CQ-005, CQ-006, CQ-025, CQ-027

---

## ODP-4: Information Realization Pattern (GDC/ICE)

**Source**: BFO Information Artifact Ontology (IAO), [ODP: Information Realization](http://ontologydesignpatterns.org/wiki/Submissions:Information_realization)

**Problem**: Memory items are information artifacts -- they carry content that
can be stored, copied, transmitted, and deleted. PAO needs to distinguish
between the information content (what is remembered) and its realization
(where/how it is stored).

**Applies to**: `MemoryItem`, `Claim`, `Episode`, `Message`

**Pattern**: Model information entities as BFO Generically Dependent
Continuants (GDC) that inhere in their bearers (storage tiers). The content
is the GDC; the storage location is the bearer.

**Instantiation**:

```turtle
pao:MemoryItem a owl:Class ;
    rdfs:subClassOf prov:Entity ;
    # Aligns with BFO:0000031 (generically dependent continuant)
    skos:definition "An information artifact persisted in agent memory."@en .

pao:storedIn a owl:ObjectProperty ;
    rdfs:domain pao:MemoryItem ;
    rdfs:range pao:MemoryTier ;
    skos:definition "Links a memory item to the memory tier where "
        "it is currently stored."@en .
```

**Design note**: We do not require full IAO import (it's a large ontology).
Instead, we adopt the *pattern* of treating memory items as information
artifacts with `storedIn` as a realization-like property.

**CQs served**: CQ-011, CQ-018, CQ-032, CQ-040

---

## ODP-5: Temporal Extent Pattern

**Source**: OWL-Time, [Event-Model-F](http://ontologydesignpatterns.org/wiki/Submissions:EventModel)

**Problem**: Every event, session, episode, and turn in PAO has temporal
extent. Some are instants (timestamps), others are intervals (durations).
The pattern must be consistent across all event types.

**Pattern**: Every event-like entity has a `hasTemporalExtent` property
pointing to a `time:TemporalEntity` (either `time:Instant` or
`time:Interval`). Intervals have `time:hasBeginning` and `time:hasEnd`
pointing to instants.

**Instantiation**:

```turtle
pao:hasTemporalExtent a owl:ObjectProperty ;
    rdfs:domain pao:Event ;
    rdfs:range time:TemporalEntity ;
    skos:definition "Links an event to its temporal extent."@en .

# For convenience, a direct timestamp for simple point-in-time events
pao:hasTimestamp a owl:DatatypeProperty ;
    rdfs:domain pao:Event ;
    rdfs:range xsd:dateTime ;
    skos:definition "Shorthand timestamp for point-in-time events."@en .
```

**Design note**: `hasTimestamp` is a convenience property for simple events
(turns, tool invocations) where a full Instant/Interval model is overkill.
For events with duration (sessions, episodes), use `hasTemporalExtent` with
`time:Interval`.

**CQs served**: CQ-005, CQ-006, CQ-007, CQ-012, CQ-020, CQ-021, CQ-022, CQ-023

---

## ODP-6: Status / State Pattern (Value Partition)

**Source**: [ODP: Value Partition](http://ontologydesignpatterns.org/wiki/Submissions:Value_Partition_Pattern)

**Problem**: Several PAO entities have status values: Sessions (Active,
Completed), Tasks (Pending, InProgress, Completed), Tool Invocations
(Running, Completed, Failed), Compliance (Compliant, NonCompliant).

**Pattern**: Define status as a class with named individuals. Use
`owl:oneOf` to close the value space where appropriate.

**Instantiation**:

```turtle
pao:Status a owl:Class ;
    skos:definition "A value indicating the current state of an entity."@en .

pao:SessionStatus a owl:Class ;
    rdfs:subClassOf pao:Status ;
    owl:equivalentClass [
        a owl:Class ;
        owl:oneOf (pao:Active pao:Ended pao:Interrupted)
    ] .

pao:TaskStatus a owl:Class ;
    rdfs:subClassOf pao:Status ;
    owl:equivalentClass [
        a owl:Class ;
        owl:oneOf (pao:Pending pao:InProgress pao:Completed pao:Blocked)
    ] .

pao:ComplianceStatus a owl:Class ;
    rdfs:subClassOf pao:Status ;
    owl:equivalentClass [
        a owl:Class ;
        owl:oneOf (pao:Compliant pao:NonCompliant)
    ] .

pao:hasStatus a owl:ObjectProperty ;
    rdfs:range pao:Status .
```

**CQs served**: CQ-007, CQ-026, CQ-027, CQ-029, CQ-031, CQ-038, CQ-039

---

## Summary Table

| ODP | Pattern | PAO Classes | CQs Served |
|-----|---------|------------|------------|
| ODP-1 | N-ary Relation | Claim, ToolInvocation (ConversationParticipation replaced by PROV-O pattern) | CQ-004, CQ-013, CQ-015, CQ-017 |
| ODP-2 | Participation (PROV-O qualified) | Agent participation in activities | CQ-004, CQ-023, CQ-036 |
| ODP-3 | Part-Whole | Episode/Event, Plan/Task, Conversation/Session | CQ-005, CQ-006, CQ-025, CQ-027 |
| ODP-4 | Information Realization | MemoryItem, Claim, Episode, Message | CQ-011, CQ-018, CQ-032, CQ-040 |
| ODP-5 | Temporal Extent | All Event subclasses | CQ-005, CQ-006, CQ-012, CQ-020, CQ-021 |
| ODP-6 | Value Partition (Status) | Status hierarchies for Session, Task, Compliance | CQ-007, CQ-026, CQ-029, CQ-038 |

---

## Handoff

The conceptualizer should:
1. Apply ODP-1 when designing the Claim class (ConversationParticipation was replaced by PROV-O qualified associations -- see ODP-2)
2. Apply ODP-2 using PROV-O qualified associations for agent-activity links (including conversation roles)
3. Apply ODP-3 for all compositional relationships
4. Apply ODP-4 when placing MemoryItem in the BFO hierarchy
5. Apply ODP-5 consistently across all event-like classes
6. Apply ODP-6 for all status-bearing entities
