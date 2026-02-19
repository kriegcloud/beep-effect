import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/get-totp-uri");

/**
 * Payload for getting TOTP URI.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The user's password for verification.
     */
    password: CommonFields.UserPassword.annotations({
      description: "The user's password for verification.",
    }),
  },
  $I.annotations("TwoFactorGetTotpUriPayload", {
    description: "Payload for getting TOTP URI.",
  })
) {}

/**
 * Success response after getting TOTP URI.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * TOTP URI for QR code generation.
     */
    totpURI: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "TOTP URI for QR code generation.",
    }),
  },
  $I.annotations("TwoFactorGetTotpUriSuccess", {
    description: "Success response after getting TOTP URI.",
  })
) {}

/**
 * Get TOTP URI endpoint contract.
 *
 * POST /two-factor/get-totp-uri
 *
 * Retrieves the TOTP URI for the authenticated user.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("get-totp-uri", "/get-totp-uri")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to get TOTP URI.",
      })
    )
  )
  .addSuccess(Success);
