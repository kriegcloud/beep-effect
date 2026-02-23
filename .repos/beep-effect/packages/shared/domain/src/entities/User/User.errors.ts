import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/User/User.errors");

export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  $I`UserNotFoundError`,
  {
    id: SharedEntityIds.UserId,
  },
  $I.annotationsHttp("UserNotFoundError", {
    status: 404,
    description: "Error when a user with the specified ID cannot be found.",
  })
) {}

export class UserPermissionDeniedError extends S.TaggedError<UserPermissionDeniedError>()(
  $I`UserPermissionDeniedError`,
  {
    id: SharedEntityIds.UserId,
  },
  $I.annotationsHttp("UserPermissionDeniedError", {
    status: 403,
    description: "Error when the user does not have permission to access the requested user.",
  })
) {}

export const Errors = S.Union(UserNotFoundError, UserPermissionDeniedError);
export type Errors = typeof Errors.Type;
