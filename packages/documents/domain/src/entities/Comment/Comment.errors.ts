import { DocumentsEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

/**
 * Error when a comment with the specified ID cannot be found.
 */
export class CommentNotFoundError extends S.TaggedError<CommentNotFoundError>(
  "@beep/documents-domain/entities/Comment/CommentNotFoundError"
)(
  "CommentNotFoundError",
  {
    id: DocumentsEntityIds.CommentId,
  },
  HttpApiSchema.annotations({ status: 404 })
) {}

/**
 * Error when user lacks permission to perform action on comment.
 */
export class CommentPermissionDeniedError extends S.TaggedError<CommentPermissionDeniedError>(
  "@beep/documents-domain/entities/Comment/CommentPermissionDeniedError"
)(
  "CommentPermissionDeniedError",
  {
    id: DocumentsEntityIds.CommentId,
  },
  HttpApiSchema.annotations({ status: 403 })
) {}

/**
 * Error when comment content exceeds maximum length.
 * Todox limit: 50,000 characters (50KB for rich content)
 */
export class CommentTooLongError extends S.TaggedError<CommentTooLongError>(
  "@beep/documents-domain/entities/Comment/CommentTooLongError"
)(
  "CommentTooLongError",
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
