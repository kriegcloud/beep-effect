Introduction to Event-Model-F

Event-Model-F is a formal ontology for modeling events, built as an extension of the Descriptive Ontology for Linguistic and Cognitive Engineering plus Descriptions and Situations (DOLCE+DnS Ultralite, or DUL) foundational ontology ￼ ￼. It was introduced by Scherp et al. (2009) to address interoperability challenges in distributed, event-based systems by providing a rich, symbolic representation of events and their relationships ￼. Event-Model-F captures what happened (the event itself), who and what participated, when and where it occurred (temporal and spatial context), and even why it happened (causal or correlational factors) ￼ ￼. Crucially, it supports multiple interpretations of the same event, allowing different agents or systems to maintain their own contextual viewpoints ￼ ￼. The ontology is implemented in OWL (Web Ontology Language) with a description-logic axiomatization, ensuring a rigorous formal semantics amenable to automated reasoning ￼. The complete OWL files for Event-Model-F (and its pattern modules) are openly available on GitHub ￼, making it extensible and integrable with domain-specific ontologies.

Why DOLCE+DnS? Event-Model-F builds on DOLCE+DnS Ultralite to leverage a pattern-oriented design approach ￼ ￼. DOLCE provides high-level concepts (enduring objects, perduring events, qualities, etc.) and the DnS (Descriptions and Situations) framework, which together enable modeling context-dependent relationships and roles. By aligning with this upper ontology, Event-Model-F inherits a philosophically grounded distinction between events (perdurants that “happen” and unfold in time) and objects (endurants that “exist” in space) ￼ ￼. It also follows DnS in separating the “description” of a situation (schema of roles/relations) from concrete “situations” (instances where entities fill those roles) – a key technique used to represent complex event structures and interpretations. This alignment with DUL ensures formal consistency and offers built-in integration points to other ontologies that use the same foundation ￼ ￼. Non-functional requirements such as modularity, extensibility, and separation of concerns were core design goals ￼ ￼. In practice, Event-Model-F is organized into a set of interrelated ontology patterns, each encapsulating a specific aspect of event knowledge, which can be selectively combined or extended in different applications ￼ ￼.

Core Ontology Patterns and Features

Event-Model-F defines six primary ontology design patterns ￼, corresponding to key facets of events: Participation, Mereology (Composition), Causality, Correlation, Documentation, and Interpretation ￼. Each pattern is modeled as a DnS-style Description that “glues together” certain entities (events, objects, roles, etc.) in a Situation, enforcing a structured view of that aspect. Together, these patterns enable a richly structured, symbolic representation of event knowledge beyond simple event properties. Below we examine each pattern and its relevance to agent-based reasoning:

Event Participation Pattern (Who, What, When, Where)

The participation pattern captures the involvement of entities in an event – essentially answering who and what took part, as well as when and where ￼ ￼. Formally, an EventParticipationDescription defines roles that participants can play (specializations of DUL:Role) and ties them to the event being described ￼. For example, a domain ontology for emergency response might define roles like Citizen (a person affected by the incident) and RescueWorker (an agent responding to the incident) ￼. An EventParticipationSituation is the concrete context that satisfies that description, containing one specific Event (the event of interest) and the various Object individuals that participate in it ￼. Within the situation, the event is classified by a role called DescribedEvent (a subclass of DUL:EventType), and each participating object is classified by its respective participant role (e.g. Citizen, AffectedBuilding, RescueWorker) ￼. This scheme effectively links the event to its participants via a reified context, rather than a direct property, which brings the benefit of contextual metadata (time, place, etc.) on the participation itself.

Time and Location Parameters: The participation pattern also introduces parameters for the event’s time and place ￼ ￼. A TimeParameter can be attached to specify the TimeInterval during which the described event occurred (e.g. “the flood happened on June 13, 2006” ￼), and a LocationParameter specifies a spatial region relevant to the event or a participant’s location (e.g. “firefighters were positioned around the building” ￼). Under the hood, these parameters are modeled as specializations of DUL:Parameter, linked to the situation via dul:isParameterFor and to a dul:Region (time interval or space region) via dul:parametrizes ￼ ￼. The actual participating objects may hold qualities (like a spatial quality) that tie them to specific regions, which the LocationParameter then constrains ￼. All together, the participation pattern provides a symbolic representation of an event’s context: who (participants), what (the event type and involved objects), when (time interval), and where (location region) ￼. In agent systems, this is fundamental for situational awareness – an agent can query “what entities were involved in event E and in what roles?” or “when and where did event E happen?” using this pattern. For example, an agent could store an event “PowerOutage123” with participants JohnDoe (role: Citizen) and BuildingA (role: AffectedBuilding), and record the time and location, enabling queries for retrieval or inference (like finding all events involving a particular person or all events in a certain location).

Mereology Pattern (Event Composition)

Complex scenarios often involve composite events composed of multiple sub-events. The mereology pattern addresses this by allowing events to be part-whole related in arbitrarily complex structures ￼ ￼. An EventCompositionDescription defines two key roles: Composite (the whole event) and Component (the part events) ￼. An EventCompositionSituation then instantiates this, containing one event classified as a Composite and one or more events classified as Components ￼. For example, “the flood incident” could be modeled as a composite event that has sub-events like “heavy rainfall”, “river overflow”, and “street flooding” as its components. Unlike simpler models that might just provide a property like hasSubEvent, Event-Model-F’s composition pattern is reified, meaning the relationship exists via a situation individual rather than direct triples ￼ ￼. This design, while more complex, makes it possible to attach constraints or properties to the event composition itself (e.g., to state temporal relationships among components) ￼. Indeed, the authors note that components in F need not occur strictly before or inside the composite’s timeframe – one can use DUL’s temporal relations or constraints to specify ordering if needed ￼.

For agent-based reasoning, the mereology pattern is valuable for hierarchical planning and monitoring. An autonomous agent could represent a high-level task or plan as a Composite event, and its constituent actions as Component events. The ontology ensures that an agent (or a reasoner) can infer the whole-part structure: for instance, marking a Composite event as “completed” might require that all its Component sub-events are completed, or an agent might query all sub-events of a given incident to understand its structure. In multi-agent settings, different sub-events might be handled by different agents, and the Composite event serves as a shared reference for coordination. (Note that because F does not provide direct subEvent properties, an agent would retrieve parts via the composition situation, or the system may introduce convenient shortcuts or SPARQL queries to traverse the pattern.) Despite its complexity, this pattern brings interpretive flexibility – e.g., multiple alternative decompositions of an event can coexist (perhaps under different interpretations, see below) – and keeps the model extensible (new composition types or constraints can be added without altering the core event class) ￼ ￼.

Causality Pattern (Cause and Effect)

Causal reasoning is central to understanding and predicting events. The causality pattern in Event-Model-F formally represents cause-effect relationships between events, along with an optional justificatory context ￼ ￼. The pattern defines two EventType roles: Cause and Effect, which classify two distinct Event individuals in a causal relation ￼. It also introduces a description (an instance of DUL:Description) classified by Justification, to capture the reason or theory under which this cause-effect link holds true ￼. In other words, an EventCausalityDescription might include some explanatory element (e.g. “according to electrical engineering theory” or “as per eyewitness account”) labeled as a Justification, linking the cause and effect in a particular interpretive context ￼. The actual causal assertion is reified via an EventCausalitySituation (though the core paper focuses on the Description level) which would satisfy that description by including the two events in question.

For example, consider an emergency scenario: “SnappedPoleEvent” is believed to cause “PowerOutageEvent”. We instantiate a causality description (say CausDesc1) with roles CauseRole and EffectRole (typed as F:Cause and F:Effect). We then assert causeInst1 is an instance of F:Cause (under CausDesc1) classifying SnappedPoleEvent, and effectInst1 is an instance of F:Effect classifying PowerOutageEvent. These are tied together by stating CausDesc1 is of type F:Justification (perhaps linked to an explanatory narrative or theory). Now we have a structured representation that SnappedPoleEvent (as Cause) led to PowerOutageEvent (as Effect), justified by some context (e.g. “because the downed line cut electricity”). In OWL/Turtle, a simplified representation (omitting some reification detail) might look like:

ex:SnappedPoleEvent rdf:type dul:Event.
ex:PowerOutageEvent rdf:type dul:Event.

# Causality description linking them

ex:CausDesc1 rdf:type f:EventCausalityDescription;
f:justification "ElectricalTheory"^^xsd:string.

# Roles defined by the description

ex:roleA rdf:type f:Cause; dul:classifies ex:SnappedPoleEvent; dul:isDefinedIn ex:CausDesc1.
ex:roleB rdf:type f:Effect; dul:classifies ex:PowerOutageEvent; dul:isDefinedIn ex:CausDesc1.

The above is a sketch (the actual F ontology uses individuals for roles and a situation to bundle them), but it conveys that SnappedPoleEvent is marked as a Cause and PowerOutageEvent as an Effect under a given description. An agent’s reasoning engine, with the ontology’s axioms, can then infer queries like “what are the causes of PowerOutageEvent?” by finding any role of type Cause that classifies some event which has a counterpart Effect role classifying PowerOutageEvent. SPARQL could retrieve this by joining on the shared description or situation. For instance, one could ask: “SELECT ?cause ?justif WHERE { ?desc a f:EventCausalityDescription; f:justification ?justif. ?causeRole a f:Cause; dul:classifies ?cause; dul:isDefinedIn ?desc. ?effectRole a f:Effect; dul:classifies ex:PowerOutageEvent; dul:isDefinedIn ?desc. }” – which would yield any ?cause events and their ?justif for the given effect event. This pattern thus enables symbolic causal reasoning: an agent can trace back causes of an event, chain multiple causality relations for causal inference, or check if multiple causes are reported (each would be a separate description instance) ￼. The inclusion of a Justification means agents can differentiate hypothesized causality from established fact, or handle conflicting causality claims by keeping them separate (via different descriptions or interpretations). In agent-based architectures (like diagnostic systems, planning agents, or story-understanding AI), this fine-grained representation of causality is critical for tasks such as explaining outcomes (“Event E happened because X happened”) or predicting downstream effects (if an agent knows an event of type F:Cause typically leads to some F:Effect, it can anticipate E2 after seeing E1, given the appropriate justification context).

Correlation Pattern (Associative Relationships)

Not all relationships between events are causal in a direct sense; some are correlations or associations, where events co-occur or share common influences without a clear cause-effect link. Event-Model-F’s correlation pattern is designed to represent these cases ￼. It defines a role Correlate (to classify events that are correlated with each other) and again uses a Justification to explain or ground the correlation (e.g., a statistical law or domain theory that asserts the correlation) ￼. For example, in a smart city context, one might represent that “TrafficJamEvent” is correlated with “ConcertEvent” (perhaps because big concerts tend to cause traffic jams, though one might not say the concert caused every traffic jam). Using the correlation pattern, we could instantiate a description CorrDesc1 with two or more events playing the Correlate role, justified by “historical data of city traffic”.

Structurally, the correlation pattern is similar to causality (an EventCorrelationSituation satisfying an EventCorrelationDescription), but without implying directionality or direct causation. Multiple events can be correlated together under one description. For reasoning, this means an agent can capture knowledge like “whenever event A occurs, event B tends to occur as well” and query such associations. In a multi-agent system, if one agent observes A, it might warn other agents to watch for B if a correlation is known. The justification component can encode the strength or source of the correlation (e.g., a machine learning model’s confidence or a scientific principle). A SPARQL query might ask: “find all events correlated with X” by retrieving all ?ev that appear in a Correlation situation with X. This pattern gives statistical or non-causal reasoning a place in the ontology – useful for agents that need to recognize patterns or coincidences (for instance, a recommendation agent noting that “users who attend Event A often also attend Event B”).

Documentation Pattern (Evidence and Provenance)

Agents often rely on evidence or documentation about events – sensor readings, images, reports, etc. The documentation pattern in Event-Model-F links events to documentary evidence or sources about those events ￼ ￼. It introduces two roles: DocumentedEvent (classifying the event being documented) and Documenter (classifying an evidentiary object that documents the event) ￼. A DocumentationSituation would then tie, say, an event instance to a piece of data like a photograph, video, or textual report. For example, FloodEvent123 could be documented by PhotoImage456, with PhotoImage456 playing the role of Documenter in the situation, and FloodEvent123 as the DocumentedEvent ￼. The ontology allows the Documenter to be any specialization of DUL:Object or even an Event, giving flexibility – a video file, a sensor log, or even another event (like “press release event”) can serve as documentation ￼. This pattern essentially models provenance and attachments: it answers the question “How do we know about this event?” or “What evidence supports this event’s occurrence or details?”.

In an agent system, the documentation pattern supports reasoning about trust and validation. Agents can track which observations back up an event and potentially reason over the reliability of those sources. For instance, an agent might use a SPARQL query to find all evidence objects for a given event, and then apply trust rules (maybe the agent trusts government reports over social media posts, etc.). Moreover, since documentation can also be an event, one can model meta-events (like “reporting event” documents “crime event”). This provides a bridge between content in unstructured form (text, images) and the structured event representation. Large Language Model (LLM) based agents in particular could benefit: an LLM could generate a summary of an event and create a Documenter instance (the summary text) linked to the event, so that downstream queries distinguish between the event itself and the narrative of the event. The documentation pattern enriches the event representation with context needed for interpretation and verification, which is crucial in multi-agent settings where information comes from many sources.

Interpretation Pattern (Multiple Views of Events)

Perhaps the most distinctive feature of Event-Model-F is its support for multiple interpretations or viewpoints on the same event ￼ ￼. Real-world events, especially complex ones, may be understood differently by different observers or at different levels of abstraction. The interpretation pattern allows the ontology’s other pattern instances (participation, causality, etc.) to be grouped under specific interpretations ￼ ￼. Formally, an EventInterpretationDescription can define an Interpretant role (a kind of EventType) that classifies an event from a certain interpretive stance ￼. Each interpretation will then be a Situation that satisfies that description, bundling together a set of “relevant” situations – i.e., particular Participation, Mereology, Causality, Correlation, and Documentation situations – that belong to that point of view ￼ ￼. Essentially, an interpretation is like a nexus or context container for an event’s details. The interpreted event itself is classified by an Interpretant (which would be defined in some domain ontology to indicate the nature of the interpretation) ￼. For example, one interpretant might be “EmergencyIncident” (used by an emergency response center’s perspective) classifying a flooding event, while another interpretant might be “NewsworthyEvent” classifying the same flooding event as understood by a journalist ￼. Each interpretation would reference possibly different causes, participant roles, or documentation. One officer might interpret a power outage event with cause “snapped pole”, while another interprets the same outage event as possibly caused by “power plant failure” ￼. Event-Model-F would represent these as two distinct interpretation situations, each linking the outage to a different causality situation (with different cause events) ￼ ￼. Both interpretations share the base event (the outage itself), but keep their explanatory contexts separate.

For reasoning, the interpretation pattern is powerful: it enables contextual reasoning where an agent can explicitly consider or compare different hypotheses or perspectives. In multi-agent systems, this means each agent or group can maintain its own interpretation of events without confusion, and a meta-reasoner agent can examine contrasts. For instance, a higher-level AI could query: “What are the alternative explanations for Event E?” by retrieving all causality patterns for E across different interpretations ￼. Or, “Given Agent A’s interpretation, what does Agent B disagree on?” by comparing the situations included in A’s vs B’s interpretation. The pattern also supports partial reuse: since interpretations link to pattern instances, two interpretations might share some of the same sub-events or participants but diverge on others ￼ ￼. An agent could thus merge interpretations or update them incrementally as new information comes in (which would create or modify these situation instances). In LLM-based workflows, the interpretation pattern could map nicely to different “theories” an AI might entertain. For example, an LLM agent analyzing a story could create multiple interpretation contexts to represent differing plot hypotheses, maintaining them separately and even asking a symbolic reasoner to check each for consistency. The Event-Model-F structure thereby offers a scaffold for non-monotonic reasoning – agents can hold multiple possible worlds (interpretations) about the same events and later eliminate or confirm them with additional evidence, all within a single unified ontology.

Summary of Patterns: Together, these patterns allow Event-Model-F to represent the full gamut of event knowledge required for intelligent reasoning: participants and context (who, what, when, where), event structure (parts/sub-events), causal and correlational links (why/how), evidence (how we know), and interpretations (in which context or from whose view) ￼ ￼. This comprehensive coverage was a deliberate response to shortcomings in earlier event models. A survey at the time showed that while many models covered basic facts (actors, time, place), they lacked support for complex structural relations and multiple perspectives ￼ ￼. Event-Model-F filled these gaps, distinguishing itself by full support for mereology, causality, correlation, and interpretive flexibility in one framework ￼ ￼. The trade-off for this expressiveness is higher complexity: relationships are typically encoded via intermediate nodes (situations/descriptions) rather than direct properties, meaning a larger number of OWL individuals and a need for advanced queries or reasoning to traverse them ￼ ￼. In practice, users of the ontology have noted that it can be challenging to adopt without tooling, since simple questions (like “list sub-events of X”) require following the pattern indirections ￼ ￼. Nonetheless, the modular pattern design means one can use just the needed pieces – for example, an application might use the participation and causality patterns but not correlation or interpretation, if those aren’t relevant. This flexibility, and the formal rigor from its DOLCE underpinnings, make Event-Model-F a potent choice for domains where rich event reasoning is required.

OWL Modeling and SPARQL Query Examples

To make these concepts concrete, let’s walk through a simplified example in OWL/Turtle and demonstrate how an agent or developer could query the event knowledge using SPARQL. We will use the emergency response scenario as an illustration, modeling a Flood event and some related events (a power outage and a snapped power pole) with their relationships and participants:

OWL Example: Suppose we want to represent: “A flood (Event1) occurred in Springfield on 2025-05-01. It caused a city-wide power outage (Event2). There are two interpretations about the cause of the outage – one says a fallen power pole (Event3) caused it, another blames a power plant failure (Event4). Event2 affected a resident (John Doe) and a building (Building A). We have a photo (Photo123.jpg) as evidence of the flood.” Using Event-Model-F (prefix f:) and DUL (prefix dul:), we might encode this as follows (pseudo-Turtle for brevity):

@prefix ex: <http://example.org/instances/> .
@prefix f: <http://ontology.example/event-model-f#> .
@prefix dul: <http://ontologydesignpatterns.org/ont/dul/DUL.owl#> .

# Event individuals

ex:Event1_Flood a dul:Event ; rdfs:label "Springfield Flood May2025" .
ex:Event2_Outage a dul:Event ; rdfs:label "City Power Outage May2025" .
ex:Event3_PoleDown a dul:Event ; rdfs:label "Snapped Power Pole May2025" .
ex:Event4_PlantFail a dul:Event ; rdfs:label "Power Plant Failure May2025" .

# Participation: John Doe (person) and Building A in Event2 (the outage)

ex:JohnDoe a dul:Person .
ex:BuildingA a dul:PhysicalPlace . # assume some class for building

# Define a participation description for outage context (roles: Citizen, AffectedBuilding)

ex:PartDesc_Outage a f:EventParticipationDescription.
ex:Role_Citizen a f:Participant, dul:Role ; dul:isDefinedIn ex:PartDesc_Outage .
ex:Role_Building a f:Participant, dul:Role ; dul:isDefinedIn ex:PartDesc_Outage .

# Classify our objects with those roles:

ex:roleInst1 a f:Participant ; dul:classifies ex:JohnDoe ; dul:isDefinedIn ex:PartDesc_Outage .
ex:roleInst2 a f:Participant ; dul:classifies ex:BuildingA ; dul:isDefinedIn ex:PartDesc_Outage .

# Mark these specific role instances as the Citizen and AffectedBuilding roles:

ex:roleInst1 rdf:type ex:Role_Citizen .
ex:roleInst2 rdf:type ex:Role_Building .

# The DescribedEvent role for the outage event:

ex:Role_DescribedEvt a f:DescribedEvent, dul:EventType ; dul:isDefinedIn ex:PartDesc_Outage .
ex:describedEvtInst a f:DescribedEvent ; dul:classifies ex:Event2_Outage ; dul:isDefinedIn ex:PartDesc_Outage .

# Now create the participation situation linking all:

ex:Situation_OutageParticipation a f:EventParticipationSituation;
dul:satisfies ex:PartDesc_Outage;
dul:includesObject ex:JohnDoe, ex:BuildingA;
dul:includesEvent ex:Event2_Outage.

# (Time/Location parameters could be added similarly, e.g., linking ex:Event2_Outage to a time interval and place)

# Causality: Outage caused by PoleDown (interpretation 1) vs by PlantFail (interpretation 2)

# Define one causality description (for simplicity we reuse it for either cause, in practice could use separate descriptions or same with different situations)

ex:CausDesc1 a f:EventCausalityDescription.
ex:Role_Cause a f:Cause, dul:EventType ; dul:isDefinedIn ex:CausDesc1 .
ex:Role_Effect a f:Effect, dul:EventType; dul:isDefinedIn ex:CausDesc1 .

# Causality Situation 1: pole down -> outage

ex:Situation_Causality1 a f:EventCausalitySituation;
dul:satisfies ex:CausDesc1;
dul:includesEvent ex:Event3_PoleDown, ex:Event2_Outage.

# Role instances for this situation

ex:causeInst1 a f:Cause ; dul:classifies ex:Event3_PoleDown ; dul:isDefinedIn ex:CausDesc1 .
ex:effectInst1 a f:Effect; dul:classifies ex:Event2_Outage ; dul:isDefinedIn ex:CausDesc1 .

# And mark their types:

ex:causeInst1 rdf:type ex:Role_Cause. ex:effectInst1 rdf:type ex:Role_Effect.

# Justification for this causality (e.g., eyewitness account)

ex:CausDesc1 f:justification "Eyewitness saw pole snap" .

# Causality Situation 2: plant failure -> outage (we can reuse CausDesc1 roles or define new ones similarly)

ex:Situation_Causality2 a f:EventCausalitySituation;
dul:satisfies ex:CausDesc1;
dul:includesEvent ex:Event4_PlantFail, ex:Event2_Outage.
ex:causeInst2 a f:Cause; dul:classifies ex:Event4_PlantFail; dul:isDefinedIn ex:CausDesc1; rdf:type ex:Role_Cause.
ex:effectInst2 a f:Effect; dul:classifies ex:Event2_Outage; dul:isDefinedIn ex:CausDesc1; rdf:type ex:Role_Effect.
ex:CausDesc1 f:justification "Power grid analysis suggests plant issue" .

# Interpretation: define two interpretations (one for each hypothesis)

ex:IntDesc a f:EventInterpretationDescription.
ex:Role_Interpretant a f:Interpretant, dul:EventType ; dul:isDefinedIn ex:IntDesc .

# Interpretation 1 (pole hypothesis)

ex:Interpretation1 a f:EventInterpretationSituation; dul:satisfies ex:IntDesc;
f:relevantSituation ex:Situation_Causality1, ex:Situation_OutageParticipation.
ex:int1role a f:Interpretant; dul:classifies ex:Event2_Outage; dul:isDefinedIn ex:IntDesc .

# (ex:int1role could be given a type like emergency:TechnicalFailureInterpretation)

# Interpretation 2 (plant hypothesis)

ex:Interpretation2 a f:EventInterpretationSituation; dul:satisfies ex:IntDesc;
f:relevantSituation ex:Situation_Causality2, ex:Situation_OutageParticipation.
ex:int2role a f:Interpretant; dul:classifies ex:Event2_Outage; dul:isDefinedIn ex:IntDesc .

# (ex:int2role could be e.g. emergency:SabotageInterpretation, if that was the angle)

# Correlation: suppose flood (Event1) correlated with outage (Event2) due to temporal co-occurrence (optional in this example)

ex:CorrDesc1 a f:EventCorrelationDescription.
ex:Role_Corr a f:Correlate, dul:EventType; dul:isDefinedIn ex:CorrDesc1.
ex:Situation_Correlation a f:EventCorrelationSituation; dul:satisfies ex:CorrDesc1;
dul:includesEvent ex:Event1_Flood, ex:Event2_Outage.

# Two events playing Correlate:

ex:corrInst1 a f:Correlate; dul:classifies ex:Event1_Flood; dul:isDefinedIn ex:CorrDesc1; rdf:type ex:Role_Corr.
ex:corrInst2 a f:Correlate; dul:classifies ex:Event2_Outage; dul:isDefinedIn ex:CorrDesc1; rdf:type ex:Role_Corr.
ex:CorrDesc1 f:justification "Occurred in same timeframe (not necessarily causal)" .

# Documentation: Photo evidence for the flood

ex:Photo123 a dul:InformationObject ; rdfs:label "Photo of flooded street" .
ex:DocDesc1 a f:DocumentationDescription.
ex:Role_DocumentedEvt a f:DocumentedEvent, dul:EventType; dul:isDefinedIn ex:DocDesc1 .
ex:Role_Documenter a f:Documenter, dul:Role; dul:isDefinedIn ex:DocDesc1 .
ex:Situation_Doc a f:DocumentationSituation; dul:satisfies ex:DocDesc1;
dul:includesEvent ex:Event1_Flood; dul:includesObject ex:Photo123.
ex:docEvtInst a f:DocumentedEvent; dul:classifies ex:Event1_Flood; dul:isDefinedIn ex:DocDesc1; rdf:type ex:Role_DocumentedEvt.
ex:docObjInst a f:Documenter; dul:classifies ex:Photo123; dul:isDefinedIn ex:DocDesc1; rdf:type ex:Role_Documenter.

(The above is an illustrative mix of F and DUL vocabulary; the actual URIs and properties might differ slightly in the published ontology.)

In this knowledge base, we have: a Flood event with documentation, a Power Outage event with participants, two candidate Cause events for the outage, and two Interpretations capturing those different cause hypotheses (both sharing the same participation info since the outage’s impact on John and Building A is agreed upon). We also noted the correlation that the flood and outage happened together (perhaps to remind us that the flood might have triggered the outage indirectly).

SPARQL Query Examples: Once such data is in a triplestore, we can issue queries to support agent reasoning. Here are a few example queries and their intent:
• Query 1: Find all participants of the PowerOutage event and their roles.

PREFIX f: <http://ontology.example/event-model-f#>
PREFIX dul: <http://ontologydesignpatterns.org/ont/dul/DUL.owl#>
SELECT ?participant ?roleType
WHERE {

# find a participation situation for the outage

?sit a f:EventParticipationSituation;
dul:includesEvent ex:Event2_Outage;
dul:satisfies ?desc.
?desc a f:EventParticipationDescription.

# within that situation/description, find participant roles

?roleInst a f:Participant;
dul:isDefinedIn ?desc;
dul:classifies ?participant.
?roleInst rdf:type ?roleType.
FILTER (?roleType != f:Participant) # filter to get the specific sub-role, e.g. ex:Role_Citizen or ex:Role_Building
}

What it does: This query looks for any participation situation that includes Event2_Outage. It then finds all things classified by a Participant role in that context, and returns each participant individual along with the type of participant role they fulfill. The expected results might be: ?participant = ex:JohnDoe, ?roleType = ex:Role_Citizen and ?participant = ex:BuildingA, ?roleType = ex:Role_Building. An agent using this query can dynamically pull who was involved in a given event and in what capacity, enabling it to e.g. list victims and affected assets of an incident.

    •	Query 2: Retrieve known causes of the PowerOutage event (with justification).

SELECT ?causeEvent ?justification
WHERE {

# find any causality description that has Event2_Outage as an effect

?desc a f:EventCausalityDescription;
f:justification ?justification.

# effect role linking outage

?effectRole a f:Effect; dul:isDefinedIn ?desc; dul:classifies ex:Event2_Outage.

# cause role linking some cause event

?causeRole a f:Cause; dul:isDefinedIn ?desc; dul:classifies ?causeEvent.
}

What it does: This query finds all events that are asserted as a Cause for Event2_Outage under any causality description, and returns those cause events plus the justification text (or URI) provided. In our data, this would return two rows: one with ?causeEvent = ex:Event3_PoleDown and the justification “Eyewitness saw pole snap”, and another with ?causeEvent = ex:Event4_PlantFail and justification “Power grid analysis suggests plant issue”. A reasoning agent could use this to gather multiple hypotheses for diagnosis. For instance, a troubleshooting agent might then seek additional evidence for each cause (e.g., see if there is a documentation or sensor reading for the power plant failure).

    •	Query 3: Check if the flood event and outage event are correlated (and how).

SELECT ?corrDesc ?explanation
WHERE {
?corrDesc a f:EventCorrelationDescription;
f:justification ?explanation.
?corrSit a f:EventCorrelationSituation; dul:satisfies ?corrDesc.

# ensure both events appear in the same correlation situation

?corrSit dul:includesEvent ex:Event1_Flood;
dul:includesEvent ex:Event2_Outage.
}

What it does: This finds if there is any correlation situation that includes both the flood and the outage. In our example, yes – ex:Situation_Correlation satisfies ex:CorrDesc1, which has justification “Occurred in same timeframe…”. The query would return ?corrDesc = ex:CorrDesc1 with that explanation. An agent might pose such a query when trying to see indirect links between events (maybe the agent suspects the flood indirectly caused the outage and wants to see if they have been noted as correlated). The presence of a correlation (with its justification) could prompt an agent to investigate a causal link further or at least be aware the events coincided.

    •	Query 4: List all interpretation contexts for the PowerOutage event and what cause each interpretation asserts.

SELECT ?interpretation ?causeEvent ?viewType
WHERE {
?interpretation a f:EventInterpretationSituation;
f:relevantSituation ?causSit;
f:relevantSituation ?partSit.

# interpretation must involve the outage's participation situation (to ensure it's about our event)

?partSit a f:EventParticipationSituation;
dul:includesEvent ex:Event2_Outage.

# interpretation must involve a causality situation and within it find cause of outage

?causSit a f:EventCausalitySituation; dul:satisfies ?cDesc.
?cDesc a f:EventCausalityDescription.
?effectInst a f:Effect; dul:isDefinedIn ?cDesc; dul:classifies ex:Event2_Outage.
?causeInst a f:Cause; dul:isDefinedIn ?cDesc; dul:classifies ?causeEvent.

# get the type of interpretation (Interpretant) if any

?interpretation dul:satisfies ?iDesc.
?iDesc a f:EventInterpretationDescription.
?interpRole a f:Interpretant; dul:isDefinedIn ?iDesc; dul:classifies ex:Event2_Outage; rdf:type ?viewType.
FILTER(?viewType != f:Interpretant)
}

What it does: This rather complex query finds interpretation situations that include the participation info of the outage and some causality info, then extracts the cause event associated and the specific type of interpretation (if an Interpretant subtype is used). In effect, it asks: “what are the different interpretations of the outage and who/what do they blame as the cause?” The results might be: interpretation = ex:Interpretation1, causeEvent = ex:Event3_PoleDown, viewType = emergency:TechnicalFailureInterpretation and interpretation = ex:Interpretation2, causeEvent = ex:Event4_PlantFail, viewType = emergency:SabotageInterpretation (assuming those interpretant types). This would tell an agent that two scenarios are being considered. The agent could use this to, say, inform different teams (“Team A believes it was a downed pole, Team B suspects a bigger issue at the plant”). If an LLM is assisting human operators, it could generate a summary of each interpretation.

The above examples illustrate how Event-Model-F, while intricate, enables highly targeted queries. Standard Semantic Web reasoners can also be used to materialize some inferences – for instance, one could define a SWRL rule or OWL property chain to infer a direct :causedBy relation between two events if there exists a causality situation linking them. Then a simpler SPARQL query could retrieve ?event2 :causedBy ?event1 directly. The original authors allude to using meta-knowledge reasoning on the pattern instances as future work ￼, which could involve rules or higher-order logic to automatically choose the correct interpretation or check consistency of an event network. In a practical system, one might use a hybrid approach: store data in the Event-Model-F form for fidelity, but use additional rules or computed properties to simplify frequent queries.

Use Cases and Integrations in Agent Systems

Event-Model-F was originally motivated by use cases in distributed, multi-component systems like emergency response coordination ￼ ￼, and it has since been applied or extended in various domains requiring sophisticated event reasoning. We highlight a few notable scenarios and discuss how the ontology supports agent-based architectures:
• Emergency Response and Multi-Agency Coordination: The seminal use case (from the WeKnowIt project) involved different agencies – emergency call centers, police, fire department, etc. – each running their own event management systems ￼ ￼. Without a common event model, sharing information (e.g., “this flood led to power outages in these areas”) was error-prone. By using Event-Model-F as an interchange ontology, these systems could exchange rich event descriptions with unambiguous meaning ￼ ￼. For instance, one system could report an event Flood123 composed of sub-events (heavy rain, levee breach), with consequences (power outage event) and documentation (satellite images). Another system could ingest this OWL data and merge it with its own knowledge (maybe it already knew of the power outage, now it links a cause). Agents in this environment benefit by reasoning jointly: a planning agent might see that a flood causing an outage implies certain response tasks (send generators to hospital, etc.). The ontology’s formal structure ensures that even if one agency calls it “Blackout” and another “PowerOutageEvent” as individuals, as long as they share the Event-Model-F relationships, they can align on what happened to whom. The interoperability gains were a key driver – Scherp et al. note that existing event models were too narrow or ambiguous, aggravating integration problems ￼ ￼. In contrast, Event-Model-F’s completeness along with DOLCE alignment offered a lingua franca for these complex events ￼ ￼. For agent architectures, this means an agent can trust that the events it receives adhere to a consistent ontology, allowing it to apply generic reasoning rules (e.g., “if an event of type Fire is a component of an event of type Disaster, inherit location to Disaster”).
• Cognitive Agents and Diagnosis/Planning: In AI planning or diagnostic reasoning, representing causal chains and event hierarchies is essential. Event-Model-F has been explored as a backbone for such cognitive tasks in research. For example, a formal comparison of event ontologies notes that F’s design supports representing “previous events that caused the event in question” as well as participants ￼. A cognitive agent (such as a robot or an AI assistant) could use F to maintain an internal knowledge graph of events it has caused or observed, enabling it to answer questions like, “what led to this state?” or “what might happen next?” with an appropriate reasoning mechanism. In one case, researchers working on accident analysis (the Deepwater Horizon oil spill) found DOLCE-based ontologies useful to formally represent chains of decisions and failures leading to the disaster ￼ ￼. Although that work was more narrative, one can see how an agent could use Event-Model-F to encode a sequence of events (drilling operations, equipment failure events, human decisions) with causal links and then apply automated reasoning to identify root causes or contributing factors. The Justification element in the causality pattern allows an agent to encode whether a causal link is certain, hypothetical, from expert knowledge, etc. For planning agents, the event composition pattern maps to plan decomposition (with ordering handled separately), and the interpretation pattern could be used to compare different plan outcomes or narratives. Notably, F itself is domain-neutral – it doesn’t say “what is a fire or flood” – so agents must use domain ontologies in tandem. Many users extend F with specific event type hierarchies or additional constraints. For instance, the LACRIMALit project (FORTH, 2022) in digital humanities extended an event-centric model for representing historical crisis events, and they chose Event-Model-F as part of their basis to capture time, place, participants, and relations in ancient texts ￼ ￼. They cite that F “provides comprehensive support” for those relations and interpretations, which is beneficial when reasoning across sources that may have different accounts of the same historical event ￼.
• Knowledge Graphs and Event Streams: In the Semantic Web community, Event-Model-F has been influential in discussions of event representations. It’s referenced as a complex but thorough model in surveys ￼ ￼. More recent ontologies like SEM (Simple Event Model) or the event part of schema.org take a simpler approach (few direct properties for time/place/actors), which is easier for straightforward data publishing but lacks F’s reasoning depth ￼ ￼. Conversely, specialized models like the FARO ontology (Focused Assertion of Relationships in Ontologies) have looked at event relations (causality, prevention, etc.) in knowledge graphs and compared to Event-Model-F ￼ ￼. FARO’s authors note that F allows only binary cause-effect via distinct instances and that representing multiple causes requires multiple instantiations (which they saw as complex) ￼ ￼. In response, they and others sometimes design simpler upper ontologies, but these often sacrifice the interpretive nuance. In applications like complex event processing or sensor networks, however, stripped-down models might be used for performance reasons. One interesting hybrid approach is to use Event-Model-F for the offline knowledge base (for deep reasoning and logging), while using a leaner event format for real-time event stream processing. Agents can translate between the two as needed. For example, an event stream might assert “(sensor X, reading Y, time Z)” as a simple tuple, which an agent later aggregates into an F-style event with rich context if a higher-level reasoning is triggered (like detecting an anomaly that requires looking at causality or correlations historically) ￼ ￼. Indeed, Rinne et al. (2013) created an RDF-based complex event processing approach and demonstrated SPARQL queries that can recognize event patterns; they mention incorporating structural aspects like composite events which Event-Model-F also covers ￼ ￼.
• Ontology-Driven Multi-Agent Systems: The structured nature of Event-Model-F makes it appealing for multi-agent systems where agents share an ontology to communicate about events. Agents can publish events they generate or observe to a shared triple store or via messages, using F to encode the content. The receiving agents, armed with the same ontology, can then interpret the event fully. This aligns with concepts in Agent Communication Languages (ACL) where you need an ontology for message content. For example, two autonomous vehicles might communicate about “Incident123” on the road: one might say “Incident123 hasCause oilSpillEvent and hasEffect trafficJamEvent” – behind the scenes this could be an Event-Model-F snippet. The advantage over a flat message is that a third agent (like a city traffic manager) could later query and aggregate: “show me all incidents that caused traffic jams this week and their causes”. Additionally, common multi-agent patterns (contract net, negotiation, collective planning) often revolve around events (proposals, commitments, actions taken). A recent perspective is to treat multi-agent interactions as event-driven processes; using an ontology like F ensures the semantics of these interaction events are clear and machine-checkable ￼. Some research has also looked at combining high-level ontologies with Dynamic Epistemic Logic event models (which are about knowledge updates) for agents – interestingly, “event model F” in that context refers to a logical construct, but one can imagine integrating the two: an agent reasons about how an event (ontology instance) changes beliefs, etc., bridging symbolic knowledge and epistemic states.
• Extensibility and Hybrid Systems: Event-Model-F is not tied to any specific type of agent (it’s as useful for a rule-based expert system as for a learning-based agent), but it shines when used as a unifying layer in a hybrid AI system. For example, consider an LLM-based agent that also has a symbolic memory. The LLM might be great at language and commonsense, but ensuring consistency and traceability of its “beliefs” is hard. By logging key events the LLM discusses into an Event-Model-F knowledge base, a second component (a reasoner agent) can check things like temporal consistency (using the time parameters), cause-effect plausibility (maybe using an ontology of physics or heuristics to catch impossible causation), or simply maintain a timeline of events that the LLM can query in a structured way. In turn, the LLM can use the ontology to enrich its understanding: e.g., if it knows “Event X is a sub-event of Event Y”, it can answer questions about Y by summarizing X as part of it. The interpretation pattern is particularly relevant in LLM scenarios: large models often generate multiple possible interpretations of ambiguous input (say, multiple explanations for a mystery in a story). Rather than forcing a single narrative, an LLM agent could instantiate multiple interpretations in the ontology and perhaps even speak about them separately (“One possible sequence of events is… Another theory is…”). The formal structure ensures these theories don’t get conflated. Academic ontologists have discussed how representing events with formal semantics can aid in narrative understanding – for instance, to handle factuality (whether an event actually occurred or was just hypothetical in a text) and perspectives (who believes the event happened) ￼ ￼. Event-Model-F can encode factuality as a kind of interpretation or as annotations on the event descriptions (like marking an EventParticipationSituation as dul:isExpressedBy some text with certain modality).

In summary, Event-Model-F has been used or referenced in domains like emergency management, historical event annotation, multimedia event modeling ￼, and AI planning – typically in cases where deep reasoning over events is required. Its rich structure makes it ideal for agent systems that need to talk about complex scenarios (multi-step processes, conflicting information, etc.). However, its complexity means that in practice, it often requires customization and tooling. Users may define simplified interfaces: for example, they might create SWRL rules to materialize properties like :hasSubEvent or :hasCause so that simple queries don’t need to traverse the DnS structures each time ￼. They may also integrate it with existing upper ontologies; indeed, F was designed to be modular. You can plug in domain ontologies (for event types, roles, etc.) without altering F’s core. The creators anticipated combining it with other core ontologies ￼ (e.g., a social ontology for intentions, or a physical process ontology for scientific causal laws) to broaden its reasoning capabilities. This is an important point for integrators: Event-Model-F is not a complete solution by itself – think of it as the “skeleton” for event knowledge, which you flesh out with domain-specific flesh.

Integrating Event-Model-F into LLM-Based Agent Workflows

With the rise of Large Language Models and “agentic” AI systems (where an LLM is part of a loop that observes, plans, and acts), a natural question is how a formal ontology like Event-Model-F can enhance such systems. Here are some guiding principles and potential integration strategies, focusing on reasoning over events in multi-agent or LLM-driven contexts:

1. Structured Memory and Common Ground: LLM agents excel at generating and interpreting text, but they lack an internal structured memory of events by default. By using Event-Model-F as a knowledge graph of events, an LLM-based agent can have an explicit record of what has occurred, what actions were taken (by itself or others), and the relationships among those events. For example, consider a multi-turn interaction where an LLM-based assistant helps manage a project. The assistant (with a symbolic backend) can log each discussed task as an event, link tasks that are prerequisites (causality or mereology), tag who is responsible (participation), and note any rationale (documentation or interpretation). Later, if asked “Why are we delayed on the main project?”, the agent can traverse this graph to find that a sub-event (say, a component task) failed and that caused the delay (a causality chain), and even identify the justification (perhaps an interpretation that a resource shortage caused the failure). It could answer: “The project delay happened because the procurement event failed (cause), which in turn was due to a supplier issue – this was documented in the system on Jan 5.” All the pieces for that answer come from the ontology relationships rather than the LLM’s parametric memory. Essentially, Event-Model-F can serve as the “world model” or shared blackboard for an LLM agent (and other agents) to ensure consistency and traceability of event-centric knowledge.

2. Multi-Agent Interpretive Flexibility: In scenarios with multiple agents (which could be multiple LLMs or a mix of human and AI agents), different agents may have different beliefs or hypotheses. The interpretation pattern of Event-Model-F is a ready-made solution for managing these divergent views without immediate conflict. Each agent could maintain its own EventInterpretationSituation for contentious events. For instance, in a detective game managed by agents, Agent A (playing detective) believes Event X (a murder) was caused by Event Y (jealous argument), while Agent B (an analyst) suspects Event Z (burglary gone wrong). Both interpretations of “why X happened” can be stored. The system (or a referee agent) can keep track that “in A’s interpretation, Y is cause; in B’s, Z is cause.” An LLM generating dialogue can be conditioned on a particular interpretation when speaking as that agent, thereby keeping its story straight. If the agents debate, the system can explicitly query the ontology for differences: “What’s the difference between interpretation A and B regarding the murder event?” – the ontology might respond that the cause roles are filled by different events ￼. The LLM can use that to drive the conversation (e.g., “Detective says: I think the motive was jealousy. Analyst says: I disagree, I think it was a burglary gone wrong.”). Without an ontology, the LLM might lose track or confuse the two theories. Thus, Event-Model-F provides a scaffold for agent alignment and discourse, where even an LLM can be guided by the structured data to maintain coherence over long interactions.

3. Planning and Simulation: Many LLM-agent frameworks involve the LLM formulating plans (as sequences of actions/events) to achieve goals. By representing those plans in Event-Model-F (using the mereology pattern for action decomposition and perhaps causality for precondition/result relations), we gain the ability to apply logical checks. For example, if the LLM proposes: “First do A, then B, which will cause C,” we can insert those as events and relations: A before B as part of a composite event (with a temporal constraint), B causes C, etc. A reasoning module could then, for example, detect a contradiction (maybe the ontology or a rule knows that doing B cannot cause C without some other event D that was missing). Or it could enrich the plan (if an event is missing participants, maybe the plan is underspecified – e.g., no agent assigned to action B – which an OWL consistency check could flag because the participation pattern expects a value). There has been work in using ontologies for plan validation in robotics; Event-Model-F could serve a similar role for LLM plans in virtual environments or textual scenarios, ensuring all required pieces are accounted for. The LLM can be prompted with the results of these checks (“Your plan is missing who will perform action B and when it happens”) and then fix its plan accordingly. Additionally, if multiple agents are executing parts of a plan, the composite event structure in the ontology can serve as a synchronization point – each agent updates the status of its sub-event, and a monitoring agent can mark the composite done when all parts are done. This is essentially a form of blackboard system with ontology semantics.

4. Natural Language to Ontology and back: One challenge is getting information into the ontology (from raw text or LLM outputs) and using it in generation. Thankfully, with advanced NLP and some prompt engineering, an LLM can be guided to tag or output structured representations. For example, after a conversation, the system could ask the LLM: “Extract all events mentioned, who participated, and any cause-effect stated, in a JSON following Event-Model-F patterns.” The LLM’s understanding of language might allow it to populate a structure which is then converted to OWL triples. Projects like NewsReader did similar things by extracting who/what/when from news and then grounding it to an ontology including events and their relations ￼ ￼. Conversely, when an ontology query returns results, the LLM can verbalize them in a user-friendly way. Because Event-Model-F is richly structured, an LLM can generate coherent multi-sentence explanations by following the structure: e.g., “Event E happened at [time] in [place]. It involved [participants]. It consisted of sub-events: [list]. It was caused by [cause] according to [justification].” Each clause corresponds to one pattern’s info. This is essentially template-based generation, but an LLM can smooth it into natural language. The ontology thus provides ground truth data for the LLM to talk about, mitigating the model’s tendency to hallucinate or contradict itself when reasoning about a series of events.

5. Tool Use and Reasoning: Modern LLM-agent frameworks (like ReAct or MRKL systems) allow the LLM to call external tools (APIs, databases) when needed. An Event-Model-F knowledge base can be exposed as a SPARQL endpoint or via specific queries. The LLM, guided by prompts, can decide to invoke a query if a user asks something like “What caused the blackout in Springfield?” The LLM might not know internally, but it knows that information might be in the event KB. It could output a query (like the SPARQL from Query 2 above, with the specific event URI if it has it or by searching by label), retrieve the results, and then incorporate that into its answer. This kind of reasoning outsourcing leverages the precise logical relationships in the ontology to compensate for the LLM’s lack of reliable multi-step reasoning. Furthermore, the reasoner could pre-compute certain inferences (like all transitive causes, or check if two interpretations can both be true without conflict) and mark events with flags (maybe using a property like ex:consistentWithInterpretation ex:Interpretation2 or such). The LLM can then just read those flags via queries instead of trying to deduce consistency on the fly.

6. Ontology Extensions for LLM contexts: Finally, it’s worth considering that new patterns or ontology extensions might be needed when integrating with LLM agents. For example, we might want to represent an event of “Agent A informed Agent B about X” – a communicative act. DUL (and by extension F) can model communication events as social actions, and one could extend the participation pattern with roles like Speaker and Addressee. This could be extremely useful for multi-agent dialogue management: the event of an information sharing could trigger updates in another agent’s knowledge base (maybe creating an interpretation for that agent’s viewpoint). Another extension could be to link event representations to LLM’s internal state or prompts, perhaps via the documentation pattern (treat the conversation or chain-of-thought as a documenting object for an event). This way, if an answer was generated about an event, the system can point to which part of the dialogue or which tool output was used as evidence (improving transparency). The modular design of Event-Model-F means we can usually add such domain-specific refinements without breaking the core. For example, one could create a subclass of f:Interpretant called BeliefPerspective that ties an interpretation to an agent’s belief state, or use the Justification to indicate “LLM inference” versus “explicit data” as the source of a causal claim.

In conclusion, integrating Event-Model-F into LLM-agent workflows can marry the best of both worlds: the flexibility and knowledge embedded in language models with the precision and consistency of a symbolic ontology. The ontology acts as a guardrail and memory for the agent, ensuring that as the agent reasons over events (be it a storyline, a plan, or a set of observations), it stays logically coherent and explainable. As AI systems become more complex and are deployed in critical domains (where understanding causality and accountability of events is key), such an integration offers a pathway to more robust and trustworthy agent behavior. Academic and professional discussions increasingly highlight that purely data-driven approaches struggle with deeper reasoning about events (like understanding chains of consequences or multiple viewpoints) ￼ ￼. Ontologies like Event-Model-F provide a ready-made infrastructure to tackle these challenges, and the references and codebases (e.g., the GitHub repo ￼ and ontology files) give practitioners a head start in adopting these methods for cognitive agents and multi-agent systems of the future.

References and Resources
• Ansgar Scherp et al. (2009/2024). “Event-Model-F: A Model of Events based on the Foundational Ontology DOLCE+DnS Ultralite.” Proc. of K-CAP 2009. (ArXiv preprint 2411.16609) – Introduces Event-Model-F, detailing its ontology patterns and use in emergency response ￼ ￼.
• GitHub Repository – ascherp/ontologies – Contains the OWL files for Event-Model-F (re-released 2023) and related ontologies ￼. Useful for exploring the class and property definitions in detail and for importing into your applications.
• Y. Rebboud et al. (2021). “Beyond Causality: Representing Event Relations in Knowledge Graphs.” – Discusses event relationship models including Event-Model-F, noting its support for mereological, causal, and correlation relations and the pattern-based design ￼. Provides perspective on complexity vs. simplicity in event ontologies.
• E. Blomqvist et al. (2013). “Event Processing in RDF.” CEUR Workshop, Vol-1188. – Proposes SPARQL-based complex event handling. While not using Event-Model-F directly, it aligns with the need to represent composite events and could be complementary for stream reasoning with an F-style model ￼ ￼.
• A. van Son et al. (2016). “Perspectives for modeling events: annotation of news stories.” – (Referenced in ACL W17-0810) Illustrates handling multiple layers (events, factuality, opinions) for news, echoing the motivation of F’s interpretation pattern ￼ ￼. Shows how an ontology can capture who said what about an event – a scenario where Event-Model-F could be applied.
• Maria Papadopoulou et al. (2022). “The LACRIMALit Ontology of Crisis: An Event-Centric Model for Digital History.” Information 13(8):398. – An example of using DOLCE-based event modeling for representing historical crises, citing Event-Model-F’s ability to handle time, place, participants, mereology, causality, and different interpretations of events ￼.
• Additional: The Simple Event Model (SEM) by van Hage et al. and the Linking Open Descriptions of Events (LODE) ontology are simpler alternatives often mentioned in contrast. Surveys like the one in CEUR-WS 2023 (“Comprehensive Survey on Ontologies about Event” by Ma et al.) compare these including F ￼ ￼. Those looking to integrate Event-Model-F with more lightweight schemas (for open data publishing or quick prototyping) may find mappings in such literature.
