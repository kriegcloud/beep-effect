import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import * as Errors from "./document.errors";
import { Model } from "./document.model";

const $I = $DocumentsDomainId.create("entities/document/document.rpc");

/**
 * Search result schema for document search operations.
 */
export const SearchResult = S.Struct({
  ...Model.select.pick("id", "_rowId", "title", "content").fields,
  rank: S.Number,
}).annotations(
  $I.annotations("SearchResult", {
    description: "Document search result with title, content snippet, and ranking score",
  })
);

/**
 * RPC contract for Document entity operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Document - Retrieve a document by its unique identifier.
   */
  Rpc.make("get", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * List Documents by User - Stream all documents owned by a specific user.
   */
  Rpc.make("listByUser", {
    payload: {
      userId: SharedEntityIds.UserId,
      organizationId: SharedEntityIds.OrganizationId,
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * List Documents - Stream documents with pagination and optional filtering.
   */
  Rpc.make("list", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      parentDocumentId: S.optional(DocumentsEntityIds.DocumentId),
      search: S.optional(S.String),
      cursor: S.optional(DocumentsEntityIds.DocumentId),
      limit: S.optional(S.Int.pipe(S.positive())),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * List Trashed Documents - Stream all archived documents within an organization.
   */
  Rpc.make("Document.listTrash", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      search: S.optional(S.String),
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * List Child Documents - Stream all direct children of a parent document.
   */
  Rpc.make("listChildren", {
    payload: { parentDocumentId: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Search Documents - Full-text search across document titles and content.
   */
  Rpc.make("search", {
    payload: {
      query: S.String,
      organizationId: SharedEntityIds.OrganizationId,
      userId: S.optional(SharedEntityIds.UserId),
      includeArchived: S.optional(S.Boolean),
      limit: S.optional(S.Int.pipe(S.positive())),
      offset: S.optional(S.Int.pipe(S.nonNegative())),
    },
    success: SearchResult,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Document - Create a new document.
   */
  Rpc.make("create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      templateId: S.optional(S.String),
      parentDocumentId: S.optional(DocumentsEntityIds.DocumentId),
      title: S.optional(S.String.pipe(S.maxLength(500))),
      content: S.optional(S.String),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: S.Never,
  }),

  /**
   * Update Document - Update document content and settings.
   */
  Rpc.make("update", {
    payload: Model.update,
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * Archive Document - Move a document to trash.
   */
  Rpc.make("archive", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * Restore Document - Restore a document from trash.
   */
  Rpc.make("restore", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * Publish Document - Make a document publicly accessible.
   */
  Rpc.make("publish", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * Unpublish Document - Remove public access from a document.
   */
  Rpc.make("unpublish", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * Lock Document - Lock a document to prevent editing.
   */
  Rpc.make("lock", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * Unlock Document - Unlock a document to allow editing.
   */
  Rpc.make("unlock", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  }),

  /**
   * Delete Document - Permanently delete a document.
   */
  Rpc.make("delete", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: S.Void,
    error: Errors.DocumentNotFoundError,
  })
) {}
