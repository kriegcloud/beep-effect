/**
 * Page error schemas.
 *
 * These are "boundary-safe" errors: they are designed to survive serialization and cross
 * RPC/HTTP layers as tagged, documented failures.
 *
 * @module documents-domain/entities/Page/Page.errors
 * @since 1.0.0
 * @category errors
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Page/Page.errors");

/**
 * Error when a page with the specified ID cannot be found.
 *
 * @since 1.0.0
 * @category errors
 */
export class PageNotFound extends S.TaggedError<PageNotFound>($I`PageNotFound`)(
  "PageNotFound",
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotationsHttp("PageNotFound", {
    status: 404,
    description: "Error when a page with the specified ID cannot be found.",
  })
) {}

/**
 * Error when user lacks permission to perform action on a page.
 *
 * @since 1.0.0
 * @category errors
 */
export class PagePermissionDenied extends S.TaggedError<PagePermissionDenied>($I`PagePermissionDenied`)(
  "PagePermissionDenied",
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotationsHttp("PagePermissionDenied", {
    status: 403,
    description: "Error when user lacks permission to perform action on a page.",
  })
) {}

/**
 * Error when attempting to modify an archived page.
 *
 * @since 1.0.0
 * @category errors
 */
export class PageArchived extends S.TaggedError<PageArchived>($I`PageArchived`)(
  "PageArchived",
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotationsHttp("PageArchived", {
    status: 400,
    description: "Error when attempting to modify an archived page.",
  })
) {}

/**
 * Error when attempting to modify a locked page.
 *
 * @since 1.0.0
 * @category errors
 */
export class PageLocked extends S.TaggedError<PageLocked>($I`PageLocked`)(
  "PageLocked",
  {
    id: DocumentsEntityIds.PageId,
  },
  $I.annotationsHttp("PageLocked", {
    status: 423,
    description: "Error when attempting to modify a locked page.",
  })
) {}

/**
 * Error when attempting to create a circular parent-child relationship.
 *
 * @since 1.0.0
 * @category errors
 */
export class PageCyclicNesting extends S.TaggedError<PageCyclicNesting>($I`PageCyclicNesting`)(
  "PageCyclicNesting",
  {
    id: DocumentsEntityIds.PageId,
    parentId: DocumentsEntityIds.PageId,
  },
  $I.annotationsHttp("PageCyclicNesting", {
    status: 400,
    description: "Error when attempting to create a circular parent-child relationship.",
  })
) {}

/**
 * Error when a share entry with the specified ID cannot be found.
 *
 * @since 1.0.0
 * @category errors
 */
export class PageShareNotFound extends S.TaggedError<PageShareNotFound>($I`PageShareNotFound`)(
  "PageShareNotFound",
  {
    id: DocumentsEntityIds.PageShareId,
  },
  $I.annotationsHttp("PageShareNotFound", {
    status: 404,
    description: "Error when a share entry with the specified ID cannot be found.",
  })
) {}

/**
 * Union of all Page errors for RPC definitions.
 *
 * @since 1.0.0
 * @category errors
 */
export const Errors = S.Union(
  PageNotFound,
  PagePermissionDenied,
  PageArchived,
  PageLocked,
  PageCyclicNesting,
  PageShareNotFound
);

/**
 * Convenience type for the `Errors` union.
 *
 * @since 1.0.0
 * @category errors
 */
export type Errors = typeof Errors.Type;
