import { customSession } from "better-auth/plugins/custom-session";
import * as Effect from "effect/Effect";

type CustomSessionPlugin = Effect.Effect<ReturnType<typeof customSession>, never, never>;

export const customSessionPlugin: CustomSessionPlugin = Effect.succeed(
  customSession(async (session) => ({
    ...session,
    user: session.user,
  }))
);
