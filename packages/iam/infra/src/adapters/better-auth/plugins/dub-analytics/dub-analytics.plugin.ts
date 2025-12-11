import { serverEnv } from "@beep/shared-infra/ServerEnv";
import { dubAnalytics } from "@dub/better-auth";
import { Dub } from "dub";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

export type DubAnalyticsPluginEffect = Effect.Effect<ReturnType<typeof dubAnalytics>, never, never>;
export type DubAnalyticsPlugin = Effect.Effect.Success<DubAnalyticsPluginEffect>;
export const dubAnalyticsPlugin: DubAnalyticsPluginEffect = Effect.gen(function* () {
  return dubAnalytics({
    dubClient: new Dub({ token: Redacted.value(serverEnv.marketing.dub.token) }),
  });
});
