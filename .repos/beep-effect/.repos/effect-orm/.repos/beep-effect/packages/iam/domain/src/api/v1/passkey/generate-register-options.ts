import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/generate-register-options");

export class Success extends S.Class<Success>($I`Success`)(
  {
    challenge: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "WebAuthn challenge string",
    }),
    rp: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Relying Party information",
    }),
    user: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "User information for passkey",
    }),
    pubKeyCredParams: S.optionalWith(S.Array(S.Unknown), { nullable: true }).annotations({
      description: "Public key credential parameters",
    }),
    timeout: S.optionalWith(S.Number, { nullable: true }).annotations({
      description: "Timeout in milliseconds",
    }),
    excludeCredentials: S.optionalWith(S.Array(S.Unknown), { nullable: true }).annotations({
      description: "Credentials to exclude from registration",
    }),
    authenticatorSelection: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "Authenticator selection criteria",
    }),
    attestation: S.optionalWith(S.String, { nullable: true }).annotations({
      description: "Attestation conveyance preference",
    }),
    extensions: S.optionalWith(S.Unknown, { nullable: true }).annotations({
      description: "WebAuthn extensions",
    }),
  },
  $I.annotations("GenerateRegisterOptionsSuccess", {
    description: "WebAuthn registration options.",
  })
) {}

export const Contract = HttpApiEndpoint.get("generate-register-options", "/generate-register-options")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to generate registration options.",
      })
    )
  );
