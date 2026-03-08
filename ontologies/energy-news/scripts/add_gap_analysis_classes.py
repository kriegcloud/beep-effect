"""Add gap analysis OWL classes and properties to the energy news TBox.

Implements Phase 2 of the 2026-02-26 gap analysis:
- 14 new OWL classes with BFO alignment
- 16 new properties (10 object + 6 datatype)
- Updates AllDisjointClasses declaration
- Adds BFO:Process stub to declarations
- Bumps ontology version to 0.3.0
"""

from pathlib import Path

from rdflib import DCTERMS, OWL, RDF, RDFS, SKOS, XSD, BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection

ENEWS = Namespace("http://example.org/ontology/energy-news#")
OBO = Namespace("http://purl.obolibrary.org/obo/")
SCHEMA = Namespace("https://schema.org/")
ONTOLOGY_IRI = URIRef("http://example.org/ontology/energy-news")
BFO_DECL_IRI = URIRef("http://example.org/ontology/energy-news/bfo-declarations")

BASE_DIR = Path(__file__).parent.parent
TBOX_FILE = BASE_DIR / "energy-news.ttl"
BFO_FILE = BASE_DIR / "imports" / "bfo-declarations.ttl"


# ── BFO Process stub ───────────────────────────────────────────────────


def add_bfo_process_stub(bfo_g: Graph) -> None:
    """Add BFO:Process declaration to the BFO stubs file."""
    process = OBO.BFO_0000015
    if (process, RDF.type, OWL.Class) not in bfo_g:
        bfo_g.add((process, RDF.type, OWL.Class))
        bfo_g.add((process, RDFS.label, Literal("process", lang="en")))
        print("  + BFO:Process (BFO_0000015) stub")


# ── New OWL Classes ────────────────────────────────────────────────────

NEW_CLASSES = [
    # --- Process-aligned classes (BFO:0000015) ---
    {
        "iri": "EnergyProject",
        "label": "energy project",
        "parent": OBO.BFO_0000015,
        "definition": (
            "A Process representing a planned or ongoing initiative to develop, "
            "construct, or operate energy infrastructure including renewable "
            "installations, grid upgrades, and storage facilities"
        ),
        "top_level": True,
    },
    {
        "iri": "PowerPlant",
        "label": "power plant",
        "parent": ENEWS.EnergyProject,
        "definition": (
            "An EnergyProject that represents a facility generating electricity "
            "or thermal energy, characterized by fuel type, capacity, and "
            "operational status"
        ),
        "top_level": False,
    },
    {
        "iri": "RenewableInstallation",
        "label": "renewable installation",
        "parent": ENEWS.EnergyProject,
        "definition": (
            "An EnergyProject that represents a specific renewable energy facility "
            "such as a solar array, wind farm, or geothermal plant, characterized "
            "by technology type and capacity"
        ),
        "top_level": False,
    },
    {
        "iri": "EnergyEvent",
        "label": "energy event",
        "parent": OBO.BFO_0000015,
        "definition": (
            "A Process representing a significant occurrence in the energy sector "
            "including conferences, policy announcements, regulatory decisions, "
            "and market disruptions"
        ),
        "top_level": True,
    },
    # --- Site-aligned subclass ---
    {
        "iri": "GridZone",
        "label": "grid zone",
        "parent": ENEWS.GeographicEntity,
        "definition": (
            "A GeographicEntity that represents a region with defined electrical "
            "grid boundaries managed by a specific operator"
        ),
        "top_level": False,
    },
    # --- Organization subclass ---
    {
        "iri": "RegulatoryBody",
        "label": "regulatory body",
        "parent": ENEWS.Organization,
        "definition": (
            "An Organization with authority to create, enforce, or adjudicate "
            "energy policy and grid operations within a defined jurisdiction"
        ),
        "top_level": False,
    },
    # --- GDC-aligned classes (BFO:0000031) ---
    {
        "iri": "EnergyTechnology",
        "label": "energy technology",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a class of "
            "technological innovations used in energy generation, storage, "
            "transmission, or efficiency"
        ),
        "top_level": True,
    },
    {
        "iri": "PolicyInstrument",
        "label": "policy instrument",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a regulatory, "
            "legislative, or economic tool used to incentivize, mandate, or "
            "restrict energy production or technology adoption"
        ),
        "top_level": True,
    },
    {
        "iri": "CapacityMeasurement",
        "label": "capacity measurement",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a quantified metric "
            "of power generation or storage capability measured in MW, GW, MWh, "
            "or equivalent units"
        ),
        "top_level": True,
    },
    {
        "iri": "MarketInstrument",
        "label": "market instrument",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a financial or "
            "trading mechanism for energy commodities, capacity, or credits "
            "including carbon permits, PPAs, and RECs"
        ),
        "top_level": True,
    },
    {
        "iri": "PriceDataPoint",
        "label": "price data point",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a quantified price "
            "or cost metric for energy, technology, or commodities at a specific "
            "point in time"
        ),
        "top_level": True,
    },
    {
        "iri": "ProjectStatus",
        "label": "project status",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a categorical "
            "characterization of an energy project phase from planning "
            "through decommissioning"
        ),
        "top_level": True,
    },
    {
        "iri": "EmbeddedExternalLink",
        "label": "embedded external link",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a hyperlink embedded "
            "within a Post pointing to an external web resource with link "
            "metadata such as title, description, and URI"
        ),
        "top_level": True,
    },
    {
        "iri": "MediaAttachment",
        "label": "media attachment",
        "parent": OBO.BFO_0000031,
        "definition": (
            "A GenericallyDependentContinuant representing a multimedia object "
            "such as an image, video, or document attached to or embedded in "
            "a Post"
        ),
        "top_level": True,
    },
]


# ── New Properties ──────────────────────────────────────────────────────

NEW_OBJECT_PROPERTIES = [
    {
        "iri": "hasCapacity",
        "label": "has capacity",
        "domain": "EnergyProject",
        "range": "CapacityMeasurement",
        "definition": "Links an EnergyProject to its capacity measurement",
    },
    {
        "iri": "hasStatus",
        "label": "has status",
        "domain": "EnergyProject",
        "range": "ProjectStatus",
        "functional": True,
        "definition": "Links an EnergyProject to its current status",
    },
    {
        "iri": "operatedBy",
        "label": "operated by",
        "domain": "GridZone",
        "range": "Organization",
        "definition": "Links a GridZone to its operating organization",
    },
    {
        "iri": "hasTechnology",
        "label": "has technology",
        "domain": "RenewableInstallation",
        "range": "EnergyTechnology",
        "definition": "Links a RenewableInstallation to its technology type",
    },
    {
        "iri": "jurisdiction",
        "label": "jurisdiction",
        "domain": None,  # Multi-domain: RegulatoryBody, PolicyInstrument — omit
        "range": "GeographicEntity",
        "definition": (
            "Links a RegulatoryBody or PolicyInstrument to the "
            "GeographicEntity representing its jurisdictional scope"
        ),
    },
    {
        "iri": "hasEmbed",
        "label": "has embed",
        "domain": "Post",
        "range": "EmbeddedExternalLink",
        "definition": "Links a Post to its embedded external link",
    },
    {
        "iri": "hasMedia",
        "label": "has media",
        "domain": "Post",
        "range": "MediaAttachment",
        "definition": "Links a Post to its media attachments",
    },
    {
        "iri": "isReplyTo",
        "label": "is reply to",
        "domain": "Post",
        "range": "Post",
        "definition": "Links a reply Post to the parent Post it responds to",
    },
    {
        "iri": "coversTechnology",
        "label": "covers technology",
        "domain": "Article",
        "range": "EnergyTechnology",
        "definition": "Links an Article to an EnergyTechnology it discusses",
    },
    {
        "iri": "aboutProject",
        "label": "about project",
        "domain": "Article",
        "range": "EnergyProject",
        "definition": "Links an Article to an EnergyProject it covers",
    },
]

NEW_DATATYPE_PROPERTIES = [
    {
        "iri": "likeCount",
        "label": "like count",
        "domain": "Post",
        "range": XSD.nonNegativeInteger,
        "definition": "The number of likes on a Post",
    },
    {
        "iri": "repostCount",
        "label": "repost count",
        "domain": "Post",
        "range": XSD.nonNegativeInteger,
        "definition": "The number of reposts of a Post",
    },
    {
        "iri": "replyCount",
        "label": "reply count",
        "domain": "Post",
        "range": XSD.nonNegativeInteger,
        "definition": "The number of replies to a Post",
    },
    {
        "iri": "postText",
        "label": "post text",
        "domain": "Post",
        "range": XSD.string,
        "definition": "The text content of a Post",
    },
    {
        "iri": "createdAt",
        "label": "created at",
        "domain": "Post",
        "range": XSD.dateTime,
        "functional": True,
        "definition": "The timestamp when a Post was created",
    },
    {
        "iri": "displayName",
        "label": "display name",
        "domain": "AuthorAccount",
        "range": XSD.string,
        "definition": "The display name of an AuthorAccount",
    },
]


# Top-level classes for AllDisjointClasses (not subclasses of existing members)
ALL_DISJOINT_MEMBERS = [
    # Original 9
    "EnergyTopic",
    "Article",
    "Publication",
    "Post",
    "AuthorAccount",
    "Feed",
    "Organization",
    "GeographicEntity",
    "SocialMediaPlatform",
    # New top-level (not subclasses of above)
    "EnergyProject",
    "EnergyEvent",
    "EnergyTechnology",
    "PolicyInstrument",
    "CapacityMeasurement",
    "MarketInstrument",
    "PriceDataPoint",
    "ProjectStatus",
    "EmbeddedExternalLink",
    "MediaAttachment",
]


def remove_all_disjoint_classes(g: Graph) -> None:
    """Remove existing AllDisjointClasses blank nodes."""
    for adc_node in g.subjects(RDF.type, OWL.AllDisjointClasses):
        for list_head in g.objects(adc_node, OWL.members):
            _remove_rdf_list(g, list_head)
        for p, o in list(g.predicate_objects(adc_node)):
            g.remove((adc_node, p, o))
        g.remove((adc_node, RDF.type, OWL.AllDisjointClasses))


def _remove_rdf_list(g: Graph, node: URIRef | BNode) -> None:
    """Recursively remove an RDF list."""
    if node == RDF.nil:
        return
    rest = g.value(node, RDF.rest)
    for p, o in list(g.predicate_objects(node)):
        g.remove((node, p, o))
    if rest is not None:
        _remove_rdf_list(g, rest)


def main() -> None:
    """Execute the gap analysis class and property additions."""
    # ── Load graphs ──────────────────────────────────────────────────────
    g = Graph()
    g.parse(TBOX_FILE, format="turtle")
    print(f"Loaded {len(g)} triples from {TBOX_FILE.name}")

    bfo_g = Graph()
    bfo_g.parse(BFO_FILE, format="turtle")
    print(f"Loaded {len(bfo_g)} triples from {BFO_FILE.name}")

    # ── Step 1: Add BFO:Process stub ─────────────────────────────────────
    add_bfo_process_stub(bfo_g)
    bfo_g.serialize(BFO_FILE, format="turtle")
    print(f"  Saved BFO declarations ({len(bfo_g)} triples)")

    # ── Step 2: Add new classes ──────────────────────────────────────────
    for cls_data in NEW_CLASSES:
        cls_uri = ENEWS[cls_data["iri"]]
        g.add((cls_uri, RDF.type, OWL.Class))
        g.add((cls_uri, RDFS.label, Literal(cls_data["label"], lang="en")))
        g.add((cls_uri, RDFS.subClassOf, cls_data["parent"]))
        g.add((cls_uri, SKOS.definition, Literal(cls_data["definition"], lang="en")))
        level = "top-level" if cls_data["top_level"] else "subclass"
        print(f"  + class ({level}): {cls_data['iri']}")

    # ── Step 3: Add object properties ────────────────────────────────────
    for prop_data in NEW_OBJECT_PROPERTIES:
        prop_uri = ENEWS[prop_data["iri"]]
        g.add((prop_uri, RDF.type, OWL.ObjectProperty))
        g.add((prop_uri, RDFS.label, Literal(prop_data["label"], lang="en")))
        g.add((prop_uri, SKOS.definition, Literal(prop_data["definition"], lang="en")))
        if prop_data["domain"]:
            g.add((prop_uri, RDFS.domain, ENEWS[prop_data["domain"]]))
        g.add((prop_uri, RDFS.range, ENEWS[prop_data["range"]]))
        if prop_data.get("functional"):
            g.add((prop_uri, RDF.type, OWL.FunctionalProperty))
        print(f"  + object property: {prop_data['iri']}")

    # ── Step 4: Add datatype properties ──────────────────────────────────
    for prop_data in NEW_DATATYPE_PROPERTIES:
        prop_uri = ENEWS[prop_data["iri"]]
        g.add((prop_uri, RDF.type, OWL.DatatypeProperty))
        g.add((prop_uri, RDFS.label, Literal(prop_data["label"], lang="en")))
        g.add((prop_uri, SKOS.definition, Literal(prop_data["definition"], lang="en")))
        g.add((prop_uri, RDFS.domain, ENEWS[prop_data["domain"]]))
        g.add((prop_uri, RDFS.range, prop_data["range"]))
        if prop_data.get("functional"):
            g.add((prop_uri, RDF.type, OWL.FunctionalProperty))
        print(f"  + datatype property: {prop_data['iri']}")

    # ── Step 5: Rebuild AllDisjointClasses ────────────────────────────────
    remove_all_disjoint_classes(g)
    print("  ~ removed old AllDisjointClasses")

    adc = BNode()
    g.add((adc, RDF.type, OWL.AllDisjointClasses))
    member_uris = [ENEWS[m] for m in ALL_DISJOINT_MEMBERS]
    list_head = BNode()
    Collection(g, list_head, member_uris)
    g.add((adc, OWL.members, list_head))
    print(f"  + AllDisjointClasses ({len(ALL_DISJOINT_MEMBERS)} members)")

    # ── Step 6: Update ontology metadata ─────────────────────────────────
    g.remove((ONTOLOGY_IRI, OWL.versionInfo, None))
    g.add((ONTOLOGY_IRI, OWL.versionInfo, Literal("0.3.0")))

    g.remove((ONTOLOGY_IRI, OWL.versionIRI, None))
    g.add((ONTOLOGY_IRI, OWL.versionIRI, URIRef("http://example.org/ontology/energy-news/0.3.0")))

    g.remove((ONTOLOGY_IRI, OWL.priorVersion, None))
    g.add((ONTOLOGY_IRI, OWL.priorVersion, URIRef("http://example.org/ontology/energy-news/0.2.0")))

    g.remove((ONTOLOGY_IRI, DCTERMS.modified, None))
    g.add((ONTOLOGY_IRI, DCTERMS.modified, Literal("2026-02-26")))

    # ── Step 7: Serialize ────────────────────────────────────────────────
    g.serialize(TBOX_FILE, format="turtle")
    print(f"\nSerialized {len(g)} triples to {TBOX_FILE.name}")

    # ── Summary ──────────────────────────────────────────────────────────
    n_classes = sum(1 for _ in g.subjects(RDF.type, OWL.Class))
    n_obj_props = sum(1 for _ in g.subjects(RDF.type, OWL.ObjectProperty))
    n_dt_props = sum(1 for _ in g.subjects(RDF.type, OWL.DatatypeProperty))
    print("\nFinal counts:")
    print(f"  OWL classes: {n_classes}")
    print(f"  Object properties: {n_obj_props}")
    print(f"  Datatype properties: {n_dt_props}")


if __name__ == "__main__":
    main()
