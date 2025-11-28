import { DocumentsEntityIds } from "@beep/shared-domain";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

/**
 * Error when a discussion with the specified ID cannot be found.
 */
export class DiscussionNotFoundError extends S.TaggedError<DiscussionNotFoundError>(
  "@beep/documents-domain/entities/Discussion/DiscussionNotFoundError"
)("DiscussionNotFoundError", { id: DocumentsEntityIds.DiscussionId }, HttpApiSchema.annotations({ status: 404 })) {}

/**
 * Error when user lacks permission to perform action on discussion.
 */
export class DiscussionPermissionDeniedError extends S.TaggedError<DiscussionPermissionDeniedError>(
  "@beep/documents-domain/entities/Discussion/DiscussionPermissionDeniedError"
)(
  "DiscussionPermissionDeniedError",
  { id: DocumentsEntityIds.DiscussionId },
  HttpApiSchema.annotations({ status: 403 })
) {}

/**
 * Error when attempting to resolve an already resolved discussion.
 */
export class DiscussionAlreadyResolvedError extends S.TaggedError<DiscussionAlreadyResolvedError>(
  "@beep/documents-domain/entities/Discussion/DiscussionAlreadyResolvedError"
)(
  "DiscussionAlreadyResolvedError",
  { id: DocumentsEntityIds.DiscussionId },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Error when attempting to unresolve a discussion that is not resolved.
 */
export class DiscussionNotResolvedError extends S.TaggedError<DiscussionNotResolvedError>(
  "@beep/documents-domain/entities/Discussion/DiscussionNotResolvedError"
)("DiscussionNotResolvedError", { id: DocumentsEntityIds.DiscussionId }, HttpApiSchema.annotations({ status: 400 })) {}

/**
 * Union of all Discussion errors for RPC definitions.
 */
export const Errors = S.Union(
  DiscussionNotFoundError,
  DiscussionPermissionDeniedError,
  DiscussionAlreadyResolvedError,
  DiscussionNotResolvedError
);

export type Errors = typeof Errors.Type;
