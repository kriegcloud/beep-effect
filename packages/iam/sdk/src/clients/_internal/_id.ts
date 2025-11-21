import { IamSdkId } from "@beep/identity/modules";

const base = IamSdkId.compose("clients").identifier;

export const AdminClientId = IamSdkId.compose(`${base}/admin`);
export const ApiKeyClientId = IamSdkId.compose(`${base}/api-key`);
export const DeviceClientId = IamSdkId.compose(`${base}/device-authorization`);
export const LastLoginClientId = IamSdkId.compose(`${base}/last-login-method`);
export const MultiSessionClientId = IamSdkId.compose(`${base}/multi-session`);
export const OAuthClientId = IamSdkId.compose(`${base}/oauth`);
export const OidcClientId = IamSdkId.compose(`${base}/oidc`);
export const OrganizationClientId = IamSdkId.compose(`${base}/organization`);
export const PasskeyClientId = IamSdkId.compose(`${base}/passkey`);
export const RecoverClientId = IamSdkId.compose(`${base}/recover`);
export const SessionClientId = IamSdkId.compose(`${base}/session`);
export const SignInClientId = IamSdkId.compose(`${base}/sign-in`);
export const SignOutClientId = IamSdkId.compose(`${base}/sign-out`);
export const SignUpClientId = IamSdkId.compose(`${base}/sign-up`);
export const SsoClientId = IamSdkId.compose(`${base}/sso`);
export const StripeClientId = IamSdkId.compose(`${base}/stripe`);
export const TwoFactorClientId = IamSdkId.compose(`${base}/two-factor`);
export const UserClientId = IamSdkId.compose(`${base}/user`);
export const VerifyClientId = IamSdkId.compose(`${base}/verify`);
