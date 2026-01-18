/**
 * @fileoverview Username sign-in namespace export.
 *
 * @module @beep/iam-client/sign-in/username
 * @category SignIn/Username
 * @since 0.1.0
 */

/**
 * Username sign-in namespace providing schemas, handlers, and contracts for username-based authentication.
 *
 * @example
 * ```typescript
 * import { Username } from "@beep/iam-client/sign-in"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Username.Handler({
 *     username: "alice",
 *     password: "secure-password"
 *   })
 * })
 * ```
 *
 * @category SignIn/Username
 * @since 0.1.0
 */
export * as Username from "./mod.ts";
