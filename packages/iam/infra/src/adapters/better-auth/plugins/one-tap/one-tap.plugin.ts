import { serverEnv } from "@beep/core-env/server";
import { oneTap } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { OneTapOptions } from "./plugin-options";
export type OneTapPluginEffect = Effect.Effect<ReturnType<typeof oneTap>, never, never>;
export type OneTapPlugin = Effect.Effect.Success<OneTapPluginEffect>;
export const oneTapPlugin: OneTapPluginEffect = Effect.succeed(
  oneTap({
    clientId: Redacted.value(serverEnv.oauth.provider.google.clientId),
  } satisfies OneTapOptions)
);
