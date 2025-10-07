import { sso } from "better-auth/plugins/sso";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { SSOOptions } from "./plugin-options";

export type SSOPluginEffect = Effect.Effect<ReturnType<typeof sso>, never, never>;
export type SSOPlugin = Effect.Effect.Success<SSOPluginEffect>;
export const ssoPlugin: SSOPluginEffect = Effect.succeed(sso({} satisfies SSOOptions));
=======

export type SSOPluginEffect = Effect.Effect<ReturnType<typeof sso>, never, never>;
export type SSOPlugin = Effect.Effect.Success<SSOPluginEffect>;
export const ssoPlugin: SSOPluginEffect = Effect.succeed(sso({}));
>>>>>>> auth-type-perf
