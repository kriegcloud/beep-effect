"""Build the Energy News Ontology from conceptual model artifacts.

Reads glossary.csv, conceptual-model.yaml, and property-design.yaml to produce:
  - energy-news.ttl (TBox: classes, properties, axioms)
  - energy-news-reference-individuals.ttl (SKOS topic individuals)
  - energy-news-data.ttl (Representative ABox sample data)
  - shapes/energy-news-shapes.ttl (SHACL structural shapes)

Usage:
    uv run python ontologies/energy-news/scripts/build.py
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import TYPE_CHECKING, Any
from urllib.parse import urlparse

import yaml
from rdflib import BNode, Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection
from rdflib.namespace import DCTERMS, OWL, RDF, RDFS, SKOS, XSD

if TYPE_CHECKING:
    from rdflib.term import Node

# ---------------------------------------------------------------------------
# Namespaces
# ---------------------------------------------------------------------------

ENEWS = Namespace("http://example.org/ontology/energy-news#")
SCHEMA = Namespace("https://schema.org/")
SIOC = Namespace("http://rdfs.org/sioc/ns#")
SH = Namespace("http://www.w3.org/ns/shacl#")
OBO = Namespace("http://purl.obolibrary.org/obo/")

# Ontology IRIs
TBOX_IRI = URIRef("http://example.org/ontology/energy-news")
REF_IRI = URIRef("http://example.org/ontology/energy-news/reference-individuals")
DATA_IRI = URIRef("http://example.org/ontology/energy-news/data")
SCHEMA_DECL_IRI = URIRef("http://example.org/ontology/energy-news/schema-declarations")
BFO_DECL_IRI = URIRef("http://example.org/ontology/energy-news/bfo-declarations")
TBOX_VERSION_IRI = URIRef("http://example.org/ontology/energy-news/0.2.0")
REF_VERSION_IRI = URIRef("http://example.org/ontology/energy-news/reference-individuals/0.2.0")
DATA_VERSION_IRI = URIRef("http://example.org/ontology/energy-news/data/0.2.0")

# Ontology project root (ontologies/energy-news/)
PROJECT = Path(__file__).resolve().parent.parent
DOCS = PROJECT / "docs"
OUT = PROJECT


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def bind_common_prefixes(g: Graph) -> None:
    """Bind standard prefixes to a graph."""
    g.bind("enews", ENEWS)
    g.bind("owl", OWL)
    g.bind("rdf", RDF)
    g.bind("rdfs", RDFS)
    g.bind("xsd", XSD)
    g.bind("skos", SKOS)
    g.bind("dcterms", DCTERMS)
    g.bind("schema", SCHEMA)
    g.bind("sioc", SIOC)
    g.bind("obo", OBO)


def load_glossary() -> list[dict[str, str]]:
    """Load glossary.csv and return rows as dicts."""
    path = DOCS / "glossary.csv"
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [row for row in reader if row.get("term")]


def load_yaml(name: str) -> dict[str, Any]:
    """Load a YAML file from the project docs/ directory."""
    path = DOCS / name
    with path.open(encoding="utf-8") as f:
        result: dict[str, Any] = yaml.safe_load(f)
    return result


def _extract_domain(url: str) -> str | None:
    """Extract domain from URL, stripping www. prefix."""
    parsed = urlparse(url)
    domain = parsed.netloc
    if domain.startswith("www."):
        domain = domain[4:]
    return domain if domain else None


def to_label(term: str) -> str:
    """Convert CamelCase term to lowercase label with spaces.

    E.g. 'EnergyTopic' -> 'energy topic', 'SMR' -> 'smr',
    'EVCharging' -> 'ev charging'.
    """
    result: list[str] = []
    for i, ch in enumerate(term):
        if ch.isupper() and i > 0:
            prev = term[i - 1]
            if prev.islower() or (prev.isupper() and i + 1 < len(term) and term[i + 1].islower()):
                result.append(" ")
        result.append(ch.lower())
    return "".join(result)


# ---------------------------------------------------------------------------
# TBox Builder
# ---------------------------------------------------------------------------


def build_tbox(glossary: list[dict[str, str]], props: dict) -> Graph:
    """Build the TBox graph with classes, properties, and axioms."""
    g = Graph()
    bind_common_prefixes(g)

    # --- Ontology header ---
    g.add((TBOX_IRI, RDF.type, OWL.Ontology))
    g.add((TBOX_IRI, OWL.versionIRI, TBOX_VERSION_IRI))
    g.add((TBOX_IRI, OWL.imports, REF_IRI))
    g.add((TBOX_IRI, OWL.imports, SCHEMA_DECL_IRI))
    g.add((TBOX_IRI, OWL.imports, BFO_DECL_IRI))
    g.add((TBOX_IRI, DCTERMS.title, Literal("Energy News Ontology", lang="en")))
    g.add(
        (
            TBOX_IRI,
            DCTERMS.description,
            Literal(
                "A lightweight OWL 2 DL ontology modeling the energy news media landscape "
                "as observed through social media posts.",
                lang="en",
            ),
        )
    )
    g.add((TBOX_IRI, OWL.versionInfo, Literal("0.2.0")))
    g.add((TBOX_IRI, OWL.priorVersion, URIRef("http://example.org/ontology/energy-news/0.1.0")))
    g.add((TBOX_IRI, DCTERMS.created, Literal("2026-02-11")))
    g.add((TBOX_IRI, DCTERMS.modified, Literal("2026-02-12")))
    g.add((TBOX_IRI, DCTERMS.creator, Literal("ontology-architect skill")))
    g.add((TBOX_IRI, DCTERMS.license, URIRef("https://spdx.org/licenses/MIT")))

    # --- Classes ---
    class_glossary = {row["term"]: row for row in glossary if row["category"] == "class"}

    class_names = [
        "EnergyTopic",
        "Article",
        "Publication",
        "Post",
        "AuthorAccount",
        "Feed",
        "Organization",
        "GeographicEntity",
        "SocialMediaPlatform",
    ]

    for cls_name in class_names:
        cls_uri = ENEWS[cls_name]
        g.add((cls_uri, RDF.type, OWL.Class))
        g.add((cls_uri, RDFS.label, Literal(to_label(cls_name), lang="en")))
        if cls_name in class_glossary:
            defn = class_glossary[cls_name]["definition"]
            g.add((cls_uri, SKOS.definition, Literal(defn, lang="en")))

    # --- Class alignment axioms ---
    alignment_map: dict[str, list[tuple[URIRef, URIRef]]] = {
        "Article": [(RDFS.subClassOf, SCHEMA.NewsArticle)],
        "Publication": [(RDFS.subClassOf, SCHEMA.NewsMediaOrganization)],
        "Post": [(OWL.equivalentClass, SCHEMA.SocialMediaPosting)],
        "AuthorAccount": [
            (OWL.equivalentClass, SIOC.UserAccount),
            (SKOS.relatedMatch, SCHEMA.Person),
        ],
        "Organization": [(OWL.equivalentClass, SCHEMA.Organization)],
        "GeographicEntity": [(RDFS.subClassOf, SCHEMA.Place)],
    }

    for cls_name, axioms in alignment_map.items():
        cls_uri = ENEWS[cls_name]
        for pred, obj in axioms:
            g.add((cls_uri, pred, obj))

    # --- BFO upper ontology alignment ---
    # MIREOT-style: rdfs:subClassOf to BFO categories per bfo-alignment.md
    bfo_map: dict[str, URIRef] = {
        "EnergyTopic": OBO.BFO_0000031,  # GDC (instances are ICE via IAO)
        "Article": OBO.BFO_0000031,  # GDC
        "Post": OBO.BFO_0000031,  # GDC
        "AuthorAccount": OBO.BFO_0000031,  # GDC
        "Feed": OBO.BFO_0000031,  # GDC
        "SocialMediaPlatform": OBO.BFO_0000031,  # GDC
        "Publication": OBO.BFO_0000030,  # Object
        "Organization": OBO.BFO_0000030,  # Object
        "GeographicEntity": OBO.BFO_0000029,  # Site
    }

    for cls_name, bfo_cls in bfo_map.items():
        g.add((ENEWS[cls_name], RDFS.subClassOf, bfo_cls))

    # --- AllDisjointClasses ---
    disjoint_node = BNode()
    g.add((disjoint_node, RDF.type, OWL.AllDisjointClasses))
    class_uris: list[Node] = [ENEWS[name] for name in class_names]
    class_list = BNode()
    Collection(g, class_list, class_uris)
    g.add((disjoint_node, OWL.members, class_list))

    # Properties and axioms
    _add_properties_and_axioms(g, props)

    return g


def _add_properties_and_axioms(g: Graph, props: dict) -> None:
    """Add object/datatype properties, restrictions, and HasKey axioms to the TBox."""
    # --- Object Properties ---
    for prop in props["object_properties"]:
        prop_uri = ENEWS[prop["name"]]
        g.add((prop_uri, RDF.type, OWL.ObjectProperty))
        g.add((prop_uri, RDFS.label, Literal(to_label(prop["name"]), lang="en")))
        g.add((prop_uri, SKOS.definition, Literal(prop["definition"], lang="en")))
        if prop.get("domain"):
            g.add((prop_uri, RDFS.domain, ENEWS[prop["domain"]]))
        if prop.get("range"):
            g.add((prop_uri, RDFS.range, ENEWS[prop["range"]]))

        if "functional" in prop.get("characteristics", []):
            g.add((prop_uri, RDF.type, OWL.FunctionalProperty))

        alignment = prop.get("schema_alignment", "")
        if alignment:
            _add_property_alignment(g, prop_uri, alignment)

    # --- Datatype Properties ---
    xsd_map = {"xsd:string": XSD.string, "xsd:anyURI": XSD.anyURI, "xsd:dateTime": XSD.dateTime}

    for prop in props["datatype_properties"]:
        prop_uri = ENEWS[prop["name"]]
        g.add((prop_uri, RDF.type, OWL.DatatypeProperty))
        g.add((prop_uri, RDFS.label, Literal(to_label(prop["name"]), lang="en")))
        g.add((prop_uri, SKOS.definition, Literal(prop["definition"], lang="en")))
        g.add((prop_uri, RDFS.domain, ENEWS[prop["domain"]]))
        g.add((prop_uri, RDFS.range, xsd_map[prop["range"]]))

        if "functional" in prop.get("characteristics", []):
            g.add((prop_uri, RDF.type, OWL.FunctionalProperty))

        alignment = prop.get("schema_alignment", "")
        if alignment:
            _add_property_alignment(g, prop_uri, alignment)

    # --- Existential Restrictions ---
    _add_existential(g, ENEWS.Article, ENEWS.coversTopic, ENEWS.EnergyTopic)
    _add_existential(g, ENEWS.Post, ENEWS.postedBy, ENEWS.AuthorAccount)
    _add_existential(g, ENEWS.AuthorAccount, ENEWS.onPlatform, ENEWS.SocialMediaPlatform)
    _add_existential(g, ENEWS.Feed, ENEWS.onPlatform, ENEWS.SocialMediaPlatform)

    # --- HasKey Axioms ---
    for key_spec in props["key_properties"]:
        cls_uri = ENEWS[key_spec["class"]]
        key_props = [ENEWS[k] for k in key_spec["keys"]]
        _add_has_key(g, cls_uri, key_props)


def _add_property_alignment(g: Graph, prop_uri: URIRef, alignment: str) -> None:
    """Parse alignment string and add the appropriate axiom."""
    if "owl:equivalentProperty" in alignment:
        target = _parse_alignment_target(alignment, "owl:equivalentProperty")
        if target:
            g.add((prop_uri, OWL.equivalentProperty, target))
    elif "rdfs:subPropertyOf" in alignment:
        target = _parse_alignment_target(alignment, "rdfs:subPropertyOf")
        if target:
            g.add((prop_uri, RDFS.subPropertyOf, target))


def _parse_alignment_target(alignment: str, predicate_prefix: str) -> URIRef | None:
    """Extract target URI from alignment string like 'owl:equivalentProperty schema:about'."""
    parts = alignment.strip().split()
    for i, part in enumerate(parts):
        if part == predicate_prefix and i + 1 < len(parts):
            curie = parts[i + 1]
            return _resolve_curie(curie)
    return None


def _resolve_curie(curie: str) -> URIRef | None:
    """Resolve a CURIE like 'schema:about' to a URIRef."""
    ns_map: dict[str, Namespace | type[SKOS]] = {
        "schema": SCHEMA,
        "sioc": SIOC,
        "skos": SKOS,
    }
    if ":" in curie:
        prefix, local = curie.split(":", 1)
        if prefix in ns_map:
            return ns_map[prefix][local]
    return None


def _add_existential(g: Graph, cls: URIRef, prop: URIRef, filler: URIRef) -> None:
    """Add: cls SubClassOf prop some filler (OWL existential restriction)."""
    restriction = BNode()
    g.add((restriction, RDF.type, OWL.Restriction))
    g.add((restriction, OWL.onProperty, prop))
    g.add((restriction, OWL.someValuesFrom, filler))
    g.add((cls, RDFS.subClassOf, restriction))


def _add_has_key(g: Graph, cls: URIRef, key_props: list[URIRef]) -> None:
    """Add: cls HasKey (key_props...)."""
    key_list = BNode()
    key_nodes: list[Node] = list(key_props)
    Collection(g, key_list, key_nodes)
    g.add((cls, OWL.hasKey, key_list))


# ---------------------------------------------------------------------------
# Reference Individuals Builder
# ---------------------------------------------------------------------------


def build_reference_individuals(glossary: list[dict[str, str]], model: dict) -> Graph:
    """Build the reference individuals graph with SKOS topic individuals."""
    g = Graph()
    bind_common_prefixes(g)

    # --- Ontology header ---
    g.add((REF_IRI, RDF.type, OWL.Ontology))
    g.add((REF_IRI, OWL.versionIRI, REF_VERSION_IRI))
    g.add(
        (
            REF_IRI,
            DCTERMS.title,
            Literal("Energy News Ontology — Reference Individuals", lang="en"),
        )
    )
    g.add(
        (
            REF_IRI,
            DCTERMS.description,
            Literal(
                "SKOS topic individuals for the Energy News Ontology concept scheme.",
                lang="en",
            ),
        )
    )
    g.add((REF_IRI, OWL.versionInfo, Literal("0.2.0")))
    g.add(
        (
            REF_IRI,
            OWL.priorVersion,
            URIRef("http://example.org/ontology/energy-news/reference-individuals/0.1.0"),
        )
    )
    g.add((REF_IRI, DCTERMS.created, Literal("2026-02-11")))
    g.add((REF_IRI, DCTERMS.modified, Literal("2026-02-12")))
    g.add((REF_IRI, DCTERMS.creator, Literal("ontology-architect skill")))
    g.add((REF_IRI, DCTERMS.license, URIRef("https://spdx.org/licenses/MIT")))

    # --- Concept Scheme ---
    scheme = ENEWS.EnergyTopicScheme
    g.add((scheme, RDF.type, SKOS.ConceptScheme))
    g.add((scheme, RDFS.label, Literal("Energy News Topic Scheme", lang="en")))
    g.add(
        (
            scheme,
            SKOS.definition,
            Literal(
                "A SKOS concept scheme organizing energy topic individuals into a "
                "broader/narrower hierarchy for classifying energy news articles.",
                lang="en",
            ),
        )
    )

    # Build lookup from glossary for individual definitions and synonyms
    ind_lookup: dict[str, dict[str, str]] = {}
    for row in glossary:
        if row["category"] == "individual":
            ind_lookup[row["term"]] = row

    # --- Topic individuals and hierarchy ---
    hierarchy = model["topic_hierarchy"]
    all_individuals: list[str] = []
    sibling_groups: list[list[str]] = []

    for entry in hierarchy:
        name = entry["individual"]
        all_individuals.append(name)
        _add_topic_individual(g, name, ind_lookup, scheme, is_top=True)

        children = entry.get("narrower") or []
        child_names: list[str] = []
        for child in children:
            child_name = child["individual"]
            all_individuals.append(child_name)
            child_names.append(child_name)
            _add_topic_individual(g, child_name, ind_lookup, scheme, is_top=False)
            g.add((ENEWS[child_name], SKOS.broader, ENEWS[name]))

        if child_names:
            sibling_groups.append(child_names)

    # Top-level topics as a sibling group
    top_level_names = [e["individual"] for e in hierarchy]
    sibling_groups.append(top_level_names)

    # --- AllDifferent for sibling groups ---
    for group in sibling_groups:
        if len(group) > 1:
            diff_node = BNode()
            g.add((diff_node, RDF.type, OWL.AllDifferent))
            members: list[Node] = [ENEWS[name] for name in group]
            member_list = BNode()
            Collection(g, member_list, members)
            g.add((diff_node, OWL.distinctMembers, member_list))

    # --- Social Media Platform Individuals ---
    _add_platform_individuals(g, glossary)

    return g


def _add_topic_individual(
    g: Graph,
    name: str,
    lookup: dict[str, dict[str, str]],
    scheme: URIRef,
    *,
    is_top: bool,
) -> None:
    """Add a single topic individual to the graph."""
    uri = ENEWS[name]
    g.add((uri, RDF.type, ENEWS.EnergyTopic))
    g.add((uri, RDF.type, SKOS.Concept))
    g.add((uri, SKOS.inScheme, scheme))

    label = to_label(name)
    g.add((uri, RDFS.label, Literal(label, lang="en")))

    if name in lookup:
        row = lookup[name]
        if row.get("definition"):
            g.add((uri, SKOS.definition, Literal(row["definition"], lang="en")))
        if row.get("synonyms"):
            for raw_syn in row["synonyms"].split(";"):
                syn = raw_syn.strip()
                if syn:
                    g.add((uri, SKOS.altLabel, Literal(syn, lang="en")))

    if is_top:
        g.add((uri, SKOS.topConceptOf, scheme))
        g.add((scheme, SKOS.hasTopConcept, uri))


def _add_platform_individuals(g: Graph, glossary: list[dict[str, str]]) -> None:
    """Add SocialMediaPlatform named individuals and AllDifferent axiom."""
    ind_lookup: dict[str, dict[str, str]] = {}
    for row in glossary:
        if row["category"] == "individual" and row["term"] in ("Bluesky", "Twitter"):
            ind_lookup[row["term"]] = row

    platform_names = ["Bluesky", "Twitter"]

    platform_uris: list[Node] = []
    for name in platform_names:
        uri = ENEWS[name]
        platform_uris.append(uri)
        g.add((uri, RDF.type, ENEWS.SocialMediaPlatform))
        # Use proper-case labels for brand names (not to_label which lowercases)
        g.add((uri, RDFS.label, Literal(name, lang="en")))
        if name in ind_lookup:
            row = ind_lookup[name]
            if row.get("definition"):
                g.add((uri, SKOS.definition, Literal(row["definition"], lang="en")))
            if row.get("synonyms"):
                for raw_syn in row["synonyms"].split(";"):
                    syn = raw_syn.strip()
                    if syn:
                        g.add((uri, SKOS.altLabel, Literal(syn, lang="en")))

    # AllDifferent for platform individuals
    diff_node = BNode()
    g.add((diff_node, RDF.type, OWL.AllDifferent))
    member_list = BNode()
    Collection(g, member_list, platform_uris)
    g.add((diff_node, OWL.distinctMembers, member_list))


# ---------------------------------------------------------------------------
# ABox Builder
# ---------------------------------------------------------------------------


def _add_data_header(g: Graph) -> None:
    """Add ontology metadata for the sample ABox module."""
    g.add((DATA_IRI, RDF.type, OWL.Ontology))
    g.add((DATA_IRI, OWL.versionIRI, DATA_VERSION_IRI))
    g.add((DATA_IRI, OWL.imports, TBOX_IRI))
    g.add((DATA_IRI, DCTERMS.title, Literal("Energy News Ontology — Sample Data", lang="en")))
    g.add(
        (
            DATA_IRI,
            DCTERMS.description,
            Literal(
                "Representative ABox individuals for CQ/SPARQL tests: articles, posts, "
                "authors, publications, feeds, organizations, and geographies.",
                lang="en",
            ),
        )
    )
    g.add((DATA_IRI, OWL.versionInfo, Literal("0.2.0")))
    g.add(
        (
            DATA_IRI,
            OWL.priorVersion,
            URIRef("http://example.org/ontology/energy-news/data/0.1.0"),
        )
    )
    g.add((DATA_IRI, DCTERMS.created, Literal("2026-02-11")))
    g.add((DATA_IRI, DCTERMS.modified, Literal("2026-02-12")))
    g.add((DATA_IRI, DCTERMS.creator, Literal("ontology-architect skill")))
    g.add((DATA_IRI, DCTERMS.license, URIRef("https://spdx.org/licenses/MIT")))


def _add_sample_publications(g: Graph) -> None:
    """Add example publications with canonical site domains."""
    publications = [
        ("pub_bloomberg", "Bloomberg", "bloomberg.com"),
        ("pub_canary_media", "Canary Media", "canarymedia.com"),
    ]
    for name, label, domain in publications:
        uri = ENEWS[name]
        g.add((uri, RDF.type, ENEWS.Publication))
        g.add((uri, RDFS.label, Literal(label, lang="en")))
        g.add((uri, ENEWS.siteDomain, Literal(domain)))


def _add_sample_organizations(g: Graph) -> None:
    """Add organizations and their sector associations."""
    organizations: list[dict[str, Any]] = [
        {
            "name": "org_catl",
            "label": "CATL",
            "definition": (
                "A battery manufacturer operating in utility-scale energy storage and "
                "electric vehicle supply chains."
            ),
            "sectors": ["EnergyStorage", "Manufacturing"],
        },
        {
            "name": "org_ferc",
            "label": "FERC",
            "definition": (
                "A U.S. energy regulator overseeing interstate electricity and natural gas markets."
            ),
            "sectors": ["Regulation"],
        },
    ]
    for org in organizations:
        uri = ENEWS[org["name"]]
        g.add((uri, RDF.type, ENEWS.Organization))
        g.add((uri, RDFS.label, Literal(org["label"], lang="en")))
        g.add((uri, SKOS.definition, Literal(org["definition"], lang="en")))
        for sector in org["sectors"]:
            g.add((uri, ENEWS.hasSector, ENEWS[sector]))


def _add_sample_geographies(g: Graph) -> None:
    """Add geographic entities referenced by sample articles."""
    geographies = [
        ("geo_australia", "Australia"),
        ("geo_us", "United States"),
    ]
    for name, label in geographies:
        uri = ENEWS[name]
        g.add((uri, RDF.type, ENEWS.GeographicEntity))
        g.add((uri, RDFS.label, Literal(label, lang="en")))


def _add_sample_authors(g: Graph) -> None:
    """Add social author accounts."""
    authors = [
        ("author_torsolarfred", "torsolarfred.bsky.social", "Bluesky"),
        ("author_gridwatch", "gridwatch.bsky.social", "Bluesky"),
        ("author_energytweets", "@energytweets", "Twitter"),
    ]
    for name, handle, platform in authors:
        uri = ENEWS[name]
        g.add((uri, RDF.type, ENEWS.AuthorAccount))
        g.add((uri, RDFS.label, Literal(handle, lang="en")))
        g.add((uri, ENEWS.handle, Literal(handle)))
        g.add((uri, ENEWS.onPlatform, ENEWS[platform]))


def _add_sample_articles(g: Graph) -> None:
    """Add news articles with publication derived from URL domain, topic, and entity links."""
    # Build domain→publication URI lookup from existing Publication triples
    domain_to_pub: dict[str, URIRef] = {}
    for pub in g.subjects(RDF.type, ENEWS.Publication):
        if not isinstance(pub, URIRef):
            continue
        site_domain = g.value(pub, ENEWS.siteDomain)
        if site_domain:
            domain_to_pub[str(site_domain)] = pub

    articles: list[dict[str, Any]] = [
        {
            "name": "article_001",
            "title": "CATL signs multi-GWh storage agreements",
            "url": "https://bloomberg.com/example/storage",
            "description": (
                "Coverage of large-scale battery procurement and manufacturing expansion."
            ),
            "published_date": "2026-02-01T09:00:00Z",
            "topics": ["EnergyStorage", "Manufacturing"],
            "organizations": ["org_catl"],
            "geography": "geo_australia",
        },
        {
            "name": "article_002",
            "title": "Australian rooftop solar hits new record",
            "url": "https://canarymedia.com/example/rooftop",
            "description": (
                "Analysis of distributed rooftop solar growth and policy implications in Australia."
            ),
            "published_date": "2026-02-03T10:30:00Z",
            "topics": ["RooftopSolar", "Solar"],
            "organizations": [],
            "geography": "geo_australia",
        },
        {
            "name": "article_003",
            "title": "FERC advances interconnection reform rule",
            "url": "https://bloomberg.com/example/ferc-rule",
            "description": (
                "U.S. grid interconnection reform with implications for transmission expansion."
            ),
            "published_date": "2026-02-05T14:00:00Z",
            "topics": ["Interconnection", "Regulation"],
            "organizations": ["org_ferc"],
            "geography": "geo_us",
        },
    ]
    for article in articles:
        uri = ENEWS[article["name"]]
        g.add((uri, RDF.type, ENEWS.Article))
        g.add((uri, RDFS.label, Literal(article["title"], lang="en")))
        g.add((uri, ENEWS.title, Literal(article["title"])))
        g.add((uri, ENEWS.url, Literal(article["url"], datatype=XSD.anyURI)))
        g.add((uri, ENEWS.description, Literal(article["description"])))
        g.add((uri, ENEWS.publishedDate, Literal(article["published_date"], datatype=XSD.dateTime)))

        # Derive publishedBy from URL domain
        domain = _extract_domain(article["url"])
        if domain and domain in domain_to_pub:
            g.add((uri, ENEWS.publishedBy, domain_to_pub[domain]))

        g.add((uri, ENEWS.hasGeographicFocus, ENEWS[article["geography"]]))
        for topic in article["topics"]:
            g.add((uri, ENEWS.coversTopic, ENEWS[topic]))
        for organization in article["organizations"]:
            g.add((uri, ENEWS.mentionsOrganization, ENEWS[organization]))


def _add_sample_posts(g: Graph) -> None:
    """Add social posts and linked articles."""
    posts = [
        ("post_001", "author_torsolarfred", "article_001"),
        ("post_002", "author_torsolarfred", "article_002"),
        ("post_003", "author_gridwatch", "article_003"),
        ("post_004", "author_energytweets", "article_001"),
    ]
    for name, author, article in posts:
        uri = ENEWS[name]
        g.add((uri, RDF.type, ENEWS.Post))
        author_label = author.replace("_", " ").replace("author ", "")
        article_label = article.replace("_", " ")
        label = f"Post by {author_label} sharing {article_label}"
        g.add((uri, RDFS.label, Literal(label, lang="en")))
        g.add((uri, ENEWS.postedBy, ENEWS[author]))
        g.add((uri, ENEWS.sharesArticle, ENEWS[article]))


def _add_sample_feeds(g: Graph) -> None:
    """Add sample feeds."""
    feeds = [
        ("feed_energysky", "EnergySky", "Bluesky"),
        ("feed_gridpulse", "GridPulse", "Bluesky"),
        ("feed_energyx", "EnergyX", "Twitter"),
    ]
    for name, label, platform in feeds:
        uri = ENEWS[name]
        g.add((uri, RDF.type, ENEWS.Feed))
        g.add((uri, RDFS.label, Literal(label, lang="en")))
        g.add((uri, ENEWS.onPlatform, ENEWS[platform]))


def build_abox_data() -> Graph:
    """Build a representative ABox data module for CQ validation."""
    g = Graph()
    bind_common_prefixes(g)
    _add_data_header(g)
    _add_sample_publications(g)
    _add_sample_organizations(g)
    _add_sample_geographies(g)
    _add_sample_authors(g)
    _add_sample_articles(g)
    _add_sample_posts(g)
    _add_sample_feeds(g)
    return g


# ---------------------------------------------------------------------------
# SHACL Shapes Builder
# ---------------------------------------------------------------------------


def build_shacl_shapes() -> Graph:
    """Build SHACL shapes for structural validation."""
    g = Graph()
    bind_common_prefixes(g)
    g.bind("sh", SH)

    # --- EnergyTopicInstanceShape ---
    _add_shape(
        g,
        ENEWS.EnergyTopicInstanceShape,
        ENEWS.EnergyTopic,
        [
            _min_count_property(g, RDFS.label, 1),
            _min_count_property(g, SKOS.definition, 1),
            _min_count_property(g, SKOS.inScheme, 1),
        ],
    )

    # --- ArticleShape ---
    _add_shape(
        g,
        ENEWS.ArticleShape,
        ENEWS.Article,
        [
            _property_shape(g, ENEWS.coversTopic, min_count=1, class_constraint=ENEWS.EnergyTopic),
            _property_shape(g, ENEWS.url, min_count=1, max_count=1, datatype=XSD.anyURI),
            _property_shape(g, ENEWS.publishedBy, max_count=1),
            _property_shape(g, ENEWS.title, max_count=1),
            _property_shape(g, ENEWS.publishedDate, max_count=1),
            _property_shape(g, ENEWS.description, max_count=1),
        ],
    )

    # --- PostShape ---
    _add_shape(
        g,
        ENEWS.PostShape,
        ENEWS.Post,
        [
            _property_shape(
                g, ENEWS.postedBy, min_count=1, max_count=1, class_constraint=ENEWS.AuthorAccount
            ),
            _property_shape(g, ENEWS.sharesArticle, max_count=1),
        ],
    )

    # --- AuthorAccountShape ---
    _add_shape(
        g,
        ENEWS.AuthorAccountShape,
        ENEWS.AuthorAccount,
        [
            _property_shape(g, ENEWS.handle, min_count=1, max_count=1, datatype=XSD.string),
            _property_shape(
                g,
                ENEWS.onPlatform,
                min_count=1,
                max_count=1,
                class_constraint=ENEWS.SocialMediaPlatform,
            ),
        ],
    )

    # --- FeedShape ---
    _add_shape(
        g,
        ENEWS.FeedShape,
        ENEWS.Feed,
        [
            _min_count_property(g, RDFS.label, 1),
            _property_shape(
                g,
                ENEWS.onPlatform,
                min_count=1,
                max_count=1,
                class_constraint=ENEWS.SocialMediaPlatform,
            ),
        ],
    )

    # --- SocialMediaPlatformShape ---
    _add_shape(
        g,
        ENEWS.SocialMediaPlatformShape,
        ENEWS.SocialMediaPlatform,
        [
            _min_count_property(g, RDFS.label, 1),
        ],
    )

    # --- PublicationShape ---
    _add_shape(
        g,
        ENEWS.PublicationShape,
        ENEWS.Publication,
        [
            _property_shape(g, ENEWS.siteDomain, min_count=1, max_count=1, datatype=XSD.string),
        ],
    )

    # --- SPARQL constraint: Article URL domain must match Publication siteDomain ---
    _add_sparql_constraint(
        g,
        ENEWS.ArticleShape,
        message="Article URL domain does not match its Publication siteDomain",
        select_query=(
            "PREFIX enews: <http://example.org/ontology/energy-news#>\n"
            "SELECT $this WHERE {\n"
            "  $this enews:url ?url ;\n"
            "        enews:publishedBy ?pub .\n"
            "  ?pub enews:siteDomain ?siteDomain .\n"
            '  BIND(REPLACE(STR(?url), "^https?://([^/]+).*$", "$1") AS ?urlDomain)\n'
            '  BIND(IF(STRSTARTS(?urlDomain, "www."),\n'
            "          SUBSTR(?urlDomain, 5),\n"
            "          ?urlDomain) AS ?canonicalDomain)\n"
            "  FILTER(?canonicalDomain != ?siteDomain)\n"
            "}"
        ),
    )

    return g


def _add_shape(g: Graph, shape_uri: URIRef, target_class: URIRef, prop_shapes: list[BNode]) -> None:
    """Add a NodeShape targeting a class with property constraints."""
    g.add((shape_uri, RDF.type, SH.NodeShape))
    g.add((shape_uri, SH.targetClass, target_class))
    for ps in prop_shapes:
        g.add((shape_uri, SH.property, ps))


def _min_count_property(g: Graph, path: URIRef, min_count: int) -> BNode:
    """Create a simple min-count property shape."""
    ps = BNode()
    g.add((ps, SH.path, path))
    g.add((ps, SH.minCount, Literal(min_count)))
    return ps


def _property_shape(
    g: Graph,
    path: URIRef,
    min_count: int | None = None,
    max_count: int | None = None,
    datatype: URIRef | None = None,
    class_constraint: URIRef | None = None,
) -> BNode:
    """Create a property shape with optional constraints."""
    ps = BNode()
    g.add((ps, SH.path, path))
    if min_count is not None:
        g.add((ps, SH.minCount, Literal(min_count)))
    if max_count is not None:
        g.add((ps, SH.maxCount, Literal(max_count)))
    if datatype is not None:
        g.add((ps, SH.datatype, datatype))
    if class_constraint is not None:
        g.add((ps, SH["class"], class_constraint))
    return ps


def _add_sparql_constraint(
    g: Graph,
    shape_uri: URIRef,
    *,
    message: str,
    select_query: str,
) -> None:
    """Attach a sh:SPARQLConstraint to an existing NodeShape."""
    constraint = BNode()
    g.add((constraint, RDF.type, SH.SPARQLConstraint))
    g.add((constraint, SH.message, Literal(message)))
    g.add((constraint, SH.select, Literal(select_query)))
    g.add((shape_uri, SH.sparql, constraint))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    """Build all Energy News Ontology artifacts."""
    print("Loading input artifacts...")
    glossary = load_glossary()
    model = load_yaml("conceptual-model.yaml")
    props = load_yaml("property-design.yaml")

    print(f"  Glossary: {len(glossary)} terms")
    print(f"  Topic hierarchy: {len(model['topic_hierarchy'])} top-level topics")
    print(f"  Object properties: {len(props['object_properties'])}")
    print(f"  Datatype properties: {len(props['datatype_properties'])}")

    # Ensure output directories exist
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "shapes").mkdir(parents=True, exist_ok=True)

    # Build TBox
    print("\nBuilding TBox (energy-news.ttl)...")
    tbox = build_tbox(glossary, props)
    tbox_path = OUT / "energy-news.ttl"
    tbox.serialize(destination=str(tbox_path), format="turtle")
    print(f"  Written: {tbox_path} ({len(tbox)} triples)")

    # Build Reference Individuals
    print("Building reference individuals (energy-news-reference-individuals.ttl)...")
    ref = build_reference_individuals(glossary, model)
    ref_path = OUT / "energy-news-reference-individuals.ttl"
    ref.serialize(destination=str(ref_path), format="turtle")
    print(f"  Written: {ref_path} ({len(ref)} triples)")

    # Build SHACL Shapes
    print("Building SHACL shapes (shapes/energy-news-shapes.ttl)...")
    shapes = build_shacl_shapes()
    shapes_path = OUT / "shapes" / "energy-news-shapes.ttl"
    shapes.serialize(destination=str(shapes_path), format="turtle")
    print(f"  Written: {shapes_path} ({len(shapes)} triples)")

    # Build sample ABox data
    print("Building sample ABox data (energy-news-data.ttl)...")
    data = build_abox_data()
    data_path = OUT / "energy-news-data.ttl"
    data.serialize(destination=str(data_path), format="turtle")
    print(f"  Written: {data_path} ({len(data)} triples)")

    print("\nBuild complete.")


if __name__ == "__main__":
    main()
