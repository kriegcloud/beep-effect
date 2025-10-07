import { apiKey } from "better-auth/plugins";
import * as Effect from "effect/Effect";

export type ApiKeyPluginEffect = Effect.Effect<ReturnType<typeof apiKey>, never, never>;
export type ApiKeyPlugin = Effect.Effect.Success<ApiKeyPluginEffect>;
export const apiKeyPlugin: ApiKeyPluginEffect = Effect.succeed(apiKey());
