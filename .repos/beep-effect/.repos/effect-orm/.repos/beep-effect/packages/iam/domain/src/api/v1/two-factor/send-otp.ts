import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/two-factor/send-otp");

/**
 * Success response after sending OTP.
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
  $I.annotations("TwoFactorSendOtpSuccess", {
    description: "Success response after sending OTP.",
  })
) {}

/**
 * Send OTP endpoint contract.
 *
 * POST /two-factor/send-otp
 *
 * Sends a one-time password to the authenticated user.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("send-otp", "/send-otp")
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to send OTP.",
      })
    )
  )
  .addSuccess(Success);
