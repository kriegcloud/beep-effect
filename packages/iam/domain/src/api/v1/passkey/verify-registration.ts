import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/verify-registration");

// WebAuthn response type - use Record to accept any JSON structure from the browser
const WebAuthnResponse = S.Record({ key: S.String, value: S.Unknown }).annotations({
  description: "WebAuthn registration response JSON from browser",
});

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    response: WebAuthnResponse,
    name: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Optional name for the passkey",
    }),
  },
  $I.annotations("VerifyRegistrationPayload", {
    description: "Payload for verifying passkey registration.",
  })
) {}

export class Passkey extends S.Class<Passkey>($I`Passkey`)(
  {
    id: S.String.annotations({ description: "Passkey ID" }),
    name: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Passkey name",
    }),
    publicKey: S.String.annotations({ description: "Public key" }),
    userId: S.String.annotations({ description: "User ID" }),
    credentialID: S.String.annotations({ description: "Credential ID" }),
    counter: S.Number.annotations({ description: "Signature counter" }),
    deviceType: S.String.annotations({ description: "Device type" }),
    backedUp: S.Boolean.annotations({ description: "Backup eligibility" }),
    transports: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Available transports",
    }),
    createdAt: S.Date.annotations({ description: "Creation timestamp" }),
    aaguid: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Authenticator AAGUID",
    }),
  },
  $I.annotations("Passkey", {
    description: "A passkey credential.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    passkey: S.optionalWith(Passkey, { as: "Option", exact: true }).annotations({
      description: "Registered passkey",
    }),
  },
  $I.annotations("VerifyRegistrationSuccess", {
    description: "Successful passkey registration verification.",
  })
) {}

export const Contract = HttpApiEndpoint.post("verify-registration", "/verify-registration")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to verify registration.",
      })
    )
  )
  .addSuccess(Success);
