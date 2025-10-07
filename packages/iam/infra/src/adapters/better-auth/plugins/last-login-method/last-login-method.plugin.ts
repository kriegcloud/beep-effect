import { lastLoginMethod } from "better-auth/plugins";
import * as Effect from "effect/Effect";

export type LastLoginMethodPluginEffect = Effect.Effect<ReturnType<typeof lastLoginMethod>, never, never>;
export type LastLoginMethodPlugin = Effect.Effect.Success<LastLoginMethodPluginEffect>;
export const lastLoginMethodPlugin: LastLoginMethodPluginEffect = Effect.succeed(lastLoginMethod());
