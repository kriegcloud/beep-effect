import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as AccountInfo from "./account-info";
import * as ChangeEmail from "./change-email";
import * as ChangePassword from "./change-password";
import * as DeleteUser from "./delete-user";
import * as GetAccessToken from "./get-access-token";
import * as GetSession from "./get-session";
import * as LinkSocial from "./link-social";
import * as ListAccounts from "./list-accounts";
import * as ListSessions from "./list-sessions";
import * as RefreshToken from "./refresh-token";
import * as RequestPasswordReset from "./request-password-reset";
import * as ResetPassword from "./reset-password";
import * as RevokeOtherSessions from "./revoke-other-sessions";
import * as RevokeSessions from "./revoke-sessions";
import * as SendVerificationEmail from "./send-verification-email";
import * as SignOut from "./sign-out";
import * as UnlinkAccount from "./unlink-account";
import * as UpdateUser from "./update-user";
import * as VerifyEmail from "./verify-email";

export type Service = HttpApiGroup.ApiGroup<"iam", "core">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "core", (h) =>
  h
    .handle("accountInfo", AccountInfo.Handler)
    .handle("changeEmail", ChangeEmail.Handler)
    .handle("changePassword", ChangePassword.Handler)
    .handle("deleteUser", DeleteUser.Handler)
    .handle("getAccessToken", GetAccessToken.Handler)
    .handle("getSession", GetSession.Handler)
    .handle("linkSocial", LinkSocial.Handler)
    .handle("listAccounts", ListAccounts.Handler)
    .handle("listSessions", ListSessions.Handler)
    .handle("refreshToken", RefreshToken.Handler)
    .handle("requestPasswordReset", RequestPasswordReset.Handler)
    .handle("resetPassword", ResetPassword.Handler)
    .handle("revokeOtherSessions", RevokeOtherSessions.Handler)
    .handle("revokeSessions", RevokeSessions.Handler)
    .handle("sendVerificationEmail", SendVerificationEmail.Handler)
    .handle("signOut", SignOut.Handler)
    .handle("unlinkAccount", UnlinkAccount.Handler)
    .handle("updateUser", UpdateUser.Handler)
    .handle("verifyEmail", VerifyEmail.Handler)
);
