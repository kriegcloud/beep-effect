/**
 * Comment error schemas.
 *
 * These are "boundary-safe" errors: they are designed to survive serialization and cross
 * RPC/HTTP layers as tagged, documented failures.
 *
 * @module documents-domain/entities/Comment/Comment.errors
 * @since 1.0.0
 * @category errors
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Comment/Comment.errors");

/**
 * Error when a comment with the specified ID cannot be found.
 *
 * @since 1.0.0
 * @category errors
 */
export class CommentNotFoundError extends S.TaggedError<CommentNotFoundError>()(
  $I`CommentNotFoundError`,
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotationsHttp("CommentNotFoundError", {
    status: 404,
    description: "Error when a comment with the specified ID cannot be found.",
  })
) {}

/**
 * Error when user lacks permission to perform action on comment.
 *
 * @since 1.0.0
 * @category errors
 */
export class CommentPermissionDeniedError extends S.TaggedError<CommentPermissionDeniedError>()(
  $I`CommentPermissionDeniedError`,
  {
    id: DocumentsEntityIds.CommentId,
  },
  $I.annotationsHttp("CommentPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the comment.",
  })
) {}

/**
 * Error when comment content exceeds maximum length.
 *
 * TODO: Enforce a content length limit (and document the chosen maximum).
 *
 * @since 1.0.0
 * @category errors
 */
export class CommentTooLongError extends S.TaggedError<CommentTooLongError>()(
  $I`CommentTooLongError`,
  {
    length: S.Int,
    maxLength: S.Int,
  },
  $I.annotationsHttp("CommentTooLongError", {
    status: 400,
    description: "Error when comment content exceeds maximum length.",
  })
) {}

/**
 * Union of all Comment errors for RPC definitions.
 *
 * @since 1.0.0
 * @category errors
 */
export const Errors = S.Union(CommentNotFoundError, CommentPermissionDeniedError, CommentTooLongError);

/**
 * Convenience type for the `Errors` union.
 *
 * @since 1.0.0
 * @category errors
 */
export type Errors = typeof Errors.Type;
