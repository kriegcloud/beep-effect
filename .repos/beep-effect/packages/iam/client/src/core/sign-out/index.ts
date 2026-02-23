/**
 * @fileoverview
 * Sign-out namespace export.
 *
 * Provides a namespaced export for all sign-out functionality.
 *
 * @module @beep/iam-client/core/sign-out
 * @category Core/SignOut
 * @since 0.1.0
 */

/**
 * Sign-out namespace containing contracts, handlers, and schemas.
 *
 * Provides all functionality needed to implement user sign-out flows in the IAM client.
 *
 * @example
 * ```typescript
 * import { SignOut } from "@beep/iam-client/core"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SignOut.Handler
 *   console.log("Signed out:", result.success)
 * })
 * ```
 *
 * @category Core/SignOut
 * @since 0.1.0
 */
export * as SignOut from "./mod.ts";
