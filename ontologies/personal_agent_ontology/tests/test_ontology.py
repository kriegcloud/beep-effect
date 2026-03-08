"""Tests for the Personal Agent Ontology structural integrity and SPARQL validation.

Validates the generated TBox, reference individuals, sample ABox data,
and SHACL shapes against the conceptual model specification.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import Graph, Namespace, URIRef
from rdflib.collection import Collection
from rdflib.namespace import OWL, RDF, RDFS, SKOS, XSD

PAO = Namespace("https://purl.org/pao/")
PROV = Namespace("http://www.w3.org/ns/prov#")
TIME = Namespace("http://www.w3.org/2006/time#")
FOAF = Namespace("http://xmlns.com/foaf/0.1/")
ODRL = Namespace("http://www.w3.org/ns/odrl/2/")
OBO = Namespace("http://purl.obolibrary.org/obo/")
SH = Namespace("http://www.w3.org/ns/shacl#")

PROJECT = Path(__file__).resolve().parent.parent
TBOX_PATH = PROJECT / "personal_agent_ontology.ttl"
REF_PATH = PROJECT / "pao-reference-individuals.ttl"
DATA_PATH = PROJECT / "pao-data.ttl"
SHAPES_PATH = PROJECT / "shapes" / "pao-shapes.ttl"
SPARQL_DIR = PROJECT / "tests"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def tbox() -> Graph:
    """Load the TBox graph."""
    g = Graph()
    g.parse(str(TBOX_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def ref() -> Graph:
    """Load the reference individuals graph."""
    g = Graph()
    g.parse(str(REF_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def merged() -> Graph:
    """Load merged TBox + reference individuals."""
    g = Graph()
    g.parse(str(TBOX_PATH), format="turtle")
    g.parse(str(REF_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def full_graph() -> Graph:
    """Load merged TBox + reference individuals + sample ABox data."""
    g = Graph()
    g.parse(str(TBOX_PATH), format="turtle")
    g.parse(str(REF_PATH), format="turtle")
    g.parse(str(DATA_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def shapes() -> Graph:
    """Load the SHACL shapes graph."""
    g = Graph()
    g.parse(str(SHAPES_PATH), format="turtle")
    return g


# ---------------------------------------------------------------------------
# Class declarations (91 classes)
# ---------------------------------------------------------------------------

EXPECTED_CLASSES = [
    # pao-core: Agent hierarchy
    "Agent",
    "AIAgent",
    "HumanUser",
    "SubAgent",
    "Organization",
    "Persona",
    "Integration",
    # pao-conversation: Interaction
    "Event",
    "Action",
    "Conversation",
    "Session",
    "Turn",
    "CompactionEvent",
    "ContextWindow",
    "CommunicationChannel",
    "ErasureEvent",
    "Observation",
    "StatusTransition",
    "SessionStatusTransition",
    "TaskStatusTransition",
    # pao-memory: Memory system
    "MemoryItem",
    "Episode",
    "Claim",
    "MemoryBlock",
    "Message",
    "MemoryTier",
    "WorkingMemory",
    "EpisodicMemory",
    "SemanticMemory",
    "ProceduralMemory",
    "MemoryOperation",
    "Encoding",
    "Retrieval",
    "Consolidation",
    "Forgetting",
    "Rehearsal",
    # pao-tools: Tool infrastructure
    "ToolDefinition",
    "ToolInvocation",
    # pao-planning: Goals, plans, tasks
    "Goal",
    "Plan",
    "Task",
    "Intention",
    # pao-governance: Safety and permissions
    "PermissionPolicy",
    "SafetyConstraint",
    "ConsentRecord",
    "RetentionPolicy",
    "CompactionDisposition",
    # Status types
    "ClaimType",
    "Status",
    "SessionStatus",
    "TaskStatus",
    "ComplianceStatus",
    "SensitivityLevel",
    "ItemFate",
    "ChannelType",
    "IntegrationStatus",
    # pao-services (v0.6.0)
    "ExternalService",
    "ServiceConnection",
    "ServiceCapability",
    "ServiceToolCapability",
    "ServiceResourceCapability",
    "ServicePromptCapability",
    "CapabilityDiscoveryEvent",
    "ConnectionStatus",
    # pao-governance (v0.6.0)
    "SandboxPolicy",
    "Hook",
    "HookExecution",
    "AuditLog",
    "AuditEntry",
    "PermissionMode",
    "AuthorizationDecision",
    "CheckpointDecision",
    # pao-recovery (v0.6.0)
    "ErrorRecoveryEvent",
    "RetryAttempt",
    "ReplanEvent",
    "RollbackEvent",
    "Checkpoint",
    # v0.6.0 Phase B: Tool/Message Trace
    "ToolResult",
    "ToolInvocationGroup",
    "ContentBlock",
    "ContentBlockType",
    # v0.6.0 Phase B: Memory Control Plane
    "MemorySource",
    "MemoryScope",
    "SharedMemoryArtifact",
    "MemoryWriteConflict",
    # v0.6.0 Phase B: Dialog Pragmatics
    "DialogAct",
    "CommunicativeFunction",
    "CommonGround",
    "GroundingAct",
    "ClarificationRequest",
    "AcceptanceEvidence",
    # Roles
    "AgentRole",
    # v0.7.0: Model Identity & Execution Provenance
    "ModelProvider",
    "FoundationModel",
    "ModelDeployment",
    "ModelInvocation",
    "GenerationConfiguration",
    # v0.7.0: Operational Observability
    "OperationalMetric",
    "MetricObservation",
    "ReliabilityIncident",
    # v0.7.0: Failure Taxonomy
    "FailureType",
    # v0.7.0: BDI Completion
    "Belief",
    "Desire",
    "Justification",
    "Deliberation",
    # v0.8.0: Scheduling & Automation
    "Schedule",
    "RecurrencePattern",
    "Trigger",
    "CronTrigger",
    "IntervalTrigger",
    "EventTrigger",
    "ScheduledExecution",
    "ScheduleStatus",
    "ExecutionOutcome",
    "ConcurrencyPolicy",
]


@pytest.mark.parametrize("cls_name", EXPECTED_CLASSES)
def test_class_declared(tbox: Graph, cls_name: str) -> None:
    """Each expected class is declared as owl:Class."""
    assert (PAO[cls_name], RDF.type, OWL.Class) in tbox


def test_class_count(tbox: Graph) -> None:
    """Exactly 115 PAO classes are declared."""
    pao_classes = {s for s in tbox.subjects(RDF.type, OWL.Class) if str(s).startswith(str(PAO))}
    assert len(pao_classes) == 115, (
        f"Expected 115 PAO classes, found {len(pao_classes)}: {pao_classes}"
    )


# ---------------------------------------------------------------------------
# Labels and definitions
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("cls_name", EXPECTED_CLASSES)
def test_class_has_label(tbox: Graph, cls_name: str) -> None:
    """Each class has an rdfs:label."""
    labels = list(tbox.objects(PAO[cls_name], RDFS.label))
    assert labels, f"{cls_name} missing rdfs:label"


@pytest.mark.parametrize("cls_name", EXPECTED_CLASSES)
def test_class_has_definition(tbox: Graph, cls_name: str) -> None:
    """Each class has a skos:definition."""
    defs = list(tbox.objects(PAO[cls_name], SKOS.definition))
    assert defs, f"{cls_name} missing skos:definition"


# ---------------------------------------------------------------------------
# Class hierarchy (SubClassOf)
# ---------------------------------------------------------------------------

HIERARCHY_CHECKS = [
    # Agent hierarchy
    ("Agent", PROV.Agent),
    ("AIAgent", PAO.Agent),
    ("HumanUser", PAO.Agent),
    ("SubAgent", PAO.AIAgent),
    # Event hierarchy
    ("Action", PAO.Event),
    ("Conversation", PAO.Event),
    ("Session", PAO.Event),
    ("Turn", PAO.Event),
    ("CompactionEvent", PAO.Event),
    ("ErasureEvent", PAO.Event),
    ("MemoryOperation", PAO.Event),
    # MemoryOperation subtypes
    ("Encoding", PAO.MemoryOperation),
    ("Retrieval", PAO.MemoryOperation),
    ("Consolidation", PAO.MemoryOperation),
    ("Forgetting", PAO.MemoryOperation),
    # MemoryItem hierarchy
    ("Episode", PAO.MemoryItem),
    ("Claim", PAO.MemoryItem),
    # MemoryTier subtypes
    ("WorkingMemory", PAO.MemoryTier),
    ("EpisodicMemory", PAO.MemoryTier),
    ("SemanticMemory", PAO.MemoryTier),
    ("ProceduralMemory", PAO.MemoryTier),
    # Status hierarchy
    ("Status", PROV.Entity),
    ("SessionStatus", PAO.Status),
    ("TaskStatus", PAO.Status),
    ("ComplianceStatus", PAO.Status),
    # ToolInvocation -> Action
    ("ToolInvocation", PAO.Action),
    # v0.2.0 additions
    ("Organization", PAO.Agent),
    ("Persona", PROV.Entity),
    ("Observation", PAO.Event),
    ("Rehearsal", PAO.MemoryOperation),
    ("MemoryBlock", PAO.MemoryItem),
    ("Intention", PROV.Entity),
    ("SensitivityLevel", PAO.Status),
    ("ConsentRecord", PROV.Entity),
    ("RetentionPolicy", PROV.Entity),
    # v0.3.0 additions
    ("StatusTransition", PAO.Event),
    ("SessionStatusTransition", PAO.StatusTransition),
    ("TaskStatusTransition", PAO.StatusTransition),
    ("CompactionDisposition", PROV.Entity),
    ("ItemFate", PAO.Status),
    ("ContextWindow", PROV.Entity),
    # v0.5.0 additions
    ("CommunicationChannel", PROV.Entity),
    ("ChannelType", PAO.Status),
    ("Integration", PROV.Entity),
    ("IntegrationStatus", PAO.Status),
    # v0.6.0 additions - External Services
    ("ExternalService", PROV.Entity),
    ("ServiceConnection", PROV.Entity),
    ("ServiceCapability", PROV.Entity),
    ("ServiceToolCapability", PAO.ServiceCapability),
    ("ServiceResourceCapability", PAO.ServiceCapability),
    ("ServicePromptCapability", PAO.ServiceCapability),
    ("CapabilityDiscoveryEvent", PAO.Event),
    ("ConnectionStatus", PAO.Status),
    # v0.6.0 additions - Runtime Safety
    ("SandboxPolicy", PROV.Entity),
    ("Hook", PROV.Entity),
    ("HookExecution", PAO.Event),
    ("AuditLog", PROV.Entity),
    ("AuditEntry", PROV.Entity),
    ("PermissionMode", PAO.Status),
    ("AuthorizationDecision", PAO.Status),
    ("CheckpointDecision", PAO.Status),
    # v0.6.0 additions - Recovery
    ("ErrorRecoveryEvent", PAO.Event),
    ("RetryAttempt", PAO.Event),
    ("ReplanEvent", PAO.Event),
    ("RollbackEvent", PAO.Event),
    ("Checkpoint", PROV.Entity),
    # v0.6.0 Phase B: Tool/Message Trace
    ("ToolResult", PROV.Entity),
    ("ToolInvocationGroup", PROV.Entity),
    ("ContentBlock", PROV.Entity),
    ("ContentBlockType", PAO.Status),
    # v0.6.0 Phase B: Memory Control Plane
    ("MemorySource", PAO.Status),
    ("MemoryScope", PAO.Status),
    ("SharedMemoryArtifact", PROV.Entity),
    ("MemoryWriteConflict", PAO.Event),
    # v0.6.0 Phase B: Dialog Pragmatics
    ("DialogAct", PROV.Entity),
    ("CommunicativeFunction", PAO.Status),
    ("CommonGround", PROV.Entity),
    ("GroundingAct", PAO.Event),
    ("ClarificationRequest", PROV.Entity),
    ("AcceptanceEvidence", PROV.Entity),
    # v0.6.0 review: claimType migration
    ("ClaimType", PAO.Status),
    # v0.7.0: Model Identity
    ("ModelProvider", PROV.Entity),
    ("FoundationModel", PROV.Entity),
    ("ModelDeployment", PROV.Entity),
    ("ModelInvocation", PAO.Event),
    ("GenerationConfiguration", PROV.Entity),
    # v0.7.0: Observability
    ("OperationalMetric", PROV.Entity),
    ("MetricObservation", PROV.Entity),
    ("ReliabilityIncident", PAO.Event),
    # v0.7.0: Failure Taxonomy
    ("FailureType", PAO.Status),
    # v0.7.0: BDI Completion
    ("Belief", PROV.Entity),
    ("Desire", PROV.Entity),
    ("Justification", PROV.Entity),
    ("Deliberation", PAO.Event),
    # v0.8.0: Scheduling & Automation
    ("Schedule", PROV.Entity),
    ("RecurrencePattern", PROV.Entity),
    ("Trigger", PROV.Entity),
    ("CronTrigger", PAO.Trigger),
    ("IntervalTrigger", PAO.Trigger),
    ("EventTrigger", PAO.Trigger),
    ("ScheduledExecution", PAO.Event),
    ("ScheduleStatus", PAO.Status),
    ("ExecutionOutcome", PAO.Status),
    ("ConcurrencyPolicy", PAO.Status),
]


@pytest.mark.parametrize(
    ("cls_name", "parent"),
    HIERARCHY_CHECKS,
    ids=[f"{c}-subClassOf-{str(p).split('/')[-1].split('#')[-1]}" for c, p in HIERARCHY_CHECKS],
)
def test_class_hierarchy(tbox: Graph, cls_name: str, parent: URIRef) -> None:
    """Class has the expected direct superclass."""
    assert (PAO[cls_name], RDFS.subClassOf, parent) in tbox


# ---------------------------------------------------------------------------
# BFO alignment
# ---------------------------------------------------------------------------

BFO_ALIGNMENT = [
    ("Event", OBO["BFO_0000015"]),  # process
    ("AgentRole", OBO["BFO_0000023"]),  # role
    ("HumanUser", OBO["BFO_0000030"]),  # object
    ("AIAgent", OBO["BFO_0000031"]),  # GDC
    ("MemoryItem", OBO["BFO_0000031"]),
    ("MemoryTier", OBO["BFO_0000031"]),
    ("ToolDefinition", OBO["BFO_0000031"]),
    ("Goal", OBO["BFO_0000031"]),
    ("Task", OBO["BFO_0000031"]),
    ("PermissionPolicy", OBO["BFO_0000031"]),
    ("SafetyConstraint", OBO["BFO_0000031"]),
    ("Message", OBO["BFO_0000031"]),
    # v0.2.0 additions
    ("Organization", OBO["BFO_0000030"]),  # Object
    ("Persona", OBO["BFO_0000031"]),  # GDC
    ("Intention", OBO["BFO_0000031"]),  # GDC
    ("ConsentRecord", OBO["BFO_0000031"]),  # GDC
    ("RetentionPolicy", OBO["BFO_0000031"]),  # GDC
    # v0.3.0 additions
    ("CompactionDisposition", OBO["BFO_0000031"]),  # GDC
    ("ContextWindow", OBO["BFO_0000031"]),  # GDC
    # v0.5.0 additions
    ("CommunicationChannel", OBO["BFO_0000031"]),  # GDC
    ("Integration", OBO["BFO_0000031"]),  # GDC
    ("Status", OBO["BFO_0000031"]),  # GDC (value partition)
    # v0.6.0 additions
    ("ExternalService", OBO["BFO_0000031"]),  # GDC
    ("ServiceConnection", OBO["BFO_0000031"]),  # GDC
    ("ServiceCapability", OBO["BFO_0000031"]),  # GDC
    ("SandboxPolicy", OBO["BFO_0000031"]),  # GDC
    ("Hook", OBO["BFO_0000031"]),  # GDC
    ("AuditLog", OBO["BFO_0000031"]),  # GDC
    ("AuditEntry", OBO["BFO_0000031"]),  # GDC
    ("Checkpoint", OBO["BFO_0000031"]),  # GDC
    # v0.6.0 Phase B additions
    ("ToolResult", OBO["BFO_0000031"]),  # GDC
    ("ToolInvocationGroup", OBO["BFO_0000031"]),  # GDC
    ("ContentBlock", OBO["BFO_0000031"]),  # GDC
    ("SharedMemoryArtifact", OBO["BFO_0000031"]),  # GDC
    ("DialogAct", OBO["BFO_0000031"]),  # GDC
    ("CommonGround", OBO["BFO_0000031"]),  # GDC
    ("ClarificationRequest", OBO["BFO_0000031"]),  # GDC
    ("AcceptanceEvidence", OBO["BFO_0000031"]),  # GDC
    # v0.7.0 additions
    ("ModelProvider", OBO["BFO_0000031"]),  # GDC
    ("FoundationModel", OBO["BFO_0000031"]),  # GDC
    ("ModelDeployment", OBO["BFO_0000031"]),  # GDC
    ("GenerationConfiguration", OBO["BFO_0000031"]),  # GDC
    ("OperationalMetric", OBO["BFO_0000031"]),  # GDC
    ("MetricObservation", OBO["BFO_0000031"]),  # GDC
    ("Belief", OBO["BFO_0000031"]),  # GDC
    ("Desire", OBO["BFO_0000031"]),  # GDC
    ("Justification", OBO["BFO_0000031"]),  # GDC
    # v0.8.0: Scheduling & Automation
    ("Schedule", OBO["BFO_0000031"]),  # GDC
    ("RecurrencePattern", OBO["BFO_0000031"]),  # GDC
    ("Trigger", OBO["BFO_0000031"]),  # GDC
]


@pytest.mark.parametrize(
    ("cls_name", "bfo_class"),
    BFO_ALIGNMENT,
    ids=[f"{c}-BFO-{str(b).split('/')[-1]}" for c, b in BFO_ALIGNMENT],
)
def test_bfo_alignment(tbox: Graph, cls_name: str, bfo_class: URIRef) -> None:
    """Class is aligned to BFO via rdfs:subClassOf."""
    assert (PAO[cls_name], RDFS.subClassOf, bfo_class) in tbox


# ---------------------------------------------------------------------------
# Object property declarations (110 properties)
# ---------------------------------------------------------------------------

EXPECTED_OBJ_PROPS = [
    "aboutAgent",
    "achievesGoal",
    "activatedBy",
    "appliesTo",
    "attemptedRetry",
    "auditForInvocation",
    "availableToAgent",
    "belongsTo",
    "blockedBy",
    "blocks",
    "checkpointDecision",
    "checkpointForTask",
    "claimType",
    "clarifiesTurn",
    "compactedContextOf",
    "compactedItem",
    "conflictOnArtifact",
    "connectsToService",
    "consentPurpose",
    "consentSubject",
    "continuedBy",
    "continuedFrom",
    "contributesToCommonGround",
    "delegatedTask",
    "derivedFromGoal",
    "discoveredCapability",
    "discoveryAgainstService",
    "dispositionOf",
    "enforcedBySandboxPolicy",
    "executionOf",
    "exposesCapability",
    "governedByPolicy",
    "governedByRetention",
    "grantsPermission",
    "groupedInTurn",
    "fromStatus",
    "hasAvailableTool",
    "hasChannelType",
    "hasCommunicativeFunction",
    "hasConcurrencyPolicy",
    "hasCompactionDisposition",
    "hasComplianceStatus",
    "hasConnectionStatus",
    "hasContentBlock",
    "hasContentBlockType",
    "hasContextWindow",
    "hasDialogAct",
    "hasEvidence",
    "hasExecutionOutcome",
    "hasExternalService",
    "hasHook",
    "hasIntegration",
    "hasIntegrationStatus",
    "hasItemFate",
    "hasInput",
    "hasMember",
    "hasMemoryScope",
    "hasMemorySource",
    "hasOutput",
    "hasPart",
    "hasParticipant",
    "hasPersona",
    "hasRecurrencePattern",
    "hasRole",
    "hasSensitivityLevel",
    "hasScheduleStatus",
    "hasServiceConnection",
    "hasStatus",
    "hasTask",
    "hasTemporalExtent",
    "hasTopic",
    "hookTriggeredExecution",
    "inConversation",
    "inSession",
    "initiatedSession",
    "intendedBy",
    "interceptsInvocation",
    "invokedBy",
    "invokedIn",
    "invokesTool",
    "nextTransition",
    "operatesInMode",
    "operatesOn",
    "ownedByAgent",
    "participatesIn",
    "partOf",
    "partOfConversation",
    "partOfInvocationGroup",
    "partOfPlan",
    "partOfSession",
    "performedBy",
    "previousTransition",
    "producedSummary",
    "producedToolResult",
    "providesAcceptanceEvidence",
    "providesTool",
    "pursuedBy",
    "pursuesGoal",
    "recoveringFrom",
    "recordedInEpisode",
    "recordsDecision",
    "recordsEvent",
    "requestedBy",
    "resolvedByPolicy",
    "restrictsToolUse",
    "schedulesAction",
    "sentViaChannel",
    "servesGoal",
    "sharedAcrossAgents",
    "spawnedBy",
    "storedIn",
    "stores",
    "toStatus",
    "transitionSubject",
    "triggeredBy",
    "triggeredReplan",
    "triggeredRollback",
    "viaChannel",
    "writesByAgent",
    "writtenToAuditLog",
    # v0.7.0: Model Identity
    "hasProvider",
    "usesModel",
    "deployedAs",
    "invokedOnDeployment",
    "hasGenerationConfig",
    "modelInvocationForTurn",
    "producedByModelInvocation",
    # v0.7.0: Observability
    "observesMetric",
    "observedOnEntity",
    "incidentForEntity",
    "linkedToRecovery",
    # v0.7.0: Failure Taxonomy
    "hasFailureType",
    # v0.7.0: BDI Completion
    "heldBelief",
    "holdsDesire",
    "justifiesIntention",
    "producesIntention",
    "considersBelief",
    "considersDesire",
]


@pytest.mark.parametrize("prop_name", EXPECTED_OBJ_PROPS)
def test_object_property_declared(tbox: Graph, prop_name: str) -> None:
    """Each expected object property is declared."""
    assert (PAO[prop_name], RDF.type, OWL.ObjectProperty) in tbox


# ---------------------------------------------------------------------------
# Datatype property declarations (32 properties)
# ---------------------------------------------------------------------------

EXPECTED_DATA_PROPS = [
    "allowsCatchUp",
    "blockSequenceIndex",
    "fateReason",
    "hasAgentId",
    "hasAttemptCount",
    "hasBlockKey",
    "hasBlockValue",
    "hasConfidence",
    "hasContent",
    "hasConversationId",
    "hasCronExpression",
    "hasDecisionReason",
    "hasEndpoint",
    "hasIntervalSeconds",
    "hasLastAccessTime",
    "hasRecoveryOutcome",
    "hasServiceIdentifier",
    "hasServiceName",
    "hasServiceTransport",
    "hasSessionId",
    "hasTimestamp",
    "hasTokenCapacity",
    "hasTokensUsed",
    "hasTurnIndex",
    "isEvictionCandidate",
    "retentionPeriodDays",
    # v0.7.0: Model Identity
    "hasModelId",
    "hasModelVersion",
    "hasTemperature",
    "hasTopP",
    "hasMaxOutputTokens",
    "hasPromptVersion",
    "hasSeed",
    # v0.7.0: Observability
    "hasMetricName",
    "hasMetricValue",
]


@pytest.mark.parametrize("prop_name", EXPECTED_DATA_PROPS)
def test_datatype_property_declared(tbox: Graph, prop_name: str) -> None:
    """Each expected datatype property is declared."""
    assert (PAO[prop_name], RDF.type, OWL.DatatypeProperty) in tbox


# ---------------------------------------------------------------------------
# Functional properties
# ---------------------------------------------------------------------------

EXPECTED_FUNCTIONAL = [
    "auditForInvocation",
    "belongsTo",
    "blockSequenceIndex",
    "checkpointDecision",
    "checkpointForTask",
    "claimType",
    "clarifiesTurn",
    "compactedContextOf",
    "conflictOnArtifact",
    "connectsToService",
    "consentSubject",
    "continuedFrom",
    "contributesToCommonGround",
    "dispositionOf",
    "discoveryAgainstService",
    "enforcedBySandboxPolicy",
    "fromStatus",
    "groupedInTurn",
    "hasAgentId",
    "hasAttemptCount",
    "hasCommunicativeFunction",
    "hasComplianceStatus",
    "hasConfidence",
    "hasChannelType",
    "hasContent",
    "hasContentBlockType",
    "hasContextWindow",
    "hasConnectionStatus",
    "hasConversationId",
    "hasDecisionReason",
    "hasEndpoint",
    "hasIntegrationStatus",
    "hasItemFate",
    "hasLastAccessTime",
    "hasMemoryScope",
    "hasMemorySource",
    "hasPersona",
    "hasRecoveryOutcome",
    "hasSensitivityLevel",
    "hasServiceIdentifier",
    "hasServiceName",
    "hasServiceTransport",
    "hasSessionId",
    "hasStatus",
    "hasTemporalExtent",
    "hasTimestamp",
    "hasTokenCapacity",
    "hasTokensUsed",
    "hasTurnIndex",
    "inConversation",
    "inSession",
    "interceptsInvocation",
    "invokedBy",
    "invokesTool",
    "isEvictionCandidate",
    "nextTransition",
    "operatesInMode",
    "partOfConversation",
    "partOfPlan",
    "partOfSession",
    "performedBy",
    "previousTransition",
    "producedSummary",
    "producedToolResult",
    "recoveringFrom",
    "recordsDecision",
    "requestedBy",
    "retentionPeriodDays",
    "sentViaChannel",
    "spawnedBy",
    "toStatus",
    "transitionSubject",
    "triggeredReplan",
    "triggeredRollback",
    "viaChannel",
    "writtenToAuditLog",
    # v0.7.0: Model Identity
    "hasProvider",
    "invokedOnDeployment",
    "hasGenerationConfig",
    "modelInvocationForTurn",
    "hasModelId",
    "hasModelVersion",
    "hasTemperature",
    "hasTopP",
    "hasMaxOutputTokens",
    "hasPromptVersion",
    "hasSeed",
    # v0.7.0: Observability
    "observesMetric",
    "hasMetricName",
    "hasMetricValue",
    # v0.7.0: Failure Taxonomy
    "hasFailureType",
    # v0.8.0: Scheduling & Automation
    "activatedBy",
    "allowsCatchUp",
    "executionOf",
    "hasConcurrencyPolicy",
    "hasCronExpression",
    "hasExecutionOutcome",
    "hasIntervalSeconds",
    "hasRecurrencePattern",
    "hasScheduleStatus",
    "ownedByAgent",
    "schedulesAction",
]


@pytest.mark.parametrize("prop_name", EXPECTED_FUNCTIONAL)
def test_functional_properties(tbox: Graph, prop_name: str) -> None:
    """Expected properties are declared as functional."""
    assert (PAO[prop_name], RDF.type, OWL.FunctionalProperty) in tbox


# ---------------------------------------------------------------------------
# Transitive properties
# ---------------------------------------------------------------------------


def test_part_of_transitive(tbox: Graph) -> None:
    """partOf is declared as transitive."""
    assert (PAO.partOf, RDF.type, OWL.TransitiveProperty) in tbox


def test_has_part_transitive(tbox: Graph) -> None:
    """hasPart is declared as transitive."""
    assert (PAO.hasPart, RDF.type, OWL.TransitiveProperty) in tbox


# ---------------------------------------------------------------------------
# Inverse pairs (9 pairs)
# ---------------------------------------------------------------------------

INVERSE_PAIRS = [
    ("partOf", "hasPart"),
    ("hasAvailableTool", "availableToAgent"),
    ("hasParticipant", "participatesIn"),
    ("invokesTool", "invokedIn"),
    ("storedIn", "stores"),
    ("recordedInEpisode", "recordsEvent"),
    ("pursuedBy", "pursuesGoal"),
    ("partOfPlan", "hasTask"),
    ("blockedBy", "blocks"),
    ("belongsTo", "hasMember"),
    ("continuedFrom", "continuedBy"),
    ("previousTransition", "nextTransition"),
    # v0.7.0: Model Identity
    ("modelInvocationForTurn", "producedByModelInvocation"),
]


@pytest.mark.parametrize(
    ("prop_a", "prop_b"),
    INVERSE_PAIRS,
    ids=[f"{a}-inverseOf-{b}" for a, b in INVERSE_PAIRS],
)
def test_inverse_pairs(tbox: Graph, prop_a: str, prop_b: str) -> None:
    """Inverse property pairs are declared."""
    has_forward = (PAO[prop_a], OWL.inverseOf, PAO[prop_b]) in tbox
    has_reverse = (PAO[prop_b], OWL.inverseOf, PAO[prop_a]) in tbox
    assert has_forward or has_reverse, f"Missing inverseOf between {prop_a} and {prop_b}"


# ---------------------------------------------------------------------------
# Property hierarchy (subPropertyOf)
# ---------------------------------------------------------------------------

SUBPROPERTY_CHECKS = [
    ("partOfConversation", "partOf"),
    ("partOfSession", "partOf"),
    ("partOfPlan", "partOf"),
    ("hasTask", "hasPart"),
    ("performedBy", "hasParticipant"),
    ("invokedBy", "performedBy"),
    ("hasComplianceStatus", "hasStatus"),
    ("hasIntegrationStatus", "hasStatus"),
    ("hasConnectionStatus", "hasStatus"),
    ("checkpointDecision", "hasStatus"),
    # v0.8.0: Scheduling & Automation
    ("hasScheduleStatus", "hasStatus"),
    ("hasExecutionOutcome", "hasStatus"),
    ("hasConcurrencyPolicy", "hasStatus"),
]


@pytest.mark.parametrize(
    ("sub", "super_"),
    SUBPROPERTY_CHECKS,
    ids=[f"{s}-subPropertyOf-{p}" for s, p in SUBPROPERTY_CHECKS],
)
def test_property_hierarchy(tbox: Graph, sub: str, super_: str) -> None:
    """Sub-property relationships are declared."""
    assert (PAO[sub], RDFS.subPropertyOf, PAO[super_]) in tbox


def test_compacted_item_sub_property_of_prov_used(tbox: Graph) -> None:
    """compactedItem is subPropertyOf prov:used."""
    assert (PAO.compactedItem, RDFS.subPropertyOf, PROV.used) in tbox


# ---------------------------------------------------------------------------
# Domain and range checks (selected important properties)
# ---------------------------------------------------------------------------

DOMAIN_RANGE_CHECKS: list[tuple[str, URIRef | None, URIRef]] = [
    ("storedIn", None, PAO.MemoryTier),
    ("stores", PAO.MemoryTier, PAO.MemoryItem),
    ("operatesOn", PAO.MemoryOperation, PAO.MemoryItem),
    ("recordedInEpisode", PAO.Event, PAO.Episode),
    ("hasTimestamp", None, XSD.dateTime),
    ("hasTurnIndex", PAO.Turn, XSD.nonNegativeInteger),
    ("hasConfidence", PAO.Claim, XSD.decimal),
    ("claimType", PAO.Claim, PAO.ClaimType),
    ("governedByPolicy", PAO.ToolInvocation, PAO.PermissionPolicy),
    ("invokesTool", PAO.ToolInvocation, PAO.ToolDefinition),
    ("invokedBy", PAO.ToolInvocation, PAO.Agent),
    ("partOfPlan", PAO.Task, PAO.Plan),
    ("achievesGoal", PAO.Plan, PAO.Goal),
    ("spawnedBy", PAO.Agent, PAO.Agent),
    ("requestedBy", PAO.ErasureEvent, PAO.Agent),
    ("hasRole", PAO.Agent, PAO.AgentRole),
    # v0.2.0 additions
    ("belongsTo", PAO.Agent, PAO.Organization),
    ("hasPersona", PAO.AIAgent, PAO.Persona),
    ("hasMember", PAO.Organization, PAO.Agent),
    ("intendedBy", PAO.Intention, PAO.Agent),
    ("derivedFromGoal", PAO.Intention, PAO.Goal),
    ("consentSubject", PAO.ConsentRecord, PAO.Agent),
    ("governedByRetention", PAO.MemoryItem, PAO.RetentionPolicy),
    ("hasSensitivityLevel", PAO.MemoryItem, PAO.SensitivityLevel),
    ("hasBlockKey", PAO.MemoryBlock, XSD.string),
    ("hasBlockValue", PAO.MemoryBlock, XSD.string),
    ("retentionPeriodDays", PAO.RetentionPolicy, XSD.nonNegativeInteger),
    # v0.3.0 additions
    ("compactedItem", PAO.CompactionEvent, PROV.Entity),
    ("hasCompactionDisposition", PAO.CompactionEvent, PAO.CompactionDisposition),
    ("dispositionOf", PAO.CompactionDisposition, PROV.Entity),
    ("hasItemFate", PAO.CompactionDisposition, PAO.ItemFate),
    ("continuedFrom", PAO.Session, PAO.Session),
    ("continuedBy", PAO.Session, PAO.Session),
    ("fromStatus", PAO.StatusTransition, PAO.Status),
    ("toStatus", PAO.StatusTransition, PAO.Status),
    ("transitionSubject", PAO.StatusTransition, OWL.Thing),
    ("triggeredBy", PAO.StatusTransition, PAO.Event),
    ("previousTransition", PAO.StatusTransition, PAO.StatusTransition),
    ("nextTransition", PAO.StatusTransition, PAO.StatusTransition),
    ("fateReason", PAO.CompactionDisposition, XSD.string),
    ("hasLastAccessTime", PAO.MemoryItem, XSD.dateTime),
    ("isEvictionCandidate", PAO.MemoryItem, XSD.boolean),
    ("hasAgentId", PAO.AIAgent, XSD.string),
    ("hasSessionId", PAO.Session, XSD.string),
    ("hasConversationId", PAO.Conversation, XSD.string),
    # v0.4.0 additions - ContextWindow
    ("hasContextWindow", PAO.Session, PAO.ContextWindow),
    ("compactedContextOf", PAO.CompactionEvent, PAO.ContextWindow),
    ("hasTokenCapacity", PAO.ContextWindow, XSD.nonNegativeInteger),
    ("hasTokensUsed", PAO.ContextWindow, XSD.nonNegativeInteger),
    # v0.5.0 additions - Communication Channels & Integrations
    ("viaChannel", PAO.Session, PAO.CommunicationChannel),
    ("hasChannelType", PAO.CommunicationChannel, PAO.ChannelType),
    ("sentViaChannel", PAO.Message, PAO.CommunicationChannel),
    ("hasIntegration", PAO.Agent, PAO.Integration),
    ("providesTool", PAO.Integration, PAO.ToolDefinition),
    ("hasIntegrationStatus", PAO.Integration, PAO.IntegrationStatus),
    ("hasServiceName", PAO.Integration, XSD.string),
    ("hasEndpoint", PAO.Integration, XSD.anyURI),
    # v0.6.0 additions - External Services
    ("hasExternalService", PAO.Agent, PAO.ExternalService),
    ("hasServiceConnection", PAO.Agent, PAO.ServiceConnection),
    ("connectsToService", PAO.ServiceConnection, PAO.ExternalService),
    ("hasConnectionStatus", PAO.ServiceConnection, PAO.ConnectionStatus),
    ("exposesCapability", PAO.ExternalService, PAO.ServiceCapability),
    ("discoveredCapability", PAO.CapabilityDiscoveryEvent, PAO.ServiceCapability),
    ("discoveryAgainstService", PAO.CapabilityDiscoveryEvent, PAO.ExternalService),
    ("hasServiceTransport", PAO.ExternalService, XSD.string),
    ("hasServiceIdentifier", PAO.ExternalService, XSD.string),
    # v0.6.0 additions - Runtime Safety
    ("operatesInMode", PAO.AIAgent, PAO.PermissionMode),
    ("enforcedBySandboxPolicy", PAO.AIAgent, PAO.SandboxPolicy),
    ("hasHook", PAO.AIAgent, PAO.Hook),
    ("hookTriggeredExecution", PAO.Hook, PAO.HookExecution),
    ("interceptsInvocation", PAO.HookExecution, PAO.ToolInvocation),
    ("writtenToAuditLog", PAO.AuditEntry, PAO.AuditLog),
    ("recordsDecision", PAO.AuditEntry, PAO.AuthorizationDecision),
    ("auditForInvocation", PAO.AuditEntry, PAO.ToolInvocation),
    ("hasDecisionReason", PAO.AuditEntry, XSD.string),
    # v0.6.0 additions - Recovery
    ("recoveringFrom", PAO.ErrorRecoveryEvent, PAO.ToolInvocation),
    ("attemptedRetry", PAO.ErrorRecoveryEvent, PAO.RetryAttempt),
    ("triggeredReplan", PAO.ErrorRecoveryEvent, PAO.ReplanEvent),
    ("triggeredRollback", PAO.ErrorRecoveryEvent, PAO.RollbackEvent),
    ("checkpointForTask", PAO.Checkpoint, PAO.Task),
    ("checkpointDecision", PAO.Checkpoint, PAO.CheckpointDecision),
    ("hasAttemptCount", PAO.ErrorRecoveryEvent, XSD.nonNegativeInteger),
    ("hasRecoveryOutcome", PAO.ErrorRecoveryEvent, XSD.string),
    # v0.6.0 Phase B: Tool/Message Trace
    ("partOfInvocationGroup", PAO.ToolInvocation, PAO.ToolInvocationGroup),
    ("groupedInTurn", PAO.ToolInvocationGroup, PAO.Turn),
    ("producedToolResult", PAO.ToolInvocation, PAO.ToolResult),
    ("hasContentBlock", PAO.Message, PAO.ContentBlock),
    ("hasContentBlockType", PAO.ContentBlock, PAO.ContentBlockType),
    ("blockSequenceIndex", PAO.ContentBlock, XSD.nonNegativeInteger),
    # v0.6.0 Phase B: Memory Control Plane
    ("hasMemorySource", PAO.MemoryItem, PAO.MemorySource),
    ("hasMemoryScope", PAO.MemoryItem, PAO.MemoryScope),
    ("sharedAcrossAgents", PAO.SharedMemoryArtifact, PAO.Agent),
    ("writesByAgent", PAO.MemoryWriteConflict, PAO.Agent),
    ("conflictOnArtifact", PAO.MemoryWriteConflict, PAO.SharedMemoryArtifact),
    ("resolvedByPolicy", PAO.MemoryWriteConflict, PAO.PermissionPolicy),
    # v0.6.0 Phase B: Dialog Pragmatics
    ("hasDialogAct", PAO.Turn, PAO.DialogAct),
    ("hasCommunicativeFunction", PAO.DialogAct, PAO.CommunicativeFunction),
    ("contributesToCommonGround", PAO.GroundingAct, PAO.CommonGround),
    ("providesAcceptanceEvidence", PAO.GroundingAct, PAO.AcceptanceEvidence),
    ("clarifiesTurn", PAO.ClarificationRequest, PAO.Turn),
    # v0.7.0: Model Identity
    ("hasProvider", PAO.FoundationModel, PAO.ModelProvider),
    ("usesModel", PAO.AIAgent, PAO.FoundationModel),
    ("deployedAs", PAO.FoundationModel, PAO.ModelDeployment),
    ("invokedOnDeployment", PAO.ModelInvocation, PAO.ModelDeployment),
    ("hasGenerationConfig", PAO.ModelInvocation, PAO.GenerationConfiguration),
    ("modelInvocationForTurn", PAO.ModelInvocation, PAO.Turn),
    ("producedByModelInvocation", PAO.Turn, PAO.ModelInvocation),
    ("hasModelId", PAO.FoundationModel, XSD.string),
    ("hasModelVersion", PAO.FoundationModel, XSD.string),
    ("hasTemperature", PAO.GenerationConfiguration, XSD.decimal),
    ("hasTopP", PAO.GenerationConfiguration, XSD.decimal),
    ("hasMaxOutputTokens", PAO.GenerationConfiguration, XSD.nonNegativeInteger),
    ("hasPromptVersion", PAO.GenerationConfiguration, XSD.string),
    ("hasSeed", PAO.GenerationConfiguration, XSD.nonNegativeInteger),
    # v0.7.0: Observability
    ("observesMetric", PAO.MetricObservation, PAO.OperationalMetric),
    ("observedOnEntity", PAO.MetricObservation, OWL.Thing),
    ("incidentForEntity", PAO.ReliabilityIncident, OWL.Thing),
    ("linkedToRecovery", PAO.ReliabilityIncident, PAO.ErrorRecoveryEvent),
    ("hasMetricName", PAO.OperationalMetric, XSD.string),
    ("hasMetricValue", PAO.MetricObservation, XSD.decimal),
    # v0.7.0: Failure Taxonomy
    ("hasFailureType", PAO.ErrorRecoveryEvent, PAO.FailureType),
    # v0.7.0: BDI Completion
    ("heldBelief", PAO.Agent, PAO.Belief),
    ("holdsDesire", PAO.Agent, PAO.Desire),
    ("justifiesIntention", PAO.Justification, PAO.Intention),
    ("producesIntention", PAO.Deliberation, PAO.Intention),
    ("considersBelief", PAO.Deliberation, PAO.Belief),
    ("considersDesire", PAO.Deliberation, PAO.Desire),
    # v0.8.0: Scheduling & Automation
    ("hasRecurrencePattern", PAO.Schedule, PAO.RecurrencePattern),
    ("schedulesAction", PAO.Schedule, PAO.Action),
    ("hasScheduleStatus", PAO.Schedule, PAO.ScheduleStatus),
    ("executionOf", PAO.ScheduledExecution, PAO.Schedule),
    ("hasExecutionOutcome", PAO.ScheduledExecution, PAO.ExecutionOutcome),
    ("hasConcurrencyPolicy", PAO.Schedule, PAO.ConcurrencyPolicy),
    ("activatedBy", PAO.Schedule, PAO.Trigger),
    ("servesGoal", PAO.Schedule, PAO.Goal),
    ("ownedByAgent", PAO.Schedule, PAO.Agent),
    ("initiatedSession", PAO.ScheduledExecution, PAO.Session),
    ("hasCronExpression", PAO.RecurrencePattern, XSD.string),
    ("hasIntervalSeconds", PAO.RecurrencePattern, XSD.nonNegativeInteger),
    ("allowsCatchUp", PAO.Schedule, XSD.boolean),
]


@pytest.mark.parametrize(
    ("prop_name", "domain", "range_"),
    DOMAIN_RANGE_CHECKS,
    ids=[
        f"{p}-D:{str(d).split('/')[-1] if d else 'none'}-R:{str(r).split('/')[-1]}"
        for p, d, r in DOMAIN_RANGE_CHECKS
    ],
)
def test_domain_range(tbox: Graph, prop_name: str, domain: URIRef | None, range_: URIRef) -> None:
    """Property has correct domain and range."""
    if domain is not None:
        assert (PAO[prop_name], RDFS.domain, domain) in tbox
    else:
        domains = list(tbox.objects(PAO[prop_name], RDFS.domain))
        assert not domains, f"{prop_name} should have no domain, found {domains}"
    assert (PAO[prop_name], RDFS.range, range_) in tbox


# ---------------------------------------------------------------------------
# Existential restrictions
# ---------------------------------------------------------------------------


def _has_existential(g: Graph, cls: URIRef, prop: URIRef, filler: URIRef) -> bool:
    """Check if cls SubClassOf prop some filler."""
    for superclass in g.objects(cls, RDFS.subClassOf):
        if (superclass, RDF.type, OWL.Restriction) in g:
            on_prop = g.value(superclass, OWL.onProperty)
            some_values = g.value(superclass, OWL.someValuesFrom)
            if on_prop == prop and some_values == filler:
                return True
    return False


EXISTENTIAL_CHECKS = [
    ("AIAgent", "hasAvailableTool", "ToolDefinition"),
    ("SubAgent", "spawnedBy", "AIAgent"),
    ("SubAgent", "delegatedTask", "Task"),
    ("Action", "performedBy", "Agent"),
    ("Session", "partOfConversation", "Conversation"),
    ("Session", "hasTemporalExtent", None),  # time:Interval
    ("Session", "hasStatus", "SessionStatus"),
    ("Turn", "partOfSession", "Session"),
    ("Turn", "hasParticipant", "Agent"),
    ("Turn", "partOfConversation", "Conversation"),
    ("Session", "hasParticipant", "Agent"),
    ("CompactionEvent", "inConversation", "Conversation"),
    ("CompactionEvent", "producedSummary", "MemoryItem"),
    ("ErasureEvent", "requestedBy", "Agent"),
    ("ToolInvocation", "invokesTool", "ToolDefinition"),
    ("ToolInvocation", "invokedBy", "Agent"),
    ("ToolInvocation", "inSession", "Session"),
    ("ToolInvocation", "hasInput", None),  # prov:Entity
    ("ToolInvocation", "hasOutput", None),  # prov:Entity
    ("ToolInvocation", "hasComplianceStatus", "ComplianceStatus"),
    ("ToolInvocation", "governedByPolicy", "PermissionPolicy"),
    ("MemoryItem", "storedIn", "MemoryTier"),
    ("Episode", "storedIn", "MemoryTier"),
    ("Episode", "hasTopic", None),  # skos:Concept
    ("Episode", "hasTemporalExtent", None),  # time:Interval
    ("Claim", "storedIn", "MemoryTier"),
    ("Claim", "aboutAgent", "Agent"),
    ("Event", "hasTemporalExtent", None),  # time:TemporalEntity
    ("MemoryOperation", "operatesOn", "MemoryItem"),
    ("Goal", "pursuedBy", "Agent"),
    ("Goal", "hasStatus", "TaskStatus"),
    ("Plan", "achievesGoal", "Goal"),
    ("Task", "partOfPlan", "Plan"),
    ("Task", "hasStatus", "TaskStatus"),
    ("PermissionPolicy", "appliesTo", "Agent"),
    ("PermissionPolicy", "grantsPermission", None),  # odrl:Permission
    ("PermissionPolicy", "restrictsToolUse", "ToolDefinition"),
    ("SafetyConstraint", "appliesTo", "Agent"),
    # v0.2.0 additions
    ("Organization", "hasMember", "Agent"),
    ("AIAgent", "hasPersona", "Persona"),
    ("Observation", "inSession", "Session"),
    ("Intention", "intendedBy", "Agent"),
    ("Intention", "derivedFromGoal", "Goal"),
    ("MemoryItem", "hasSensitivityLevel", "SensitivityLevel"),
    ("ConsentRecord", "consentSubject", "Agent"),
    ("MemoryItem", "governedByRetention", "RetentionPolicy"),
    # v0.3.0 additions
    ("CompactionEvent", "compactedItem", None),  # prov:Entity
    ("StatusTransition", "fromStatus", "Status"),
    ("StatusTransition", "toStatus", "Status"),
    ("StatusTransition", "transitionSubject", None),  # owl:Thing
    ("CompactionDisposition", "dispositionOf", None),  # prov:Entity
    ("CompactionDisposition", "hasItemFate", "ItemFate"),
    # v0.4.0: hasContextWindow and compactedContextOf are optional (no existentials)
    # v0.5.0 additions - Communication Channels & Integrations
    # viaChannel and sentViaChannel are optional (min 0) — no existentials, SHACL caps max 1
    ("CommunicationChannel", "hasChannelType", "ChannelType"),
    ("AIAgent", "hasIntegration", "Integration"),
    ("Integration", "providesTool", "ToolDefinition"),
    ("Integration", "hasIntegrationStatus", "IntegrationStatus"),
    # v0.6.0 additions - External Services
    ("AIAgent", "hasExternalService", "ExternalService"),
    ("ServiceConnection", "connectsToService", "ExternalService"),
    ("ServiceConnection", "hasConnectionStatus", "ConnectionStatus"),
    ("ExternalService", "exposesCapability", "ServiceCapability"),
    ("CapabilityDiscoveryEvent", "discoveredCapability", "ServiceCapability"),
    ("CapabilityDiscoveryEvent", "discoveryAgainstService", "ExternalService"),
    # v0.6.0 additions - Runtime Safety
    ("AIAgent", "operatesInMode", "PermissionMode"),
    ("AIAgent", "hasHook", "Hook"),
    ("HookExecution", "interceptsInvocation", "ToolInvocation"),
    ("AuditEntry", "writtenToAuditLog", "AuditLog"),
    ("AuditEntry", "recordsDecision", "AuthorizationDecision"),
    ("AuditEntry", "auditForInvocation", "ToolInvocation"),
    # v0.6.0 additions - Recovery
    ("ErrorRecoveryEvent", "recoveringFrom", "ToolInvocation"),
    ("Checkpoint", "checkpointForTask", "Task"),
    ("Checkpoint", "checkpointDecision", "CheckpointDecision"),
    # v0.6.0 Phase B: Tool/Message Trace
    ("ToolInvocationGroup", "groupedInTurn", "Turn"),
    ("ToolInvocation", "producedToolResult", "ToolResult"),
    ("ContentBlock", "hasContentBlockType", "ContentBlockType"),
    # v0.6.0 Phase B: Memory Control Plane
    ("SharedMemoryArtifact", "sharedAcrossAgents", "Agent"),
    ("MemoryWriteConflict", "conflictOnArtifact", "SharedMemoryArtifact"),
    ("MemoryWriteConflict", "writesByAgent", "Agent"),
    # v0.6.0 Phase B: Dialog Pragmatics
    ("DialogAct", "hasCommunicativeFunction", "CommunicativeFunction"),
    ("GroundingAct", "contributesToCommonGround", "CommonGround"),
    ("ClarificationRequest", "clarifiesTurn", "Turn"),
    # v0.7.0: Model Identity
    ("ModelInvocation", "invokedOnDeployment", "ModelDeployment"),
    ("ModelInvocation", "modelInvocationForTurn", "Turn"),
    ("ModelInvocation", "hasGenerationConfig", "GenerationConfiguration"),
    ("FoundationModel", "deployedAs", "ModelDeployment"),
    ("FoundationModel", "hasProvider", "ModelProvider"),
    ("AIAgent", "usesModel", "FoundationModel"),
    # v0.7.0: Observability
    ("MetricObservation", "observesMetric", "OperationalMetric"),
    ("ReliabilityIncident", "incidentForEntity", None),  # owl:Thing
    # v0.7.0: Failure Taxonomy
    ("ErrorRecoveryEvent", "hasFailureType", "FailureType"),
    # v0.7.0: BDI Completion
    ("Deliberation", "considersBelief", "Belief"),
    ("Deliberation", "considersDesire", "Desire"),
    ("Deliberation", "producesIntention", "Intention"),
    ("Justification", "justifiesIntention", "Intention"),
    # v0.8.0: Scheduling & Automation
    ("Schedule", "hasRecurrencePattern", "RecurrencePattern"),
    ("Schedule", "schedulesAction", "Action"),
    ("Schedule", "hasScheduleStatus", "ScheduleStatus"),
    ("Schedule", "activatedBy", "Trigger"),
    ("Schedule", "ownedByAgent", "Agent"),
    ("Schedule", "hasConcurrencyPolicy", "ConcurrencyPolicy"),
    ("ScheduledExecution", "executionOf", "Schedule"),
    ("ScheduledExecution", "hasExecutionOutcome", "ExecutionOutcome"),
]


@pytest.mark.parametrize(
    ("cls_name", "prop_name", "filler_name"),
    EXISTENTIAL_CHECKS,
    ids=[f"{c}-{p}-some-{f or 'ext'}" for c, p, f in EXISTENTIAL_CHECKS],
)
def test_existential_restrictions(
    tbox: Graph, cls_name: str, prop_name: str, filler_name: str | None
) -> None:
    """Class has the expected existential restriction."""
    cls = PAO[cls_name]
    prop = PAO[prop_name]

    # Handle external fillers
    if filler_name is None:
        # Check that *some* someValuesFrom restriction exists on this prop
        found = False
        for sc in tbox.objects(cls, RDFS.subClassOf):
            if (
                (sc, RDF.type, OWL.Restriction) in tbox
                and tbox.value(sc, OWL.onProperty) == prop
                and tbox.value(sc, OWL.someValuesFrom) is not None
            ):
                found = True
                break
        assert found, f"{cls_name} missing existential on {prop_name}"
    else:
        filler = PAO[filler_name]
        assert _has_existential(tbox, cls, prop, filler), (
            f"{cls_name} SubClassOf {prop_name} some {filler_name} not found"
        )


# ---------------------------------------------------------------------------
# Universal restriction
# ---------------------------------------------------------------------------


def test_episode_stored_in_only_episodic_memory(tbox: Graph) -> None:
    """Episode SubClassOf storedIn only EpisodicMemory."""
    found = False
    for sc in tbox.objects(PAO.Episode, RDFS.subClassOf):
        if (sc, RDF.type, OWL.Restriction) in tbox:
            on_prop = tbox.value(sc, OWL.onProperty)
            all_values = tbox.value(sc, OWL.allValuesFrom)
            if on_prop == PAO.storedIn and all_values == PAO.EpisodicMemory:
                found = True
                break
    assert found, "Episode storedIn only EpisodicMemory not found"


# ---------------------------------------------------------------------------
# Qualified cardinality restrictions
# ---------------------------------------------------------------------------


def test_turn_has_participant_exactly_1_agent(tbox: Graph) -> None:
    """Turn SubClassOf hasParticipant exactly 1 Agent."""
    found = False
    for sc in tbox.objects(PAO.Turn, RDFS.subClassOf):
        if (sc, RDF.type, OWL.Restriction) in tbox:
            on_prop = tbox.value(sc, OWL.onProperty)
            qcard = tbox.value(sc, OWL.qualifiedCardinality)
            on_class = tbox.value(sc, OWL.onClass)
            if on_prop == PAO.hasParticipant and on_class == PAO.Agent and str(qcard) == "1":
                found = True
                break
    assert found, "Turn hasParticipant exactly 1 Agent not found"


def test_memory_item_stored_in_exactly_1_memory_tier(tbox: Graph) -> None:
    """MemoryItem SubClassOf storedIn exactly 1 MemoryTier."""
    found = False
    for sc in tbox.objects(PAO.MemoryItem, RDFS.subClassOf):
        if (sc, RDF.type, OWL.Restriction) in tbox:
            on_prop = tbox.value(sc, OWL.onProperty)
            qcard = tbox.value(sc, OWL.qualifiedCardinality)
            on_class = tbox.value(sc, OWL.onClass)
            if on_prop == PAO.storedIn and on_class == PAO.MemoryTier and str(qcard) == "1":
                found = True
                break
    assert found, "MemoryItem storedIn exactly 1 MemoryTier not found"


def test_turn_has_turn_index_exactly_1(tbox: Graph) -> None:
    """Turn SubClassOf hasTurnIndex exactly 1 xsd:nonNegativeInteger."""
    found = False
    for sc in tbox.objects(PAO.Turn, RDFS.subClassOf):
        if (sc, RDF.type, OWL.Restriction) in tbox:
            on_prop = tbox.value(sc, OWL.onProperty)
            qcard = tbox.value(sc, OWL.qualifiedCardinality)
            on_dr = tbox.value(sc, OWL.onDataRange)
            if (
                on_prop == PAO.hasTurnIndex
                and on_dr == XSD.nonNegativeInteger
                and str(qcard) == "1"
            ):
                found = True
                break
    assert found, "Turn hasTurnIndex exactly 1 xsd:nonNegativeInteger not found"


# ---------------------------------------------------------------------------
# DisjointUnion axioms
# ---------------------------------------------------------------------------


def _get_disjoint_union_members(g: Graph, cls: URIRef) -> set[URIRef]:
    """Get members of a DisjointUnion axiom for a class."""
    members_list = g.value(cls, OWL.disjointUnionOf)
    if members_list is None:
        return set()
    return set(Collection(g, members_list))


def test_memory_tier_disjoint_union(tbox: Graph) -> None:
    """MemoryTier disjointUnionOf the four memory subtypes."""
    members = _get_disjoint_union_members(tbox, PAO.MemoryTier)
    expected = {PAO.WorkingMemory, PAO.EpisodicMemory, PAO.SemanticMemory, PAO.ProceduralMemory}
    assert members == expected, f"MemoryTier DisjointUnion: expected {expected}, got {members}"


def test_memory_operation_disjoint_union(tbox: Graph) -> None:
    """MemoryOperation disjointUnionOf 5 subtypes including Rehearsal."""
    members = _get_disjoint_union_members(tbox, PAO.MemoryOperation)
    expected = {PAO.Encoding, PAO.Retrieval, PAO.Consolidation, PAO.Forgetting, PAO.Rehearsal}
    assert members == expected, f"MemoryOperation DisjointUnion: expected {expected}, got {members}"


def test_service_capability_disjoint_union(tbox: Graph) -> None:
    """ServiceCapability disjointUnionOf 3 subtypes."""
    members = _get_disjoint_union_members(tbox, PAO.ServiceCapability)
    expected = {
        PAO.ServiceToolCapability,
        PAO.ServiceResourceCapability,
        PAO.ServicePromptCapability,
    }
    assert members == expected, (
        f"ServiceCapability DisjointUnion: expected {expected}, got {members}"
    )


def test_trigger_disjoint_union(tbox: Graph) -> None:
    """Trigger disjointUnionOf CronTrigger, IntervalTrigger, EventTrigger."""
    members = _get_disjoint_union_members(tbox, PAO.Trigger)
    expected = {PAO.CronTrigger, PAO.IntervalTrigger, PAO.EventTrigger}
    assert members == expected, f"Trigger DisjointUnion: expected {expected}, got {members}"


# ---------------------------------------------------------------------------
# AllDisjointClasses axioms (8 axioms)
# ---------------------------------------------------------------------------


def _collect_all_disjoint_groups(g: Graph) -> list[set[URIRef]]:
    """Collect all AllDisjointClasses member groups."""
    groups = []
    for node in g.subjects(RDF.type, OWL.AllDisjointClasses):
        members_list = g.value(node, OWL.members)
        if members_list:
            groups.append(set(Collection(g, members_list)))
    return groups


def test_all_disjoint_classes_count(tbox: Graph) -> None:
    """At least 12 AllDisjointClasses axioms exist."""
    groups = _collect_all_disjoint_groups(tbox)
    assert len(groups) >= 12, f"Expected >=12 AllDisjointClasses, got {len(groups)}"


DISJOINT_GROUP_CHECKS = [
    ({PAO.AIAgent, PAO.HumanUser, PAO.Organization}, "Agent subtypes"),
    (
        {
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
            PAO.MemoryWriteConflict,
            PAO.GroundingAct,
            PAO.ModelInvocation,
            PAO.ReliabilityIncident,
            PAO.Deliberation,
            PAO.ScheduledExecution,
        },
        "Event subtypes",
    ),
    ({PAO.Episode, PAO.Claim, PAO.MemoryBlock}, "MemoryItem subtypes"),
    (
        {
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
            PAO.ContentBlockType,
            PAO.MemorySource,
            PAO.MemoryScope,
            PAO.CommunicativeFunction,
            PAO.ClaimType,
            PAO.FailureType,
            PAO.ScheduleStatus,
            PAO.ExecutionOutcome,
            PAO.ConcurrencyPolicy,
        },
        "Status subtypes",
    ),
    (
        {
            PAO.PermissionPolicy,
            PAO.SafetyConstraint,
            PAO.ConsentRecord,
            PAO.RetentionPolicy,
            PAO.SandboxPolicy,
            PAO.Hook,
            PAO.AuditLog,
        },
        "Governance types",
    ),
    (
        {PAO.WorkingMemory, PAO.EpisodicMemory, PAO.SemanticMemory, PAO.ProceduralMemory},
        "MemoryTier subtypes",
    ),
    (
        {PAO.Encoding, PAO.Retrieval, PAO.Consolidation, PAO.Forgetting, PAO.Rehearsal},
        "MemoryOperation subtypes",
    ),
    (
        {
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
            PAO.ToolResult,
            PAO.ToolInvocationGroup,
            PAO.ContentBlock,
            PAO.SharedMemoryArtifact,
            PAO.DialogAct,
            PAO.CommonGround,
            PAO.ClarificationRequest,
            PAO.AcceptanceEvidence,
            PAO.ModelProvider,
            PAO.FoundationModel,
            PAO.ModelDeployment,
            PAO.GenerationConfiguration,
            PAO.OperationalMetric,
            PAO.MetricObservation,
            PAO.Belief,
            PAO.Desire,
            PAO.Justification,
            PAO.Schedule,
            PAO.RecurrencePattern,
            PAO.Trigger,
        },
        "Cross-module GDC disjointness",
    ),
    (
        {PAO.SessionStatusTransition, PAO.TaskStatusTransition},
        "StatusTransition subtypes",
    ),
    (
        {PAO.ServiceToolCapability, PAO.ServiceResourceCapability, PAO.ServicePromptCapability},
        "ServiceCapability subtypes",
    ),
    (
        {PAO.RetryAttempt, PAO.ReplanEvent, PAO.RollbackEvent},
        "Recovery event subtypes",
    ),
    # v0.8.0: Scheduling & Automation
    (
        {PAO.CronTrigger, PAO.IntervalTrigger, PAO.EventTrigger},
        "Trigger subtypes",
    ),
]


@pytest.mark.parametrize(
    ("expected_members", "description"),
    DISJOINT_GROUP_CHECKS,
    ids=[d for _, d in DISJOINT_GROUP_CHECKS],
)
def test_disjoint_group_exists(
    tbox: Graph, expected_members: set[URIRef], description: str
) -> None:
    """An AllDisjointClasses axiom exists containing the expected members."""
    groups = _collect_all_disjoint_groups(tbox)
    found = any(expected_members <= group for group in groups)
    assert found, f"Missing AllDisjointClasses for {description}: {expected_members}"


# ---------------------------------------------------------------------------
# Reference individuals: status values, roles, classifiers
# ---------------------------------------------------------------------------


def test_session_status_individuals(ref: Graph) -> None:
    """Active, Ended, Interrupted are SessionStatus individuals."""
    for name in ["Active", "Ended", "Interrupted"]:
        assert (PAO[name], RDF.type, PAO.SessionStatus) in ref


def test_task_status_individuals(ref: Graph) -> None:
    """Pending, InProgress, Completed, Blocked are TaskStatus individuals."""
    for name in ["Pending", "InProgress", "Completed", "Blocked"]:
        assert (PAO[name], RDF.type, PAO.TaskStatus) in ref


def test_compliance_status_individuals(ref: Graph) -> None:
    """Compliant, NonCompliant are ComplianceStatus individuals."""
    for name in ["Compliant", "NonCompliant"]:
        assert (PAO[name], RDF.type, PAO.ComplianceStatus) in ref


def test_agent_role_individuals(ref: Graph) -> None:
    """AssistantRole, UserRole are AgentRole individuals."""
    for name in ["AssistantRole", "UserRole"]:
        assert (PAO[name], RDF.type, PAO.AgentRole) in ref


def test_classifier_individuals(ref: Graph) -> None:
    """UserPreference is a named individual."""
    assert (PAO.UserPreference, RDF.type, OWL.NamedIndividual) in ref


def test_sensitivity_level_individuals(ref: Graph) -> None:
    """Public, Internal, Confidential, Restricted are SensitivityLevel individuals."""
    for name in ["Public", "Internal", "Confidential", "Restricted"]:
        assert (PAO[name], RDF.type, PAO.SensitivityLevel) in ref


def test_sensitivity_level_enumeration(ref: Graph) -> None:
    """SensitivityLevel owl:oneOf (Public, Internal, Confidential, Restricted)."""
    members = _get_one_of_members(ref, PAO.SensitivityLevel)
    assert members == {PAO.Public, PAO.Internal, PAO.Confidential, PAO.Restricted}


def test_all_different_sensitivity_level(ref: Graph) -> None:
    """AllDifferent for SensitivityLevel individuals."""
    assert _find_all_different_containing(
        ref, {PAO.Public, PAO.Internal, PAO.Confidential, PAO.Restricted}
    )


def test_channel_type_individuals(ref: Graph) -> None:
    """ChannelType individuals exist."""
    for name in ["CLI", "Messaging", "WebChat", "APIChannel", "VoiceChannel", "EmailChannel"]:
        assert (PAO[name], RDF.type, PAO.ChannelType) in ref


def test_channel_type_enumeration(ref: Graph) -> None:
    """ChannelType owl:oneOf (CLI, Messaging, WebChat, APIChannel, VoiceChannel, EmailChannel)."""
    members = _get_one_of_members(ref, PAO.ChannelType)
    assert members == {
        PAO.CLI,
        PAO.Messaging,
        PAO.WebChat,
        PAO.APIChannel,
        PAO.VoiceChannel,
        PAO.EmailChannel,
    }


def test_all_different_channel_type(ref: Graph) -> None:
    """AllDifferent for ChannelType individuals."""
    assert _find_all_different_containing(
        ref,
        {PAO.CLI, PAO.Messaging, PAO.WebChat, PAO.APIChannel, PAO.VoiceChannel, PAO.EmailChannel},
    )


def test_integration_status_individuals(ref: Graph) -> None:
    """Connected, Disconnected, Error, Initializing are IntegrationStatus individuals."""
    for name in ["Connected", "Disconnected", "Error", "Initializing"]:
        assert (PAO[name], RDF.type, PAO.IntegrationStatus) in ref


def test_integration_status_enumeration(ref: Graph) -> None:
    """IntegrationStatus owl:oneOf (Connected, Disconnected, Error, Initializing)."""
    members = _get_one_of_members(ref, PAO.IntegrationStatus)
    assert members == {PAO.Connected, PAO.Disconnected, PAO.Error, PAO.Initializing}


def test_all_different_integration_status(ref: Graph) -> None:
    """AllDifferent for IntegrationStatus individuals."""
    assert _find_all_different_containing(
        ref, {PAO.Connected, PAO.Disconnected, PAO.Error, PAO.Initializing}
    )


def test_connection_status_individuals(ref: Graph) -> None:
    """Open, Closed, Reconnecting, Failed are ConnectionStatus individuals."""
    for name in ["Open", "Closed", "Reconnecting", "Failed"]:
        assert (PAO[name], RDF.type, PAO.ConnectionStatus) in ref


def test_connection_status_enumeration(ref: Graph) -> None:
    """ConnectionStatus owl:oneOf (Open, Closed, Reconnecting, Failed)."""
    members = _get_one_of_members(ref, PAO.ConnectionStatus)
    assert members == {PAO.Open, PAO.Closed, PAO.Reconnecting, PAO.Failed}


def test_all_different_connection_status(ref: Graph) -> None:
    """AllDifferent for ConnectionStatus individuals."""
    assert _find_all_different_containing(ref, {PAO.Open, PAO.Closed, PAO.Reconnecting, PAO.Failed})


def test_permission_mode_individuals(ref: Graph) -> None:
    """Permissive, Standard, Restrictive are PermissionMode individuals."""
    for name in ["Permissive", "Standard", "Restrictive"]:
        assert (PAO[name], RDF.type, PAO.PermissionMode) in ref


def test_permission_mode_enumeration(ref: Graph) -> None:
    """PermissionMode owl:oneOf (Permissive, Standard, Restrictive)."""
    members = _get_one_of_members(ref, PAO.PermissionMode)
    assert members == {PAO.Permissive, PAO.Standard, PAO.Restrictive}


def test_all_different_permission_mode(ref: Graph) -> None:
    """AllDifferent for PermissionMode individuals."""
    assert _find_all_different_containing(ref, {PAO.Permissive, PAO.Standard, PAO.Restrictive})


def test_authorization_decision_individuals(ref: Graph) -> None:
    """Allow, Deny, RequireApproval are AuthorizationDecision individuals."""
    for name in ["Allow", "Deny", "RequireApproval"]:
        assert (PAO[name], RDF.type, PAO.AuthorizationDecision) in ref


def test_authorization_decision_enumeration(ref: Graph) -> None:
    """AuthorizationDecision owl:oneOf (Allow, Deny, RequireApproval)."""
    members = _get_one_of_members(ref, PAO.AuthorizationDecision)
    assert members == {PAO.Allow, PAO.Deny, PAO.RequireApproval}


def test_all_different_authorization_decision(ref: Graph) -> None:
    """AllDifferent for AuthorizationDecision individuals."""
    assert _find_all_different_containing(ref, {PAO.Allow, PAO.Deny, PAO.RequireApproval})


def test_checkpoint_decision_individuals(ref: Graph) -> None:
    """Approved, Rejected, Deferred are CheckpointDecision individuals."""
    for name in ["Approved", "Rejected", "Deferred"]:
        assert (PAO[name], RDF.type, PAO.CheckpointDecision) in ref


def test_checkpoint_decision_enumeration(ref: Graph) -> None:
    """CheckpointDecision owl:oneOf (Approved, Rejected, Deferred)."""
    members = _get_one_of_members(ref, PAO.CheckpointDecision)
    assert members == {PAO.Approved, PAO.Rejected, PAO.Deferred}


def test_all_different_checkpoint_decision(ref: Graph) -> None:
    """AllDifferent for CheckpointDecision individuals."""
    assert _find_all_different_containing(ref, {PAO.Approved, PAO.Rejected, PAO.Deferred})


def test_content_block_type_individuals(ref: Graph) -> None:
    """TextBlock, ToolUseBlock, ToolResultBlock, ImageBlock are ContentBlockType individuals."""
    for name in ["TextBlock", "ToolUseBlock", "ToolResultBlock", "ImageBlock"]:
        assert (PAO[name], RDF.type, PAO.ContentBlockType) in ref


def test_content_block_type_enumeration(ref: Graph) -> None:
    """ContentBlockType owl:oneOf (TextBlock, ToolUseBlock, ToolResultBlock, ImageBlock)."""
    members = _get_one_of_members(ref, PAO.ContentBlockType)
    assert members == {PAO.TextBlock, PAO.ToolUseBlock, PAO.ToolResultBlock, PAO.ImageBlock}


def test_all_different_content_block_type(ref: Graph) -> None:
    """AllDifferent for ContentBlockType individuals."""
    assert _find_all_different_containing(
        ref, {PAO.TextBlock, PAO.ToolUseBlock, PAO.ToolResultBlock, PAO.ImageBlock}
    )


def test_memory_source_individuals(ref: Graph) -> None:
    """UserSource, SystemSource, AgentSource are MemorySource individuals."""
    for name in ["UserSource", "SystemSource", "AgentSource"]:
        assert (PAO[name], RDF.type, PAO.MemorySource) in ref


def test_memory_source_enumeration(ref: Graph) -> None:
    """MemorySource owl:oneOf (UserSource, SystemSource, AgentSource)."""
    members = _get_one_of_members(ref, PAO.MemorySource)
    assert members == {PAO.UserSource, PAO.SystemSource, PAO.AgentSource}


def test_all_different_memory_source(ref: Graph) -> None:
    """AllDifferent for MemorySource individuals."""
    assert _find_all_different_containing(ref, {PAO.UserSource, PAO.SystemSource, PAO.AgentSource})


def test_memory_scope_individuals(ref: Graph) -> None:
    """SessionScope, ProjectScope, GlobalScope are MemoryScope individuals."""
    for name in ["SessionScope", "ProjectScope", "GlobalScope"]:
        assert (PAO[name], RDF.type, PAO.MemoryScope) in ref


def test_memory_scope_enumeration(ref: Graph) -> None:
    """MemoryScope owl:oneOf (SessionScope, ProjectScope, GlobalScope)."""
    members = _get_one_of_members(ref, PAO.MemoryScope)
    assert members == {PAO.SessionScope, PAO.ProjectScope, PAO.GlobalScope}


def test_all_different_memory_scope(ref: Graph) -> None:
    """AllDifferent for MemoryScope individuals."""
    assert _find_all_different_containing(
        ref, {PAO.SessionScope, PAO.ProjectScope, PAO.GlobalScope}
    )


def test_communicative_function_individuals(ref: Graph) -> None:
    """Inform, Request, Confirm, Clarify, Accept, Reject are CommunicativeFunction individuals."""
    for name in ["Inform", "Request", "Confirm", "Clarify", "Accept", "Reject"]:
        assert (PAO[name], RDF.type, PAO.CommunicativeFunction) in ref


def test_communicative_function_enumeration(ref: Graph) -> None:
    """CommunicativeFunction owl:oneOf (Inform, Request, Confirm, Clarify, Accept, Reject)."""
    members = _get_one_of_members(ref, PAO.CommunicativeFunction)
    assert members == {
        PAO.Inform,
        PAO.Request,
        PAO.Confirm,
        PAO.Clarify,
        PAO.Accept,
        PAO.Reject,
    }


def test_all_different_communicative_function(ref: Graph) -> None:
    """AllDifferent for CommunicativeFunction individuals."""
    assert _find_all_different_containing(
        ref, {PAO.Inform, PAO.Request, PAO.Confirm, PAO.Clarify, PAO.Accept, PAO.Reject}
    )


def test_claim_type_individuals(ref: Graph) -> None:
    """UserPreference is a ClaimType individual."""
    assert (PAO.UserPreference, RDF.type, PAO.ClaimType) in ref


def test_claim_type_enumeration(ref: Graph) -> None:
    """ClaimType owl:oneOf (UserPreference)."""
    members = _get_one_of_members(ref, PAO.ClaimType)
    assert members == {PAO.UserPreference}


def test_all_different_claim_type(ref: Graph) -> None:
    """AllDifferent for ClaimType individuals."""
    assert _find_all_different_containing(ref, {PAO.UserPreference})


def test_item_fate_individuals(ref: Graph) -> None:
    """Preserved, Dropped, Summarized, Archived are ItemFate individuals."""
    for name in ["Preserved", "Dropped", "Summarized", "Archived"]:
        assert (PAO[name], RDF.type, PAO.ItemFate) in ref


def test_item_fate_enumeration(ref: Graph) -> None:
    """ItemFate owl:oneOf (Preserved, Dropped, Summarized, Archived)."""
    members = _get_one_of_members(ref, PAO.ItemFate)
    assert members == {PAO.Preserved, PAO.Dropped, PAO.Summarized, PAO.Archived}


def test_all_different_item_fate(ref: Graph) -> None:
    """AllDifferent for ItemFate individuals."""
    assert _find_all_different_containing(
        ref, {PAO.Preserved, PAO.Dropped, PAO.Summarized, PAO.Archived}
    )


def test_has_key_ai_agent(tbox: Graph) -> None:
    """AIAgent has owl:hasKey (hasAgentId)."""
    key_list = tbox.value(PAO.AIAgent, OWL.hasKey)
    assert key_list is not None, "AIAgent missing owl:hasKey"
    keys = list(Collection(tbox, key_list))
    assert PAO.hasAgentId in keys


def test_has_key_session(tbox: Graph) -> None:
    """Session has owl:hasKey (hasSessionId)."""
    key_list = tbox.value(PAO.Session, OWL.hasKey)
    assert key_list is not None, "Session missing owl:hasKey"
    keys = list(Collection(tbox, key_list))
    assert PAO.hasSessionId in keys


def test_has_key_conversation(tbox: Graph) -> None:
    """Conversation has owl:hasKey (hasConversationId)."""
    key_list = tbox.value(PAO.Conversation, OWL.hasKey)
    assert key_list is not None, "Conversation missing owl:hasKey"
    keys = list(Collection(tbox, key_list))
    assert PAO.hasConversationId in keys


def test_has_key_foundation_model(tbox: Graph) -> None:
    """FoundationModel has owl:hasKey (hasModelId)."""
    key_list = tbox.value(PAO.FoundationModel, OWL.hasKey)
    assert key_list is not None, "FoundationModel missing owl:hasKey"
    keys = list(Collection(tbox, key_list))
    assert PAO.hasModelId in keys


def test_failure_type_individuals(ref: Graph) -> None:
    """FailureType individuals exist."""
    for name in [
        "Timeout",
        "AuthenticationFailure",
        "RateLimited",
        "DependencyFailure",
        "ConfigurationError",
        "NetworkError",
    ]:
        assert (PAO[name], RDF.type, PAO.FailureType) in ref


def test_failure_type_enumeration(ref: Graph) -> None:
    """FailureType owl:oneOf contains all 6 members."""
    members = _get_one_of_members(ref, PAO.FailureType)
    assert members == {
        PAO.Timeout,
        PAO.AuthenticationFailure,
        PAO.RateLimited,
        PAO.DependencyFailure,
        PAO.ConfigurationError,
        PAO.NetworkError,
    }


def test_all_different_failure_type(ref: Graph) -> None:
    """AllDifferent for FailureType individuals."""
    assert _find_all_different_containing(
        ref,
        {
            PAO.Timeout,
            PAO.AuthenticationFailure,
            PAO.RateLimited,
            PAO.DependencyFailure,
            PAO.ConfigurationError,
            PAO.NetworkError,
        },
    )


def test_schedule_status_individuals(ref: Graph) -> None:
    """ScheduleStatus individuals exist."""
    for name in ["ScheduleActive", "SchedulePaused", "ScheduleExpired", "ScheduleDisabled"]:
        assert (PAO[name], RDF.type, PAO.ScheduleStatus) in ref


def test_schedule_status_enumeration(ref: Graph) -> None:
    """ScheduleStatus owl:oneOf contains all 4 members."""
    members = _get_one_of_members(ref, PAO.ScheduleStatus)
    assert members == {
        PAO.ScheduleActive,
        PAO.SchedulePaused,
        PAO.ScheduleExpired,
        PAO.ScheduleDisabled,
    }


def test_all_different_schedule_status(ref: Graph) -> None:
    """AllDifferent for ScheduleStatus individuals."""
    assert _find_all_different_containing(
        ref,
        {PAO.ScheduleActive, PAO.SchedulePaused, PAO.ScheduleExpired, PAO.ScheduleDisabled},
    )


def test_execution_outcome_individuals(ref: Graph) -> None:
    """ExecutionOutcome individuals exist."""
    for name in ["ExecutionSucceeded", "ExecutionFailed", "ExecutionSkipped"]:
        assert (PAO[name], RDF.type, PAO.ExecutionOutcome) in ref


def test_execution_outcome_enumeration(ref: Graph) -> None:
    """ExecutionOutcome owl:oneOf contains all 3 members."""
    members = _get_one_of_members(ref, PAO.ExecutionOutcome)
    assert members == {PAO.ExecutionSucceeded, PAO.ExecutionFailed, PAO.ExecutionSkipped}


def test_all_different_execution_outcome(ref: Graph) -> None:
    """AllDifferent for ExecutionOutcome individuals."""
    assert _find_all_different_containing(
        ref, {PAO.ExecutionSucceeded, PAO.ExecutionFailed, PAO.ExecutionSkipped}
    )


def test_concurrency_policy_individuals(ref: Graph) -> None:
    """ConcurrencyPolicy individuals exist."""
    for name in ["ConcurrencyAllow", "ConcurrencyForbid", "ConcurrencyReplace"]:
        assert (PAO[name], RDF.type, PAO.ConcurrencyPolicy) in ref


def test_concurrency_policy_enumeration(ref: Graph) -> None:
    """ConcurrencyPolicy owl:oneOf contains all 3 members."""
    members = _get_one_of_members(ref, PAO.ConcurrencyPolicy)
    assert members == {PAO.ConcurrencyAllow, PAO.ConcurrencyForbid, PAO.ConcurrencyReplace}


def test_all_different_concurrency_policy(ref: Graph) -> None:
    """AllDifferent for ConcurrencyPolicy individuals."""
    assert _find_all_different_containing(
        ref, {PAO.ConcurrencyAllow, PAO.ConcurrencyForbid, PAO.ConcurrencyReplace}
    )


# ---------------------------------------------------------------------------
# owl:oneOf enumerations
# ---------------------------------------------------------------------------


def _get_one_of_members(g: Graph, cls: URIRef) -> set[URIRef]:
    """Get members of an owl:equivalentClass / owl:oneOf enumeration."""
    for eq in g.objects(cls, OWL.equivalentClass):
        list_node = g.value(eq, OWL.oneOf)
        if list_node:
            return set(Collection(g, list_node))
    return set()


def test_session_status_enumeration(ref: Graph) -> None:
    """SessionStatus owl:equivalentClass owl:oneOf (Active, Ended, Interrupted)."""
    members = _get_one_of_members(ref, PAO.SessionStatus)
    assert members == {PAO.Active, PAO.Ended, PAO.Interrupted}


def test_task_status_enumeration(ref: Graph) -> None:
    """TaskStatus owl:equivalentClass owl:oneOf (Pending, InProgress, Completed, Blocked)."""
    members = _get_one_of_members(ref, PAO.TaskStatus)
    assert members == {PAO.Pending, PAO.InProgress, PAO.Completed, PAO.Blocked}


def test_compliance_status_enumeration(ref: Graph) -> None:
    """ComplianceStatus owl:equivalentClass owl:oneOf (Compliant, NonCompliant)."""
    members = _get_one_of_members(ref, PAO.ComplianceStatus)
    assert members == {PAO.Compliant, PAO.NonCompliant}


def test_agent_role_enumeration(ref: Graph) -> None:
    """AgentRole owl:equivalentClass owl:oneOf (AssistantRole, UserRole)."""
    members = _get_one_of_members(ref, PAO.AgentRole)
    assert members == {PAO.AssistantRole, PAO.UserRole}


# ---------------------------------------------------------------------------
# AllDifferent axioms for status groups
# ---------------------------------------------------------------------------


def _find_all_different_containing(g: Graph, individuals: set[URIRef]) -> bool:
    """Check if an AllDifferent axiom exists containing all given individuals."""
    for node in g.subjects(RDF.type, OWL.AllDifferent):
        members_list = g.value(node, OWL.distinctMembers)
        if members_list:
            members = set(Collection(g, members_list))
            if individuals <= members:
                return True
    return False


def test_all_different_task_status(ref: Graph) -> None:
    """AllDifferent for TaskStatus individuals."""
    assert _find_all_different_containing(
        ref, {PAO.Pending, PAO.InProgress, PAO.Completed, PAO.Blocked}
    )


def test_all_different_session_status(ref: Graph) -> None:
    """AllDifferent for SessionStatus individuals."""
    assert _find_all_different_containing(ref, {PAO.Active, PAO.Ended, PAO.Interrupted})


def test_all_different_compliance_status(ref: Graph) -> None:
    """AllDifferent for ComplianceStatus individuals."""
    assert _find_all_different_containing(ref, {PAO.Compliant, PAO.NonCompliant})


def test_all_different_agent_roles(ref: Graph) -> None:
    """AllDifferent for AgentRole individuals."""
    assert _find_all_different_containing(ref, {PAO.AssistantRole, PAO.UserRole})


# ---------------------------------------------------------------------------
# PROV-O alignment
# ---------------------------------------------------------------------------


def test_event_subclass_prov_activity(tbox: Graph) -> None:
    """Event is subClassOf prov:Activity."""
    assert (PAO.Event, RDFS.subClassOf, PROV.Activity) in tbox


def test_ai_agent_subclass_prov_software_agent(tbox: Graph) -> None:
    """AIAgent is subClassOf prov:SoftwareAgent."""
    assert (PAO.AIAgent, RDFS.subClassOf, PROV.SoftwareAgent) in tbox


def test_human_user_subclass_prov_person(tbox: Graph) -> None:
    """HumanUser is subClassOf prov:Person."""
    assert (PAO.HumanUser, RDFS.subClassOf, PROV.Person) in tbox


def test_plan_subclass_prov_plan(tbox: Graph) -> None:
    """Plan is subClassOf prov:Plan."""
    assert (PAO.Plan, RDFS.subClassOf, PROV.Plan) in tbox


def test_agent_role_subclass_prov_role(tbox: Graph) -> None:
    """AgentRole is subClassOf prov:Role."""
    assert (PAO.AgentRole, RDFS.subClassOf, PROV.Role) in tbox


# ---------------------------------------------------------------------------
# Ontology header
# ---------------------------------------------------------------------------


def test_ontology_declaration(tbox: Graph) -> None:
    """The ontology IRI is declared."""
    assert (PAO[""], RDF.type, OWL.Ontology) in tbox


def test_ontology_imports_reference_individuals(tbox: Graph) -> None:
    """TBox imports the reference individuals module."""
    assert (PAO[""], OWL.imports, PAO["reference-individuals"]) in tbox


def test_ontology_version_info(tbox: Graph) -> None:
    """Ontology has owl:versionInfo."""
    versions = list(tbox.objects(PAO[""], OWL.versionInfo))
    assert versions


# ---------------------------------------------------------------------------
# CQ SPARQL tests -- SELECT queries (non_empty expected)
# ---------------------------------------------------------------------------

CQ_SELECT_NON_EMPTY = [
    "cq-001.sparql",
    "cq-002.sparql",
    "cq-003.sparql",
    "cq-004.sparql",
    "cq-005.sparql",
    "cq-006.sparql",
    "cq-007.sparql",
    "cq-008.sparql",
    "cq-009.sparql",
    "cq-010.sparql",
    "cq-011.sparql",
    "cq-012.sparql",
    "cq-013.sparql",
    "cq-014.sparql",
    "cq-015.sparql",
    "cq-016.sparql",
    "cq-017.sparql",
    "cq-018.sparql",
    "cq-019.sparql",
    "cq-020.sparql",
    "cq-022.sparql",
    "cq-023.sparql",
    "cq-024.sparql",
    "cq-025.sparql",
    "cq-026.sparql",
    "cq-027.sparql",
    "cq-028.sparql",
    "cq-029.sparql",
    "cq-030.sparql",
    "cq-032.sparql",
    "cq-033.sparql",
    "cq-034.sparql",
    "cq-035.sparql",
    "cq-036.sparql",
    "cq-037.sparql",
    "cq-041.sparql",
    "cq-042.sparql",
    "cq-043.sparql",
    "cq-044.sparql",
    "cq-045.sparql",
    "cq-046.sparql",
    "cq-047.sparql",
    "cq-048.sparql",
    "cq-050.sparql",
    "cq-051.sparql",
    "cq-052.sparql",
    "cq-053.sparql",
    "cq-054.sparql",
    "cq-055.sparql",
    "cq-056.sparql",
    "cq-057.sparql",
    "cq-058.sparql",
    "cq-059.sparql",
    "cq-060.sparql",
    "cq-061.sparql",
    "cq-062.sparql",
    "cq-063.sparql",
    "cq-064.sparql",
    "cq-065.sparql",
    # v0.5.0: Communication Channels & Integrations
    "cq-066.sparql",
    "cq-067.sparql",
    "cq-068.sparql",
    "cq-069.sparql",
    "cq-070.sparql",
    "cq-071.sparql",
    "cq-072.sparql",
    "cq-073.sparql",
    "cq-074.sparql",
    "cq-075.sparql",
    "cq-076.sparql",
    "cq-077.sparql",
    "cq-078.sparql",
    # v0.6.0: External Services, Runtime Safety, Recovery
    "cq-079.sparql",
    "cq-080.sparql",
    "cq-081.sparql",
    "cq-082.sparql",
    "cq-083.sparql",
    "cq-084.sparql",
    "cq-085.sparql",
    "cq-086.sparql",
    "cq-087.sparql",
    "cq-088.sparql",
    "cq-089.sparql",
    # v0.6.0 Phase B: Tool/Message Trace, Memory Control Plane, Dialog Pragmatics
    "cq-090.sparql",
    "cq-091.sparql",
    "cq-092.sparql",
    "cq-093.sparql",
    "cq-094.sparql",
    "cq-095.sparql",
    "cq-096.sparql",
    "cq-097.sparql",
    "cq-098.sparql",
    # v0.7.0: Model Identity, Observability, Failure Taxonomy, BDI
    "cq-099.sparql",
    "cq-100.sparql",
    "cq-101.sparql",
    "cq-102.sparql",
    "cq-103.sparql",
    "cq-104.sparql",
    "cq-105.sparql",
    "cq-106.sparql",
    "cq-107.sparql",
    "cq-108.sparql",
    "cq-109.sparql",
    "cq-110.sparql",
    "cq-111.sparql",
    "cq-112.sparql",
    "cq-113.sparql",
    # v0.8.0: Scheduling & Automation
    "cq-114.sparql",
    "cq-115.sparql",
    "cq-116.sparql",
    "cq-117.sparql",
    "cq-118.sparql",
    "cq-119.sparql",
    "cq-120.sparql",
    "cq-121.sparql",
    "cq-122.sparql",
    "cq-123.sparql",
    "cq-124.sparql",
    "cq-125.sparql",
    "cq-126.sparql",
    "cq-127.sparql",
    "cq-128.sparql",
]


@pytest.mark.parametrize("query_file", CQ_SELECT_NON_EMPTY)
def test_cq_select_non_empty(full_graph: Graph, query_file: str) -> None:
    """CQ SELECT queries return non-empty result sets on sample data."""
    query = (SPARQL_DIR / query_file).read_text()
    results = list(full_graph.query(query))
    assert results, f"{query_file} returned no rows"


# ---------------------------------------------------------------------------
# CQ SPARQL tests -- ASK queries (expected true)
# ---------------------------------------------------------------------------

CQ_ASK_TRUE = [
    "cq-021.sparql",  # Does event A occur before event B?
    "cq-031.sparql",  # Did a tool invocation comply?
    "cq-038.sparql",  # Is a session active?
    "cq-049.sparql",  # Does a consent record exist for a subject?
]


@pytest.mark.parametrize("query_file", CQ_ASK_TRUE)
def test_cq_ask_true(full_graph: Graph, query_file: str) -> None:
    """CQ ASK queries return true on sample data."""
    query = (SPARQL_DIR / query_file).read_text()
    result = full_graph.query(query)
    assert bool(result.askAnswer), f"{query_file} returned false"


# ---------------------------------------------------------------------------
# CQ SPARQL tests -- constraint tests (expected zero rows)
# ---------------------------------------------------------------------------

CQ_ZERO_ROWS = [
    "cq-039.sparql",  # No policy-violating tool invocations
    "cq-040.sparql",  # No memory items without provenance
]


@pytest.mark.parametrize("query_file", CQ_ZERO_ROWS)
def test_cq_constraint_zero_rows(full_graph: Graph, query_file: str) -> None:
    """CQ constraint queries return zero rows on well-formed sample data."""
    query = (SPARQL_DIR / query_file).read_text()
    results = list(full_graph.query(query))
    assert not results, f"{query_file} returned {len(results)} rows (expected 0)"


# ---------------------------------------------------------------------------
# SHACL conformance
# ---------------------------------------------------------------------------


def test_shacl_conformance(shapes: Graph) -> None:
    """Reference individuals and sample ABox data conform to SHACL shapes."""
    from pyshacl import validate

    data = Graph()
    data.parse(str(TBOX_PATH), format="turtle")
    data.parse(str(REF_PATH), format="turtle")
    data.parse(str(DATA_PATH), format="turtle")

    conforms, _results_graph, results_text = validate(
        data_graph=data,
        shacl_graph=shapes,
        inference="rdfs",
    )
    assert conforms, f"SHACL validation failed:\n{results_text}"


# ---------------------------------------------------------------------------
# SHACL shapes structural checks
# ---------------------------------------------------------------------------


def test_shacl_shape_count(shapes: Graph) -> None:
    """At least 60 NodeShapes exist."""
    node_shapes = set(shapes.subjects(RDF.type, SH.NodeShape))
    assert len(node_shapes) >= 60, f"Expected >=60 NodeShapes, got {len(node_shapes)}"


EXPECTED_SHAPE_TARGETS = [
    "AIAgent",
    "Action",
    "AuditEntry",
    "CapabilityDiscoveryEvent",
    "Checkpoint",
    "ClarificationRequest",
    "Claim",
    "CommunicationChannel",
    "CompactionDisposition",
    "CompactionEvent",
    "ConsentRecord",
    "ContentBlock",
    "ContextWindow",
    "Conversation",
    "DialogAct",
    "Episode",
    "ErasureEvent",
    "ErrorRecoveryEvent",
    "Event",
    "ExternalService",
    "Goal",
    "GroundingAct",
    "HookExecution",
    "Integration",
    "Intention",
    "MemoryBlock",
    "MemoryItem",
    "MemoryOperation",
    "MemoryWriteConflict",
    "Message",
    "Observation",
    "Organization",
    "PermissionPolicy",
    "Persona",
    "Plan",
    "RetentionPolicy",
    "SafetyConstraint",
    "ServiceConnection",
    "SharedMemoryArtifact",
    "Session",
    "StatusTransition",
    "SubAgent",
    "Task",
    "ToolInvocation",
    "ToolInvocationGroup",
    "Turn",
    # v0.7.0: Model Identity
    "FoundationModel",
    "ModelInvocation",
    "GenerationConfiguration",
    "ModelProvider",
    # v0.7.0: Observability
    "OperationalMetric",
    "MetricObservation",
    "ReliabilityIncident",
    # v0.7.0: BDI Completion
    "Belief",
    "Desire",
    "Deliberation",
    "Justification",
    # v0.8.0: Scheduling & Automation
    "Schedule",
    "ScheduledExecution",
    "RecurrencePattern",
]


@pytest.mark.parametrize("cls_name", EXPECTED_SHAPE_TARGETS)
def test_shacl_shape_targets_class(shapes: Graph, cls_name: str) -> None:
    """A NodeShape targets each expected class."""
    found = False
    for shape in shapes.subjects(RDF.type, SH.NodeShape):
        target = shapes.value(shape, SH.targetClass)
        if target == PAO[cls_name]:
            found = True
            break
    assert found, f"No NodeShape targeting {cls_name}"
