/**
 * @module admin
 *
 * Admin API routes for user management endpoints.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as AdminUpdateUser from "./admin-update-user.ts";
import * as BanUser from "./ban-user.ts";
import * as CreateUser from "./create-user.ts";
import * as GetUser from "./get-user.ts";
import * as HasPermission from "./has-permission.ts";
import * as ImpersonateUser from "./impersonate-user.ts";
import * as ListUserSessions from "./list-user-sessions.ts";
import * as ListUsers from "./list-users.ts";
import * as RemoveUser from "./remove-user.ts";
import * as RevokeUserSession from "./revoke-user-session.ts";
import * as RevokeUserSessions from "./revoke-user-sessions.ts";
import * as SetRole from "./set-role.ts";
import * as SetUserPassword from "./set-user-password.ts";
import * as StopImpersonating from "./stop-impersonating.ts";
import * as UnbanUser from "./unban-user.ts";

export type Service = HttpApiGroup.ApiGroup<"iam", "iam.admin">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.admin", (h) =>
  h
    .handle("ban-user", BanUser.Handler)
    .handle("create-user", CreateUser.Handler)
    .handle("get-user", GetUser.Handler)
    .handle("has-permission", HasPermission.Handler)
    .handle("impersonate-user", ImpersonateUser.Handler)
    .handle("list-user-sessions", ListUserSessions.Handler)
    .handle("list-users", ListUsers.Handler)
    .handle("remove-user", RemoveUser.Handler)
    .handle("revoke-user-session", RevokeUserSession.Handler)
    .handle("revoke-user-sessions", RevokeUserSessions.Handler)
    .handle("set-role", SetRole.Handler)
    .handle("set-user-password", SetUserPassword.Handler)
    .handle("stop-impersonating", StopImpersonating.Handler)
    .handle("unban-user", UnbanUser.Handler)
    .handle("admin-update-user", AdminUpdateUser.Handler)
);
