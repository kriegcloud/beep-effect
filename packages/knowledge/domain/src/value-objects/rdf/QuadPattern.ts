import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

import { BlankNode, Graph, IRI, Term } from "./Quad";

const $I = $KnowledgeDomainId.create("value-objects/rdf/QuadPattern");

export const SubjectPattern = S.optional(S.Union(IRI, BlankNode)).annotations(
  $I.annotations("SubjectPattern", {
    title: "Subject Pattern",
    description: "Subject pattern (undefined = wildcard)",
  })
);

export declare namespace SubjectPattern {
  export type Type = S.Schema.Type<typeof SubjectPattern>;
  export type Encoded = S.Schema.Encoded<typeof SubjectPattern>;
}

export const PredicatePattern = S.optional(IRI).annotations(
  $I.annotations("PredicatePattern", {
    title: "Predicate Pattern",
    description: "Predicate pattern (undefined = wildcard)",
  })
);

export declare namespace PredicatePattern {
  export type Type = S.Schema.Type<typeof PredicatePattern>;
  export type Encoded = S.Schema.Encoded<typeof PredicatePattern>;
}

export const ObjectPattern = S.optional(Term).annotations(
  $I.annotations("ObjectPattern", {
    title: "Object Pattern",
    description: "Object pattern (undefined = wildcard)",
  })
);

export declare namespace ObjectPattern {
  export type Type = S.Schema.Type<typeof ObjectPattern>;
  export type Encoded = S.Schema.Encoded<typeof ObjectPattern>;
}

export const GraphPattern = Graph.annotations(
  $I.annotations("GraphPattern", {
    title: "Graph Pattern",
    description: "Graph pattern (undefined = default graph)",
  })
);

export type GraphPattern = S.Schema.Type<typeof GraphPattern>;

export class QuadPattern extends S.Class<QuadPattern>($I`QuadPattern`)({
  subject: SubjectPattern,
  predicate: PredicatePattern,
  object: ObjectPattern,
  graph: GraphPattern,
}) {}
