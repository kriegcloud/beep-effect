/**
 * @fileoverview Username plugin namespace export.
 *
 * @module @beep/iam-client/username
 * @category Username
 * @since 0.1.0
 */

/**
 * Username namespace containing username plugin handlers.
 *
 * Provides functionality for username availability checks.
 *
 * @example
 * ```typescript
 * import { Username } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Username.IsUsernameAvailable.Handler({ username: "test" })
 *   console.log("Available:", result.status)
 * })
 * ```
 *
 * @category Username
 * @since 0.1.0
 */
export * as Username from "./mod.ts";
