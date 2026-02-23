import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/verify-registration");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    response: S.String.annotations({
      description: "JSON-stringified WebAuthn registration response from browser",
    }),
    name: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Optional name for the passkey",
    }),
  },
  $I.annotations("VerifyRegistrationPayload", {
    description: "Payload for verifying passkey registration.",
  })
) {}

// Better Auth returns Passkey directly (not wrapped in an object)
export const Success = S.Struct({
  id: S.String.annotations({ description: "Passkey ID" }),
  name: S.optionalWith(S.String, { nullable: true }).annotations({
    description: "Passkey name",
  }),
  publicKey: S.String.annotations({ description: "Public key" }),
  userId: S.String.annotations({ description: "User ID" }),
  credentialID: S.String.annotations({ description: "Credential ID" }),
  counter: S.Number.annotations({ description: "Signature counter" }),
  deviceType: S.String.annotations({ description: "Device type" }),
  backedUp: S.Boolean.annotations({ description: "Backup eligibility" }),
  transports: S.optionalWith(S.String, { nullable: true }).annotations({
    description: "Available transports",
  }),
  createdAt: S.Date.annotations({ description: "Creation timestamp" }),
  aaguid: S.optionalWith(S.String, { nullable: true }).annotations({
    description: "Authenticator AAGUID",
  }),
}).annotations(
  $I.annotations("VerifyRegistrationSuccess", {
    description: "Successful passkey registration verification.",
  })
);

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
