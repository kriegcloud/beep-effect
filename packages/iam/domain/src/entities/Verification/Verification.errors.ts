import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Verification/Verification.errors");

export class VerificationNotFoundError extends S.TaggedError<VerificationNotFoundError>()(
  $I`VerificationNotFoundError`,
  { id: IamEntityIds.VerificationId },
  $I.annotationsHttp("VerificationNotFoundError", {
    status: 404,
    description: "Error when a verification with the specified ID cannot be found.",
  })
) {}

export class VerificationPermissionDeniedError extends S.TaggedError<VerificationPermissionDeniedError>()(
  $I`VerificationPermissionDeniedError`,
  { id: IamEntityIds.VerificationId },
  $I.annotationsHttp("VerificationPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the verification.",
  })
) {}

export const Errors = S.Union(VerificationNotFoundError, VerificationPermissionDeniedError);
export type Errors = typeof Errors.Type;
