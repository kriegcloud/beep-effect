/**
 * @fileoverview
 * Email sign-in namespace export for consuming modules.
 *
 * @module @beep/iam-client/sign-in/email
 * @category SignIn/Email
 * @since 0.1.0
 */

/**
 * Email sign-in namespace containing Payload, Success, Wrapper, and Handler exports.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Email } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Email.Handler({
 *     email: "user@example.com",
 *     password: "securePassword123"
 *   })
 *   return result.user
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as Email from "./mod.ts";
