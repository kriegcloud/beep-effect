import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthRefreshToken/OAuthRefreshToken.errors");

export class OAuthRefreshTokenNotFoundError extends S.TaggedError<OAuthRefreshTokenNotFoundError>()(
  $I`OAuthRefreshTokenNotFoundError`,
  { id: IamEntityIds.OAuthRefreshTokenId },
  $I.annotationsHttp("OAuthRefreshTokenNotFoundError", {
    status: 404,
    description: "Error when an OAuth refresh token with the specified ID cannot be found.",
  })
) {}

export class OAuthRefreshTokenPermissionDeniedError extends S.TaggedError<OAuthRefreshTokenPermissionDeniedError>()(
  $I`OAuthRefreshTokenPermissionDeniedError`,
  { id: IamEntityIds.OAuthRefreshTokenId },
  $I.annotationsHttp("OAuthRefreshTokenPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the OAuth refresh token.",
  })
) {}

export const Errors = S.Union(OAuthRefreshTokenNotFoundError, OAuthRefreshTokenPermissionDeniedError);
export type Errors = typeof Errors.Type;
