# PAO v0.3.0 Design Backlog

Identified in v0.2.0 code review (2026-02-19). These are modeling gaps
that require new CQs, properties, and potentially new classes.

---

## 1. UC-006: Compaction preservation/loss trace model

**Priority**: high

UC-006 asks "what was preserved" during context compaction, but only
`producedSummary` exists. Need a preserved/dropped trace model (e.g.,
`preservedItem`, `droppedItem` properties on CompactionEvent, or a
CompactionTrace class).

**Affected files**:
- `docs/use-cases.yaml:97`
- `docs/competency-questions.yaml:333`
- `tests/cq-010.sparql`
- `personal_agent_ontology.ttl:376`

---

## 2. UC-011: Eviction eligibility and last-access semantics

**Priority**: medium

UC-011 asks for tier + last access + eviction eligibility. Current CQ
coverage only captures tier and operation history, not eviction semantics.
Need `hasLastAccessTime` data property and eviction eligibility modeling.

**Affected files**:
- `docs/use-cases.yaml:177`
- `docs/competency-questions.yaml:573`
- `docs/competency-questions.yaml:599`

---

## 3. UC-016: Cross-session resume linkage

**Priority**: medium

UC-016 "resume multi-session work" is only partially testable. CQ gives
task status in a plan, but no explicit cross-session resume linkage for
pending goals. Need a `resumedIn` or `continuedFrom` property linking
sessions.

**Affected files**:
- `docs/use-cases.yaml:250`
- `docs/competency-questions.yaml:909`

---

## 4. HasKey/identity contracts (DN-05)

**Priority**: medium

Identity-key strategy (agent/session/conversation IDs) is explicitly
deferred as DN-05. Implementation teams must invent identity contracts
without ontology guidance. Need `owl:HasKey` axioms for key entities.

**Affected files**:
- `docs/axiom-plan.yaml:1202`
- `docs/axiom-plan.yaml:1250`

---

## 5. Lifecycle transition semantics

**Priority**: medium

Model has current status values but no transition/history pattern. Need
previous status, transition event, timestamped lifecycle chain. Consider
State Transition ODP.

**Affected files**:
- `personal_agent_ontology.ttl:750`
- `personal_agent_ontology.ttl:815`
- `docs/conceptual-model.yaml:477`
