import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/reset-password");

/**
 * Payload for resetting a user's password using a reset token.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The new password to set for the user.
     */
    newPassword: CommonFields.UserPassword.annotations({
      description: "The new password to set for the user.",
    }),

    /**
     * The password reset token received via email.
     */
    token: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The password reset token received via email.",
    }),
  },
  $I.annotations("ResetPasswordPayload", {
    description: "Payload for resetting a user's password using a reset token.",
  })
) {}

/**
 * Success response after resetting a user's password.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Indicates whether the password reset was successful.
     */
    status: S.Boolean.annotations({
      description: "Indicates whether the password reset was successful.",
    }),
  },
  $I.annotations("ResetPasswordSuccess", {
    description: "Success response after resetting a user's password.",
  })
) {}

/**
 * Reset password endpoint contract.
 *
 * POST /reset-password
 *
 * Resets a user's password using a token from the password reset email.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("resetPassword", "/reset-password")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to reset password.",
      })
    )
  )
  .addSuccess(Success);
