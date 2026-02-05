import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { AccessLevel, PageType, ShareType } from "../../value-objects";
import { PageShare } from "../page-share";
import * as Errors from "./page.errors";
import { Model } from "./page.model";

const $I = $DocumentsDomainId.create("entities/page/page.rpc");

/**
 * Breadcrumb schema for page ancestry.
 */
export const Breadcrumb = S.Struct({
  id: DocumentsEntityIds.PageId,
  title: S.optional(S.String),
  icon: S.optional(S.String),
}).annotations(
  $I.annotations("Breadcrumb", {
    description: "Minimal page reference for breadcrumb navigation",
  })
);

/**
 * RPC contract for Page entity operations.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Page - Retrieve a page by its unique identifier.
   */
  Rpc.make("Page.get", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Model.json,
    error: S.Union(Errors.PageNotFoundError, Errors.PagePermissionDeniedError),
  }),

  /**
   * List Pages - Stream root pages for an organization.
   */
  Rpc.make("Page.list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      type: S.optional(PageType),
      search: S.optional(S.String),
      cursor: S.optional(DocumentsEntityIds.PageId),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * List Children - Stream direct child pages of a parent page.
   */
  Rpc.make("Page.listChildren", {
    payload: {
      parentId: DocumentsEntityIds.PageId,
      type: S.optional(PageType),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Get Breadcrumbs - Retrieve the full ancestry chain for a page.
   */
  Rpc.make("Page.breadcrumbs", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Breadcrumb,
    error: Errors.PageNotFoundError,
    stream: true,
  }),

  /**
   * List Trashed Pages - Stream all archived pages within an organization.
   */
  Rpc.make("Page.listTrash", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      search: S.optional(S.String),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Search Pages - Full-text search across page titles and content.
   */
  Rpc.make("Page.search", {
    payload: {
      query: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      type: S.optional(PageType),
      includeArchived: S.optional(S.Boolean),
      limit: S.optional(S.Int.pipe(S.positive())),
      offset: S.optional(S.Int.pipe(S.nonNegative())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Page - Create a new page.
   */
  Rpc.make("Page.create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      parentId: S.optional(DocumentsEntityIds.PageId),
      title: S.optional(S.String.pipe(S.maxLength(500))),
      type: S.optional(PageType),
      icon: S.optional(S.String),
      content: S.optional(S.String),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: S.Never,
  }),

  /**
   * Update Page - Update page content and settings.
   */
  Rpc.make("Page.update", {
    payload: Model.update,
    success: Model.json,
    error: S.Union(Errors.PageNotFoundError, Errors.PageLockedError),
  }),

  /**
   * Move Page - Reparent a page under a new parent (or to root).
   */
  Rpc.make("Page.move", {
    payload: {
      id: DocumentsEntityIds.PageId,
      parentId: S.optional(DocumentsEntityIds.PageId),
      position: S.optional(S.Number),
    },
    success: Model.json,
    error: S.Union(Errors.PageNotFoundError, Errors.PageCyclicNestingError),
  }),

  /**
   * Archive Page - Move a page (and descendants) to trash.
   */
  Rpc.make("Page.archive", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Model.json,
    error: Errors.PageNotFoundError,
  }),

  /**
   * Restore Page - Restore a page from trash.
   */
  Rpc.make("Page.restore", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Model.json,
    error: Errors.PageNotFoundError,
  }),

  /**
   * Publish Page - Make a page publicly accessible.
   */
  Rpc.make("Page.publish", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Model.json,
    error: Errors.PageNotFoundError,
  }),

  /**
   * Unpublish Page - Remove public access from a page.
   */
  Rpc.make("Page.unpublish", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Model.json,
    error: Errors.PageNotFoundError,
  }),

  /**
   * Lock Page - Lock a page to prevent editing.
   */
  Rpc.make("Page.lock", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Model.json,
    error: Errors.PageNotFoundError,
  }),

  /**
   * Unlock Page - Unlock a page to allow editing.
   */
  Rpc.make("Page.unlock", {
    payload: { id: DocumentsEntityIds.PageId },
    success: Model.json,
    error: Errors.PageNotFoundError,
  }),

  /**
   * Delete Page - Permanently delete a page and all descendants.
   */
  Rpc.make("Page.delete", {
    payload: { id: DocumentsEntityIds.PageId },
    success: S.Void,
    error: Errors.PageNotFoundError,
  }),

  /**
   * Share Page - Create or update a share entry for a page.
   */
  Rpc.make("Page.share", {
    payload: {
      pageId: DocumentsEntityIds.PageId,
      shareType: ShareType,
      granteeId: S.optional(S.String),
      accessLevel: S.optional(AccessLevel),
      expiresAt: S.optional(S.DateFromString),
    },
    success: PageShare.Model.json,
    error: S.Union(Errors.PageNotFoundError, Errors.PagePermissionDeniedError),
  }),

  /**
   * Revoke Share - Remove a share entry from a page.
   */
  Rpc.make("Page.revokeShare", {
    payload: { id: DocumentsEntityIds.PageShareId },
    success: S.Void,
    error: Errors.PageShareNotFoundError,
  }),

  /**
   * List Shares - Stream all share entries for a page.
   */
  Rpc.make("Page.listShares", {
    payload: { pageId: DocumentsEntityIds.PageId },
    success: PageShare.Model.json,
    error: Errors.PageNotFoundError,
    stream: true,
  })
) {}
