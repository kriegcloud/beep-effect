import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export const $I = $IamDomainId.create("api/v1/core/revoke-other-sessions");

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean.annotations({
      description: "Indicates if all other sessions were revoked successfully.",
    }),
  },
  $I.annotations("RevokeOtherSessionsSuccess", {
    description: "Success response after revoking all other sessions.",
  })
) {}

export const Contract = HttpApiEndpoint.post("revokeOtherSessions", "/revoke-other-sessions")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
