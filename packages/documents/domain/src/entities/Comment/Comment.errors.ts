import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Comment/Comment.errors");

/**
 * Error when a comment with the specified ID cannot be found.
 */
export class CommentNotFoundError extends S.TaggedError<CommentNotFoundError>()(
  $I`CommentNotFoundError`,
  {
    id: DocumentsEntityIds.CommentId,
  },
  HttpApiSchema.annotations({ status: 404 })
) {}

/**
 * Error when user lacks permission to perform action on comment.
 */
export class CommentPermissionDeniedError extends S.TaggedError<CommentPermissionDeniedError>()(
  $I`CommentPermissionDeniedError`,
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotations("CommentPermissionDeniedError", {
    description: "Thrown when the user lacks permission to perform the requested action on the comment.",
  })
) {}

/**
 * Error when comment content exceeds maximum length.
 * Todox limit: 50,000 characters (50KB for rich content)
 */
export class CommentTooLongError extends S.TaggedError<CommentTooLongError>()(
  $I`CommentTooLongError`,
  {
    length: S.Int,
    maxLength: S.Int,
  },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Union of all Comment errors for RPC definitions.
 */
export const Errors = S.Union(CommentNotFoundError, CommentPermissionDeniedError, CommentTooLongError);

export type Errors = typeof Errors.Type;
