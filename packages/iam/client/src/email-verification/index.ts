/**
 * @fileoverview
 * EmailVerification namespace aggregating email verification flows.
 *
 * @module @beep/iam-client/email-verification
 * @category EmailVerification
 * @since 0.1.0
 */

/**
 * Email verification namespace providing contracts, handlers, and atoms for verification.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 *
 * // Use atoms with toast feedback
 * const { sendVerification } = EmailVerification.Atoms.use()
 *
 * // Access send verification contract directly
 * const payload = EmailVerification.SendVerification.Payload.make({ email: "user@example.com" })
 * ```
 *
 * @category EmailVerification
 * @since 0.1.0
 */
export * as EmailVerification from "./mod.ts";
