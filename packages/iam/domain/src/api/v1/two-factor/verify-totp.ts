import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/verify-totp");

/**
 * Payload for verifying a TOTP code.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The TOTP code to verify.
     */
    code: S.String.annotations({
      description: "The TOTP code to verify.",
    }),

    /**
     * Whether to trust this device and skip 2FA in future.
     */
    trustDevice: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether to trust this device and skip 2FA in future.",
    }),
  },
  $I.annotations("TwoFactorVerifyTotpPayload", {
    description: "Payload for verifying a TOTP code.",
  })
) {}

/**
 * Success response after verifying a TOTP code.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Status indicating success.
     */
    status: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Status indicating success.",
    }),
  },
  $I.annotations("TwoFactorVerifyTotpSuccess", {
    description: "Success response after verifying a TOTP code.",
  })
) {}

/**
 * Verify TOTP endpoint contract.
 *
 * POST /two-factor/verify-totp
 *
 * Verifies a TOTP code for two-factor authentication.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("verify-totp", "/verify-totp")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to verify TOTP.",
      })
    )
  )
  .addSuccess(Success);
