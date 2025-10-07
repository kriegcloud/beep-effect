import { username } from "better-auth/plugins/username";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { UsernameOptions } from "./plugin-options";

export type UsernamePluginEffect = Effect.Effect<ReturnType<typeof username>, never, never>;
export type UsernamePlugin = Effect.Effect.Success<UsernamePluginEffect>;
export const usernamePlugin: UsernamePluginEffect = Effect.succeed(username({} satisfies UsernameOptions));
=======

export type UsernamePluginEffect = Effect.Effect<ReturnType<typeof username>, never, never>;
export type UsernamePlugin = Effect.Effect.Success<UsernamePluginEffect>;
export const usernamePlugin: UsernamePluginEffect = Effect.succeed(username());
>>>>>>> auth-type-perf
