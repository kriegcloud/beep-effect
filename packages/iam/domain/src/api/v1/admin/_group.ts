/**
 * @module admin
 *
 * Admin API group for user management endpoints.
 *
 * @category exports
 * @since 0.1.0
 */

import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as AdminUpdateUser from "./admin-update-user";
import * as BanUser from "./ban-user";
import * as CreateUser from "./create-user";
import * as GetUser from "./get-user";
import * as HasPermission from "./has-permission";
import * as ImpersonateUser from "./impersonate-user";
import * as ListUserSessions from "./list-user-sessions";
import * as ListUsers from "./list-users";
import * as RemoveUser from "./remove-user";
import * as RevokeUserSession from "./revoke-user-session";
import * as RevokeUserSessions from "./revoke-user-sessions";
import * as SetRole from "./set-role";
import * as SetUserPassword from "./set-user-password";
import * as StopImpersonating from "./stop-impersonating";
import * as UnbanUser from "./unban-user";

export class Group extends HttpApiGroup.make("iam.admin")
  .prefix("/admin")
  .add(BanUser.Contract)
  .add(CreateUser.Contract)
  .add(GetUser.Contract)
  .add(HasPermission.Contract)
  .add(ImpersonateUser.Contract)
  .add(ListUserSessions.Contract)
  .add(ListUsers.Contract)
  .add(RemoveUser.Contract)
  .add(RevokeUserSession.Contract)
  .add(RevokeUserSessions.Contract)
  .add(SetRole.Contract)
  .add(SetUserPassword.Contract)
  .add(StopImpersonating.Contract)
  .add(UnbanUser.Contract)
  .add(AdminUpdateUser.Contract) {}

export {
  AdminUpdateUser,
  BanUser,
  CreateUser,
  GetUser,
  HasPermission,
  ImpersonateUser,
  ListUserSessions,
  ListUsers,
  RemoveUser,
  RevokeUserSession,
  RevokeUserSessions,
  SetRole,
  SetUserPassword,
  StopImpersonating,
  UnbanUser,
};
