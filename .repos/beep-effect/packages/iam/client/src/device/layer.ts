/**
 * @fileoverview
 * Device authorization layer composition for Better Auth device plugin.
 *
 * Composes Device handlers into a WrapperGroup and provides the complete layer
 * for dependency injection.
 *
 * @module @beep/iam-client/device/layer
 * @category Device
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Approve } from "./approve";
import { Code } from "./code";
import { Deny } from "./deny";
import { Token } from "./token";

/**
 * Wrapper group combining all Device handlers.
 *
 * @example
 * ```typescript
 * import { Device } from "@beep/iam-client"
 *
 * const handlers = Device.Group.accessHandlers("Code", "Token")
 * ```
 *
 * @category Device/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Code.Wrapper, Token.Wrapper, Approve.Wrapper, Deny.Wrapper);

/**
 * Effect layer providing Device handler implementations.
 *
 * @example
 * ```typescript
 * import { Device } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // Device handlers available via dependency injection
 * }).pipe(Effect.provide(Device.layer))
 * ```
 *
 * @category Device/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  RequestDeviceCode: Code.Handler,
  ExchangeDeviceToken: Token.Handler,
  ApproveDevice: Approve.Handler,
  DenyDevice: Deny.Handler,
});
