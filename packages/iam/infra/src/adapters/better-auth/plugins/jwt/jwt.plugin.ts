import { jwt } from "better-auth/plugins/jwt";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { JwtOptions } from "./plugin-options";

export type JwtPluginEffect = Effect.Effect<ReturnType<typeof jwt>, never, never>;
export type JwtPlugin = Effect.Effect.Success<JwtPluginEffect>;
export const jwtPlugin: JwtPluginEffect = Effect.succeed(jwt({} satisfies JwtOptions));
=======

export type JwtPluginEffect = Effect.Effect<ReturnType<typeof jwt>, never, never>;
export type JwtPlugin = Effect.Effect.Success<JwtPluginEffect>;
export const jwtPlugin: JwtPluginEffect = Effect.succeed(jwt());
>>>>>>> auth-type-perf
