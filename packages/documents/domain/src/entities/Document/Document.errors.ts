import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Document/Document.errors");

export class DocumentNotFoundError extends S.TaggedError<DocumentNotFoundError>()(
  $I`DocumentNotFoundError`,
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotationsHttp("DocumentNotFoundError", {
    status: 404,
    description: "Error when a document with the specified ID cannot be found.",
  })
) {}

export class DocumentPermissionDeniedError extends S.TaggedError<DocumentPermissionDeniedError>()(
  $I`DocumentPermissionDeniedError`,
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotationsHttp("DocumentPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the document.",
  })
) {}

export class DocumentArchivedError extends S.TaggedError<DocumentArchivedError>()(
  $I`DocumentArchivedError`,
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotationsHttp("DocumentArchivedError", {
    status: 400,
    description: "Error when attempting to modify an archived document.",
  })
) {}

export class DocumentLockedError extends S.TaggedError<DocumentLockedError>()(
  $I`DocumentLockedError`,
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotationsHttp("DocumentLockedError", {
    status: 423,
    description: "Error when attempting to modify a locked document.",
  })
) {}

export class DocumentAlreadyPublishedError extends S.TaggedError<DocumentAlreadyPublishedError>()(
  $I`DocumentAlreadyPublishedError`,
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotationsHttp("DocumentAlreadyPublishedError", {
    status: 400,
    description: "Error when attempting to publish an already published document.",
  })
) {}

export class DocumentNotPublishedError extends S.TaggedError<DocumentNotPublishedError>()(
  $I`DocumentNotPublishedError`,
  {
    id: DocumentsEntityIds.DocumentId,
  },
  $I.annotationsHttp("DocumentNotPublishedError", {
    status: 400,
    description: "Error when attempting to unpublish a document that is not published.",
  })
) {}

export const Errors = S.Union(
  DocumentNotFoundError,
  DocumentPermissionDeniedError,
  DocumentArchivedError,
  DocumentLockedError,
  DocumentAlreadyPublishedError,
  DocumentNotPublishedError
);

export type Errors = typeof Errors.Type;
