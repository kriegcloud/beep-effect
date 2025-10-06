import { nextCookies } from "better-auth/next-js";
import * as Effect from "effect/Effect";

export type NextCookiesPluginEffect = Effect.Effect<ReturnType<typeof nextCookies>, never, never>;
export type NextCookiesPlugin = Effect.Effect.Success<NextCookiesPluginEffect>;
export const nextCookiesPlugin: NextCookiesPluginEffect = Effect.succeed(nextCookies());
