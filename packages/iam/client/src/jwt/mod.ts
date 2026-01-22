/**
 * @fileoverview JWT module re-exports.
 *
 * @module @beep/iam-client/jwt/mod
 * @category JWT
 * @since 0.1.0
 */

/**
 * Re-exports JWKS feature namespace.
 *
 * @category JWT/Exports
 * @since 0.1.0
 */
export { JWKS } from "./jwks";
/**
 * Re-exports WrapperGroup and composed Layer for JWT handlers.
 *
 * @example
 * ```typescript
 * import { JWT } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // JWT handlers available via dependency injection
 * }).pipe(Effect.provide(JWT.layer))
 * ```
 *
 * @category JWT/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";
