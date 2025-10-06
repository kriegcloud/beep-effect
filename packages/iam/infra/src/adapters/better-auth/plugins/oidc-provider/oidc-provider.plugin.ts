import { oidcProvider } from "better-auth/plugins/oidc-provider";
import * as Effect from "effect/Effect";
import type { OIDCOptions } from "./plugin-options";

export type OIDCProviderPluginEffect = Effect.Effect<ReturnType<typeof oidcProvider>, never, never>;
export type OIDCProviderPlugin = Effect.Effect.Success<OIDCProviderPluginEffect>;
export const oidcProviderPlugin: OIDCProviderPluginEffect = Effect.succeed(
  oidcProvider({
    loginPage: "/sign-in",
  } satisfies OIDCOptions)
);
