# Existing Ontologies for AI Agents, Conversations, Memory, and Related Domains

## Research Survey for the Personal Agent Ontology

**Date:** 2026-02-18
**Purpose:** Comprehensive survey of existing OWL/RDF ontologies relevant to modeling AI agents,
conversations, sessions, memory, actions, events, beliefs, goals, and intentions. This document
informs reuse decisions for the personal agent ontology.

---

## Table of Contents

1. [W3C Standards and Recommendations](#1-w3c-standards-and-recommendations)
2. [Foundational and Upper Ontologies](#2-foundational-and-upper-ontologies)
3. [Agent and Multi-Agent Ontologies](#3-agent-and-multi-agent-ontologies)
4. [Dialog, Conversation, and Speech Act Models](#4-dialog-conversation-and-speech-act-models)
5. [BDI and Mental State Ontologies](#5-bdi-and-mental-state-ontologies)
6. [Event Ontologies](#6-event-ontologies)
7. [Memory Ontologies and Agent Memory Architectures](#7-memory-ontologies-and-agent-memory-architectures)
8. [Cognitive Architecture Models](#8-cognitive-architecture-models)
9. [AI-Specific Ontologies](#9-ai-specific-ontologies)
10. [schema.org Vocabulary](#10-schemaorg-vocabulary)
11. [Privacy, Policy, and Governance Vocabularies](#11-privacy-policy-and-governance-vocabularies)
12. [Anthropic/Claude Patterns](#12-anthropicclaude-patterns)
13. [Reuse Strategy and Recommendations](#13-reuse-strategy-and-recommendations)

---

## 1. W3C Standards and Recommendations

### 1.1 PROV-O (The PROV Ontology)

- **Name:** PROV-O: The PROV Ontology
- **IRI/Namespace:** `http://www.w3.org/ns/prov#` (prefix: `prov:`)
- **Specification:** <https://www.w3.org/TR/prov-o/>
- **Download:** <https://www.w3.org/ns/prov-o.owl>
- **Status:** W3C Recommendation (2013)

**Key Classes:**
- `prov:Entity` -- a physical, digital, conceptual, or other kind of thing with fixed aspects
- `prov:Activity` -- something that occurs over a period of time and acts upon entities
- `prov:Agent` -- something that bears responsibility for an activity or entity's existence
- `prov:Person`, `prov:Organization`, `prov:SoftwareAgent` (Agent subclasses)
- `prov:Plan` -- a set of intended actions to achieve goals
- `prov:Role` -- a function of an entity or agent with respect to an activity
- `prov:Bundle` -- a named set of provenance descriptions
- `prov:Collection`, `prov:EmptyCollection`

**Key Properties:**
- `prov:wasGeneratedBy` (Entity -> Activity)
- `prov:wasDerivedFrom` (Entity -> Entity)
- `prov:wasAttributedTo` (Entity -> Agent)
- `prov:wasAssociatedWith` (Activity -> Agent)
- `prov:used` (Activity -> Entity)
- `prov:wasRevisionOf` (Entity -> Entity)
- `prov:wasQuotedFrom` (Entity -> Entity)
- `prov:wasInformedBy` (Activity -> Activity)
- `prov:hadRole`, `prov:hadPlan` (qualified relations)
- `prov:generatedAtTime`, `prov:invalidatedAtTime`

**Relevance to Personal Agent Ontology:**
PROV-O is a primary import candidate. It provides the provenance backbone for tracking who
generated each memory item, what activity produced it, what sources it derived from, and how
it has been revised over time. The Entity/Activity/Agent triad maps directly to our memory
items, processing activities, and agent actors. Qualified relations (via `prov:qualifiedAssociation`,
`prov:qualifiedGeneration`, etc.) allow attaching roles and plans to associations.

**Reuse Potential:** **Import directly.** Use `prov:Entity` as a superclass for memory items,
`prov:Activity` for processing activities, `prov:SoftwareAgent` for the AI assistant, and
`prov:Person` for human users. Use `prov:Plan` for agent plans/goals.

---

### 1.2 OWL-Time (Time Ontology in OWL)

- **Name:** Time Ontology in OWL
- **IRI/Namespace:** `http://www.w3.org/2006/time#` (prefix: `time:`)
- **Specification:** <https://www.w3.org/TR/owl-time/>
- **Status:** W3C Recommendation (2017, updated 2020)

**Key Classes:**
- `time:TemporalEntity` (superclass)
- `time:Instant` -- a zero-duration temporal entity (point in time)
- `time:Interval` -- a temporal entity with extent (duration)
- `time:ProperInterval` -- an interval with non-zero duration
- `time:Duration`, `time:DurationDescription`
- `time:DateTimeDescription`, `time:GeneralDateTimeDescription`
- `time:TemporalPosition`
- `time:TimeZone`

**Key Properties:**
- `time:hasBeginning`, `time:hasEnd` (Interval -> Instant)
- `time:inXSDDateTime`, `time:inXSDDate` (Instant -> xsd:dateTime)
- `time:before`, `time:after` (ordering relations)
- `time:inside` (Instant inside Interval)
- Allen interval relations: `time:intervalBefore`, `time:intervalMeets`,
  `time:intervalOverlaps`, `time:intervalDuring`, `time:intervalEquals`, etc.
- `time:hasDuration`, `time:hasDurationDescription`

**Relevance to Personal Agent Ontology:**
OWL-Time provides the temporal backbone for all time-stamped entities: conversation sessions,
episodes, events, belief validity intervals, commitment due dates, and memory item creation
times. Allen's interval algebra relations enable reasoning about temporal ordering and overlap.

**Reuse Potential:** **Import directly.** Use `time:Instant` for point events,
`time:Interval`/`time:ProperInterval` for sessions, episodes, and validity windows. Link via
`time:hasBeginning`/`time:hasEnd`.

---

### 1.3 ActivityStreams 2.0 Vocabulary

- **Name:** Activity Streams 2.0
- **IRI/Namespace:** `https://www.w3.org/ns/activitystreams#` (prefix: `as:`)
- **Specification:** <https://www.w3.org/TR/activitystreams-core/> and
  <https://www.w3.org/TR/activitystreams-vocabulary/>
- **OWL File:** <https://www.w3.org/ns/activitystreams-owl>
- **Status:** W3C Recommendation (2017)

**Key Classes:**
- `as:Activity` -- an action that has been done or is happening
- `as:Object` -- base type for all things
- `as:Actor` -- (not a formal class; actors are Objects with `as:actor` property)
- `as:IntransitiveActivity`
- Activity subtypes: `as:Create`, `as:Update`, `as:Delete`, `as:Add`, `as:Remove`,
  `as:Follow`, `as:Like`, `as:Listen`, `as:Read`, `as:View`, `as:Accept`, `as:Reject`,
  `as:Offer`, `as:Invite`, `as:Question`, `as:Announce`
- Actor types: `as:Application`, `as:Group`, `as:Organization`, `as:Person`, `as:Service`
- Object types: `as:Note`, `as:Article`, `as:Document`, `as:Image`, `as:Video`,
  `as:Collection`, `as:OrderedCollection`, `as:CollectionPage`

**Key Properties:**
- `as:actor` (Activity -> Object) -- who performed the activity
- `as:object` (Activity -> Object) -- what was acted upon
- `as:target` (Activity -> Object) -- target/destination
- `as:result` (Activity -> Object) -- result of the activity
- `as:instrument` (Activity -> Object) -- tool used
- `as:published`, `as:updated` (timestamps)
- `as:attributedTo`, `as:inReplyTo`, `as:context`

**Relevance to Personal Agent Ontology:**
ActivityStreams provides a mature, standardized vocabulary for logging agent activities.
The Activity/Object/Actor pattern maps well to agent actions, tool invocations, and
interaction logging. The `as:instrument` property is particularly useful for tool use.
The vocabulary imports PROV-O, establishing natural provenance connections.

**Reuse Potential:** **Align to / selectively import.** Use the activity-type vocabulary
for categorizing agent actions. Use `as:instrument` for tool references. Consider subclassing
`as:Activity` for agent-specific action types.

---

### 1.4 SIOC (Semantically-Interlinked Online Communities)

- **Name:** SIOC Core Ontology
- **IRI/Namespace:** `http://rdfs.org/sioc/ns#` (prefix: `sioc:`)
- **Specification:** <https://www.w3.org/submissions/sioc-spec/>
- **Project:** <http://sioc-project.org/>
- **Status:** W3C Member Submission

**Key Classes (17 total):**
- `sioc:Community` -- an online community
- `sioc:Site` -- a website or platform
- `sioc:Forum` -- a discussion area (maps to a conversation channel)
- `sioc:Thread` -- a discussion thread (maps to a conversation)
- `sioc:Post` -- a single message/content item (maps to a turn/utterance)
- `sioc:Item` -- base class for content items
- `sioc:Container` -- groups content items
- `sioc:UserAccount` -- user identity
- `sioc:Role` -- user role within a community
- `sioc:Usergroup` -- collection of user accounts
- `sioc:Space` -- data space

**Key Properties (61 object + 25 datatype):**
- `sioc:has_container` / `sioc:container_of`
- `sioc:has_creator` / `sioc:creator_of`
- `sioc:has_reply` / `sioc:reply_of`
- `sioc:has_member` / `sioc:member_of`
- `sioc:next_by_date` / `sioc:previous_by_date` (temporal ordering of posts)
- `sioc:content` (text content of a post)
- `sioc:num_replies`, `sioc:num_views`

**Relevance to Personal Agent Ontology:**
SIOC's Thread/Post model maps to our Conversation/Turn structure. The temporal ordering
properties (`next_by_date`, `previous_by_date`) are useful for sequencing turns. The
Forum/Community concepts could model different conversation contexts or channels.

**Reuse Potential:** **Reference for design patterns.** SIOC's conversation threading model
informs our design, but we may define our own classes with richer semantics (agent roles,
tool invocations) that SIOC does not support. Consider `owl:equivalentClass` alignment
where appropriate.

---

### 1.5 FOAF (Friend of a Friend)

- **Name:** FOAF Vocabulary
- **IRI/Namespace:** `http://xmlns.com/foaf/0.1/` (prefix: `foaf:`)
- **Specification:** <https://xmlns.com/foaf/spec/>
- **Status:** Widely adopted community vocabulary

**Key Classes (19 total):**
- `foaf:Agent` -- an agent (person, group, software)
- `foaf:Person` -- a human person (subclass of Agent)
- `foaf:Group` -- a collection of agents
- `foaf:Organization` -- an organization
- `foaf:OnlineAccount` -- an online account
- `foaf:Document`, `foaf:Image`
- `foaf:Project`

**Key Properties:**
- `foaf:name`, `foaf:nick`, `foaf:mbox`, `foaf:homepage`
- `foaf:knows` (Person -> Person)
- `foaf:member` (Group -> Agent)
- `foaf:account` (Agent -> OnlineAccount)
- `foaf:maker` / `foaf:made`

**Relevance to Personal Agent Ontology:**
FOAF provides basic agent/person identity. `foaf:Agent` is widely used as the base agent
class in linked data. `foaf:Person` provides human identity properties. PROV-O's agent
classes are related to FOAF's via `rdfs:subClassOf` declarations.

**Reuse Potential:** **Import directly for agent identity.** Use `foaf:Person` for human
users, `foaf:name` for agent names. Compose with PROV's `prov:Person` and `prov:SoftwareAgent`.

---

### 1.6 Web Annotation Data Model

- **Name:** Web Annotation Ontology
- **IRI/Namespace:** `http://www.w3.org/ns/oa#` (prefix: `oa:`)
- **Specification:** <https://www.w3.org/TR/annotation-model/>
- **OWL:** <https://www.w3.org/ns/oa.rdf>
- **Status:** W3C Recommendation (2017)

**Key Classes:**
- `oa:Annotation` -- the annotation itself
- `oa:TextualBody` -- inline text content as body
- `oa:SpecificResource` -- a specific part of a resource
- `oa:Selector` (subtypes: `oa:TextQuoteSelector`, `oa:TextPositionSelector`,
  `oa:FragmentSelector`, etc.)
- `oa:Motivation` subtypes: `oa:commenting`, `oa:classifying`, `oa:identifying`,
  `oa:tagging`, `oa:describing`, `oa:linking`, `oa:bookmarking`, `oa:highlighting`,
  `oa:moderating`, `oa:questioning`, `oa:replying`

**Key Properties:**
- `oa:hasBody` (Annotation -> Body)
- `oa:hasTarget` (Annotation -> Target)
- `oa:motivatedBy` (Annotation -> Motivation)
- `oa:hasSelector` (SpecificResource -> Selector)

**Relevance to Personal Agent Ontology:**
The Annotation model is useful for representing agent annotations on memory items,
evidence tagging, and claims about specific text spans. The Motivation vocabulary
classifies why an annotation was made. The Selector mechanism allows precise reference
to parts of documents (useful for evidence/citation tracking).

**Reuse Potential:** **Selectively import.** Use for evidence linking and citation
tracking within memory items. The Body/Target/Motivation pattern is elegant for
representing claims about specific content.

---

## 2. Foundational and Upper Ontologies

### 2.1 BFO (Basic Formal Ontology)

- **Name:** Basic Formal Ontology
- **IRI/Namespace:** `http://purl.obolibrary.org/obo/BFO_` (prefix: `BFO:`)
- **Specification:** ISO/IEC 21838-2:2021
- **Download:** <https://github.com/BFO-ontology/BFO-2020>
- **Status:** ISO Standard

**Key Classes:**
- `BFO:0000001` (entity) -- top level
- Continuant branch: `bfo:IndependentContinuant`, `bfo:MaterialEntity`,
  `bfo:ObjectAggregate`, `bfo:Role`, `bfo:Disposition`, `bfo:Function`,
  `bfo:Quality`, `bfo:RealizableEntity`
- Occurrent branch: `bfo:Process`, `bfo:ProcessBoundary`,
  `bfo:SpatiotemporalRegion`, `bfo:TemporalRegion`, `bfo:TemporalInstant`,
  `bfo:TemporalInterval`
- `bfo:GenericallyDependentContinuant` (for information artifacts)
- `bfo:SpecificallyDependentContinuant` (for qualities, dispositions)

**Relevance to Personal Agent Ontology:**
BFO provides the upper-level alignment point. Agents are `bfo:MaterialEntity` (or
`bfo:Object`); conversations and actions are `bfo:Process`; agent capabilities are
`bfo:Disposition` or `bfo:Function`; roles are `bfo:Role`; memory items are
`bfo:GenericallyDependentContinuant` (information artifacts). The IAO (Information
Artifact Ontology), built on BFO, provides `IAO:0000030` (information content entity).

**Reuse Potential:** **Align to.** Use BFO as the upper ontology for formal alignment
and interoperability. Map our core classes to appropriate BFO categories. Import
IAO for information artifact classes.

---

### 2.2 DOLCE+DnS Ultralite (DUL)

- **Name:** DOLCE+DnS Ultralite
- **IRI/Namespace:** `http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#` (prefix: `dul:`)
- **Download:** <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl>
- **Wiki:** <http://ontologydesignpatterns.org/wiki/Ontology:DOLCE+DnS_Ultralite>
- **Status:** Community standard, widely used

**Key Classes:**
- `dul:Entity` -- top level
- `dul:Object` -- physical or social objects
- `dul:Agent` -- entities that can act (includes physical and social agents)
- `dul:SocialAgent`, `dul:PhysicalAgent`
- `dul:Person` (union of social persons and humans, subclass of Agent)
- `dul:Event` -- any physical, social, or mental process/event/state
- `dul:Action` -- intentional event caused by an agent
- `dul:Situation`, `dul:Description`, `dul:Concept`
- `dul:Role` -- a concept classifying objects within situations
- `dul:Task` -- a role for actions in a plan
- `dul:Plan` -- a description of how to achieve a goal
- `dul:Goal` -- a description of a desired situation
- `dul:InformationObject` -- information content
- `dul:TimeInterval`

**Key Properties:**
- `dul:isParticipantIn` / `dul:hasParticipant` (Object <-> Event)
- `dul:isAgentIn` (Agent -> Event)
- `dul:executesTask` (Action -> Task)
- `dul:isDescribedBy` / `dul:describes`
- `dul:hasRole` / `dul:isRoleOf`
- `dul:hasPart` / `dul:isPartOf`

**Relevance to Personal Agent Ontology:**
DUL provides an alternative foundational alignment to BFO, with stronger native support
for social agents, plans, goals, tasks, and information objects. The Event/Participation
pattern, the Description and Situation (DnS) pattern, and the Plan/Goal/Task hierarchy
are highly relevant. The Event-Model-F extends DUL for complex event modeling.

**Reuse Potential:** **Align to (alternative to BFO).** DUL's agent, event, plan, and
goal concepts map very closely to our domain. If choosing DOLCE alignment over BFO,
DUL is the lightweight import. Consider using DUL's Ontology Design Patterns (ODPs).

---

### 2.3 SUMO (Suggested Upper Merged Ontology)

- **Name:** Suggested Upper Merged Ontology
- **IRI/Namespace:** Various; typically `http://www.ontologyportal.org/SUMO.owl#`
- **Portal:** <https://www.ontologyportal.org/>
- **Status:** IEEE-managed, large formal upper ontology (SUO-KIF)

**Key Concepts:**
- Entity, Physical, Object, Process, Agent, IntentionalProcess,
  CognitiveAgent, Proposition, Believing, Desiring, Intending,
  Communication, ContentBearingObject, Sentence, Formula

**Relevance to Personal Agent Ontology:**
SUMO has dedicated classes for cognitive agents, intentional processes, and propositional
attitudes (believing, desiring, intending) that map to BDI concepts. However, SUMO is
very large (20,000+ terms) and natively expressed in SUO-KIF, not OWL.

**Reuse Potential:** **Reference only.** Too large and complex for direct import.
Useful as a reference for how upper ontologies model cognitive agents and propositional
attitudes. IEEE 1872.2 uses SUMO alongside DUL for robotics agents.

---

## 3. Agent and Multi-Agent Ontologies

### 3.1 OASIS (Ontology for Agents, Systems, and Integration of Services)

- **Name:** OASIS version 2
- **W3C Community Group:** <https://www.w3.org/community/oasis/>
- **Paper:** <https://arxiv.org/abs/2306.10061>
- **Specification Page:** <https://www.w3.org/community/oasis/oasis-version-2/>
- **Status:** W3C Community Group Report (2023)

**Key Classes:**
- `Agent` -- an entity that can perform behaviors
- `Behaviour` -- the mental state associated with an agent's capability to act
- `Goal` -- a preferred progression the agent puts effort into achieving
- `Task` -- an atomic operation an agent may perform
- `Commitment` -- an agreement/obligation between agents
- `Event` -- an occurrence in the system
- `Action` -- an intentional event by an agent
- `Role` -- function of an agent in an interaction

**Key Design Features:**
- Behaviouristic approach derived from Theory of Agents
- Models commitments between agents (social semantics)
- Supports smart contracts (Ontological Smart Contracts / OSCs)
- OWL 2 formalization
- Extends to multi-agent interaction protocols

**Relevance to Personal Agent Ontology:**
OASIS is one of the most directly relevant ontologies. Its Agent/Behaviour/Goal/Task
hierarchy, commitment-based social semantics, and OWL 2 formalization closely match
our needs. The commitment model is particularly valuable for tracking agent promises
and obligations.

**Reuse Potential:** **Strong candidate for alignment or partial import.** The
Agent/Goal/Task/Commitment pattern should inform our design. Evaluate whether to
import OASIS classes directly or create equivalent aligned classes.

---

### 3.2 FIPA Agent Communication Language (ACL) Ontology

- **Name:** FIPA-ACL Ontology
- **Original Specs:** <http://www.fipa.org/specs/> (FIPA dissolved, specs archived)
- **OWL Formalization:** Research papers (Springer, 2018)
- **Status:** Historical standard; OWL formalizations in research literature

**Key Concepts:**
- Communicative Acts (performatives): `inform`, `request`, `agree`, `refuse`,
  `propose`, `accept-proposal`, `reject-proposal`, `confirm`, `disconfirm`,
  `query-if`, `query-ref`, `subscribe`, `cancel`, `call-for-proposal`
- Message structure: sender, receiver, content, language, ontology, protocol,
  conversation-id, reply-with, in-reply-to
- Content language (SL, KIF, RDF)

**Key Design Features:**
- Based on speech act theory
- Defines 22 communicative acts (performatives)
- Each message references a content language and ontology
- Conversation protocols (e.g., FIPA-Request, FIPA-Contract-Net)
- OWL 2 DL formalization proposed to represent ACL message content and semantics

**Relevance to Personal Agent Ontology:**
FIPA's communicative act vocabulary is the most mature formal taxonomy of agent
communication acts. The performative types (inform, request, propose, etc.) can
classify conversation turns. The conversation protocol concept maps to dialog patterns.

**Reuse Potential:** **Reference for vocabulary design.** Use FIPA's communicative act
taxonomy to inform our turn/utterance classification. The actual FIPA specs are not
maintained as OWL artifacts, but the concepts are well-documented and can be reimplemented.

---

### 3.3 IEEE 1872.2-2021 (Autonomous Robotics Ontology)

- **Name:** IEEE Standard for Autonomous Robotics (AuR) Ontology
- **IRI:** Extends IEEE 1872-2015
- **GitHub:** <https://github.com/hsu-aut/IndustrialStandard-ODP-IEEE1872-2>
- **IEEE:** <https://ieeexplore.ieee.org/document/9774339/>
- **Status:** IEEE Standard (2021)

**Key Classes:**
- Robot, AutonomousRobot
- RobotGroup, RobotTeam
- Environment, EnvironmentModel
- Capability, Task, Mission, Plan
- Sensor, Actuator
- BehaviorSpecification
- AutonomyLevel

**Key Design Features:**
- Specified in OWL
- Uses DUL and SUMO as upper ontologies
- Models agent capabilities, autonomy levels, tasks, and missions
- Covers design patterns for autonomous systems
- Extends to multiple robot domains (aerial, ground, underwater, space)

**Relevance to Personal Agent Ontology:**
The Capability/Task/Mission/Plan hierarchy is relevant for modeling what an AI
assistant can do. The autonomy level concept maps to different levels of agent
authority. The Robot/Environment model provides a template for Agent/Context.

**Reuse Potential:** **Reference for design patterns.** The capability and task
modeling patterns are transferable. The robotics-specific classes are not directly
reusable, but the architectural patterns (capability -> task -> plan) are.

---

### 3.4 AgentOWL

- **Name:** AgentOWL
- **Description:** Agents with OWL ontology models using JADE and Jena
- **Source:** <https://agentowl.sourceforge.net/>
- **Status:** Research prototype

**Key Features:**
- Integration of FIPA-compliant agents (JADE) with OWL ontologies (Jena)
- Uses FIPA ACL with OWL and SPARQL as content languages
- Agent beliefs stored as OWL ontology individuals
- Agent goals and plans represented in OWL

**Relevance to Personal Agent Ontology:**
Demonstrates the practical integration of agent communication (FIPA ACL) with
OWL-based knowledge representation. Shows how agent beliefs can be stored as
OWL individuals and queried via SPARQL.

**Reuse Potential:** **Reference for architecture patterns.** Not a reusable ontology
per se, but validates the approach of using OWL for agent belief stores.

---

### 3.5 Agentic Ontology of Work (AOW)

- **Name:** Agentic Ontology of Work
- **Organization:** Skan AI
- **Whitepaper:** <https://www.skan.ai/whitepapers/agentic-ontology-of-work>
- **Status:** Industry ontology (2025)

**Key Entities:**
- `Agent` -- human or AI entity performing work
- `Skill` -- capability of an agent
- `Intent` -- purpose behind an action
- `Context` -- situational information
- `Policy` -- governance rules
- `Memory` -- persistent knowledge
- `Confidence` -- trust/certainty level
- `Outcome` -- result of agent action
- `Guardian` -- oversight/governance entity
- `Objective` -- business goal
- `Assurance Level` -- degree of trust

**Key Design Features:**
- Platform-agnostic, implementable in JSON-LD, RDF/OWL, or knowledge graph frameworks
- Describes work as contextual graphs, not linear flows
- Explicit governance, learning, and trust layers
- Designed for interoperability across RPA bots, LLM agents, BPM engines

**Relevance to Personal Agent Ontology:**
AOW is the most recent industry attempt to standardize agentic AI vocabulary. Its
concepts of Agent, Skill, Intent, Memory, Policy, Confidence, and Guardian align
well with our requirements. The governance-first approach (Policies, Guardians,
Assurance Levels) is notable.

**Reuse Potential:** **Evaluate for alignment.** The vocabulary is new and its
formal OWL/RDF artifacts may not yet be mature. Monitor for published ontology
files. The conceptual vocabulary is valuable for requirements alignment.

---

## 4. Dialog, Conversation, and Speech Act Models

### 4.1 ISO 24617-2 / DIT++ (Dialog Act Taxonomy)

- **Name:** ISO 24617-2 Dialogue Acts / DIT++ Taxonomy
- **ISO Standard:** ISO 24617-2:2012 (revised 2019)
- **DIT++ Home:** <https://dit.uvt.nl/>
- **Status:** ISO Standard

**Key Communicative Functions (56 in ISO, 88 in DIT++):**
- Information-seeking: `question`, `set-question`, `choice-question`, `propositional-question`
- Information-providing: `inform`, `agreement`, `disagreement`, `correction`
- Commissive: `promise`, `offer`, `accept-request`, `decline-request`
- Directive: `request`, `instruct`, `suggest`, `address-request`
- Feedback: `auto-positive`, `auto-negative`, `allo-positive`, `allo-negative`
- Social: `greeting`, `goodbye`, `thanking`, `apology`, `accept-thanking`
- Discourse structuring: `topic-introduction`, `topic-shift`, `interaction-structuring`

**Key Design Features:**
- Formally defined in DiAML (Dialog Act Markup Language)
- Multidimensional: acts categorized across 9-10 dimensions simultaneously
- Based on DIT++ release 5.1 (fully compatible with ISO 24617-2)
- Empirically grounded in corpus annotation studies

**Relevance to Personal Agent Ontology:**
This is the most comprehensive and standardized taxonomy of dialog acts. It can
classify every turn in a conversation by communicative function. The multidimensional
approach (a turn can be both an `inform` and a `topic-shift`) matches real dialog.

**Reuse Potential:** **Encode as SKOS concept scheme or OWL individuals.** The taxonomy
is not natively in OWL, but can be formalized as a `skos:ConceptScheme` for classifying
turns. Map our `pa:DialogAct` class instances to ISO 24617-2 communicative functions.

---

### 4.2 schema.org Conversation and Message

- **Name:** schema.org Conversation/Message types
- **IRI:** `https://schema.org/Conversation`, `https://schema.org/Message`
- **Specification:** <https://schema.org/Conversation>, <https://schema.org/Message>
- **Status:** schema.org vocabulary (community standard)

**Key Classes:**
- `schema:Conversation` -- one or more messages between participants on a topic
- `schema:Message` -- a single message from a sender to recipient(s)
- `schema:EmailMessage` (subclass of Message)
- `schema:CommunicateAction` -- act of conveying information via communication medium

**Key Properties:**
- `schema:hasPart` / `schema:isPartOf` (Conversation <-> Message)
- `schema:sender`, `schema:recipient`
- `schema:dateReceived`, `schema:dateSent`
- `schema:about` (topic of message)
- `schema:messageAttachment`

**Relevance to Personal Agent Ontology:**
Provides basic conversation/message structure that is widely understood. Lightweight
but lacks the depth needed for dialog act classification, tool invocations, or
epistemic content.

**Reuse Potential:** **Align to for interoperability.** Use `owl:equivalentClass`
to align our conversation/message classes with schema.org for broad interop.

---

## 5. BDI and Mental State Ontologies

### 5.1 The BDI Ontology (2025)

- **Name:** The Belief-Desire-Intention Ontology
- **Paper:** <https://arxiv.org/abs/2511.17162>
- **GitHub:** <https://github.com/fossr-project/> (referenced in paper)
- **Status:** Research ontology (November 2025)

**Key Classes:**
- `Belief` -- a propositional attitude representing what an agent holds to be true
- `Desire` -- a propositional attitude representing what an agent wants
- `Intention` -- a committed desire that drives action
- `Goal` -- a desired state of affairs
- `Plan` -- a structured sequence of actions to achieve a goal
- `Justification` -- reason for holding a belief or forming an intention
- `Agent` -- entity with mental states

**Key Design Features:**
- Modular Ontology Design Pattern (ODP)
- OWL 2 (Manchester Syntax) formalization
- T2B2T (Triples-to-Beliefs-to-Triples) paradigm for bidirectional RDF <-> mental states
- Aligned with foundational ontologies
- Supports integration with LLMs and logic-based BDI frameworks
- Explicit revision and justification tracking

**Relevance to Personal Agent Ontology:**
This is the most recent and complete OWL formalization of BDI concepts. The
Belief/Desire/Intention/Goal/Plan hierarchy directly maps to our epistemic and
goal-tracking requirements. The T2B2T paradigm is particularly interesting for
bridging RDF knowledge graphs with agent mental states.

**Reuse Potential:** **Strong candidate for import or alignment.** The BDI ODP
can be imported as a module. Evaluate the published OWL files for compatibility.
The Justification class addresses our evidence/provenance needs for beliefs.

---

### 5.2 Mental Functioning Ontology (MF)

- **Name:** Mental Functioning Ontology
- **IRI:** `http://purl.obolibrary.org/obo/MF.owl`
- **OBO Foundry:** <https://obofoundry.org/ontology/mf.html>
- **BioPortal:** <https://bioportal.bioontology.org/ontologies/MF>
- **GitHub:** <https://github.com/jannahastings/mental-functioning-ontology>
- **Status:** OBO Foundry candidate ontology

**Key Classes:**
- Mental processes (cognition, emotion, perception)
- Belief, desire, intention as mental dispositions
- Cognitive functions: attention, memory, reasoning, decision-making
- Mental disorders and functioning levels

**Key Design Features:**
- Founded on BFO (Basic Formal Ontology)
- Related to OGMS (Ontology for General Medical Science)
- Follows OBO Foundry best practices
- Partially aligned with Cognitive Atlas and CogPO

**Relevance to Personal Agent Ontology:**
MF provides BFO-aligned definitions of belief, desire, intention, and cognitive
processes. The dispositional/occurrent distinction for mental states (beliefs as
dispositions vs. occurrent believing) is ontologically rigorous.

**Reuse Potential:** **Reference for BFO alignment.** If we align to BFO, MF's
treatment of mental states informs how to classify beliefs and intentions within
the BFO framework. Direct import is unlikely needed for an AI agent ontology,
but the conceptual modeling is valuable.

---

### 5.3 Cognitive Paradigm Ontology (CogPO)

- **Name:** Cognitive Paradigm Ontology
- **Home:** <http://www.cogpo.org/>
- **Status:** OBO Foundry-aligned research ontology

**Key Classes:**
- Stimulus types, instruction types, response types
- Cognitive tasks and experimental paradigms
- BFO-aligned (uses IAO as foundation)

**Relevance to Personal Agent Ontology:**
CogPO's stimulus/instruction/response pattern loosely maps to the
input/instruction/output pattern of LLM interactions. Limited direct relevance
but useful reference for how cognitive tasks are formally modeled.

**Reuse Potential:** **Reference only.** Primarily designed for neuroscience
experimental paradigms, not AI agent interaction.

---

## 6. Event Ontologies

### 6.1 Simple Event Model (SEM)

- **Name:** Simple Event Model
- **IRI/Namespace:** `http://semanticweb.cs.vu.nl/2009/11/sem/` (prefix: `sem:`)
- **Specification:** <https://semanticweb.cs.vu.nl/2009/11/sem/>
- **OWL:** <http://stl.mie.utoronto.ca/ontologies/simple_event_model/sem.owl>
- **Status:** Community ontology (VU Amsterdam)

**Key Classes:**
- `sem:Event` -- something that happens
- `sem:Actor` -- who/what participated
- `sem:Place` -- where it happened
- `sem:Time` -- when it happened
- `sem:Core` -- abstract superclass
- Type classes: `sem:EventType`, `sem:ActorType`, `sem:PlaceType`, `sem:RoleType`
- `sem:Authority`, `sem:Constraint`, `sem:View`

**Key Properties:**
- `sem:hasActor`, `sem:hasPlace`, `sem:hasTime`
- `sem:hasSubEvent` / `sem:subEventOf`
- `sem:eventType`, `sem:actorType`, `sem:roleType`
- Timestamp properties: `sem:hasBeginTimeStamp`, `sem:hasEndTimeStamp`,
  `sem:hasEarliestBeginTimeStamp`, `sem:hasLatestEndTimeStamp`
- `sem:accordingTo` (attribution/perspective)

**Key Design Features:**
- Lightweight (RDFS + minimal OWL)
- Type system is open/extensible (types are instances, not subclasses)
- `sem:accordingTo` captures perspective/authority for events
- Deliberately minimal to handle heterogeneous event data

**Relevance to Personal Agent Ontology:**
SEM's "Who did what where and when?" pattern maps directly to conversation events.
The open type system (types as instances) is flexible for evolving agent action types.
The `sem:accordingTo` property is useful for perspective-dependent memory.

**Reuse Potential:** **Strong candidate for event modeling.** Import or align SEM
for our event/episode layer. The lightweight design composes well with PROV-O
and OWL-Time.

---

### 6.2 Event Ontology (Music/Media)

- **Name:** Event Ontology
- **IRI/Namespace:** `http://purl.org/NET/c4dm/event.owl#` (prefix: `event:`)
- **Specification:** <https://motools.sourceforge.net/event/event.html>
- **GitHub:** <https://github.com/motools/eventontology>
- **Status:** Community ontology (Queen Mary, University of London)

**Key Classes:**
- `event:Event` -- an arbitrary classification of a space/time region
- `event:Factor` -- contributing factor to an event
- `event:Product` -- outcome/result of an event
- `event:Agent` -- inferred class: any entity participating in an event as agent

**Key Properties:**
- `event:agent` -- active participant
- `event:factor` -- passive contributing element
- `event:product` -- result/output
- `event:place`, `event:time`
- `event:sub_event`

**Relevance to Personal Agent Ontology:**
The Event/Agent/Factor/Product pattern is elegant for modeling tool invocations:
the Agent initiates, the Tool is a Factor, the output is a Product. Originally
designed for music events but the model is domain-neutral.

**Reuse Potential:** **Reference for design patterns.** The agent/factor/product
distinction is useful for our Action/Tool/Result modeling.

---

### 6.3 Event-Model-F

- **Name:** Event-Model-F
- **Paper:** "F -- A Model of Events based on the Foundational Ontology DOLCE+DnS Ultralite"
- **ArXiv (2024 update):** <https://arxiv.org/html/2411.16609v1>
- **Status:** Research ontology, extends DUL

**Key Classes:**
- Extends DUL's Event, Situation, Description
- `EventParticipationSituation`
- `EventParticipationDescription`
- `DescribedEvent` (specialized from `DUL:EventType`)
- `Participant` (specialized from `DUL:Role`)
- Mereological, causal, and correlative event relations

**Key Design Features:**
- Built on DOLCE+DnS Ultralite (DUL)
- Comprehensive support for time, space, objects, persons
- Mereological relations (part-of between events)
- Causal relations (event caused by event)
- Correlative relations (events correlated)
- Multiple interpretations of the same event

**Relevance to Personal Agent Ontology:**
Event-Model-F provides the richest event modeling aligned with a foundational ontology.
The multiple-interpretation feature is relevant for modeling how different agents may
have different views of the same conversation event.

**Reuse Potential:** **Reference/align if using DOLCE.** If aligning to DUL, Event-Model-F
provides the event patterns. Heavier than SEM but more expressive.

---

### 6.4 LODE (Linking Open Descriptions of Events)

- **Name:** LODE: Linking Open Descriptions of Events
- **IRI/Namespace:** `http://linkedevents.org/ontology/` (prefix: `lode:`)
- **Specification:** <https://linkedevents.org/ontology/>
- **Status:** Community ontology

**Key Classes:**
- `lode:Event` -- something that happened
- Properties for participation, parthood, causality, correlation

**Key Design Features:**
- Defined in terms of DUL concepts
- Focused on linking heterogeneous event descriptions from different sources
- Lightweight, designed for linked data interoperability

**Relevance to Personal Agent Ontology:**
LODE is useful if we need to link our agent events with external event descriptions
(e.g., calendar events, world events the agent references).

**Reuse Potential:** **Reference for linked event patterns.** Lightweight alignment
point for connecting agent events to external event data.

---

## 7. Memory Ontologies and Agent Memory Architectures

### 7.1 Mem'Onto (Memory Ontology)

- **Name:** Mem'Onto
- **Paper:** "Towards a Semantic Representation of Memory Entities" (2025)
  <https://hal.science/hal-05317397v1>
- **Format:** OWL (Turtle file: MemOnto.ttl)
- **Status:** Research ontology (October 2025)

**Key Classes (34 classes):**
- Memory Systems:
  - `EpisodicMemory`
  - `SemanticMemory`
  - `ProceduralMemory`
  - `PrimaryMemory` (working memory)
  - `PRSMemory` (perceptual representation system)
  - `DeclarativeMemory`
  - `LongTermMemory`
- Mnesic Processes:
  - `Encoding`
  - `Storage`
  - `Retrieval`
- Consciousness Levels:
  - `Implicit` retrieval
  - `Explicit` retrieval
- Adapted from CoTOn (Cognitive Theory Ontology)

**Key Design Features:**
- Based on Tulving's SPI (Serial-Parallel-Independent) model
- 34 classes, 1 object property, 24 annotation properties
- Generalization of CoTOn (working memory ontology)
- Represents both cognition-oriented models and psychology-oriented theories

**Relevance to Personal Agent Ontology:**
Mem'Onto provides the most formal OWL representation of cognitive memory types.
The episodic/semantic/procedural/working memory taxonomy directly informs our
agent memory architecture. The mnesic processes (encoding, storage, retrieval)
map to our memory lifecycle operations.

**Reuse Potential:** **Align to for memory type classification.** Import the
memory type taxonomy as a classification scheme. Use to type our memory items
(e.g., a memory item `rdf:type` both `pa:MemoryItem` and an appropriate
Mem'Onto memory system class).

---

### 7.2 MATRIX Ontology

- **Name:** MATRIX (Multi-Agent Experience Transfer, Reasoning and Interaction eXchange)
- **Paper:** Springer CAiSE 2025 Workshops
  <https://link.springer.com/chapter/10.1007/978-3-031-94931-9_8>
- **Status:** Research ontology (June 2025)

**Key Concepts:**
- Shared memory layer for heterogeneous agentic teams
- Graph-based memory model using RDF graphs
- Supports both neural and symbolic representations
- Experience transfer between RL and LLM agents
- Multi-level representation (perception to reasoning)

**Key Design Features:**
- Memory model as collection of RDF graphs
- Interoperability between different agent types
- Explainability through knowledge graph structure
- Designed for collaborative multi-agent scenarios

**Relevance to Personal Agent Ontology:**
MATRIX addresses multi-agent shared memory, which is relevant when our personal
agent interacts with other agents or when multiple agents collaborate on behalf
of a user. The RDF graph-based memory model aligns with our approach.

**Reuse Potential:** **Monitor and evaluate.** Very recent; formal OWL artifacts
may not yet be publicly available. The conceptual design is valuable for our
multi-agent memory scenarios.

---

### 7.3 Zep / Graphiti (Temporal Knowledge Graph for Agent Memory)

- **Name:** Zep (powered by Graphiti)
- **Paper:** <https://arxiv.org/abs/2501.13956>
- **GitHub:** <https://github.com/getzep/graphiti>
- **Status:** Open-source framework (January 2025)

**Key Architectural Concepts:**
- Three-tier knowledge graph:
  - Episode subgraph (raw messages, text, JSON)
  - Semantic entity subgraph (extracted entities and relations)
  - Community subgraph (higher-level clusters)
- Bi-temporal model:
  - Timeline T: chronological ordering of events
  - Timeline T': transactional order of data ingestion
- Validity intervals on edges (`t_valid`, `t_invalid`)
- Conflict detection and resolution (add, merge, invalidate, skip)

**Key Design Features:**
- Dynamic, temporally-aware knowledge graph engine
- Incremental processing (no batch recomputation)
- Neo4j-based (property graph, not RDF)
- Supports flexible ontology via Pydantic models
- Outperforms MemGPT on Deep Memory Retrieval benchmark

**Relevance to Personal Agent Ontology:**
Zep/Graphiti provides the most production-ready agent memory architecture.
The three-tier model (episode/entity/community) and bi-temporal approach are
directly applicable. Note: uses property graph (Neo4j), not RDF/OWL, but the
conceptual model can be formalized in our RDF ontology.

**Reuse Potential:** **Strong conceptual reference.** Formalize Zep's three-tier
model and bi-temporal approach in our OWL ontology. The episode/entity/community
hierarchy should inform our class structure.

---

### 7.4 Mem0 (Universal Memory Layer)

- **Name:** Mem0
- **Paper:** <https://arxiv.org/abs/2504.19413>
- **GitHub:** <https://github.com/mem0ai/mem0>
- **Status:** Open-source framework (April 2025)

**Key Concepts:**
- Memory orchestration layer between agents and storage
- Memory lifecycle: extract -> consolidate -> retrieve
- Graph-based memory variant with conflict detection
- Unified APIs for episodic, semantic, procedural, associative memory
- LLM-powered Update Resolver for graph conflicts

**Key Performance:**
- 26% improvement over OpenAI in LLM-as-Judge metric
- 91% lower p95 latency, 90%+ token cost savings
- Semantic triplet matching for multi-hop reasoning

**Relevance to Personal Agent Ontology:**
Mem0 validates the multi-type memory architecture (episodic, semantic, procedural,
associative). The memory lifecycle (extract, consolidate, retrieve) maps to our
mnesic processes. The conflict resolution mechanism is relevant for our belief
revision modeling.

**Reuse Potential:** **Conceptual reference for implementation.** Mem0 is an
implementation framework, not an ontology. Its memory type taxonomy and lifecycle
operations inform our ontology design.

---

## 8. Cognitive Architecture Models

### 8.1 ACT-R

- **Name:** Adaptive Control of Thought -- Rational
- **Home:** <http://act-r.psy.cmu.edu/>
- **Status:** Cognitive architecture (Carnegie Mellon University)

**Key Memory Modules:**
- Declarative memory (facts as "chunks" with activation levels)
- Procedural memory (production rules: condition-action pairs)
- Goal buffer (current goal stack)
- Imaginal buffer (working memory for problem representation)
- Perceptual-motor modules (vision, audio, motor)

**Key Mechanisms:**
- Base-level activation (recency and frequency decay)
- Spreading activation (contextual priming)
- Utility learning (production rule selection)
- Single inheritance for chunk types

**Relevance to Personal Agent Ontology:**
ACT-R's chunk-based declarative memory with activation levels provides a model
for memory retrieval scoring. The production rule system maps to agent behavioral
policies. Integration of ontological reference models into ACT-R declarative
memory has been demonstrated in research.

**Reuse Potential:** **Conceptual reference.** No OWL formalization exists, but
ACT-R's memory mechanisms (activation, spreading activation, decay) should inform
our retrieval scoring and memory consolidation design.

---

### 8.2 Soar

- **Name:** Soar Cognitive Architecture
- **Home:** <https://soar.eecs.umich.edu/>
- **Status:** Cognitive architecture (University of Michigan)

**Key Memory Systems:**
- Working memory (current state representation)
- Procedural memory (production rules for operators)
- Semantic memory (long-term declarative knowledge, graph-based)
- Episodic memory (autobiographical, time-stamped)
- Spatial memory (for spatial reasoning)
- Short-term memory (activation-based)

**Key Mechanisms:**
- Universal subgoaling (impasse resolution)
- Chunking (learning new productions from experience)
- Reinforcement learning for operator selection
- Episodic retrieval by cue-based matching

**Relevance to Personal Agent Ontology:**
Soar provides the most complete cognitive architecture with explicit episodic
and semantic memory modules. The separation of working/procedural/semantic/episodic
memory with distinct storage and retrieval mechanisms maps directly to our
multi-store memory design.

**Reuse Potential:** **Strong conceptual reference.** Soar's memory type separation
and retrieval mechanisms should directly inform our ontology's memory type taxonomy
and the properties associated with each memory type.

---

### 8.3 LIDA (Learning Intelligent Distribution Agent)

- **Name:** LIDA Cognitive Architecture
- **Home:** <https://ccrg.cs.memphis.edu/>
- **Status:** Cognitive architecture (University of Memphis)

**Key Modules:**
- Perceptual Associative Memory (recognition)
- Transient Episodic Memory (recent episodes)
- Declarative Memory (long-term facts)
- Procedural Memory (action selection schemes)
- Sensory Memory, Sensory Motor Memory
- Global Workspace (conscious broadcast mechanism)
- Attention codelets (competition for consciousness)

**Key Design Features:**
- Based on Global Workspace Theory
- Cognitive cycle: perceive -> attend -> broadcast -> act
- Consciousness as a functional mechanism (competition/broadcast)
- Learning occurs during conscious broadcasts
- Provides a "cognitive ontology" for understanding cognitive activities

**Relevance to Personal Agent Ontology:**
LIDA's Global Workspace mechanism provides a computational model for the
"conscious/subconscious" agent control distinction. The cognitive cycle
(perceive/attend/broadcast/act) maps to agent processing pipelines. The
explicit treatment of consciousness as functional broadcast is relevant
for modeling agent attention and priority.

**Reuse Potential:** **Conceptual reference.** No OWL formalization, but LIDA's
cognitive cycle and memory module taxonomy inform our agent processing model.

---

## 9. AI-Specific Ontologies

### 9.1 Artificial Intelligence Ontology (AIO)

- **Name:** The Artificial Intelligence Ontology
- **IRI:** `http://purl.obolibrary.org/obo/aio.owl`
- **BioPortal:** <https://bioportal.bioontology.org/ontologies/AIO>
- **GitHub:** <https://github.com/berkeleybop/artificial-intelligence-ontology>
- **Paper:** <https://arxiv.org/abs/2404.03044>
- **Status:** Open-source ontology (2024, ongoing)

**Key Branches (8 top-level):**
- Bias (AI bias types)
- Layer (neural network layer types)
- Machine Learning Task
- Mathematical Function
- Model (AI model types: LLM, transformer, etc.)
- Network (architecture types)
- Preprocessing
- Training Strategy

**Key Design Features:**
- OBO Foundry-aligned (OWL EL profile)
- LLM-assisted curation (Claude 3, GPT-4)
- Uses Ontology Development Kit (ODK)
- Available on BioPortal and via OAK
- Regularly updated

**Relevance to Personal Agent Ontology:**
AIO classifies AI methods, models, and architectures. It can be used to
classify the type of AI agent (e.g., LLM-based, transformer architecture).
The Bias branch is relevant for safety/governance metadata.

**Reuse Potential:** **Reference for AI model classification.** Import specific
AIO classes if we need to classify agent model types. The Bias taxonomy is
useful for safety metadata.

---

## 10. schema.org Vocabulary

### 10.1 schema.org Action Hierarchy

- **Name:** schema.org Action types
- **IRI:** `https://schema.org/Action`
- **Specification:** <https://schema.org/Action>, <https://schema.org/docs/actions.html>
- **Status:** schema.org (community standard)

**Key Action Types:**

```
Action
  +-- CreateAction (CookAction, DrawAction, WriteAction, ...)
  +-- FindAction (CheckAction, DiscoverAction, TrackAction)
  +-- InteractAction
  |     +-- BefriendAction
  |     +-- CommunicateAction
  |     |     +-- AskAction, CheckInAction, CommentAction,
  |     |         InformAction, ConfirmAction, InviteAction,
  |     |         ReplyAction, ShareAction
  |     +-- FollowAction, JoinAction, LeaveAction, SubscribeAction
  +-- MoveAction (ArriveAction, DepartAction, TravelAction)
  +-- OrganizeAction
  |     +-- AllocateAction, BookmarkAction, PlanAction
  +-- PlayAction (ExerciseAction, PerformAction)
  +-- SearchAction
  +-- TradeAction
  |     +-- BuyAction, SellAction, OrderAction, PayAction, QuoteAction
  +-- TransferAction (BorrowAction, GiveAction, ReceiveAction, SendAction)
  +-- UpdateAction (AddAction, DeleteAction, ReplaceAction)
  +-- AssessAction
  |     +-- ChooseAction (VoteAction), ReviewAction, ReactAction
  +-- ConsumeAction (ReadAction, ViewAction, ListenAction, UseAction, WearAction)
  +-- ControlAction (ActivateAction, DeactivateAction, ResumeAction, SuspendAction)
```

**Key Properties:**
- `schema:agent` -- who performed the action
- `schema:object` -- what was acted upon
- `schema:instrument` -- tool used
- `schema:result` -- outcome
- `schema:target` -- target of the action
- `schema:startTime`, `schema:endTime`
- `schema:actionStatus` (ActiveActionStatus, CompletedActionStatus,
  FailedActionStatus, PotentialActionStatus)

**Relevance to Personal Agent Ontology:**
The schema.org Action hierarchy provides a comprehensive, widely-understood
taxonomy of action types. `CommunicateAction` and its subtypes map to dialog acts.
`SearchAction` maps to agent information retrieval. `CreateAction`, `UpdateAction`,
`DeleteAction` map to CRUD operations. The `instrument` property maps to tool use.

**Reuse Potential:** **Align to for interoperability.** Use `owl:equivalentClass`
or `rdfs:subClassOf` to align our agent action types with schema.org Actions.
The `actionStatus` vocabulary is directly usable for tracking action state.

---

## 11. Privacy, Policy, and Governance Vocabularies

### 11.1 ODRL (Open Digital Rights Language)

- **Name:** ODRL Information Model 2.2
- **IRI/Namespace:** `http://www.w3.org/ns/odrl/2/` (prefix: `odrl:`)
- **Specification:** <https://www.w3.org/TR/odrl-model/>, <https://www.w3.org/TR/odrl-vocab/>
- **Ontology:** <https://www.w3.org/ns/odrl/2/ODRL20.html>
- **Status:** W3C Recommendation (2018)

**Key Classes:**
- `odrl:Policy` -- container for rules (Set, Offer, Agreement)
- `odrl:Permission` -- allowed action
- `odrl:Prohibition` -- forbidden action
- `odrl:Obligation` / `odrl:Duty` -- required action
- `odrl:Asset` -- resource subject to policy
- `odrl:Party` -- entity involved in policy
- `odrl:Action` -- operation governed by the rule
- `odrl:Constraint` -- condition on a rule

**Key Properties:**
- `odrl:permission`, `odrl:prohibition`, `odrl:obligation`
- `odrl:target` (rule -> asset)
- `odrl:assignee`, `odrl:assigner` (rule -> party)
- `odrl:action` (rule -> action)
- `odrl:constraint` (rule -> constraint)

**Relevance to Personal Agent Ontology:**
ODRL provides the policy layer for governing what agents can do with stored data.
Permissions, prohibitions, and obligations map to memory access control, data
sharing policies, and compliance requirements. Essential for GDPR compliance.

**Reuse Potential:** **Import directly for policy modeling.** Attach `odrl:Policy`
instances to memory items, conversations, and data stores. Use ODRL actions for
read/write/share/delete operations.

---

### 11.2 DPV (Data Privacy Vocabulary)

- **Name:** Data Privacy Vocabulary
- **IRI/Namespace:** `https://w3id.org/dpv#` (prefix: `dpv:`)
- **Specification:** <https://w3id.org/dpv/>
- **OWL Serialization:** <https://w3c.github.io/dpv/guides/dpv-owl>
- **Status:** W3C Community Group Report (2022, v2.0 in progress)

**Key Concepts:**
- `dpv:PersonalData`, `dpv:PersonalDataCategory`
- `dpv:Processing`, `dpv:Purpose`
- `dpv:LegalBasis` (Consent, LegitimateInterest, Contract, etc.)
- `dpv:Consent` (with granular status tracking)
- `dpv:DataController`, `dpv:DataProcessor`, `dpv:DataSubject`
- `dpv:TechnicalOrganisationalMeasure`
- `dpv:Risk`, `dpv:Impact`
- `dpv:Right`, `dpv:RightExerciseActivity`

**Extensions:**
- PD: Personal Data categories
- LOC: Locations and jurisdictions
- RISK: Risk management
- TECH: Technology concepts
- AI: AI-specific privacy concepts
- LEGAL: Jurisdiction-specific (EU-GDPR, etc.)

**Relevance to Personal Agent Ontology:**
DPV provides the privacy metadata vocabulary needed for personal assistant memory.
Concepts like Consent, DataSubject, Purpose, and Right map directly to governance
requirements for storing personal conversations and user data. The AI extension
is particularly relevant.

**Reuse Potential:** **Import for privacy metadata.** Use DPV classes to annotate
memory items with privacy classifications, consent status, and processing purposes.
The LEGAL extension provides GDPR-specific concepts.

---

## 12. Anthropic/Claude Patterns

### 12.1 Claude Memory Tool Architecture

- **Documentation:** <https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool>
- **API Docs:** <https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool>
- **Status:** Production feature (September 2025+)

**Key Design Patterns:**
- File-based memory (Markdown files in `/memory` directory)
- Memory operations: create, read, update, delete files
- Client-side execution (tool calls executed by host application)
- Transparent, inspectable memory (human-readable Markdown)
- Two-part memory framework in Claude Agent SDK:
  - Session memory (within conversation)
  - Persistent memory (across conversations)

**Memory Tool Operations:**
- Store/recall information across conversations
- Create structured knowledge files
- Update existing memory with new information
- Delete outdated memory entries

**Key Architectural Decisions:**
- Chose file-based approach over vector DB + RAG
- Emphasis on transparency and auditability
- Memory as plain text, not embeddings
- CLAUDE.md as project-level persistent context

**Relevance to Personal Agent Ontology:**
Understanding Anthropic's actual implementation patterns helps ground our ontology
in practical agent memory needs. The file-based approach emphasizes simplicity and
transparency. The session/persistent memory distinction maps to our working/long-term
memory type split. Tool use patterns (structured JSON schemas with parameters)
inform our tool invocation modeling.

**Reuse Potential:** **Design reference.** Not an ontology, but the operational
patterns should be modeled in our ontology (tool invocations with input/output
schemas, session vs. persistent memory, human-readable memory items).

---

### 12.2 Claude Tool Use Schema Patterns

- **Documentation:** <https://www.anthropic.com/engineering/advanced-tool-use>

**Key Concepts:**
- Tool definitions with JSON Schema parameters
- Input examples for tool documentation
- Tool Search Tool (for thousands of tools)
- Programmatic Tool Calling
- Tool result handling (success, error, content blocks)

**Relevant Modeling Patterns:**
- Tool has: name, description, input_schema (JSON Schema)
- Tool invocation has: tool_name, input (JSON), result (content blocks)
- Tool categories: web search, code execution, file operations, API calls, memory operations

**Reuse Potential:** **Model in ontology.** Define `pa:Tool` with schema properties,
`pa:ToolInvocation` linking to tool, input, output, and status.

---

## 13. Reuse Strategy and Recommendations

### 13.1 Import Directly (Primary Dependencies)

These ontologies should be imported via `owl:imports` as foundational layers:

| Ontology | Namespace | Role |
|----------|-----------|------|
| **PROV-O** | `prov:` | Provenance for all memory items, activities, agents |
| **OWL-Time** | `time:` | Temporal entities, instants, intervals, Allen relations |
| **FOAF** | `foaf:` | Agent/person identity base vocabulary |
| **ODRL** | `odrl:` | Policy, permission, prohibition, obligation |

### 13.2 Align To (Design Alignment)

These should inform class design with explicit `owl:equivalentClass` or `rdfs:subClassOf`:

| Ontology | Namespace | Alignment Strategy |
|----------|-----------|-------------------|
| **BFO** | `BFO:` | Upper-level alignment for all core classes |
| **DUL** | `dul:` | Alternative to BFO; richer agent/event patterns |
| **schema.org** | `schema:` | Action types, Conversation, Message |
| **ActivityStreams** | `as:` | Activity logging vocabulary |
| **SIOC** | `sioc:` | Thread/Post conversation pattern |
| **SEM** | `sem:` | Event modeling (Event, Actor, Place, Time) |

### 13.3 Encode as Vocabulary/Taxonomy

These should be formalized as SKOS concept schemes or OWL individuals:

| Source | Encoding | Use |
|--------|----------|-----|
| **ISO 24617-2 / DIT++** | SKOS ConceptScheme | Dialog act classification |
| **FIPA communicative acts** | SKOS ConceptScheme | Agent communication act types |
| **Mem'Onto memory types** | OWL class hierarchy | Memory type classification |

### 13.4 Reference for Design Patterns (Do Not Import)

These inform design but are not imported or aligned:

| Source | Key Patterns to Adopt |
|--------|----------------------|
| **BDI Ontology (2025)** | Belief/Desire/Intention/Justification pattern |
| **OASIS v2** | Agent/Behaviour/Goal/Task/Commitment pattern |
| **AOW (Skan AI)** | Agent/Skill/Intent/Policy/Memory/Confidence/Guardian |
| **Zep/Graphiti** | Three-tier KG (episode/entity/community), bi-temporal model |
| **Mem0** | Memory lifecycle (extract/consolidate/retrieve), conflict resolution |
| **IEEE 1872.2** | Capability/Task/Mission/Plan for autonomous agents |
| **ACT-R / Soar / LIDA** | Multi-store memory architecture, activation-based retrieval |
| **Event-Model-F** | Rich event participation and causality (if using DUL) |
| **Claude memory tool** | Session vs persistent memory, file-based transparency |
| **DPV** | Privacy metadata (consent, data subject, purpose, rights) |
| **AIO** | AI model and bias classification |
| **MF Ontology** | BFO-aligned mental state modeling |

### 13.5 Proposed Core Namespace Prefixes

```turtle
@prefix pa:     <https://example.org/personal-agent#> .    # Our ontology
@prefix prov:   <http://www.w3.org/ns/prov#> .
@prefix time:   <http://www.w3.org/2006/time#> .
@prefix foaf:   <http://xmlns.com/foaf/0.1/> .
@prefix odrl:   <http://www.w3.org/ns/odrl/2/> .
@prefix as:     <https://www.w3.org/ns/activitystreams#> .
@prefix schema: <https://schema.org/> .
@prefix sioc:   <http://rdfs.org/sioc/ns#> .
@prefix sem:    <http://semanticweb.cs.vu.nl/2009/11/sem/> .
@prefix oa:     <http://www.w3.org/ns/oa#> .
@prefix dpv:    <https://w3id.org/dpv#> .
@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:    <http://www.w3.org/2002/07/owl#> .
@prefix xsd:    <http://www.w3.org/2001/XMLSchema#> .
```

### 13.6 Key Architectural Decisions for Next Phase

1. **Upper ontology choice:** BFO (ISO standard, OBO ecosystem) vs. DUL (richer agent/event
   patterns). Recommendation: Start with BFO alignment for rigor; consider DUL ODPs for
   complex event/plan patterns.

2. **Event modeling:** SEM (lightweight, flexible types) vs. Event-Model-F (rich, DUL-based).
   Recommendation: Start with SEM + OWL-Time; add richness incrementally.

3. **Memory type taxonomy:** Mem'Onto (cognitive grounding) vs. custom hierarchy.
   Recommendation: Define `pa:MemoryType` aligned with Mem'Onto categories but simplified
   for AI agent use (episodic, semantic, procedural, working).

4. **Dialog act classification:** ISO 24617-2/DIT++ (comprehensive) vs. FIPA (agent-focused).
   Recommendation: Create a SKOS concept scheme that merges relevant dialog acts from both,
   tailored to human-AI conversation patterns.

5. **BDI modeling:** BDI Ontology (2025) ODP vs. OASIS Agent model.
   Recommendation: Evaluate the BDI Ontology OWL files when available; adopt the
   Belief/Desire/Intention/Justification pattern with PROV-O for provenance.

6. **Governance:** ODRL + DPV for policy and privacy.
   Recommendation: Import ODRL directly; reference DPV patterns for privacy metadata.

---

## Sources

### W3C Standards
- [PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/)
- [OWL-Time: Time Ontology in OWL](https://www.w3.org/TR/owl-time/)
- [ActivityStreams 2.0 Core](https://www.w3.org/TR/activitystreams-core/)
- [ActivityStreams 2.0 Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/)
- [SIOC Core Ontology Specification](https://www.w3.org/submissions/sioc-spec/)
- [FOAF Vocabulary Specification](https://xmlns.com/foaf/spec/)
- [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/)
- [ODRL Information Model 2.2](https://www.w3.org/TR/odrl-model/)
- [SHACL](https://www.w3.org/TR/shacl/)
- [OWL 2 Structural Specification](https://www.w3.org/TR/owl2-syntax/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)

### Agent and Multi-Agent Ontologies
- [OASIS v2 - W3C Community Group](https://www.w3.org/community/oasis/oasis-version-2/)
- [OASIS v2 Paper (arXiv)](https://arxiv.org/abs/2306.10061)
- [FIPA Agent Communication Language](https://en.wikipedia.org/wiki/Agent_Communications_Language)
- [IEEE 1872.2-2021 Autonomous Robotics Ontology](https://ieeexplore.ieee.org/document/9774339/)
- [IEEE 1872.2 GitHub ODP](https://github.com/hsu-aut/IndustrialStandard-ODP-IEEE1872-2)
- [Agentic Ontology of Work (Skan AI)](https://www.skan.ai/whitepapers/agentic-ontology-of-work)

### BDI and Mental State Ontologies
- [The BDI Ontology (arXiv 2025)](https://arxiv.org/abs/2511.17162)
- [Mental Functioning Ontology (OBO Foundry)](https://obofoundry.org/ontology/mf.html)
- [Mental Functioning Ontology (GitHub)](https://github.com/jannahastings/mental-functioning-ontology)
- [Cognitive Paradigm Ontology](http://www.cogpo.org/)

### Event Ontologies
- [Simple Event Model (SEM)](https://semanticweb.cs.vu.nl/2009/11/sem/)
- [Event Ontology (motools)](https://motools.sourceforge.net/event/event.html)
- [Event-Model-F (arXiv)](https://arxiv.org/html/2411.16609v1)
- [LODE: Linking Open Descriptions of Events](https://cidoc-crm.org/sites/default/files/14783A.pdf)

### Memory and Agent Memory
- [Mem'Onto Paper (HAL)](https://hal.science/hal-05317397v1)
- [MATRIX Ontology (Springer)](https://link.springer.com/chapter/10.1007/978-3-031-94931-9_8)
- [Zep Paper (arXiv)](https://arxiv.org/abs/2501.13956)
- [Graphiti GitHub](https://github.com/getzep/graphiti)
- [Mem0 Paper (arXiv)](https://arxiv.org/abs/2504.19413)
- [Mem0 GitHub](https://github.com/mem0ai/mem0)

### Dialog and Conversation
- [ISO 24617-2 / DIT++ Home](https://dit.uvt.nl/)
- [schema.org Conversation](https://schema.org/Conversation)
- [schema.org Message](https://schema.org/Message)
- [schema.org Action](https://schema.org/Action)
- [schema.org CommunicateAction](https://schema.org/CommunicateAction)

### Cognitive Architectures
- [ACT-R Home](http://act-r.psy.cmu.edu/)
- [Soar (Wikipedia)](https://en.wikipedia.org/wiki/Soar_(cognitive_architecture))
- [LIDA (Wikipedia)](https://en.wikipedia.org/wiki/LIDA_(cognitive_architecture))

### AI and Privacy
- [Artificial Intelligence Ontology (GitHub)](https://github.com/berkeleybop/artificial-intelligence-ontology)
- [AIO Paper (arXiv)](https://arxiv.org/abs/2404.03044)
- [Data Privacy Vocabulary (DPV)](https://w3id.org/dpv/)
- [DPV in OWL2](https://w3c.github.io/dpv/guides/dpv-owl)

### Foundational Ontologies
- [BFO 2020 (GitHub)](https://github.com/BFO-ontology/BFO-2020)
- [DOLCE+DnS Ultralite (DUL)](http://ontologydesignpatterns.org/wiki/Ontology:DOLCE+DnS_Ultralite)
- [DUL OWL File](http://www.ontologydesignpatterns.org/ont/dul/DUL.owl)

### Anthropic/Claude
- [Claude Memory Tool Docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool)
- [Advanced Tool Use (Anthropic Engineering)](https://www.anthropic.com/engineering/advanced-tool-use)
- [Memory Tool API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)

### Ontology Registries
- [Linked Open Vocabularies (LOV)](https://lov.linkeddata.es/)
- [OBO Foundry](https://obofoundry.org/)
- [BioPortal](https://bioportal.bioontology.org/)
- [Ontology Lookup Service (OLS4)](https://www.ebi.ac.uk/ols4/)
