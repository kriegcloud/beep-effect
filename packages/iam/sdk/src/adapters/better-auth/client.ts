import { clientEnv } from "@beep/core-env/client";
import type { Auth } from "@beep/iam-infra";
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
  jwtClient,
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
    inferAdditionalFields<Auth>(),
    adminClient(),
    anonymousClient(),
    jwtClient(),
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
} satisfies BetterAuthClientOptions);

export const { $store, signIn } = client;

$store.listen("$sessionSignal", asyncNoOp);
