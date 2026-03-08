"""Build the Personal Agent Ontology from conceptual model artifacts.

Loads glossary.csv for class and individual definitions. Axiom patterns
and property designs are encoded directly in Python functions, informed
by axiom-plan.yaml and property-design.yaml documentation.

Produces:
  - personal_agent_ontology.ttl (TBox: classes, properties, axioms)
  - pao-reference-individuals.ttl (Status values, roles, classifiers)
  - pao-data.ttl (Sample ABox data for CQ test execution)
  - shapes/pao-shapes.ttl (SHACL structural shapes)

Usage:
    uv run python ontologies/personal_agent_ontology/scripts/build.py
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import TYPE_CHECKING, Any

import yaml
from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

if TYPE_CHECKING:
    from rdflib.term import Node

# ---------------------------------------------------------------------------
# Namespaces
# ---------------------------------------------------------------------------

PAO = Namespace("https://purl.org/pao/")
PROV = Namespace("http://www.w3.org/ns/prov#")
TIME = Namespace("http://www.w3.org/2006/time#")
FOAF = Namespace("http://xmlns.com/foaf/0.1/")
ODRL = Namespace("http://www.w3.org/ns/odrl/2/")
SH = Namespace("http://www.w3.org/ns/shacl#")
OBO = Namespace("http://purl.obolibrary.org/obo/")

# Ontology IRIs
TBOX_IRI = URIRef("https://purl.org/pao/")
REF_IRI = URIRef("https://purl.org/pao/reference-individuals")
DATA_IRI = URIRef("https://purl.org/pao/data")
PROV_DECL_IRI = URIRef("https://purl.org/pao/prov-declarations")
TIME_DECL_IRI = URIRef("https://purl.org/pao/time-declarations")
FOAF_DECL_IRI = URIRef("https://purl.org/pao/foaf-declarations")
ODRL_DECL_IRI = URIRef("https://purl.org/pao/odrl-declarations")
BFO_DECL_IRI = URIRef("https://purl.org/pao/bfo-declarations")
TBOX_VERSION_IRI = URIRef("https://purl.org/pao/0.8.0")
REF_VERSION_IRI = URIRef("https://purl.org/pao/reference-individuals/0.8.0")
DATA_VERSION_IRI = URIRef("https://purl.org/pao/data/0.8.0")

# Ontology project root (ontologies/personal_agent_ontology/)
PROJECT = Path(__file__).resolve().parent.parent
DOCS = PROJECT / "docs"
OUT = PROJECT


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def bind_common_prefixes(g: Graph) -> None:
    """Bind standard prefixes to a graph."""
    g.bind("pao", PAO)
    g.bind("owl", OWL)
    g.bind("rdf", RDF)
    g.bind("rdfs", RDFS)
    g.bind("xsd", XSD)
    g.bind("skos", SKOS)
    g.bind("dcterms", DCTERMS)
    g.bind("prov", PROV)
    g.bind("time", TIME)
    g.bind("foaf", FOAF)
    g.bind("odrl", ODRL)
    g.bind("obo", OBO)


def bind_shacl_prefix(g: Graph) -> None:
    """Bind SHACL prefix."""
    g.bind("sh", SH)


def load_glossary() -> list[dict[str, str]]:
    """Load glossary.csv and return rows as dicts."""
    path = DOCS / "glossary.csv"
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [row for row in reader if row.get("term")]


def load_yaml(name: str) -> dict[str, Any]:
    """Load a YAML file from the project docs/ directory."""
    path = DOCS / name
    with path.open(encoding="utf-8") as f:
        result: dict[str, Any] = yaml.safe_load(f)
    return result


def to_label(term: str) -> str:
    """Convert CamelCase term to lowercase label with spaces."""
    result: list[str] = []
    for i, ch in enumerate(term):
        if ch.isupper() and i > 0:
            prev = term[i - 1]
            if prev.islower() or (prev.isupper() and i + 1 < len(term) and term[i + 1].islower()):
                result.append(" ")
        result.append(ch.lower())
    return "".join(result)


# ---------------------------------------------------------------------------
# OWL Axiom Helpers
# ---------------------------------------------------------------------------


def _add_existential(g: Graph, cls: URIRef, prop: URIRef, filler: URIRef) -> None:
    """Add: cls SubClassOf prop some filler."""
    r = BNode()
    g.add((r, RDF.type, OWL.Restriction))
    g.add((r, OWL.onProperty, prop))
    g.add((r, OWL.someValuesFrom, filler))
    g.add((cls, RDFS.subClassOf, r))


def _add_universal(g: Graph, cls: URIRef, prop: URIRef, filler: URIRef) -> None:
    """Add: cls SubClassOf prop only filler."""
    r = BNode()
    g.add((r, RDF.type, OWL.Restriction))
    g.add((r, OWL.onProperty, prop))
    g.add((r, OWL.allValuesFrom, filler))
    g.add((cls, RDFS.subClassOf, r))


def _add_qualified_cardinality(
    g: Graph,
    cls: URIRef,
    prop: URIRef,
    filler: URIRef,
    n: int,
    *,
    kind: str = "exact",
) -> None:
    """Add qualified cardinality restriction.

    kind: 'exact', 'min', or 'max'
    """
    r = BNode()
    g.add((r, RDF.type, OWL.Restriction))
    g.add((r, OWL.onProperty, prop))
    g.add((r, OWL.onClass, filler))
    pred_map = {
        "exact": OWL.qualifiedCardinality,
        "min": OWL.minQualifiedCardinality,
        "max": OWL.maxQualifiedCardinality,
    }
    g.add((r, pred_map[kind], Literal(n, datatype=XSD.nonNegativeInteger)))
    g.add((cls, RDFS.subClassOf, r))


def _add_data_exact_cardinality(
    g: Graph, cls: URIRef, prop: URIRef, datatype: URIRef, n: int
) -> None:
    """Add qualified cardinality on a data property."""
    r = BNode()
    g.add((r, RDF.type, OWL.Restriction))
    g.add((r, OWL.onProperty, prop))
    g.add((r, OWL.onDataRange, datatype))
    g.add((r, OWL.qualifiedCardinality, Literal(n, datatype=XSD.nonNegativeInteger)))
    g.add((cls, RDFS.subClassOf, r))


def _add_enumeration(g: Graph, cls: URIRef, individuals: list[URIRef]) -> None:
    """Add: cls EquivalentTo owl:oneOf(individuals)."""
    list_node = BNode()
    items: list[Node] = list(individuals)
    Collection(g, list_node, items)
    anon_cls = BNode()
    g.add((anon_cls, OWL.oneOf, list_node))
    g.add((cls, OWL.equivalentClass, anon_cls))


def _add_disjoint_union(g: Graph, parent: URIRef, children: list[URIRef]) -> None:
    """Add: parent DisjointUnionOf children."""
    list_node = BNode()
    items: list[Node] = list(children)
    Collection(g, list_node, items)
    g.add((parent, OWL.disjointUnionOf, list_node))


def _add_all_disjoint_classes(g: Graph, classes: list[URIRef]) -> None:
    """Add AllDisjointClasses axiom."""
    node = BNode()
    g.add((node, RDF.type, OWL.AllDisjointClasses))
    list_node = BNode()
    items: list[Node] = list(classes)
    Collection(g, list_node, items)
    g.add((node, OWL.members, list_node))


def _add_all_different(g: Graph, individuals: list[URIRef]) -> None:
    """Add AllDifferent axiom for named individuals."""
    node = BNode()
    g.add((node, RDF.type, OWL.AllDifferent))
    list_node = BNode()
    items: list[Node] = list(individuals)
    Collection(g, list_node, items)
    g.add((node, OWL.distinctMembers, list_node))


def _add_inverse_pair(g: Graph, prop1: URIRef, prop2: URIRef) -> None:
    """Declare prop1 owl:inverseOf prop2."""
    g.add((prop1, OWL.inverseOf, prop2))


# ---------------------------------------------------------------------------
# TBox Builder
# ---------------------------------------------------------------------------


def build_tbox(glossary: list[dict[str, str]]) -> Graph:
    """Build the TBox graph with classes, properties, and axioms."""
    g = Graph()
    bind_common_prefixes(g)

    # --- Ontology header ---
    g.add((TBOX_IRI, RDF.type, OWL.Ontology))
    g.add((TBOX_IRI, OWL.versionIRI, TBOX_VERSION_IRI))
    g.add((TBOX_IRI, OWL.imports, REF_IRI))
    g.add((TBOX_IRI, OWL.imports, PROV_DECL_IRI))
    g.add((TBOX_IRI, OWL.imports, TIME_DECL_IRI))
    g.add((TBOX_IRI, OWL.imports, FOAF_DECL_IRI))
    g.add((TBOX_IRI, OWL.imports, ODRL_DECL_IRI))
    g.add((TBOX_IRI, OWL.imports, BFO_DECL_IRI))
    g.add((TBOX_IRI, DCTERMS.title, Literal("Personal Agent Ontology", lang="en")))
    g.add(
        (
            TBOX_IRI,
            DCTERMS.description,
            Literal(
                "An OWL 2 DL ontology modeling AI agent architecture including "
                "conversations, memory systems, goals, plans, and governance.",
                lang="en",
            ),
        )
    )
    g.add((TBOX_IRI, OWL.versionInfo, Literal("0.8.0")))
    g.add((TBOX_IRI, OWL.priorVersion, URIRef("https://purl.org/pao/0.7.0")))
    g.add((TBOX_IRI, DCTERMS.created, Literal("2026-02-21")))
    g.add((TBOX_IRI, DCTERMS.creator, Literal("ontology-architect skill")))
    g.add((TBOX_IRI, DCTERMS.license, URIRef("https://spdx.org/licenses/MIT")))
    g.add((TBOX_IRI, DCTERMS.rights, Literal("MIT License")))
    g.add(
        (
            TBOX_IRI,
            PROV.generatedAtTime,
            Literal("2026-02-21T00:00:00Z", datatype=XSD.dateTime),
        )
    )

    # Build glossary lookup
    class_glossary = {row["term"]: row for row in glossary if row["category"] == "class"}

    # --- Declare all 56 classes ---
    _add_classes(g, class_glossary)

    # --- Declare all properties ---
    _add_object_properties(g)
    _add_data_properties(g)

    # --- Property hierarchy ---
    _add_property_hierarchy(g)

    # --- Inverse pairs ---
    _add_inverse_pairs(g)

    # --- Existential restrictions ---
    _add_existential_restrictions(g)

    # --- Universal restrictions ---
    _add_universal_restrictions(g)

    # --- Qualified cardinality restrictions ---
    _add_cardinality_restrictions(g)

    # --- DisjointUnion axioms ---
    _add_disjoint_unions(g)

    # --- AllDisjointClasses axioms ---
    _add_disjointness_axioms(g)

    # --- HasKey identity contracts ---
    _add_has_key_axioms(g)

    # --- Add IAO_0000115 aliases for OBO tool compatibility ---
    _add_iao_definitions(g)

    return g


def _add_classes(g: Graph, class_glossary: dict[str, dict[str, str]]) -> None:
    """Declare all 115 PAO classes with labels, definitions, and subclass axioms."""
    # Class hierarchy: (class_name, parent_uri, bfo_uri_or_none)
    class_defs: list[tuple[str, URIRef | None, URIRef | None]] = [
        # pao-core
        ("Agent", PROV.Agent, None),  # cross-cuts BFO
        ("AIAgent", PAO.Agent, OBO.BFO_0000031),
        ("HumanUser", PAO.Agent, OBO.BFO_0000030),
        ("SubAgent", PAO.AIAgent, None),  # inherits GDC from AIAgent
        ("AgentRole", PROV.Role, OBO.BFO_0000023),
        ("Organization", PAO.Agent, OBO.BFO_0000030),
        ("Persona", PROV.Entity, OBO.BFO_0000031),
        # pao-event
        ("Event", PROV.Activity, OBO.BFO_0000015),
        ("Action", PAO.Event, None),
        ("Status", PROV.Entity, OBO.BFO_0000031),  # Value partition — GDC
        ("SessionStatus", PAO.Status, None),
        ("TaskStatus", PAO.Status, None),
        ("ComplianceStatus", PAO.Status, None),
        ("ItemFate", PAO.Status, None),  # Value Partition
        # pao-conversation
        ("Conversation", PAO.Event, None),
        ("Session", PAO.Event, None),
        ("Turn", PAO.Event, None),
        ("Message", PROV.Entity, OBO.BFO_0000031),
        ("ToolDefinition", PROV.Entity, OBO.BFO_0000031),
        ("ToolInvocation", PAO.Action, None),
        ("CompactionEvent", PAO.Event, None),
        ("CompactionDisposition", PROV.Entity, OBO.BFO_0000031),
        ("Observation", PAO.Event, None),  # inherits Process from Event
        ("StatusTransition", PAO.Event, None),  # inherits Process from Event
        ("SessionStatusTransition", PAO.StatusTransition, None),
        ("TaskStatusTransition", PAO.StatusTransition, None),
        # pao-memory
        ("MemoryItem", PROV.Entity, OBO.BFO_0000031),
        ("MemoryTier", PROV.Entity, OBO.BFO_0000031),
        ("WorkingMemory", PAO.MemoryTier, None),
        ("EpisodicMemory", PAO.MemoryTier, None),
        ("SemanticMemory", PAO.MemoryTier, None),
        ("ProceduralMemory", PAO.MemoryTier, None),
        ("Episode", PAO.MemoryItem, None),
        ("Claim", PAO.MemoryItem, None),
        ("MemoryOperation", PAO.Event, None),
        ("Encoding", PAO.MemoryOperation, None),
        ("Retrieval", PAO.MemoryOperation, None),
        ("Consolidation", PAO.MemoryOperation, None),
        ("Forgetting", PAO.MemoryOperation, None),
        ("Rehearsal", PAO.MemoryOperation, None),
        ("MemoryBlock", PAO.MemoryItem, None),
        # pao-planning
        ("Goal", PROV.Entity, OBO.BFO_0000031),
        ("Plan", PROV.Plan, None),  # prov:Plan is subclass of prov:Entity
        ("Task", PROV.Entity, OBO.BFO_0000031),
        ("Intention", PROV.Entity, OBO.BFO_0000031),
        # pao-governance
        ("PermissionPolicy", ODRL.Policy, OBO.BFO_0000031),
        ("SafetyConstraint", PROV.Entity, OBO.BFO_0000031),
        ("ErasureEvent", PAO.Event, None),
        ("SensitivityLevel", PAO.Status, None),  # Value Partition
        ("ConsentRecord", PROV.Entity, OBO.BFO_0000031),
        ("RetentionPolicy", PROV.Entity, OBO.BFO_0000031),
        # pao-conversation (v0.4.0)
        ("ContextWindow", PROV.Entity, OBO.BFO_0000031),
        # pao-conversation (v0.5.0)
        ("CommunicationChannel", PROV.Entity, OBO.BFO_0000031),
        ("ChannelType", PAO.Status, None),  # Value Partition
        # pao-core (v0.5.0)
        ("Integration", PROV.Entity, OBO.BFO_0000031),
        ("IntegrationStatus", PAO.Status, None),  # Value Partition
        # pao-services (v0.6.0)
        ("ExternalService", PROV.Entity, OBO.BFO_0000031),
        ("ServiceConnection", PROV.Entity, OBO.BFO_0000031),
        ("ServiceCapability", PROV.Entity, OBO.BFO_0000031),
        ("ServiceToolCapability", PAO.ServiceCapability, None),
        ("ServiceResourceCapability", PAO.ServiceCapability, None),
        ("ServicePromptCapability", PAO.ServiceCapability, None),
        ("CapabilityDiscoveryEvent", PAO.Event, None),  # inherits Process
        ("ConnectionStatus", PAO.Status, None),  # Value Partition
        # pao-governance (v0.6.0)
        ("SandboxPolicy", PROV.Entity, OBO.BFO_0000031),
        ("Hook", PROV.Entity, OBO.BFO_0000031),
        ("HookExecution", PAO.Event, None),  # inherits Process
        ("AuditLog", PROV.Entity, OBO.BFO_0000031),
        ("AuditEntry", PROV.Entity, OBO.BFO_0000031),
        ("PermissionMode", PAO.Status, None),  # Value Partition
        ("AuthorizationDecision", PAO.Status, None),  # Value Partition
        ("CheckpointDecision", PAO.Status, None),  # Value Partition
        # pao-recovery (v0.6.0)
        ("ErrorRecoveryEvent", PAO.Event, None),  # inherits Process
        ("RetryAttempt", PAO.Event, None),  # inherits Process
        ("ReplanEvent", PAO.Event, None),  # inherits Process
        ("RollbackEvent", PAO.Event, None),  # inherits Process
        ("Checkpoint", PROV.Entity, OBO.BFO_0000031),
        # pao-conversation (v0.6.0 Phase B: Tool/Message Trace)
        ("ToolResult", PROV.Entity, OBO.BFO_0000031),
        ("ToolInvocationGroup", PROV.Entity, OBO.BFO_0000031),
        ("ContentBlock", PROV.Entity, OBO.BFO_0000031),
        ("ContentBlockType", PAO.Status, None),  # Value Partition
        # pao-memory (v0.6.0 Phase B: Memory Control Plane)
        ("MemorySource", PAO.Status, None),  # Value Partition
        ("MemoryScope", PAO.Status, None),  # Value Partition
        ("SharedMemoryArtifact", PROV.Entity, OBO.BFO_0000031),
        ("MemoryWriteConflict", PAO.Event, None),  # inherits Process
        # pao-conversation (v0.6.0 Phase B: Dialog Pragmatics)
        ("DialogAct", PROV.Entity, OBO.BFO_0000031),
        ("CommunicativeFunction", PAO.Status, None),  # Value Partition
        ("CommonGround", PROV.Entity, OBO.BFO_0000031),
        ("GroundingAct", PAO.Event, None),  # inherits Process
        ("ClarificationRequest", PROV.Entity, OBO.BFO_0000031),
        ("AcceptanceEvidence", PROV.Entity, OBO.BFO_0000031),
        # pao-memory (v0.6.0 review: claimType migration)
        ("ClaimType", PAO.Status, None),  # Value Partition
        # pao-model (v0.7.0)
        ("ModelProvider", PROV.Entity, OBO.BFO_0000031),
        ("FoundationModel", PROV.Entity, OBO.BFO_0000031),
        ("ModelDeployment", PROV.Entity, OBO.BFO_0000031),
        ("ModelInvocation", PAO.Event, None),  # inherits Process via Event
        ("GenerationConfiguration", PROV.Entity, OBO.BFO_0000031),
        # pao-observability (v0.7.0)
        ("OperationalMetric", PROV.Entity, OBO.BFO_0000031),
        ("MetricObservation", PROV.Entity, OBO.BFO_0000031),
        ("ReliabilityIncident", PAO.Event, None),  # inherits Process via Event
        # pao-recovery (v0.7.0)
        ("FailureType", PAO.Status, None),  # Value Partition
        # pao-planning (v0.7.0)
        ("Belief", PROV.Entity, OBO.BFO_0000031),
        ("Desire", PROV.Entity, OBO.BFO_0000031),
        ("Justification", PROV.Entity, OBO.BFO_0000031),
        ("Deliberation", PAO.Event, None),  # inherits Process via Event
        # pao-scheduling (v0.8.0)
        ("Schedule", PROV.Entity, OBO.BFO_0000031),
        ("RecurrencePattern", PROV.Entity, OBO.BFO_0000031),
        ("Trigger", PROV.Entity, OBO.BFO_0000031),
        ("CronTrigger", PAO.Trigger, None),  # inherits GDC from Trigger
        ("IntervalTrigger", PAO.Trigger, None),  # inherits GDC from Trigger
        ("EventTrigger", PAO.Trigger, None),  # inherits GDC from Trigger
        ("ScheduledExecution", PAO.Event, None),  # inherits Process via Event
        ("ScheduleStatus", PAO.Status, None),  # Value Partition
        ("ExecutionOutcome", PAO.Status, None),  # Value Partition
        ("ConcurrencyPolicy", PAO.Status, None),  # Value Partition
    ]

    # Additional parent axioms (multiple inheritance)
    additional_parents: dict[str, list[URIRef]] = {
        "AIAgent": [PROV.SoftwareAgent],
        "HumanUser": [PROV.Person, FOAF.Person],
    }

    for cls_name, parent, bfo in class_defs:
        cls_uri = PAO[cls_name]
        g.add((cls_uri, RDF.type, OWL.Class))
        g.add((cls_uri, RDFS.label, Literal(to_label(cls_name), lang="en")))

        if cls_name in class_glossary:
            defn = class_glossary[cls_name]["definition"]
            g.add((cls_uri, SKOS.definition, Literal(defn, lang="en")))

        if parent is not None:
            g.add((cls_uri, RDFS.subClassOf, parent))

        if bfo is not None:
            g.add((cls_uri, RDFS.subClassOf, bfo))

        for extra_parent in additional_parents.get(cls_name, []):
            g.add((cls_uri, RDFS.subClassOf, extra_parent))


def _add_object_properties(g: Graph) -> None:
    """Declare all 138 object properties."""
    # Each tuple: (name, domain, range, characteristics, definition)
    obj_props: list[tuple[str, URIRef | None, URIRef | None, list[str], str]] = [
        # pao-core: generic part-whole
        (
            "partOf",
            OWL.Thing,
            OWL.Thing,
            ["transitive"],
            "A transitive relation linking an entity to a whole it is part of.",
        ),
        (
            "hasPart",
            OWL.Thing,
            OWL.Thing,
            ["transitive"],
            "A transitive relation linking a whole to one of its parts.",
        ),
        # pao-core: identity & actors
        (
            "hasAvailableTool",
            PAO.Agent,
            PAO.ToolDefinition,
            [],
            "Links an agent to a tool definition available for invocation.",
        ),
        (
            "availableToAgent",
            PAO.ToolDefinition,
            PAO.Agent,
            [],
            "Links a tool definition to an agent that may invoke it.",
        ),
        (
            "spawnedBy",
            PAO.Agent,
            PAO.Agent,
            ["functional"],
            "Links a sub-agent to the parent agent that spawned it.",
        ),
        (
            "hasParticipant",
            PAO.Event,
            PAO.Agent,
            [],
            "Links an event to an agent that participates in it.",
        ),
        (
            "participatesIn",
            PAO.Agent,
            PAO.Event,
            [],
            "Links an agent to an event it participates in.",
        ),
        (
            "hasRole",
            PAO.Agent,
            PAO.AgentRole,
            [],
            "Links an agent to a role it bears in some context.",
        ),
        (
            "performedBy",
            PAO.Action,
            PAO.Agent,
            ["functional"],
            "Links an action to the agent that intentionally performed it.",
        ),
        # pao-event
        (
            "hasTemporalExtent",
            None,
            TIME.TemporalEntity,
            ["functional"],
            "Links an event to its temporal extent.",
        ),
        (
            "hasStatus",
            OWL.Thing,
            PAO.Status,
            ["functional"],
            "Links an entity to its current status value.",
        ),
        # pao-conversation
        (
            "partOfConversation",
            PAO.Event,
            PAO.Conversation,
            ["functional"],
            "Links a session to the conversation it is a temporal part of.",
        ),
        (
            "inConversation",
            PAO.Event,
            PAO.Conversation,
            ["functional"],
            "Links an event to its containing conversation.",
        ),
        (
            "partOfSession",
            PAO.Event,
            PAO.Session,
            ["functional"],
            "Links a turn to the session it is a temporal part of.",
        ),
        (
            "inSession",
            PAO.Event,
            PAO.Session,
            ["functional"],
            "Links an event to its containing session.",
        ),
        (
            "invokesTool",
            PAO.ToolInvocation,
            PAO.ToolDefinition,
            ["functional"],
            "Links a tool invocation to the tool definition invoked.",
        ),
        (
            "invokedIn",
            PAO.ToolDefinition,
            PAO.ToolInvocation,
            [],
            "Links a tool definition to invocations in which it was used.",
        ),
        (
            "invokedBy",
            PAO.ToolInvocation,
            PAO.Agent,
            ["functional"],
            "Links a tool invocation to the agent that initiated it.",
        ),
        (
            "hasInput",
            PAO.ToolInvocation,
            PROV.Entity,
            [],
            "Links a tool invocation to the input data provided.",
        ),
        (
            "hasOutput",
            PAO.ToolInvocation,
            PROV.Entity,
            [],
            "Links a tool invocation to the output data returned.",
        ),
        (
            "producedSummary",
            PAO.CompactionEvent,
            PAO.MemoryItem,
            ["functional"],
            "Links a compaction event to the summary it generated.",
        ),
        (
            "delegatedTask",
            PAO.Agent,
            PAO.Task,
            [],
            "Links a sub-agent to the task it was spawned to perform.",
        ),
        # pao-memory
        (
            "storedIn",
            None,
            PAO.MemoryTier,
            [],
            "Links a memory item to the memory tier where it is stored.",
        ),
        (
            "stores",
            PAO.MemoryTier,
            PAO.MemoryItem,
            [],
            "Links a memory tier to a memory item it currently holds.",
        ),
        (
            "hasTopic",
            PAO.MemoryItem,
            SKOS.Concept,
            [],
            "Links a memory item to a topic concept describing its subject.",
        ),
        (
            "aboutAgent",
            PAO.MemoryItem,
            PAO.Agent,
            [],
            "Links a memory item to the agent it describes.",
        ),
        (
            "hasEvidence",
            PAO.Claim,
            PROV.Entity,
            [],
            "Links a claim to the evidence entities that support it.",
        ),
        (
            "recordedInEpisode",
            PAO.Event,
            PAO.Episode,
            [],
            "Links an event to the episode that records it.",
        ),
        ("recordsEvent", PAO.Episode, PAO.Event, [], "Links an episode to an event it records."),
        (
            "operatesOn",
            PAO.MemoryOperation,
            PAO.MemoryItem,
            [],
            "Links a memory operation to the memory item it acts upon.",
        ),
        # pao-planning
        (
            "pursuedBy",
            PAO.Goal,
            PAO.Agent,
            [],
            "Links a goal to the agent that is actively pursuing it.",
        ),
        (
            "pursuesGoal",
            PAO.Agent,
            PAO.Goal,
            [],
            "Links an agent to a goal it is actively pursuing.",
        ),
        (
            "achievesGoal",
            PAO.Plan,
            PAO.Goal,
            [],
            "Links a plan to the goal it is designed to achieve.",
        ),
        (
            "partOfPlan",
            PAO.Task,
            PAO.Plan,
            ["functional"],
            "Links a task to the plan it belongs to as a component.",
        ),
        (
            "hasTask",
            PAO.Plan,
            PAO.Task,
            [],
            "Links a plan to a task that is one of its component steps.",
        ),
        (
            "blockedBy",
            PAO.Task,
            PAO.Task,
            [],
            "Links a task to another task that must complete before it can proceed.",
        ),
        (
            "blocks",
            PAO.Task,
            PAO.Task,
            [],
            "Links a task to another task that depends on its completion.",
        ),
        # pao-governance
        (
            "appliesTo",
            PROV.Entity,
            PAO.Agent,
            [],
            "Links a policy or constraint to the agent it governs.",
        ),
        (
            "grantsPermission",
            PAO.PermissionPolicy,
            ODRL.Permission,
            [],
            "Links a permission policy to the specific permission it grants.",
        ),
        (
            "hasComplianceStatus",
            PAO.ToolInvocation,
            PAO.ComplianceStatus,
            ["functional"],
            "Links a tool invocation to its compliance status.",
        ),
        (
            "governedByPolicy",
            PAO.ToolInvocation,
            PAO.PermissionPolicy,
            [],
            "Links a tool invocation to the permission policy that governed it.",
        ),
        (
            "restrictsToolUse",
            PAO.PermissionPolicy,
            PAO.ToolDefinition,
            [],
            "Links a permission policy to a tool whose use it restricts.",
        ),
        (
            "requestedBy",
            PAO.ErasureEvent,
            PAO.Agent,
            ["functional"],
            "Links an erasure event to the agent who requested deletion.",
        ),
        # v0.2.0: Identity additions
        (
            "belongsTo",
            PAO.Agent,
            PAO.Organization,
            ["functional"],
            "Links an agent to the organization it belongs to.",
        ),
        (
            "hasMember",
            PAO.Organization,
            PAO.Agent,
            [],
            "Links an organization to its member agents.",
        ),
        (
            "hasPersona",
            PAO.AIAgent,
            PAO.Persona,
            ["functional"],
            "Links an AI agent to its configured persona.",
        ),
        # v0.2.0: Planning additions
        (
            "intendedBy",
            PAO.Intention,
            PAO.Agent,
            [],
            "Links an intention to the agent that holds it.",
        ),
        (
            "derivedFromGoal",
            PAO.Intention,
            PAO.Goal,
            [],
            "Links an intention to the goal it was derived from.",
        ),
        # v0.2.0: Governance additions
        (
            "consentSubject",
            PAO.ConsentRecord,
            PAO.Agent,
            ["functional"],
            "Links a consent record to the data subject agent.",
        ),
        (
            "consentPurpose",
            PAO.ConsentRecord,
            PROV.Entity,
            [],
            "Links a consent record to the entity describing the purpose.",
        ),
        (
            "governedByRetention",
            PAO.MemoryItem,
            PAO.RetentionPolicy,
            [],
            "Links a memory item to the retention policy that governs it.",
        ),
        # v0.2.0: hasSensitivityLevel migrated from DataProperty
        (
            "hasSensitivityLevel",
            PAO.MemoryItem,
            PAO.SensitivityLevel,
            ["functional"],
            "Links a memory item to its privacy sensitivity classification.",
        ),
        # v0.3.0: Compaction trace
        (
            "compactedItem",
            PAO.CompactionEvent,
            PROV.Entity,
            [],
            "Links a compaction event to an item that was in scope for compaction.",
        ),
        (
            "hasCompactionDisposition",
            PAO.CompactionEvent,
            PAO.CompactionDisposition,
            [],
            "Links a compaction event to a disposition record for one of its items.",
        ),
        (
            "dispositionOf",
            PAO.CompactionDisposition,
            PROV.Entity,
            ["functional"],
            "Links a compaction disposition to the item it describes.",
        ),
        (
            "hasItemFate",
            PAO.CompactionDisposition,
            PAO.ItemFate,
            ["functional"],
            "Links a compaction disposition to the fate of the item.",
        ),
        # v0.3.0: Cross-session resume
        (
            "continuedFrom",
            PAO.Session,
            PAO.Session,
            ["functional"],
            "Links a session to the prior session it continues.",
        ),
        (
            "continuedBy",
            PAO.Session,
            PAO.Session,
            [],
            "Links a session to a subsequent session that continues its work.",
        ),
        # v0.3.0: Lifecycle transitions
        (
            "fromStatus",
            PAO.StatusTransition,
            PAO.Status,
            ["functional"],
            "The status value before the transition.",
        ),
        (
            "toStatus",
            PAO.StatusTransition,
            PAO.Status,
            ["functional"],
            "The status value after the transition.",
        ),
        (
            "transitionSubject",
            PAO.StatusTransition,
            OWL.Thing,
            ["functional"],
            "The entity whose status changed in this transition.",
        ),
        (
            "triggeredBy",
            PAO.StatusTransition,
            PAO.Event,
            [],
            "The event that caused this status transition.",
        ),
        (
            "previousTransition",
            PAO.StatusTransition,
            PAO.StatusTransition,
            ["functional"],
            "Links to the preceding status transition for the same subject.",
        ),
        (
            "nextTransition",
            PAO.StatusTransition,
            PAO.StatusTransition,
            ["functional"],
            "Links to the following status transition for the same subject.",
        ),
        # v0.4.0: Context Window
        (
            "hasContextWindow",
            PAO.Session,
            PAO.ContextWindow,
            ["functional"],
            "Links a session to its context window resource.",
        ),
        (
            "compactedContextOf",
            PAO.CompactionEvent,
            PAO.ContextWindow,
            ["functional"],
            "Links a compaction event to the context window that triggered it.",
        ),
        # v0.5.0: Communication Channels
        (
            "viaChannel",
            PAO.Session,
            PAO.CommunicationChannel,
            ["functional"],
            "Links a session to the communication channel it uses.",
        ),
        (
            "hasChannelType",
            PAO.CommunicationChannel,
            PAO.ChannelType,
            ["functional"],
            "Links a communication channel to its type classification.",
        ),
        (
            "sentViaChannel",
            PAO.Message,
            PAO.CommunicationChannel,
            ["functional"],
            "Links a message to the communication channel it was sent through.",
        ),
        # v0.5.0: Integrations
        (
            "hasIntegration",
            PAO.Agent,
            PAO.Integration,
            [],
            "Links an agent to an integration it has configured.",
        ),
        (
            "providesTool",
            PAO.Integration,
            PAO.ToolDefinition,
            [],
            "Links an integration to a tool definition it provides.",
        ),
        (
            "hasIntegrationStatus",
            PAO.Integration,
            PAO.IntegrationStatus,
            ["functional"],
            "Links an integration to its current operational status.",
        ),
        # v0.6.0: External Service Capability
        (
            "hasExternalService",
            PAO.Agent,
            PAO.ExternalService,
            [],
            "Links an agent to an external service it is configured to access.",
        ),
        (
            "hasServiceConnection",
            PAO.Agent,
            PAO.ServiceConnection,
            [],
            "Links an agent to a runtime connection to an external service.",
        ),
        (
            "connectsToService",
            PAO.ServiceConnection,
            PAO.ExternalService,
            ["functional"],
            "Links a service connection to the external service it connects to.",
        ),
        (
            "hasConnectionStatus",
            PAO.ServiceConnection,
            PAO.ConnectionStatus,
            ["functional"],
            "Links a service connection to its runtime status.",
        ),
        (
            "exposesCapability",
            PAO.ExternalService,
            PAO.ServiceCapability,
            [],
            "Links an external service to a capability it exposes.",
        ),
        (
            "discoveredCapability",
            PAO.CapabilityDiscoveryEvent,
            PAO.ServiceCapability,
            [],
            "Links a capability discovery event to a capability it discovered.",
        ),
        (
            "discoveryAgainstService",
            PAO.CapabilityDiscoveryEvent,
            PAO.ExternalService,
            ["functional"],
            "Links a capability discovery event to the service it queried.",
        ),
        # v0.6.0: Runtime Safety Control Plane
        (
            "operatesInMode",
            PAO.AIAgent,
            PAO.PermissionMode,
            ["functional"],
            "Links an AI agent to the permission mode it currently operates under.",
        ),
        (
            "enforcedBySandboxPolicy",
            PAO.AIAgent,
            PAO.SandboxPolicy,
            ["functional"],
            "Links an AI agent to the sandbox policy that constrains its execution.",
        ),
        (
            "hasHook",
            PAO.AIAgent,
            PAO.Hook,
            [],
            "Links an AI agent to a hook configured for tool invocation interception.",
        ),
        (
            "hookTriggeredExecution",
            PAO.Hook,
            PAO.HookExecution,
            [],
            "Links a hook to an execution instance it triggered.",
        ),
        (
            "interceptsInvocation",
            PAO.HookExecution,
            PAO.ToolInvocation,
            ["functional"],
            "Links a hook execution to the tool invocation it intercepted.",
        ),
        (
            "writtenToAuditLog",
            PAO.AuditEntry,
            PAO.AuditLog,
            ["functional"],
            "Links an audit entry to the audit log it belongs to.",
        ),
        (
            "recordsDecision",
            PAO.AuditEntry,
            PAO.AuthorizationDecision,
            ["functional"],
            "Links an audit entry to the authorization decision it records.",
        ),
        (
            "auditForInvocation",
            PAO.AuditEntry,
            PAO.ToolInvocation,
            ["functional"],
            "Links an audit entry to the tool invocation it documents.",
        ),
        # v0.6.0: Recovery and Resilience
        (
            "recoveringFrom",
            PAO.ErrorRecoveryEvent,
            PAO.ToolInvocation,
            ["functional"],
            "Links an error recovery event to the failed tool invocation that triggered it.",
        ),
        (
            "attemptedRetry",
            PAO.ErrorRecoveryEvent,
            PAO.RetryAttempt,
            [],
            "Links an error recovery event to a retry attempt it initiated.",
        ),
        (
            "triggeredReplan",
            PAO.ErrorRecoveryEvent,
            PAO.ReplanEvent,
            ["functional"],
            "Links an error recovery event to the replan event it triggered.",
        ),
        (
            "triggeredRollback",
            PAO.ErrorRecoveryEvent,
            PAO.RollbackEvent,
            ["functional"],
            "Links an error recovery event to the rollback event it triggered.",
        ),
        (
            "checkpointForTask",
            PAO.Checkpoint,
            PAO.Task,
            ["functional"],
            "Links a checkpoint to the task it gates.",
        ),
        (
            "checkpointDecision",
            PAO.Checkpoint,
            PAO.CheckpointDecision,
            ["functional"],
            "Links a checkpoint to the human decision recorded for it.",
        ),
        # v0.6.0 review: claimType migration (string → controlled vocab)
        (
            "claimType",
            PAO.Claim,
            PAO.ClaimType,
            ["functional"],
            "Links a claim to its type classifier.",
        ),
        # v0.6.0 Phase B: Tool/Message Trace Richness
        (
            "partOfInvocationGroup",
            PAO.ToolInvocation,
            PAO.ToolInvocationGroup,
            [],
            "Links a tool invocation to the parallel invocation group it belongs to.",
        ),
        (
            "groupedInTurn",
            PAO.ToolInvocationGroup,
            PAO.Turn,
            ["functional"],
            "Links an invocation group to the turn in which it was executed.",
        ),
        (
            "producedToolResult",
            PAO.ToolInvocation,
            PAO.ToolResult,
            ["functional"],
            "Links a tool invocation to the result artifact it produced.",
        ),
        (
            "hasContentBlock",
            PAO.Message,
            PAO.ContentBlock,
            [],
            "Links a message to one of its typed content blocks.",
        ),
        (
            "hasContentBlockType",
            PAO.ContentBlock,
            PAO.ContentBlockType,
            ["functional"],
            "Links a content block to its type classification.",
        ),
        # v0.6.0 Phase B: Memory Control Plane and Sharing
        (
            "hasMemorySource",
            PAO.MemoryItem,
            PAO.MemorySource,
            ["functional"],
            "Links a memory item to its origination source.",
        ),
        (
            "hasMemoryScope",
            PAO.MemoryItem,
            PAO.MemoryScope,
            ["functional"],
            "Links a memory item to its visibility scope.",
        ),
        (
            "sharedAcrossAgents",
            PAO.SharedMemoryArtifact,
            PAO.Agent,
            [],
            "Links a shared memory artifact to an agent that has access to it.",
        ),
        (
            "writesByAgent",
            PAO.MemoryWriteConflict,
            PAO.Agent,
            [],
            "Links a memory write conflict to an agent involved in the concurrent write.",
        ),
        (
            "conflictOnArtifact",
            PAO.MemoryWriteConflict,
            PAO.SharedMemoryArtifact,
            ["functional"],
            "Links a memory write conflict to the shared artifact in contention.",
        ),
        (
            "resolvedByPolicy",
            PAO.MemoryWriteConflict,
            PAO.PermissionPolicy,
            [],
            "Links a memory write conflict to the policy that resolved it.",
        ),
        # v0.6.0 Phase B: Dialog Pragmatics and Grounding
        (
            "hasDialogAct",
            PAO.Turn,
            PAO.DialogAct,
            [],
            "Links a turn to a dialog act it performs.",
        ),
        (
            "hasCommunicativeFunction",
            PAO.DialogAct,
            PAO.CommunicativeFunction,
            ["functional"],
            "Links a dialog act to its communicative function classification.",
        ),
        (
            "contributesToCommonGround",
            PAO.GroundingAct,
            PAO.CommonGround,
            ["functional"],
            "Links a grounding act to the common ground it updates.",
        ),
        (
            "providesAcceptanceEvidence",
            PAO.GroundingAct,
            PAO.AcceptanceEvidence,
            [],
            "Links a grounding act to evidence of acceptance or understanding.",
        ),
        (
            "clarifiesTurn",
            PAO.ClarificationRequest,
            PAO.Turn,
            ["functional"],
            "Links a clarification request to the turn it seeks to clarify.",
        ),
        # pao-model (v0.7.0)
        (
            "hasProvider",
            PAO.FoundationModel,
            PAO.ModelProvider,
            ["functional"],
            "Links a foundation model to its hosting provider.",
        ),
        (
            "usesModel",
            PAO.AIAgent,
            PAO.FoundationModel,
            [],
            "Links an AI agent to a foundation model it uses.",
        ),
        (
            "deployedAs",
            PAO.FoundationModel,
            PAO.ModelDeployment,
            [],
            "Links a foundation model to one of its deployments.",
        ),
        (
            "invokedOnDeployment",
            PAO.ModelInvocation,
            PAO.ModelDeployment,
            ["functional"],
            "Links a model invocation to the deployment it was executed on.",
        ),
        (
            "hasGenerationConfig",
            PAO.ModelInvocation,
            PAO.GenerationConfiguration,
            ["functional"],
            "Links a model invocation to its generation configuration.",
        ),
        (
            "modelInvocationForTurn",
            PAO.ModelInvocation,
            PAO.Turn,
            ["functional"],
            "Links a model invocation to the turn it produced output for.",
        ),
        (
            "producedByModelInvocation",
            PAO.Turn,
            PAO.ModelInvocation,
            [],
            "Links a turn to the model invocation that produced it.",
        ),
        # pao-observability (v0.7.0)
        (
            "observesMetric",
            PAO.MetricObservation,
            PAO.OperationalMetric,
            ["functional"],
            "Links a metric observation to the metric it measures.",
        ),
        (
            "observedOnEntity",
            PAO.MetricObservation,
            OWL.Thing,
            [],
            "Links a metric observation to the entity it was recorded on.",
        ),
        (
            "incidentForEntity",
            PAO.ReliabilityIncident,
            OWL.Thing,
            [],
            "Links a reliability incident to the entity it affects.",
        ),
        (
            "linkedToRecovery",
            PAO.ReliabilityIncident,
            PAO.ErrorRecoveryEvent,
            [],
            "Links a reliability incident to a recovery event that addressed it.",
        ),
        # pao-recovery (v0.7.0)
        (
            "hasFailureType",
            PAO.ErrorRecoveryEvent,
            PAO.FailureType,
            ["functional"],
            "Links an error recovery event to its classified failure type.",
        ),
        # pao-planning (v0.7.0)
        (
            "heldBelief",
            PAO.Agent,
            PAO.Belief,
            [],
            "Links an agent to a belief it holds.",
        ),
        (
            "holdsDesire",
            PAO.Agent,
            PAO.Desire,
            [],
            "Links an agent to a desire it has.",
        ),
        (
            "justifiesIntention",
            PAO.Justification,
            PAO.Intention,
            [],
            "Links a justification to the intention it supports.",
        ),
        (
            "producesIntention",
            PAO.Deliberation,
            PAO.Intention,
            [],
            "Links a deliberation process to an intention it produces.",
        ),
        (
            "considersBelief",
            PAO.Deliberation,
            PAO.Belief,
            [],
            "Links a deliberation to a belief it considers.",
        ),
        (
            "considersDesire",
            PAO.Deliberation,
            PAO.Desire,
            [],
            "Links a deliberation to a desire it considers.",
        ),
        # pao-scheduling (v0.8.0)
        (
            "hasRecurrencePattern",
            PAO.Schedule,
            PAO.RecurrencePattern,
            ["functional"],
            "Links a schedule to its recurrence pattern.",
        ),
        (
            "schedulesAction",
            PAO.Schedule,
            PAO.Action,
            ["functional"],
            "Links a schedule to the action it specifies for execution.",
        ),
        (
            "hasScheduleStatus",
            PAO.Schedule,
            PAO.ScheduleStatus,
            ["functional"],
            "Links a schedule to its current lifecycle status.",
        ),
        (
            "executionOf",
            PAO.ScheduledExecution,
            PAO.Schedule,
            ["functional"],
            "Links a scheduled execution to the schedule it instantiates.",
        ),
        (
            "hasExecutionOutcome",
            PAO.ScheduledExecution,
            PAO.ExecutionOutcome,
            ["functional"],
            "Links a scheduled execution to its outcome.",
        ),
        (
            "hasConcurrencyPolicy",
            PAO.Schedule,
            PAO.ConcurrencyPolicy,
            ["functional"],
            "Links a schedule to its concurrency policy.",
        ),
        (
            "activatedBy",
            PAO.Schedule,
            PAO.Trigger,
            ["functional"],
            "Links a schedule to the trigger that activates it.",
        ),
        (
            "servesGoal",
            PAO.Schedule,
            PAO.Goal,
            [],
            "Links a schedule to a goal it serves.",
        ),
        (
            "ownedByAgent",
            PAO.Schedule,
            PAO.Agent,
            ["functional"],
            "Links a schedule to the agent that owns it.",
        ),
        (
            "initiatedSession",
            PAO.ScheduledExecution,
            PAO.Session,
            [],
            "Links a scheduled execution to a session it initiated.",
        ),
    ]

    for name, domain, range_, chars, defn in obj_props:
        uri = PAO[name]
        g.add((uri, RDF.type, OWL.ObjectProperty))
        g.add((uri, RDFS.label, Literal(to_label(name), lang="en")))
        g.add((uri, SKOS.definition, Literal(defn, lang="en")))
        if domain is not None:
            g.add((uri, RDFS.domain, domain))
        if range_ is not None:
            g.add((uri, RDFS.range, range_))
        if "functional" in chars:
            g.add((uri, RDF.type, OWL.FunctionalProperty))
        if "transitive" in chars:
            g.add((uri, RDF.type, OWL.TransitiveProperty))


def _add_data_properties(g: Graph) -> None:
    """Declare all 35 data properties."""
    data_props: list[tuple[str, URIRef | None, URIRef, list[str], str]] = [
        (
            "hasTimestamp",
            None,
            XSD.dateTime,
            ["functional"],
            "A convenience timestamp for point-in-time events.",
        ),
        (
            "hasTurnIndex",
            PAO.Turn,
            XSD.nonNegativeInteger,
            ["functional"],
            "The zero-based ordinal position of a turn within its session.",
        ),
        (
            "hasContent",
            PROV.Entity,
            XSD.string,
            ["functional"],
            "The textual or structured content of an information artifact.",
        ),
        (
            "hasConfidence",
            PAO.Claim,
            XSD.decimal,
            ["functional"],
            "The confidence level of a claim, between 0.0 and 1.0.",
        ),
        # v0.2.0: Memory block properties
        (
            "hasBlockKey",
            PAO.MemoryBlock,
            XSD.string,
            [],
            "A key in a memory block's key-value store.",
        ),
        (
            "hasBlockValue",
            PAO.MemoryBlock,
            XSD.string,
            [],
            "A value in a memory block's key-value store.",
        ),
        # v0.2.0: Governance properties
        (
            "retentionPeriodDays",
            PAO.RetentionPolicy,
            XSD.nonNegativeInteger,
            ["functional"],
            "The number of days a memory item should be retained.",
        ),
        # v0.3.0: Compaction trace
        (
            "fateReason",
            PAO.CompactionDisposition,
            XSD.string,
            [],
            "A textual reason for the compaction disposition decision.",
        ),
        # v0.3.0: Eviction eligibility
        (
            "hasLastAccessTime",
            PAO.MemoryItem,
            XSD.dateTime,
            ["functional"],
            "The timestamp of the most recent access to this memory item.",
        ),
        (
            "isEvictionCandidate",
            PAO.MemoryItem,
            XSD.boolean,
            ["functional"],
            "Whether this memory item is eligible for eviction from its tier.",
        ),
        # v0.3.0: HasKey identity
        (
            "hasAgentId",
            PAO.AIAgent,
            XSD.string,
            ["functional"],
            "The unique string identifier for this AI agent.",
        ),
        (
            "hasSessionId",
            PAO.Session,
            XSD.string,
            ["functional"],
            "The unique string identifier for this session.",
        ),
        (
            "hasConversationId",
            PAO.Conversation,
            XSD.string,
            ["functional"],
            "The unique string identifier for this conversation.",
        ),
        # v0.4.0: Context Window
        (
            "hasTokenCapacity",
            PAO.ContextWindow,
            XSD.nonNegativeInteger,
            ["functional"],
            "The maximum number of tokens the context window can hold.",
        ),
        (
            "hasTokensUsed",
            PAO.ContextWindow,
            XSD.nonNegativeInteger,
            ["functional"],
            "The number of tokens currently used in the context window.",
        ),
        # v0.5.0: Integration metadata (CQ-078)
        (
            "hasServiceName",
            PAO.Integration,
            XSD.string,
            ["functional"],
            "The display name of the external service an integration connects to.",
        ),
        (
            "hasEndpoint",
            PAO.Integration,
            XSD.anyURI,
            ["functional"],
            "The endpoint URI of the external service an integration connects to.",
        ),
        # v0.6.0: External Service metadata
        (
            "hasServiceTransport",
            PAO.ExternalService,
            XSD.string,
            ["functional"],
            "The transport protocol of an external service (e.g. stdio, sse, http).",
        ),
        (
            "hasServiceIdentifier",
            PAO.ExternalService,
            XSD.string,
            ["functional"],
            "A unique string identifier for an external service configuration.",
        ),
        # v0.6.0: Runtime Safety metadata
        (
            "hasDecisionReason",
            PAO.AuditEntry,
            XSD.string,
            ["functional"],
            "A textual justification for the authorization decision in an audit entry.",
        ),
        # v0.6.0: Recovery metadata
        (
            "hasAttemptCount",
            PAO.ErrorRecoveryEvent,
            XSD.nonNegativeInteger,
            ["functional"],
            "The number of retry attempts made during an error recovery event.",
        ),
        (
            "hasRecoveryOutcome",
            PAO.ErrorRecoveryEvent,
            XSD.string,
            ["functional"],
            "The outcome of an error recovery event (e.g. resolved, escalated, abandoned).",
        ),
        # v0.6.0 Phase B: Tool/Message Trace
        (
            "blockSequenceIndex",
            PAO.ContentBlock,
            XSD.nonNegativeInteger,
            ["functional"],
            "The zero-based ordinal position of a content block within its message.",
        ),
        # pao-model (v0.7.0)
        (
            "hasModelId",
            PAO.FoundationModel,
            XSD.string,
            ["functional"],
            "The unique string identifier of a foundation model.",
        ),
        (
            "hasModelVersion",
            PAO.FoundationModel,
            XSD.string,
            ["functional"],
            "The version string of a foundation model.",
        ),
        (
            "hasTemperature",
            PAO.GenerationConfiguration,
            XSD.decimal,
            ["functional"],
            "The temperature parameter for controlling generation randomness.",
        ),
        (
            "hasTopP",
            PAO.GenerationConfiguration,
            XSD.decimal,
            ["functional"],
            "The top-p (nucleus sampling) parameter for generation.",
        ),
        (
            "hasMaxOutputTokens",
            PAO.GenerationConfiguration,
            XSD.nonNegativeInteger,
            ["functional"],
            "The maximum number of output tokens for generation.",
        ),
        (
            "hasPromptVersion",
            PAO.GenerationConfiguration,
            XSD.string,
            ["functional"],
            "The version identifier of the prompt template used.",
        ),
        (
            "hasSeed",
            PAO.GenerationConfiguration,
            XSD.nonNegativeInteger,
            ["functional"],
            "The random seed for reproducible generation.",
        ),
        # pao-observability (v0.7.0)
        (
            "hasMetricName",
            PAO.OperationalMetric,
            XSD.string,
            ["functional"],
            "The name of an operational metric.",
        ),
        (
            "hasMetricValue",
            PAO.MetricObservation,
            XSD.decimal,
            ["functional"],
            "The measured value of a metric observation.",
        ),
        # pao-scheduling (v0.8.0)
        (
            "hasCronExpression",
            PAO.RecurrencePattern,
            XSD.string,
            ["functional"],
            "The cron expression defining when a recurrence pattern fires.",
        ),
        (
            "hasIntervalSeconds",
            PAO.RecurrencePattern,
            XSD.nonNegativeInteger,
            ["functional"],
            "The interval in seconds between recurring firings.",
        ),
        (
            "allowsCatchUp",
            PAO.Schedule,
            XSD.boolean,
            ["functional"],
            "Whether a schedule allows catch-up of missed executions after downtime.",
        ),
    ]

    for name, domain, range_, chars, defn in data_props:
        uri = PAO[name]
        g.add((uri, RDF.type, OWL.DatatypeProperty))
        g.add((uri, RDFS.label, Literal(to_label(name), lang="en")))
        g.add((uri, SKOS.definition, Literal(defn, lang="en")))
        if domain is not None:
            g.add((uri, RDFS.domain, domain))
        g.add((uri, RDFS.range, range_))
        if "functional" in chars:
            g.add((uri, RDF.type, OWL.FunctionalProperty))


def _add_property_hierarchy(g: Graph) -> None:
    """Add rdfs:subPropertyOf axioms."""
    # partOf hierarchy
    g.add((PAO.partOfConversation, RDFS.subPropertyOf, PAO.partOf))
    g.add((PAO.partOfSession, RDFS.subPropertyOf, PAO.partOf))
    g.add((PAO.partOfPlan, RDFS.subPropertyOf, PAO.partOf))
    # hasPart hierarchy
    g.add((PAO.hasTask, RDFS.subPropertyOf, PAO.hasPart))
    # hasParticipant hierarchy
    g.add((PAO.performedBy, RDFS.subPropertyOf, PAO.hasParticipant))
    g.add((PAO.invokedBy, RDFS.subPropertyOf, PAO.performedBy))
    # hasStatus hierarchy
    g.add((PAO.hasComplianceStatus, RDFS.subPropertyOf, PAO.hasStatus))
    g.add((PAO.hasIntegrationStatus, RDFS.subPropertyOf, PAO.hasStatus))
    g.add((PAO.hasConnectionStatus, RDFS.subPropertyOf, PAO.hasStatus))
    g.add((PAO.checkpointDecision, RDFS.subPropertyOf, PAO.hasStatus))
    # v0.8.0: scheduling status hierarchy
    g.add((PAO.hasScheduleStatus, RDFS.subPropertyOf, PAO.hasStatus))
    g.add((PAO.hasExecutionOutcome, RDFS.subPropertyOf, PAO.hasStatus))
    g.add((PAO.hasConcurrencyPolicy, RDFS.subPropertyOf, PAO.hasStatus))
    # compactedItem is subPropertyOf prov:used
    g.add((PAO.compactedItem, RDFS.subPropertyOf, PROV.used))


def _add_inverse_pairs(g: Graph) -> None:
    """Declare owl:inverseOf pairs."""
    pairs = [
        (PAO.partOf, PAO.hasPart),
        (PAO.hasAvailableTool, PAO.availableToAgent),
        (PAO.hasParticipant, PAO.participatesIn),
        (PAO.invokesTool, PAO.invokedIn),
        (PAO.storedIn, PAO.stores),
        (PAO.recordedInEpisode, PAO.recordsEvent),
        (PAO.pursuedBy, PAO.pursuesGoal),
        (PAO.partOfPlan, PAO.hasTask),
        (PAO.blockedBy, PAO.blocks),
        (PAO.belongsTo, PAO.hasMember),
        (PAO.continuedFrom, PAO.continuedBy),
        (PAO.previousTransition, PAO.nextTransition),
        (PAO.achievesGoal, None),  # no inverse defined
        # v0.7.0: Model invocation ↔ turn
        (PAO.modelInvocationForTurn, PAO.producedByModelInvocation),
    ]
    for p1, p2 in pairs:
        if p2 is not None:
            _add_inverse_pair(g, p1, p2)


def _add_existential_restrictions(g: Graph) -> None:
    """Add SubClassOf someValuesFrom restrictions."""
    restrictions: list[tuple[URIRef, URIRef, URIRef]] = [
        # CQ-002: AIAgent has at least one tool
        (PAO.AIAgent, PAO.hasAvailableTool, PAO.ToolDefinition),
        # CQ-003: SubAgent was spawned and has delegated task
        (PAO.SubAgent, PAO.spawnedBy, PAO.AIAgent),
        (PAO.SubAgent, PAO.delegatedTask, PAO.Task),
        # CQ-005: Session belongs to conversation and has temporal extent
        (PAO.Session, PAO.partOfConversation, PAO.Conversation),
        (PAO.Session, PAO.hasTemporalExtent, TIME.Interval),
        # CQ-006: Turn belongs to session and has participant
        (PAO.Turn, PAO.partOfSession, PAO.Session),
        (PAO.Turn, PAO.hasParticipant, PAO.Agent),
        # CQ-007: ToolInvocation links
        (PAO.ToolInvocation, PAO.invokesTool, PAO.ToolDefinition),
        (PAO.ToolInvocation, PAO.invokedBy, PAO.Agent),
        (PAO.ToolInvocation, PAO.inSession, PAO.Session),
        # CQ-008: ToolInvocation has input/output
        (PAO.ToolInvocation, PAO.hasInput, PROV.Entity),
        (PAO.ToolInvocation, PAO.hasOutput, PROV.Entity),
        # CQ-006: Turn belongs to conversation
        (PAO.Turn, PAO.partOfConversation, PAO.Conversation),
        # CQ-009: Session has participant
        (PAO.Session, PAO.hasParticipant, PAO.Agent),
        # CQ-010: CompactionEvent
        (PAO.CompactionEvent, PAO.inConversation, PAO.Conversation),
        (PAO.CompactionEvent, PAO.producedSummary, PAO.MemoryItem),
        # CQ-011: MemoryItem stored in tier
        (PAO.MemoryItem, PAO.storedIn, PAO.MemoryTier),
        # CQ-012: Episode stored in tier, has topic and temporal extent
        (PAO.Episode, PAO.storedIn, PAO.MemoryTier),
        (PAO.Episode, PAO.hasTopic, SKOS.Concept),
        (PAO.Episode, PAO.hasTemporalExtent, TIME.Interval),
        # CQ-013: Claim has content and confidence (object existentials)
        (PAO.Claim, PAO.storedIn, PAO.MemoryTier),
        # CQ-015: Claim about agent
        (PAO.Claim, PAO.aboutAgent, PAO.Agent),
        # CQ-014: MemoryItem provenance
        (PAO.MemoryItem, PROV.wasAttributedTo, PAO.Agent),
        (PAO.MemoryItem, PROV.wasGeneratedBy, PROV.Activity),
        # CQ-021: Event has temporal extent
        (PAO.Event, PAO.hasTemporalExtent, TIME.TemporalEntity),
        # CQ-019: MemoryOperation targets
        (PAO.MemoryOperation, PAO.operatesOn, PAO.MemoryItem),
        # CQ-023: Action has performer
        (PAO.Action, PAO.performedBy, PAO.Agent),
        # CQ-026: Goal has pursuer and status
        (PAO.Goal, PAO.pursuedBy, PAO.Agent),
        (PAO.Goal, PAO.hasStatus, PAO.TaskStatus),
        # CQ-027: Task in plan and has status
        (PAO.Task, PAO.partOfPlan, PAO.Plan),
        (PAO.Task, PAO.hasStatus, PAO.TaskStatus),
        # CQ-028: Plan achieves goal
        (PAO.Plan, PAO.achievesGoal, PAO.Goal),
        # CQ-030: PermissionPolicy
        (PAO.PermissionPolicy, PAO.appliesTo, PAO.Agent),
        (PAO.PermissionPolicy, PAO.grantsPermission, ODRL.Permission),
        # CQ-031: ToolInvocation compliance
        (PAO.ToolInvocation, PAO.hasComplianceStatus, PAO.ComplianceStatus),
        # CQ-031: ToolInvocation governed by policy
        (PAO.ToolInvocation, PAO.governedByPolicy, PAO.PermissionPolicy),
        # CQ-034: ErasureEvent
        (PAO.ErasureEvent, PAO.requestedBy, PAO.Agent),
        # CQ-035: SafetyConstraint
        (PAO.SafetyConstraint, PAO.appliesTo, PAO.Agent),
        # CQ-038: Session has status
        (PAO.Session, PAO.hasStatus, PAO.SessionStatus),
        # CQ-039: PermissionPolicy restricts tools
        (PAO.PermissionPolicy, PAO.restrictsToolUse, PAO.ToolDefinition),
        # CQ-041: Organization has members
        (PAO.Organization, PAO.hasMember, PAO.Agent),
        # CQ-042: AIAgent has persona
        (PAO.AIAgent, PAO.hasPersona, PAO.Persona),
        # CQ-043: Observation in session
        (PAO.Observation, PAO.inSession, PAO.Session),
        # CQ-046: Intention has intender
        (PAO.Intention, PAO.intendedBy, PAO.Agent),
        # CQ-047: Intention derived from goal
        (PAO.Intention, PAO.derivedFromGoal, PAO.Goal),
        # CQ-048: MemoryItem has sensitivity level (migrated)
        (PAO.MemoryItem, PAO.hasSensitivityLevel, PAO.SensitivityLevel),
        # CQ-049: ConsentRecord has subject
        (PAO.ConsentRecord, PAO.consentSubject, PAO.Agent),
        # CQ-050: MemoryItem governed by retention
        (PAO.MemoryItem, PAO.governedByRetention, PAO.RetentionPolicy),
        # CQ-052: CompactionEvent uses items
        (PAO.CompactionEvent, PAO.compactedItem, PROV.Entity),
        # CQ-058: StatusTransition has from/to/subject
        (PAO.StatusTransition, PAO.fromStatus, PAO.Status),
        (PAO.StatusTransition, PAO.toStatus, PAO.Status),
        (PAO.StatusTransition, PAO.transitionSubject, OWL.Thing),
        # CQ-052: CompactionDisposition has item and fate
        (PAO.CompactionDisposition, PAO.dispositionOf, PROV.Entity),
        (PAO.CompactionDisposition, PAO.hasItemFate, PAO.ItemFate),
        # CQ-061/064: hasContextWindow and compactedContextOf are optional (min 0),
        # so no existential restrictions — SHACL enforces max 1 when present.
        # CQ-066/069: viaChannel and sentViaChannel are optional (min 0 per property-design),
        # so no existential restrictions — SHACL enforces max 1 when present.
        # CQ-067: CommunicationChannel has a type
        (PAO.CommunicationChannel, PAO.hasChannelType, PAO.ChannelType),
        # CQ-071: AIAgent has integrations (not Agent — HumanUser may have none)
        (PAO.AIAgent, PAO.hasIntegration, PAO.Integration),
        # CQ-072: Integration provides tools
        (PAO.Integration, PAO.providesTool, PAO.ToolDefinition),
        # CQ-073: Integration has status
        (PAO.Integration, PAO.hasIntegrationStatus, PAO.IntegrationStatus),
        # CQ-079: Agent has external service
        (PAO.AIAgent, PAO.hasExternalService, PAO.ExternalService),
        # CQ-080: ServiceConnection connects to service and has status
        (PAO.ServiceConnection, PAO.connectsToService, PAO.ExternalService),
        (PAO.ServiceConnection, PAO.hasConnectionStatus, PAO.ConnectionStatus),
        # CQ-081: ExternalService exposes capabilities
        (PAO.ExternalService, PAO.exposesCapability, PAO.ServiceCapability),
        # CQ-082: CapabilityDiscoveryEvent discovers capability against service
        (PAO.CapabilityDiscoveryEvent, PAO.discoveredCapability, PAO.ServiceCapability),
        (PAO.CapabilityDiscoveryEvent, PAO.discoveryAgainstService, PAO.ExternalService),
        # CQ-083: AIAgent operates in permission mode
        (PAO.AIAgent, PAO.operatesInMode, PAO.PermissionMode),
        # CQ-084: AIAgent has hooks
        (PAO.AIAgent, PAO.hasHook, PAO.Hook),
        # CQ-085: HookExecution intercepts invocation
        (PAO.HookExecution, PAO.interceptsInvocation, PAO.ToolInvocation),
        # CQ-086: AuditEntry records decision for invocation in log
        (PAO.AuditEntry, PAO.writtenToAuditLog, PAO.AuditLog),
        (PAO.AuditEntry, PAO.recordsDecision, PAO.AuthorizationDecision),
        (PAO.AuditEntry, PAO.auditForInvocation, PAO.ToolInvocation),
        # CQ-087: ErrorRecoveryEvent recovering from invocation
        (PAO.ErrorRecoveryEvent, PAO.recoveringFrom, PAO.ToolInvocation),
        # CQ-088: Checkpoint gates task with decision
        (PAO.Checkpoint, PAO.checkpointForTask, PAO.Task),
        (PAO.Checkpoint, PAO.checkpointDecision, PAO.CheckpointDecision),
        # CQ-090: ToolInvocationGroup grouped in turn
        (PAO.ToolInvocationGroup, PAO.groupedInTurn, PAO.Turn),
        # CQ-091: ToolInvocation produces result
        (PAO.ToolInvocation, PAO.producedToolResult, PAO.ToolResult),
        # CQ-092: ContentBlock has type
        (PAO.ContentBlock, PAO.hasContentBlockType, PAO.ContentBlockType),
        # CQ-094: SharedMemoryArtifact shared across agents
        (PAO.SharedMemoryArtifact, PAO.sharedAcrossAgents, PAO.Agent),
        # CQ-095: MemoryWriteConflict on artifact by agent
        (PAO.MemoryWriteConflict, PAO.conflictOnArtifact, PAO.SharedMemoryArtifact),
        (PAO.MemoryWriteConflict, PAO.writesByAgent, PAO.Agent),
        # CQ-096: DialogAct has communicative function
        (PAO.DialogAct, PAO.hasCommunicativeFunction, PAO.CommunicativeFunction),
        # CQ-097: GroundingAct contributes to common ground
        (PAO.GroundingAct, PAO.contributesToCommonGround, PAO.CommonGround),
        # CQ-098: ClarificationRequest clarifies turn
        (PAO.ClarificationRequest, PAO.clarifiesTurn, PAO.Turn),
        # CQ-099/100/101: Model identity (v0.7.0)
        (PAO.ModelInvocation, PAO.invokedOnDeployment, PAO.ModelDeployment),
        (PAO.ModelInvocation, PAO.modelInvocationForTurn, PAO.Turn),
        (PAO.ModelInvocation, PAO.hasGenerationConfig, PAO.GenerationConfiguration),
        (PAO.FoundationModel, PAO.deployedAs, PAO.ModelDeployment),
        (PAO.FoundationModel, PAO.hasProvider, PAO.ModelProvider),
        (PAO.AIAgent, PAO.usesModel, PAO.FoundationModel),
        # CQ-104/106: Observability (v0.7.0)
        (PAO.MetricObservation, PAO.observesMetric, PAO.OperationalMetric),
        (PAO.ReliabilityIncident, PAO.incidentForEntity, OWL.Thing),
        # CQ-108: Failure taxonomy (v0.7.0)
        (PAO.ErrorRecoveryEvent, PAO.hasFailureType, PAO.FailureType),
        # CQ-110/111/112/113: BDI completion (v0.7.0)
        (PAO.Deliberation, PAO.considersBelief, PAO.Belief),
        (PAO.Deliberation, PAO.considersDesire, PAO.Desire),
        (PAO.Deliberation, PAO.producesIntention, PAO.Intention),
        (PAO.Justification, PAO.justifiesIntention, PAO.Intention),
        # CQ-114/115/116/117: Schedule core (v0.8.0)
        (PAO.Schedule, PAO.hasRecurrencePattern, PAO.RecurrencePattern),
        (PAO.Schedule, PAO.schedulesAction, PAO.Action),
        (PAO.Schedule, PAO.hasScheduleStatus, PAO.ScheduleStatus),
        (PAO.Schedule, PAO.activatedBy, PAO.Trigger),
        (PAO.Schedule, PAO.ownedByAgent, PAO.Agent),
        (PAO.Schedule, PAO.hasConcurrencyPolicy, PAO.ConcurrencyPolicy),
        # CQ-118/119/120: ScheduledExecution (v0.8.0)
        (PAO.ScheduledExecution, PAO.executionOf, PAO.Schedule),
        (PAO.ScheduledExecution, PAO.hasExecutionOutcome, PAO.ExecutionOutcome),
        (PAO.ScheduledExecution, PAO.hasTemporalExtent, TIME.Interval),
    ]
    for cls, prop, filler in restrictions:
        _add_existential(g, cls, prop, filler)


def _add_universal_restrictions(g: Graph) -> None:
    """Add SubClassOf allValuesFrom restrictions."""
    # CQ-012: Episodes can only be stored in EpisodicMemory
    _add_universal(g, PAO.Episode, PAO.storedIn, PAO.EpisodicMemory)


def _add_cardinality_restrictions(g: Graph) -> None:
    """Add qualified cardinality restrictions."""
    # CQ-006: Turn has exactly 1 participant (Agent)
    _add_qualified_cardinality(g, PAO.Turn, PAO.hasParticipant, PAO.Agent, 1, kind="exact")
    # CQ-006: Turn has exactly 1 turn index
    _add_data_exact_cardinality(g, PAO.Turn, PAO.hasTurnIndex, XSD.nonNegativeInteger, 1)
    # CQ-018: MemoryItem stored in exactly 1 tier
    _add_qualified_cardinality(g, PAO.MemoryItem, PAO.storedIn, PAO.MemoryTier, 1, kind="exact")
    # CQ-094: SharedMemoryArtifact shared across at least 2 agents
    _add_qualified_cardinality(
        g, PAO.SharedMemoryArtifact, PAO.sharedAcrossAgents, PAO.Agent, 2, kind="min"
    )
    # CQ-095: MemoryWriteConflict involves at least 2 agents
    _add_qualified_cardinality(
        g, PAO.MemoryWriteConflict, PAO.writesByAgent, PAO.Agent, 2, kind="min"
    )


def _add_disjoint_unions(g: Graph) -> None:
    """Add DisjointUnion axioms (exhaustive covering)."""
    # MemoryTier DisjointUnionOf 4 subtypes
    _add_disjoint_union(
        g,
        PAO.MemoryTier,
        [
            PAO.WorkingMemory,
            PAO.EpisodicMemory,
            PAO.SemanticMemory,
            PAO.ProceduralMemory,
        ],
    )
    # ServiceCapability DisjointUnionOf 3 subtypes (v0.6.0)
    _add_disjoint_union(
        g,
        PAO.ServiceCapability,
        [
            PAO.ServiceToolCapability,
            PAO.ServiceResourceCapability,
            PAO.ServicePromptCapability,
        ],
    )
    # Trigger DisjointUnionOf 3 subtypes (v0.8.0)
    _add_disjoint_union(
        g,
        PAO.Trigger,
        [
            PAO.CronTrigger,
            PAO.IntervalTrigger,
            PAO.EventTrigger,
        ],
    )
    # MemoryOperation DisjointUnionOf 5 subtypes
    _add_disjoint_union(
        g,
        PAO.MemoryOperation,
        [
            PAO.Encoding,
            PAO.Retrieval,
            PAO.Consolidation,
            PAO.Forgetting,
            PAO.Rehearsal,
        ],
    )


def _add_disjointness_axioms(g: Graph) -> None:
    """Add AllDisjointClasses axioms."""
    # Agent subtypes
    _add_all_disjoint_classes(g, [PAO.AIAgent, PAO.HumanUser, PAO.Organization])
    # Event subtypes (17-way)
    _add_all_disjoint_classes(
        g,
        [
            PAO.Action,
            PAO.Conversation,
            PAO.Session,
            PAO.Turn,
            PAO.CompactionEvent,
            PAO.ErasureEvent,
            PAO.MemoryOperation,
            PAO.Observation,
            PAO.StatusTransition,
            PAO.CapabilityDiscoveryEvent,
            PAO.HookExecution,
            PAO.ErrorRecoveryEvent,
            PAO.RetryAttempt,
            PAO.ReplanEvent,
            PAO.RollbackEvent,
            PAO.MemoryWriteConflict,  # v0.6.0 Phase B
            PAO.GroundingAct,  # v0.6.0 Phase B
            PAO.ModelInvocation,  # v0.7.0
            PAO.ReliabilityIncident,  # v0.7.0
            PAO.Deliberation,  # v0.7.0
            PAO.ScheduledExecution,  # v0.8.0
        ],
    )
    # StatusTransition subtypes
    _add_all_disjoint_classes(g, [PAO.SessionStatusTransition, PAO.TaskStatusTransition])
    # MemoryItem subtypes
    _add_all_disjoint_classes(g, [PAO.Episode, PAO.Claim, PAO.MemoryBlock])
    # Status subtypes (15-way)
    _add_all_disjoint_classes(
        g,
        [
            PAO.SessionStatus,
            PAO.TaskStatus,
            PAO.ComplianceStatus,
            PAO.SensitivityLevel,
            PAO.ItemFate,
            PAO.ChannelType,
            PAO.IntegrationStatus,
            PAO.ConnectionStatus,
            PAO.PermissionMode,
            PAO.AuthorizationDecision,
            PAO.CheckpointDecision,
            PAO.ContentBlockType,  # v0.6.0 Phase B
            PAO.MemorySource,  # v0.6.0 Phase B
            PAO.MemoryScope,  # v0.6.0 Phase B
            PAO.CommunicativeFunction,  # v0.6.0 Phase B
            PAO.ClaimType,  # v0.6.0 review
            PAO.FailureType,  # v0.7.0
            PAO.ScheduleStatus,  # v0.8.0
            PAO.ExecutionOutcome,  # v0.8.0
            PAO.ConcurrencyPolicy,  # v0.8.0
        ],
    )
    # Governance types (7-way)
    _add_all_disjoint_classes(
        g,
        [
            PAO.PermissionPolicy,
            PAO.SafetyConstraint,
            PAO.ConsentRecord,
            PAO.RetentionPolicy,
            PAO.SandboxPolicy,
            PAO.Hook,
            PAO.AuditLog,
        ],
    )
    # Cross-module GDC disjointness: information artifacts
    _add_all_disjoint_classes(
        g,
        [
            PAO.Message,
            PAO.ToolDefinition,
            PAO.MemoryItem,
            PAO.MemoryTier,
            PAO.Goal,
            PAO.Plan,
            PAO.Task,
            PAO.PermissionPolicy,
            PAO.SafetyConstraint,
            PAO.Persona,
            PAO.Intention,
            PAO.ConsentRecord,
            PAO.RetentionPolicy,
            PAO.CompactionDisposition,
            PAO.ContextWindow,
            PAO.CommunicationChannel,
            PAO.Integration,
            PAO.ExternalService,
            PAO.ServiceConnection,
            PAO.ServiceCapability,
            PAO.SandboxPolicy,
            PAO.Hook,
            PAO.AuditLog,
            PAO.AuditEntry,
            PAO.Checkpoint,
            PAO.ToolResult,  # v0.6.0 Phase B
            PAO.ToolInvocationGroup,  # v0.6.0 Phase B
            PAO.ContentBlock,  # v0.6.0 Phase B
            PAO.SharedMemoryArtifact,  # v0.6.0 Phase B
            PAO.DialogAct,  # v0.6.0 Phase B
            PAO.CommonGround,  # v0.6.0 Phase B
            PAO.ClarificationRequest,  # v0.6.0 Phase B
            PAO.AcceptanceEvidence,  # v0.6.0 Phase B
            PAO.ModelProvider,  # v0.7.0
            PAO.FoundationModel,  # v0.7.0
            PAO.ModelDeployment,  # v0.7.0
            PAO.GenerationConfiguration,  # v0.7.0
            PAO.OperationalMetric,  # v0.7.0
            PAO.MetricObservation,  # v0.7.0
            PAO.Belief,  # v0.7.0
            PAO.Desire,  # v0.7.0
            PAO.Justification,  # v0.7.0
            PAO.Schedule,  # v0.8.0
            PAO.RecurrencePattern,  # v0.8.0
            PAO.Trigger,  # v0.8.0
        ],
    )
    # ServiceCapability subtypes (covered by DisjointUnion, but explicit)
    _add_all_disjoint_classes(
        g,
        [
            PAO.ServiceToolCapability,
            PAO.ServiceResourceCapability,
            PAO.ServicePromptCapability,
        ],
    )
    # Recovery event subtypes
    _add_all_disjoint_classes(
        g,
        [PAO.RetryAttempt, PAO.ReplanEvent, PAO.RollbackEvent],
    )
    # Trigger subtypes (covered by DisjointUnion, but explicit for clarity)
    _add_all_disjoint_classes(
        g,
        [PAO.CronTrigger, PAO.IntervalTrigger, PAO.EventTrigger],
    )
    # MemoryTier subtypes (covered by DisjointUnion, but explicit for clarity)
    _add_all_disjoint_classes(
        g,
        [
            PAO.WorkingMemory,
            PAO.EpisodicMemory,
            PAO.SemanticMemory,
            PAO.ProceduralMemory,
        ],
    )
    # MemoryOperation subtypes (covered by DisjointUnion, but explicit)
    _add_all_disjoint_classes(
        g,
        [
            PAO.Encoding,
            PAO.Retrieval,
            PAO.Consolidation,
            PAO.Forgetting,
            PAO.Rehearsal,
        ],
    )


def _add_has_key_axioms(g: Graph) -> None:
    """Add owl:hasKey axioms for identity contracts (DN-05)."""
    for cls, key_prop in [
        (PAO.AIAgent, PAO.hasAgentId),
        (PAO.Session, PAO.hasSessionId),
        (PAO.Conversation, PAO.hasConversationId),
        (PAO.FoundationModel, PAO.hasModelId),  # v0.7.0
    ]:
        key_list = BNode()
        Collection(g, key_list, [key_prop])
        g.add((cls, OWL.hasKey, key_list))


def _add_iao_definitions(g: Graph) -> None:
    """Copy skos:definition to obo:IAO_0000115 for OBO tool compatibility."""
    iao_def = OBO["IAO_0000115"]
    for subj, obj in g.subject_objects(SKOS.definition):
        g.add((subj, iao_def, obj))


# ---------------------------------------------------------------------------
# Reference Individuals Builder
# ---------------------------------------------------------------------------


def build_reference_individuals(glossary: list[dict[str, str]]) -> Graph:
    """Build named individuals: status values, roles, classifiers."""
    g = Graph()
    bind_common_prefixes(g)

    # --- Ontology header ---
    g.add((REF_IRI, RDF.type, OWL.Ontology))
    g.add((REF_IRI, OWL.versionIRI, REF_VERSION_IRI))
    g.add(
        (
            REF_IRI,
            DCTERMS.title,
            Literal(
                "Personal Agent Ontology — Reference Individuals",
                lang="en",
            ),
        )
    )
    g.add(
        (
            REF_IRI,
            DCTERMS.description,
            Literal(
                "Named individuals for status values, agent roles, and classifiers.",
                lang="en",
            ),
        )
    )
    g.add((REF_IRI, OWL.versionInfo, Literal("0.8.0")))
    g.add((REF_IRI, OWL.priorVersion, URIRef("https://purl.org/pao/reference-individuals/0.7.0")))
    g.add((REF_IRI, DCTERMS.created, Literal("2026-02-21")))
    g.add((REF_IRI, DCTERMS.creator, Literal("ontology-architect skill")))
    g.add((REF_IRI, DCTERMS.license, URIRef("https://spdx.org/licenses/MIT")))

    # Build lookup for individual definitions
    ind_lookup = {row["term"]: row for row in glossary if row["category"] == "individual"}

    def _add_individual(name: str, cls: URIRef) -> URIRef:
        uri = PAO[name]
        g.add((uri, RDF.type, OWL.NamedIndividual))
        g.add((uri, RDF.type, cls))
        g.add((uri, RDFS.label, Literal(to_label(name), lang="en")))
        if name in ind_lookup:
            defn = ind_lookup[name].get("definition", "")
            if defn:
                g.add((uri, SKOS.definition, Literal(defn, lang="en")))
        return uri

    # --- Session status individuals ---
    active = _add_individual("Active", PAO.SessionStatus)
    ended = _add_individual("Ended", PAO.SessionStatus)
    interrupted = _add_individual("Interrupted", PAO.SessionStatus)
    _add_all_different(g, [active, ended, interrupted])

    # --- Task status individuals ---
    pending = _add_individual("Pending", PAO.TaskStatus)
    in_progress = _add_individual("InProgress", PAO.TaskStatus)
    completed = _add_individual("Completed", PAO.TaskStatus)
    blocked = _add_individual("Blocked", PAO.TaskStatus)
    _add_all_different(g, [pending, in_progress, completed, blocked])

    # --- Compliance status individuals ---
    compliant = _add_individual("Compliant", PAO.ComplianceStatus)
    non_compliant = _add_individual("NonCompliant", PAO.ComplianceStatus)
    _add_all_different(g, [compliant, non_compliant])

    # --- Agent role individuals ---
    assistant_role = _add_individual("AssistantRole", PAO.AgentRole)
    user_role = _add_individual("UserRole", PAO.AgentRole)
    _add_all_different(g, [assistant_role, user_role])

    # --- Sensitivity level individuals (v0.2.0) ---
    public = _add_individual("Public", PAO.SensitivityLevel)
    internal = _add_individual("Internal", PAO.SensitivityLevel)
    confidential = _add_individual("Confidential", PAO.SensitivityLevel)
    restricted = _add_individual("Restricted", PAO.SensitivityLevel)
    _add_all_different(g, [public, internal, confidential, restricted])

    # --- Item fate individuals (v0.3.0) ---
    preserved = _add_individual("Preserved", PAO.ItemFate)
    dropped = _add_individual("Dropped", PAO.ItemFate)
    summarized = _add_individual("Summarized", PAO.ItemFate)
    archived = _add_individual("Archived", PAO.ItemFate)
    _add_all_different(g, [preserved, dropped, summarized, archived])

    # --- Channel type individuals (v0.5.0) ---
    cli = _add_individual("CLI", PAO.ChannelType)
    messaging = _add_individual("Messaging", PAO.ChannelType)
    web_chat = _add_individual("WebChat", PAO.ChannelType)
    api_channel = _add_individual("APIChannel", PAO.ChannelType)
    voice_channel = _add_individual("VoiceChannel", PAO.ChannelType)
    email_channel = _add_individual("EmailChannel", PAO.ChannelType)
    _add_all_different(g, [cli, messaging, web_chat, api_channel, voice_channel, email_channel])

    # --- Integration status individuals (v0.5.0) ---
    connected = _add_individual("Connected", PAO.IntegrationStatus)
    disconnected = _add_individual("Disconnected", PAO.IntegrationStatus)
    error_status = _add_individual("Error", PAO.IntegrationStatus)
    initializing = _add_individual("Initializing", PAO.IntegrationStatus)
    _add_all_different(g, [connected, disconnected, error_status, initializing])

    # --- Connection status individuals (v0.6.0) ---
    conn_open = _add_individual("Open", PAO.ConnectionStatus)
    conn_closed = _add_individual("Closed", PAO.ConnectionStatus)
    reconnecting = _add_individual("Reconnecting", PAO.ConnectionStatus)
    conn_failed = _add_individual("Failed", PAO.ConnectionStatus)
    _add_all_different(g, [conn_open, conn_closed, reconnecting, conn_failed])

    # --- Permission mode individuals (v0.6.0) ---
    permissive = _add_individual("Permissive", PAO.PermissionMode)
    standard = _add_individual("Standard", PAO.PermissionMode)
    restrictive = _add_individual("Restrictive", PAO.PermissionMode)
    _add_all_different(g, [permissive, standard, restrictive])

    # --- Authorization decision individuals (v0.6.0) ---
    allow = _add_individual("Allow", PAO.AuthorizationDecision)
    deny = _add_individual("Deny", PAO.AuthorizationDecision)
    require_approval = _add_individual("RequireApproval", PAO.AuthorizationDecision)
    _add_all_different(g, [allow, deny, require_approval])

    # --- Checkpoint decision individuals (v0.6.0) ---
    approved = _add_individual("Approved", PAO.CheckpointDecision)
    rejected = _add_individual("Rejected", PAO.CheckpointDecision)
    deferred = _add_individual("Deferred", PAO.CheckpointDecision)
    _add_all_different(g, [approved, rejected, deferred])

    # --- Content block type individuals (v0.6.0 Phase B) ---
    text_block = _add_individual("TextBlock", PAO.ContentBlockType)
    tool_use_block = _add_individual("ToolUseBlock", PAO.ContentBlockType)
    tool_result_block = _add_individual("ToolResultBlock", PAO.ContentBlockType)
    image_block = _add_individual("ImageBlock", PAO.ContentBlockType)
    _add_all_different(g, [text_block, tool_use_block, tool_result_block, image_block])

    # --- Memory source individuals (v0.6.0 Phase B) ---
    user_source = _add_individual("UserSource", PAO.MemorySource)
    system_source = _add_individual("SystemSource", PAO.MemorySource)
    agent_source = _add_individual("AgentSource", PAO.MemorySource)
    _add_all_different(g, [user_source, system_source, agent_source])

    # --- Memory scope individuals (v0.6.0 Phase B) ---
    session_scope = _add_individual("SessionScope", PAO.MemoryScope)
    project_scope = _add_individual("ProjectScope", PAO.MemoryScope)
    global_scope = _add_individual("GlobalScope", PAO.MemoryScope)
    _add_all_different(g, [session_scope, project_scope, global_scope])

    # --- Communicative function individuals (v0.6.0 Phase B) ---
    inform = _add_individual("Inform", PAO.CommunicativeFunction)
    request = _add_individual("Request", PAO.CommunicativeFunction)
    confirm = _add_individual("Confirm", PAO.CommunicativeFunction)
    clarify = _add_individual("Clarify", PAO.CommunicativeFunction)
    accept = _add_individual("Accept", PAO.CommunicativeFunction)
    reject = _add_individual("Reject", PAO.CommunicativeFunction)
    _add_all_different(g, [inform, request, confirm, clarify, accept, reject])

    # --- Claim type individuals (v0.6.0 review: controlled vocab) ---
    user_preference = _add_individual("UserPreference", PAO.ClaimType)
    _add_all_different(g, [user_preference])

    # --- Failure type individuals (v0.7.0) ---
    timeout = _add_individual("Timeout", PAO.FailureType)
    auth_failure = _add_individual("AuthenticationFailure", PAO.FailureType)
    rate_limited = _add_individual("RateLimited", PAO.FailureType)
    dependency_failure = _add_individual("DependencyFailure", PAO.FailureType)
    config_error = _add_individual("ConfigurationError", PAO.FailureType)
    network_error = _add_individual("NetworkError", PAO.FailureType)
    _add_all_different(
        g, [timeout, auth_failure, rate_limited, dependency_failure, config_error, network_error]
    )

    # --- Schedule status individuals (v0.8.0) ---
    sched_active = _add_individual("ScheduleActive", PAO.ScheduleStatus)
    sched_paused = _add_individual("SchedulePaused", PAO.ScheduleStatus)
    sched_expired = _add_individual("ScheduleExpired", PAO.ScheduleStatus)
    sched_disabled = _add_individual("ScheduleDisabled", PAO.ScheduleStatus)
    _add_all_different(g, [sched_active, sched_paused, sched_expired, sched_disabled])

    # --- Execution outcome individuals (v0.8.0) ---
    exec_succeeded = _add_individual("ExecutionSucceeded", PAO.ExecutionOutcome)
    exec_failed = _add_individual("ExecutionFailed", PAO.ExecutionOutcome)
    exec_skipped = _add_individual("ExecutionSkipped", PAO.ExecutionOutcome)
    _add_all_different(g, [exec_succeeded, exec_failed, exec_skipped])

    # --- Concurrency policy individuals (v0.8.0) ---
    conc_allow = _add_individual("ConcurrencyAllow", PAO.ConcurrencyPolicy)
    conc_forbid = _add_individual("ConcurrencyForbid", PAO.ConcurrencyPolicy)
    conc_replace = _add_individual("ConcurrencyReplace", PAO.ConcurrencyPolicy)
    _add_all_different(g, [conc_allow, conc_forbid, conc_replace])

    # --- Enumeration axioms (owl:oneOf) ---
    # These are on the classes, so they go in the TBox conceptually,
    # but individuals must exist first. We add the equivalentClass axioms here
    # since this module is imported by the TBox.
    _add_enumeration(g, PAO.SessionStatus, [active, ended, interrupted])
    _add_enumeration(g, PAO.TaskStatus, [pending, in_progress, completed, blocked])
    _add_enumeration(g, PAO.ComplianceStatus, [compliant, non_compliant])
    _add_enumeration(g, PAO.AgentRole, [assistant_role, user_role])
    _add_enumeration(g, PAO.SensitivityLevel, [public, internal, confidential, restricted])
    _add_enumeration(g, PAO.ItemFate, [preserved, dropped, summarized, archived])
    _add_enumeration(
        g,
        PAO.ChannelType,
        [cli, messaging, web_chat, api_channel, voice_channel, email_channel],
    )
    _add_enumeration(
        g, PAO.IntegrationStatus, [connected, disconnected, error_status, initializing]
    )
    _add_enumeration(g, PAO.ConnectionStatus, [conn_open, conn_closed, reconnecting, conn_failed])
    _add_enumeration(g, PAO.PermissionMode, [permissive, standard, restrictive])
    _add_enumeration(g, PAO.AuthorizationDecision, [allow, deny, require_approval])
    _add_enumeration(g, PAO.CheckpointDecision, [approved, rejected, deferred])
    _add_enumeration(
        g, PAO.ContentBlockType, [text_block, tool_use_block, tool_result_block, image_block]
    )
    _add_enumeration(g, PAO.ClaimType, [user_preference])
    _add_enumeration(g, PAO.MemorySource, [user_source, system_source, agent_source])
    _add_enumeration(g, PAO.MemoryScope, [session_scope, project_scope, global_scope])
    _add_enumeration(
        g,
        PAO.CommunicativeFunction,
        [inform, request, confirm, clarify, accept, reject],
    )
    _add_enumeration(
        g,
        PAO.FailureType,
        [timeout, auth_failure, rate_limited, dependency_failure, config_error, network_error],
    )
    _add_enumeration(
        g,
        PAO.ScheduleStatus,
        [sched_active, sched_paused, sched_expired, sched_disabled],
    )
    _add_enumeration(g, PAO.ExecutionOutcome, [exec_succeeded, exec_failed, exec_skipped])
    _add_enumeration(g, PAO.ConcurrencyPolicy, [conc_allow, conc_forbid, conc_replace])

    return g


# ---------------------------------------------------------------------------
# ABox Data Builder (sample individuals for CQ tests)
# ---------------------------------------------------------------------------


def build_abox_data() -> Graph:
    """Build sample ABox data for CQ test execution."""
    g = Graph()
    bind_common_prefixes(g)

    # --- Ontology header ---
    g.add((DATA_IRI, RDF.type, OWL.Ontology))
    g.add((DATA_IRI, OWL.versionIRI, DATA_VERSION_IRI))
    g.add((DATA_IRI, OWL.imports, TBOX_IRI))
    g.add(
        (
            DATA_IRI,
            DCTERMS.title,
            Literal(
                "Personal Agent Ontology — Sample Data",
                lang="en",
            ),
        )
    )
    g.add(
        (
            DATA_IRI,
            DCTERMS.description,
            Literal(
                "Representative ABox individuals for CQ/SPARQL test execution.",
                lang="en",
            ),
        )
    )
    g.add((DATA_IRI, OWL.versionInfo, Literal("0.8.0")))
    g.add((DATA_IRI, OWL.priorVersion, URIRef("https://purl.org/pao/data/0.7.0")))
    g.add((DATA_IRI, DCTERMS.created, Literal("2026-02-21")))
    g.add((DATA_IRI, DCTERMS.creator, Literal("ontology-architect skill")))
    g.add((DATA_IRI, DCTERMS.license, URIRef("https://spdx.org/licenses/MIT")))

    _add_sample_agents(g)
    _add_sample_tools(g)
    _add_sample_conversation(g)
    _add_sample_memory(g)
    _add_sample_planning(g)
    _add_sample_governance(g)
    _add_sample_organization(g)
    _add_sample_persona(g)
    _add_sample_observation(g)
    _add_sample_rehearsal(g)
    _add_sample_memory_block(g)
    _add_sample_intention(g)
    _add_sample_governance_v2(g)
    _add_sample_compaction_trace(g)
    _add_sample_eviction(g)
    _add_sample_session_continuation(g)
    _add_sample_identity(g)
    _add_sample_transitions(g)
    _add_sample_context_window(g)
    _add_sample_channels(g)
    _add_sample_integrations(g)
    _add_sample_external_services(g)
    _add_sample_runtime_safety(g)
    _add_sample_recovery(g)
    _add_sample_tool_trace(g)
    _add_sample_memory_control_plane(g)
    _add_sample_dialog_pragmatics(g)
    _add_sample_model_identity(g)
    _add_sample_observability(g)
    _add_sample_bdi(g)
    _add_sample_scheduling(g)
    _ensure_temporal_extents(g)

    return g


def _add_sample_agents(g: Graph) -> None:
    """Add agent individuals."""
    # AI agent
    claude = PAO.claude_agent
    g.add((claude, RDF.type, PAO.AIAgent))
    g.add((claude, RDF.type, OWL.NamedIndividual))
    g.add((claude, RDFS.label, Literal("Claude", lang="en")))
    g.add((claude, PROV.wasAttributedTo, claude))

    # Human user
    alice = PAO.alice_user
    g.add((alice, RDF.type, PAO.HumanUser))
    g.add((alice, RDF.type, OWL.NamedIndividual))
    g.add((alice, RDFS.label, Literal("Alice", lang="en")))

    # Sub-agent
    sub = PAO.search_subagent
    g.add((sub, RDF.type, PAO.SubAgent))
    g.add((sub, RDF.type, OWL.NamedIndividual))
    g.add((sub, RDFS.label, Literal("search subagent", lang="en")))
    g.add((sub, PAO.spawnedBy, claude))
    # AIAgentShape-required properties (v0.6.0 review: SHACL parity)
    g.add((sub, PAO.hasPersona, PAO.persona_claude))  # inherits parent persona
    g.add((sub, PAO.operatesInMode, PAO.Permissive))
    g.add((sub, PAO.hasIntegration, PAO.integration_github_001))
    g.add((sub, PAO.hasExternalService, PAO.ext_svc_github))
    g.add((sub, PAO.hasHook, PAO.hook_pre_tool))

    # Roles
    g.add((claude, PAO.hasRole, PAO.AssistantRole))
    g.add((alice, PAO.hasRole, PAO.UserRole))


def _add_sample_tools(g: Graph) -> None:
    """Add tool definition and invocation individuals."""
    # Tool definitions
    read_tool = PAO.read_tool
    g.add((read_tool, RDF.type, PAO.ToolDefinition))
    g.add((read_tool, RDF.type, OWL.NamedIndividual))
    g.add((read_tool, RDFS.label, Literal("Read Tool", lang="en")))
    g.add((read_tool, PAO.hasContent, Literal("Read file contents")))

    bash_tool = PAO.bash_tool
    g.add((bash_tool, RDF.type, PAO.ToolDefinition))
    g.add((bash_tool, RDF.type, OWL.NamedIndividual))
    g.add((bash_tool, RDFS.label, Literal("Bash Tool", lang="en")))
    g.add((bash_tool, PAO.hasContent, Literal("Execute shell commands")))

    # Agent has tools
    g.add((PAO.claude_agent, PAO.hasAvailableTool, read_tool))
    g.add((PAO.claude_agent, PAO.hasAvailableTool, bash_tool))

    # Sub-agent has delegated task (will be defined in planning)
    g.add((PAO.search_subagent, PAO.hasAvailableTool, read_tool))


def _add_sample_conversation(g: Graph) -> None:
    """Add conversation, session, turn, message, and compaction individuals."""
    conv = PAO.conv_001
    g.add((conv, RDF.type, PAO.Conversation))
    g.add((conv, RDF.type, OWL.NamedIndividual))
    g.add((conv, RDFS.label, Literal("conversation 001", lang="en")))
    g.add((conv, PAO.hasParticipant, PAO.claude_agent))
    g.add((conv, PAO.hasParticipant, PAO.alice_user))
    g.add((conv, PAO.hasTimestamp, Literal("2026-02-18T10:00:00", datatype=XSD.dateTime)))

    # Qualified association (CQ-004: role in conversation)
    assoc1 = BNode()
    g.add((conv, PROV.qualifiedAssociation, assoc1))
    g.add((assoc1, RDF.type, PROV.Association))
    g.add((assoc1, PROV.agent, PAO.claude_agent))
    g.add((assoc1, PROV.hadRole, PAO.AssistantRole))

    assoc2 = BNode()
    g.add((conv, PROV.qualifiedAssociation, assoc2))
    g.add((assoc2, RDF.type, PROV.Association))
    g.add((assoc2, PROV.agent, PAO.alice_user))
    g.add((assoc2, PROV.hadRole, PAO.UserRole))

    # Session
    sess = PAO.session_001
    g.add((sess, RDF.type, PAO.Session))
    g.add((sess, RDF.type, OWL.NamedIndividual))
    g.add((sess, RDFS.label, Literal("session 001", lang="en")))
    g.add((sess, PAO.partOfConversation, conv))
    g.add((sess, PAO.hasStatus, PAO.Active))
    g.add((sess, PAO.hasParticipant, PAO.alice_user))
    g.add((sess, PAO.hasParticipant, PAO.claude_agent))
    g.add((sess, PAO.hasTimestamp, Literal("2026-02-18T10:00:00", datatype=XSD.dateTime)))

    # Temporal extent for session (CQ-005, CQ-009, CQ-021)
    interval = PAO.session_001_interval
    g.add((interval, RDF.type, TIME.Interval))
    g.add((sess, PAO.hasTemporalExtent, interval))
    begin = PAO.session_001_begin
    g.add((begin, RDF.type, TIME.Instant))
    g.add((begin, TIME.inXSDDateTime, Literal("2026-02-18T10:00:00Z", datatype=XSD.dateTime)))
    end = PAO.session_001_end
    g.add((end, RDF.type, TIME.Instant))
    g.add((end, TIME.inXSDDateTime, Literal("2026-02-18T11:00:00Z", datatype=XSD.dateTime)))
    g.add((interval, TIME.hasBeginning, begin))
    g.add((interval, TIME.hasEnd, end))

    # Second session for CQ-009 (most recent)
    sess2 = PAO.session_002
    g.add((sess2, RDF.type, PAO.Session))
    g.add((sess2, RDF.type, OWL.NamedIndividual))
    g.add((sess2, RDFS.label, Literal("session 002", lang="en")))
    g.add((sess2, PAO.partOfConversation, conv))
    g.add((sess2, PAO.hasStatus, PAO.Ended))
    g.add((sess2, PAO.hasParticipant, PAO.alice_user))
    g.add((sess2, PAO.hasTimestamp, Literal("2026-02-18T12:00:00", datatype=XSD.dateTime)))
    interval2 = PAO.session_002_interval
    g.add((interval2, RDF.type, TIME.Interval))
    g.add((sess2, PAO.hasTemporalExtent, interval2))
    begin2 = PAO.session_002_begin
    g.add((begin2, RDF.type, TIME.Instant))
    g.add((begin2, TIME.inXSDDateTime, Literal("2026-02-18T12:00:00Z", datatype=XSD.dateTime)))
    end2 = PAO.session_002_end
    g.add((end2, RDF.type, TIME.Instant))
    g.add((end2, TIME.inXSDDateTime, Literal("2026-02-18T13:00:00Z", datatype=XSD.dateTime)))
    g.add((interval2, TIME.hasBeginning, begin2))
    g.add((interval2, TIME.hasEnd, end2))

    # Turns (CQ-006)
    turn1 = PAO.turn_001
    g.add((turn1, RDF.type, PAO.Turn))
    g.add((turn1, RDF.type, OWL.NamedIndividual))
    g.add((turn1, RDFS.label, Literal("turn 001", lang="en")))
    g.add((turn1, PAO.partOfSession, sess))
    g.add((turn1, PAO.partOfConversation, conv))
    g.add((turn1, PAO.hasParticipant, PAO.alice_user))
    g.add((turn1, PAO.hasTurnIndex, Literal(0, datatype=XSD.nonNegativeInteger)))
    g.add((turn1, PAO.hasTimestamp, Literal("2026-02-18T10:01:00", datatype=XSD.dateTime)))
    g.add((turn1, PAO.inSession, sess))

    turn2 = PAO.turn_002
    g.add((turn2, RDF.type, PAO.Turn))
    g.add((turn2, RDF.type, OWL.NamedIndividual))
    g.add((turn2, RDFS.label, Literal("turn 002", lang="en")))
    g.add((turn2, PAO.partOfSession, sess))
    g.add((turn2, PAO.partOfConversation, conv))
    g.add((turn2, PAO.hasParticipant, PAO.claude_agent))
    g.add((turn2, PAO.hasTurnIndex, Literal(1, datatype=XSD.nonNegativeInteger)))
    g.add((turn2, PAO.hasTimestamp, Literal("2026-02-18T10:02:00", datatype=XSD.dateTime)))
    g.add((turn2, PAO.inSession, sess))

    # Messages (CQ-006 content)
    msg1 = PAO.msg_001
    g.add((msg1, RDF.type, PAO.Message))
    g.add((msg1, RDF.type, OWL.NamedIndividual))
    g.add((msg1, RDFS.label, Literal("message 001", lang="en")))
    g.add((msg1, PAO.hasContent, Literal("Hello, can you help me?")))
    g.add((msg1, PROV.wasGeneratedBy, turn1))
    g.add((msg1, PROV.wasAttributedTo, PAO.alice_user))
    g.add((msg1, PAO.storedIn, PAO.working_memory_instance))

    msg2 = PAO.msg_002
    g.add((msg2, RDF.type, PAO.Message))
    g.add((msg2, RDF.type, OWL.NamedIndividual))
    g.add((msg2, RDFS.label, Literal("message 002", lang="en")))
    g.add((msg2, PAO.hasContent, Literal("Of course! What do you need?")))
    g.add((msg2, PROV.wasGeneratedBy, turn2))
    g.add((msg2, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((msg2, PAO.storedIn, PAO.working_memory_instance))

    # Tool invocations (CQ-007, CQ-008, CQ-037)
    inv1 = PAO.invocation_001
    g.add((inv1, RDF.type, PAO.ToolInvocation))
    g.add((inv1, RDF.type, OWL.NamedIndividual))
    g.add((inv1, RDFS.label, Literal("tool invocation 001", lang="en")))
    g.add((inv1, PAO.invokesTool, PAO.read_tool))
    g.add((inv1, PAO.invokedBy, PAO.claude_agent))
    g.add((inv1, PAO.performedBy, PAO.claude_agent))
    g.add((inv1, PAO.inSession, sess))
    g.add((inv1, PAO.hasTimestamp, Literal("2026-02-18T10:02:30", datatype=XSD.dateTime)))
    g.add((inv1, PAO.hasComplianceStatus, PAO.Compliant))

    # Input/output for CQ-008
    inv1_input = PAO.invocation_001_input
    g.add((inv1_input, RDF.type, PROV.Entity))
    g.add((inv1_input, RDF.type, OWL.NamedIndividual))
    g.add((inv1_input, RDFS.label, Literal("invocation 001 input", lang="en")))
    g.add((inv1_input, PAO.hasContent, Literal('{"path": "/tmp/test.txt"}')))
    g.add((inv1, PAO.hasInput, inv1_input))

    inv1_output = PAO.invocation_001_output
    g.add((inv1_output, RDF.type, PROV.Entity))
    g.add((inv1_output, RDF.type, OWL.NamedIndividual))
    g.add((inv1_output, RDFS.label, Literal("invocation 001 output", lang="en")))
    g.add((inv1_output, PAO.hasContent, Literal("file contents here")))
    g.add((inv1, PAO.hasOutput, inv1_output))

    # (ToolResult for invocation_001 is added in _add_sample_tool_trace via tool_result_01)

    # Second invocation for CQ-037 counting
    inv2 = PAO.invocation_002
    g.add((inv2, RDF.type, PAO.ToolInvocation))
    g.add((inv2, RDF.type, OWL.NamedIndividual))
    g.add((inv2, RDFS.label, Literal("tool invocation 002", lang="en")))
    g.add((inv2, PAO.invokesTool, PAO.bash_tool))
    g.add((inv2, PAO.invokedBy, PAO.claude_agent))
    g.add((inv2, PAO.performedBy, PAO.claude_agent))
    g.add((inv2, PAO.inSession, sess))
    g.add((inv2, PAO.hasTimestamp, Literal("2026-02-18T10:03:00", datatype=XSD.dateTime)))
    g.add((inv2, PAO.hasComplianceStatus, PAO.Compliant))

    # Input/output/result for invocation_002 (v0.6.0 review: SHACL parity)
    inv2_input = PAO.invocation_002_input
    g.add((inv2_input, RDF.type, PROV.Entity))
    g.add((inv2_input, RDF.type, OWL.NamedIndividual))
    g.add((inv2_input, RDFS.label, Literal("invocation 002 input", lang="en")))
    g.add((inv2_input, PAO.hasContent, Literal("echo hello")))
    g.add((inv2, PAO.hasInput, inv2_input))
    inv2_output = PAO.invocation_002_output
    g.add((inv2_output, RDF.type, PROV.Entity))
    g.add((inv2_output, RDF.type, OWL.NamedIndividual))
    g.add((inv2_output, RDFS.label, Literal("invocation 002 output", lang="en")))
    g.add((inv2_output, PAO.hasContent, Literal("hello")))
    g.add((inv2, PAO.hasOutput, inv2_output))
    result2 = PAO.tool_result_002
    g.add((result2, RDF.type, PAO.ToolResult))
    g.add((result2, RDF.type, OWL.NamedIndividual))
    g.add((result2, RDFS.label, Literal("tool result 002", lang="en")))
    g.add((inv2, PAO.producedToolResult, result2))

    # Governance links (CQ-031: governedByPolicy)
    g.add((inv1, PAO.governedByPolicy, PAO.policy_001))
    g.add((inv2, PAO.governedByPolicy, PAO.policy_001))

    # CompactionEvent (CQ-010)
    comp = PAO.compaction_001
    g.add((comp, RDF.type, PAO.CompactionEvent))
    g.add((comp, RDF.type, OWL.NamedIndividual))
    g.add((comp, RDFS.label, Literal("compaction event 001", lang="en")))
    g.add((comp, PAO.inConversation, conv))
    g.add((comp, PAO.hasTimestamp, Literal("2026-02-18T10:30:00", datatype=XSD.dateTime)))
    g.add((comp, PAO.producedSummary, PAO.summary_001))

    summary = PAO.summary_001
    g.add((summary, RDF.type, PAO.MemoryItem))
    g.add((summary, RDF.type, OWL.NamedIndividual))
    g.add((summary, RDFS.label, Literal("compaction summary", lang="en")))
    g.add((summary, PAO.hasContent, Literal("Summary of first 10 turns...")))
    g.add((summary, PAO.storedIn, PAO.working_memory_instance))
    g.add((summary, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((summary, PROV.wasGeneratedBy, comp))


def _add_sample_memory(g: Graph) -> None:
    """Add memory tier instances, episodes, claims, and operations."""
    # Memory tier instances (explicit MemoryTier superclass for non-inference SPARQL)
    wm = PAO.working_memory_instance
    g.add((wm, RDF.type, PAO.WorkingMemory))
    g.add((wm, RDF.type, PAO.MemoryTier))
    g.add((wm, RDF.type, OWL.NamedIndividual))
    g.add((wm, RDFS.label, Literal("working memory instance", lang="en")))

    em = PAO.episodic_memory_instance
    g.add((em, RDF.type, PAO.EpisodicMemory))
    g.add((em, RDF.type, PAO.MemoryTier))
    g.add((em, RDF.type, OWL.NamedIndividual))
    g.add((em, RDFS.label, Literal("episodic memory instance", lang="en")))

    sm = PAO.semantic_memory_instance
    g.add((sm, RDF.type, PAO.SemanticMemory))
    g.add((sm, RDF.type, PAO.MemoryTier))
    g.add((sm, RDF.type, OWL.NamedIndividual))
    g.add((sm, RDFS.label, Literal("semantic memory instance", lang="en")))

    pm = PAO.procedural_memory_instance
    g.add((pm, RDF.type, PAO.ProceduralMemory))
    g.add((pm, RDF.type, PAO.MemoryTier))
    g.add((pm, RDF.type, OWL.NamedIndividual))
    g.add((pm, RDFS.label, Literal("procedural memory instance", lang="en")))

    # Episode (CQ-012, CQ-025)
    ep = PAO.episode_001
    g.add((ep, RDF.type, PAO.Episode))
    g.add((ep, RDF.type, PAO.MemoryItem))
    g.add((ep, RDF.type, OWL.NamedIndividual))
    g.add((ep, RDFS.label, Literal("episode 001", lang="en")))
    g.add((ep, PAO.storedIn, em))
    topic = PAO.topic_dark_mode
    g.add((topic, RDF.type, SKOS.Concept))
    g.add((topic, RDFS.label, Literal("dark mode implementation", lang="en")))
    g.add((ep, PAO.hasTopic, topic))
    g.add((ep, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((ep, PROV.wasGeneratedBy, PAO.conv_001))
    g.add((ep, PAO.hasSensitivityLevel, PAO.Internal))
    g.add((ep, PAO.governedByRetention, PAO.retention_policy_30day))

    # Temporal extent for episode
    ep_interval = PAO.episode_001_interval
    g.add((ep_interval, RDF.type, TIME.Interval))
    g.add((ep, PAO.hasTemporalExtent, ep_interval))
    ep_begin = PAO.episode_001_begin
    g.add((ep_begin, RDF.type, TIME.Instant))
    g.add((ep_begin, TIME.inXSDDateTime, Literal("2026-02-18T10:00:00Z", datatype=XSD.dateTime)))
    ep_end = PAO.episode_001_end
    g.add((ep_end, RDF.type, TIME.Instant))
    g.add((ep_end, TIME.inXSDDateTime, Literal("2026-02-18T10:30:00Z", datatype=XSD.dateTime)))
    g.add((ep_interval, TIME.hasBeginning, ep_begin))
    g.add((ep_interval, TIME.hasEnd, ep_end))

    # Events recorded in episode (CQ-025)
    g.add((PAO.turn_001, PAO.recordedInEpisode, ep))
    g.add((PAO.turn_002, PAO.recordedInEpisode, ep))

    # Claims (CQ-013, CQ-015, CQ-016, CQ-017)
    claim1 = PAO.claim_001
    g.add((claim1, RDF.type, PAO.Claim))
    g.add((claim1, RDF.type, PAO.MemoryItem))
    g.add((claim1, RDF.type, OWL.NamedIndividual))
    g.add((claim1, RDFS.label, Literal("user preference: dark mode", lang="en")))
    g.add((claim1, PAO.hasContent, Literal("User prefers dark mode")))
    g.add((claim1, PAO.hasConfidence, Literal("0.9", datatype=XSD.decimal)))
    g.add((claim1, PAO.claimType, PAO.UserPreference))
    g.add((claim1, PAO.hasTimestamp, Literal("2026-02-18T10:10:00", datatype=XSD.dateTime)))
    g.add((claim1, PAO.aboutAgent, PAO.alice_user))
    g.add((claim1, PAO.storedIn, sm))
    g.add((claim1, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((claim1, PROV.wasGeneratedBy, PAO.conv_001))
    g.add((claim1, PROV.wasDerivedFrom, ep))
    g.add((claim1, PAO.hasEvidence, ep))

    # Revised claim for CQ-017
    claim2 = PAO.claim_002
    g.add((claim2, RDF.type, PAO.Claim))
    g.add((claim2, RDF.type, PAO.MemoryItem))
    g.add((claim2, RDF.type, OWL.NamedIndividual))
    g.add((claim2, RDFS.label, Literal("user preference: dark mode (revised)", lang="en")))
    g.add((claim2, PAO.hasContent, Literal("User strongly prefers dark mode with high contrast")))
    g.add((claim2, PAO.hasConfidence, Literal("0.95", datatype=XSD.decimal)))
    g.add((claim2, PAO.claimType, PAO.UserPreference))
    g.add((claim2, PAO.aboutAgent, PAO.alice_user))
    g.add((claim2, PAO.storedIn, sm))
    g.add((claim2, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((claim2, PROV.wasGeneratedBy, PAO.conv_001))
    g.add((claim2, PROV.wasRevisionOf, claim1))
    g.add((claim2, PROV.wasDerivedFrom, claim1))
    g.add((claim2, PAO.hasTimestamp, Literal("2026-02-18T11:00:00", datatype=XSD.dateTime)))

    # Memory operations (CQ-019)
    enc = PAO.encoding_001
    g.add((enc, RDF.type, PAO.Encoding))
    g.add((enc, RDF.type, PAO.MemoryOperation))
    g.add((enc, RDF.type, OWL.NamedIndividual))
    g.add((enc, RDFS.label, Literal("encoding 001", lang="en")))
    g.add((enc, PAO.operatesOn, claim1))
    g.add((enc, PAO.hasTimestamp, Literal("2026-02-18T10:15:00", datatype=XSD.dateTime)))

    ret = PAO.retrieval_001
    g.add((ret, RDF.type, PAO.Retrieval))
    g.add((ret, RDF.type, PAO.MemoryOperation))
    g.add((ret, RDF.type, OWL.NamedIndividual))
    g.add((ret, RDFS.label, Literal("retrieval 001", lang="en")))
    g.add((ret, PAO.operatesOn, claim1))
    g.add((ret, PAO.hasTimestamp, Literal("2026-02-18T10:20:00", datatype=XSD.dateTime)))

    consol = PAO.consolidation_001
    g.add((consol, RDF.type, PAO.Consolidation))
    g.add((consol, RDF.type, PAO.MemoryOperation))
    g.add((consol, RDF.type, OWL.NamedIndividual))
    g.add((consol, RDFS.label, Literal("consolidation 001", lang="en")))
    g.add((consol, PAO.operatesOn, ep))
    g.add((consol, PAO.hasTimestamp, Literal("2026-02-18T10:35:00", datatype=XSD.dateTime)))

    # Derivation chain for CQ-032
    g.add((claim1, PROV.wasDerivedFrom, PAO.msg_001))


def _add_sample_planning(g: Graph) -> None:
    """Add goal, plan, and task individuals."""
    # Goal (CQ-026)
    goal = PAO.goal_001
    g.add((goal, RDF.type, PAO.Goal))
    g.add((goal, RDF.type, OWL.NamedIndividual))
    g.add((goal, RDFS.label, Literal("implement dark mode", lang="en")))
    g.add((goal, PAO.pursuedBy, PAO.claude_agent))
    g.add((goal, PAO.hasStatus, PAO.InProgress))
    g.add((goal, PROV.wasAttributedTo, PAO.alice_user))
    g.add((goal, PAO.storedIn, PAO.semantic_memory_instance))
    g.add((goal, PROV.wasGeneratedBy, PAO.conv_001))

    # Plan (CQ-027, CQ-028)
    plan = PAO.plan_001
    g.add((plan, RDF.type, PAO.Plan))
    g.add((plan, RDF.type, OWL.NamedIndividual))
    g.add((plan, RDFS.label, Literal("dark mode implementation plan", lang="en")))
    g.add((plan, PAO.achievesGoal, goal))
    g.add((plan, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((plan, PAO.storedIn, PAO.semantic_memory_instance))
    g.add((plan, PROV.wasGeneratedBy, PAO.conv_001))

    # Tasks (CQ-027, CQ-029)
    task1 = PAO.task_001
    g.add((task1, RDF.type, PAO.Task))
    g.add((task1, RDF.type, OWL.NamedIndividual))
    g.add((task1, RDFS.label, Literal("update CSS theme", lang="en")))
    g.add((task1, PAO.partOfPlan, plan))
    g.add((task1, PAO.hasStatus, PAO.Completed))
    g.add((task1, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((task1, PAO.storedIn, PAO.semantic_memory_instance))
    g.add((task1, PROV.wasGeneratedBy, PAO.conv_001))

    task2 = PAO.task_002
    g.add((task2, RDF.type, PAO.Task))
    g.add((task2, RDF.type, OWL.NamedIndividual))
    g.add((task2, RDFS.label, Literal("add toggle button", lang="en")))
    g.add((task2, PAO.partOfPlan, plan))
    g.add((task2, PAO.hasStatus, PAO.InProgress))
    g.add((task2, PAO.blockedBy, task1))
    g.add((task2, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((task2, PAO.storedIn, PAO.semantic_memory_instance))
    g.add((task2, PROV.wasGeneratedBy, PAO.conv_001))

    task3 = PAO.task_003
    g.add((task3, RDF.type, PAO.Task))
    g.add((task3, RDF.type, OWL.NamedIndividual))
    g.add((task3, RDFS.label, Literal("write tests", lang="en")))
    g.add((task3, PAO.partOfPlan, plan))
    g.add((task3, PAO.hasStatus, PAO.Blocked))
    g.add((task3, PAO.blockedBy, task2))
    g.add((task3, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((task3, PAO.storedIn, PAO.semantic_memory_instance))
    g.add((task3, PROV.wasGeneratedBy, PAO.conv_001))

    # SubAgent delegated task (CQ-003)
    g.add((PAO.search_subagent, PAO.delegatedTask, task1))


def _add_sample_governance(g: Graph) -> None:
    """Add permission policy, safety constraint, and erasure event individuals."""
    # PermissionPolicy (CQ-030, CQ-039)
    policy = PAO.policy_001
    g.add((policy, RDF.type, PAO.PermissionPolicy))
    g.add((policy, RDF.type, OWL.NamedIndividual))
    g.add((policy, RDFS.label, Literal("file read policy", lang="en")))
    g.add((policy, PAO.appliesTo, PAO.claude_agent))
    g.add((policy, PAO.restrictsToolUse, PAO.bash_tool))
    g.add((policy, PROV.wasAttributedTo, PAO.alice_user))
    g.add((policy, PAO.storedIn, PAO.procedural_memory_instance))
    g.add((policy, PROV.wasGeneratedBy, PAO.conv_001))

    # Permission individual
    perm = PAO.permission_001
    g.add((perm, RDF.type, ODRL.Permission))
    g.add((perm, RDF.type, OWL.NamedIndividual))
    g.add((perm, RDFS.label, Literal("allow file reading", lang="en")))
    g.add((policy, PAO.grantsPermission, perm))

    # SafetyConstraint (CQ-035)
    sc = PAO.safety_001
    g.add((sc, RDF.type, PAO.SafetyConstraint))
    g.add((sc, RDF.type, OWL.NamedIndividual))
    g.add((sc, RDFS.label, Literal("no destructive commands", lang="en")))
    g.add((sc, PAO.appliesTo, PAO.claude_agent))
    g.add((sc, PAO.hasContent, Literal("Never run rm -rf or similar destructive commands")))
    g.add((sc, PROV.wasAttributedTo, PAO.alice_user))
    g.add((sc, PAO.storedIn, PAO.procedural_memory_instance))
    g.add((sc, PROV.wasGeneratedBy, PAO.conv_001))

    # ErasureEvent (CQ-034)
    erasure = PAO.erasure_001
    g.add((erasure, RDF.type, PAO.ErasureEvent))
    g.add((erasure, RDF.type, OWL.NamedIndividual))
    g.add((erasure, RDFS.label, Literal("erasure event 001", lang="en")))
    g.add((erasure, PAO.requestedBy, PAO.alice_user))
    g.add((erasure, PAO.hasTimestamp, Literal("2026-02-18T14:00:00", datatype=XSD.dateTime)))

    # Action for CQ-023 (agent actions in time period)
    action = PAO.action_001
    g.add((action, RDF.type, PAO.Action))
    g.add((action, RDF.type, OWL.NamedIndividual))
    g.add((action, RDFS.label, Literal("action 001", lang="en")))
    g.add((action, PAO.performedBy, PAO.claude_agent))
    g.add((action, PAO.hasTimestamp, Literal("2026-02-18T10:05:00", datatype=XSD.dateTime)))
    g.add((action, PAO.inSession, PAO.session_001))

    # Event for CQ-020, CQ-024
    g.add((PAO.turn_001, PAO.inSession, PAO.session_001))
    g.add((PAO.turn_002, PAO.inSession, PAO.session_001))

    # CQ-036: agent generated memory item through activity
    g.add((PAO.claim_001, PROV.wasGeneratedBy, PAO.conv_001))
    g.add((PAO.conv_001, PROV.wasAssociatedWith, PAO.claude_agent))


def _add_sample_organization(g: Graph) -> None:
    """Add organization and membership data (CQ-041)."""
    org = PAO.acme_corp
    g.add((org, RDF.type, PAO.Organization))
    g.add((org, RDF.type, OWL.NamedIndividual))
    g.add((org, RDFS.label, Literal("Acme Corp", lang="en")))
    g.add((PAO.claude_agent, PAO.belongsTo, org))
    g.add((PAO.alice_user, PAO.belongsTo, org))
    # Explicit inverse for SHACL (SHACL doesn't infer owl:inverseOf)
    g.add((org, PAO.hasMember, PAO.claude_agent))
    g.add((org, PAO.hasMember, PAO.alice_user))


def _add_sample_persona(g: Graph) -> None:
    """Add persona data (CQ-042)."""
    persona = PAO.persona_claude
    g.add((persona, RDF.type, PAO.Persona))
    g.add((persona, RDF.type, OWL.NamedIndividual))
    g.add((persona, RDFS.label, Literal("Claude coding assistant persona", lang="en")))
    g.add((persona, PAO.hasContent, Literal("You are a helpful coding assistant.")))
    g.add((persona, PROV.wasAttributedTo, PAO.alice_user))
    g.add((persona, PAO.storedIn, PAO.procedural_memory_instance))
    g.add((persona, PROV.wasGeneratedBy, PAO.conv_001))
    g.add((PAO.claude_agent, PAO.hasPersona, persona))


def _add_sample_observation(g: Graph) -> None:
    """Add observation data (CQ-043)."""
    obs = PAO.observation_001
    g.add((obs, RDF.type, PAO.Observation))
    g.add((obs, RDF.type, OWL.NamedIndividual))
    g.add((obs, RDFS.label, Literal("observation 001", lang="en")))
    g.add((obs, PAO.inSession, PAO.session_001))
    g.add((obs, PAO.hasTimestamp, Literal("2026-02-18T10:04:00", datatype=XSD.dateTime)))
    g.add((obs, PAO.hasContent, Literal("User appears to prefer concise responses")))


def _add_sample_rehearsal(g: Graph) -> None:
    """Add rehearsal data (CQ-044)."""
    reh = PAO.rehearsal_001
    g.add((reh, RDF.type, PAO.Rehearsal))
    g.add((reh, RDF.type, PAO.MemoryOperation))
    g.add((reh, RDF.type, OWL.NamedIndividual))
    g.add((reh, RDFS.label, Literal("rehearsal 001", lang="en")))
    g.add((reh, PAO.operatesOn, PAO.claim_001))
    g.add((reh, PAO.hasTimestamp, Literal("2026-02-18T10:40:00", datatype=XSD.dateTime)))

    reh2 = PAO.rehearsal_002
    g.add((reh2, RDF.type, PAO.Rehearsal))
    g.add((reh2, RDF.type, PAO.MemoryOperation))
    g.add((reh2, RDF.type, OWL.NamedIndividual))
    g.add((reh2, RDFS.label, Literal("rehearsal 002", lang="en")))
    g.add((reh2, PAO.operatesOn, PAO.claim_001))
    g.add((reh2, PAO.hasTimestamp, Literal("2026-02-18T11:30:00", datatype=XSD.dateTime)))


def _add_sample_memory_block(g: Graph) -> None:
    """Add memory block data (CQ-045)."""
    block = PAO.memory_block_001
    g.add((block, RDF.type, PAO.MemoryBlock))
    g.add((block, RDF.type, PAO.MemoryItem))
    g.add((block, RDF.type, OWL.NamedIndividual))
    g.add((block, RDFS.label, Literal("core memory block", lang="en")))
    g.add((block, PAO.hasBlockKey, Literal("user_name")))
    g.add((block, PAO.hasBlockValue, Literal("Alice")))
    g.add((block, PAO.storedIn, PAO.working_memory_instance))
    g.add((block, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((block, PROV.wasGeneratedBy, PAO.conv_001))
    g.add((block, PAO.hasSensitivityLevel, PAO.Internal))
    g.add((block, PAO.governedByRetention, PAO.retention_policy_30day))


def _add_sample_intention(g: Graph) -> None:
    """Add intention data (CQ-046, CQ-047)."""
    intention = PAO.intention_001
    g.add((intention, RDF.type, PAO.Intention))
    g.add((intention, RDF.type, OWL.NamedIndividual))
    g.add((intention, RDFS.label, Literal("implement dark mode intention", lang="en")))
    g.add((intention, PAO.intendedBy, PAO.claude_agent))
    g.add((intention, PAO.derivedFromGoal, PAO.goal_001))
    g.add((intention, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((intention, PAO.storedIn, PAO.semantic_memory_instance))
    g.add((intention, PROV.wasGeneratedBy, PAO.conv_001))


def _add_sample_governance_v2(g: Graph) -> None:
    """Add v0.2.0 governance data: consent, retention, migrated sensitivity (CQ-048--CQ-051)."""
    # Migrate existing sensitivity levels from strings to individuals
    # Update claim_001 and claim_002 to use SensitivityLevel individuals
    # (The old string literals are replaced by adding the object property)
    g.add((PAO.claim_001, PAO.hasSensitivityLevel, PAO.Confidential))
    g.add((PAO.claim_002, PAO.hasSensitivityLevel, PAO.Confidential))
    g.add((PAO.summary_001, PAO.hasSensitivityLevel, PAO.Public))
    g.add((PAO.summary_001, PAO.governedByRetention, PAO.retention_policy_30day))

    # ConsentRecord (CQ-049)
    consent = PAO.consent_001
    g.add((consent, RDF.type, PAO.ConsentRecord))
    g.add((consent, RDF.type, OWL.NamedIndividual))
    g.add((consent, RDFS.label, Literal("memory storage consent", lang="en")))
    g.add((consent, PAO.consentSubject, PAO.alice_user))
    # Purpose: memory storage (using a generic entity as purpose)
    purpose = PAO.purpose_memory_storage
    g.add((purpose, RDF.type, PROV.Entity))
    g.add((purpose, RDF.type, OWL.NamedIndividual))
    g.add((purpose, RDFS.label, Literal("memory storage", lang="en")))
    g.add((consent, PAO.consentPurpose, purpose))
    g.add((consent, PROV.wasAttributedTo, PAO.alice_user))
    g.add((consent, PAO.storedIn, PAO.procedural_memory_instance))
    g.add((consent, PROV.wasGeneratedBy, PAO.conv_001))

    # RetentionPolicy (CQ-050, CQ-051)
    retention = PAO.retention_policy_30day
    g.add((retention, RDF.type, PAO.RetentionPolicy))
    g.add((retention, RDF.type, OWL.NamedIndividual))
    g.add((retention, RDFS.label, Literal("30-day retention policy", lang="en")))
    g.add((retention, PAO.retentionPeriodDays, Literal(30, datatype=XSD.nonNegativeInteger)))
    g.add((retention, PROV.wasAttributedTo, PAO.alice_user))
    g.add((retention, PAO.storedIn, PAO.procedural_memory_instance))
    g.add((retention, PROV.wasGeneratedBy, PAO.conv_001))

    # Link memory items to retention policy
    g.add((PAO.claim_001, PAO.governedByRetention, retention))
    g.add((PAO.claim_002, PAO.governedByRetention, retention))

    # Expired item for CQ-051 (old timestamp that exceeds 30-day retention)
    expired = PAO.expired_memory_001
    g.add((expired, RDF.type, PAO.MemoryItem))
    g.add((expired, RDF.type, OWL.NamedIndividual))
    g.add((expired, RDFS.label, Literal("expired memory item", lang="en")))
    g.add((expired, PAO.hasContent, Literal("Old data that should be deleted")))
    g.add((expired, PAO.storedIn, PAO.semantic_memory_instance))
    g.add((expired, PROV.wasAttributedTo, PAO.claude_agent))
    g.add((expired, PROV.wasGeneratedBy, PAO.conv_001))
    g.add((expired, PAO.hasSensitivityLevel, PAO.Restricted))
    g.add((expired, PAO.governedByRetention, retention))
    # Timestamp 60 days ago to ensure it's expired under 30-day policy
    g.add((expired, PAO.hasTimestamp, Literal("2025-12-20T10:00:00", datatype=XSD.dateTime)))


def _add_sample_compaction_trace(g: Graph) -> None:
    """Add compaction trace data linking items to preservation/drop fates (CQ-052, CQ-053)."""
    compaction = PAO.compaction_001  # existing individual
    # Mark items as compacted inputs
    g.add((compaction, PAO.compactedItem, PAO.turn_001))
    g.add((compaction, PAO.compactedItem, PAO.turn_002))
    g.add((compaction, PAO.compactedItem, PAO.claim_001))
    # Dropped items: invalidated by compaction
    g.add((PAO.turn_001, PROV.wasInvalidatedBy, compaction))
    g.add((PAO.turn_002, PROV.wasInvalidatedBy, compaction))
    # Preserved item: derived into summary
    g.add((PAO.summary_001, PROV.wasDerivedFrom, PAO.claim_001))
    # Dispositions with metadata
    disp1 = PAO.disp_turn_001
    g.add((disp1, RDF.type, PAO.CompactionDisposition))
    g.add((disp1, RDF.type, OWL.NamedIndividual))
    g.add((disp1, RDFS.label, Literal("disposition of turn 001", lang="en")))
    g.add((disp1, PAO.dispositionOf, PAO.turn_001))
    g.add((disp1, PAO.hasItemFate, PAO.Dropped))
    g.add((disp1, PAO.fateReason, Literal("Low relevance to active goals")))
    g.add((compaction, PAO.hasCompactionDisposition, disp1))
    disp2 = PAO.disp_claim_001
    g.add((disp2, RDF.type, PAO.CompactionDisposition))
    g.add((disp2, RDF.type, OWL.NamedIndividual))
    g.add((disp2, RDFS.label, Literal("disposition of claim 001", lang="en")))
    g.add((disp2, PAO.dispositionOf, PAO.claim_001))
    g.add((disp2, PAO.hasItemFate, PAO.Preserved))
    g.add((disp2, PAO.fateReason, Literal("Active user preference")))
    g.add((compaction, PAO.hasCompactionDisposition, disp2))


def _add_sample_eviction(g: Graph) -> None:
    """Add last-access timestamps and eviction candidacy to memory items (CQ-054, CQ-055)."""
    g.add(
        (
            PAO.claim_001,
            PAO.hasLastAccessTime,
            Literal("2026-02-19T08:00:00Z", datatype=XSD.dateTime),
        )
    )
    g.add((PAO.claim_001, PAO.isEvictionCandidate, Literal(False)))
    g.add(
        (
            PAO.episode_001,
            PAO.hasLastAccessTime,
            Literal("2025-01-15T10:00:00Z", datatype=XSD.dateTime),
        )
    )
    g.add((PAO.episode_001, PAO.isEvictionCandidate, Literal(True)))


def _add_sample_session_continuation(g: Graph) -> None:
    """Link sessions in a continuation chain (CQ-056)."""
    g.add((PAO.session_002, PAO.continuedFrom, PAO.session_001))
    g.add((PAO.session_001, PAO.continuedBy, PAO.session_002))


def _add_sample_identity(g: Graph) -> None:
    """Add unique identifiers to key entities (CQ-057)."""
    g.add((PAO.claude_agent, PAO.hasAgentId, Literal("agent-claude-001")))
    g.add((PAO.search_subagent, PAO.hasAgentId, Literal("agent-search-sub-001")))
    g.add((PAO.session_001, PAO.hasSessionId, Literal("sess-001")))
    g.add((PAO.session_002, PAO.hasSessionId, Literal("sess-002")))
    g.add((PAO.conv_001, PAO.hasConversationId, Literal("conv-001")))


def _add_sample_transitions(g: Graph) -> None:
    """Add sample status transition chains (CQ-058, CQ-059, CQ-060)."""
    # Task transitions: Pending -> InProgress -> Completed
    tt1 = PAO.task_transition_001
    g.add((tt1, RDF.type, PAO.TaskStatusTransition))
    g.add((tt1, RDF.type, OWL.NamedIndividual))
    g.add((tt1, RDFS.label, Literal("task transition 001", lang="en")))
    g.add((tt1, PAO.transitionSubject, PAO.task_001))
    g.add((tt1, PAO.fromStatus, PAO.Pending))
    g.add((tt1, PAO.toStatus, PAO.InProgress))
    g.add((tt1, PAO.hasTimestamp, Literal("2026-02-19T10:00:00Z", datatype=XSD.dateTime)))
    tt2 = PAO.task_transition_002
    g.add((tt2, RDF.type, PAO.TaskStatusTransition))
    g.add((tt2, RDF.type, OWL.NamedIndividual))
    g.add((tt2, RDFS.label, Literal("task transition 002", lang="en")))
    g.add((tt2, PAO.transitionSubject, PAO.task_001))
    g.add((tt2, PAO.fromStatus, PAO.InProgress))
    g.add((tt2, PAO.toStatus, PAO.Completed))
    g.add((tt2, PAO.hasTimestamp, Literal("2026-02-19T11:30:00Z", datatype=XSD.dateTime)))
    g.add((tt1, PAO.nextTransition, tt2))
    g.add((tt2, PAO.previousTransition, tt1))
    # Session transition: Active -> Ended
    st1 = PAO.session_transition_001
    g.add((st1, RDF.type, PAO.SessionStatusTransition))
    g.add((st1, RDF.type, OWL.NamedIndividual))
    g.add((st1, RDFS.label, Literal("session transition 001", lang="en")))
    g.add((st1, PAO.transitionSubject, PAO.session_001))
    g.add((st1, PAO.fromStatus, PAO.Active))
    g.add((st1, PAO.toStatus, PAO.Ended))
    g.add((st1, PAO.hasTimestamp, Literal("2026-02-19T12:00:00Z", datatype=XSD.dateTime)))
    g.add((st1, PAO.triggeredBy, PAO.compaction_001))


def _add_sample_context_window(g: Graph) -> None:
    """Add sample context window individuals (CQ-061 through CQ-065)."""
    # Context window for session_001 — high usage (triggers compaction)
    cw1 = PAO.context_window_001
    g.add((cw1, RDF.type, PAO.ContextWindow))
    g.add((cw1, RDF.type, OWL.NamedIndividual))
    g.add((cw1, RDFS.label, Literal("context window 001", lang="en")))
    g.add((cw1, PAO.hasTokenCapacity, Literal(200000, datatype=XSD.nonNegativeInteger)))
    g.add((cw1, PAO.hasTokensUsed, Literal(165000, datatype=XSD.nonNegativeInteger)))
    # Link session to context window (CQ-061)
    g.add((PAO.session_001, PAO.hasContextWindow, cw1))
    # Link compaction event to context window (CQ-064)
    g.add((PAO.compaction_001, PAO.compactedContextOf, cw1))

    # Context window for session_002 — low usage (no compaction)
    cw2 = PAO.context_window_002
    g.add((cw2, RDF.type, PAO.ContextWindow))
    g.add((cw2, RDF.type, OWL.NamedIndividual))
    g.add((cw2, RDFS.label, Literal("context window 002", lang="en")))
    g.add((cw2, PAO.hasTokenCapacity, Literal(200000, datatype=XSD.nonNegativeInteger)))
    g.add((cw2, PAO.hasTokensUsed, Literal(45000, datatype=XSD.nonNegativeInteger)))
    g.add((PAO.session_002, PAO.hasContextWindow, cw2))


def _add_sample_channels(g: Graph) -> None:
    """Add sample communication channel individuals (CQ-066 through CQ-070)."""
    # Channel 1: CLI channel for session_001
    ch1 = PAO.channel_cli_001
    g.add((ch1, RDF.type, PAO.CommunicationChannel))
    g.add((ch1, RDF.type, OWL.NamedIndividual))
    g.add((ch1, RDFS.label, Literal("CLI channel 001", lang="en")))
    g.add((ch1, PAO.hasChannelType, PAO.CLI))
    # Link session_001 to channel (CQ-066)
    g.add((PAO.session_001, PAO.viaChannel, ch1))

    # Channel 2: WebChat channel for session_002 (different channel type)
    ch2 = PAO.channel_web_001
    g.add((ch2, RDF.type, PAO.CommunicationChannel))
    g.add((ch2, RDF.type, OWL.NamedIndividual))
    g.add((ch2, RDFS.label, Literal("web chat channel 001", lang="en")))
    g.add((ch2, PAO.hasChannelType, PAO.WebChat))
    # Link session_002 to channel (CQ-068: find sessions by channel type)
    g.add((PAO.session_002, PAO.viaChannel, ch2))

    # Link messages to channels (CQ-069)
    g.add((PAO.msg_001, PAO.sentViaChannel, ch1))
    g.add((PAO.msg_002, PAO.sentViaChannel, ch1))


def _add_sample_integrations(g: Graph) -> None:
    """Add sample integration individuals (CQ-071 through CQ-077)."""
    # Integration 1: GitHub MCP server (connected, provides read_tool + bash_tool)
    int1 = PAO.integration_github_001
    g.add((int1, RDF.type, PAO.Integration))
    g.add((int1, RDF.type, OWL.NamedIndividual))
    g.add((int1, RDFS.label, Literal("GitHub integration 001", lang="en")))
    g.add((int1, PAO.hasIntegrationStatus, PAO.Connected))
    g.add((int1, PAO.hasServiceName, Literal("GitHub")))
    g.add((int1, PAO.hasEndpoint, Literal("https://api.github.com", datatype=XSD.anyURI)))
    g.add((int1, PAO.providesTool, PAO.read_tool))
    g.add((int1, PAO.providesTool, PAO.bash_tool))
    # Link agent to integration (CQ-071)
    g.add((PAO.claude_agent, PAO.hasIntegration, int1))

    # Integration 2: Notion connector (error state, provides one tool)
    notion_tool = PAO.notion_search_tool
    g.add((notion_tool, RDF.type, PAO.ToolDefinition))
    g.add((notion_tool, RDF.type, OWL.NamedIndividual))
    g.add((notion_tool, RDFS.label, Literal("Notion Search Tool", lang="en")))
    g.add((notion_tool, PAO.hasContent, Literal("Search Notion workspace")))

    int2 = PAO.integration_notion_001
    g.add((int2, RDF.type, PAO.Integration))
    g.add((int2, RDF.type, OWL.NamedIndividual))
    g.add((int2, RDFS.label, Literal("Notion integration 001", lang="en")))
    g.add((int2, PAO.hasIntegrationStatus, PAO.Error))
    g.add((int2, PAO.hasServiceName, Literal("Notion")))
    g.add((int2, PAO.hasEndpoint, Literal("https://api.notion.com/v1", datatype=XSD.anyURI)))
    g.add((int2, PAO.providesTool, notion_tool))
    g.add((PAO.claude_agent, PAO.hasIntegration, int2))


def _add_sample_external_services(g: Graph) -> None:
    """Add sample external service individuals (CQ-079 through CQ-082)."""
    # External service: GitHub MCP
    svc1 = PAO.ext_svc_github
    g.add((svc1, RDF.type, PAO.ExternalService))
    g.add((svc1, RDF.type, OWL.NamedIndividual))
    g.add((svc1, RDFS.label, Literal("GitHub MCP service", lang="en")))
    g.add((svc1, PAO.hasServiceTransport, Literal("stdio")))
    g.add((svc1, PAO.hasServiceIdentifier, Literal("github-mcp-server")))

    # Tool capability exposed by service
    cap1 = PAO.cap_github_read
    g.add((cap1, RDF.type, PAO.ServiceToolCapability))
    g.add((cap1, RDF.type, OWL.NamedIndividual))
    g.add((cap1, RDFS.label, Literal("GitHub read capability", lang="en")))
    g.add((svc1, PAO.exposesCapability, cap1))

    # Resource capability
    cap2 = PAO.cap_github_repo
    g.add((cap2, RDF.type, PAO.ServiceResourceCapability))
    g.add((cap2, RDF.type, OWL.NamedIndividual))
    g.add((cap2, RDFS.label, Literal("GitHub repo resource capability", lang="en")))
    g.add((svc1, PAO.exposesCapability, cap2))

    # Prompt capability
    cap3 = PAO.cap_github_prompt
    g.add((cap3, RDF.type, PAO.ServicePromptCapability))
    g.add((cap3, RDF.type, OWL.NamedIndividual))
    g.add((cap3, RDFS.label, Literal("GitHub code-review prompt capability", lang="en")))
    g.add((svc1, PAO.exposesCapability, cap3))

    # Link agent to service (CQ-079)
    g.add((PAO.claude_agent, PAO.hasExternalService, svc1))

    # Service connection with status (CQ-080)
    conn1 = PAO.svc_conn_github_01
    g.add((conn1, RDF.type, PAO.ServiceConnection))
    g.add((conn1, RDF.type, OWL.NamedIndividual))
    g.add((conn1, RDFS.label, Literal("GitHub connection 01", lang="en")))
    g.add((conn1, PAO.connectsToService, svc1))
    g.add((conn1, PAO.hasConnectionStatus, PAO.Open))
    g.add((PAO.claude_agent, PAO.hasServiceConnection, conn1))

    # Capability discovery event (CQ-082)
    disc1 = PAO.discovery_github_01
    g.add((disc1, RDF.type, PAO.CapabilityDiscoveryEvent))
    g.add((disc1, RDF.type, OWL.NamedIndividual))
    g.add((disc1, RDFS.label, Literal("GitHub capability discovery 01", lang="en")))
    g.add((disc1, PAO.discoveredCapability, cap1))
    g.add((disc1, PAO.discoveredCapability, cap2))
    g.add((disc1, PAO.discoveredCapability, cap3))
    g.add((disc1, PAO.discoveryAgainstService, svc1))
    g.add((disc1, PAO.hasTimestamp, Literal("2026-02-20T10:00:00Z", datatype=XSD.dateTime)))


def _add_sample_runtime_safety(g: Graph) -> None:
    """Add sample runtime safety individuals (CQ-083 through CQ-086)."""
    # Permission mode (CQ-083)
    g.add((PAO.claude_agent, PAO.operatesInMode, PAO.Standard))

    # Sandbox policy (CQ-083)
    sandbox = PAO.sandbox_default
    g.add((sandbox, RDF.type, PAO.SandboxPolicy))
    g.add((sandbox, RDF.type, OWL.NamedIndividual))
    g.add((sandbox, RDFS.label, Literal("Default sandbox policy", lang="en")))
    g.add((PAO.claude_agent, PAO.enforcedBySandboxPolicy, sandbox))

    # Hook (CQ-084)
    hook1 = PAO.hook_pre_tool
    g.add((hook1, RDF.type, PAO.Hook))
    g.add((hook1, RDF.type, OWL.NamedIndividual))
    g.add((hook1, RDFS.label, Literal("Pre-tool invocation hook", lang="en")))
    g.add((PAO.claude_agent, PAO.hasHook, hook1))

    # Hook execution (CQ-085)
    hook_exec1 = PAO.hook_exec_01
    g.add((hook_exec1, RDF.type, PAO.HookExecution))
    g.add((hook_exec1, RDF.type, OWL.NamedIndividual))
    g.add((hook_exec1, RDFS.label, Literal("Hook execution 01", lang="en")))
    g.add((hook1, PAO.hookTriggeredExecution, hook_exec1))
    g.add((hook_exec1, PAO.interceptsInvocation, PAO.invocation_001))
    g.add((hook_exec1, PAO.hasTimestamp, Literal("2026-02-20T10:30:00Z", datatype=XSD.dateTime)))

    # Audit log + entry (CQ-086)
    audit_log = PAO.audit_log_01
    g.add((audit_log, RDF.type, PAO.AuditLog))
    g.add((audit_log, RDF.type, OWL.NamedIndividual))
    g.add((audit_log, RDFS.label, Literal("Primary audit log", lang="en")))

    audit_entry = PAO.audit_entry_01
    g.add((audit_entry, RDF.type, PAO.AuditEntry))
    g.add((audit_entry, RDF.type, OWL.NamedIndividual))
    g.add((audit_entry, RDFS.label, Literal("Audit entry 01", lang="en")))
    g.add((audit_entry, PAO.writtenToAuditLog, audit_log))
    g.add((audit_entry, PAO.recordsDecision, PAO.Allow))
    g.add((audit_entry, PAO.auditForInvocation, PAO.invocation_001))
    g.add((audit_entry, PAO.hasDecisionReason, Literal("Tool is in allowlist")))
    g.add((audit_entry, PAO.hasTimestamp, Literal("2026-02-20T10:30:01Z", datatype=XSD.dateTime)))

    # Second audit entry — denied operation (CQ-086)
    denied_inv = PAO.invocation_denied_01
    g.add((denied_inv, RDF.type, PAO.ToolInvocation))
    g.add((denied_inv, RDF.type, OWL.NamedIndividual))
    g.add((denied_inv, RDFS.label, Literal("Denied invocation 01", lang="en")))
    g.add((denied_inv, PAO.invokesTool, PAO.read_tool))
    g.add((denied_inv, PAO.invokedBy, PAO.claude_agent))
    g.add((denied_inv, PAO.performedBy, PAO.claude_agent))
    g.add((denied_inv, PAO.inSession, PAO.session_001))
    g.add((denied_inv, PAO.governedByPolicy, PAO.policy_001))
    g.add((denied_inv, PAO.hasComplianceStatus, PAO.NonCompliant))
    denied_input = PAO.invocation_denied_01_input
    g.add((denied_input, RDF.type, PROV.Entity))
    g.add((denied_input, RDF.type, OWL.NamedIndividual))
    g.add((denied_input, RDFS.label, Literal("Denied invocation 01 input", lang="en")))
    g.add((denied_inv, PAO.hasInput, denied_input))
    denied_output = PAO.invocation_denied_01_output
    g.add((denied_output, RDF.type, PROV.Entity))
    g.add((denied_output, RDF.type, OWL.NamedIndividual))
    g.add((denied_output, RDFS.label, Literal("Denied invocation 01 output", lang="en")))
    g.add((denied_inv, PAO.hasOutput, denied_output))
    denied_result = PAO.tool_result_denied_01
    g.add((denied_result, RDF.type, PAO.ToolResult))
    g.add((denied_result, RDF.type, OWL.NamedIndividual))
    g.add((denied_result, RDFS.label, Literal("Denied tool result 01", lang="en")))
    g.add((denied_inv, PAO.producedToolResult, denied_result))

    audit_entry2 = PAO.audit_entry_02
    g.add((audit_entry2, RDF.type, PAO.AuditEntry))
    g.add((audit_entry2, RDF.type, OWL.NamedIndividual))
    g.add((audit_entry2, RDFS.label, Literal("Audit entry 02", lang="en")))
    g.add((audit_entry2, PAO.writtenToAuditLog, audit_log))
    g.add((audit_entry2, PAO.recordsDecision, PAO.Deny))
    g.add((audit_entry2, PAO.auditForInvocation, denied_inv))
    g.add((audit_entry2, PAO.hasDecisionReason, Literal("Tool is in blocklist")))
    g.add((audit_entry2, PAO.hasTimestamp, Literal("2026-02-20T10:31:00Z", datatype=XSD.dateTime)))


def _add_sample_recovery(g: Graph) -> None:
    """Add sample recovery individuals (CQ-087 through CQ-089)."""
    # A failed invocation to recover from
    failed_inv = PAO.invocation_failed_01
    g.add((failed_inv, RDF.type, PAO.ToolInvocation))
    g.add((failed_inv, RDF.type, OWL.NamedIndividual))
    g.add((failed_inv, RDFS.label, Literal("Failed invocation 01", lang="en")))
    g.add((failed_inv, PAO.invokesTool, PAO.bash_tool))
    g.add((failed_inv, PAO.invokedBy, PAO.claude_agent))
    g.add((failed_inv, PAO.performedBy, PAO.claude_agent))
    g.add((failed_inv, PAO.inSession, PAO.session_001))
    g.add((failed_inv, PAO.governedByPolicy, PAO.policy_001))
    g.add((failed_inv, PAO.hasComplianceStatus, PAO.Compliant))
    failed_input = PAO.invocation_failed_01_input
    g.add((failed_input, RDF.type, PROV.Entity))
    g.add((failed_input, RDF.type, OWL.NamedIndividual))
    g.add((failed_input, RDFS.label, Literal("Failed invocation 01 input", lang="en")))
    g.add((failed_inv, PAO.hasInput, failed_input))
    failed_output = PAO.invocation_failed_01_output
    g.add((failed_output, RDF.type, PROV.Entity))
    g.add((failed_output, RDF.type, OWL.NamedIndividual))
    g.add((failed_output, RDFS.label, Literal("Failed invocation 01 output", lang="en")))
    g.add((failed_inv, PAO.hasOutput, failed_output))
    failed_result = PAO.tool_result_failed_01
    g.add((failed_result, RDF.type, PAO.ToolResult))
    g.add((failed_result, RDF.type, OWL.NamedIndividual))
    g.add((failed_result, RDFS.label, Literal("Failed tool result 01", lang="en")))
    g.add((failed_inv, PAO.producedToolResult, failed_result))

    # Error recovery event (CQ-087)
    recovery = PAO.recovery_event_01
    g.add((recovery, RDF.type, PAO.ErrorRecoveryEvent))
    g.add((recovery, RDF.type, OWL.NamedIndividual))
    g.add((recovery, RDFS.label, Literal("Recovery event 01", lang="en")))
    g.add((recovery, PAO.recoveringFrom, failed_inv))
    g.add((recovery, PAO.hasAttemptCount, Literal(2, datatype=XSD.nonNegativeInteger)))
    g.add((recovery, PAO.hasRecoveryOutcome, Literal("resolved")))
    g.add((recovery, PAO.hasFailureType, PAO.Timeout))  # v0.7.0
    g.add((recovery, PAO.hasTimestamp, Literal("2026-02-20T11:00:00Z", datatype=XSD.dateTime)))

    # Retry attempt
    retry = PAO.retry_01
    g.add((retry, RDF.type, PAO.RetryAttempt))
    g.add((retry, RDF.type, OWL.NamedIndividual))
    g.add((retry, RDFS.label, Literal("Retry attempt 01", lang="en")))
    g.add((retry, PAO.hasTimestamp, Literal("2026-02-20T11:00:05Z", datatype=XSD.dateTime)))
    g.add((recovery, PAO.attemptedRetry, retry))

    # Replan event
    replan = PAO.replan_01
    g.add((replan, RDF.type, PAO.ReplanEvent))
    g.add((replan, RDF.type, OWL.NamedIndividual))
    g.add((replan, RDFS.label, Literal("Replan event 01", lang="en")))
    g.add((replan, PAO.hasTimestamp, Literal("2026-02-20T11:00:10Z", datatype=XSD.dateTime)))
    g.add((recovery, PAO.triggeredReplan, replan))

    # Checkpoint with decision (CQ-088/089)
    checkpoint = PAO.checkpoint_01
    g.add((checkpoint, RDF.type, PAO.Checkpoint))
    g.add((checkpoint, RDF.type, OWL.NamedIndividual))
    g.add((checkpoint, RDFS.label, Literal("Checkpoint 01", lang="en")))
    g.add((checkpoint, PAO.checkpointForTask, PAO.task_001))
    g.add((checkpoint, PAO.checkpointDecision, PAO.Approved))
    g.add((checkpoint, PAO.hasTimestamp, Literal("2026-02-20T11:05:00Z", datatype=XSD.dateTime)))


def _add_sample_tool_trace(g: Graph) -> None:
    """Add sample tool trace individuals (CQ-090 through CQ-092)."""
    # ToolInvocationGroup (CQ-090)
    group = PAO.invocation_group_01
    g.add((group, RDF.type, PAO.ToolInvocationGroup))
    g.add((group, RDF.type, OWL.NamedIndividual))
    g.add((group, RDFS.label, Literal("Invocation group 01", lang="en")))
    g.add((group, PAO.groupedInTurn, PAO.turn_001))
    # Link existing invocations to group
    g.add((PAO.invocation_001, PAO.partOfInvocationGroup, group))

    # ToolResult (CQ-091)
    result = PAO.tool_result_01
    g.add((result, RDF.type, PAO.ToolResult))
    g.add((result, RDF.type, OWL.NamedIndividual))
    g.add((result, RDFS.label, Literal("Tool result 01", lang="en")))
    g.add((result, PAO.hasContent, Literal("File contents returned", lang="en")))
    g.add((PAO.invocation_001, PAO.producedToolResult, result))

    # ContentBlock (CQ-092)
    block1 = PAO.content_block_01
    g.add((block1, RDF.type, PAO.ContentBlock))
    g.add((block1, RDF.type, OWL.NamedIndividual))
    g.add((block1, RDFS.label, Literal("Content block 01", lang="en")))
    g.add((block1, PAO.hasContentBlockType, PAO.TextBlock))
    g.add((block1, PAO.blockSequenceIndex, Literal(0, datatype=XSD.nonNegativeInteger)))
    g.add((PAO.msg_001, PAO.hasContentBlock, block1))

    block2 = PAO.content_block_02
    g.add((block2, RDF.type, PAO.ContentBlock))
    g.add((block2, RDF.type, OWL.NamedIndividual))
    g.add((block2, RDFS.label, Literal("Content block 02", lang="en")))
    g.add((block2, PAO.hasContentBlockType, PAO.ToolUseBlock))
    g.add((block2, PAO.blockSequenceIndex, Literal(1, datatype=XSD.nonNegativeInteger)))
    g.add((PAO.msg_001, PAO.hasContentBlock, block2))


def _add_sample_memory_control_plane(g: Graph) -> None:
    """Add sample memory control plane individuals (CQ-093 through CQ-095)."""
    # Memory source/scope on existing items (CQ-093)
    g.add((PAO.claim_002, PAO.hasMemorySource, PAO.UserSource))
    g.add((PAO.claim_002, PAO.hasMemoryScope, PAO.SessionScope))

    # SharedMemoryArtifact (CQ-094)
    shared = PAO.shared_memory_01
    g.add((shared, RDF.type, PAO.SharedMemoryArtifact))
    g.add((shared, RDF.type, OWL.NamedIndividual))
    g.add((shared, RDFS.label, Literal("Shared memory artifact 01", lang="en")))
    g.add((shared, PAO.sharedAcrossAgents, PAO.claude_agent))
    g.add((shared, PAO.sharedAcrossAgents, PAO.search_subagent))

    # MemoryWriteConflict (CQ-095)
    conflict = PAO.write_conflict_01
    g.add((conflict, RDF.type, PAO.MemoryWriteConflict))
    g.add((conflict, RDF.type, OWL.NamedIndividual))
    g.add((conflict, RDFS.label, Literal("Write conflict 01", lang="en")))
    g.add((conflict, PAO.conflictOnArtifact, shared))
    g.add((conflict, PAO.writesByAgent, PAO.claude_agent))
    g.add((conflict, PAO.writesByAgent, PAO.search_subagent))
    g.add((conflict, PAO.hasTimestamp, Literal("2026-02-20T12:00:00Z", datatype=XSD.dateTime)))


def _add_sample_dialog_pragmatics(g: Graph) -> None:
    """Add sample dialog pragmatics individuals (CQ-096 through CQ-098)."""
    # DialogAct (CQ-096)
    dialog_act = PAO.dialog_act_01
    g.add((dialog_act, RDF.type, PAO.DialogAct))
    g.add((dialog_act, RDF.type, OWL.NamedIndividual))
    g.add((dialog_act, RDFS.label, Literal("Dialog act 01", lang="en")))
    g.add((dialog_act, PAO.hasCommunicativeFunction, PAO.Inform))
    g.add((PAO.turn_001, PAO.hasDialogAct, dialog_act))

    # CommonGround and GroundingAct (CQ-097)
    common_ground = PAO.common_ground_session_01
    g.add((common_ground, RDF.type, PAO.CommonGround))
    g.add((common_ground, RDF.type, OWL.NamedIndividual))
    g.add((common_ground, RDFS.label, Literal("Common ground session 01", lang="en")))

    grounding_act = PAO.grounding_act_01
    g.add((grounding_act, RDF.type, PAO.GroundingAct))
    g.add((grounding_act, RDF.type, OWL.NamedIndividual))
    g.add((grounding_act, RDFS.label, Literal("Grounding act 01", lang="en")))
    g.add((grounding_act, PAO.contributesToCommonGround, common_ground))
    g.add((grounding_act, PAO.hasTimestamp, Literal("2026-02-20T12:05:00Z", datatype=XSD.dateTime)))

    # AcceptanceEvidence
    evidence = PAO.acceptance_evidence_01
    g.add((evidence, RDF.type, PAO.AcceptanceEvidence))
    g.add((evidence, RDF.type, OWL.NamedIndividual))
    g.add((evidence, RDFS.label, Literal("Acceptance evidence 01", lang="en")))
    g.add((grounding_act, PAO.providesAcceptanceEvidence, evidence))

    # ClarificationRequest (CQ-098)
    clarification = PAO.clarification_request_01
    g.add((clarification, RDF.type, PAO.ClarificationRequest))
    g.add((clarification, RDF.type, OWL.NamedIndividual))
    g.add((clarification, RDFS.label, Literal("Clarification request 01", lang="en")))
    g.add((clarification, PAO.clarifiesTurn, PAO.turn_001))


def _add_sample_model_identity(g: Graph) -> None:
    """Add sample model identity individuals (CQ-099 through CQ-103)."""
    # --- provider individual for CQ-101 ---
    provider = PAO.provider_anthropic
    g.add((provider, RDF.type, PAO.ModelProvider))
    g.add((provider, RDF.type, OWL.NamedIndividual))
    g.add((provider, RDFS.label, Literal("Anthropic", lang="en")))

    # FoundationModel (CQ-099, CQ-100, CQ-101, CQ-103)
    model = PAO.model_claude_opus
    g.add((model, RDF.type, PAO.FoundationModel))
    g.add((model, RDF.type, OWL.NamedIndividual))
    g.add((model, RDFS.label, Literal("Claude Opus", lang="en")))
    g.add((model, PAO.hasModelId, Literal("claude-opus-4-6")))
    g.add((model, PAO.hasModelVersion, Literal("4.6")))
    g.add((model, PAO.hasProvider, provider))

    # --- deployment individual for CQ-100 ---
    deployment = PAO.deployment_opus_prod
    g.add((deployment, RDF.type, PAO.ModelDeployment))
    g.add((deployment, RDF.type, OWL.NamedIndividual))
    g.add((deployment, RDFS.label, Literal("Opus production deployment", lang="en")))
    g.add((model, PAO.deployedAs, deployment))

    # --- generation config individual for CQ-102 ---
    gen_config = PAO.gen_config_01
    g.add((gen_config, RDF.type, PAO.GenerationConfiguration))
    g.add((gen_config, RDF.type, OWL.NamedIndividual))
    g.add((gen_config, RDFS.label, Literal("Generation config 01", lang="en")))
    g.add((gen_config, PAO.hasTemperature, Literal("0.7", datatype=XSD.decimal)))
    g.add((gen_config, PAO.hasTopP, Literal("0.95", datatype=XSD.decimal)))
    g.add((gen_config, PAO.hasMaxOutputTokens, Literal(4096, datatype=XSD.nonNegativeInteger)))
    g.add((gen_config, PAO.hasPromptVersion, Literal("v2.1")))
    g.add((gen_config, PAO.hasSeed, Literal(42, datatype=XSD.nonNegativeInteger)))

    # ModelInvocation (CQ-099, CQ-102)
    invocation = PAO.model_invocation_01
    g.add((invocation, RDF.type, PAO.ModelInvocation))
    g.add((invocation, RDF.type, OWL.NamedIndividual))
    g.add((invocation, RDFS.label, Literal("Model invocation 01", lang="en")))
    g.add((invocation, PAO.invokedOnDeployment, deployment))
    g.add((invocation, PAO.hasGenerationConfig, gen_config))
    g.add((invocation, PAO.modelInvocationForTurn, PAO.turn_001))
    g.add((invocation, PAO.hasTimestamp, Literal("2026-02-20T10:00:01Z", datatype=XSD.dateTime)))

    # Link agents to model (CQ-103)
    g.add((PAO.claude_agent, PAO.usesModel, model))
    g.add((PAO.search_subagent, PAO.usesModel, model))


def _add_sample_observability(g: Graph) -> None:
    """Add sample observability individuals (CQ-104 through CQ-107)."""
    # --- operational metric individual for CQ-105 ---
    metric = PAO.metric_latency_p99
    g.add((metric, RDF.type, PAO.OperationalMetric))
    g.add((metric, RDF.type, OWL.NamedIndividual))
    g.add((metric, RDFS.label, Literal("Latency P99", lang="en")))
    g.add((metric, PAO.hasMetricName, Literal("latency_p99_ms")))

    # --- metric observation individual for CQ-104 ---
    obs = PAO.metric_obs_01
    g.add((obs, RDF.type, PAO.MetricObservation))
    g.add((obs, RDF.type, OWL.NamedIndividual))
    g.add((obs, RDFS.label, Literal("Metric observation 01", lang="en")))
    g.add((obs, PAO.observesMetric, metric))
    g.add((obs, PAO.observedOnEntity, PAO.claude_agent))
    g.add((obs, PAO.hasMetricValue, Literal("142.5", datatype=XSD.decimal)))
    g.add((obs, PAO.hasTimestamp, Literal("2026-02-20T12:00:00Z", datatype=XSD.dateTime)))

    # --- reliability incident individual for CQ-106 and CQ-107 ---
    incident = PAO.incident_01
    g.add((incident, RDF.type, PAO.ReliabilityIncident))
    g.add((incident, RDF.type, OWL.NamedIndividual))
    g.add((incident, RDFS.label, Literal("Reliability incident 01", lang="en")))
    g.add((incident, PAO.incidentForEntity, PAO.claude_agent))
    g.add((incident, PAO.linkedToRecovery, PAO.recovery_event_01))
    g.add((incident, PAO.hasTimestamp, Literal("2026-02-20T11:00:00Z", datatype=XSD.dateTime)))


def _add_sample_bdi(g: Graph) -> None:
    """Add sample BDI individuals (CQ-110 through CQ-113)."""
    # --- belief individual for CQ-110 ---
    belief = PAO.belief_01
    g.add((belief, RDF.type, PAO.Belief))
    g.add((belief, RDF.type, OWL.NamedIndividual))
    g.add((belief, RDFS.label, Literal("User prefers concise responses", lang="en")))
    g.add((PAO.claude_agent, PAO.heldBelief, belief))

    # --- desire individual for CQ-111 ---
    desire = PAO.desire_01
    g.add((desire, RDF.type, PAO.Desire))
    g.add((desire, RDF.type, OWL.NamedIndividual))
    g.add((desire, RDFS.label, Literal("Complete user task efficiently", lang="en")))
    g.add((PAO.claude_agent, PAO.holdsDesire, desire))

    # --- deliberation individual for CQ-112 ---
    deliberation = PAO.deliberation_01
    g.add((deliberation, RDF.type, PAO.Deliberation))
    g.add((deliberation, RDF.type, OWL.NamedIndividual))
    g.add((deliberation, RDFS.label, Literal("Deliberation 01", lang="en")))
    g.add((deliberation, PAO.considersBelief, belief))
    g.add((deliberation, PAO.considersDesire, desire))
    g.add((deliberation, PAO.producesIntention, PAO.intention_001))
    g.add((deliberation, PAO.hasTimestamp, Literal("2026-02-20T10:05:00Z", datatype=XSD.dateTime)))

    # --- justification individual for CQ-113 ---
    justification = PAO.justification_01
    g.add((justification, RDF.type, PAO.Justification))
    g.add((justification, RDF.type, OWL.NamedIndividual))
    g.add((justification, RDFS.label, Literal("Justification 01", lang="en")))
    g.add((justification, PAO.justifiesIntention, PAO.intention_001))


def _add_sample_scheduling(g: Graph) -> None:
    """Add sample scheduling individuals (CQ-114 through CQ-128)."""
    # --- CronTrigger individual for CQ-124/125 ---
    cron_trigger = PAO.cron_trigger_01
    g.add((cron_trigger, RDF.type, PAO.CronTrigger))
    g.add((cron_trigger, RDF.type, OWL.NamedIndividual))
    g.add((cron_trigger, RDFS.label, Literal("Daily 08:00 cron trigger", lang="en")))

    # --- RecurrencePattern individual for CQ-115 ---
    pattern = PAO.recurrence_pattern_01
    g.add((pattern, RDF.type, PAO.RecurrencePattern))
    g.add((pattern, RDF.type, OWL.NamedIndividual))
    g.add((pattern, RDFS.label, Literal("Daily at 08:00", lang="en")))
    g.add((pattern, PAO.hasCronExpression, Literal("0 8 * * *")))

    # --- Action individual (reuse existing or create a generic one) ---
    sched_action = PAO.action_daily_summary
    g.add((sched_action, RDF.type, PAO.Action))
    g.add((sched_action, RDF.type, OWL.NamedIndividual))
    g.add((sched_action, RDFS.label, Literal("Daily summary action", lang="en")))
    g.add((sched_action, PAO.performedBy, PAO.claude_agent))

    # --- Schedule individual for CQ-114/115/116/117/121/123/124/126/127 ---
    schedule = PAO.schedule_daily_summary
    g.add((schedule, RDF.type, PAO.Schedule))
    g.add((schedule, RDF.type, OWL.NamedIndividual))
    g.add((schedule, RDFS.label, Literal("Daily summary schedule", lang="en")))
    g.add((schedule, PAO.hasRecurrencePattern, pattern))
    g.add((schedule, PAO.schedulesAction, sched_action))
    g.add((schedule, PAO.hasScheduleStatus, PAO.ScheduleActive))
    g.add((schedule, PAO.activatedBy, cron_trigger))
    g.add((schedule, PAO.ownedByAgent, PAO.claude_agent))
    g.add((schedule, PAO.hasConcurrencyPolicy, PAO.ConcurrencyForbid))
    g.add((schedule, PAO.allowsCatchUp, Literal(True, datatype=XSD.boolean)))
    g.add((schedule, PAO.servesGoal, PAO.goal_001))

    # --- ScheduledExecution individual for CQ-118/119/120/128 ---
    execution = PAO.sched_exec_01
    g.add((execution, RDF.type, PAO.ScheduledExecution))
    g.add((execution, RDF.type, OWL.NamedIndividual))
    g.add((execution, RDFS.label, Literal("Scheduled execution 01", lang="en")))
    g.add((execution, PAO.executionOf, schedule))
    g.add((execution, PAO.hasExecutionOutcome, PAO.ExecutionSucceeded))
    g.add((execution, PAO.hasTimestamp, Literal("2026-02-21T08:00:00Z", datatype=XSD.dateTime)))
    g.add((execution, PAO.initiatedSession, PAO.session_001))

    # Temporal extent for execution (CQ-120)
    exec_interval = PAO.sched_exec_01_interval
    g.add((exec_interval, RDF.type, TIME.Interval))
    g.add((execution, PAO.hasTemporalExtent, exec_interval))
    exec_begin = PAO.sched_exec_01_begin
    g.add((exec_begin, RDF.type, TIME.Instant))
    g.add((exec_begin, TIME.inXSDDateTime, Literal("2026-02-21T08:00:00Z", datatype=XSD.dateTime)))
    exec_end = PAO.sched_exec_01_end
    g.add((exec_end, RDF.type, TIME.Instant))
    g.add((exec_end, TIME.inXSDDateTime, Literal("2026-02-21T08:05:00Z", datatype=XSD.dateTime)))
    g.add((exec_interval, TIME.hasBeginning, exec_begin))
    g.add((exec_interval, TIME.hasEnd, exec_end))

    # --- Second execution (skipped) for CQ-122 ---
    execution2 = PAO.sched_exec_02
    g.add((execution2, RDF.type, PAO.ScheduledExecution))
    g.add((execution2, RDF.type, OWL.NamedIndividual))
    g.add((execution2, RDFS.label, Literal("Scheduled execution 02 (skipped)", lang="en")))
    g.add((execution2, PAO.executionOf, schedule))
    g.add((execution2, PAO.hasExecutionOutcome, PAO.ExecutionSkipped))
    g.add((execution2, PAO.hasTimestamp, Literal("2026-02-21T08:00:05Z", datatype=XSD.dateTime)))

    # Temporal extent for skipped execution
    exec2_interval = PAO.sched_exec_02_interval
    g.add((exec2_interval, RDF.type, TIME.Interval))
    g.add((execution2, PAO.hasTemporalExtent, exec2_interval))
    exec2_begin = PAO.sched_exec_02_begin
    g.add((exec2_begin, RDF.type, TIME.Instant))
    g.add((exec2_begin, TIME.inXSDDateTime, Literal("2026-02-21T08:00:05Z", datatype=XSD.dateTime)))
    exec2_end = PAO.sched_exec_02_end
    g.add((exec2_end, RDF.type, TIME.Instant))
    g.add((exec2_end, TIME.inXSDDateTime, Literal("2026-02-21T08:00:05Z", datatype=XSD.dateTime)))
    g.add((exec2_interval, TIME.hasBeginning, exec2_begin))
    g.add((exec2_interval, TIME.hasEnd, exec2_end))

    # --- IntervalTrigger individual for CQ-124/125 variety ---
    interval_trigger = PAO.interval_trigger_01
    g.add((interval_trigger, RDF.type, PAO.IntervalTrigger))
    g.add((interval_trigger, RDF.type, OWL.NamedIndividual))
    g.add((interval_trigger, RDFS.label, Literal("30-minute interval trigger", lang="en")))

    # --- RecurrencePattern with interval for the interval trigger ---
    pattern2 = PAO.recurrence_pattern_02
    g.add((pattern2, RDF.type, PAO.RecurrencePattern))
    g.add((pattern2, RDF.type, OWL.NamedIndividual))
    g.add((pattern2, RDFS.label, Literal("Every 30 minutes", lang="en")))
    g.add((pattern2, PAO.hasIntervalSeconds, Literal(1800, datatype=XSD.nonNegativeInteger)))

    # --- Interval-based schedule (linked end-to-end) ---
    action_health = PAO.action_health_check
    g.add((action_health, RDF.type, PAO.Action))
    g.add((action_health, RDF.type, OWL.NamedIndividual))
    g.add((action_health, RDFS.label, Literal("Health check action", lang="en")))
    g.add((action_health, PAO.performedBy, PAO.claude_agent))

    schedule2 = PAO.schedule_health_check
    g.add((schedule2, RDF.type, PAO.Schedule))
    g.add((schedule2, RDF.type, OWL.NamedIndividual))
    g.add((schedule2, RDFS.label, Literal("Health check schedule", lang="en")))
    g.add((schedule2, PAO.hasRecurrencePattern, pattern2))
    g.add((schedule2, PAO.schedulesAction, action_health))
    g.add((schedule2, PAO.hasScheduleStatus, PAO.ScheduleActive))
    g.add((schedule2, PAO.activatedBy, interval_trigger))
    g.add((schedule2, PAO.ownedByAgent, PAO.claude_agent))
    g.add((schedule2, PAO.hasConcurrencyPolicy, PAO.ConcurrencyAllow))
    g.add((schedule2, PAO.allowsCatchUp, Literal(False, datatype=XSD.boolean)))

    sched_exec_03 = PAO.sched_exec_03
    g.add((sched_exec_03, RDF.type, PAO.ScheduledExecution))
    g.add((sched_exec_03, RDF.type, OWL.NamedIndividual))
    g.add((sched_exec_03, RDFS.label, Literal("Health check execution 01", lang="en")))
    g.add((sched_exec_03, PAO.executionOf, schedule2))
    g.add((sched_exec_03, PAO.hasExecutionOutcome, PAO.ExecutionSucceeded))
    g.add((sched_exec_03, PAO.hasTimestamp, Literal("2026-02-21T09:30:00Z", datatype=XSD.dateTime)))
    exec3_interval = PAO.sched_exec_03_interval
    g.add((exec3_interval, RDF.type, TIME.Interval))
    g.add((sched_exec_03, PAO.hasTemporalExtent, exec3_interval))
    exec3_begin = PAO.sched_exec_03_begin
    g.add((exec3_begin, RDF.type, TIME.Instant))
    g.add((exec3_begin, TIME.inXSDDateTime, Literal("2026-02-21T09:30:00Z", datatype=XSD.dateTime)))
    exec3_end = PAO.sched_exec_03_end
    g.add((exec3_end, RDF.type, TIME.Instant))
    g.add((exec3_end, TIME.inXSDDateTime, Literal("2026-02-21T09:30:02Z", datatype=XSD.dateTime)))
    g.add((exec3_interval, TIME.hasBeginning, exec3_begin))
    g.add((exec3_interval, TIME.hasEnd, exec3_end))

    # --- EventTrigger individual (end-to-end) ---
    event_trigger = PAO.event_trigger_01
    g.add((event_trigger, RDF.type, PAO.EventTrigger))
    g.add((event_trigger, RDF.type, OWL.NamedIndividual))
    g.add((event_trigger, RDFS.label, Literal("On-message event trigger", lang="en")))

    pattern3 = PAO.recurrence_pattern_03
    g.add((pattern3, RDF.type, PAO.RecurrencePattern))
    g.add((pattern3, RDF.type, OWL.NamedIndividual))
    g.add((pattern3, RDFS.label, Literal("On every incoming message", lang="en")))
    # Event-driven patterns use interval=0 to indicate "on each event"
    g.add((pattern3, PAO.hasIntervalSeconds, Literal(0, datatype=XSD.nonNegativeInteger)))

    action_notify = PAO.action_notification
    g.add((action_notify, RDF.type, PAO.Action))
    g.add((action_notify, RDF.type, OWL.NamedIndividual))
    g.add((action_notify, RDFS.label, Literal("Notification action", lang="en")))
    g.add((action_notify, PAO.performedBy, PAO.claude_agent))

    schedule3 = PAO.schedule_notification
    g.add((schedule3, RDF.type, PAO.Schedule))
    g.add((schedule3, RDF.type, OWL.NamedIndividual))
    g.add((schedule3, RDFS.label, Literal("Notification schedule", lang="en")))
    g.add((schedule3, PAO.hasRecurrencePattern, pattern3))
    g.add((schedule3, PAO.schedulesAction, action_notify))
    g.add((schedule3, PAO.hasScheduleStatus, PAO.SchedulePaused))
    g.add((schedule3, PAO.activatedBy, event_trigger))
    g.add((schedule3, PAO.ownedByAgent, PAO.claude_agent))
    g.add((schedule3, PAO.hasConcurrencyPolicy, PAO.ConcurrencyReplace))
    g.add((schedule3, PAO.allowsCatchUp, Literal(False, datatype=XSD.boolean)))


def _ensure_temporal_extents(g: Graph) -> None:
    """Add hasTemporalExtent to all Event instances that lack one.

    Creates a time:Instant for each event with a timestamp derived from
    the event's hasTimestamp (if present) or a default timestamp.
    Events that already have hasTemporalExtent (e.g. Session, Episode)
    are skipped.
    """
    # All known Event subclasses (direct and transitive)
    event_classes: set[URIRef] = {
        PAO.Event,
        PAO.Action,
        PAO.Conversation,
        PAO.Session,
        PAO.Turn,
        PAO.CompactionEvent,
        PAO.ErasureEvent,
        PAO.MemoryOperation,
        PAO.Encoding,
        PAO.Retrieval,
        PAO.Consolidation,
        PAO.Forgetting,
        PAO.Rehearsal,
        PAO.Observation,
        PAO.StatusTransition,
        PAO.SessionStatusTransition,
        PAO.TaskStatusTransition,
        PAO.ToolInvocation,
        PAO.CapabilityDiscoveryEvent,
        PAO.HookExecution,
        PAO.ErrorRecoveryEvent,
        PAO.RetryAttempt,
        PAO.ReplanEvent,
        PAO.RollbackEvent,
        PAO.MemoryWriteConflict,
        PAO.GroundingAct,
        PAO.ModelInvocation,  # v0.7.0
        PAO.ReliabilityIncident,  # v0.7.0
        PAO.Deliberation,  # v0.7.0
        PAO.ScheduledExecution,  # v0.8.0
    }

    # Find all event instances missing hasTemporalExtent
    seen: set[URIRef] = set()
    missing: list[URIRef] = []
    for ec in event_classes:
        for s in g.subjects(RDF.type, ec):
            if s not in seen and not any(g.objects(s, PAO.hasTemporalExtent)):
                seen.add(s)
                missing.append(s)

    # Base timestamp for events without their own
    base_ts = "2026-02-18T10:00:00Z"

    for individual in sorted(missing, key=str):
        local_name = str(individual).replace(str(PAO), "")
        instant_uri = PAO[f"{local_name}_time"]

        # Try to reuse the individual's own timestamp if available
        ts_val = g.value(individual, PAO.hasTimestamp)
        ts_str = str(ts_val) if ts_val else base_ts

        g.add((instant_uri, RDF.type, TIME.Instant))
        g.add((instant_uri, TIME.inXSDDateTime, Literal(ts_str, datatype=XSD.dateTime)))
        g.add((individual, PAO.hasTemporalExtent, instant_uri))


# ---------------------------------------------------------------------------
# SHACL Shapes Builder
# ---------------------------------------------------------------------------


def build_shacl_shapes() -> Graph:
    """Build SHACL shapes for structural validation."""
    g = Graph()
    bind_common_prefixes(g)
    bind_shacl_prefix(g)

    # --- EventShape (v0.6.0 review: enforce temporal extent on all events) ---
    _add_shape(
        g,
        PAO.EventShape,
        PAO.Event,
        [
            _property_shape(
                g, PAO.hasTemporalExtent, min_count=1, class_constraint=TIME.TemporalEntity
            ),
        ],
    )

    # --- SubAgentShape ---
    _add_shape(
        g,
        PAO.SubAgentShape,
        PAO.SubAgent,
        [
            _property_shape(g, PAO.spawnedBy, min_count=1, max_count=1, class_constraint=PAO.Agent),
            _property_shape(g, PAO.delegatedTask, min_count=1, class_constraint=PAO.Task),
        ],
    )

    # --- AIAgentShape ---
    _add_shape(
        g,
        PAO.AIAgentShape,
        PAO.AIAgent,
        [
            _property_shape(
                g, PAO.hasAvailableTool, min_count=1, class_constraint=PAO.ToolDefinition
            ),
            _property_shape(g, PAO.hasAgentId, min_count=1, max_count=1, datatype=XSD.string),
            _property_shape(
                g, PAO.hasPersona, min_count=1, max_count=1, class_constraint=PAO.Persona
            ),
            _property_shape(
                g, PAO.operatesInMode, min_count=1, max_count=1, class_constraint=PAO.PermissionMode
            ),
            _property_shape(g, PAO.hasIntegration, min_count=1, class_constraint=PAO.Integration),
            _property_shape(
                g, PAO.hasExternalService, min_count=1, class_constraint=PAO.ExternalService
            ),
            _property_shape(g, PAO.hasHook, min_count=1, class_constraint=PAO.Hook),
            # v0.7.0: Model Identity — every AIAgent uses at least one model
            _property_shape(g, PAO.usesModel, min_count=1, class_constraint=PAO.FoundationModel),
        ],
    )

    # --- ConversationShape ---
    _add_shape(
        g,
        PAO.ConversationShape,
        PAO.Conversation,
        [
            _property_shape(g, PAO.hasParticipant, min_count=1, class_constraint=PAO.Agent),
            _property_shape(
                g, PAO.hasConversationId, min_count=1, max_count=1, datatype=XSD.string
            ),
        ],
    )

    # --- SessionShape ---
    _add_shape(
        g,
        PAO.SessionShape,
        PAO.Session,
        [
            _property_shape(
                g,
                PAO.partOfConversation,
                min_count=1,
                max_count=1,
                class_constraint=PAO.Conversation,
            ),
            _property_shape(
                g, PAO.hasStatus, min_count=1, max_count=1, class_constraint=PAO.SessionStatus
            ),
            _property_shape(g, PAO.hasSessionId, min_count=1, max_count=1, datatype=XSD.string),
            _property_shape(g, PAO.hasParticipant, min_count=1, class_constraint=PAO.Agent),
            _property_shape(g, PAO.hasTemporalExtent, min_count=1, class_constraint=TIME.Interval),
            _property_shape(
                g, PAO.hasContextWindow, max_count=1, class_constraint=PAO.ContextWindow
            ),
            _property_shape(
                g, PAO.viaChannel, max_count=1, class_constraint=PAO.CommunicationChannel
            ),
        ],
    )

    # --- TurnShape ---
    _add_shape(
        g,
        PAO.TurnShape,
        PAO.Turn,
        [
            _property_shape(
                g, PAO.partOfSession, min_count=1, max_count=1, class_constraint=PAO.Session
            ),
            _property_shape(g, PAO.hasParticipant, min_count=1, class_constraint=PAO.Agent),
            _property_shape(
                g,
                PAO.partOfConversation,
                min_count=1,
                max_count=1,
                class_constraint=PAO.Conversation,
            ),
            _property_shape(
                g, PAO.hasTurnIndex, min_count=1, max_count=1, datatype=XSD.nonNegativeInteger
            ),
        ],
    )

    # --- ToolInvocationShape ---
    _add_shape(
        g,
        PAO.ToolInvocationShape,
        PAO.ToolInvocation,
        [
            _property_shape(
                g, PAO.invokesTool, min_count=1, max_count=1, class_constraint=PAO.ToolDefinition
            ),
            _property_shape(g, PAO.invokedBy, min_count=1, max_count=1, class_constraint=PAO.Agent),
            _property_shape(
                g, PAO.inSession, min_count=1, max_count=1, class_constraint=PAO.Session
            ),
            _property_shape(
                g,
                PAO.governedByPolicy,
                min_count=1,
                max_count=1,
                class_constraint=PAO.PermissionPolicy,
            ),
            _property_shape(
                g,
                PAO.hasComplianceStatus,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ComplianceStatus,
            ),
            _property_shape(g, PAO.hasInput, min_count=1),
            _property_shape(g, PAO.hasOutput, min_count=1),
            _property_shape(
                g,
                PAO.producedToolResult,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ToolResult,
            ),
        ],
    )

    # --- ActionShape ---
    _add_shape(
        g,
        PAO.ActionShape,
        PAO.Action,
        [
            _property_shape(
                g, PAO.performedBy, min_count=1, max_count=1, class_constraint=PAO.Agent
            ),
        ],
    )

    # --- ClaimShape ---
    _add_shape(
        g,
        PAO.ClaimShape,
        PAO.Claim,
        [
            _property_shape(g, PAO.hasContent, min_count=1, max_count=1, datatype=XSD.string),
            _property_shape(
                g,
                PAO.hasConfidence,
                min_count=0,
                max_count=1,
                datatype=XSD.decimal,
                min_inclusive="0.0",
                max_inclusive="1.0",
            ),
            _property_shape(
                g, PAO.storedIn, min_count=1, max_count=1, class_constraint=PAO.MemoryTier
            ),
            _property_shape(g, PAO.aboutAgent, min_count=1, class_constraint=PAO.Agent),
            _property_shape(
                g, PAO.claimType, min_count=0, max_count=1, class_constraint=PAO.ClaimType
            ),
        ],
    )

    # --- TaskShape ---
    _add_shape(
        g,
        PAO.TaskShape,
        PAO.Task,
        [
            _property_shape(g, PAO.partOfPlan, min_count=1, max_count=1, class_constraint=PAO.Plan),
            _property_shape(
                g, PAO.hasStatus, min_count=1, max_count=1, class_constraint=PAO.TaskStatus
            ),
        ],
    )

    # --- PlanShape ---
    _add_shape(
        g,
        PAO.PlanShape,
        PAO.Plan,
        [
            _property_shape(g, PAO.achievesGoal, min_count=1, class_constraint=PAO.Goal),
        ],
    )

    # --- MemoryOperationShape ---
    _add_shape(
        g,
        PAO.MemoryOperationShape,
        PAO.MemoryOperation,
        [
            _property_shape(g, PAO.operatesOn, min_count=1, class_constraint=PAO.MemoryItem),
        ],
    )

    # --- ErasureEventShape ---
    _add_shape(
        g,
        PAO.ErasureEventShape,
        PAO.ErasureEvent,
        [
            _property_shape(
                g, PAO.requestedBy, min_count=1, max_count=1, class_constraint=PAO.Agent
            ),
        ],
    )

    # --- OrganizationShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.OrganizationShape,
        PAO.Organization,
        [
            _property_shape(g, PAO.hasMember, min_count=1, class_constraint=PAO.Agent),
        ],
    )

    # --- ObservationShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.ObservationShape,
        PAO.Observation,
        [
            _property_shape(
                g, PAO.inSession, min_count=1, max_count=1, class_constraint=PAO.Session
            ),
        ],
    )

    # --- MemoryBlockShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.MemoryBlockShape,
        PAO.MemoryBlock,
        [
            _property_shape(g, PAO.hasBlockKey, min_count=1, datatype=XSD.string),
            _property_shape(g, PAO.hasBlockValue, min_count=1, datatype=XSD.string),
        ],
    )

    # --- IntentionShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.IntentionShape,
        PAO.Intention,
        [
            _property_shape(g, PAO.intendedBy, min_count=1, class_constraint=PAO.Agent),
            _property_shape(g, PAO.derivedFromGoal, min_count=1, class_constraint=PAO.Goal),
        ],
    )

    # --- ConsentRecordShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.ConsentRecordShape,
        PAO.ConsentRecord,
        [
            _property_shape(
                g, PAO.consentSubject, min_count=1, max_count=1, class_constraint=PAO.Agent
            ),
        ],
    )

    # --- RetentionPolicyShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.RetentionPolicyShape,
        PAO.RetentionPolicy,
        [
            _property_shape(
                g,
                PAO.retentionPeriodDays,
                min_count=1,
                max_count=1,
                datatype=XSD.nonNegativeInteger,
            ),
        ],
    )

    # --- GoalShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.GoalShape,
        PAO.Goal,
        [
            _property_shape(g, PAO.pursuedBy, min_count=1, class_constraint=PAO.Agent),
            _property_shape(
                g, PAO.hasStatus, min_count=1, max_count=1, class_constraint=PAO.TaskStatus
            ),
        ],
    )

    # --- MemoryItemShape (v0.2.0, tightened v0.6.0 review) ---
    _add_shape(
        g,
        PAO.MemoryItemShape,
        PAO.MemoryItem,
        [
            _property_shape(
                g, PAO.storedIn, min_count=1, max_count=1, class_constraint=PAO.MemoryTier
            ),
            _property_shape(g, PROV.wasAttributedTo, min_count=1, class_constraint=PAO.Agent),
            _property_shape(g, PROV.wasGeneratedBy, min_count=1),
            _property_shape(
                g,
                PAO.hasSensitivityLevel,
                min_count=1,
                max_count=1,
                class_constraint=PAO.SensitivityLevel,
            ),
            _property_shape(
                g,
                PAO.governedByRetention,
                min_count=1,
                class_constraint=PAO.RetentionPolicy,
            ),
            _property_shape(g, PAO.hasLastAccessTime, max_count=1, datatype=XSD.dateTime),
        ],
    )

    # --- EpisodeShape (v0.2.0, tightened v0.6.0 review) ---
    _add_shape(
        g,
        PAO.EpisodeShape,
        PAO.Episode,
        [
            _property_shape(g, PAO.hasTemporalExtent, min_count=1, class_constraint=TIME.Interval),
            _property_shape(g, PAO.hasTopic, min_count=1, class_constraint=SKOS.Concept),
            _property_shape(
                g, PAO.storedIn, min_count=1, max_count=1, class_constraint=PAO.MemoryTier
            ),
        ],
    )

    # --- CompactionEventShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.CompactionEventShape,
        PAO.CompactionEvent,
        [
            _property_shape(
                g, PAO.inConversation, min_count=1, max_count=1, class_constraint=PAO.Conversation
            ),
            _property_shape(g, PAO.producedSummary, min_count=1, class_constraint=PAO.MemoryItem),
            _property_shape(g, PAO.compactedItem, min_count=1),
            _property_shape(
                g, PAO.compactedContextOf, max_count=1, class_constraint=PAO.ContextWindow
            ),
        ],
    )

    # --- MessageShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.MessageShape,
        PAO.Message,
        [
            _property_shape(g, PAO.hasContent, min_count=1, max_count=1, datatype=XSD.string),
            _property_shape(
                g, PAO.sentViaChannel, max_count=1, class_constraint=PAO.CommunicationChannel
            ),
        ],
    )

    # --- PersonaShape (v0.2.0) ---
    _add_shape(
        g,
        PAO.PersonaShape,
        PAO.Persona,
        [
            _property_shape(g, PAO.hasContent, min_count=1, max_count=1, datatype=XSD.string),
        ],
    )

    # --- StatusTransitionShape (v0.3.0) ---
    _add_shape(
        g,
        PAO.StatusTransitionShape,
        PAO.StatusTransition,
        [
            _property_shape(
                g, PAO.fromStatus, min_count=1, max_count=1, class_constraint=PAO.Status
            ),
            _property_shape(g, PAO.toStatus, min_count=1, max_count=1, class_constraint=PAO.Status),
            _property_shape(g, PAO.transitionSubject, min_count=1, max_count=1),
        ],
    )

    # --- CompactionDispositionShape (v0.3.0) ---
    _add_shape(
        g,
        PAO.CompactionDispositionShape,
        PAO.CompactionDisposition,
        [
            _property_shape(g, PAO.dispositionOf, min_count=1, max_count=1),
            _property_shape(
                g, PAO.hasItemFate, min_count=1, max_count=1, class_constraint=PAO.ItemFate
            ),
        ],
    )

    # --- ContextWindowShape (v0.4.0) ---
    cw_sparql = BNode()
    g.add(
        (
            cw_sparql,
            SH.select,
            Literal(
                "PREFIX pao: <https://purl.org/pao/>\n"
                "SELECT $this WHERE {\n"
                "  $this pao:hasTokensUsed ?used .\n"
                "  $this pao:hasTokenCapacity ?cap .\n"
                "  FILTER(?used > ?cap)\n"
                "}"
            ),
        )
    )
    g.add((cw_sparql, SH.message, Literal("hasTokensUsed must not exceed hasTokenCapacity")))
    _add_shape(
        g,
        PAO.ContextWindowShape,
        PAO.ContextWindow,
        [
            _property_shape(
                g, PAO.hasTokenCapacity, min_count=1, max_count=1, datatype=XSD.nonNegativeInteger
            ),
            _property_shape(
                g, PAO.hasTokensUsed, min_count=1, max_count=1, datatype=XSD.nonNegativeInteger
            ),
        ],
    )
    g.add((PAO.ContextWindowShape, SH.sparql, cw_sparql))

    # --- CommunicationChannelShape (v0.5.0) ---
    _add_shape(
        g,
        PAO.CommunicationChannelShape,
        PAO.CommunicationChannel,
        [
            _property_shape(
                g,
                PAO.hasChannelType,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ChannelType,
            ),
        ],
    )

    # --- IntegrationShape (v0.5.0) ---
    _add_shape(
        g,
        PAO.IntegrationShape,
        PAO.Integration,
        [
            _property_shape(g, PAO.providesTool, min_count=1, class_constraint=PAO.ToolDefinition),
            _property_shape(
                g,
                PAO.hasIntegrationStatus,
                min_count=1,
                max_count=1,
                class_constraint=PAO.IntegrationStatus,
            ),
            _property_shape(g, PAO.hasServiceName, min_count=1, max_count=1, datatype=XSD.string),
            _property_shape(g, PAO.hasEndpoint, max_count=1, datatype=XSD.anyURI),
        ],
    )

    # --- ExternalServiceShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.ExternalServiceShape,
        PAO.ExternalService,
        [
            _property_shape(
                g, PAO.exposesCapability, min_count=1, class_constraint=PAO.ServiceCapability
            ),
            _property_shape(
                g, PAO.hasServiceTransport, min_count=1, max_count=1, datatype=XSD.string
            ),
            _property_shape(
                g, PAO.hasServiceIdentifier, min_count=1, max_count=1, datatype=XSD.string
            ),
        ],
    )

    # --- CapabilityDiscoveryEventShape (v0.6.0 review) ---
    _add_shape(
        g,
        PAO.CapabilityDiscoveryEventShape,
        PAO.CapabilityDiscoveryEvent,
        [
            _property_shape(
                g,
                PAO.discoveredCapability,
                min_count=1,
                class_constraint=PAO.ServiceCapability,
            ),
            _property_shape(
                g,
                PAO.discoveryAgainstService,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ExternalService,
            ),
        ],
    )

    # --- ServiceConnectionShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.ServiceConnectionShape,
        PAO.ServiceConnection,
        [
            _property_shape(
                g,
                PAO.connectsToService,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ExternalService,
            ),
            _property_shape(
                g,
                PAO.hasConnectionStatus,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ConnectionStatus,
            ),
        ],
    )

    # --- HookExecutionShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.HookExecutionShape,
        PAO.HookExecution,
        [
            _property_shape(
                g,
                PAO.interceptsInvocation,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ToolInvocation,
            ),
        ],
    )

    # --- AuditEntryShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.AuditEntryShape,
        PAO.AuditEntry,
        [
            _property_shape(
                g, PAO.writtenToAuditLog, min_count=1, max_count=1, class_constraint=PAO.AuditLog
            ),
            _property_shape(
                g,
                PAO.recordsDecision,
                min_count=1,
                max_count=1,
                class_constraint=PAO.AuthorizationDecision,
            ),
            _property_shape(
                g,
                PAO.auditForInvocation,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ToolInvocation,
            ),
            _property_shape(g, PAO.hasDecisionReason, max_count=1, datatype=XSD.string),
        ],
    )

    # --- ErrorRecoveryEventShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.ErrorRecoveryEventShape,
        PAO.ErrorRecoveryEvent,
        [
            _property_shape(
                g,
                PAO.recoveringFrom,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ToolInvocation,
            ),
            _property_shape(
                g,
                PAO.hasAttemptCount,
                max_count=1,
                datatype=XSD.nonNegativeInteger,
            ),
            _property_shape(g, PAO.hasRecoveryOutcome, max_count=1, datatype=XSD.string),
            # v0.7.0: Failure Taxonomy — every recovery event has a failure type
            _property_shape(
                g, PAO.hasFailureType, min_count=1, max_count=1, class_constraint=PAO.FailureType
            ),
        ],
    )

    # --- CheckpointShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.CheckpointShape,
        PAO.Checkpoint,
        [
            _property_shape(
                g, PAO.checkpointForTask, min_count=1, max_count=1, class_constraint=PAO.Task
            ),
            _property_shape(
                g,
                PAO.checkpointDecision,
                min_count=1,
                max_count=1,
                class_constraint=PAO.CheckpointDecision,
            ),
        ],
    )

    # --- PermissionPolicyShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.PermissionPolicyShape,
        PAO.PermissionPolicy,
        [
            _property_shape(g, PAO.appliesTo, min_count=1, class_constraint=PAO.Agent),
            _property_shape(g, PAO.grantsPermission, min_count=1, class_constraint=ODRL.Permission),
            _property_shape(
                g,
                PAO.restrictsToolUse,
                min_count=1,
                class_constraint=PAO.ToolDefinition,
            ),
        ],
    )

    # --- SafetyConstraintShape (v0.6.0) ---
    _add_shape(
        g,
        PAO.SafetyConstraintShape,
        PAO.SafetyConstraint,
        [
            _property_shape(g, PAO.appliesTo, min_count=1, class_constraint=PAO.Agent),
        ],
    )

    # --- ToolInvocationGroupShape (v0.6.0 Phase B) ---
    _add_shape(
        g,
        PAO.ToolInvocationGroupShape,
        PAO.ToolInvocationGroup,
        [
            _property_shape(
                g, PAO.groupedInTurn, min_count=1, max_count=1, class_constraint=PAO.Turn
            ),
        ],
    )

    # --- ContentBlockShape (v0.6.0 Phase B) ---
    _add_shape(
        g,
        PAO.ContentBlockShape,
        PAO.ContentBlock,
        [
            _property_shape(
                g,
                PAO.hasContentBlockType,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ContentBlockType,
            ),
            _property_shape(
                g, PAO.blockSequenceIndex, max_count=1, datatype=XSD.nonNegativeInteger
            ),
        ],
    )

    # --- SharedMemoryArtifactShape (v0.6.0 Phase B) ---
    _add_shape(
        g,
        PAO.SharedMemoryArtifactShape,
        PAO.SharedMemoryArtifact,
        [
            _property_shape(g, PAO.sharedAcrossAgents, min_count=2, class_constraint=PAO.Agent),
        ],
    )

    # --- MemoryWriteConflictShape (v0.6.0 Phase B) ---
    _add_shape(
        g,
        PAO.MemoryWriteConflictShape,
        PAO.MemoryWriteConflict,
        [
            _property_shape(
                g,
                PAO.conflictOnArtifact,
                min_count=1,
                max_count=1,
                class_constraint=PAO.SharedMemoryArtifact,
            ),
            _property_shape(g, PAO.writesByAgent, min_count=2, class_constraint=PAO.Agent),
        ],
    )

    # --- DialogActShape (v0.6.0 Phase B) ---
    _add_shape(
        g,
        PAO.DialogActShape,
        PAO.DialogAct,
        [
            _property_shape(
                g,
                PAO.hasCommunicativeFunction,
                min_count=1,
                max_count=1,
                class_constraint=PAO.CommunicativeFunction,
            ),
        ],
    )

    # --- GroundingActShape (v0.6.0 Phase B) ---
    _add_shape(
        g,
        PAO.GroundingActShape,
        PAO.GroundingAct,
        [
            _property_shape(
                g,
                PAO.contributesToCommonGround,
                min_count=1,
                max_count=1,
                class_constraint=PAO.CommonGround,
            ),
        ],
    )

    # --- ClarificationRequestShape (v0.6.0 Phase B) ---
    _add_shape(
        g,
        PAO.ClarificationRequestShape,
        PAO.ClarificationRequest,
        [
            _property_shape(
                g, PAO.clarifiesTurn, min_count=1, max_count=1, class_constraint=PAO.Turn
            ),
        ],
    )

    # --- FoundationModelShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.FoundationModelShape,
        PAO.FoundationModel,
        [
            _property_shape(g, PAO.hasModelId, min_count=1, max_count=1, datatype=XSD.string),
            _property_shape(g, PAO.hasModelVersion, max_count=1, datatype=XSD.string),
            _property_shape(
                g, PAO.hasProvider, min_count=1, max_count=1, class_constraint=PAO.ModelProvider
            ),
            _property_shape(g, PAO.deployedAs, min_count=1, class_constraint=PAO.ModelDeployment),
        ],
    )

    # --- ModelInvocationShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.ModelInvocationShape,
        PAO.ModelInvocation,
        [
            _property_shape(
                g,
                PAO.invokedOnDeployment,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ModelDeployment,
            ),
            _property_shape(
                g,
                PAO.hasGenerationConfig,
                min_count=1,
                max_count=1,
                class_constraint=PAO.GenerationConfiguration,
            ),
            _property_shape(
                g, PAO.modelInvocationForTurn, min_count=1, max_count=1, class_constraint=PAO.Turn
            ),
        ],
    )

    # --- GenerationConfigurationShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.GenerationConfigurationShape,
        PAO.GenerationConfiguration,
        [
            _property_shape(g, PAO.hasTemperature, max_count=1, datatype=XSD.decimal),
            _property_shape(g, PAO.hasTopP, max_count=1, datatype=XSD.decimal),
            _property_shape(
                g, PAO.hasMaxOutputTokens, max_count=1, datatype=XSD.nonNegativeInteger
            ),
        ],
    )

    # --- ModelProviderShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.ModelProviderShape,
        PAO.ModelProvider,
        [
            _property_shape(g, RDFS.label, min_count=1),
        ],
    )

    # --- OperationalMetricShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.OperationalMetricShape,
        PAO.OperationalMetric,
        [
            _property_shape(g, PAO.hasMetricName, min_count=1, max_count=1, datatype=XSD.string),
        ],
    )

    # --- MetricObservationShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.MetricObservationShape,
        PAO.MetricObservation,
        [
            _property_shape(
                g,
                PAO.observesMetric,
                min_count=1,
                max_count=1,
                class_constraint=PAO.OperationalMetric,
            ),
            _property_shape(g, PAO.hasMetricValue, min_count=1, max_count=1, datatype=XSD.decimal),
        ],
    )

    # --- ReliabilityIncidentShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.ReliabilityIncidentShape,
        PAO.ReliabilityIncident,
        [
            _property_shape(g, PAO.incidentForEntity, min_count=1),
        ],
    )

    # --- BeliefShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.BeliefShape,
        PAO.Belief,
        [
            _property_shape(g, RDFS.label, min_count=1),
        ],
    )

    # --- DesireShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.DesireShape,
        PAO.Desire,
        [
            _property_shape(g, RDFS.label, min_count=1),
        ],
    )

    # --- DeliberationShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.DeliberationShape,
        PAO.Deliberation,
        [
            _property_shape(g, PAO.considersBelief, min_count=1, class_constraint=PAO.Belief),
            _property_shape(g, PAO.considersDesire, min_count=1, class_constraint=PAO.Desire),
            _property_shape(g, PAO.producesIntention, min_count=1, class_constraint=PAO.Intention),
        ],
    )

    # --- JustificationShape (v0.7.0) ---
    _add_shape(
        g,
        PAO.JustificationShape,
        PAO.Justification,
        [
            _property_shape(g, PAO.justifiesIntention, min_count=1, class_constraint=PAO.Intention),
        ],
    )

    # --- ScheduleShape (v0.8.0) ---
    _add_shape(
        g,
        PAO.ScheduleShape,
        PAO.Schedule,
        [
            _property_shape(
                g,
                PAO.hasRecurrencePattern,
                min_count=1,
                max_count=1,
                class_constraint=PAO.RecurrencePattern,
            ),
            _property_shape(
                g, PAO.schedulesAction, min_count=1, max_count=1, class_constraint=PAO.Action
            ),
            _property_shape(
                g,
                PAO.hasScheduleStatus,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ScheduleStatus,
            ),
            _property_shape(
                g, PAO.activatedBy, min_count=1, max_count=1, class_constraint=PAO.Trigger
            ),
            _property_shape(
                g, PAO.ownedByAgent, min_count=1, max_count=1, class_constraint=PAO.Agent
            ),
            _property_shape(
                g,
                PAO.hasConcurrencyPolicy,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ConcurrencyPolicy,
            ),
            _property_shape(g, PAO.allowsCatchUp, max_count=1, datatype=XSD.boolean),
        ],
    )

    # --- ScheduledExecutionShape (v0.8.0) ---
    _add_shape(
        g,
        PAO.ScheduledExecutionShape,
        PAO.ScheduledExecution,
        [
            _property_shape(
                g, PAO.executionOf, min_count=1, max_count=1, class_constraint=PAO.Schedule
            ),
            _property_shape(
                g,
                PAO.hasExecutionOutcome,
                min_count=1,
                max_count=1,
                class_constraint=PAO.ExecutionOutcome,
            ),
            _property_shape(g, PAO.hasTemporalExtent, min_count=1, class_constraint=TIME.Interval),
        ],
    )

    # --- RecurrencePatternShape (v0.8.0) ---
    # sh:or — at least one of hasCronExpression or hasIntervalSeconds
    cron_branch = BNode()
    g.add((cron_branch, SH.path, PAO.hasCronExpression))
    g.add((cron_branch, SH.minCount, Literal(1)))
    interval_branch = BNode()
    g.add((interval_branch, SH.path, PAO.hasIntervalSeconds))
    g.add((interval_branch, SH.minCount, Literal(1)))
    or_shape_a = BNode()
    g.add((or_shape_a, SH.property, cron_branch))
    or_shape_b = BNode()
    g.add((or_shape_b, SH.property, interval_branch))
    or_list = BNode()
    Collection(g, or_list, [or_shape_a, or_shape_b])
    recurrence_shape = PAO.RecurrencePatternShape
    g.add((recurrence_shape, RDF.type, SH.NodeShape))
    g.add((recurrence_shape, SH.targetClass, PAO.RecurrencePattern))
    g.add((recurrence_shape, SH.property, _property_shape(g, RDFS.label, min_count=1)))
    g.add((recurrence_shape, SH["or"], or_list))

    return g


def _add_shape(g: Graph, shape_uri: URIRef, target_class: URIRef, prop_shapes: list[BNode]) -> None:
    """Add a NodeShape targeting a class with property constraints."""
    g.add((shape_uri, RDF.type, SH.NodeShape))
    g.add((shape_uri, SH.targetClass, target_class))
    for ps in prop_shapes:
        g.add((shape_uri, SH.property, ps))


def _property_shape(
    g: Graph,
    path: URIRef,
    min_count: int | None = None,
    max_count: int | None = None,
    datatype: URIRef | None = None,
    class_constraint: URIRef | None = None,
    min_inclusive: str | None = None,
    max_inclusive: str | None = None,
) -> BNode:
    """Create a property shape with optional constraints."""
    ps = BNode()
    g.add((ps, SH.path, path))
    if min_count is not None:
        g.add((ps, SH.minCount, Literal(min_count)))
    if max_count is not None:
        g.add((ps, SH.maxCount, Literal(max_count)))
    if datatype is not None:
        g.add((ps, SH.datatype, datatype))
    if class_constraint is not None:
        g.add((ps, SH["class"], class_constraint))
    if min_inclusive is not None:
        g.add((ps, SH.minInclusive, Literal(min_inclusive, datatype=XSD.decimal)))
    if max_inclusive is not None:
        g.add((ps, SH.maxInclusive, Literal(max_inclusive, datatype=XSD.decimal)))
    return ps


# ---------------------------------------------------------------------------
# Serialization
# ---------------------------------------------------------------------------


def _serialize_turtle(g: Graph, path: Path) -> None:
    """Serialize graph as Turtle, ensuring a trailing newline for pre-commit."""
    g.serialize(destination=str(path), format="turtle")
    content = path.read_bytes()
    if content and not content.endswith(b"\n"):
        path.write_bytes(content + b"\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    """Build all Personal Agent Ontology artifacts."""
    print("Loading input artifacts...")
    glossary = load_glossary()

    class_count = sum(1 for r in glossary if r["category"] == "class")
    ind_count = sum(1 for r in glossary if r["category"] == "individual")
    print(f"  Glossary: {len(glossary)} terms ({class_count} classes, {ind_count} individuals)")

    # Ensure output directories exist
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "shapes").mkdir(parents=True, exist_ok=True)

    # Build Reference Individuals (must come first since TBox imports it)
    print("\nBuilding reference individuals (pao-reference-individuals.ttl)...")
    ref = build_reference_individuals(glossary)
    ref_path = OUT / "pao-reference-individuals.ttl"
    _serialize_turtle(ref, ref_path)
    print(f"  Written: {ref_path} ({len(ref)} triples)")

    # Build TBox
    print("Building TBox (personal_agent_ontology.ttl)...")
    tbox = build_tbox(glossary)
    tbox_path = OUT / "personal_agent_ontology.ttl"
    _serialize_turtle(tbox, tbox_path)
    print(f"  Written: {tbox_path} ({len(tbox)} triples)")

    # Build SHACL Shapes
    print("Building SHACL shapes (shapes/pao-shapes.ttl)...")
    shapes = build_shacl_shapes()
    shapes_path = OUT / "shapes" / "pao-shapes.ttl"
    _serialize_turtle(shapes, shapes_path)
    print(f"  Written: {shapes_path} ({len(shapes)} triples)")

    # Build sample ABox data
    print("Building sample ABox data (pao-data.ttl)...")
    data = build_abox_data()
    data_path = OUT / "pao-data.ttl"
    _serialize_turtle(data, data_path)
    print(f"  Written: {data_path} ({len(data)} triples)")

    print("\nBuild complete.")


if __name__ == "__main__":
    main()
