import { EnvValue } from "@beep/constants";
import { serverEnv } from "@beep/shared-infra/ServerEnv";
import type { PasskeyOptions } from "@better-auth/passkey";
import { passkey } from "@better-auth/passkey";
import * as Effect from "effect/Effect";

export type PasskeyPluginEffect = Effect.Effect<ReturnType<typeof passkey>, never, never>;
export type PasskeyPlugin = Effect.Effect.Success<PasskeyPluginEffect>;
export const passkeyPlugin: PasskeyPluginEffect = Effect.gen(function* () {
  return passkey({
    rpID: serverEnv.app.env === EnvValue.Enum.dev ? "localhost" : serverEnv.app.domain,
    rpName: `${serverEnv.app.name} Auth`,
  } satisfies PasskeyOptions);
});
