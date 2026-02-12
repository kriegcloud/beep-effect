import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Session/Session.errors");

export class SessionNotFoundError extends S.TaggedError<SessionNotFoundError>()(
  $I`SessionNotFoundError`,
  {
    id: SharedEntityIds.SessionId,
  },
  $I.annotationsHttp("SessionNotFoundError", {
    status: 404,
    description: "Error when a session with the specified ID cannot be found.",
  })
) {}

export class SessionPermissionDeniedError extends S.TaggedError<SessionPermissionDeniedError>()(
  $I`SessionPermissionDeniedError`,
  {
    id: SharedEntityIds.SessionId,
  },
  $I.annotationsHttp("SessionPermissionDeniedError", {
    status: 403,
    description: "Error when the user does not have permission to access the session.",
  })
) {}

export const Errors = S.Union(SessionNotFoundError, SessionPermissionDeniedError);
export type Errors = typeof Errors.Type;
