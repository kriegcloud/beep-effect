import { customSession } from "better-auth/plugins/custom-session";
import * as Effect from "effect/Effect";

<<<<<<< HEAD
type CustomSessionPlugin = Effect.Effect<ReturnType<typeof customSession>, never, never>;

export const customSessionPlugin: CustomSessionPlugin = Effect.succeed(
=======
export type CustomSessionPluginEffect = Effect.Effect<ReturnType<typeof customSession>, never, never>;
export type CustomSessionPlugin = Effect.Effect.Success<CustomSessionPluginEffect>;
export const customSessionPlugin = Effect.succeed(
>>>>>>> auth-type-perf
  customSession(async (session) => ({
    ...session,
    user: session.user,
  }))
);
