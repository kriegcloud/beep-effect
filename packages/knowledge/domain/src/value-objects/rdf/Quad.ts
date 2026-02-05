import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/rdf/Quad");

export class IRI extends S.NonEmptyTrimmedString.pipe(S.brand("IRI")).annotations(
  $I.annotations("IRI", {
    title: "IRI",
    description: "RDF Internationalized Resource Identifier",
  })
) {
  static readonly is = S.is(IRI);
}

export declare namespace IRI {
  export type Type = typeof IRI.Type;
  export type Encoded = typeof IRI.Encoded;
}

const BLANK_NODE_PREFIX = "_:" as const;

export const BlankNode = S.TemplateLiteral(BLANK_NODE_PREFIX, S.String)
  .pipe(S.brand("BlankNode"))
  .annotations(
    $I.annotations("BlankNode", {
      title: "Blank Node",
      description: "RDF blank node identifier (starts with _:)",
    })
  );

export declare namespace BlankNode {
  export type Type = typeof BlankNode.Type;
  export type Encoded = typeof BlankNode.Encoded;
}

export const makeBlankNode = S.decodeUnknownSync(BlankNode);

export const isBlankNode = S.is(BlankNode);

export class Literal extends S.Class<Literal>($I`Literal`)({
  value: S.String.annotations({
    title: "Value",
    description: "Lexical value of the literal",
  }),

  datatype: S.optional(IRI).annotations({
    title: "Datatype",
    description: "Datatype IRI (defaults to xsd:string when omitted)",
  }),

  language: S.optional(S.NonEmptyTrimmedString).annotations({
    title: "Language",
    description: "BCP 47 language tag (e.g., 'en', 'en-US')",
  }),
}) {
  static readonly is = S.is(Literal);
}

export class Subject extends S.Union(IRI, BlankNode).annotations(
  $I.annotations("Subject", {
    title: "Subject",
    description: "RDF subject (IRI or blank node)",
  })
) {}

export declare namespace Subject {
  export type Type = typeof Subject.Type;
  export type Encoded = typeof Subject.Encoded;
}

export class Predicate extends IRI.annotations(
  $I.annotations("Predicate", {
    title: "Predicate",
    description: "RDF predicate (IRI only)",
  })
) {}

export declare namespace Predicate {
  export type Type = typeof Predicate.Type;
  export type Encoded = typeof Predicate.Encoded;
}

export class Term extends S.Union(IRI, BlankNode, Literal).annotations(
  $I.annotations("Term", {
    title: "Term",
    description: "Any RDF term (IRI, blank node, or literal)",
  })
) {
  static readonly make = S.decodeUnknownSync(this);
}

export declare namespace Term {
  export type Type = typeof Term.Type;
  export type Encoded = typeof Term.Encoded;
}

export class Object extends Term.annotations(
  $I.annotations("Object", {
    title: "Object",
    description: "RDF object (any term type)",
  })
) {}

export declare namespace Object {
  export type Type = typeof Object.Type;
  export type Encoded = typeof Object.Encoded;
}

export const Graph = S.optional(IRI).annotations(
  $I.annotations("Graph", {
    title: "Graph",
    description: "Named graph IRI (omit for default graph)",
  })
);

export declare namespace Graph {
  export type Type = S.Schema.Type<typeof Graph>;
  export type Encoded = S.Schema.Encoded<typeof Graph>;
}

export class Quad extends S.Class<Quad>($I`Quad`)({
  subject: Subject.annotations({
    title: "Subject",
    description: "Subject of the RDF statement",
  }),

  predicate: Predicate.annotations({
    title: "Predicate",
    description: "Predicate of the RDF statement",
  }),

  object: Object.annotations({
    title: "Object",
    description: "Object of the RDF statement",
  }),

  graph: Graph,
}) {}
