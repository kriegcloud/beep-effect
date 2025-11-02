import { serverEnv } from "@beep/core-env/server";
import { nextCookies } from "better-auth/next-js";
import { reactStartCookies } from "better-auth/react-start";
import * as Effect from "effect/Effect";
export type CookiesPluginEffect = Effect.Effect<
  ReturnType<typeof nextCookies> | ReturnType<typeof reactStartCookies>,
  never,
  never
>;
export type CookiesPlugin = Effect.Effect.Success<CookiesPluginEffect>;
export const cookiesPlugin: CookiesPluginEffect = Effect.succeed(
  serverEnv.isVite ? reactStartCookies() : nextCookies()
);
