import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import * as Effect from "effect/Effect";

export type OauthProxyPluginEffect = Effect.Effect<ReturnType<typeof oAuthProxy>, never, never>;
export type OauthProxyPlugin = Effect.Effect.Success<OauthProxyPluginEffect>;
export const oauthProxyPlugin: OauthProxyPluginEffect = Effect.succeed(oAuthProxy());
