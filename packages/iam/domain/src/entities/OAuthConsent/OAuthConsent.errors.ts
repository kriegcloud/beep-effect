import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OAuthConsent/OAuthConsent.errors");

export class OAuthConsentNotFoundError extends S.TaggedError<OAuthConsentNotFoundError>()(
  $I`OAuthConsentNotFoundError`,
  { id: IamEntityIds.OAuthConsentId },
  $I.annotationsHttp("OAuthConsentNotFoundError", {
    status: 404,
    description: "Error when an OAuth consent with the specified ID cannot be found.",
  })
) {}

export class OAuthConsentPermissionDeniedError extends S.TaggedError<OAuthConsentPermissionDeniedError>()(
  $I`OAuthConsentPermissionDeniedError`,
  { id: IamEntityIds.OAuthConsentId },
  $I.annotationsHttp("OAuthConsentPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the OAuth consent.",
  })
) {}

export const Errors = S.Union(OAuthConsentNotFoundError, OAuthConsentPermissionDeniedError);
export type Errors = typeof Errors.Type;
