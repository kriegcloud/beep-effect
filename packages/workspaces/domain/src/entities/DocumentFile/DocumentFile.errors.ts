import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $WorkspacesDomainId.create("entities/DocumentFile/DocumentFile.errors");

export class DocumentFileNotFoundError extends S.TaggedError<DocumentFileNotFoundError>()(
  $I`DocumentFileNotFoundError`,
  {
    id: WorkspacesEntityIds.DocumentFileId,
  },
  $I.annotationsHttp("DocumentFileNotFoundError", {
    status: 404,
    description: "Error when a document file with the specified ID cannot be found.",
  })
) {}

export class DocumentFilePermissionDeniedError extends S.TaggedError<DocumentFilePermissionDeniedError>()(
  $I`DocumentFilePermissionDeniedError`,
  {
    id: WorkspacesEntityIds.DocumentFileId,
  },
  $I.annotationsHttp("DocumentFilePermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the document file.",
  })
) {}

export const Errors = S.Union(DocumentFileNotFoundError, DocumentFilePermissionDeniedError);
export type Errors = typeof Errors.Type;
