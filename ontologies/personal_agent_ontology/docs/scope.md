# Personal Agent Ontology (PAO) -- Scope Document

**Ontology Name**: Personal Agent Ontology
**Prefix**: `pao:`
**Namespace**: `https://purl.org/pao/`
**Version**: 0.8.0
**Date**: 2026-02-21
**Upper Ontology**: BFO 2020 (ISO 21838-2)

---

## 1. Domain Description

The Personal Agent Ontology (PAO) provides a formal vocabulary for describing
the structure and behavior of personal AI agents -- software systems that
conduct multi-turn conversations with human users, use tools to take actions,
maintain persistent memory across sessions, pursue goals and plans, and operate
under governance constraints (permissions, privacy, safety).

The ontology is intended to serve as an **architectural guide**: a shared
conceptual model that drives the design of agent systems by making explicit
the entities, relationships, and constraints that govern agent behavior.

### Domain Boundaries

The domain covers the **control architecture** of a personal AI agent:

- **Who** participates (agents, users, organizations)
- **What** happens (conversations, turns, tool invocations, actions)
- **When** things occur (temporal ordering, durations, intervals)
- **What is remembered** (memory items, beliefs, claims, episodes)
- **How memory works** (memory tiers, encoding, retrieval, consolidation, forgetting)
- **Why** actions are taken (goals, plans, intentions)
- **Under what constraints** (permissions, policies, safety rules, privacy)

---

## 2. Stakeholders and Information Needs

| Stakeholder | Role | Information Needs |
|-------------|------|-------------------|
| Agent Developer | Builds and configures agents | Class hierarchy for structuring agent state; property vocabulary for wiring components; SHACL shapes for validating agent configurations |
| System Architect | Designs agent infrastructure | Module boundaries; memory tier specifications; integration points with external systems (vector DBs, KGs, APIs) |
| Ontology Engineer | Extends or maps the ontology | BFO alignment; reuse patterns for PROV-O, OWL-Time; extension points for domain-specific knowledge |
| End User (implicit) | Interacts with the agent | Not a direct consumer, but their interactions generate the data the ontology describes |
| Compliance/Governance | Audits agent behavior | Provenance chains; consent tracking; data retention/deletion policies; safety constraint violations |

---

## 3. In-Scope Concepts

### Module 1: Identity and Actors
- Agent types: AI agent, human user, organization, sub-agent
- Agent roles (conversational roles, functional roles)
- Agent capabilities and tool access
- Agent identity and configuration (persona, system prompt)
- Model identity: provider, foundation model name/version, deployment endpoint, generation parameters (temperature, top-p, max tokens)

### Module 2: Conversation and Interaction
- Session: a bounded period of agent-user interaction
- Conversation: a coherent thread of dialogue (may span sessions)
- Turn: a single contribution by one participant
- Message: the content of a turn (text, structured data)
- Tool invocation: request, execution, and result of a tool use
- Observation: environmental feedback received by the agent

### Module 3: Memory
- Memory system: the agent's overall memory architecture
- Memory tiers: working memory, episodic memory, semantic memory, procedural memory
- Memory items: individual stored artifacts (facts, episodes, summaries, embeddings)
- Memory operations: encoding, retrieval, consolidation, forgetting, rehearsal
- Memory blocks: structured key-value stores (Letta-style core memory)
- Claims and beliefs: agent-held propositions with confidence and evidence
- Provenance: attribution, derivation, and revision chains for memory items

### Module 4: Actions, Events, and Time
- Actions: intentional agent-caused events (internal and external)
- Events: occurrences situated in time
- Episodes: temporally bounded clusters of related events
- Temporal entities: instants, intervals, durations
- Temporal relations: before, after, during, overlaps (Allen's interval algebra)

### Module 5: Goals, Plans, and Tasks
- Goals: desired states the agent works toward
- Plans: sequences of intended actions to achieve goals
- Tasks: concrete work items with status and dependencies
- Intentions: committed-to plans (BDI model)

### Module 6: Governance and Safety
- Permissions: what an agent is allowed to do
- Policies: rules governing agent behavior (ODRL-aligned)
- Safety constraints: non-negotiable behavioral limits
- Privacy metadata: sensitivity levels, consent, retention periods
- Audit trails: provenance-backed records of agent actions

### Module 7: Error Recovery and Failure Classification
- Error recovery events: tracking failures and recovery strategies
- Failure types: controlled vocabulary classifying error categories (timeout, authentication, rate limiting, dependency, configuration, network)
- Recovery trajectories: retry, replan, rollback pathways

### Module 8: Observability
- Operational metrics: named metric types with measurement recording
- Metric observations: timestamped measurement data points for system components
- Reliability incidents: failure or degradation events linked to recovery workflows

### Module 9: Scheduling & Automation
- Schedules: named schedule definitions that bind a recurrence pattern to an action specification
- Recurrence patterns: temporal recurrence rules (cron expressions, interval-based, calendar-based) specifying when scheduled actions fire
- Triggers: event-driven or time-driven activation conditions (cron trigger, interval trigger, event trigger, webhook trigger)
- Scheduled executions: individual execution instances of a schedule, tracking start/end time, outcome, and provenance
- Concurrency policies: rules governing what happens when a new execution is due while a prior one is still running (allow, forbid, replace)
- Catch-up / backfill: policies for handling missed executions after agent downtime
- Schedule lifecycle: active, paused, expired, disabled states

---

## 4. Out of Scope

The following are explicitly **not** modeled in PAO v1:

| Excluded Concept | Rationale |
|-----------------|-----------|
| Domain-specific knowledge (e.g., finance, health, travel) | PAO is domain-neutral infrastructure; domain ontologies import PAO and extend it |
| LLM internals (weights, layers, attention heads, training data, embedding vectors) | PAO models the agent at the control/architecture level, not the model level. Model identity (name, version, provider, deployment endpoint, generation configuration) IS in scope as operational metadata. |
| Vector embeddings as first-class data | PAO references embedding stores via identifiers; actual vectors live in vector DBs |
| Multi-agent orchestration protocols | PAO models individual agents and their immediate collaborators; orchestration frameworks (e.g., swarm coordination) are future work |
| Natural language understanding/generation | PAO models messages as information artifacts, not linguistic structures |
| User interface design | PAO describes the semantic structure of interaction, not its presentation |
| Hardware/deployment infrastructure | Servers, GPUs, containers are out of scope |
| Probabilistic reasoning | OWL cannot natively represent probabilities; confidence is modeled as metadata on claims |
| Real-time streaming semantics | PAO models discrete turns and events, not continuous streams |

---

## 5. Constraints

### OWL Profile
- **Target**: OWL 2 DL (ensuring decidable reasoning)
- **Fallback**: OWL 2 RL for production rule-based scenarios
- Avoid OWL Full constructs that break decidability

### Upper Ontology
- **BFO 2020** (ISO 21838-2) as the foundational upper ontology
- Alignment to BFO categories is required for all top-level classes
- PROV-O classes used as-is where they provide adequate coverage

### Reuse Strategy (from research-existing-ontologies.md)

| Strategy | Ontologies | How |
|----------|-----------|-----|
| **Import directly** | PROV-O, OWL-Time, FOAF (core), ODRL 2.2 | `owl:imports`; use their classes/properties directly |
| **Align to** | BFO 2020, schema.org Action, ActivityStreams 2.0, SEM, SIOC | `rdfs:subClassOf` or SSSOM mappings; do not import wholesale |
| **Encode as vocabulary** | DIT++ dialog acts, CoALA memory types, Letta memory tiers | Mint PAO individuals/classes that reference source definitions |
| **Reference only** | BDI Ontology, OASIS v2, Mem'Onto, cognitive architectures | Inform design decisions; cite in documentation; no formal import |

### Size and Complexity
- Target: 100-200 classes, 80-120 properties in core modules
- Modular design: each module is independently importable
- All classes require: `rdfs:label`, `skos:definition`, `rdfs:subClassOf`

### Serialization
- Primary: Turtle (.ttl)
- Secondary: JSON-LD (for API integration), Manchester Syntax (for review)

---

## 6. Motivating Scenarios

These scenarios ground the ontology in concrete agent system needs:

**S1 -- Conversation Continuity**: An agent resumes a conversation after
session interruption. The ontology must represent which session the user was
in, what turns occurred, what context was active, and how to restore working
memory from persisted state.

**S2 -- Memory Consolidation**: After a long conversation, the agent
extracts key facts and stores them as semantic memory. The ontology must
track the provenance chain from raw turns through summarization to stored
claims, including confidence and source attribution.

**S3 -- Tool Use Audit**: A compliance reviewer examines what tools an agent
invoked, what inputs it provided, what outputs it received, and whether the
invocations complied with permission policies.

**S4 -- Cross-Session Knowledge**: A user mentions a preference in one
session. Weeks later, the agent retrieves and applies that preference. The
ontology must model the original statement, its extraction as a belief, its
storage in semantic memory, and its retrieval in a new context.

**S5 -- Privacy-Aware Forgetting**: A user requests deletion of personal
information. The ontology must identify all memory items derived from the
target data (via provenance chains), mark them for deletion, and record the
erasure event for audit compliance.

**S6 -- Goal-Directed Planning**: An agent breaks a complex user request
into sub-tasks, executes them with tools, and reports results. The ontology
must represent the goal hierarchy, plan structure, task dependencies, and
execution outcomes.

**S7 -- Sub-Agent Delegation**: An agent spawns a sub-agent to handle a
specialized task. The ontology must model the parent-child relationship,
the delegated task, the sub-agent's session, and the results passed back.

**S8 -- Scheduled Task Execution**: An agent is configured to run a daily
summary of unread messages at 08:00, a weekly report every Monday at 09:00,
and a one-time reminder 30 minutes after a user request. The ontology must
represent the schedule definitions (cron expression, interval, one-shot),
their trigger conditions, the individual execution instances with outcomes,
and the concurrency policy when a scheduled execution overlaps with an
ongoing conversation.

---

## 7. Related Research

This scope document is informed by 6 research documents:

| Document | Key Contributions |
|----------|-------------------|
| `research-memory-architectures.md` | Memory taxonomy (working/episodic/semantic/procedural); architectural patterns (in-context, RAG, KG, hybrid); memory governance |
| `research-ontology-design.md` | Modular ontology design; 5-module structure; Claim/Evidence n-ary pattern; PROV-O/OWL-Time integration; SHACL validation |
| `research-letta-memory.md` | Letta/MemGPT tiered memory (core/recall/archival); memory blocks; self-directed memory management; multi-agent shared memory |
| `research-agent-patterns.md` | Claude Code architecture; agent loop; tool use lifecycle; session management; context compaction; memory hierarchy; permissions |
| `research-academic-foundations.md` | CoALA framework; BDI models; dialog act taxonomies (DIT++); Allen's interval algebra; Event Calculus; cognitive architectures |
| `research-existing-ontologies.md` | 30+ ontology survey; reuse strategy (import/align/encode/reference); namespace recommendations |

---

## 8. Success Criteria

The ontology specification phase is complete when:

1. All motivating scenarios (S1-S8) are covered by competency questions
2. Every Must-Have CQ has a formalized SPARQL query
3. The pre-glossary covers all terms mentioned in CQs
4. The traceability matrix links stakeholder needs to use cases to CQs to tests
5. The scope document is approved by the stakeholder (user)
