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

export type Service = HttpApiGroup.ApiGroup<"iam", "admin">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "admin", (h) =>
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
