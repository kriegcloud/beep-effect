/**
 * @fileoverview SSO namespace export.
 *
 * @module @beep/iam-client/sso
 * @category SSO
 * @since 0.1.0
 */

/**
 * SSO namespace providing enterprise SSO operations.
 *
 * Exposes handlers for registering SSO providers and verifying domains.
 *
 * @example
 * ```typescript
 * import { SSO } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Register an SSO provider
 *   const result = yield* SSO.Register.Handler({
 *     providerId: "acme-corp",
 *     issuer: "https://idp.acme.com",
 *     domain: "acme.com"
 *   })
 *   console.log(`Provider registered: ${result.providerId}`)
 * })
 * ```
 *
 * @category SSO
 * @since 0.1.0
 */
export * as SSO from "./mod.ts";
