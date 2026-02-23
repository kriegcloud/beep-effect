/**
 * @fileoverview Username plugin module re-exports.
 *
 * @module @beep/iam-client/username/mod
 * @category Username
 * @since 0.1.0
 */

/**
 * Re-exports IsUsernameAvailable feature namespace.
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
 * @category Username/Exports
 * @since 0.1.0
 */
export { IsUsernameAvailable } from "./is-username-available";

/**
 * Re-exports WrapperGroup and composed Layer for username handlers.
 *
 * @example
 * ```typescript
 * import { Username } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Username handlers available via dependency injection
 * }).pipe(Effect.provide(Username.layer))
 * ```
 *
 * @category Username/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";
