/**
 * @fileoverview One-time token layer composition.
 *
 * Composes one-time token handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/one-time-token/layer
 * @category OneTimeToken
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Generate } from "./generate";
import { Verify } from "./verify";

/**
 * Wrapper group combining all one-time token handlers.
 *
 * Provides type-safe handler access and composition for one-time token
 * operations including generate and verify.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/one-time-token"
 *
 * const handlers = Group.accessHandlers("Generate", "Verify")
 * ```
 *
 * @category OneTimeToken/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Verify.Wrapper, Generate.Wrapper);

/**
 * Effect Layer providing all one-time token handler implementations.
 *
 * Composes one-time token handlers into a layer for dependency injection
 * into the Service runtime.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/one-time-token"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category OneTimeToken/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  VerifyOneTimeToken: Verify.Handler,
  GenerateOneTimeToken: Generate.Handler,
});
