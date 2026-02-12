import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/PageShare/PageShare.errors");

export class PageShareNotFoundError extends S.TaggedError<PageShareNotFoundError>()(
  $I`PageShareNotFoundError`,
  {
    id: DocumentsEntityIds.PageShareId,
  },
  $I.annotationsHttp("PageShareNotFoundError", {
    status: 404,
    description: "Error when a page share with the specified ID cannot be found.",
  })
) {}

export class PageSharePermissionDeniedError extends S.TaggedError<PageSharePermissionDeniedError>()(
  $I`PageSharePermissionDeniedError`,
  {
    id: DocumentsEntityIds.PageShareId,
  },
  $I.annotationsHttp("PageSharePermissionDeniedError", {
    status: 403,
    description: "Error when the user does not have permission to access the page share.",
  })
) {}

export const Errors = S.Union(PageShareNotFoundError, PageSharePermissionDeniedError);
export type Errors = typeof Errors.Type;
