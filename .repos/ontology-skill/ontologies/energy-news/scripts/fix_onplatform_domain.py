"""Fix onPlatform domain to avoid Feed unsatisfiability.

Feed has an existential restriction on onPlatform, so setting domain to
AuthorAccount causes Feed to be inferred as AuthorAccount, conflicting
with AllDisjointClasses. Change domain to owl:Thing (anti-pattern #10).
"""

from pathlib import Path

from rdflib import OWL, RDFS, Graph, Namespace

ENEWS = Namespace("http://example.org/ontology/energy-news#")

TBOX_FILE = Path(__file__).parent.parent / "energy-news.ttl"


def main() -> None:
    """Fix onPlatform domain."""
    g = Graph()
    g.parse(TBOX_FILE, format="turtle")
    print(f"Loaded {len(g)} triples from {TBOX_FILE.name}")

    # Remove the overly-narrow AuthorAccount domain
    g.remove((ENEWS.onPlatform, RDFS.domain, ENEWS.AuthorAccount))
    # Add broad domain instead
    g.add((ENEWS.onPlatform, RDFS.domain, OWL.Thing))
    print("  ~ onPlatform domain: AuthorAccount → owl:Thing (avoids Feed unsatisfiability)")

    g.serialize(TBOX_FILE, format="turtle")
    print(f"\nSerialized {len(g)} triples to {TBOX_FILE.name}")


if __name__ == "__main__":
    main()
