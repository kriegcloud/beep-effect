import { serverEnv } from "@beep/shared-infra/ServerEnv";
import { siwe } from "better-auth/plugins/siwe";
import * as Effect from "effect/Effect";
export type SIWEPluginEffect = Effect.Effect<ReturnType<typeof siwe>, never, never>;
export type SIWEPlugin = Effect.Effect.Success<SIWEPluginEffect>;
export const siwePlugin: SIWEPluginEffect = Effect.gen(function* () {
  return siwe({
    domain: serverEnv.app.domain,
    getNonce: async () => {
      return "beep";
    },
    verifyMessage: async (_args) => {
      return false;
    },
  });
});
