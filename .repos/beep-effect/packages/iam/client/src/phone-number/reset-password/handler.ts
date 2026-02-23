/**
 * @fileoverview
 * Reset password handler implementation.
 *
 * Implements the reset password contract using Better Auth's phone number client.
 *
 * @module @beep/iam-client/phone-number/reset-password/handler
 * @category PhoneNumber/ResetPassword
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Reset password handler that completes a phone-based password reset.
 *
 * Calls Better Auth's phoneNumber.resetPassword method and validates the response.
 * Does not mutate session state.
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
 * @category PhoneNumber/ResetPassword/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.phoneNumber.resetPassword(encodedPayload))
);
