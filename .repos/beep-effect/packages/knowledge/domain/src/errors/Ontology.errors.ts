import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/ontology");

export class OntologyParseError extends S.TaggedError<OntologyParseError>($I`OntologyParseError`)(
  "OntologyParseError",
  {
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    format: S.optional(S.String),
    line: S.optional(S.Number),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyParseError", {
    description: "Failed to parse ontology RDF content",
  })
) {}

export class OntologyNotFoundError extends S.TaggedError<OntologyNotFoundError>($I`OntologyNotFoundError`)(
  "OntologyNotFoundError",
  {
    ontologyId: KnowledgeEntityIds.OntologyId,
    namespace: S.optional(S.String),
    message: S.String,
  },
  $I.annotations("OntologyNotFoundError", {
    description: "Requested ontology not found",
  })
) {}

export class OntologyValidationError extends S.TaggedError<OntologyValidationError>($I`OntologyValidationError`)(
  "OntologyValidationError",
  {
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    constraint: S.String,
    reason: S.String,
    message: S.String,
  },
  $I.annotations("OntologyValidationError", {
    description: "Ontology failed validation (missing required elements, etc.)",
  })
) {}

export class OntologyImportError extends S.TaggedError<OntologyImportError>($I`OntologyImportError`)(
  "OntologyImportError",
  {
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    importUri: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyImportError", {
    description: "Failed to resolve ontology import (owl:imports)",
  })
) {}

export class OntologyStorageError extends S.TaggedError<OntologyStorageError>($I`OntologyStorageError`)(
  "OntologyStorageError",
  {
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    operation: S.String,
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyStorageError", {
    description: "Failed to read/write ontology from storage",
  })
) {}

export class OntologyGenericError extends S.TaggedError<OntologyGenericError>($I`OntologyGenericError`)(
  "OntologyGenericError",
  {
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    message: S.String,
    cause: S.optional(S.String),
  },
  $I.annotations("OntologyGenericError", {
    description: "Generic ontology error (fallback)",
  })
) {}

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

export class OntologyMutationError extends S.Union(OntologyParseError, OntologyValidationError).annotations(
  $I.annotations("OntologyMutationError", {
    description: "Errors that can occur during ontology create/update operations",
  })
) {}

export declare namespace OntologyMutationError {
  export type Type = typeof OntologyMutationError.Type;
  export type Encoded = typeof OntologyMutationError.Encoded;
}
