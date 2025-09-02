// import { paths } from "@beep/domain/constants";
// import * as Redacted from "effect/Redacted";
import type { ClientOptions } from "better-auth/client";
import {
  // adminClient,
  // genericOAuthClient,
  jwtClient,
  // multiSessionClient,
  oidcClient,
  oneTapClient,
  // oneTimeTokenClient,
  organizationClient,
  passkeyClient,
  ssoClient,
  // twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
// import { sharedEnv } from "@beep/env/shared";
import type * as Types from "effect/Types";

const clientOptions = {
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL!,
  basePath: process.env.NEXT_PUBLIC_AUTH_PATH!,
  plugins: [
    jwtClient(),
    ssoClient(),
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
    // twoFactorClient({
    //   onTwoFactorRedirect() {
    //     window.location.href = paths.auth.twoFactor.root;
    //   },
    // }),
    passkeyClient(),
    /*    adminClient(),
    multiSessionClient(),*/
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    oidcClient(),
    // genericOAuthClient(),
  ],
} satisfies Types.Simplify<ClientOptions>;

export const client = createAuthClient(clientOptions) as ReturnType<typeof createAuthClient<typeof clientOptions>>;

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  // twoFactor,
  forgetPassword,
  changePassword,
  organization,
  requestPasswordReset,
  resetPassword,
  $store,
} = client;

$store.listen("$sessionSignal", async () => {});
