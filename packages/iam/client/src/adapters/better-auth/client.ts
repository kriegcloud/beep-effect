import type { Auth } from "@beep/iam-server";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import { asyncNoOp } from "@beep/utils";
import type { BetterAuthClientOptions } from "@better-auth/core";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { ssoClient } from "@better-auth/sso/client";
import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  anonymousClient,
  apiKeyClient,
  deviceAuthorizationClient,
  genericOAuthClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  jwtClient,
  lastLoginMethodClient,
  multiSessionClient,
  oneTapClient,
  oneTimeTokenClient,
  organizationClient,
  phoneNumberClient,
  siweClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import * as Duration from "effect/Duration";

export const client = createAuthClient({
  baseURL: clientEnv.authUrl,
  basePath: clientEnv.authPath,
  plugins: [
    inferAdditionalFields<Auth.Auth>(),
    adminClient(),
    anonymousClient(),
    jwtClient(),
    apiKeyClient(),
    oauthProviderClient(),
    genericOAuthClient(),
    multiSessionClient(),
    oneTapClient({
      clientId: clientEnv.googleClientId,
      promptOptions: {
        baseDelay: Duration.toMillis(Duration.seconds(1)), // Base delay in ms (default: 1000)
        maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
      },
      context: "signin",
    }),
    oneTimeTokenClient(),
    organizationClient({
      schema: inferOrgAdditionalFields<Auth.Auth>(),
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

export const { $store, signIn, signUp } = client;

$store.listen("$sessionSignal", asyncNoOp);
