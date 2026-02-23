/**
 * @fileoverview
 * Layer composition for password handlers.
 *
 * Composes password handlers into a WrapperGroup and provides the complete layer.
 *
 * @module @beep/iam-client/password/layer
 * @category Password
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Change } from "./change";
import { RequestReset } from "./request-reset";
import { Reset } from "./reset";

/**
 * Wrapper group containing all password wrappers.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const handlers = Password.Group.accessHandlers("Change", "RequestReset", "Reset")
 * ```
 *
 * @category Password/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Change.Wrapper, RequestReset.Wrapper, Reset.Wrapper);

/**
 * Effect layer providing password service.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // Password handlers available via dependency injection
 * }).pipe(Effect.provide(Password.layer))
 * ```
 *
 * @category Password/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  Change: Change.Handler,
  RequestReset: RequestReset.Handler,
  Reset: Reset.Handler,
});
