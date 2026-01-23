/**
 * @fileoverview
 * Send OTP contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for sending an OTP to a phone number.
 *
 * @module @beep/iam-client/phone-number/send-otp/contract
 * @category PhoneNumber/SendOtp
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("phone-number/send-otp");

/**
 * Payload for sending an OTP to a phone number.
 *
 * @example
 * ```typescript
 * import { SendOtp } from "@beep/iam-client/phone-number"
 *
 * const payload = SendOtp.Payload.make({
 *   phoneNumber: "+1234567890"
 * })
 * ```
 *
 * @category PhoneNumber/SendOtp/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    phoneNumber: BS.Phone,
  },
  formValuesAnnotation({
    phoneNumber: "",
  })
) {}

/**
 * Success response indicating OTP was sent.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { SendOtp } from "@beep/iam-client/phone-number"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SendOtp.Handler({ phoneNumber: "+1234567890" })
 *   console.log(`OTP sent: ${result.success}`)
 * })
 * ```
 *
 * @category PhoneNumber/SendOtp/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response indicating OTP was sent to the phone number.",
  })
) {}

/**
 * Contract wrapper for send OTP operations.
 *
 * @example
 * ```typescript
 * import { SendOtp } from "@beep/iam-client/phone-number"
 *
 * const handler = SendOtp.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category PhoneNumber/SendOtp/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SendOtp", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
