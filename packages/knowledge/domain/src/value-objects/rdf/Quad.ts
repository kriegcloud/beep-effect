/**
 * RDF Quad value objects
 *
 * Core RDF data model types following the W3C RDF 1.1 specification.
 * Provides branded types for IRIs, blank nodes, literals, and quads.
 *
 * @module knowledge-domain/value-objects/rdf/Quad
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/Quad");

/**
 * IRI - Internationalized Resource Identifier
 *
 * A branded string representing an RDF IRI. This is a permissive type
 * that accepts any non-empty string as an IRI, suitable for receiving
 * data from external RDF systems.
 *
 * For validated OWL/RDFS class IRIs with scheme restrictions, use ClassIri instead.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class IRI extends S.NonEmptyTrimmedString.pipe(S.brand("IRI")).annotations(
  $I.annotations("IRI", {
    title: "IRI",
    description: "RDF Internationalized Resource Identifier",
  })
) {}

export declare namespace IRI {
  export type Type = typeof IRI.Type;
  export type Encoded = typeof IRI.Encoded;
}

/**
 * Creates an IRI from a string, throwing on invalid input.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const makeIRI = S.decodeUnknownSync(IRI);

/**
 * Type guard for IRI values.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const isIRI = S.is(IRI);

/**
 * BlankNode prefix pattern for validation
 */
const BLANK_NODE_PREFIX = "_:";

/**
 * BlankNode - RDF Blank Node identifier
 *
 * A branded string representing an RDF blank node. Blank nodes must
 * start with the "_:" prefix per RDF specification.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class BlankNode extends S.NonEmptyTrimmedString.pipe(
  S.filter((s) => s.startsWith(BLANK_NODE_PREFIX), {
    message: () => 'Blank node must start with "_:" prefix',
  }),
  S.brand("BlankNode")
).annotations(
  $I.annotations("BlankNode", {
    title: "Blank Node",
    description: "RDF blank node identifier (starts with _:)",
  })
) {}

export declare namespace BlankNode {
  export type Type = typeof BlankNode.Type;
  export type Encoded = typeof BlankNode.Encoded;
}

/**
 * Creates a BlankNode from a string, throwing on invalid input.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const makeBlankNode = S.decodeUnknownSync(BlankNode);

/**
 * Type guard for BlankNode values.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const isBlankNode = S.is(BlankNode);

/**
 * Literal - RDF Literal value
 *
 * Represents an RDF literal with a lexical value and optional datatype IRI
 * or language tag. Per RDF spec, a literal cannot have both a language tag
 * and a non-string datatype.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class Literal extends S.Class<Literal>($I`Literal`)({
  /**
   * Lexical value of the literal
   */
  value: S.String.annotations({
    title: "Value",
    description: "Lexical value of the literal",
  }),

  /**
   * Datatype IRI (optional, defaults to xsd:string)
   */
  datatype: S.optional(IRI).annotations({
    title: "Datatype",
    description: "Datatype IRI (defaults to xsd:string when omitted)",
  }),

  /**
   * Language tag (optional, BCP 47 format)
   */
  language: S.optional(S.NonEmptyTrimmedString).annotations({
    title: "Language",
    description: "BCP 47 language tag (e.g., 'en', 'en-US')",
  }),
}) {}

/**
 * Subject - Valid RDF subject types
 *
 * In RDF, a subject can be either an IRI or a blank node.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const Subject = S.Union(IRI, BlankNode).annotations(
  $I.annotations("Subject", {
    title: "Subject",
    description: "RDF subject (IRI or blank node)",
  })
);

export type Subject = typeof Subject.Type;

/**
 * Predicate - Valid RDF predicate type
 *
 * In RDF, a predicate must always be an IRI.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const Predicate = IRI.annotations(
  $I.annotations("Predicate", {
    title: "Predicate",
    description: "RDF predicate (IRI only)",
  })
);

export type Predicate = typeof Predicate.Type;

/**
 * Term - Any RDF term type
 *
 * Union of all valid RDF term types: IRI, blank node, or literal.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const Term = S.Union(IRI, BlankNode, Literal).annotations(
  $I.annotations("Term", {
    title: "Term",
    description: "Any RDF term (IRI, blank node, or literal)",
  })
);

export type Term = typeof Term.Type;

/**
 * Object - Valid RDF object types
 *
 * In RDF, an object can be any term type.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const Object = Term.annotations(
  $I.annotations("Object", {
    title: "Object",
    description: "RDF object (any term type)",
  })
);

export type Object = typeof Object.Type;

/**
 * Graph - Optional named graph identifier
 *
 * When omitted, the quad belongs to the default graph.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const Graph = S.optional(IRI).annotations(
  $I.annotations("Graph", {
    title: "Graph",
    description: "Named graph IRI (omit for default graph)",
  })
);

export type Graph = S.Schema.Type<typeof Graph>;

/**
 * Quad - RDF Quad (statement in a graph)
 *
 * Represents a single RDF statement with subject, predicate, object,
 * and optional graph. When graph is omitted, the quad belongs to the
 * default graph.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class Quad extends S.Class<Quad>($I`Quad`)({
  /**
   * Subject of the statement (IRI or blank node)
   */
  subject: Subject.annotations({
    title: "Subject",
    description: "Subject of the RDF statement",
  }),

  /**
   * Predicate of the statement (IRI)
   */
  predicate: Predicate.annotations({
    title: "Predicate",
    description: "Predicate of the RDF statement",
  }),

  /**
   * Object of the statement (any term)
   */
  object: Object.annotations({
    title: "Object",
    description: "Object of the RDF statement",
  }),

  /**
   * Named graph (optional, default graph when omitted)
   */
  graph: Graph,
}) {}
