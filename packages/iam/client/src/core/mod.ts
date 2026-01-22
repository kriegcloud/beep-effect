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
 * Re-exports DeleteUser feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { DeleteUser } from "./delete-user";

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
 * Re-exports LinkSocial feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { LinkSocial } from "./link-social";

/**
 * Re-exports ListAccounts feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { ListAccounts } from "./list-accounts";

/**
 * Re-exports RevokeOtherSessions feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { RevokeOtherSessions } from "./revoke-other-sessions";

/**
 * Re-exports RevokeSession feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { RevokeSession } from "./revoke-session";

/**
 * Re-exports RevokeSessions feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { RevokeSessions } from "./revoke-sessions";

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

/**
 * Re-exports UnlinkAccount feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { UnlinkAccount } from "./unlink-account";

/**
 * Re-exports UpdateUser feature namespace.
 *
 * @category Core/Exports
 * @since 0.1.0
 */
export { UpdateUser } from "./update-user";
