/**
 * Core RDF primitives and common types.
 *
 * Mirrors `trustgraph-base/trustgraph/schema/core/primitives.py`.
 * Term and Triple form a mutually recursive discriminated union resolved
 * via `Schema.suspend`.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

// ---------------------------------------------------------------------------
// TgError — embedded error payload in response messages
// ---------------------------------------------------------------------------

export const TgError = Schema.Struct({
  type: Schema.String,
  message: Schema.String,
});

export type TgError = typeof TgError.Type;

// ---------------------------------------------------------------------------
// RDF Terms — discriminated union with recursive TRIPLE variant
// ---------------------------------------------------------------------------

export interface IriTerm {
  readonly iri: string;
  readonly type: "IRI";
}

export interface BlankTerm {
  readonly id: string;
  readonly type: "BLANK";
}

export interface LiteralTerm {
  readonly datatype?: string;
  readonly language?: string;
  readonly type: "LITERAL";
  readonly value: string;
}

export interface TripleTerm {
  readonly triple: Triple;
  readonly type: "TRIPLE";
}

export type Term = IriTerm | BlankTerm | LiteralTerm | TripleTerm;

export interface Triple {
  readonly g?: Term;
  readonly o: Term;
  readonly p: Term;
  readonly s: Term;
}

// --- Non-recursive leaf schemas ---

const IriTermSchema = Schema.Struct({
  type: Schema.Literal("IRI"),
  iri: Schema.String,
});

const BlankTermSchema = Schema.Struct({
  type: Schema.Literal("BLANK"),
  id: Schema.String,
});

const LiteralTermSchema = Schema.Struct({
  type: Schema.Literal("LITERAL"),
  value: Schema.String,
  datatype: Schema.optionalKey(Schema.String),
  language: Schema.optionalKey(Schema.String),
});

// --- Recursive schemas via Schema.suspend ---

export const TermSchema: Schema.Schema<Term> = Schema.Union([
  IriTermSchema,
  BlankTermSchema,
  LiteralTermSchema,
  Schema.Struct({
    type: Schema.Literal("TRIPLE"),
    triple: Schema.suspend((): Schema.Schema<Triple> => TripleSchema),
  }),
]);

export const TripleSchema: Schema.Schema<Triple> = Schema.Struct({
  s: Schema.suspend((): Schema.Schema<Term> => TermSchema),
  p: Schema.suspend((): Schema.Schema<Term> => TermSchema),
  o: Schema.suspend((): Schema.Schema<Term> => TermSchema),
  g: Schema.optionalKey(Schema.suspend((): Schema.Schema<Term> => TermSchema)),
});

// ---------------------------------------------------------------------------
// Field / RowSchema — schema introspection types
// ---------------------------------------------------------------------------

export const Field = Schema.Struct({
  name: Schema.String,
  type: Schema.String,
  description: Schema.optionalKey(Schema.String),
});

export type Field = typeof Field.Type;

export const RowSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.optionalKey(Schema.String),
  fields: Schema.Array(Field),
});

export type RowSchema = typeof RowSchema.Type;

// ---------------------------------------------------------------------------
// LLM result types
// ---------------------------------------------------------------------------

export const LlmResult = Schema.Struct({
  text: Schema.String,
  inToken: Schema.Number,
  outToken: Schema.Number,
  model: Schema.String,
});

export type LlmResult = typeof LlmResult.Type;

export const LlmChunk = Schema.Struct({
  text: Schema.String,
  inToken: Schema.NullOr(Schema.Number),
  outToken: Schema.NullOr(Schema.Number),
  model: Schema.String,
  isFinal: Schema.Boolean,
});

export type LlmChunk = typeof LlmChunk.Type;
