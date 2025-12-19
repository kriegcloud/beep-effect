import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { Session } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/verify-authentication");

// WebAuthn response type - use Record to accept any JSON structure from the browser
const WebAuthnResponse = S.Record({ key: S.String, value: S.Unknown }).annotations({
  description: "WebAuthn authentication response JSON from browser",
});

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    response: WebAuthnResponse,
  },
  $I.annotations("VerifyAuthenticationPayload", {
    description: "Payload for verifying passkey authentication.",
  })
) {}

// Better Auth only returns session for verifyPasskeyAuthentication
export class Success extends S.Class<Success>($I`Success`)(
  {
    session: Session.Model.annotations({
      description: "Created session",
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
