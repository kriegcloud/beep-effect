"""Add gap analysis reference individuals to the energy news ontology.

Implements Phase 3 of the 2026-02-26 gap analysis:
- 15 organization individuals (3 RegulatoryBody, 12 Organization)
- 10 geographic entity individuals
- 10 publication individuals
- AllDifferent declarations per entity type
"""

from pathlib import Path

from rdflib import OWL, RDF, RDFS, SKOS, BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection

ENEWS = Namespace("http://example.org/ontology/energy-news#")

INDIVIDUALS_FILE = Path(__file__).parent.parent / "energy-news-reference-individuals.ttl"


# ── Organization Individuals ───────────────────────────────────────────

ORGANIZATIONS = [
    # RegulatoryBody instances
    {
        "iri": "org_doe",
        "type": "RegulatoryBody",
        "label": "U.S. Department of Energy",
        "alt_labels": ["DOE", "Department of Energy"],
        "definition": "A RegulatoryBody representing the United States Department of Energy",
        "sector": "EnergyPolicy",
    },
    {
        "iri": "org_interior",
        "type": "RegulatoryBody",
        "label": "U.S. Interior Department",
        "alt_labels": ["Interior Department", "DOI", "BOEM"],
        "definition": (
            "A RegulatoryBody representing the U.S. Department of the Interior "
            "responsible for offshore energy permitting"
        ),
        "sector": "EnergyPolicy",
    },
    {
        "iri": "org_cpuc",
        "type": "RegulatoryBody",
        "label": "California Public Utilities Commission",
        "alt_labels": ["CPUC", "California PUC"],
        "definition": (
            "A RegulatoryBody representing the California Public Utilities "
            "Commission regulating energy utilities"
        ),
        "sector": "Regulation",
    },
    # Grid operator organizations
    {
        "iri": "org_pjm",
        "type": "Organization",
        "label": "PJM Interconnection",
        "alt_labels": ["PJM"],
        "definition": (
            "An Organization operating the PJM regional transmission "
            "organization serving 13 US states"
        ),
        "sector": "GridAndInfrastructure",
    },
    {
        "iri": "org_caiso",
        "type": "Organization",
        "label": "California ISO",
        "alt_labels": ["CAISO", "California Independent System Operator"],
        "definition": (
            "An Organization operating the California Independent System "
            "Operator managing the state electricity grid"
        ),
        "sector": "GridAndInfrastructure",
    },
    {
        "iri": "org_ercot",
        "type": "Organization",
        "label": "ERCOT",
        "alt_labels": ["Electric Reliability Council of Texas"],
        "definition": (
            "An Organization operating the Electric Reliability Council of "
            "Texas managing the Texas interconnection"
        ),
        "sector": "GridAndInfrastructure",
    },
    {
        "iri": "org_miso",
        "type": "Organization",
        "label": "MISO",
        "alt_labels": ["Midcontinent Independent System Operator"],
        "definition": (
            "An Organization operating the Midcontinent Independent System "
            "Operator across 15 US states and Manitoba"
        ),
        "sector": "GridAndInfrastructure",
    },
    # Energy companies
    {
        "iri": "org_entergy",
        "type": "Organization",
        "label": "Entergy",
        "alt_labels": ["Entergy Corporation"],
        "definition": "An Organization representing the Entergy utility company",
        "sector": "Fossil",
    },
    {
        "iri": "org_meta",
        "type": "Organization",
        "label": "Meta",
        "alt_labels": ["Meta Platforms", "Facebook"],
        "definition": (
            "An Organization representing Meta Platforms a major data center "
            "operator driving energy demand"
        ),
        "sector": "AIAndDataCenterDemand",
    },
    {
        "iri": "org_snam",
        "type": "Organization",
        "label": "Snam",
        "alt_labels": ["Snam S.p.A."],
        "definition": (
            "An Organization representing Snam the Italian natural gas infrastructure operator"
        ),
        "sector": "EnergyTradeAndSupplyChains",
    },
    {
        "iri": "org_eni",
        "type": "Organization",
        "label": "Eni",
        "alt_labels": ["Eni S.p.A."],
        "definition": (
            "An Organization representing Eni the Italian multinational oil and gas company"
        ),
        "sector": "Fossil",
    },
    {
        "iri": "org_orsted",
        "type": "Organization",
        "label": "Ørsted",
        "alt_labels": ["Orsted", "Ørsted A/S"],
        "definition": (
            "An Organization representing Ørsted the Danish multinational "
            "offshore wind energy company"
        ),
        "sector": "Renewable",
    },
    {
        "iri": "org_equinor",
        "type": "Organization",
        "label": "Equinor",
        "alt_labels": ["Equinor ASA"],
        "definition": (
            "An Organization representing Equinor the Norwegian state energy "
            "company active in offshore wind and fossil fuels"
        ),
        "sector": "Renewable",
    },
    {
        "iri": "org_nipsco",
        "type": "Organization",
        "label": "NIPSCO",
        "alt_labels": ["Northern Indiana Public Service Company"],
        "definition": ("An Organization representing NIPSCO the Northern Indiana utility company"),
        "sector": "GridAndInfrastructure",
    },
    {
        "iri": "org_redwood",
        "type": "Organization",
        "label": "Redwood Materials",
        "alt_labels": ["Redwood"],
        "definition": (
            "An Organization representing Redwood Materials a battery "
            "recycling and materials company"
        ),
        "sector": "EnergyStorage",
    },
]

# ── Geographic Entity Individuals ──────────────────────────────────────

GEOGRAPHIES = [
    {
        "iri": "geo_california",
        "label": "California",
        "alt_labels": ["CA"],
        "definition": (
            "A GeographicEntity representing the U.S. state of California "
            "a major solar, storage, and grid innovation market"
        ),
    },
    {
        "iri": "geo_texas",
        "label": "Texas",
        "alt_labels": ["TX"],
        "definition": (
            "A GeographicEntity representing the U.S. state of Texas "
            "home to ERCOT, major wind and gas production"
        ),
    },
    {
        "iri": "geo_germany",
        "label": "Germany",
        "alt_labels": ["DE", "Federal Republic of Germany"],
        "definition": (
            "A GeographicEntity representing Germany a leader in the Energiewende energy transition"
        ),
    },
    {
        "iri": "geo_uk",
        "label": "United Kingdom",
        "alt_labels": ["UK", "Britain"],
        "definition": (
            "A GeographicEntity representing the United Kingdom "
            "a major offshore wind and North Sea energy market"
        ),
    },
    {
        "iri": "geo_india",
        "label": "India",
        "alt_labels": ["IN", "Republic of India"],
        "definition": (
            "A GeographicEntity representing India with major "
            "solar manufacturing and coal transition dynamics"
        ),
    },
    {
        "iri": "geo_china",
        "label": "China",
        "alt_labels": ["CN", "PRC"],
        "definition": (
            "A GeographicEntity representing China the global leader in "
            "renewable energy manufacturing and critical minerals"
        ),
    },
    {
        "iri": "geo_eu",
        "label": "European Union",
        "alt_labels": ["EU"],
        "definition": (
            "A GeographicEntity representing the European Union "
            "with its carbon border tax and energy policy framework"
        ),
    },
    {
        "iri": "geo_alberta",
        "label": "Alberta",
        "alt_labels": ["AB"],
        "definition": (
            "A GeographicEntity representing the Canadian province of Alberta "
            "a major oil, wind, and carbon policy market"
        ),
    },
    {
        "iri": "geo_louisiana",
        "label": "Louisiana",
        "alt_labels": ["LA"],
        "definition": (
            "A GeographicEntity representing the U.S. state of Louisiana "
            "with gas plants, LNG, and data center development"
        ),
    },
    {
        "iri": "geo_north_sea",
        "label": "North Sea",
        "alt_labels": ["North Sea basin"],
        "definition": (
            "A GeographicEntity representing the North Sea basin "
            "a critical region for offshore wind and oil and gas"
        ),
    },
]


# ── Publication Individuals ────────────────────────────────────────────

PUBLICATIONS = [
    {
        "iri": "pub_reuters",
        "label": "Reuters",
        "domain": "reuters.com",
        "definition": "A Publication representing the Reuters news agency",
    },
    {
        "iri": "pub_ft",
        "label": "Financial Times",
        "alt_labels": ["FT"],
        "domain": "ft.com",
        "definition": "A Publication representing the Financial Times newspaper",
    },
    {
        "iri": "pub_guardian",
        "label": "The Guardian",
        "alt_labels": ["Guardian"],
        "domain": "theguardian.com",
        "definition": "A Publication representing The Guardian newspaper",
    },
    {
        "iri": "pub_wired",
        "label": "Wired",
        "domain": "wired.com",
        "definition": "A Publication representing Wired magazine",
    },
    {
        "iri": "pub_cnbc",
        "label": "CNBC",
        "domain": "cnbc.com",
        "definition": "A Publication representing CNBC business news",
    },
    {
        "iri": "pub_utility_dive",
        "label": "Utility Dive",
        "domain": "utilitydive.com",
        "definition": ("A Publication representing Utility Dive an energy industry news outlet"),
    },
    {
        "iri": "pub_energy_monitor",
        "label": "Energy Monitor",
        "domain": "energymonitor.ai",
        "definition": (
            "A Publication representing Energy Monitor a clean energy data and news platform"
        ),
    },
    {
        "iri": "pub_electrek",
        "label": "Electrek",
        "domain": "electrek.co",
        "definition": (
            "A Publication representing Electrek a news outlet covering "
            "electric transport and clean energy"
        ),
    },
    {
        "iri": "pub_rto_insider",
        "label": "RTO Insider",
        "domain": "rtoinsider.com",
        "definition": (
            "A Publication representing RTO Insider covering regional "
            "transmission organizations and wholesale energy markets"
        ),
    },
    {
        "iri": "pub_inside_climate",
        "label": "Inside Climate News",
        "alt_labels": ["ICN"],
        "domain": "insideclimatenews.org",
        "definition": (
            "A Publication representing Inside Climate News a nonprofit "
            "climate and energy journalism outlet"
        ),
    },
]


def _remove_rdf_list(g: Graph, node: URIRef | BNode) -> None:
    """Recursively remove an RDF list."""
    if node == RDF.nil:
        return
    rest = g.value(node, RDF.rest)
    for p, o in list(g.predicate_objects(node)):
        g.remove((node, p, o))
    if rest is not None:
        _remove_rdf_list(g, rest)


def add_all_different(g: Graph, members: list[str]) -> None:
    """Add an owl:AllDifferent for a list of ENEWS local names."""
    if len(members) < 2:
        return
    ad = BNode()
    g.add((ad, RDF.type, OWL.AllDifferent))
    member_uris = [ENEWS[m] for m in sorted(members)]
    list_head = BNode()
    Collection(g, list_head, member_uris)
    g.add((ad, OWL.distinctMembers, list_head))


def main() -> None:
    """Add reference individuals for organizations, geographies, and publications."""
    g = Graph()
    g.parse(INDIVIDUALS_FILE, format="turtle")
    print(f"Loaded {len(g)} triples from {INDIVIDUALS_FILE.name}")

    # ── Organizations ────────────────────────────────────────────────────
    org_iris: list[str] = []
    for org in ORGANIZATIONS:
        uri = ENEWS[org["iri"]]
        cls = ENEWS[org["type"]]
        g.add((uri, RDF.type, cls))
        g.add((uri, RDFS.label, Literal(org["label"], lang="en")))
        g.add((uri, SKOS.definition, Literal(org["definition"], lang="en")))
        g.add((uri, ENEWS.hasSector, ENEWS[org["sector"]]))
        for alt in org.get("alt_labels", []):
            g.add((uri, SKOS.altLabel, Literal(alt, lang="en")))
        org_iris.append(org["iri"])
        print(f"  + {org['type']}: {org['label']}")

    # ── Geographies ──────────────────────────────────────────────────────
    geo_iris: list[str] = []
    for geo in GEOGRAPHIES:
        uri = ENEWS[geo["iri"]]
        g.add((uri, RDF.type, ENEWS.GeographicEntity))
        g.add((uri, RDFS.label, Literal(geo["label"], lang="en")))
        g.add((uri, SKOS.definition, Literal(geo["definition"], lang="en")))
        for alt in geo.get("alt_labels", []):
            g.add((uri, SKOS.altLabel, Literal(alt, lang="en")))
        geo_iris.append(geo["iri"])
        print(f"  + GeographicEntity: {geo['label']}")

    # ── Publications ─────────────────────────────────────────────────────
    pub_iris: list[str] = []
    for pub in PUBLICATIONS:
        uri = ENEWS[pub["iri"]]
        g.add((uri, RDF.type, ENEWS.Publication))
        g.add((uri, RDFS.label, Literal(pub["label"], lang="en")))
        g.add((uri, SKOS.definition, Literal(pub["definition"], lang="en")))
        g.add((uri, ENEWS.siteDomain, Literal(pub["domain"])))
        for alt in pub.get("alt_labels", []):
            g.add((uri, SKOS.altLabel, Literal(alt, lang="en")))
        pub_iris.append(pub["iri"])
        print(f"  + Publication: {pub['label']}")

    # ── AllDifferent declarations ────────────────────────────────────────
    add_all_different(g, org_iris)
    print(f"  + AllDifferent: organizations ({len(org_iris)} members)")
    add_all_different(g, geo_iris)
    print(f"  + AllDifferent: geographies ({len(geo_iris)} members)")
    add_all_different(g, pub_iris)
    print(f"  + AllDifferent: publications ({len(pub_iris)} members)")

    # ── Serialize ────────────────────────────────────────────────────────
    g.serialize(INDIVIDUALS_FILE, format="turtle")
    print(f"\nSerialized {len(g)} triples to {INDIVIDUALS_FILE.name}")

    # ── Summary ──────────────────────────────────────────────────────────
    n_orgs = sum(1 for s in g.subjects(RDF.type, ENEWS.Organization)) + sum(
        1 for s in g.subjects(RDF.type, ENEWS.RegulatoryBody)
    )
    n_geos = sum(1 for _ in g.subjects(RDF.type, ENEWS.GeographicEntity))
    n_pubs = sum(1 for _ in g.subjects(RDF.type, ENEWS.Publication))
    print("\nReference entity counts:")
    print(f"  Organizations + RegulatoryBodies: {n_orgs}")
    print(f"  GeographicEntities: {n_geos}")
    print(f"  Publications: {n_pubs}")


if __name__ == "__main__":
    main()
