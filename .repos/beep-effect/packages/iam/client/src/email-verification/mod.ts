/**
 * @fileoverview
 * Email verification module re-exports for verification email functionality.
 *
 * @module @beep/iam-client/email-verification/mod
 * @category EmailVerification
 * @since 0.1.0
 */

/**
 * Re-exports reactive atoms for email verification flows with toast feedback.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 *
 * const { sendVerification } = EmailVerification.Atoms.use()
 * await sendVerification({ email: "user@example.com" })
 * ```
 *
 * @category EmailVerification/Exports
 * @since 0.1.0
 */
export * as Atoms from "./atoms";

/**
 * Re-exports WrapperGroup and composed Layer for email verification handlers.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Email verification handlers available via dependency injection
 * }).pipe(Effect.provide(EmailVerification.layer))
 * ```
 *
 * @category EmailVerification/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports send verification contract and implementation.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 *
 * const payload = EmailVerification.SendVerification.Payload.make({ email: "user@example.com" })
 * ```
 *
 * @category EmailVerification/Exports
 * @since 0.1.0
 */
export { SendVerification } from "./send-verification";

/**
 * Re-exports Effect service and runtime for email verification operations.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const service = yield* EmailVerification.Service
 *   yield* service.SendVerification({ email: "user@example.com" })
 * })
 * ```
 *
 * @category EmailVerification/Exports
 * @since 0.1.0
 */
export { runtime, Service } from "./service";
