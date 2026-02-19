import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthClient/OAuthClient.errors");

export class OAuthClientNotFoundError extends S.TaggedError<OAuthClientNotFoundError>()(
  $I`OAuthClientNotFoundError`,
  {
    id: IamEntityIds.OAuthClientId,
  },
  $I.annotationsHttp("OAuthClientNotFoundError", {
    status: 404,
    description: "Error when an OAuth client with the specified ID cannot be found.",
  })
) {}

export class OAuthClientPermissionDeniedError extends S.TaggedError<OAuthClientPermissionDeniedError>()(
  $I`OAuthClientPermissionDeniedError`,
  {
    id: IamEntityIds.OAuthClientId,
  },
  $I.annotationsHttp("OAuthClientPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the OAuth client.",
  })
) {}

export const Errors = S.Union(OAuthClientNotFoundError, OAuthClientPermissionDeniedError);
export type Errors = typeof Errors.Type;
