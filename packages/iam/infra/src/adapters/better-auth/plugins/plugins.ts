import * as Effect from "effect/Effect";
import * as Admin from "./admin";
import * as Anonymous from "./anonymous";
import * as ApiKey from "./api-key";
import * as Bearer from "./bearer";
// import * as Captcha from "./captcha";
import * as CustomSession from "./custom-session";
import * as DeviceAuthorization from "./device-authorization";
import * as DubAnalytics from "./dub-analytics";
import * as GenericOAuth from "./generic-oauth";
import * as HaveIBeenPwned from "./have-i-been-pwned";
import * as Jwt from "./jwt";
import * as LastLoginMethod from "./last-login-method";
import * as Mcp from "./mcp";
import * as MultiSession from "./multi-session";
import * as NextCookies from "./next-cookies";
import * as OauthProxy from "./oauth-proxy";
import * as OidcProvider from "./oidc-provider";
import * as OneTap from "./one-tap";
import * as OneTimeToken from "./one-time-token";
import * as OpenApi from "./open-api";
import * as Organization from "./organization";
import * as Passkey from "./passkey";
import * as PhoneNumber from "./phone-number";
import * as SIWE from "./siwe";
import * as SSO from "./sso";
import * as Stripe from "./stripe";
import * as TwoFactor from "./two-factor";
import * as Username from "./username";

const AllPluginsArray = [
  Admin.adminPlugin,
  Anonymous.anonymousPlugin,
  ApiKey.apiKeyPlugin,
  Bearer.bearerPlugin,
  // Captcha.captchaPlugin,
  CustomSession.customSessionPlugin,
  DeviceAuthorization.deviceAuthorizationPlugin,
  DubAnalytics.dubAnalyticsPlugin,
  GenericOAuth.genericOAuthPlugin,
  HaveIBeenPwned.haveIBeenPwnedPlugin,
  Jwt.jwtPlugin,
  LastLoginMethod.lastLoginMethodPlugin,
  Mcp.mcpPlugin,
  MultiSession.multiSessionPlugin,
  NextCookies.nextCookiesPlugin,
  OneTap.oneTapPlugin,
  OauthProxy.oauthProxyPlugin,
  OidcProvider.oidcProviderPlugin,
  OpenApi.openApiPlugin,
  OneTimeToken.oneTimeTokenPlugin,
  Organization.organizationPlugin,
  PhoneNumber.phoneNumberPlugin,
  Passkey.passkeyPlugin,
  SSO.ssoPlugin,
  SIWE.siwePlugin,
  Stripe.stripePlugin,
  TwoFactor.twoFactorPlugin,
  Username.usernamePlugin,
] as const;

export type Plugins = Effect.Effect.Success<(typeof AllPluginsArray)[number]>;

export const AllPlugins = Effect.all(AllPluginsArray);
