/**
 * Core RDF primitives and common types.
 *
 * Mirrors `trustgraph-base/trustgraph/schema/core/primitives.py`.
 * Term and Triple form a mutually recursive discriminated union resolved
 * via `S.suspend`.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import type * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $GraphSchemaId.create("Primitives");

/**
 * Embedded service error payload returned on graph wire responses.
 *
 * @since 0.1.0
 * @category models
 */
export class TgError extends S.Class<TgError>($I`TgError`)({
  type: S.String.annotateKey({
    description: "Short machine-readable error type emitted by the remote service.",
  }),
  message: S.String.annotateKey({
    description: "Human-readable description of the remote service failure.",
  }),
}, $I.annote("TgError", {
  description: "Structured error payload embedded in graph service responses.",
})) {}

/**
 * RDF IRI term.
 *
 * @since 0.1.0
 * @category models
 */
export const IriTerm = S.Struct({
  type: S.tag("IRI").annotateKey({
    description: "Discriminator marking the term as an IRI node.",
  }),
  iri: S.String.annotateKey({
    description: "Absolute IRI value identifying the resource.",
  }),
}).pipe($I.annoteSchema("IriTerm", {
  description: "RDF term variant representing a named resource by IRI.",
}));

/**
 * Type for {@link IriTerm}. {@inheritDoc IriTerm}
 *
 * @category models
 * @since 0.1.0
 */
export type IriTerm = typeof IriTerm.Type;

/**
 * RDF blank node term.
 *
 * @since 0.1.0
 * @category models
 */
export const BlankTerm = S.Struct({
  type: S.tag("BLANK").annotateKey({
    description: "Discriminator marking the term as a blank node.",
  }),
  id: S.String.annotateKey({
    description: "Blank node identifier scoped to the source graph.",
  }),
}).pipe($I.annoteSchema("BlankTerm", {
  description: "RDF term variant representing an anonymous blank node.",
}));

/**
 * Type for {@link BlankTerm}. {@inheritDoc BlankTerm}
 *
 * @category models
 * @since 0.1.0
 */
export type BlankTerm = typeof BlankTerm.Type;

/**
 * RDF literal term.
 *
 * @since 0.1.0
 * @category models
 */
export const LiteralTerm = S.Struct({
  type: S.tag("LITERAL").annotateKey({
    description: "Discriminator marking the term as a literal value.",
  }),
  value: S.String.annotateKey({
    description: "Lexical literal value as received from the graph service.",
  }),
  datatype: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional datatype IRI describing the literal value.",
  }),
  language: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional BCP-47 language tag carried by the literal.",
  }),
}).pipe($I.annoteSchema("LiteralTerm", {
  description: "RDF term variant representing a literal lexical value.",
}));

/**
 * Type for {@link LiteralTerm}. {@inheritDoc LiteralTerm}
 *
 * @category models
 * @since 0.1.0
 */
export type LiteralTerm = typeof LiteralTerm.Type;

/**
 * RDF quoted triple term.
 *
 * @since 0.1.0
 * @category models
 */
type TripleRecord = {
  readonly g: O.Option<Term>;
  readonly o: Term;
  readonly p: Term;
  readonly s: Term;
}

type TripleTermRecord = {
  readonly triple: Triple;
  readonly type: "TRIPLE";
}

type TermRecord = IriTerm | BlankTerm | LiteralTerm | TripleTermRecord;

/**
 * Type for {@link Triple}. {@inheritDoc Triple}
 *
 * @category models
 * @since 0.1.0
 */
export type Triple = TripleRecord;
/**
 * Type for {@link TripleTerm}. {@inheritDoc TripleTerm}
 *
 * @category models
 * @since 0.1.0
 */
export type TripleTerm = TripleTermRecord;
/**
 * Type for {@link Term}. {@inheritDoc Term}
 *
 * @category models
 * @since 0.1.0
 */
export type Term = TermRecord;

/**
 * RDF term variant representing a quoted RDF-star triple.
 *
 * @since 0.1.0
 * @category models
 */
export const TripleTerm: S.Schema<TripleTerm> = S.Struct({
  type: S.tag("TRIPLE").annotateKey({
    description: "Discriminator marking the term as a quoted triple.",
  }),
  triple: S.suspend((): S.Schema<Triple> => Triple).annotateKey({
    description: "Quoted triple carried as the nested RDF term payload.",
  }),
}).pipe($I.annoteSchema("TripleTerm", {
  description: "RDF term variant representing a quoted RDF-star triple.",
}));

/**
 * RDF term union.
 *
 * @since 0.1.0
 * @category models
 */
export const Term: S.Schema<Term> = S.Union([IriTerm, BlankTerm, LiteralTerm, TripleTerm]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("Term", {
    description: "RDF term union covering IRI, blank, literal, and quoted triple variants.",
  }),
);

/**
 * RDF triple payload.
 *
 * @since 0.1.0
 * @category models
 */
export const Triple: S.Schema<Triple> = S.Struct({
  s: S.suspend((): S.Schema<Term> => Term).annotateKey({
    description: "Subject term for the triple.",
  }),
  p: S.suspend((): S.Schema<Term> => Term).annotateKey({
    description: "Predicate term for the triple.",
  }),
  o: S.suspend((): S.Schema<Term> => Term).annotateKey({
    description: "Object term for the triple.",
  }),
  g: S.OptionFromOptionalKey(S.suspend((): S.Schema<Term> => Term)).annotateKey({
    description: "Optional graph term identifying the triple's graph context.",
  }),
}).pipe($I.annoteSchema("Triple", {
  description: "RDF triple payload with optional graph context.",
}));

/**
 * Named field within a structured row schema.
 *
 * @since 0.1.0
 * @category models
 */
export class Field extends S.Class<Field>($I`Field`)({
  name: S.String.annotateKey({
    description: "Field name exposed by the structured row schema.",
  }),
  type: S.String.annotateKey({
    description: "Wire-level type name for the field.",
  }),
  description: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional human-readable description of the field.",
  }),
}, $I.annote("Field", {
  description: "Structured field definition used by row schema metadata.",
})) {}

/**
 * Structured schema description for tabular row payloads.
 *
 * @since 0.1.0
 * @category models
 */
export class RowSchema extends S.Class<RowSchema>($I`RowSchema`)({
  name: S.String.annotateKey({
    description: "Schema name for the row payload.",
  }),
  description: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional human-readable description of the row schema.",
  }),
  fields: S.Array(Field).annotateKey({
    description: "Ordered field definitions comprising the row schema.",
  }),
}, $I.annote("RowSchema", {
  description: "Structured description of a row-oriented payload schema.",
})) {}

/**
 * Full LLM completion metadata.
 *
 * @since 0.1.0
 * @category models
 */
export class LlmResult extends S.Class<LlmResult>($I`LlmResult`)({
  text: S.String.annotateKey({
    description: "Rendered completion text returned by the model.",
  }),
  inToken: S.Number.annotateKey({
    description: "Token count consumed by the prompt.",
  }),
  outToken: S.Number.annotateKey({
    description: "Token count generated by the completion.",
  }),
  model: S.String.annotateKey({
    description: "Model identifier used for the completion.",
  }),
}, $I.annote("LlmResult", {
  description: "Completed LLM response payload with token accounting metadata.",
})) {}

/**
 * Streaming LLM completion chunk.
 *
 * @since 0.1.0
 * @category models
 */
export class LlmChunk extends S.Class<LlmChunk>($I`LlmChunk`)({
  text: S.String.annotateKey({
    description: "Partial completion text included in this streamed chunk.",
  }),
  inToken: S.NullOr(S.Number).annotateKey({
    description: "Prompt token count when available, otherwise null.",
  }),
  outToken: S.NullOr(S.Number).annotateKey({
    description: "Completion token count when available, otherwise null.",
  }),
  model: S.String.annotateKey({
    description: "Model identifier producing the streamed chunk.",
  }),
  isFinal: S.Boolean.annotateKey({
    description: "Whether this chunk marks the end of the streamed completion.",
  }),
}, $I.annote("LlmChunk", {
  description: "Streaming LLM response chunk with optional token accounting.",
})) {}
