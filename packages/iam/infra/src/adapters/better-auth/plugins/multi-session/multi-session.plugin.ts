import { multiSession } from "better-auth/plugins/multi-session";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { MultiSessionOptions } from "./plugin-options";

export type MultiSessionPluginEffect = Effect.Effect<ReturnType<typeof multiSession>, never, never>;
export type MultiSessionPlugin = Effect.Effect.Success<MultiSessionPluginEffect>;
export const multiSessionPlugin: MultiSessionPluginEffect = Effect.succeed(
  multiSession({} satisfies MultiSessionOptions)
);
=======

export type MultiSessionPluginEffect = Effect.Effect<ReturnType<typeof multiSession>, never, never>;
export type MultiSessionPlugin = Effect.Effect.Success<MultiSessionPluginEffect>;
export const multiSessionPlugin: MultiSessionPluginEffect = Effect.succeed(multiSession());
>>>>>>> auth-type-perf
