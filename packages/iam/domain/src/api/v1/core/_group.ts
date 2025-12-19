import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
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

export class Group extends HttpApiGroup.make("iam.core")
  .add(GetSession.Contract)
  .add(ListSessions.Contract)
  .add(SignOut.Contract)
  .add(RevokeSessions.Contract)
  .add(RevokeOtherSessions.Contract)
  .add(ChangePassword.Contract)
  .add(ChangeEmail.Contract)
  .add(ResetPassword.Contract)
  .add(RequestPasswordReset.Contract)
  .add(VerifyEmail.Contract)
  .add(SendVerificationEmail.Contract)
  .add(AccountInfo.Contract)
  .add(DeleteUser.Contract)
  .add(UpdateUser.Contract)
  .add(LinkSocial.Contract)
  .add(ListAccounts.Contract)
  .add(UnlinkAccount.Contract)
  .add(RefreshToken.Contract)
  .add(GetAccessToken.Contract) {}

export {
  AccountInfo,
  ChangeEmail,
  ChangePassword,
  DeleteUser,
  GetAccessToken,
  GetSession,
  LinkSocial,
  ListAccounts,
  ListSessions,
  RefreshToken,
  RequestPasswordReset,
  ResetPassword,
  RevokeOtherSessions,
  RevokeSessions,
  SendVerificationEmail,
  SignOut,
  UnlinkAccount,
  UpdateUser,
  VerifyEmail,
};
