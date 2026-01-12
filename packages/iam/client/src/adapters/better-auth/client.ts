import type {Auth} from "@beep/iam-server";
import {clientEnv} from "@beep/shared-env/ClientEnv";
import {asyncNoOp} from "@beep/utils";
import type {BetterAuthClientOptions} from "@better-auth/core";
import {passkeyClient} from "@better-auth/passkey/client";
import {ssoClient} from "@better-auth/sso/client";
import {stripeClient} from "@better-auth/stripe/client";
import {
  // adminClient,
  anonymousClient,
  // apiKeyClient,
  // deviceAuthorizationClient,
  // genericOAuthClient,
  // jwtClient,
  inferOrgAdditionalFields,
  lastLoginMethodClient,
  // multiSessionClient,
  // oidcClient,
  oneTapClient,
  oneTimeTokenClient,
  organizationClient,
  phoneNumberClient,
  siweClient,
  usernameClient,
} from "better-auth/client/plugins";
import {createAuthClient} from "better-auth/react";
import {$IamClientId} from "@beep/identity/packages";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import * as P from "effect/Predicate";
import type * as Cause from "effect/Cause";

export const client = createAuthClient({
  baseURL: clientEnv.authUrl,
  basePath: clientEnv.authPath,
  plugins: [
    // inferAdditionalFields<Auth.Auth>(),
    // adminClient(),
    anonymousClient(),
    // jwtClient(),
    // apiKeyClient(),
    // genericOAuthClient(),
    // multiSessionClient(),
    // oidcClient(),
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

    usernameClient(),
    stripeClient({
      subscription: true,
    }),
    // deviceAuthorizationClient(),
    lastLoginMethodClient(),
  ],
} satisfies BetterAuthClientOptions);

export const {$store, signIn, signUp} = client;

$store.listen("$sessionSignal", asyncNoOp);


const $I = $IamClientId.create("adapters/better-auth/client");

export const isClientMethod = (u: unknown): u is ((i: Parameters<typeof client.signIn[keyof typeof client.signIn]>[0]) => Awaited<ReturnType<typeof client.signIn[keyof typeof client.signIn]>>) =>
  P.isFunction(u);
const clientMethodKeys = S.keyof(client.signIn);


export const isClientMethodKey = (u: unknown): u is keyof typeof client.signIn =>
  P.isString(u);





// F.pipe(
//       [k, v],
//       O.liftPredicate(P.tuple(
//         S.is(clientMethodKeys),
//         isClientMethod,
//       )),
//       Effect.flatMap(([k, v]) => Effect.tryPromise(() => client[k](...v))),
//
//     )