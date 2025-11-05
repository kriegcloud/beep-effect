import { IamConfig } from "@beep/iam-infra/config";
import { siwe } from "better-auth/plugins/siwe";
import * as Effect from "effect/Effect";

export type SIWEPluginEffect = Effect.Effect<ReturnType<typeof siwe>, never, IamConfig>;
export type SIWEPlugin = Effect.Effect.Success<SIWEPluginEffect>;
export const siwePlugin: SIWEPluginEffect = Effect.gen(function* () {
  const config = yield* IamConfig;
  return siwe({
    domain: config.app.domain,
    getNonce: async () => {
      return "beep";
    },
    verifyMessage: async (_args) => {
      return false;
    },
  });
});
