import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Session, User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/verify-authentication");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    response: S.String.annotations({
      description: "JSON-stringified WebAuthn authentication response from browser",
    }),
  },
  $I.annotations("VerifyAuthenticationPayload", {
    description: "Payload for verifying passkey authentication.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    session: Session.Model.annotations({
      description: "Created session",
    }),
    user: User.Model.annotations({
      description: "Authenticated user",
    }),
  },
  $I.annotations("VerifyAuthenticationSuccess", {
    description: "Successful passkey authentication verification.",
  })
) {}

export const Contract = HttpApiEndpoint.post("verify-authentication", "/verify-authentication")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to verify authentication.",
      })
    )
  )
  .addSuccess(Success);
