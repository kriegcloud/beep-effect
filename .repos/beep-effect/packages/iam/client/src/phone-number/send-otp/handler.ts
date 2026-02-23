/**
 * @fileoverview
 * Send OTP handler implementation.
 *
 * Implements the send OTP contract using Better Auth's phone number client.
 *
 * @module @beep/iam-client/phone-number/send-otp/handler
 * @category PhoneNumber/SendOtp
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Send OTP handler that sends a verification code to a phone number.
 *
 * Calls Better Auth's phoneNumber.sendOtp method and validates the response.
 * Does not mutate session state.
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
 * @category PhoneNumber/SendOtp/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.phoneNumber.sendOtp(encodedPayload))
);
