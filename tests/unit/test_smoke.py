"""Smoke tests verifying the toolchain and core dependencies are importable."""

from __future__ import annotations


def test_package_importable() -> None:
    """Verify the ontology_skill package can be imported."""
    import ontology_skill

    assert ontology_skill.__version__ == "0.1.0"


def test_rdflib_available() -> None:
    """Verify rdflib is installed and functional."""
    from rdflib import Graph, Literal, Namespace
    from rdflib.namespace import OWL, RDF, RDFS

    g = Graph()
    ex = Namespace("http://example.org/")
    g.add((ex.Dog, RDF.type, OWL.Class))
    g.add((ex.Dog, RDFS.subClassOf, ex.Animal))
    g.add((ex.Dog, RDFS.label, Literal("Dog", lang="en")))

    assert len(g) == 3
    assert (ex.Dog, RDF.type, OWL.Class) in g


def test_oaklib_available() -> None:
    """Verify oaklib is installed."""
    from oaklib import get_adapter  # noqa: F401


def test_sssom_available() -> None:
    """Verify sssom-py is installed."""
    import sssom  # noqa: F401


def test_pyshacl_available() -> None:
    """Verify pySHACL is installed."""
    from pyshacl import validate  # noqa: F401


def test_curies_available() -> None:
    """Verify curies library works."""
    from curies import Converter

    converter = Converter.from_prefix_map(
        {
            "HP": "http://purl.obolibrary.org/obo/HP_",
            "GO": "http://purl.obolibrary.org/obo/GO_",
        }
    )
    assert converter.expand("HP:0001945") == "http://purl.obolibrary.org/obo/HP_0001945"
    assert converter.compress("http://purl.obolibrary.org/obo/GO_0008150") == "GO:0008150"


def test_linkml_available() -> None:
    """Verify LinkML runtime is installed."""
    from linkml_runtime.utils.schemaview import SchemaView  # noqa: F401


def test_sparqlwrapper_available() -> None:
    """Verify SPARQLWrapper is installed."""
    from SPARQLWrapper import SPARQLWrapper  # noqa: F401


def test_httpx_available() -> None:
    """Verify httpx is installed."""
    import httpx  # noqa: F401


def test_owlready2_available() -> None:
    """Verify owlready2 is installed."""
    from owlready2 import get_ontology  # noqa: F401
