import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/TwoFactor/TwoFactor.errors");

export class TwoFactorNotFoundError extends S.TaggedError<TwoFactorNotFoundError>()(
  $I`TwoFactorNotFoundError`,
  { id: IamEntityIds.TwoFactorId },
  $I.annotationsHttp("TwoFactorNotFoundError", {
    status: 404,
    description: "Error when a two-factor with the specified ID cannot be found.",
  })
) {}

export class TwoFactorPermissionDeniedError extends S.TaggedError<TwoFactorPermissionDeniedError>()(
  $I`TwoFactorPermissionDeniedError`,
  { id: IamEntityIds.TwoFactorId },
  $I.annotationsHttp("TwoFactorPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the two-factor.",
  })
) {}

export const Errors = S.Union(TwoFactorNotFoundError, TwoFactorPermissionDeniedError);
export type Errors = typeof Errors.Type;
