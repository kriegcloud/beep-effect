import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Document/Document.errors");

/**
 * Error when a document with the specified ID cannot be found.
 */
export class DocumentNotFoundError extends S.TaggedError<DocumentNotFoundError>()(
  $I`DocumentNotFoundError`,
  { id: DocumentsEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 404 })
) {}

/**
 * Error when user lacks permission to perform action on document.
 */
export class DocumentPermissionDeniedError extends S.TaggedError<DocumentPermissionDeniedError>()(
  $I`DocumentPermissionDeniedError`,
  { id: DocumentsEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 403 })
) {}

/**
 * Error when attempting to modify an archived document.
 */
export class DocumentArchivedError extends S.TaggedError<DocumentArchivedError>()(
  $I`DocumentArchivedError`,
  { id: DocumentsEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Error when attempting to modify a locked document.
 */
export class DocumentLockedError extends S.TaggedError<DocumentLockedError>()(
  $I`DocumentLockedError`,
  { id: DocumentsEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 423 })
) {}

/**
 * Error when attempting to publish an already published document.
 */
export class DocumentAlreadyPublishedError extends S.TaggedError<DocumentAlreadyPublishedError>()(
  $I`DocumentAlreadyPublishedError`,
  { id: DocumentsEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Error when attempting to unpublish a document that is not published.
 */
export class DocumentNotPublishedError extends S.TaggedError<DocumentNotPublishedError>()(
  $I`DocumentNotPublishedError`,
  { id: DocumentsEntityIds.DocumentId },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Union of all Document errors for RPC definitions.
 */
export const Errors = S.Union(
  DocumentNotFoundError,
  DocumentPermissionDeniedError,
  DocumentArchivedError,
  DocumentLockedError,
  DocumentAlreadyPublishedError,
  DocumentNotPublishedError
);

export type Errors = typeof Errors.Type;
