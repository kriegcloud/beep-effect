/**
 * @fileoverview
 * Request password reset contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for requesting a phone-based password reset.
 *
 * @module @beep/iam-client/phone-number/request-password-reset/contract
 * @category PhoneNumber/RequestPasswordReset
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("phone-number/request-password-reset");

/**
 * Payload for requesting a password reset via phone number.
 *
 * @example
 * ```typescript
 * import { RequestPasswordReset } from "@beep/iam-client/phone-number"
 *
 * const payload = RequestPasswordReset.Payload.make({
 *   phoneNumber: "+1234567890"
 * })
 * ```
 *
 * @category PhoneNumber/RequestPasswordReset/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    phoneNumber: S.String,
  },
  formValuesAnnotation({
    phoneNumber: "",
  })
) {}

/**
 * Success response indicating password reset OTP was sent.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RequestPasswordReset } from "@beep/iam-client/phone-number"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RequestPasswordReset.Handler({
 *     phoneNumber: "+1234567890"
 *   })
 *   console.log(`Reset OTP sent: ${result.success}`)
 * })
 * ```
 *
 * @category PhoneNumber/RequestPasswordReset/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response indicating password reset OTP was sent.",
  })
) {}

/**
 * Contract wrapper for request password reset operations.
 *
 * @example
 * ```typescript
 * import { RequestPasswordReset } from "@beep/iam-client/phone-number"
 *
 * const handler = RequestPasswordReset.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category PhoneNumber/RequestPasswordReset/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RequestPasswordResetPhone", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
