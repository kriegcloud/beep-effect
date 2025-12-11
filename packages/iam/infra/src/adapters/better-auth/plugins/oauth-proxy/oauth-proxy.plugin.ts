import { serverEnv } from "@beep/shared-infra/ServerEnv";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";
import * as Effect from "effect/Effect";

const normalizeUrl = (url: { toString: () => string }, fallback: { toString: () => string }) => {
  const urlString = url.toString();
  try {
    return new URL(urlString).origin;
  } catch {
    return new URL(fallback.toString()).origin;
  }
};

export type OauthProxyPluginEffect = Effect.Effect<ReturnType<typeof oAuthProxy>, never, never>;
export type OauthProxyPlugin = Effect.Effect.Success<OauthProxyPluginEffect>;
export const oauthProxyPlugin: OauthProxyPluginEffect = Effect.gen(function* () {
  const fallback = serverEnv.app.clientUrl;
  const productionURL = serverEnv.app.projectProductionUrl ?? fallback;
  const currentURL = serverEnv.app.baseUrl ?? fallback;

  return oAuthProxy({
    productionURL: normalizeUrl(productionURL, fallback),
    currentURL: normalizeUrl(currentURL, fallback),
  });
});
