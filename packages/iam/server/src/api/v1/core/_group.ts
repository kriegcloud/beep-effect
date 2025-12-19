import { IamApi, type IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as AccountInfo from "./account-info.ts";
import * as ChangeEmail from "./change-email.ts";
import * as ChangePassword from "./change-password.ts";
import * as DeleteUser from "./delete-user.ts";
import * as GetAccessToken from "./get-access-token.ts";
import * as GetSession from "./get-session.ts";
import * as LinkSocial from "./link-social.ts";
import * as ListAccounts from "./list-accounts.ts";
import * as ListSessions from "./list-sessions.ts";
import * as RefreshToken from "./refresh-token.ts";
import * as RequestPasswordReset from "./request-password-reset.ts";
import * as ResetPassword from "./reset-password.ts";
import * as RevokeOtherSessions from "./revoke-other-sessions.ts";
import * as RevokeSessions from "./revoke-sessions.ts";
import * as SendVerificationEmail from "./send-verification-email.ts";
import * as SignOut from "./sign-out.ts";
import * as UnlinkAccount from "./unlink-account.ts";
import * as UpdateUser from "./update-user.ts";
import * as VerifyEmail from "./verify-email.ts";

export type Service = HttpApiGroup.ApiGroup<"iam", "iam.core">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.core", (h) =>
  h
    .handle("get-session", GetSession.Handler)
    .handle("list-sessions", ListSessions.Handler)
    .handle("sign-out", SignOut.Handler)
    .handle("revoke-sessions", RevokeSessions.Handler)
    .handle("revoke-other-sessions", RevokeOtherSessions.Handler)
    .handle("change-password", ChangePassword.Handler)
    .handle("change-email", ChangeEmail.Handler)
    .handle("reset-password", ResetPassword.Handler)
    .handle("request-password-reset", RequestPasswordReset.Handler)
    .handle("verify-email", VerifyEmail.Handler)
    .handle("send-verification-email", SendVerificationEmail.Handler)
    .handle("account-info", AccountInfo.Handler)
    .handle("delete-user", DeleteUser.Handler)
    .handle("update-user", UpdateUser.Handler)
    .handle("link-social", LinkSocial.Handler)
    .handle("list-accounts", ListAccounts.Handler)
    .handle("unlink-account", UnlinkAccount.Handler)
    .handle("refresh-token", RefreshToken.Handler)
    .handle("get-access-token", GetAccessToken.Handler)
);
