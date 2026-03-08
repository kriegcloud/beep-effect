"""Release pipeline for Energy News Ontology v0.3.0.

Updates modified dates and generates release artifacts.
"""

from pathlib import Path

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import XSD

DCTERMS = Namespace("http://purl.org/dc/terms/")
ENEWS_DIR = Path(__file__).parent.parent

TBOX_FILE = ENEWS_DIR / "energy-news.ttl"
ABOX_FILE = ENEWS_DIR / "energy-news-reference-individuals.ttl"

TBOX_IRI = URIRef("http://example.org/ontology/energy-news")
ABOX_IRI = URIRef("http://example.org/ontology/energy-news/reference-individuals")

RELEASE_DATE = "2026-02-27"


def update_modified_date(filepath: Path, onto_iri: URIRef, date: str) -> None:
    """Update dcterms:modified to the release date."""
    g = Graph()
    g.parse(filepath, format="turtle")

    # Remove old modified date
    g.remove((onto_iri, DCTERMS.modified, None))
    # Add new modified date
    g.add((onto_iri, DCTERMS.modified, Literal(date, datatype=XSD.date)))

    g.serialize(filepath, format="turtle")
    print(f"  Updated {filepath.name} modified → {date}")


def main() -> None:
    """Run the release pipeline."""
    print("=== Energy News Ontology v0.3.0 Release ===\n")

    # Step 1: Update modified dates
    print("Step 1: Update modified dates")
    update_modified_date(TBOX_FILE, TBOX_IRI, RELEASE_DATE)
    update_modified_date(ABOX_FILE, ABOX_IRI, RELEASE_DATE)

    print("\nDone. Run ROBOT commands for release artifacts.")


if __name__ == "__main__":
    main()
