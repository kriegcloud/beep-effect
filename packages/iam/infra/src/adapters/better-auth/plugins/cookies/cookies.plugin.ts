// import { serverEnv } from "@beep/core-env/server";
import { nextCookies } from "better-auth/next-js";
// import { tanstackStartCookies } from "better-auth/tanstack-start";
import * as Effect from "effect/Effect";
export type CookiesPluginEffect = Effect.Effect<ReturnType<typeof nextCookies>, never, never>;
export type CookiesPlugin = Effect.Effect.Success<CookiesPluginEffect>;
export const cookiesPlugin: CookiesPluginEffect = Effect.succeed(nextCookies());
