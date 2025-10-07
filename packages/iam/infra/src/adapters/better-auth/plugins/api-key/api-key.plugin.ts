import { apiKey } from "better-auth/plugins";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { ApiKeyOptions } from "./plugin-options";

export type ApiKeyPluginEffect = Effect.Effect<ReturnType<typeof apiKey>, never, never>;
export type ApiKeyPlugin = Effect.Effect.Success<ApiKeyPluginEffect>;
export const apiKeyPlugin: ApiKeyPluginEffect = Effect.gen(function* () {
  return apiKey({} satisfies ApiKeyOptions);
});
=======

export type ApiKeyPluginEffect = Effect.Effect<ReturnType<typeof apiKey>, never, never>;
export type ApiKeyPlugin = Effect.Effect.Success<ApiKeyPluginEffect>;
export const apiKeyPlugin: ApiKeyPluginEffect = Effect.succeed(apiKey());
>>>>>>> auth-type-perf
