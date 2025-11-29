import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import * as Comment from "../Comment";
import * as Errors from "./Discussion.errors.ts";
import { Model } from "./Discussion.model.ts";

// Validation constants (from Todox)
const MAX_DOCUMENT_CONTENT_LENGTH = 1000;

/**
 * Schema for discussion with nested comments (matches Todox discussions query response)
 */
export const DiscussionWithComments = S.Struct({
  ...Model.json.fields,
  user: User.Model.select.pick("image", "name", "id", "_rowId"),
  comments: S.Array(
    S.Struct({
      user: User.Model.select.pick("image", "name", "id", "_rowId"),
      ...Comment.Model.select.pick("id", "_rowId", "contentRich", "createdAt", "discussionId", "isEdited", "updatedAt")
        .fields,
    })
  ),
});

/**
 * RPC contract for Discussion entity operations.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Discussion - Retrieve a discussion with all its comments and user information.
   */
  Rpc.make("get", {
    payload: { id: DocumentsEntityIds.DiscussionId },
    success: DiscussionWithComments,
    error: Errors.DiscussionNotFoundError,
  }),

  /**
   * List Discussions by Document - Stream all discussions for a document.
   */
  Rpc.make("listByDocument", {
    payload: { documentId: DocumentsEntityIds.DocumentId },
    success: DiscussionWithComments,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Discussion - Create a new discussion on a document without an initial comment.
   */
  Rpc.make("create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      documentId: DocumentsEntityIds.DocumentId,
      documentContent: S.String.pipe(S.minLength(1), S.maxLength(MAX_DOCUMENT_CONTENT_LENGTH)),
    },
    success: S.Struct({ id: DocumentsEntityIds.DiscussionId }),
    error: Errors.Errors,
  }),

  /**
   * Create Discussion with Comment - Atomically create a discussion with an initial comment.
   */
  Rpc.make("createWithComment", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      documentId: DocumentsEntityIds.DocumentId,
      documentContent: S.String.pipe(S.minLength(1), S.maxLength(MAX_DOCUMENT_CONTENT_LENGTH)),
      contentRich: S.optional(S.Array(S.Unknown)),
      discussionId: S.optional(DocumentsEntityIds.DiscussionId),
    },
    success: S.Struct({ id: DocumentsEntityIds.DiscussionId }),
    error: Errors.Errors,
  }),

  /**
   * Resolve Discussion - Mark a discussion as resolved.
   */
  Rpc.make("resolve", {
    payload: { id: DocumentsEntityIds.DiscussionId },
    success: Model.json,
    error: Errors.Errors,
  }),

  /**
   * Delete Discussion - Permanently delete a discussion and all its comments.
   */
  Rpc.make("delete", {
    payload: { id: DocumentsEntityIds.DiscussionId },
    success: S.Void,
    error: Errors.DiscussionNotFoundError,
  })
) {}
