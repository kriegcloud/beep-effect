import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/RateLimit/RateLimit.errors");

export class RateLimitNotFoundError extends S.TaggedError<RateLimitNotFoundError>()(
  $I`RateLimitNotFoundError`,
  {
    id: IamEntityIds.RateLimitId,
  },
  $I.annotationsHttp("RateLimitNotFoundError", {
    status: 404,
    description: "Error when a rate limit with the specified ID cannot be found.",
  })
) {}

export class RateLimitPermissionDeniedError extends S.TaggedError<RateLimitPermissionDeniedError>()(
  $I`RateLimitPermissionDeniedError`,
  {
    id: IamEntityIds.RateLimitId,
  },
  $I.annotationsHttp("RateLimitPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the rate limit.",
  })
) {}

export const Errors = S.Union(RateLimitNotFoundError, RateLimitPermissionDeniedError);
export type Errors = typeof Errors.Type;
