"""Fix missing domain declarations flagged by verify-missing-domain-range.

Adds appropriate broad domains per conceptualizer review guidance:
- onPlatform: domain AuthorAccount (sole intended usage)
- jurisdiction: domain owl:Thing (spans Organization and GDC subclasses)
- hasTechnology: domain owl:Thing (intentionally broadened from RenewableInstallation)
- operatedBy: domain owl:Thing (intentionally broadened from GridZone)
- developedThrough: domain BFO:Object (links physical facilities to projects)
"""

from pathlib import Path

from rdflib import OWL, RDFS, Graph, Namespace

ENEWS = Namespace("http://example.org/ontology/energy-news#")
OBO = Namespace("http://purl.obolibrary.org/obo/")

TBOX_FILE = Path(__file__).parent.parent / "energy-news.ttl"


def main() -> None:
    """Add missing domain declarations."""
    g = Graph()
    g.parse(TBOX_FILE, format="turtle")
    print(f"Loaded {len(g)} triples from {TBOX_FILE.name}")

    # onPlatform: always used by AuthorAccount
    g.add((ENEWS.onPlatform, RDFS.domain, ENEWS.AuthorAccount))
    print("  + onPlatform domain: AuthorAccount")

    # jurisdiction: used by RegulatoryBody and PolicyInstrument
    # Broad enough — use owl:Thing since it spans Organization and GDC
    g.add((ENEWS.jurisdiction, RDFS.domain, OWL.Thing))
    print("  + jurisdiction domain: owl:Thing")

    # hasTechnology: intentionally broadened (was RenewableInstallation)
    g.add((ENEWS.hasTechnology, RDFS.domain, OWL.Thing))
    print("  + hasTechnology domain: owl:Thing (intentionally broad)")

    # operatedBy: intentionally broadened (was GridZone)
    g.add((ENEWS.operatedBy, RDFS.domain, OWL.Thing))
    print("  + operatedBy domain: owl:Thing (intentionally broad)")

    # developedThrough: links physical facilities (BFO:Object) to projects
    g.add((ENEWS.developedThrough, RDFS.domain, OBO.BFO_0000030))
    print("  + developedThrough domain: BFO:Object")

    g.serialize(TBOX_FILE, format="turtle")
    print(f"\nSerialized {len(g)} triples to {TBOX_FILE.name}")


if __name__ == "__main__":
    main()
