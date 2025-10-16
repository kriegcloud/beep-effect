import { customSession } from "better-auth/plugins/custom-session";
import * as Effect from "effect/Effect";

export type CustomSessionPluginEffect = Effect.Effect<ReturnType<typeof customSession>, never, never>;
export type CustomSessionPlugin = Effect.Effect.Success<CustomSessionPluginEffect>;
export const customSessionPlugin: CustomSessionPluginEffect = Effect.succeed(
  customSession(async (session) => ({
    ...session,
    user: session.user,
  }))
);
