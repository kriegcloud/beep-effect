import { serverEnv } from "@beep/core-env/server";
import { siwe } from "better-auth/plugins/siwe";
import * as Effect from "effect/Effect";
import type { SIWEPluginOptions } from "./plugin-options";

export type SIWEPluginEffect = Effect.Effect<ReturnType<typeof siwe>, never, never>;
export type SIWEPlugin = Effect.Effect.Success<SIWEPluginEffect>;
export const siwePlugin: SIWEPluginEffect = Effect.succeed(
  siwe({
    domain: serverEnv.app.domain,
    getNonce: async () => {
      return "beep";
    },
    verifyMessage: async (args) => {
      return false;
    },
  } satisfies SIWEPluginOptions)
);
