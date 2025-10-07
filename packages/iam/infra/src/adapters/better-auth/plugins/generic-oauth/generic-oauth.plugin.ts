import { genericOAuth } from "better-auth/plugins/generic-oauth";
import * as Effect from "effect/Effect";

export type GenericOAuthPluginEffect = Effect.Effect<ReturnType<typeof genericOAuth>, never, never>;
export type GenericOAuthPlugin = Effect.Effect.Success<GenericOAuthPluginEffect>;
export const genericOAuthPlugin: GenericOAuthPluginEffect = Effect.succeed(
  genericOAuth({
    config: [],
  })
);
