/**
 * @fileoverview SSO module re-exports.
 *
 * @module @beep/iam-client/sso/mod
 * @category SSO
 * @since 0.1.0
 */

/**
 * Re-exports WrapperGroup and composed Layer for SSO handlers.
 *
 * @example
 * ```typescript
 * import { SSO } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // SSO handlers available via dependency injection
 * }).pipe(Effect.provide(SSO.layer))
 * ```
 *
 * @category SSO/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";
/**
 * Re-exports Register feature namespace.
 *
 * @category SSO/Exports
 * @since 0.1.0
 */
export { Register } from "./register";
/**
 * Re-exports RequestDomainVerification feature namespace.
 *
 * Note: This is a client-side contract only. The actual handler
 * requires server-side API access (not available on browser client).
 *
 * @category SSO/Exports
 * @since 0.1.0
 */
export { RequestDomainVerification } from "./request-domain-verification";
/**
 * Re-exports VerifyDomain feature namespace.
 *
 * Note: This is a client-side contract only. The actual handler
 * requires server-side API access (not available on browser client).
 *
 * @category SSO/Exports
 * @since 0.1.0
 */
export { VerifyDomain } from "./verify-domain";
