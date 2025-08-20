import type { BetterAuthOptions } from "better-auth";
import * as F from "effect/Function";
import * as PluginAdapters from "./plugins";

export type PluginOptions<
  T extends string,
  Opts extends Record<string, any>,
> = {
  _tag: T;
  options: Opts;
};

export type MakePluginsParams = {
  admin?: PluginOptions<"admin", PluginAdapters.AdminOptions>;
  anonymous?: PluginOptions<"anonymous", PluginAdapters.AnonymousOptions>;
  apiKey?: PluginOptions<"apiKey", PluginAdapters.ApiKeyOptions>;
  bearer?: PluginOptions<"bearer", PluginAdapters.BearerOptions>;
  captcha?: PluginOptions<"captcha", PluginAdapters.CaptchaOptions>;
  customSession?: PluginOptions<
    "customSession",
    PluginAdapters.CustomSessionOptions
  >;
  dub?: PluginOptions<"dub", PluginAdapters.DubOptions>;
  emailOTP?: PluginOptions<"emailOTP", PluginAdapters.EmailOtpOptions>;
  genericOAuth?: PluginOptions<
    "genericOAuth",
    PluginAdapters.GenericOAuthOptions
  >;
  haveIBeenPwned?: PluginOptions<
    "haveIBeenPwned",
    PluginAdapters.HaveIBeenPwnedOptions
  >;
  // jwt?: PluginOptions<"jwt", PluginAdapters.JwtOptions>;
  magicLink?: PluginOptions<"magicLink", PluginAdapters.MagicLinkOptions>;
  mcp?: PluginOptions<"mcp", PluginAdapters.McpOptions>;
  multiSession?: PluginOptions<
    "multiSession",
    PluginAdapters.MultiSessionOptions
  >;
  nextCookies?: PluginOptions<"nextCookies", NonNullable<unknown>>;
  oAuthProxy?: PluginOptions<"oAuthProxy", PluginAdapters.OAuthProxyOptions>;
  oidcProvider?: PluginOptions<
    "oidcProvider",
    PluginAdapters.OidcProviderOptions
  >;
  oneTap?: PluginOptions<"oneTap", PluginAdapters.OneTapOptions>;
  oneTimeToken?: PluginOptions<
    "oneTimeToken",
    PluginAdapters.OneTimeTokenOptions
  >;
  openAPI?: PluginOptions<"openAPI", PluginAdapters.OpenApiOptions>;
  organization?: PluginOptions<
    "organization",
    PluginAdapters.OrganizationOptions
  >;
  passkey?: PluginOptions<"passkey", PluginAdapters.PasskeyOptions>;
  phoneNumber?: PluginOptions<"phoneNumber", PluginAdapters.PhoneNumberOptions>;
  siwe?: PluginOptions<"siwe", PluginAdapters.SiweOptions>;
  sso?: PluginOptions<"sso", PluginAdapters.SsoOptions>;
  stripe?: PluginOptions<"stripe", PluginAdapters.StripeOptions>;
  twoFactor?: PluginOptions<"twoFactor", PluginAdapters.TwoFactorOptions>;
  username?: PluginOptions<"username", PluginAdapters.UsernameOptions>;
};

export const makePlugins = F.flow(
  (opts: MakePluginsParams) =>
    [
      opts.admin
        ? PluginAdapters.makeAdminPlugin(opts.admin.options)
        : undefined,
      opts.anonymous
        ? PluginAdapters.makeAnonymousPlugin(opts.anonymous.options)
        : undefined,
      opts.apiKey
        ? PluginAdapters.makeApiKeyPlugin(opts.apiKey.options)
        : undefined,
      opts.bearer
        ? PluginAdapters.makeBearerPlugin(opts.bearer.options)
        : undefined,
      opts.captcha
        ? PluginAdapters.makeCaptchaPlugin(opts.captcha.options)
        : undefined,
      opts.customSession
        ? PluginAdapters.makeCustomSessionPlugin(opts.customSession.options)
        : undefined,
      opts.dub ? PluginAdapters.makeDubPlugin(opts.dub.options) : undefined,
      opts.emailOTP
        ? PluginAdapters.makeEmailOtpPlugin(opts.emailOTP.options)
        : undefined,
      opts.genericOAuth
        ? PluginAdapters.makeGenericOAuthPlugin(opts.genericOAuth.options)
        : undefined,
      opts.haveIBeenPwned
        ? PluginAdapters.makeHaveIBeenPwnedPlugin(opts.haveIBeenPwned.options)
        : undefined,
      // opts.jwt ? PluginAdapters.makeJwtPlugin(opts.jwt.options) : undefined,
      opts.magicLink
        ? PluginAdapters.makeMagicLinkPlugin(opts.magicLink.options)
        : undefined,
      opts.mcp ? PluginAdapters.makeMcpPlugin(opts.mcp.options) : undefined,
      opts.multiSession
        ? PluginAdapters.makeMultiSessionPlugin(opts.multiSession.options)
        : undefined,
      opts.nextCookies ? PluginAdapters.makeNextCookiesPlugin() : undefined,
      opts.oAuthProxy
        ? PluginAdapters.makeOAuthProxyPlugin(opts.oAuthProxy.options)
        : undefined,
      opts.oidcProvider
        ? PluginAdapters.makeOidcProviderPlugin(opts.oidcProvider.options)
        : undefined,
      opts.oneTap
        ? PluginAdapters.makeOneTapPlugin(opts.oneTap.options)
        : undefined,
      opts.oneTimeToken
        ? PluginAdapters.makeOneTimeTokenPlugin(opts.oneTimeToken.options)
        : undefined,
      opts.openAPI
        ? PluginAdapters.makeOpenApiPlugin(opts.openAPI.options)
        : undefined,
      opts.organization
        ? PluginAdapters.makeOrganizationPlugin(opts.organization.options)
        : undefined,
      opts.passkey
        ? PluginAdapters.makePasskeyPlugin(opts.passkey.options)
        : undefined,
      opts.phoneNumber
        ? PluginAdapters.makePhoneNumberPlugin(opts.phoneNumber.options)
        : undefined,
      opts.siwe ? PluginAdapters.makeSiwePlugin(opts.siwe.options) : undefined,
      opts.sso ? PluginAdapters.makeSsoPlugin(opts.sso.options) : undefined,
      opts.stripe
        ? PluginAdapters.makeStripePlugin(opts.stripe.options)
        : undefined,
      opts.twoFactor
        ? PluginAdapters.makeTwoFactorPlugin(opts.twoFactor.options)
        : undefined,
      opts.username
        ? PluginAdapters.makeUsernamePlugin(opts.username.options)
        : undefined,
    ] satisfies BetterAuthOptions["plugins"],
);
