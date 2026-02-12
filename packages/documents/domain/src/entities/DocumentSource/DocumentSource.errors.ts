import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/DocumentSource/DocumentSource.errors");

export class DocumentSourceNotFoundError extends S.TaggedError<DocumentSourceNotFoundError>()(
  $I`DocumentSourceNotFoundError`,
  {
    id: DocumentsEntityIds.DocumentSourceId,
  },
  $I.annotationsHttp("DocumentSourceNotFoundError", {
    status: 404,
    description: "Error when a document source with the specified ID cannot be found.",
  })
) {}

export class DocumentSourcePermissionDeniedError extends S.TaggedError<DocumentSourcePermissionDeniedError>()(
  $I`DocumentSourcePermissionDeniedError`,
  {
    id: DocumentsEntityIds.DocumentSourceId,
  },
  $I.annotationsHttp("DocumentSourcePermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the document source.",
  })
) {}

export const Errors = S.Union(DocumentSourceNotFoundError, DocumentSourcePermissionDeniedError);
export type Errors = typeof Errors.Type;
