/**
 * @fileoverview JWT namespace export.
 *
 * @module @beep/iam-client/jwt
 * @category JWT
 * @since 0.1.0
 */

/**
 * JWT namespace providing JSON Web Token operations.
 *
 * Exposes handlers for retrieving JWKS for token verification.
 *
 * @example
 * ```typescript
 * import { JWT } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Get JWKS for token verification
 *   const result = yield* JWT.JWKS.Handler
 *   console.log(`Found ${result.keys.length} keys`)
 * })
 * ```
 *
 * @category JWT
 * @since 0.1.0
 */
export * as JWT from "./mod.ts";
