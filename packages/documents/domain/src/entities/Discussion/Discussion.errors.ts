import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Discussion/Discussion.errors");

export class DiscussionNotFoundError extends S.TaggedError<DiscussionNotFoundError>()(
  $I`DiscussionNotFoundError`,
  {
    id: DocumentsEntityIds.DiscussionId,
  },
  $I.annotationsHttp("DiscussionNotFoundError", {
    status: 404,
    description: "Error when a discussion with the specified ID cannot be found.",
  })
) {}

export class DiscussionPermissionDeniedError extends S.TaggedError<DiscussionPermissionDeniedError>()(
  $I`DiscussionPermissionDeniedError`,
  {
    id: DocumentsEntityIds.DiscussionId,
  },
  $I.annotationsHttp("DiscussionPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the discussion.",
  })
) {}

export class DiscussionAlreadyResolvedError extends S.TaggedError<DiscussionAlreadyResolvedError>()(
  $I`DiscussionAlreadyResolvedError`,
  {
    id: DocumentsEntityIds.DiscussionId,
  },
  $I.annotationsHttp("DiscussionAlreadyResolvedError", {
    status: 400,
    description: "Error when attempting to resolve an already resolved discussion.",
  })
) {}

export class DiscussionNotResolvedError extends S.TaggedError<DiscussionNotResolvedError>()(
  $I`DiscussionNotResolvedError`,
  {
    id: DocumentsEntityIds.DiscussionId,
  },
  $I.annotationsHttp("DiscussionNotResolvedError", {
    status: 400,
    description: "Error when attempting to unresolve a discussion that is not resolved.",
  })
) {}

export const Errors = S.Union(
  DiscussionNotFoundError,
  DiscussionPermissionDeniedError,
  DiscussionAlreadyResolvedError,
  DiscussionNotResolvedError
);

export type Errors = typeof Errors.Type;
