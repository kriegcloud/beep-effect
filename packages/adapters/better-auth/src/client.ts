import type { ClientOptions } from "better-auth/client";
import {
  jwtClient,
  oidcClient,
  oneTapClient,
  organizationClient,
  passkeyClient,
  ssoClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
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
    passkeyClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      promptOptions: {
        maxAttempts: 1,
      },
    }),
    oidcClient(),
  ],
} satisfies Types.Simplify<ClientOptions>;

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
