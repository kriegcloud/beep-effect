/**
 * @fileoverview
 * Reset password contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for completing a phone-based password reset.
 *
 * @module @beep/iam-client/phone-number/reset-password/contract
 * @category PhoneNumber/ResetPassword
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("phone-number/reset-password");

/**
 * Payload for completing a password reset via phone number.
 *
 * @example
 * ```typescript
 * import { ResetPassword } from "@beep/iam-client/phone-number"
 * import * as Redacted from "effect/Redacted"
 *
 * const payload = ResetPassword.Payload.make({
 *   phoneNumber: "+1234567890",
 *   otp: "123456",
 *   newPassword: Redacted.make("newSecurePassword123")
 * })
 * ```
 *
 * @category PhoneNumber/ResetPassword/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    phoneNumber: BS.Phone,
    otp: S.Redacted(S.String),
    newPassword: BS.Password,
  },
  formValuesAnnotation({
    phoneNumber: "",
    otp: "",
    newPassword: "",
  })
) {}

/**
 * Success response indicating password was reset.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import * as Redacted from "effect/Redacted"
 * import { ResetPassword } from "@beep/iam-client/phone-number"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ResetPassword.Handler({
 *     phoneNumber: "+1234567890",
 *     otp: "123456",
 *     newPassword: Redacted.make("newSecurePassword123")
 *   })
 *   console.log(`Password reset: ${result.success}`)
 * })
 * ```
 *
 * @category PhoneNumber/ResetPassword/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response indicating password was reset via phone.",
  })
) {}

/**
 * Contract wrapper for reset password operations.
 *
 * @example
 * ```typescript
 * import { ResetPassword } from "@beep/iam-client/phone-number"
 *
 * const handler = ResetPassword.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category PhoneNumber/ResetPassword/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ResetPasswordPhone", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
