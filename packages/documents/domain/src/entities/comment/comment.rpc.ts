import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import * as Errors from "./comment.errors";
import { Model } from "./comment.model";

/**
 * RPC contract for Comment entity operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 */
export class Rpcs extends RpcGroup.make(
  /**
   * Get Comment - Retrieve a single comment by its unique identifier.
   */
  Rpc.make("get", {
    payload: {
      id: DocumentsEntityIds.CommentId,
    },
    success: Model.json,
    error: Errors.CommentNotFoundError,
  }),

  /**
   * List Comments by Discussion - Stream all comments belonging to a specific discussion.
   */
  Rpc.make("listByDiscussion", {
    payload: {
      discussionId: DocumentsEntityIds.DiscussionId,
    },
    success: Model.json,
    error: S.Never,
    stream: true,
  }),

  /**
   * Create Comment - Create a new comment within a discussion.
   */
  Rpc.make("create", {
    payload: {
      organizationId: SharedEntityIds.OrganizationId,
      discussionId: DocumentsEntityIds.DiscussionId,
      content: S.String,
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: S.Never,
  }),

  /**
   * Update Comment - Update an existing comment's content.
   */
  Rpc.make("update", {
    payload: {
      id: DocumentsEntityIds.CommentId,
      content: S.optional(S.String),
      contentRich: S.optional(S.Unknown),
    },
    success: Model.json,
    error: Errors.CommentNotFoundError,
  }),

  /**
   * Delete Comment - Permanently delete a comment.
   */
  Rpc.make("delete", {
    payload: {
      id: DocumentsEntityIds.CommentId,
    },
    success: S.Void,
    error: Errors.CommentNotFoundError,
  })
) {}
