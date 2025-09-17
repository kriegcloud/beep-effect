import { admin } from "better-auth/plugins/admin";
import * as Effect from "effect/Effect";
import type { AdminOptions } from "./plugin-options";

export const adminPluginOptions = Effect.gen(function* () {
  return {} satisfies AdminOptions;
});

type Options = Effect.Effect.Success<typeof adminPluginOptions>;

export type AdminPluginEffect = Effect.Effect<ReturnType<typeof admin<Options>>, never, never>;
export type AdminPlugin = Effect.Effect.Success<AdminPluginEffect>;

export const adminPlugin: AdminPluginEffect = Effect.gen(function* () {
  const options = yield* adminPluginOptions;
  return admin(options satisfies AdminOptions);
});
