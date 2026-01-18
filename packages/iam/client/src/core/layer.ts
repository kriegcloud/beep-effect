/**
 * @fileoverview Core authentication layer composition.
 *
 * Composes core authentication handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/core/layer
 * @category Core
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { GetSession } from "./get-session";
import { SignOut } from "./sign-out";

/**
 * Wrapper group combining SignOut and GetSession handlers.
 *
 * Provides type-safe handler access and composition for core authentication
 * operations.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/core"
 *
 * const handlers = Group.accessHandlers("SignOut", "GetSession")
 * ```
 *
 * @category Core/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(SignOut.Wrapper, GetSession.Wrapper);

/**
 * Effect Layer providing SignOut and GetSession handler implementations.
 *
 * Composes core authentication handlers into a layer for dependency injection
 * into the Service runtime.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/core"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category Core/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  SignOut: SignOut.Handler,
  GetSession: GetSession.Handler,
});
