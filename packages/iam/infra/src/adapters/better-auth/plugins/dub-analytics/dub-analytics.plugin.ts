import { IamConfig } from "@beep/iam-infra/config";
import { dubAnalytics } from "@dub/better-auth";
import { Dub } from "dub";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

export type DubAnalyticsPluginEffect = Effect.Effect<ReturnType<typeof dubAnalytics>, never, IamConfig>;
export type DubAnalyticsPlugin = Effect.Effect.Success<DubAnalyticsPluginEffect>;
export const dubAnalyticsPlugin: DubAnalyticsPluginEffect = Effect.gen(function* () {
  const config = yield* IamConfig;
  return dubAnalytics({
    dubClient: new Dub({ token: Redacted.value(config.marketing.dub.token) }),
  });
});
