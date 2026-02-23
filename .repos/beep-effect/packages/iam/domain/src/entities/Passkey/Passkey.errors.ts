import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Passkey/Passkey.errors");

export class PasskeyNotFoundError extends S.TaggedError<PasskeyNotFoundError>()(
  $I`PasskeyNotFoundError`,
  {
    id: IamEntityIds.PasskeyId,
  },
  $I.annotationsHttp("PasskeyNotFoundError", {
    status: 404,
    description: "Error when a passkey with the specified ID cannot be found.",
  })
) {}

export class PasskeyPermissionDeniedError extends S.TaggedError<PasskeyPermissionDeniedError>()(
  $I`PasskeyPermissionDeniedError`,
  {
    id: IamEntityIds.PasskeyId,
  },
  $I.annotationsHttp("PasskeyPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the passkey.",
  })
) {}

export const Errors = S.Union(PasskeyNotFoundError, PasskeyPermissionDeniedError);
export type Errors = typeof Errors.Type;
