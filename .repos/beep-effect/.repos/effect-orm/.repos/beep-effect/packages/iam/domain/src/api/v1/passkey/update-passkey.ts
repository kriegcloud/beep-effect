import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/update-passkey");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: S.String.annotations({ description: "The passkey ID to update" }),
    name: S.String.annotations({ description: "The new name for the passkey" }),
  },
  $I.annotations("UpdatePasskeyPayload", {
    description: "Payload for updating a passkey name.",
  })
) {}

export class Passkey extends S.Class<Passkey>($I`Passkey`)(
  {
    id: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Passkey ID",
    }),
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
    createdAt: S.optionalWith(S.Date, { nullable: true }).annotations({
      description: "Creation timestamp",
    }),
    aaguid: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Authenticator AAGUID",
    }),
  },
  $I.annotations("Passkey", {
    description: "A passkey credential.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    passkey: Passkey.annotations({ description: "Updated passkey" }),
  },
  $I.annotations("UpdatePasskeySuccess", {
    description: "Successful passkey update response.",
  })
) {}

export const Contract = HttpApiEndpoint.post("update-passkey", "/update-passkey")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to update the passkey.",
      })
    )
  )
  .addSuccess(Success);
