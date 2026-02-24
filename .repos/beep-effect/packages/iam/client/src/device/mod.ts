/**
 * @fileoverview Device module re-exports.
 *
 * @module @beep/iam-client/device/mod
 * @category Device
 * @since 0.1.0
 */

/**
 * Re-exports Approve feature namespace.
 *
 * @category Device/Exports
 * @since 0.1.0
 */
export { Approve } from "./approve";

/**
 * Re-exports Code feature namespace.
 *
 * @category Device/Exports
 * @since 0.1.0
 */
export { Code } from "./code";

/**
 * Re-exports Deny feature namespace.
 *
 * @category Device/Exports
 * @since 0.1.0
 */
export { Deny } from "./deny";

/**
 * Re-exports WrapperGroup and composed Layer for Device handlers.
 *
 * @example
 * ```typescript
 * import { Device } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Device handlers available via dependency injection
 * }).pipe(Effect.provide(Device.layer))
 * ```
 *
 * @category Device/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports Token feature namespace.
 *
 * @category Device/Exports
 * @since 0.1.0
 */
export { Token } from "./token";
