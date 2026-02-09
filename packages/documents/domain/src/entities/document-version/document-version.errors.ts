import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/document-version/document-version.errors");

/**
 * Error when a document version with the specified ID cannot be found.
 *
 * Note: callers should treat "not found" as "not found or access denied"
 * to avoid cross-org existence leaks.
 */
export class DocumentVersionNotFoundError extends S.TaggedError<DocumentVersionNotFoundError>()(
  $I`DocumentVersionNotFoundError`,
  { id: DocumentsEntityIds.DocumentVersionId },
  HttpApiSchema.annotations({ status: 404 })
) {}
