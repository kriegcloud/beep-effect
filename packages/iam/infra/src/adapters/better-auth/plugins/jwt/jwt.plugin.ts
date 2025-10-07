import { jwt } from "better-auth/plugins/jwt";
import * as Effect from "effect/Effect";

export type JwtPluginEffect = Effect.Effect<ReturnType<typeof jwt>, never, never>;
export type JwtPlugin = Effect.Effect.Success<JwtPluginEffect>;
export const jwtPlugin: JwtPluginEffect = Effect.succeed(jwt());
