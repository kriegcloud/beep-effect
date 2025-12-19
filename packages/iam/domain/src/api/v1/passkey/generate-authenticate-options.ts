import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/passkey/generate-authenticate-options");

export class Success extends S.Class<Success>($I`Success`)(
  {
    challenge: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "WebAuthn challenge string",
    }),
    timeout: S.optionalWith(S.Number, { as: "Option", exact: true }).annotations({
      description: "Timeout in milliseconds",
    }),
    rpId: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Relying Party ID",
    }),
    userVerification: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "User verification requirement",
    }),
    allowCredentials: S.optionalWith(S.Array(S.Unknown), { as: "Option", exact: true }).annotations({
      description: "Allowed credentials for authentication",
    }),
    authenticatorSelection: S.optionalWith(S.Unknown, { as: "Option", exact: true }).annotations({
      description: "Authenticator selection criteria",
    }),
    extensions: S.optionalWith(S.Unknown, { as: "Option", exact: true }).annotations({
      description: "WebAuthn extensions",
    }),
  },
  $I.annotations("GenerateAuthenticateOptionsSuccess", {
    description: "WebAuthn authentication options.",
  })
) {}

export const Contract = HttpApiEndpoint.get("generate-authenticate-options", "/generate-authenticate-options")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to generate authentication options.",
      })
    )
  );
