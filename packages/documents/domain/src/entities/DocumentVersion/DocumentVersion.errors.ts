import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/DocumentVersion/DocumentVersion.errors");

export class DocumentVersionNotFoundError extends S.TaggedError<DocumentVersionNotFoundError>()(
  $I`DocumentVersionNotFoundError`,
  {
    id: DocumentsEntityIds.DocumentVersionId,
  },
  $I.annotationsHttp("DocumentVersionNotFoundError", {
    status: 404,
    description: "Error when a document version with the specified ID cannot be found.",
  })
) {}

export const Errors = DocumentVersionNotFoundError;
export type Errors = typeof Errors.Type;
