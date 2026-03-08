"""Phase 1: Pre-ABox readiness fixes for Energy News Ontology.

Adds missing data properties, SHACL shapes, and ProjectStatus individuals
to prepare the ontology for bulk ABox population from Bluesky data.

Changes:
  TBox: 10 new data properties across 4 underspecified classes
  ABox: 6 ProjectStatus reference individuals
  Shapes: 8 new SHACL NodeShapes + 1 updated (PostShape)
"""

from pathlib import Path

from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.namespace import OWL, RDF, RDFS, XSD

ENEWS = Namespace("http://example.org/ontology/energy-news#")
SH = Namespace("http://www.w3.org/ns/shacl#")
SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")
BFO = Namespace("http://purl.obolibrary.org/obo/")
SCHEMA = Namespace("https://schema.org/")

BASE_DIR = Path(__file__).parent.parent
TBOX_PATH = BASE_DIR / "energy-news.ttl"
REF_PATH = BASE_DIR / "energy-news-reference-individuals.ttl"
SHAPES_PATH = BASE_DIR / "shapes" / "energy-news-shapes.ttl"


def add_data_property(
    g: Graph,
    prop_uri: URIRef,
    label: str,
    domain: URIRef,
    range_dt: URIRef,
    definition: str,
    *,
    functional: bool = False,
) -> None:
    """Add a data property to the graph with standard annotations."""
    g.add((prop_uri, RDF.type, OWL.DatatypeProperty))
    if functional:
        g.add((prop_uri, RDF.type, OWL.FunctionalProperty))
    g.add((prop_uri, RDFS.label, Literal(label, lang="en")))
    g.add((prop_uri, RDFS.domain, domain))
    g.add((prop_uri, RDFS.range, range_dt))
    g.add((prop_uri, SKOS.definition, Literal(definition, lang="en")))


def add_tbox_properties(g: Graph) -> int:
    """Add missing data properties to underspecified classes."""
    count = 0

    # --- CapacityMeasurement properties ---
    add_data_property(
        g,
        ENEWS.valueInMW,
        "value in MW",
        ENEWS.CapacityMeasurement,
        XSD.float,
        "The numeric capacity value expressed in megawatts",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.capacityUnit,
        "capacity unit",
        ENEWS.CapacityMeasurement,
        XSD.string,
        "The unit of measurement for capacity such as MW, GW, MWh, or GWh",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.measurementDate,
        "measurement date",
        ENEWS.CapacityMeasurement,
        XSD.dateTime,
        "The date when the capacity measurement was recorded",
        functional=True,
    )
    count += 1

    # --- PriceDataPoint properties ---
    add_data_property(
        g,
        ENEWS.priceValue,
        "price value",
        ENEWS.PriceDataPoint,
        XSD.float,
        "The numeric price or cost value",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.priceCurrency,
        "price currency",
        ENEWS.PriceDataPoint,
        XSD.string,
        "The ISO 4217 currency code for the price value such as USD, EUR, or GBP",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.priceDate,
        "price date",
        ENEWS.PriceDataPoint,
        XSD.dateTime,
        "The date when the price was recorded or observed",
        functional=True,
    )
    count += 1

    # --- EmbeddedExternalLink properties ---
    add_data_property(
        g,
        ENEWS.linkUri,
        "link URI",
        ENEWS.EmbeddedExternalLink,
        XSD.anyURI,
        "The target URI of the embedded external link",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.linkTitle,
        "link title",
        ENEWS.EmbeddedExternalLink,
        XSD.string,
        "The preview title text of the embedded external link",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.linkDescription,
        "link description",
        ENEWS.EmbeddedExternalLink,
        XSD.string,
        "The preview description text of the embedded external link",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.thumbnailUri,
        "thumbnail URI",
        ENEWS.EmbeddedExternalLink,
        XSD.anyURI,
        "The URI of the preview thumbnail image for the embedded external link",
        functional=True,
    )
    count += 1

    # --- MediaAttachment properties ---
    add_data_property(
        g,
        ENEWS.mediaUri,
        "media URI",
        ENEWS.MediaAttachment,
        XSD.anyURI,
        "The URI of the media resource such as an image or video",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.mimeType,
        "MIME type",
        ENEWS.MediaAttachment,
        XSD.string,
        "The MIME type of the media attachment such as image/jpeg or video/mp4",
        functional=True,
    )
    count += 1

    add_data_property(
        g,
        ENEWS.altText,
        "alt text",
        ENEWS.MediaAttachment,
        XSD.string,
        "The alternative text description for the media attachment",
        functional=True,
    )
    count += 1

    return count


def add_project_status_individuals(g: Graph) -> int:
    """Add ProjectStatus reference individuals."""
    statuses = [
        (
            "Planning",
            "planning",
            "A ProjectStatus indicating the project is in early planning and permitting phases",
        ),
        (
            "UnderConstruction",
            "under construction",
            "A ProjectStatus indicating the project is actively being built",
        ),
        (
            "Operational",
            "operational",
            "A ProjectStatus indicating the project is completed and generating energy",
        ),
        (
            "Decommissioned",
            "decommissioned",
            "A ProjectStatus indicating the project has been permanently shut down and removed",
        ),
        (
            "Mothballed",
            "mothballed",
            "A ProjectStatus indicating the project is temporarily shut down but could restart",
        ),
        (
            "UnderReview",
            "under review",
            "A ProjectStatus indicating the project is undergoing regulatory"
            " or environmental review",
        ),
    ]

    for local_name, label, definition in statuses:
        uri = ENEWS[f"status_{local_name}"]
        g.add((uri, RDF.type, ENEWS.ProjectStatus))
        g.add((uri, RDFS.label, Literal(label, lang="en")))
        g.add((uri, SKOS.definition, Literal(definition, lang="en")))

    return len(statuses)


def add_shape_property(
    g: Graph,
    shape: URIRef,
    path: URIRef,
    *,
    min_count: int | None = None,
    max_count: int | None = None,
    datatype: URIRef | None = None,
    node_class: URIRef | None = None,
) -> None:
    """Add a property constraint to a SHACL shape."""
    prop = BNode()
    g.add((shape, SH.property, prop))
    g.add((prop, SH.path, path))
    if min_count is not None:
        g.add((prop, SH.minCount, Literal(min_count)))
    if max_count is not None:
        g.add((prop, SH.maxCount, Literal(max_count)))
    if datatype is not None:
        g.add((prop, SH.datatype, datatype))
    if node_class is not None:
        g.add((prop, SH["class"], node_class))


def update_shapes(g: Graph) -> int:
    """Update PostShape and add new SHACL shapes."""
    count = 0

    # --- Update PostShape: add createdAt and postText ---
    post_shape = ENEWS.PostShape
    add_shape_property(g, post_shape, ENEWS.createdAt, max_count=1, datatype=XSD.dateTime)
    add_shape_property(g, post_shape, ENEWS.postText, max_count=1, datatype=XSD.string)
    count += 1
    print("  Updated PostShape with createdAt and postText")

    # --- EmbeddedExternalLinkShape ---
    eel_shape = ENEWS.EmbeddedExternalLinkShape
    g.add((eel_shape, RDF.type, SH.NodeShape))
    g.add((eel_shape, SH.targetClass, ENEWS.EmbeddedExternalLink))
    add_shape_property(g, eel_shape, ENEWS.linkUri, min_count=1, max_count=1, datatype=XSD.anyURI)
    add_shape_property(g, eel_shape, ENEWS.linkTitle, max_count=1, datatype=XSD.string)
    add_shape_property(g, eel_shape, ENEWS.linkDescription, max_count=1, datatype=XSD.string)
    add_shape_property(g, eel_shape, ENEWS.thumbnailUri, max_count=1, datatype=XSD.anyURI)
    count += 1
    print("  Added EmbeddedExternalLinkShape")

    # --- MediaAttachmentShape ---
    ma_shape = ENEWS.MediaAttachmentShape
    g.add((ma_shape, RDF.type, SH.NodeShape))
    g.add((ma_shape, SH.targetClass, ENEWS.MediaAttachment))
    add_shape_property(g, ma_shape, ENEWS.mediaUri, min_count=1, max_count=1, datatype=XSD.anyURI)
    add_shape_property(g, ma_shape, ENEWS.mimeType, max_count=1, datatype=XSD.string)
    add_shape_property(g, ma_shape, ENEWS.altText, max_count=1, datatype=XSD.string)
    count += 1
    print("  Added MediaAttachmentShape")

    # --- CapacityMeasurementShape ---
    cm_shape = ENEWS.CapacityMeasurementShape
    g.add((cm_shape, RDF.type, SH.NodeShape))
    g.add((cm_shape, SH.targetClass, ENEWS.CapacityMeasurement))
    add_shape_property(g, cm_shape, ENEWS.valueInMW, min_count=1, max_count=1, datatype=XSD.float)
    add_shape_property(
        g, cm_shape, ENEWS.capacityUnit, min_count=1, max_count=1, datatype=XSD.string
    )
    add_shape_property(g, cm_shape, ENEWS.measurementDate, max_count=1, datatype=XSD.dateTime)
    count += 1
    print("  Added CapacityMeasurementShape")

    # --- OrganizationShape ---
    org_shape = ENEWS.OrganizationShape
    g.add((org_shape, RDF.type, SH.NodeShape))
    g.add((org_shape, SH.targetClass, ENEWS.Organization))
    add_shape_property(g, org_shape, RDFS.label, min_count=1)
    add_shape_property(g, org_shape, SKOS.definition, min_count=1)
    count += 1
    print("  Added OrganizationShape")

    # --- GeographicEntityShape ---
    geo_shape = ENEWS.GeographicEntityShape
    g.add((geo_shape, RDF.type, SH.NodeShape))
    g.add((geo_shape, SH.targetClass, ENEWS.GeographicEntity))
    add_shape_property(g, geo_shape, RDFS.label, min_count=1)
    count += 1
    print("  Added GeographicEntityShape")

    # --- PowerPlantShape ---
    pp_shape = ENEWS.PowerPlantShape
    g.add((pp_shape, RDF.type, SH.NodeShape))
    g.add((pp_shape, SH.targetClass, ENEWS.PowerPlant))
    add_shape_property(g, pp_shape, RDFS.label, min_count=1)
    add_shape_property(g, pp_shape, ENEWS.hasTechnology, node_class=ENEWS.EnergyTechnology)
    add_shape_property(g, pp_shape, ENEWS.operatedBy, node_class=ENEWS.Organization)
    count += 1
    print("  Added PowerPlantShape")

    # --- RenewableInstallationShape ---
    ri_shape = ENEWS.RenewableInstallationShape
    g.add((ri_shape, RDF.type, SH.NodeShape))
    g.add((ri_shape, SH.targetClass, ENEWS.RenewableInstallation))
    add_shape_property(g, ri_shape, RDFS.label, min_count=1)
    add_shape_property(g, ri_shape, ENEWS.hasTechnology, node_class=ENEWS.EnergyTechnology)
    add_shape_property(g, ri_shape, ENEWS.operatedBy, node_class=ENEWS.Organization)
    count += 1
    print("  Added RenewableInstallationShape")

    # --- EnergyProjectShape ---
    ep_shape = ENEWS.EnergyProjectShape
    g.add((ep_shape, RDF.type, SH.NodeShape))
    g.add((ep_shape, SH.targetClass, ENEWS.EnergyProject))
    add_shape_property(g, ep_shape, RDFS.label, min_count=1)
    add_shape_property(
        g,
        ep_shape,
        ENEWS.hasStatus,
        max_count=1,
        node_class=ENEWS.ProjectStatus,
    )
    add_shape_property(g, ep_shape, ENEWS.hasCapacity, node_class=ENEWS.CapacityMeasurement)
    count += 1
    print("  Added EnergyProjectShape")

    return count


def main() -> None:
    """Apply all Phase 1 changes."""
    print("=" * 60)
    print("Phase 1: Pre-ABox Readiness Fixes")
    print("=" * 60)

    # --- Step 1: TBox property additions ---
    print("\n[1/3] Adding data properties to TBox...")
    tbox = Graph()
    tbox.parse(TBOX_PATH, format="turtle")
    before = len(tbox)
    prop_count = add_tbox_properties(tbox)
    tbox.serialize(TBOX_PATH, format="turtle")
    print(f"  Added {prop_count} data properties ({len(tbox) - before} triples)")

    # --- Step 2: ProjectStatus individuals ---
    print("\n[2/3] Adding ProjectStatus individuals to reference data...")
    ref = Graph()
    ref.parse(REF_PATH, format="turtle")
    before = len(ref)
    status_count = add_project_status_individuals(ref)
    ref.serialize(REF_PATH, format="turtle")
    print(f"  Added {status_count} ProjectStatus individuals ({len(ref) - before} triples)")

    # --- Step 3: SHACL shape updates ---
    print("\n[3/3] Updating SHACL shapes...")
    shapes = Graph()
    shapes.parse(SHAPES_PATH, format="turtle")
    before = len(shapes)
    shape_count = update_shapes(shapes)
    shapes.serialize(SHAPES_PATH, format="turtle")
    print(f"  Updated/added {shape_count} shapes ({len(shapes) - before} triples)")

    print("\n" + "=" * 60)
    print("Phase 1 complete. Run reasoner and validator next.")
    print("=" * 60)


if __name__ == "__main__":
    main()
