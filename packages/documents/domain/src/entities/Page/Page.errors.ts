import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Page/Page.errors");

/**
 * Error when a page with the specified ID cannot be found.
 */
export class PageNotFound extends S.TaggedError<PageNotFound>($I`PageNotFound`)(
  "PageNotFound",
  { id: DocumentsEntityIds.PageId, cause: S.optional(S.Defect) },
  $I.annotationsHttp("PageNotFound", {
    status: 404,
    description: "Error when a page with the specified ID cannot be found.",
  })
) {}

/**
 * Error when user lacks permission to perform action on a page.
 */
export class PagePermissionDenied extends S.TaggedError<PagePermissionDenied>($I`PagePermissionDenied`)(
  "PagePermissionDenied",
  { id: DocumentsEntityIds.PageId, cause: S.optional(S.Defect) },
  $I.annotationsHttp("PagePermissionDenied", {
    status: 403,
    description: "Error when user lacks permission to perform action on a page.",
  })
) {}

/**
 * Error when attempting to modify an archived page.
 */
export class PageArchived extends S.TaggedError<PageArchived>($I`PageArchived`)(
  "PageArchived",
  { id: DocumentsEntityIds.PageId, cause: S.optional(S.Defect) },
  $I.annotationsHttp("PageArchived", {
    status: 400,
    description: "Error when attempting to modify an archived page.",
  })
) {}

/**
 * Error when attempting to modify a locked page.
 */
export class PageLocked extends S.TaggedError<PageLocked>($I`PageLocked`)(
  "PageLocked",
  { id: DocumentsEntityIds.PageId, cause: S.optional(S.Defect) },
  $I.annotationsHttp("PageLocked", {
    status: 423,
    description: "Error when attempting to modify a locked page.",
  })
) {}

/**
 * Error when attempting to create a circular parent-child relationship.
 */
export class PageCyclicNesting extends S.TaggedError<PageCyclicNesting>($I`PageCyclicNesting`)(
  "PageCyclicNesting",
  {
    id: DocumentsEntityIds.PageId,
    parentId: DocumentsEntityIds.PageId,
    cause: S.optional(S.Defect),
  },
  $I.annotationsHttp("PageCyclicNesting", {
    status: 400,
    description: "Error when attempting to create a circular parent-child relationship.",
  })
) {}

/**
 * Error when a share entry with the specified ID cannot be found.
 */
export class PageShareNotFound extends S.TaggedError<PageShareNotFound>($I`PageShareNotFound`)(
  "PageShareNotFound",
  {
    id: DocumentsEntityIds.PageShareId,
    cause: S.optional(S.Defect),
  },
  $I.annotationsHttp("PageShareNotFound", {
    status: 404,
    description: "Error when a share entry with the specified ID cannot be found.",
  })
) {}

/**
 * Union of all Page errors for RPC definitions.
 */
export class Any extends S.Union(
  PageNotFound,
  PagePermissionDenied,
  PageArchived,
  PageLocked,
  PageCyclicNesting,
  PageShareNotFound
).annotations(
  $I.annotations("Any", {
    description: "Union of all Page errors for RPC definitions.",
  })
) {}

export declare namespace Any {
  export type Type = typeof Any.Type;
  export type Encoded = typeof Any.Encoded;
}
