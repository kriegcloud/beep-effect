"""Add gap analysis SKOS concepts to the energy news reference individuals ontology.

Implements Phase 1 of the 2026-02-26 gap analysis:
- 5 new top-level SKOS concepts
- 21 new leaf-level SKOS concepts
- Reparents DataCenterDemand under AIAndDataCenterDemand
- Updates EnergyTopicScheme hasTopConcept list
- Rebuilds AllDifferent declarations for all sibling groups
- Bumps ontology version to 0.3.0
"""

from pathlib import Path

from rdflib import OWL, RDF, RDFS, SKOS, BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection

ENEWS = Namespace("http://example.org/ontology/energy-news#")
ONTOLOGY_IRI = URIRef("http://example.org/ontology/energy-news/reference-individuals")

INDIVIDUALS_FILE = Path(__file__).parent.parent / "energy-news-reference-individuals.ttl"


# ── New Top-Level Concepts ──────────────────────────────────────────────

TOP_LEVEL_CONCEPTS = [
    {
        "iri": "AIAndDataCenterDemand",
        "label": "AI and data center energy demand",
        "alt_labels": ["AI energy", "data center power", "AI power demand"],
        "definition": (
            "A skos:Concept representing electricity demand from artificial intelligence "
            "workloads, data centers, and large-scale computing infrastructure"
        ),
    },
    {
        "iri": "EnergyTradeAndSupplyChains",
        "label": "energy trade and supply chains",
        "alt_labels": ["energy trade", "energy supply chain", "energy logistics"],
        "definition": (
            "A skos:Concept representing international energy commodity trade, "
            "physical infrastructure for energy transport, and supply chain logistics"
        ),
    },
    {
        "iri": "DistributedEnergyAndFlexibility",
        "label": "distributed energy and grid flexibility",
        "alt_labels": ["DER", "distributed energy resources", "grid flexibility"],
        "definition": (
            "A skos:Concept representing distributed energy resources, demand-side "
            "flexibility, virtual power plants, and decentralized grid management"
        ),
    },
    {
        "iri": "SectoralDecarbonization",
        "label": "sectoral decarbonization",
        "alt_labels": ["hard-to-abate sectors", "deep decarbonization"],
        "definition": (
            "A skos:Concept representing decarbonization efforts in specific economic "
            "sectors including heavy industry, maritime transport, and aviation"
        ),
    },
    {
        "iri": "BiomassAndBioenergy",
        "label": "biomass and bioenergy",
        "alt_labels": ["biomass", "bioenergy", "biofuel", "biogas"],
        "definition": (
            "A skos:Concept representing energy derived from biological materials "
            "including biomass combustion, biofuels, and biogas production"
        ),
    },
]


# ── New Leaf-Level Concepts ─────────────────────────────────────────────

LEAF_CONCEPTS = [
    {
        "iri": "LNGTradeAndInfrastructure",
        "label": "LNG trade and infrastructure",
        "alt_labels": ["LNG trade", "liquefied natural gas trade", "LNG terminal"],
        "broader": "EnergyTradeAndSupplyChains",
        "definition": (
            "A skos:Concept representing the international trade, pricing, and "
            "physical infrastructure for liquefied natural gas"
        ),
    },
    {
        "iri": "OffshoreWind",
        "label": "offshore wind",
        "alt_labels": ["offshore wind farm", "floating wind", "ocean wind"],
        "broader": "Renewable",
        "definition": (
            "A skos:Concept representing fixed-bottom and floating offshore wind energy generation"
        ),
    },
    {
        "iri": "VirtualPowerPlant",
        "label": "virtual power plant",
        "alt_labels": ["VPP", "aggregated DER"],
        "broader": "DistributedEnergyAndFlexibility",
        "definition": (
            "A skos:Concept representing aggregated distributed energy resources "
            "managed as a single dispatchable unit"
        ),
    },
    {
        "iri": "DemandResponse",
        "label": "demand response",
        "alt_labels": ["DR", "load management", "demand flexibility"],
        "broader": "DistributedEnergyAndFlexibility",
        "definition": (
            "A skos:Concept representing programs and technologies that adjust "
            "electricity consumption in response to grid conditions or price signals"
        ),
    },
    {
        "iri": "BatteryRecycling",
        "label": "battery recycling",
        "alt_labels": ["second life battery", "battery circular economy"],
        "broader": "EnergyStorage",
        "definition": (
            "A skos:Concept representing recycling, reuse, and circular economy "
            "practices for energy storage batteries"
        ),
    },
    {
        "iri": "FuelCell",
        "label": "fuel cell",
        "alt_labels": ["hydrogen fuel cell", "PEMFC", "SOFC"],
        "broader": "Hydrogen",
        "definition": (
            "A skos:Concept representing electrochemical devices that convert "
            "hydrogen or other fuels into electricity"
        ),
    },
    {
        "iri": "EnergySecurityAndResilience",
        "label": "energy security and resilience",
        "alt_labels": ["grid resilience", "energy independence", "blackout prevention"],
        "broader": "EnergyGeopolitics",
        "definition": (
            "A skos:Concept representing energy supply security, grid resilience "
            "against disruptions, and energy independence strategies"
        ),
    },
    {
        "iri": "IRAPolicy",
        "label": "Inflation Reduction Act policy",
        "alt_labels": ["IRA", "Inflation Reduction Act", "clean energy tax credits"],
        "broader": "EnergyPolicy",
        "definition": (
            "A skos:Concept representing policies, subsidies, and tax credits "
            "established by the U.S. Inflation Reduction Act"
        ),
    },
    {
        "iri": "PumpedHydroStorage",
        "label": "pumped hydro storage",
        "alt_labels": ["pumped hydro", "pumped storage", "PHES"],
        "broader": "EnergyStorage",
        "definition": ("A skos:Concept representing pumped hydroelectric energy storage systems"),
    },
    {
        "iri": "GreenHydrogen",
        "label": "green hydrogen",
        "alt_labels": ["green H2", "renewable hydrogen", "electrolytic hydrogen"],
        "broader": "Hydrogen",
        "definition": (
            "A skos:Concept representing hydrogen produced via electrolysis "
            "powered by renewable energy sources"
        ),
    },
    {
        "iri": "IndustrialDecarbonization",
        "label": "industrial decarbonization",
        "alt_labels": ["industrial heat", "green steel", "cement decarbonization"],
        "broader": "SectoralDecarbonization",
        "definition": (
            "A skos:Concept representing decarbonization of heavy industry "
            "including steel, cement, and chemical manufacturing"
        ),
    },
    {
        "iri": "DirectAirCapture",
        "label": "direct air capture",
        "alt_labels": ["DAC", "carbon removal"],
        "broader": "CarbonCapture",
        "definition": (
            "A skos:Concept representing technologies that capture carbon dioxide "
            "directly from ambient air"
        ),
    },
    {
        "iri": "CarbonMarkets",
        "label": "carbon markets",
        "alt_labels": ["carbon trading", "carbon credits", "ETS", "cap-and-trade"],
        "broader": "EnergyMarkets",
        "definition": (
            "A skos:Concept representing emissions trading systems, carbon credit "
            "markets, and cap-and-trade mechanisms"
        ),
    },
    {
        "iri": "Perovskite",
        "label": "perovskite solar",
        "alt_labels": ["perovskite", "tandem solar cell", "next-gen PV"],
        "broader": "ResearchAndInnovation",
        "definition": (
            "A skos:Concept representing perovskite and tandem solar cell research "
            "and commercialization"
        ),
    },
    {
        "iri": "COPClimateConference",
        "label": "COP climate conference",
        "alt_labels": ["COP", "COP30", "climate summit", "UNFCCC"],
        "broader": "ClimateAndEmissions",
        "definition": (
            "A skos:Concept representing United Nations Climate Change Conference "
            "proceedings and outcomes"
        ),
    },
    {
        "iri": "Energiewende",
        "label": "Energiewende",
        "alt_labels": ["German energy transition"],
        "broader": "EnergyPolicy",
        "definition": (
            "A skos:Concept representing Germany's energy transition policy "
            "framework and its global influence"
        ),
    },
    {
        "iri": "Microgrid",
        "label": "microgrid",
        "alt_labels": ["islanded grid", "community microgrid"],
        "broader": "DistributedEnergyAndFlexibility",
        "definition": (
            "A skos:Concept representing localized energy grids that can operate "
            "independently from the main grid"
        ),
    },
    {
        "iri": "LongDurationStorage",
        "label": "long duration energy storage",
        "alt_labels": ["LDES", "iron-air battery", "flow battery", "compressed air storage"],
        "broader": "EnergyStorage",
        "definition": (
            "A skos:Concept representing energy storage technologies designed to "
            "discharge over periods exceeding four hours"
        ),
    },
    {
        "iri": "GridModernization",
        "label": "grid modernization",
        "alt_labels": ["smart grid", "grid upgrade", "advanced metering"],
        "broader": "GridAndInfrastructure",
        "definition": (
            "A skos:Concept representing modernization of electrical grid "
            "infrastructure including smart grid technologies and advanced metering"
        ),
    },
    {
        "iri": "MaritimeDecarbonization",
        "label": "maritime decarbonization",
        "alt_labels": ["green shipping", "maritime fuel", "ammonia fuel"],
        "broader": "SectoralDecarbonization",
        "definition": (
            "A skos:Concept representing decarbonization of maritime shipping "
            "through alternative fuels and efficiency measures"
        ),
    },
    {
        "iri": "AviationDecarbonization",
        "label": "aviation decarbonization",
        "alt_labels": ["SAF", "sustainable aviation fuel", "e-fuel"],
        "broader": "SectoralDecarbonization",
        "definition": (
            "A skos:Concept representing decarbonization of the aviation sector "
            "through sustainable fuels and electric aircraft"
        ),
    },
]


# ── AllDifferent sibling groups ─────────────────────────────────────────
# Maps parent concept name → list of child concept local names.
# Built from existing file + new concepts.

SIBLING_GROUPS: dict[str, list[str]] = {
    # Top-level concepts (updated: -DataCenterDemand, +5 new)
    "_top_level": [
        "Renewable",
        "Fossil",
        "Nuclear",
        "EnergyStorage",
        "Hydrogen",
        "CarbonCapture",
        "GridAndInfrastructure",
        "EnergyPolicy",
        "EnergyMarkets",
        "EnergyFinance",
        "ClimateAndEmissions",
        "Electrification",
        "EnergyGeopolitics",
        "EnergyJustice",
        "WorkforceAndManufacturing",
        "ResearchAndInnovation",
        "BuildingsAndEfficiency",
        "EnvironmentAndLandUse",
        # New top-level (DataCenterDemand removed — now leaf)
        "AIAndDataCenterDemand",
        "EnergyTradeAndSupplyChains",
        "DistributedEnergyAndFlexibility",
        "SectoralDecarbonization",
        "BiomassAndBioenergy",
    ],
    # Existing sibling groups (updated with new members)
    "Renewable": ["Solar", "Wind", "Hydro", "Geothermal", "OffshoreWind"],
    "Fossil": ["Coal", "NaturalGas", "Oil"],
    "Nuclear": ["SMR", "Fusion"],
    "EnergyStorage": ["BatteryRecycling", "PumpedHydroStorage", "LongDurationStorage"],
    "Hydrogen": ["FuelCell", "GreenHydrogen"],
    "GridAndInfrastructure": [
        "Transmission",
        "Distribution",
        "Interconnection",
        "GridOperator",
        "GridModernization",
    ],
    "EnergyPolicy": [
        "Regulation",
        "Legislation",
        "Tariff",
        "Permitting",
        "IRAPolicy",
        "Energiewende",
    ],
    "EnergyMarkets": [
        "WholesaleMarkets",
        "Commodity",
        "PowerPurchaseAgreement",
        "CarbonMarkets",
    ],
    "EnergyFinance": ["ProjectFinance", "CorporateDeals", "PublicFunding"],
    "ClimateAndEmissions": [
        "EmissionsTracking",
        "Decarbonization",
        "NetZero",
        "COPClimateConference",
    ],
    "Electrification": ["ElectricVehicles", "EVCharging", "HeatPumps", "ElectricTransport"],
    "EnergyGeopolitics": [
        "TradeAndSanctions",
        "SupplyChain",
        "CriticalMinerals",
        "EnergySecurityAndResilience",
    ],
    "EnergyJustice": ["Affordability", "CommunityEnergy", "EnergyAccess"],
    "WorkforceAndManufacturing": ["EnergyJobs", "Manufacturing", "LaborRelations"],
    "ResearchAndInnovation": ["EfficiencyRecords", "Patent", "Perovskite"],
    "BuildingsAndEfficiency": ["BuildingElectrification", "Retrofits", "RooftopSolar"],
    "EnvironmentAndLandUse": ["WaterUse", "Agrivoltaics", "WasteAndPollution"],
    # New sibling groups
    "DistributedEnergyAndFlexibility": ["VirtualPowerPlant", "DemandResponse", "Microgrid"],
    "SectoralDecarbonization": [
        "IndustrialDecarbonization",
        "MaritimeDecarbonization",
        "AviationDecarbonization",
    ],
    "CarbonCapture": ["DirectAirCapture"],
    # Platform individuals
    "_platforms": ["Bluesky", "Twitter"],
}


def add_concept(g: Graph, data: dict, *, top_level: bool = False) -> None:
    """Add a SKOS concept to the graph."""
    concept = ENEWS[data["iri"]]
    g.add((concept, RDF.type, ENEWS.EnergyTopic))
    g.add((concept, RDF.type, SKOS.Concept))
    g.add((concept, RDFS.label, Literal(data["label"], lang="en")))
    g.add((concept, SKOS.definition, Literal(data["definition"], lang="en")))
    g.add((concept, SKOS.inScheme, ENEWS.EnergyTopicScheme))

    for alt in data["alt_labels"]:
        g.add((concept, SKOS.altLabel, Literal(alt, lang="en")))

    if top_level:
        g.add((concept, SKOS.topConceptOf, ENEWS.EnergyTopicScheme))
    else:
        g.add((concept, SKOS.broader, ENEWS[data["broader"]]))


def remove_all_different(g: Graph) -> None:
    """Remove all owl:AllDifferent blank nodes and their RDF list contents."""
    for ad_node in g.subjects(RDF.type, OWL.AllDifferent):
        # Get the list head
        for list_head in g.objects(ad_node, OWL.distinctMembers):
            # Walk and remove the RDF list
            _remove_rdf_list(g, list_head)
        # Remove the AllDifferent triples
        for p, o in list(g.predicate_objects(ad_node)):
            g.remove((ad_node, p, o))
        g.remove((ad_node, RDF.type, OWL.AllDifferent))


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
    """Add an owl:AllDifferent declaration for a list of ENEWS individuals."""
    if len(members) < 2:
        return  # AllDifferent needs at least 2 members
    ad = BNode()
    g.add((ad, RDF.type, OWL.AllDifferent))
    member_uris = [ENEWS[m] for m in sorted(members)]
    list_head = BNode()
    Collection(g, list_head, member_uris)
    g.add((ad, OWL.distinctMembers, list_head))


def main() -> None:
    """Execute the gap analysis concept additions."""
    g = Graph()
    g.parse(INDIVIDUALS_FILE, format="turtle")

    print(f"Loaded {len(g)} triples from {INDIVIDUALS_FILE.name}")

    # ── Step 1: Add 5 new top-level concepts ────────────────────────────
    for concept_data in TOP_LEVEL_CONCEPTS:
        add_concept(g, concept_data, top_level=True)
        print(f"  + top-level: {concept_data['iri']}")

    # ── Step 2: Add 21 new leaf concepts ────────────────────────────────
    for concept_data in LEAF_CONCEPTS:
        add_concept(g, concept_data, top_level=False)
        print(f"  + leaf: {concept_data['iri']} → {concept_data['broader']}")

    # ── Step 3: Reparent DataCenterDemand ────────────────────────────────
    dcd = ENEWS.DataCenterDemand
    g.remove((dcd, SKOS.topConceptOf, ENEWS.EnergyTopicScheme))
    g.add((dcd, SKOS.broader, ENEWS.AIAndDataCenterDemand))
    print("  ~ reparented DataCenterDemand → AIAndDataCenterDemand")

    # Remove "IRA" alt label from Legislation (now dedicated IRAPolicy concept)
    g.remove((ENEWS.Legislation, SKOS.altLabel, Literal("IRA", lang="en")))
    print("  ~ removed 'IRA' altLabel from Legislation (now on IRAPolicy)")

    # ── Step 4: Update EnergyTopicScheme hasTopConcept ───────────────────
    # Remove DataCenterDemand from hasTopConcept
    g.remove((ENEWS.EnergyTopicScheme, SKOS.hasTopConcept, ENEWS.DataCenterDemand))
    # Add new top-level concepts
    for concept_data in TOP_LEVEL_CONCEPTS:
        g.add(
            (
                ENEWS.EnergyTopicScheme,
                SKOS.hasTopConcept,
                ENEWS[concept_data["iri"]],
            )
        )
    print("  ~ updated EnergyTopicScheme hasTopConcept")

    # ── Step 5: Rebuild AllDifferent declarations ────────────────────────
    remove_all_different(g)
    print("  ~ removed old AllDifferent declarations")

    for group_name, members in SIBLING_GROUPS.items():
        if len(members) >= 2:
            add_all_different(g, members)
            print(f"  + AllDifferent: {group_name} ({len(members)} members)")

    # ── Step 6: Update ontology metadata ─────────────────────────────────
    g.remove((ONTOLOGY_IRI, OWL.versionInfo, None))
    g.add((ONTOLOGY_IRI, OWL.versionInfo, Literal("0.3.0")))

    g.remove((ONTOLOGY_IRI, OWL.versionIRI, None))
    g.add(
        (
            ONTOLOGY_IRI,
            OWL.versionIRI,
            URIRef("http://example.org/ontology/energy-news/reference-individuals/0.3.0"),
        )
    )

    g.remove((ONTOLOGY_IRI, OWL.priorVersion, None))
    g.add(
        (
            ONTOLOGY_IRI,
            OWL.priorVersion,
            URIRef("http://example.org/ontology/energy-news/reference-individuals/0.2.0"),
        )
    )

    from rdflib import DCTERMS

    g.remove((ONTOLOGY_IRI, DCTERMS.modified, None))
    g.add((ONTOLOGY_IRI, DCTERMS.modified, Literal("2026-02-26")))

    # ── Step 7: Serialize ────────────────────────────────────────────────
    g.serialize(INDIVIDUALS_FILE, format="turtle")
    print(f"\nSerialized {len(g)} triples to {INDIVIDUALS_FILE.name}")

    # ── Summary ──────────────────────────────────────────────────────────
    n_top = sum(1 for _ in g.subjects(SKOS.topConceptOf, ENEWS.EnergyTopicScheme))
    n_leaf = sum(1 for s in g.subjects(RDF.type, SKOS.Concept) if (s, SKOS.broader, None) in g)
    n_total = sum(1 for _ in g.subjects(RDF.type, SKOS.Concept))
    print("\nFinal counts:")
    print(f"  Top-level concepts: {n_top}")
    print(f"  Leaf concepts: {n_leaf}")
    print(f"  Total SKOS concepts: {n_total}")


if __name__ == "__main__":
    main()
