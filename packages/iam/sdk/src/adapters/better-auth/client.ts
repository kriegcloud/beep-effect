import { clientEnv } from "@beep/core-env/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  customSessionClient,
  deviceAuthorizationClient,
  genericOAuthClient,
  // jwtClient,
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
import { createAuthClient } from "better-auth/react";

export const client = createAuthClient({
  baseURL: clientEnv.authUrl,
  basePath: clientEnv.authPath,
  plugins: [
    adminClient(),
    anonymousClient(),
    // jwtClient,
    apiKeyClient(),
    customSessionClient(),
    genericOAuthClient(),
    multiSessionClient(),
    oidcClient(),
    oneTapClient({
      clientId: clientEnv.googleClientId,
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    oneTimeTokenClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
      dynamicAccessControl: {
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
      subscription: true,
    }),
    deviceAuthorizationClient(),
    lastLoginMethodClient(),
  ],
});

export const { $store, signIn } = client;

$store.listen("$sessionSignal", async () => {});
