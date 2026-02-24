import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthAccessToken/OAuthAccessToken.errors");

export class OAuthAccessTokenNotFoundError extends S.TaggedError<OAuthAccessTokenNotFoundError>()(
  $I`OAuthAccessTokenNotFoundError`,
  {
    id: IamEntityIds.OAuthAccessTokenId,
  },
  $I.annotationsHttp("OAuthAccessTokenNotFoundError", {
    status: 404,
    description: "Error when an OAuth access token with the specified ID cannot be found.",
  })
) {}

export class OAuthAccessTokenPermissionDeniedError extends S.TaggedError<OAuthAccessTokenPermissionDeniedError>()(
  $I`OAuthAccessTokenPermissionDeniedError`,
  {
    id: IamEntityIds.OAuthAccessTokenId,
  },
  $I.annotationsHttp("OAuthAccessTokenPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the OAuth access token.",
  })
) {}

export const Errors = S.Union(OAuthAccessTokenNotFoundError, OAuthAccessTokenPermissionDeniedError);
export type Errors = typeof Errors.Type;
