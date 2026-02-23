/**
 * @fileoverview SSO layer composition.
 *
 * Composes SSO handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/sso/layer
 * @category SSO
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Register } from "./register";

/**
 * Wrapper group combining all SSO handlers.
 *
 * Provides type-safe handler access and composition for SSO
 * operations including provider registration.
 *
 * Note: Domain verification methods (verifyDomain, requestDomainVerification)
 * are server-side only and not available on the client.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/sso"
 *
 * const handlers = Group.accessHandlers("SsoRegister")
 * ```
 *
 * @category SSO/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Register.Wrapper);

/**
 * Effect Layer providing all SSO handler implementations.
 *
 * Composes SSO handlers into a layer for dependency injection
 * into the Service runtime.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/sso"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category SSO/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  SsoRegister: Register.Handler,
});
