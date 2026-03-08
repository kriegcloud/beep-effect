"""Tests for the Energy News Ontology structural integrity and SPARQL validation.

Validates the generated TBox, reference individuals, and SHACL shapes
against the conceptual model specification.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.collection import Collection
from rdflib.namespace import OWL, RDF, RDFS, SKOS, XSD

ENEWS = Namespace("http://example.org/ontology/energy-news#")
SCHEMA = Namespace("https://schema.org/")
SIOC = Namespace("http://rdfs.org/sioc/ns#")
SH = Namespace("http://www.w3.org/ns/shacl#")

PROJECT = Path(__file__).resolve().parent.parent
TBOX_PATH = PROJECT / "energy-news.ttl"
REF_PATH = PROJECT / "energy-news-reference-individuals.ttl"
DATA_PATH = PROJECT / "energy-news-data.ttl"
SHAPES_PATH = PROJECT / "shapes" / "energy-news-shapes.ttl"
SPARQL_DIR = PROJECT / "tests"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def tbox() -> Graph:
    """Load the TBox graph."""
    g = Graph()
    g.parse(str(TBOX_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def ref() -> Graph:
    """Load the reference individuals graph."""
    g = Graph()
    g.parse(str(REF_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def merged() -> Graph:
    """Load merged TBox + reference individuals."""
    g = Graph()
    g.parse(str(TBOX_PATH), format="turtle")
    g.parse(str(REF_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def full_graph() -> Graph:
    """Load merged TBox + reference individuals + sample ABox data."""
    g = Graph()
    g.parse(str(TBOX_PATH), format="turtle")
    g.parse(str(REF_PATH), format="turtle")
    g.parse(str(DATA_PATH), format="turtle")
    return g


@pytest.fixture(scope="module")
def shapes() -> Graph:
    """Load the SHACL shapes graph."""
    g = Graph()
    g.parse(str(SHAPES_PATH), format="turtle")
    return g


# ---------------------------------------------------------------------------
# Class declarations
# ---------------------------------------------------------------------------

EXPECTED_CLASSES = [
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


@pytest.mark.parametrize("cls_name", EXPECTED_CLASSES)
def test_class_declared(tbox: Graph, cls_name: str) -> None:
    """Each expected class is declared as owl:Class."""
    assert (ENEWS[cls_name], RDF.type, OWL.Class) in tbox


def test_all_disjoint_classes(tbox: Graph) -> None:
    """An AllDisjointClasses axiom exists with all 9 classes."""
    disjoint_nodes = list(tbox.subjects(RDF.type, OWL.AllDisjointClasses))
    assert len(disjoint_nodes) >= 1

    # Collect all members across all AllDisjointClasses
    all_members: set[URIRef] = set()
    for node in disjoint_nodes:
        members_list = tbox.value(node, OWL.members)
        if members_list:
            members = list(Collection(tbox, members_list))
            all_members.update(members)

    expected = {ENEWS[name] for name in EXPECTED_CLASSES}
    assert expected <= all_members, f"Missing: {expected - all_members}"


# ---------------------------------------------------------------------------
# Topic individuals
# ---------------------------------------------------------------------------


def test_topic_individual_count(ref: Graph) -> None:
    """At least 55 EnergyTopic individuals exist (actual: 66)."""
    topics = set(ref.subjects(RDF.type, ENEWS.EnergyTopic))
    assert len(topics) >= 55


def test_all_topics_have_label(ref: Graph) -> None:
    """All topic individuals have rdfs:label."""
    topics = set(ref.subjects(RDF.type, ENEWS.EnergyTopic))
    for topic in topics:
        labels = list(ref.objects(topic, RDFS.label))
        assert labels, f"{topic} missing rdfs:label"


def test_all_topics_have_definition(ref: Graph) -> None:
    """All topic individuals have skos:definition."""
    topics = set(ref.subjects(RDF.type, ENEWS.EnergyTopic))
    for topic in topics:
        defs = list(ref.objects(topic, SKOS.definition))
        assert defs, f"{topic} missing skos:definition"


def test_all_topics_in_scheme(ref: Graph) -> None:
    """All topic individuals belong to the EnergyTopicScheme."""
    topics = set(ref.subjects(RDF.type, ENEWS.EnergyTopic))
    for topic in topics:
        schemes = list(ref.objects(topic, SKOS.inScheme))
        assert ENEWS.EnergyTopicScheme in schemes, f"{topic} not in scheme"


def test_skos_hierarchy_solar_renewable(merged: Graph) -> None:
    """Solar has broader Renewable in the SKOS hierarchy."""
    assert (ENEWS.Solar, SKOS.broader, ENEWS.Renewable) in merged


def test_skos_hierarchy_coal_fossil(merged: Graph) -> None:
    """Coal has broader Fossil in the SKOS hierarchy."""
    assert (ENEWS.Coal, SKOS.broader, ENEWS.Fossil) in merged


def test_top_concepts(ref: Graph) -> None:
    """Top-level topics are topConceptOf the scheme."""
    top = set(ref.subjects(SKOS.topConceptOf, ENEWS.EnergyTopicScheme))
    assert ENEWS.Renewable in top
    assert ENEWS.Fossil in top
    assert ENEWS.Nuclear in top


# ---------------------------------------------------------------------------
# Property assertions
# ---------------------------------------------------------------------------


EXPECTED_OBJ_PROPS = [
    "coversTopic",
    "publishedBy",
    "postedBy",
    "sharesArticle",
    "mentionsOrganization",
    "hasGeographicFocus",
    "hasSector",
    "onPlatform",
]

EXPECTED_DATA_PROPS = [
    "handle",
    "title",
    "url",
    "description",
    "publishedDate",
    "siteDomain",
]


@pytest.mark.parametrize("prop_name", EXPECTED_OBJ_PROPS)
def test_object_property_declared(tbox: Graph, prop_name: str) -> None:
    """Each expected object property is declared."""
    assert (ENEWS[prop_name], RDF.type, OWL.ObjectProperty) in tbox


@pytest.mark.parametrize("prop_name", EXPECTED_DATA_PROPS)
def test_datatype_property_declared(tbox: Graph, prop_name: str) -> None:
    """Each expected datatype property is declared."""
    assert (ENEWS[prop_name], RDF.type, OWL.DatatypeProperty) in tbox


EXPECTED_FUNCTIONAL = [
    "publishedBy",
    "postedBy",
    "sharesArticle",
    "onPlatform",
    "handle",
    "title",
    "url",
    "description",
    "publishedDate",
    "siteDomain",
]


@pytest.mark.parametrize("prop_name", EXPECTED_FUNCTIONAL)
def test_functional_properties(tbox: Graph, prop_name: str) -> None:
    """Expected properties are declared as functional."""
    assert (ENEWS[prop_name], RDF.type, OWL.FunctionalProperty) in tbox


# ---------------------------------------------------------------------------
# HasKey axioms
# ---------------------------------------------------------------------------


def _get_haskey_props(g: Graph, cls: URIRef) -> set[URIRef]:
    """Get the set of properties in a HasKey axiom for a class."""
    result: set[URIRef] = set()
    for key_list in g.objects(cls, OWL.hasKey):
        result.update(Collection(g, key_list))
    return result


def test_article_haskey_url(tbox: Graph) -> None:
    """Article has HasKey on url."""
    keys = _get_haskey_props(tbox, ENEWS.Article)
    assert ENEWS.url in keys


def test_author_account_haskey_handle_and_platform(tbox: Graph) -> None:
    """AuthorAccount has composite HasKey on handle and onPlatform."""
    keys = _get_haskey_props(tbox, ENEWS.AuthorAccount)
    assert ENEWS.handle in keys
    assert ENEWS.onPlatform in keys


def test_publication_haskey_sitedomain(tbox: Graph) -> None:
    """Publication has HasKey on siteDomain."""
    keys = _get_haskey_props(tbox, ENEWS.Publication)
    assert ENEWS.siteDomain in keys


# ---------------------------------------------------------------------------
# Existential restrictions
# ---------------------------------------------------------------------------


def _has_existential(g: Graph, cls: URIRef, prop: URIRef, filler: URIRef) -> bool:
    """Check if cls SubClassOf prop some filler."""
    for superclass in g.objects(cls, RDFS.subClassOf):
        if (superclass, RDF.type, OWL.Restriction) in g:
            on_prop = g.value(superclass, OWL.onProperty)
            some_values = g.value(superclass, OWL.someValuesFrom)
            if on_prop == prop and some_values == filler:
                return True
    return False


def test_article_covers_topic_restriction(tbox: Graph) -> None:
    """Article SubClassOf coversTopic some EnergyTopic."""
    assert _has_existential(tbox, ENEWS.Article, ENEWS.coversTopic, ENEWS.EnergyTopic)


def test_post_posted_by_restriction(tbox: Graph) -> None:
    """Post SubClassOf postedBy some AuthorAccount."""
    assert _has_existential(tbox, ENEWS.Post, ENEWS.postedBy, ENEWS.AuthorAccount)


def test_author_account_on_platform_restriction(tbox: Graph) -> None:
    """AuthorAccount SubClassOf onPlatform some SocialMediaPlatform."""
    assert _has_existential(tbox, ENEWS.AuthorAccount, ENEWS.onPlatform, ENEWS.SocialMediaPlatform)


def test_feed_on_platform_restriction(tbox: Graph) -> None:
    """Feed SubClassOf onPlatform some SocialMediaPlatform."""
    assert _has_existential(tbox, ENEWS.Feed, ENEWS.onPlatform, ENEWS.SocialMediaPlatform)


def test_on_platform_no_domain(tbox: Graph) -> None:
    """onPlatform has no rdfs:domain (avoids Feed->AuthorAccount inference)."""
    domains = list(tbox.objects(ENEWS.onPlatform, RDFS.domain))
    assert not domains, f"onPlatform should have no domain, found: {domains}"


# ---------------------------------------------------------------------------
# Social Media Platform tests
# ---------------------------------------------------------------------------


def test_social_media_platform_individuals(ref: Graph) -> None:
    """Bluesky and Twitter are typed as SocialMediaPlatform."""
    assert (ENEWS.Bluesky, RDF.type, ENEWS.SocialMediaPlatform) in ref
    assert (ENEWS.Twitter, RDF.type, ENEWS.SocialMediaPlatform) in ref


def test_platform_individuals_have_labels(ref: Graph) -> None:
    """Platform individuals have rdfs:label."""
    for platform in [ENEWS.Bluesky, ENEWS.Twitter]:
        labels = list(ref.objects(platform, RDFS.label))
        assert labels, f"{platform} missing rdfs:label"


def test_platform_all_different(ref: Graph) -> None:
    """AllDifferent axiom exists for platform individuals."""
    diff_nodes = list(ref.subjects(RDF.type, OWL.AllDifferent))
    platform_pair_found = False
    for node in diff_nodes:
        members_list = ref.value(node, OWL.distinctMembers)
        if members_list:
            members = set(Collection(ref, members_list))
            if ENEWS.Bluesky in members and ENEWS.Twitter in members:
                platform_pair_found = True
                break
    assert platform_pair_found, "No AllDifferent axiom found for Bluesky and Twitter"


def test_twitter_alt_label(ref: Graph) -> None:
    """Twitter individual has altLabel 'X'."""
    alt_labels = {str(label) for label in ref.objects(ENEWS.Twitter, SKOS.altLabel)}
    assert "X" in alt_labels


# ---------------------------------------------------------------------------
# Schema.org + SIOC alignment
# ---------------------------------------------------------------------------


ALIGNMENT_CHECKS = [
    ("Article", RDFS.subClassOf, SCHEMA.NewsArticle),
    ("Publication", RDFS.subClassOf, SCHEMA.NewsMediaOrganization),
    ("Post", OWL.equivalentClass, SCHEMA.SocialMediaPosting),
    ("AuthorAccount", OWL.equivalentClass, SIOC.UserAccount),
    ("AuthorAccount", SKOS.relatedMatch, SCHEMA.Person),
    ("Organization", OWL.equivalentClass, SCHEMA.Organization),
    ("GeographicEntity", RDFS.subClassOf, SCHEMA.Place),
]


@pytest.mark.parametrize(
    ("cls_name", "predicate", "target"),
    ALIGNMENT_CHECKS,
    ids=[
        f"{c}-{p.split('#')[-1] if '#' in p else p.split('/')[-1]}" for c, p, _ in ALIGNMENT_CHECKS
    ],
)
def test_class_alignment(tbox: Graph, cls_name: str, predicate: URIRef, target: URIRef) -> None:
    """Class alignment axioms are present."""
    assert (ENEWS[cls_name], predicate, target) in tbox


PROP_ALIGNMENT_CHECKS = [
    ("coversTopic", OWL.equivalentProperty, SCHEMA.about),
    ("publishedBy", OWL.equivalentProperty, SCHEMA.publisher),
    ("postedBy", RDFS.subPropertyOf, SCHEMA.author),
    ("sharesArticle", OWL.equivalentProperty, SCHEMA.sharedContent),
    ("mentionsOrganization", RDFS.subPropertyOf, SCHEMA.mentions),
    ("hasGeographicFocus", OWL.equivalentProperty, SCHEMA.contentLocation),
    ("title", OWL.equivalentProperty, SCHEMA.headline),
    ("url", OWL.equivalentProperty, SCHEMA.url),
    ("description", OWL.equivalentProperty, SCHEMA.description),
    ("publishedDate", OWL.equivalentProperty, SCHEMA.datePublished),
]


@pytest.mark.parametrize(
    ("prop_name", "predicate", "target"),
    PROP_ALIGNMENT_CHECKS,
    ids=[f"{p}-{t.split('/')[-1]}" for p, _, t in PROP_ALIGNMENT_CHECKS],
)
def test_property_alignment(tbox: Graph, prop_name: str, predicate: URIRef, target: URIRef) -> None:
    """Property alignment axioms are present."""
    assert (ENEWS[prop_name], predicate, target) in tbox


# ---------------------------------------------------------------------------
# Non-entailment tests (SPARQL)
# ---------------------------------------------------------------------------


def test_neg_solar_not_broader_fossil(merged: Graph) -> None:
    """Solar is NOT broader* Fossil (neg-001)."""
    query = """
    PREFIX enews: <http://example.org/ontology/energy-news#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    ASK { enews:Solar skos:broader* enews:Fossil . }
    """
    result = merged.query(query)
    assert not bool(result.askAnswer)


def test_neg_nuclear_not_broader_renewable(merged: Graph) -> None:
    """Nuclear is NOT broader* Renewable (neg-002)."""
    query = """
    PREFIX enews: <http://example.org/ontology/energy-news#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    ASK { enews:Nuclear skos:broader* enews:Renewable . }
    """
    result = merged.query(query)
    assert not bool(result.askAnswer)


# ---------------------------------------------------------------------------
# CQ SPARQL tests (requires_abox=false subset)
# ---------------------------------------------------------------------------


def test_cq_001_energy_topics_exist(merged: Graph) -> None:
    """CQ-001: What energy topics exist? (non-empty)."""
    query = (SPARQL_DIR / "cq-001.sparql").read_text()
    results = list(merged.query(query))
    assert len(results) >= 55


def test_cq_002_subtopics_under_renewable(merged: Graph) -> None:
    """CQ-002: What subtopics exist under Renewable? (non-empty)."""
    query = (SPARQL_DIR / "cq-002.sparql").read_text()
    results = list(merged.query(query))
    assert len(results) >= 1
    labels = {str(row[1]) for row in results}
    assert "solar" in labels


def test_cq_010_solar_is_renewable(merged: Graph) -> None:
    """CQ-010: Is Solar classified as renewable? (ASK=true)."""
    query = (SPARQL_DIR / "cq-010.sparql").read_text()
    result = merged.query(query)
    assert bool(result.askAnswer)


def test_tbox_001_energy_topic_is_class(merged: Graph) -> None:
    """TBox-001: EnergyTopic is declared as an OWL class."""
    query = (SPARQL_DIR / "tbox-001.sparql").read_text()
    result = merged.query(query)
    assert bool(result.askAnswer)


def test_tbox_002_article_is_class(merged: Graph) -> None:
    """TBox-002: Article is declared as an OWL class."""
    query = (SPARQL_DIR / "tbox-002.sparql").read_text()
    result = merged.query(query)
    assert bool(result.askAnswer)


def test_tbox_003_author_account_is_class(merged: Graph) -> None:
    """TBox-003: AuthorAccount is declared as an OWL class."""
    query = (SPARQL_DIR / "tbox-003.sparql").read_text()
    result = merged.query(query)
    assert bool(result.askAnswer)


@pytest.mark.parametrize(
    "query_file",
    [
        "cq-003.sparql",
        "cq-004.sparql",
        "cq-005.sparql",
        "cq-006.sparql",
        "cq-007.sparql",
        "cq-008.sparql",
        "cq-009.sparql",
        "cq-011.sparql",
        "cq-012.sparql",
        "cq-013.sparql",
        "cq-014.sparql",
        "cq-015.sparql",
        "cq-016.sparql",
        "cq-017.sparql",
        "cq-018.sparql",
        "cq-019.sparql",
    ],
)
def test_abox_cq_queries_return_results(full_graph: Graph, query_file: str) -> None:
    """ABox-dependent CQ queries return non-empty result sets on sample data."""
    query = (SPARQL_DIR / query_file).read_text()
    results = list(full_graph.query(query))
    assert results, f"{query_file} returned no rows"


# ---------------------------------------------------------------------------
# SHACL conformance
# ---------------------------------------------------------------------------


def test_shacl_conformance_reference_individuals_and_data(shapes: Graph) -> None:
    """Reference individuals and sample ABox data conform to SHACL shapes."""
    from pyshacl import validate

    # Merge TBox + reference individuals + sample ABox data, shapes separate.
    data = Graph()
    data.parse(str(TBOX_PATH), format="turtle")
    data.parse(str(REF_PATH), format="turtle")
    data.parse(str(DATA_PATH), format="turtle")

    conforms, _results_graph, results_text = validate(
        data_graph=data,
        shacl_graph=shapes,
        inference="none",
    )
    assert conforms, f"SHACL validation failed:\n{results_text}"


def test_shacl_catches_url_domain_mismatch(shapes: Graph) -> None:
    """SHACL SPARQL constraint rejects an article whose URL domain doesn't match its publication."""
    from pyshacl import validate

    data = Graph()
    data.parse(str(TBOX_PATH), format="turtle")
    data.parse(str(REF_PATH), format="turtle")
    data.parse(str(DATA_PATH), format="turtle")

    # Inject a bad article: URL says "badsite.com" but publishedBy points to Bloomberg
    bad_article = ENEWS["article_bad"]
    data.add((bad_article, RDF.type, ENEWS.Article))
    data.add((bad_article, ENEWS.title, Literal("Bad domain test")))
    data.add((bad_article, ENEWS.url, Literal("https://badsite.com/fake", datatype=XSD.anyURI)))
    data.add((bad_article, ENEWS.coversTopic, ENEWS.Solar))
    data.add((bad_article, ENEWS.publishedBy, ENEWS.pub_bloomberg))

    conforms, _results_graph, results_text = validate(
        data_graph=data,
        shacl_graph=shapes,
        inference="none",
    )
    assert not conforms, "SHACL should reject article with mismatched URL domain"
    assert "domain" in results_text.lower(), f"Expected domain mismatch message:\n{results_text}"


# ---------------------------------------------------------------------------
# AllDifferent for sibling groups
# ---------------------------------------------------------------------------


def test_all_different_sibling_groups(ref: Graph) -> None:
    """AllDifferent axioms exist for sibling topic groups."""
    diff_nodes = list(ref.subjects(RDF.type, OWL.AllDifferent))
    # At least one for top-level + groups with children
    assert len(diff_nodes) >= 10, f"Expected >=10 AllDifferent, got {len(diff_nodes)}"


# ---------------------------------------------------------------------------
# Domain and range checks
# ---------------------------------------------------------------------------


def test_covers_topic_domain_range(tbox: Graph) -> None:
    """coversTopic has domain Article, range EnergyTopic."""
    assert (ENEWS.coversTopic, RDFS.domain, ENEWS.Article) in tbox
    assert (ENEWS.coversTopic, RDFS.range, ENEWS.EnergyTopic) in tbox


def test_url_datatype_range(tbox: Graph) -> None:
    """url property has range xsd:anyURI."""
    assert (ENEWS.url, RDFS.range, XSD.anyURI) in tbox
