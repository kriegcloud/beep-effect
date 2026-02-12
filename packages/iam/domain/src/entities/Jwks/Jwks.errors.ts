import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Jwks/Jwks.errors");

export class JwksNotFoundError extends S.TaggedError<JwksNotFoundError>()(
  $I`JwksNotFoundError`,
  {
    id: IamEntityIds.JwksId,
  },
  $I.annotationsHttp("JwksNotFoundError", {
    status: 404,
    description: "Error when a JWKS with the specified ID cannot be found.",
  })
) {}

export class JwksPermissionDeniedError extends S.TaggedError<JwksPermissionDeniedError>()(
  $I`JwksPermissionDeniedError`,
  {
    id: IamEntityIds.JwksId,
  },
  $I.annotationsHttp("JwksPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the JWKS.",
  })
) {}

export const Errors = S.Union(JwksNotFoundError, JwksPermissionDeniedError);
export type Errors = typeof Errors.Type;
