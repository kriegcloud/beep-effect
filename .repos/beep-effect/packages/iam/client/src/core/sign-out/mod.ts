/**
 * @fileoverview
 * Sign-out module exports.
 *
 * Re-exports all sign-out functionality including contracts, handlers, and schemas.
 *
 * @module @beep/iam-client/core/sign-out/mod
 * @category Core/SignOut
 * @since 0.1.0
 */

/**
 * Re-exports sign-out contract schemas and wrapper.
 *
 * @example
 * ```typescript
 * import { Success, Wrapper } from "@beep/iam-client/core/sign-out"
 *
 * const response = { success: true }
 * const decoded = Success.make(response)
 * ```
 *
 * @category Core/SignOut
 * @since 0.1.0
 */
export * from "./contract.ts";

/**
 * Re-exports sign-out handler implementation.
 *
 * @example
 * ```typescript
 * import { Handler } from "@beep/iam-client/core/sign-out"
 * import * as Effect from "effect/Effect"
 *
 * const program = Handler.pipe(
 *   Effect.map(result => result.success)
 * )
 * ```
 *
 * @category Core/SignOut
 * @since 0.1.0
 */
export * from "./handler.ts";
