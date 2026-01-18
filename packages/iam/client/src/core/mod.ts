/**
 * @fileoverview Core authentication module re-exports.
 *
 * @module @beep/iam-client/core/mod
 * @category Core
 * @since 0.1.0
 */

/**
 * Re-exports reactive atoms for core authentication flows.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/iam-client"
 *
 * const { signOut, sessionResult, sessionRefresh } = Core.Atoms.use()
 * ```
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export * as Atoms from "./atoms";

/**
 * Re-exports GetSession feature namespace.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Core.GetSession.Handler
 *   return result.data
 * })
 * ```
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { GetSession } from "./get-session";

/**
 * Re-exports WrapperGroup and composed Layer for core handlers.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Core handlers available via dependency injection
 * }).pipe(Effect.provide(Core.layer))
 * ```
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports Effect service and runtime for core operations.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const core = yield* Core.Service
 *   const session = yield* core.GetSession()
 * })
 * ```
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { runtime, Service } from "./service";

/**
 * Re-exports SignOut feature namespace.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   yield* Core.SignOut.Handler
 * })
 * ```
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { SignOut } from "./sign-out";
