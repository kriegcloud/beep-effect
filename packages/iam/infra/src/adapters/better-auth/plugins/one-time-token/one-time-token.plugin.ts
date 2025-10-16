import { oneTimeToken } from "better-auth/plugins/one-time-token";
import * as Effect from "effect/Effect";

export type OneTimeTokenPluginEffect = Effect.Effect<ReturnType<typeof oneTimeToken>, never, never>;
export type OneTimeTokenPlugin = Effect.Effect.Success<OneTimeTokenPluginEffect>;
export const oneTimeTokenPlugin: OneTimeTokenPluginEffect = Effect.succeed(oneTimeToken());
