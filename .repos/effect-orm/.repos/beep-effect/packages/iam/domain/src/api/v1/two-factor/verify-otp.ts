import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/verify-otp");

/**
 * Payload for verifying an OTP.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The OTP code to verify.
     */
    code: S.String.annotations({
      description: "The OTP code to verify.",
    }),

    /**
     * Whether to trust this device and skip 2FA in future.
     */
    trustDevice: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
      description: "Whether to trust this device and skip 2FA in future.",
    }),
  },
  $I.annotations("TwoFactorVerifyOtpPayload", {
    description: "Payload for verifying an OTP.",
  })
) {}

/**
 * Success response after verifying an OTP.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The verification token.
     */
    token: S.String.annotations({
      description: "The verification token.",
    }),

    /**
     * The authenticated user.
     */
    user: User.Model,
  },
  $I.annotations("TwoFactorVerifyOtpSuccess", {
    description: "Success response after verifying an OTP.",
  })
) {}

/**
 * Verify OTP endpoint contract.
 *
 * POST /two-factor/verify-otp
 *
 * Verifies an OTP code and returns a token.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("verify-otp", "/verify-otp")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to verify OTP.",
      })
    )
  )
  .addSuccess(Success);
