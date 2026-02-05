import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/rdf");

export class RdfTermConversionError extends S.TaggedError<RdfTermConversionError>($I`RdfTermConversionError`)(
  "RdfTermConversionError",
  {
    termType: S.String,
    termValue: S.optional(S.String),
    position: S.Literal("subject", "predicate", "object", "graph"),
    message: S.String,
  },
  $I.annotations("RdfTermConversionError", {
    description: "Unexpected RDF term type during conversion (library defect)",
  })
) {}

export class RdfStoreError extends S.TaggedError<RdfStoreError>($I`RdfStoreError`)(
  "RdfStoreError",
  {
    operation: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("RdfStoreError", {
    description: "RDF store operation failed",
  })
) {}

export class SerializerError extends S.TaggedError<SerializerError>($I`SerializerError`)(
  "SerializerError",
  {
    operation: S.String,
    format: S.optional(S.String),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("SerializerError", {
    description: "RDF serialization/parsing operation failed",
  })
) {}

export class RdfError extends S.Union(RdfTermConversionError, RdfStoreError, SerializerError).annotations(
  $I.annotations("RdfError", {
    description: "Union of all RDF error types",
  })
) {}

export declare namespace RdfError {
  export type Type = typeof RdfError.Type;
  export type Encoded = typeof RdfError.Encoded;
}
