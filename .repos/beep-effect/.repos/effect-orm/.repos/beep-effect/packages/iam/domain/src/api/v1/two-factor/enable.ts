import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/enable");

/**
 * Payload for enabling two-factor authentication.
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

    /**
     * Optional issuer name for TOTP URI.
     */
    issuer: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Optional issuer name for TOTP URI.",
    }),
  },
  $I.annotations("TwoFactorEnablePayload", {
    description: "Payload for enabling two-factor authentication.",
  })
) {}

/**
 * Success response after enabling two-factor authentication.
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

    /**
     * Backup codes for account recovery.
     */
    backupCodes: S.optionalWith(S.Array(S.String), { as: "Option", exact: true }).annotations({
      description: "Backup codes for account recovery.",
    }),
  },
  $I.annotations("TwoFactorEnableSuccess", {
    description: "Success response after enabling two-factor authentication.",
  })
) {}

/**
 * Enable two-factor authentication endpoint contract.
 *
 * POST /two-factor/enable
 *
 * Enables two-factor authentication for the authenticated user.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("enable", "/enable")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to enable two-factor authentication.",
      })
    )
  )
  .addSuccess(Success);
