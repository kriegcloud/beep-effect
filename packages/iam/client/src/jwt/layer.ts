/**
 * @fileoverview
 * JWT layer composition for Better Auth JWT plugin.
 *
 * Composes JWT handlers into a WrapperGroup and provides the complete layer
 * for dependency injection.
 *
 * @module @beep/iam-client/jwt/layer
 * @category JWT
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { JWKS } from "./jwks";

/**
 * Wrapper group combining all JWT handlers.
 *
 * @example
 * ```typescript
 * import { JWT } from "@beep/iam-client"
 *
 * const handlers = JWT.Group.accessHandlers("JWKS")
 * ```
 *
 * @category JWT/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(JWKS.Wrapper);

/**
 * Effect layer providing JWT handler implementations.
 *
 * @example
 * ```typescript
 * import { JWT } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // JWT handlers available via dependency injection
 * }).pipe(Effect.provide(JWT.layer))
 * ```
 *
 * @category JWT/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  GetJWKS: JWKS.Handler,
});
