/**
 * QuadPattern value object
 *
 * Pattern matching for RDF quads with optional wildcard fields.
 * Used for querying and filtering RDF data.
 *
 * @module knowledge-domain/value-objects/rdf/QuadPattern
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

import { BlankNode, Graph, IRI, Term } from "./Quad";

const $I = $KnowledgeDomainId.create("value-objects/rdf/QuadPattern");

/**
 * SubjectPattern - Optional subject for pattern matching
 *
 * When undefined, acts as a wildcard matching any subject.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const SubjectPattern = S.optional(S.Union(IRI, BlankNode)).annotations(
  $I.annotations("SubjectPattern", {
    title: "Subject Pattern",
    description: "Subject pattern (undefined = wildcard)",
  })
);

export type SubjectPattern = S.Schema.Type<typeof SubjectPattern>;

/**
 * PredicatePattern - Optional predicate for pattern matching
 *
 * When undefined, acts as a wildcard matching any predicate.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const PredicatePattern = S.optional(IRI).annotations(
  $I.annotations("PredicatePattern", {
    title: "Predicate Pattern",
    description: "Predicate pattern (undefined = wildcard)",
  })
);

export type PredicatePattern = S.Schema.Type<typeof PredicatePattern>;

/**
 * ObjectPattern - Optional object for pattern matching
 *
 * When undefined, acts as a wildcard matching any object.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const ObjectPattern = S.optional(Term).annotations(
  $I.annotations("ObjectPattern", {
    title: "Object Pattern",
    description: "Object pattern (undefined = wildcard)",
  })
);

export type ObjectPattern = S.Schema.Type<typeof ObjectPattern>;

/**
 * GraphPattern - Optional graph for pattern matching
 *
 * When undefined, matches the default graph. Use explicit IRI to match
 * a specific named graph.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const GraphPattern = Graph.annotations(
  $I.annotations("GraphPattern", {
    title: "Graph Pattern",
    description: "Graph pattern (undefined = default graph)",
  })
);

export type GraphPattern = S.Schema.Type<typeof GraphPattern>;

/**
 * QuadPattern - Pattern for matching RDF quads
 *
 * All fields are optional to allow wildcard matching. When a field is
 * omitted/undefined, it acts as a wildcard that matches any value.
 *
 * Common patterns:
 * - `{ subject: iri }` - All statements about a subject
 * - `{ predicate: iri }` - All statements with a predicate
 * - `{ subject: iri, predicate: iri }` - Specific property of subject
 * - `{}` - Match all quads (wildcard pattern)
 *
 * @since 0.1.0
 * @category value-objects
 */
export class QuadPattern extends S.Class<QuadPattern>($I`QuadPattern`)({
  /**
   * Subject pattern (undefined = wildcard)
   */
  subject: SubjectPattern,

  /**
   * Predicate pattern (undefined = wildcard)
   */
  predicate: PredicatePattern,

  /**
   * Object pattern (undefined = wildcard)
   */
  object: ObjectPattern,

  /**
   * Graph pattern (undefined = default graph)
   */
  graph: GraphPattern,
}) {}
