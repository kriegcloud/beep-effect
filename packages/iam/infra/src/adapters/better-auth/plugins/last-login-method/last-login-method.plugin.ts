import { lastLoginMethod } from "better-auth/plugins";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { LastLoginMethodOptions } from "./plugin-options";

export type LastLoginMethodPluginEffect = Effect.Effect<ReturnType<typeof lastLoginMethod>, never, never>;
export type LastLoginMethodPlugin = Effect.Effect.Success<LastLoginMethodPluginEffect>;
export const lastLoginMethodPlugin: LastLoginMethodPluginEffect = Effect.succeed(
  lastLoginMethod({} satisfies LastLoginMethodOptions)
);
=======

export type LastLoginMethodPluginEffect = Effect.Effect<ReturnType<typeof lastLoginMethod>, never, never>;
export type LastLoginMethodPlugin = Effect.Effect.Success<LastLoginMethodPluginEffect>;
export const lastLoginMethodPlugin: LastLoginMethodPluginEffect = Effect.succeed(lastLoginMethod());
>>>>>>> auth-type-perf
