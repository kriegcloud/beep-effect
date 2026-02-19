/**
 * @fileoverview Phone number namespace export.
 *
 * @module @beep/iam-client/phone-number
 * @category PhoneNumber
 * @since 0.1.0
 */

/**
 * PhoneNumber namespace providing phone number verification and password reset operations.
 *
 * Exposes handlers for OTP, verification, and phone-based password reset.
 *
 * @example
 * ```typescript
 * import { PhoneNumber } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Send OTP to phone
 *   yield* PhoneNumber.SendOtp.Handler({ phoneNumber: "+1234567890" })
 *
 *   // Verify with code
 *   yield* PhoneNumber.Verify.Handler({
 *     phoneNumber: "+1234567890",
 *     code: "123456"
 *   })
 * })
 * ```
 *
 * @category PhoneNumber
 * @since 0.1.0
 */
export * as PhoneNumber from "./mod.ts";
