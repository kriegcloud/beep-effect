/**
 * Ontology errors for Knowledge slice
 *
 * Typed errors for ontology operations (parsing, loading, validation).
 *
 * @module knowledge-domain/errors/ontology
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/ontology");

/**
 * RDF parsing error (invalid Turtle/RDF-XML syntax)
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyParseError extends S.TaggedError<OntologyParseError>($I`OntologyParseError`)(
  "OntologyParseError",
  {
    ontologyId: S.optional(S.String),
    format: S.optional(S.String),
    line: S.optional(S.Number),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyParseError", {
    description: "Failed to parse ontology RDF content",
  })
) {}

/**
 * Ontology not found error
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyNotFoundError extends S.TaggedError<OntologyNotFoundError>($I`OntologyNotFoundError`)(
  "OntologyNotFoundError",
  {
    ontologyId: S.String,
    namespace: S.optional(S.String),
    message: S.String,
  },
  $I.annotations("OntologyNotFoundError", {
    description: "Requested ontology not found",
  })
) {}

/**
 * Ontology validation error (semantic issues)
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyValidationError extends S.TaggedError<OntologyValidationError>($I`OntologyValidationError`)(
  "OntologyValidationError",
  {
    ontologyId: S.optional(S.String),
    constraint: S.String,
    reason: S.String,
    message: S.String,
  },
  $I.annotations("OntologyValidationError", {
    description: "Ontology failed validation (missing required elements, etc.)",
  })
) {}

/**
 * Ontology import resolution error
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyImportError extends S.TaggedError<OntologyImportError>($I`OntologyImportError`)(
  "OntologyImportError",
  {
    ontologyId: S.optional(S.String),
    importUri: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyImportError", {
    description: "Failed to resolve ontology import (owl:imports)",
  })
) {}

/**
 * Ontology storage error
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyStorageError extends S.TaggedError<OntologyStorageError>($I`OntologyStorageError`)(
  "OntologyStorageError",
  {
    ontologyId: S.optional(S.String),
    operation: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyStorageError", {
    description: "Failed to read/write ontology from storage",
  })
) {}

/**
 * Generic ontology error (fallback)
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyGenericError extends S.TaggedError<OntologyGenericError>($I`OntologyGenericError`)(
  "OntologyGenericError",
  {
    ontologyId: S.optional(S.String),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyGenericError", {
    description: "Generic ontology error (fallback)",
  })
) {}

/**
 * Union of all ontology error types
 *
 * @since 0.1.0
 * @category errors
 */
export class OntologyError extends S.Union(
  OntologyParseError,
  OntologyNotFoundError,
  OntologyValidationError,
  OntologyImportError,
  OntologyStorageError,
  OntologyGenericError
).annotations(
  $I.annotations("OntologyError", {
    description: "Union of all ontology error types",
  })
) {}

export declare namespace OntologyError {
  export type Type = typeof OntologyError.Type;
  export type Encoded = typeof OntologyError.Encoded;
}
