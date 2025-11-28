import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { TextStyle } from "../../value-objects/TextStyle.ts";
import * as Errors from "./Document.errors.ts";
import { Model } from "./Document.model.ts";

/**
 * Search result schema for document search operations.
 */
export const SearchResult = S.Struct({
  id: KnowledgeManagementEntityIds.DocumentId,
  title: S.NullOr(S.String),
  content: S.NullOr(S.String),
  rank: S.Number,
});

/**
 * RPC contract for Document entity operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Document - Retrieve a document by its unique identifier.
   */
  Rpc.make("get", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
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
      parentDocumentId: S.optional(KnowledgeManagementEntityIds.DocumentId),
      search: S.optional(S.String),
      cursor: S.optional(KnowledgeManagementEntityIds.DocumentId),
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
    payload: { parentDocumentId: KnowledgeManagementEntityIds.DocumentId },
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
      parentDocumentId: S.optional(KnowledgeManagementEntityIds.DocumentId),
      title: S.optional(S.String.pipe(S.maxLength(500))),
      content: S.optional(S.String),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Update Document - Update document content and settings.
   */
  Rpc.make("update", {
    payload: {
      id: KnowledgeManagementEntityIds.DocumentId,
      // Content fields
      title: S.optional(S.String.pipe(S.maxLength(256))),
      content: S.optional(S.String.pipe(S.maxLength(1_000_000))),
      contentRich: S.optional(S.Unknown),
      yjsSnapshot: S.optional(S.Uint8ArrayFromBase64),
      // Display settings
      coverImage: S.optional(S.NullOr(S.String.pipe(S.maxLength(500)))),
      icon: S.optional(S.NullOr(S.String.pipe(S.maxLength(100)))),
      fullWidth: S.optional(S.Boolean),
      smallText: S.optional(S.Boolean),
      textStyle: S.optional(TextStyle),
      toc: S.optional(S.Boolean),
      // State flags
      lockPage: S.optional(S.Boolean),
      isPublished: S.optional(S.Boolean),
    },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Archive Document - Move a document to trash.
   */
  Rpc.make("archive", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Restore Document - Restore a document from trash.
   */
  Rpc.make("restore", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Publish Document - Make a document publicly accessible.
   */
  Rpc.make("publish", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Unpublish Document - Remove public access from a document.
   */
  Rpc.make("unpublish", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Lock Document - Lock a document to prevent editing.
   */
  Rpc.make("lock", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Unlock Document - Unlock a document to allow editing.
   */
  Rpc.make("unlock", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Delete Document - Permanently delete a document.
   */
  Rpc.make("delete", {
    payload: { id: KnowledgeManagementEntityIds.DocumentId },
    success: S.Void,
    error: Errors.DocumentNotFoundError,
  })
) {}
