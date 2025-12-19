import type { Auth } from "@beep/iam-server";
import { clientEnv } from "@beep/shared-server/ClientEnv";
import { asyncNoOp } from "@beep/utils";
import type { BetterAuthClientOptions } from "@better-auth/core";
import { passkeyClient } from "@better-auth/passkey/client";
import { ssoClient } from "@better-auth/sso/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  customSessionClient,
  deviceAuthorizationClient,
  genericOAuthClient,
  inferAdditionalFields,
  // jwtClient,
  // inferOrgAdditionalFields,
  lastLoginMethodClient,
  multiSessionClient,
  oidcClient,
  oneTapClient,
  oneTimeTokenClient,
  organizationClient,
  phoneNumberClient,
  siweClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const client = createAuthClient({
  baseURL: clientEnv.authUrl,
  basePath: clientEnv.authPath,
  plugins: [
    inferAdditionalFields<Auth.Auth>(),
    adminClient(),
    anonymousClient(),
    // jwtClient(),
    apiKeyClient(),
    customSessionClient<Auth.Auth>(),
    genericOAuthClient(),
    multiSessionClient(),
    oidcClient(),
    oneTapClient({
      clientId: clientEnv.googleClientId,
      promptOptions: {
        baseDelay: 1000, // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
      context: "signin",
    }),
    oneTimeTokenClient(),
    organizationClient({
      // schema: inferOrgAdditionalFields<Auth.Auth>(),
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
} satisfies BetterAuthClientOptions);

export const { $store, signIn } = client;

$store.listen("$sessionSignal", asyncNoOp);
