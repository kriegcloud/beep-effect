/**
 * @fileoverview Phone number module re-exports.
 *
 * @module @beep/iam-client/phone-number/mod
 * @category PhoneNumber
 * @since 0.1.0
 */

/**
 * Re-exports WrapperGroup and composed Layer for phone number handlers.
 *
 * @example
 * ```typescript
 * import { PhoneNumber } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Phone number handlers available via dependency injection
 * }).pipe(Effect.provide(PhoneNumber.layer))
 * ```
 *
 * @category PhoneNumber/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports RequestPasswordReset feature namespace.
 *
 * @category PhoneNumber/Exports
 * @since 0.1.0
 */
export { RequestPasswordReset } from "./request-password-reset";

/**
 * Re-exports ResetPassword feature namespace.
 *
 * @category PhoneNumber/Exports
 * @since 0.1.0
 */
export { ResetPassword } from "./reset-password";

/**
 * Re-exports SendOtp feature namespace.
 *
 * @category PhoneNumber/Exports
 * @since 0.1.0
 */
export { SendOtp } from "./send-otp";

/**
 * Re-exports Verify feature namespace.
 *
 * @category PhoneNumber/Exports
 * @since 0.1.0
 */
export { Verify } from "./verify";
