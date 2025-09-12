import { stripeClient } from "@better-auth/stripe/client";
import type { ClientOptions } from "better-auth/client";
import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  customSessionClient,
  deviceAuthorizationClient,
  genericOAuthClient,
  jwtClient,
  lastLoginMethodClient,
  multiSessionClient,
  oidcClient,
  oneTapClient,
  oneTimeTokenClient,
  organizationClient,
  passkeyClient,
  phoneNumberClient,
  siweClient,
  ssoClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import type { apiKey, genericOAuth, jwt, multiSession, oneTimeToken } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

const _apiKeyClient: () => {
  id: "api-key";
  $InferServerPlugin: ReturnType<typeof apiKey>;
  pathMethods: {
    "/api-key/create": "POST";
    "/api-key/delete": "POST";
    "/api-key/delete-all-expired-api-keys": "POST";
  };
} = apiKeyClient;

const _jwtClient: () => {
  id: "better-auth-client";
  $InferServerPlugin: ReturnType<typeof jwt>;
} = jwtClient;

const _genericOAuthClient: () => {
  id: "generic-oauth-client";
  $InferServerPlugin: ReturnType<typeof genericOAuth>;
} = genericOAuthClient;

export const _multiSessionClient: () => {
  id: "multi-session";
  $InferServerPlugin: ReturnType<typeof multiSession>;
  atomListeners: Array<{
    matcher: (path: string) => boolean;
    signal: "$sessionSignal" | Omit<string, "$sessionSignal">;
  }>;
} = () => multiSessionClient();

export const _oneTimeTokenClient: () => {
  id: "one-time-token";
  $InferServerPlugin: ReturnType<typeof oneTimeToken>;
} = () => oneTimeTokenClient();

const plugins = [
  adminClient(),
  anonymousClient(),
  _apiKeyClient(),
  customSessionClient(),
  _genericOAuthClient(),
  _jwtClient(),
  _multiSessionClient(),
  oidcClient(),
  oneTapClient({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    promptOptions: {
      maxAttempts: 1,
    },
  }),
  _oneTimeTokenClient(),
  organizationClient({
    teams: {
      enabled: true,
    },
  }),
  passkeyClient(),
  phoneNumberClient(),
  siweClient(),
  ssoClient(),
  twoFactorClient(),
  usernameClient(),
  stripeClient({
    subscription: true, //if you want to enable subscription management
  }),
  deviceAuthorizationClient(),
  lastLoginMethodClient(),
] satisfies ClientOptions["plugins"];

const clientOptions: Omit<ClientOptions, "plugins"> & {
  plugins: typeof plugins;
} = {
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL!,
  basePath: process.env.NEXT_PUBLIC_AUTH_PATH!,
  plugins: plugins as typeof plugins,
} satisfies ClientOptions;

export const client = createAuthClient(clientOptions) as ReturnType<typeof createAuthClient<typeof clientOptions>>;

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  forgetPassword,
  changePassword,
  organization,
  requestPasswordReset,
  resetPassword,
  $store,
} = client;

$store.listen("$sessionSignal", async () => {});
