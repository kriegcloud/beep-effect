"""Add explicit Organization typing to RegulatoryBody individuals.

RegulatoryBody rdfs:subClassOf Organization, but without OWL reasoning
the individuals won't be found by queries asking for both types.
This adds the inferred type explicitly for query compatibility.
"""

from pathlib import Path

from rdflib import RDF, Graph, Namespace

ENEWS = Namespace("http://example.org/ontology/energy-news#")

ABOX_FILE = Path(__file__).parent.parent / "energy-news-reference-individuals.ttl"


def main() -> None:
    """Add Organization type to RegulatoryBody individuals."""
    g = Graph()
    g.parse(ABOX_FILE, format="turtle")
    print(f"Loaded {len(g)} triples from {ABOX_FILE.name}")

    count = 0
    for s in g.subjects(RDF.type, ENEWS.RegulatoryBody):
        if (s, RDF.type, ENEWS.Organization) not in g:
            g.add((s, RDF.type, ENEWS.Organization))
            name = str(s).split("#")[1]
            print(f"  + {name} a Organization")
            count += 1

    if count == 0:
        print("  No changes needed")
        return

    g.serialize(ABOX_FILE, format="turtle")
    print(f"\nSerialized {len(g)} triples to {ABOX_FILE.name} (+{count} type assertions)")


if __name__ == "__main__":
    main()
