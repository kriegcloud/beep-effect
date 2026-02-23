import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/ScimProvider/ScimProvider.errors");

export class ScimProviderNotFoundError extends S.TaggedError<ScimProviderNotFoundError>()(
  $I`ScimProviderNotFoundError`,
  {
    id: IamEntityIds.ScimProviderId,
  },
  $I.annotationsHttp("ScimProviderNotFoundError", {
    status: 404,
    description: "Error when a SCIM provider with the specified ID cannot be found.",
  })
) {}

export class ScimProviderPermissionDeniedError extends S.TaggedError<ScimProviderPermissionDeniedError>()(
  $I`ScimProviderPermissionDeniedError`,
  {
    id: IamEntityIds.ScimProviderId,
  },
  $I.annotationsHttp("ScimProviderPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the SCIM provider.",
  })
) {}

export const Errors = S.Union(ScimProviderNotFoundError, ScimProviderPermissionDeniedError);
export type Errors = typeof Errors.Type;
