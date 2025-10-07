import { username } from "better-auth/plugins/username";
import * as Effect from "effect/Effect";

export type UsernamePluginEffect = Effect.Effect<ReturnType<typeof username>, never, never>;
export type UsernamePlugin = Effect.Effect.Success<UsernamePluginEffect>;
export const usernamePlugin: UsernamePluginEffect = Effect.succeed(username());
