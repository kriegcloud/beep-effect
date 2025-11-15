import { IamConfig } from "@beep/iam-infra/config";
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

export type OauthProxyPluginEffect = Effect.Effect<ReturnType<typeof oAuthProxy>, never, IamConfig>;
export type OauthProxyPlugin = Effect.Effect.Success<OauthProxyPluginEffect>;
export const oauthProxyPlugin: OauthProxyPluginEffect = Effect.gen(function* () {
  const config = yield* IamConfig;
  const fallback = config.app.clientUrl;
  const productionURL = config.app.projectProductionUrl ?? fallback;
  const currentURL = config.app.baseUrl ?? fallback;

  return oAuthProxy({
    productionURL: normalizeUrl(productionURL, fallback),
    currentURL: normalizeUrl(currentURL, fallback),
  });
});
