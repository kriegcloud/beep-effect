/**
 * @fileoverview
 * SendVerification namespace export for email verification functionality.
 *
 * @module @beep/iam-client/email-verification/send-verification
 * @category EmailVerification/SendVerification
 * @since 0.1.0
 */

/**
 * Send verification email namespace providing contract and handler.
 *
 * @example
 * ```typescript
 * import { SendVerification } from "@beep/iam-client/email-verification"
 *
 * const payload = SendVerification.Payload.make({ email: "user@example.com" })
 * const result = yield* SendVerification.Handler(payload)
 * ```
 *
 * @category EmailVerification/SendVerification
 * @since 0.1.0
 */
export * as SendVerification from "./mod.ts";
