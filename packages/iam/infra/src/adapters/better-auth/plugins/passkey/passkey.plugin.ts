import { EnvValue } from "@beep/constants";
import { IamConfig } from "@beep/iam-infra/config";
import type { PasskeyOptions } from "@better-auth/passkey";
import { passkey } from "@better-auth/passkey";
import * as Effect from "effect/Effect";

export type PasskeyPluginEffect = Effect.Effect<ReturnType<typeof passkey>, never, IamConfig>;
export type PasskeyPlugin = Effect.Effect.Success<PasskeyPluginEffect>;
export const passkeyPlugin: PasskeyPluginEffect = Effect.gen(function* () {
  const config = yield* IamConfig;
  return passkey({
    rpID: config.app.env === EnvValue.Enum.dev ? "localhost" : config.app.domain,
    rpName: `${config.app.name} Auth`,
  } satisfies PasskeyOptions);
});
