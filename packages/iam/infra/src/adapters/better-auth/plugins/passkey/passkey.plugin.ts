import { serverEnv } from "@beep/core-env/server";
import { passkey } from "better-auth/plugins/passkey";
import * as Effect from "effect/Effect";
import type { PasskeyOptions } from "./plugin-options";

export type PasskeyPluginEffect = Effect.Effect<ReturnType<typeof passkey>, never, never>;
export type PasskeyPlugin = Effect.Effect.Success<PasskeyPluginEffect>;
export const passkeyPlugin: PasskeyPluginEffect = Effect.succeed(
  passkey({
    rpID: serverEnv.app.domain,
    rpName: `${serverEnv.app.name} Auth`,
  } satisfies PasskeyOptions)
);
