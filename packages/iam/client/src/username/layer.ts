/**
 * @fileoverview Username plugin layer composition.
 *
 * Composes username handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/username/layer
 * @category Username
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { IsUsernameAvailable } from "./is-username-available";

/**
 * Wrapper group for username plugin handlers.
 *
 * Provides type-safe handler access for username operations.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/username"
 *
 * const handlers = Group.accessHandlers("IsUsernameAvailable")
 * ```
 *
 * @category Username/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(IsUsernameAvailable.Wrapper);

/**
 * Effect Layer providing username handler implementations.
 *
 * Composes username handlers into a layer for dependency injection.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/username"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category Username/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  IsUsernameAvailable: IsUsernameAvailable.Handler,
});
