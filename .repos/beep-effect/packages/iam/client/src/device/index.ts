/**
 * @fileoverview Device namespace export.
 *
 * @module @beep/iam-client/device
 * @category Device
 * @since 0.1.0
 */

/**
 * Device namespace providing device authorization operations.
 *
 * Exposes handlers for device authorization flow per RFC 8628.
 *
 * @example
 * ```typescript
 * import { Device } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Request device code
 *   const result = yield* Device.Code.Handler({})
 *   console.log(`Visit ${result.verificationUri} and enter: ${result.userCode}`)
 * })
 * ```
 *
 * @category Device
 * @since 0.1.0
 */
export * as Device from "./mod.ts";
