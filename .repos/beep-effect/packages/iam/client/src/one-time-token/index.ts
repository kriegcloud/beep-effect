/**
 * @fileoverview One-time token namespace export.
 *
 * @module @beep/iam-client/one-time-token
 * @category OneTimeToken
 * @since 0.1.0
 */

/**
 * OneTimeToken namespace providing one-time authentication token operations.
 *
 * Exposes handlers for generating and verifying one-time tokens.
 *
 * @example
 * ```typescript
 * import { OneTimeToken } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Generate a one-time token
 *   const { token } = yield* OneTimeToken.Generate.Handler({
 *     email: "user@example.com"
 *   })
 *
 *   // Verify and authenticate with token
 *   const { user, session } = yield* OneTimeToken.Verify.Handler({ token })
 *   console.log(`Authenticated as ${user.name}`)
 * })
 * ```
 *
 * @category OneTimeToken
 * @since 0.1.0
 */
export * as OneTimeToken from "./mod.ts";
