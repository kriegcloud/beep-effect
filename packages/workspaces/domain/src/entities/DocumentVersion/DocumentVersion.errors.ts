import { $WorkspacesDomainId } from "@beep/identity/packages";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $WorkspacesDomainId.create("entities/DocumentVersion/DocumentVersion.errors");

export class DocumentVersionNotFoundError extends S.TaggedError<DocumentVersionNotFoundError>()(
  $I`DocumentVersionNotFoundError`,
  {
    id: WorkspacesEntityIds.DocumentVersionId,
  },
  $I.annotationsHttp("DocumentVersionNotFoundError", {
    status: 404,
    description: "Error when a document version with the specified ID cannot be found.",
  })
) {}

export const Errors = DocumentVersionNotFoundError;
export type Errors = typeof Errors.Type;
