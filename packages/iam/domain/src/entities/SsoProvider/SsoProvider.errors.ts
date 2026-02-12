import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/SsoProvider/SsoProvider.errors");

export class SsoProviderNotFoundError extends S.TaggedError<SsoProviderNotFoundError>()(
  $I`SsoProviderNotFoundError`,
  { id: IamEntityIds.SsoProviderId },
  $I.annotationsHttp("SsoProviderNotFoundError", {
    status: 404,
    description: "Error when an SSO provider with the specified ID cannot be found.",
  })
) {}

export class SsoProviderPermissionDeniedError extends S.TaggedError<SsoProviderPermissionDeniedError>()(
  $I`SsoProviderPermissionDeniedError`,
  { id: IamEntityIds.SsoProviderId },
  $I.annotationsHttp("SsoProviderPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the SSO provider.",
  })
) {}

export const Errors = S.Union(SsoProviderNotFoundError, SsoProviderPermissionDeniedError);
export type Errors = typeof Errors.Type;
