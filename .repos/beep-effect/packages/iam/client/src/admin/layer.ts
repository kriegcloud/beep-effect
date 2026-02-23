/**
 * @fileoverview Admin layer composition.
 *
 * Composes admin handlers into a WrapperGroup and provides the
 * complete layer for dependency injection into the Service runtime.
 *
 * @module @beep/iam-client/admin/layer
 * @category Admin
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { BanUser } from "./ban-user";
import { CreateUser } from "./create-user";
import { HasPermission } from "./has-permission";
import { ImpersonateUser } from "./impersonate-user";
import { ListUserSessions } from "./list-user-sessions";
import { ListUsers } from "./list-users";
import { RemoveUser } from "./remove-user";
import { RevokeUserSession } from "./revoke-user-session";
import { RevokeUserSessions } from "./revoke-user-sessions";
import { SetRole } from "./set-role";
import { SetUserPassword } from "./set-user-password";
import { StopImpersonating } from "./stop-impersonating";
import { UnbanUser } from "./unban-user";
import { UpdateUser } from "./update-user";

/**
 * Wrapper group combining all admin handlers.
 *
 * Provides type-safe handler access and composition for admin
 * operations including user management, role assignment, and banning.
 *
 * @example
 * ```typescript
 * import { Group } from "@beep/iam-client/admin"
 *
 * const handlers = Group.accessHandlers("SetRole", "BanUser", "ListUsers")
 * ```
 *
 * @category Admin/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(
  SetRole.Wrapper,
  CreateUser.Wrapper,
  UpdateUser.Wrapper,
  ListUsers.Wrapper,
  ListUserSessions.Wrapper,
  UnbanUser.Wrapper,
  BanUser.Wrapper,
  ImpersonateUser.Wrapper,
  StopImpersonating.Wrapper,
  RevokeUserSession.Wrapper,
  RevokeUserSessions.Wrapper,
  RemoveUser.Wrapper,
  SetUserPassword.Wrapper,
  HasPermission.Wrapper
);

/**
 * Effect Layer providing all admin handler implementations.
 *
 * Composes admin handlers into a layer for dependency injection
 * into the Service runtime.
 *
 * @example
 * ```typescript
 * import { layer } from "@beep/iam-client/admin"
 * import * as Layer from "effect/Layer"
 *
 * const myLayer = Layer.mergeAll(layer, customLayer)
 * ```
 *
 * @category Admin/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  SetRole: SetRole.Handler,
  CreateUser: CreateUser.Handler,
  AdminUpdateUser: UpdateUser.Handler,
  ListUsers: ListUsers.Handler,
  ListUserSessions: ListUserSessions.Handler,
  UnbanUser: UnbanUser.Handler,
  BanUser: BanUser.Handler,
  ImpersonateUser: ImpersonateUser.Handler,
  StopImpersonating: StopImpersonating.Handler,
  RevokeUserSession: RevokeUserSession.Handler,
  RevokeUserSessions: RevokeUserSessions.Handler,
  RemoveUser: RemoveUser.Handler,
  SetUserPassword: SetUserPassword.Handler,
  HasPermission: HasPermission.Handler,
});
