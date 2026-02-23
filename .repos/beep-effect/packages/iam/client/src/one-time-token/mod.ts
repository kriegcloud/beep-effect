/**
 * @fileoverview One-time token module re-exports.
 *
 * @module @beep/iam-client/one-time-token/mod
 * @category OneTimeToken
 * @since 0.1.0
 */

/**
 * Re-exports Generate feature namespace.
 *
 * @category OneTimeToken/Exports
 * @since 0.1.0
 */
export { Generate } from "./generate";

/**
 * Re-exports WrapperGroup and composed Layer for one-time token handlers.
 *
 * @example
 * ```typescript
 * import { OneTimeToken } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // One-time token handlers available via dependency injection
 * }).pipe(Effect.provide(OneTimeToken.layer))
 * ```
 *
 * @category OneTimeToken/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports Verify feature namespace.
 *
 * @category OneTimeToken/Exports
 * @since 0.1.0
 */
export { Verify } from "./verify";
