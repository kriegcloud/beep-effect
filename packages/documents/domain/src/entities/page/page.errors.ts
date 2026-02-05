import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/page/page.errors");

/**
 * Error when a page with the specified ID cannot be found.
 */
export class PageNotFoundError extends S.TaggedError<PageNotFoundError>()(
  $I`PageNotFoundError`,
  { id: DocumentsEntityIds.PageId },
  HttpApiSchema.annotations({ status: 404 })
) {}

/**
 * Error when user lacks permission to perform action on a page.
 */
export class PagePermissionDeniedError extends S.TaggedError<PagePermissionDeniedError>()(
  $I`PagePermissionDeniedError`,
  { id: DocumentsEntityIds.PageId },
  HttpApiSchema.annotations({ status: 403 })
) {}

/**
 * Error when attempting to modify an archived page.
 */
export class PageArchivedError extends S.TaggedError<PageArchivedError>()(
  $I`PageArchivedError`,
  { id: DocumentsEntityIds.PageId },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Error when attempting to modify a locked page.
 */
export class PageLockedError extends S.TaggedError<PageLockedError>()(
  $I`PageLockedError`,
  { id: DocumentsEntityIds.PageId },
  HttpApiSchema.annotations({ status: 423 })
) {}

/**
 * Error when attempting to create a circular parent-child relationship.
 */
export class PageCyclicNestingError extends S.TaggedError<PageCyclicNestingError>()(
  $I`PageCyclicNestingError`,
  {
    id: DocumentsEntityIds.PageId,
    parentId: DocumentsEntityIds.PageId,
  },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Error when a share entry with the specified ID cannot be found.
 */
export class PageShareNotFoundError extends S.TaggedError<PageShareNotFoundError>()(
  $I`PageShareNotFoundError`,
  { id: DocumentsEntityIds.PageShareId },
  HttpApiSchema.annotations({ status: 404 })
) {}

/**
 * Union of all Page errors for RPC definitions.
 */
export const Errors = S.Union(
  PageNotFoundError,
  PagePermissionDeniedError,
  PageArchivedError,
  PageLockedError,
  PageCyclicNestingError,
  PageShareNotFoundError
);

export type Errors = typeof Errors.Type;
