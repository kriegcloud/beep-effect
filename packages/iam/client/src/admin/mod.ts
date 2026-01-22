/**
 * @fileoverview Admin module re-exports.
 *
 * @module @beep/iam-client/admin/mod
 * @category Admin
 * @since 0.1.0
 */

/**
 * Re-exports BanUser feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { BanUser } from "./ban-user";

/**
 * Re-exports CreateUser feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { CreateUser } from "./create-user";

/**
 * Re-exports HasPermission feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { HasPermission } from "./has-permission";

/**
 * Re-exports ImpersonateUser feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { ImpersonateUser } from "./impersonate-user";

/**
 * Re-exports WrapperGroup and composed Layer for admin handlers.
 *
 * @example
 * ```typescript
 * import { Admin } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Admin handlers available via dependency injection
 * }).pipe(Effect.provide(Admin.layer))
 * ```
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports ListUserSessions feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { ListUserSessions } from "./list-user-sessions";

/**
 * Re-exports ListUsers feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { ListUsers } from "./list-users";

/**
 * Re-exports RemoveUser feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { RemoveUser } from "./remove-user";

/**
 * Re-exports RevokeUserSession feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { RevokeUserSession } from "./revoke-user-session";

/**
 * Re-exports RevokeUserSessions feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { RevokeUserSessions } from "./revoke-user-sessions";

/**
 * Re-exports SetRole feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { SetRole } from "./set-role";

/**
 * Re-exports SetUserPassword feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { SetUserPassword } from "./set-user-password";

/**
 * Re-exports StopImpersonating feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { StopImpersonating } from "./stop-impersonating";

/**
 * Re-exports UnbanUser feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { UnbanUser } from "./unban-user";

/**
 * Re-exports UpdateUser feature namespace.
 *
 * @category Admin/Exports
 * @since 0.1.0
 */
export { UpdateUser } from "./update-user";
