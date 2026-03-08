"""Fix BFO alignment issues found by conceptualizer review.

Fixes:
1. Reparent PowerPlant from EnergyProject (Process) to BFO:Object
2. Reparent RenewableInstallation from EnergyProject (Process) to BFO:Object
3. Add developedThrough property linking facilities to projects
4. Update EnergyProject definition to clarify process-only semantics
5. Broaden hasTechnology domain from RenewableInstallation to include PowerPlant
6. Broaden operatedBy domain from GridZone to omit (multi-class)
7. Update AllDisjointClasses to include new top-level members
"""

from pathlib import Path

from rdflib import OWL, RDF, RDFS, SKOS, BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection

ENEWS = Namespace("http://example.org/ontology/energy-news#")
OBO = Namespace("http://purl.obolibrary.org/obo/")

TBOX_FILE = Path(__file__).parent.parent / "energy-news.ttl"


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
    """Apply BFO alignment fixes."""
    g = Graph()
    g.parse(TBOX_FILE, format="turtle")
    print(f"Loaded {len(g)} triples from {TBOX_FILE.name}")

    # ── Fix 1: Reparent PowerPlant ───────────────────────────────────────
    pp = ENEWS.PowerPlant
    g.remove((pp, RDFS.subClassOf, ENEWS.EnergyProject))
    g.add((pp, RDFS.subClassOf, OBO.BFO_0000030))
    g.remove((pp, SKOS.definition, None))
    g.add(
        (
            pp,
            SKOS.definition,
            Literal(
                "An Object representing a facility that generates electricity "
                "or thermal energy, characterized by fuel type, capacity, and "
                "operational status",
                lang="en",
            ),
        )
    )
    print("  ~ reparented PowerPlant → BFO:Object")

    # ── Fix 2: Reparent RenewableInstallation ────────────────────────────
    ri = ENEWS.RenewableInstallation
    g.remove((ri, RDFS.subClassOf, ENEWS.EnergyProject))
    g.add((ri, RDFS.subClassOf, OBO.BFO_0000030))
    g.remove((ri, SKOS.definition, None))
    g.add(
        (
            ri,
            SKOS.definition,
            Literal(
                "An Object representing a specific renewable energy facility "
                "such as a solar array, wind farm, or geothermal plant, "
                "characterized by technology type and capacity",
                lang="en",
            ),
        )
    )
    print("  ~ reparented RenewableInstallation → BFO:Object")

    # ── Fix 3: Add developedThrough property ─────────────────────────────
    dt = ENEWS.developedThrough
    g.add((dt, RDF.type, OWL.ObjectProperty))
    g.add((dt, RDFS.label, Literal("developed through", lang="en")))
    g.add((dt, RDFS.range, ENEWS.EnergyProject))
    g.add(
        (
            dt,
            SKOS.definition,
            Literal(
                "Links a physical energy facility (PowerPlant or "
                "RenewableInstallation) to the EnergyProject development "
                "process that produced it",
                lang="en",
            ),
        )
    )
    print("  + property: developedThrough")

    # ── Fix 4: Update EnergyProject definition ───────────────────────────
    ep = ENEWS.EnergyProject
    g.remove((ep, SKOS.definition, None))
    g.add(
        (
            ep,
            SKOS.definition,
            Literal(
                "A Process representing the planning, permitting, construction, "
                "and commissioning activity for developing energy infrastructure "
                "such as power plants, renewable installations, and grid upgrades",
                lang="en",
            ),
        )
    )
    print("  ~ updated EnergyProject definition (process-only semantics)")

    # ── Fix 5: Broaden hasTechnology domain ──────────────────────────────
    # Remove narrow domain (RenewableInstallation) — applicable to multiple classes
    ht = ENEWS.hasTechnology
    g.remove((ht, RDFS.domain, ENEWS.RenewableInstallation))
    # Don't re-add a domain — let it be used freely
    print("  ~ removed narrow domain from hasTechnology (now unconstrained)")

    # ── Fix 6: Broaden operatedBy domain ─────────────────────────────────
    ob = ENEWS.operatedBy
    g.remove((ob, RDFS.domain, ENEWS.GridZone))
    print("  ~ removed narrow domain from operatedBy (now unconstrained)")

    # ── Fix 7: Update AllDisjointClasses ─────────────────────────────────
    # Remove existing AllDisjointClasses
    for adc_node in list(g.subjects(RDF.type, OWL.AllDisjointClasses)):
        for list_head in g.objects(adc_node, OWL.members):
            _remove_rdf_list(g, list_head)
        for p, o in list(g.predicate_objects(adc_node)):
            g.remove((adc_node, p, o))

    # Rebuild with PowerPlant and RenewableInstallation as top-level disjoint
    all_disjoint = [
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
        # New from gap analysis (top-level)
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
        # Reparented as independent top-level Objects
        "PowerPlant",
        "RenewableInstallation",
    ]
    adc = BNode()
    g.add((adc, RDF.type, OWL.AllDisjointClasses))
    member_uris = [ENEWS[m] for m in all_disjoint]
    list_head = BNode()
    Collection(g, list_head, member_uris)
    g.add((adc, OWL.members, list_head))
    print(f"  + AllDisjointClasses ({len(all_disjoint)} members)")

    # ── Serialize ────────────────────────────────────────────────────────
    g.serialize(TBOX_FILE, format="turtle")
    print(f"\nSerialized {len(g)} triples to {TBOX_FILE.name}")


if __name__ == "__main__":
    main()
