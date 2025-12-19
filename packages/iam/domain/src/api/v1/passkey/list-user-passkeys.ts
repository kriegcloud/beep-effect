import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/list-user-passkeys");

export class PasskeyItem extends S.Class<PasskeyItem>($I`PasskeyItem`)(
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
  $I.annotations("PasskeyItem", {
    description: "A passkey credential item.",
  })
) {}

// Better Auth returns Passkey[] directly, so our Success type is just the array
export const Success = S.Array(PasskeyItem).annotations(
  $I.annotations("ListUserPasskeysSuccess", {
    description: "Successful passkey list response.",
  })
);

export const Contract = HttpApiEndpoint.get("list-user-passkeys", "/list-user-passkeys")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to list passkeys.",
      })
    )
  );
