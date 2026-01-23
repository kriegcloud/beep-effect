/**
 * RDF/OWL/SKOS Namespace Constants
 *
 * Standard IRI prefixes and predicates for ontology parsing.
 *
 * @module knowledge-server/Ontology/constants
 * @since 0.1.0
 */
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

/**
 * RDF Namespace
 *
 * @since 0.1.0
 * @category namespaces
 */
export const RDF = {
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  first: "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
  rest: "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
  nil: "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
} as const;

/**
 * RDFS Namespace
 *
 * @since 0.1.0
 * @category namespaces
 */
export const RDFS = {
  label: "http://www.w3.org/2000/01/rdf-schema#label",
  comment: "http://www.w3.org/2000/01/rdf-schema#comment",
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
  subPropertyOf: "http://www.w3.org/2000/01/rdf-schema#subPropertyOf",
  domain: "http://www.w3.org/2000/01/rdf-schema#domain",
  range: "http://www.w3.org/2000/01/rdf-schema#range",
  Class: "http://www.w3.org/2000/01/rdf-schema#Class",
} as const;

/**
 * OWL Namespace
 *
 * @since 0.1.0
 * @category namespaces
 */
export const OWL = {
  Class: "http://www.w3.org/2002/07/owl#Class",
  ObjectProperty: "http://www.w3.org/2002/07/owl#ObjectProperty",
  DatatypeProperty: "http://www.w3.org/2002/07/owl#DatatypeProperty",
  FunctionalProperty: "http://www.w3.org/2002/07/owl#FunctionalProperty",
  inverseOf: "http://www.w3.org/2002/07/owl#inverseOf",
  equivalentClass: "http://www.w3.org/2002/07/owl#equivalentClass",
  unionOf: "http://www.w3.org/2002/07/owl#unionOf",
  Thing: "http://www.w3.org/2002/07/owl#Thing",
} as const;

/**
 * SKOS Namespace
 *
 * @since 0.1.0
 * @category namespaces
 */
export const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  altLabel: "http://www.w3.org/2004/02/skos/core#altLabel",
  hiddenLabel: "http://www.w3.org/2004/02/skos/core#hiddenLabel",
  definition: "http://www.w3.org/2004/02/skos/core#definition",
  scopeNote: "http://www.w3.org/2004/02/skos/core#scopeNote",
  example: "http://www.w3.org/2004/02/skos/core#example",
  broader: "http://www.w3.org/2004/02/skos/core#broader",
  narrower: "http://www.w3.org/2004/02/skos/core#narrower",
  related: "http://www.w3.org/2004/02/skos/core#related",
  exactMatch: "http://www.w3.org/2004/02/skos/core#exactMatch",
  closeMatch: "http://www.w3.org/2004/02/skos/core#closeMatch",
} as const;

/**
 * Extract local name from IRI
 *
 * @example
 * extractLocalName("http://schema.org/Person") // "Person"
 * extractLocalName("http://xmlns.com/foaf/0.1/name") // "name"
 *
 * @since 0.1.0
 * @category utils
 */
export const extractLocalName = (iri: string): string =>
  F.pipe(
    Str.lastIndexOf("#")(iri),
    O.orElse(() => Str.lastIndexOf("/")(iri)),
    O.map((idx) => Str.slice(idx + 1)(iri)),
    O.getOrElse(() => iri)
  );
